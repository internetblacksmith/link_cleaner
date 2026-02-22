import AsyncStorage from '@react-native-async-storage/async-storage';
import { UrlRepository, UrlStatistics } from '../../domain/repositories/UrlRepository';
import { CleanedUrl, createCleanedUrl } from '../../domain/entities/CleanedUrl';
import { UrlParameter } from '../../domain/entities/UrlParameter';
import { COMMON_TRACKERS } from '../../utils/constants';
import { ParameterIdentificationService } from '../../services/ParameterIdentificationService';

const HISTORY_KEY = '@link_cleaner_history';
const STATS_KEY = '@link_cleaner_stats';
const MAX_HISTORY_ITEMS = 100;

export class UrlRepositoryImpl implements UrlRepository {
  async parseUrl(url: string): Promise<CleanedUrl> {
    const urlObj = new URL(url);
    const parameters: UrlParameter[] = [];
    
    urlObj.searchParams.forEach((value, key) => {
      const paramInfo = ParameterIdentificationService.identifyParameter(key, url);
      
      parameters.push({
        key,
        value,
        selected: true,
        isTracker: paramInfo.isTracker,
        category: paramInfo.category,
        displayName: paramInfo.name,
        description: paramInfo.description,
      });
    });
    
    return createCleanedUrl(url, parameters);
  }

  async saveToHistory(cleanedUrl: CleanedUrl): Promise<void> {
    const history = await this.getHistory();
    history.unshift(cleanedUrl);
    
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    await this.updateStatistics(cleanedUrl);
  }

  async getHistory(): Promise<CleanedUrl[]> {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      if (!historyJson) return [];
      
      const history = JSON.parse(historyJson);
      return history.map((item: any) => ({
        ...item,
        cleanedAt: new Date(item.cleanedAt),
      }));
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    await AsyncStorage.multiRemove([HISTORY_KEY, STATS_KEY]);
  }

  async getStatistics(): Promise<UrlStatistics> {
    try {
      const statsJson = await AsyncStorage.getItem(STATS_KEY);
      if (!statsJson) {
        return {
          totalUrls: 0,
          totalCharactersSaved: 0,
          totalTrackersRemoved: 0,
        };
      }
      return JSON.parse(statsJson);
    } catch (error) {
      console.error('Error loading statistics:', error);
      return {
        totalUrls: 0,
        totalCharactersSaved: 0,
        totalTrackersRemoved: 0,
      };
    }
  }

  private async updateStatistics(cleanedUrl: CleanedUrl): Promise<void> {
    const stats = await this.getStatistics();
    
    stats.totalUrls++;
    stats.totalCharactersSaved += cleanedUrl.charactersSaved;
    stats.totalTrackersRemoved += cleanedUrl.parameters.filter(
      p => p.isTracker && !p.selected
    ).length;
    
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  private getTrackerCategory(key: string): string | undefined {
    const categories: Record<string, string> = {
      'utm_source': 'Google Analytics',
      'utm_medium': 'Google Analytics',
      'utm_campaign': 'Google Analytics',
      'utm_term': 'Google Analytics',
      'utm_content': 'Google Analytics',
      'fbclid': 'Facebook',
      'gclid': 'Google Ads',
      'msclkid': 'Microsoft',
      'twclid': 'Twitter',
      'ttclid': 'TikTok',
      'mc_cid': 'Mailchimp',
      'mc_eid': 'Mailchimp',
      '__hstc': 'HubSpot',
      '__hssc': 'HubSpot',
      '__hsfp': 'HubSpot',
      '_ga': 'Google Analytics',
      '_gid': 'Google Analytics',
    };
    
    return categories[key.toLowerCase()];
  }
}