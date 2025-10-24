import { useState, useEffect, useCallback } from 'react';
import { watchlistService } from '../services';
import { Watchlist } from '../types';
import { useAuth } from './useAuth';

/**
 * 관심종목 조회 훅 (로그인 상태에 따라 다른 API 호출)
 */
export const useWatchlist = () => {
  const { isAuthenticated } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // 로그인 상태: 사용자의 관심종목 그룹들 조회
        const data = await watchlistService.getWatchlists();
        setWatchlists(data);
      } else {
        // 비로그인 상태: 기본 관심종목(인기) 조회
        const defaultWatchlist = await watchlistService.getDefaultWatchlist();
        setWatchlists([defaultWatchlist]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '관심종목을 불러오는데 실패했습니다.'
      );
      setWatchlists([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const addWatchlist = async (groupName: string) => {
    try {
      if (!isAuthenticated) {
        throw new Error('로그인이 필요합니다.');
      }
      await watchlistService.addWatchlist(groupName);
      await fetchWatchlists();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '그룹 추가에 실패했습니다.'
      );
      throw err;
    }
  };

  const updateWatchlist = async (
    id: number,
    data: { groupName?: string; symbols?: string[] }
  ) => {
    try {
      if (!isAuthenticated) {
        throw new Error('로그인이 필요합니다.');
      }
      await watchlistService.updateWatchlist(id, data);
      await fetchWatchlists();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '그룹 수정에 실패했습니다.'
      );
      throw err;
    }
  };

  const deleteWatchlist = async (id: number) => {
    try {
      if (!isAuthenticated) {
        throw new Error('로그인이 필요합니다.');
      }
      await watchlistService.deleteWatchlist(id);
      await fetchWatchlists();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '그룹 삭제에 실패했습니다.'
      );
      throw err;
    }
  };

  const addSymbol = async (watchlistId: number, symbol: string) => {
    try {
      if (!isAuthenticated) {
        throw new Error('로그인이 필요합니다.');
      }
      await watchlistService.addSymbolToWatchlist(watchlistId, symbol);
      await fetchWatchlists();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '종목 추가에 실패했습니다.'
      );
      throw err;
    }
  };

  const removeSymbol = async (watchlistId: number, symbol: string) => {
    try {
      if (!isAuthenticated) {
        throw new Error('로그인이 필요합니다.');
      }
      await watchlistService.removeSymbolFromWatchlist(watchlistId, symbol);
      await fetchWatchlists();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '종목 제거에 실패했습니다.'
      );
      throw err;
    }
  };

  return {
    watchlists,
    loading,
    error,
    isAuthenticated,
    addWatchlist,
    updateWatchlist,
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
