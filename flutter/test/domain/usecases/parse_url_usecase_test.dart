import 'package:flutter_test/flutter_test.dart';
import 'package:link_cleaner/domain/usecases/parse_url_usecase.dart';
import 'package:link_cleaner/domain/repositories/url_repository.dart';
import 'package:link_cleaner/domain/entities/cleaned_url.dart';
import 'package:link_cleaner/domain/entities/url_parameter.dart';

class MockUrlRepository implements UrlRepository {
  @override
  Future<CleanedUrl> parseUrl(String url) async {
    throw UnimplementedError();
  }

  @override
  Future<void> saveToHistory(CleanedUrl cleanedUrl) async {}

  @override
  Future<List<CleanedUrl>> getHistory() async => [];

  @override
  Future<void> clearHistory() async {}

  @override
  Future<Map<String, int>> getStatistics() async => {};
}

void main() {
  late ParseUrlUseCase useCase;
  late MockUrlRepository mockRepository;

  setUp(() {
    mockRepository = MockUrlRepository();
    useCase = ParseUrlUseCase(mockRepository);
  });

  group('ParseUrlUseCase', () {
    test('should parse valid URL with query parameters', () async {
      const url = 'https://example.com/page?utm_source=google&id=123&ref=social';
      
      final result = await useCase.execute(url);
      
      expect(result.originalUrl, equals(url));
      expect(result.baseUrl, equals('https://example.com/page'));
      expect(result.parameters.length, equals(3));
      expect(result.parameters[0].key, equals('utm_source'));
      expect(result.parameters[0].isTracker, isTrue);
      expect(result.parameters[1].key, equals('id'));
      expect(result.parameters[1].isTracker, isFalse);
    });

    test('should handle URL without query parameters', () async {
      const url = 'https://example.com/page';
      
      final result = await useCase.execute(url);
      
      expect(result.originalUrl, equals(url));
      expect(result.baseUrl, equals(url));
      expect(result.cleanedUrl, equals(url));
      expect(result.parameters, isEmpty);
      expect(result.charactersSaved, equals(0));
    });

    test('should throw ArgumentError for invalid URL', () {
      const invalidUrl = 'not a valid url';
      
      expect(
        () => useCase.execute(invalidUrl),
        throwsA(isA<ArgumentError>()),
      );
    });

    test('should identify common trackers correctly', () async {
      const url = 'https://example.com?utm_campaign=test&fbclid=abc&gclid=xyz&custom=value';
      
      final result = await useCase.execute(url);
      
      final trackers = result.parameters.where((p) => p.isTracker).toList();
      expect(trackers.length, equals(3));
      expect(trackers.map((t) => t.key), containsAll(['utm_campaign', 'fbclid', 'gclid']));
    });

    test('should calculate characters saved correctly', () async {
      const url = 'https://example.com?utm_source=google&utm_medium=cpc&id=12345';
      
      final result = await useCase.execute(url);
      
      // Deselect all parameters
      final updatedParams = result.parameters.map((p) => p.copyWith(selected: false)).toList();
      final cleanedResult = CleanedUrl.fromUrl(url, updatedParams);
      
      expect(cleanedResult.cleanedUrl, equals('https://example.com'));
      expect(cleanedResult.charactersSaved, equals(url.length - 'https://example.com'.length));
    });
  });
}