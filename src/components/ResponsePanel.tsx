import React from 'react';
import { Platform, StyleSheet, View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StepBadge } from './StepBadge';
import {
  Version, VERSION_INFO, decodeVersion, computeCode,
  computeHmacHex, buildMessage, TruncationSteps,
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
  currentChallenge, enteredChallenge, onChallengeChange,
  correctSerial, enteredSerial, onSerialChange,
  secret, onSecretChange, qrScanned = false,
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
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <StepBadge n={2} label="Mobiles Gerät" />
          <Text style={styles.cardTitle}>Response berechnen</Text>
        </View>
        <View style={styles.cardHeaderIcon}>
          <Ionicons name="phone-portrait-outline" size={20} color={COLORS.textOnDarkMuted} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>
          Die App kennt den <Text style={styles.bold}>Secret Key</Text>. Techniker gibt
          Seriennummer und Challenge ein – aus beiden wird der HMAC berechnet.
        </Text>

        {/* QR-Scan-Banner */}
        {qrScanned && (
          <View style={styles.qrBanner}>
            <Ionicons name="scan-outline" size={20} color={COLORS.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.qrBannerTitle}>Via QR-Code eingescannt</Text>
              <Text style={styles.qrBannerSub}>
                Seriennummer, Challenge und Version automatisch übernommen
              </Text>
            </View>
          </View>
        )}

        {/* ① Seriennummer */}
        <InputField
          label="① Seriennummer (vom Maschinendisplay)"
          value={enteredSerial}
          onChangeText={onSerialChange}
          placeholder="z. B. JB12_4823"
          match={serialMatch}
          mismatch={serialMismatch}
          matchHint="Seriennummer korrekt"
          mismatchHint="Falsche Seriennummer – Code wird ungültig sein"
        />

        {/* ② Challenge */}
        <InputField
          label="② Challenge (vom Display ablesen)"
          value={enteredChallenge}
          onChangeText={onChallengeChange}
          placeholder="z. B. 8337"
          keyboardType="numeric"
          maxLength={12}
          match={challengeMatch}
          mismatch={challengeMismatch}
          matchHint="Challenge korrekt übernommen"
          mismatchHint="Stimmt nicht mit der aktuellen Challenge überein"
        />

        {/* Versions-Badge */}
        {enteredChallenge.length > 0 && (
          <View style={[styles.versionBadge, { backgroundColor: vInfo.color + '14', borderColor: vInfo.color + '50' }]}>
            <View style={[styles.versionDot, { backgroundColor: vInfo.color }]} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.versionBadgeLabel, { color: vInfo.color }]}>
                Version: {vInfo.label} – {vInfo.name}
              </Text>
              <Text style={styles.versionBadgeDesc}>{vInfo.description}</Text>
            </View>
          </View>
        )}

        {/* ③ Secret Key */}
        <InputField
          label="③ Secret Key (auf dem Gerät gespeichert)"
          value={secret}
          onChangeText={onSecretChange}
          placeholder="Geheimen Schlüssel eingeben"
        />

        {/* Berechnungsschritte */}
        {bothEntered ? (
          <View style={styles.calcBox}>
            <Text style={styles.calcTitle}>④ Berechnung – Schritt für Schritt</Text>

            <View style={styles.calcStep}>
              <CalcBadge letter="A" color={COLORS.accent} />
              <View style={styles.calcBody}>
                <Text style={styles.calcStepTitle}>Nachricht zusammensetzen</Text>
                <View style={styles.messageRow}>
                  <View style={[styles.pill, styles.pillSerial]}>
                    <Text style={styles.pillLabel}>Seriennummer</Text>
                    <Text style={[styles.pillValue, { fontFamily: MONO, color: COLORS.accent }]}>
                      {enteredSerial || '—'}
                    </Text>
                  </View>
                  <Text style={styles.plus}>|</Text>
                  <View style={[styles.pill, styles.pillChallenge]}>
                    <Text style={styles.pillLabel}>Challenge</Text>
                    <Text style={[styles.pillValue, { fontFamily: MONO, color: COLORS.primary }]}>
                      {enteredChallenge || '—'}
                    </Text>
                  </View>
                </View>
                <View style={styles.messageResult}>
                  <Text style={styles.messageResultLabel}>→ Nachricht:</Text>
                  <Text style={[styles.messageResultValue, { fontFamily: MONO }]}>{message}</Text>
                </View>
              </View>
            </View>

            <StepArrow label={`↓ HMAC-SHA256(Nachricht, Secret)`} />

            <View style={styles.calcStep}>
              <CalcBadge letter="B" color="#6a1b9a" />
              <View style={styles.calcBody}>
                <Text style={styles.calcStepTitle}>256-Bit HMAC (64 Hex-Zeichen)</Text>
                <HmacDisplay hmacHex={hmacHex} steps={steps} version={detectedVersion} vInfo={vInfo} />
              </View>
            </View>

            <StepArrow label={`↓ Trunkierung (${vInfo.label}: ${vInfo.truncation})`} />

            <View style={styles.calcStep}>
              <CalcBadge letter="C" color={vInfo.color} />
              <View style={styles.calcBody}>
                <TruncationDetail steps={steps!} vInfo={vInfo} />
              </View>
            </View>

            <StepArrow label={`↓ mod ${steps!.modulo.toLocaleString('de-DE')}`} />

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
            <Ionicons name="calculator-outline" size={24} color={COLORS.textHint} />
            <Text style={styles.placeholderText}>
              Seriennummer, Challenge und Secret eingeben → Berechnung erscheint automatisch
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function InputField({
  label, value, onChangeText, placeholder,
  keyboardType, maxLength, match, mismatch, matchHint, mismatchHint,
}: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder: string;
  keyboardType?: any; maxLength?: number;
  match?: boolean; mismatch?: boolean; matchHint?: string; mismatchHint?: string;
}) {
  return (
    <View style={inputStyles.group}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={[inputStyles.wrap, match && inputStyles.wrapMatch, mismatch && inputStyles.wrapMismatch]}>
        <TextInput
          style={[inputStyles.input, { fontFamily: MONO }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textHint}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {match && <Ionicons name="checkmark-circle" size={18} color={COLORS.success} style={inputStyles.icon} />}
        {mismatch && <Ionicons name="alert-circle-outline" size={18} color={COLORS.warning} style={inputStyles.icon} />}
      </View>
      {mismatch && mismatchHint && <Text style={inputStyles.hintWrong}>{mismatchHint}</Text>}
      {match && matchHint && <Text style={inputStyles.hintOk}>{matchHint}</Text>}
    </View>
  );
}
const inputStyles = StyleSheet.create({
  group: { gap: 5 },
  label: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.7 },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCardAlt,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingRight: 10,
  },
  wrapMatch: { borderColor: COLORS.success },
  wrapMismatch: { borderColor: COLORS.warning },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: COLORS.text,
    fontSize: 14,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  icon: {},
  hintOk: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
  hintWrong: { fontSize: 11, color: COLORS.warning, fontWeight: '600' },
});

// ─── Hilfs-Komponenten ─────────────────────────────────────────────────────────
function CalcBadge({ letter, color }: { letter: string; color: string }) {
  return (
    <View style={[cbStyles.circle, { backgroundColor: color }]}>
      <Text style={cbStyles.text}>{letter}</Text>
    </View>
  );
}
const cbStyles = StyleSheet.create({
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

function HmacDisplay({ hmacHex, steps, version, vInfo }: {
  hmacHex: string; steps: TruncationSteps | null; version: Version; vInfo: { color: string };
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
      <Text style={[hmacStyles.highlight, { backgroundColor: '#dbeafe', color: vInfo.color }]}>
        {hmacHex.slice(-8)}
      </Text>
    </Text>
  );
}
const hmacStyles = StyleSheet.create({
  hex: { fontSize: 11, lineHeight: 18, backgroundColor: COLORS.bgCardAlt, padding: 8, borderRadius: 6, width: '100%' },
  normal: { color: COLORS.textMuted },
  highlight: { fontWeight: '800' },
});

interface VInfo { label: string; name: string; digits: number; truncation: string; description: string; color: string }

function TruncationDetail({ steps, vInfo }: { steps: TruncationSteps; vInfo: VInfo }) {
  if (steps.version === 2 && steps.lastByte !== undefined && steps.offset !== undefined) {
    return (
      <View style={{ gap: 4 }}>
        <Text style={[truncStyles.title, { color: vInfo.color }]}>Dynamic Offset (RFC 4226)</Text>
        <TRow label="Letztes Byte" value={`0x${steps.lastByte}`} />
        <TRow label="Offset" value={`0x${steps.lastByte} & 0x0F = ${steps.offset} (Byte ${steps.offset})`} />
        <TRow label="4 Bytes ab Offset" value={`0x${steps.offsetSlice}`} color={vInfo.color} />
        <TRow label="& 0x7FFFFFFF" value={steps.rawInt.toLocaleString('de-DE')} />
      </View>
    );
  }
  return (
    <View style={{ gap: 4 }}>
      <Text style={[truncStyles.title, { color: vInfo.color }]}>Feste Trunkierung (letzte 4 Bytes)</Text>
      <TRow label="Letzte 8 Hex" value={`0x${steps.fixedSlice}`} color={vInfo.color} />
      <TRow label="& 0x7FFFFFFF" value={steps.rawInt.toLocaleString('de-DE')} />
      {steps.version === 3 && (
        <Text style={truncStyles.note}>mod 10⁸ → 8-stelliger Code, 100× höhere Entropie</Text>
      )}
    </View>
  );
}
function TRow({ label, value, color }: { label: string; value: string; color?: string }) {
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

// ─── Main styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    flex: 1,
  },
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
    width: 36, height: 36,
    backgroundColor: COLORS.bgDarkAlt,
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 14, gap: 12 },
  hint: { fontSize: 12, color: COLORS.textMuted, lineHeight: 19 },
  bold: { fontWeight: '700', color: COLORS.text },

  qrBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.accent + '12',
    borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  qrBannerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  qrBannerSub: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16, marginTop: 1 },

  versionBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 8, padding: 10, borderWidth: 1 },
  versionDot: { width: 9, height: 9, borderRadius: 5, marginTop: 3 },
  versionBadgeLabel: { fontSize: 12, fontWeight: '700' },
  versionBadgeDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },

  calcBox: { backgroundColor: COLORS.bgCardAlt, borderRadius: 8, padding: 14, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  calcTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  calcStep: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  calcBody: { flex: 1, gap: 6 },
  calcStepTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text },

  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  messageResult: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  messageResultLabel: { fontSize: 11, color: COLORS.textHint },
  messageResultValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, backgroundColor: COLORS.bgCard, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },

  pill: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, gap: 2 },
  pillSerial: { backgroundColor: COLORS.bgCardAlt, borderColor: COLORS.accent + '44' },
  pillChallenge: { backgroundColor: COLORS.bgCardAlt, borderColor: COLORS.primary + '44' },
  pillLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillValue: { fontSize: 13, fontWeight: '600' },
  plus: { fontSize: 18, color: COLORS.textMuted, fontWeight: '300' },

  codeBox: { backgroundColor: COLORS.bgCard, borderRadius: 8, padding: 14, alignItems: 'center', gap: 6, borderWidth: 2 },
  codeLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700' },
  codeValue: { fontSize: 46, fontWeight: '900', letterSpacing: 8 },
  codeFormula: { fontSize: 11, color: COLORS.textHint, textAlign: 'center' },

  placeholder: { backgroundColor: COLORS.bgCardAlt, borderRadius: 8, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  placeholderText: { color: COLORS.textHint, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
