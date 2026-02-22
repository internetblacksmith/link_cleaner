import '../entities/cleaned_url.dart';
import '../entities/url_parameter.dart';
import '../repositories/url_repository.dart';
import '../../core/constants/tracker_constants.dart';

class ParseUrlUseCase {
  final UrlRepository repository;

  ParseUrlUseCase(this.repository);

  Future<CleanedUrl> execute(String url) async {
    if (!_isValidUrl(url)) {
      throw ArgumentError('Invalid URL format');
    }

    final uri = Uri.parse(url);
    final parameters = _extractParameters(uri);
    
    return CleanedUrl.fromUrl(url, parameters);
  }

  bool _isValidUrl(String url) {
    try {
      final uri = Uri.parse(url);
      return uri.hasScheme && uri.hasAuthority;
    } catch (_) {
      return false;
    }
  }

  List<UrlParameter> _extractParameters(Uri uri) {
    return uri.queryParameters.entries.map((entry) {
      final isTracker = TrackerConstants.commonTrackers.contains(entry.key.toLowerCase());
      final category = TrackerConstants.trackerCategories[entry.key.toLowerCase()];
      
      return UrlParameter(
        key: entry.key,
        value: entry.value,
        selected: true,
        isTracker: isTracker,
        category: category,
      );
    }).toList();
  }
}