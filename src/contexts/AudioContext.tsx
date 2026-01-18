import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { AudioPlayerState, Surah, Reciter, PLAYBACK_SPEEDS, RepeatMode } from '../types';
import { getAudioUrl } from '../data/reciters';
import { getLocalAudio, hasLocalAudio } from '../data/localAudio';
import { useDownload } from './DownloadContext';
import { useSettings } from './SettingsContext';
import { surahs } from '../data/surahs';

const AudioContext = createContext<AudioPlayerState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { isDownloaded, getLocalAudioUri } = useDownload();
  const { settings } = useSettings();
  const [sound, setSound] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentReciter, setCurrentReciter] = useState<Reciter | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  // Repeat functionality
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [repeatStartTime, setRepeatStartTime] = useState<number | null>(null);
  const [repeatEndTime, setRepeatEndTime] = useState<number | null>(null);
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatCountRemaining, setRepeatCountRemaining] = useState(1);
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const isSeekingRef = useRef(false);
  const seekPositionRef = useRef(0);
  const progressBarWidth = useRef(0);
  const playbackDurationRef = useRef(0);
  const soundRef = useRef<any>(null);
  const currentSurahRef = useRef<Surah | null>(null);
  const currentReciterRef = useRef<Reciter | null>(null);
  const playSurahRef = useRef<((surah: Surah, reciter: Reciter) => Promise<void>) | null>(null);
  const repeatStartTimeRef = useRef<number | null>(null);
  const repeatEndTimeRef = useRef<number | null>(null);
  const repeatModeRef = useRef<RepeatMode>('off');
  const repeatCountRemainingRef = useRef(1);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: 1,
      shouldDuckAndroid: false,
      interruptionModeAndroid: 1,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  // Update Media Session API for web (lock screen controls)
  const updateMediaSession = useCallback((surah: Surah | null, reciter: Reciter | null) => {
    if (Platform.OS === 'web' && 'mediaSession' in navigator) {
      const mediaSession = (navigator as any).mediaSession;
      if (surah && reciter) {
        try {
          mediaSession.metadata = new (window as any).MediaMetadata({
            title: `${surah.arabicName} - ${surah.name}`,
            artist: reciter.arabicName || reciter.name,
            album: 'القرآن الكريم',
          });

          // Set up action handlers
          mediaSession.setActionHandler('play', async () => {
            if (soundRef.current) {
              await soundRef.current.playAsync();
            }
          });

          mediaSession.setActionHandler('pause', async () => {
            if (soundRef.current) {
              await soundRef.current.pauseAsync();
            }
          });

          mediaSession.setActionHandler('previoustrack', async () => {
            const currentSurah = currentSurahRef.current;
            const currentReciter = currentReciterRef.current;
            if (currentSurah && currentReciter) {
              const previousSurah = surahs.find(s => s.id === currentSurah.id - 1);
              if (previousSurah && playSurahRef.current) {
                await playSurahRef.current(previousSurah, currentReciter);
              }
            }
          });

          mediaSession.setActionHandler('nexttrack', async () => {
            const currentSurah = currentSurahRef.current;
            const currentReciter = currentReciterRef.current;
            if (currentSurah && currentReciter) {
              const nextSurah = surahs.find(s => s.id === currentSurah.id + 1);
              if (nextSurah && playSurahRef.current) {
                await playSurahRef.current(nextSurah, currentReciter);
              }
            }
          });
        } catch (error) {
          console.error('Error setting up Media Session:', error);
        }
      }
    }
  }, []);

  const onPlaybackStatusUpdate = useCallback(async (status: any) => {
    if (status.isLoaded) {
      if (!isSeekingRef.current) {
        setPlaybackPosition(status.positionMillis);
      }
      setPlaybackDuration(status.durationMillis || 0);
      playbackDurationRef.current = status.durationMillis || 0;
      setIsPlaying(status.isPlaying);

      // Handle repeat logic for range-based repeating (when a specific range is set)
      const currentPos = status.positionMillis;
      const endTime = repeatEndTimeRef.current;
      const startTime = repeatStartTimeRef.current;
      const mode = repeatModeRef.current;
      const remaining = repeatCountRemainingRef.current;
      const duration = status.durationMillis || 0;

      // If a repeat range is set, handle reaching the end of that range
      if (mode !== 'off' && endTime !== null && startTime !== null && currentPos >= endTime) {
        // Reached end of repeat range
        if (mode === 'infinite') {
          // Infinite repeat - jump back to start of range
          if (soundRef.current) {
            await soundRef.current.setPositionAsync(startTime);
          }
        } else if (mode === 'count' && remaining > 0) {
          // Count mode - decrement and repeat if remaining > 0
          const newRemaining = remaining - 1;
          repeatCountRemainingRef.current = newRemaining;
          setRepeatCountRemaining(newRemaining);
          if (newRemaining > 0) {
            // Still have repeats left - jump back to start of range
            if (soundRef.current) {
              await soundRef.current.setPositionAsync(startTime);
            }
          } else {
            // No more repeats - continue normal playback
            setRepeatMode('off');
            repeatModeRef.current = 'off';
          }
        }
      }
      
      // Handle infinite repeat for entire audio (when no range is set or when audio finishes)
      // This is handled in didJustFinish below

      if (status.didJustFinish) {
        const mode = repeatModeRef.current;
        const startTime = repeatStartTimeRef.current;
        
        // Handle infinite repeat - restart audio
        if (mode === 'infinite') {
          if (soundRef.current) {
            // If there's a repeat range, restart from start of range, otherwise from beginning
            const restartPosition = startTime !== null ? startTime : 0;
            await soundRef.current.setPositionAsync(restartPosition);
            await soundRef.current.playAsync();
            setIsPlaying(true);
            setPlaybackPosition(restartPosition);
            return; // Don't proceed with auto-play logic
          }
        }
        
        // Handle count repeat - check if we have more repeats
        if (mode === 'count') {
          const remaining = repeatCountRemainingRef.current;
          if (remaining > 0) {
            const newRemaining = remaining - 1;
            repeatCountRemainingRef.current = newRemaining;
            setRepeatCountRemaining(newRemaining);
            
            if (newRemaining > 0 && soundRef.current) {
              // Still have repeats left - restart
              const restartPosition = startTime !== null ? startTime : 0;
              await soundRef.current.setPositionAsync(restartPosition);
              await soundRef.current.playAsync();
              setIsPlaying(true);
              setPlaybackPosition(restartPosition);
              return; // Don't proceed with auto-play logic
            } else {
              // No more repeats - turn off repeat mode
              setRepeatMode('off');
              repeatModeRef.current = 'off';
            }
          }
        }
        
        setIsPlaying(false);
        setPlaybackPosition(0);
        
        // Only auto-play next surah if repeat is off and auto-play is enabled
        if (repeatModeRef.current === 'off' && settings.autoPlayNext) {
          const surah = currentSurahRef.current;
          const reciter = currentReciterRef.current;
          if (surah && reciter && playSurahRef.current) {
            let nextSurah: Surah | undefined;
            
            if (settings.shufflePlay) {
              // Shuffle mode: play a random surah (excluding current one)
              const availableSurahs = surahs.filter(s => s.id !== surah.id);
              if (availableSurahs.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableSurahs.length);
                nextSurah = availableSurahs[randomIndex];
              }
            } else {
              // Sequential mode: play next surah
              nextSurah = surahs.find(s => s.id === surah.id + 1);
            }
            
            if (nextSurah) {
              playSurahRef.current(nextSurah, reciter);
            }
          }
        }
      }
    }
  }, [settings]);

  const playSurah = async (surah: Surah, reciter: Reciter) => {
    try {
      if (currentSurah?.id === surah.id && currentReciter?.id === reciter?.id && sound) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) await sound.pauseAsync();
        else await sound.playAsync();
        return;
      }

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setIsLoading(true);
      setCurrentSurah(surah);
      setCurrentReciter(reciter);
      currentSurahRef.current = surah;
      currentReciterRef.current = reciter;
      setPlaybackPosition(0);
      setPlaybackDuration(0);
      setShowMiniPlayer(true);
      setIsPlayerExpanded(false); // Start collapsed by default
      // Clear repeat when switching surahs
      clearRepeat();

      // Audio playback options for background playback on all platforms
      // Note: staysActiveInBackground and playsInSilentModeIOS are set via Audio.setAudioModeAsync() above
      const audioOptions = {
        shouldPlay: true,
        isLooping: false,
        isMuted: false,
        volume: 1.0,
        // These options work with the audio mode set globally
        rate: playbackSpeed,
        shouldCorrectPitch: true,
      };

      let newSound;
      if (reciter?.isLocal && hasLocalAudio(reciter.id, surah.id)) {
        // Local bundled audio (from assets)
        const localAudio = getLocalAudio(reciter.id, surah.id);
        const { sound: localSound } = await Audio.Sound.createAsync(
          localAudio,
          audioOptions,
          onPlaybackStatusUpdate
        );
        newSound = localSound;
      } else if (reciter?.isLocal) {
        setIsLoading(false);
        alert(`Recording not available yet for ${surah.name}`);
        return;
      } else if (isDownloaded(reciter.id, surah.id)) {
        // Downloaded audio (from file system)
        const downloadedUri = getLocalAudioUri(reciter.id, surah.id);
        if (downloadedUri) {
          const { sound: downloadedSound } = await Audio.Sound.createAsync(
            { uri: downloadedUri },
            audioOptions,
            onPlaybackStatusUpdate
          );
          newSound = downloadedSound;
        } else {
          // Fallback to streaming if download path not found
          const audioUrl = getAudioUrl(surah.id, reciter);
          const { sound: remoteSound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            audioOptions,
            onPlaybackStatusUpdate
          );
          newSound = remoteSound;
        }
      } else {
        // Stream from remote URL
        const audioUrl = getAudioUrl(surah.id, reciter);
        const { sound: remoteSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          audioOptions,
          onPlaybackStatusUpdate
        );
        newSound = remoteSound;
      }

      setSound(newSound);
      soundRef.current = newSound;

      if (playbackSpeed !== 1.0) {
        await newSound.setRateAsync(playbackSpeed, true);
      }

      // Update Media Session for web
      updateMediaSession(surah, reciter);

      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) await sound.pauseAsync();
    else await sound.playAsync();
  };

  const skipForward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    await sound.setPositionAsync(Math.min(status.positionMillis + 15000, status.durationMillis));
  };

  const skipBackward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    await sound.setPositionAsync(Math.max(status.positionMillis - 15000, 0));
  };

  const changePlaybackSpeed = async (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedPicker(false);
    if (sound) {
      try {
        await sound.setRateAsync(speed, true);
      } catch (error) {
        console.error('Error changing playback speed:', error);
      }
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    setSound(null);
    setCurrentSurah(null);
    setCurrentReciter(null);
    currentSurahRef.current = null;
    currentReciterRef.current = null;
    setShowMiniPlayer(false);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    // Clear Media Session
    if (Platform.OS === 'web' && 'mediaSession' in navigator) {
      (navigator as any).mediaSession.metadata = null;
    }
  };

  const playNextSurah = async () => {
    const surah = currentSurahRef.current;
    const reciter = currentReciterRef.current;
    if (!surah || !reciter) return;
    const nextSurah = surahs.find(s => s.id === surah.id + 1);
    if (nextSurah && playSurahRef.current) {
      await playSurahRef.current(nextSurah, reciter);
    }
  };

  const playPreviousSurah = async () => {
    const surah = currentSurahRef.current;
    const reciter = currentReciterRef.current;
    if (!surah || !reciter) return;
    const previousSurah = surahs.find(s => s.id === surah.id - 1);
    if (previousSurah && playSurahRef.current) {
      await playSurahRef.current(previousSurah, reciter);
    }
  };

  const setRepeatRange = useCallback((startTime: number, endTime: number) => {
    setRepeatStartTime(startTime);
    setRepeatEndTime(endTime);
    repeatStartTimeRef.current = startTime;
    repeatEndTimeRef.current = endTime;
  }, []);

  const setRepeatModeHandler = useCallback((mode: RepeatMode, count: number = 1) => {
    setRepeatMode(mode);
    repeatModeRef.current = mode;
    if (mode === 'count') {
      setRepeatCount(count);
      setRepeatCountRemaining(count);
      repeatCountRemainingRef.current = count;
    } else if (mode === 'off') {
      setRepeatCountRemaining(0);
      repeatCountRemainingRef.current = 0;
    }
  }, []);

  const clearRepeat = useCallback(() => {
    setRepeatMode('off');
    setRepeatStartTime(null);
    setRepeatEndTime(null);
    setRepeatCount(1);
    setRepeatCountRemaining(1);
    repeatModeRef.current = 'off';
    repeatStartTimeRef.current = null;
    repeatEndTimeRef.current = null;
    repeatCountRemainingRef.current = 1;
  }, []);

  // Store playSurah in ref so it can be called from callbacks
  playSurahRef.current = playSurah;

  const value: AudioPlayerState = {
    sound,
    soundRef,
    isPlaying,
    isLoading,
    currentSurah,
    currentReciter,
    playbackPosition,
    playbackDuration,
    isSeeking,
    setIsSeeking,
    seekPosition,
    setSeekPosition,
    playbackSpeed,
    showSpeedPicker,
    setShowSpeedPicker,
    showMiniPlayer,
    isPlayerExpanded,
    setIsPlayerExpanded,
    isSeekingRef,
    seekPositionRef,
    progressBarWidth,
    playbackDurationRef,
    PLAYBACK_SPEEDS: [...PLAYBACK_SPEEDS],
    playSurah,
    togglePlayPause,
    skipForward,
    skipBackward,
    changePlaybackSpeed,
      stopPlayback,
      playNextSurah,
      playPreviousSurah,
      repeatMode,
      repeatStartTime,
      repeatEndTime,
      repeatCount,
      repeatCountRemaining,
      showRepeatModal,
      setShowRepeatModal,
      setRepeatRange,
      setRepeatMode: setRepeatModeHandler,
      clearRepeat,
    };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioPlayerState {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
