import React from 'react';
import { FlatList, TouchableOpacity, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SurahListScreenProps, Surah, COLORS } from '../types';
import { surahs } from '../data/surahs';
import { useAudio } from '../contexts/AudioContext';

export function SurahListScreen({ reciter, onBack }: SurahListScreenProps) {
  const { currentSurah, currentReciter, playSurah } = useAudio();

  const handlePlaySurah = (surah: Surah) => {
    playSurah(surah, reciter);
  };

  const renderSurahItem = ({ item }: { item: Surah }) => {
    const isCurrentlyPlaying = currentSurah?.id === item.id && currentReciter?.id === reciter.id;
    return (
      <TouchableOpacity
        style={[styles.surahItem, isCurrentlyPlaying && styles.surahItemActive]}
        onPress={() => handlePlaySurah(item)}
        activeOpacity={0.7}
      >
        <View style={styles.surahNumberContainer}>
          <View style={[styles.surahNumber, isCurrentlyPlaying && styles.surahNumberActive]}>
            <Text style={[styles.surahNumberText, isCurrentlyPlaying && styles.surahNumberTextActive]}>
              {item.id}
            </Text>
          </View>
        </View>
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, isCurrentlyPlaying && styles.surahNameActive]}>
            {item.name}
          </Text>
          <Text style={styles.surahDetails}>
            {item.englishName} • {item.verses} verses
          </Text>
        </View>
        <View style={styles.surahArabicContainer}>
          <Text style={[styles.surahArabic, isCurrentlyPlaying && styles.surahArabicActive]}>
            {item.arabicName}
          </Text>
          <View
            style={[
              styles.revelationBadge,
              item.revelationType === 'Meccan' ? styles.meccanBadge : styles.medinanBadge,
            ]}
          >
            <Text style={styles.revelationText}>{item.revelationType}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>القرآن الكريم</Text>
          <Text style={styles.headerSubtitleGreen}>{reciter.arabicName}</Text>
        </View>
        <View style={styles.headerDecoration}>
          <Ionicons name="headset" size={28} color={COLORS.primary} />
        </View>
      </View>

      <FlatList
        data={surahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitleGreen: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
  headerDecoration: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
    marginRight: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 280,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  surahItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: COLORS.primary,
  },
  surahNumberContainer: {
    marginRight: 12,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  surahNumberActive: {
    backgroundColor: COLORS.primary,
  },
  surahNumberText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E2E8F0',
    transform: [{ rotate: '-45deg' }],
  },
  surahNumberTextActive: {
    color: COLORS.secondary,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  surahNameActive: {
    color: COLORS.primary,
  },
  surahDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  surahArabicContainer: {
    alignItems: 'flex-end',
  },
  surahArabic: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '500',
    marginBottom: 4,
  },
  surahArabicActive: {
    color: COLORS.primary,
  },
  revelationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  meccanBadge: {
    backgroundColor: COLORS.meccan,
  },
  medinanBadge: {
    backgroundColor: COLORS.medinan,
  },
  revelationText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
});
