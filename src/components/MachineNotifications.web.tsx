/**
 * MachineNotifications.web.tsx
 * Web-Variante: Toggle-Rows mit CSS-inspirierten Switches.
 * Metro lädt diese Datei automatisch im Browser.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { Machine } from '../data/machines';

interface Props {
  machine: Machine;
}

interface NotifSetting {
  id: string;
  label: string;
  sub: string;
  icon: any;
  value: boolean;
}

export function MachineNotifications({ machine }: Props) {
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'maintenance', label: 'Wartungserinnerung',  sub: `${machine.maintenance.intervalDays} Tage vor Termin`, icon: 'construct-outline',      value: true  },
    { id: 'malfunction', label: 'Störungsmeldungen',   sub: 'Bei Maschinenfehler sofort',                          icon: 'warning-outline',        value: true  },
    { id: 'parts',       label: 'Verbrauchsmaterial',  sub: 'Bei Unterschreitung Mindestbestand',                  icon: 'cube-outline',           value: false },
    { id: 'report',      label: 'Wartungsberichte',    sub: 'Nach abgeschlossener Inspektion',                     icon: 'document-text-outline',  value: false },
  ]);

  function toggle(id: string) {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, value: !s.value } : s));
  }

  const activeCount = settings.filter((s) => s.value).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Benachrichtigungen</Text>
          <Text style={styles.activePill}>{activeCount} aktiv</Text>
        </View>
        <Text style={styles.source}>MachineNotifications.web.tsx</Text>
      </View>

      <View style={styles.rows}>
        {settings.map((s, i) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.row, i < settings.length - 1 && styles.rowBorder]}
            onPress={() => toggle(s.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, s.value && styles.iconWrapActive]}>
              <Ionicons name={s.icon} size={16} color={s.value ? COLORS.primary : COLORS.textHint} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, !s.value && styles.rowLabelOff]}>{s.label}</Text>
              <Text style={styles.rowSub}>{s.sub}</Text>
            </View>
            {/* Web-style toggle */}
            <View style={[styles.toggle, s.value && styles.toggleOn]}>
              <View style={[styles.toggleThumb, s.value && styles.toggleThumbOn]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCardAlt,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  activePill: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    backgroundColor: COLORS.bgCardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  source: { fontSize: 10, color: '#6366F1', fontFamily: 'monospace' },

  rows: { paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconWrap: {
    width: 34, height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.bgCardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: COLORS.bgCardAlt, borderColor: COLORS.primary },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  rowLabelOff: { color: COLORS.textHint },
  rowSub: { fontSize: 11, color: COLORS.textMuted },

  // CSS-style toggle switch
  toggle: {
    width: 44, height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: COLORS.accent },
  toggleThumb: {
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
});
