import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteStock } from '../types';

const FAVORITES_KEY = 'favorite_stocks';

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
}

export const favoriteService = new FavoriteService();
