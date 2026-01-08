import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Muezzin, PrayerTimes, AthanSettings, PrayerName } from '../types';
import { athans } from '../data/athans';

interface AthanContextState {
  settings: AthanSettings;
  prayerTimes: PrayerTimes | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  currentlyPlaying: Muezzin | null;
  isPlaying: boolean;
  setSelectedMuezzin: (muezzin: Muezzin) => void;
  toggleAthanEnabled: () => void;
  togglePrayerNotification: (prayer: PrayerName) => void;
  playAthan: (muezzin: Muezzin) => Promise<void>;
  stopAthan: () => Promise<void>;
  refreshPrayerTimes: () => Promise<void>;
}

const AthanContext = createContext<AthanContextState | null>(null);

const STORAGE_KEY = '@athan_settings';
const DEFAULT_SETTINGS: AthanSettings = {
  enabled: false,
  selectedMuezzin: null,
  fajrEnabled: true,
  dhuhrEnabled: true,
  asrEnabled: true,
  maghribEnabled: true,
  ishaEnabled: true,
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function AthanProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AthanSettings>(DEFAULT_SETTINGS);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Muezzin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Request permissions and fetch prayer times when enabled
  useEffect(() => {
    if (settings.enabled) {
      requestPermissions();
      fetchPrayerTimes();
    }
  }, [settings.enabled]);

  // Schedule notifications when prayer times or settings change
  useEffect(() => {
    if (settings.enabled && prayerTimes && settings.selectedMuezzin) {
      scheduleNotifications();
    } else {
      cancelAllNotifications();
    }
  }, [settings, prayerTimes]);

  // Audio cleanup removed (was using expo-av)
  // useEffect(() => {
  //   return () => {
  //     if (sound) {
  //       sound.unloadAsync();
  //     }
  //   };
  // }, [sound]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore muezzin reference from athans list
        if (parsed.selectedMuezzinId) {
          parsed.selectedMuezzin = athans.find(a => a.id === parsed.selectedMuezzinId) || null;
        }
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading athan settings:', error);
    }
  };

  const saveSettings = async (newSettings: AthanSettings) => {
    try {
      const toSave = {
        ...newSettings,
        selectedMuezzinId: newSettings.selectedMuezzin?.id || null,
        selectedMuezzin: undefined, // Don't save the full object
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving athan settings:', error);
    }
  };

  const requestPermissions = async () => {
    // Permissions removed (was using expo-notifications and expo-location)
    // // Request notification permission
    // const { status: notifStatus } = await Notifications.requestPermissionsAsync();
    // if (notifStatus !== 'granted') {
    //   Alert.alert(
    //     'Permission Required',
    //     'Please enable notifications to receive athan alerts.',
    //     [{ text: 'OK' }]
    //   );
    // }

    // // Request location permission
    // const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    // if (locStatus !== 'granted') {
    //   setLocationError('Location permission is required to calculate prayer times');
    // }
  };

  const fetchPrayerTimes = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      // Location services removed (was using expo-location)
      // const { status } = await Location.getForegroundPermissionsAsync();
      // if (status !== 'granted') {
      //   setLocationError('Location permission not granted');
      //   setIsLoadingLocation(false);
      //   return;
      // }

      // const location = await Location.getCurrentPositionAsync({
      //   accuracy: Location.Accuracy.Balanced,
      // });

      // const { latitude, longitude } = location.coords;
      const latitude = 0;
      const longitude = 0;
      
      // Use Aladhan API for prayer times
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
      );
      
      const data = await response.json();
      
      if (data.code === 200 && data.data?.timings) {
        const timings = data.data.timings;
        setPrayerTimes({
          fajr: timings.Fajr,
          sunrise: timings.Sunrise,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
        });
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setLocationError('Could not fetch prayer times');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const scheduleNotifications = async () => {
    // Notifications removed (was using expo-notifications)
    // // Cancel existing notifications first
    // await cancelAllNotifications();

    // if (!prayerTimes || !settings.selectedMuezzin) return;
    if (!prayerTimes || !settings.selectedMuezzin) return;

    const prayers: { name: PrayerName; time: string; enabled: boolean }[] = [
      { name: 'fajr', time: prayerTimes.fajr, enabled: settings.fajrEnabled },
      { name: 'dhuhr', time: prayerTimes.dhuhr, enabled: settings.dhuhrEnabled },
      { name: 'asr', time: prayerTimes.asr, enabled: settings.asrEnabled },
      { name: 'maghrib', time: prayerTimes.maghrib, enabled: settings.maghribEnabled },
      { name: 'isha', time: prayerTimes.isha, enabled: settings.ishaEnabled },
    ];

    const now = new Date();

    const prayerNames: Record<PrayerName, string> = {
      fajr: 'Fajr - الفجر',
      dhuhr: 'Dhuhr - الظهر',
      asr: 'Asr - العصر',
      maghrib: 'Maghrib - المغرب',
      isha: 'Isha - العشاء',
    };

    for (const prayer of prayers) {
      if (!prayer.enabled) continue;

      const timeParts = prayer.time.split(':');
      const hours = parseInt(timeParts[0] || '0', 10);
      const minutes = parseInt(timeParts[1] || '0', 10);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      // Notifications removed (was using expo-notifications)
      // await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: `🕌 ${prayerNames[prayer.name]}`,
      //     body: `It's time for ${prayer.name.charAt(0).toUpperCase() + prayer.name.slice(1)} prayer`,
      //     sound: true,
      //     data: { prayer: prayer.name, muezzinId: settings.selectedMuezzin?.id },
      //   },
      //   trigger: {
      //     type: Notifications.SchedulableTriggerInputTypes.DATE,
      //     date: prayerDate,
      //   },
      // });
    }
  };

  const cancelAllNotifications = async () => {
    // Notifications removed (was using expo-notifications)
    // await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const setSelectedMuezzin = useCallback((muezzin: Muezzin) => {
    const newSettings = { ...settings, selectedMuezzin: muezzin };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const toggleAthanEnabled = useCallback(() => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const togglePrayerNotification = useCallback((prayer: PrayerName) => {
    const key = `${prayer}Enabled` as keyof AthanSettings;
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const playAthan = useCallback(async (muezzin: Muezzin) => {
    // Audio playback removed (was using expo-av)
    // try {
    //   // Stop any existing playback
    //   if (sound) {
    //     await sound.stopAsync();
    //     await sound.unloadAsync();
    //   }

    //   setCurrentlyPlaying(muezzin);
    //   setIsPlaying(true);

    //   const { sound: newSound } = await Audio.Sound.createAsync(
    //     { uri: muezzin.audioUrl },
    //     { shouldPlay: true },
    //     (status) => {
    //       if (status.isLoaded && status.didJustFinish) {
    //         setIsPlaying(false);
    //         setCurrentlyPlaying(null);
    //       }
    //     }
    //   );

    //   setSound(newSound);
    // } catch (error) {
    //   console.error('Error playing athan:', error);
    //   setIsPlaying(false);
    //   setCurrentlyPlaying(null);
    // }
  }, []);

  const stopAthan = useCallback(async () => {
    // Audio playback removed (was using expo-av)
    // if (sound) {
    //   await sound.stopAsync();
    //   await sound.unloadAsync();
    //   setSound(null);
    // }
    setIsPlaying(false);
    setCurrentlyPlaying(null);
  }, []);

  const refreshPrayerTimes = useCallback(async () => {
    await fetchPrayerTimes();
  }, []);

  const value: AthanContextState = {
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
  };

  return (
    <AthanContext.Provider value={value}>
      {children}
    </AthanContext.Provider>
  );
}

export function useAthan(): AthanContextState {
  const context = useContext(AthanContext);
  if (!context) {
    throw new Error('useAthan must be used within an AthanProvider');
  }
  return context;
}

