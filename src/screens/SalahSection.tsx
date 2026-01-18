import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../types';

const { width } = Dimensions.get('window');
const NOTIFICATION_SETTINGS_KEY = '@prayer_notifications';

type SubTab = 'times' | 'rawatib' | 'duha' | 'forbidden';

interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
  isNext?: boolean;
  notificationEnabled: boolean;
}

interface NotificationSettings {
  [key: string]: boolean;
}

// Hijri date calculation (simplified)
const getHijriDate = () => {
  const today = new Date();
  // Approximate Hijri calculation
  const hijriYear = Math.floor((today.getFullYear() - 622) * (33 / 32));
  const hijriMonth = 6; // Jumada al-Thani (approximate)
  const hijriDay = 28;
  return { year: hijriYear, month: hijriMonth, day: hijriDay };
};

const getArabicDay = () => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[new Date().getDay()];
};

const getHijriMonthName = (month: number) => {
  const months = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  return months[month - 1] || months[0];
};

export function SalahSection() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('times');
  const [location, setLocation] = useState<string>('جاري التحديد...');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
    Midnight: false,
    LastThird: false,
  });

  const hijriDate = getHijriDate();
  const arabicDay = getArabicDay();
  const today = new Date();

  // Load notification settings from storage
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (stored) {
          setNotificationSettings(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    loadNotificationSettings();
  }, []);

  // Toggle notification for a prayer
  const toggleNotification = useCallback(async (prayerName: string) => {
    const newSettings = {
      ...notificationSettings,
      [prayerName]: !notificationSettings[prayerName],
    };
    
    setNotificationSettings(newSettings);
    
    // Update prayer times state
    setPrayerTimes(prev => prev.map(prayer => 
      prayer.name === prayerName 
        ? { ...prayer, notificationEnabled: newSettings[prayerName] }
        : prayer
    ));

    // Save to storage
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Show feedback
      const prayer = prayerTimes.find(p => p.name === prayerName);
      if (prayer) {
        const status = newSettings[prayerName] ? 'تم تفعيل' : 'تم إيقاف';
        Alert.alert(
          newSettings[prayerName] ? '🔔 التنبيه مفعّل' : '🔕 التنبيه متوقف',
          `${status} تنبيه ${prayer.arabicName}`,
          [{ text: 'حسناً', style: 'default' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, [notificationSettings, prayerTimes]);

  // Fetch prayer times with periodic location updates
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let refreshInterval: NodeJS.Timeout | null = null;

    const fetchPrayerTimes = async (loc?: Location.LocationObject) => {
      try {
        let currentLocation = loc;
        
        if (!currentLocation) {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setLocation('الموقع الحالي'); // Default
            setDefaultPrayerTimes();
            return;
          }

          currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
        
        // Reverse geocode to get city name
        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          
          if (addresses && addresses.length > 0) {
            const address = addresses[0];
            let locationName = '';
            
            // Priority: city name first, then district, then region
            // Try to get the most specific city/location name
            if (address.city) {
              locationName = address.city;
            } else if (address.district) {
              locationName = address.district;
            } else if (address.subregion) {
              locationName = address.subregion;
            } else if (address.region) {
              locationName = address.region;
            } else if (address.name) {
              locationName = address.name;
            }
            
            // If we have a location name, optionally add country for context
            if (locationName) {
              // Only add country if it's different and provides useful context
              if (address.country && 
                  address.country !== locationName && 
                  !locationName.includes(address.country)) {
                locationName = `${locationName}, ${address.country}`;
              }
              setLocation(locationName);
            } else if (address.country) {
              // Fallback to country if nothing else is available
              setLocation(address.country);
            } else {
              setLocation('الموقع الحالي');
            }
          } else {
            setLocation('الموقع الحالي');
          }
        } catch (geocodeError) {
          console.error('Error reverse geocoding:', geocodeError);
          setLocation('الموقع الحالي');
        }

        // Fetch from Aladhan API
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${currentLocation.coords.latitude}&longitude=${currentLocation.coords.longitude}&method=4`
        );
        const data = await response.json();
        
        if (data.code === 200) {
          const timings = data.data.timings;
          const times: PrayerTime[] = [
            { name: 'Fajr', arabicName: 'الفجر', time: timings.Fajr, notificationEnabled: notificationSettings.Fajr },
            { name: 'Sunrise', arabicName: 'الشروق', time: timings.Sunrise, notificationEnabled: notificationSettings.Sunrise },
            { name: 'Dhuhr', arabicName: 'الظهر', time: timings.Dhuhr, notificationEnabled: notificationSettings.Dhuhr },
            { name: 'Asr', arabicName: 'العصر', time: timings.Asr, notificationEnabled: notificationSettings.Asr },
            { name: 'Maghrib', arabicName: 'المغرب', time: timings.Maghrib, notificationEnabled: notificationSettings.Maghrib },
            { name: 'Isha', arabicName: 'العشاء', time: timings.Isha, notificationEnabled: notificationSettings.Isha },
            { name: 'Midnight', arabicName: 'منتصف الليل', time: timings.Midnight, notificationEnabled: notificationSettings.Midnight },
            { name: 'LastThird', arabicName: 'الثلث الأخير', time: timings.Lastthird, notificationEnabled: notificationSettings.LastThird },
          ];
          setPrayerTimes(times);
          findNextPrayer(times);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setDefaultPrayerTimes();
      } finally {
        setLoading(false);
      }
    };

    const setDefaultPrayerTimes = () => {
      const times: PrayerTime[] = [
        { name: 'Fajr', arabicName: 'الفجر', time: '5:36', notificationEnabled: notificationSettings.Fajr },
        { name: 'Sunrise', arabicName: 'الشروق', time: '6:55', notificationEnabled: notificationSettings.Sunrise },
        { name: 'Dhuhr', arabicName: 'الظهر', time: '12:18', notificationEnabled: notificationSettings.Dhuhr },
        { name: 'Asr', arabicName: 'العصر', time: '3:13', notificationEnabled: notificationSettings.Asr },
        { name: 'Maghrib', arabicName: 'المغرب', time: '5:35', notificationEnabled: notificationSettings.Maghrib },
        { name: 'Isha', arabicName: 'العشاء', time: '6:54', notificationEnabled: notificationSettings.Isha },
        { name: 'Midnight', arabicName: 'منتصف الليل', time: '11:36', notificationEnabled: notificationSettings.Midnight },
        { name: 'LastThird', arabicName: 'الثلث الأخير', time: '1:36', notificationEnabled: notificationSettings.LastThird },
      ];
      setPrayerTimes(times);
      findNextPrayer(times);
      setLoading(false);
    };

    // Initial fetch
    fetchPrayerTimes();

    // Watch location changes
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 30000, // Update every 30 seconds
              distanceInterval: 500, // Or when moved 500m
            },
            (newLocation) => {
              fetchPrayerTimes(newLocation);
            }
          );
        }
      } catch (error) {
        console.error('Error setting up location watch:', error);
      }
    })();

    // Also refresh every 5 minutes as backup
    refreshInterval = setInterval(() => {
      fetchPrayerTimes();
    }, 5 * 60 * 1000);

    return () => {
      if (locationSubscription) {
        try {
          if (typeof locationSubscription.remove === 'function') {
            locationSubscription.remove();
          }
        } catch (error) {
          console.error('Error removing location subscription:', error);
        }
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [notificationSettings]);

  const findNextPrayer = (times: PrayerTime[]) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (const prayer of times) {
      if (prayer.name === 'Midnight' || prayer.name === 'LastThird' || prayer.name === 'Sunrise') continue;
      
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (prayerMinutes > currentMinutes) {
        setNextPrayer({ ...prayer, isNext: true });
        return;
      }
    }
    // If no prayer found, next is Fajr
    setNextPrayer({ ...times[0], isNext: true });
  };

  // Countdown timer
  useEffect(() => {
    if (!nextPrayer) return;

    const updateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = nextPrayer.time.split(':').map(Number);
      
      let target = new Date();
      target.setHours(hours, minutes, 0, 0);
      
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  const formatTime12 = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const renderPrayerTimes = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Location */}
      <View style={styles.locationCard}>
        <Text style={styles.locationText}>{location}</Text>
      </View>

      {/* Date Cards */}
      <View style={styles.dateRow}>
        <View style={styles.dateCard}>
          <Text style={styles.dateArabicDay}>الجمعة</Text>
          <Text style={styles.dateGregorian}>{today.toISOString().split('T')[0]}</Text>
        </View>
        <View style={styles.dateCard}>
          <Text style={styles.dateHijriMonth}>{getHijriMonthName(hijriDate.month)}</Text>
          <Text style={styles.dateHijri}>{`${hijriDate.year}-${String(hijriDate.month).padStart(2, '0')}-${hijriDate.day}`}</Text>
        </View>
      </View>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>
            {nextPrayer.arabicName} {nextPrayer.time} بعد
          </Text>
          <Text style={styles.countdownTime}>
            {countdown.hours}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
          </Text>
        </View>
      )}

      {/* Prayer Times Grid */}
      <View style={styles.prayerGrid}>
        {prayerTimes.slice(0, 2).map((prayer, index) => (
          <View key={prayer.name} style={[styles.prayerCard, index === 0 && styles.prayerCardRight]}>
            <TouchableOpacity 
              style={styles.notificationIcon}
              onPress={() => toggleNotification(prayer.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={notificationSettings[prayer.name] ? "notifications" : "notifications-off-outline"} 
                size={18} 
                color={notificationSettings[prayer.name] ? COLORS.primary : COLORS.textSecondary} 
              />
            </TouchableOpacity>
            <Text style={styles.prayerName}>{prayer.arabicName}</Text>
            <Text style={styles.prayerTime}>{formatTime12(prayer.time)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.prayerGrid}>
        {prayerTimes.slice(2, 4).map((prayer, index) => (
          <View 
            key={prayer.name} 
            style={[
              styles.prayerCard, 
              index === 0 && styles.prayerCardRight,
              nextPrayer?.name === prayer.name && styles.prayerCardActive
            ]}
          >
            <TouchableOpacity 
              style={styles.notificationIcon}
              onPress={() => toggleNotification(prayer.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={notificationSettings[prayer.name] ? "notifications" : "notifications-off-outline"} 
                size={18} 
                color={nextPrayer?.name === prayer.name ? '#F59E0B' : (notificationSettings[prayer.name] ? COLORS.primary : COLORS.textSecondary)} 
              />
            </TouchableOpacity>
            <Text style={[styles.prayerName, nextPrayer?.name === prayer.name && styles.prayerNameActive]}>
              {prayer.arabicName}
            </Text>
            <Text style={[styles.prayerTime, nextPrayer?.name === prayer.name && styles.prayerTimeActive]}>
              {formatTime12(prayer.time)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.prayerGrid}>
        {prayerTimes.slice(4, 6).map((prayer, index) => (
          <View 
            key={prayer.name} 
            style={[
              styles.prayerCard, 
              index === 0 && styles.prayerCardRight,
              nextPrayer?.name === prayer.name && styles.prayerCardActive
            ]}
          >
            <TouchableOpacity 
              style={styles.notificationIcon}
              onPress={() => toggleNotification(prayer.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={notificationSettings[prayer.name] ? "notifications" : "notifications-off-outline"} 
                size={18} 
                color={nextPrayer?.name === prayer.name ? '#F59E0B' : (notificationSettings[prayer.name] ? COLORS.primary : COLORS.textSecondary)} 
              />
            </TouchableOpacity>
            <Text style={[styles.prayerName, nextPrayer?.name === prayer.name && styles.prayerNameActive]}>
              {prayer.arabicName}
            </Text>
            <Text style={[styles.prayerTime, nextPrayer?.name === prayer.name && styles.prayerTimeActive]}>
              {formatTime12(prayer.time)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.prayerGrid}>
        {prayerTimes.slice(6, 8).map((prayer, index) => (
          <View key={prayer.name} style={[styles.prayerCard, index === 0 && styles.prayerCardRight]}>
            <TouchableOpacity 
              style={styles.notificationIcon}
              onPress={() => toggleNotification(prayer.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={notificationSettings[prayer.name] ? "notifications" : "notifications-off-outline"} 
                size={18} 
                color={notificationSettings[prayer.name] ? COLORS.primary : COLORS.textSecondary} 
              />
            </TouchableOpacity>
            <Text style={styles.prayerName}>{prayer.arabicName}</Text>
            <Text style={styles.prayerTime}>{formatTime12(prayer.time)}</Text>
          </View>
        ))}
      </View>

      {/* Extra Buttons */}
      <View style={styles.extraButtonsRow}>
        <TouchableOpacity style={styles.extraButton} onPress={() => setActiveSubTab('rawatib')}>
          <Text style={styles.extraButtonText}>السنن الرواتب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraButton} onPress={() => setActiveSubTab('duha')}>
          <Text style={styles.extraButtonText}>صلاة الضحى</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.fullWidthButton} onPress={() => setActiveSubTab('forbidden')}>
        <Text style={styles.extraButtonText}>أوقات النهي عن الصلاة</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderRawatib = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubTab('times')}>
        <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
        <Text style={styles.backButtonText}>رجوع</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>السنن الرواتب</Text>

      {/* Rawatib Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>بعد</Text>
          <Text style={styles.tableHeaderText}>الصلاة</Text>
          <Text style={styles.tableHeaderText}>قبل</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>-</Text>
          <Text style={styles.tableCell}>الفجر</Text>
          <Text style={styles.tableCellBold}>2</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCellBold}>2</Text>
          <Text style={styles.tableCell}>الظهر</Text>
          <Text style={styles.tableCellBold}>2 + 2</Text>
        </View>

        <View style={[styles.tableRow, styles.tableRowHighlight]}>
          <Text style={styles.tableCell}>-</Text>
          <Text style={[styles.tableCell, styles.tableCellHighlight]}>العصر</Text>
          <Text style={styles.tableCell}>-</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCellBold}>2</Text>
          <Text style={styles.tableCell}>المغرب</Text>
          <Text style={styles.tableCell}>-</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCellBold}>2</Text>
          <Text style={styles.tableCell}>العشاء</Text>
          <Text style={styles.tableCell}>-</Text>
        </View>
      </View>

      {/* Hadith */}
      <View style={styles.hadithContainer}>
        <Text style={styles.hadithText}>
          عن أُمِّ المؤمنينَ أُمِّ حبيبةَ رَملةَ بِنتِ أَبي سُفيانَ رضيَ اللهُ عَنهم قالتْ: قالَ رَسُولُ اللهِ ﷺ: مَنْ صَلَّى في يَومٍ وليلةٍ ثِنْتَيْ عَشْرَةَ رَكعةً بُنِيَ لهُ بَيتٌ في الجَنَّةِ أَربعًا قَبلَ الظُّهرِ ورَكعتَينِ بَعدَها ورَكعتَينِ بَعدَ المَغرِبِ ورَكعتَينِ بعدَ العِشاءِ ورَكعتَينِ قَبلَ صَلاةِ الفَجرِ. رواه الترمذي.
        </Text>
      </View>

      <View style={styles.hadithContainer}>
        <Text style={styles.hadithText}>
          وعن ابنِ عُمَرَ رَضِيَ اللَّهُ عَنهُمَا، قالَ: صَلَّيْتُ مَعَ رسولِ اللهِ ﷺ رَكعتَينِ قَبلَ الظُّهرِ، ورَكعتَينِ بَعدَها، ورَكعتَينِ بَعدَ الجُمُعةِ، ورَكعتين بَعدَ المَغرِبِ، ورَكعتَينِ بعدَ العِشَاءِ. متفقٌ عَلَيهِ.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderDuha = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubTab('times')}>
        <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
        <Text style={styles.backButtonText}>رجوع</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>صلاة الضحى</Text>

      <View style={styles.articleContainer}>
        <Text style={styles.articleTitle}>صلاة الضحى</Text>
        
        <Text style={styles.articleText}>
          صلاة الضحى سنة أوصى بها النبي ﷺ بعض أصحابه وفعلها في بعض الأحيان عليه الصلاة والسلام، وفعلها يوم الفتح صلى ثمان ركعات الضحى يوم الفتح، فهي سنة مؤكدة.
        </Text>

        <Text style={styles.articleText}>
          ووقتها ما بين ارتفاع الشمس قيد رمح إلى وقوف الشمس الضحى كله، وقتها ما بين ارتفاع الشمس قيد رمح إلى وقوف الشمس قبيل الظهر، فإذا صلاها في أول الوقت أو في أثنائه فقد أصاب السنة، لكن أفضلها عند اشتداد الضحى، إذا اشتد الحر ورمضت الفصال كما قال ﷺ في الحديث الصحيح يقول ﷺ صلاة الأوابين حين ترمض الفصال، يعني: حين يشتد حر الرمضاء على أولاد الإبل، فصلاتها في الضحى في ارتفاع الضحى أفضل وإن صلاها بعد ارتفاع الشمس فقد حصلت السنة.
        </Text>

        <Text style={styles.articleText}>
          ويقرأ فيها ما تيسر سوراً أو آيات ليس فيها شيء مخصوص، يقرأ فيها ما تيسر من الآيات أو من السور.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderForbidden = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubTab('times')}>
        <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
        <Text style={styles.backButtonText}>رجوع</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>أوقات النهي</Text>

      <View style={styles.articleContainer}>
        <Text style={styles.articleTitle}>أوقات النهي</Text>
        
        <Text style={styles.articleText}>أوقات النهي عن الصلاة:</Text>

        <Text style={styles.articleText}>1. من طلوع الفجر إلى طلوع الشمس.</Text>

        <Text style={styles.articleText}>
          2. ومن طلوع الشمس إلى ارتفاعها قيد رمح، ويقدر هذا الوقت باثنتي عشرة دقيقة، والاحتياط جعله ربع ساعة.
        </Text>

        <Text style={styles.articleText}>
          3. وعند قيام الشمس في الظهيرة حتى تزول عن كبد السماء.
        </Text>

        <Text style={styles.articleText}>4. ومن صلاة العصر إلى غروب الشمس.</Text>

        <Text style={styles.articleText}>5. وعند شروع الشمس في الغروب إلى أن يتم ذلك.</Text>

        <Text style={styles.articleText}>
          هذه أوقات النهي، لا يجوز للمسلم أن يصلي فيها إلا الفرائض التي تفوته، فيصليها في كل وقت، وهكذا فريضة الفجر تصليها مع سنتها إذا فاتتك بعد طلوع الفجر، وهكذا ذوات الأسباب مثل سنة تحية المسجد. مثل صلاة الطواف، إذا طاف بعد صلاة العصر، مثل صلاة الكسوف لو كسفت الشمس بعد العصر، ومثل سنة الوضوء، فهذه يقال لها: ذوات الأسباب.
        </Text>

        <Text style={[styles.articleText, styles.articleSubtitle]}>
          الدليل على الأوقات المنهي عن الصلاة فيها:
        </Text>

        <Text style={styles.articleText}>
          ويدل على أوقات النهي عن الصلاة ما رواه البخاري (547) ومسلم (1367) عَنْ ابْنِ عَبَّاسٍ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: (شَهِدَ عِنْدِي رِجَالٌ مَرْضِيُّونَ وَأَرْضَاهُمْ عِنْدِي عُمَرُ أَنَّ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَهَى عَنْ الصَّلاةِ بَعْدَ الصُّبْحِ حَتَّى تَشْرُقَ الشَّمْسُ وَبَعْدَ الْعَصْرِ حَتَّى تَغْرُبَ).
        </Text>

        <Text style={styles.articleText}>
          وروى البخاري (548) ومسلم (1371) عن ابْنُ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: (إِذَا طَلَعَ حَاجِبُ الشَّمْسِ فَأَخِّرُوا الصَّلاةَ حَتَّى تَرْتَفِعَ وَإِذَا غَابَ حَاجِبُ الشَّمْسِ فَأَخِّرُوا الصَّلاةَ حَتَّى تَغِيبَ).
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل أوقات الصلاة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {activeSubTab === 'times' && renderPrayerTimes()}
      {activeSubTab === 'rawatib' && renderRawatib()}
      {activeSubTab === 'duha' && renderDuha()}
      {activeSubTab === 'forbidden' && renderForbidden()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  dateArabicDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A962',
    marginBottom: 4,
  },
  dateHijriMonth: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A962',
    marginBottom: 4,
  },
  dateGregorian: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  dateHijri: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  countdownCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  countdownLabel: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  countdownTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  prayerGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  prayerCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
  },
  prayerCardRight: {
    marginRight: 0,
  },
  prayerCardActive: {
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  notificationIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  prayerNameActive: {
    color: '#F59E0B',
  },
  prayerTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  prayerTimeActive: {
    color: '#F59E0B',
  },
  extraButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  extraButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  fullWidthButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  extraButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  bottomSpacing: {
    height: 100,
  },
  // Sub-pages styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Table styles
  tableContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowHighlight: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.text,
  },
  tableCellBold: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tableCellHighlight: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  // Hadith styles
  hadithContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  hadithText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 28,
    textAlign: 'right',
  },
  // Article styles
  articleContainer: {
    paddingHorizontal: 4,
  },
  articleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
  },
  articleText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 30,
    textAlign: 'right',
    marginBottom: 16,
  },
  articleSubtitle: {
    color: '#F59E0B',
    fontWeight: '600',
  },
});

