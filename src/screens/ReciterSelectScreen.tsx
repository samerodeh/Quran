import React, { useMemo } from 'react';
import { FlatList, TouchableOpacity, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ReciterSelectScreenProps, Reciter, COLORS } from '../types';
import { hafsReciters, warshReciters } from '../data/reciters';
import { useFavorites } from '../contexts/FavoritesContext';

export function ReciterSelectScreen({ narration, onSelectReciter, onBack }: ReciterSelectScreenProps) {
  const allReciters = narration === 'warsh' ? warshReciters : hafsReciters;
  const narrationName = narration === 'warsh' ? 'ورش عن نافع' : 'حفص عن عاصم';
  const narrationEnglish = narration === 'warsh' ? 'Warsh' : 'Hafs';
  const { isFavorite, toggleFavorite } = useFavorites();

  // Sort reciters: favorites first, then others
  const reciters = useMemo(() => {
    const favorites: Reciter[] = [];
    const others: Reciter[] = [];
    
    allReciters.forEach(reciter => {
      if (isFavorite(reciter.id)) {
        favorites.push(reciter);
      } else {
        others.push(reciter);
      }
    });
    
    return [...favorites, ...others];
  }, [allReciters, isFavorite]);

  const handleFavoritePress = (e: any, reciterId: string) => {
    e.stopPropagation();
    toggleFavorite(reciterId);
  };

  const renderReciterItem = ({ item }: { item: Reciter }) => {
    const favorite = isFavorite(item.id);
    return (
      <TouchableOpacity
        style={[styles.reciterCard, favorite && styles.reciterCardFavorite]}
        onPress={() => onSelectReciter(item)}
        activeOpacity={0.8}
      >
        <View style={styles.reciterImageContainer}>
          <Text style={styles.reciterEmoji}>🎙️</Text>
        </View>
        <View style={styles.reciterInfo}>
          <View style={styles.reciterNameRow}>
            <Text style={styles.reciterArabicName}>{item.arabicName}</Text>
            {favorite && (
              <Ionicons name="star" size={16} color={COLORS.primary} style={styles.favoriteStar} />
            )}
          </View>
          <Text style={styles.reciterEnglishName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => handleFavoritePress(e, item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={favorite ? 'star' : 'star-outline'} 
            size={24} 
            color={favorite ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.reciterHeaderWithBack}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.reciterHeaderContent}>
          <Text style={styles.reciterHeaderTitle}>القرآن الكريم</Text>
          <Text style={styles.reciterHeaderSubtitleGreen}>
            {narrationName} • {narrationEnglish}
          </Text>
        </View>
        <View style={styles.reciterHeaderIconSmall}>
          <Ionicons name="headset" size={28} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.reciterSection}>
        <Text style={styles.reciterSectionTitle}>اختر القارئ</Text>
        <Text style={styles.reciterSectionSubtitle}>Choose a Reciter</Text>
        {reciters.some(r => isFavorite(r.id)) && (
          <View style={styles.favoritesHint}>
            <Ionicons name="star" size={14} color={COLORS.primary} />
            <Text style={styles.favoritesHintText}>Favorites appear first</Text>
          </View>
        )}
      </View>

      <FlatList
        data={reciters}
        renderItem={renderReciterItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reciterList}
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
  reciterHeaderWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reciterHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reciterHeaderSubtitleGreen: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
  reciterHeaderIconSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reciterHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reciterSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  reciterSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  reciterSectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  reciterList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  reciterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reciterImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reciterEmoji: {
    fontSize: 28,
  },
  reciterInfo: {
    flex: 1,
  },
  reciterArabicName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  reciterEnglishName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  reciterCardFavorite: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  reciterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favoriteStar: {
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  favoritesHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  favoritesHintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
