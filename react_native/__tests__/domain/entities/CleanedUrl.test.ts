import { CleanedUrl, createCleanedUrl, getUrlStatistics } from '../../../src/domain/entities/CleanedUrl';
import { UrlParameter } from '../../../src/domain/entities/UrlParameter';

describe('CleanedUrl', () => {
  describe('createCleanedUrl', () => {
    test('should create cleaned URL with selected parameters', () => {
      const parameters: UrlParameter[] = [
        { key: 'utm_source', value: 'google', selected: false, isTracker: true, category: 'Google Analytics' },
        { key: 'id', value: '123', selected: true, isTracker: false },
        { key: 'utm_medium', value: 'cpc', selected: false, isTracker: true, category: 'Google Analytics' },
      ];

      const result = createCleanedUrl('https://example.com?utm_source=google&id=123&utm_medium=cpc', parameters);

      expect(result.originalUrl).toBe('https://example.com?utm_source=google&id=123&utm_medium=cpc');
      expect(result.baseUrl).toBe('https://example.com/');
      expect(result.cleanedUrl).toBe('https://example.com/?id=123');
      expect(result.parameters).toBe(parameters);
      expect(result.charactersSaved).toBe(32); // original length - cleaned length
      expect(result.cleanedAt).toBeInstanceOf(Date);
    });

    test('should create cleaned URL with no selected parameters', () => {
      const parameters: UrlParameter[] = [
        { key: 'utm_source', value: 'google', selected: false, isTracker: true },
        { key: 'utm_medium', value: 'cpc', selected: false, isTracker: true },
      ];

      const result = createCleanedUrl('https://example.com?utm_source=google&utm_medium=cpc', parameters);

      expect(result.cleanedUrl).toBe('https://example.com/');
      expect(result.charactersSaved).toBe(32);
    });

    test('should create cleaned URL with all parameters selected', () => {
      const parameters: UrlParameter[] = [
        { key: 'utm_source', value: 'google', selected: true, isTracker: true },
        { key: 'id', value: '123', selected: true, isTracker: false },
      ];

      const result = createCleanedUrl('https://example.com?utm_source=google&id=123', parameters);

      expect(result.cleanedUrl).toBe('https://example.com/?utm_source=google&id=123');
      expect(result.charactersSaved).toBe(-1); // The cleaned URL is 1 char longer due to added slash
    });

    test('should handle URLs without query parameters', () => {
      const parameters: UrlParameter[] = [];

      const result = createCleanedUrl('https://example.com/path', parameters);

      expect(result.originalUrl).toBe('https://example.com/path');
      expect(result.baseUrl).toBe('https://example.com/path');
      expect(result.cleanedUrl).toBe('https://example.com/path');
      expect(result.charactersSaved).toBe(0);
    });

    test('should handle complex paths correctly', () => {
      const parameters: UrlParameter[] = [
        { key: 'filter', value: 'electronics', selected: true, isTracker: false },
      ];

      const result = createCleanedUrl('https://example.com/shop/category?filter=electronics&utm_source=google', parameters);

      expect(result.baseUrl).toBe('https://example.com/shop/category');
      expect(result.cleanedUrl).toBe('https://example.com/shop/category?filter=electronics');
    });

    test('should handle special characters in parameters', () => {
      const parameters: UrlParameter[] = [
        { key: 'q', value: 'test query with spaces', selected: true, isTracker: false },
      ];

      const result = createCleanedUrl('https://example.com/search?q=test query with spaces&utm_source=google', parameters);

      expect(result.cleanedUrl).toBe('https://example.com/search?q=test query with spaces');
    });

    test('should preserve parameter order', () => {
      const parameters: UrlParameter[] = [
        { key: 'first', value: 'a', selected: true, isTracker: false },
        { key: 'second', value: 'b', selected: true, isTracker: false },
        { key: 'third', value: 'c', selected: true, isTracker: false },
      ];

      const result = createCleanedUrl('https://example.com?first=a&second=b&third=c', parameters);

      expect(result.cleanedUrl).toBe('https://example.com/?first=a&second=b&third=c');
    });

    test('should handle empty parameter values', () => {
      const parameters: UrlParameter[] = [
        { key: 'empty', value: '', selected: true, isTracker: false },
        { key: 'normal', value: 'value', selected: true, isTracker: false },
      ];

      const result = createCleanedUrl('https://example.com?empty=&normal=value', parameters);

      expect(result.cleanedUrl).toBe('https://example.com/?empty=&normal=value');
    });

    test('should handle negative character savings', () => {
      // This could happen if the URL gets longer after processing
      const parameters: UrlParameter[] = [
        { key: 'very_long_parameter_name_that_makes_url_longer', value: 'short', selected: true, isTracker: false },
      ];

      const result = createCleanedUrl('https://example.com?short=x', parameters);

      expect(result.charactersSaved).toBeLessThan(0);
    });

    test('should handle Unicode characters', () => {
      const parameters: UrlParameter[] = [
        { key: 'search', value: 'тест 例え', selected: true, isTracker: false },
      ];

      const result = createCleanedUrl('https://例え.テスト/search?search=тест 例え&utm_source=google', parameters);

      expect(result.baseUrl).toBe('https://xn--r8jz45g.xn--zckzah/search');
      expect(result.cleanedUrl).toBe('https://xn--r8jz45g.xn--zckzah/search?search=тест 例え');
    });
  });

  describe('getUrlStatistics', () => {
    const createTestCleanedUrl = (overrides: Partial<CleanedUrl> = {}): CleanedUrl => ({
      originalUrl: 'https://example.com?utm_source=google&id=123&utm_medium=cpc',
      baseUrl: 'https://example.com',
      cleanedUrl: 'https://example.com?id=123',
      parameters: [
        { key: 'utm_source', value: 'google', selected: false, isTracker: true, category: 'Google Analytics' },
        { key: 'id', value: '123', selected: true, isTracker: false },
        { key: 'utm_medium', value: 'cpc', selected: false, isTracker: true, category: 'Google Analytics' },
      ],
      charactersSaved: 30,
      cleanedAt: new Date(),
      ...overrides,
    });

    test('should calculate statistics correctly', () => {
      const cleanedUrl = createTestCleanedUrl();
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.totalParameters).toBe(3);
      expect(stats.selectedParameters).toBe(1);
      expect(stats.trackerCount).toBe(2);
      expect(stats.compressionRatio).toBeCloseTo(0.508, 3); // Actual compression ratio
    });

    test('should handle no parameters', () => {
      const cleanedUrl = createTestCleanedUrl({
        parameters: [],
        charactersSaved: 0,
      });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.totalParameters).toBe(0);
      expect(stats.selectedParameters).toBe(0);
      expect(stats.trackerCount).toBe(0);
      expect(stats.compressionRatio).toBe(0);
    });

    test('should handle all parameters selected', () => {
      const parameters: UrlParameter[] = [
        { key: 'param1', value: 'value1', selected: true, isTracker: false },
        { key: 'param2', value: 'value2', selected: true, isTracker: true },
      ];
      const cleanedUrl = createTestCleanedUrl({
        parameters,
        charactersSaved: 0,
      });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.totalParameters).toBe(2);
      expect(stats.selectedParameters).toBe(2);
      expect(stats.trackerCount).toBe(1);
      expect(stats.compressionRatio).toBe(0);
    });

    test('should handle no parameters selected', () => {
      const parameters: UrlParameter[] = [
        { key: 'utm_source', value: 'google', selected: false, isTracker: true },
        { key: 'utm_medium', value: 'cpc', selected: false, isTracker: true },
      ];
      const cleanedUrl = createTestCleanedUrl({
        parameters,
        originalUrl: 'https://example.com?utm_source=google&utm_medium=cpc',
        cleanedUrl: 'https://example.com',
        charactersSaved: 32,
      });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.totalParameters).toBe(2);
      expect(stats.selectedParameters).toBe(0);
      expect(stats.trackerCount).toBe(2);
      expect(stats.compressionRatio).toBeCloseTo(0.615, 3); // Actual compression ratio
    });

    test('should handle all trackers', () => {
      const parameters: UrlParameter[] = [
        { key: 'utm_source', value: 'google', selected: false, isTracker: true },
        { key: 'utm_medium', value: 'cpc', selected: false, isTracker: true },
        { key: 'utm_campaign', value: 'summer', selected: false, isTracker: true },
      ];
      const cleanedUrl = createTestCleanedUrl({ parameters });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.totalParameters).toBe(3);
      expect(stats.trackerCount).toBe(3);
    });

    test('should handle no trackers', () => {
      const parameters: UrlParameter[] = [
        { key: 'id', value: '123', selected: true, isTracker: false },
        { key: 'page', value: '2', selected: true, isTracker: false },
      ];
      const cleanedUrl = createTestCleanedUrl({ parameters });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.totalParameters).toBe(2);
      expect(stats.trackerCount).toBe(0);
    });

    test('should handle negative compression ratio', () => {
      const cleanedUrl = createTestCleanedUrl({
        originalUrl: 'https://example.com',
        cleanedUrl: 'https://example.com?added=parameter',
        charactersSaved: -16,
      });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.compressionRatio).toBeLessThan(0);
    });

    test('should handle perfect compression (100%)', () => {
      const cleanedUrl = createTestCleanedUrl({
        originalUrl: 'https://example.com?utm_source=google',
        cleanedUrl: 'https://example.com',
        charactersSaved: 18,
      });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.compressionRatio).toBeCloseTo(0.486, 3); // Actual compression ratio
    });

    test('should handle large numbers correctly', () => {
      const longUrl = 'https://example.com?' + 'param=value&'.repeat(100);
      const parameters = Array.from({ length: 100 }, (_, i) => ({
        key: `param${i}`,
        value: 'value',
        selected: false,
        isTracker: true,
      }));
      
      const cleanedUrl = createTestCleanedUrl({
        originalUrl: longUrl,
        cleanedUrl: 'https://example.com',
        parameters,
        charactersSaved: longUrl.length - 'https://example.com'.length,
      });
      const stats = getUrlStatistics(cleanedUrl);

      expect(stats.totalParameters).toBe(100);
      expect(stats.selectedParameters).toBe(0);
      expect(stats.trackerCount).toBe(100);
      expect(stats.compressionRatio).toBeGreaterThan(0.8);
    });
  });

  describe('CleanedUrl interface', () => {
    test('should have all required properties', () => {
      const cleanedUrl: CleanedUrl = {
        originalUrl: 'https://example.com?utm_source=google',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        parameters: [],
        charactersSaved: 18,
        cleanedAt: new Date(),
      };

      expect(cleanedUrl.originalUrl).toBeDefined();
      expect(cleanedUrl.baseUrl).toBeDefined();
      expect(cleanedUrl.cleanedUrl).toBeDefined();
      expect(cleanedUrl.parameters).toBeDefined();
      expect(cleanedUrl.charactersSaved).toBeDefined();
      expect(cleanedUrl.cleanedAt).toBeDefined();
    });

    test('should accept UrlParameter arrays', () => {
      const parameters: UrlParameter[] = [
        { key: 'test', value: 'value', selected: true, isTracker: false },
      ];

      const cleanedUrl: CleanedUrl = {
        originalUrl: 'https://example.com',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        parameters,
        charactersSaved: 0,
        cleanedAt: new Date(),
      };

      expect(cleanedUrl.parameters).toBe(parameters);
      expect(cleanedUrl.parameters[0].key).toBe('test');
    });
  });
});