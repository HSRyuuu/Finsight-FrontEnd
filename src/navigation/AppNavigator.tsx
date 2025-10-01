import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Logo } from '../components';

// 스크린 import
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

// 각 탭별 스택 네비게이터 생성
const HomeStack = createStackNavigator();
const SearchStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 커스텀 2단 헤더 컴포넌트
interface CustomHeaderProps {
  title: string;
  canGoBack?: boolean;
  onBackPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  canGoBack = false,
  onBackPress,
}) => {
  return (
    <View style={headerStyles.container}>
      {/* 첫 번째 줄: 로고 + 사용자 영역 */}
      <View style={headerStyles.topRow}>
        <View style={headerStyles.logoContainer}>
          <Logo size={32} showText={true} />
        </View>
        <View style={headerStyles.userArea}>
          <Text style={headerStyles.userPlaceholder}>👤</Text>
        </View>
      </View>

      {/* 두 번째 줄: 뒤로가기 + 페이지 제목 */}
      <View style={headerStyles.bottomRow}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={headerStyles.backButton}
          >
            <Text style={headerStyles.backText}>← 뒤로</Text>
          </TouchableOpacity>
        ) : (
          <View style={headerStyles.backButtonPlaceholder} />
        )}
        <Text style={headerStyles.pageTitle}>{title}</Text>
      </View>
    </View>
  );
};

// 공통 헤더 옵션
const commonHeaderOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C8',
    height: 110, // 2단 구조로 높이 증가
  },
  headerTintColor: '#007AFF',
};

// 홈 스택 네비게이터
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={commonHeaderOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          header: () => <CustomHeader title="주식 트래커" />,
        }}
      />
      <HomeStack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader
              title="종목 상세"
              canGoBack={true}
              onBackPress={() => navigation.goBack()}
            />
          ),
        })}
      />
    </HomeStack.Navigator>
  );
};

// 검색 스택 네비게이터
const SearchStackNavigator = () => {
  return (
    <SearchStack.Navigator screenOptions={commonHeaderOptions}>
      <SearchStack.Screen
        name="SearchMain"
        component={SearchScreen}
        options={{
          header: () => <CustomHeader title="종목 검색" />,
        }}
      />
      <SearchStack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader
              title="종목 상세"
              canGoBack={true}
              onBackPress={() => navigation.goBack()}
            />
          ),
        })}
      />
    </SearchStack.Navigator>
  );
};

// 설정 스택 네비게이터
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator screenOptions={commonHeaderOptions}>
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          header: () => <CustomHeader title="설정" />,
        }}
      />
    </SettingsStack.Navigator>
  );
};

// 탭 네비게이터
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#C6C6C8',
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          height: Platform.OS === 'ios' ? 85 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false, // 각 스택의 헤더를 사용하므로 탭 헤더는 숨김
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 26, color, fontWeight: 'bold' }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: '검색',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 26, color, fontWeight: 'bold' }}>🔎</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 26, color, fontWeight: 'bold' }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 메인 네비게이터
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

// 헤더 스타일
const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C8',
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPlaceholder: {
    fontSize: 24,
    color: '#8E8E93',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 40,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  backButtonPlaceholder: {
    width: 0,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default AppNavigator;
