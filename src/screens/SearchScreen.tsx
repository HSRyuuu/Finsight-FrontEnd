import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SearchStackParamList, SearchResult } from '../types';
import { useStockSearch, useFavorites, useIsFavorite } from '../hooks';
import { globalStyles, componentStyles } from '../styles';
import { Card, LoadingSpinner, ErrorMessage } from '../components';

type SearchScreenNavigationProp = StackNavigationProp<SearchStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [query, setQuery] = useState('');
  const { results, loading, error } = useStockSearch(query);
  const { addFavorite, removeFavorite } = useFavorites();

  const handleStockPress = (stock: SearchResult) => {
    navigation.navigate('StockDetail', {
      symbol: stock.symbol,
      name: stock.name,
    });
  };

  const handleFavoriteToggle = async (stock: SearchResult) => {
    try {
      const { isFavorite } = useIsFavorite(stock.symbol);
      if (isFavorite) {
        await removeFavorite(stock.symbol);
      } else {
        await addFavorite({
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange,
          stockType: stock.stockType,
          currency: stock.currency,
        });
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleStockPress(item)}>
      <Card style={componentStyles.listItem}>
        <View style={globalStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={componentStyles.listItemTitle}>{item.name}</Text>
            <Text style={componentStyles.listItemSubtitle}>
              {item.symbol} • {item.exchange} • {item.stockType}
            </Text>
            <Text style={[componentStyles.listItemSubtitle, { marginTop: 2 }]}>
              {item.currency}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleFavoriteToggle(item)}
            style={{ padding: 8 }}
          >
            <Text style={[globalStyles.text, { fontSize: 20 }]}>⭐</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (query.length === 0) {
      return (
        <Card style={globalStyles.centerContent}>
          <Text style={[globalStyles.text, globalStyles.textCenter]}>
            종목을 검색해보세요
          </Text>
          <Text
            style={[
              globalStyles.textSmall,
              globalStyles.textCenter,
              globalStyles.marginTop,
            ]}
          >
            종목명, 심볼, 또는 회사명으로 검색할 수 있습니다.
          </Text>
        </Card>
      );
    }

    if (loading) {
      return (
        <Card style={globalStyles.centerContent}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text
            style={[
              globalStyles.textSmall,
              globalStyles.textCenter,
              globalStyles.marginTop,
            ]}
          >
            검색 중...
          </Text>
        </Card>
      );
    }

    if (error) {
      return (
        <Card style={globalStyles.centerContent}>
          <ErrorMessage message={error} />
        </Card>
      );
    }

    if (results.length === 0) {
      return (
        <Card style={globalStyles.centerContent}>
          <Text style={[globalStyles.text, globalStyles.textCenter]}>
            검색 결과가 없습니다
          </Text>
          <Text
            style={[
              globalStyles.textSmall,
              globalStyles.textCenter,
              globalStyles.marginTop,
            ]}
          >
            다른 키워드로 검색해보세요.
          </Text>
        </Card>
      );
    }

    return null;
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.content}>
        <Text
          style={[
            globalStyles.textTitle,
            globalStyles.textCenter,
            globalStyles.marginBottom,
          ]}
        >
          종목 검색
        </Text>

        <View style={[globalStyles.input, globalStyles.marginBottom]}>
          <TextInput
            style={globalStyles.text}
            placeholder="종목명, 심볼, 또는 회사명을 입력하세요"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {query.length > 0 && results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={item => `${item.symbol}_${item.exchange}`}
            renderItem={renderSearchResult}
            contentContainerStyle={{ paddingBottom: 20 }}
            // 기본 스크롤 설정
            scrollEnabled={true}
            bounces={true}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

export default SearchScreen;
