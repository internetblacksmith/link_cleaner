import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper/lib/typescript/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Custom theme colors for Link Cleaner
const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: 'rgb(29, 78, 216)', // Blue-700
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(219, 234, 254)', // Blue-100
    onPrimaryContainer: 'rgb(15, 23, 42)',
    secondary: 'rgb(107, 114, 128)', // Gray-500
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(243, 244, 246)', // Gray-100
    onSecondaryContainer: 'rgb(31, 41, 55)',
    tertiary: 'rgb(34, 197, 94)', // Green-500
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(220, 252, 231)', // Green-100
    onTertiaryContainer: 'rgb(20, 83, 45)',
    error: 'rgb(239, 68, 68)', // Red-500
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(254, 226, 226)', // Red-100
    onErrorContainer: 'rgb(127, 29, 29)',
    background: 'rgb(255, 255, 255)',
    onBackground: 'rgb(17, 24, 39)',
    surface: 'rgb(255, 255, 255)',
    onSurface: 'rgb(17, 24, 39)',
    surfaceVariant: 'rgb(249, 250, 251)', // Gray-50
    onSurfaceVariant: 'rgb(75, 85, 99)',
    outline: 'rgb(209, 213, 219)', // Gray-300
    outlineVariant: 'rgb(229, 231, 235)', // Gray-200
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(31, 41, 55)',
    inverseOnSurface: 'rgb(249, 250, 251)',
    inversePrimary: 'rgb(147, 197, 253)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(248, 250, 252)',
      level2: 'rgb(241, 245, 249)',
      level3: 'rgb(226, 232, 240)',
      level4: 'rgb(203, 213, 225)',
      level5: 'rgb(148, 163, 184)',
    },
    surfaceDisabled: 'rgba(17, 24, 39, 0.12)',
    onSurfaceDisabled: 'rgba(17, 24, 39, 0.38)',
    backdrop: 'rgba(55, 65, 81, 0.4)',
  },
};

const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: 'rgb(147, 197, 253)', // Blue-300
    onPrimary: 'rgb(15, 23, 42)',
    primaryContainer: 'rgb(30, 58, 138)', // Blue-800
    onPrimaryContainer: 'rgb(219, 234, 254)',
    secondary: 'rgb(156, 163, 175)', // Gray-400
    onSecondary: 'rgb(31, 41, 55)',
    secondaryContainer: 'rgb(55, 65, 81)', // Gray-700
    onSecondaryContainer: 'rgb(243, 244, 246)',
    tertiary: 'rgb(74, 222, 128)', // Green-400
    onTertiary: 'rgb(20, 83, 45)',
    tertiaryContainer: 'rgb(21, 128, 61)', // Green-700
    onTertiaryContainer: 'rgb(220, 252, 231)',
    error: 'rgb(248, 113, 113)', // Red-400
    onError: 'rgb(127, 29, 29)',
    errorContainer: 'rgb(153, 27, 27)', // Red-800
    onErrorContainer: 'rgb(254, 226, 226)',
    background: 'rgb(17, 24, 39)', // Gray-900
    onBackground: 'rgb(249, 250, 251)',
    surface: 'rgb(17, 24, 39)',
    onSurface: 'rgb(249, 250, 251)',
    surfaceVariant: 'rgb(31, 41, 55)', // Gray-800
    onSurfaceVariant: 'rgb(156, 163, 175)',
    outline: 'rgb(75, 85, 99)', // Gray-600
    outlineVariant: 'rgb(55, 65, 81)', // Gray-700
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(249, 250, 251)',
    inverseOnSurface: 'rgb(31, 41, 55)',
    inversePrimary: 'rgb(29, 78, 216)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(31, 41, 55)',
      level2: 'rgb(55, 65, 81)',
      level3: 'rgb(75, 85, 99)',
      level4: 'rgb(107, 114, 128)',
      level5: 'rgb(156, 163, 175)',
    },
    surfaceDisabled: 'rgba(249, 250, 251, 0.12)',
    onSurfaceDisabled: 'rgba(249, 250, 251, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
};

interface MaterialThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: MD3Theme;
}

const MaterialThemeContext = createContext<MaterialThemeContextType | undefined>(undefined);

export const MaterialThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  
  const theme = isDark ? darkTheme : lightTheme;
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <MaterialThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      <PaperProvider 
        theme={theme}
        settings={{
          icon: (props) => <Icon {...props} />,
        }}
      >
        {children}
      </PaperProvider>
    </MaterialThemeContext.Provider>
  );
};

export const useMaterialTheme = () => {
  const context = useContext(MaterialThemeContext);
  if (context === undefined) {
    throw new Error('useMaterialTheme must be used within a MaterialThemeProvider');
  }
  return context;
};