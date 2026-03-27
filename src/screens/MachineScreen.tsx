import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { MACHINES, Machine } from '../data/machines';
import { MachineCard } from '../components/MachineCard';
import { MachineActionsSheet } from '../components/MachineActionsSheet';
import { MachineNotifications } from '../components/MachineNotifications';

const QUICK_SERIALS = ['MV-R245-2022-0156', 'MV-T800-2023-1847', 'MV-L310-2023-0892'];

const MACHINE_LABELS: Record<string, string> = {
  'MV-R245-2022-0156': 'R 245',
  'MV-T800-2023-1847': 'T 800',
  'MV-L310-2023-0892': 'L 310',
};

const STATUS_CFG = {
  ok:      { bg: '#E6F9EE', border: '#6ABF99', dot: '#0A6640' },
  warning: { bg: '#FEF6EE', border: '#F4B660', dot: '#B54708' },
  error:   { bg: '#FEF3F2', border: '#FDA29B', dot: '#B42318' },
};

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function MachineScreen() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;

  const [input, setInput] = useState('');
  const [machine, setMachine] = useState<Machine | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'datasheet' | 'parts' | 'maintenance'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

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
    setInput(key);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.accent}
          colors={[COLORS.accent]}
        />
      }
    >
      <View style={[styles.inner, isWide && styles.innerWide]}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerEyebrow}>MULTIVAC Service</Text>
            <Text style={styles.headerTitle}>Maschinendaten</Text>
            <Text style={styles.headerSub}>
              Betriebsanleitungen · Ersatzteillisten · Wartungshistorie
            </Text>
          </View>
          <View style={styles.mvLogo}>
            <Text style={styles.mvLogoText}>MV</Text>
          </View>
        </View>

        {/* ── Suche ──────────────────────────────────────────────────── */}
        <View style={styles.searchCard}>
          <Text style={styles.searchCardLabel}>Seriennummer eingeben</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Text style={styles.searchInputIcon}>#</Text>
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
            </View>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => search(input)}
              activeOpacity={0.85}
            >
              <Text style={styles.searchBtnText}>Suchen</Text>
            </TouchableOpacity>
          </View>

          {/* Schnellzugriff */}
          <View style={styles.quickAccess}>
            <Text style={styles.quickLabel}>Verfügbare Maschinen</Text>
            <View style={styles.quickChips}>
              {QUICK_SERIALS.map((s) => {
                const m = MACHINES[s];
                const isActive = machine?.serialNo === s;
                const sc = m ? STATUS_CFG[m.status] : null;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => search(s)}
                    activeOpacity={0.75}
                  >
                    {sc && <View style={[styles.chipDot, { backgroundColor: sc.dot }]} />}
                    <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                      {MACHINE_LABELS[s] ?? s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Not found ──────────────────────────────────────────────── */}
        {notFound && (
          <View style={styles.notFoundCard}>
            <Ionicons name="alert-circle-outline" size={22} color={COLORS.danger} />
            <View style={styles.notFoundBody}>
              <Text style={styles.notFoundTitle}>Keine Maschine gefunden</Text>
              <Text style={styles.notFoundSub}>
                Seriennummer „{input}" nicht registriert.{'\n'}
                Demo: MV-R245-2022-0156 · MV-T800-2023-1847 · MV-L310-2023-0892
              </Text>
            </View>
          </View>
        )}

        {/* ── Machine ────────────────────────────────────────────────── */}
        {machine && (
          <View style={styles.machineContainer}>

            {/* Machine identity header */}
            <View style={styles.machineHeader}>
              <View style={styles.machineHeaderTop}>
                <View style={styles.machineIcon}>
                  <Text style={styles.machineIconText}>
                    {machine.category.includes('Tiefzieh') ? 'T' :
                     machine.category.includes('Tray') ? 'TS' : 'L'}
                  </Text>
                </View>
                <View style={styles.machineIdentity}>
                  <Text style={styles.machineName}>{machine.model}</Text>
                  <Text style={[styles.machineSerial, { fontFamily: MONO }]}>{machine.serialNo}</Text>
                  <Text style={styles.machineLocation}>{machine.location}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_CFG[machine.status].bg, borderColor: STATUS_CFG[machine.status].border }
                ]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_CFG[machine.status].dot }]} />
                  <Text style={styles.statusText}>{machine.statusText}</Text>
                </View>
              </View>

              {/* Kategorie-Info-Leiste */}
              <View style={styles.machineMetaBar}>
                <Text style={styles.machineMetaItem}>{machine.category}</Text>
                <View style={styles.machineMetaSep} />
                <Text style={styles.machineMetaItem}>{machine.manufacturer}</Text>
                <View style={styles.machineMetaSep} />
                <Text style={styles.machineMetaItem}>Bj. {machine.yearBuilt}</Text>
              </View>
            </View>

            {/* Platform-spezifische Karte */}
            <MachineCard
              machine={machine}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Schnellaktionen */}
            <MachineActionsSheet machine={machine} />

            {/* Benachrichtigungen */}
            <MachineNotifications machine={machine} />
          </View>
        )}

        {/* ── Hint (Leerzustand) ─────────────────────────────────────── */}
        {!machine && !notFound && (
          <View style={styles.hintCard}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.textHint} />
            <Text style={styles.hintText}>
              {'<MachineCard />'} wird plattformspezifisch geladen:{'\n'}
              <Text style={styles.hintBold}>iOS</Text>{' → '}
              {'MachineCard.ios.tsx'} (Grouped Table View){'\n'}
              <Text style={styles.hintBold}>Browser</Text>{' → '}
              {'MachineCard.web.tsx'} (HMI-Dashboardstil)
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
  inner: { width: '100%', gap: 16 },
  innerWide: { maxWidth: 780 },

  // Header
  header: {
    backgroundColor: COLORS.bgDark,
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: { flex: 1, gap: 4 },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: COLORS.textOnDarkMuted, lineHeight: 18, marginTop: 2 },
  mvLogo: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mvLogoText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  // Search card
  searchCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  searchCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: 12,
  },
  searchInputIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHint,
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: COLORS.text,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Quick access
  quickAccess: { gap: 6 },
  quickLabel: { fontSize: 11, color: COLORS.textHint, letterSpacing: 0.3 },
  quickChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' as const },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    paddingVertical: 7,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  chipActive: { backgroundColor: COLORS.bgCardAlt, borderColor: COLORS.primary },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, fontFamily: MONO },
  chipLabelActive: { color: COLORS.primary },

  // Not found
  notFoundCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: COLORS.dangerBorder,
    borderLeftColor: COLORS.danger,
    alignItems: 'flex-start',
  },
  notFoundBody: { flex: 1, gap: 3 },
  notFoundTitle: { fontSize: 14, fontWeight: '800', color: COLORS.danger },
  notFoundSub: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },

  // Machine container
  machineContainer: { gap: 12 },
  machineHeader: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  machineHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  machineIcon: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineIconText: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  machineIdentity: { flex: 1, gap: 2 },
  machineName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  machineSerial: { fontSize: 11, color: COLORS.textMuted },
  machineLocation: { fontSize: 11, color: COLORS.textHint },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', color: COLORS.text },

  machineMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCardAlt,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
  },
  machineMetaItem: { fontSize: 11, color: COLORS.textMuted },
  machineMetaSep: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },

  // Hint
  hintCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
  },
  hintText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 20, fontFamily: MONO },
  hintBold: { fontWeight: '700', color: COLORS.primary },
});
