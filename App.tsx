import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';

import { useChallenge } from './src/hooks/useChallenge';
import { computeHmacHex, computeCode, decodeVersion, Version } from './src/utils/hmac';
import { ChallengePanel } from './src/components/ChallengePanel';
import { ResponsePanel } from './src/components/ResponsePanel';
import { VerifyPanel, AuthStatus } from './src/components/VerifyPanel';
import { ArrowConnector } from './src/components/ArrowConnector';
import { COLORS, DEFAULT_SECRET, BREAKPOINT } from './src/theme';

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > BREAKPOINT;

  const [version, setVersion] = useState<Version>(1);
  const { challenge, timeLeft, newChallenge } = useChallenge(version);

  // Schritt 2 – Mobiles Gerät
  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [enteredChallenge, setEnteredChallenge] = useState('');

  // Schritt 3 – Verifikation
  const [responseInput, setResponseInput] = useState('');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');

  const versionRef = useRef(version);
  versionRef.current = version;

  function handleNewChallenge(v?: Version) {
    const ver = v ?? versionRef.current;
    newChallenge(ver);
    setEnteredChallenge('');
    setResponseInput('');
    setAuthStatus('idle');
  }

  function handleVersionChange(v: Version) {
    setVersion(v);
    handleNewChallenge(v);
  }

  function handleVerify() {
    const detectedVersion = decodeVersion(challenge);
    const hmacHex = computeHmacHex(challenge, secret);
    const { code: expected } = computeCode(hmacHex, detectedVersion);
    if (responseInput.trim() === expected) {
      setAuthStatus('success');
    } else {
      setAuthStatus('failure');
      setTimeout(() => handleNewChallenge(), 1200);
    }
  }

  return (
    <GluestackUIProvider colorMode="light">
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Challenge-Response Authentifizierung</Text>
            <Text style={styles.headerSubtitle}>
              HMAC-SHA256 · Wartungszugang Industriemaschine · Demo
            </Text>
          </View>

          {/* Protokoll-Erklärung */}
          <View style={styles.protocolBanner}>
            <Text style={styles.protocolBannerText}>
              <Text style={styles.bold}>Ablauf: </Text>
              Die Maschine wählt eine Protokoll-Version und generiert eine Challenge, in deren
              Bits 27–24 die Version kodiert ist ①. Der Techniker gibt die Challenge in seine
              App ein – sie erkennt die Version automatisch und berechnet den passenden
              Response-Code ②. Diesen Code gibt er an der Maschine ein ③.
            </Text>
          </View>

          {/* 3-Schritt-Fluss */}
          <View style={[styles.flow, isWide && styles.flowWide]}>
            <ChallengePanel
              challenge={challenge}
              timeLeft={timeLeft}
              version={version}
              onVersionChange={handleVersionChange}
              onNewChallenge={() => handleNewChallenge()}
            />

            <ArrowConnector
              horizontal={isWide}
              label={isWide ? 'Challenge ablesen' : 'Challenge ablesen & eingeben'}
            />

            <ResponsePanel
              currentChallenge={challenge}
              enteredChallenge={enteredChallenge}
              onChallengeChange={setEnteredChallenge}
              secret={secret}
              onSecretChange={setSecret}
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
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bachelorarbeit · Challenge-Response-Authentifizierung · HMAC-SHA256 nach RFC 2104 /
              RFC 4226
            </Text>
          </View>
        </View>
      </ScrollView>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12 },
  inner: { width: '100%', maxWidth: 1400, gap: 16 },
  header: { alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
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
  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: 10, color: COLORS.textHint, textAlign: 'center', lineHeight: 16 },
});
