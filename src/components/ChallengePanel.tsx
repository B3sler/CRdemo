import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { StepBadge } from './StepBadge';
import { Version, VERSION_INFO, challengeBitLayout } from '../utils/hmac';
import { COLORS, CHALLENGE_TTL } from '../theme';

export interface QrPayload {
  s: string;   // serial
  c: string;   // challenge
  v: Version;  // version
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
  challenge,
  timeLeft,
  version,
  serialNumber,
  onVersionChange,
  onNewChallenge,
  onQrScan,
}: Props) {
  const [qrOpen, setQrOpen] = useState(false);

  const pct = (timeLeft / CHALLENGE_TTL) * 100;
  const timerColor =
    timeLeft > 20 ? COLORS.primary : timeLeft > 8 ? COLORS.warning : COLORS.danger;
  const vInfo = VERSION_INFO[version];
  const bits = challengeBitLayout(challenge);

  const qrPayload: QrPayload = { s: serialNumber, c: challenge, v: version };
  const qrString = JSON.stringify(qrPayload);

  return (
    <View style={styles.card}>
      <StepBadge n={1} label="Maschine" />

      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>🏭</Text>
        <Text style={styles.cardTitle}>Challenge erzeugen</Text>
      </View>

      {/* Seriennummer */}
      <View style={styles.serialBox}>
        <Text style={styles.serialBoxLabel}>Maschinenseriennummer</Text>
        <Text style={[styles.serialBoxValue, { fontFamily: MONO }]}>{serialNumber}</Text>
        <Text style={styles.serialBoxHint}>
          Fest mit dieser Maschine verknüpft · wird Teil der HMAC-Nachricht
        </Text>
      </View>

      <View style={styles.serialInfoBox}>
        <Text style={styles.serialInfoTitle}>🔗 Warum die Seriennummer?</Text>
        <Text style={styles.serialInfoText}>
          Die Seriennummer bindet jeden Response-Code an eine{' '}
          <Text style={styles.bold}>konkrete Maschine</Text>. Derselbe Secret Key + dieselbe
          Challenge ergeben auf einer anderen Maschine einen{' '}
          <Text style={styles.bold}>völlig anderen Code</Text> – ein gestohlener Code kann nicht
          auf einem anderen Gerät eingesetzt werden.
        </Text>
        <Text style={styles.serialInfoFormula}>
          Nachricht ={' '}
          <Text style={{ fontFamily: MONO, color: COLORS.primary }}>{serialNumber}</Text>
          {' | '}
          <Text style={{ fontFamily: MONO, color: '#1565c0' }}>{challenge}</Text>
        </Text>
      </View>

      {/* Versionsauswahl */}
      <View style={styles.section}>
        <Text style={styles.label}>Protokoll-Version</Text>
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
                <Text style={[styles.versionBtnName, active && styles.versionBtnNameActive]}>
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
          <View style={[styles.bitBlock, { backgroundColor: vInfo.color + '22', borderColor: vInfo.color + '55' }]}>
            <Text style={[styles.bitBlockLabel, { color: vInfo.color }]}>Bits 3–0</Text>
            <Text style={[styles.bitBlockVal, { fontFamily: MONO, color: vInfo.color }]}>
              {bits.versionBits}
            </Text>
            <Text style={[styles.bitBlockSub, { color: vInfo.color }]}>Version = {version}</Text>
          </View>
          <Text style={styles.bitSep}>|</Text>
          <View style={[styles.bitBlock, { flex: 2, backgroundColor: COLORS.bgCardAlt }]}>
            <Text style={styles.bitBlockLabel}>Bits 31–4</Text>
            <Text style={[styles.bitBlockVal, { fontFamily: MONO, fontSize: 9 }]}>
              {bits.dataBits}
            </Text>
            <Text style={styles.bitBlockSub}>Zufallsdaten</Text>
          </View>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: timerColor }]} />
        </View>
        <Text style={[styles.countdown, { color: timerColor }]}>⏱ Gültig noch {timeLeft} s</Text>
      </View>

      {/* QR-Code-Sektion */}
      <TouchableOpacity
        style={styles.qrToggle}
        onPress={() => setQrOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text style={styles.qrToggleIcon}>{qrOpen ? '▲' : '▼'}</Text>
        <Text style={styles.qrToggleLabel}>
          {qrOpen ? 'QR-Code ausblenden' : '📷 QR-Code anzeigen (alle Infos gebündelt)'}
        </Text>
      </TouchableOpacity>

      {qrOpen && (
        <View style={styles.qrPanel}>
          <Text style={styles.qrPanelTitle}>QR-Code für Techniker-App</Text>
          <Text style={styles.qrPanelSub}>
            Enthält Seriennummer, Challenge und Protokoll-Version – der Techniker scannt diesen
            Code mit seiner App, alle Felder werden automatisch befüllt.
          </Text>

          {/* QR-Code */}
          <View style={styles.qrCodeWrap}>
            <QRCode
              value={qrString}
              size={180}
              color={COLORS.text}
              backgroundColor="#ffffff"
            />
          </View>

          {/* QR-Inhalt anzeigen */}
          <View style={styles.qrContent}>
            <Text style={styles.qrContentTitle}>Kodierter Inhalt (JSON)</Text>
            <View style={styles.qrContentRow}>
              <Text style={styles.qrKey}>s</Text>
              <Text style={styles.qrArrow}>→</Text>
              <Text style={styles.qrDesc}>Seriennummer</Text>
              <Text style={[styles.qrVal, { fontFamily: MONO, color: COLORS.primary }]}>
                {serialNumber}
              </Text>
            </View>
            <View style={styles.qrContentRow}>
              <Text style={styles.qrKey}>c</Text>
              <Text style={styles.qrArrow}>→</Text>
              <Text style={styles.qrDesc}>Challenge</Text>
              <Text style={[styles.qrVal, { fontFamily: MONO, color: '#1565c0' }]}>
                {challenge}
              </Text>
            </View>
            <View style={styles.qrContentRow}>
              <Text style={styles.qrKey}>v</Text>
              <Text style={styles.qrArrow}>→</Text>
              <Text style={styles.qrDesc}>Version</Text>
              <Text style={[styles.qrVal, { fontFamily: MONO, color: vInfo.color }]}>
                {version} ({vInfo.label})
              </Text>
            </View>
            <Text style={[styles.qrRaw, { fontFamily: MONO }]}>{qrString}</Text>
          </View>

          {/* Scan-Simulation */}
          <TouchableOpacity
            style={styles.btnScan}
            onPress={() => onQrScan(qrPayload)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnScanText}>📷 QR-Code scannen (simulieren)</Text>
          </TouchableOpacity>
          <Text style={styles.qrSimHint}>
            Füllt in Schritt ② alle Felder automatisch aus
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={onNewChallenge} activeOpacity={0.8}>
        <Text style={styles.btnText}>🎲 Neue Challenge generieren</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
    gap: 14,
    flex: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  bold: { fontWeight: '700', color: COLORS.text },

  serialBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '66',
  },
  serialBoxLabel: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  serialBoxValue: { fontSize: 28, fontWeight: '900', color: COLORS.primary, letterSpacing: 4 },
  serialBoxHint: { fontSize: 10, color: COLORS.textHint, textAlign: 'center' },

  serialInfoBox: {
    backgroundColor: COLORS.primary + '0e',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  serialInfoTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  serialInfoText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 18 },
  serialInfoFormula: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },

  section: { gap: 8 },
  label: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },

  versionRow: { flexDirection: 'row', gap: 8 },
  versionBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10,
    padding: 10, alignItems: 'center', gap: 2, backgroundColor: COLORS.bgCardAlt,
  },
  versionBtnLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textMuted },
  versionBtnLabelActive: { color: '#fff' },
  versionBtnName: { fontSize: 9, color: COLORS.textHint, textAlign: 'center' },
  versionBtnNameActive: { color: '#ffffffcc' },
  versionDesc: { borderLeftWidth: 3, paddingLeft: 10, gap: 3 },
  versionDescTitle: { fontSize: 12, fontWeight: '700' },
  versionDescText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },
  versionDescTrunc: { fontSize: 10, fontWeight: '600', fontStyle: 'italic' },

  challengeBox: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 12, padding: 14, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  challengeBoxLabel: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  challengeValue: { fontSize: 36, fontWeight: '900', color: '#1565c0', letterSpacing: 6 },

  bitRow: { flexDirection: 'row', gap: 6, width: '100%', alignItems: 'stretch' },
  bitBlock: { flex: 1, borderRadius: 8, padding: 8, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: COLORS.border },
  bitBlockLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  bitBlockVal: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  bitBlockSub: { fontSize: 9, color: COLORS.textHint, textAlign: 'center' },
  bitSep: { fontSize: 18, color: COLORS.border, alignSelf: 'center' },

  track: { width: '100%', height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  countdown: { fontSize: 11, fontWeight: '600' },

  // QR Toggle
  qrToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrToggleIcon: { fontSize: 11, color: COLORS.textHint },
  qrToggleLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },

  // QR Panel
  qrPanel: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
  },
  qrPanelTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  qrPanelSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17, textAlign: 'center' },

  qrCodeWrap: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // QR Inhalt
  qrContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  qrContentTitle: { fontSize: 10, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  qrContentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qrKey: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '700', color: COLORS.text, width: 14 },
  qrArrow: { fontSize: 11, color: COLORS.textHint },
  qrDesc: { fontSize: 11, color: COLORS.textHint, flex: 1 },
  qrVal: { fontSize: 13, fontWeight: '700' },
  qrRaw: {
    fontSize: 10,
    color: COLORS.textHint,
    backgroundColor: COLORS.bgCardAlt,
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },

  // Scan-Button
  btnScan: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnScanText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  qrSimHint: { fontSize: 11, color: COLORS.textHint, textAlign: 'center' },

  btn: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  btnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
