import { useState, useEffect } from 'react';
import { favoriteService } from '../services';
import { FavoriteStock, FavoriteGroup } from '../types';

// 즐겨찾기 목록 훅
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '즐겨찾기 목록을 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const addFavorite = async (stock: Omit<FavoriteStock, 'id' | 'addedAt'>) => {
    try {
      await favoriteService.addFavorite(stock);
      await fetchFavorites(); // 목록 새로고침
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '즐겨찾기 추가에 실패했습니다.'
      );
      throw err;
    }
  };

  const removeFavorite = async (symbol: string) => {
    try {
      await favoriteService.removeFavorite(symbol);
      await fetchFavorites(); // 목록 새로고침
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '즐겨찾기 제거에 실패했습니다.'
      );
      throw err;
    }
  };

  const updateFavorite = async (
    symbol: string,
    updates: Partial<FavoriteStock>
  ) => {
    try {
      await favoriteService.updateFavorite(symbol, updates);
      await fetchFavorites(); // 목록 새로고침
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '즐겨찾기 업데이트에 실패했습니다.'
      );
      throw err;
    }
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    updateFavorite,
    refetch: fetchFavorites,
  };
};

// 즐겨찾기 여부 확인 훅
export const useIsFavorite = (symbol: string) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const checkFavorite = async () => {
    if (!symbol) return;

    try {
      setLoading(true);
      const result = await favoriteService.isFavorite(symbol);
      setIsFavorite(result);
    } catch (error) {
      console.error('즐겨찾기 확인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFavorite();
  }, [symbol]);

  return {
    isFavorite,
    loading,
    refetch: checkFavorite,
  };
};

// 즐겨찾기 그룹 관리 훅
export const useFavoriteGroups = () => {
  const [groups, setGroups] = useState<FavoriteGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoriteService.getGroups();
      setGroups(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '그룹 목록을 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const addGroup = async (name: string) => {
    try {
      await favoriteService.addGroup(name);
      await fetchGroups();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '그룹 추가에 실패했습니다.'
      );
      throw err;
    }
  };

  const updateGroup = async (groupId: string, name: string) => {
    try {
      await favoriteService.updateGroup(groupId, name);
      await fetchGroups();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '그룹 수정에 실패했습니다.'
      );
      throw err;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await favoriteService.deleteGroup(groupId);
      await fetchGroups();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '그룹 삭제에 실패했습니다.'
      );
      throw err;
    }
  };

  return {
    groups,
    loading,
    error,
    addGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
};

// 그룹별 즐겨찾기 조회 훅
export const useFavoritesByGroup = (groupId: string) => {
  const [favorites, setFavorites] = useState<FavoriteStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoriteService.getFavoritesByGroup(groupId);
      setFavorites(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '즐겨찾기 목록을 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [groupId]);

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
  };
};
