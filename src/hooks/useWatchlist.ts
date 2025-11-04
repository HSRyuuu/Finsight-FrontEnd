import { useState, useEffect, useCallback, useRef } from 'react';
import { watchlistService } from '@/services';
import { Watchlist } from '@/types';
import { useAuth } from './useAuth';

/**
 * 관심종목 조회 훅 (읽기 전용 - 그룹 조회, popular 조회만 가능)
 */
export const useWatchlist = () => {
  const { isAuthenticated } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevAuthRef = useRef<boolean | null>(null);

  const fetchWatchlists = useCallback(async () => {
    // 이전 인증 상태와 같으면 중복 호출 방지
    if (prevAuthRef.current === isAuthenticated && watchlists.length > 0) {
      return;
    }
    prevAuthRef.current = isAuthenticated;

    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // 로그인 상태: 사용자의 관심종목 그룹들 조회
        const data = await watchlistService.getWatchlists();
        setWatchlists(data);
      } else {
        // 비로그인 상태: 인기 종목 조회
        const popularStocks = await watchlistService.getPopularStocks();
        setWatchlists(popularStocks);
      }
    } catch (err) {
      console.error('관심종목 조회 실패:', err);
      setError(
        err instanceof Error
          ? err.message
          : '관심종목을 불러오는데 실패했습니다.'
      );
      // 에러가 발생해도 빈 배열로 설정하여 화면이 보이도록 함
      setWatchlists([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, watchlists.length]);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  // 읽기 전용이므로 편집 관련 메서드들은 에러를 던지도록 함
  const addWatchlist = async (groupName: string) => {
    throw new Error('관심종목 편집 기능은 현재 사용할 수 없습니다.');
  };

  const updateWatchlist = async (
    id: number,
    data: { groupName?: string; symbols?: string[]; sortOrder?: number }
  ) => {
    throw new Error('관심종목 편집 기능은 현재 사용할 수 없습니다.');
  };

  const updateWatchlistsOrder = async (
    updates: Array<{ id: number; sortOrder: number }>
  ) => {
    throw new Error('관심종목 편집 기능은 현재 사용할 수 없습니다.');
  };

  const updateAllWatchlistGroups = async (
    groups: Array<{
      id?: number;
      groupName: string;
      symbols: string[];
      sortOrder: number;
    }>
  ) => {
    throw new Error('관심종목 편집 기능은 현재 사용할 수 없습니다.');
  };

  const deleteWatchlist = async (id: number) => {
    throw new Error('관심종목 편집 기능은 현재 사용할 수 없습니다.');
  };

  const addSymbol = async (watchlistId: number, symbol: string) => {
    throw new Error('관심종목 편집 기능은 현재 사용할 수 없습니다.');
  };

  const removeSymbol = async (watchlistId: number, symbol: string) => {
    throw new Error('관심종목 편집 기능은 현재 사용할 수 없습니다.');
  };

  return {
    watchlists,
    loading,
    error,
    isAuthenticated,
    addWatchlist,
    updateWatchlist,
    updateWatchlistsOrder,
    updateAllWatchlistGroups,
    deleteWatchlist,
    addSymbol,
    removeSymbol,
    refetch: fetchWatchlists,
  };
};

/**
 * 특정 관심종목 그룹의 종목 심볼 조회 훅
 */
export const useWatchlistSymbols = (watchlistId: number) => {
  const { watchlists, loading, error } = useWatchlist();

  const selectedWatchlist = watchlists.find(w => w.id === watchlistId);
  const symbols = selectedWatchlist?.symbols || [];

  return {
    symbols,
    watchlist: selectedWatchlist,
    loading,
    error,
  };
};
