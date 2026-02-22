import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFINITIONS_CACHE_KEY = '@link_cleaner_param_definitions';
const LAST_UPDATE_KEY = '@link_cleaner_param_definitions_last_update';
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Replace with your GitHub username and repo when you create it
const GITHUB_USER = 'yourusername';
const GITHUB_REPO = 'link-cleaner-definitions';
const GITHUB_FILE = 'parameter-definitions.json';

// Using JSDelivr CDN for better performance and no rate limits
const DEFINITIONS_URL = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@latest/${GITHUB_FILE}`;

// Fallback to direct GitHub raw URL if JSDelivr fails
const FALLBACK_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_FILE}`;

export interface ParameterDefinitions {
  version: string;
  lastUpdated: string;
  definitions: {
    [site: string]: {
      domain?: string[];
      parameters: {
        [key: string]: {
          name: string;
          description: string;
          category: 'tracking' | 'campaign' | 'analytics' | 'social' | 'technical' | 'unknown';
          isTracker: boolean;
        };
      };
    };
  };
}

export class ParameterDefinitionsUpdateService {
  private static instance: ParameterDefinitionsUpdateService;
  private definitions: ParameterDefinitions | null = null;
  private isLoading = false;

  static getInstance(): ParameterDefinitionsUpdateService {
    if (!this.instance) {
      this.instance = new ParameterDefinitionsUpdateService();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    // Load cached definitions
    await this.loadCachedDefinitions();
    
    // Check if we need to update
    const shouldUpdate = await this.shouldCheckForUpdates();
    if (shouldUpdate) {
      // Update in background, don't block initialization
      this.checkForUpdates().catch(console.error);
    }
  }

  async loadCachedDefinitions(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(DEFINITIONS_CACHE_KEY);
      if (cached) {
        this.definitions = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error loading cached definitions:', error);
    }
  }

  async shouldCheckForUpdates(): Promise<boolean> {
    try {
      const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      if (!lastUpdate) return true;
      
      const lastUpdateTime = parseInt(lastUpdate, 10);
      const now = Date.now();
      
      return now - lastUpdateTime > UPDATE_INTERVAL;
    } catch (error) {
      return true;
    }
  }

  async checkForUpdates(force = false): Promise<boolean> {
    if (this.isLoading) return false;
    
    if (!force && !(await this.shouldCheckForUpdates())) {
      return false;
    }

    this.isLoading = true;
    
    try {
      // Try JSDelivr first
      let response = await this.fetchWithTimeout(DEFINITIONS_URL);
      
      // Fallback to GitHub raw if JSDelivr fails
      if (!response.ok) {
        response = await this.fetchWithTimeout(FALLBACK_URL);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const newDefinitions: ParameterDefinitions = await response.json();
      
      // Validate the structure
      if (!newDefinitions.version || !newDefinitions.definitions) {
        throw new Error('Invalid definitions format');
      }
      
      // Check if version is newer
      if (this.definitions && this.definitions.version === newDefinitions.version) {
        // Same version, just update the last check time
        await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
        return false;
      }
      
      // Save new definitions
      this.definitions = newDefinitions;
      await AsyncStorage.setItem(DEFINITIONS_CACHE_KEY, JSON.stringify(newDefinitions));
      await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
      
      console.log(`Updated parameter definitions to version ${newDefinitions.version}`);
      return true;
    } catch (error) {
      console.error('Error updating parameter definitions:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  getDefinitions(): ParameterDefinitions | null {
    return this.definitions;
  }

  findParameterInfo(url: string, paramKey: string) {
    if (!this.definitions) return null;
    
    const hostname = new URL(url).hostname.toLowerCase();
    
    // Check site-specific definitions
    for (const [site, siteData] of Object.entries(this.definitions.definitions)) {
      if (site === 'global') continue;
      
      // Check if this site matches the URL
      if (siteData.domain) {
        const matches = siteData.domain.some(domain => 
          hostname.includes(domain.toLowerCase())
        );
        
        if (matches && siteData.parameters[paramKey]) {
          return siteData.parameters[paramKey];
        }
      }
    }
    
    // Check global definitions
    const globalParams = this.definitions.definitions.global?.parameters;
    if (globalParams && globalParams[paramKey]) {
      return globalParams[paramKey];
    }
    
    return null;
  }
}