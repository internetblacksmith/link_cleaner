import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:link_cleaner/argument.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'package:share_plus/share_plus.dart';

void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  MyAppState createState() => MyAppState();
}

class MyAppState extends State<MyApp> {
  late StreamSubscription _intentDataStreamSubscription;
  String _cleanedUrl = "";
  String _originalUrl = "";
  String _baseUrl = "";
  List<ArgumentModel> _arguments = [];
  bool _isLoading = false;
  bool _selectAll = true;

  @override
  void initState() {
    super.initState();
    _setupSharingIntent();
  }

  void _setupSharingIntent() {
    // Listen to media sharing coming from outside the app while the app is in the memory.
    _intentDataStreamSubscription =
        ReceiveSharingIntent.instance.getMediaStream().listen((value) {
      _populateSharedUri(value);
    }, onError: (err) {
      if (kDebugMode) {
        print("getLinkStream error: $err");
      }
      _showError("Failed to receive shared link");
    });

    // Get the media sharing coming from outside the app while the app is closed.
    ReceiveSharingIntent.instance.getInitialMedia().then((value) {
      _populateSharedUri(value);
    }).catchError((err) {
      if (kDebugMode) {
        print("getInitialMedia error: $err");
      }
    });
  }

  void _populateSharedUri(List<SharedMediaFile> value) {
    if (value.isEmpty) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    String url = value.first.path;
    if (kDebugMode) {
      print("_populateSharedUri: $url");
    }

    Uri? uri = Uri.tryParse(url);
    if (uri == null || !uri.hasAbsolutePath) {
      setState(() {
        _isLoading = false;
      });
      _showError("Invalid URL format");
      return;
    }

    List<ArgumentModel> arguments = [];
    uri.queryParameters.forEach((key, value) =>
        arguments.add(ArgumentModel(key: key, value: value, selected: _selectAll)));
    
    setState(() {
      _baseUrl = [uri.origin, uri.path].where((x) => x.isNotEmpty).join();
      _arguments = arguments;
      _originalUrl = url;
      _cleanedUrl = url;
      _isLoading = false;
    });
    
    if (arguments.isEmpty) {
      _showInfo("No query parameters found in this URL");
    }
  }

  @override
  void dispose() {
    _intentDataStreamSubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Link Cleaner'),
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          actions: [
            if (_arguments.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.select_all),
                onPressed: _toggleSelectAll,
                tooltip: 'Select/Deselect All',
              ),
          ],
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_originalUrl.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.share,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Share a URL to clean it',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Remove tracking parameters before sharing',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: <Widget>[
        _addressCard(),
        if (_arguments.isNotEmpty) _buildParameterHeader(),
        Expanded(child: _argumentsList()),
      ],
    );
  }

  Widget _addressCard() {
    return Card(
      margin: const EdgeInsets.all(8.0),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Cleaned URL',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey,
                  ),
                ),
                const Spacer(),
                if (_cleanedUrl != _originalUrl)
                  Chip(
                    label: Text(
                      '${_originalUrl.length - _cleanedUrl.length} chars removed',
                      style: const TextStyle(fontSize: 11),
                    ),
                    backgroundColor: Colors.green[50],
                    labelStyle: TextStyle(color: Colors.green[700]),
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(4),
              ),
              child: SelectableText(
                _cleanedUrl,
                style: const TextStyle(
                  fontSize: 13,
                  fontFamily: 'monospace',
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  icon: const Icon(Icons.copy, size: 18),
                  label: const Text('Copy'),
                  onPressed: () => _copyToClipboard(),
                ),
                const SizedBox(width: 8),
                FilledButton.icon(
                  icon: const Icon(Icons.share, size: 18),
                  label: const Text('Share'),
                  onPressed: () => Share.share(_cleanedUrl),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildParameterHeader() {
    final selectedCount = _arguments.where((arg) => arg.selected).length;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.grey[100],
      child: Row(
        children: [
          Text(
            'Parameters ($selectedCount/${_arguments.length} selected)',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),
          TextButton(
            onPressed: _clearAll,
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }

  Widget _argumentsList() {
    if (_arguments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline, size: 48, color: Colors.green[400]),
            const SizedBox(height: 16),
            const Text(
              'This URL has no tracking parameters!',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.only(bottom: 16),
      itemCount: _arguments.length,
      itemBuilder: (BuildContext context, int index) {
        final arg = _arguments[index];
        final isCommonTracker = _isCommonTracker(arg.key);
        
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          elevation: 1,
          child: CheckboxListTile(
            activeColor: Colors.blue,
            value: arg.selected,
            onChanged: (bool? val) => itemChange(val!, index),
            title: Row(
              children: [
                Expanded(
                  child: Text(
                    arg.key,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                if (isCommonTracker)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.orange[100],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Tracker',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.orange[800],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
              ],
            ),
            subtitle: Text(
              arg.value.length > 50 
                ? '${arg.value.substring(0, 50)}...'
                : arg.value,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        );
      },
    );
  }

  void itemChange(bool val, int index) {
    setState(() {
      _arguments[index].selected = val;
    });
    _cleanUrl();
  }

  void _cleanUrl() {
    String? params = _arguments
        .map((argument) => argument.selected ? argument.toString() : null)
        .where((x) => x != null)
        .join("&");
    setState(() {
      _cleanedUrl = [_baseUrl, params].where((x) => x.isNotEmpty).join("?");
    });
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: _cleanedUrl));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('URL copied to clipboard'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _toggleSelectAll() {
    setState(() {
      _selectAll = !_selectAll;
      for (var arg in _arguments) {
        arg.selected = _selectAll;
      }
    });
    _cleanUrl();
  }

  void _clearAll() {
    setState(() {
      for (var arg in _arguments) {
        arg.selected = false;
      }
      _selectAll = false;
    });
    _cleanUrl();
  }

  bool _isCommonTracker(String key) {
    const commonTrackers = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'referrer', 'source',
      'campaign', 'ad', 'adgroup', 'creative', 'keyword',
      'placement', 'network', 'device', 'target', 'feeditemid',
      'targetid', 'loc_interest_ms', 'loc_physical_ms', 'matchtype',
      'adposition', 'sourceid', 'ie', 'f', 'sxsrf', 'ei', 'ved',
      '_ga', '_gid', '_gat', '__hstc', '__hssc', '__hsfp', 'hsCtaTracking',
      'mc_cid', 'mc_eid', 'mkt_tok', 'trk', 'trkInfo', 'oly_enc_id',
      'oly_anon_id', '_ke', 'redirect_log_mongo_id', 'redirect_mongo_id',
      'sb_referer_host', 'mkwid', 'pcrid', 'ef_id', 's_kwcid',
      'msID', 'refID', 'trackingid'
    ];
    return commonTrackers.contains(key.toLowerCase());
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _showInfo(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.blue,
      ),
    );
  }
}
