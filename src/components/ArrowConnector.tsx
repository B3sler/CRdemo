import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface Props {
  horizontal?: boolean;
  label: string;
}

export function ArrowConnector({ horizontal = false, label }: Props) {
  return (
    <View style={horizontal ? styles.h : styles.v}>
      <Text style={styles.arrow}>{horizontal ? '→' : '↓'}</Text>
      <Text style={styles.hint}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { alignSelf: 'center', alignItems: 'center', paddingHorizontal: 4, gap: 2 },
  v: { alignSelf: 'center', alignItems: 'center', paddingVertical: 4, gap: 2 },
  arrow: { fontSize: 22, color: COLORS.primary, fontWeight: '600' },
  hint: { fontSize: 9, color: COLORS.textHint, textAlign: 'center', maxWidth: 70 },
});
