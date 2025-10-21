import { useState, useEffect, useCallback } from 'react';
import authService, { UserInfo } from '../services/authService';

/**
 * 인증 관련 커스텀 훅
 */
export const useAuth = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 사용자 정보 로드
  const loadUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      const user = await authService.getUserInfo();
      const authenticated = await authService.isAuthenticated();
      
      setUserInfo(user);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      setUserInfo(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  // 로그인
  const login = useCallback(
    async (token: string, refreshToken: string, user: UserInfo) => {
      try {
        await authService.login(token, refreshToken, user);
        setUserInfo(user);
        setIsAuthenticated(true);
        return { success: true };
      } catch (error) {
        console.error('로그인 실패:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '로그인 실패',
        };
      }
    },
    []
  );

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUserInfo(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('로그아웃 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '로그아웃 실패',
      };
    }
  }, []);

  // 사용자 정보 업데이트
  const updateUser = useCallback(
    async (updates: Partial<UserInfo>) => {
      try {
        await authService.updateUserInfo(updates);
        const updatedUser = await authService.getUserInfo();
        setUserInfo(updatedUser);
        return { success: true };
      } catch (error) {
        console.error('사용자 정보 업데이트 실패:', error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : '정보 업데이트 실패',
        };
      }
    },
    []
  );

  // 토큰 가져오기
  const getToken = useCallback(async () => {
    return await authService.getAuthToken();
  }, []);

  return {
    userInfo,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    getToken,
    refresh: loadUserInfo,
  };
};

