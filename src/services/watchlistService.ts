import { apiService } from './api';
import { Watchlist, PopularStockItem } from '../types';

/**
 * 관심종목(Watchlist) 관련 API 서비스
 * 사용 가능한 API: 그룹 조회, popular 조회
 */
class WatchlistService {
  // 그룹 조회 API
  async getWatchlists(): Promise<Watchlist[]> {
    try {
      return await apiService.get<Watchlist[]>('/api/watchlist/groups');
    } catch (error) {
      console.error('관심종목 그룹 조회 실패:', error);
      throw error;
    }
  }

  // popular 조회 API (그룹 정보용 - 비로그인 시 사용)
  async getPopularStocks(): Promise<Watchlist[]> {
    try {
      return await apiService.get<Watchlist[]>('/api/watchlist/items/popular');
    } catch (error) {
      console.error('인기 종목 조회 실패:', error);
      throw error;
    }
  }

  // popular 아이템 조회 API (실제 종목 데이터)
  async getPopularItems(): Promise<PopularStockItem[]> {
    try {
      return await apiService.get<PopularStockItem[]>('/api/watchlist/items/popular');
    } catch (error) {
      console.error('인기 종목 아이템 조회 실패:', error);
      throw error;
    }
  }
}

export const watchlistService = new WatchlistService();
