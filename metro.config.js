const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 웹 지원을 위한 설정
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 웹에서 사용할 수 없는 모듈들에 대한 폴리필
config.resolver.alias = {
  'react-native-vector-icons': 'react-native-vector-icons/dist',
};

// 웹 빌드를 위한 최적화
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
