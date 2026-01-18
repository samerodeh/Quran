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
import { useI18n } from '../contexts/I18nContext';

export function SettingsScreen({ onBack }: { onBack?: () => void }) {
  const { settings, setAutoPlayNext, setShufflePlay, setDisplayLanguage } = useSettings();
  const { t } = useI18n();

  const displayLanguageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === settings.displayLanguage);
  const primaryLanguageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === settings.primaryLanguage);
  const secondaryLanguageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === settings.secondaryLanguage);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <Text style={styles.headerSubtitle}>v1.0.2 (OTA)</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="settings" size={28} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Playback Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.playback')}</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('settings.autoPlayNext')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.autoPlayNextDesc')}
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
              <Text style={styles.settingTitle}>{t('settings.shufflePlay')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.shufflePlayDesc')}
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
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('settings.primaryLanguage')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.alwaysArabic')}
              </Text>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageBadgeText}>{primaryLanguageInfo?.nativeName}</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('settings.secondaryLanguage')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.alwaysEnglish')}
              </Text>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageBadgeText}>{secondaryLanguageInfo?.nativeName}</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{t('settings.displayLanguage')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.displayLanguageDesc')}
              </Text>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageBadgeText}>
                {displayLanguageInfo?.nativeName} ({displayLanguageInfo?.name})
              </Text>
            </View>
          </View>
        </View>

        {/* Language Selection List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختر اللغة / Choose Language</Text>
          <View style={styles.languageList}>
            {AVAILABLE_LANGUAGES.map((language) => (
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
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    paddingTop: 8,
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

