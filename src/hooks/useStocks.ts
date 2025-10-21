import { useState, useEffect } from 'react';
import { stockService } from '../services';
import {
  Stock,
  SearchResult,
  StockPrice,
  CandleData,
  MarketStatus,
  CandleStatus,
  ExchangeRate,
  BollingerBandsData,
  RsiData,
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

// 캔들 데이터 상태 확인 훅
export const useCandleStatus = (symbol: string) => {
  const [status, setStatus] = useState<CandleStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async (shouldSetLoading: boolean = true) => {
    if (!symbol) return;

    try {
      if (shouldSetLoading) {
        setLoading(true);
      }
      setError(null);
      const data = await stockService.getCandleStatus(symbol);
      setStatus(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '캔들 상태를 확인하는데 실패했습니다.'
      );
      return null;
    } finally {
      if (shouldSetLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let attemptCount = 0;
    const delays = [500, 700, 1000]; // ms

    const pollStatus = async () => {
      // 첫 번째 조회는 loading 없이 실행
      const isFirstAttempt = attemptCount === 0;
      const result = await checkStatus(false);

      // ready가 true이면 성공
      if (result && result.ready) {
        setLoading(false); // 혹시 모를 loading 상태 정리
        return;
      }

      // 첫 번째 조회가 false였다면 이제 loading 시작
      if (isFirstAttempt) {
        setLoading(true);
      }

      // 실패했지만 아직 시도 횟수가 남았으면 재시도
      if (attemptCount < delays.length) {
        const delay = delays[attemptCount];
        attemptCount++;

        timeoutId = setTimeout(() => {
          pollStatus();
        }, delay);
      } else {
        // 3번 모두 실패
        setError('데이터를 수집하지 못했습니다.');
        setLoading(false);
      }
    };

    pollStatus();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [symbol]);

  return {
    status,
    loading,
    error,
    refetch: checkStatus,
  };
};

// 종목 상세 정보 훅
export const useStock = (symbol: string, shouldFetch: boolean = true) => {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async () => {
    if (!symbol || !shouldFetch) return;

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
    if (shouldFetch) {
      fetchStock();
    }
  }, [symbol, shouldFetch]);

  return {
    stock,
    loading,
    error,
    refetch: fetchStock,
  };
};

// 종목 가격 정보 훅
export const useStockPrice = (symbol: string, shouldFetch: boolean = true) => {
  const [price, setPrice] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    if (!symbol || !shouldFetch) return;

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
    if (shouldFetch) {
      fetchPrice();
    }
  }, [symbol, shouldFetch]);

  return {
    price,
    loading,
    error,
    refetch: fetchPrice,
  };
};

// 캔들 차트 데이터 훅
export const useCandleData = (
  symbol: string,
  period: string,
  shouldFetch: boolean = true
) => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = async () => {
    if (!symbol || !period || !shouldFetch) return;

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
    if (shouldFetch) {
      fetchCandles();
    }
  }, [symbol, period, shouldFetch]);

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

// 환율 조회 훅
export const useExchangeRate = (
  base: string = 'USD',
  quote: string = 'KRW'
) => {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockService.getExchangeRate(base, quote);
      setRate(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '환율 정보를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [base, quote]);

  return {
    rate,
    loading,
    error,
    refetch: fetchRate,
  };
};

// 볼린저 밴드 조회 훅
export const useBollingerBands = (
  symbol: string,
  shouldFetch: boolean = true
) => {
  const [data, setData] = useState<BollingerBandsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBollingerBands = async () => {
    if (!symbol || !shouldFetch) return;

    try {
      setLoading(true);
      setError(null);
      const result = await stockService.getBollingerBands(symbol);
      setData(result);

      // ready가 false인 경우 3초 후 재조회
      if (!result.ready) {
        setTimeout(() => {
          fetchBollingerBands();
        }, 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '볼린저 밴드를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetch) {
      fetchBollingerBands();
    }
  }, [symbol, shouldFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchBollingerBands,
  };
};

// RSI 조회 훅
export const useRsi = (symbol: string, shouldFetch: boolean = true) => {
  const [data, setData] = useState<RsiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRsi = async () => {
    if (!symbol || !shouldFetch) return;

    try {
      setLoading(true);
      setError(null);
      const result = await stockService.getRsi(symbol);
      setData(result);

      // ready가 false인 경우 1초 후 재조회
      if (!result.ready) {
        setTimeout(() => {
          fetchRsi();
        }, 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'RSI를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetch) {
      fetchRsi();
    }
  }, [symbol, shouldFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchRsi,
  };
};
