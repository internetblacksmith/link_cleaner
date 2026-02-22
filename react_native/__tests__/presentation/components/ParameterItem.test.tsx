import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ParameterItem from '../../../src/presentation/components/ParameterItem';
import { ThemeProvider } from '../../../src/presentation/contexts/ThemeContext';
import { UrlParameter } from '../../../src/domain/entities/UrlParameter';

// Mock the theme context
const mockTheme = {
  colors: {
    text: '#000000',
    textSecondary: '#666666',
    primary: '#007AFF',
    border: '#E0E0E0',
    card: '#FFFFFF',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#C62828',
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

describe('ParameterItem', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createParameter = (overrides: Partial<UrlParameter> = {}): UrlParameter => ({
    key: 'utm_source',
    value: 'google',
    selected: true,
    isTracker: false,
    category: undefined,
    ...overrides,
  });

  describe('Basic Rendering', () => {
    test('should render parameter key and value', () => {
      const parameter = createParameter({
        key: 'utm_source',
        value: 'google_ads',
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText('utm_source')).toBeTruthy();
      expect(getByText('google_ads')).toBeTruthy();
    });

    test('should render selected checkbox when parameter is selected', () => {
      const parameter = createParameter({ selected: true });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText('✓')).toBeTruthy();
    });

    test('should not render checkmark when parameter is not selected', () => {
      const parameter = createParameter({ selected: false });

      const { queryByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(queryByText('✓')).toBeNull();
    });
  });

  describe('Tracker Badge', () => {
    test('should show tracker badge for tracking parameters', () => {
      const parameter = createParameter({
        isTracker: true,
        category: 'Google Analytics',
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText('👁️‍🗨️')).toBeTruthy();
      expect(getByText('Google Analytics')).toBeTruthy();
    });

    test('should show generic tracker label when no category provided', () => {
      const parameter = createParameter({
        isTracker: true,
        category: undefined,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText('👁️‍🗨️')).toBeTruthy();
      expect(getByText('Tracker')).toBeTruthy();
    });

    test('should not show tracker badge for non-tracking parameters', () => {
      const parameter = createParameter({
        isTracker: false,
      });

      const { queryByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(queryByText('👁️‍🗨️')).toBeNull();
      expect(queryByText('Tracker')).toBeNull();
    });
  });

  describe('Value Truncation', () => {
    test('should truncate long parameter values', () => {
      const longValue = 'a'.repeat(100);
      const parameter = createParameter({
        value: longValue,
      });

      const { getByText, queryByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      // Should show truncated value
      expect(getByText('a'.repeat(50) + '...')).toBeTruthy();
      // Should not show full value
      expect(queryByText(longValue)).toBeNull();
    });

    test('should not truncate short parameter values', () => {
      const shortValue = 'short_value';
      const parameter = createParameter({
        value: shortValue,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText(shortValue)).toBeTruthy();
    });

    test('should handle exactly 50 character values', () => {
      const fiftyCharValue = 'a'.repeat(50);
      const parameter = createParameter({
        value: fiftyCharValue,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText(fiftyCharValue)).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    test('should call onToggle when pressed', () => {
      const parameter = createParameter();

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      fireEvent.press(getByText('utm_source'));

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    test('should call onToggle when any part of the component is pressed', () => {
      const parameter = createParameter();

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      // Press the value text (which should trigger the parent TouchableOpacity)
      fireEvent.press(getByText('google'));

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual States', () => {
    test('should render different visual states for different parameter types', () => {
      const scenarios = [
        {
          name: 'tracking parameter',
          parameter: createParameter({
            key: 'utm_source',
            value: 'facebook',
            isTracker: true,
            category: 'Facebook',
            selected: true,
          }),
        },
        {
          name: 'non-tracking parameter',
          parameter: createParameter({
            key: 'productId',
            value: '12345',
            isTracker: false,
            selected: false,
          }),
        },
        {
          name: 'tracking parameter without category',
          parameter: createParameter({
            key: 'ref',
            value: 'email',
            isTracker: true,
            selected: true,
          }),
        },
      ];

      scenarios.forEach(({ name, parameter }) => {
        const { getByText, unmount } = render(
          <ThemeWrapper>
            <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
          </ThemeWrapper>
        );

        // Should render the parameter key
        expect(getByText(parameter.key)).toBeTruthy();
        // Should render the parameter value
        expect(getByText(parameter.value)).toBeTruthy();

        if (parameter.selected) {
          expect(getByText('✓')).toBeTruthy();
        }

        if (parameter.isTracker) {
          expect(getByText('👁️‍🗨️')).toBeTruthy();
        }

        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty parameter values', () => {
      const parameter = createParameter({
        value: '',
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText('utm_source')).toBeTruthy();
      // Empty value should still render (as empty text)
      const valueElement = getByText('utm_source').parent?.parent;
      expect(valueElement).toBeTruthy();
    });

    test('should handle special characters in parameter values', () => {
      const specialValue = 'test@domain.com#section?query=1&other=2';
      const parameter = createParameter({
        value: specialValue,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText(specialValue)).toBeTruthy();
    });

    test('should handle unicode characters in parameter values', () => {
      const unicodeValue = 'test 🚀 émojis & spéciál çhars';
      const parameter = createParameter({
        value: unicodeValue,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText(unicodeValue)).toBeTruthy();
    });

    test('should handle very long parameter keys', () => {
      const longKey = 'very_long_parameter_key_that_might_break_layout';
      const parameter = createParameter({
        key: longKey,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      expect(getByText(longKey)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('should be accessible for screen readers', () => {
      const parameter = createParameter({
        key: 'utm_source',
        value: 'google',
        isTracker: true,
        category: 'Google Analytics',
      });

      const { getByText } = render(
        <ThemeWrapper>
          <ParameterItem parameter={parameter} onToggle={mockOnToggle} />
        </ThemeWrapper>
      );

      // Component should render all necessary text for screen readers
      expect(getByText('utm_source')).toBeTruthy();
      expect(getByText('google')).toBeTruthy();
      expect(getByText('Google Analytics')).toBeTruthy();
    });
  });
});