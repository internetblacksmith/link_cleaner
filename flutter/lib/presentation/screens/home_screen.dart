import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import '../providers/url_provider.dart';
import '../widgets/url_card.dart';
import '../widgets/parameter_item.dart';
import '../widgets/empty_state.dart';
import 'history_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late StreamSubscription _intentDataStreamSubscription;

  @override
  void initState() {
    super.initState();
    _setupSharingIntent();
  }

  void _setupSharingIntent() {
    // Listen to media sharing coming from outside the app while the app is in memory
    _intentDataStreamSubscription =
        ReceiveSharingIntent.instance.getMediaStream().listen((value) {
      _handleSharedUrl(value);
    }, onError: (err) {
      debugPrint("getMediaStream error: $err");
    });

    // Get the media sharing coming from outside the app while the app is closed
    ReceiveSharingIntent.instance.getInitialMedia().then((value) {
      _handleSharedUrl(value);
    });
  }

  void _handleSharedUrl(List<SharedMediaFile> value) {
    if (value.isEmpty) return;
    
    final url = value.first.path;
    ref.read(urlCleanerProvider.notifier).parseUrl(url);
  }

  @override
  void dispose() {
    _intentDataStreamSubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(urlCleanerProvider);
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Link Cleaner'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const HistoryScreen()),
              );
            },
            tooltip: 'History',
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
            tooltip: 'Settings',
          ),
        ],
      ),
      body: _buildBody(context, state),
    );
  }

  Widget _buildBody(BuildContext context, UrlCleanerState state) {
    if (state.isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (state.error != null) {
      return EmptyState(
        icon: Icons.error_outline,
        title: 'Error',
        subtitle: state.error,
        action: ElevatedButton(
          onPressed: () => ref.read(urlCleanerProvider.notifier).reset(),
          child: const Text('Try Again'),
        ),
      );
    }

    if (state.cleanedUrl == null) {
      return const EmptyState(
        icon: Icons.share,
        title: 'Share a URL to clean it',
        subtitle: 'Remove tracking parameters before sharing',
      );
    }

    return Column(
      children: [
        UrlCard(
          cleanedUrl: state.cleanedUrl!,
        ),
        if (state.cleanedUrl!.parameters.isNotEmpty) ...[
          _buildParameterHeader(context, state),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 16),
              itemCount: state.cleanedUrl!.parameters.length,
              itemBuilder: (context, index) {
                final parameter = state.cleanedUrl!.parameters[index];
                return ParameterItem(
                  parameter: parameter,
                  onChanged: (value) {
                    ref.read(urlCleanerProvider.notifier).toggleParameter(index);
                  },
                );
              },
            ),
          ),
        ] else ...[
          const Expanded(
            child: EmptyState(
              icon: Icons.check_circle_outline,
              title: 'This URL has no tracking parameters!',
              subtitle: 'The URL is already clean',
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildParameterHeader(BuildContext context, UrlCleanerState state) {
    final theme = Theme.of(context);
    final cleanedUrl = state.cleanedUrl!;
    final selectedCount = cleanedUrl.selectedParameters;
    final totalCount = cleanedUrl.totalParameters;
    final trackerCount = cleanedUrl.trackerCount;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant.withOpacity(0.3),
        border: Border(
          bottom: BorderSide(
            color: theme.colorScheme.outlineVariant,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Parameters ($selectedCount/$totalCount selected)',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (trackerCount > 0)
                  Text(
                    '$trackerCount tracking parameters detected',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'select_all':
                  ref.read(urlCleanerProvider.notifier).toggleSelectAll();
                  break;
                case 'clear_all':
                  ref.read(urlCleanerProvider.notifier).clearAll();
                  break;
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'select_all',
                child: Text(state.selectAll ? 'Deselect All' : 'Select All'),
              ),
              const PopupMenuItem(
                value: 'clear_all',
                child: Text('Clear All'),
              ),
            ],
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.more_vert),
            ),
          ),
        ],
      ),
    );
  }
}