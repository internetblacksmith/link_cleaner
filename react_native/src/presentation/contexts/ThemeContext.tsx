import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  primary: '#007AFF',
  primaryContainer: '#E8F5E9',
  onPrimaryContainer: '#2E7D32',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  onSurface: '#333333',
  onSurfaceVariant: '#666666',
  error: '#FF3B30',
  errorContainer: '#FFF3E0',
  onErrorContainer: '#E65100',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#34C759',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  primaryContainer: '#1A3A2A',
  onPrimaryContainer: '#81C784',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#ACACAC',
  error: '#FF453A',
  errorContainer: '#4A2C20',
  onErrorContainer: '#FFB74D',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#ACACAC',
  border: '#38383A',
  success: '#32D74B',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@link_cleaner_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  const isDark = themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');
  
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};