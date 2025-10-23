import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { ApiResponse } from '../types';
import authService from './authService';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.instance.interceptors.request.use(
      async config => {
        // 토큰이 있다면 헤더에 추가
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async error => {
        // 에러 처리
        if (error.response?.status === 401) {
          // 토큰 만료 시 로그아웃 처리
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private async getToken(): Promise<string | null> {
    // authService를 통해 토큰 조회
    return await authService.getAuthToken();
  }

  private async clearToken(): Promise<void> {
    // authService를 통해 로그아웃 처리
    await authService.logout();
  }

  // GET 요청
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // POST 요청
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data.data;
  }

  // PUT 요청
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // DELETE 요청
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // PATCH 요청
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data.data;
  }
}

export const apiService = new ApiService();
