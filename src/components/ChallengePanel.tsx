import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { StepBadge } from './StepBadge';
import { Version, VERSION_INFO, challengeBitLayout } from '../utils/hmac';
import { COLORS, CHALLENGE_TTL } from '../theme';

export interface QrPayload {
  s: string;
  c: string;
  v: Version;
}

interface Props {
  challenge: string;
  timeLeft: number;
  version: Version;
  serialNumber: string;
  onVersionChange: (v: Version) => void;
  onNewChallenge: () => void;
  onQrScan: (payload: QrPayload) => void;
}

const VERSIONS: Version[] = [1, 2, 3];
const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function ChallengePanel({
  challenge, timeLeft, version, serialNumber, onVersionChange, onNewChallenge, onQrScan,
}: Props) {
  const [qrOpen, setQrOpen] = useState(false);

  const pct = (timeLeft / CHALLENGE_TTL) * 100;
  const timerColor = timeLeft > 20 ? COLORS.accent : timeLeft > 8 ? COLORS.warning : COLORS.danger;
  const vInfo = VERSION_INFO[version];
  const bits = challengeBitLayout(challenge);

  const qrPayload: QrPayload = { s: serialNumber, c: challenge, v: version };
  const qrString = JSON.stringify(qrPayload);

  return (
    <View style={styles.card}>

      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <StepBadge n={1} label="Maschine" />
          <Text style={styles.cardTitle}>Challenge erzeugen</Text>
        </View>
        <View style={styles.cardHeaderIcon}>
          <Ionicons name="hardware-chip-outline" size={20} color={COLORS.textOnDarkMuted} />
        </View>
      </View>

      <View style={styles.body}>

        {/* Seriennummer */}
        <View style={styles.serialBox}>
          <Text style={styles.serialBoxLabel}>Maschinenseriennummer</Text>
          <Text style={[styles.serialBoxValue, { fontFamily: MONO }]}>{serialNumber}</Text>
          <Text style={styles.serialBoxHint}>Fest mit dieser Maschine verknüpft · Teil der HMAC-Nachricht</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="link-outline" size={14} color={COLORS.accent} style={styles.infoBoxIcon} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.infoBoxTitle}>Warum die Seriennummer?</Text>
            <Text style={styles.infoBoxText}>
              Die Seriennummer bindet jeden Response-Code an eine{' '}
              <Text style={styles.bold}>konkrete Maschine</Text>. Derselbe Secret Key + dieselbe
              Challenge ergeben auf einer anderen Maschine einen{' '}
              <Text style={styles.bold}>völlig anderen Code</Text>.
            </Text>
            <Text style={[styles.infoBoxFormula, { fontFamily: MONO }]}>
              Nachricht ={' '}
              <Text style={{ color: COLORS.accent }}>{serialNumber}</Text>
              {' | '}
              <Text style={{ color: COLORS.primaryDark }}>{challenge}</Text>
            </Text>
          </View>
        </View>

        {/* Protokoll-Version */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Protokoll-Version</Text>
          <View style={styles.versionRow}>
            {VERSIONS.map((v) => {
              const info = VERSION_INFO[v];
              const active = v === version;
              return (
                <TouchableOpacity
                  key={v}
                  style={[styles.versionBtn, active && { backgroundColor: info.color, borderColor: info.color }]}
                  onPress={() => onVersionChange(v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.versionBtnLabel, active && styles.versionBtnLabelActive]}>
                    {info.label}
                  </Text>
                  <Text style={[styles.versionBtnSub, active && styles.versionBtnSubActive]}>
                    {info.digits}-stellig
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[styles.versionDesc, { borderLeftColor: vInfo.color }]}>
            <Text style={[styles.versionDescTitle, { color: vInfo.color }]}>
              {vInfo.label} · {vInfo.name}
            </Text>
            <Text style={styles.versionDescText}>{vInfo.description}</Text>
            <Text style={[styles.versionDescTrunc, { color: vInfo.color }]}>
              Trunkierung: {vInfo.truncation}
            </Text>
          </View>
        </View>

        {/* Challenge-Anzeige */}
        <View style={styles.challengeBox}>
          <Text style={styles.challengeBoxLabel}>Aktuelle Challenge</Text>
          <Text style={[styles.challengeValue, { fontFamily: MONO }]}>{challenge}</Text>

          <View style={styles.bitRow}>
            <View style={[styles.bitBlock, { backgroundColor: vInfo.color + '20', borderColor: vInfo.color + '50' }]}>
              <Text style={[styles.bitBlockLabel, { color: vInfo.color }]}>Bits 3–0</Text>
              <Text style={[styles.bitBlockVal, { fontFamily: MONO, color: vInfo.color }]}>{bits.versionBits}</Text>
              <Text style={[styles.bitBlockSub, { color: vInfo.color }]}>Version = {version}</Text>
            </View>
            <View style={styles.bitSep}>
              <Ionicons name="remove-outline" size={14} color={COLORS.border} />
            </View>
            <View style={[styles.bitBlock, { flex: 2, backgroundColor: COLORS.bgCardAlt }]}>
              <Text style={styles.bitBlockLabel}>Bits 31–4</Text>
              <Text style={[styles.bitBlockVal, { fontFamily: MONO, fontSize: 9 }]}>{bits.dataBits}</Text>
              <Text style={styles.bitBlockSub}>Zufallsdaten</Text>
            </View>
          </View>

          <View style={styles.timerRow}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: timerColor }]} />
            </View>
            <View style={styles.countdownRow}>
              <Ionicons name="time-outline" size={12} color={timerColor} />
              <Text style={[styles.countdown, { color: timerColor }]}>Gültig noch {timeLeft} s</Text>
            </View>
          </View>
        </View>

        {/* QR-Code Toggle */}
        <TouchableOpacity
          style={styles.qrToggle}
          onPress={() => setQrOpen((o) => !o)}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.qrToggleLabel}>
            {qrOpen ? 'QR-Code ausblenden' : 'QR-Code anzeigen'}
          </Text>
          <Ionicons name={qrOpen ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textHint} />
        </TouchableOpacity>

        {qrOpen && (
          <View style={styles.qrPanel}>
            <Text style={styles.qrPanelTitle}>QR-Code für Techniker-App</Text>
            <Text style={styles.qrPanelSub}>
              Enthält Seriennummer, Challenge und Protokoll-Version.
            </Text>

            <View style={styles.qrCodeWrap}>
              <QRCode value={qrString} size={180} color={COLORS.text} backgroundColor="#ffffff" />
            </View>

            <View style={styles.qrContent}>
              <Text style={styles.qrContentTitle}>Kodierter Inhalt (JSON)</Text>
              {[
                { key: 's', desc: 'Seriennummer', val: serialNumber, color: COLORS.accent },
                { key: 'c', desc: 'Challenge', val: challenge, color: COLORS.primaryDark },
                { key: 'v', desc: 'Version', val: `${version} (${vInfo.label})`, color: vInfo.color },
              ].map((row) => (
                <View key={row.key} style={styles.qrContentRow}>
                  <Text style={[styles.qrKey, { fontFamily: MONO }]}>{row.key}</Text>
                  <Ionicons name="arrow-forward-outline" size={11} color={COLORS.textHint} />
                  <Text style={styles.qrDesc}>{row.desc}</Text>
                  <Text style={[styles.qrVal, { fontFamily: MONO, color: row.color }]}>{row.val}</Text>
                </View>
              ))}
              <Text style={[styles.qrRaw, { fontFamily: MONO }]}>{qrString}</Text>
            </View>

            <TouchableOpacity style={styles.btnScan} onPress={() => onQrScan(qrPayload)} activeOpacity={0.8}>
              <Ionicons name="scan-outline" size={18} color="#fff" />
              <Text style={styles.btnScanText}>QR-Code scannen (simulieren)</Text>
            </TouchableOpacity>
            <Text style={styles.qrSimHint}>Füllt in Schritt ② alle Felder automatisch aus</Text>
          </View>
        )}

        {/* Neue Challenge */}
        <TouchableOpacity style={styles.btn} onPress={onNewChallenge} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.accent} />
          <Text style={styles.btnText}>Neue Challenge generieren</Text>
        </TouchableOpacity>

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
    flex: 1,
  },

  // Card header – dark band like MachineScreen
  cardHeader: {
    backgroundColor: COLORS.bgDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeaderLeft: { gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textOnDark },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.bgDarkAlt,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { padding: 14, gap: 12 },

  serialBox: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serialBoxLabel: { fontSize: 10, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 1 },
  serialBoxValue: { fontSize: 26, fontWeight: '900', color: COLORS.primary, letterSpacing: 4 },
  serialBoxHint: { fontSize: 10, color: COLORS.textHint, textAlign: 'center' },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  infoBoxIcon: { marginTop: 2 },
  infoBoxTitle: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  infoBoxText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },
  infoBoxFormula: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  bold: { fontWeight: '700', color: COLORS.text },

  section: { gap: 8 },
  sectionLabel: { fontSize: 10, color: COLORS.textHint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  versionRow: { flexDirection: 'row', gap: 8 },
  versionBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8,
    padding: 10, alignItems: 'center', gap: 2, backgroundColor: COLORS.bgCardAlt,
  },
  versionBtnLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textMuted },
  versionBtnLabelActive: { color: '#fff' },
  versionBtnSub: { fontSize: 9, color: COLORS.textHint, textAlign: 'center' },
  versionBtnSubActive: { color: '#ffffffcc' },
  versionDesc: { borderLeftWidth: 3, paddingLeft: 10, gap: 3 },
  versionDescTitle: { fontSize: 12, fontWeight: '700' },
  versionDescText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },
  versionDescTrunc: { fontSize: 10, fontWeight: '600', fontStyle: 'italic' },

  challengeBox: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  challengeBoxLabel: { fontSize: 10, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 1 },
  challengeValue: { fontSize: 34, fontWeight: '900', color: COLORS.primary, letterSpacing: 6 },

  bitRow: { flexDirection: 'row', gap: 6, width: '100%', alignItems: 'stretch' },
  bitBlock: { flex: 1, borderRadius: 6, padding: 8, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: COLORS.border },
  bitBlockLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  bitBlockVal: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  bitBlockSub: { fontSize: 9, color: COLORS.textHint, textAlign: 'center' },
  bitSep: { alignSelf: 'center' },

  timerRow: { width: '100%', gap: 5 },
  track: { width: '100%', height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center' },
  countdown: { fontSize: 11, fontWeight: '600' },

  qrToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 8,
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrToggleLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },

  qrPanel: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 8,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrPanelTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  qrPanelSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17, textAlign: 'center' },
  qrCodeWrap: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrContent: { backgroundColor: COLORS.bgCard, borderRadius: 8, padding: 12, gap: 6 },
  qrContentTitle: { fontSize: 10, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  qrContentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qrKey: { fontSize: 12, fontWeight: '700', color: COLORS.text, width: 14 },
  qrDesc: { fontSize: 11, color: COLORS.textHint, flex: 1 },
  qrVal: { fontSize: 13, fontWeight: '700' },
  qrRaw: {
    fontSize: 10, color: COLORS.textHint,
    backgroundColor: COLORS.bgCardAlt, padding: 8, borderRadius: 6, marginTop: 4,
  },

  btnScan: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnScanText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  qrSimHint: { fontSize: 11, color: COLORS.textHint, textAlign: 'center' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 11,
  },
  btnText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
});
