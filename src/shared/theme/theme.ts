export const colors = {
  background: '#050505',
  backgroundElevated: '#0D0D0D',
  surface: '#121212',
  surfaceAlt: '#171717',
  surfaceStrong: '#1F1F1F',
  border: '#232323',
  borderStrong: '#343434',
  text: '#FAFAFA',
  textMuted: '#A3A3A3',
  textSoft: '#737373',
  accent: '#FFFFFF',
  success: '#D4FFD6',
  danger: '#FFD6D6',
  overlay: 'rgba(0, 0, 0, 0.72)',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

export const typography = {
  display: {
    fontFamily: 'SpaceGrotesk_700Bold' as const,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1.2,
  },
  heading: {
    fontFamily: 'SpaceGrotesk_700Bold' as const,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: 'SpaceGrotesk_500Medium' as const,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: 'SpaceGrotesk_400Regular' as const,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  small: {
    fontFamily: 'SpaceGrotesk_400Regular' as const,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  button: {
    fontFamily: 'SpaceGrotesk_500Medium' as const,
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: 0,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
};

export type AppTheme = typeof theme;
