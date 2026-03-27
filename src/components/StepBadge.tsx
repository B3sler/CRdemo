import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface Props {
  n: number;
  label: string;
}

export function StepBadge({ n, label }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.circle}>
        <Text style={styles.num}>{n}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { color: '#fff', fontWeight: '800', fontSize: 12 },
  label: {
    fontSize: 10,
    color: COLORS.textHint,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
