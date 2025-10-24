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
import { HomeStackParamList, Stock } from '../types';
import { useWatchlist, useStockPrice } from '../hooks';
import { globalStyles, componentStyles } from '../styles';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  Logo,
  toastManager,
} from '../components';
import { stockService } from '../services';

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

  const [selectedTab, setSelectedTab] = React.useState<
    'watchlist' | 'tab2' | 'tab3'
  >('watchlist');

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // watchlists가 로드되면 인기 탭이 기본 선택됨 (useState 초기값)

  // 선택된 watchlist의 종목 정보 로드
  React.useEffect(() => {
    // 인기 탭 선택 시 API에서 인기 종목 조회 (향후 구현)
    if (selectedWatchlistId === 'popular') {
      // TODO: 인기 종목 API 호출
      setStocksInfo({});
      return;
    }

    const selectedWatchlist = watchlists.find(
      w => w.id === selectedWatchlistId
    );
    if (!selectedWatchlist || selectedWatchlist.symbols.length === 0) {
      setStocksInfo({});
      return;
    }

    // 종목 정보 조회
    const fetchStocksInfo = async () => {
      const newStocksInfo: { [symbol: string]: Stock } = {};

      for (const symbol of selectedWatchlist.symbols) {
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
  }, [selectedWatchlistId, watchlists]);

  const handleStockPress = (symbol: string) => {
    const stock = stocksInfo[symbol];
    if (stock) {
      navigation.navigate('StockDetail', {
        symbol: stock.symbol,
        name: stock.name,
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

  // 종목 아이템 렌더링
  const renderStockItem = ({ item: symbol }: { item: string }) => {
    const stock = stocksInfo[symbol];

    if (!stock) {
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
            <View style={{ flex: 1 }}>
              <Text style={globalStyles.textLarge}>{stock.name}</Text>
              <Text style={[globalStyles.textSmall, { color: '#8E8E93' }]}>
                {stock.symbol} · {stock.exchange}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={globalStyles.textSmall}>로딩 중...</Text>
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

      {/* 편집 버튼 (로그인 시에만) */}
      {isAuthenticated && (
        <TouchableOpacity
          onPress={handleEditMode}
          style={[styles.chip, styles.chipEdit]}
        >
          <Text style={styles.chipEditText}>+ 편집</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  if (loading && watchlists.length === 0) {
    return <LoadingSpinner message="관심 종목을 불러오는 중..." />;
  }

  if (error && watchlists.length === 0) {
    return (
      <View style={globalStyles.centerContent}>
        <ErrorMessage message={error} onRetry={refetch} />
      </View>
    );
  }

  const selectedWatchlist =
    selectedWatchlistId === 'popular'
      ? null
      : watchlists.find(w => w.id === selectedWatchlistId);
  const symbols = selectedWatchlist?.symbols || [];
  const isPopularTab = selectedWatchlistId === 'popular';

  return (
    <View style={globalStyles.container}>
      <ScrollView>
        {/* 로고 */}
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Logo size={100} />
        </View>

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
                {symbols.length === 0 ? (
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
                    data={symbols}
                    keyExtractor={item => item}
                    renderItem={renderStockItem}
                    refreshControl={
                      <RefreshControl
                        refreshing={loading}
                        onRefresh={refetch}
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
