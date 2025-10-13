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
    description: string;
  } | null>(null);

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
        {/* 통화 스위치 - 오른쪽 위 */}
        <View
          style={{
            position: 'absolute',
            top: 12,
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
          {/* 심볼 */}
          <Text
            style={{
              fontSize: 16,
              color: '#8E8E93',
              marginBottom: 8,
            }}
          >
            {symbol}
          </Text>

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

  // 기술적 지표 설명 모달 열기
  const openIndicatorModal = (name: string, description: string) => {
    setSelectedIndicator({ name, description });
    setIndicatorModalVisible(true);
  };

  // 기술적 지표 렌더링
  const renderTechnicalIndicators = () => {
    // 더미 데이터
    const indicators = [
      {
        name: 'RSI',
        fullName: 'Relative Strength Index',
        value: 68.5,
        signal: 'neutral' as 'buy' | 'sell' | 'neutral',
        signalText: '중립',
        description:
          'RSI는 70 이상이면 과매수, 30 이하면 과매도 상태를 나타냅니다.',
        explanation:
          '현재 RSI가 68.5로 과매수 구간에 근접하고 있습니다. 단기 조정 가능성을 주의해야 합니다.',
      },
      {
        name: '볼린저 밴드',
        fullName: 'Bollinger Bands',
        value: null,
        signal: 'buy' as 'buy' | 'sell' | 'neutral',
        signalText: '매수',
        description:
          '볼린저 밴드는 가격의 변동성을 측정하는 지표입니다. 가격이 하단 밴드에 가까우면 매수 신호, 상단 밴드에 가까우면 매도 신호입니다.',
        explanation:
          '현재 가격이 하단 밴드 근처에 위치하고 있어 반등 가능성이 있습니다.',
        details: {
          upper: 152.5,
          middle: 148.3,
          lower: 144.1,
          current: 144.8,
        },
      },
    ];

    const getSignalColor = (signal: 'buy' | 'sell' | 'neutral') => {
      switch (signal) {
        case 'buy':
          return '#FF3B30'; // 빨간색 (한국 스타일 상승)
        case 'sell':
          return '#007AFF'; // 파란색 (한국 스타일 하락)
        case 'neutral':
          return '#8E8E93'; // 회색 (중립)
      }
    };

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {indicators.map((indicator, index) => (
          <Card key={index} style={{ marginBottom: 12 }}>
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
                      openIndicatorModal(indicator.name, indicator.description)
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

                {/* 신호 및 수치 */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: getSignalColor(indicator.signal) + '20',
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
                      {indicator.value.toFixed(1)}
                    </Text>
                  )}
                  {indicator.details && (
                    <Text
                      style={{ marginLeft: 8, fontSize: 14, color: '#000' }}
                    >
                      ${indicator.details.current.toFixed(2)}
                    </Text>
                  )}
                </View>

                {/* 볼린저 밴드 상세 정보 */}
                {indicator.details && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: '#8E8E93' }}>
                      상단: ${indicator.details.upper.toFixed(2)} | 중간: $
                      {indicator.details.middle.toFixed(2)} | 하단: $
                      {indicator.details.lower.toFixed(2)}
                    </Text>
                  </View>
                )}
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
      {/* 헤더: 종목명 + 즐겨찾기 */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={[globalStyles.textTitle, { marginBottom: 16, flex: 1 }]}>
          {name}
        </Text>
        <TouchableOpacity
          onPress={handleFavoriteToggle}
          style={{ padding: 8, marginBottom: 16 }}
          disabled={favoriteLoading}
        >
          <Text style={[globalStyles.text, { fontSize: 24 }]}>
            {isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16 }}>{renderPriceInfo()}</View>

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
            <Text
              style={{
                fontSize: 15,
                color: '#3C3C43',
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              {selectedIndicator?.description}
            </Text>
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
