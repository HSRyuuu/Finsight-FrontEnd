import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteStock, FavoriteGroup } from '@/types';

const FAVORITES_KEY = 'favorite_stocks';
const GROUPS_KEY = 'favorite_groups';
const DEFAULT_GROUP_ID = 'popular'; // 인기 그룹 (기본)

export class FavoriteService {
  // 즐겨찾기 목록 조회
  async getFavorites(): Promise<FavoriteStock[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('즐겨찾기 조회 실패:', error);
      return [];
    }
  }

  // 즐겨찾기 추가
  async addFavorite(
    stock: Omit<FavoriteStock, 'id' | 'addedAt'>
  ): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const newFavorite: FavoriteStock = {
        ...stock,
        id: `${stock.symbol}_${Date.now()}`,
        addedAt: new Date().toISOString(),
      };

      // 중복 체크
      const exists = favorites.some(fav => fav.symbol === stock.symbol);
      if (exists) {
        throw new Error('이미 즐겨찾기에 추가된 종목입니다.');
      }

      favorites.push(newFavorite);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      throw error;
    }
  }

  // 즐겨찾기 제거
  async removeFavorite(symbol: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter(fav => fav.symbol !== symbol);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(filteredFavorites)
      );
    } catch (error) {
      console.error('즐겨찾기 제거 실패:', error);
      throw error;
    }
  }

  // 즐겨찾기 여부 확인
  async isFavorite(symbol: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.symbol === symbol);
    } catch (error) {
      console.error('즐겨찾기 확인 실패:', error);
      return false;
    }
  }

  // 즐겨찾기 업데이트 (가격 정보 등)
  async updateFavorite(
    symbol: string,
    updates: Partial<FavoriteStock>
  ): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.map(fav =>
        fav.symbol === symbol ? { ...fav, ...updates } : fav
      );
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error('즐겨찾기 업데이트 실패:', error);
      throw error;
    }
  }

  // ========== 그룹 관리 ==========

  // 모든 그룹 조회
  async getGroups(): Promise<FavoriteGroup[]> {
    try {
      const groupsJson = await AsyncStorage.getItem(GROUPS_KEY);
      const groups = groupsJson ? JSON.parse(groupsJson) : [];

      // 기본 그룹이 없으면 생성
      if (groups.length === 0) {
        const defaultGroups: FavoriteGroup[] = [
          {
            id: DEFAULT_GROUP_ID,
            name: '인기',
            order: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'group1',
            name: '관심종목1',
            order: 1,
            createdAt: new Date().toISOString(),
          },
        ];
        await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(defaultGroups));
        return defaultGroups;
      }

      return groups.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('그룹 조회 실패:', error);
      return [];
    }
  }

  // 그룹 추가
  async addGroup(name: string): Promise<FavoriteGroup> {
    try {
      const groups = await this.getGroups();
      const maxOrder =
        groups.length > 0 ? Math.max(...groups.map(g => g.order)) : -1;

      const newGroup: FavoriteGroup = {
        id: `group_${Date.now()}`,
        name,
        order: maxOrder + 1,
        createdAt: new Date().toISOString(),
      };

      groups.push(newGroup);
      await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
      return newGroup;
    } catch (error) {
      console.error('그룹 추가 실패:', error);
      throw error;
    }
  }

  // 그룹 수정
  async updateGroup(groupId: string, name: string): Promise<void> {
    try {
      const groups = await this.getGroups();
      const updatedGroups = groups.map(g =>
        g.id === groupId ? { ...g, name } : g
      );
      await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));
    } catch (error) {
      console.error('그룹 수정 실패:', error);
      throw error;
    }
  }

  // 그룹 삭제
  async deleteGroup(groupId: string): Promise<void> {
    try {
      // 기본 그룹(인기)은 삭제 불가
      if (groupId === DEFAULT_GROUP_ID) {
        throw new Error('기본 그룹은 삭제할 수 없습니다.');
      }

      const groups = await this.getGroups();
      const filteredGroups = groups.filter(g => g.id !== groupId);
      await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(filteredGroups));

      // 해당 그룹에 속한 종목들의 groupId를 null로 변경
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.map(fav =>
        fav.groupId === groupId ? { ...fav, groupId: undefined } : fav
      );
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error('그룹 삭제 실패:', error);
      throw error;
    }
  }

  // 그룹별 즐겨찾기 조회
  async getFavoritesByGroup(groupId: string): Promise<FavoriteStock[]> {
    try {
      const favorites = await this.getFavorites();
      if (groupId === DEFAULT_GROUP_ID) {
        // '인기' 그룹은 모든 종목 표시
        return favorites;
      }
      return favorites.filter(fav => fav.groupId === groupId);
    } catch (error) {
      console.error('그룹별 즐겨찾기 조회 실패:', error);
      return [];
    }
  }

  // 종목을 특정 그룹에 추가
  async addFavoriteToGroup(
    stock: Omit<FavoriteStock, 'id' | 'addedAt'>,
    groupId?: string
  ): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const newFavorite: FavoriteStock = {
        ...stock,
        id: `${stock.symbol}_${Date.now()}`,
        addedAt: new Date().toISOString(),
        groupId,
      };

      // 중복 체크
      const exists = favorites.some(fav => fav.symbol === stock.symbol);
      if (exists) {
        throw new Error('이미 즐겨찾기에 추가된 종목입니다.');
      }

      favorites.push(newFavorite);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      throw error;
    }
  }

  // 종목의 그룹 변경
  async moveFavoriteToGroup(symbol: string, groupId?: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.map(fav =>
        fav.symbol === symbol ? { ...fav, groupId } : fav
      );
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error('종목 그룹 변경 실패:', error);
      throw error;
    }
  }
}

export const favoriteService = new FavoriteService();
