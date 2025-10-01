// API 기본 설정
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

// 앱 설정
export const APP_CONFIG = {
  name: 'React Native App',
  version: '1.0.0',
  description: 'Cross-platform React Native app with web support',
};

// 플랫폼별 설정
export const PLATFORM_CONFIG = {
  web: {
    baseUrl: '/',
    title: 'React Native Web App',
  },
  mobile: {
    baseUrl: 'app://',
    title: 'React Native App',
  },
};

// 색상 팔레트
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// 폰트 크기
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// 간격
export const SPACING = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};
