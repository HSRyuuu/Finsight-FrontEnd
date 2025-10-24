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
  Image,
} from 'react-native';
import { Logo } from '../components';

// 스크린 import
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditWatchlistScreen from '../screens/EditWatchlistScreen';

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
      {/* 첫 번째 줄: 로고 */}
      <View style={headerStyles.topRow}>
        <View style={headerStyles.logoContainer}>
          <Logo size={32} showText={true} />
        </View>
      </View>

      {/* 두 번째 줄: 뒤로가기 + 페이지 제목 (title이 있을 때만 표시) */}
      {title && (
        <View style={headerStyles.bottomRow}>
          <View style={headerStyles.leftSection}>
            {canGoBack && (
              <TouchableOpacity
                onPress={onBackPress}
                style={headerStyles.backButton}
              >
                <Text style={headerStyles.backText}>← 뒤로</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={headerStyles.centerSection}>
            <Text style={headerStyles.pageTitle}>{title}</Text>
          </View>

          <View style={headerStyles.rightSection} />
        </View>
      )}
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
          header: () => <CustomHeader title="" />,
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
      <HomeStack.Screen
        name="EditWatchlist"
        component={EditWatchlistScreen}
        options={{
          headerShown: false,
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

// 내정보 스택 네비게이터
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator screenOptions={commonHeaderOptions}>
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          header: () => <CustomHeader title="내정보" />,
        }}
      />
      <SettingsStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          header: () => <CustomHeader title="로그인" />,
        }}
      />
      <SettingsStack.Screen
        name="Register"
        component={RegisterScreen}
        options={({ navigation }) => ({
          header: () => (
            <CustomHeader
              title="회원가입"
              canGoBack={true}
              onBackPress={() => navigation.goBack()}
            />
          ),
        })}
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
            <Image
              source={require('../assets/home.png')}
              style={{ width: 24, height: 24 }}
              // @ts-ignore - tintColor는 웹에서 지원됨
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: '검색',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/search.png')}
              style={{ width: 24, height: 24 }}
              // @ts-ignore - tintColor는 웹에서 지원됨
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          title: '내 정보',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/user.png')}
              style={{ width: 24, height: 24 }}
              // @ts-ignore - tintColor는 웹에서 지원됨
              tintColor={color}
              resizeMode="contain"
            />
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
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
});

export default AppNavigator;
