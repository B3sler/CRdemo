import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../theme';
import { MACHINES, Machine } from '../data/machines';
import { MachineCard } from '../components/MachineCard';

const QUICK_SERIALS = ['MV-R245-2022-0156', 'MV-T800-2023-1847', 'MV-L310-2023-0892'];

const STATUS_CONFIG = {
  ok: { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'OK' },
  warning: { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Wartung' },
  error: { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'Fehler' },
};

export function MachineScreen() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;
  const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  const [input, setInput] = useState('');
  const [machine, setMachine] = useState<Machine | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'datasheet' | 'parts' | 'maintenance'>('overview');

  function search(serial: string) {
    const key = serial.trim();
    const found = MACHINES[key];
    if (found) {
      setMachine(found);
      setNotFound(false);
      setActiveSection('overview');
    } else {
      setMachine(null);
      setNotFound(true);
    }
    setInput(serial.trim());
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.inner, isWide && styles.innerWide]}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏭</Text>
          <Text style={styles.heroTitle}>MULTIVAC Maschinendaten</Text>
          <Text style={styles.heroSubtitle}>
            Seriennummer eingeben und Betriebsanleitungen, Ersatzteillisten
            sowie Wartungshistorie aus dem myMULTIVAC-Portal abrufen.
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Seriennummer</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { fontFamily: MONO }]}
              value={input}
              onChangeText={setInput}
              placeholder="z.B. MV-R245-2022-0156"
              placeholderTextColor={COLORS.textHint}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => search(input)}
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => search(input)}
              activeOpacity={0.8}
            >
              <Text style={styles.searchBtnText}>Suchen</Text>
            </TouchableOpacity>
          </View>

          {/* Schnellzugriff */}
          <View style={styles.quickRow}>
            <Text style={styles.quickLabel}>Verfügbare Maschinen:</Text>
            <View style={styles.quickChips}>
              {QUICK_SERIALS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.quickChip, machine?.serialNo === s && styles.quickChipActive]}
                  onPress={() => search(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickChipText, { fontFamily: MONO }, machine?.serialNo === s && styles.quickChipTextActive]}>
                    {s}
                  </Text>
                  {MACHINES[s] && (
                    <View style={[styles.statusDotSmall, { backgroundColor: STATUS_CONFIG[MACHINES[s].status].dot }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Not found */}
        {notFound && (
          <View style={styles.notFoundCard}>
            <Text style={styles.notFoundIcon}>⚠️</Text>
            <Text style={styles.notFoundTitle}>Keine Maschine gefunden</Text>
            <Text style={styles.notFoundSub}>
              Seriennummer „{input}" nicht gefunden.{'\n'}
              Versuche: MV-R245-2022-0156 · MV-T800-2023-1847 · MV-L310-2023-0892
            </Text>
          </View>
        )}

        {/* Machine data */}
        {machine && (
          <View style={styles.machineContainer}>
            {/* Machine header */}
            <View style={styles.machineHeader}>
              <View style={styles.machineHeaderLeft}>
                <Text style={styles.machineName}>{machine.model}</Text>
                <Text style={[styles.machineSerial, { fontFamily: MONO }]}>{machine.serialNo}</Text>
                <Text style={styles.machineLocation}>{machine.location}</Text>
              </View>
              <View style={[
                styles.machineStatusBadge,
                { backgroundColor: STATUS_CONFIG[machine.status].bg, borderColor: STATUS_CONFIG[machine.status].border }
              ]}>
                <View style={[styles.statusDotSmall, { backgroundColor: STATUS_CONFIG[machine.status].dot }]} />
                <Text style={styles.machineStatusText}>{machine.statusText}</Text>
              </View>
            </View>

            {/* Platform-spezifische Karte */}
            <MachineCard
              machine={machine}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </View>
        )}

        {/* Hinweis wenn nichts gesucht */}
        {!machine && !notFound && (
          <View style={styles.hintCard}>
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={styles.hintText}>
              Die Kartenkomponente{' '}
              <Text style={[styles.hintCode, { fontFamily: MONO }]}>{'<MachineCard />'}</Text>{' '}
              wird je nach Plattform unterschiedlich gerendert:{'\n'}
              <Text style={styles.hintBold}>iOS</Text> → Grouped Table View Stil (UIKit){'\n'}
              <Text style={styles.hintBold}>Browser</Text> → Web-Karten mit Grid-Layout
            </Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  inner: { width: '100%', maxWidth: '100%', gap: 16 },
  innerWide: { maxWidth: 760 },

  // Hero
  hero: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  heroSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },

  // Search card
  searchCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  searchLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' as any, letterSpacing: 0.8 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.text,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Quick access
  quickRow: { gap: 6 },
  quickLabel: { fontSize: 11, color: COLORS.textHint },
  quickChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickChipActive: { backgroundColor: COLORS.successBg, borderColor: COLORS.primary },
  quickChipText: { fontSize: 12, color: COLORS.textMuted },
  quickChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  statusDotSmall: { width: 7, height: 7, borderRadius: 4 },

  // Not found
  notFoundCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  notFoundIcon: { fontSize: 28 },
  notFoundTitle: { fontSize: 15, fontWeight: '800', color: COLORS.danger },
  notFoundSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },

  // Machine container
  machineContainer: { gap: 12 },
  machineHeader: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  machineHeaderLeft: { flex: 1, gap: 3 },
  machineName: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  machineSerial: { fontSize: 12, color: COLORS.textMuted },
  machineLocation: { fontSize: 12, color: COLORS.textHint },
  machineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  machineStatusText: { fontSize: 11, fontWeight: '700', color: COLORS.text },

  // Hint
  hintCard: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
  },
  hintIcon: { fontSize: 20 },
  hintText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 19 },
  hintCode: { backgroundColor: COLORS.bgCard, color: COLORS.primary },
  hintBold: { fontWeight: '700', color: COLORS.text },
});
