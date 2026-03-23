import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from '../theme';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

interface Props {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, Platform.OS === 'android' && { paddingTop: STATUS_BAR_HEIGHT + 12 }]}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 1px 6px rgba(0,0,0,0.08)' } as any,
    }),
  },
  bar: {
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
});
