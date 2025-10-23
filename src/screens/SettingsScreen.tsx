import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { globalStyles, componentStyles } from '../styles';
import { Card, toastManager, ConfirmModal } from '../components';
import { useAuth } from '../hooks';
import authService from '../services/authService';

type SettingsScreenNavigationProp = StackNavigationProp<any>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  // 인증 훅 사용
  const {
    userInfo,
    loading: authLoading,
    isAuthenticated,
    logout,
    refresh,
  } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 화면이 포커스될 때마다 사용자 정보 새로 로드
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

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

  const handleLogoutClick = () => {
    console.log('🔵 로그아웃 버튼 클릭됨');
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    console.log('🔵 로그아웃 확인됨');
    setShowLogoutModal(false);
    setIsLoggingOut(true);

    try {
      console.log('🔵 로그아웃 API 호출 시작');
      // 로그아웃 API 호출 (내부에서 storage 삭제 처리)
      const success = await authService.logoutWithApi();

      if (success) {
        console.log('✅ 로그아웃 완료');
        toastManager.show('로그아웃되었습니다.', 'success');
        // 사용자 정보 갱신 (로그아웃 상태로 변경)
        await refresh();
      }
    } catch (error: any) {
      console.error('❌ 로그아웃 실패:', error);
      toastManager.show(
        error.message || '로그아웃 중 오류가 발생했습니다.',
        'error'
      );
    } finally {
      setIsLoggingOut(false);
      console.log('🔵 로그아웃 프로세스 종료');
    }
  };

  const handleLogoutCancel = () => {
    console.log('🔵 로그아웃 취소됨');
    setShowLogoutModal(false);
  };

  const handleDeleteAccount = () => {
    // TODO: 회원 탈퇴 API 구현
    toastManager.show('회원 탈퇴 기능은 준비 중입니다.', 'info');
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
                <Text style={styles.userEmail}>{userInfo.email}</Text>
                <Text style={styles.userRole}>{userInfo.username}</Text>
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

        {/* 계정 관리 - 로그인 상태일 때만 표시 */}
        {isAuthenticated && userInfo && (
          <View style={styles.accountManagementContainer}>
            {/* 로그아웃 버튼 */}
            <TouchableOpacity
              onPress={handleLogoutClick}
              disabled={isLoggingOut}
              style={styles.smallButtonContainer}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#8E8E93" />
              ) : (
                <Text style={styles.logoutButtonText}>로그아웃</Text>
              )}
            </TouchableOpacity>

            {/* 회원 탈퇴 링크 */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={isLoggingOut}
              style={styles.deleteAccountLink}
            >
              <Text style={styles.deleteAccountText}>회원 탈퇴</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 로그아웃 확인 모달 */}
      <ConfirmModal
        visible={showLogoutModal}
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
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
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
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
  accountManagementContainer: {
    marginTop: 32,
    marginBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  smallButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteAccountLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteAccountText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;
