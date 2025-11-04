import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList, PopularStockItem } from '@/types';
import { globalStyles, componentStyles } from '@/styles';
import { Card, LoadingSpinner, ErrorMessage, Logo } from '@/components';
import { watchlistService } from '@/services';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // 인기 종목 데이터
  const [popularItems, setPopularItems] = useState<PopularStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<'watchlist' | 'tab2' | 'tab3'>(
    'watchlist'
  );

  // 인기 종목 조회
  const fetchPopularItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await watchlistService.getPopularItems();
      setPopularItems(items);
    } catch (err) {
      console.error('인기 종목 조회 실패:', err);
      setError(
        err instanceof Error
          ? err.message
          : '인기 종목을 불러오는데 실패했습니다.'
      );
      setPopularItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 화면 포커스 시 데이터 새로고침 (최초 1회만)
  const [hasLoaded, setHasLoaded] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasLoaded) {
        fetchPopularItems();
        setHasLoaded(true);
      }
    }, [hasLoaded, fetchPopularItems])
  );

  // 새로고침 핸들러 (pull-to-refresh)
  const handleRefresh = async () => {
    await fetchPopularItems();
  };

  const handleStockPress = (symbol: string) => {
    navigation.navigate('StockDetail', {
      symbol: symbol,
      name: symbol,
    });
  };

  // 신호 타입에 따른 색상
  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'BULLISH':
        return '#FF3B30'; // 빨간색 (강세 유지)
      case 'BEARISH':
        return '#007AFF'; // 파란색 (약세 전환)
      case 'BUY_SIGNAL':
        return '#FF3B30'; // 빨간색 (과매도 구간)
      case 'SELL_SIGNAL':
        return '#007AFF'; // 파란색 (과매수 구간)
      case 'NEUTRAL':
      default:
        return '#8E8E93'; // 회색 (중립)
    }
  };

  // 신호 텍스트
  const getSignalText = (signalType: string) => {
    switch (signalType) {
      case 'BULLISH':
        return '강세 유지';
      case 'BEARISH':
        return '약세 전환';
      case 'BUY_SIGNAL':
        return '과매도';
      case 'SELL_SIGNAL':
        return '과매수';
      case 'NEUTRAL':
      default:
        return '중립';
    }
  };

  // 종목 아이템 렌더링
  const renderStockItem = ({ item }: { item: PopularStockItem }) => {
    return (
      <TouchableOpacity onPress={() => handleStockPress(item.symbol)}>
        <Card style={componentStyles.listItem}>
          <View style={globalStyles.row}>
            {/* 왼쪽: 아이콘 */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#F2F2F7',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>📈</Text>
            </View>

            {/* 중앙: 종목 정보 */}
            <View style={{ flex: 1 }}>
              {/* 첫 번째 줄: 종목명 */}
              <Text style={globalStyles.textLarge}>{item.symbol}</Text>

              {/* 두 번째 줄: 볼린저밴드와 RSI 지표 */}
              <View style={{ flexDirection: 'row', marginTop: 6, gap: 8 }}>
                {/* 볼린저 밴드 */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor:
                      getSignalColor(item.bollingerBand.signalType) + '20',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: getSignalColor(item.bollingerBand.signalType),
                    }}
                  >
                    BB: {getSignalText(item.bollingerBand.signalType)}
                  </Text>
                </View>

                {/* RSI */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: getSignalColor(item.rsi.signalType) + '20',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: getSignalColor(item.rsi.signalType),
                    }}
                  >
                    RSI: {getSignalText(item.rsi.signalType)}
                  </Text>
                </View>
              </View>
            </View>

            {/* 오른쪽: 가격 */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[globalStyles.textLarge, { fontWeight: '600' }]}>
                ${item.close.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  // 최초 로딩 중일 때만 로딩 스피너 표시 (새로고침 시에는 표시하지 않음)
  if (!hasLoaded && loading) {
    return <LoadingSpinner message="인기 종목을 불러오는 중..." />;
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView>
        {/* 로고 */}
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Logo size={100} />
        </View>

        {/* 에러 메시지 */}
        {error && (
          <View style={{ padding: 16 }}>
            <ErrorMessage message={error} onRetry={fetchPopularItems} />
          </View>
        )}

        {/* 탭 */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5EA',
          }}
        >
          <TouchableOpacity
            onPress={() => setSelectedTab('watchlist')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                selectedTab === 'watchlist' ? '#1B3A57' : 'transparent',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: selectedTab === 'watchlist' ? '600' : '400',
                color: selectedTab === 'watchlist' ? '#1B3A57' : '#8E8E93',
              }}
            >
              관심종목
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('tab2')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                selectedTab === 'tab2' ? '#1B3A57' : 'transparent',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: selectedTab === 'tab2' ? '600' : '400',
                color: selectedTab === 'tab2' ? '#1B3A57' : '#8E8E93',
              }}
            >
              포트폴리오
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('tab3')}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                selectedTab === 'tab3' ? '#1B3A57' : 'transparent',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: selectedTab === 'tab3' ? '600' : '400',
                color: selectedTab === 'tab3' ? '#1B3A57' : '#8E8E93',
              }}
            >
              뉴스
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 컨텐츠 */}
        <View style={{ flex: 1 }}>
          {selectedTab === 'watchlist' && (
            <View style={{ flex: 1 }}>
              {/* 종목 목록 */}
              <View style={{ padding: 16 }}>
                {popularItems.length === 0 ? (
                  <Card style={globalStyles.centerContent}>
                    <Text style={[globalStyles.text, globalStyles.textCenter]}>
                      인기 종목 데이터를 불러오는 중입니다.
                    </Text>
                  </Card>
                ) : (
                  <FlatList
                    data={popularItems}
                    keyExtractor={item => item.symbol}
                    renderItem={renderStockItem}
                    refreshControl={
                      <RefreshControl
                        refreshing={loading}
                        onRefresh={handleRefresh}
                      />
                    }
                    scrollEnabled={false}
                  />
                )}
              </View>
            </View>
          )}

          {selectedTab === 'tab2' && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 50,
              }}
            >
              <Text style={{ color: '#8E8E93', fontSize: 16 }}>
                포트폴리오 기능 준비 중입니다.
              </Text>
            </View>
          )}

          {selectedTab === 'tab3' && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 50,
              }}
            >
              <Text style={{ color: '#8E8E93', fontSize: 16 }}>
                뉴스 기능 준비 중입니다.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({});

export default HomeScreen;
