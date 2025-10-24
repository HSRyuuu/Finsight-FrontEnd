import { apiService } from './api';
import { Watchlist } from '../types';

/**
 * 관심종목(Watchlist) 관련 API 서비스
 */
class WatchlistService {
  // 사용자 관심종목 그룹 조회 (로그인 필요)
  async getWatchlists(): Promise<Watchlist[]> {
    try {
      return await apiService.get<Watchlist[]>('/api/watchlist');
    } catch (error) {
      console.error('관심종목 조회 실패:', error);
      throw error;
    }
  }

  // 기본 관심종목 조회 (비로그인 사용자용)
  async getDefaultWatchlist(): Promise<Watchlist> {
    try {
      return await apiService.get<Watchlist>('/api/watchlist/default');
    } catch (error) {
      console.error('기본 관심종목 조회 실패:', error);
      throw error;
    }
  }

  // 관심종목 그룹 추가
  async addWatchlist(groupName: string): Promise<Watchlist> {
    try {
      return await apiService.post<Watchlist>('/api/watchlist', { groupName });
    } catch (error) {
      console.error('관심종목 그룹 추가 실패:', error);
      throw error;
    }
  }

  // 관심종목 그룹 수정
  async updateWatchlist(
    id: number,
    data: { groupName?: string; symbols?: string[] }
  ): Promise<Watchlist> {
    try {
      return await apiService.put<Watchlist>(`/api/watchlist/${id}`, data);
    } catch (error) {
      console.error('관심종목 그룹 수정 실패:', error);
      throw error;
    }
  }

  // 관심종목 그룹 삭제
  async deleteWatchlist(id: number): Promise<void> {
    try {
      await apiService.delete(`/api/watchlist/${id}`);
    } catch (error) {
      console.error('관심종목 그룹 삭제 실패:', error);
      throw error;
    }
  }

  // 관심종목 그룹에 종목 추가
  async addSymbolToWatchlist(id: number, symbol: string): Promise<Watchlist> {
    try {
      return await apiService.post<Watchlist>(`/api/watchlist/${id}/symbols`, {
        symbol,
      });
    } catch (error) {
      console.error('종목 추가 실패:', error);
      throw error;
    }
  }

  // 관심종목 그룹에서 종목 제거
  async removeSymbolFromWatchlist(
    id: number,
    symbol: string
  ): Promise<Watchlist> {
    try {
      return await apiService.delete<Watchlist>(
        `/api/watchlist/${id}/symbols/${symbol}`
      );
    } catch (error) {
      console.error('종목 제거 실패:', error);
      throw error;
    }
  }
}

export const watchlistService = new WatchlistService();
