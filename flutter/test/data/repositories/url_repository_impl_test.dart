import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:link_cleaner/data/repositories/url_repository_impl.dart';
import 'package:link_cleaner/domain/entities/cleaned_url.dart';
import 'package:link_cleaner/domain/entities/url_parameter.dart';

void main() {
  group('UrlRepositoryImpl', () {
    late UrlRepositoryImpl repository;
    late SharedPreferences mockPrefs;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      mockPrefs = await SharedPreferences.getInstance();
      repository = UrlRepositoryImpl(mockPrefs);
    });

    group('parseUrl', () {
      test('should parse URL with tracking parameters correctly', () async {
        const url = 'https://example.com/page?utm_source=google&utm_medium=cpc&id=123&fbclid=abc';
        
        final result = await repository.parseUrl(url);
        
        expect(result.originalUrl, equals(url));
        expect(result.baseUrl, equals('https://example.com/page'));
        expect(result.parameters.length, equals(4));
        
        // Check tracking parameters are identified
        final utmSource = result.parameters.firstWhere((p) => p.key == 'utm_source');
        expect(utmSource.isTracker, isTrue);
        expect(utmSource.category, equals('Google Analytics'));
        
        final fbclid = result.parameters.firstWhere((p) => p.key == 'fbclid');
        expect(fbclid.isTracker, isTrue);
        expect(fbclid.category, equals('Facebook'));
        
        // Check non-tracking parameters
        final id = result.parameters.firstWhere((p) => p.key == 'id');
        expect(id.isTracker, isFalse);
        expect(id.category, isNull);
      });

      test('should parse URL without parameters correctly', () async {
        const url = 'https://example.com/page';
        
        final result = await repository.parseUrl(url);
        
        expect(result.originalUrl, equals(url));
        expect(result.baseUrl, equals(url));
        expect(result.parameters.isEmpty, isTrue);
        expect(result.charactersSaved, equals(0));
      });

      test('should handle complex URLs with multiple query parameters', () async {
        const url = 'https://shop.example.com/product/123?utm_source=email&utm_campaign=summer2024&color=red&size=large&gclid=xyz789&ref=newsletter';
        
        final result = await repository.parseUrl(url);
        
        expect(result.originalUrl, equals(url));
        expect(result.baseUrl, equals('https://shop.example.com/product/123'));
        expect(result.parameters.length, equals(6));
        
        // Verify tracking parameters
        final trackingParams = result.parameters.where((p) => p.isTracker).toList();
        expect(trackingParams.length, equals(4)); // utm_source, utm_campaign, gclid, ref
        
        // Verify non-tracking parameters
        final nonTrackingParams = result.parameters.where((p) => !p.isTracker).toList();
        expect(nonTrackingParams.length, equals(2)); // color, size
      });

      test('should handle malformed URLs gracefully', () async {
        const url = 'not-a-valid-url';
        
        expect(() => repository.parseUrl(url), throwsA(isA<StateError>()));
      });
    });

    group('saveToHistory and getHistory', () {
      test('should save and retrieve cleaned URL from history', () async {
        final cleanedUrl = CleanedUrl(
          originalUrl: 'https://example.com?utm_source=test',
          baseUrl: 'https://example.com',
          cleanedUrl: 'https://example.com',
          parameters: [
            UrlParameter(
              key: 'utm_source',
              value: 'test',
              selected: false,
              isTracker: true,
              category: 'Google Analytics',
            ),
          ],
          charactersSaved: 17,
          cleanedAt: DateTime(2024, 1, 1, 12, 0, 0),
        );

        await repository.saveToHistory(cleanedUrl);
        final history = await repository.getHistory();

        expect(history.length, equals(1));
        expect(history.first.originalUrl, equals(cleanedUrl.originalUrl));
        expect(history.first.baseUrl, equals(cleanedUrl.baseUrl));
        expect(history.first.cleanedUrl, equals(cleanedUrl.cleanedUrl));
        expect(history.first.charactersSaved, equals(cleanedUrl.charactersSaved));
        expect(history.first.parameters.length, equals(1));
        expect(history.first.parameters.first.key, equals('utm_source'));
        expect(history.first.parameters.first.isTracker, isTrue);
      });

      test('should maintain chronological order with most recent first', () async {
        final url1 = CleanedUrl(
          originalUrl: 'https://example1.com?utm_source=test1',
          baseUrl: 'https://example1.com',
          cleanedUrl: 'https://example1.com',
          parameters: [],
          charactersSaved: 10,
          cleanedAt: DateTime(2024, 1, 1, 12, 0, 0),
        );

        final url2 = CleanedUrl(
          originalUrl: 'https://example2.com?utm_source=test2',
          baseUrl: 'https://example2.com',
          cleanedUrl: 'https://example2.com',
          parameters: [],
          charactersSaved: 15,
          cleanedAt: DateTime(2024, 1, 1, 13, 0, 0),
        );

        await repository.saveToHistory(url1);
        await repository.saveToHistory(url2);
        
        final history = await repository.getHistory();

        expect(history.length, equals(2));
        expect(history.first.originalUrl, equals(url2.originalUrl)); // Most recent first
        expect(history.last.originalUrl, equals(url1.originalUrl));
      });

      test('should enforce maximum history limit of 100 items', () async {
        // Add 105 items to test the limit
        for (int i = 0; i < 105; i++) {
          final url = CleanedUrl(
            originalUrl: 'https://example$i.com',
            baseUrl: 'https://example$i.com',
            cleanedUrl: 'https://example$i.com',
            parameters: [],
            charactersSaved: 0,
            cleanedAt: DateTime(2024, 1, 1, 12, i, 0),
          );
          await repository.saveToHistory(url);
        }

        final history = await repository.getHistory();

        expect(history.length, equals(100));
        // Should keep the most recent 100 items
        expect(history.first.originalUrl, equals('https://example104.com'));
        expect(history.last.originalUrl, equals('https://example5.com'));
      });

      test('should return empty list when no history exists', () async {
        final history = await repository.getHistory();
        expect(history.isEmpty, isTrue);
      });
    });

    group('clearHistory', () {
      test('should clear all history and statistics', () async {
        // Add some history and stats first
        final url = CleanedUrl(
          originalUrl: 'https://example.com?utm_source=test',
          baseUrl: 'https://example.com',
          cleanedUrl: 'https://example.com',
          parameters: [],
          charactersSaved: 10,
          cleanedAt: DateTime.now(),
        );
        
        await repository.saveToHistory(url);
        
        // Verify history exists
        var history = await repository.getHistory();
        expect(history.isNotEmpty, isTrue);
        
        var stats = await repository.getStatistics();
        expect(stats['totalUrls'], equals(1));

        // Clear history
        await repository.clearHistory();

        // Verify everything is cleared
        history = await repository.getHistory();
        expect(history.isEmpty, isTrue);
        
        stats = await repository.getStatistics();
        expect(stats['totalUrls'], equals(0));
        expect(stats['totalCharactersSaved'], equals(0));
        expect(stats['totalTrackersRemoved'], equals(0));
      });
    });

    group('getStatistics', () {
      test('should return default statistics when none exist', () async {
        final stats = await repository.getStatistics();
        
        expect(stats['totalUrls'], equals(0));
        expect(stats['totalCharactersSaved'], equals(0));
        expect(stats['totalTrackersRemoved'], equals(0));
      });

      test('should track statistics correctly when saving URLs', () async {
        final url1 = CleanedUrl(
          originalUrl: 'https://example.com?utm_source=test&fbclid=abc',
          baseUrl: 'https://example.com',
          cleanedUrl: 'https://example.com',
          parameters: [
            UrlParameter(
              key: 'utm_source',
              value: 'test',
              selected: false, // Removed
              isTracker: true,
              category: 'Google Analytics',
            ),
            UrlParameter(
              key: 'fbclid',
              value: 'abc',
              selected: false, // Removed
              isTracker: true,
              category: 'Facebook',
            ),
          ],
          charactersSaved: 25,
          cleanedAt: DateTime.now(),
        );

        final url2 = CleanedUrl(
          originalUrl: 'https://example2.com?gclid=xyz&id=123',
          baseUrl: 'https://example2.com',
          cleanedUrl: 'https://example2.com?id=123',
          parameters: [
            UrlParameter(
              key: 'gclid',
              value: 'xyz',
              selected: false, // Removed
              isTracker: true,
              category: 'Google Ads',
            ),
            UrlParameter(
              key: 'id',
              value: '123',
              selected: true, // Kept
              isTracker: false,
              category: null,
            ),
          ],
          charactersSaved: 12,
          cleanedAt: DateTime.now(),
        );

        await repository.saveToHistory(url1);
        await repository.saveToHistory(url2);

        final stats = await repository.getStatistics();

        expect(stats['totalUrls'], equals(2));
        expect(stats['totalCharactersSaved'], equals(37)); // 25 + 12
        expect(stats['totalTrackersRemoved'], equals(3)); // 2 from url1 + 1 from url2
      });

      test('should accumulate statistics over multiple saves', () async {
        // First save
        await repository.saveToHistory(CleanedUrl(
          originalUrl: 'https://example.com?utm_source=test',
          baseUrl: 'https://example.com',
          cleanedUrl: 'https://example.com',
          parameters: [
            UrlParameter(
              key: 'utm_source',
              value: 'test',
              selected: false,
              isTracker: true,
              category: 'Google Analytics',
            ),
          ],
          charactersSaved: 15,
          cleanedAt: DateTime.now(),
        ));

        var stats = await repository.getStatistics();
        expect(stats['totalUrls'], equals(1));
        expect(stats['totalCharactersSaved'], equals(15));
        expect(stats['totalTrackersRemoved'], equals(1));

        // Second save
        await repository.saveToHistory(CleanedUrl(
          originalUrl: 'https://example2.com?fbclid=abc',
          baseUrl: 'https://example2.com',
          cleanedUrl: 'https://example2.com',
          parameters: [
            UrlParameter(
              key: 'fbclid',
              value: 'abc',
              selected: false,
              isTracker: true,
              category: 'Facebook',
            ),
          ],
          charactersSaved: 13,
          cleanedAt: DateTime.now(),
        ));

        stats = await repository.getStatistics();
        expect(stats['totalUrls'], equals(2));
        expect(stats['totalCharactersSaved'], equals(28)); // 15 + 13
        expect(stats['totalTrackersRemoved'], equals(2)); // 1 + 1
      });
    });

    group('JSON serialization', () {
      test('should correctly serialize and deserialize complex CleanedUrl', () async {
        final originalUrl = CleanedUrl(
          originalUrl: 'https://example.com?utm_source=test&id=123&fbclid=abc',
          baseUrl: 'https://example.com',
          cleanedUrl: 'https://example.com?id=123',
          parameters: [
            UrlParameter(
              key: 'utm_source',
              value: 'test',
              selected: false,
              isTracker: true,
              category: 'Google Analytics',
            ),
            UrlParameter(
              key: 'id',
              value: '123',
              selected: true,
              isTracker: false,
              category: null,
            ),
            UrlParameter(
              key: 'fbclid',
              value: 'abc',
              selected: false,
              isTracker: true,
              category: 'Facebook',
            ),
          ],
          charactersSaved: 25,
          cleanedAt: DateTime(2024, 3, 15, 14, 30, 0),
        );

        await repository.saveToHistory(originalUrl);
        final retrieved = (await repository.getHistory()).first;

        expect(retrieved.originalUrl, equals(originalUrl.originalUrl));
        expect(retrieved.baseUrl, equals(originalUrl.baseUrl));
        expect(retrieved.cleanedUrl, equals(originalUrl.cleanedUrl));
        expect(retrieved.charactersSaved, equals(originalUrl.charactersSaved));
        expect(retrieved.cleanedAt, equals(originalUrl.cleanedAt));
        expect(retrieved.parameters.length, equals(originalUrl.parameters.length));

        for (int i = 0; i < retrieved.parameters.length; i++) {
          expect(retrieved.parameters[i].key, equals(originalUrl.parameters[i].key));
          expect(retrieved.parameters[i].value, equals(originalUrl.parameters[i].value));
          expect(retrieved.parameters[i].selected, equals(originalUrl.parameters[i].selected));
          expect(retrieved.parameters[i].isTracker, equals(originalUrl.parameters[i].isTracker));
          expect(retrieved.parameters[i].category, equals(originalUrl.parameters[i].category));
        }
      });
    });

    group('tracker detection', () {
      test('should correctly identify common tracking parameters', () async {
        const url = 'https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=test&fbclid=abc&gclid=xyz&msclkid=123&ref=email&_ga=test&mc_cid=newsletter&__hstc=hubspot';
        
        final result = await repository.parseUrl(url);
        final trackers = result.parameters.where((p) => p.isTracker).toList();
        
        expect(trackers.length, equals(10));
        
        // Check specific categories
        final utmParams = trackers.where((p) => p.category == 'Google Analytics').toList();
        expect(utmParams.length, greaterThanOrEqualTo(3)); // utm_source, utm_medium, utm_campaign
        
        final facebookParam = trackers.firstWhere((p) => p.key == 'fbclid');
        expect(facebookParam.category, equals('Facebook'));
        
        final googleAdsParam = trackers.firstWhere((p) => p.key == 'gclid');
        expect(googleAdsParam.category, equals('Google Ads'));
      });

      test('should not identify non-tracking parameters as trackers', () async {
        const url = 'https://example.com?id=123&category=electronics&color=red&size=large&page=2';
        
        final result = await repository.parseUrl(url);
        final nonTrackers = result.parameters.where((p) => !p.isTracker).toList();
        
        expect(nonTrackers.length, equals(5));
        expect(result.parameters.every((p) => !p.isTracker), isTrue);
      });

      test('should handle case-insensitive tracker detection', () async {
        const url = 'https://example.com?UTM_SOURCE=test&Fbclid=abc&GCLID=xyz';
        
        final result = await repository.parseUrl(url);
        
        expect(result.parameters.every((p) => p.isTracker), isTrue);
        expect(result.parameters.length, equals(3));
      });
    });
  });
}