import 'package:equatable/equatable.dart';
import 'url_parameter.dart';

class CleanedUrl extends Equatable {
  final String originalUrl;
  final String baseUrl;
  final String cleanedUrl;
  final List<UrlParameter> parameters;
  final int charactersSaved;
  final DateTime cleanedAt;

  const CleanedUrl({
    required this.originalUrl,
    required this.baseUrl,
    required this.cleanedUrl,
    required this.parameters,
    required this.charactersSaved,
    required this.cleanedAt,
  });

  factory CleanedUrl.fromUrl(String url, List<UrlParameter> parameters) {
    final selectedParams = parameters.where((p) => p.selected).toList();
    final queryString = selectedParams.map((p) => p.toQueryString()).join('&');
    final baseUrl = _extractBaseUrl(url);
    final cleanedUrl = queryString.isEmpty ? baseUrl : '$baseUrl?$queryString';
    
    return CleanedUrl(
      originalUrl: url,
      baseUrl: baseUrl,
      cleanedUrl: cleanedUrl,
      parameters: parameters,
      charactersSaved: url.length - cleanedUrl.length,
      cleanedAt: DateTime.now(),
    );
  }

  static String _extractBaseUrl(String url) {
    final uri = Uri.tryParse(url);
    if (uri == null) return url;
    return '${uri.origin}${uri.path}';
  }

  int get totalParameters => parameters.length;
  int get selectedParameters => parameters.where((p) => p.selected).length;
  int get trackerCount => parameters.where((p) => p.isTracker).length;
  double get compressionRatio => charactersSaved / originalUrl.length;

  @override
  List<Object?> get props => [
        originalUrl,
        baseUrl,
        cleanedUrl,
        parameters,
        charactersSaved,
        cleanedAt,
      ];

  @override
  bool get stringify => true;
}