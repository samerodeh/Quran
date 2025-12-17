import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { surahs } from './data/surahs';
import { reciters, getAudioUrl } from './data/reciters';
import { getLocalAudio, hasLocalAudio } from './data/localAudio';
import { qiraat, TOTAL_PAGES, JUZ_PAGES, SURAH_PAGES } from './data/qiraat';
import { getLocalMushafImage } from './data/mushafImages';

const { width, height } = Dimensions.get('window');

// ==================== MAIN APP WITH TABS ====================
export default function App() {
  const [activeTab, setActiveTab] = useState('read');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {activeTab === 'listen' ? <ListenSection /> : <ReadSection />}
      
      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'read' && styles.navTabActive]}
          onPress={() => setActiveTab('read')}
        >
          <Ionicons name="book" size={24} color={activeTab === 'read' ? '#10B981' : '#64748B'} />
          <Text style={[styles.navTabText, activeTab === 'read' && styles.navTabTextActive]}>
            Read
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'listen' && styles.navTabActive]}
          onPress={() => setActiveTab('listen')}
        >
          <Ionicons name="headset" size={24} color={activeTab === 'listen' ? '#10B981' : '#64748B'} />
          <Text style={[styles.navTabText, activeTab === 'listen' && styles.navTabTextActive]}>
            Listen
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==================== READ SECTION ====================
function ReadSection() {
  const [selectedQiraa, setSelectedQiraa] = useState(null);

  if (!selectedQiraa) {
    return <QiraatSelectScreen onSelectQiraa={setSelectedQiraa} />;
  }

  return <MushafScreen qiraa={selectedQiraa} onBack={() => setSelectedQiraa(null)} />;
}

// ==================== QIRAAT SELECT SCREEN ====================
function QiraatSelectScreen({ onSelectQiraa }) {
  const renderQiraaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.qiraaCard}
      onPress={() => onSelectQiraa(item)}
      activeOpacity={0.8}
    >
      <View style={styles.qiraaIconContainer}>
        <Ionicons name="book-outline" size={32} color="#10B981" />
      </View>
      <View style={styles.qiraaInfo}>
        <Text style={styles.qiraaArabicName}>{item.arabicName}</Text>
        <Text style={styles.qiraaEnglishName}>{item.name}</Text>
        <Text style={styles.qiraaDescription}>{item.arabicDescription}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#64748B" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.readHeader}>
        <View style={styles.readHeaderIcon}>
          <Ionicons name="book" size={48} color="#10B981" />
        </View>
        <Text style={styles.readHeaderTitle}>القرآن الكريم</Text>
        <Text style={styles.readHeaderSubtitle}>Choose Your Mushaf</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>اختر المصحف</Text>
        <Text style={styles.sectionSubtitle}>Select Mushaf Edition</Text>
      </View>

      <FlatList
        data={qiraat}
        renderItem={renderQiraaItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.qiraaList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ==================== MUSHAF SCREEN - AUTHENTIC PAGE IMAGES ====================
function MushafScreen({ qiraa, onBack }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showNav, setShowNav] = useState(true);
  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const flatListRef = useRef(null);

  const pageNumbers = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item);
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= TOTAL_PAGES) {
      flatListRef.current?.scrollToIndex({ index: pageNum - 1, animated: false });
      setShowJuzPicker(false);
      setShowSurahPicker(false);
    }
  };

  const toggleNav = () => setShowNav(!showNav);

  const [imageError, setImageError] = useState({});

  const renderPage = ({ item: pageNum }) => {
    // Use local bundled images for instant loading
    const localImage = getLocalMushafImage(pageNum, qiraa.id);
    
    return (
      <TouchableOpacity 
        style={styles.pageContainer} 
        activeOpacity={1}
        onPress={toggleNav}
      >
        <View style={styles.mushafPage}>
          <Image
            source={localImage}
            style={styles.mushafImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Page number overlay */}
        <View style={styles.pageNumberOverlay}>
          <Text style={styles.pageNumberText}>{pageNum}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getCurrentJuz = () => {
    for (let i = JUZ_PAGES.length - 1; i >= 0; i--) {
      if (currentPage >= JUZ_PAGES[i].page) {
        return JUZ_PAGES[i];
      }
    }
    return JUZ_PAGES[0];
  };

  return (
    <View style={styles.mushafContainer}>
      {/* Header - Shows/hides on tap */}
      {showNav && (
        <SafeAreaView style={styles.mushafHeaderSafe}>
          <View style={styles.mushafHeader}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.mushafTitle}>{qiraa.arabicName}</Text>
              <Text style={styles.mushafSubtitle}>
                {getCurrentJuz().name} - الجزء {getCurrentJuz().juz}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowSurahPicker(true)}
            >
              <Ionicons name="list" size={24} color="#F8FAFC" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Mushaf Pages */}
      <FlatList
        ref={flatListRef}
        data={pageNumbers}
        renderItem={renderPage}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        inverted // RTL - Arabic reading direction
      />

      {/* Bottom Navigation - Shows/hides on tap */}
      {showNav && (
        <View style={styles.mushafBottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <Ionicons 
              name="chevron-forward" 
              size={28} 
              color={currentPage === 1 ? '#334155' : '#F8FAFC'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pageIndicatorButton}
            onPress={() => setShowJuzPicker(true)}
          >
            <Text style={styles.pageIndicatorText}>
              صفحة {currentPage} من {TOTAL_PAGES}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => goToPage(Math.min(TOTAL_PAGES, currentPage + 1))}
            disabled={currentPage === TOTAL_PAGES}
          >
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={currentPage === TOTAL_PAGES ? '#334155' : '#F8FAFC'} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Juz Picker Modal */}
      <Modal
        visible={showJuzPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJuzPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>اختر الجزء</Text>
              <TouchableOpacity onPress={() => setShowJuzPicker(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={JUZ_PAGES}
              keyExtractor={(item) => item.juz.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    currentPage >= item.page && 
                    (JUZ_PAGES.find(j => j.juz === item.juz + 1)?.page || TOTAL_PAGES + 1) > currentPage && 
                    styles.pickerItemActive
                  ]}
                  onPress={() => goToPage(item.page)}
                >
                  <View style={styles.pickerItemNumber}>
                    <Text style={styles.pickerItemNumberText}>{item.juz}</Text>
                  </View>
                  <View style={styles.pickerItemInfo}>
                    <Text style={styles.pickerItemName}>{item.name}</Text>
                    <Text style={styles.pickerItemDetail}>صفحة {item.page} • {item.surah}</Text>
                  </View>
                  <Ionicons name="chevron-back" size={20} color="#64748B" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Surah Picker Modal */}
      <Modal
        visible={showSurahPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSurahPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>اختر السورة</Text>
              <TouchableOpacity onPress={() => setShowSurahPicker(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={surahs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    goToPage(SURAH_PAGES[item.id]);
                    setShowSurahPicker(false);
                  }}
                >
                  <View style={styles.pickerItemNumber}>
                    <Text style={styles.pickerItemNumberText}>{item.id}</Text>
                  </View>
                  <View style={styles.pickerItemInfo}>
                    <Text style={styles.pickerItemName}>{item.arabicName}</Text>
                    <Text style={styles.pickerItemDetail}>{item.name} • {item.verses} آية</Text>
                  </View>
                  <Text style={styles.surahPageNum}>ص {SURAH_PAGES[item.id]}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== LISTEN SECTION ====================
function ListenSection() {
  const [selectedReciter, setSelectedReciter] = useState(null);

  if (!selectedReciter) {
    return <ReciterSelectScreen onSelectReciter={setSelectedReciter} />;
  }

  return <SurahListScreen reciter={selectedReciter} onBack={() => setSelectedReciter(null)} />;
}

// ==================== RECITER SELECT SCREEN ====================
function ReciterSelectScreen({ onSelectReciter }) {
  const renderReciterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reciterCard}
      onPress={() => onSelectReciter(item)}
      activeOpacity={0.8}
    >
      <View style={styles.reciterImageContainer}>
        <Text style={styles.reciterEmoji}>🎙️</Text>
      </View>
      <View style={styles.reciterInfo}>
        <Text style={styles.reciterArabicName}>{item.arabicName}</Text>
        <Text style={styles.reciterEnglishName}>{item.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#64748B" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.reciterHeader}>
        <View style={styles.reciterHeaderIcon}>
          <Ionicons name="headset" size={48} color="#10B981" />
        </View>
        <Text style={styles.reciterHeaderTitle}>القرآن الكريم</Text>
        <Text style={styles.reciterHeaderSubtitle}>The Holy Quran</Text>
      </View>

      <View style={styles.reciterSection}>
        <Text style={styles.reciterSectionTitle}>اختر القارئ</Text>
        <Text style={styles.reciterSectionSubtitle}>Choose a Reciter</Text>
      </View>

      <FlatList
        data={reciters}
        renderItem={renderReciterItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reciterList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ==================== SURAH LIST SCREEN ====================
function SurahListScreen({ reciter, onBack }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(animatedValue, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [isPlaying]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  const playSurah = async (surah) => {
    try {
      if (currentSurah?.id === surah.id && sound) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) await sound.pauseAsync();
        else await sound.playAsync();
        return;
      }

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setIsLoading(true);
      setCurrentSurah(surah);
      setPlaybackPosition(0);
      setPlaybackDuration(0);

      let newSound;
      if (reciter.isLocal && hasLocalAudio(reciter.id, surah.id)) {
        const localAudio = getLocalAudio(reciter.id, surah.id);
        const { sound: localSound } = await Audio.Sound.createAsync(localAudio, { shouldPlay: true }, onPlaybackStatusUpdate);
        newSound = localSound;
      } else if (reciter.isLocal) {
        setIsLoading(false);
        alert(`Recording not available yet for ${surah.name}`);
        return;
      } else {
        const audioUrl = getAudioUrl(surah.id, reciter);
        const { sound: remoteSound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true }, onPlaybackStatusUpdate);
        newSound = remoteSound;
      }

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) await sound.pauseAsync();
    else await sound.playAsync();
  };

  const skipForward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    await sound.setPositionAsync(Math.min(status.positionMillis + 10000, status.durationMillis));
  };

  const skipBackward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    await sound.setPositionAsync(Math.max(status.positionMillis - 10000, 0));
  };

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBack = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    onBack();
  };

  const progressWidth = playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;

  const renderSurahItem = ({ item }) => {
    const isCurrentlyPlaying = currentSurah?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.surahItem, isCurrentlyPlaying && styles.surahItemActive]}
        onPress={() => playSurah(item)}
        activeOpacity={0.7}
      >
        <View style={styles.surahNumberContainer}>
          <View style={[styles.surahNumber, isCurrentlyPlaying && styles.surahNumberActive]}>
            <Text style={[styles.surahNumberText, isCurrentlyPlaying && styles.surahNumberTextActive]}>
              {item.id}
            </Text>
          </View>
        </View>
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, isCurrentlyPlaying && styles.surahNameActive]}>{item.name}</Text>
          <Text style={styles.surahDetails}>{item.englishName} • {item.verses} verses</Text>
        </View>
        <View style={styles.surahArabicContainer}>
          <Text style={[styles.surahArabic, isCurrentlyPlaying && styles.surahArabicActive]}>{item.arabicName}</Text>
          <View style={[styles.revelationBadge, item.revelationType === 'Meccan' ? styles.meccanBadge : styles.medinanBadge]}>
            <Text style={styles.revelationText}>{item.revelationType}</Text>
          </View>
        </View>
        {isCurrentlyPlaying && isPlaying && (
          <Animated.View style={[styles.playingIndicator, { opacity: animatedValue }]}>
            <Ionicons name="musical-notes" size={20} color="#10B981" />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>القرآن الكريم</Text>
          <Text style={styles.headerSubtitleGreen}>{reciter.arabicName}</Text>
        </View>
        <View style={styles.headerDecoration}>
          <Ionicons name="headset" size={28} color="#10B981" />
        </View>
      </View>

      <FlatList
        data={surahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {currentSurah && (
        <View style={styles.playerContainer}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
            </View>
          </View>
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingArabic}>{currentSurah.arabicName}</Text>
            <Text style={styles.nowPlayingName}>{currentSurah.name}</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
              <Ionicons name="play-back" size={28} color="#E2E8F0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="large" color="#0F172A" /> : <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#0F172A" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
              <Ionicons name="play-forward" size={28} color="#E2E8F0" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  
  // Bottom Navigation
  bottomNav: { flexDirection: 'row', backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: '#334155', paddingBottom: 20, paddingTop: 10 },
  navTab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navTabActive: { borderTopWidth: 2, borderTopColor: '#10B981', marginTop: -2 },
  navTabText: { fontSize: 12, color: '#64748B', marginTop: 4 },
  navTabTextActive: { color: '#10B981', fontWeight: '600' },

  // Read Header
  readHeader: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#1E293B', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  readHeaderIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  readHeaderTitle: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  readHeaderSubtitle: { fontSize: 16, color: '#94A3B8' },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center' },
  sectionSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 2 },
  qiraaList: { paddingHorizontal: 20, paddingBottom: 100 },
  qiraaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  qiraaIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  qiraaInfo: { flex: 1 },
  qiraaArabicName: { fontSize: 20, fontWeight: '600', color: '#F8FAFC', marginBottom: 2 },
  qiraaEnglishName: { fontSize: 14, color: '#10B981', marginBottom: 2 },
  qiraaDescription: { fontSize: 12, color: '#64748B' },

  // Mushaf Screen
  mushafContainer: { flex: 1, backgroundColor: '#1a1a1a' },
  mushafHeaderSafe: { backgroundColor: 'rgba(15, 23, 42, 0.95)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  mushafHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 50 },
  headerCenter: { alignItems: 'center', flex: 1 },
  mushafTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' },
  mushafSubtitle: { fontSize: 12, color: '#10B981', marginTop: 2 },
  menuButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  
  // Mushaf Page
  pageContainer: { width: width, height: height - 140, backgroundColor: '#F5F0E1', justifyContent: 'center', alignItems: 'center' },
  mushafPage: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  mushafImage: { width: width, height: '100%' },
  pageLoadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E1', zIndex: 10 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748B' },
  errorText: { marginTop: 12, fontSize: 18, color: '#EF4444', fontWeight: '600' },
  errorSubtext: { marginTop: 4, fontSize: 14, color: '#94A3B8' },
  pageNumberOverlay: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  pageNumberText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  // Bottom Nav
  mushafBottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(15, 23, 42, 0.95)', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30 },
  navButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  pageIndicatorButton: { backgroundColor: '#334155', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  pageIndicatorText: { fontSize: 14, color: '#F8FAFC' },
  
  // Picker Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  pickerModal: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: height * 0.7 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  pickerItemActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  pickerItemNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  pickerItemNumberText: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  pickerItemInfo: { flex: 1 },
  pickerItemName: { fontSize: 17, color: '#F8FAFC', fontWeight: '500' },
  pickerItemDetail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  surahPageNum: { fontSize: 12, color: '#64748B' },

  // Back Button
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },

  // Reciter Section
  reciterHeader: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#1E293B', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  reciterHeaderIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  reciterHeaderTitle: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  reciterHeaderSubtitle: { fontSize: 16, color: '#94A3B8' },
  reciterSection: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  reciterSectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center' },
  reciterSectionSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 2 },
  reciterList: { paddingHorizontal: 20, paddingBottom: 100 },
  reciterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  reciterImageContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  reciterEmoji: { fontSize: 28 },
  reciterInfo: { flex: 1 },
  reciterArabicName: { fontSize: 20, fontWeight: '600', color: '#F8FAFC', marginBottom: 2 },
  reciterEnglishName: { fontSize: 14, color: '#94A3B8' },

  // Surah List
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  headerSubtitleGreen: { fontSize: 13, color: '#10B981', marginTop: 2 },
  headerDecoration: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 200 },
  surahItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  surahItemActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' },
  surahNumberContainer: { marginRight: 12 },
  surahNumber: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '45deg' }] },
  surahNumberActive: { backgroundColor: '#10B981' },
  surahNumberText: { fontSize: 13, fontWeight: 'bold', color: '#E2E8F0', transform: [{ rotate: '-45deg' }] },
  surahNumberTextActive: { color: '#0F172A' },
  surahInfo: { flex: 1 },
  surahName: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginBottom: 2 },
  surahNameActive: { color: '#10B981' },
  surahDetails: { fontSize: 12, color: '#64748B' },
  surahArabicContainer: { alignItems: 'flex-end' },
  surahArabic: { fontSize: 18, color: '#CBD5E1', fontWeight: '500', marginBottom: 4 },
  surahArabicActive: { color: '#10B981' },
  revelationBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  meccanBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  medinanBadge: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  revelationText: { fontSize: 9, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' },
  playingIndicator: { position: 'absolute', right: 14, top: 14 },

  // Player
  playerContainer: { position: 'absolute', bottom: 70, left: 0, right: 0, backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 14, paddingBottom: 20, paddingHorizontal: 20, borderTopWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  progressContainer: { marginBottom: 10 },
  progressBar: { height: 4, backgroundColor: '#334155', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 2 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  timeText: { fontSize: 11, color: '#64748B' },
  nowPlayingInfo: { alignItems: 'center', marginBottom: 12 },
  nowPlayingArabic: { fontSize: 20, color: '#F8FAFC', fontWeight: '600', marginBottom: 2 },
  nowPlayingName: { fontSize: 13, color: '#94A3B8' },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  controlButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  playPauseButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
});
