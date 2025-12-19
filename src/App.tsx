import React, { useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { TabNavigation } from './components/TabNavigation';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';
import { ReadSection } from './screens/ReadSection';
import { ListenSection } from './screens/ListenSection';
import { TabType, COLORS } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('read');
  const { showMiniPlayer } = useAudio();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      {/* Keep both sections mounted but only show the active one */}
      <View style={[styles.tabContent, activeTab !== 'listen' && styles.hiddenTab]}>
        <ListenSection />
      </View>
      <View style={[styles.tabContent, activeTab !== 'read' && styles.hiddenTab]}>
        <ReadSection />
      </View>

      {/* Global Audio Player - shows on all tabs */}
      <GlobalAudioPlayer />

      {/* Bottom Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  tabContent: {
    flex: 1,
  },
  hiddenTab: {
    display: 'none',
  },
});
