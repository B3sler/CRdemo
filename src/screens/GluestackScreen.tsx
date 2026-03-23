import React, { useState } from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import {
  View,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  ButtonText,
  Badge,
  BadgeText,
  Alert,
  AlertIcon,
  AlertText,
  Avatar,
  AvatarFallbackText,
  Card,
  Divider,
  Input,
  InputField,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckIcon,
  Switch,
  Progress,
  ProgressFilledTrack,
  Spinner,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  ChevronDownIcon,
  Icon,
  InfoIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloseCircleIcon,
} from '@gluestack-ui/themed';
import { COLORS } from '../theme';

// ─── Hilfkomponente: Abschnittsüberschrift ────────────────────────────────────
function Section({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <VStack space="xs" style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
    </VStack>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────
export function GluestackScreen() {
  const [checked, setChecked] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [progress] = useState(68);
  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <VStack space="2xl" style={styles.inner}>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <Card style={styles.heroCard}>
          <VStack space="sm" style={{ alignItems: 'center' }}>
            <Text style={styles.heroEmoji}>🧩</Text>
            <Heading size="xl" style={{ textAlign: 'center', color: COLORS.text }}>
              Gluestack UI
            </Heading>
            <Text size="sm" style={{ textAlign: 'center', color: COLORS.textMuted }}>
              Universal Design System für React Native + Web.{'\n'}
              Alle Komponenten sind plattformübergreifend.
            </Text>
          </VStack>
        </Card>

        {/* ── Buttons ─────────────────────────────────────────────────────── */}
        <Section
          title="Button"
          subtitle="action: default · positive · negative · info · warning"
        />
        <Card>
          <VStack space="sm">
            <HStack space="sm" style={{ flexWrap: 'wrap' }}>
              <Button action="primary" variant="solid">
                <ButtonText>Primary</ButtonText>
              </Button>
              <Button action="positive" variant="solid">
                <ButtonText>Positive</ButtonText>
              </Button>
              <Button action="negative" variant="solid">
                <ButtonText>Negative</ButtonText>
              </Button>
            </HStack>
            <HStack space="sm" style={{ flexWrap: 'wrap' }}>
              <Button action="primary" variant="outline">
                <ButtonText>Outline</ButtonText>
              </Button>
              <Button action="primary" variant="link">
                <ButtonText>Link</ButtonText>
              </Button>
              <Button action="primary" size="sm">
                <ButtonText>Small</ButtonText>
              </Button>
              <Button action="primary" size="lg">
                <ButtonText>Large</ButtonText>
              </Button>
            </HStack>
            <Button action="primary" isDisabled>
              <ButtonText>Disabled</ButtonText>
            </Button>
          </VStack>
        </Card>

        {/* ── Badge ───────────────────────────────────────────────────────── */}
        <Section
          title="Badge"
          subtitle="action: info · success · warning · error · muted"
        />
        <Card>
          <HStack space="sm" style={{ flexWrap: 'wrap' }}>
            <Badge action="info" variant="solid">
              <BadgeText>Info</BadgeText>
            </Badge>
            <Badge action="success" variant="solid">
              <BadgeText>Success</BadgeText>
            </Badge>
            <Badge action="warning" variant="solid">
              <BadgeText>Warning</BadgeText>
            </Badge>
            <Badge action="error" variant="solid">
              <BadgeText>Error</BadgeText>
            </Badge>
            <Badge action="muted" variant="solid">
              <BadgeText>Muted</BadgeText>
            </Badge>
            <Badge action="success" variant="outline">
              <BadgeText>Outline</BadgeText>
            </Badge>
          </HStack>
        </Card>

        {/* ── Alert ───────────────────────────────────────────────────────── */}
        <Section
          title="Alert"
          subtitle="Für Hinweise, Erfolg, Warnungen und Fehler"
        />
        <VStack space="sm">
          <Alert action="info">
            <AlertIcon as={InfoIcon} />
            <AlertText>Hinweis: Die Challenge ist 60 Sekunden gültig.</AlertText>
          </Alert>
          <Alert action="success">
            <AlertIcon as={CheckCircleIcon} />
            <AlertText>Authentifizierung erfolgreich. Zugang gewährt.</AlertText>
          </Alert>
          <Alert action="warning">
            <AlertIcon as={AlertCircleIcon} />
            <AlertText>Challenge läuft in 8 Sekunden ab.</AlertText>
          </Alert>
          <Alert action="error">
            <AlertIcon as={CloseCircleIcon} />
            <AlertText>Falscher Code. Zugang verweigert.</AlertText>
          </Alert>
        </VStack>

        {/* ── Avatar ──────────────────────────────────────────────────────── */}
        <Section title="Avatar" subtitle="Bild oder Fallback-Initialen" />
        <Card>
          <HStack space="md" style={{ alignItems: 'center' }}>
            <Avatar size="xl" style={{ backgroundColor: COLORS.primary }}>
              <AvatarFallbackText>JB</AvatarFallbackText>
            </Avatar>
            <Avatar size="lg" style={{ backgroundColor: '#1565c0' }}>
              <AvatarFallbackText>TK</AvatarFallbackText>
            </Avatar>
            <Avatar size="md" style={{ backgroundColor: COLORS.warning }}>
              <AvatarFallbackText>MA</AvatarFallbackText>
            </Avatar>
            <Avatar size="sm" style={{ backgroundColor: COLORS.danger }}>
              <AvatarFallbackText>SL</AvatarFallbackText>
            </Avatar>
            <VStack space="xs">
              <Text size="sm" bold style={{ color: COLORS.text }}>Jonas B.</Text>
              <Text size="xs" style={{ color: COLORS.textMuted }}>Techniker</Text>
            </VStack>
          </HStack>
        </Card>

        {/* ── Input ───────────────────────────────────────────────────────── */}
        <Section title="Input" subtitle="variant: outline · rounded · underlined" />
        <Card>
          <VStack space="sm">
            <Input variant="outline">
              <InputField
                placeholder="Outline Input"
                value={inputVal}
                onChangeText={setInputVal}
              />
            </Input>
            <Input variant="rounded">
              <InputField placeholder="Rounded Input" />
            </Input>
            <Input variant="underlined">
              <InputField placeholder="Underlined Input" />
            </Input>
            <Input variant="outline" isDisabled>
              <InputField placeholder="Disabled" />
            </Input>
          </VStack>
        </Card>

        {/* ── Checkbox & Switch ────────────────────────────────────────────── */}
        <Section title="Checkbox & Switch" />
        <Card>
          <VStack space="md">
            <HStack space="xl" style={{ flexWrap: 'wrap' }}>
              <Checkbox
                value="cb1"
                isChecked={checked}
                onChange={() => setChecked((v) => !v)}
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>Seriennummer verifiziert</CheckboxLabel>
              </Checkbox>
              <Checkbox
                value="cb2"
                isChecked={checked2}
                onChange={() => setChecked2((v) => !v)}
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>Secret Key gesetzt</CheckboxLabel>
              </Checkbox>
            </HStack>
            <Divider />
            <HStack space="md" style={{ alignItems: 'center' }}>
              <Switch
                value={switchVal}
                onToggle={() => setSwitchVal((v) => !v)}
              />
              <Text size="sm" style={{ color: COLORS.text }}>
                Authentifizierung aktiv: {switchVal ? 'Ja' : 'Nein'}
              </Text>
            </HStack>
          </VStack>
        </Card>

        {/* ── Select ──────────────────────────────────────────────────────── */}
        <Section title="Select / Dropdown" />
        <Card>
          <Select onValueChange={setSelectVal}>
            <SelectTrigger variant="outline">
              <SelectInput placeholder="Protokoll-Version wählen …" />
              <SelectIcon as={ChevronDownIcon} style={{ marginRight: 8 }} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectItem label="V1 – 6-stellig (Standard)" value="1" />
                <SelectItem label="V2 – 8-stellig (Erweitert)" value="2" />
                <SelectItem label="V3 – 8-stellig (Vollformat)" value="3" />
              </SelectContent>
            </SelectPortal>
          </Select>
          {selectVal ? (
            <Text size="xs" style={{ color: COLORS.textMuted, marginTop: 8 }}>
              Gewählt: Version {selectVal}
            </Text>
          ) : null}
        </Card>

        {/* ── Progress & Spinner ───────────────────────────────────────────── */}
        <Section
          title="Progress & Spinner"
          subtitle="Für Ladezustände und Fortschrittsanzeigen"
        />
        <Card>
          <VStack space="md">
            <VStack space="xs">
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text size="xs" style={{ color: COLORS.textMuted }}>Challenge-Gültigkeit</Text>
                <Text size="xs" bold style={{ color: COLORS.primary }}>{progress} %</Text>
              </HStack>
              <Progress value={progress} size="md">
                <ProgressFilledTrack />
              </Progress>
            </VStack>
            <VStack space="xs">
              <Text size="xs" style={{ color: COLORS.textMuted }}>HMAC wird berechnet …</Text>
              <Progress value={40} size="sm">
                <ProgressFilledTrack />
              </Progress>
            </VStack>
            <Divider />
            <HStack space="lg" style={{ alignItems: 'center' }}>
              <Spinner size="small" />
              <Spinner size="large" />
              <Text size="sm" style={{ color: COLORS.textMuted }}>Spinner (small / large)</Text>
            </HStack>
          </VStack>
        </Card>

        {/* ── Layout: VStack / HStack / Divider ───────────────────────────── */}
        <Section
          title="Layout: VStack · HStack · Divider"
          subtitle="Flexibles Stack-System mit space-Prop"
        />
        <Card>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <View style={[styles.colorBox, { backgroundColor: COLORS.primary }]} />
              <View style={[styles.colorBox, { backgroundColor: '#1565c0' }]} />
              <View style={[styles.colorBox, { backgroundColor: COLORS.warning }]} />
              <Text size="xs" style={{ color: COLORS.textMuted, flex: 1 }}>
                HStack space="sm"
              </Text>
            </HStack>
            <Divider />
            <VStack space="xs">
              {['VStack', 'space="xs"', '→ 4 px Abstand'].map((t) => (
                <View key={t} style={styles.stackItem}>
                  <Text size="xs" style={{ color: COLORS.text }}>{t}</Text>
                </View>
              ))}
            </VStack>
          </VStack>
        </Card>

        {/* ── Typography ──────────────────────────────────────────────────── */}
        <Section title="Typography: Heading · Text" />
        <Card>
          <VStack space="sm">
            {(['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const).map((size) => (
              <Heading key={size} size={size} style={{ color: COLORS.text }}>
                Heading size="{size}"
              </Heading>
            ))}
            <Divider />
            <Text bold style={{ color: COLORS.text }}>Bold</Text>
            <Text italic style={{ color: COLORS.text }}>Italic</Text>
            <Text underline style={{ color: COLORS.text }}>Underline</Text>
            <Text strikeThrough style={{ color: COLORS.textMuted }}>Strike Through</Text>
          </VStack>
        </Card>

        <Text size="xs" style={styles.footer}>
          @gluestack-ui/themed v1 · Universal Components · React Native + Web
        </Text>

      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  inner: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : ('100%' as any),
  },

  heroCard: { alignItems: 'center', paddingVertical: 24 },
  heroEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 4 },

  sectionHeader: { paddingLeft: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  sectionSub: { fontSize: 11, color: COLORS.textMuted },

  colorBox: { width: 32, height: 32, borderRadius: 8 },
  stackItem: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  footer: {
    textAlign: 'center',
    color: COLORS.textHint,
    marginBottom: 8,
  },
});
