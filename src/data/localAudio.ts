// Local audio files mapping for Samer Odeh recitations
// Add your audio files to assets/audio/samer/ folder
// Name them as: 001.mp3, 002.mp3, ... 114.mp3 (padded to 3 digits)

// Import all your local audio files here
// Example: import surah001 from '../assets/audio/samer/001.mp3';

// For now, this is a placeholder map
// You'll need to add imports for each surah you record

const localAudioMap = {
  samer: {
    // Uncomment and add as you record each surah:
    // 1: require('../assets/audio/samer/001.mp3'),
    // 2: require('../assets/audio/samer/002.mp3'),
    // 36: require('../assets/audio/samer/036.mp3'),
    // ... add more as you record
  },
};

export const getLocalAudio = (reciterId: string, surahId: number): any => {
  const reciterAudio = localAudioMap[reciterId as keyof typeof localAudioMap] as any;
  if (reciterAudio && reciterAudio[surahId]) {
    return reciterAudio[surahId];
  }
  return null;
};

export const hasLocalAudio = (reciterId: string, surahId: number): boolean => {
  const reciterAudio = localAudioMap[reciterId as keyof typeof localAudioMap] as any;
  return reciterAudio && reciterAudio[surahId] !== undefined;
};

// Get list of available surahs for a local reciter
export const getAvailableSurahs = (reciterId: string): number[] => {
  const reciterAudio = localAudioMap[reciterId as keyof typeof localAudioMap] as any;
  if (!reciterAudio) return [];
  return Object.keys(reciterAudio).map(Number);
};

export default localAudioMap;
