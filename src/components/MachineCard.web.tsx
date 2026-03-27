/**
 * MachineCard.web.tsx
 * Web-Darstellung: Moderne Karten mit Hover-Tabs, Grid-Layout, Web-Typografie.
 * Wird von Metro automatisch im Browser geladen.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Machine } from '../data/machines';
import { COLORS } from '../theme';

interface Props {
  machine: Machine;
  activeSection: 'overview' | 'datasheet' | 'parts' | 'maintenance';
  onSectionChange: (s: 'overview' | 'datasheet' | 'parts' | 'maintenance') => void;
}

const SECTIONS = [
  { id: 'overview' as const, label: 'Übersicht', icon: '🏷️' },
  { id: 'datasheet' as const, label: 'Datenblatt', icon: '📋' },
  { id: 'parts' as const, label: 'Ersatzteile', icon: '🔩' },
  { id: 'maintenance' as const, label: 'Wartung', icon: '🛠️' },
];

function WebRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.webRow}>
      <Text style={styles.webRowLabel}>{label}</Text>
      <Text style={[styles.webRowValue, mono && styles.webRowValueMono]}>{value}</Text>
    </View>
  );
}

function WebCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.webCard}>
      {title && <Text style={styles.webCardTitle}>{title}</Text>}
      {children}
    </View>
  );
}

const STATUS_CONFIG = {
  ok: { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', text: '#15803d' },
  warning: { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', text: '#92400e' },
  error: { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', text: '#991b1b' },
};

export function MachineCard({ machine, activeSection, onSectionChange }: Props) {
  const sc = STATUS_CONFIG[machine.status];

  return (
    <View style={styles.root}>

      {/* Web Tab Bar */}
      <View style={styles.tabBar}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.tab, activeSection === s.id && styles.tabActive]}
            onPress={() => onSectionChange(s.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.tabIcon}>{s.icon}</Text>
            <Text style={[styles.tabLabel, activeSection === s.id && styles.tabLabelActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Platform badge */}
      <View style={styles.platformBadge}>
        <Text style={styles.platformDot}>●</Text>
        <Text style={styles.platformBadgeText}>MachineCard.web.tsx · Web-Stil</Text>
      </View>

      {/* Übersicht */}
      {activeSection === 'overview' && (
        <View style={styles.sections}>
          <View style={[styles.statusBanner, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
            <Text style={[styles.statusText, { color: sc.text }]}>{machine.statusText}</Text>
          </View>

          <View style={styles.gridTwo}>
            <WebCard title="Gerät">
              <WebRow label="Modell" value={machine.model} />
              <WebRow label="Kategorie" value={machine.category} />
              <WebRow label="Hersteller" value={machine.manufacturer} />
              <WebRow label="Baujahr" value={String(machine.yearBuilt)} />
            </WebCard>
            <WebCard title="Standort & Status">
              <WebRow label="Ort" value={machine.location} />
              <WebRow label="Status" value={machine.statusText} />
              <WebRow label="Seriennr." value={machine.serialNo} mono />
            </WebCard>
          </View>
        </View>
      )}

      {/* Datenblatt */}
      {activeSection === 'datasheet' && (
        <View style={styles.sections}>
          {/* PDF Button */}
          <TouchableOpacity style={styles.pdfButton} activeOpacity={0.85}>
            <Text style={styles.pdfIcon}>📄</Text>
            <View style={styles.pdfTextWrap}>
              <Text style={styles.pdfLabel}>{machine.datasheet.pdfLabel}</Text>
              <Text style={styles.pdfSub}>Datenblatt herunterladen</Text>
            </View>
            <Text style={styles.pdfArrow}>↗</Text>
          </TouchableOpacity>

          <View style={styles.gridTwo}>
            <WebCard title="Elektrisch / Leistung">
              <WebRow label="Leistung" value={machine.datasheet.power} />
              <WebRow label="Spannung" value={machine.datasheet.voltage} />
              <WebRow label="Schutzklasse" value={machine.datasheet.ipClass} />
              <WebRow label="Ausstoß" value={machine.datasheet.output} />
            </WebCard>
            <WebCard title="Mechanisch">
              <WebRow label="Gewicht" value={machine.datasheet.weight} />
              <WebRow label="Abmessungen" value={machine.datasheet.dimensions} />
            </WebCard>
          </View>
        </View>
      )}

      {/* Ersatzteile */}
      {activeSection === 'parts' && (
        <View style={styles.sections}>
          <WebCard title="Ersatzteilliste">
            {/* Header */}
            <View style={[styles.partsHeaderRow, styles.partsTableRow]}>
              <Text style={[styles.partsCell, styles.partsCellWide, styles.partsHeaderText]}>Bezeichnung</Text>
              <Text style={[styles.partsCell, styles.partsCellMono, styles.partsHeaderText]}>Art.-Nr.</Text>
              <Text style={[styles.partsCell, styles.partsCellSmall, styles.partsHeaderText]}>Menge</Text>
              <Text style={[styles.partsCell, styles.partsCellSmall, styles.partsHeaderText]}>Lieferfrist</Text>
            </View>
            {machine.spareParts.map((p) => (
              <View key={p.partNo} style={styles.partsTableRow}>
                <Text style={[styles.partsCell, styles.partsCellWide, styles.partsName]}>{p.name}</Text>
                <Text style={[styles.partsCell, styles.partsCellMono]}>{p.partNo}</Text>
                <Text style={[styles.partsCell, styles.partsCellSmall, styles.partsCellCenter]}>×{p.qty}</Text>
                <Text style={[styles.partsCell, styles.partsCellSmall, styles.partsCellCenter]}>{p.leadDays}d</Text>
              </View>
            ))}
          </WebCard>
        </View>
      )}

      {/* Wartung */}
      {activeSection === 'maintenance' && (
        <View style={styles.sections}>
          <View style={styles.gridTwo}>
            <WebCard title="Nächste Wartung">
              <WebRow label="Termin" value={machine.maintenance.nextDate} />
              <WebRow label="Intervall" value={`alle ${machine.maintenance.intervalDays} Tage`} />
            </WebCard>
            <WebCard title="Letzte Wartung">
              <WebRow label="Datum" value={machine.maintenance.lastDate} />
            </WebCard>
          </View>

          <WebCard title="Wartungshistorie">
            {machine.maintenance.history.map((h, i) => (
              <View key={i} style={[styles.histRow, i > 0 && styles.histRowBorder]}>
                <View style={[styles.histBadge, { backgroundColor: h.type === 'Reparatur' ? '#fef3c7' : '#f0fdf4' }]}>
                  <Text style={[styles.histBadgeText, { color: h.type === 'Reparatur' ? '#92400e' : '#15803d' }]}>
                    {h.type}
                  </Text>
                </View>
                <View style={styles.histRight}>
                  <Text style={styles.histDate}>{h.date} · {h.tech}</Text>
                  <Text style={styles.histNote}>{h.note}</Text>
                </View>
              </View>
            ))}
          </WebCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },

  // Web Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabIcon: { fontSize: 13 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  tabLabelActive: { color: '#fff' },

  // Platform badge
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  platformDot: { fontSize: 8, color: '#6366f1' },
  platformBadgeText: { fontSize: 10, color: '#6366f1', fontFamily: 'monospace' },

  sections: { gap: 10 },

  // Status
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },

  // Grid
  gridTwo: {
    flexDirection: 'row',
    gap: 10,
    ...Platform.select({ web: {} as any }),
  },

  // Web Cards
  webCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: 12,
    gap: 6,
  },
  webCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as any,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  webRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  webRowLabel: { fontSize: 12, color: COLORS.textMuted, flex: 1 },
  webRowValue: { fontSize: 12, color: COLORS.text, fontWeight: '600', textAlign: 'right' as any, maxWidth: '60%' },
  webRowValueMono: { fontFamily: 'monospace', fontSize: 11 },

  // PDF button
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pdfIcon: { fontSize: 24 },
  pdfTextWrap: { flex: 1, gap: 2 },
  pdfLabel: { fontSize: 13, color: '#1d4ed8', fontWeight: '600' },
  pdfSub: { fontSize: 11, color: '#6b7280' },
  pdfArrow: { fontSize: 16, color: '#3b82f6', fontWeight: '700' },

  // Parts table
  partsTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  partsHeaderRow: { borderBottomWidth: 2, borderBottomColor: COLORS.border },
  partsHeaderText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' as any },
  partsCell: { fontSize: 12, color: COLORS.text },
  partsCellWide: { flex: 2 },
  partsCellMono: { flex: 1.5, fontFamily: 'monospace', fontSize: 11, color: COLORS.textMuted },
  partsCellSmall: { width: 52, textAlign: 'center' as any },
  partsCellCenter: { color: COLORS.textMuted },
  partsName: { fontWeight: '500' },

  // Maintenance history
  histRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  histRowBorder: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  histBadge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    minWidth: 70,
    alignItems: 'center',
  },
  histBadgeText: { fontSize: 11, fontWeight: '700' },
  histRight: { flex: 1, gap: 2 },
  histDate: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace' },
  histNote: { fontSize: 12, color: COLORS.text, lineHeight: 17 },
});
