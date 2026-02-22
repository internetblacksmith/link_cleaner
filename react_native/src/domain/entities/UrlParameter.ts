export interface UrlParameter {
  key: string;
  value: string;
  selected: boolean;
  isTracker: boolean;
  category?: 'tracking' | 'campaign' | 'analytics' | 'social' | 'technical' | 'unknown';
  displayName?: string;
  description?: string;
}

export const createUrlParameter = (
  key: string,
  value: string,
  selected: boolean = true,
  isTracker: boolean = false,
  category?: 'tracking' | 'campaign' | 'analytics' | 'social' | 'technical' | 'unknown',
  displayName?: string,
  description?: string
): UrlParameter => ({
  key,
  value,
  selected,
  isTracker,
  category,
  displayName,
  description,
});