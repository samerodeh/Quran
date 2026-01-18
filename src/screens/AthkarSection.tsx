import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../types';
import { morningAthkar, eveningAthkar, AthkarItem } from '../data/athkar';

const { width, height } = Dimensions.get('window');


export function AthkarSection() {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [morningCounts, setMorningCounts] = useState<Record<string, number>>({});
  const [eveningCounts, setEveningCounts] = useState<Record<string, number>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const currentItems = activeTab === 'morning' 
    ? morningAthkar[0].items 
    : eveningAthkar[0].items;

  const currentItem = currentItems[currentIndex];
  const currentCounts = activeTab === 'morning' ? morningCounts : eveningCounts;
  const currentCount = currentCounts[currentItem?.id] || 0;

  const handleCountChange = (id: string, count: number, type: 'morning' | 'evening') => {
    if (type === 'morning') {
      setMorningCounts((prev) => ({ ...prev, [id]: count }));
    } else {
      setEveningCounts((prev) => ({ ...prev, [id]: count }));
    }
  };

  const goToNext = () => {
    if (currentIndex < currentItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleIncrement = (itemId?: string) => {
    // Use provided itemId or fall back to current item
    const targetItem = itemId 
      ? currentItems.find(item => item.id === itemId) 
      : currentItem;
    
    if (!targetItem) return;
    
    const targetCounts = activeTab === 'morning' ? morningCounts : eveningCounts;
    const targetCount = targetCounts[targetItem.id] || 0;
    
    if (targetCount < targetItem.count) {
      const newCount = targetCount + 1;
      handleCountChange(targetItem.id, newCount, activeTab);
      
      // Auto-advance to next page when goal is reached
      if (newCount >= targetItem.count) {
        const itemIndex = currentItems.findIndex(item => item.id === targetItem.id);
        if (itemIndex >= 0 && itemIndex < currentItems.length - 1) {
          setTimeout(() => {
            setCurrentIndex(itemIndex + 1);
          }, 300); // Small delay for visual feedback
        }
      }
    }
  };

  const handleReset = () => {
    handleCountChange(currentItem.id, 0, activeTab);
  };

  // Handle scroll to update current index
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== currentIndex && index >= 0 && index < currentItems.length) {
      setCurrentIndex(index);
    }
  };

  // Scroll to current index when it changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentIndex * width,
        animated: true,
      });
    }
  }, [currentIndex]);

  const getCountText = () => {
    const counts: { [key: number]: string } = {
      1: 'مرة واحدة',
      3: 'ثلاث مرات',
      4: 'أربع مرات',
      7: 'سبع مرات',
      100: 'مئة مرة',
    };
    return counts[currentItem?.count] || `${currentItem?.count} مرة`;
  };

  // Reset index when switching tabs
  const handleTabChange = (tab: 'morning' | 'evening') => {
    setActiveTab(tab);
    setCurrentIndex(0);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: 0,
        animated: false,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {activeTab === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}
        </Text>

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={goToNext}
          disabled={currentIndex >= currentItems.length - 1}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={currentIndex >= currentItems.length - 1 ? COLORS.border : COLORS.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Tab Selector Below Header */}
      <View style={styles.tabSelectorContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'morning' && styles.tabActive]}
          onPress={() => handleTabChange('morning')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'morning' && styles.tabTextActive,
            ]}
          >
            أذكار الصباح
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'evening' && styles.tabActive]}
          onPress={() => handleTabChange('evening')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'evening' && styles.tabTextActive,
            ]}
          >
            أذكار المساء
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Content Area */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.horizontalScrollView}
        scrollEnabled={true}
      >
        {currentItems.map((item, index) => {
          const itemCounts = activeTab === 'morning' ? morningCounts : eveningCounts;
          const itemCount = itemCounts[item.id] || 0;
          
          return (
            <View key={item.id} style={styles.pageContainer}>
              <Pressable
                style={styles.contentArea}
                onPress={() => handleIncrement(item.id)}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
              >
                <ScrollView 
                  style={styles.content}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {(item.id === 'm1' || item.id === 'm2' || item.id === 'e1' || item.id === 'e2' || 
                    item.id === 'e2b' || item.id === 'e2c' || item.id === 'e2d') ? (
                    <Text style={styles.bismillah}>
                      {item.id === 'm1' || item.id === 'e1' 
                        ? 'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ'
                        : item.id === 'e2b' || item.id === 'e2c' || item.id === 'e2d'
                        ? 'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ'
                        : 'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ'}
                    </Text>
                  ) : null}

                  {/* Main Arabic Text */}
                  <Text style={styles.athkarArabic}>{item.arabic}</Text>

                  {/* Virtue/Benefit Text */}
                  {item.virtue && (
                    <Text style={styles.athkarVirtue}>{item.virtue}</Text>
                  )}

                  {/* Reference */}
                  {item.reference && (
                    <Text style={styles.athkarReference}>
                      {item.reference.includes('/') 
                        ? `(${item.reference})` 
                        : `(رواه ${item.reference})`}
                    </Text>
                  )}

                  {/* Separator Line */}
                  <View style={styles.separator} />

                  {/* Repetition Instruction */}
                  <Text style={styles.repetitionText}>
                    {(() => {
                      const counts: { [key: number]: string } = {
                        1: 'مرة واحدة',
                        3: 'ثلاث مرات',
                        4: 'أربع مرات',
                        7: 'سبع مرات',
                        10: 'عشر مرات',
                        100: 'مئة مرة',
                      };
                      return counts[item.count] || `${item.count} مرة`;
                    })()}
                  </Text>
                </ScrollView>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Control Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.itemCounter}>
            {currentItems.length}/{currentIndex + 1}
          </Text>
          <TouchableOpacity style={styles.starButton}>
            <Ionicons name="star-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCenter}>
          <TouchableOpacity 
            style={[styles.countCircle, currentCount >= currentItem?.count && styles.countCircleComplete]}
            onPress={() => handleIncrement()}
            disabled={currentCount >= currentItem?.count}
          >
            <Text style={[styles.countCircleText, currentCount >= currentItem?.count && styles.countCircleTextComplete]}>
              {currentCount >= currentItem?.count ? currentItem?.count : currentCount}
            </Text>
          </TouchableOpacity>
          <Text style={styles.speedText}>1x</Text>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressIndicator}>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {currentItems.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  nextButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalScrollView: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  bismillah: {
    fontSize: 18,
    color: '#60A5FA', // Light blue color
    textAlign: 'right',
    marginBottom: 20,
    lineHeight: 32,
  },
  athkarArabic: {
    fontSize: 24,
    color: COLORS.text,
    textAlign: 'right',
    lineHeight: 42,
    marginBottom: 16,
    fontFamily: 'System',
  },
  athkarVirtue: {
    fontSize: 15,
    color: '#60A5FA', // Light blue color
    textAlign: 'right',
    lineHeight: 26,
    marginTop: 16,
    marginBottom: 12,
  },
  athkarReference: {
    fontSize: 14,
    color: '#60A5FA', // Light blue color
    textAlign: 'right',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 20,
  },
  repetitionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'right',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemCounter: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  starButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  countCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  countCircleComplete: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  countCircleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  countCircleTextComplete: {
    color: COLORS.secondary,
  },
  speedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressIndicator: {
    alignItems: 'center',
    paddingBottom: 8,
    backgroundColor: COLORS.surface,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
