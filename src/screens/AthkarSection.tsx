import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../types';



const { width } = Dimensions.get('window');

interface AthkarCategory {
  id: string;
  arabicName: string;
  color?: string;
  locked?: boolean;
}

interface AthkarButton {
  id: string;
  arabicName: string;
  color: string;
}

const mainButtons: AthkarButton[] = [
  { id: 'quran_duas', arabicName: 'أدعية من القرآن', color: COLORS.textSecondary },
  { id: 'prophet_duas', arabicName: 'من دعاء الرسول ﷺ', color: '#F59E0B' },
  { id: 'ruqyah_quran', arabicName: 'الرقية بالقرآن', color: '#10B981' },
  { id: 'ruqyah_sunnah', arabicName: 'الرقية بالسنة', color: COLORS.textSecondary },
  { id: 'tasabeeh', arabicName: 'تسابيح', color: '#3B82F6' },
  { id: 'more', arabicName: 'المزيد', color: '#10B981' },
];

const categories: AthkarCategory[] = [
  { id: 'loved_ones', arabicName: 'أذكار الأحبة', locked: true },
  { id: 'history', arabicName: 'التاريخ', locked: true },
  { id: 'friday', arabicName: 'الجمعة', locked: false },
  { id: 'kids', arabicName: 'أذكار للصغار', locked: true },
  { id: 'umrah', arabicName: 'العمرة', locked: true },
  { id: 'hajj', arabicName: 'الحج', locked: true },
  { id: 'athkar_card', arabicName: 'بطاقة الأذكار', locked: true },
  { id: 'athkar_book', arabicName: 'كتيب الأذكار', locked: true },
];

const topTabs = ['المنوعة', 'الصلاة', 'القبلة', 'المفضلة', 'العداد'];

export function AthkarSection() {
  const [activeTopTab, setActiveTopTab] = useState('المنوعة');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="play" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>أَذْكَار</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="bookmark-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Tabs */}
      <View style={styles.topTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topTabs}>
          {topTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.topTab, activeTopTab === tab && styles.topTabActive]}
              onPress={() => setActiveTopTab(tab)}
            >
              <Text style={[styles.topTabText, activeTopTab === tab && styles.topTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Buttons Grid */}
        <View style={styles.mainButtonsGrid}>
          {mainButtons.map((button, index) => (
            <TouchableOpacity
              key={button.id}
              style={[
                styles.mainButton,
                index % 2 === 0 ? styles.mainButtonLeft : styles.mainButtonRight,
              ]}
            >
              <Text style={[styles.mainButtonText, { color: button.color }]}>
                {button.arabicName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comprehensive Duas Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>يوم الجمعة</Text>
            <Text style={styles.sectionTitle}>أدعية شاملة</Text>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                index % 2 === 0 ? styles.categoryButtonLeft : styles.categoryButtonRight,
              ]}
            >
              <Text style={styles.categoryText}>{category.arabicName}</Text>
              {category.locked && (
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={14} color={COLORS.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Dua Etiquette */}
        <TouchableOpacity style={styles.etiquetteCard}>
          <Text style={styles.etiquetteText}>آداب الدعاء</Text>
        </TouchableOpacity>

        {/* Salawat Section */}
        <View style={styles.salawatCard}>
          <View style={styles.salawatHeader}>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreButtonText}>...</Text>
            </TouchableOpacity>
            <View style={styles.salawatTitleContainer}>
              <Text style={styles.salawatTitle}>أكثروا من الصلاة على النبي</Text>
              <Text style={styles.salawatEmoji}> ﷺ</Text>
            </View>
          </View>
          <Text style={styles.salawatText}>
            اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، وَبَارِكْ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C9A962',
    fontFamily: 'System',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  topTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topTabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  topTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  topTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  topTabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mainButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mainButton: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  mainButtonLeft: {
    marginRight: 6,
  },
  mainButtonRight: {
    marginLeft: 6,
  },
  mainButtonText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryButton: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonLeft: {
    marginRight: 6,
  },
  categoryButtonRight: {
    marginLeft: 6,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  lockIcon: {
    marginLeft: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 4,
  },
  etiquetteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  etiquetteText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  salawatCard: {
    backgroundColor: '#1A3A4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  salawatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  salawatTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salawatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  salawatEmoji: {
    fontSize: 16,
    color: '#C9A962',
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  salawatText: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 32,
    textAlign: 'right',
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 100,
  },
});

