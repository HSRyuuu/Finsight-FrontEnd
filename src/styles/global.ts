import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';

// 전역 스타일 정의
export const globalStyles = StyleSheet.create({
  // 컨테이너 스타일
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.base,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 텍스트 스타일
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZES.base,
  },
  textSmall: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  textLarge: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  textTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
  },
  textCenter: {
    textAlign: 'center',
  },

  // 버튼 스타일
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonSecondaryText: {
    color: COLORS.primary,
  },

  // 카드 스타일
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.base,
    marginVertical: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // 입력 필드 스타일
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.base,
    backgroundColor: COLORS.surface,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },

  // 레이아웃 스타일
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },

  // 마진/패딩 유틸리티
  marginTop: {
    marginTop: SPACING.base,
  },
  marginBottom: {
    marginBottom: SPACING.base,
  },
  marginVertical: {
    marginVertical: SPACING.base,
  },
  marginHorizontal: {
    marginHorizontal: SPACING.base,
  },
  paddingTop: {
    paddingTop: SPACING.base,
  },
  paddingBottom: {
    paddingBottom: SPACING.base,
  },
  paddingVertical: {
    paddingVertical: SPACING.base,
  },
  paddingHorizontal: {
    paddingHorizontal: SPACING.base,
  },
});
