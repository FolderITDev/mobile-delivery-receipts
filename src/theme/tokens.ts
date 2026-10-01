import { cubicBezier, Easing } from 'react-native-reanimated';

/**
 * Delivery Receipts design tokens: the modern dispatch label.
 * All colors are documented in DESIGN.md; the extra roles below were contrast-checked
 * (control borders ≥ 3:1 on surface, tertiary text ≥ 3.5:1 on canvas).
 */
const light = {
  canvas: '#F7F4EE',
  surface: '#FFFFFF',
  /** Elevated control on a `fill` track, such as a segmented thumb. */
  raised: '#FFFFFF',
  fill: '#EFE9E0',
  ink: '#24211E',
  muted: '#655C54',
  tertiary: '#8A8076',
  accent: '#B73521',
  accentSubtle: '#F5E4DF',
  onAccent: '#FFFFFF',
  rule: '#D9D0C4',
  control: '#968A7E',
  imageOutline: 'rgba(0, 0, 0, 0.1)',
};

export type Palette = typeof light;

const dark: Palette = {
  canvas: '#191715',
  surface: '#26221F',
  raised: '#4A423C',
  fill: '#322C28',
  ink: '#F8F2E9',
  muted: '#CBBEB0',
  tertiary: '#968B80',
  accent: '#F07457',
  accentSubtle: '#3A2520',
  onAccent: '#2A130E',
  rule: '#4A403A',
  control: '#7A6E65',
  imageOutline: 'rgba(255, 255, 255, 0.1)',
};

export const palettes = { light, dark } as const;

export const fonts = {
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
} as const;

/** 4-point rhythm. `gutter` is the screen edge inset. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  gutter: 20,
} as const;

/** Mostly straight edges; 8 pt for controls, 12 pt for photos. */
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

/**
 * Tracking tightens as size grows; small text opens up slightly.
 * `maxScale` caps Dynamic Type growth for display sizes that would otherwise overflow.
 */
export const type = {
  display: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    maxScale: 1.4,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
    maxScale: 1.6,
  },
  headline: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
    maxScale: 2,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    maxScale: 2,
  },
  button: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.1,
    maxScale: 1.6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    maxScale: 2,
  },
  subhead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    maxScale: 2,
  },
  footnote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    maxScale: 2,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    maxScale: 1.8,
  },
  code: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
    maxScale: 2,
  },
  codeDisplay: {
    fontFamily: fonts.mono,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    maxScale: 1.3,
  },
  ordinal: {
    fontFamily: fonts.mono,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    maxScale: 1.4,
  },
} as const;

export type TypeVariant = keyof typeof type;

/**
 * Motion vocabulary. UI motion stays under 300 ms; navigation uses the platform.
 * Curves are strong custom ease-outs; never ease-in on UI.
 */
export const motion = {
  duration: { press: 120, quick: 160, base: 220, enter: 260 },
  /** For Reanimated CSS transitions (`transitionTimingFunction`). */
  css: {
    easeOut: cubicBezier(0.23, 1, 0.32, 1),
    easeInOut: cubicBezier(0.77, 0, 0.175, 1),
  },
  /** For layout animations and `withTiming`. */
  easing: {
    easeOut: Easing.bezier(0.23, 1, 0.32, 1),
    easeInOut: Easing.bezier(0.77, 0, 0.175, 1),
  },
  pressScale: 0.97,
} as const;

/** Minimum comfortable touch target (iOS 44 pt, Android 48 dp). */
export const hitTarget = 48;
