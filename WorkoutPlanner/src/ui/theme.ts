export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#4DA3FF',
  
  // Success/Action colors
  success: '#34C759',
  warning: '#FF9800',
  danger: '#FF3B30',
  
  // Background colors
  background: '#F5F5F5',
  backgroundDark: '#000000',
  surface: '#FFFFFF',
  surfaceDark: '#1C1C1E',
  
  // Text colors
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: '#8E8E93',
  
  // Border colors
  border: '#E0E0E0',
  borderDark: '#333333',
  
  // Status colors
  improving: '#4CAF50',
  declining: '#F44336',
  plateauing: '#FF9800',
  
  // Special colors
  warmup: '#FFE5B4',
  warmupText: '#FF8C00',
  pr: '#FFD700',
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
  round: 999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
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
