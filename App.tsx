import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

import { AppHeader } from './src/components/AppHeader';
import { TabBar, TabId } from './src/components/TabBar';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { PlatformScreen } from './src/screens/PlatformScreen';
import { GluestackScreen } from './src/screens/GluestackScreen';
import { COLORS } from './src/theme';

const HEADER_TITLES: Record<TabId, { title: string; subtitle: string }> = {
  welcome: {
    title: 'React Native & Expo',
    subtitle: 'Eine Codebasis · iOS · Android · Web',
  },
  auth: {
    title: 'Demo',
    subtitle: '3-Schritt-Protokoll · HMAC-SHA256',
  },
  platform: {
    title: 'Plattformspezifische Dateien',
    subtitle: '.ios.tsx · .web.tsx · Metro Bundler',
  },
  gluestack: {
    title: 'Gluestack UI',
    subtitle: 'Universal Design System · React Native + Web',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('welcome');
  const { title, subtitle } = HEADER_TITLES[activeTab];

  return (
    <GluestackUIProvider config={config} colorMode="light">
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgCard} />
      <View style={styles.root}>
        <AppHeader title={title} subtitle={subtitle} />

        <View style={styles.screen}>
          {activeTab === 'welcome' && <WelcomeScreen onNavigate={setActiveTab} />}
          {activeTab === 'auth' && <AuthScreen />}
          {activeTab === 'platform' && <PlatformScreen />}
          {activeTab === 'gluestack' && <GluestackScreen />}
        </View>

        <TabBar active={activeTab} onChange={setActiveTab} />
      </View>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    ...Platform.select({
      web: { height: '100vh' } as any,
    }),
  },
  screen: { flex: 1 },
});
