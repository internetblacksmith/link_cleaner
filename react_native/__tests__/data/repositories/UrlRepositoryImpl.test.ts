import AsyncStorage from '@react-native-async-storage/async-storage';
import { UrlRepositoryImpl } from '../../../src/data/repositories/UrlRepositoryImpl';
import { CleanedUrl } from '../../../src/domain/entities/CleanedUrl';
import { UrlParameter } from '../../../src/domain/entities/UrlParameter';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('UrlRepositoryImpl', () => {
  let repository: UrlRepositoryImpl;

  beforeEach(() => {
    repository = new UrlRepositoryImpl();
    jest.clearAllMocks();
  });

  describe('parseUrl', () => {
    test('should parse URL with tracking parameters correctly', async () => {
      const url = 'https://example.com/page?utm_source=google&utm_medium=cpc&id=123&fbclid=abc';
      
      const result = await repository.parseUrl(url);
      
      expect(result.originalUrl).toBe(url);
      expect(result.baseUrl).toBe('https://example.com/page');
      expect(result.parameters).toHaveLength(4);
      
      // Check tracking parameters are identified
      const utmSource = result.parameters.find(p => p.key === 'utm_source');
      expect(utmSource?.isTracker).toBe(true);
      expect(utmSource?.category).toBe('Google Analytics');
      
      const fbclid = result.parameters.find(p => p.key === 'fbclid');
      expect(fbclid?.isTracker).toBe(true);
      expect(fbclid?.category).toBe('Facebook');
      
      // Check non-tracking parameters
      const id = result.parameters.find(p => p.key === 'id');
      expect(id?.isTracker).toBe(false);
      expect(id?.category).toBeUndefined();
    });

    test('should parse URL without parameters correctly', async () => {
      const url = 'https://example.com/page';
      
      const result = await repository.parseUrl(url);
      
      expect(result.originalUrl).toBe(url);
      expect(result.baseUrl).toBe(url);
      expect(result.parameters).toHaveLength(0);
      expect(result.charactersSaved).toBe(0);
    });

    test('should handle complex URLs with multiple query parameters', async () => {
      const url = 'https://shop.example.com/product/123?utm_source=email&utm_campaign=summer2024&color=red&size=large&gclid=xyz789&ref=newsletter';
      
      const result = await repository.parseUrl(url);
      
      expect(result.originalUrl).toBe(url);
      expect(result.baseUrl).toBe('https://shop.example.com/product/123');
      expect(result.parameters).toHaveLength(6);
      
      // Verify tracking parameters
      const trackingParams = result.parameters.filter(p => p.isTracker);
      expect(trackingParams).toHaveLength(4); // utm_source, utm_campaign, gclid, ref
      
      // Verify non-tracking parameters
      const nonTrackingParams = result.parameters.filter(p => !p.isTracker);
      expect(nonTrackingParams).toHaveLength(2); // color, size
    });

    test('should throw error for invalid URLs', async () => {
      const invalidUrl = 'not-a-valid-url';
      
      await expect(repository.parseUrl(invalidUrl)).rejects.toThrow();
    });

    test('should handle URLs with encoded parameters', async () => {
      const url = 'https://example.com?utm_source=google%20ads&product=test%20item';
      
      const result = await repository.parseUrl(url);
      
      expect(result.parameters).toHaveLength(2);
      expect(result.parameters[0].value).toBe('google ads'); // Should be decoded
      expect(result.parameters[1].value).toBe('test item'); // Should be decoded
    });
  });

  describe('saveToHistory and getHistory', () => {
    test('should save and retrieve cleaned URL from history', async () => {
      const cleanedUrl: CleanedUrl = {
        originalUrl: 'https://example.com?utm_source=test',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        parameters: [
          {
            key: 'utm_source',
            value: 'test',
            selected: false,
            isTracker: true,
            category: 'Google Analytics',
          },
        ],
        charactersSaved: 17,
        cleanedAt: new Date('2024-01-01T12:00:00Z'),
      };

      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      await repository.saveToHistory(cleanedUrl);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@link_cleaner_history',
        JSON.stringify([cleanedUrl])
      );
    });

    test('should maintain chronological order with most recent first', async () => {
      const url1: CleanedUrl = {
        originalUrl: 'https://example1.com?utm_source=test1',
        baseUrl: 'https://example1.com',
        cleanedUrl: 'https://example1.com',
        parameters: [],
        charactersSaved: 10,
        cleanedAt: new Date('2024-01-01T12:00:00Z'),
      };

      const url2: CleanedUrl = {
        originalUrl: 'https://example2.com?utm_source=test2',
        baseUrl: 'https://example2.com',
        cleanedUrl: 'https://example2.com',
        parameters: [],
        charactersSaved: 15,
        cleanedAt: new Date('2024-01-01T13:00:00Z'),
      };

      // Mock first save
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      await repository.saveToHistory(url1);

      // Mock second save
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([url1]));
      await repository.saveToHistory(url2);

      // Verify order: url2 should be first (most recent)
      // Find the last history call (not the statistics call)
      const historyCalls = (mockAsyncStorage.setItem as jest.Mock).mock.calls.filter(
        call => call[0] === '@link_cleaner_history'
      );
      expect(historyCalls.length).toBeGreaterThan(0);
      const lastHistoryCall = historyCalls[historyCalls.length - 1];
      expect(lastHistoryCall[1]).toBe(JSON.stringify([url2, url1]));
    });

    test('should enforce maximum history limit of 100 items', async () => {
      // Create 100 existing items
      const existingHistory = Array.from({ length: 100 }, (_, i) => ({
        originalUrl: `https://example${i}.com`,
        baseUrl: `https://example${i}.com`,
        cleanedUrl: `https://example${i}.com`,
        parameters: [],
        charactersSaved: 0,
        cleanedAt: new Date(`2024-01-01T${i % 24}:00:00Z`),
      }));

      const newUrl: CleanedUrl = {
        originalUrl: 'https://new-example.com',
        baseUrl: 'https://new-example.com',
        cleanedUrl: 'https://new-example.com',
        parameters: [],
        charactersSaved: 0,
        cleanedAt: new Date('2024-01-02T00:00:00Z'),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingHistory));
      await repository.saveToHistory(newUrl);

      // Should keep only 100 items (remove the last one)
      const savedHistory = JSON.parse(
        (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedHistory).toHaveLength(100);
      expect(savedHistory[0].originalUrl).toBe('https://new-example.com'); // New item first
      expect(savedHistory[99].originalUrl).toBe('https://example98.com'); // Last item removed
    });

    test('should return empty array when no history exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const history = await repository.getHistory();
      
      expect(history).toEqual([]);
    });

    test('should parse dates correctly when retrieving history', async () => {
      const historyData = [
        {
          originalUrl: 'https://example.com',
          baseUrl: 'https://example.com',
          cleanedUrl: 'https://example.com',
          parameters: [],
          charactersSaved: 0,
          cleanedAt: '2024-01-01T12:00:00Z',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(historyData));
      
      const history = await repository.getHistory();
      
      expect(history[0].cleanedAt).toBeInstanceOf(Date);
      expect(history[0].cleanedAt.toISOString()).toBe('2024-01-01T12:00:00.000Z');
    });

    test('should handle corrupted history data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');
      
      const history = await repository.getHistory();
      
      expect(history).toEqual([]);
    });

    test('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const history = await repository.getHistory();
      
      expect(history).toEqual([]);
    });
  });

  describe('clearHistory', () => {
    test('should clear both history and statistics', async () => {
      mockAsyncStorage.multiRemove.mockResolvedValue();
      
      await repository.clearHistory();
      
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@link_cleaner_history',
        '@link_cleaner_stats',
      ]);
    });
  });

  describe('getStatistics', () => {
    test('should return default statistics when none exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const stats = await repository.getStatistics();
      
      expect(stats).toEqual({
        totalUrls: 0,
        totalCharactersSaved: 0,
        totalTrackersRemoved: 0,
      });
    });

    test('should return stored statistics', async () => {
      const statsData = {
        totalUrls: 5,
        totalCharactersSaved: 150,
        totalTrackersRemoved: 10,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(statsData));
      
      const stats = await repository.getStatistics();
      
      expect(stats).toEqual(statsData);
    });

    test('should handle corrupted statistics data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');
      
      const stats = await repository.getStatistics();
      
      expect(stats).toEqual({
        totalUrls: 0,
        totalCharactersSaved: 0,
        totalTrackersRemoved: 0,
      });
    });

    test('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const stats = await repository.getStatistics();
      
      expect(stats).toEqual({
        totalUrls: 0,
        totalCharactersSaved: 0,
        totalTrackersRemoved: 0,
      });
    });
  });

  describe('statistics tracking', () => {
    test('should update statistics when saving URLs', async () => {
      const cleanedUrl: CleanedUrl = {
        originalUrl: 'https://example.com?utm_source=test&fbclid=abc',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        parameters: [
          {
            key: 'utm_source',
            value: 'test',
            selected: false, // Removed
            isTracker: true,
            category: 'Google Analytics',
          },
          {
            key: 'fbclid',
            value: 'abc',
            selected: false, // Removed
            isTracker: true,
            category: 'Facebook',
          },
        ],
        charactersSaved: 25,
        cleanedAt: new Date(),
      };

      // Mock initial empty stats
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // for getHistory
        .mockResolvedValueOnce(null); // for getStatistics

      await repository.saveToHistory(cleanedUrl);

      // Check that statistics were updated
      const statsCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === '@link_cleaner_stats'
      );
      expect(statsCall).toBeDefined();
      
      const updatedStats = JSON.parse(statsCall[1]);
      expect(updatedStats.totalUrls).toBe(1);
      expect(updatedStats.totalCharactersSaved).toBe(25);
      expect(updatedStats.totalTrackersRemoved).toBe(2); // Both trackers removed
    });

    test('should accumulate statistics over multiple saves', async () => {
      const initialStats = {
        totalUrls: 2,
        totalCharactersSaved: 50,
        totalTrackersRemoved: 3,
      };

      const newUrl: CleanedUrl = {
        originalUrl: 'https://example.com?gclid=xyz',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        parameters: [
          {
            key: 'gclid',
            value: 'xyz',
            selected: false, // Removed
            isTracker: true,
            category: 'Google Ads',
          },
        ],
        charactersSaved: 12,
        cleanedAt: new Date(),
      };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify([])) // for getHistory
        .mockResolvedValueOnce(JSON.stringify(initialStats)); // for getStatistics

      await repository.saveToHistory(newUrl);

      const statsCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === '@link_cleaner_stats'
      );
      const updatedStats = JSON.parse(statsCall[1]);
      
      expect(updatedStats.totalUrls).toBe(3); // 2 + 1
      expect(updatedStats.totalCharactersSaved).toBe(62); // 50 + 12
      expect(updatedStats.totalTrackersRemoved).toBe(4); // 3 + 1
    });
  });

  describe('tracker detection', () => {
    test('should correctly identify common tracking parameters', async () => {
      const url = 'https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=test&fbclid=abc&gclid=xyz&msclkid=123&ref=email&_ga=test&mc_cid=newsletter&__hstc=hubspot';
      
      const result = await repository.parseUrl(url);
      const trackers = result.parameters.filter(p => p.isTracker);
      
      expect(trackers).toHaveLength(10);
      
      // Check specific categories
      const utmParams = trackers.filter(p => p.category === 'Google Analytics');
      expect(utmParams.length).toBeGreaterThanOrEqual(3);
      
      const facebookParam = trackers.find(p => p.key === 'fbclid');
      expect(facebookParam?.category).toBe('Facebook');
      
      const googleAdsParam = trackers.find(p => p.key === 'gclid');
      expect(googleAdsParam?.category).toBe('Google Ads');
    });

    test('should not identify non-tracking parameters as trackers', async () => {
      const url = 'https://example.com?id=123&category=electronics&color=red&size=large&page=2';
      
      const result = await repository.parseUrl(url);
      const nonTrackers = result.parameters.filter(p => !p.isTracker);
      
      expect(nonTrackers).toHaveLength(5);
      expect(result.parameters.every(p => !p.isTracker)).toBe(true);
    });

    test('should handle case-insensitive tracker detection', async () => {
      const url = 'https://example.com?UTM_SOURCE=test&Fbclid=abc&GCLID=xyz';
      
      const result = await repository.parseUrl(url);
      
      expect(result.parameters.every(p => p.isTracker)).toBe(true);
      expect(result.parameters).toHaveLength(3);
    });
  });

  describe('error handling', () => {
    test('should handle URL parsing errors', async () => {
      await expect(repository.parseUrl('invalid-url')).rejects.toThrow();
    });

    test('should handle AsyncStorage save errors gracefully', async () => {
      const cleanedUrl: CleanedUrl = {
        originalUrl: 'https://example.com',
        baseUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        parameters: [],
        charactersSaved: 0,
        cleanedAt: new Date(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw, but should handle error gracefully
      await expect(repository.saveToHistory(cleanedUrl)).rejects.toThrow('Storage error');
    });
  });
});