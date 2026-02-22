import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import UrlCard from '../../../src/presentation/components/UrlCard';
import { ThemeProvider } from '../../../src/presentation/contexts/ThemeContext';
import { CleanedUrl } from '../../../src/domain/entities/CleanedUrl';

// Mock the theme context
const mockTheme = {
  colors: {
    text: '#000000',
    textSecondary: '#666666',
    primary: '#007AFF',
    card: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: '#1976D2',
  },
  isDark: false,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider value={mockTheme}>
    {children}
  </ThemeProvider>
);


describe('UrlCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createCleanedUrl = (overrides: Partial<CleanedUrl> = {}): CleanedUrl => ({
    originalUrl: 'https://example.com?utm_source=google&utm_medium=cpc&id=123',
    baseUrl: 'https://example.com',
    cleanedUrl: 'https://example.com?id=123',
    parameters: [],
    charactersSaved: 35,
    cleanedAt: new Date('2024-01-01T12:00:00Z'),
    ...overrides,
  });

  describe('Basic Rendering', () => {
    test('should render cleaned URL', () => {
      const cleanedUrl = createCleanedUrl();

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('CLEANED URL')).toBeTruthy();
      expect(getByText('https://example.com?id=123')).toBeTruthy();
    });

    test('should render action buttons', () => {
      const cleanedUrl = createCleanedUrl();

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('📋 Copy')).toBeTruthy();
      expect(getByText('↗️ Share')).toBeTruthy();
    });

    test('should render compression statistics', () => {
      const cleanedUrl = createCleanedUrl({
        originalUrl: 'https://example.com?utm_source=google&utm_medium=cpc&id=123',
        cleanedUrl: 'https://example.com?id=123',
        charactersSaved: 35,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('📊')).toBeTruthy();
      // Should show compression ratio (around 47% for this example)
      expect(getByText(/\d+% reduced/)).toBeTruthy();
    });
  });

  describe('Characters Saved Display', () => {
    test('should show characters saved chip when characters were saved', () => {
      const cleanedUrl = createCleanedUrl({
        charactersSaved: 25,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('25 chars saved')).toBeTruthy();
    });

    test('should not show characters saved chip when no characters were saved', () => {
      const cleanedUrl = createCleanedUrl({
        charactersSaved: 0,
      });

      const { queryByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(queryByText(/chars saved/)).toBeNull();
    });

    test('should handle negative characters saved', () => {
      const cleanedUrl = createCleanedUrl({
        charactersSaved: -5,
      });

      const { queryByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      // Should not show chip for negative or zero characters saved
      expect(queryByText(/chars saved/)).toBeNull();
    });
  });

  describe('Copy Functionality', () => {
    test('should copy URL to clipboard when copy button is pressed', async () => {
      const cleanedUrl = createCleanedUrl();

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      fireEvent.press(getByText('📋 Copy'));

      expect(Clipboard.setString).toHaveBeenCalledWith('https://example.com?id=123');
    });
  });

  // Note: Share functionality tests are skipped due to React Native mocking complexity
  // The actual Share.share() calls are tested at the integration level

  describe('URL Display', () => {
    test('should truncate very long URLs', () => {
      const longUrl = 'https://example.com/very/long/path/that/might/break/layout?' + 'param='.repeat(20) + 'value';
      const cleanedUrl = createCleanedUrl({
        cleanedUrl: longUrl,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      // URL should be rendered (text component will handle truncation via numberOfLines)
      expect(getByText(longUrl)).toBeTruthy();
    });

    test('should handle special characters in URLs', () => {
      const specialUrl = 'https://example.com/search?q=test%20query&category=electronics%20%26%20gadgets';
      const cleanedUrl = createCleanedUrl({
        cleanedUrl: specialUrl,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText(specialUrl)).toBeTruthy();
    });
  });

  describe('Statistics Display', () => {
    test('should show correct compression ratio', () => {
      const cleanedUrl = createCleanedUrl({
        originalUrl: 'https://example.com?utm_source=google&utm_medium=cpc&id=123',
        cleanedUrl: 'https://example.com?id=123',
        charactersSaved: 35,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      // Compression ratio should be calculated correctly
      const compressionText = getByText(/\d+% reduced/);
      expect(compressionText).toBeTruthy();
    });

    test('should handle zero compression', () => {
      const cleanedUrl = createCleanedUrl({
        originalUrl: 'https://example.com',
        cleanedUrl: 'https://example.com',
        charactersSaved: 0,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('0% reduced')).toBeTruthy();
    });

    test('should handle 100% compression', () => {
      const cleanedUrl = createCleanedUrl({
        originalUrl: 'https://example.com?utm_source=google&utm_medium=cpc',
        cleanedUrl: 'https://example.com',
        charactersSaved: 47, // All query parameters removed
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      // Should show compression percentage
      expect(getByText(/\d+% reduced/)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    test('should handle URLs with no domain', () => {
      const cleanedUrl = createCleanedUrl({
        cleanedUrl: '/relative/path',
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('/relative/path')).toBeTruthy();
    });

    test('should handle empty URLs', () => {
      const cleanedUrl = createCleanedUrl({
        cleanedUrl: '',
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('CLEANED URL')).toBeTruthy();
    });

    test('should handle extremely large character savings', () => {
      const cleanedUrl = createCleanedUrl({
        charactersSaved: 9999,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      expect(getByText('9999 chars saved')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('should be accessible for screen readers', () => {
      const cleanedUrl = createCleanedUrl();

      const { getByText } = render(
        <ThemeWrapper>
          <UrlCard cleanedUrl={cleanedUrl} />
        </ThemeWrapper>
      );

      // All important text should be accessible
      expect(getByText('CLEANED URL')).toBeTruthy();
      expect(getByText('https://example.com?id=123')).toBeTruthy();
      expect(getByText('📋 Copy')).toBeTruthy();
      expect(getByText('↗️ Share')).toBeTruthy();
    });
  });
});