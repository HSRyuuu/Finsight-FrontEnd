import { apiService } from './api';

// 중복체크 응답 타입
interface CheckDuplicateResponse {
  exists: boolean;
}

// 회원가입 요청 타입
interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
  email: string;
}

// 회원가입 응답 타입
interface SignupResponse {
  id: number;
  username: string;
  nickname: string;
  email: string;
}

class MemberService {
  /**
   * 아이디 중복 체크
   */
  async checkUsername(username: string): Promise<boolean> {
    try {
      const response = await apiService.get<CheckDuplicateResponse>(
        `/api/members/check/username`,
        { params: { username } }
      );
      return response.exists;
    } catch (error) {
      console.error('아이디 중복 체크 실패:', error);
      throw error;
    }
  }

  /**
   * 닉네임 중복 체크
   */
  async checkNickname(nickname: string): Promise<boolean> {
    try {
      const response = await apiService.get<CheckDuplicateResponse>(
        `/api/members/check/nickname`,
        { params: { nickname } }
      );
      return response.exists;
    } catch (error) {
      console.error('닉네임 중복 체크 실패:', error);
      throw error;
    }
  }

  /**
   * 이메일 중복 체크
   */
  async checkEmail(email: string): Promise<boolean> {
    try {
      const response = await apiService.get<CheckDuplicateResponse>(
        `/api/members/check/email`,
        { params: { email } }
      );
      return response.exists;
    } catch (error) {
      console.error('이메일 중복 체크 실패:', error);
      throw error;
    }
  }

  /**
   * 회원가입
   */
  async signup(request: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await apiService.post<SignupResponse>(
        `/api/members/signup`,
        request
      );
      return response;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  }
}

export const memberService = new MemberService();
