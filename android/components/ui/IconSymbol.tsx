// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'tv.fill': 'tv',
  'tv': 'tv',
  'magnifyingglass': 'search',
  'star.fill': 'star',
  'star': 'star-border',
  'star.leadinghalf.filled': 'star-half',
  'clock': 'access-time',
  'exclamationmark.triangle': 'warning',
  'xmark.circle.fill': 'cancel',
  'film': 'movie',
  'play.fill': 'play-arrow',
  'play.circle': 'play-circle-filled',
  'pause.fill': 'pause',
  'arrow.clockwise': 'refresh',
  'arrow.right': 'arrow-forward',
  'info': 'info',
  'info.circle': 'info-outline',
  'globe': 'language',
  'safari': 'open-in-browser',
  'phone': 'phone',
  'devicephonemini': 'smartphone',
  'chevron.down': 'keyboard-arrow-down',
} as const;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
