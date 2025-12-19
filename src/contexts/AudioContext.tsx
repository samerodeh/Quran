import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { AudioPlayerState, Surah, Reciter, PLAYBACK_SPEEDS } from '../types';
import { getAudioUrl } from '../data/reciters';
import { getLocalAudio, hasLocalAudio } from '../data/localAudio';
import { useDownload } from './DownloadContext';

const AudioContext = createContext<AudioPlayerState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { isDownloaded, getLocalAudioUri } = useDownload();
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

  const isSeekingRef = useRef(false);
  const seekPositionRef = useRef(0);
  const progressBarWidth = useRef(0);
  const playbackDurationRef = useRef(0);
  const soundRef = useRef<any>(null);

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

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      if (!isSeekingRef.current) {
        setPlaybackPosition(status.positionMillis);
      }
      setPlaybackDuration(status.durationMillis || 0);
      playbackDurationRef.current = status.durationMillis || 0;
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  }, []);

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
      setPlaybackPosition(0);
      setPlaybackDuration(0);
      setShowMiniPlayer(true);
      setIsPlayerExpanded(false); // Start collapsed by default

      let newSound;
      if (reciter?.isLocal && hasLocalAudio(reciter.id, surah.id)) {
        // Local bundled audio (from assets)
        const localAudio = getLocalAudio(reciter.id, surah.id);
        const { sound: localSound } = await Audio.Sound.createAsync(
          localAudio,
          { shouldPlay: true },
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
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          newSound = downloadedSound;
        } else {
          // Fallback to streaming if download path not found
          const audioUrl = getAudioUrl(surah.id, reciter);
          const { sound: remoteSound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          newSound = remoteSound;
        }
      } else {
        // Stream from remote URL
        const audioUrl = getAudioUrl(surah.id, reciter);
        const { sound: remoteSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        newSound = remoteSound;
      }

      setSound(newSound);
      soundRef.current = newSound;

      if (playbackSpeed !== 1.0) {
        await newSound.setRateAsync(playbackSpeed, true);
      }

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
    setShowMiniPlayer(false);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
  };

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
