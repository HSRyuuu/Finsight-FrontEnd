import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { componentStyles } from '../styles';

interface AvatarProps {
  name: string;
  image?: ImageSourcePropType;
  size?: 'small' | 'medium' | 'large';
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  image,
  size = 'medium',
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'medium':
        return { width: 40, height: 40, borderRadius: 20 };
      case 'large':
        return { width: 80, height: 80, borderRadius: 40 };
      default:
        return { width: 40, height: 40, borderRadius: 20 };
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case 'small':
        return { fontSize: 12 };
      case 'medium':
        return { fontSize: 16 };
      case 'large':
        return { fontSize: 24 };
      default:
        return { fontSize: 16 };
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[componentStyles.avatar, getSizeStyle()]}>
      {image ? (
        <Image source={image} style={getSizeStyle()} />
      ) : (
        <Text style={[componentStyles.avatarText, getTextStyle()]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};
