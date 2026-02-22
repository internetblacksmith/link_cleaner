import 'package:flutter_test/flutter_test.dart';
import 'package:link_cleaner/domain/entities/cleaned_url.dart';
import 'package:link_cleaner/domain/entities/url_parameter.dart';

void main() {
  group('CleanedUrl', () {
    test('should create cleaned URL from constructor', () {
      final parameters = [
        UrlParameter(key: 'utm_source', value: 'google', selected: true, isTracker: true),
        UrlParameter(key: 'id', value: '123', selected: true, isTracker: false),
      ];
      final cleanedAt = DateTime.now();
      
      final cleanedUrl = CleanedUrl(
        originalUrl: 'https://example.com?utm_source=google&id=123',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com?id=123',
        parameters: parameters,
        charactersSaved: 18,
        cleanedAt: cleanedAt,
      );

      expect(cleanedUrl.originalUrl, 'https://example.com?utm_source=google&id=123');
      expect(cleanedUrl.baseUrl, 'https://example.com');
      expect(cleanedUrl.cleanedUrl, 'https://example.com?id=123');
      expect(cleanedUrl.parameters, parameters);
      expect(cleanedUrl.charactersSaved, 18);
      expect(cleanedUrl.cleanedAt, cleanedAt);
    });

    test('should create from URL with factory constructor', () {
      final parameters = [
        UrlParameter(key: 'utm_source', value: 'google', selected: false, isTracker: true),
        UrlParameter(key: 'id', value: '123', selected: true, isTracker: false),
        UrlParameter(key: 'utm_medium', value: 'cpc', selected: false, isTracker: true),
      ];

      final cleanedUrl = CleanedUrl.fromUrl('https://example.com?utm_source=google&id=123&utm_medium=cpc', parameters);

      expect(cleanedUrl.originalUrl, 'https://example.com?utm_source=google&id=123&utm_medium=cpc');
      expect(cleanedUrl.baseUrl, 'https://example.com');
      expect(cleanedUrl.cleanedUrl, 'https://example.com?id=123');
      expect(cleanedUrl.parameters, parameters);
      expect(cleanedUrl.charactersSaved, 33); // Removed utm_source=google and utm_medium=cpc
      expect(cleanedUrl.cleanedAt, isA<DateTime>());
    });

    test('should create cleaned URL with no selected parameters', () {
      final parameters = [
        UrlParameter(key: 'utm_source', value: 'google', selected: false, isTracker: true),
        UrlParameter(key: 'utm_medium', value: 'cpc', selected: false, isTracker: true),
      ];

      final cleanedUrl = CleanedUrl.fromUrl('https://example.com?utm_source=google&utm_medium=cpc', parameters);

      expect(cleanedUrl.cleanedUrl, 'https://example.com');
      expect(cleanedUrl.charactersSaved, 33);
    });

    test('should create cleaned URL with all parameters selected', () {
      final parameters = [
        UrlParameter(key: 'utm_source', value: 'google', selected: true, isTracker: true),
        UrlParameter(key: 'id', value: '123', selected: true, isTracker: false),
      ];

      final cleanedUrl = CleanedUrl.fromUrl('https://example.com?utm_source=google&id=123', parameters);

      expect(cleanedUrl.cleanedUrl, 'https://example.com?utm_source=google&id=123');
      expect(cleanedUrl.charactersSaved, 0);
    });

    test('should handle URLs without query parameters', () {
      final parameters = <UrlParameter>[];

      final cleanedUrl = CleanedUrl.fromUrl('https://example.com/path', parameters);

      expect(cleanedUrl.originalUrl, 'https://example.com/path');
      expect(cleanedUrl.baseUrl, 'https://example.com/path');
      expect(cleanedUrl.cleanedUrl, 'https://example.com/path');
      expect(cleanedUrl.charactersSaved, 0);
    });

    test('should handle complex paths correctly', () {
      final parameters = [
        UrlParameter(key: 'filter', value: 'electronics', selected: true, isTracker: false),
      ];

      final cleanedUrl = CleanedUrl.fromUrl('https://example.com/shop/category?filter=electronics&utm_source=google', parameters);

      expect(cleanedUrl.baseUrl, 'https://example.com/shop/category');
      expect(cleanedUrl.cleanedUrl, 'https://example.com/shop/category?filter=electronics');
    });

    test('should calculate statistics correctly', () {
      final parameters = [
        UrlParameter(key: 'utm_source', value: 'google', selected: false, isTracker: true),
        UrlParameter(key: 'id', value: '123', selected: true, isTracker: false),
        UrlParameter(key: 'utm_medium', value: 'cpc', selected: false, isTracker: true),
      ];
      
      final cleanedUrl = CleanedUrl.fromUrl('https://example.com?utm_source=google&id=123&utm_medium=cpc', parameters);

      expect(cleanedUrl.totalParameters, 3);
      expect(cleanedUrl.selectedParameters, 1);
      expect(cleanedUrl.trackerCount, 2);
      expect(cleanedUrl.compressionRatio, greaterThan(0));
    });

    test('should handle zero compression ratio', () {
      final parameters = [
        UrlParameter(key: 'id', value: '123', selected: true, isTracker: false),
      ];
      
      final cleanedUrl = CleanedUrl.fromUrl('https://example.com?id=123', parameters);

      expect(cleanedUrl.compressionRatio, 0);
    });

    test('should handle empty parameters list', () {
      final cleanedUrl = CleanedUrl(
        originalUrl: 'https://example.com',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        parameters: [],
        charactersSaved: 0,
        cleanedAt: DateTime.now(),
      );

      expect(cleanedUrl.parameters, isEmpty);
      expect(cleanedUrl.totalParameters, 0);
      expect(cleanedUrl.selectedParameters, 0);
      expect(cleanedUrl.trackerCount, 0);
      expect(cleanedUrl.charactersSaved, 0);
    });

    test('should handle negative characters saved', () {
      final cleanedUrl = CleanedUrl(
        originalUrl: 'https://example.com',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com?added=param',
        parameters: [],
        charactersSaved: -12,
        cleanedAt: DateTime.now(),
      );

      expect(cleanedUrl.charactersSaved, -12);
      expect(cleanedUrl.compressionRatio, lessThan(0));
    });

    test('should handle special characters in URLs', () {
      final parameters = [
        UrlParameter(key: 'q', value: 'test%20query', selected: true, isTracker: false),
      ];
      
      final cleanedUrl = CleanedUrl.fromUrl('https://example.com/search?q=test%20query&utm_source=google', parameters);

      expect(cleanedUrl.cleanedUrl, contains('%20'));
      expect(cleanedUrl.originalUrl, contains('utm_source'));
    });

    test('should handle very long URLs', () {
      final longPath = '/very/long/path/that/might/break/layout';
      final longParams = 'param=value&' * 20;
      final longUrl = 'https://example.com$longPath?$longParams';
      
      final cleanedUrl = CleanedUrl.fromUrl(longUrl, []);

      expect(cleanedUrl.originalUrl.length, greaterThan(200));
      expect(cleanedUrl.baseUrl, 'https://example.com$longPath');
    });

    test('should preserve parameter order in query string', () {
      final parameters = [
        UrlParameter(key: 'first', value: 'a', selected: true, isTracker: false),
        UrlParameter(key: 'second', value: 'b', selected: true, isTracker: false),
        UrlParameter(key: 'third', value: 'c', selected: true, isTracker: false),
      ];
      
      final cleanedUrl = CleanedUrl.fromUrl('https://example.com?first=a&second=b&third=c', parameters);

      expect(cleanedUrl.cleanedUrl, 'https://example.com?first=a&second=b&third=c');
    });

    test('should support Equatable comparison', () {
      final parameters = [
        UrlParameter(key: 'id', value: '123', selected: true, isTracker: false),
      ];
      final cleanedAt = DateTime.parse('2024-01-01T12:00:00.000Z');
      
      final cleanedUrl1 = CleanedUrl(
        originalUrl: 'https://example.com?id=123',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com?id=123',
        parameters: parameters,
        charactersSaved: 0,
        cleanedAt: cleanedAt,
      );
      
      final cleanedUrl2 = CleanedUrl(
        originalUrl: 'https://example.com?id=123',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com?id=123',
        parameters: parameters,
        charactersSaved: 0,
        cleanedAt: cleanedAt,
      );

      expect(cleanedUrl1, equals(cleanedUrl2));
    });

    test('should handle invalid URLs by returning the original URL', () {
      final parameters = <UrlParameter>[];
      
      // This should not crash and should return the original URL as fallback
      expect(() => CleanedUrl.fromUrl('not-a-valid-url', parameters), throwsStateError);
    });
  });
}