import React from 'react';
import { FlatList, TouchableOpacity, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ReciterSelectScreenProps, Reciter, COLORS } from '../types';
import { hafsReciters, warshReciters } from '../data/reciters';

export function ReciterSelectScreen({ narration, onSelectReciter, onBack }: ReciterSelectScreenProps) {
  const reciters = narration === 'warsh' ? warshReciters : hafsReciters;
  const narrationName = narration === 'warsh' ? 'ورش عن نافع' : 'حفص عن عاصم';
  const narrationEnglish = narration === 'warsh' ? 'Warsh' : 'Hafs';

  const renderReciterItem = ({ item }: { item: Reciter }) => (
    <TouchableOpacity
      style={styles.reciterCard}
      onPress={() => onSelectReciter(item)}
      activeOpacity={0.8}
    >
      <View style={styles.reciterImageContainer}>
        <Text style={styles.reciterEmoji}>🎙️</Text>
      </View>
      <View style={styles.reciterInfo}>
        <Text style={styles.reciterArabicName}>{item.arabicName}</Text>
        <Text style={styles.reciterEnglishName}>{item.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

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
});
