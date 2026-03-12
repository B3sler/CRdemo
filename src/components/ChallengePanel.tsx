import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { StepBadge } from './StepBadge';
import { Version, VERSION_INFO, challengeBitLayout, CHALLENGE_TTL } from '../utils/hmac';
import { COLORS } from '../theme';

interface Props {
  challenge: string;
  timeLeft: number;
  version: Version;
  onVersionChange: (v: Version) => void;
  onNewChallenge: () => void;
}

const VERSIONS: Version[] = [1, 2, 3];

export function ChallengePanel({
  challenge,
  timeLeft,
  version,
  onVersionChange,
  onNewChallenge,
}: Props) {
  const pct = (timeLeft / CHALLENGE_TTL) * 100;
  const timerColor =
    timeLeft > 20 ? COLORS.primary : timeLeft > 8 ? COLORS.warning : COLORS.danger;
  const vInfo = VERSION_INFO[version];
  const bits = challengeBitLayout(challenge);

  return (
    <View style={styles.card}>
      <StepBadge n={1} label="Maschine" />

      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>🏭</Text>
        <Text style={styles.cardTitle}>Challenge erzeugen</Text>
      </View>

      {/* Versionsauswahl */}
      <View style={styles.section}>
        <Text style={styles.label}>Protokoll-Version wählen</Text>
        <View style={styles.versionRow}>
          {VERSIONS.map((v) => {
            const info = VERSION_INFO[v];
            const active = v === version;
            return (
              <TouchableOpacity
                key={v}
                style={[
                  styles.versionBtn,
                  active && { backgroundColor: info.color, borderColor: info.color },
                ]}
                onPress={() => onVersionChange(v)}
                activeOpacity={0.8}
              >
                <Text style={[styles.versionBtnLabel, active && styles.versionBtnLabelActive]}>
                  {info.label}
                </Text>
                <Text style={[styles.versionBtnName, active && styles.versionBtnNameActive]}>
                  {info.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Beschreibung der gewählten Version */}
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
        <Text style={[styles.challengeValue, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>
          {challenge}
        </Text>

        {/* Bit-Layout-Visualisierung */}
        <View style={styles.bitRow}>
          <View style={[styles.bitBlock, { backgroundColor: vInfo.color + '22', borderColor: vInfo.color + '66' }]}>
            <Text style={[styles.bitBlockLabel, { color: vInfo.color }]}>Bits 27–24</Text>
            <Text style={[styles.bitBlockVal, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: vInfo.color }]}>
              {bits.versionBits}
            </Text>
            <Text style={[styles.bitBlockSub, { color: vInfo.color }]}>Version = {version}</Text>
          </View>
          <Text style={styles.bitSep}>|</Text>
          <View style={[styles.bitBlock, { flex: 2, backgroundColor: COLORS.bgCardAlt }]}>
            <Text style={styles.bitBlockLabel}>Bits 23–0</Text>
            <Text style={[styles.bitBlockVal, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 9 }]}>
              {bits.dataBits}
            </Text>
            <Text style={styles.bitBlockSub}>Zufallsdaten (24 bit)</Text>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: timerColor }]} />
        </View>
        <Text style={[styles.countdown, { color: timerColor }]}>
          ⏱ Gültig noch {timeLeft} s
        </Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onNewChallenge} activeOpacity={0.8}>
        <Text style={styles.btnText}>🎲 Neue Challenge generieren</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Warum eine zufällige Challenge?</Text>
        <Text style={styles.infoText}>
          • Jede Sitzung erzeugt einen anderen HMAC-Output{'\n'}
          • Abgefangene Codes sind nicht wiederverwendbar{'\n'}
          • Zeitlimit (60 s) verhindert zeitverzögerte Replay-Angriffe
        </Text>
      </View>
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
  section: { gap: 8 },
  label: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Versions-Buttons
  versionRow: { flexDirection: 'row', gap: 8 },
  versionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.bgCardAlt,
  },
  versionBtnLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textMuted },
  versionBtnLabelActive: { color: '#fff' },
  versionBtnName: { fontSize: 9, color: COLORS.textHint, textAlign: 'center' },
  versionBtnNameActive: { color: '#fff' + 'cc' },

  // Versions-Beschreibung
  versionDesc: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 10,
    gap: 3,
  },
  versionDescTitle: { fontSize: 12, fontWeight: '700' },
  versionDescText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },
  versionDescTrunc: { fontSize: 10, fontWeight: '600', fontStyle: 'italic' },

  // Challenge-Box
  challengeBox: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  challengeBoxLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  challengeValue: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 6,
  },

  // Bit-Layout
  bitRow: { flexDirection: 'row', gap: 6, width: '100%', alignItems: 'stretch' },
  bitBlock: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bitBlockLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  bitBlockVal: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  bitBlockSub: { fontSize: 9, color: COLORS.textHint, textAlign: 'center' },
  bitSep: { fontSize: 18, color: COLORS.border, alignSelf: 'center' },

  // Countdown
  track: {
    width: '100%', height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden',
  },
  fill: { height: 5, borderRadius: 3 },
  countdown: { fontSize: 11, fontWeight: '600' },

  btn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },

  infoBox: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoTitle: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  infoText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 18 },
});
