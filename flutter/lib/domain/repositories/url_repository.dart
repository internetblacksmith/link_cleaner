import '../entities/cleaned_url.dart';

abstract class UrlRepository {
  Future<CleanedUrl> parseUrl(String url);
  Future<void> saveToHistory(CleanedUrl cleanedUrl);
  Future<List<CleanedUrl>> getHistory();
  Future<void> clearHistory();
  Future<Map<String, int>> getStatistics();
}