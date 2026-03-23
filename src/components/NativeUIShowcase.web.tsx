import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { COLORS } from '../theme';

/**
 * Web-Äquivalent der NativeUIShowcase.
 * Zeigt dieselben UI-Konzepte im Material/Web-Stil.
 * Dateiname: NativeUIShowcase.web.tsx
 */
export function NativeUIShowcase() {
  const [switchVal, setSwitchVal] = useState(true);
  const [switchVal2, setSwitchVal2] = useState(false);
  const [segment, setSegment] = useState(0);
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>

      {/* Buttons */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Buttons</Text>
        <View style={styles.groupBody}>
          <TouchableOpacity style={styles.btnContained} activeOpacity={0.85}>
            <Text style={styles.btnContainedText}>Contained (primäre Aktion)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutlined} activeOpacity={0.85}>
            <Text style={styles.btnOutlinedText}>Outlined</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnText} activeOpacity={0.85}>
            <Text style={styles.btnTextLabel}>Text Button</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDanger} activeOpacity={0.85}>
            <Text style={styles.btnDangerText}>Danger / Delete</Text>
          </TouchableOpacity>
          <View style={styles.inlineRow}>
            <TouchableOpacity style={[styles.btnContained, { flex: 1 }]} activeOpacity={0.85}>
              <Text style={styles.btnContainedText}>Speichern</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOutlined, { flex: 1 }]} activeOpacity={0.85}>
              <Text style={styles.btnOutlinedText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Toggle / Switch */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Toggles</Text>
        <View style={styles.card}>
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>WLAN aktivieren</Text>
            <Switch
              value={switchVal}
              onValueChange={setSwitchVal}
              trackColor={{ false: '#b0bec5', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Bluetooth</Text>
            <Switch
              value={switchVal2}
              onValueChange={setSwitchVal2}
              trackColor={{ false: '#b0bec5', true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* Tab-Bar / Segmented */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Tabs</Text>
        <View style={styles.tabBar}>
          {['Täglich', 'Wöchentlich', 'Monatlich'].map((label, i) => (
            <TouchableOpacity
              key={label}
              style={[styles.tab, segment === i && styles.tabActive]}
              onPress={() => setSegment(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, segment === i && styles.tabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Inputs */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Text Fields</Text>
        <View style={styles.card}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Benutzername</Text>
            <TextInput
              style={styles.input}
              placeholder="Outlined Input"
              placeholderTextColor="#90a4ae"
              value={text}
              onChangeText={setText}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Passwort</Text>
            <TextInput
              style={styles.input}
              placeholder="Passwort eingeben"
              placeholderTextColor="#90a4ae"
              secureTextEntry
            />
          </View>
        </View>
      </View>

      {/* List */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>List Items</Text>
        <View style={styles.card}>
          {[
            { icon: '🔔', label: 'Mitteilungen', value: 'Banner' },
            { icon: '🔒', label: 'Datenschutz', value: '' },
            { icon: '🎨', label: 'Darstellung', value: 'Hell' },
          ].map((row, i, arr) => (
            <React.Fragment key={row.label}>
              <TouchableOpacity style={styles.listRow} activeOpacity={0.7}>
                <Text style={styles.listIcon}>{row.icon}</Text>
                <Text style={[styles.listLabel, { flex: 1 }]}>{row.label}</Text>
                {row.value ? <Text style={styles.listValue}>{row.value}</Text> : null}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Dialog-Style */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Dialog / Modal Actions</Text>
        <View style={styles.dialogBox}>
          <Text style={styles.dialogTitle}>Möchten Sie fortfahren?</Text>
          <Text style={styles.dialogMessage}>
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity style={styles.btnOutlined} activeOpacity={0.85}>
              <Text style={styles.btnOutlinedText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnContained} activeOpacity={0.85}>
              <Text style={styles.btnContainedText}>Bestätigen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Web-Stil — keine nativen APIs, läuft in jedem Browser
        </Text>
      </View>
    </View>
  );
}

const WEB_BLUE = COLORS.primary;
const WEB_RED = '#d32f2f';

const styles = StyleSheet.create({
  container: { gap: 24 },

  group: { gap: 8 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingLeft: 2,
  },
  groupBody: { gap: 10 },

  // Buttons – Material-inspired
  btnContained: {
    backgroundColor: WEB_BLUE,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: WEB_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  btnContainedText: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.4 },

  btnOutlined: {
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: WEB_BLUE,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlinedText: { color: WEB_BLUE, fontSize: 14, fontWeight: '600', letterSpacing: 0.4 },

  btnText: { paddingVertical: 10, alignItems: 'center' },
  btnTextLabel: { color: WEB_BLUE, fontSize: 14, fontWeight: '600', letterSpacing: 0.4 },

  btnDanger: {
    backgroundColor: WEB_RED + '12',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WEB_RED + '40',
  },
  btnDangerText: { color: WEB_RED, fontSize: 14, fontWeight: '600' },

  inlineRow: { flexDirection: 'row', gap: 10 },

  // Card container
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#f0f0f0' },

  // List
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  listIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  listLabel: { fontSize: 14, color: '#212121' },
  listValue: { fontSize: 14, color: '#757575' },
  chevron: { fontSize: 18, color: '#bdbdbd' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: WEB_BLUE, backgroundColor: WEB_BLUE + '08' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#757575' },
  tabTextActive: { color: WEB_BLUE, fontWeight: '700' },

  // Input
  inputWrap: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    fontSize: 14,
    color: '#212121',
    paddingVertical: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#e0e0e0',
  },

  // Dialog
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dialogTitle: { fontSize: 16, fontWeight: '700', color: '#212121' },
  dialogMessage: { fontSize: 14, color: '#616161', lineHeight: 20 },
  dialogActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },

  footer: { alignItems: 'center' },
  footerText: { fontSize: 11, color: COLORS.textHint, textAlign: 'center' },
});
