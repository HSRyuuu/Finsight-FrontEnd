// API 응답 타입
export interface ApiResponse<T = any> {
  result: 'SUCCESS' | 'ERROR';
  statusCode: number;
  message: string;
  data: T;
}

// 주식/ETF 기본 정보
export interface Stock {
  symbol: string;
  name: string;
  exchange: 'KRX' | 'NASDAQ' | 'NYSE' | 'AMEX';
  stockType: 'STOCK' | 'ETF';
  currency: 'KRW' | 'USD';
  sector?: string;
  industry?: string;
}

// 주식 가격 정보
export interface StockPrice {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52Week: number;
  low52Week: number;
  lastUpdated: string;
  currency?: 'KRW' | 'USD';
}

// 캔들 차트 데이터
export interface CandleData {
  datetime: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  currency: string;
}

// 차트 기간 타입
export type ChartPeriod =
  | 'MIN1'
  | 'MIN5'
  | 'MIN15'
  | 'MIN30'
  | 'MIN45'
  | 'HOUR1'
  | 'HOUR2'
  | 'HOUR4'
  | 'DAY1'
  | 'WEEK1'
  | 'MONTH1';

// 즐겨찾기 종목
export interface FavoriteStock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  stockType: 'STOCK' | 'ETF';
  currency: string;
  addedAt: string;
  price?: StockPrice;
}

// 거래소 상태
export interface MarketStatus {
  exchange: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  nextOpenTime?: string;
  timezone: string;
}

// 검색 결과
export interface SearchResult {
  id: number;
  symbol: string;
  name: string;
  stockType: 'STOCK' | 'ETF';
  currency: string;
  exchange: string;
  micCode: string;
  country: string;
  figiCode: string;
  cfiCode: string;
  isin: string;
  cusip: string;
  metaData: any;
}

// 캔들 데이터 상태
export interface CandleStatus {
  symbol: string;
  ready: boolean;
  state: string;
  message: string;
}

// 환율 정보
export interface ExchangeRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  lastUpdated: string;
}

// 볼린저 밴드 정보
export interface BollingerBandsData {
  ready: boolean;
  signalType: 'BUY' | 'SELL' | 'NEUTRAL';
  currentPrice: number;
  upper: number;
  lower: number;
  middle: number;
}

// 네비게이션 타입
export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  StockDetail: { symbol: string; name: string };
};

export type SearchStackParamList = {
  SearchMain: undefined;
  StockDetail: { symbol: string; name: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

// 스타일 타입
export interface StyleSheet {
  [key: string]: any;
}

// 플랫폼 타입
export type Platform = 'ios' | 'android' | 'web';

// 테마 타입
export type Theme = 'light' | 'dark';
