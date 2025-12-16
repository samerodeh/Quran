// List of available Quran reciters
// Each reciter has their own server on mp3quran.net
// Local reciters use isLocal: true and load from assets/audio folder
export const reciters = [
  {
    id: 'samer',
    name: 'Samer Odeh',
    arabicName: 'سامر عودة',
    isLocal: true,
    folderCode: 'samer',
  },
  {
    id: 'afs',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    server: 'server8.mp3quran.net',
    folderCode: 'afs',
  },
  {
    id: 'yasser',
    name: 'Yasser Al-Dosari',
    arabicName: 'ياسر الدوسري',
    server: 'server11.mp3quran.net',
    folderCode: 'yasser',
  },
  {
    id: 'maher',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    server: 'server12.mp3quran.net',
    folderCode: 'maher',
  },
  {
    id: 'lhdan',
    name: 'Muhammad Al-Luhaidan',
    arabicName: 'محمد اللحيدان',
    server: 'server8.mp3quran.net',
    folderCode: 'lhdan',
  },
];

// Helper function to get audio URL for a surah with selected reciter
export const getAudioUrl = (surahId, reciter) => {
  const paddedId = String(surahId).padStart(3, '0');
  return `https://${reciter.server}/${reciter.folderCode}/${paddedId}.mp3`;
};

export default reciters;
