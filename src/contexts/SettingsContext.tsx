import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, Language, LanguageCode } from '../types';

interface SettingsContextState {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  setAutoPlayNext: (enabled: boolean) => Promise<void>;
  setShufflePlay: (enabled: boolean) => Promise<void>;
  setDisplayLanguage: (language: LanguageCode) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextState | null>(null);

const STORAGE_KEY = '@app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  autoPlayNext: true,
  shufflePlay: false,
  primaryLanguage: 'ar', // Always Arabic
  secondaryLanguage: 'en', // Always English
  displayLanguage: 'ar', // Default to Arabic
};

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure primaryLanguage is always 'ar' and secondaryLanguage is always 'en'
        const loadedSettings: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          primaryLanguage: 'ar',
          secondaryLanguage: 'en',
        };
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updated = {
      ...settings,
      ...newSettings,
      // Always enforce primaryLanguage = 'ar' and secondaryLanguage = 'en'
      primaryLanguage: 'ar' as LanguageCode,
      secondaryLanguage: 'en' as LanguageCode,
    };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  const setAutoPlayNext = useCallback(async (enabled: boolean) => {
    await updateSettings({ autoPlayNext: enabled });
  }, [updateSettings]);

  const setShufflePlay = useCallback(async (enabled: boolean) => {
    await updateSettings({ shufflePlay: enabled });
  }, [updateSettings]);

  const setDisplayLanguage = useCallback(async (language: LanguageCode) => {
    // Only allow switching between Arabic and other languages (not English as primary)
    // English is always secondary
    if (language === 'en') {
      // If user selects English, set display to Arabic (since English is always secondary)
      await updateSettings({ displayLanguage: 'ar' });
    } else {
      await updateSettings({ displayLanguage: language });
    }
  }, [updateSettings]);

  const value: SettingsContextState = {
    settings,
    updateSettings,
    setAutoPlayNext,
    setShufflePlay,
    setDisplayLanguage,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextState {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

