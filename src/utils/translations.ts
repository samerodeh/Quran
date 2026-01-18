import { LanguageCode } from '../types';

export type TranslationKey = 
  // Navigation
  | 'nav.read' | 'nav.listen' | 'nav.salah' | 'nav.athkar' | 'nav.qibla' | 'nav.settings'
  // Read Section
  | 'read.title' | 'read.subtitle' | 'read.chooseMushaf'
  // Listen Section
  | 'listen.title' | 'listen.subtitle' | 'listen.selectReciter' | 'listen.favoritesFirst'
  // Settings
  | 'settings.title' | 'settings.subtitle' | 'settings.playback' | 'settings.language'
  | 'settings.autoPlayNext' | 'settings.autoPlayNextDesc' | 'settings.shufflePlay' | 'settings.shufflePlayDesc'
  | 'settings.primaryLanguage' | 'settings.secondaryLanguage' | 'settings.displayLanguage'
  | 'settings.displayLanguageDesc' | 'settings.alwaysArabic' | 'settings.alwaysEnglish'
  // Common
  | 'common.back' | 'common.select' | 'common.cancel' | 'common.save' | 'common.loading'
  | 'common.error' | 'common.retry' | 'common.favorite' | 'common.favorites'
  // Prayer Times
  | 'prayer.fajr' | 'prayer.dhuhr' | 'prayer.asr' | 'prayer.maghrib' | 'prayer.isha'
  | 'prayer.times' | 'prayer.chooseMuezzin' | 'prayer.selected'
  // Athkar
  | 'athkar.favorites' | 'athkar.counter' | 'athkar.comprehensiveDuas' | 'athkar.friday'
  | 'athkar.etiquette'
  // Qibla
  | 'qibla.title' | 'qibla.subtitle' | 'qibla.direction'
  // Audio Player
  | 'player.nowPlaying' | 'player.play' | 'player.pause' | 'player.next' | 'player.previous'
  | 'player.speed' | 'player.repeat';

interface Translations {
  [key: string]: {
    [lang in LanguageCode]?: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.read': {
    ar: 'قراءة',
    en: 'Read',
    tr: 'Oku',
    fr: 'Lire',
    es: 'Leer',
    ur: 'پڑھیں',
    id: 'Baca',
    de: 'Lesen',
  },
  'nav.listen': {
    ar: 'استماع',
    en: 'Listen',
    tr: 'Dinle',
    fr: 'Écouter',
    es: 'Escuchar',
    ur: 'سنو',
    id: 'Dengarkan',
    de: 'Hören',
  },
  'nav.salah': {
    ar: 'الصلاة',
    en: 'Prayer',
    tr: 'Namaz',
    fr: 'Prière',
    es: 'Oración',
    ur: 'نماز',
    id: 'Sholat',
    de: 'Gebet',
  },
  'nav.athkar': {
    ar: 'أذكار',
    en: 'Dhikr',
    tr: 'Zikir',
    fr: 'Dhikr',
    es: 'Dhikr',
    ur: 'اذکار',
    id: 'Dzikir',
    de: 'Dhikr',
  },
  'nav.qibla': {
    ar: 'القبلة',
    en: 'Qibla',
    tr: 'Kıble',
    fr: 'Qibla',
    es: 'Qibla',
    ur: 'قبلہ',
    id: 'Kiblat',
    de: 'Qibla',
  },
  'nav.settings': {
    ar: 'الإعدادات',
    en: 'Settings',
    tr: 'Ayarlar',
    fr: 'Paramètres',
    es: 'Configuración',
    ur: 'ترتیبات',
    id: 'Pengaturan',
    de: 'Einstellungen',
  },
  // Read Section
  'read.title': {
    ar: 'القرآن الكريم',
    en: 'The Holy Quran',
    tr: 'Kutsal Kuran',
    fr: 'Le Saint Coran',
    es: 'El Sagrado Corán',
    ur: 'قرآن مجید',
    id: 'Al-Quran',
    de: 'Der Heilige Quran',
  },
  'read.subtitle': {
    ar: 'اختر المصحف',
    en: 'Choose Your Mushaf',
    tr: 'Mushaf\'ınızı Seçin',
    fr: 'Choisissez Votre Mushaf',
    es: 'Elige Tu Mushaf',
    ur: 'مصحف منتخب کریں',
    id: 'Pilih Mushaf Anda',
    de: 'Wählen Sie Ihr Mushaf',
  },
  'read.chooseMushaf': {
    ar: 'اختر المصحف',
    en: 'Choose Mushaf',
    tr: 'Mushaf Seç',
    fr: 'Choisir Mushaf',
    es: 'Elegir Mushaf',
    ur: 'مصحف منتخب کریں',
    id: 'Pilih Mushaf',
    de: 'Mushaf Wählen',
  },
  // Listen Section
  'listen.title': {
    ar: 'استماع',
    en: 'Listen to Quran',
    tr: 'Kuran Dinle',
    fr: 'Écouter le Coran',
    es: 'Escuchar el Corán',
    ur: 'قرآن سنیں',
    id: 'Dengarkan Al-Quran',
    de: 'Quran Hören',
  },
  'listen.subtitle': {
    ar: 'اختر القارئ',
    en: 'Select a reciter',
    tr: 'Bir okuyucu seç',
    fr: 'Sélectionner un récitateur',
    es: 'Selecciona un recitador',
    ur: 'قاری منتخب کریں',
    id: 'Pilih pembaca',
    de: 'Wählen Sie einen Rezitator',
  },
  'listen.favoritesFirst': {
    ar: 'المفضلة تظهر أولاً',
    en: 'Favorites appear first',
    tr: 'Favoriler önce görünür',
    fr: 'Les favoris apparaissent en premier',
    es: 'Los favoritos aparecen primero',
    ur: 'پسندیدہ پہلے دکھائی دیتے ہیں',
    id: 'Favorit muncul pertama',
    de: 'Favoriten erscheinen zuerst',
  },
  // Settings
  'settings.title': {
    ar: 'الإعدادات',
    en: 'Settings',
    tr: 'Ayarlar',
    fr: 'Paramètres',
    es: 'Configuración',
    ur: 'ترتیبات',
    id: 'Pengaturan',
    de: 'Einstellungen',
  },
  'settings.subtitle': {
    ar: 'الإعدادات',
    en: 'Settings',
    tr: 'Ayarlar',
    fr: 'Paramètres',
    es: 'Configuración',
    ur: 'ترتیبات',
    id: 'Pengaturan',
    de: 'Einstellungen',
  },
  'settings.playback': {
    ar: 'إعدادات التشغيل',
    en: 'Playback Settings',
    tr: 'Oynatma Ayarları',
    fr: 'Paramètres de lecture',
    es: 'Configuración de reproducción',
    ur: 'پلے بیک ترتیبات',
    id: 'Pengaturan Pemutaran',
    de: 'Wiedergabeeinstellungen',
  },
  'settings.language': {
    ar: 'إعدادات اللغة',
    en: 'Language Settings',
    tr: 'Dil Ayarları',
    fr: 'Paramètres de langue',
    es: 'Configuración de idioma',
    ur: 'زبان کی ترتیبات',
    id: 'Pengaturan Bahasa',
    de: 'Spracheinstellungen',
  },
  'settings.autoPlayNext': {
    ar: 'التشغيل التلقائي للسورة التالية',
    en: 'Auto-play Next Surah',
    tr: 'Sonraki Sureyi Otomatik Oynat',
    fr: 'Lecture automatique de la sourate suivante',
    es: 'Reproducir automáticamente la siguiente sura',
    ur: 'اگلی سورت خودکار چلائیں',
    id: 'Putar Otomatis Surah Berikutnya',
    de: 'Nächste Sure automatisch abspielen',
  },
  'settings.autoPlayNextDesc': {
    ar: 'تشغيل السورة التالية تلقائياً عند انتهاء السورة الحالية',
    en: 'Automatically play the next surah when the current one ends',
    tr: 'Mevcut sure bittiğinde bir sonraki sureyi otomatik olarak oynat',
    fr: 'Lire automatiquement la sourate suivante lorsque la sourate actuelle se termine',
    es: 'Reproducir automáticamente la siguiente sura cuando termine la actual',
    ur: 'موجودہ سورت ختم ہونے پر اگلی سورت خودکار چلائیں',
    id: 'Putar otomatis surah berikutnya saat surah saat ini berakhir',
    de: 'Nächste Sure automatisch abspielen, wenn die aktuelle endet',
  },
  'settings.shufflePlay': {
    ar: 'التشغيل العشوائي',
    en: 'Shuffle Play',
    tr: 'Karışık Oynat',
    fr: 'Lecture aléatoire',
    es: 'Reproducción aleatoria',
    ur: 'بے ترتیب چلائیں',
    id: 'Putar Acak',
    de: 'Zufällige Wiedergabe',
  },
  'settings.shufflePlayDesc': {
    ar: 'تشغيل سورة عشوائية عند انتهاء السورة الحالية',
    en: 'Play a random surah when the current one ends',
    tr: 'Mevcut sure bittiğinde rastgele bir sure oynat',
    fr: 'Lire une sourate aléatoire lorsque la sourate actuelle se termine',
    es: 'Reproducir una sura aleatoria cuando termine la actual',
    ur: 'موجودہ سورت ختم ہونے پر بے ترتیب سورت چلائیں',
    id: 'Putar surah acak saat surah saat ini berakhir',
    de: 'Zufällige Sure abspielen, wenn die aktuelle endet',
  },
  'settings.primaryLanguage': {
    ar: 'اللغة الأساسية',
    en: 'Primary Language',
    tr: 'Birincil Dil',
    fr: 'Langue principale',
    es: 'Idioma principal',
    ur: 'بنیادی زبان',
    id: 'Bahasa Utama',
    de: 'Hauptsprache',
  },
  'settings.secondaryLanguage': {
    ar: 'اللغة الثانوية',
    en: 'Secondary Language',
    tr: 'İkincil Dil',
    fr: 'Langue secondaire',
    es: 'Idioma secundario',
    ur: 'ثانوی زبان',
    id: 'Bahasa Sekunder',
    de: 'Sekundärsprache',
  },
  'settings.displayLanguage': {
    ar: 'لغة العرض',
    en: 'Display Language',
    tr: 'Görüntüleme Dili',
    fr: 'Langue d\'affichage',
    es: 'Idioma de visualización',
    ur: 'ڈسپلے زبان',
    id: 'Bahasa Tampilan',
    de: 'Anzeigesprache',
  },
  'settings.displayLanguageDesc': {
    ar: 'اختر اللغة التي تريد عرضها مع العربية والإنجليزية',
    en: 'Choose the language to display alongside Arabic and English',
    tr: 'Arapça ve İngilizce ile birlikte görüntülemek istediğiniz dili seçin',
    fr: 'Choisissez la langue à afficher aux côtés de l\'arabe et de l\'anglais',
    es: 'Elige el idioma para mostrar junto con árabe e inglés',
    ur: 'عربی اور انگریزی کے ساتھ دکھانے کے لیے زبان منتخب کریں',
    id: 'Pilih bahasa untuk ditampilkan bersama bahasa Arab dan Inggris',
    de: 'Wählen Sie die Sprache, die neben Arabisch und Englisch angezeigt werden soll',
  },
  'settings.alwaysArabic': {
    ar: 'دائماً العربية',
    en: 'Always Arabic (العربية)',
    tr: 'Her Zaman Arapça (العربية)',
    fr: 'Toujours l\'arabe (العربية)',
    es: 'Siempre árabe (العربية)',
    ur: 'ہمیشہ عربی (العربية)',
    id: 'Selalu Bahasa Arab (العربية)',
    de: 'Immer Arabisch (العربية)',
  },
  'settings.alwaysEnglish': {
    ar: 'دائماً الإنجليزية',
    en: 'Always English',
    tr: 'Her Zaman İngilizce',
    fr: 'Toujours l\'anglais',
    es: 'Siempre inglés',
    ur: 'ہمیشہ انگریزی',
    id: 'Selalu Bahasa Inggris',
    de: 'Immer Englisch',
  },
  // Common
  'common.back': {
    ar: 'رجوع',
    en: 'Back',
    tr: 'Geri',
    fr: 'Retour',
    es: 'Atrás',
    ur: 'واپس',
    id: 'Kembali',
    de: 'Zurück',
  },
  'common.select': {
    ar: 'اختر',
    en: 'Select',
    tr: 'Seç',
    fr: 'Sélectionner',
    es: 'Seleccionar',
    ur: 'منتخب کریں',
    id: 'Pilih',
    de: 'Auswählen',
  },
  'common.cancel': {
    ar: 'إلغاء',
    en: 'Cancel',
    tr: 'İptal',
    fr: 'Annuler',
    es: 'Cancelar',
    ur: 'منسوخ',
    id: 'Batal',
    de: 'Abbrechen',
  },
  'common.save': {
    ar: 'حفظ',
    en: 'Save',
    tr: 'Kaydet',
    fr: 'Enregistrer',
    es: 'Guardar',
    ur: 'محفوظ',
    id: 'Simpan',
    de: 'Speichern',
  },
  'common.loading': {
    ar: 'جاري التحميل...',
    en: 'Loading...',
    tr: 'Yükleniyor...',
    fr: 'Chargement...',
    es: 'Cargando...',
    ur: 'لوڈ ہو رہا ہے...',
    id: 'Memuat...',
    de: 'Lädt...',
  },
  'common.error': {
    ar: 'خطأ',
    en: 'Error',
    tr: 'Hata',
    fr: 'Erreur',
    es: 'Error',
    ur: 'خرابی',
    id: 'Kesalahan',
    de: 'Fehler',
  },
  'common.retry': {
    ar: 'إعادة المحاولة',
    en: 'Retry',
    tr: 'Tekrar Dene',
    fr: 'Réessayer',
    es: 'Reintentar',
    ur: 'دوبارہ کوشش کریں',
    id: 'Coba Lagi',
    de: 'Wiederholen',
  },
  'common.favorite': {
    ar: 'مفضل',
    en: 'Favorite',
    tr: 'Favori',
    fr: 'Favori',
    es: 'Favorito',
    ur: 'پسندیدہ',
    id: 'Favorit',
    de: 'Favorit',
  },
  'common.favorites': {
    ar: 'المفضلة',
    en: 'Favorites',
    tr: 'Favoriler',
    fr: 'Favoris',
    es: 'Favoritos',
    ur: 'پسندیدہ',
    id: 'Favorit',
    de: 'Favoriten',
  },
  // Prayer Times
  'prayer.fajr': {
    ar: 'الفجر',
    en: 'Fajr',
    tr: 'Fecir',
    fr: 'Fajr',
    es: 'Fajr',
    ur: 'فجر',
    id: 'Fajr',
    de: 'Fajr',
  },
  'prayer.dhuhr': {
    ar: 'الظهر',
    en: 'Dhuhr',
    tr: 'Öğle',
    fr: 'Dhuhr',
    es: 'Dhuhr',
    ur: 'ظہر',
    id: 'Dhuhr',
    de: 'Dhuhr',
  },
  'prayer.asr': {
    ar: 'العصر',
    en: 'Asr',
    tr: 'İkindi',
    fr: 'Asr',
    es: 'Asr',
    ur: 'عصر',
    id: 'Asr',
    de: 'Asr',
  },
  'prayer.maghrib': {
    ar: 'المغرب',
    en: 'Maghrib',
    tr: 'Akşam',
    fr: 'Maghrib',
    es: 'Maghrib',
    ur: 'مغرب',
    id: 'Maghrib',
    de: 'Maghrib',
  },
  'prayer.isha': {
    ar: 'العشاء',
    en: 'Isha',
    tr: 'Yatsı',
    fr: 'Isha',
    es: 'Isha',
    ur: 'عشاء',
    id: 'Isha',
    de: 'Isha',
  },
  'prayer.times': {
    ar: 'أوقات الصلاة',
    en: 'Prayer Times',
    tr: 'Namaz Vakitleri',
    fr: 'Heures de prière',
    es: 'Horarios de oración',
    ur: 'نماز کے اوقات',
    id: 'Waktu Sholat',
    de: 'Gebetszeiten',
  },
  'prayer.chooseMuezzin': {
    ar: 'اختر المؤذن',
    en: 'Choose Muezzin',
    tr: 'Müezzin Seç',
    fr: 'Choisir le muezzin',
    es: 'Elegir muecín',
    ur: 'موذن منتخب کریں',
    id: 'Pilih Muazin',
    de: 'Muezzin wählen',
  },
  'prayer.selected': {
    ar: 'المحدد',
    en: 'Selected',
    tr: 'Seçildi',
    fr: 'Sélectionné',
    es: 'Seleccionado',
    ur: 'منتخب',
    id: 'Dipilih',
    de: 'Ausgewählt',
  },
  // Athkar
  'athkar.favorites': {
    ar: 'المفضلة',
    en: 'Favorites',
    tr: 'Favoriler',
    fr: 'Favoris',
    es: 'Favoritos',
    ur: 'پسندیدہ',
    id: 'Favorit',
    de: 'Favoriten',
  },
  'athkar.counter': {
    ar: 'العداد',
    en: 'Counter',
    tr: 'Sayaç',
    fr: 'Compteur',
    es: 'Contador',
    ur: 'کاؤنٹر',
    id: 'Penghitung',
    de: 'Zähler',
  },
  'athkar.comprehensiveDuas': {
    ar: 'أدعية شاملة',
    en: 'Comprehensive Duas',
    tr: 'Kapsamlı Dualar',
    fr: 'Duas complets',
    es: 'Duas completos',
    ur: 'جامع دعائیں',
    id: 'Doa Komprehensif',
    de: 'Umfassende Duas',
  },
  'athkar.friday': {
    ar: 'يوم الجمعة',
    en: 'Friday',
    tr: 'Cuma',
    fr: 'Vendredi',
    es: 'Viernes',
    ur: 'جمعہ',
    id: 'Jumat',
    de: 'Freitag',
  },
  'athkar.etiquette': {
    ar: 'آداب الدعاء',
    en: 'Dua Etiquette',
    tr: 'Dua Adabı',
    fr: 'Étiquette du Dua',
    es: 'Etiqueta del Dua',
    ur: 'دعا کا آداب',
    id: 'Etika Doa',
    de: 'Dua-Etikette',
  },
  // Qibla
  'qibla.title': {
    ar: 'القبلة',
    en: 'Qibla Direction',
    tr: 'Kıble Yönü',
    fr: 'Direction de la Qibla',
    es: 'Dirección de la Qibla',
    ur: 'قبلہ کی سمت',
    id: 'Arah Kiblat',
    de: 'Qibla-Richtung',
  },
  'qibla.subtitle': {
    ar: 'اتجاه القبلة',
    en: 'Find the Qibla',
    tr: 'Kıbleyi Bul',
    fr: 'Trouver la Qibla',
    es: 'Encontrar la Qibla',
    ur: 'قبلہ تلاش کریں',
    id: 'Temukan Kiblat',
    de: 'Qibla finden',
  },
  'qibla.direction': {
    ar: 'الاتجاه',
    en: 'Direction',
    tr: 'Yön',
    fr: 'Direction',
    es: 'Dirección',
    ur: 'سمت',
    id: 'Arah',
    de: 'Richtung',
  },
  // Audio Player
  'player.nowPlaying': {
    ar: 'قيد التشغيل',
    en: 'Now Playing',
    tr: 'Şimdi Oynatılıyor',
    fr: 'En cours de lecture',
    es: 'Reproduciendo',
    ur: 'اب چل رہا ہے',
    id: 'Sedang Diputar',
    de: 'Wird abgespielt',
  },
  'player.play': {
    ar: 'تشغيل',
    en: 'Play',
    tr: 'Oynat',
    fr: 'Lire',
    es: 'Reproducir',
    ur: 'چلائیں',
    id: 'Putar',
    de: 'Abspielen',
  },
  'player.pause': {
    ar: 'إيقاف',
    en: 'Pause',
    tr: 'Duraklat',
    fr: 'Pause',
    es: 'Pausar',
    ur: 'موقوف',
    id: 'Jeda',
    de: 'Pause',
  },
  'player.next': {
    ar: 'التالي',
    en: 'Next',
    tr: 'Sonraki',
    fr: 'Suivant',
    es: 'Siguiente',
    ur: 'اگلا',
    id: 'Berikutnya',
    de: 'Weiter',
  },
  'player.previous': {
    ar: 'السابق',
    en: 'Previous',
    tr: 'Önceki',
    fr: 'Précédent',
    es: 'Anterior',
    ur: 'پچھلا',
    id: 'Sebelumnya',
    de: 'Zurück',
  },
  'player.speed': {
    ar: 'السرعة',
    en: 'Speed',
    tr: 'Hız',
    fr: 'Vitesse',
    es: 'Velocidad',
    ur: 'رفتار',
    id: 'Kecepatan',
    de: 'Geschwindigkeit',
  },
  'player.repeat': {
    ar: 'تكرار',
    en: 'Repeat',
    tr: 'Tekrarla',
    fr: 'Répéter',
    es: 'Repetir',
    ur: 'دہرائیں',
    id: 'Ulangi',
    de: 'Wiederholen',
  },
};

export function getTranslation(key: TranslationKey, language: LanguageCode): string {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  // Try to get translation for the requested language
  if (translation[language]) {
    return translation[language]!;
  }
  
  // Fallback to English if language not available
  if (translation.en) {
    return translation.en;
  }
  
  // Fallback to Arabic if English not available
  if (translation.ar) {
    return translation.ar;
  }
  
  // Last resort: return the key
  return key;
}

