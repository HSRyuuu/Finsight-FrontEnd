import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
  color?: string;
  chartColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  showText = false,
  color = '#1E3A8A',
  chartColor = '#FF3B30',
}) => {
  return (
    <View style={[styles.container, showText && styles.containerWithText]}>
      {/* SVG 로고 아이콘 */}
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* 배경 원 */}
        <Circle cx="50" cy="50" r="45" fill={color} opacity="0.1" />

        {/* FI 로고 */}
        {/* F 글자 */}
        <Path
          d="M 35 30 L 35 52 M 35 30 L 48 30 M 35 40 L 45 40"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* I 글자 */}
        <Path
          d="M 60 30 L 60 52 M 57 30 L 63 30 M 57 52 L 63 52"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 상승 차트 라인 (플러스는 빨강 유지, 차트는 별도 색상) */}
        <Path
          d="M 25 70 L 35 80 L 50 65 L 65 70 L 83 45"
          stroke={chartColor}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 차트 포인트 */}
        <Circle cx="25" cy="70" r="3" fill={chartColor} />
        <Circle cx="35" cy="80" r="3" fill={chartColor} />
        <Circle cx="50" cy="65" r="3" fill={chartColor} />
        <Circle cx="65" cy="70" r="3" fill={chartColor} />
        <Circle cx="83" cy="45" r="3" fill={chartColor} />

        {/* 화살표 헤드 (더 위쪽을 향하는 각도, 간격 확대) */}
        <Line
          x1="83"
          y1="55"
          x2="83"
          y2="45"
          stroke={chartColor}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Line
          x1="73"
          y1="47"
          x2="83"
          y2="45"
          stroke={chartColor}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </Svg>

      {/* 텍스트 로고 */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.logoText, { color }]}>핀사이트</Text>
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
  },
  logoSubtext: {
    fontSize: 10,
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: -2,
  },
});
