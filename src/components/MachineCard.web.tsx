/**
 * MachineCard.web.tsx
 * Web-Darstellung: MULTIVAC HMI-inspiriertes Dashboard-Layout.
 * Dunkle Header-Leiste, strukturierte Datentabellen, Industriecharakter.
 * Metro lädt diese Datei automatisch im Browser.
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
  { id: 'overview' as const,    label: 'Übersicht',   icon: '▤' },
  { id: 'datasheet' as const,   label: 'Datenblatt',  icon: '≡' },
  { id: 'parts' as const,       label: 'Ersatzteile', icon: '⬡' },
  { id: 'maintenance' as const, label: 'Wartung',     icon: '⚙' },
];

const STATUS_CFG = {
  ok:      { bg: '#E6F9EE', border: '#6ABF99', dot: '#0A6640', text: '#0A6640', label: 'OK' },
  warning: { bg: '#FEF6EE', border: '#F4B660', dot: '#B54708', text: '#B54708', label: 'Wartung fällig' },
  error:   { bg: '#FEF3F2', border: '#FDA29B', dot: '#B42318', text: '#B42318', label: 'Fehler' },
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function DataRow({ label, value, mono, accent }: {
  label: string; value: string; mono?: boolean; accent?: boolean;
}) {
  return (
    <View style={dr.row}>
      <Text style={dr.label}>{label}</Text>
      <Text style={[dr.value, mono && dr.mono, accent && dr.accent]}>{value}</Text>
    </View>
  );
}
const dr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F8',
    gap: 8,
  },
  label: { fontSize: 12, color: COLORS.textMuted, flex: 1 },
  value: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'right' as const, maxWidth: '62%' },
  mono: { fontFamily: 'monospace', fontSize: 11 },
  accent: { color: COLORS.primary },
});

function Panel({ title, children, action }: {
  title: string; children: React.ReactNode; action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={panel.card}>
      <View style={panel.header}>
        <Text style={panel.title}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
            <Text style={panel.action}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={panel.body}>{children}</View>
    </View>
  );
}
const panel = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 6,
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
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.9,
  },
  action: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  body: { padding: 14, gap: 0 },
});

// ─── Main Component ────────────────────────────────────────────────────────────

export function MachineCard({ machine, activeSection, onSectionChange }: Props) {
  const sc = STATUS_CFG[machine.status];

  return (
    <View style={styles.root}>

      {/* HMI-Style Tab Navigation */}
      <View style={styles.navBar}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.navTab, activeSection === s.id && styles.navTabActive]}
            onPress={() => onSectionChange(s.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.navIcon, activeSection === s.id && styles.navIconActive]}>{s.icon}</Text>
            <Text style={[styles.navLabel, activeSection === s.id && styles.navLabelActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Source badge */}
      <View style={styles.sourceBadge}>
        <View style={styles.sourceDot} />
        <Text style={styles.sourceBadgeText}>MachineCard.web.tsx</Text>
      </View>

      {/* ── ÜBERSICHT ─────────────────────────────────────────────────────── */}
      {activeSection === 'overview' && (
        <View style={styles.grid}>
          {/* Status */}
          <View style={[styles.statusBar, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
            <Text style={[styles.statusText, { color: sc.text }]}>Status: {sc.label}</Text>
          </View>

          <View style={styles.twoCol}>
            <Panel title="Maschinendaten">
              <DataRow label="Modell" value={machine.model} />
              <DataRow label="Kategorie" value={machine.category} />
              <DataRow label="Hersteller" value={machine.manufacturer} />
              <DataRow label="Baujahr" value={String(machine.yearBuilt)} />
            </Panel>
            <Panel title="Installation">
              <DataRow label="Standort" value={machine.location} />
              <DataRow label="Seriennummer" value={machine.serialNo} mono accent />
            </Panel>
          </View>
        </View>
      )}

      {/* ── DATENBLATT ───────────────────────────────────────────────────── */}
      {activeSection === 'datasheet' && (
        <View style={styles.grid}>
          {/* PDF-Download */}
          <TouchableOpacity style={styles.pdfRow} activeOpacity={0.85}>
            <View style={styles.pdfIcon}><Text style={styles.pdfIconText}>PDF</Text></View>
            <View style={styles.pdfMeta}>
              <Text style={styles.pdfName}>{machine.datasheet.pdfLabel}</Text>
              <Text style={styles.pdfSub}>Betriebsanleitung herunterladen</Text>
            </View>
            <Text style={styles.pdfArrow}>↗</Text>
          </TouchableOpacity>

          <View style={styles.twoCol}>
            <Panel title="Elektrisch / Leistung">
              <DataRow label="Nennleistung" value={machine.datasheet.power} />
              <DataRow label="Versorgung" value={machine.datasheet.voltage} />
              <DataRow label="Schutzart" value={machine.datasheet.ipClass} />
              <DataRow label="Taktleistung" value={machine.datasheet.output} />
            </Panel>
            <Panel title="Mechanisch">
              <DataRow label="Maschinengewicht" value={machine.datasheet.weight} />
              <DataRow label="Abmessungen (L×B×H)" value={machine.datasheet.dimensions} />
            </Panel>
          </View>
        </View>
      )}

      {/* ── ERSATZTEILE ──────────────────────────────────────────────────── */}
      {activeSection === 'parts' && (
        <View style={styles.grid}>
          <Panel title={`Ersatzteilliste · ${machine.spareParts.length} Positionen`}>
            {/* Table header */}
            <View style={[pt.row, pt.headerRow]}>
              <Text style={[pt.cell, pt.wide, pt.hdr]}>Bezeichnung</Text>
              <Text style={[pt.cell, pt.artNo, pt.hdr]}>Artikel-Nr.</Text>
              <Text style={[pt.cell, pt.small, pt.hdr, pt.center]}>Menge</Text>
              <Text style={[pt.cell, pt.small, pt.hdr, pt.center]}>Frist</Text>
            </View>
            {machine.spareParts.map((p, i) => (
              <View key={p.partNo} style={[pt.row, i % 2 === 1 && pt.rowAlt]}>
                <Text style={[pt.cell, pt.wide, pt.name]}>{p.name}</Text>
                <Text style={[pt.cell, pt.artNo, pt.mono]}>{p.partNo}</Text>
                <Text style={[pt.cell, pt.small, pt.center, { color: COLORS.primary, fontWeight: '700' }]}>×{p.qty}</Text>
                <Text style={[pt.cell, pt.small, pt.center, pt.muted]}>{p.leadDays}d</Text>
              </View>
            ))}
          </Panel>
        </View>
      )}

      {/* ── WARTUNG ──────────────────────────────────────────────────────── */}
      {activeSection === 'maintenance' && (
        <View style={styles.grid}>
          <View style={styles.twoCol}>
            <Panel title="Nächste Wartung">
              <DataRow label="Termin" value={machine.maintenance.nextDate} accent={machine.status === 'warning'} />
              <DataRow label="Letzter Service" value={machine.maintenance.lastDate} />
              <DataRow label="Intervall" value={`alle ${machine.maintenance.intervalDays} Tage`} />
            </Panel>
            <Panel title="CustomCare Status">
              <DataRow
                label="Programm"
                value="CustomCare Active"
                accent
              />
              <DataRow label="Vertrag" value="Aktiv" />
            </Panel>
          </View>

          <Panel title="Wartungshistorie">
            {machine.maintenance.history.map((h, i) => (
              <View key={i} style={[ht.row, i > 0 && ht.rowTop]}>
                <View style={[ht.badge, h.type === 'Reparatur' && ht.badgeWarn]}>
                  <Text style={[ht.badgeText, h.type === 'Reparatur' && ht.badgeTextWarn]}>{h.type}</Text>
                </View>
                <View style={ht.right}>
                  <Text style={ht.meta}>{h.date} · {h.tech}</Text>
                  <Text style={ht.note}>{h.note}</Text>
                </View>
              </View>
            ))}
          </Panel>
        </View>
      )}
    </View>
  );
}

// ─── Parts table styles ───────────────────────────────────────────────────────
const pt = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowAlt: { backgroundColor: '#F8FAFC' },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 2,
  },
  cell: { fontSize: 12, color: COLORS.text, paddingRight: 8 },
  wide: { flex: 2 },
  artNo: { flex: 1.4, fontFamily: 'monospace', fontSize: 11, color: COLORS.textMuted },
  small: { width: 50 },
  hdr: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' as const },
  name: { fontWeight: '500' },
  mono: {},
  center: { textAlign: 'center' as const },
  muted: { color: COLORS.textMuted },
});

// ─── History styles ───────────────────────────────────────────────────────────
const ht = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 10, alignItems: 'flex-start' },
  rowTop: { borderTopWidth: 1, borderTopColor: '#EEF3F8' },
  badge: {
    backgroundColor: COLORS.successBg,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 82,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  badgeWarn: { backgroundColor: COLORS.warningBg },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.success },
  badgeTextWarn: { color: COLORS.warning },
  right: { flex: 1, gap: 3 },
  meta: { fontSize: 11, color: COLORS.textHint, fontFamily: 'monospace' },
  note: { fontSize: 12, color: COLORS.text, lineHeight: 17 },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { gap: 12 },

  // HMI navigation bar
  navBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgDark,
    borderRadius: 6,
    overflow: 'hidden',
  },
  navTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderDark,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  navTabActive: { backgroundColor: COLORS.primary },
  navIcon: { fontSize: 13, color: COLORS.textOnDarkMuted },
  navIconActive: { color: '#fff' },
  navLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textOnDarkMuted },
  navLabelActive: { color: '#fff' },

  // Source badge
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#EEF0FF',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6366F1' },
  sourceBadgeText: { fontSize: 10, color: '#4F46E5', fontFamily: 'monospace' },

  // Grid
  grid: { gap: 10 },
  twoCol: { flexDirection: 'row', gap: 10 },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },

  // PDF download
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF7FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  pdfIcon: {
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  pdfMeta: { flex: 1, gap: 2 },
  pdfName: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  pdfSub: { fontSize: 11, color: COLORS.textMuted },
  pdfArrow: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
});
