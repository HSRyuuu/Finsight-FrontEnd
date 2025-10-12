import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList, FavoriteStock } from '../types';
import { useFavorites, useMarketStatus } from '../hooks';
import { globalStyles, componentStyles } from '../styles';
import { Card, LoadingSpinner, ErrorMessage, Logo } from '../components';
import { formatDate } from '../utils/helpers';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { favorites, loading, error, refetch } = useFavorites();
  const { status: marketStatus } = useMarketStatus();
  const [selectedTab, setSelectedTab] = React.useState<
    'watchlist' | 'tab2' | 'tab3'
  >('watchlist');

  const handleStockPress = (stock: FavoriteStock) => {
    navigation.navigate('StockDetail', {
      symbol: stock.symbol,
      name: stock.name,
    });
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

  const renderFavoriteItem = ({ item }: { item: FavoriteStock }) => (
    <TouchableOpacity onPress={() => handleStockPress(item)}>
      <Card style={componentStyles.listItem}>
        <View style={globalStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={componentStyles.listItemTitle}>{item.name}</Text>
            <Text style={componentStyles.listItemSubtitle}>
              {item.symbol} • {item.exchange}
            </Text>
            {item.price && (
              <View style={[globalStyles.row, { marginTop: 4 }]}>
                <Text style={[globalStyles.textLarge, { fontWeight: 'bold' }]}>
                  {formatPrice(
                    item.price.currentPrice,
                    'KRW' // 기본 통화로 설정
                  )}
                </Text>
                <Text
                  style={[
                    globalStyles.textSmall,
                    {
                      marginLeft: 8,
                      color: getPriceChangeColor(item.price.change),
                      fontWeight: '600',
                    },
                  ]}
                >
                  {item.price.change > 0 ? '+' : ''}
                  {item.price.changePercent.toFixed(2)}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderMarketStatus = () => {
    if (!marketStatus.length) return null;

    return (
      <Card style={[globalStyles.marginBottom, { backgroundColor: '#F8F9FA' }]}>
        <Text style={[globalStyles.textLarge, globalStyles.marginBottom]}>
          거래소 상태
        </Text>
        {marketStatus.map((status, index) => (
          <View
            key={index}
            style={[
              globalStyles.row,
              globalStyles.spaceBetween,
              globalStyles.marginBottom,
            ]}
          >
            <Text style={globalStyles.text}>{status.exchange}</Text>
            <Text
              style={[
                globalStyles.text,
                { color: status.isOpen ? '#34C759' : '#FF3B30' },
              ]}
            >
              {status.isOpen ? '개장' : '폐장'}
            </Text>
          </View>
        ))}
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner message="관심 종목을 불러오는 중..." />;
  }

  if (error) {
    return (
      <View style={globalStyles.centerContent}>
        <ErrorMessage message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={{ flex: 1 }}>
        {/* 탭 메뉴 */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5EA',
            paddingHorizontal: 16,
            paddingTop: 16,
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
        <View style={{ flex: 1, padding: 16 }}>
          {selectedTab === 'watchlist' && (
            <>
              {renderMarketStatus()}

              <Text style={[globalStyles.textSmall, globalStyles.marginBottom]}>
                총 {favorites?.length || 0}개 종목
              </Text>

              {favorites.length === 0 ? (
                <Card style={globalStyles.centerContent}>
                  <Text style={[globalStyles.text, globalStyles.textCenter]}>
                    관심 종목이 없습니다.
                  </Text>
                  <Text
                    style={[
                      globalStyles.textSmall,
                      globalStyles.textCenter,
                      globalStyles.marginTop,
                    ]}
                  >
                    검색 화면에서 종목을 추가해보세요.
                  </Text>
                </Card>
              ) : (
                <FlatList
                  data={favorites || []}
                  keyExtractor={item => item.id}
                  renderItem={renderFavoriteItem}
                  refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refetch} />
                  }
                  contentContainerStyle={{ paddingBottom: 20 }}
                  scrollEnabled={true}
                  bounces={true}
                  showsVerticalScrollIndicator={true}
                />
              )}
            </>
          )}

          {selectedTab === 'tab2' && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
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
              }}
            >
              <Text style={{ color: '#8E8E93', fontSize: 16 }}>
                뉴스 기능 준비 중입니다.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
