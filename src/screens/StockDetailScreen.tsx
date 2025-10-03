import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SearchStackParamList, ChartPeriod } from '../types';
import {
  useStock,
  useStockPrice,
  useCandleData,
  useIsFavorite,
} from '../hooks';
import { useFavorites } from '../hooks';
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

  const { stock, loading: stockLoading, error: stockError } = useStock(symbol);
  const {
    price,
    loading: priceLoading,
    error: priceError,
  } = useStockPrice(symbol);
  const {
    candles,
    loading: candlesLoading,
    error: candlesError,
  } = useCandleData(symbol, selectedPeriod);
  const { isFavorite, loading: favoriteLoading } = useIsFavorite(symbol);
  const { addFavorite, removeFavorite } = useFavorites();

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(symbol);
      } else {
        await addFavorite({
          symbol,
          name,
          exchange: stock?.exchange || 'KRX',
        });
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `${price.toLocaleString()}원`;
    }
    return `$${price.toFixed(2)}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return '#FF3B30'; // 상승 - 빨간색 (한국 스타일)
    if (change < 0) return '#007AFF'; // 하락 - 파란색 (한국 스타일)
    return '#8E8E93'; // 보합 - 회색
  };

  const chartPeriods: { label: string; value: ChartPeriod }[] = [
    { label: '1일', value: 'DAY1' },
    // { label: '1주', value: 'WEEK1' },
    // { label: '1개월', value: 'MONTH1' },
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
          {formatPrice(price.currentPrice, price.currency || 'KRW')}
        </Text>
        <Text
          style={[
            globalStyles.textLarge,
            globalStyles.textCenter,
            { color: getPriceChangeColor(price.change) },
          ]}
        >
          {price.change > 0 ? '+' : ''}
          {formatPrice(price.change, price.currency || 'KRW')}(
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
          전일 종가: {formatPrice(price.previousClose, price.currency || 'KRW')}
        </Text>
      </Card>
    );
  };

  const renderChartPeriodSelector = () => (
    <Card style={globalStyles.marginBottom}>
      <Text style={[globalStyles.textLarge, globalStyles.marginBottom]}>
        차트 기간
      </Text>
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
                  selectedPeriod === period.value ? '#007AFF' : '#C6C6C8',
                backgroundColor:
                  selectedPeriod === period.value ? '#007AFF' : 'transparent',
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
    </Card>
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

    // Lightweight Charts 사용
    return (
      <Card>
        <Text style={[globalStyles.textLarge, globalStyles.marginBottom]}>
          가격 차트
        </Text>
        <CandlestickChart
          data={candles}
          height={300}
          timeframe={selectedPeriod === 'DAY1' ? 'day' : 'hour'}
        />
        {candles.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[globalStyles.textSmall, globalStyles.textCenter]}>
              {/* 📊 {candles.length}개 데이터 포인트 • {selectedPeriod} */}
            </Text>
          </View>
        )}
      </Card>
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
              {price?.high52Week ? formatPrice(price.high52Week, 'KRW') : 'N/A'}
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
              {price?.low52Week ? formatPrice(price.low52Week, 'KRW') : 'N/A'}
            </Text>
          </View>

          <View
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
          </View>

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

  if (stockLoading) {
    return <LoadingSpinner message="종목 정보를 불러오는 중..." />;
  }

  if (stockError) {
    return (
      <View style={globalStyles.centerContent}>
        <ErrorMessage message={stockError} />
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.content}>
        <Text
          style={[
            globalStyles.textTitle,
            globalStyles.textCenter,
            globalStyles.marginBottom,
          ]}
        >
          {name}
        </Text>

        {renderPriceInfo()}
        {renderChartPeriodSelector()}
        {renderChart()}
        {renderStockInfo()}
      </View>
    </ScrollView>
  );
};

export default StockDetailScreen;
