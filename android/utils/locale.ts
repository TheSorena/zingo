import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

/**
 * Force the app to use English locale and LTR direction
 * regardless of device settings
 */
export function initializeLocale() {
  // Force English locale
  const locale = 'en-US';
  
  // Force LTR direction
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
  
  return {
    locale,
    isRTL: false,
    direction: 'ltr' as const,
    language: 'en',
    region: 'US'
  };
}

/**
 * Get the forced app locale settings
 */
export function getAppLocale() {
  return {
    locale: 'en-US',
    isRTL: false,
    direction: 'ltr' as const,
    language: 'en',
    region: 'US'
  };
}

/**
 * Check if device is using RTL language and warn if needed
 */
export function checkDeviceRTL() {
  const deviceLocales = Localization.getLocales();
  const hasRTLLocale = deviceLocales.some(locale => 
    ['ar', 'fa', 'he', 'ur'].includes(locale.languageCode || '')
  );
  
  if (hasRTLLocale) {
    console.log('Device has RTL locale but app is configured for LTR (English) only');
  }
  
  return hasRTLLocale;
} 