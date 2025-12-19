// Quran App Types and Interfaces

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  arabicName: string;
  verses: number;
  revelationType: 'Meccan' | 'Medinan';
  page?: number;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  isLocal?: boolean;
  server?: string;
  folderCode?: string;
  narration?: string;
}

export interface Qiraa {
  id: string;
  name: string;
  arabicName: string;
  description?: string;
  arabicDescription: string;
  getImageUrl?: (pageNumber: number) => string;
  totalPages?: number;
}

export interface Narration {
  id: 'hafs' | 'warsh';
  name: string;
  arabicName: string;
  description: string;
}

export interface AudioPlayerState {
  sound: any; // Expo Audio.Sound instance
  soundRef: React.RefObject<any>;
  isPlaying: boolean;
  isLoading: boolean;
  currentSurah: Surah | null;
  currentReciter: Reciter | null;
  playbackPosition: number;
  playbackDuration: number;
  isSeeking: boolean;
  setIsSeeking: (seeking: boolean) => void;
  seekPosition: number;
  setSeekPosition: (position: number) => void;
  playbackSpeed: number;
  showSpeedPicker: boolean;
  setShowSpeedPicker: (show: boolean) => void;
  showMiniPlayer: boolean;
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: (expanded: boolean) => void;
  isSeekingRef: React.RefObject<boolean>;
  seekPositionRef: React.RefObject<number>;
  progressBarWidth: React.RefObject<number>;
  playbackDurationRef: React.RefObject<number>;
  PLAYBACK_SPEEDS: number[];
  playSurah: (surah: Surah, reciter: Reciter) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  changePlaybackSpeed: (speed: number) => Promise<void>;
  stopPlayback: () => Promise<void>;
}

export interface TabNavigationProps {
  activeTab: 'read' | 'listen' | 'athan';
  setActiveTab: (tab: 'read' | 'listen' | 'athan') => void;
}

export interface ScreenProps {
  onBack?: () => void;
  navigation?: any;
}

export interface ReciterSelectScreenProps extends ScreenProps {
  narration: 'hafs' | 'warsh';
  onSelectReciter: (reciter: Reciter) => void;
}

export interface NarrationSelectScreenProps extends ScreenProps {
  onSelectNarration: (narration: 'hafs' | 'warsh') => void;
}

export interface SurahListScreenProps extends ScreenProps {
  reciter: Reciter;
}

export interface MushafScreenProps extends ScreenProps {
  qiraa: Qiraa;
}

export interface QiraatSelectScreenProps extends ScreenProps {
  onSelectQiraa: (qiraa: Qiraa) => void;
}

export interface ModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

export interface PickerModalProps extends ModalProps {
  title: string;
  items: any[];
  onSelect: (item: any) => void;
}

export interface AudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSpeedChange: () => void;
  playbackSpeed: number;
}

export interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
  isSeeking: boolean;
  onSeekingStart: () => void;
  onSeekingEnd: () => void;
}

export interface NowPlayingProps {
  surah: Surah | null;
  reciter: Reciter | null;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  QiraatSelect: undefined;
  Mushaf: { qiraa: Qiraa };
  NarrationSelect: undefined;
  ReciterSelect: { narration: 'hafs' | 'warsh' };
  SurahList: { reciter: Reciter };
};

// Constants
export const TOTAL_PAGES = 604;
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

// Colors
export const COLORS = {
  primary: '#10B981',
  secondary: '#0F172A',
  accent: '#34D399',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  meccan: 'rgba(245, 158, 11, 0.15)',
  medinan: 'rgba(59, 130, 246, 0.15)',
} as const;

// Athan types
export interface Muezzin {
  id: string;
  name: string;
  arabicName: string;
  location: string;
  audioUrl: string;
  duration: string;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface AthanSettings {
  enabled: boolean;
  selectedMuezzin: Muezzin | null;
  fajrEnabled: boolean;
  dhuhrEnabled: boolean;
  asrEnabled: boolean;
  maghribEnabled: boolean;
  ishaEnabled: boolean;
}

// Utility types
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];
export type TabType = 'read' | 'listen' | 'athan';
export type NarrationType = 'hafs' | 'warsh';
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
