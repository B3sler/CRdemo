import React from 'react';
import { Platform, StyleSheet, View, Text, TextInput } from 'react-native';
import { StepBadge } from './StepBadge';
import {
  Version,
  VERSION_INFO,
  decodeVersion,
  computeCode,
  computeHmacHex,
  TruncationSteps,
} from '../utils/hmac';
import { COLORS } from '../theme';

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface Props {
  currentChallenge: string;
  enteredChallenge: string;
  onChallengeChange: (v: string) => void;
  secret: string;
  onSecretChange: (v: string) => void;
}

export function ResponsePanel({
  currentChallenge,
  enteredChallenge,
  onChallengeChange,
  secret,
  onSecretChange,
}: Props) {
  const matchesChallenge = enteredChallenge !== '' && enteredChallenge === currentChallenge;
  const mismatch = enteredChallenge !== '' && enteredChallenge !== currentChallenge;

  const detectedVersion: Version = enteredChallenge ? decodeVersion(enteredChallenge) : 1;
  const vInfo = VERSION_INFO[detectedVersion];
  const hmacHex = computeHmacHex(enteredChallenge, secret);
  const { code, steps } = enteredChallenge && secret
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
        Die App kennt den <Text style={styles.bold}>Secret Key</Text> (vorab gespeichert). Sie
        liest die Version aus der Challenge, wählt die passende Truncation-Methode und berechnet
        den Response-Code.
      </Text>

      {/* Eingaben */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>① Challenge eingeben (vom Display abgelesen)</Text>
        <TextInput
          style={[
            styles.input,
            matchesChallenge && styles.inputMatch,
            mismatch && styles.inputMismatch,
          ]}
          value={enteredChallenge}
          onChangeText={onChallengeChange}
          keyboardType="numeric"
          placeholder="z. B. 27508936"
          placeholderTextColor={COLORS.textHint}
          maxLength={12}
        />
        {mismatch && (
          <Text style={styles.hintWrong}>⚠ Stimmt nicht mit der aktuellen Challenge überein</Text>
        )}
        {matchesChallenge && <Text style={styles.hintOk}>✓ Challenge korrekt übernommen</Text>}
      </View>

      {/* Version-Erkennung (sobald etwas eingegeben) */}
      {enteredChallenge.length > 0 && (
        <View style={[styles.versionBadge, { backgroundColor: vInfo.color + '15', borderColor: vInfo.color + '55' }]}>
          <View style={[styles.versionDot, { backgroundColor: vInfo.color }]} />
          <View style={styles.versionBadgeText}>
            <Text style={[styles.versionBadgeLabel, { color: vInfo.color }]}>
              Erkannte Version: {vInfo.label} – {vInfo.name}
            </Text>
            <Text style={styles.versionBadgeDesc}>{vInfo.description}</Text>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>② Secret Key (auf dem Gerät gespeichert)</Text>
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
      {code && steps ? (
        <View style={styles.calcBox}>
          <Text style={styles.calcTitle}>③ Berechnung – Schritt für Schritt</Text>

          {/* Schritt A: Eingabe */}
          <View style={styles.calcStep}>
            <CalcBadge letter="A" color="#1565c0" />
            <View style={styles.calcStepBody}>
              <Text style={styles.calcStepTitle}>HMAC-SHA256 berechnen</Text>
              <View style={styles.formulaRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>Challenge</Text>
                  <Text style={[styles.pillValue, { fontFamily: MONO }]}>{enteredChallenge}</Text>
                </View>
                <Text style={styles.plus}>+</Text>
                <View style={[styles.pill, styles.pillSecret]}>
                  <Text style={styles.pillLabel}>Secret Key</Text>
                  <Text style={[styles.pillValue, { fontFamily: MONO }]}>
                    {secret.length > 14 ? secret.slice(0, 12) + '…' : secret}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <StepArrow label="↓ HMAC-SHA256(Challenge, Secret)" />

          {/* Schritt B: HMAC-Output */}
          <View style={styles.calcStep}>
            <CalcBadge letter="B" color="#6a1b9a" />
            <View style={styles.calcStepBody}>
              <Text style={styles.calcStepTitle}>256-Bit HMAC (64 Hex-Zeichen)</Text>
              <HmacDisplay hmacHex={hmacHex} steps={steps} version={detectedVersion} />
            </View>
          </View>

          <StepArrow label={`↓ Trunkierung (${vInfo.label}: ${vInfo.truncation})`} />

          {/* Schritt C: Truncation (versionsabhängig) */}
          <View style={styles.calcStep}>
            <CalcBadge letter="C" color={vInfo.color} />
            <View style={styles.calcStepBody}>
              <TruncationDetail steps={steps} vInfo={vInfo} />
            </View>
          </View>

          <StepArrow label={`↓ mod ${steps.modulo.toLocaleString('de-DE')}`} />

          {/* Schritt D: Ergebnis */}
          <View style={styles.codeBox}>
            <Text style={[styles.codeLabel, { color: vInfo.color }]}>
              D · Response-Code ({vInfo.digits}-stellig)
            </Text>
            <Text style={[styles.codeValue, { fontFamily: MONO, color: vInfo.color }]}>
              {code}
            </Text>
            <Text style={[styles.codeFormula, { fontFamily: MONO }]}>
              {steps.rawInt.toLocaleString('de-DE')} mod {steps.modulo.toLocaleString('de-DE')} ={' '}
              <Text style={{ fontWeight: '700' }}>{code}</Text>
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Challenge und Secret eingeben → Berechnung erscheint automatisch
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

function HmacDisplay({ hmacHex, steps, version }: { hmacHex: string; steps: TruncationSteps; version: Version }) {
  if (version === 2 && steps.offset !== undefined && steps.offsetSlice) {
    // V2: Offset-Bereich hervorheben
    const hexOffset = steps.offset * 2;
    const before = hmacHex.slice(0, hexOffset);
    const highlighted = hmacHex.slice(hexOffset, hexOffset + 8);
    const after = hmacHex.slice(hexOffset + 8);
    return (
      <Text style={[hmacDisplayStyles.hex, { fontFamily: MONO }]} numberOfLines={2}>
        <Text style={hmacDisplayStyles.normal}>{before}</Text>
        <Text style={[hmacDisplayStyles.highlight, { backgroundColor: '#e1bee7', color: '#6a1b9a' }]}>
          {highlighted}
        </Text>
        <Text style={hmacDisplayStyles.normal}>{after}</Text>
      </Text>
    );
  }
  // V1 & V3: letzte 8 hervorheben
  const vInfo = VERSION_INFO[version];
  return (
    <Text style={[hmacDisplayStyles.hex, { fontFamily: MONO }]} numberOfLines={2}>
      <Text style={hmacDisplayStyles.normal}>{hmacHex.slice(0, -8)}</Text>
      <Text style={[hmacDisplayStyles.highlight, { backgroundColor: '#bbdefb', color: vInfo.color }]}>
        {hmacHex.slice(-8)}
      </Text>
    </Text>
  );
}
const hmacDisplayStyles = StyleSheet.create({
  hex: { fontSize: 11, lineHeight: 18, backgroundColor: '#f3f3f3', padding: 8, borderRadius: 6, width: '100%' },
  normal: { color: COLORS.textMuted },
  highlight: { fontWeight: '800' },
});

function TruncationDetail({ steps, vInfo }: { steps: TruncationSteps; vInfo: VersionInfo }) {
  if (steps.version === 2 && steps.lastByte !== undefined && steps.offset !== undefined && steps.offsetSlice) {
    return (
      <View style={{ gap: 4 }}>
        <Text style={[truncStyles.title, { color: vInfo.color }]}>
          Dynamic Offset (RFC 4226)
        </Text>
        <View style={truncStyles.row}>
          <Text style={truncStyles.key}>Letztes Byte</Text>
          <Text style={[truncStyles.mono, { fontFamily: MONO }]}>0x{steps.lastByte}</Text>
        </View>
        <View style={truncStyles.row}>
          <Text style={truncStyles.key}>Offset</Text>
          <Text style={[truncStyles.mono, { fontFamily: MONO }]}>
            0x{steps.lastByte} & 0x0F = {steps.offset} (Byte {steps.offset})
          </Text>
        </View>
        <View style={truncStyles.row}>
          <Text style={truncStyles.key}>4 Bytes ab Offset</Text>
          <Text style={[truncStyles.mono, { fontFamily: MONO, color: vInfo.color }]}>
            0x{steps.offsetSlice}
          </Text>
        </View>
        <View style={truncStyles.row}>
          <Text style={truncStyles.key}>& 0x7FFFFFFF</Text>
          <Text style={[truncStyles.mono, { fontFamily: MONO }]}>
            {steps.rawInt.toLocaleString('de-DE')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 4 }}>
      <Text style={[truncStyles.title, { color: vInfo.color }]}>
        {steps.version === 3 ? 'Feste Trunkierung (8-stellig)' : 'Feste Trunkierung'}
      </Text>
      <View style={truncStyles.row}>
        <Text style={truncStyles.key}>Letzte 8 Hex</Text>
        <Text style={[truncStyles.mono, { fontFamily: MONO, color: vInfo.color }]}>
          0x{steps.fixedSlice}
        </Text>
      </View>
      <View style={truncStyles.row}>
        <Text style={truncStyles.key}>& 0x7FFFFFFF</Text>
        <Text style={[truncStyles.mono, { fontFamily: MONO }]}>
          {steps.rawInt.toLocaleString('de-DE')}
        </Text>
      </View>
      {steps.version === 3 && (
        <Text style={truncStyles.note}>
          mod 10⁸ statt mod 10⁶ → 8-stelliger Code, 100× höhere Sicherheit
        </Text>
      )}
    </View>
  );
}

interface VersionInfo { label: string; name: string; digits: number; truncation: string; description: string; color: string; }

const truncStyles = StyleSheet.create({
  title: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  key: { fontSize: 10, color: COLORS.textHint },
  mono: { fontSize: 12, fontWeight: '600', color: COLORS.text },
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

  // Versions-Badge
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  versionDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  versionBadgeText: { flex: 1, gap: 2 },
  versionBadgeLabel: { fontSize: 12, fontWeight: '700' },
  versionBadgeDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },

  // Berechnungsbox
  calcBox: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calcTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  calcStep: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  calcStepBody: { flex: 1, gap: 6 },
  calcStepTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  formulaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  pill: {
    backgroundColor: '#e3f0fc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1565c0' + '44',
    gap: 2,
  },
  pillSecret: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '44' },
  pillLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  plus: { fontSize: 18, color: COLORS.textMuted, fontWeight: '300' },

  codeBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: COLORS.primary + '66',
  },
  codeLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700' },
  codeValue: { fontSize: 48, fontWeight: '900', letterSpacing: 8 },
  codeFormula: { fontSize: 11, color: COLORS.textHint, textAlign: 'center' },

  placeholder: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  placeholderText: { color: COLORS.textHint, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
