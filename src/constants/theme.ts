/**
 * Goldi theme — a warm, "gold hamster" palette layered over a clean banking UI.
 * Light & dark variants. Reuses the spacing scale from the Expo template.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Brand colors — the playful, trustworthy core of Goldi. */
export const Brand = {
  gold: '#F2A93B', // primary accent (Goldi the hamster)
  goldDark: '#D98E1F',
  goldSoft: '#FCEBCB',
  positive: '#1FA971', // deposits / positive balance
  negative: '#E5484D', // withdrawals / negative balance
  navy: '#1C2B46', // banking trust color
} as const;

/** A friendly palette used to color-code children and accounts. */
export const AccentPalette = [
  '#F2A93B', // gold
  '#4C8DF6', // blue
  '#1FA971', // green
  '#E5484D', // red
  '#9B6DF3', // purple
  '#F26DAE', // pink
  '#14B8A6', // teal
  '#F2784B', // orange
] as const;

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#F7F6F2',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F0EDE4',
    textSecondary: '#6B6F76',
    border: '#E7E3D8',
    tint: Brand.gold,
    positive: Brand.positive,
    negative: Brand.negative,
  },
  dark: {
    text: '#F5F5F5',
    background: '#14130F',
    backgroundElement: '#201E18',
    backgroundSelected: '#2A2820',
    textSecondary: '#A8A8A0',
    border: '#322F26',
    tint: Brand.gold,
    positive: '#3FD18B',
    negative: '#FF6369',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 10,
  medium: 16,
  large: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
