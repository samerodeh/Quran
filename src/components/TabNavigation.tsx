import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TabType, COLORS } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navTab, activeTab === 'read' && styles.navTabActive]}
        onPress={() => setActiveTab('read')}
      >
        <Ionicons name="book" size={20} color={activeTab === 'read' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'read' && styles.navTabTextActive]}>
          قراءة
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navTab, activeTab === 'listen' && styles.navTabActive]}
        onPress={() => setActiveTab('listen')}
      >
        <Ionicons name="headset" size={20} color={activeTab === 'listen' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'listen' && styles.navTabTextActive]}>
          استماع
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navTab, activeTab === 'salah' && styles.navTabActive]}
        onPress={() => setActiveTab('salah')}
      >
        <Ionicons name="time" size={20} color={activeTab === 'salah' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'salah' && styles.navTabTextActive]}>
          الصلاة
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navTab, activeTab === 'athkar' && styles.navTabActive]}
        onPress={() => setActiveTab('athkar')}
      >
        <Ionicons name="heart" size={20} color={activeTab === 'athkar' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'athkar' && styles.navTabTextActive]}>
          أذكار
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navTab, activeTab === 'qibla' && styles.navTabActive]}
        onPress={() => setActiveTab('qibla')}
      >
        <Ionicons name="compass" size={20} color={activeTab === 'qibla' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'qibla' && styles.navTabTextActive]}>
          القبلة
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navTab, activeTab === 'settings' && styles.navTabActive]}
        onPress={() => setActiveTab('settings')}
      >
        <Ionicons name="settings" size={20} color={activeTab === 'settings' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'settings' && styles.navTabTextActive]}>
          الإعدادات
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: TAB_BAR_HEIGHT,
    paddingTop: 6,
    paddingBottom: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navTabActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    marginTop: -2,
  },
  navTabText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  navTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
