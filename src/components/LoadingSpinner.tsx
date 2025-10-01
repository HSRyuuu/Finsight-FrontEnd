import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { componentStyles } from '../styles';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '로딩 중...',
  size = 'large',
  color = '#007AFF',
}) => {
  return (
    <View style={componentStyles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={componentStyles.loadingText}>{message}</Text>}
    </View>
  );
};
