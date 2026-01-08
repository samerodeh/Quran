import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Paths, Directory, File } from 'expo-file-system';
import { Surah, Reciter } from '../types';
import { getAudioUrl } from '../data/reciters';

interface DownloadProgress {
  surahId: number;
  reciterId: string;
  progress: number; // 0-100
}

interface DownloadState {
  downloads: Record<string, boolean>; // key: "reciterId_surahId", value: true if downloaded
  downloading: Record<string, DownloadProgress>; // currently downloading
  isDownloaded: (reciterId: string, surahId: number) => boolean;
  isDownloading: (reciterId: string, surahId: number) => boolean;
  getDownloadProgress: (reciterId: string, surahId: number) => number;
  downloadSurah: (surah: Surah, reciter: Reciter) => Promise<void>;
  deleteSurah: (reciterId: string, surahId: number) => Promise<void>;
  getLocalAudioUri: (reciterId: string, surahId: number) => string | null;
  getDownloadedCount: (reciterId: string) => number;
}

const DownloadContext = createContext<DownloadState | null>(null);

const getDownloadKey = (reciterId: string, surahId: number) => `${reciterId}_${surahId}`;

const getAudioDirectory = () => new Directory(Paths.document, 'audio');
const getReciterDirectory = (reciterId: string) => new Directory(getAudioDirectory(), reciterId);
const getAudioFile = (reciterId: string, surahId: number) => 
  new File(getReciterDirectory(reciterId), `${String(surahId).padStart(3, '0')}.mp3`);

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<Record<string, DownloadProgress>>({});

  // Load existing downloads on mount
  useEffect(() => {
    loadExistingDownloads();
  }, []);

  const loadExistingDownloads = async () => {
    // File system operations removed (was using expo-file-system)
    // try {
    //   const audioDir = getAudioDirectory();
    //   
    //   if (!audioDir.exists) {
    //     audioDir.create();
    //     return;
    //   }

    //   // Scan for downloaded files
    //   const downloadedFiles: Record<string, boolean> = {};

    //   // List subdirectories (reciter folders)
    //   for (const entry of audioDir.list()) {
    //     if (entry instanceof Directory) {
    //       const reciterId = entry.name;
    //       // List files in reciter folder
    //       for (const file of entry.list()) {
    //         if (file instanceof File && file.name.endsWith('.mp3')) {
    //           const surahId = parseInt(file.name.replace('.mp3', ''), 10);
    //           const key = getDownloadKey(reciterId, surahId);
    //           downloadedFiles[key] = true;
    //         }
    //       }
    //     }
    //   }

    //   setDownloads(downloadedFiles);
    // } catch (error) {
    //   console.error('Error loading downloads:', error);
    // }
  };

  const isDownloaded = useCallback((reciterId: string, surahId: number): boolean => {
    const key = getDownloadKey(reciterId, surahId);
    return downloads[key] === true;
  }, [downloads]);

  const isDownloading = useCallback((reciterId: string, surahId: number): boolean => {
    const key = getDownloadKey(reciterId, surahId);
    return downloading[key] !== undefined;
  }, [downloading]);

  const getDownloadProgress = useCallback((reciterId: string, surahId: number): number => {
    const key = getDownloadKey(reciterId, surahId);
    return downloading[key]?.progress || 0;
  }, [downloading]);

  const downloadSurah = useCallback(async (surah: Surah, reciter: Reciter) => {
    if (reciter.isLocal) {
      // Local reciters don't need downloading
      return;
    }

    const key = getDownloadKey(reciter.id, surah.id);
    
    // Already downloaded or downloading
    if (downloads[key] || downloading[key]) {
      return;
    }

    // File system operations removed (was using expo-file-system)
    // const audioUrl = getAudioUrl(surah.id, reciter);
    // const reciterDir = getReciterDirectory(reciter.id);
    // const audioFile = getAudioFile(reciter.id, surah.id);

    // try {
    //   // Create reciter directory if needed
    //   if (!reciterDir.exists) {
    //     reciterDir.create();
    //   }

    //   // Start download with progress tracking
    //   setDownloading(prev => ({
    //     ...prev,
    //     [key]: { surahId: surah.id, reciterId: reciter.id, progress: 0 }
    //   }));

    //   // Fetch the audio file
    //   const response = await fetch(audioUrl);
    //   
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const blob = await response.blob();
    //   const arrayBuffer = await blob.arrayBuffer();
    //   
    //   // Write to file using base64
    //   const base64 = btoa(
    //     new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    //   );
    //   audioFile.create();
    //   audioFile.write(base64, { encoding: 'base64' });

    //   // Download successful
    //   setDownloads(prev => ({ ...prev, [key]: true }));
    //   setDownloading(prev => ({
    //     ...prev,
    //     [key]: { surahId: surah.id, reciterId: reciter.id, progress: 100 }
    //   }));
    // } catch (error) {
    //   console.error('Download error:', error);
    // } finally {
    //   // Remove from downloading state
    //   setDownloading(prev => {
    //     const newState = { ...prev };
    //     delete newState[key];
    //     return newState;
    //   });
    // }
  }, [downloads, downloading]);

  const deleteSurah = useCallback(async (reciterId: string, surahId: number) => {
    // File system operations removed (was using expo-file-system)
    // const key = getDownloadKey(reciterId, surahId);
    // const audioFile = getAudioFile(reciterId, surahId);

    // try {
    //   if (audioFile.exists) {
    //     audioFile.delete();
    //   }
    //   
    //   setDownloads(prev => {
    //     const newState = { ...prev };
    //     delete newState[key];
    //     return newState;
    //   });
    // } catch (error) {
    //   console.error('Delete error:', error);
    // }
  }, []);

  const getLocalAudioUri = useCallback((reciterId: string, surahId: number): string | null => {
    // File system operations removed (was using expo-file-system)
    // const key = getDownloadKey(reciterId, surahId);
    // if (downloads[key]) {
    //   const audioFile = getAudioFile(reciterId, surahId);
    //   return audioFile.uri;
    // }
    return null;
  }, [downloads]);

  const getDownloadedCount = useCallback((reciterId: string): number => {
    return Object.keys(downloads).filter(key => key.startsWith(`${reciterId}_`)).length;
  }, [downloads]);

  const value: DownloadState = {
    downloads,
    downloading,
    isDownloaded,
    isDownloading,
    getDownloadProgress,
    downloadSurah,
    deleteSurah,
    getLocalAudioUri,
    getDownloadedCount,
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownload(): DownloadState {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
}
