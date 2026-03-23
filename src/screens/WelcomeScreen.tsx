import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS } from '../theme';
import { TabId } from '../components/TabBar';

interface Props {
  onNavigate: (tab: TabId) => void;
}

function InfoBox({ icon, title, text, accent = COLORS.primary }: {
  icon: string; title: string; text: string; accent?: string;
}) {
  return (
    <View style={[styles.infoBox, { borderLeftColor: accent }]}>
      <Text style={[styles.infoBoxTitle, { color: accent }]}>{icon}  {title}</Text>
      <Text style={styles.infoBoxText}>{text}</Text>
    </View>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

function CompareRow({ label, rn, web }: { label: string; rn: string; web: string }) {
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareLabel}>{label}</Text>
      <View style={styles.compareCell}>
        <Text style={styles.compareCellText}>{rn}</Text>
      </View>
      <View style={[styles.compareCell, { backgroundColor: '#e8f0fe', borderColor: '#c5d8ff' }]}>
        <Text style={[styles.compareCellText, { color: '#1565c0' }]}>{web}</Text>
      </View>
    </View>
  );
}

export function WelcomeScreen({ onNavigate }: Props) {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>⚛️📱</Text>
          <Text style={styles.heroTitle}>React Native & Expo</Text>
          <Text style={styles.heroSubtitle}>
            Eine Codebasis – native Apps für iOS, Android und das Web
          </Text>
          <View style={styles.badgeRow}>
            {['React Native', 'Expo SDK 54', 'TypeScript', 'iOS · Android · Web'].map((b) => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Was ist React Native? */}
        <InfoBox
          icon="⚛️"
          title="Was ist React Native?"
          text="React Native ist ein Framework von Meta, das es erlaubt native mobile Apps mit JavaScript und React zu entwickeln. Statt im Browser werden echte native UI-Komponenten gerendert – kein WebView, kein Hybrid."
          accent={COLORS.primary}
        />

        {/* Was ist Expo? */}
        <InfoBox
          icon="🚀"
          title="Was ist Expo?"
          text="Expo ist ein Toolchain und Plattform rund um React Native. Es vereinfacht das Setup erheblich, bietet fertige native APIs (Kamera, Sensoren, Dateisystem …) und ermöglicht mit Expo Go das sofortige Testen auf echten Geräten ohne Build-Prozess."
          accent="#4f46e5"
        />

        {/* Native vs. Web */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Native vs. Web</Text>
          <Text style={styles.sectionSub}>
            React Native rendert echte native Komponenten – kein HTML
          </Text>
        </View>

        <View style={styles.compareCard}>
          <View style={styles.compareHeader}>
            <View style={[styles.compareHeaderCell, { backgroundColor: COLORS.successBg }]}>
              <Text style={[styles.compareHeaderText, { color: COLORS.primary }]}>React Native</Text>
            </View>
            <View style={[styles.compareHeaderCell, { backgroundColor: '#e8f0fe' }]}>
              <Text style={[styles.compareHeaderText, { color: '#1565c0' }]}>Web (HTML)</Text>
            </View>
          </View>
          <CompareRow label="Text"        rn="<Text>"       web="<p> / <span>" />
          <CompareRow label="Container"   rn="<View>"       web="<div>" />
          <CompareRow label="Liste"       rn="<FlatList>"   web="<ul> / <li>" />
          <CompareRow label="Bild"        rn="<Image>"      web="<img>" />
          <CompareRow label="Scrollen"    rn="<ScrollView>" web="overflow: scroll" />
          <CompareRow label="Eingabe"     rn="<TextInput>"  web="<input>" />
          <CompareRow label="Button"      rn="<Pressable>"  web="<button>" />
        </View>

        {/* Kernkonzepte */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kernkonzepte</Text>
        </View>

        <View style={styles.featureGrid}>
          <FeatureCard
            icon="🎨"
            title="StyleSheet"
            desc={'Styles werden in JavaScript definiert – ähnlich CSS, aber als JS-Objekte. Kein Kaskadieren, kein globales Stylesheet.'}
          />
          <FeatureCard
            icon="📐"
            title="Flexbox"
            desc="Layout basiert vollständig auf Flexbox. flexDirection ist standardmäßig 'column' – anders als im Web."
          />
          <FeatureCard
            icon="🔗"
            title="Bridge / JSI"
            desc="JS-Code kommuniziert über eine Bridge (oder direkt per JSI) mit dem nativen Layer, wo echte UI-Elemente gerendert werden."
          />
          <FeatureCard
            icon="🔄"
            title="Hot Reload"
            desc="Änderungen im Code werden in Echtzeit auf dem Gerät aktualisiert – ohne App neu zu starten."
          />
          <FeatureCard
            icon="📦"
            title="Metro Bundler"
            desc="Der JavaScript-Bundler von React Native. Er bündelt den Code und unterstützt plattformspezifische Dateiendungen (.ios.tsx, .web.tsx)."
          />
          <FeatureCard
            icon="📱"
            title="Expo Go"
            desc="Die Expo-App zum direkten Testen auf dem Gerät per QR-Code – ohne Xcode oder Android Studio."
          />
        </View>

        {/* Expo-Workflow */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expo Managed Workflow</Text>
        </View>

        <View style={styles.workflowCard}>
          {[
            { step: '1', icon: '✏️', title: 'Code schreiben', desc: 'TypeScript + React in VS Code oder einem anderen Editor' },
            { step: '2', icon: '⚡', title: 'Expo starten', desc: 'npx expo start – Metro Bundler läuft lokal' },
            { step: '3', icon: '📷', title: 'QR-Code scannen', desc: 'Expo Go auf iPhone/Android öffnet die App sofort' },
            { step: '4', icon: '🏗️', title: 'Build & Deploy', desc: 'eas build erstellt native Binaries für App Store & Play Store' },
          ].map((item, i, arr) => (
            <View key={item.step} style={styles.workflowRow}>
              <View style={styles.workflowLeft}>
                <View style={styles.workflowBadge}>
                  <Text style={styles.workflowBadgeText}>{item.step}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.workflowLine} />}
              </View>
              <View style={styles.workflowRight}>
                <Text style={styles.workflowIcon}>{item.icon}</Text>
                <Text style={styles.workflowTitle}>{item.title}</Text>
                <Text style={styles.workflowDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Diese App */}
        <InfoBox
          icon="📱"
          title="Diese App"
          text="Diese Demo-App wurde mit Expo SDK 54 und React Native 0.81 entwickelt. Sie läuft nativ auf iOS und Android sowie im Browser – mit derselben TypeScript-Codebasis."
          accent={COLORS.textMuted}
        />

        {/* CTAs */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaBtn, { flex: 1 }]}
            onPress={() => onNavigate('auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>🔐  Auth-Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaBtnSecondary, { flex: 1 }]}
            onPress={() => onNavigate('platform')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnSecondaryText}>📂  Plattform</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Bachelorarbeit · Jonas B. · Expo SDK 54 · React Native 0.81 · TypeScript
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  inner: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : ('100%' as any),
    gap: 16,
  },

  // Hero
  hero: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 },
  badge: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },

  // Info box
  infoBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    gap: 6,
  },
  infoBoxTitle: { fontSize: 13, fontWeight: '700' },
  infoBoxText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

  // Section
  sectionHeader: { gap: 3 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  sectionSub: { fontSize: 12, color: COLORS.textMuted },

  // Compare table
  compareCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  compareHeader: { flexDirection: 'row' },
  compareHeaderCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compareHeaderText: { fontSize: 12, fontWeight: '800' },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compareLabel: {
    width: 72,
    fontSize: 11,
    color: COLORS.textHint,
    padding: 10,
    alignSelf: 'center',
  },
  compareCell: {
    flex: 1,
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.border,
    borderLeftWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareCellText: { fontSize: 12, fontWeight: '700', color: COLORS.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  // Feature grid
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIcon: { fontSize: 22 },
  featureTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  featureDesc: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },

  // Workflow
  workflowCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workflowRow: { flexDirection: 'row', gap: 14, minHeight: 72 },
  workflowLeft: { alignItems: 'center', width: 32 },
  workflowBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  workflowBadgeText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  workflowLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginTop: 4 },
  workflowRight: { flex: 1, paddingBottom: 18, gap: 3 },
  workflowIcon: { fontSize: 18 },
  workflowTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  workflowDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },

  // CTAs
  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  ctaBtnSecondary: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ctaBtnSecondaryText: { color: COLORS.primary, fontSize: 14, fontWeight: '800' },

  footer: {
    fontSize: 10,
    color: COLORS.textHint,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
});
