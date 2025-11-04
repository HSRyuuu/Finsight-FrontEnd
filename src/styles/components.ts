import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';

// 컴포넌트별 스타일 정의
export const componentStyles = StyleSheet.create({
  // 헤더 스타일
  header: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },

  // 네비게이션 탭 스타일
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    height: 60,
  },
  tabLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  tabIcon: {
    marginBottom: 4,
  },

  // 리스트 아이템 스타일
  listItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  // 로딩 스피너 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },

  // 에러 메시지 스타일
  errorContainer: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.base,
    borderRadius: 8,
    marginVertical: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },

  // 성공 메시지 스타일
  successContainer: {
    backgroundColor: COLORS.success + '10',
    padding: SPACING.base,
    borderRadius: 8,
    marginVertical: SPACING.sm,
  },
  successText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },

  // 아바타 스타일
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarLargeText: {
    fontSize: FONT_SIZES.xl,
  },

  // 배지 스타일
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },

  // 구분선 스타일
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },

  // 플로팅 액션 버튼 스타일
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
