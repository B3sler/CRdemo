import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

export type TabId = 'auth' | 'machines';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'auth', label: 'Login', icon: '🔐' },
  { id: 'machines', label: 'Maschinen', icon: '🏭' },
];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export function TabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChange(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{tab.icon}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
              {isActive && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' } as any,
    }),
  },
  bar: {
    flexDirection: 'row',
    height: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  tabActive: {},
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textHint,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
