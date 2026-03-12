import React from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { StepBadge } from './StepBadge';
import { computeHmacHex, computeCode, decodeVersion, VERSION_INFO } from '../utils/hmac';
import { COLORS } from '../theme';

export type AuthStatus = 'idle' | 'success' | 'failure';

interface Props {
  responseInput: string;
  onResponseChange: (v: string) => void;
  authStatus: AuthStatus;
  onVerify: () => void;
  challenge: string;
  secret: string;
}

export function VerifyPanel({
  responseInput,
  onResponseChange,
  authStatus,
  onVerify,
  challenge,
  secret,
}: Props) {
  const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
  const disabled = responseInput.length < 6;

  const version = decodeVersion(challenge);
  const vInfo = VERSION_INFO[version];
  const hmacHex = computeHmacHex(challenge, secret);
  const { code: expectedCode } = computeCode(hmacHex, version);

  const inputComplete = responseInput.length === vInfo.digits;

  return (
    <View
      style={[
        styles.card,
        authStatus === 'success' && styles.cardSuccess,
        authStatus === 'failure' && styles.cardFailure,
      ]}
    >
      <StepBadge n={3} label="Maschine" />

      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>🔐</Text>
        <Text style={styles.cardTitle}>Verifizieren</Text>
      </View>

      <Text style={styles.hint}>
        Die Maschine berechnet den erwarteten Code{' '}
        <Text style={styles.bold}>intern</Text> (gleicher HMAC + gleiche Version) und
        vergleicht ihn mit der Eingabe des Technikers. Kein Netzwerk, kein Code-Transfer.
      </Text>

      {/* Interne Berechnung der Maschine */}
      <View style={styles.internalBox}>
        <Text style={styles.internalTitle}>Interne Berechnung der Maschine</Text>

        <View style={styles.internalRow}>
          <Text style={styles.internalKey}>Challenge</Text>
          <Text style={[styles.internalVal, { fontFamily: MONO }]}>{challenge}</Text>
        </View>
        <View style={styles.internalRow}>
          <Text style={styles.internalKey}>Erkannte Version</Text>
          <View style={[styles.versionTag, { backgroundColor: vInfo.color }]}>
            <Text style={styles.versionTagText}>
              {vInfo.label} · {vInfo.name}
            </Text>
          </View>
        </View>
        <View style={styles.internalRow}>
          <Text style={styles.internalKey}>Trunkierung</Text>
          <Text style={[styles.internalSmall, { color: vInfo.color }]}>{vInfo.truncation}</Text>
        </View>

        <View style={styles.internalDivider} />

        <View style={styles.internalRow}>
          <Text style={styles.internalKey}>Erwarteter Code</Text>
          <Text style={[styles.internalExpected, { fontFamily: MONO, color: vInfo.color }]}>
            {expectedCode}
          </Text>
        </View>
      </View>

      {/* Eingabe */}
      <Text style={styles.label}>
        Response-Code eingeben ({vInfo.digits}-stellig, {vInfo.label})
      </Text>
      <TextInput
        style={[
          styles.input,
          { fontFamily: MONO },
          authStatus === 'success' && styles.inputSuccess,
          authStatus === 'failure' && styles.inputFailure,
        ]}
        value={responseInput}
        onChangeText={onResponseChange}
        keyboardType="numeric"
        placeholder={'·'.repeat(vInfo.digits)}
        placeholderTextColor={COLORS.textHint}
        maxLength={vInfo.digits}
      />

      {/* Live-Vergleich */}
      {inputComplete && authStatus === 'idle' && (
        <View style={styles.compareBox}>
          <View style={styles.compareCol}>
            <Text style={styles.compareLabel}>Eingabe</Text>
            <Text style={[styles.compareCode, { fontFamily: MONO }]}>{responseInput}</Text>
          </View>
          <Text style={styles.compareVs}>vs.</Text>
          <View style={styles.compareCol}>
            <Text style={styles.compareLabel}>Erwartet</Text>
            <Text style={[styles.compareCode, { fontFamily: MONO, color: vInfo.color }]}>
              {expectedCode}
            </Text>
          </View>
          <View style={styles.compareResult}>
            <Text style={styles.compareResultText}>
              {responseInput === expectedCode ? '✓ Übereinstimmung' : '✗ Kein Match'}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: vInfo.color }, disabled && styles.btnDisabled]}
        onPress={onVerify}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={styles.btnText}>✔ Zugang prüfen</Text>
      </TouchableOpacity>

      {authStatus === 'success' && (
        <View style={styles.bannerOk}>
          <Text style={styles.bannerIcon}>✅</Text>
          <Text style={styles.bannerTitle}>Zugang gewährt</Text>
          <Text style={styles.bannerSub}>
            {vInfo.label}-Code stimmt überein – Authentifizierung erfolgreich
          </Text>
        </View>
      )}

      {authStatus === 'failure' && (
        <View style={styles.bannerErr}>
          <Text style={styles.bannerIcon}>❌</Text>
          <Text style={[styles.bannerTitle, styles.bannerTitleErr]}>Zugang verweigert</Text>
          <Text style={styles.bannerSub}>
            Falscher Code – neue Challenge wird generiert …
          </Text>
        </View>
      )}
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
    borderTopColor: COLORS.secondary,
    gap: 14,
    flex: 1,
  },
  cardSuccess: { borderColor: COLORS.successBorder, backgroundColor: COLORS.successBg },
  cardFailure: { borderColor: COLORS.dangerBorder, backgroundColor: COLORS.dangerBg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  hint: { fontSize: 12, color: COLORS.textMuted, lineHeight: 19 },
  bold: { fontWeight: '700', color: COLORS.text },
  label: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },

  // Interne Berechnung
  internalBox: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  internalTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 },
  internalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  internalKey: { fontSize: 11, color: COLORS.textHint },
  internalVal: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  internalSmall: { fontSize: 10, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  internalDivider: { height: 1, backgroundColor: COLORS.border },
  internalExpected: { fontSize: 24, fontWeight: '900', letterSpacing: 4 },
  versionTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  versionTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Eingabe
  input: {
    backgroundColor: COLORS.bgCardAlt,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 28,
    letterSpacing: 10,
    textAlign: 'center',
  },
  inputSuccess: { borderColor: COLORS.success, borderWidth: 2 },
  inputFailure: { borderColor: COLORS.danger, borderWidth: 2 },

  // Vergleich
  compareBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 10,
    padding: 10,
    flexWrap: 'wrap',
  },
  compareCol: { alignItems: 'center', gap: 2 },
  compareLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  compareCode: { fontSize: 16, fontWeight: '700', color: COLORS.text, letterSpacing: 3 },
  compareVs: { fontSize: 13, color: COLORS.textHint },
  compareResult: { width: '100%', alignItems: 'center', marginTop: 2 },
  compareResultText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  // Button
  btn: { borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Banner
  bannerOk: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  bannerErr: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  bannerIcon: { fontSize: 28 },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.success },
  bannerTitleErr: { color: COLORS.danger },
  bannerSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});
