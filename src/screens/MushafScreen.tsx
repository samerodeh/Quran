import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Text, SafeAreaView, Image, FlatList, Modal, StyleSheet, Dimensions, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MushafScreenProps, COLORS, TOTAL_PAGES, Surah } from '../types';
import { getLocalMushafImage } from '../data/mushafImages';
import { JUZ_PAGES, SURAH_PAGES } from '../data/qiraat';
import { surahs } from '../data/surahs';
import { useAudio } from '../contexts/AudioContext';

const { width, height } = Dimensions.get('window');

export function MushafScreen({ qiraa, onBack }: MushafScreenProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showNav, setShowNav] = useState(true);
  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const { showMiniPlayer } = useAudio();

  const pageNumbers = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

  // Filter surahs based on search query
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return surahs;
    
    const query = surahSearchQuery.toLowerCase().trim();
    return surahs.filter((surah) => {
      if (surah.id.toString() === query) return true;
      if (surah.name.toLowerCase().includes(query)) return true;
      if (surah.englishName.toLowerCase().includes(query)) return true;
      if (surah.arabicName.includes(query)) return true;
      return false;
    });
  }, [surahSearchQuery]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item);
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= TOTAL_PAGES) {
      flatListRef.current?.scrollToIndex({ index: pageNum - 1, animated: false });
      setShowJuzPicker(false);
      setShowSurahPicker(false);
      setSurahSearchQuery('');
    }
  };

  const toggleNav = () => setShowNav(!showNav);

  const getCurrentJuz = () => {
    for (let i = JUZ_PAGES.length - 1; i >= 0; i--) {
      const juz = JUZ_PAGES[i];
      if (juz && currentPage >= juz.page) {
        return juz;
      }
    }
    return JUZ_PAGES[0] || { juz: 1, page: 1, name: 'الجزء الأول', surah: 'الفاتحة' };
  };

  // Calculate bottom padding based on whether audio player is visible
  const bottomPadding = showMiniPlayer ? 140 : 0;

  const renderPage = ({ item: pageNum }: { item: number }) => {
    const localImage = getLocalMushafImage(pageNum, qiraa.id);

    return (
      <TouchableOpacity style={[styles.pageContainer, { height: height - 140 - bottomPadding }]} activeOpacity={1} onPress={toggleNav}>
        <View style={styles.mushafPage}>
          <Image source={localImage} style={styles.mushafImage} resizeMode="contain" />
        </View>

        <View style={styles.pageNumberOverlay}>
          <Text style={styles.pageNumberText}>{pageNum}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        goToPage((SURAH_PAGES as any)[item.id] || 1);
        setShowSurahPicker(false);
      }}
    >
      <View style={styles.pickerItemNumber}>
        <Text style={styles.pickerItemNumberText}>{item.id}</Text>
      </View>
      <View style={styles.pickerItemInfo}>
        <Text style={styles.pickerItemName}>{item.arabicName}</Text>
        <Text style={styles.pickerItemDetail}>
          {item.name} • {item.verses} آية
        </Text>
      </View>
      <Text style={styles.surahPageNum}>ص {(SURAH_PAGES as any)[item.id] || 1}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mushafContainer}>
      {showNav && (
        <SafeAreaView style={styles.mushafHeaderSafe}>
          <View style={styles.mushafHeader}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.mushafTitle}>{qiraa.arabicName}</Text>
              <Text style={styles.mushafSubtitle}>
                {getCurrentJuz()?.name || ''} - الجزء {getCurrentJuz()?.juz || 1}
              </Text>
            </View>

            <TouchableOpacity style={styles.menuButton} onPress={() => setShowSurahPicker(true)}>
              <Ionicons name="list" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      <FlatList
        ref={flatListRef}
        data={pageNumbers}
        renderItem={renderPage}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        inverted
        style={{ marginBottom: bottomPadding }}
      />

      {showNav && (
        <View style={[styles.mushafBottomNav, { bottom: bottomPadding }]}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <Ionicons
              name="chevron-forward"
              size={28}
              color={currentPage === 1 ? COLORS.border : COLORS.text}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.pageIndicatorButton} onPress={() => setShowJuzPicker(true)}>
            <Text style={styles.pageIndicatorText}>
              صفحة {currentPage} من {TOTAL_PAGES}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => goToPage(Math.min(TOTAL_PAGES, currentPage + 1))}
            disabled={currentPage === TOTAL_PAGES}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={currentPage === TOTAL_PAGES ? COLORS.border : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Juz Picker Modal */}
      <Modal visible={showJuzPicker} transparent animationType="slide" onRequestClose={() => setShowJuzPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>اختر الجزء</Text>
              <TouchableOpacity onPress={() => setShowJuzPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={JUZ_PAGES}
              keyExtractor={(item) => item.juz.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    currentPage >= item.page &&
                      (JUZ_PAGES.find((j) => j.juz === item.juz + 1)?.page || TOTAL_PAGES + 1) > currentPage &&
                      styles.pickerItemActive,
                  ]}
                  onPress={() => goToPage(item.page)}
                >
                  <View style={styles.pickerItemNumber}>
                    <Text style={styles.pickerItemNumberText}>{item.juz}</Text>
                  </View>
                  <View style={styles.pickerItemInfo}>
                    <Text style={styles.pickerItemName}>{item.name}</Text>
                    <Text style={styles.pickerItemDetail}>
                      صفحة {item.page} • {item.surah}
                    </Text>
                  </View>
                  <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Surah Picker Modal with Search */}
      <Modal
        visible={showSurahPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowSurahPicker(false);
          setSurahSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>اختر السورة</Text>
              <TouchableOpacity onPress={() => {
                setShowSurahPicker(false);
                setSurahSearchQuery('');
              }}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search surah..."
                placeholderTextColor={COLORS.textSecondary}
                value={surahSearchQuery}
                onChangeText={setSurahSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {surahSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSurahSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredSurahs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSurahItem}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={40} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>No surahs found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mushafContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mushafHeaderSafe: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mushafHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  mushafTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mushafSubtitle: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContainer: {
    width: width,
    backgroundColor: '#F5F0E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mushafPage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mushafImage: {
    width: width,
    height: '100%',
  },
  pageNumberOverlay: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mushafBottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageIndicatorButton: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pageIndicatorText: {
    fontSize: 14,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pickerItemNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pickerItemNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '500',
  },
  pickerItemDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  surahPageNum: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
