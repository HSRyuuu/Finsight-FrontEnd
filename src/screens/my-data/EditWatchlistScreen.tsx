import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Watchlist } from '@/types';
import { useWatchlist } from '@/hooks';
import { globalStyles } from '@/styles';
import {
  Card,
  LoadingSpinner,
  toastManager,
  ConfirmModal,
} from '@/components';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ItemLayout {
  index: number;
  y: number;
  height: number;
}

const EditWatchlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    watchlists,
    loading,
    addWatchlist,
    updateWatchlist,
    updateWatchlistsOrder,
    updateAllWatchlistGroups,
    deleteWatchlist,
    refetch,
  } = useWatchlist();

  const [localWatchlists, setLocalWatchlists] = useState<Watchlist[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const nextTempId = useRef(-1); // 새로 추가된 항목의 임시 ID

  // 드래그 관련 상태
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [itemLayouts, setItemLayouts] = useState<ItemLayout[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragOpacity = useRef(new Animated.Value(1)).current;
  const dragScale = useRef(new Animated.Value(1)).current;
  const draggingItemRef = useRef<Watchlist | null>(null);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState('');

  // 삭제 확인 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingWatchlist, setDeletingWatchlist] = useState<Watchlist | null>(
    null
  );

  // 취소 확인 모달 상태
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 저장 확인 모달 상태
  const [showSaveModal, setShowSaveModal] = useState(false);

  // watchlists가 로드되면 로컬 상태 초기화
  React.useEffect(() => {
    setLocalWatchlists([...watchlists]);
    setHasChanges(false);
    nextTempId.current = -1;
  }, [watchlists]);

  // 아이템 레이아웃 측정
  const handleItemLayout = (index: number, event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setItemLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { index, y, height };
      return newLayouts;
    });
  };

  // 드래그 시작
  const createPanResponder = (index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        draggingItemRef.current = localWatchlists[index];
        setDraggingIndex(index);
        setHoveredIndex(index);
        Animated.parallel([
          Animated.spring(dragScale, {
            toValue: 1.05,
            useNativeDriver: true,
          }),
          Animated.spring(dragOpacity, {
            toValue: 0.9,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const currentDraggingIndex = draggingIndex ?? index;
        dragY.setValue(gestureState.dy);

        // 현재 드래그 중인 아이템의 위치 계산
        const currentLayout = itemLayouts[currentDraggingIndex];
        if (!currentLayout) return;

        const currentCenterY =
          currentLayout.y + currentLayout.height / 2 + gestureState.dy;

        // 어느 아이템 위에 있는지 찾기
        let newHoveredIndex = currentDraggingIndex;

        for (let i = 0; i < itemLayouts.length; i++) {
          const layout = itemLayouts[i];
          if (!layout) continue;

          // 중심점이 다른 아이템의 영역에 들어갔는지 확인
          if (
            currentCenterY > layout.y &&
            currentCenterY < layout.y + layout.height
          ) {
            newHoveredIndex = i;
            break;
          }
        }

        // 순서 변경 (실시간 배열 재배치)
        if (newHoveredIndex !== currentDraggingIndex) {
          const newList = [...localWatchlists];
          const [removed] = newList.splice(currentDraggingIndex, 1);
          newList.splice(newHoveredIndex, 0, removed);

          setLocalWatchlists(newList);
          setDraggingIndex(newHoveredIndex);
          setHoveredIndex(newHoveredIndex);

          // dragY 리셋하여 부드러운 전환
          dragY.setValue(0);
        }
      },
      onPanResponderRelease: () => {
        // 드래그 종료 - sortOrder 업데이트
        const finalList = localWatchlists.map((item, idx) => ({
          ...item,
          sortOrder: idx + 1,
        }));

        setLocalWatchlists(finalList);
        setHasChanges(true);

        // 애니메이션 복원
        Animated.parallel([
          Animated.spring(dragY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(dragScale, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(dragOpacity, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setDraggingIndex(null);
          setHoveredIndex(null);
          draggingItemRef.current = null;
        });
      },
    });
  };

  // 추가 버튼
  const handleAdd = () => {
    setModalMode('add');
    setGroupName('');
    setShowModal(true);
  };

  // 편집 버튼
  const handleEdit = (watchlist: Watchlist) => {
    setModalMode('edit');
    setEditingId(watchlist.id);
    setGroupName(watchlist.groupName);
    setShowModal(true);
  };

  // 삭제 버튼
  const handleDelete = (watchlist: Watchlist) => {
    setDeletingWatchlist(watchlist);
    setShowDeleteModal(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = () => {
    if (!deletingWatchlist) return;

    // 로컬에서만 삭제 (저장 시 실제 API 호출)
    const newList = localWatchlists.filter(w => w.id !== deletingWatchlist.id);
    setLocalWatchlists(newList);

    setHasChanges(true);
    setShowDeleteModal(false);
    setDeletingWatchlist(null);
  };

  // 삭제 취소
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingWatchlist(null);
  };

  // 모달 확인
  const handleModalConfirm = () => {
    if (!groupName.trim()) {
      toastManager.show('그룹 이름을 입력해주세요.', 'error');
      return;
    }

    if (modalMode === 'add') {
      // 새 그룹 추가 (로컬에만)
      const newWatchlist: Watchlist = {
        id: nextTempId.current--, // 임시 음수 ID 사용
        groupName: groupName.trim(),
        symbols: [],
        sortOrder: localWatchlists.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalWatchlists(prev => [...prev, newWatchlist]);
      toastManager.show(
        '그룹이 추가 예정입니다. 저장 버튼을 눌러주세요.',
        'info'
      );
    } else if (modalMode === 'edit' && editingId) {
      // 그룹 이름 수정 (로컬에만)
      setLocalWatchlists(prev =>
        prev.map(w =>
          w.id === editingId
            ? {
                ...w,
                groupName: groupName.trim(),
                updatedAt: new Date().toISOString(),
              }
            : w
        )
      );
      toastManager.show(
        '그룹 이름이 변경 예정입니다. 저장 버튼을 눌러주세요.',
        'info'
      );
    }

    setHasChanges(true);
    setShowModal(false);
    setGroupName('');
  };

  // 저장 버튼 클릭
  const handleSave = () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }
    setShowSaveModal(true);
  };

  // 저장 확인
  const handleSaveConfirm = async () => {
    setShowSaveModal(false);

    try {
      // 전체 관심그룹 목록을 PUT /api/watchlist/groups로 전송
      const groupsToSave = localWatchlists.map((item, index) => ({
        id: item.id > 0 ? item.id : undefined, // 기존 항목은 ID 포함, 새 항목은 undefined
        groupName: item.groupName,
        symbols: item.symbols,
        sortOrder: index + 1,
      }));

      await updateAllWatchlistGroups(groupsToSave);
      toastManager.show('변경사항이 저장되었습니다.', 'success');
      navigation.goBack();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '저장에 실패했습니다.';
      toastManager.show(message, 'error');
    }
  };

  // 저장 취소
  const handleSaveCancel = () => {
    setShowSaveModal(false);
  };

  // 취소 버튼
  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigation.goBack();
    }
  };

  // 취소 확인
  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigation.goBack();
  };

  // 취소 취소
  const handleCancelCancel = () => {
    setShowCancelModal(false);
  };

  const renderItem = (item: Watchlist, index: number) => {
    const isDragging = draggingIndex === index;
    const panResponder = createPanResponder(index);

    const animatedStyle = isDragging
      ? {
          transform: [{ translateY: dragY }, { scale: dragScale }],
          opacity: dragOpacity,
          zIndex: 1000,
        }
      : {};

    return (
      <Animated.View
        key={item.id}
        style={[styles.itemWrapper, animatedStyle]}
        onLayout={e => handleItemLayout(index, e)}
      >
        <Card style={[styles.itemCard, isDragging && styles.itemCardDragging]}>
          <View style={styles.itemContent}>
            {/* 그룹 정보 */}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.groupName}</Text>
            </View>

            {/* 액션 버튼 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.iconButton}
              >
                <Image
                  source={require('@/assets/pencil.png')}
                  style={[styles.iconImage, { tintColor: '#9E9E9E' }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.iconButton}
              >
                <Image
                  source={require('@/assets/delete.png')}
                  style={[styles.iconImage, { tintColor: '#FF6B6B' }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* 드래그 핸들 */}
            <View {...panResponder.panHandlers} style={styles.dragHandle}>
              <Text style={styles.dragHandleText}>☰</Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  if (loading && localWatchlists.length === 0) {
    return <LoadingSpinner message="관심종목을 불러오는 중..." />;
  }

  return (
    <View style={globalStyles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>관심종목 편집</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text
            style={[styles.saveButton, hasChanges && styles.saveButtonActive]}
          >
            저장
          </Text>
        </TouchableOpacity>
      </View>

      {/* 그룹 목록 */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.listContent}
        scrollEnabled={draggingIndex === null}
      >
        {localWatchlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>관심종목 그룹이 없습니다.</Text>
            <Text style={styles.emptySubText}>아래 버튼으로 추가해보세요.</Text>
          </View>
        ) : (
          localWatchlists.map((item, index) => renderItem(item, index))
        )}
      </ScrollView>

      {/* 추가 버튼 */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 새 그룹 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 추가/편집 모달 */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalMode === 'add' ? '그룹 추가' : '그룹 이름 변경'}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="그룹 이름을 입력하세요"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowModal(false);
                  setGroupName('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleModalConfirm}
              >
                <Text style={styles.modalButtonTextConfirm}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        visible={showDeleteModal}
        title="그룹 삭제"
        message={
          deletingWatchlist
            ? deletingWatchlist.symbols.length > 0
              ? `[${deletingWatchlist.groupName}] 그룹을 삭제하시겠습니까?\n\n이 그룹에 속한 종목도 함께 제거됩니다.`
              : `[${deletingWatchlist.groupName}] 그룹을 삭제하시겠습니까? \n 그룹에 속한 종목도 함께 제거됩니다.`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 취소 확인 모달 */}
      <ConfirmModal
        visible={showCancelModal}
        title="변경사항 취소"
        message="저장하지 않은 변경사항이 있습니다. 취소하시겠습니까?"
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelCancel}
        confirmText="취소"
        cancelText="계속 편집"
      />

      {/* 저장 확인 모달 */}
      <ConfirmModal
        visible={showSaveModal}
        title="변경사항 저장"
        message="변경사항을 모두 저장하시겠습니까?"
        onConfirm={handleSaveConfirm}
        onCancel={handleSaveCancel}
        confirmText="저장"
        cancelText="취소"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    fontSize: 16,
    color: '#8E8E93',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B3A57',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  saveButtonActive: {
    color: '#007AFF',
  },
  infoBox: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3C3C43',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemWrapper: {
    marginBottom: 8,
  },
  itemCard: {
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemCardDragging: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B3A57',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  iconImage: {
    width: 16,
    height: 16,
  },
  dragHandle: {
    padding: 4,
    paddingVertical: 8,
    marginLeft: 4,
  },
  dragHandleText: {
    fontSize: 20,
    color: '#C7C7CC',
    fontWeight: 'bold',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  addButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#3C3C43',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1B3A57',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F2F2F7',
  },
  modalButtonConfirm: {
    backgroundColor: '#1B3A57',
  },
  modalButtonTextCancel: {
    color: '#3C3C43',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditWatchlistScreen;
