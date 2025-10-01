// 웹 전용 스타일
export const webStyles = {
  // 웹에서 드래그 스크롤을 위한 스타일
  scrollableContainer: {
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    cursor: 'grab',
    userSelect: 'none',
    // 드래그 중 커서 변경
    '&:active': {
      cursor: 'grabbing',
    },
  },
  // FlatList 웹 최적화
  flatListWeb: {
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    // 스크롤바 숨기기 (선택사항)
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  // 터치 디바이스 최적화
  touchDevice: {
    touchAction: 'pan-y',
    overscrollBehavior: 'contain',
  },
};

// 웹에서 스크롤 이벤트 처리
export const webScrollHandlers = {
  onMouseDown: (e: any) => {
    e.currentTarget.style.cursor = 'grabbing';
  },
  onMouseUp: (e: any) => {
    e.currentTarget.style.cursor = 'grab';
  },
  onMouseLeave: (e: any) => {
    e.currentTarget.style.cursor = 'grab';
  },
};
