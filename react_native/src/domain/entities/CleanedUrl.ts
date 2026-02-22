import { UrlParameter } from './UrlParameter';

export interface CleanedUrl {
  originalUrl: string;
  baseUrl: string;
  cleanedUrl: string;
  parameters: UrlParameter[];
  charactersSaved: number;
  cleanedAt: Date;
}

export const createCleanedUrl = (
  originalUrl: string,
  parameters: UrlParameter[]
): CleanedUrl => {
  const url = new URL(originalUrl);
  const baseUrl = `${url.origin}${url.pathname}`;
  
  const selectedParams = parameters.filter(p => p.selected);
  const queryString = selectedParams
    .map(p => `${p.key}=${p.value}`)
    .join('&');
  
  const cleanedUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  const charactersSaved = originalUrl.length - cleanedUrl.length;
  
  return {
    originalUrl,
    baseUrl,
    cleanedUrl,
    parameters,
    charactersSaved,
    cleanedAt: new Date(),
  };
};

export const getUrlStatistics = (cleanedUrl: CleanedUrl) => ({
  totalParameters: cleanedUrl.parameters.length,
  selectedParameters: cleanedUrl.parameters.filter(p => p.selected).length,
  trackerCount: cleanedUrl.parameters.filter(p => p.isTracker).length,
  compressionRatio: cleanedUrl.charactersSaved / cleanedUrl.originalUrl.length,
});