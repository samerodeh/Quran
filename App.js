import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { surahs, getAudioUrl } from './data/surahs';

const { width } = Dimensions.get('window');

export default function App() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Configure audio mode on mount
  useEffect(() => {
    async function configureAudio() {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    }
    configureAudio();
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Animation for playing indicator
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [isPlaying]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  const playSurah = async (surah) => {
    try {
      // If same surah is selected and we have a sound, toggle play/pause
      if (currentSurah?.id === surah.id && sound) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        return;
      }

      // Stop and unload current sound if exists
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setIsLoading(true);
      setCurrentSurah(surah);
      setPlaybackPosition(0);
      setPlaybackDuration(0);

      const audioUrl = getAudioUrl(surah.id);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    
    const status = await sound.getStatusAsync();
    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const skipForward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    const newPosition = Math.min(status.positionMillis + 10000, status.durationMillis);
    await sound.setPositionAsync(newPosition);
  };

  const skipBackward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    const newPosition = Math.max(status.positionMillis - 10000, 0);
    await sound.setPositionAsync(newPosition);
  };

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressWidth = playbackDuration > 0 
    ? (playbackPosition / playbackDuration) * 100 
    : 0;

  const renderSurahItem = ({ item }) => {
    const isCurrentlyPlaying = currentSurah?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.surahItem,
          isCurrentlyPlaying && styles.surahItemActive,
        ]}
        onPress={() => playSurah(item)}
        activeOpacity={0.7}
      >
        <View style={styles.surahNumberContainer}>
          <View style={[
            styles.surahNumber,
            isCurrentlyPlaying && styles.surahNumberActive,
          ]}>
            <Text style={[
              styles.surahNumberText,
              isCurrentlyPlaying && styles.surahNumberTextActive,
            ]}>
              {item.id}
            </Text>
          </View>
        </View>
        
        <View style={styles.surahInfo}>
          <Text style={[
            styles.surahName,
            isCurrentlyPlaying && styles.surahNameActive,
          ]}>
            {item.name}
          </Text>
          <Text style={styles.surahDetails}>
            {item.englishName} • {item.verses} verses
          </Text>
        </View>
        
        <View style={styles.surahArabicContainer}>
          <Text style={[
            styles.surahArabic,
            isCurrentlyPlaying && styles.surahArabicActive,
          ]}>
            {item.arabicName}
          </Text>
          <View style={[
            styles.revelationBadge,
            item.revelationType === 'Meccan' 
              ? styles.meccanBadge 
              : styles.medinanBadge,
          ]}>
            <Text style={styles.revelationText}>
              {item.revelationType}
            </Text>
          </View>
        </View>

        {isCurrentlyPlaying && isPlaying && (
          <Animated.View
            style={[
              styles.playingIndicator,
              {
                opacity: animatedValue,
              },
            ]}
          >
            <Ionicons name="musical-notes" size={20} color="#10B981" />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>القرآن الكريم</Text>
          <Text style={styles.headerSubtitle}>The Holy Quran</Text>
        </View>
        <View style={styles.headerDecoration}>
          <Ionicons name="book" size={32} color="#10B981" />
        </View>
      </View>

      {/* Surah List */}
      <FlatList
        data={surahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Audio Player */}
      {currentSurah && (
        <View style={styles.playerContainer}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressWidth}%` }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
            </View>
          </View>

          {/* Now Playing Info */}
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingArabic}>{currentSurah.arabicName}</Text>
            <Text style={styles.nowPlayingName}>{currentSurah.name}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={skipBackward}
            >
              <Ionicons name="play-back" size={28} color="#E2E8F0" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playPauseButton}
              onPress={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#0F172A" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={36} 
                  color="#0F172A" 
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={skipForward}
            >
              <Ionicons name="play-forward" size={28} color="#E2E8F0" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  headerDecoration: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 200,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  surahItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  surahNumberContainer: {
    marginRight: 14,
  },
  surahNumber: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  surahNumberActive: {
    backgroundColor: '#10B981',
  },
  surahNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    transform: [{ rotate: '-45deg' }],
  },
  surahNumberTextActive: {
    color: '#0F172A',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  surahNameActive: {
    color: '#10B981',
  },
  surahDetails: {
    fontSize: 13,
    color: '#64748B',
  },
  surahArabicContainer: {
    alignItems: 'flex-end',
  },
  surahArabic: {
    fontSize: 20,
    color: '#CBD5E1',
    fontWeight: '500',
    marginBottom: 6,
  },
  surahArabicActive: {
    color: '#10B981',
  },
  revelationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  meccanBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  medinanBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  revelationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  playingIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 34,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  nowPlayingInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nowPlayingArabic: {
    fontSize: 22,
    color: '#F8FAFC',
    fontWeight: '600',
    marginBottom: 2,
  },
  nowPlayingName: {
    fontSize: 14,
    color: '#94A3B8',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
