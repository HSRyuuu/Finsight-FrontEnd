import React, { useState } from 'react';
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
import { HomeStackParamList, Stock, PopularStockItem } from '../types';
import { useWatchlist, useStockPrice } from '../hooks';
import { globalStyles, componentStyles } from '../styles';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  Logo,
  toastManager,
} from '../components';
import { stockService, watchlistService } from '../services';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    watchlists,
    loading,
    error,
    isAuthenticated,
    addWatchlist,
    updateWatchlist,
    deleteWatchlist,
    refetch,
  } = useWatchlist();

  // 선택된 관심종목 그룹 ('popular'은 인기 탭을 위한 특수 ID)
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<
    number | 'popular' | null
  >('popular');

  // 종목 정보 캐시
  const [stocksInfo, setStocksInfo] = useState<{ [symbol: string]: Stock }>({});

  // 인기 종목 데이터
  const [popularItems, setPopularItems] = useState<PopularStockItem[]>([]);

  const [selectedTab, setSelectedTab] = React.useState<
    'watchlist' | 'tab2' | 'tab3'
  >('watchlist');

  // 화면 포커스 시 데이터 새로고침 (최초 1회만)
  const [hasLoaded, setHasLoaded] = React.useState(false);
  useFocusEffect(
    React.useCallback(() => {
      if (!hasLoaded) {
        refetch();
        setHasLoaded(true);
      }
    }, [hasLoaded, refetch])
  );

  // watchlists가 로드되면 인기 탭이 기본 선택됨 (useState 초기값)

  // 선택된 watchlist의 종목 정보 로드
  const selectedWatchlist = React.useMemo(() => {
    return watchlists.find(w => w.id === selectedWatchlistId);
  }, [watchlists, selectedWatchlistId]);

  const selectedSymbols = React.useMemo(() => {
    return selectedWatchlist?.symbols || [];
  }, [selectedWatchlist]);

  // symbols를 문자열로 직렬화하여 불필요한 리렌더링 방지
  const selectedSymbolsKey = React.useMemo(() => {
    return selectedSymbols.join(',');
  }, [selectedSymbols]);

  // 인기 종목 조회 (selectedWatchlistId가 'popular'일 때만)
  React.useEffect(() => {
    if (selectedWatchlistId !== 'popular') return;

    const fetchPopularItems = async () => {
      try {
        const items = await watchlistService.getPopularItems();
        setPopularItems(items);
      } catch (err) {
        console.error('인기 종목 아이템 조회 실패:', err);
        setPopularItems([]);
      }
    };

    fetchPopularItems();
  }, [selectedWatchlistId]);

  // 관심종목 그룹의 종목 정보 조회 (심볼이 변경될 때만)
  React.useEffect(() => {
    if (selectedWatchlistId === 'popular') return;
    if (selectedSymbols.length === 0) {
      setStocksInfo({});
      return;
    }

    const fetchStocksInfo = async () => {
      const newStocksInfo: { [symbol: string]: Stock } = {};

      for (const symbol of selectedSymbols) {
        try {
          const stock = await stockService.getStock(symbol);
          newStocksInfo[symbol] = stock;
        } catch (err) {
          console.error(`종목 ${symbol} 정보 조회 실패:`, err);
        }
      }

      setStocksInfo(newStocksInfo);
    };

    fetchStocksInfo();
  }, [selectedWatchlistId, selectedSymbolsKey]);

  // 새로고침 핸들러 (pull-to-refresh)
  const handleRefresh = async () => {
    // 그룹 목록 새로고침
    await refetch();

    // 현재 선택된 탭의 데이터도 새로고침
    if (selectedWatchlistId === 'popular') {
      try {
        const items = await watchlistService.getPopularItems();
        setPopularItems(items);
      } catch (err) {
        console.error('인기 종목 새로고침 실패:', err);
      }
    }
    // 그룹 탭의 경우 symbols는 이미 watchlists에 포함되어 있으므로
    // refetch()로 업데이트되고, selectedSymbolsKey 변경으로 useEffect 자동 실행됨
  };

  const handleStockPress = (symbol: string) => {
    const stock = stocksInfo[symbol];
    if (stock) {
      navigation.navigate('StockDetail', {
        symbol: stock.symbol,
        name: stock.name,
      });
    } else {
      // stocksInfo에 없으면 symbol만으로 이동 (인기 종목의 경우)
      navigation.navigate('StockDetail', {
        symbol: symbol,
        name: symbol,
      });
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return '#FF3B30'; // 상승 - 빨간색 (한국 스타일)
    if (change < 0) return '#007AFF'; // 하락 - 파란색 (한국 스타일)
    return '#8E8E93'; // 보합 - 회색
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `${price.toLocaleString()}원`;
    }
    return `$${price.toFixed(2)}`;
  };

  // 편집 화면으로 이동
  const handleEditMode = () => {
    if (!isAuthenticated) {
      toastManager.show('로그인이 필요합니다.', 'error');
      return;
    }
    navigation.navigate('EditWatchlist');
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
  const renderStockItem = ({ item }: { item: string | PopularStockItem }) => {
    // item이 string이면 symbol, PopularStockItem이면 실제 데이터
    const isPopularItem = typeof item !== 'string';
    const symbol = isPopularItem ? item.symbol : item;
    const popularData = isPopularItem ? item : null;
    const stock = stocksInfo[symbol];

    if (!stock && !popularData) {
      return (
        <Card style={componentStyles.listItem}>
          <Text style={globalStyles.text}>{symbol}</Text>
          <Text style={globalStyles.textSmall}>정보 로딩 중...</Text>
        </Card>
      );
    }

    return (
      <TouchableOpacity onPress={() => handleStockPress(symbol)}>
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
              <Text style={globalStyles.textLarge}>
                {stock?.name || symbol}(한글수정필요)
              </Text>

              {/* 두 번째 줄: symbol · exchange */}
              <Text style={[globalStyles.textSmall, { color: '#8E8E93' }]}>
                {symbol}
                {stock?.exchange ? ` · ${stock.exchange}` : ''}
              </Text>

              {/* 세 번째 줄: 볼린저밴드와 RSI 지표 (인기 종목만) */}
              {popularData && (
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
                        getSignalColor(popularData.bollingerBand.signalType) +
                        '20',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: getSignalColor(
                          popularData.bollingerBand.signalType
                        ),
                      }}
                    >
                      BB: {getSignalText(popularData.bollingerBand.signalType)}
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
                      backgroundColor:
                        getSignalColor(popularData.rsi.signalType) + '20',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: getSignalColor(popularData.rsi.signalType),
                      }}
                    >
                      RSI: {getSignalText(popularData.rsi.signalType)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* 오른쪽: 가격 */}
            <View style={{ alignItems: 'flex-end' }}>
              {popularData ? (
                <Text style={[globalStyles.textLarge, { fontWeight: '600' }]}>
                  ${popularData.close.toFixed(2)}
                </Text>
              ) : (
                <Text style={globalStyles.textSmall}>로딩 중...</Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  // 관심종목 그룹 칩 렌더링
  const renderGroupChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsContainer}
      contentContainerStyle={styles.chipsContent}
    >
      {/* 인기 탭 (항상 맨 앞) */}
      <TouchableOpacity
        key="popular"
        onPress={() => setSelectedWatchlistId('popular')}
        style={[
          styles.chip,
          selectedWatchlistId === 'popular' && styles.chipSelected,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            selectedWatchlistId === 'popular' && styles.chipTextSelected,
          ]}
        >
          인기
        </Text>
      </TouchableOpacity>

      {/* 사용자의 관심종목 그룹들 */}
      {watchlists.map(watchlist => (
        <TouchableOpacity
          key={watchlist.id}
          onPress={() => setSelectedWatchlistId(watchlist.id)}
          style={[
            styles.chip,
            selectedWatchlistId === watchlist.id && styles.chipSelected,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              selectedWatchlistId === watchlist.id && styles.chipTextSelected,
            ]}
          >
            {watchlist.groupName}
          </Text>
        </TouchableOpacity>
      ))}

      {/* 편집 버튼 (항상 표시, 비로그인 시 클릭하면 토스트) */}
      <TouchableOpacity
        key="edit"
        onPress={handleEditMode}
        style={[styles.chip, styles.chipEdit]}
      >
        <Text style={styles.chipEditText}>+ 편집</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // 최초 로딩 중일 때만 로딩 스피너 표시 (새로고침 시에는 표시하지 않음)
  if (!hasLoaded && loading) {
    return <LoadingSpinner message="관심 종목을 불러오는 중..." />;
  }

  // 에러가 발생해도 화면은 보이도록 함 (에러 메시지는 별도로 표시)

  // 인기 탭이면 popularItems 사용, 아니면 symbols 사용
  const displayData: (string | PopularStockItem)[] =
    selectedWatchlistId === 'popular' ? popularItems : selectedSymbols;

  const isPopularTab = selectedWatchlistId === 'popular';

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
            <ErrorMessage message={error} onRetry={refetch} />
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
              {/* 그룹 칩 */}
              {renderGroupChips()}

              {/* 종목 목록 */}
              <View style={{ padding: 16 }}>
                {displayData.length === 0 ? (
                  <Card style={globalStyles.centerContent}>
                    <Text style={[globalStyles.text, globalStyles.textCenter]}>
                      {isPopularTab
                        ? '인기 종목 데이터를 불러오는 중입니다.'
                        : '관심 종목이 없습니다.'}
                    </Text>
                    {!isPopularTab && (
                      <Text
                        style={[
                          globalStyles.textSmall,
                          globalStyles.textCenter,
                          globalStyles.marginTop,
                        ]}
                      >
                        검색 화면에서 종목을 추가해보세요.
                      </Text>
                    )}
                  </Card>
                ) : (
                  <FlatList
                    data={displayData}
                    keyExtractor={item =>
                      typeof item === 'string' ? item : item.symbol
                    }
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

const styles = StyleSheet.create({
  chipsContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  chipsContent: {
    padding: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#1B3A57',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipEdit: {
    backgroundColor: '#E5E5EA',
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
  },
  chipEditText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B3A57',
  },
});

export default HomeScreen;
