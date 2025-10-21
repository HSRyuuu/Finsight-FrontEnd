import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { globalStyles, componentStyles } from '../styles';
import { Card } from '../components';
import { useAuth } from '../hooks';

type SettingsScreenNavigationProp = StackNavigationProp<any>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  // 인증 훅 사용
  const { userInfo, loading: authLoading, isAuthenticated } = useAuth();

  const settingsItems = [
    // { title: '알림 설정', description: '가격 알림 및 뉴스 알림 설정' },
    { title: '테마 설정', description: '다크 모드 및 색상 설정' },
    { title: '개인정보 처리방침', description: '개인정보 보호 정책' },
    { title: '이용약관', description: '서비스 이용약관' },
    { title: '버전 정보', description: '앱 버전 1.0.0' },
  ];

  const handleSettingPress = (title: string) => {
    console.log(`${title} 설정을 눌렀습니다.`);
    // 실제 구현에서는 각 설정 화면으로 이동
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.content}>
        {/* 사용자 정보 카드 */}
        <Card style={[componentStyles.listItem, { marginBottom: 24 }]}>
          {authLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>사용자 정보 로딩 중...</Text>
            </View>
          ) : isAuthenticated && userInfo ? (
            <View style={styles.userInfoContainer}>
              {/* 프로필 이미지 */}
              <View style={styles.profileIcon}>
                {userInfo.profileImage ? (
                  <Image
                    source={{ uri: userInfo.profileImage }}
                    style={styles.profileImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={require('../assets/logo.png')}
                    style={styles.profileImage}
                    resizeMode="contain"
                  />
                )}
              </View>
              {/* 사용자 정보 */}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{userInfo.nickname}</Text>
                <Text style={styles.userEmail}>{userInfo.username}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.loginPromptContainer}>
              <View style={styles.profileIcon}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.profileImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.loginPromptText}>로그인이 필요합니다</Text>
              </View>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>로그인</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* 설정 섹션 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>설정</Text>
        </View>

        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSettingPress(item.title)}
          >
            <Card style={componentStyles.listItem}>
              <View>
                <Text style={componentStyles.listItemTitle}>{item.title}</Text>
                <Text style={componentStyles.listItemSubtitle}>
                  {item.description}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loginPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: 64,
    height: 64,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingLeft: 4,
  },
});

export default SettingsScreen;
