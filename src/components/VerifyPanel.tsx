import React from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
  serialNumber: string;
}

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function VerifyPanel({
  responseInput, onResponseChange, authStatus, onVerify,
  challenge, secret, serialNumber,
}: Props) {
  const disabled = responseInput.length < 6;
  const version = decodeVersion(challenge);
  const vInfo = VERSION_INFO[version];
  const hmacHex = computeHmacHex(challenge, secret, serialNumber);
  const { code: expectedCode } = computeCode(hmacHex, version);
  const inputComplete = responseInput.length === vInfo.digits;

  useEffect(() => {
    if (inputComplete && authStatus === 'idle') {
      Keyboard.dismiss();
      onVerify();
    }
  }, [responseInput]);

  return (
    <View style={[
      styles.card,
      authStatus === 'success' && styles.cardSuccess,
      authStatus === 'failure' && styles.cardFailure,
    ]}>
      {/* Card header */}
      <View style={[
        styles.cardHeader,
        authStatus === 'success' && styles.cardHeaderSuccess,
        authStatus === 'failure' && styles.cardHeaderFailure,
      ]}>
        <View style={styles.cardHeaderLeft}>
          <StepBadge n={3} label="Maschine" />
          <Text style={styles.cardTitle}>Zugang prüfen</Text>
        </View>
        <View style={styles.cardHeaderIcon}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textOnDarkMuted} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>
          Die Maschine berechnet den erwarteten Code{' '}
          <Text style={styles.bold}>intern</Text> und vergleicht ihn mit der Eingabe.
          Kein Netzwerk, kein Code-Transfer.
        </Text>

        {/* Interne Berechnung */}
        <View style={styles.internalBox}>
          <Text style={styles.internalTitle}>Interne Berechnung der Maschine</Text>
          {[
            { key: 'Seriennummer', val: serialNumber, color: COLORS.accent },
            { key: 'Challenge', val: challenge, color: undefined },
            { key: 'Nachricht', val: `${serialNumber}|${challenge}`, color: undefined, small: true },
          ].map((row) => (
            <View key={row.key} style={styles.internalRow}>
              <Text style={styles.internalKey}>{row.key}</Text>
              <Text style={[
                styles.internalVal,
                { fontFamily: MONO, color: row.color ?? COLORS.text },
                row.small && { fontSize: 11 },
              ]} numberOfLines={1} adjustsFontSizeToFit>
                {row.val}
              </Text>
            </View>
          ))}
          <View style={styles.internalRow}>
            <Text style={styles.internalKey}>Erkannte Version</Text>
            <View style={[styles.versionTag, { backgroundColor: vInfo.color }]}>
              <Text style={styles.versionTagText}>{vInfo.label} · {vInfo.name}</Text>
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
        <Text style={styles.inputLabel}>
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
              <Text style={[styles.compareCode, { fontFamily: MONO, color: vInfo.color }]}>{expectedCode}</Text>
            </View>
            <View style={styles.compareResult}>
              <Ionicons
                name={responseInput === expectedCode ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={14}
                color={responseInput === expectedCode ? COLORS.success : COLORS.warning}
              />
              <Text style={[styles.compareResultText, {
                color: responseInput === expectedCode ? COLORS.success : COLORS.warning
              }]}>
                {responseInput === expectedCode ? 'Übereinstimmung' : 'Kein Match'}
              </Text>
            </View>
          </View>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: vInfo.color }, disabled && styles.btnDisabled]}
          onPress={onVerify}
          activeOpacity={0.85}
          disabled={disabled}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Zugang prüfen</Text>
        </TouchableOpacity>

        {/* Result banners */}
        {authStatus === 'success' && (
          <View style={styles.bannerOk}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
            <View style={{ gap: 2 }}>
              <Text style={styles.bannerTitle}>Zugang gewährt</Text>
              <Text style={styles.bannerSub}>{vInfo.label}-Code stimmt überein</Text>
            </View>
          </View>
        )}

        {authStatus === 'failure' && (
          <View style={styles.bannerErr}>
            <Ionicons name="close-circle" size={32} color={COLORS.danger} />
            <View style={{ gap: 2 }}>
              <Text style={[styles.bannerTitle, { color: COLORS.danger }]}>Zugang verweigert</Text>
              <Text style={styles.bannerSub}>Falscher Code – neue Challenge wird generiert …</Text>
            </View>
          </View>
        )}
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
  cardSuccess: { borderColor: COLORS.successBorder },
  cardFailure: { borderColor: COLORS.dangerBorder },

  cardHeader: {
    backgroundColor: COLORS.bgDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeaderSuccess: { backgroundColor: COLORS.success },
  cardHeaderFailure: { backgroundColor: COLORS.danger },
  cardHeaderLeft: { gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textOnDark },
  cardHeaderIcon: {
    width: 36, height: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  body: { padding: 14, gap: 12 },
  hint: { fontSize: 12, color: COLORS.textMuted, lineHeight: 19 },
  bold: { fontWeight: '700', color: COLORS.text },
  inputLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.7 },

  internalBox: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 8, padding: 12, gap: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  internalTitle: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 },
  internalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  internalKey: { fontSize: 11, color: COLORS.textHint },
  internalVal: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  internalSmall: { fontSize: 10, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  internalDivider: { height: 1, backgroundColor: COLORS.border },
  internalExpected: { fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  versionTag: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  versionTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  input: {
    backgroundColor: COLORS.bgCardAlt,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 14,
    color: COLORS.text, fontSize: 28, letterSpacing: 10, textAlign: 'center',
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  inputSuccess: { borderColor: COLORS.success, borderWidth: 2 },
  inputFailure: { borderColor: COLORS.danger, borderWidth: 2 },

  compareBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: COLORS.bgCardAlt, borderRadius: 8, padding: 10, flexWrap: 'wrap',
  },
  compareCol: { alignItems: 'center', gap: 2 },
  compareLabel: { fontSize: 9, color: COLORS.textHint, textTransform: 'uppercase', letterSpacing: 0.5 },
  compareCode: { fontSize: 16, fontWeight: '700', color: COLORS.text, letterSpacing: 3 },
  compareVs: { fontSize: 13, color: COLORS.textHint },
  compareResult: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 },
  compareResultText: { fontSize: 11, fontWeight: '600' },

  btn: { borderRadius: 8, paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  bannerOk: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: COLORS.successBg, borderWidth: 1, borderColor: COLORS.successBorder,
    borderRadius: 8, padding: 14,
  },
  bannerErr: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: COLORS.dangerBorder,
    borderRadius: 8, padding: 14,
  },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: COLORS.success },
  bannerSub: { fontSize: 12, color: COLORS.textMuted },
});
