import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles, componentStyles } from '../styles';
import { Card } from '../components';

const SettingsScreen: React.FC = () => {
  const settingsItems = [
    { title: '알림 설정', description: '가격 알림 및 뉴스 알림 설정' },
    { title: '테마 설정', description: '다크 모드 및 색상 설정' },
    { title: '차트 설정', description: '차트 스타일 및 기간 설정' },
    { title: '통화 설정', description: '기본 통화 및 환율 설정' },
    { title: '데이터 관리', description: '캐시 정리 및 데이터 동기화' },
    { title: '개인정보 처리방침', description: '개인정보 보호 정책' },
    { title: '이용약관', description: '서비스 이용약관' },
    { title: '버전 정보', description: '앱 버전 1.0.0' },
  ];

  const handleSettingPress = (title: string) => {
    console.log(`${title} 설정을 눌렀습니다.`);
    // 실제 구현에서는 각 설정 화면으로 이동
  };

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
          설정
        </Text>

        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSettingPress(item.title)}
          >
            <Card style={componentStyles.listItem}>
              <View>
                <Text style={componentStyles.listItemTitle}>{item.title}</Text>
                <Text style={componentStyles.listItemSubtitle}>
                  {item.description}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
