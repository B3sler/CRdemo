/**
 * MachineCard.ios.tsx
 * iOS-native Darstellung: Grouped Table View Stil (wie iOS Einstellungen)
 * Wird von Metro automatisch auf iOS geladen.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Machine } from '../data/machines';
import { COLORS } from '../theme';

interface Props {
  machine: Machine;
  activeSection: 'overview' | 'datasheet' | 'parts' | 'maintenance';
  onSectionChange: (s: 'overview' | 'datasheet' | 'parts' | 'maintenance') => void;
}

const SECTIONS = [
  { id: 'overview' as const, label: 'Übersicht' },
  { id: 'datasheet' as const, label: 'Datenblatt' },
  { id: 'parts' as const, label: 'Ersatzteile' },
  { id: 'maintenance' as const, label: 'Wartung' },
];

function IosRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function IosSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.tableSection}>
      <Text style={styles.tableSectionTitle}>{title.toUpperCase()}</Text>
      <View style={styles.tableCard}>{children}</View>
    </View>
  );
}

const STATUS_COLORS = {
  ok: { dot: '#34c759', text: '#1c7c32' },
  warning: { dot: '#ff9500', text: '#7a4400' },
  error: { dot: '#ff3b30', text: '#8b1a13' },
};

export function MachineCard({ machine, activeSection, onSectionChange }: Props) {
  const sc = STATUS_COLORS[machine.status];

  return (
    <View style={styles.root}>

      {/* iOS Segmented Control */}
      <View style={styles.segmented}>
        {SECTIONS.map((s, i) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.segment,
              activeSection === s.id && styles.segmentActive,
              i === 0 && styles.segmentFirst,
              i === SECTIONS.length - 1 && styles.segmentLast,
            ]}
            onPress={() => onSectionChange(s.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, activeSection === s.id && styles.segmentTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Platform badge */}
      <View style={styles.platformBadge}>
        <Text style={styles.platformBadgeText}>MachineCard.ios.tsx · iOS Grouped Table Stil</Text>
      </View>

      {/* Übersicht */}
      {activeSection === 'overview' && (
        <View style={styles.sections}>
          {/* Status-Banner */}
          <View style={[styles.statusBanner, { backgroundColor: machine.status === 'ok' ? '#e8fae8' : machine.status === 'warning' ? '#fff8e1' : '#ffebee' }]}>
            <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
            <Text style={[styles.statusText, { color: sc.text }]}>{machine.statusText}</Text>
          </View>

          <IosSection title="Gerät">
            <IosRow label="Modell" value={machine.model} />
            <IosRow label="Kategorie" value={machine.category} />
            <IosRow label="Hersteller" value={machine.manufacturer} />
            <IosRow label="Baujahr" value={String(machine.yearBuilt)} last />
          </IosSection>

          <IosSection title="Standort">
            <IosRow label="Ort" value={machine.location} last />
          </IosSection>
        </View>
      )}

      {/* Datenblatt */}
      {activeSection === 'datasheet' && (
        <View style={styles.sections}>
          {/* PDF-Link-Zeile */}
          <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>DOKUMENT</Text>
            <TouchableOpacity style={[styles.tableCard, styles.pdfRow]} activeOpacity={0.7}>
              <Text style={styles.pdfIcon}>📄</Text>
              <Text style={styles.pdfLabel}>{machine.datasheet.pdfLabel}</Text>
              <Text style={styles.pdfChevron}>›</Text>
            </TouchableOpacity>
          </View>

          <IosSection title="Technische Daten">
            <IosRow label="Leistung" value={machine.datasheet.power} />
            <IosRow label="Ausstoß" value={machine.datasheet.output} />
            <IosRow label="Gewicht" value={machine.datasheet.weight} />
            <IosRow label="Abmessungen" value={machine.datasheet.dimensions} />
            <IosRow label="Spannung" value={machine.datasheet.voltage} />
            <IosRow label="Schutzklasse" value={machine.datasheet.ipClass} last />
          </IosSection>
        </View>
      )}

      {/* Ersatzteile */}
      {activeSection === 'parts' && (
        <View style={styles.sections}>
          <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>ERSATZTEILLISTE</Text>
            <View style={styles.tableCard}>
              {machine.spareParts.map((p, i) => (
                <View key={p.partNo} style={[styles.partRow, i < machine.spareParts.length - 1 && styles.rowBorder]}>
                  <View style={styles.partLeft}>
                    <Text style={styles.partName}>{p.name}</Text>
                    <Text style={styles.partNo}>{p.partNo}</Text>
                  </View>
                  <View style={styles.partRight}>
                    <Text style={styles.partQty}>×{p.qty}</Text>
                    <Text style={styles.partLead}>{p.leadDays} Tage</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Wartung */}
      {activeSection === 'maintenance' && (
        <View style={styles.sections}>
          <IosSection title="Intervall">
            <IosRow label="Letzte Wartung" value={machine.maintenance.lastDate} />
            <IosRow label="Nächste Wartung" value={machine.maintenance.nextDate} />
            <IosRow label="Intervall" value={`alle ${machine.maintenance.intervalDays} Tage`} last />
          </IosSection>

          <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>HISTORIE</Text>
            <View style={styles.tableCard}>
              {machine.maintenance.history.map((h, i) => (
                <View key={i} style={[styles.histRow, i < machine.maintenance.history.length - 1 && styles.rowBorder]}>
                  <View style={styles.histLeft}>
                    <Text style={styles.histDate}>{h.date}</Text>
                    <Text style={styles.histType}>{h.type} · {h.tech}</Text>
                    <Text style={styles.histNote}>{h.note}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },

  // iOS Segmented Control
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    borderRadius: 9,
    padding: 2,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 7,
    alignItems: 'center',
  },
  segmentFirst: {},
  segmentLast: {},
  segmentActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  segmentText: { fontSize: 11, fontWeight: '500', color: '#3a3a3c' },
  segmentTextActive: { fontWeight: '700', color: '#1c1c1e' },

  // Platform badge
  platformBadge: {
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 16,
    alignSelf: 'center',
  },
  platformBadgeText: { fontSize: 10, color: '#636366', fontFamily: 'Menlo' },

  sections: { gap: 6 },

  // Status
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },

  // iOS grouped table
  tableSection: { gap: 5 },
  tableSectionTitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6c6c70',
    letterSpacing: 0.5,
    marginLeft: 16,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c6c6c8',
  },
  rowLabel: { flex: 1, fontSize: 13, color: '#1c1c1e' },
  rowValue: { fontSize: 13, color: '#636366', maxWidth: '55%', textAlign: 'right' },

  // PDF row
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  pdfIcon: { fontSize: 22 },
  pdfLabel: { flex: 1, fontSize: 13, color: '#007aff', fontWeight: '500' },
  pdfChevron: { fontSize: 18, color: '#c7c7cc', fontWeight: '300' },

  // Parts
  partRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  partLeft: { flex: 1, gap: 2 },
  partName: { fontSize: 13, color: '#1c1c1e', fontWeight: '500' },
  partNo: { fontSize: 11, color: '#636366', fontFamily: 'Menlo' },
  partRight: { alignItems: 'flex-end', gap: 2 },
  partQty: { fontSize: 13, color: '#1c1c1e', fontWeight: '600' },
  partLead: { fontSize: 11, color: '#8e8e93' },

  // Maintenance history
  histRow: { paddingHorizontal: 16, paddingVertical: 10 },
  histLeft: { gap: 2 },
  histDate: { fontSize: 12, color: '#636366', fontFamily: 'Menlo' },
  histType: { fontSize: 13, color: '#1c1c1e', fontWeight: '600' },
  histNote: { fontSize: 12, color: '#636366', lineHeight: 17 },
});
