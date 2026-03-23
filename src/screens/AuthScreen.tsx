import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';

import { useChallenge } from '../hooks/useChallenge';
import { computeHmacHex, computeCode, decodeVersion, generateSerialNumber, Version } from '../utils/hmac';
import { ChallengePanel, QrPayload } from '../components/ChallengePanel';
import { ResponsePanel } from '../components/ResponsePanel';
import { VerifyPanel, AuthStatus } from '../components/VerifyPanel';
import { ArrowConnector } from '../components/ArrowConnector';
import { COLORS, DEFAULT_SECRET, BREAKPOINT } from '../theme';

export function AuthScreen() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > BREAKPOINT;

  const [version, setVersion] = useState<Version>(1);
  const { challenge, timeLeft, newChallenge } = useChallenge(version);

  const [serialNumber] = useState<string>(generateSerialNumber);

  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [enteredChallenge, setEnteredChallenge] = useState('');
  const [enteredSerial, setEnteredSerial] = useState('');
  const [qrScanned, setQrScanned] = useState(false);

  const [responseInput, setResponseInput] = useState('');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');

  const versionRef = useRef(version);
  versionRef.current = version;

  function handleNewChallenge(v?: Version) {
    const ver = v ?? versionRef.current;
    newChallenge(ver);
    setEnteredChallenge('');
    setEnteredSerial('');
    setResponseInput('');
    setAuthStatus('idle');
    setQrScanned(false);
  }

  function handleQrScan(payload: QrPayload) {
    setEnteredSerial(payload.s);
    setEnteredChallenge(payload.c);
    setQrScanned(true);
    if (payload.v !== versionRef.current) {
      setVersion(payload.v);
    }
  }

  function handleVersionChange(v: Version) {
    setVersion(v);
    handleNewChallenge(v);
  }

  function handleVerify() {
    const detectedVersion = decodeVersion(challenge);
    const hmacHex = computeHmacHex(challenge, secret, serialNumber);
    const { code: expected } = computeCode(hmacHex, detectedVersion);
    if (responseInput.trim() === expected) {
      setAuthStatus('success');
    } else {
      setAuthStatus('failure');
      setTimeout(() => handleNewChallenge(), 1200);
    }
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>

        {/* Protokoll-Erklärung */}
        <View style={styles.protocolBanner}>
          <Text style={styles.protocolBannerText}>
            <Text style={styles.bold}>Ablauf: </Text>
            Die Maschine zeigt ihre Seriennummer und eine zufällige Challenge ①. Der Techniker
            gibt beides in seine App ein – erst dann wird der maschinenspezifische Response-Code
            berechnet ②. Diesen Code gibt er am Terminal ein ③.
          </Text>
        </View>

        {/* 3-Schritt-Fluss */}
        <View style={[styles.flow, isWide && styles.flowWide]}>
          <ChallengePanel
            challenge={challenge}
            timeLeft={timeLeft}
            version={version}
            serialNumber={serialNumber}
            onVersionChange={handleVersionChange}
            onNewChallenge={() => handleNewChallenge()}
            onQrScan={handleQrScan}
          />

          <ArrowConnector
            horizontal={isWide}
            label="Seriennr. + Challenge ablesen"
          />

          <ResponsePanel
            currentChallenge={challenge}
            enteredChallenge={enteredChallenge}
            onChallengeChange={(v) => { setEnteredChallenge(v); setQrScanned(false); }}
            correctSerial={serialNumber}
            enteredSerial={enteredSerial}
            onSerialChange={(v) => { setEnteredSerial(v); setQrScanned(false); }}
            secret={secret}
            onSecretChange={setSecret}
            qrScanned={qrScanned}
          />

          <ArrowConnector
            horizontal={isWide}
            label={isWide ? 'Code eingeben' : 'Code am Terminal eingeben'}
          />

          <VerifyPanel
            responseInput={responseInput}
            onResponseChange={(v) => {
              setResponseInput(v);
              setAuthStatus('idle');
            }}
            authStatus={authStatus}
            onVerify={handleVerify}
            challenge={challenge}
            secret={secret}
            serialNumber={serialNumber}
          />
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12 },
  inner: { width: '100%', maxWidth: 1400, gap: 16 },
  protocolBanner: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  protocolBannerText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  bold: { fontWeight: '700', color: COLORS.text },
  flow: { flexDirection: 'column', gap: 8 },
  flowWide: { flexDirection: 'row', alignItems: 'flex-start' },
});
