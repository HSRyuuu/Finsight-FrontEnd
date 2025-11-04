import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  ApiResponse,
  UserInfo,
} from '@/types';
import { API_BASE_URL } from '@/utils/constants';
import { apiService } from './api';

// 저장소 키
const STORAGE_KEYS = {
  USER_INFO: '@user_info',
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
} as const;

// 인증 서비스
class AuthService {
  /**
   * 사용자 정보 저장
   */
  async saveUserInfo(userInfo: UserInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_INFO,
        JSON.stringify(userInfo)
      );
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      throw new Error('사용자 정보를 저장할 수 없습니다.');
    }
  }

  /**
   * 사용자 정보 조회
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfoString = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (!userInfoString) return null;
      return JSON.parse(userInfoString) as UserInfo;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  }

  /**
   * 인증 토큰 저장
   */
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('토큰 저장 실패:', error);
      throw new Error('토큰을 저장할 수 없습니다.');
    }
  }

  /**
   * 인증 토큰 조회
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('토큰 조회 실패:', error);
      return null;
    }
  }

  /**
   * Refresh 토큰 저장
   */
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Refresh 토큰 저장 실패:', error);
      throw new Error('Refresh 토큰을 저장할 수 없습니다.');
    }
  }

  /**
   * Refresh 토큰 조회
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Refresh 토큰 조회 실패:', error);
      return null;
    }
  }

  /**
   * 로그인 (토큰과 사용자 정보 저장)
   */
  async login(
    token: string,
    refreshToken: string,
    userInfo: UserInfo
  ): Promise<void> {
    try {
      await Promise.all([
        this.saveAuthToken(token),
        this.saveRefreshToken(refreshToken),
        this.saveUserInfo(userInfo),
      ]);
    } catch (error) {
      console.error('로그인 정보 저장 실패:', error);
      throw new Error('로그인 정보를 저장할 수 없습니다.');
    }
  }

  /**
   * 로그아웃 (모든 인증 정보 삭제)
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_INFO,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw new Error('로그아웃 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 로그인 상태 확인
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      return !!token;
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      return false;
    }
  }

  /**
   * 로그인 API 호출
   */
  async loginWithApi(username: string, password: string): Promise<UserInfo> {
    try {
      const loginData: LoginRequest = { username, password };

      // 로그인 API는 토큰이 필요 없으므로 axios를 직접 사용
      const { data } = await axios.post<ApiResponse<LoginResponse>>(
        `${API_BASE_URL}/api/auth/login`,
        loginData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      // accessToken 저장
      await this.saveAuthToken(data.data.accessToken);

      // 응답에서 받은 사용자 정보 저장
      const userInfo = data.data.userInfo;
      await this.saveUserInfo(userInfo);

      return userInfo;
    } catch (error: any) {
      console.error('로그인 API 호출 실패:', error);

      // 에러 메시지 처리
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error(
        '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'
      );
    }
  }

  /**
   * 로그아웃 API 호출
   */
  async logoutWithApi(): Promise<boolean> {
    try {
      // 토큰이 필요한 GET 요청이므로 apiService 사용
      const response = await apiService.get<LogoutResponse>('/api/auth/logout');
      console.log('로그아웃 API 호출 성공:', response);

      // success = true 확인
      if (response.success) {
        console.log('✅ 로그아웃 성공, storage 삭제 시작');
        // storage에서 모든 인증 정보 삭제
        await this.logout();
        console.log('✅ storage 삭제 완료');
        return true;
      } else {
        console.error('❌ 로그아웃 실패: success = false');
        throw new Error('로그아웃에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('로그아웃 API 호출 실패:', error);

      // 에러 메시지 처리
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('로그아웃 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUserInfo(updates: Partial<UserInfo>): Promise<void> {
    try {
      const currentInfo = await this.getUserInfo();
      if (!currentInfo) {
        throw new Error('저장된 사용자 정보가 없습니다.');
      }
      const updatedInfo = { ...currentInfo, ...updates };
      await this.saveUserInfo(updatedInfo);
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 저장된 데이터 조회 (디버깅용)
   */
  async getAllStoredData(): Promise<Record<string, string | null>> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const values = await AsyncStorage.multiGet(keys);
      return Object.fromEntries(values);
    } catch (error) {
      console.error('저장된 데이터 조회 실패:', error);
      return {};
    }
  }
}

// 싱글톤 인스턴스
const authService = new AuthService();

export default authService;
