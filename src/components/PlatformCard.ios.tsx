import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

/**
 * iOS-spezifische Implementierung von PlatformCard.
 * Wird automatisch geladen wenn Platform.OS === 'ios'.
 * Dateiname: PlatformCard.ios.tsx
 */
export function PlatformCard() {
  return (
    <View style={styles.card}>
      {/* iOS-typische Statusbar-Simulation */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusRight}>
          <Text style={styles.statusIcon}>▐▐▐</Text>
          <Text style={styles.statusIcon}>WiFi</Text>
          <Text style={styles.statusIcon}>⬛</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.platform}>🍎 iOS · iPhone</Text>
        <Text style={styles.title}>PlatformCard.ios.tsx</Text>
        <Text style={styles.desc}>
          Diese Komponente wurde speziell für iOS gebaut.
          Metro lädt sie automatisch auf Apple-Geräten.
        </Text>

        {/* iOS-typische grouped list */}
        <View style={styles.groupedList}>
          {[
            { icon: '👆', label: 'Touch & Haptics' },
            { icon: '📐', label: 'Safe Area Insets' },
            { icon: '🔔', label: 'Push Notifications' },
            { icon: '🔑', label: 'Secure Enclave / Face ID' },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[styles.listRow, i < arr.length - 1 && styles.listRowBorder]}
            >
              <Text style={styles.listIcon}>{item.icon}</Text>
              <Text style={styles.listLabel}>{item.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          ))}
        </View>

        <View style={styles.tag}>
          <Text style={styles.tagText}>Platform.OS === &quot;ios&quot;</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5e0',
    backgroundColor: '#f2f2f7', // iOS system background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#c8c8cc',
  },
  statusTime: { fontSize: 14, fontWeight: '700', color: '#1c1c1e' },
  statusRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  statusIcon: { fontSize: 10, color: '#1c1c1e' },
  body: { padding: 18, gap: 14 },
  platform: { fontSize: 22 },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1c1c1e',
    fontFamily: 'Menlo',
  },
  desc: { fontSize: 13, color: '#3c3c43', lineHeight: 19 },

  // iOS grouped list style
  groupedList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#c8c8cc',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#fff',
  },
  listRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#c8c8cc',
  },
  listIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  listLabel: { flex: 1, fontSize: 13, color: '#1c1c1e' },
  chevron: { fontSize: 18, color: '#c7c7cc', fontWeight: '300' },

  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { fontSize: 11, color: '#fff', fontWeight: '700', fontFamily: 'Menlo' },
});
