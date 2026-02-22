import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../domain/entities/cleaned_url.dart';
import '../../domain/entities/url_parameter.dart';
import '../../domain/repositories/url_repository.dart';

class UrlRepositoryImpl implements UrlRepository {
  static const String _historyKey = 'url_cleaning_history';
  static const String _statsKey = 'url_cleaning_stats';
  static const int _maxHistoryItems = 100;

  final SharedPreferences _prefs;

  UrlRepositoryImpl(this._prefs);

  @override
  Future<CleanedUrl> parseUrl(String url) async {
    final uri = Uri.parse(url);
    final parameters = uri.queryParameters.entries.map((entry) {
      return UrlParameter(
        key: entry.key,
        value: entry.value,
        selected: true,
        isTracker: _isCommonTracker(entry.key),
        category: _getTrackerCategory(entry.key),
      );
    }).toList();

    return CleanedUrl.fromUrl(url, parameters);
  }

  @override
  Future<void> saveToHistory(CleanedUrl cleanedUrl) async {
    final history = await getHistory();
    history.insert(0, cleanedUrl);
    
    if (history.length > _maxHistoryItems) {
      history.removeRange(_maxHistoryItems, history.length);
    }

    final jsonList = history.map((item) => _cleanedUrlToJson(item)).toList();
    await _prefs.setStringList(_historyKey, jsonList.map((e) => jsonEncode(e)).toList());
    
    await _updateStatistics(cleanedUrl);
  }

  @override
  Future<List<CleanedUrl>> getHistory() async {
    final jsonList = _prefs.getStringList(_historyKey) ?? [];
    return jsonList
        .map((json) => _cleanedUrlFromJson(jsonDecode(json)))
        .toList();
  }

  @override
  Future<void> clearHistory() async {
    await _prefs.remove(_historyKey);
    await _prefs.remove(_statsKey);
  }

  @override
  Future<Map<String, int>> getStatistics() async {
    final statsJson = _prefs.getString(_statsKey);
    if (statsJson == null) {
      return {
        'totalUrls': 0,
        'totalCharactersSaved': 0,
        'totalTrackersRemoved': 0,
      };
    }
    return Map<String, int>.from(jsonDecode(statsJson));
  }

  Future<void> _updateStatistics(CleanedUrl cleanedUrl) async {
    final stats = await getStatistics();
    stats['totalUrls'] = (stats['totalUrls'] ?? 0) + 1;
    stats['totalCharactersSaved'] = (stats['totalCharactersSaved'] ?? 0) + cleanedUrl.charactersSaved;
    stats['totalTrackersRemoved'] = (stats['totalTrackersRemoved'] ?? 0) + 
        cleanedUrl.parameters.where((p) => p.isTracker && !p.selected).length;
    
    await _prefs.setString(_statsKey, jsonEncode(stats));
  }

  Map<String, dynamic> _cleanedUrlToJson(CleanedUrl url) {
    return {
      'originalUrl': url.originalUrl,
      'baseUrl': url.baseUrl,
      'cleanedUrl': url.cleanedUrl,
      'parameters': url.parameters.map((p) => {
        'key': p.key,
        'value': p.value,
        'selected': p.selected,
        'isTracker': p.isTracker,
        'category': p.category,
      }).toList(),
      'charactersSaved': url.charactersSaved,
      'cleanedAt': url.cleanedAt.toIso8601String(),
    };
  }

  CleanedUrl _cleanedUrlFromJson(Map<String, dynamic> json) {
    final parameters = (json['parameters'] as List).map((p) {
      return UrlParameter(
        key: p['key'],
        value: p['value'],
        selected: p['selected'],
        isTracker: p['isTracker'],
        category: p['category'],
      );
    }).toList();

    return CleanedUrl(
      originalUrl: json['originalUrl'],
      baseUrl: json['baseUrl'],
      cleanedUrl: json['cleanedUrl'],
      parameters: parameters,
      charactersSaved: json['charactersSaved'],
      cleanedAt: DateTime.parse(json['cleanedAt']),
    );
  }

  bool _isCommonTracker(String key) {
    const trackers = {
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'referrer', 'source',
      'campaign', 'ad', 'adgroup', 'creative', 'keyword',
      '_ga', '_gid', '__hstc', '__hssc', '__hsfp',
      'mc_cid', 'mc_eid', 'mkt_tok', 'trk', 'trkInfo',
    };
    return trackers.contains(key.toLowerCase());
  }

  String? _getTrackerCategory(String key) {
    const categories = {
      'utm_source': 'Google Analytics',
      'utm_medium': 'Google Analytics',
      'utm_campaign': 'Google Analytics',
      'fbclid': 'Facebook',
      'gclid': 'Google Ads',
      'msclkid': 'Microsoft',
      '_ga': 'Google Analytics',
      'mc_cid': 'Mailchimp',
      '__hstc': 'HubSpot',
    };
    return categories[key.toLowerCase()];
  }
}