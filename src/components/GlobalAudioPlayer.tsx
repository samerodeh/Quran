import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Modal, StyleSheet, Platform, GestureResponderEvent, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAudio } from '../contexts/AudioContext';
import { useSettings } from '../contexts/SettingsContext';
import { PLAYBACK_SPEEDS, COLORS, RepeatMode } from '../types';
import { surahs } from '../data/surahs';

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
    isPlayerExpanded,
    setIsPlayerExpanded,
    isSeekingRef,
    seekPositionRef,
    progressBarWidth,
    playbackDurationRef,
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
    setRepeatMode,
    clearRepeat,
  } = useAudio();
  const { settings } = useSettings();

  const progressBarRef = useRef<View>(null);
  const [barLayout, setBarLayout] = useState({ x: 0, width: 0 });

  const handleProgressBarLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    progressBarWidth.current = width;
    
    // Get absolute position for web
    if (progressBarRef.current && Platform.OS === 'web') {
      (progressBarRef.current as any).measure?.((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
        setBarLayout({ x: pageX, width: w });
      });
    }
  };

  const calculatePositionFromTouch = (pageX: number): number => {
    const duration = playbackDurationRef.current;
    const barWidth = progressBarWidth.current;
    if (!duration || !barWidth) return 0;

    let relativeX: number;
    if (Platform.OS === 'web' && barLayout.width > 0) {
      relativeX = pageX - barLayout.x;
    } else {
      relativeX = pageX - 20; // Approximate padding
    }

    const percentage = Math.max(0, Math.min(1, relativeX / barWidth));
    return percentage * duration;
  };

  const handleTouchStart = (evt: GestureResponderEvent) => {
    const duration = playbackDurationRef.current;
    if (!duration) return;

    isSeekingRef.current = true;
    setIsSeeking(true);

    const position = calculatePositionFromTouch(evt.nativeEvent.pageX);
    seekPositionRef.current = position;
    setSeekPosition(position);
  };

  const handleTouchMove = (evt: GestureResponderEvent) => {
    if (!isSeekingRef.current) return;

    const position = calculatePositionFromTouch(evt.nativeEvent.pageX);
    seekPositionRef.current = position;
    setSeekPosition(position);
  };

  const handleTouchEnd = async () => {
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
  };

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

  // Minimized player view
  if (!isPlayerExpanded) {
    return (
      <TouchableOpacity
        style={styles.minimizedPlayerContainer}
        onPress={() => setIsPlayerExpanded(true)}
        activeOpacity={0.9}
      >
        <View style={styles.minimizedPlayerContent}>
          <TouchableOpacity
            style={styles.minimizedPlayButton}
            onPress={(e) => {
              e.stopPropagation?.();
              togglePlayPause();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={COLORS.text} />
            )}
          </TouchableOpacity>

          <View style={styles.minimizedInfo}>
            <Text style={styles.minimizedArabicName} numberOfLines={1}>
              {currentSurah.arabicName}
            </Text>
            <Text style={styles.minimizedSurahName} numberOfLines={1}>
              {currentSurah.name}
            </Text>
          </View>

          <View style={styles.minimizedProgress}>
            <View style={[styles.minimizedProgressBar, { width: `${progressWidth}%` }]} />
          </View>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={(e) => {
              e.stopPropagation?.();
              setIsPlayerExpanded(true);
            }}
          >
            <Ionicons name="chevron-up" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Expanded player view
  return (
    <>
      <View style={styles.globalPlayerContainer}>
        <View style={styles.progressContainer}>
          <View
            ref={progressBarRef}
            style={styles.progressBarTouchArea}
            onLayout={handleProgressBarLayout}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={handleTouchStart}
            onResponderMove={handleTouchMove}
            onResponderRelease={handleTouchEnd}
            onResponderTerminate={handleTouchEnd}
          >
            <View style={styles.progressBar}>
              {/* Repeat range indicator */}
              {repeatStartTime !== null && repeatEndTime !== null && playbackDuration > 0 && (
                <>
                  <View 
                    style={[
                      styles.repeatRangeIndicator,
                      { 
                        left: `${(repeatStartTime / playbackDuration) * 100}%`,
                        width: `${((repeatEndTime - repeatStartTime) / playbackDuration) * 100}%`,
                      }
                    ]} 
                  />
                </>
              )}
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
          <TouchableOpacity 
            style={[styles.skipButton, !currentSurah || currentSurah.id === 1 ? styles.skipButtonDisabled : null]} 
            onPress={playPreviousSurah}
            disabled={!currentSurah || currentSurah.id === 1 || isLoading}
          >
            <Ionicons name="play-skip-back" size={20} color={!currentSurah || currentSurah.id === 1 ? "#64748B" : "#E2E8F0"} />
          </TouchableOpacity>
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
          <TouchableOpacity 
            style={[styles.skipButton, !currentSurah || currentSurah.id === 114 ? styles.skipButtonDisabled : null]} 
            onPress={playNextSurah}
            disabled={!currentSurah || currentSurah.id === 114 || isLoading}
          >
            <Ionicons name="play-skip-forward" size={20} color={!currentSurah || currentSurah.id === 114 ? "#64748B" : "#E2E8F0"} />
          </TouchableOpacity>
        </View>

        <View style={styles.playerBottomRow}>
          <TouchableOpacity style={styles.speedButton} onPress={() => setShowSpeedPicker(true)}>
            <Ionicons name="speedometer-outline" size={16} color="#94A3B8" />
            <Text style={styles.speedButtonText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.repeatButton, repeatMode !== 'off' && styles.repeatButtonActive]} 
            onPress={() => setShowRepeatModal(true)}
          >
            <Ionicons 
              name={repeatMode === 'infinite' ? 'repeat' : repeatMode === 'count' ? 'repeat-outline' : 'repeat-outline'} 
              size={16} 
              color={repeatMode !== 'off' ? COLORS.primary : "#94A3B8"} 
            />
            <Text style={[styles.repeatButtonText, repeatMode !== 'off' && styles.repeatButtonTextActive]}>
              {repeatMode === 'infinite' ? '∞' : repeatMode === 'count' ? `${repeatCountRemaining}` : 'Repeat'}
            </Text>
          </TouchableOpacity>

          {settings.autoPlayNext && (
            <View style={[styles.shuffleButton, settings.shufflePlay && styles.shuffleButtonActive]}>
              <Ionicons 
                name="shuffle" 
                size={16} 
                color={settings.shufflePlay ? COLORS.primary : "#94A3B8"} 
              />
              <Text style={[styles.shuffleButtonText, settings.shufflePlay && styles.shuffleButtonTextActive]}>
                {settings.shufflePlay ? 'Shuffle' : 'Next'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.collapseButton}
            onPress={() => setIsPlayerExpanded(false)}
          >
            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
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

      <RepeatModal
        visible={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        playbackPosition={playbackPosition}
        playbackDuration={playbackDuration}
        repeatMode={repeatMode}
        repeatStartTime={repeatStartTime}
        repeatEndTime={repeatEndTime}
        repeatCount={repeatCount}
        onSetRepeatRange={setRepeatRange}
        onSetRepeatMode={setRepeatMode}
        onClearRepeat={clearRepeat}
      />
    </>
  );
}

interface RepeatModalProps {
  visible: boolean;
  onClose: () => void;
  playbackPosition: number;
  playbackDuration: number;
  repeatMode: RepeatMode;
  repeatStartTime: number | null;
  repeatEndTime: number | null;
  repeatCount: number;
  onSetRepeatRange: (startTime: number, endTime: number) => void;
  onSetRepeatMode: (mode: RepeatMode, count?: number) => void;
  onClearRepeat: () => void;
}

function RepeatModal({
  visible,
  onClose,
  playbackPosition,
  playbackDuration,
  repeatMode,
  repeatStartTime,
  repeatEndTime,
  repeatCount,
  onSetRepeatRange,
  onSetRepeatMode,
  onClearRepeat,
}: RepeatModalProps) {
  const [localStartTime, setLocalStartTime] = useState<number>(repeatStartTime ?? playbackPosition);
  const [localEndTime, setLocalEndTime] = useState<number>(repeatEndTime ?? playbackPosition + 10000);
  const [localCount, setLocalCount] = useState<string>(repeatCount.toString());
  const [selectedMode, setSelectedMode] = useState<RepeatMode>(repeatMode);

  // Update local state when modal opens or props change
  React.useEffect(() => {
    if (visible) {
      setLocalStartTime(repeatStartTime ?? playbackPosition);
      setLocalEndTime(repeatEndTime ?? Math.min(playbackPosition + 10000, playbackDuration));
      setLocalCount(repeatCount.toString());
      setSelectedMode(repeatMode);
    }
  }, [visible, repeatStartTime, repeatEndTime, repeatCount, repeatMode, playbackPosition, playbackDuration]);

  const formatTime = (millis: number) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSetStart = () => {
    const clamped = Math.max(0, Math.min(playbackPosition, playbackDuration));
    setLocalStartTime(clamped);
  };

  const handleSetEnd = () => {
    const clamped = Math.max(0, Math.min(playbackPosition, playbackDuration));
    setLocalEndTime(clamped);
  };

  const handleApply = () => {
    // Clamp values to valid range
    const start = Math.max(0, Math.min(Math.min(localStartTime, localEndTime), playbackDuration));
    const end = Math.max(0, Math.min(Math.max(localStartTime, localEndTime), playbackDuration));
    
    // Ensure start < end
    if (start >= end) {
      // If invalid, set a small range from current position
      const newStart = Math.max(0, playbackPosition - 5000);
      const newEnd = Math.min(playbackDuration, playbackPosition + 5000);
      onSetRepeatRange(newStart, newEnd);
    } else {
      onSetRepeatRange(start, end);
    }
    
    if (selectedMode === 'count') {
      const count = Math.max(1, parseInt(localCount) || 1);
      onSetRepeatMode('count', count);
    } else if (selectedMode === 'infinite') {
      onSetRepeatMode('infinite');
    } else {
      onSetRepeatMode('off');
    }
    onClose();
  };

  const handleClear = () => {
    onClearRepeat();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.repeatModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.repeatModalContainer} onStartShouldSetResponder={() => true}>
          <Text style={styles.repeatModalTitle}>تكرار</Text>
          <Text style={styles.repeatModalSubtitle}>Repeat Section</Text>

          {/* Set Range Section */}
          <View style={styles.repeatSection}>
            <Text style={styles.repeatSectionTitle}>Set Range</Text>
            <View style={styles.repeatTimeRow}>
              <View style={styles.repeatTimeControl}>
                <Text style={styles.repeatTimeLabel}>Start</Text>
                <Text style={styles.repeatTimeValue}>{formatTime(localStartTime)}</Text>
                <TouchableOpacity style={styles.repeatSetButton} onPress={handleSetStart}>
                  <Text style={styles.repeatSetButtonText}>Set to Current</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.repeatTimeControl}>
                <Text style={styles.repeatTimeLabel}>End</Text>
                <Text style={styles.repeatTimeValue}>{formatTime(localEndTime)}</Text>
                <TouchableOpacity style={styles.repeatSetButton} onPress={handleSetEnd}>
                  <Text style={styles.repeatSetButtonText}>Set to Current</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Repeat Mode Selection */}
          <View style={styles.repeatSection}>
            <Text style={styles.repeatSectionTitle}>Repeat Mode</Text>
            <View style={styles.repeatModeOptions}>
              <TouchableOpacity
                style={[styles.repeatModeOption, selectedMode === 'off' && styles.repeatModeOptionActive]}
                onPress={() => setSelectedMode('off')}
              >
                <Ionicons name="close-circle-outline" size={20} color={selectedMode === 'off' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.repeatModeOptionText, selectedMode === 'off' && styles.repeatModeOptionTextActive]}>
                  Off
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.repeatModeOption, selectedMode === 'count' && styles.repeatModeOptionActive]}
                onPress={() => setSelectedMode('count')}
              >
                <Ionicons name="repeat-outline" size={20} color={selectedMode === 'count' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.repeatModeOptionText, selectedMode === 'count' && styles.repeatModeOptionTextActive]}>
                  Count
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.repeatModeOption, selectedMode === 'infinite' && styles.repeatModeOptionActive]}
                onPress={() => setSelectedMode('infinite')}
              >
                <Ionicons name="repeat" size={20} color={selectedMode === 'infinite' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.repeatModeOptionText, selectedMode === 'infinite' && styles.repeatModeOptionTextActive]}>
                  Infinite
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Count Input */}
          {selectedMode === 'count' && (
            <View style={styles.repeatSection}>
              <Text style={styles.repeatSectionTitle}>Repeat Count</Text>
              <TextInput
                style={styles.repeatCountInput}
                value={localCount}
                onChangeText={setLocalCount}
                keyboardType="numeric"
                placeholder="Enter number"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.repeatActionButtons}>
            <TouchableOpacity style={styles.repeatClearButton} onPress={handleClear}>
              <Text style={styles.repeatClearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.repeatApplyButton} onPress={handleApply}>
              <Text style={styles.repeatApplyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  minimizedPlayerContainer: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },
  minimizedPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  minimizedPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimizedInfo: {
    flex: 1,
    minWidth: 0,
  },
  minimizedArabicName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  minimizedSurahName: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  minimizedProgress: {
    height: 3,
    width: 60,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  minimizedProgressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  expandButton: {
    padding: 8,
  },
  globalPlayerContainer: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarTouchArea: {
    height: 36,
    justifyContent: 'center',
    marginHorizontal: -10,
    paddingHorizontal: 10,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  } as any,
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
    marginBottom: 10,
  },
  nowPlayingArabic: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  nowPlayingName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  skipButtonDisabled: {
    opacity: 0.5,
  },
  skipButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginTop: 10,
    gap: 12,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  speedButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  collapseButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  closePlayerButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  repeatButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  repeatButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  repeatButtonTextActive: {
    color: COLORS.primary,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  shuffleButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  shuffleButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  shuffleButtonTextActive: {
    color: COLORS.primary,
  },
  repeatRangeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.primary,
  },
  repeatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatModalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  repeatModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  repeatModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  repeatSection: {
    marginBottom: 20,
  },
  repeatSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  repeatTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  repeatTimeControl: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  repeatTimeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  repeatTimeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  repeatSetButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  repeatSetButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  repeatModeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  repeatModeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  repeatModeOptionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  repeatModeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  repeatModeOptionTextActive: {
    color: COLORS.primary,
  },
  repeatCountInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  repeatActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  repeatClearButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  repeatClearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  repeatApplyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  repeatApplyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});
