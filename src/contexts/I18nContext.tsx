import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from './SettingsContext';
import { getTranslation, TranslationKey } from '../utils/translations';
import { LanguageCode } from '../types';

interface I18nContextState {
  t: (key: TranslationKey) => string;
  language: LanguageCode;
}

const I18nContext = createContext<I18nContextState | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  
  const i18n = useMemo(() => {
    return {
      t: (key: TranslationKey) => getTranslation(key, settings.displayLanguage),
      language: settings.displayLanguage,
    };
  }, [settings.displayLanguage]);

  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextState {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

