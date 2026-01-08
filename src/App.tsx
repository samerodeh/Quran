import React, { useState, ErrorInfo, ReactNode } from 'react';
import { View, StatusBar, StyleSheet, Text } from 'react-native';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { DownloadProvider } from './contexts/DownloadContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { TabNavigation } from './components/TabNavigation';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';
import { ReadSection } from './screens/ReadSection';
import { ListenSection } from './screens/ListenSection';
import { SalahSection } from './screens/SalahSection';
import { AthkarSection } from './screens/AthkarSection';
import { QiblaSection } from './screens/QiblaSection';
import { SettingsScreen } from './screens/SettingsScreen';
import { TabType, COLORS } from './types';

class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {this.state.error?.message}</Text>
          <Text style={styles.errorStack}>{this.state.error?.stack}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('read');
  const { showMiniPlayer } = useAudio();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />

      {/* Keep all sections mounted but only show the active one */}
      <View style={[styles.tabContent, activeTab !== 'listen' && styles.hiddenTab]}>
        <ListenSection />
      </View>
      <View style={[styles.tabContent, activeTab !== 'read' && styles.hiddenTab]}>
        <ReadSection />
      </View>
      <View style={[styles.tabContent, activeTab !== 'salah' && styles.hiddenTab]}>
        <SalahSection />
      </View>
      <View style={[styles.tabContent, activeTab !== 'athkar' && styles.hiddenTab]}>
        <AthkarSection />
      </View>
      <View style={[styles.tabContent, activeTab !== 'qibla' && styles.hiddenTab]}>
        <QiblaSection />
      </View>
      <View style={[styles.tabContent, activeTab !== 'settings' && styles.hiddenTab]}>
        <SettingsScreen />
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
    <ErrorBoundary>
      <SettingsProvider>
        <FavoritesProvider>
          <DownloadProvider>
            <AudioProvider>
              <AppContent />
            </AudioProvider>
          </DownloadProvider>
        </FavoritesProvider>
      </SettingsProvider>
    </ErrorBoundary>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.secondary,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    marginBottom: 10,
  },
  errorStack: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
