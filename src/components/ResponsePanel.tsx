import React from 'react';
import { Platform, StyleSheet, View, Text, TextInput } from 'react-native';
import { StepBadge } from './StepBadge';
import {
  Version,
  VERSION_INFO,
  decodeVersion,
  computeCode,
  computeHmacHex,
  buildMessage,
  TruncationSteps,
} from '../utils/hmac';
import { COLORS } from '../theme';

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface Props {
  currentChallenge: string;
  enteredChallenge: string;
  onChallengeChange: (v: string) => void;
  correctSerial: string;
  enteredSerial: string;
  onSerialChange: (v: string) => void;
  secret: string;
  onSecretChange: (v: string) => void;
  qrScanned?: boolean;
}

export function ResponsePanel({
  currentChallenge,
  enteredChallenge,
  onChallengeChange,
  correctSerial,
  enteredSerial,
  onSerialChange,
  secret,
  onSecretChange,
  qrScanned = false,
}: Props) {
  const challengeMatch = enteredChallenge !== '' && enteredChallenge === currentChallenge;
  const challengeMismatch = enteredChallenge !== '' && enteredChallenge !== currentChallenge;
  const serialMatch = enteredSerial !== '' && enteredSerial === correctSerial;
  const serialMismatch = enteredSerial !== '' && enteredSerial !== correctSerial;

  const detectedVersion: Version = enteredChallenge ? decodeVersion(enteredChallenge) : 1;
  const vInfo = VERSION_INFO[detectedVersion];

  const bothEntered = !!enteredChallenge && !!enteredSerial && !!secret;
  const message = buildMessage(enteredChallenge, enteredSerial);
  const hmacHex = bothEntered ? computeHmacHex(enteredChallenge, secret, enteredSerial) : '';
  const { code, steps } = hmacHex
    ? computeCode(hmacHex, detectedVersion)
    : { code: '', steps: null };

  return (
    <View style={styles.card}>
      <StepBadge n={2} label="Mobiles Gerät" />

      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>📱</Text>
        <Text style={styles.cardTitle}>Response berechnen</Text>
      </View>

      <Text style={styles.hint}>
        Die App kennt den <Text style={styles.bold}>Secret Key</Text>. Techniker gibt
        Seriennummer und Challenge ein – aus beiden zusammen wird der HMAC berechnet.
      </Text>

      {/* QR-Scan-Banner */}
      {qrScanned && (
        <View style={styles.qrBanner}>
          <Text style={styles.qrBannerIcon}>📷</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.qrBannerTitle}>Via QR-Code eingescannt</Text>
            <Text style={styles.qrBannerSub}>
              Seriennummer, Challenge und Version wurden automatisch übernommen
            </Text>
          </View>
        </View>
      )}

      {/* ① Seriennummer */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>① Seriennummer (vom Maschinendisplay ablesen)</Text>
        <TextInput
          style={[styles.input, serialMatch && styles.inputMatch, serialMismatch && styles.inputMismatch]}
          value={enteredSerial}
          onChangeText={onSerialChange}
          placeholder="z. B. JB12_4823"
          placeholderTextColor={COLORS.textHint}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {serialMismatch && <Text style={styles.hintWrong}>⚠ Falsche Seriennummer – Code wird ungültig sein</Text>}
        {serialMatch && <Text style={styles.hintOk}>✓ Seriennummer korrekt</Text>}
      </View>

      {/* ② Challenge */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>② Challenge eingeben (vom Display ablesen)</Text>
        <TextInput
          style={[styles.input, challengeMatch && styles.inputMatch, challengeMismatch && styles.inputMismatch]}
          value={enteredChallenge}
          onChangeText={onChallengeChange}
          keyboardType="numeric"
          placeholder="z. B. 8337"
          placeholderTextColor={COLORS.textHint}
          maxLength={12}
        />
        {challengeMismatch && <Text style={styles.hintWrong}>⚠ Stimmt nicht mit der aktuellen Challenge überein</Text>}
        {challengeMatch && <Text style={styles.hintOk}>✓ Challenge korrekt übernommen</Text>}
      </View>

      {/* Versions-Badge */}
      {enteredChallenge.length > 0 && (
        <View style={[styles.versionBadge, { backgroundColor: vInfo.color + '15', borderColor: vInfo.color + '55' }]}>
          <View style={[styles.versionDot, { backgroundColor: vInfo.color }]} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.versionBadgeLabel, { color: vInfo.color }]}>
              Erkannte Version: {vInfo.label} – {vInfo.name}
            </Text>
            <Text style={styles.versionBadgeDesc}>{vInfo.description}</Text>
          </View>
        </View>
      )}

      {/* ③ Secret Key */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>③ Secret Key (auf dem Gerät gespeichert)</Text>
        <TextInput
          style={styles.input}
          value={secret}
          onChangeText={onSecretChange}
          placeholder="Geheimen Schlüssel eingeben"
          placeholderTextColor={COLORS.textHint}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Berechnungsschritte */}
      {bothEntered ? (
        <View style={styles.calcBox}>
          <Text style={styles.calcTitle}>④ Berechnung – Schritt für Schritt</Text>

          {/* A: Nachricht zusammenbauen */}
          <View style={styles.calcStep}>
            <CalcBadge letter="A" color={COLORS.primary} />
            <View style={styles.calcBody}>
              <Text style={styles.calcStepTitle}>Nachricht zusammensetzen</Text>
              <View style={styles.messageRow}>
                <View style={[styles.pill, styles.pillSerial]}>
                  <Text style={styles.pillLabel}>Seriennummer</Text>
                  <Text style={[styles.pillValue, { fontFamily: MONO, color: COLORS.primary }]}>
                    {enteredSerial || '—'}
                  </Text>
                </View>
                <Text style={styles.plus}>|</Text>
                <View style={[styles.pill, styles.pillChallenge]}>
                  <Text style={styles.pillLabel}>Challenge</Text>
                  <Text style={[styles.pillValue, { fontFamily: MONO, color: '#1565c0' }]}>
                    {enteredChallenge || '—'}
                  </Text>
                </View>
              </View>
              <View style={styles.messageResult}>
                <Text style={styles.messageResultLabel}>→ Nachricht:</Text>
                <Text style={[styles.messageResultValue, { fontFamily: MONO }]}>{message}</Text>
              </View>
              <Text style={styles.calcNote}>
                Durch die Seriennummer ist der Code an diese Maschine gebunden
              </Text>
            </View>
          </View>

          <StepArrow label="↓ HMAC-SHA256(Nachricht, Secret)" />

          {/* B: HMAC-Output */}
          <View style={styles.calcStep}>
            <CalcBadge letter="B" color="#6a1b9a" />
            <View style={styles.calcBody}>
              <Text style={styles.calcStepTitle}>256-Bit HMAC (64 Hex-Zeichen)</Text>
              <HmacDisplay hmacHex={hmacHex} steps={steps} version={detectedVersion} vInfo={vInfo} />
            </View>
          </View>

          <StepArrow label={`↓ Trunkierung (${vInfo.label}: ${vInfo.truncation})`} />

          {/* C: Truncation */}
          <View style={styles.calcStep}>
            <CalcBadge letter="C" color={vInfo.color} />
            <View style={styles.calcBody}>
              <TruncationDetail steps={steps!} vInfo={vInfo} />
            </View>
          </View>

          <StepArrow label={`↓ mod ${steps!.modulo.toLocaleString('de-DE')}`} />

          {/* D: Ergebnis */}
          <View style={[styles.codeBox, { borderColor: vInfo.color + '66' }]}>
            <Text style={[styles.codeLabel, { color: vInfo.color }]}>
              D · Response-Code ({vInfo.digits}-stellig)
            </Text>
            <Text style={[styles.codeValue, { fontFamily: MONO, color: vInfo.color }]}>{code}</Text>
            <Text style={[styles.codeFormula, { fontFamily: MONO }]}>
              {steps!.rawInt.toLocaleString('de-DE')} mod {steps!.modulo.toLocaleString('de-DE')} ={' '}
              <Text style={{ fontWeight: '700' }}>{code}</Text>
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Seriennummer, Challenge und Secret eingeben → Berechnung erscheint automatisch
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Hilfs-Komponenten ────────────────────────────────────────────────────────

function CalcBadge({ letter, color }: { letter: string; color: string }) {
  return (
    <View style={[calcBadgeStyles.circle, { backgroundColor: color }]}>
      <Text style={calcBadgeStyles.text}>{letter}</Text>
    </View>
  );
}
const calcBadgeStyles = StyleSheet.create({
  circle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  text: { color: '#fff', fontWeight: '800', fontSize: 11 },
});

function StepArrow({ label }: { label: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 2 }}>
      <Text style={{ fontSize: 10, color: COLORS.textHint, fontStyle: 'italic', fontFamily: MONO }}>{label}</Text>
    </View>
  );
}

function HmacDisplay({
  hmacHex,
  steps,
  version,
  vInfo,
}: {
  hmacHex: string;
  steps: TruncationSteps | null;
  version: Version;
  vInfo: { color: string };
}) {
  if (version === 2 && steps?.offset !== undefined && steps?.offsetSlice) {
    const hexOffset = steps.offset * 2;
    return (
      <Text style={[hmacStyles.hex, { fontFamily: MONO }]} numberOfLines={2}>
        <Text style={hmacStyles.normal}>{hmacHex.slice(0, hexOffset)}</Text>
        <Text style={[hmacStyles.highlight, { backgroundColor: '#e1bee7', color: '#6a1b9a' }]}>
          {hmacHex.slice(hexOffset, hexOffset + 8)}
        </Text>
        <Text style={hmacStyles.normal}>{hmacHex.slice(hexOffset + 8)}</Text>
      </Text>
    );
  }
  return (
    <Text style={[hmacStyles.hex, { fontFamily: MONO }]} numberOfLines={2}>
      <Text style={hmacStyles.normal}>{hmacHex.slice(0, -8)}</Text>
      <Text style={[hmacStyles.highlight, { backgroundColor: '#bbdefb', color: vInfo.color }]}>
        {hmacHex.slice(-8)}
      </Text>
    </Text>
  );
}
const hmacStyles = StyleSheet.create({
  hex: { fontSize: 11, lineHeight: 18, backgroundColor: '#f3f3f3', padding: 8, borderRadius: 6, width: '100%' },
  normal: { color: COLORS.textMuted },
  highlight: { fontWeight: '800' },
});

interface VInfo { label: string; name: string; digits: number; truncation: string; description: string; color: string }

function TruncationDetail({ steps, vInfo }: { steps: TruncationSteps; vInfo: VInfo }) {
  if (steps.version === 2 && steps.lastByte !== undefined && steps.offset !== undefined) {
    return (
      <View style={{ gap: 4 }}>
        <Text style={[truncStyles.title, { color: vInfo.color }]}>Dynamic Offset (RFC 4226)</Text>
        <Row label="Letztes Byte" value={`0x${steps.lastByte}`} />
        <Row label="Offset" value={`0x${steps.lastByte} & 0x0F = ${steps.offset} (Byte ${steps.offset})`} />
        <Row label="4 Bytes ab Offset" value={`0x${steps.offsetSlice}`} color={vInfo.color} />
        <Row label="& 0x7FFFFFFF" value={steps.rawInt.toLocaleString('de-DE')} />
      </View>
    );
  }
  return (
    <View style={{ gap: 4 }}>
      <Text style={[truncStyles.title, { color: vInfo.color }]}>Feste Trunkierung (letzte 4 Bytes)</Text>
      <Row label="Letzte 8 Hex" value={`0x${steps.fixedSlice}`} color={vInfo.color} />
      <Row label="& 0x7FFFFFFF" value={steps.rawInt.toLocaleString('de-DE')} />
      {steps.version === 3 && (
        <Text style={truncStyles.note}>mod 10⁸ → 8-stelliger Code, 100× höhere Entropie als V2</Text>
      )}
    </View>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={truncStyles.row}>
      <Text style={truncStyles.key}>{label}</Text>
      <Text style={[truncStyles.val, { fontFamily: MONO, color: color ?? COLORS.text }]}>{value}</Text>
    </View>
  );
}

const truncStyles = StyleSheet.create({
  title: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  key: { fontSize: 10, color: COLORS.textHint },
  val: { fontSize: 12, fontWeight: '600' },
  note: { fontSize: 10, color: COLORS.textHint, fontStyle: 'italic', marginTop: 2 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    borderTopColor: '#1565c0',
    gap: 14,
    flex: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  hint: { fontSize: 12, color: COLORS.textMuted, lineHeight: 19 },
  bold: { fontWeight: '700', color: COLORS.text },
  inputGroup: { gap: 6 },
  label: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: COLORS.bgCardAlt,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: MONO,
  },
  inputMatch: { borderColor: COLORS.primary },
  inputMismatch: { borderColor: COLORS.warning },
  hintOk: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  hintWrong: { fontSize: 11, color: COLORS.warning, fontWeight: '600' },

  versionBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 10, padding: 10, borderWidth: 1 },
  versionDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  versionBadgeLabel: { fontSize: 12, fontWeight: '700' },
  versionBadgeDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },

  calcBox: { backgroundColor: COLORS.bgCardAlt, borderRadius: 12, padding: 14, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  calcTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  calcStep: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  calcBody: { flex: 1, gap: 6 },
  calcStepTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  calcNote: { fontSize: 10, color: COLORS.textHint, fontStyle: 'italic' },

  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  messageResult: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  messageResultLabel: { fontSize: 11, color: COLORS.textHint },
  messageResultValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },

  pill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, gap: 2 },
  pillSerial: { backgroundColor: '#e8f5e9', borderColor: COLORS.primary + '44' },
  pillChallenge: { backgroundColor: '#e3f0fc', borderColor: '#1565c0' + '44' },
  pillLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillValue: { fontSize: 13, fontWeight: '600' },
  plus: { fontSize: 20, color: COLORS.textMuted, fontWeight: '300' },

  codeBox: { backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 14, alignItems: 'center', gap: 6, borderWidth: 2 },
  codeLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700' },
  codeValue: { fontSize: 48, fontWeight: '900', letterSpacing: 8 },
  codeFormula: { fontSize: 11, color: COLORS.textHint, textAlign: 'center' },

  placeholder: { backgroundColor: COLORS.bgCardAlt, borderRadius: 10, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  placeholderText: { color: COLORS.textHint, fontSize: 12, textAlign: 'center', lineHeight: 18 },

  qrBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary + '12',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
  },
  qrBannerIcon: { fontSize: 22 },
  qrBannerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  qrBannerSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16, marginTop: 1 },
});
