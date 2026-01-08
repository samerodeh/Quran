import React from 'react';
import { FlatList, TouchableOpacity, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { QiraatSelectScreenProps, Qiraa, COLORS } from '../types';


import { qiraat } from '../data/qiraat';

export function QiraatSelectScreen({ onSelectQiraa }: QiraatSelectScreenProps) {
  const renderQiraaItem = ({ item }: { item: Qiraa }) => (
    <TouchableOpacity
      style={styles.qiraaCard}
      onPress={() => onSelectQiraa(item)}
      activeOpacity={0.8}
    >
      <View style={styles.qiraaIconContainer}>
        <Ionicons name="book-outline" size={32} color={COLORS.primary} />
      </View>
      <View style={styles.qiraaInfo}>
        <Text style={styles.qiraaArabicName}>{item.arabicName}</Text>
        <Text style={styles.qiraaEnglishName}>{item.name}</Text>
        <Text style={styles.qiraaDescription}>{item.arabicDescription}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.readHeader}>
        <View style={styles.readHeaderIcon}>
          <Ionicons name="book" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.readHeaderTitle}>القرآن الكريم</Text>
        <Text style={styles.readHeaderSubtitle}>Choose Your Mushaf</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>اختر المصحف</Text>
        <Text style={styles.sectionSubtitle}>Select Mushaf Edition</Text>
      </View>

      <FlatList
        data={qiraat}
        renderItem={renderQiraaItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.qiraaList}
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
  readHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  readHeaderIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  readHeaderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  readHeaderSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  qiraaList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  qiraaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qiraaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  qiraaInfo: {
    flex: 1,
  },
  qiraaArabicName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  qiraaEnglishName: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  qiraaDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
