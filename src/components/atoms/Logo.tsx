import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
  color?: string;
  chartColor?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, showText = false }) => {
  return (
    <View style={[styles.container, showText && styles.containerWithText]}>
      {/* PNG 로고 이미지 */}
      <Image
        source={require('@/assets/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />

      {/* 텍스트 로고 */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.logoText}>핀사이트</Text>
          <Text style={styles.logoSubtext}>Financial Insight</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flexDirection: 'column',
    marginTop: 2,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: '#1E3A8A',
  },
  logoSubtext: {
    fontSize: 10,
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: -2,
  },
});
