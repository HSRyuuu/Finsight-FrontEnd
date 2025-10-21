import AsyncStorage from '@react-native-async-storage/async-storage';

// 저장소 키
const STORAGE_KEYS = {
  USER_INFO: '@user_info',
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
} as const;

// 사용자 정보 타입
export interface UserInfo {
  id: number; // DB의 auto increment ID (무의미한 값)
  username: string; // 사용자 식별자 (로그인 ID)
  nickname: string; // 화면 표시용 이름
  profileImage?: string;
  createdAt?: string;
}

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
