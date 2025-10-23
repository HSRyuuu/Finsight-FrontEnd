import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { globalStyles } from '../styles';
import { Card, toastManager } from '../components';
import authService from '../services/authService';
import { useAuth } from '../hooks';

type LoginScreenNavigationProp = StackNavigationProp<any>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { refresh } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toastManager.show('아이디와 비밀번호를 모두 입력해주세요.', 'error');
      return;
    }

    setLoading(true);

    try {
      // 로그인 API 호출 및 토큰 저장
      const userInfo = await authService.loginWithApi(username, password);

      // useAuth 상태 갱신
      await refresh();

      // Toast 메시지 표시
      toastManager.show(`${userInfo.nickname}님 반가워요!`, 'success');

      // LoginScreen을 스택에서 제거하고 이전 화면(SettingsMain)으로 돌아감
      navigation.goBack();
    } catch (error: any) {
      toastManager.show(
        error.message || '아이디 또는 비밀번호를 확인해주세요.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.content}>
        <Card style={styles.loginCard}>
          {/* 로고 */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>핀사이트</Text>
            <Text style={styles.logoSubtext}>Financial Insight</Text>
          </View>

          {/* 아이디 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>아이디</Text>
            <TextInput
              style={styles.input}
              placeholder="아이디를 입력하세요"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleGoToRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>회원가입</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    letterSpacing: 1,
  },
  loginCard: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
