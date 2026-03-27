/**
 * MachineActionsSheet.web.tsx
 * Web-Variante: Inline-Aktionskarten mit Hover-States.
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

type ActionId = 'maintenance' | 'malfunction' | 'technician' | 'export';

const ACTIONS: { id: ActionId; label: string; sub: string; icon: any; danger?: boolean }[] = [
  { id: 'maintenance', label: 'Wartung melden',      sub: 'Neuen Wartungsauftrag erfassen',     icon: 'construct-outline'  },
  { id: 'malfunction', label: 'Störung melden',       sub: 'Störungsticket anlegen',             icon: 'warning-outline',   danger: true },
  { id: 'technician',  label: 'Techniker anfordern',  sub: 'CustomCare Service kontaktieren',   icon: 'person-add-outline' },
  { id: 'export',      label: 'Als PDF exportieren',  sub: 'Maschinendaten herunterladen',       icon: 'share-outline'      },
];

export function MachineActionsSheet({ machine }: Props) {
  const [active, setActive] = useState<ActionId | null>(null);

  function handle(id: ActionId) {
    setActive(id);
    setTimeout(() => setActive(null), 1500);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Schnellaktionen</Text>
        <Text style={styles.sub}>MachineActionsSheet.web.tsx</Text>
      </View>
      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[
              styles.action,
              a.danger && styles.actionDanger,
              active === a.id && styles.actionActive,
            ]}
            onPress={() => handle(a.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, a.danger && styles.actionIconDanger]}>
              <Ionicons name={a.icon} size={18} color={a.danger ? COLORS.danger : COLORS.primary} />
            </View>
            <Text style={[styles.actionLabel, a.danger && styles.actionLabelDanger]}>{a.label}</Text>
            <Text style={styles.actionSub}>{a.sub}</Text>
            {active === a.id && (
              <View style={styles.actionFeedback}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.actionFeedbackText}>Ausgeführt</Text>
              </View>
            )}
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
  title: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  sub: { fontSize: 10, color: '#6366F1', fontFamily: 'monospace' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' as const, padding: 10, gap: 8 },
  action: {
    flex: 1,
    minWidth: 140,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 6,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  actionDanger: { borderColor: COLORS.dangerBorder, backgroundColor: COLORS.dangerBg },
  actionActive: { borderColor: COLORS.successBorder, backgroundColor: COLORS.successBg },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconDanger: { borderColor: COLORS.dangerBorder, backgroundColor: COLORS.dangerBg },
  actionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  actionLabelDanger: { color: COLORS.danger },
  actionSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 15 },
  actionFeedback: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  actionFeedbackText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
});
