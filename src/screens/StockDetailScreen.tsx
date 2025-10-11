import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SearchStackParamList, ChartPeriod, CandleData } from '../types';
import {
  useCandleStatus,
  useStock,
  useStockPrice,
  useCandleData,
  useIsFavorite,
  useFavorites,
  useExchangeRate,
} from '../hooks';
import { globalStyles, componentStyles } from '../styles';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  CandlestickChart,
} from '../components';

type StockDetailScreenRouteProp = RouteProp<
  SearchStackParamList,
  'StockDetail'
>;

const StockDetailScreen: React.FC = () => {
  const route = useRoute<StockDetailScreenRouteProp>();
  const { symbol, name } = route.params;
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('DAY1');
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'KRW'>('USD');

  // 1단계: 캔들 상태 확인
  const {
    status: candleStatus,
    loading: statusLoading,
    error: statusError,
  } = useCandleStatus(symbol);

  // ready가 true일 때만 데이터 로드
  const isReady = candleStatus?.ready === true;

  // 2단계: ready=true일 때만 종목 상세 정보와 캔들 데이터 조회
  const {
    stock,
    loading: stockLoading,
    error: stockError,
  } = useStock(symbol, isReady);
  const {
    price,
    loading: priceLoading,
    error: priceError,
  } = useStockPrice(symbol);
  const {
    candles,
    loading: candlesLoading,
    error: candlesError,
  } = useCandleData(symbol, selectedPeriod, isReady);
  const { isFavorite, loading: favoriteLoading } = useIsFavorite(symbol);
  const { addFavorite, removeFavorite } = useFavorites();

  // 환율 정보 조회
  const { rate: exchangeRate } = useExchangeRate('USD', 'KRW');

  // 차트 데이터 - 달러와 원화 버전을 미리 계산
  const [candlesUSD, setCandlesUSD] = useState<CandleData[]>([]);
  const [candlesKRW, setCandlesKRW] = useState<CandleData[]>([]);

  // 차트 데이터가 로드되면 달러/원화 버전 모두 계산
  useEffect(() => {
    if (!candles || candles.length === 0) {
      setCandlesUSD([]);
      setCandlesKRW([]);
      return;
    }

    // 달러 버전 (원본)
    setCandlesUSD(candles);

    // 원화 버전 (환율 적용 + 소숫점 내림)
    if (exchangeRate && exchangeRate.rate) {
      const krwCandles = candles.map(candle => ({
        datetime: candle.datetime,
        time: candle.time,
        open: Math.floor(candle.open * exchangeRate.rate),
        high: Math.floor(candle.high * exchangeRate.rate),
        low: Math.floor(candle.low * exchangeRate.rate),
        close: Math.floor(candle.close * exchangeRate.rate),
        volume: candle.volume,
        currency: candle.currency,
      }));
      setCandlesKRW(krwCandles);
   
    } else {
      setCandlesKRW([]);
      console.log('환율 정보 없음 - KRW 변환 불가');
    }
  }, [candles, exchangeRate]);

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(symbol);
      } else {
        await addFavorite({
          symbol,
          name,
          exchange: stock?.exchange || 'KRX',
          stockType: stock?.stockType || 'STOCK',
          currency: stock?.currency || 'KRW',
        });
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  // 선택된 통화로 가격 표시
  const formatPriceInDisplayCurrency = (
    usdPrice: number,
    originalCurrency?: string
  ) => {
    // 원래 통화가 KRW인 경우 그대로 표시
    if (originalCurrency === 'KRW') {
      return `${Math.floor(usdPrice).toLocaleString()}원`;
    }

    // USD 가격인 경우 선택된 통화에 따라 변환
    if (displayCurrency === 'KRW' && exchangeRate) {
      const krwPrice = Math.floor(usdPrice * exchangeRate.rate);
      return `${krwPrice.toLocaleString()}원`;
    }

    return `$${usdPrice.toFixed(2)}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return '#FF3B30'; // 상승 - 빨간색 (한국 스타일)
    if (change < 0) return '#007AFF'; // 하락 - 파란색 (한국 스타일)
    return '#8E8E93'; // 보합 - 회색
  };

  const chartPeriods: { label: string; value: ChartPeriod }[] = [
    { label: '일', value: 'DAY1' },
    { label: '주', value: 'WEEK1' },
    { label: '월', value: 'MONTH1' },
    // { label: '1분', value: 'MIN1' },
    // { label: '5분', value: 'MIN5' },
    // { label: '15분', value: 'MIN15' },
    // { label: '30분', value: 'MIN30' },
    // { label: '45분', value: 'MIN45' },
    // { label: '1시간', value: 'HOUR1' },
    // { label: '2시간', value: 'HOUR2' },
    // { label: '4시간', value: 'HOUR4' },
  ];

  const renderPriceInfo = () => {
    if (priceLoading) {
      return (
        <Card style={globalStyles.centerContent}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={[globalStyles.textSmall, globalStyles.marginTop]}>
            가격 정보 로딩 중...
          </Text>
        </Card>
      );
    }

    if (priceError || !price) {
      return (
        <Card style={globalStyles.centerContent}>
          <ErrorMessage
            message={priceError || '가격 정보를 불러올 수 없습니다.'}
          />
        </Card>
      );
    }

    return (
      <Card style={[globalStyles.centerContent, globalStyles.marginBottom]}>
        <Text style={[globalStyles.textTitle, globalStyles.textCenter]}>
          {formatPriceInDisplayCurrency(price.currentPrice, price.currency)}
        </Text>
        <Text
          style={[
            globalStyles.textLarge,
            globalStyles.textCenter,
            { color: getPriceChangeColor(price.change) },
          ]}
        >
          {price.change > 0 ? '+' : ''}
          {formatPriceInDisplayCurrency(price.change, price.currency)} (
          {price.changePercent > 0 ? '+' : ''}
          {price.changePercent.toFixed(2)}%)
        </Text>
        <Text
          style={[
            globalStyles.textSmall,
            globalStyles.textCenter,
            globalStyles.marginTop,
          ]}
        >
          전일 종가:{' '}
          {formatPriceInDisplayCurrency(price.previousClose, price.currency)}
        </Text>
      </Card>
    );
  };

  const renderChartPeriodSelector = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <View style={[globalStyles.row, { flexWrap: 'wrap' }]}>
        {chartPeriods.map(period => (
          <TouchableOpacity
            key={period.value}
            onPress={() => setSelectedPeriod(period.value)}
            style={[
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor:
                  selectedPeriod === period.value ? '#1B3A57' : '#C6C6C8',
                backgroundColor:
                  selectedPeriod === period.value ? '#1B3A57' : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                globalStyles.textSmall,
                {
                  color:
                    selectedPeriod === period.value ? '#FFFFFF' : '#000000',
                  fontWeight: selectedPeriod === period.value ? '600' : '400',
                },
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderChart = () => {
    if (candlesLoading) {
      return (
        <Card style={globalStyles.centerContent}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={[globalStyles.textSmall, globalStyles.marginTop]}>
            차트 데이터 로딩 중...
          </Text>
        </Card>
      );
    }

    if (candlesError || !candles.length) {
      return (
        <Card style={globalStyles.centerContent}>
          <ErrorMessage
            message={candlesError || '차트 데이터를 불러올 수 없습니다.'}
          />
        </Card>
      );
    }

    // 선택된 통화에 따라 미리 계산된 데이터 사용
    const chartData = displayCurrency === 'KRW' ? candlesKRW : candlesUSD;

    // 데이터가 없으면 원본 사용
    const finalChartData = chartData.length > 0 ? chartData : candles;

    // Lightweight Charts 사용
    // key prop을 사용하여 통화가 변경되면 차트를 완전히 다시 렌더링
    return (
      <View style={{ marginBottom: 16, width: '100%' }}>
        <CandlestickChart
          key={`chart-${displayCurrency}-${selectedPeriod}`}
          data={finalChartData}
          height={300}
          timeframe={selectedPeriod === 'DAY1' ? 'day' : 'hour'}
          currency={displayCurrency}
        />
      </View>
    );
  };

  const renderStockInfo = () => {
    if (stockLoading) {
      return (
        <Card style={globalStyles.centerContent}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={[globalStyles.textSmall, globalStyles.marginTop]}>
            종목 정보 로딩 중...
          </Text>
        </Card>
      );
    }

    if (stockError || !stock) {
      return (
        <Card style={globalStyles.centerContent}>
          <ErrorMessage
            message={stockError || '종목 정보를 불러올 수 없습니다.'}
          />
        </Card>
      );
    }

    return (
      <Card>
        <View
          style={[
            globalStyles.row,
            globalStyles.spaceBetween,
            globalStyles.marginBottom,
          ]}
        >
          <Text style={globalStyles.textLarge}>종목 정보</Text>
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={{ padding: 8 }}
            disabled={favoriteLoading}
          >
            <Text style={[globalStyles.text, { fontSize: 20 }]}>
              {isFavorite ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            globalStyles.row,
            globalStyles.spaceBetween,
            globalStyles.marginBottom,
          ]}
        >
          <Text style={globalStyles.text}>심볼</Text>
          <Text style={globalStyles.text}>{stock.symbol}</Text>
        </View>

        <View
          style={[
            globalStyles.row,
            globalStyles.spaceBetween,
            globalStyles.marginBottom,
          ]}
        >
          <Text style={globalStyles.text}>거래소</Text>
          <Text style={globalStyles.text}>{stock.exchange}</Text>
        </View>

        <View
          style={[
            globalStyles.row,
            globalStyles.spaceBetween,
            globalStyles.marginBottom,
          ]}
        >
          <Text style={globalStyles.text}>타입</Text>
          <Text style={globalStyles.text}>{stock.stockType}</Text>
        </View>

        <View
          style={[
            globalStyles.row,
            globalStyles.spaceBetween,
            globalStyles.marginBottom,
          ]}
        >
          <Text style={globalStyles.text}>통화</Text>
          <Text style={globalStyles.text}>{stock.currency}</Text>
        </View>

        {stock.sector && (
          <View
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>섹터</Text>
            <Text style={globalStyles.text}>{stock.sector}</Text>
          </View>
        )}

        {stock.industry && (
          <View
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>산업</Text>
            <Text style={globalStyles.text}>{stock.industry}</Text>
          </View>
        )}

        {/* 추가 정보 섹션 */}
        <View style={[globalStyles.marginTop, { marginTop: 20 }]}>
          <Text style={[globalStyles.textLarge, globalStyles.marginBottom]}>
            추가 정보
          </Text>

          <View
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>52주 최고가</Text>
            <Text style={globalStyles.text}>
              {price?.high52Week
                ? formatPriceInDisplayCurrency(price.high52Week, price.currency)
                : 'N/A'}
            </Text>
          </View>

          <View
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>52주 최저가</Text>
            <Text style={globalStyles.text}>
              {price?.low52Week
                ? formatPriceInDisplayCurrency(price.low52Week, price.currency)
                : 'N/A'}
            </Text>
          </View>

          {/* <View
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>시가총액</Text>
            <Text style={globalStyles.text}>
              {price?.marketCap
                ? `${(price.marketCap / 1000000000).toFixed(1)}B`
                : 'N/A'}
            </Text>
          </View> */}

          <View
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>거래량</Text>
            <Text style={globalStyles.text}>
              {price?.volume ? price.volume.toLocaleString() : 'N/A'}
            </Text>
          </View>

          <View
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>마지막 업데이트</Text>
            <Text style={globalStyles.text}>
              {price?.lastUpdated
                ? new Date(price.lastUpdated).toLocaleString()
                : 'N/A'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  // 캔들 상태 확인 중
  if (statusLoading) {
    return <LoadingSpinner message="데이터 준비 상태를 확인하는 중..." />;
  }

  // 캔들 상태 확인 오류
  if (statusError) {
    return (
      <View style={globalStyles.centerContent}>
        <ErrorMessage message={statusError} />
      </View>
    );
  }

  // 캔들 데이터가 아직 준비되지 않음
  if (candleStatus && !candleStatus.ready) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[globalStyles.text, globalStyles.marginTop]}>
          {candleStatus.message || '데이터를 준비하고 있습니다...'}
        </Text>
        <Text style={[globalStyles.textSmall, globalStyles.marginTop]}>
          잠시만 기다려주세요. 자동으로 새로고침됩니다.
        </Text>
      </View>
    );
  }

  // 종목 정보 로딩 중
  if (stockLoading) {
    return <LoadingSpinner message="종목 정보를 불러오는 중..." />;
  }

  // 종목 정보 오류
  if (stockError) {
    return (
      <View style={globalStyles.centerContent}>
        <ErrorMessage message={stockError} />
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* 헤더: 종목명과 통화 토글 */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View
          style={[
            globalStyles.row,
            globalStyles.spaceBetween,
            { alignItems: 'center', marginBottom: 16 },
          ]}
        >
          <View style={{ flex: 1 }} />
          <Text
            style={[globalStyles.textTitle, { flex: 2, textAlign: 'center' }]}
          >
            {name}
          </Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {/* 통화 스위치 */}
            <View
              style={{
                flexDirection: 'row',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
                backgroundColor: '#F2F2F7',
                padding: 2,
              }}
            >
              <TouchableOpacity
                onPress={() => setDisplayCurrency('USD')}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor:
                    displayCurrency === 'USD' ? '#1B3A57' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: displayCurrency === 'USD' ? '#FFFFFF' : '#8E8E93',
                  }}
                >
                  $
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDisplayCurrency('KRW')}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor:
                    displayCurrency === 'KRW' ? '#1B3A57' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: displayCurrency === 'KRW' ? '#FFFFFF' : '#8E8E93',
                  }}
                >
                  원
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>{renderPriceInfo()}</View>

      {renderChartPeriodSelector()}
      {renderChart()}

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {renderStockInfo()}
      </View>
    </ScrollView>
  );
};

export default StockDetailScreen;
