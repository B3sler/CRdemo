import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { TabBar, TabId } from './src/components/TabBar';
import { AuthScreen } from './src/screens/AuthScreen';
import { MachineScreen } from './src/screens/MachineScreen';
import { COLORS } from './src/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('auth');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.screen}>
          {activeTab === 'auth' && <AuthScreen />}
          {activeTab === 'machines' && <MachineScreen />}
        </View>
        <TabBar active={activeTab} onChange={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
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
