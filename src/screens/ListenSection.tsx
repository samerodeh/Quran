import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Text, SafeAreaView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Reciter, COLORS } from '../types';
import { reciters } from '../data/reciters';
import { SurahListScreen } from './SurahListScreen';
import { useFavorites } from '../contexts/FavoritesContext';

export function ListenSection() {
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Sort reciters: favorites first, then others
  const sortedReciters = useMemo(() => {
    const favorites: Reciter[] = [];
    const others: Reciter[] = [];
    
    reciters.forEach(reciter => {
      if (isFavorite(reciter.id)) {
        favorites.push(reciter);
      } else {
        others.push(reciter);
      }
    });
    
    return [...favorites, ...others];
  }, [isFavorite]);

  if (selectedReciter) {
    return <SurahListScreen reciter={selectedReciter} onBack={() => setSelectedReciter(null)} />;
  }

  const handleFavoritePress = (e: any, reciterId: string) => {
    e.stopPropagation();
    toggleFavorite(reciterId);
  };

  const renderReciterItem = ({ item }: { item: Reciter }) => {
    const favorite = isFavorite(item.id);
    return (
      <TouchableOpacity
        style={[styles.reciterItem, favorite && styles.reciterItemFavorite]}
        onPress={() => setSelectedReciter(item)}
        activeOpacity={0.7}
      >
        <View style={styles.reciterIcon}>
          <Ionicons 
            name={item.isLocal ? 'mic' : 'headset'} 
            size={24} 
            color={item.isLocal ? COLORS.accent : COLORS.primary} 
          />
        </View>
        <View style={styles.reciterInfo}>
          <View style={styles.reciterNameRow}>
            <Text style={styles.reciterArabicName}>{item.arabicName}</Text>
            {favorite && (
              <Ionicons name="star" size={14} color={COLORS.primary} style={styles.favoriteStar} />
            )}
          </View>
          <Text style={styles.reciterName}>{item.name}</Text>
          {item.narration && (
            <Text style={styles.reciterNarration}>{item.narration}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => handleFavoritePress(e, item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={favorite ? 'star' : 'star-outline'} 
            size={22} 
            color={favorite ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerArabic}>استماع</Text>
        <Text style={styles.headerTitle}>Listen to Quran</Text>
        <Text style={styles.headerSubtitle}>Select a reciter</Text>
        {sortedReciters.some(r => isFavorite(r.id)) && (
          <View style={styles.favoritesHint}>
            <Ionicons name="star" size={12} color={COLORS.primary} />
            <Text style={styles.favoritesHintText}>Favorites appear first</Text>
          </View>
        )}
      </View>

      <FlatList
        data={sortedReciters}
        keyExtractor={(item) => item.id}
        renderItem={renderReciterItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerArabic: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reciterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reciterInfo: {
    flex: 1,
  },
  reciterArabicName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  reciterName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  reciterNarration: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  reciterItemFavorite: {
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
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
