// List of available Quran reciters
// Each reciter has their own server on mp3quran.net
// Local reciters use isLocal: true and load from assets/audio folder

import { Reciter } from '../types';

// Hafs reciters (most common narration)
export const hafsReciters: Reciter[] = [
  {
    id: 'afs',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    server: 'server8.mp3quran.net',
    folderCode: 'afs',
    narration: 'Hafs',
  },
  {
    id: 'yasser',
    name: 'Yasser Al-Dosari',
    arabicName: 'ياسر الدوسري',
    server: 'server11.mp3quran.net',
    folderCode: 'yasser',
    narration: 'Hafs',
  },
  {
    id: 'maher',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    server: 'server12.mp3quran.net',
    folderCode: 'maher',
    narration: 'Hafs',
  },
  {
    id: 'lhdan',
    name: 'Muhammad Al-Luhaidan',
    arabicName: 'محمد اللحيدان',
    server: 'server8.mp3quran.net',
    folderCode: 'lhdan',
    narration: 'Hafs',
  },
];

// Warsh reciters (North & West African narration)
export const warshReciters: Reciter[] = [
  {
    id: 'hicham',
    name: 'Hicham Lharraz',
    arabicName: 'هشام الهراز',
    server: 'server16.mp3quran.net',
    folderCode: 'H-Lharraz/Rewayat-Warsh-A-n-Nafi',
    narration: 'Warsh',
  },
];

// Combined list for backward compatibility
export const reciters = [...hafsReciters, ...warshReciters];

// Helper function to get audio URL for a surah with selected reciter
export const getAudioUrl = (surahId: number, reciter: Reciter): string => {
  const paddedId = String(surahId).padStart(3, '0');
  return `https://${reciter.server}/${reciter.folderCode}/${paddedId}.mp3`;
};

export default reciters;
