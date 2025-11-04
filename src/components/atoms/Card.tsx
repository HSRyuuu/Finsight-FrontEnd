import React from 'react';
import { View, ViewProps } from 'react-native';
import { globalStyles } from '@/styles';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  style,
  ...props
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: 8 };
      case 'medium':
        return { padding: 16 };
      case 'large':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };

  return (
    <View style={[globalStyles.card, getPaddingStyle(), style]} {...props}>
      {children}
    </View>
  );
};
