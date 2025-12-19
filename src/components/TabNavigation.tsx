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
        <Ionicons name="book" size={24} color={activeTab === 'read' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'read' && styles.navTabTextActive]}>
          Read
        </Text>
        <Text style={[styles.navTabArabic, activeTab === 'read' && styles.navTabTextActive]}>
          قراءة
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navTab, activeTab === 'listen' && styles.navTabActive]}
        onPress={() => setActiveTab('listen')}
      >
        <Ionicons name="headset" size={24} color={activeTab === 'listen' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.navTabText, activeTab === 'listen' && styles.navTabTextActive]}>
          Listen
        </Text>
        <Text style={[styles.navTabArabic, activeTab === 'listen' && styles.navTabTextActive]}>
          استماع
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
    paddingTop: 10,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    marginTop: -2,
  },
  navTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  navTabArabic: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  navTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
