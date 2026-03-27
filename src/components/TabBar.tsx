import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

export type TabId = 'auth' | 'machines';

interface Tab {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: Tab[] = [
  { id: 'auth',     label: 'Login',     icon: 'lock-closed-outline',    iconActive: 'lock-closed' },
  { id: 'machines', label: 'Maschinen', icon: 'hardware-chip-outline',  iconActive: 'hardware-chip' },
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
              style={styles.tab}
              onPress={() => onChange(tab.id)}
              activeOpacity={0.75}
            >
              {isActive && <View style={styles.indicator} />}
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={22}
                color={isActive ? COLORS.accent : COLORS.textHint}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
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
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 -1px 0 #D0D9E8, 0 -4px 16px rgba(10,30,60,0.06)' } as any,
    }),
  },
  bar: { flexDirection: 'row', height: 56 },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2.5,
    backgroundColor: COLORS.accent,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  label: { fontSize: 11, fontWeight: '500', color: COLORS.textHint },
  labelActive: { color: COLORS.accent, fontWeight: '700' },
});
