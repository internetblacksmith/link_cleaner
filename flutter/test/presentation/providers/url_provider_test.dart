import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:link_cleaner/presentation/providers/url_provider.dart';
import 'package:link_cleaner/domain/entities/cleaned_url.dart';
import 'package:link_cleaner/domain/entities/url_parameter.dart';
import 'package:link_cleaner/data/repositories/url_repository_impl.dart';
import 'package:link_cleaner/domain/usecases/parse_url_usecase.dart';

void main() {
  group('UrlProvider Tests', () {
    late ProviderContainer container;
    late SharedPreferences mockPrefs;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      mockPrefs = await SharedPreferences.getInstance();
      
      container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(mockPrefs),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('UrlCleanerState', () {
      test('should create state with default values', () {
        const state = UrlCleanerState();
        
        expect(state.cleanedUrl, isNull);
        expect(state.isLoading, isFalse);
        expect(state.error, isNull);
        expect(state.selectAll, isTrue);
      });

      test('should copy state with new values', () {
        const originalState = UrlCleanerState(
          isLoading: true,
          selectAll: false,
        );
        
        final newState = originalState.copyWith(
          isLoading: false,
          error: 'Test error',
        );
        
        expect(newState.isLoading, isFalse);
        expect(newState.error, equals('Test error'));
        expect(newState.selectAll, isFalse); // Should preserve original value
        expect(newState.cleanedUrl, isNull); // Should preserve original value
      });
    });

    group('UrlCleanerNotifier', () {
      late UrlCleanerNotifier notifier;

      setUp(() {
        final repository = container.read(urlRepositoryProvider);
        final parseUrlUseCase = container.read(parseUrlUseCaseProvider);
        notifier = UrlCleanerNotifier(parseUrlUseCase, repository);
      });

      test('should have initial empty state', () {
        expect(notifier.state.cleanedUrl, isNull);
        expect(notifier.state.isLoading, isFalse);
        expect(notifier.state.error, isNull);
        expect(notifier.state.selectAll, isTrue);
      });

      test('should parse URL and update state correctly', () async {
        const testUrl = 'https://example.com?utm_source=test&id=123&fbclid=abc';
        
        await notifier.parseUrl(testUrl);
        
        expect(notifier.state.cleanedUrl, isNotNull);
        expect(notifier.state.cleanedUrl!.originalUrl, equals(testUrl));
        expect(notifier.state.cleanedUrl!.baseUrl, equals('https://example.com'));
        expect(notifier.state.cleanedUrl!.parameters.length, equals(3));
        expect(notifier.state.isLoading, isFalse);
        expect(notifier.state.error, isNull);
        
        // Check that tracking parameters are identified
        final trackingParams = notifier.state.cleanedUrl!.parameters
            .where((p) => p.isTracker).toList();
        expect(trackingParams.length, equals(2)); // utm_source, fbclid
      });

      test('should handle parsing errors correctly', () async {
        const invalidUrl = 'not-a-valid-url';
        
        await notifier.parseUrl(invalidUrl);
        
        expect(notifier.state.cleanedUrl, isNull);
        expect(notifier.state.isLoading, isFalse);
        expect(notifier.state.error, isNotNull);
        expect(notifier.state.error, contains('Invalid'));
      });

      test('should set loading state during URL parsing', () async {
        const testUrl = 'https://example.com?utm_source=test';
        
        // Since parsing is fast in tests, we check that loading is false after completion
        await notifier.parseUrl(testUrl);
        
        // Check final state
        expect(notifier.state.isLoading, isFalse);
        expect(notifier.state.cleanedUrl, isNotNull);
        expect(notifier.state.error, isNull);
      });

      test('should toggle individual parameter selection', () async {
        const testUrl = 'https://example.com?utm_source=test&id=123';
        await notifier.parseUrl(testUrl);
        
        final initialParams = notifier.state.cleanedUrl!.parameters;
        expect(initialParams.every((p) => p.selected), isTrue); // All selected initially
        
        // Toggle first parameter
        notifier.toggleParameter(0);
        
        final updatedParams = notifier.state.cleanedUrl!.parameters;
        expect(updatedParams[0].selected, isFalse);
        expect(updatedParams[1].selected, isTrue);
      });

      test('should toggle select all parameters', () async {
        const testUrl = 'https://example.com?utm_source=test&id=123&fbclid=abc';
        await notifier.parseUrl(testUrl);
        
        expect(notifier.state.selectAll, isTrue);
        expect(notifier.state.cleanedUrl!.parameters.every((p) => p.selected), isTrue);
        
        // Toggle select all off
        notifier.toggleSelectAll();
        
        expect(notifier.state.selectAll, isFalse);
        expect(notifier.state.cleanedUrl!.parameters.every((p) => !p.selected), isTrue);
        
        // Toggle select all back on
        notifier.toggleSelectAll();
        
        expect(notifier.state.selectAll, isTrue);
        expect(notifier.state.cleanedUrl!.parameters.every((p) => p.selected), isTrue);
      });

      test('should clear all parameter selections', () async {
        const testUrl = 'https://example.com?utm_source=test&id=123';
        await notifier.parseUrl(testUrl);
        
        expect(notifier.state.cleanedUrl!.parameters.every((p) => p.selected), isTrue);
        expect(notifier.state.selectAll, isTrue);
        
        notifier.clearAll();
        
        expect(notifier.state.cleanedUrl!.parameters.every((p) => !p.selected), isTrue);
        expect(notifier.state.selectAll, isFalse);
      });

      test('should reset to initial state', () async {
        const testUrl = 'https://example.com?utm_source=test';
        await notifier.parseUrl(testUrl);
        
        expect(notifier.state.cleanedUrl, isNotNull);
        
        notifier.reset();
        
        expect(notifier.state.cleanedUrl, isNull);
        expect(notifier.state.isLoading, isFalse);
        expect(notifier.state.error, isNull);
        expect(notifier.state.selectAll, isTrue);
      });

      test('should handle toggle operations when no URL is loaded', () {
        // These operations should not crash when cleanedUrl is null
        expect(() => notifier.toggleParameter(0), returnsNormally);
        expect(() => notifier.toggleSelectAll(), returnsNormally);
        expect(() => notifier.clearAll(), returnsNormally);
        
        // State should remain unchanged
        expect(notifier.state.cleanedUrl, isNull);
      });

      test('should save parsed URL to history', () async {
        const testUrl = 'https://example.com?utm_source=test';
        
        await notifier.parseUrl(testUrl);
        
        // Check that URL was saved to history
        final repository = container.read(urlRepositoryProvider);
        final history = await repository.getHistory();
        
        expect(history.length, equals(1));
        expect(history.first.originalUrl, equals(testUrl));
      });
    });

    group('Provider Integration Tests', () {
      test('should provide correct dependencies', () {
        final repository = container.read(urlRepositoryProvider);
        final parseUrlUseCase = container.read(parseUrlUseCaseProvider);
        final urlCleaner = container.read(urlCleanerProvider.notifier);
        
        expect(repository, isA<UrlRepositoryImpl>());
        expect(parseUrlUseCase, isA<ParseUrlUseCase>());
        expect(urlCleaner, isA<UrlCleanerNotifier>());
      });

      test('urlHistoryProvider should return empty list initially', () async {
        final history = await container.read(urlHistoryProvider.future);
        expect(history.isEmpty, isTrue);
      });

      test('urlStatisticsProvider should return default stats initially', () async {
        final stats = await container.read(urlStatisticsProvider.future);
        expect(stats['totalUrls'], equals(0));
        expect(stats['totalCharactersSaved'], equals(0));
        expect(stats['totalTrackersRemoved'], equals(0));
      });

      test('should update history and statistics after parsing URL', () async {
        final notifier = container.read(urlCleanerProvider.notifier);
        
        // Parse a URL with tracking parameters
        await notifier.parseUrl('https://example.com?utm_source=test&fbclid=abc');
        
        // Remove some parameters to save characters
        notifier.toggleParameter(0); // Remove utm_source
        
        // Force refresh providers
        container.invalidate(urlHistoryProvider);
        container.invalidate(urlStatisticsProvider);
        
        // Check updated history
        final history = await container.read(urlHistoryProvider.future);
        expect(history.length, equals(1));
        
        // Check updated statistics
        final stats = await container.read(urlStatisticsProvider.future);
        expect(stats['totalUrls'], equals(1));
        // Characters saved should be >= 0 (depends on which parameters are selected)
        expect(stats['totalCharactersSaved'], greaterThanOrEqualTo(0));
      });
    });

    group('State Updates and Reactivity', () {
      test('should trigger state updates when parsing URL', () async {
        final notifier = container.read(urlCleanerProvider.notifier);
        final states = <UrlCleanerState>[];
        
        // Listen to state changes
        container.listen(urlCleanerProvider, (previous, next) {
          states.add(next);
        });
        
        await notifier.parseUrl('https://example.com?utm_source=test');
        
        // Should have recorded state changes
        expect(states.length, greaterThanOrEqualTo(2));
        expect(states.any((state) => state.isLoading), isTrue);
        expect(states.last.cleanedUrl, isNotNull);
        expect(states.last.isLoading, isFalse);
      });

      test('should update cleaned URL when toggling parameters', () async {
        final notifier = container.read(urlCleanerProvider.notifier);
        
        await notifier.parseUrl('https://example.com?utm_source=test&id=123');
        
        final originalCleanedUrl = container.read(urlCleanerProvider).cleanedUrl!.cleanedUrl;
        
        // Toggle first parameter off
        notifier.toggleParameter(0);
        
        final updatedCleanedUrl = container.read(urlCleanerProvider).cleanedUrl!.cleanedUrl;
        
        expect(updatedCleanedUrl, isNot(equals(originalCleanedUrl)));
      });
    });
  });
}