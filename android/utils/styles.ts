import { TextStyle, ViewStyle } from 'react-native';

/**
 * Base text style that ensures LTR direction
 */
export const baseTextStyle: TextStyle = {
  textAlign: 'left',
  writingDirection: 'ltr',
};

/**
 * Base view style that ensures LTR direction
 */
export const baseViewStyle: ViewStyle = {
  direction: 'ltr',
};

/**
 * Text alignment styles for different use cases
 */
export const textAlign = {
  left: { textAlign: 'left' as const },
  center: { textAlign: 'center' as const },
  right: { textAlign: 'right' as const }, // Only for specific design needs, not RTL
} as const;

/**
 * Force LTR style for any component
 */
export const forceLTR: ViewStyle & TextStyle = {
  direction: 'ltr',
  textAlign: 'left',
  writingDirection: 'ltr',
};

/**
 * Helper function to ensure LTR text style
 */
export function ensureLTRText(style?: TextStyle): TextStyle {
  return {
    ...style,
    ...baseTextStyle,
  };
}

/**
 * Helper function to ensure LTR view style
 */
export function ensureLTRView(style?: ViewStyle): ViewStyle {
  return {
    ...style,
    ...baseViewStyle,
  };
} 