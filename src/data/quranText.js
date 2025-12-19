// Quran text API helper
// Using quran.com API for text data

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

// Get ayahs for a specific surah
export const getAyahs = async (surahNumber, edition = 'quran-uthmani') => {
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/quran/verses/uthmani?chapter_number=${surahNumber}`
    );
    const data = await response.json();
    return data.verses || [];
  } catch (error) {
    console.error('Error fetching ayahs:', error);
    return [];
  }
};

// Get surah info
export const getSurahInfo = async (surahNumber) => {
  try {
    const response = await fetch(`${QURAN_API_BASE}/chapters/${surahNumber}`);
    const data = await response.json();
    return data.chapter || null;
  } catch (error) {
    console.error('Error fetching surah info:', error);
    return null;
  }
};

// Get page data (for mushaf-style display)
export const getPage = async (pageNumber) => {
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/quran/verses/uthmani?page_number=${pageNumber}`
    );
    const data = await response.json();
    return data.verses || [];
  } catch (error) {
    console.error('Error fetching page:', error);
    return [];
  }
};

// Get verses by juz
export const getJuz = async (juzNumber) => {
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/quran/verses/uthmani?juz_number=${juzNumber}`
    );
    const data = await response.json();
    return data.verses || [];
  } catch (error) {
    console.error('Error fetching juz:', error);
    return [];
  }
};

// Page to Surah mapping (first ayah of each page)
export const PAGE_SURAH_MAP = {
  1: { surah: 1, ayah: 1 },
  2: { surah: 2, ayah: 1 },
  // ... This would be complete in production
};

// Total pages in Quran
export const TOTAL_PAGES = 604;

// Juz information
export const JUZ_INFO = [
  { number: 1, name: 'الم', startSurah: 1, startAyah: 1 },
  { number: 2, name: 'سيقول', startSurah: 2, startAyah: 142 },
  { number: 3, name: 'تلك الرسل', startSurah: 2, startAyah: 253 },
  { number: 4, name: 'لن تنالوا', startSurah: 3, startAyah: 93 },
  { number: 5, name: 'والمحصنات', startSurah: 4, startAyah: 24 },
  { number: 6, name: 'لا يحب الله', startSurah: 4, startAyah: 148 },
  { number: 7, name: 'وإذا سمعوا', startSurah: 5, startAyah: 83 },
  { number: 8, name: 'ولو أننا', startSurah: 6, startAyah: 111 },
  { number: 9, name: 'قال الملأ', startSurah: 7, startAyah: 88 },
  { number: 10, name: 'واعلموا', startSurah: 8, startAyah: 41 },
  { number: 11, name: 'يعتذرون', startSurah: 9, startAyah: 94 },
  { number: 12, name: 'وما من دابة', startSurah: 11, startAyah: 6 },
  { number: 13, name: 'وما أبرئ', startSurah: 12, startAyah: 53 },
  { number: 14, name: 'ربما', startSurah: 15, startAyah: 1 },
  { number: 15, name: 'سبحان الذي', startSurah: 17, startAyah: 1 },
  { number: 16, name: 'قال ألم', startSurah: 18, startAyah: 75 },
  { number: 17, name: 'اقترب للناس', startSurah: 21, startAyah: 1 },
  { number: 18, name: 'قد أفلح', startSurah: 23, startAyah: 1 },
  { number: 19, name: 'وقال الذين', startSurah: 25, startAyah: 21 },
  { number: 20, name: 'أمن خلق', startSurah: 27, startAyah: 56 },
  { number: 21, name: 'اتل ما أوحي', startSurah: 29, startAyah: 46 },
  { number: 22, name: 'ومن يقنت', startSurah: 33, startAyah: 31 },
  { number: 23, name: 'وما أنزلنا', startSurah: 36, startAyah: 28 },
  { number: 24, name: 'فمن أظلم', startSurah: 39, startAyah: 32 },
  { number: 25, name: 'إليه يرد', startSurah: 41, startAyah: 47 },
  { number: 26, name: 'حم', startSurah: 46, startAyah: 1 },
  { number: 27, name: 'قال فما خطبكم', startSurah: 51, startAyah: 31 },
  { number: 28, name: 'قد سمع الله', startSurah: 58, startAyah: 1 },
  { number: 29, name: 'تبارك الذي', startSurah: 67, startAyah: 1 },
  { number: 30, name: 'عم', startSurah: 78, startAyah: 1 },
];

export default {
  getAyahs,
  getSurahInfo,
  getPage,
  getJuz,
  TOTAL_PAGES,
  JUZ_INFO,
};
