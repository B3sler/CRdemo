/**
 * MachineNotifications.ios.tsx
 * Nutzt nativen Switch (UISwitch) + Alert für Bestätigungen.
 * Metro lädt diese Datei automatisch auf iOS.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { COLORS } from '../theme';
import { Machine } from '../data/machines';

interface Props {
  machine: Machine;
}

interface NotifSetting {
  id: string;
  label: string;
  sub: string;
  value: boolean;
}

const TINT = '#2B5BE8'; // Multivac Interactive Blue als iOS tintColor

export function MachineNotifications({ machine }: Props) {
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'maintenance', label: 'Wartungserinnerung',   sub: `${machine.maintenance.intervalDays} Tage vor Termin`,  value: true  },
    { id: 'malfunction', label: 'Störungsmeldungen',    sub: 'Bei Maschinenfehler sofort',                           value: true  },
    { id: 'parts',       label: 'Verbrauchsmaterial',   sub: 'Bei Unterschreitung Mindestbestand',                   value: false },
    { id: 'report',      label: 'Wartungsberichte',     sub: 'Nach abgeschlossener Inspektion',                      value: false },
  ]);

  function toggle(id: string, newValue: boolean) {
    const setting = settings.find((s) => s.id === id)!;
    if (!newValue) {
      Alert.alert(
        `${setting.label} deaktivieren?`,
        'Du erhältst keine Benachrichtigungen mehr für diese Maschine.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Deaktivieren',
            style: 'destructive',
            onPress: () => setSettings((prev) =>
              prev.map((s) => s.id === id ? { ...s, value: false } : s)
            ),
          },
        ]
      );
    } else {
      setSettings((prev) => prev.map((s) => s.id === id ? { ...s, value: newValue } : s));
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeader}>BENACHRICHTIGUNGEN</Text>
      <View style={styles.tableCard}>
        {settings.map((s, i) => (
          <View key={s.id} style={[styles.row, i < settings.length - 1 && styles.rowDivider]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>{s.label}</Text>
              <Text style={styles.rowSub}>{s.sub}</Text>
            </View>
            {/* Native UISwitch — reagiert auf tintColor / trackColor */}
            <Switch
              value={s.value}
              onValueChange={(v) => toggle(s.id, v)}
              trackColor={{ false: '#E5E5EA', true: TINT }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
        ))}
      </View>
      <Text style={styles.sectionFooter}>
        Deaktivieren öffnet nativen iOS Alert
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C6C70',
    letterSpacing: 0.4,
    marginLeft: 16,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  rowLeft: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, color: '#000000' },
  rowSub: { fontSize: 13, color: '#8E8E93' },
  sectionFooter: { fontSize: 12, color: '#6C6C70', marginLeft: 16 },
});
