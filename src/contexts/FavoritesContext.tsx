import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reciter } from '../types';

const FAVORITES_STORAGE_KEY = '@quran_app:favorite_reciters';

interface FavoritesState {
  favoriteReciterIds: Set<string>;
  isFavorite: (reciterId: string) => boolean;
  toggleFavorite: (reciterId: string) => Promise<void>;
  addFavorite: (reciterId: string) => Promise<void>;
  removeFavorite: (reciterId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteReciterIds, setFavoriteReciterIds] = useState<Set<string>>(new Set());

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setFavoriteReciterIds(new Set(ids));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (ids: Set<string>) => {
    try {
      const idsArray = Array.from(ids);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(idsArray));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const isFavorite = useCallback((reciterId: string) => {
    return favoriteReciterIds.has(reciterId);
  }, [favoriteReciterIds]);

  const toggleFavorite = useCallback(async (reciterId: string) => {
    const newFavorites = new Set(favoriteReciterIds);
    if (newFavorites.has(reciterId)) {
      newFavorites.delete(reciterId);
    } else {
      newFavorites.add(reciterId);
    }
    setFavoriteReciterIds(newFavorites);
    await saveFavorites(newFavorites);
  }, [favoriteReciterIds]);

  const addFavorite = useCallback(async (reciterId: string) => {
    const newFavorites = new Set(favoriteReciterIds);
    newFavorites.add(reciterId);
    setFavoriteReciterIds(newFavorites);
    await saveFavorites(newFavorites);
  }, [favoriteReciterIds]);

  const removeFavorite = useCallback(async (reciterId: string) => {
    const newFavorites = new Set(favoriteReciterIds);
    newFavorites.delete(reciterId);
    setFavoriteReciterIds(newFavorites);
    await saveFavorites(newFavorites);
  }, [favoriteReciterIds]);

  const value: FavoritesState = {
    favoriteReciterIds,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesState {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}


