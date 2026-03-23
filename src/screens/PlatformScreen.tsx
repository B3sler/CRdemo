import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS } from '../theme';
import { PlatformCard } from '../components/PlatformCard';
import { NativeUIShowcase } from '../components/NativeUIShowcase';

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface CodeBlockProps {
  code: string;
  highlight?: string;
}

function CodeBlock({ code, highlight }: CodeBlockProps) {
  if (!highlight) {
    return (
      <View style={styles.codeBlock}>
        <Text style={[styles.code, { fontFamily: MONO }]}>{code}</Text>
      </View>
    );
  }

  const parts = code.split(highlight);
  return (
    <View style={styles.codeBlock}>
      <Text style={[styles.code, { fontFamily: MONO }]}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <Text style={styles.codeHighlight}>{highlight}</Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    </View>
  );
}

interface RuleCardProps {
  icon: string;
  title: string;
  desc: string;
}

function RuleCard({ icon, title, desc }: RuleCardProps) {
  return (
    <View style={styles.ruleCard}>
      <Text style={styles.ruleIcon}>{icon}</Text>
      <View style={styles.ruleRight}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export function PlatformScreen() {
  const current = Platform.OS;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>

        {/* Intro */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>📂</Text>
          <Text style={styles.heroTitle}>Plattformspezifische Dateien</Text>
          <Text style={styles.heroSubtitle}>
            Metro Bundler lädt automatisch die richtige Implementierung
            anhand der Dateiendung — ganz ohne if/else im Code.
          </Text>
        </View>

        {/* Aktuell aktive Plattform */}
        <View style={[styles.activePlatformBanner, { borderColor: COLORS.primary }]}>
          <Text style={styles.activePlatformLabel}>Aktuell aktive Plattform</Text>
          <Text style={[styles.activePlatformValue, { fontFamily: MONO }]}>
            Platform.OS === &quot;{current}&quot;
          </Text>
          <Text style={styles.activePlatformHint}>
            {current === 'web'
              ? '→ Metro lädt PlatformCard.web.tsx'
              : current === 'ios'
              ? '→ Metro lädt PlatformCard.ios.tsx'
              : '→ Metro lädt PlatformCard.tsx (Fallback)'}
          </Text>
        </View>

        {/* Live-Demo */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live-Demo: PlatformCard</Text>
          <Text style={styles.sectionSub}>
            Dieselbe Zeile{' '}
            <Text style={[styles.inlineCode, { fontFamily: MONO }]}>
              {'<PlatformCard />'}
            </Text>{' '}
            — unterschiedliches Ergebnis auf jedem Gerät
          </Text>
        </View>

        <PlatformCard />

        {/* Wie funktioniert es? */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wie funktioniert das?</Text>
        </View>

        <View style={styles.explanationCard}>
          <Text style={styles.explanationText}>
            Metro Bundler prüft beim Import automatisch ob eine plattformspezifische
            Datei existiert und bevorzugt diese. Die Priorität ist:
          </Text>

          <View style={styles.priorityList}>
            {[
              { file: 'PlatformCard.ios.tsx', plat: 'iOS', active: current === 'ios' },
              { file: 'PlatformCard.android.tsx', plat: 'Android', active: current === 'android' },
              { file: 'PlatformCard.web.tsx', plat: 'Web', active: current === 'web' },
              { file: 'PlatformCard.tsx', plat: 'Fallback (alle)', active: current !== 'ios' && current !== 'android' && current !== 'web' },
            ].map((item) => (
              <View
                key={item.file}
                style={[styles.priorityRow, item.active && styles.priorityRowActive]}
              >
                <Text style={[styles.priorityFile, { fontFamily: MONO }, item.active && styles.priorityFileActive]}>
                  {item.file}
                </Text>
                <View style={[styles.priorityBadge, item.active && styles.priorityBadgeActive]}>
                  <Text style={[styles.priorityBadgeText, item.active && styles.priorityBadgeTextActive]}>
                    {item.active ? '✓ aktiv' : item.plat}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Import-Beispiel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Import — immer gleich</Text>
        </View>

        <CodeBlock
          code={`// In PlatformScreen.tsx\nimport { PlatformCard } from '../components/PlatformCard';\n\n// Metro löst automatisch auf:\n// → PlatformCard.ios.tsx   auf iOS\n// → PlatformCard.web.tsx   im Browser\n// → PlatformCard.tsx       sonst`}
          highlight="PlatformCard"
        />

        {/* Dateistruktur */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dateistruktur</Text>
        </View>

        <CodeBlock
          code={`src/components/\n  PlatformCard.ios.tsx    ← nur iOS\n  PlatformCard.web.tsx    ← nur Web\n  PlatformCard.tsx        ← Fallback`}
        />

        {/* Native UI Showcase */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Native UI-Elemente — Live-Demo</Text>
          <Text style={styles.sectionSub}>
            Dieselbe Komponente{' '}
            <Text style={[styles.inlineCode, { fontFamily: MONO }]}>
              {'<NativeUIShowcase />'}
            </Text>{' '}
            — auf iOS native Controls, im Browser Web-Stil
          </Text>
        </View>

        <NativeUIShowcase />

        {/* Regeln */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wann sinnvoll einsetzen?</Text>
        </View>

        <View style={styles.rulesContainer}>
          <RuleCard
            icon="✅"
            title="Navigation & Gesten"
            desc="iOS nutzt swipe-back, Web hat Browserhistorie — unterschiedliche Implementierung sinnvoll."
          />
          <RuleCard
            icon="✅"
            title="Plattform-APIs"
            desc="Kamera, Biometrie oder Datei-Picker haben native und web-spezifische APIs."
          />
          <RuleCard
            icon="✅"
            title="Design-Sprache"
            desc="iOS Human Interface Guidelines vs. Material Design vs. Web-Konventionen."
          />
          <RuleCard
            icon="⚠️"
            title="Nicht für kleine Unterschiede"
            desc={"Für einfache Style-Anpassungen reicht Platform.select({}). Plattformdateien lohnen sich erst bei unterschiedlicher Logik."}
          />
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  inner: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : '100%',
    gap: 16,
  },

  // Hero
  hero: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },

  // Active platform banner
  activePlatformBanner: {
    backgroundColor: COLORS.successBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
  },
  activePlatformLabel: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  activePlatformValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  activePlatformHint: { fontSize: 12, color: COLORS.textMuted },

  // Section
  sectionHeader: { gap: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  sectionSub: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  inlineCode: { backgroundColor: COLORS.bgCardAlt, color: COLORS.primary },

  // Explanation card
  explanationCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  explanationText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 19 },

  // Priority list
  priorityList: { gap: 6 },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityRowActive: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.primary,
  },
  priorityFile: { fontSize: 12, color: COLORS.textMuted, flex: 1 },
  priorityFileActive: { color: COLORS.primary, fontWeight: '700' },
  priorityBadge: {
    backgroundColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priorityBadgeActive: { backgroundColor: COLORS.primary },
  priorityBadgeText: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  priorityBadgeTextActive: { color: '#fff' },

  // Code block
  codeBlock: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
  },
  code: { fontSize: 12, color: '#cdd6f4', lineHeight: 20 },
  codeHighlight: { color: '#89dceb', fontWeight: '700' },

  // Rules
  rulesContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  ruleCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'flex-start',
  },
  ruleIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  ruleRight: { flex: 1, gap: 3 },
  ruleTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  ruleDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },
});
