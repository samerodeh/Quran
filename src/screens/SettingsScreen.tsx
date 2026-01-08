import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../types';
import { useSettings, AVAILABLE_LANGUAGES } from '../contexts/SettingsContext';

export function SettingsScreen({ onBack }: { onBack?: () => void }) {
  const { settings, setAutoPlayNext, setShufflePlay, setDisplayLanguage } = useSettings();

  const displayLanguageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === settings.displayLanguage);
  const primaryLanguageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === settings.primaryLanguage);
  const secondaryLanguageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === settings.secondaryLanguage);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <Text style={styles.headerSubtitle}>Settings • v1.0.2 (OTA)</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="settings" size={28} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Playback Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات التشغيل</Text>
          <Text style={styles.sectionSubtitle}>Playback Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>التشغيل التلقائي للسورة التالية</Text>
              <Text style={styles.settingSubtitle}>Auto-play Next Surah</Text>
              <Text style={styles.settingDescription}>
                تشغيل السورة التالية تلقائياً عند انتهاء السورة الحالية
              </Text>
              <Text style={styles.settingDescriptionEnglish}>
                Automatically play the next surah when the current one ends
              </Text>
            </View>
            <Switch
              value={settings.autoPlayNext}
              onValueChange={setAutoPlayNext}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>التشغيل العشوائي</Text>
              <Text style={styles.settingSubtitle}>Shuffle Play</Text>
              <Text style={styles.settingDescription}>
                تشغيل سورة عشوائية عند انتهاء السورة الحالية
              </Text>
              <Text style={styles.settingDescriptionEnglish}>
                Play a random surah when the current one ends
              </Text>
            </View>
            <Switch
              value={settings.shufflePlay}
              onValueChange={setShufflePlay}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </View>
        </View>

        {/* Language Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات اللغة</Text>
          <Text style={styles.sectionSubtitle}>Language Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>اللغة الأساسية</Text>
              <Text style={styles.settingSubtitle}>Primary Language</Text>
              <Text style={styles.settingDescription}>
                {primaryLanguageInfo?.nativeName} - {primaryLanguageInfo?.name}
              </Text>
              <Text style={styles.settingDescriptionEnglish}>
                Always Arabic (العربية)
              </Text>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageBadgeText}>{primaryLanguageInfo?.nativeName}</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>اللغة الثانوية</Text>
              <Text style={styles.settingSubtitle}>Secondary Language</Text>
              <Text style={styles.settingDescription}>
                {secondaryLanguageInfo?.nativeName} - {secondaryLanguageInfo?.name}
              </Text>
              <Text style={styles.settingDescriptionEnglish}>
                Always English
              </Text>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageBadgeText}>{secondaryLanguageInfo?.nativeName}</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>لغة العرض</Text>
              <Text style={styles.settingSubtitle}>Display Language</Text>
              <Text style={styles.settingDescription}>
                اختر اللغة التي تريد عرضها مع العربية والإنجليزية
              </Text>
              <Text style={styles.settingDescriptionEnglish}>
                Choose the language to display alongside Arabic and English
              </Text>
            </View>
            <TouchableOpacity
              style={styles.languageSelector}
              onPress={() => {
                // Show language picker modal
                // For now, cycle through available languages (excluding English as it's always secondary)
                const availableForDisplay = AVAILABLE_LANGUAGES.filter(lang => lang.code !== 'en');
                const currentIndex = availableForDisplay.findIndex(lang => lang.code === settings.displayLanguage);
                const nextIndex = (currentIndex + 1) % availableForDisplay.length;
                const nextLanguage = availableForDisplay[nextIndex];
                if (nextLanguage) {
                  setDisplayLanguage(nextLanguage.code);
                }
              }}
            >
              <Text style={styles.languageSelectorText}>
                {displayLanguageInfo?.nativeName} ({displayLanguageInfo?.name})
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Picker Modal would go here - simplified for now */}
        <View style={styles.languageList}>
          {AVAILABLE_LANGUAGES.filter(lang => lang.code !== 'en').map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                settings.displayLanguage === language.code && styles.languageOptionActive,
              ]}
              onPress={() => setDisplayLanguage(language.code)}
            >
              <Text style={[
                styles.languageOptionText,
                settings.displayLanguage === language.code && styles.languageOptionTextActive,
              ]}>
                {language.nativeName} ({language.name})
              </Text>
              {settings.displayLanguage === language.code && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerIcon: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  settingDescriptionEnglish: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  languageBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  languageBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  languageSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  languageList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  languageOptionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  languageOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

