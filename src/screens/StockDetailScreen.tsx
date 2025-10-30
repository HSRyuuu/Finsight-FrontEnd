import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
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
  useBollingerBands,
  useRsi,
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
  const [selectedTab, setSelectedTab] = useState<
    'chart' | 'info' | 'community'
  >('chart');
  const [indicatorModalVisible, setIndicatorModalVisible] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<{
    name: string;
    description: React.ReactNode;
  } | null>(null);
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

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
  } = useStockPrice(symbol, isReady);
  const {
    candles,
    loading: candlesLoading,
    error: candlesError,
  } = useCandleData(symbol, selectedPeriod, isReady);
  const { isFavorite, loading: favoriteLoading } = useIsFavorite(symbol);
  const { addFavorite, removeFavorite } = useFavorites();

  // 환율 정보 조회
  const { rate: exchangeRate, loading: exchangeRateLoading } = useExchangeRate(
    'USD',
    'KRW'
  );

  // 기술적 지표 조회 - 차트 데이터가 로드된 후에만 조회
  const shouldFetchIndicators =
    isReady && !candlesLoading && candles.length > 0;

  // 볼린저 밴드 조회
  const {
    data: bollingerData,
    loading: bollingerLoading,
    error: bollingerError,
  } = useBollingerBands(symbol, shouldFetchIndicators);

  // RSI 조회
  const {
    data: rsiData,
    loading: rsiLoading,
    error: rsiError,
  } = useRsi(symbol, shouldFetchIndicators);

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
    // { label: '주', value: 'WEEK1' },
    // { label: '월', value: 'MONTH1' },
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

    // 주 가격과 보조 가격 계산
    const isUSD = price.currency === 'USD' || !price.currency;

    let mainPrice: string;
    let subPrice: string | null = null;

    if (isUSD && exchangeRate) {
      // USD 종목인 경우
      if (displayCurrency === 'KRW') {
        // 원화 선택: 원화가 메인, 달러가 보조
        mainPrice = `${Math.floor(price.currentPrice * exchangeRate.rate).toLocaleString()}원`;
        subPrice = `$${price.currentPrice.toFixed(2)}`;
      } else {
        // 달러 선택: 달러가 메인, 원화가 보조
        mainPrice = `$${price.currentPrice.toFixed(2)}`;
        subPrice = `${Math.floor(price.currentPrice * exchangeRate.rate).toLocaleString()}원`;
      }
    } else {
      // KRW 종목 또는 환율 정보 없음
      mainPrice =
        price.currency === 'KRW'
          ? `${Math.floor(price.currentPrice).toLocaleString()}원`
          : `$${price.currentPrice.toFixed(2)}`;
    }

    return (
      <Card style={[globalStyles.marginBottom, { position: 'relative' }]}>
        {/* 상단: 종목명 + 즐겨찾기 버튼 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View
            style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline' }}
          >
            {/* 종목명 */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#000',
                marginRight: 8,
              }}
            >
              {name}
            </Text>
            {/* 심볼 */}
            <Text
              style={{
                fontSize: 14,
                color: '#8E8E93',
              }}
            >
              {symbol}
            </Text>
          </View>

          {/* 즐겨찾기 버튼 */}
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={{ padding: 8 }}
            disabled={favoriteLoading}
          >
            <Text style={{ fontSize: 24 }}>{isFavorite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* 통화 스위치 - 오른쪽 아래 */}
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 1,
          }}
        >
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

        {/* 가격 정보 - 왼쪽 정렬 */}
        <View style={{ alignItems: 'flex-start' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              marginBottom: 4,
            }}
          >
            <Text style={[globalStyles.textTitle]}>{mainPrice}</Text>
            {subPrice && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#8E8E93',
                  marginLeft: 8,
                }}
              >
                {subPrice}
              </Text>
            )}
          </View>
          <Text
            style={[
              globalStyles.textLarge,
              {
                color: getPriceChangeColor(price.change),
                marginBottom: 8,
              },
            ]}
          >
            {price.change > 0 ? '+' : price.change < 0 ? '-' : ''}
            {formatPriceInDisplayCurrency(
              Math.abs(price.change),
              price.currency
            )}{' '}
            ({price.changePercent > 0 ? '+' : ''}
            {price.changePercent.toFixed(2)}%)
          </Text>
          <Text style={[globalStyles.textSmall]}>
            전일 종가:{' '}
            {formatPriceInDisplayCurrency(price.previousClose, price.currency)}
          </Text>
        </View>
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
        {/* 지표 토글 버튼들 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 16,
            marginBottom: 8,
            gap: 8,
          }}
        >
          {/* 볼린저 밴드 토글 */}
          <TouchableOpacity
            onPress={() => setShowBollingerBands(!showBollingerBands)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: showBollingerBands ? '#FF9500' : '#C6C6C8',
              backgroundColor: showBollingerBands
                ? 'rgba(255, 149, 0, 0.1)'
                : 'transparent',
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: '#FF9500',
                backgroundColor: showBollingerBands ? '#FF9500' : 'transparent',
                marginRight: 6,
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: showBollingerBands ? '#FF9500' : '#8E8E93',
              }}
            >
              BB
            </Text>
          </TouchableOpacity>

          {/* RSI 토글 */}
          <TouchableOpacity
            onPress={() => setShowRSI(!showRSI)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: showRSI ? '#9747FF' : '#C6C6C8',
              backgroundColor: showRSI
                ? 'rgba(151, 71, 255, 0.1)'
                : 'transparent',
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: '#9747FF',
                backgroundColor: showRSI ? '#9747FF' : 'transparent',
                marginRight: 6,
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: showRSI ? '#9747FF' : '#8E8E93',
              }}
            >
              RSI
            </Text>
          </TouchableOpacity>
        </View>

        <CandlestickChart
          key={`chart-${displayCurrency}-${selectedPeriod}-${showBollingerBands}-${showRSI}`}
          data={finalChartData}
          height={300}
          timeframe={selectedPeriod === 'DAY1' ? 'day' : 'hour'}
          currency={displayCurrency}
          showBollingerBands={showBollingerBands}
          showRSI={showRSI}
        />
      </View>
    );
  };

  // 기술적 지표 설명 모달 열기
  const openIndicatorModal = (name: string, description: React.ReactNode) => {
    setSelectedIndicator({ name, description });
    setIndicatorModalVisible(true);
  };

  // 기술적 지표 렌더링
  const renderTechnicalIndicators = () => {
    // 신호 타입 매핑
    type SignalCategory =
      | 'bullish'
      | 'bearish'
      | 'neutral'
      | 'buy_signal'
      | 'sell_signal';

    const signalMap: Record<string, { signal: SignalCategory; text: string }> =
      {
        BULLISH: { signal: 'bullish', text: '강세 유지' },
        BEARISH: { signal: 'bearish', text: '약세 전환' },
        NEUTRAL: { signal: 'neutral', text: '중립' },
        BUY_SIGNAL: { signal: 'buy_signal', text: '과매도 구간' },
        SELL_SIGNAL: { signal: 'sell_signal', text: '과매수 구간' },
      };

    // RSI 지표 생성
    const getRsiIndicator = () => {
      const baseDescription = (
        <View>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            RSI(Relative Strength Index)는 주가의 상승 압력과 하락 압력 간의
            상대적인 강도를 나타내는 지표입니다.
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: '#3C3C43',
              lineHeight: 22,
              marginTop: 12,
            }}
          >
            📊 RSI 구간별 의미:
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 0~30: 과매도 구간 - 반등 관찰 시점
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 30~45: 약세 전환 - 하락 모멘텀 확인 필요
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 45~55: 중립 - 방향성 관찰 구간
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 55~70: 강세 유지 - 상승 추세 지속 중
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 70~100: 과매수 구간 - 조정 가능성 관찰
          </Text>
        </View>
      );

      if (rsiLoading || !rsiData?.ready) {
        return {
          name: 'RSI',
          fullName: 'Relative Strength Index',
          value: null,
          signal: 'neutral' as SignalCategory,
          signalText: '계산 중',
          description: baseDescription,
          explanation: '데이터를 준비하고 있습니다. 잠시만 기다려주세요.',
          details: null,
          isLoading: true,
        };
      }

      if (rsiError || !rsiData) {
        return {
          name: 'RSI',
          fullName: 'Relative Strength Index',
          value: null,
          signal: 'neutral' as SignalCategory,
          signalText: '오류',
          description: baseDescription,
          explanation: '데이터를 불러오는데 실패했습니다.',
          details: null,
          isLoading: false,
        };
      }

      // 실제 데이터로 지표 생성
      const { signal, text } =
        signalMap[rsiData.signalType] || signalMap.NEUTRAL;

      const getExplanation = () => {
        const rsi = rsiData.rsi;
        const type = rsiData.signalType;

        if (type === 'BUY_SIGNAL' || rsi < 30) {
          return `RSI ${rsi.toFixed(2)} - 과매도 구간입니다. 반등 가능성을 관찰하되, 하락 추세 지속 여부도 함께 확인하세요.`;
        } else if (type === 'BEARISH' || (rsi >= 30 && rsi < 45)) {
          return `RSI ${rsi.toFixed(2)} - 약세 구간입니다. 하락 모멘텀이 지속되고 있으나, 반전 신호도 함께 확인하세요.`;
        } else if (type === 'NEUTRAL' || (rsi >= 45 && rsi < 55)) {
          return `RSI ${rsi.toFixed(2)} - 중립 구간입니다. 매수세와 매도세가 균형을 이루고 있으며, 방향성 확인이 필요합니다.`;
        } else if (type === 'BULLISH' || (rsi >= 55 && rsi < 70)) {
          return `RSI ${rsi.toFixed(2)} - 강세 구간입니다. 상승 추세가 유지되고 있으며, 매수세가 우세한 상태입니다.`;
        } else if (type === 'SELL_SIGNAL' || rsi >= 70) {
          return `RSI ${rsi.toFixed(2)} - 과매수 구간입니다. 단기 조정 가능성이 있으나, 강한 상승 추세 중일 수도 있으니 추세 지속성을 확인하세요.`;
        }
        return `RSI ${rsi.toFixed(2)} - 중립 구간입니다.`;
      };

      const getDescription = () => {
        const rsi = rsiData.rsi;
        const type = rsiData.signalType;

        // 현재 구간 판단
        let currentRange = '';
        let signalText = '';
        let signalColor = '#8E8E93';

        if (rsi < 30) {
          currentRange = '0~30';
          signalText = '과매도 구간';
          signalColor = '#FF3B30';
        } else if (rsi >= 30 && rsi < 45) {
          currentRange = '30~45';
          signalText = '약세 전환';
          signalColor = '#007AFF';
        } else if (rsi >= 45 && rsi < 55) {
          currentRange = '45~55';
          signalText = '중립';
          signalColor = '#8E8E93';
        } else if (rsi >= 55 && rsi < 70) {
          currentRange = '55~70';
          signalText = '강세 유지';
          signalColor = '#FF3B30';
        } else if (rsi >= 70) {
          currentRange = '70~100';
          signalText = '과매수 구간';
          signalColor = '#007AFF';
        }

        return (
          <View>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              RSI(Relative Strength Index)는 주가의 상승 압력과 하락 압력 간의
              상대적인 강도를 나타내는 지표입니다.
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#3C3C43',
                lineHeight: 22,
                marginTop: 12,
              }}
            >
              📊 RSI 구간별 의미:
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              •{' '}
              <Text
                style={{ fontWeight: currentRange === '0~30' ? '700' : '400' }}
              >
                0~30
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '0~30' ? '700' : '400',
                  color: currentRange === '0~30' ? '#FF3B30' : '#3C3C43',
                }}
              >
                과매도 구간
              </Text>{' '}
              - 반등 관찰 시점
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              •{' '}
              <Text
                style={{ fontWeight: currentRange === '30~45' ? '700' : '400' }}
              >
                30~45
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '30~45' ? '700' : '400',
                  color: currentRange === '30~45' ? '#007AFF' : '#3C3C43',
                }}
              >
                약세 전환
              </Text>{' '}
              - 하락 모멘텀 확인 필요
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              •{' '}
              <Text
                style={{ fontWeight: currentRange === '45~55' ? '700' : '400' }}
              >
                45~55
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '45~55' ? '700' : '400',
                  color: currentRange === '45~55' ? '#8E8E93' : '#3C3C43',
                }}
              >
                중립
              </Text>{' '}
              - 방향성 관찰 구간
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              •{' '}
              <Text
                style={{ fontWeight: currentRange === '55~70' ? '700' : '400' }}
              >
                55~70
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '55~70' ? '700' : '400',
                  color: currentRange === '55~70' ? '#FF3B30' : '#3C3C43',
                }}
              >
                강세 유지
              </Text>{' '}
              - 상승 추세 지속 중
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              •{' '}
              <Text
                style={{
                  fontWeight: currentRange === '70~100' ? '700' : '400',
                }}
              >
                70~100
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '70~100' ? '700' : '400',
                  color: currentRange === '70~100' ? '#007AFF' : '#3C3C43',
                }}
              >
                과매수 구간
              </Text>{' '}
              - 조정 가능성 관찰
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#3C3C43',
                lineHeight: 22,
                marginTop: 12,
              }}
            >
              현재 RSI는{' '}
              <Text style={{ fontWeight: '700' }}>{rsi.toFixed(2)}</Text>입니다.
            </Text>
          </View>
        );
      };

      return {
        name: 'RSI',
        fullName: 'Relative Strength Index',
        value: rsiData.rsi,
        signal,
        signalText: text,
        description: getDescription(),
        explanation: getExplanation(),
        details: null,
        isLoading: false,
      };
    };

    // 볼린저 밴드 지표 생성
    const getBollingerIndicator = () => {
      const baseDescription = (
        <View>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            볼린저 밴드는 가격의 변동성을 측정하는 지표입니다. 이동평균선을
            중심으로 상단과 하단 밴드를 그려 가격의 위치를 파악합니다.
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: '#3C3C43',
              lineHeight: 22,
              marginTop: 12,
            }}
          >
            📊 위치별 의미:
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 하단 밴드 근처 (0~30%): 단기 과매도 - 반등 관찰 구간
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 중심 영역 (30~70%): 중립 - 안정적인 흐름, 추세 관찰
          </Text>
          <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
            • 상단 밴드 근처 (70~100%): 단기 과매수 - 조정 가능성 관찰
          </Text>
        </View>
      );

      if (bollingerLoading || !bollingerData?.ready) {
        return {
          name: '볼린저 밴드',
          fullName: 'Bollinger Bands',
          value: null,
          signal: 'neutral' as SignalCategory,
          signalText: '계산 중',
          description: baseDescription,
          explanation: '데이터를 준비하고 있습니다. 잠시만 기다려주세요.',
          details: null,
          isLoading: true,
        };
      }

      if (bollingerError || !bollingerData) {
        return {
          name: '볼린저 밴드',
          fullName: 'Bollinger Bands',
          value: null,
          signal: 'neutral' as SignalCategory,
          signalText: '오류',
          description: baseDescription,
          explanation: '데이터를 불러오는데 실패했습니다.',
          details: null,
          isLoading: false,
        };
      }

      // 실제 데이터로 지표 생성
      const { signal, text } =
        signalMap[bollingerData.signalType] || signalMap.NEUTRAL;

      const getExplanation = () => {
        const type = bollingerData.signalType;
        const current = bollingerData.currentPrice;
        const upper = bollingerData.upper;
        const lower = bollingerData.lower;

        // 볼린저 밴드 내 위치 계산 (0~100%)
        const position = ((current - lower) / (upper - lower)) * 100;

        if (type === 'BUY_SIGNAL') {
          return `가격이 하단 밴드 근처(${position.toFixed(0)}%)에 있습니다. 단기 과매도 신호이나 하락 추세 지속 가능성도 있어 주의가 필요합니다. 반등 모멘텀 확인이 중요합니다.`;
        } else if (type === 'SELL_SIGNAL') {
          return `가격이 상단 밴드 근처(${position.toFixed(0)}%)에 있습니다. 강한 상승 추세 중일 가능성과 동시에 단기 과열 신호도 확인됩니다. 추세 지속성과 거래량을 함께 확인하세요.`;
        } else if (type === 'NEUTRAL') {
          return `가격이 밴드 중심부(${position.toFixed(0)}%)에서 움직입니다. 안정적인 흐름을 유지하고 있으며, 방향성 확인이 필요합니다.`;
        }
        return '현재 가격이 볼린저 밴드 내에서 움직이고 있습니다.';
      };

      const getDescription = () => {
        const current = bollingerData.currentPrice;
        const upper = bollingerData.upper;
        const lower = bollingerData.lower;
        const position = ((current - lower) / (upper - lower)) * 100;

        // 현재 구간 판단
        let currentRange = '';
        let signalText = '';
        let signalColor = '#8E8E93';

        if (position <= 30) {
          currentRange = '0~30%';
          signalText = '단기 과매도';
          signalColor = '#FF3B30';
        } else if (position > 30 && position < 70) {
          currentRange = '30~70%';
          signalText = '중립';
          signalColor = '#8E8E93';
        } else if (position >= 70) {
          currentRange = '70~100%';
          signalText = '단기 과매수';
          signalColor = '#007AFF';
        }

        return (
          <View>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              볼린저 밴드는 가격의 변동성을 측정하는 지표입니다. 이동평균선을
              중심으로 상단과 하단 밴드를 그려 가격의 위치를 파악합니다.
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#3C3C43',
                lineHeight: 22,
                marginTop: 12,
              }}
            >
              📊 위치별 의미:
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              • 하단 밴드 근처{' '}
              <Text
                style={{ fontWeight: currentRange === '0~30%' ? '700' : '400' }}
              >
                (0~30%)
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '0~30%' ? '700' : '400',
                  color: currentRange === '0~30%' ? '#FF3B30' : '#3C3C43',
                }}
              >
                단기 과매도
              </Text>{' '}
              - 반등 관찰 구간
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              • 중심 영역{' '}
              <Text
                style={{
                  fontWeight: currentRange === '30~70%' ? '700' : '400',
                }}
              >
                (30~70%)
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '30~70%' ? '700' : '400',
                  color: currentRange === '30~70%' ? '#8E8E93' : '#3C3C43',
                }}
              >
                중립
              </Text>{' '}
              - 안정적인 흐름, 추세 관찰
            </Text>
            <Text style={{ fontSize: 15, color: '#3C3C43', lineHeight: 22 }}>
              • 상단 밴드 근처{' '}
              <Text
                style={{
                  fontWeight: currentRange === '70~100%' ? '700' : '400',
                }}
              >
                (70~100%)
              </Text>
              :{' '}
              <Text
                style={{
                  fontWeight: currentRange === '70~100%' ? '700' : '400',
                  color: currentRange === '70~100%' ? '#007AFF' : '#3C3C43',
                }}
              >
                단기 과매수
              </Text>{' '}
              - 조정 가능성 관찰
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#3C3C43',
                lineHeight: 22,
                marginTop: 12,
              }}
            >
              현재 가격은 밴드 내{' '}
              <Text style={{ fontWeight: '700' }}>{position.toFixed(0)}%</Text>{' '}
              위치에 있습니다.
            </Text>
          </View>
        );
      };

      return {
        name: '볼린저 밴드',
        fullName: 'Bollinger Bands',
        value: null,
        signal,
        signalText: text,
        description: getDescription(),
        explanation: getExplanation(),
        details: {
          upper: bollingerData.upper,
          middle: bollingerData.middle,
          lower: bollingerData.lower,
          current: bollingerData.currentPrice,
        },
        isLoading: false,
      };
    };

    // 지표 리스트
    const indicators = [getBollingerIndicator(), getRsiIndicator()];

    const getSignalColor = (signal: SignalCategory) => {
      switch (signal) {
        case 'bullish':
          return '#FF3B30'; // 빨간색 (강세 유지)
        case 'bearish':
          return '#007AFF'; // 파란색 (약세 전환)
        case 'buy_signal':
          return '#FF3B30'; // 빨간색 (과매도 구간)
        case 'sell_signal':
          return '#007AFF'; // 파란색 (과매수 구간)
        case 'neutral':
          return '#8E8E93'; // 회색 (중립)
        default:
          return '#8E8E93'; // 기본 회색
      }
    };

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {indicators.map((indicator, index) => (
          <Card key={index} style={{ marginBottom: 12 }}>
            {/* 로딩 중일 때 */}
            {indicator.isLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>
                      {indicator.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        openIndicatorModal(
                          indicator.name,
                          indicator.description
                        )
                      }
                      style={{
                        marginLeft: 6,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#8E8E93',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 10, color: '#8E8E93' }}>?</Text>
                    </TouchableOpacity>
                  </View>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
                <View
                  style={{
                    flex: 1.2,
                    marginLeft: 12,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{ fontSize: 13, color: '#8E8E93', lineHeight: 18 }}
                  >
                    {indicator.explanation}
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row' }}>
                  {/* 왼쪽: 지표명 + 신호 */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '600' }}>
                        {indicator.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          openIndicatorModal(
                            indicator.name,
                            indicator.description
                          )
                        }
                        style={{
                          marginLeft: 6,
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#8E8E93',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10, color: '#8E8E93' }}>
                          ?
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 신호 및 수치 */}
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          backgroundColor:
                            getSignalColor(indicator.signal) + '20',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: getSignalColor(indicator.signal),
                          }}
                        >
                          {indicator.signalText}
                        </Text>
                      </View>
                      {indicator.value !== null && (
                        <Text
                          style={{ marginLeft: 8, fontSize: 14, color: '#000' }}
                        >
                          {indicator.value.toFixed(2)}
                        </Text>
                      )}
                      {indicator.details && (
                        <Text
                          style={{ marginLeft: 8, fontSize: 14, color: '#000' }}
                        >
                          {formatPriceInDisplayCurrency(
                            indicator.details.current,
                            price?.currency
                          )}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* 오른쪽: 데이터 설명 */}
                  <View
                    style={{
                      flex: 1.2,
                      marginLeft: 12,
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{ fontSize: 13, color: '#3C3C43', lineHeight: 18 }}
                    >
                      {indicator.explanation}
                    </Text>
                  </View>
                </View>

                {/* 볼린저 밴드 상세 정보 - 카드 최하단에 표시 */}
                {indicator.details && (
                  <View
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: '#F2F2F7',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#8E8E93',
                        textAlign: 'center',
                      }}
                    >
                      상단:{' '}
                      {formatPriceInDisplayCurrency(
                        indicator.details.upper,
                        price?.currency
                      )}{' '}
                      | 중간:{' '}
                      {formatPriceInDisplayCurrency(
                        indicator.details.middle,
                        price?.currency
                      )}{' '}
                      | 하단:{' '}
                      {formatPriceInDisplayCurrency(
                        indicator.details.lower,
                        price?.currency
                      )}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        ))}
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
        <Text style={[globalStyles.textLarge, globalStyles.marginBottom]}>
          종목 정보
        </Text>

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

  // 캔들 상태 확인 오류
  if (statusError) {
    return (
      <View style={globalStyles.centerContent}>
        <ErrorMessage message={statusError} />
      </View>
    );
  }

  // 캔들 상태가 아직 없음 (첫 로딩 중) - 아무것도 표시하지 않음 (깜박임 방지)
  if (!candleStatus) {
    return null;
  }

  // 캔들 데이터가 준비되지 않음 - 대기 화면 표시
  if (!candleStatus.ready) {
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

  // 필수 데이터 로딩 중 (가격, 환율, 차트)
  if (priceLoading || exchangeRateLoading || candlesLoading) {
    return <LoadingSpinner message="데이터를 불러오는 중..." />;
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {renderPriceInfo()}
      </View>

      {/* 탭 메뉴 */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => setSelectedTab('chart')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 2,
            borderBottomColor:
              selectedTab === 'chart' ? '#1B3A57' : 'transparent',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: selectedTab === 'chart' ? '600' : '400',
              color: selectedTab === 'chart' ? '#1B3A57' : '#8E8E93',
            }}
          >
            차트
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('info')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 2,
            borderBottomColor:
              selectedTab === 'info' ? '#1B3A57' : 'transparent',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: selectedTab === 'info' ? '600' : '400',
              color: selectedTab === 'info' ? '#1B3A57' : '#8E8E93',
            }}
          >
            종목정보
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('community')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 2,
            borderBottomColor:
              selectedTab === 'community' ? '#1B3A57' : 'transparent',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: selectedTab === 'community' ? '600' : '400',
              color: selectedTab === 'community' ? '#1B3A57' : '#8E8E93',
            }}
          >
            커뮤니티
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 컨텐츠 */}
      {selectedTab === 'chart' && (
        <>
          {/* {renderChartPeriodSelector()} */}
          {renderChart()}
          {renderTechnicalIndicators()}
        </>
      )}

      {selectedTab === 'info' && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {renderStockInfo()}
        </View>
      )}

      {selectedTab === 'community' && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 40,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#8E8E93', fontSize: 16 }}>
            커뮤니티 기능 준비 중입니다.
          </Text>
        </View>
      )}

      {/* 기술적 지표 설명 모달 */}
      <Modal
        visible={indicatorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIndicatorModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setIndicatorModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 20,
              width: '85%',
              maxWidth: 400,
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 12,
                color: '#000',
              }}
            >
              {selectedIndicator?.name}
            </Text>
            <View style={{ marginBottom: 20 }}>
              {selectedIndicator?.description}
            </View>
            <TouchableOpacity
              onPress={() => setIndicatorModalVisible(false)}
              style={{
                backgroundColor: '#1B3A57',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                확인
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

export default StockDetailScreen;
