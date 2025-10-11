import { apiService } from './api';
import {
  Stock,
  StockPrice,
  CandleData,
  SearchResult,
  MarketStatus,
  FavoriteStock,
  CandleStatus,
  ExchangeRate,
} from '../types';

export class StockService {
  // 종목 검색
  async searchStocks(query: string): Promise<SearchResult[]> {
    try {
      return await apiService.get<SearchResult[]>(
        `/api/stock/symbols/search?q=${encodeURIComponent(query)}`
      );
    } catch (error) {
      console.error('종목 검색 실패:', error);
      throw error;
    }
  }

  // 종목 상세 정보 조회
  async getStock(symbol: string): Promise<Stock> {
    try {
      return await apiService.get<Stock>(`/api/stock/symbols/${symbol}`);
    } catch (error) {
      console.error(`종목 ${symbol} 조회 실패:`, error);
      throw error;
    }
  }

  // 종목 가격 정보 조회
  async getStockPrice(symbol: string): Promise<StockPrice> {
    try {
      return await apiService.get<StockPrice>(
        `/api/stock/symbols/${symbol}/current-price`
      );
    } catch (error) {
      console.error(`종목 ${symbol} 가격 조회 실패:`, error);
      throw error;
    }
  }

  // 여러 종목 가격 정보 일괄 조회 (임시 비활성화)
  async getMultipleStockPrices(symbols: string[]): Promise<StockPrice[]> {
    // TODO: 실시간 가격 API 연동 시 주석 해제
    // try {
    //   return await apiService.post<StockPrice[]>('/api/stock/prices/batch', {
    //     symbols,
    //   });
    // } catch (error) {
    //   console.error('다중 종목 가격 조회 실패:', error);
    //   throw error;
    // }

    // 임시 데이터 반환
    return new Promise(resolve => {
      setTimeout(() => {
        const prices = symbols.map(symbol => ({
          symbol,
          currentPrice: Math.random() * 1000 + 100,
          previousClose: Math.random() * 1000 + 100,
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 10,
          volume: Math.floor(Math.random() * 1000000) + 100000,
          marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
          high52Week: Math.random() * 1000 + 100,
          low52Week: Math.random() * 1000 + 100,
          lastUpdated: new Date().toISOString(),
        }));
        resolve(prices);
      }, 300);
    });
  }

  // 캔들 데이터 상태 확인
  async getCandleStatus(symbol: string): Promise<CandleStatus> {
    try {
      return await apiService.get<CandleStatus>(
        `/api/stock/candles/${symbol}/status`
      );
    } catch (error) {
      console.error(`종목 ${symbol} 캔들 상태 조회 실패:`, error);
      throw error;
    }
  }

  // 캔들 차트 데이터 조회
  async getCandleData(symbol: string, period: string): Promise<CandleData[]> {
    try {
      // 백엔드 API에 맞는 파라미터 변환
      const timeFrame = this.convertPeriodToTimeFrame(period);
      return await apiService.get<CandleData[]>(
        `/api/stock/candles/${symbol}?tf=${timeFrame}`
      );
    } catch (error) {
      console.error(`종목 ${symbol} 차트 데이터 조회 실패:`, error);
      throw error;
    }
  }

  // 차트 기간을 백엔드 API 형식으로 변환 (enum.name() 사용)
  private convertPeriodToTimeFrame(period: string): string {
    // 백엔드에서 enum.name()을 사용하므로 대문자 값 그대로 전송
    const validPeriods = [
      'MIN1',
      'MIN5',
      'MIN15',
      'MIN30',
      'MIN45',
      'HOUR1',
      'HOUR2',
      'HOUR4',
      'DAY1',
      'WEEK1',
      'MONTH1',
    ];

    return validPeriods.includes(period) ? period : 'DAY1';
  }

  // 거래소 상태 조회
  async getMarketStatus(): Promise<MarketStatus[]> {
    try {
      return await apiService.get<MarketStatus[]>('/api/market/status');
    } catch (error) {
      console.error('거래소 상태 조회 실패:', error);
      throw error;
    }
  }

  // 인기 종목 조회
  async getPopularStocks(): Promise<Stock[]> {
    try {
      return await apiService.get<Stock[]>('/api/stock/popular');
    } catch (error) {
      console.error('인기 종목 조회 실패:', error);
      throw error;
    }
  }

  // 섹터별 종목 조회
  async getStocksBySector(sector: string): Promise<Stock[]> {
    try {
      return await apiService.get<Stock[]>(`/api/stock/sector/${sector}`);
    } catch (error) {
      console.error(`섹터 ${sector} 종목 조회 실패:`, error);
      throw error;
    }
  }

  // 환율 조회
  async getExchangeRate(
    base: string = 'USD',
    quote: string = 'KRW'
  ): Promise<ExchangeRate> {
    try {
      return await apiService.get<ExchangeRate>(
        `/api/exchange/current?base=${base}&quote=${quote}`
      );
    } catch (error) {
      console.error(`환율 ${base}/${quote} 조회 실패:`, error);
      throw error;
    }
  }
}

export const stockService = new StockService();
