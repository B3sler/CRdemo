import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

/**
 * Web-spezifische Implementierung von PlatformCard.
 * Wird automatisch geladen wenn Platform.OS === 'web'.
 * Dateiname: PlatformCard.web.tsx
 */
export function PlatformCard() {
  return (
    <View style={styles.card}>
      <View style={styles.browserBar}>
        <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
        <View style={[styles.dot, { backgroundColor: '#febc2e' }]} />
        <View style={[styles.dot, { backgroundColor: '#28c840' }]} />
        <View style={styles.urlBar}>
          <Text style={styles.urlText}>https://crdemo.local</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.platform}>🌐 Web-Browser</Text>
        <Text style={styles.title}>PlatformCard.web.tsx</Text>
        <Text style={styles.desc}>
          Diese Komponente wurde speziell für den Web-Browser gebaut.
          Metro lädt sie automatisch anstelle der generischen Version.
        </Text>

        <View style={styles.featureList}>
          {[
            'Flexibles CSS-ähnliches Layout',
            'Maus- und Keyboard-Interaktion',
            'Beliebige Viewport-Breite',
            'Browser-DevTools verfügbar',
          ].map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureDot}>▸</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tag}>
          <Text style={styles.tagText}>Platform.OS === &quot;web&quot;</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#c5d8ff',
    backgroundColor: '#f0f4ff',
  },
  browserBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e2e8f8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#c5d8ff',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  urlBar: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#c5d8ff',
  },
  urlText: { fontSize: 11, color: '#3b5bdb' },
  body: { padding: 18, gap: 12 },
  platform: { fontSize: 22 },
  title: { fontSize: 15, fontWeight: '800', color: '#1e3a8a', fontFamily: 'monospace' },
  desc: { fontSize: 13, color: '#374151', lineHeight: 19 },
  featureList: { gap: 6 },
  featureRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  featureDot: { fontSize: 12, color: '#3b5bdb', marginTop: 1 },
  featureText: { fontSize: 12, color: '#374151', flex: 1 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#3b5bdb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { fontSize: 11, color: '#fff', fontWeight: '700', fontFamily: 'monospace' },
});
