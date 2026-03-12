import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface Props {
  label?: string;
}

export function Divider({ label }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {label ? <View style={styles.line} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  label: {
    fontSize: 9,
    color: COLORS.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
