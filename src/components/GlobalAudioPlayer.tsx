import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Modal, StyleSheet, PanResponder } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAudio } from '../contexts/AudioContext';
import { PLAYBACK_SPEEDS, COLORS } from '../types';

export function GlobalAudioPlayer() {
  const {
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
    isSeekingRef,
    seekPositionRef,
    progressBarWidth,
    playbackDurationRef,
    togglePlayPause,
    skipForward,
    skipBackward,
    changePlaybackSpeed,
    stopPlayback,
  } = useAudio();

  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);

  const handleProgressBarLayout = (event: any) => {
    progressBarWidth.current = event.nativeEvent.layout.width;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: any) => {
        const duration = playbackDurationRef.current;
        const barWidth = progressBarWidth.current;
        if (!duration || !barWidth) return;

        isSeekingRef.current = true;
        setIsSeeking(true);

        dragStartX.current = evt.nativeEvent.pageX;
        const touchX = evt.nativeEvent.locationX;
        const percentage = Math.max(0, Math.min(1, touchX / barWidth));
        const initialPosition = percentage * duration;
        dragStartPosition.current = initialPosition;
        seekPositionRef.current = initialPosition;
        setSeekPosition(initialPosition);
      },
      onPanResponderMove: (evt: any) => {
        const duration = playbackDurationRef.current;
        const barWidth = progressBarWidth.current;
        if (!duration || !barWidth || !isSeekingRef.current) return;

        const deltaX = evt.nativeEvent.pageX - dragStartX.current;
        const deltaTime = (deltaX / barWidth) * duration;
        const newPosition = Math.max(0, Math.min(duration, dragStartPosition.current + deltaTime));
        seekPositionRef.current = newPosition;
        setSeekPosition(newPosition);
      },
      onPanResponderRelease: async () => {
        const currentSound = soundRef.current;
        const position = seekPositionRef.current;

        if (currentSound && position >= 0) {
          try {
            await currentSound.setPositionAsync(Math.floor(position));
          } catch (error) {
            console.error('Error seeking:', error);
          }
        }
        isSeekingRef.current = false;
        setIsSeeking(false);
      },
      onPanResponderTerminate: () => {
        isSeekingRef.current = false;
        setIsSeeking(false);
      },
    })
  ).current;

  const formatTime = (millis: number) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showMiniPlayer || !currentSurah) return null;

  const displayPosition = isSeeking ? seekPosition : playbackPosition;
  const progressWidth = playbackDuration > 0 ? (displayPosition / playbackDuration) * 100 : 0;

  return (
    <>
      <View style={styles.globalPlayerContainer}>
        <View style={styles.progressContainer}>
          <View
            style={styles.progressBarTouchArea}
            onLayout={handleProgressBarLayout}
            {...panResponder.panHandlers}
          >
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
              <View style={[styles.progressThumb, { left: `${progressWidth}%` }]}>
                <View style={[styles.progressThumbInner, isSeeking && styles.progressThumbActive]} />
              </View>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
            <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
          </View>
        </View>
        <View style={styles.nowPlayingInfo}>
          <Text style={styles.nowPlayingArabic}>{currentSurah.arabicName}</Text>
          <Text style={styles.nowPlayingName}>
            {currentSurah.name} {currentReciter ? `• ${currentReciter.arabicName}` : ''}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.skipButton} onPress={skipBackward}>
            <Ionicons name="play-back" size={20} color="#E2E8F0" />
            <Text style={styles.skipButtonText}>15</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#0F172A" />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#0F172A" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
            <Text style={styles.skipButtonText}>15</Text>
            <Ionicons name="play-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>
        </View>

        <View style={styles.playerBottomRow}>
          <TouchableOpacity style={styles.speedButton} onPress={() => setShowSpeedPicker(true)}>
            <Ionicons name="speedometer-outline" size={16} color="#94A3B8" />
            <Text style={styles.speedButtonText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closePlayerButton} onPress={stopPlayback}>
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showSpeedPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpeedPicker(false)}
      >
        <TouchableOpacity
          style={styles.speedModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedPicker(false)}
        >
          <View style={styles.speedPickerContainer}>
            <Text style={styles.speedPickerTitle}>سرعة التشغيل</Text>
            <Text style={styles.speedPickerSubtitle}>Playback Speed</Text>
            <View style={styles.speedOptions}>
              {PLAYBACK_SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[styles.speedOption, playbackSpeed === speed && styles.speedOptionActive]}
                  onPress={() => changePlaybackSpeed(speed)}
                >
                  <Text style={[styles.speedOptionText, playbackSpeed === speed && styles.speedOptionTextActive]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  globalPlayerContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarTouchArea: {
    height: 30,
    justifyContent: 'center',
    marginHorizontal: -10,
    paddingHorizontal: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -8,
    marginLeft: -10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressThumbInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  progressThumbActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  nowPlayingInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  nowPlayingArabic: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  nowPlayingName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  speedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  closePlayerButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  speedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedPickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
  },
  speedPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  speedPickerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  speedOption: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  speedOptionActive: {
    backgroundColor: COLORS.primary,
  },
  speedOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  speedOptionTextActive: {
    color: COLORS.secondary,
  },
});
