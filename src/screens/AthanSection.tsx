import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Muezzin, PrayerName, COLORS } from '../types';
import { athans } from '../data/athans';
import { useAthan } from '../contexts/AthanContext';

const PRAYER_LABELS: Record<PrayerName, { english: string; arabic: string }> = {
  fajr: { english: 'Fajr', arabic: 'الفجر' },
  dhuhr: { english: 'Dhuhr', arabic: 'الظهر' },
  asr: { english: 'Asr', arabic: 'العصر' },
  maghrib: { english: 'Maghrib', arabic: 'المغرب' },
  isha: { english: 'Isha', arabic: 'العشاء' },
};

export function AthanSection() {
  const {
    settings,
    prayerTimes,
    isLoadingLocation,
    locationError,
    currentlyPlaying,
    isPlaying,
    setSelectedMuezzin,
    toggleAthanEnabled,
    togglePrayerNotification,
    playAthan,
    stopAthan,
    refreshPrayerTimes,
  } = useAthan();

  const renderMuezzinItem = ({ item }: { item: Muezzin }) => {
    const isSelected = settings.selectedMuezzin?.id === item.id;
    const isCurrentlyPlaying = currentlyPlaying?.id === item.id && isPlaying;

    return (
      <TouchableOpacity
        style={[styles.muezzinItem, isSelected && styles.muezzinItemSelected]}
        onPress={() => setSelectedMuezzin(item)}
        activeOpacity={0.7}
      >
        <View style={styles.muezzinContent}>
          <View style={[styles.muezzinIcon, isSelected && styles.muezzinIconSelected]}>
            <Ionicons
              name="musical-notes"
              size={24}
              color={isSelected ? COLORS.secondary : COLORS.primary}
            />
          </View>
          <View style={styles.muezzinInfo}>
            <Text style={[styles.muezzinArabicName, isSelected && styles.textSelected]}>
              {item.arabicName}
            </Text>
            <Text style={styles.muezzinName}>{item.name}</Text>
            <Text style={styles.muezzinLocation}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />{' '}
              {item.location}
            </Text>
          </View>
          <View style={styles.muezzinActions}>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              </View>
            )}
            <TouchableOpacity
              style={[styles.playButton, isCurrentlyPlaying && styles.playButtonActive]}
              onPress={() => (isCurrentlyPlaying ? stopAthan() : playAthan(item))}
            >
              {isCurrentlyPlaying ? (
                <Ionicons name="stop" size={18} color={COLORS.text} />
              ) : (
                <Ionicons name="play" size={18} color={COLORS.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.duration}>{item.duration}</Text>
      </TouchableOpacity>
    );
  };

  const renderPrayerTimeRow = (prayer: PrayerName) => {
    const time = prayerTimes?.[prayer] || '--:--';
    const enabled = settings[`${prayer}Enabled` as keyof typeof settings] as boolean;
    const label = PRAYER_LABELS[prayer];

    return (
      <View style={styles.prayerRow} key={prayer}>
        <View style={styles.prayerInfo}>
          <Text style={styles.prayerArabic}>{label.arabic}</Text>
          <Text style={styles.prayerEnglish}>{label.english}</Text>
        </View>
        <Text style={styles.prayerTime}>{time}</Text>
        <Switch
          value={enabled && settings.enabled}
          onValueChange={() => togglePrayerNotification(prayer)}
          disabled={!settings.enabled}
          trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
          thumbColor={enabled && settings.enabled ? COLORS.text : COLORS.textSecondary}
        />
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerArabic}>الأذان</Text>
        <Text style={styles.headerTitle}>Athan</Text>
        <Text style={styles.headerSubtitle}>Prayer Call Notifications</Text>
      </View>

      {/* Master Toggle */}
      <View style={styles.masterToggle}>
        <View style={styles.masterToggleInfo}>
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
          <View style={styles.masterToggleText}>
            <Text style={styles.masterToggleTitle}>Enable Athan Notifications</Text>
            <Text style={styles.masterToggleSubtitle}>
              Play athan at prayer times
            </Text>
          </View>
        </View>
        <Switch
          value={settings.enabled}
          onValueChange={toggleAthanEnabled}
          trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
          thumbColor={settings.enabled ? COLORS.text : COLORS.textSecondary}
        />
      </View>

      {/* Prayer Times Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          <Text style={styles.sectionArabic}>أوقات الصلاة</Text>
          {isLoadingLocation && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 10 }} />
          )}
        </View>

        {locationError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={24} color={COLORS.warning} />
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshPrayerTimes}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.prayerTimesContainer}>
            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerName[]).map(renderPrayerTimeRow)}
          </View>
        )}
      </View>

      {/* Selected Muezzin */}
      {settings.selectedMuezzin && (
        <View style={styles.selectedMuezzinBanner}>
          <Ionicons name="volume-high" size={20} color={COLORS.primary} />
          <Text style={styles.selectedMuezzinText}>
            Selected: {settings.selectedMuezzin.arabicName}
          </Text>
        </View>
      )}

      {/* Muezzins Section Header */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose Muezzin</Text>
          <Text style={styles.sectionArabic}>اختر المؤذن</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={athans}
        keyExtractor={(item) => item.id}
        renderItem={renderMuezzinItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingLocation}
            onRefresh={refreshPrayerTimes}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerArabic: {
    fontSize: 32,
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
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  masterToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterToggleText: {
    marginLeft: 12,
    flex: 1,
  },
  masterToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  masterToggleSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  sectionArabic: {
    fontSize: 16,
    color: COLORS.primary,
  },
  prayerTimesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerArabic: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  prayerEnglish: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  selectedMuezzinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  selectedMuezzinText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  muezzinItem: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  muezzinItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  muezzinContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muezzinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  muezzinIconSelected: {
    backgroundColor: COLORS.primary,
  },
  muezzinInfo: {
    flex: 1,
  },
  muezzinArabicName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  textSelected: {
    color: COLORS.primary,
  },
  muezzinName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  muezzinLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  muezzinActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedBadge: {
    marginRight: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: COLORS.primary,
  },
  duration: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
});

