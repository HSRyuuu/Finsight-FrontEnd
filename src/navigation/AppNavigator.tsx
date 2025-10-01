import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
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

// 공통 헤더 옵션 (로고를 좌측에 배치하고 헤더 높이 확보)
const commonHeaderOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C8',
    height: 64,
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerTintColor: '#007AFF',
  headerTitleAlign: 'left' as const,
  headerTitleContainerStyle: { marginLeft: 10 },
  headerLeftContainerStyle: { paddingLeft: 12, paddingRight: 8 },
  headerLeft: () => (
    <View>
      <Logo size={40} showText={true} />
    </View>
  ),
};

// 홈 스택 네비게이터
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={commonHeaderOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerTitle: '주식 트래커' }}
      />
      <HomeStack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={{
          headerTitle: '종목 상세',
          headerBackTitle: '뒤로',
        }}
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
        options={{ headerTitle: '종목 검색' }}
      />
      <SearchStack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={{
          headerTitle: '종목 상세',
          headerBackTitle: '뒤로',
        }}
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
        options={{ headerTitle: '설정' }}
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
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: '검색',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          title: '설정',
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

export default AppNavigator;
