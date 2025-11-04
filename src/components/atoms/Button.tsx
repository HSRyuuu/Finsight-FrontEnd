import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { globalStyles } from '@/styles';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [globalStyles.button];

    if (variant === 'secondary') {
      baseStyle.push(globalStyles.buttonSecondary);
    }

    if (fullWidth) {
      baseStyle.push({ width: '100%' });
    }

    if (size === 'small') {
      baseStyle.push({ paddingVertical: 8, paddingHorizontal: 12 });
    } else if (size === 'large') {
      baseStyle.push({ paddingVertical: 16, paddingHorizontal: 24 });
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [globalStyles.buttonText];

    if (variant === 'secondary') {
      baseStyle.push(globalStyles.buttonSecondaryText);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity style={[getButtonStyle(), style]} {...props}>
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};
