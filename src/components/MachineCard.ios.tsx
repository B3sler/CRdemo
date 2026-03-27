/**
 * MachineCard.ios.tsx
 * iOS-native Darstellung: Grouped Table View Stil (UIKit / SwiftUI)
 * Multivac Blau als System-Tint. Metro lädt diese Datei automatisch auf iOS.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Machine } from '../data/machines';
import { COLORS } from '../theme';

interface Props {
  machine: Machine;
  activeSection: 'overview' | 'datasheet' | 'parts' | 'maintenance';
  onSectionChange: (s: 'overview' | 'datasheet' | 'parts' | 'maintenance') => void;
}

const SECTIONS = [
  { id: 'overview' as const,     label: 'Übersicht' },
  { id: 'datasheet' as const,    label: 'Datenblatt' },
  { id: 'parts' as const,        label: 'Ersatzteile' },
  { id: 'maintenance' as const,  label: 'Wartung' },
];

// iOS system-level colors (close to UIKit defaults with Multivac tint)
const IOS = {
  systemGray6:  '#F2F2F7',
  systemGray5:  '#E5E5EA',
  systemGray4:  '#D1D1D6',
  systemGray3:  '#C7C7CC',
  systemGray2:  '#AEAEB2',
  systemGray:   '#8E8E93',
  label:        '#000000',
  secondaryLabel:'#3C3C43',
  tertiaryLabel: '#3C3C4399',
  separator:    '#C6C6C8',
  groupedBg:    '#F2F2F7',
  groupedCard:  '#FFFFFF',
  tint:         '#2B5BE8',       // Interactive Blue als iOS System-Tint
  destructive:  '#FF3B30',
  statusGreen:  '#34C759',
  statusYellow: '#FF9500',
  statusRed:    '#FF3B30',
};

function Row({ label, value, last, tint }: { label: string; value: string; last?: boolean; tint?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, tint && { color: IOS.tint }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function Section({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
      <View style={styles.sectionCard}>{children}</View>
      {footer && <Text style={styles.sectionFooter}>{footer}</Text>}
    </View>
  );
}

const STATUS_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  ok:      { dot: IOS.statusGreen,  text: '#1C7C32', bg: '#E8F8EE' },
  warning: { dot: IOS.statusYellow, text: '#7A4400', bg: '#FFF5E0' },
  error:   { dot: IOS.statusRed,    text: '#8B1A13', bg: '#FFEEEE' },
};

export function MachineCard({ machine, activeSection, onSectionChange }: Props) {
  const sc = STATUS_COLORS[machine.status];

  return (
    <View style={styles.root}>

      {/* iOS Segmented Control */}
      <View style={styles.segmented}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.segment, activeSection === s.id && styles.segmentActive]}
            onPress={() => onSectionChange(s.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, activeSection === s.id && styles.segmentTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Source badge */}
      <View style={styles.sourceBadge}>
        <Text style={styles.sourceBadgeText}>MachineCard.ios.tsx</Text>
      </View>

      {/* ÜBERSICHT */}
      {activeSection === 'overview' && (
        <View style={styles.sections}>
          <View style={[styles.statusBanner, { backgroundColor: sc.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
            <Text style={[styles.statusLabel, { color: sc.text }]}>{machine.statusText}</Text>
          </View>

          <Section title="Gerät">
            <Row label="Modell" value={machine.model} />
            <Row label="Kategorie" value={machine.category} />
            <Row label="Hersteller" value={machine.manufacturer} />
            <Row label="Baujahr" value={String(machine.yearBuilt)} last />
          </Section>

          <Section title="Standort" footer="Quelle: myMULTIVAC-Portal">
            <Row label="Standort" value={machine.location} last />
          </Section>
        </View>
      )}

      {/* DATENBLATT */}
      {activeSection === 'datasheet' && (
        <View style={styles.sections}>
          <Section title="Dokument">
            <TouchableOpacity style={[styles.row, styles.fileRow]} activeOpacity={0.6}>
              <Ionicons name="document-text-outline" size={22} color={IOS.tint} />
              <Text style={styles.fileLabel}>{machine.datasheet.pdfLabel}</Text>
              <Ionicons name="chevron-forward" size={18} color={IOS.systemGray3} />
            </TouchableOpacity>
          </Section>

          <Section title="Elektrisch / Leistung">
            <Row label="Leistung" value={machine.datasheet.power} />
            <Row label="Spannung" value={machine.datasheet.voltage} />
            <Row label="Schutzklasse" value={machine.datasheet.ipClass} />
            <Row label="Ausstoß" value={machine.datasheet.output} last />
          </Section>

          <Section title="Mechanisch">
            <Row label="Gewicht" value={machine.datasheet.weight} />
            <Row label="Abmessungen" value={machine.datasheet.dimensions} last />
          </Section>
        </View>
      )}

      {/* ERSATZTEILE */}
      {activeSection === 'parts' && (
        <View style={styles.sections}>
          <Section title="Ersatzteilliste" footer={`${machine.spareParts.length} Positionen`}>
            {machine.spareParts.map((p, i) => (
              <View key={p.partNo} style={[styles.partRow, i < machine.spareParts.length - 1 && styles.rowDivider]}>
                <View style={styles.partLeft}>
                  <Text style={styles.partName}>{p.name}</Text>
                  <Text style={styles.partNo}>{p.partNo}</Text>
                </View>
                <View style={styles.partRight}>
                  <Text style={[styles.partQty, { color: IOS.tint }]}>×{p.qty}</Text>
                  <Text style={styles.partLead}>{p.leadDays}d</Text>
                </View>
              </View>
            ))}
          </Section>
        </View>
      )}

      {/* WARTUNG */}
      {activeSection === 'maintenance' && (
        <View style={styles.sections}>
          <Section title="Wartungsplan">
            <Row label="Letzte Wartung" value={machine.maintenance.lastDate} />
            <Row label="Nächste Wartung"
              value={machine.maintenance.nextDate}
              tint={machine.status === 'warning'}
              last />
          </Section>

          <Section title="Intervall">
            <Row label="Zyklus" value={`alle ${machine.maintenance.intervalDays} Tage`} last />
          </Section>

          <Section title="Historie">
            {machine.maintenance.history.map((h, i) => (
              <View key={i} style={[styles.histRow, i < machine.maintenance.history.length - 1 && styles.rowDivider]}>
                <View style={[styles.histTypeBadge, h.type === 'Reparatur' && styles.histTypeBadgeRed]}>
                  <Text style={[styles.histTypeText, h.type === 'Reparatur' && styles.histTypeTextRed]}>
                    {h.type}
                  </Text>
                </View>
                <View style={styles.histBody}>
                  <Text style={styles.histMeta}>{h.date} · {h.tech}</Text>
                  <Text style={styles.histNote}>{h.note}</Text>
                </View>
              </View>
            ))}
          </Section>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },

  // Segmented Control (iOS native look)
  segmented: {
    flexDirection: 'row',
    backgroundColor: IOS.systemGray5,
    borderRadius: 10,
    padding: 2,
    marginBottom: 10,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: IOS.groupedCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2.5,
  },
  segmentText: { fontSize: 11, fontWeight: '500', color: IOS.label },
  segmentTextActive: { fontWeight: '700', color: IOS.label },

  // Source badge
  sourceBadge: {
    alignSelf: 'center',
    backgroundColor: IOS.systemGray6,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  sourceBadgeText: { fontSize: 10, color: IOS.systemGray, fontFamily: 'Menlo' },

  sections: { gap: 0 },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, fontWeight: '600' },

  // Grouped section
  section: { marginBottom: 18 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '400',
    color: IOS.systemGray,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginLeft: 16,
  },
  sectionFooter: {
    fontSize: 12,
    color: IOS.systemGray,
    marginTop: 6,
    marginLeft: 16,
  },
  sectionCard: {
    backgroundColor: IOS.groupedCard,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Table row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: IOS.separator,
  },
  rowLabel: { flex: 1, fontSize: 15, color: IOS.label },
  rowValue: { fontSize: 15, color: IOS.systemGray, maxWidth: '55%', textAlign: 'right' },

  // File row
  fileRow: { gap: 10, paddingVertical: 14 },
  fileLabel: { flex: 1, fontSize: 15, color: IOS.tint },

  // Parts
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  partLeft: { flex: 1, gap: 3 },
  partName: { fontSize: 14, color: IOS.label, fontWeight: '500' },
  partNo: { fontSize: 11, color: IOS.systemGray, fontFamily: 'Menlo' },
  partRight: { alignItems: 'flex-end', gap: 2 },
  partQty: { fontSize: 15, fontWeight: '700' },
  partLead: { fontSize: 12, color: IOS.systemGray },

  // Maintenance history
  histRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  histTypeBadge: {
    backgroundColor: '#E8F8EE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
  },
  histTypeBadgeRed: { backgroundColor: '#FFEEEE' },
  histTypeText: { fontSize: 11, fontWeight: '700', color: '#1C7C32' },
  histTypeTextRed: { color: IOS.destructive },
  histBody: { flex: 1, gap: 3 },
  histMeta: { fontSize: 12, color: IOS.systemGray, fontFamily: 'Menlo' },
  histNote: { fontSize: 13, color: IOS.secondaryLabel, lineHeight: 18 },
});
