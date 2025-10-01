import { useState, useEffect } from 'react';
import { stockService } from '../services';
import {
  Stock,
  SearchResult,
  StockPrice,
  CandleData,
  MarketStatus,
} from '../types';

// 종목 검색 훅
export const useStockSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchStocks = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await stockService.searchStocks(searchQuery);
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '종목 검색에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStocks(query);
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [query]);

  return {
    results,
    loading,
    error,
    searchStocks,
  };
};

// 종목 상세 정보 훅
export const useStock = (symbol: string) => {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async () => {
    if (!symbol) return;

    try {
      setLoading(true);
      setError(null);
      const data = await stockService.getStock(symbol);
      setStock(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '종목 정보를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [symbol]);

  return {
    stock,
    loading,
    error,
    refetch: fetchStock,
  };
};

// 종목 가격 정보 훅
export const useStockPrice = (symbol: string) => {
  const [price, setPrice] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    if (!symbol) return;

    try {
      setLoading(true);
      setError(null);
      const data = await stockService.getStockPrice(symbol);
      setPrice(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '가격 정보를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, [symbol]);

  return {
    price,
    loading,
    error,
    refetch: fetchPrice,
  };
};

// 캔들 차트 데이터 훅
export const useCandleData = (symbol: string, period: string) => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = async () => {
    if (!symbol || !period) return;

    try {
      setLoading(true);
      setError(null);
      const data = await stockService.getCandleData(symbol, period);
      setCandles(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '차트 데이터를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandles();
  }, [symbol, period]);

  return {
    candles,
    loading,
    error,
    refetch: fetchCandles,
  };
};

// 거래소 상태 훅
export const useMarketStatus = () => {
  const [status, setStatus] = useState<MarketStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockService.getMarketStatus();
      setStatus(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '거래소 상태를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
};
