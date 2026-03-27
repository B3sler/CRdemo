import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

interface Props {
  horizontal?: boolean;
  label: string;
}

export function ArrowConnector({ horizontal = false, label }: Props) {
  return (
    <View style={horizontal ? styles.h : styles.v}>
      <Ionicons
        name={horizontal ? 'arrow-forward' : 'arrow-down'}
        size={16}
        color={COLORS.accent}
      />
      <Text style={styles.hint}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { alignSelf: 'center', alignItems: 'center', paddingHorizontal: 4, gap: 4 },
  v: { alignSelf: 'center', alignItems: 'center', paddingVertical: 4, gap: 4 },
  hint: { fontSize: 9, color: COLORS.textHint, textAlign: 'center', maxWidth: 72, letterSpacing: 0.3 },
});
