import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, Text, SafeAreaView, View, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SurahListScreenProps, Surah, COLORS } from '../types';


import { surahs } from '../data/surahs';
import { useAudio } from '../contexts/AudioContext';
import { useDownload } from '../contexts/DownloadContext';

export function SurahListScreen({ reciter, onBack }: SurahListScreenProps) {
  const { currentSurah, currentReciter, playSurah, setIsPlayerExpanded } = useAudio();
  const { isDownloaded, isDownloading, getDownloadProgress, downloadSurah, deleteSurah, getDownloadedCount } = useDownload();
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-expand player when on this screen
  useEffect(() => {
    setIsPlayerExpanded(true);
    return () => {
      setIsPlayerExpanded(false);
    };
  }, [setIsPlayerExpanded]);

  // Filter surahs based on search query
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    
    const query = searchQuery.toLowerCase().trim();
    return surahs.filter((surah) => {
      if (surah.id.toString() === query) return true;
      if (surah.name.toLowerCase().includes(query)) return true;
      if (surah.englishName.toLowerCase().includes(query)) return true;
      if (surah.arabicName.includes(query)) return true;
      return false;
    });
  }, [searchQuery]);

  const handlePlaySurah = (surah: Surah) => {
    playSurah(surah, reciter);
  };

  const handleDownload = (surah: Surah) => {
    if (reciter.isLocal) return; // Local reciters don't need downloads
    downloadSurah(surah, reciter);
  };

  const handleDelete = (surah: Surah) => {
    Alert.alert(
      'Delete Download',
      `Remove downloaded audio for ${surah.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSurah(reciter.id, surah.id)
        },
      ]
    );
  };

  const downloadedCount = getDownloadedCount(reciter.id);

  const renderSurahItem = ({ item }: { item: Surah }) => {
    const isCurrentlyPlaying = currentSurah?.id === item.id && currentReciter?.id === reciter.id;
    const downloaded = isDownloaded(reciter.id, item.id);
    const downloading = isDownloading(reciter.id, item.id);
    const progress = getDownloadProgress(reciter.id, item.id);
    const isLocalReciter = reciter.isLocal;

    return (
      <View style={[styles.surahItem, isCurrentlyPlaying && styles.surahItemActive]}>
        <TouchableOpacity
          style={styles.surahMainContent}
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
            <View style={styles.surahDetailsRow}>
              <Text style={styles.surahDetails}>
                {item.englishName} • {item.verses} verses
              </Text>
              {downloaded && !isLocalReciter && (
                <View style={styles.downloadedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
                  <Text style={styles.downloadedText}>Offline</Text>
                </View>
              )}
            </View>
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

        {/* Download button - only show for non-local reciters */}
        {!isLocalReciter && (
          <View style={styles.downloadSection}>
            {downloading ? (
              <View style={styles.downloadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.downloadProgressText}>{Math.round(progress)}%</Text>
              </View>
            ) : downloaded ? (
              <TouchableOpacity
                style={styles.downloadedButton}
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="cloud-done" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownload(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="cloud-download-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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
          <Text style={styles.headerSubtitleGreen}>
            {reciter.arabicName}
            {!reciter.isLocal && downloadedCount > 0 && ` • ${downloadedCount} offline`}
          </Text>
        </View>
        <View style={styles.headerDecoration}>
          <Ionicons name="headset" size={28} color={COLORS.primary} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search surah by name or number..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredSurahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No surahs found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.secondary,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 280,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  surahMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
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
  surahDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  surahDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  downloadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  downloadedText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
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
  downloadSection: {
    paddingRight: 14,
    paddingLeft: 8,
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadingContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadProgressText: {
    fontSize: 8,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
