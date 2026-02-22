import { CleanedUrl } from '../entities/CleanedUrl';

export interface UrlStatistics {
  totalUrls: number;
  totalCharactersSaved: number;
  totalTrackersRemoved: number;
}

export interface UrlRepository {
  parseUrl(url: string): Promise<CleanedUrl>;
  saveToHistory(cleanedUrl: CleanedUrl): Promise<void>;
  getHistory(): Promise<CleanedUrl[]>;
  clearHistory(): Promise<void>;
  getStatistics(): Promise<UrlStatistics>;
}