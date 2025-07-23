import { ThemeMode, useTheme } from '@/hooks/useTheme';
import React, { createContext, ReactNode, useContext } from 'react';
import { ColorSchemeName } from 'react-native';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorSchemeName;
  isLoading: boolean;
  changeTheme: (theme: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
} 