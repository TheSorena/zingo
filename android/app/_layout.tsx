import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider as CustomThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { checkDeviceRTL, initializeLocale } from '@/utils/locale';

// Initialize locale settings immediately
initializeLocale();

// Force LTR direction and English locale
if (I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
  if (Platform.OS === 'android') {
    // On Android, we need to restart the app to apply RTL changes
    // But since we're forcing LTR, we'll just log a warning
    console.warn('RTL was detected but app is configured for LTR only');
  }
}

function AppContent() {
  const { colorScheme } = useThemeContext();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Ensure LTR direction is maintained and check device locale
  useEffect(() => {
    // Initialize locale settings
    initializeLocale();
    
    // Check if device has RTL locale
    checkDeviceRTL();
    
    // Double-check RTL settings
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="movie/[id]" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="series/[id]" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}
