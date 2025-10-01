import React from 'react';
import { View, Text } from 'react-native';
import { componentStyles } from '../styles';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
}) => {
  return (
    <View style={componentStyles.errorContainer}>
      <Text style={componentStyles.errorText}>{message}</Text>
      {onRetry && (
        <Text
          style={[
            componentStyles.errorText,
            { marginTop: 8, textDecorationLine: 'underline' },
          ]}
        >
          다시 시도
        </Text>
      )}
    </View>
  );
};
