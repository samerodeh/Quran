import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, SafeAreaView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Reciter, COLORS } from '../types';
import { reciters } from '../data/reciters';
import { SurahListScreen } from './SurahListScreen';

export function ListenSection() {
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);

  if (selectedReciter) {
    return <SurahListScreen reciter={selectedReciter} onBack={() => setSelectedReciter(null)} />;
  }

  const renderReciterItem = ({ item }: { item: Reciter }) => (
    <TouchableOpacity
      style={styles.reciterItem}
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
        <Text style={styles.reciterArabicName}>{item.arabicName}</Text>
        <Text style={styles.reciterName}>{item.name}</Text>
        {item.narration && (
          <Text style={styles.reciterNarration}>{item.narration}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerArabic}>استماع</Text>
        <Text style={styles.headerTitle}>Listen to Quran</Text>
        <Text style={styles.headerSubtitle}>Select a reciter</Text>
      </View>

      <FlatList
        data={reciters}
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
});
