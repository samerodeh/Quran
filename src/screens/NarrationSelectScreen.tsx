import React from 'react';
import { View, TouchableOpacity, Text, SafeAreaView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NarrationSelectScreenProps, COLORS } from '../types';



export function NarrationSelectScreen({ onSelectNarration }: NarrationSelectScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.reciterHeader}>
        <View style={styles.reciterHeaderIcon}>
          <Ionicons name="headset" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.reciterHeaderTitle}>القرآن الكريم</Text>
        <Text style={styles.reciterHeaderSubtitle}>The Holy Quran</Text>
      </View>

      <View style={styles.reciterSection}>
        <Text style={styles.reciterSectionTitle}>اختر الرواية</Text>
        <Text style={styles.reciterSectionSubtitle}>Choose Narration Style</Text>
      </View>

      <View style={styles.narrationList}>
        <TouchableOpacity
          style={styles.narrationCard}
          onPress={() => onSelectNarration('hafs')}
          activeOpacity={0.8}
        >
          <View style={styles.narrationIconContainer}>
            <Text style={styles.narrationIcon}>📖</Text>
          </View>
          <View style={styles.narrationInfo}>
            <Text style={styles.narrationArabicName}>حفص عن عاصم</Text>
            <Text style={styles.narrationEnglishName}>Hafs</Text>
            <Text style={styles.narrationDescription}>Most common worldwide</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.narrationCard}
          onPress={() => onSelectNarration('warsh')}
          activeOpacity={0.8}
        >
          <View style={styles.narrationIconContainer}>
            <Text style={styles.narrationIcon}>📗</Text>
          </View>
          <View style={styles.narrationInfo}>
            <Text style={styles.narrationArabicName}>ورش عن نافع</Text>
            <Text style={styles.narrationEnglishName}>Warsh</Text>
            <Text style={styles.narrationDescription}>North & West Africa</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  reciterHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  reciterHeaderIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  reciterHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  reciterHeaderSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
  narrationList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  narrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  narrationIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  narrationIcon: {
    fontSize: 28,
  },
  narrationInfo: {
    flex: 1,
  },
  narrationArabicName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  narrationEnglishName: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 2,
  },
  narrationDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
