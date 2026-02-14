export const palette = {
  // Base colors
  black: '#000000',
  white: '#FFFFFF',
  
  // Reds
  redPrimary: '#FF3333', // Vibrant Red
  redDark: '#D32F2F',
  redLight: '#FF6666',
  
  // Grays
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray300: '#CCCCCC',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#333333',
  gray700: '#2C2C2E',
  gray800: '#1C1C1E',
  gray900: '#121212',
};

export const lightColors = {
  primary: '#007AFF', // Keep Blue for light mode or switch to Red? User said "Dark mode must use red...", implies light mode can be different. But consistency is good. Let's keep Blue for now to minimize disruption, or switch to Red for brand consistency. Let's stick to the request for Dark Mode specifically.
  primaryDark: '#0051D5',
  primaryLight: '#4DA3FF',
  
  background: palette.gray100,
  surface: palette.white,
  surfaceHighlight: palette.white,
  
  text: palette.gray600,
  textSecondary: palette.gray500,
  textMuted: palette.gray400,
  textOnPrimary: palette.white,
  
  border: palette.gray200,
  
  success: '#34C759',
  warning: '#FF9800',
  danger: '#FF3B30',
  
  cardShadow: '#000000',
};

export const darkColors = {
  primary: palette.redPrimary,
  primaryDark: palette.redDark,
  primaryLight: palette.redLight,
  
  background: palette.black,
  surface: palette.gray900, // Slightly lighter than black for cards
  surfaceHighlight: palette.gray800,
  
  text: palette.white,
  textSecondary: palette.gray300,
  textMuted: palette.gray500,
  textOnPrimary: palette.white,
  
  border: palette.gray700,
  
  success: '#32D74B',
  warning: '#FF9F0A',
  danger: '#FF453A',
  
  cardShadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold' as const,
  },
  title1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  title2: {
    fontSize: 22,
    fontWeight: 'bold' as const,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
};

// Legacy export for backward compatibility until refactor is complete
export const colors = lightColors;
