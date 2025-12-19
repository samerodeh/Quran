// Qira'at (Quran reading styles) with authentic Mushaf page images
// Using MP3Quran.net for Hafs (verified, high-quality)
// Using Open-Mushaf Native for Warsh (Madina Mushaf - Warsh narration)

import { Qiraa } from '../types';

export const qiraat: Qiraa[] = [
  {
    id: 'hafs',
    name: 'Hafs',
    arabicName: 'حفص عن عاصم',
    description: 'Madani Mushaf - Most common worldwide',
    arabicDescription: 'مصحف المدينة المنورة',
    // MP3Quran.net - verified high-quality images (1080p resolution available)
    getImageUrl: (pageNumber: number): string => {
      const paddedPage = String(pageNumber).padStart(3, '0');
      return `https://www.mp3quran.net/api/quran_pages_arabic/1080/${paddedPage}.png`;
    },
    totalPages: 604,
  },
  {
    id: 'warsh',
    name: 'Warsh',
    arabicName: 'ورش عن نافع',
    description: 'Madina Mushaf - Warsh narration',
    arabicDescription: 'مصحف المدينة - رواية ورش',
    // Open-Mushaf Native - Warsh with blue/azrak styling
    getImageUrl: (pageNumber: number): string => {
      return `https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/assets/mushaf-data/mushaf-elmadina-warsh-azrak/${pageNumber}.png`;
    },
    totalPages: 604,
  },
];

// Total pages in standard Mushaf
export const TOTAL_PAGES = 604;

// Get mushaf page image URL
export const getMushafPageUrl = (pageNumber: number, qiraaId: string = 'hafs'): string => {
  const qiraa = qiraat.find(q => q.id === qiraaId) || qiraat[0];
  if (!qiraa || !qiraa.getImageUrl) return '';
  return qiraa.getImageUrl(pageNumber);
};

// Juz to page mapping
export const JUZ_PAGES = [
  { juz: 1, page: 1, name: 'الم', surah: 'الفاتحة' },
  { juz: 2, page: 22, name: 'سيقول', surah: 'البقرة' },
  { juz: 3, page: 42, name: 'تلك الرسل', surah: 'البقرة' },
  { juz: 4, page: 62, name: 'لن تنالوا', surah: 'آل عمران' },
  { juz: 5, page: 82, name: 'والمحصنات', surah: 'النساء' },
  { juz: 6, page: 102, name: 'لا يحب الله', surah: 'النساء' },
  { juz: 7, page: 121, name: 'وإذا سمعوا', surah: 'المائدة' },
  { juz: 8, page: 142, name: 'ولو أننا', surah: 'الأنعام' },
  { juz: 9, page: 162, name: 'قال الملأ', surah: 'الأعراف' },
  { juz: 10, page: 182, name: 'واعلموا', surah: 'الأنفال' },
  { juz: 11, page: 201, name: 'يعتذرون', surah: 'التوبة' },
  { juz: 12, page: 222, name: 'وما من دابة', surah: 'هود' },
  { juz: 13, page: 242, name: 'وما أبرئ', surah: 'يوسف' },
  { juz: 14, page: 262, name: 'ربما', surah: 'الحجر' },
  { juz: 15, page: 282, name: 'سبحان الذي', surah: 'الإسراء' },
  { juz: 16, page: 302, name: 'قال ألم', surah: 'الكهف' },
  { juz: 17, page: 322, name: 'اقترب للناس', surah: 'الأنبياء' },
  { juz: 18, page: 342, name: 'قد أفلح', surah: 'المؤمنون' },
  { juz: 19, page: 362, name: 'وقال الذين', surah: 'الفرقان' },
  { juz: 20, page: 382, name: 'أمن خلق', surah: 'النمل' },
  { juz: 21, page: 402, name: 'اتل ما أوحي', surah: 'العنكبوت' },
  { juz: 22, page: 422, name: 'ومن يقنت', surah: 'الأحزاب' },
  { juz: 23, page: 442, name: 'وما لي', surah: 'يس' },
  { juz: 24, page: 462, name: 'فمن أظلم', surah: 'الزمر' },
  { juz: 25, page: 482, name: 'إليه يرد', surah: 'فصلت' },
  { juz: 26, page: 502, name: 'حم', surah: 'الأحقاف' },
  { juz: 27, page: 522, name: 'قال فما خطبكم', surah: 'الذاريات' },
  { juz: 28, page: 542, name: 'قد سمع الله', surah: 'المجادلة' },
  { juz: 29, page: 562, name: 'تبارك الذي', surah: 'الملك' },
  { juz: 30, page: 582, name: 'عم', surah: 'النبأ' },
];

// Surah to page mapping (starting page for each surah)
export const SURAH_PAGES = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187,
  10: 208, 11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282,
  18: 293, 19: 305, 20: 312, 21: 322, 22: 332, 23: 342, 24: 350, 25: 359,
  26: 367, 27: 377, 28: 385, 29: 396, 30: 404, 31: 411, 32: 415, 33: 418,
  34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467, 41: 477,
  42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515,
  50: 518, 51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537,
  58: 542, 59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556, 65: 558,
  66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572, 73: 574,
  74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585, 81: 586,
  82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593,
  90: 594, 91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598,
  98: 598, 99: 599, 100: 599, 101: 600, 102: 600, 103: 601, 104: 601,
  105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603, 111: 603,
  112: 604, 113: 604, 114: 604,
};

export default qiraat;
