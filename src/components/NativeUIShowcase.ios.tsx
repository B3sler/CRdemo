import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';

/**
 * iOS-spezifische UI-Elemente im Apple Human Interface Guidelines Stil.
 * Dateiname: NativeUIShowcase.ios.tsx
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

          {/* Filled – primäre Aktion */}
          <TouchableOpacity style={styles.btnFilled} activeOpacity={0.75}>
            <Text style={styles.btnFilledText}>Filled  (primäre Aktion)</Text>
          </TouchableOpacity>

          {/* Tinted */}
          <TouchableOpacity style={styles.btnTinted} activeOpacity={0.75}>
            <Text style={styles.btnTintedText}>Tinted</Text>
          </TouchableOpacity>

          {/* Bordered / Gray */}
          <TouchableOpacity style={styles.btnGray} activeOpacity={0.75}>
            <Text style={styles.btnGrayText}>Gray</Text>
          </TouchableOpacity>

          {/* Plain / Link */}
          <TouchableOpacity activeOpacity={0.5}>
            <Text style={styles.btnPlain}>Plain (Link-Stil)</Text>
          </TouchableOpacity>

          {/* Destructive */}
          <TouchableOpacity style={styles.btnDestructive} activeOpacity={0.75}>
            <Text style={styles.btnDestructiveText}>Destructive</Text>
          </TouchableOpacity>

          <View style={styles.inlineRow}>
            <TouchableOpacity style={[styles.btnFilled, { flex: 1 }]} activeOpacity={0.75}>
              <Text style={styles.btnFilledText}>Sichern</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnGray, { flex: 1 }]} activeOpacity={0.75}>
              <Text style={styles.btnGrayText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Switches & Toggle */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Switches</Text>
        <View style={styles.groupedList}>
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>WLAN</Text>
            <Switch
              value={switchVal}
              onValueChange={setSwitchVal}
              trackColor={{ false: '#e5e5ea', true: '#34c759' }}
              thumbColor="#fff"
              ios_backgroundColor="#e5e5ea"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Bluetooth</Text>
            <Switch
              value={switchVal2}
              onValueChange={setSwitchVal2}
              trackColor={{ false: '#e5e5ea', true: '#34c759' }}
              thumbColor="#fff"
              ios_backgroundColor="#e5e5ea"
            />
          </View>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Segmented Control</Text>
        <View style={styles.segmented}>
          {['Täglich', 'Wöchentlich', 'Monatlich'].map((label, i) => (
            <TouchableOpacity
              key={label}
              style={[styles.segment, segment === i && styles.segmentActive]}
              onPress={() => setSegment(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, segment === i && styles.segmentTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Text Field */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Text Fields</Text>
        <View style={styles.groupedList}>
          <View style={styles.listRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Rounded Rect"
              placeholderTextColor="#8e8e93"
              value={text}
              onChangeText={setText}
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.listRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Passwort"
              placeholderTextColor="#8e8e93"
              secureTextEntry
            />
          </View>
        </View>
      </View>

      {/* List Rows */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>List / Table View Rows</Text>
        <View style={styles.groupedList}>
          {[
            { icon: '🔔', label: 'Mitteilungen', value: 'Banner' },
            { icon: '🔒', label: 'Datenschutz', value: '' },
            { icon: '🎨', label: 'Darstellung', value: 'Hell' },
          ].map((row, i, arr) => (
            <React.Fragment key={row.label}>
              <TouchableOpacity style={styles.listRow} activeOpacity={0.6}>
                <Text style={styles.listIcon}>{row.icon}</Text>
                <Text style={[styles.listLabel, { flex: 1 }]}>{row.label}</Text>
                {row.value ? <Text style={styles.listValue}>{row.value}</Text> : null}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Alert-Style Buttons */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Alert Actions</Text>
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>Möchten Sie fortfahren?</Text>
          <Text style={styles.alertMessage}>
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Text>
          <View style={styles.alertDivider} />
          <View style={styles.alertActions}>
            <TouchableOpacity style={[styles.alertBtn, { borderRightWidth: 0.5, borderRightColor: '#c8c8cc' }]} activeOpacity={0.6}>
              <Text style={styles.alertBtnCancel}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alertBtn} activeOpacity={0.6}>
              <Text style={styles.alertBtnOk}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Alle Elemente folgen den Apple Human Interface Guidelines
        </Text>
      </View>
    </View>
  );
}

const IOS_BLUE = '#007aff';
const IOS_RED = '#ff3b30';
const IOS_GREEN = '#34c759';
const IOS_BG = '#f2f2f7';
const IOS_CARD = '#ffffff';
const IOS_BORDER = '#c8c8cc';
const IOS_LABEL = '#1c1c1e';
const IOS_SECONDARY = '#8e8e93';
const MONO = 'Menlo';

const styles = StyleSheet.create({
  container: { gap: 24 },

  // Group
  group: { gap: 8 },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: IOS_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  groupBody: { gap: 10 },

  // Buttons
  btnFilled: {
    backgroundColor: IOS_BLUE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnFilledText: { color: '#fff', fontSize: 17, fontWeight: '600' },

  btnTinted: {
    backgroundColor: IOS_BLUE + '1a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnTintedText: { color: IOS_BLUE, fontSize: 17, fontWeight: '600' },

  btnGray: {
    backgroundColor: '#e5e5ea',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnGrayText: { color: IOS_LABEL, fontSize: 17, fontWeight: '600' },

  btnPlain: {
    color: IOS_BLUE,
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    paddingVertical: 6,
  },

  btnDestructive: {
    backgroundColor: IOS_RED + '1a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDestructiveText: { color: IOS_RED, fontSize: 17, fontWeight: '600' },

  inlineRow: { flexDirection: 'row', gap: 10 },

  // Grouped list (Settings-style)
  groupedList: {
    backgroundColor: IOS_CARD,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: IOS_BORDER,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 44,
  },
  listIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  listLabel: { fontSize: 17, color: IOS_LABEL },
  listValue: { fontSize: 17, color: IOS_SECONDARY },
  chevron: { fontSize: 20, color: IOS_BORDER, fontWeight: '300' },
  separator: { height: 0.5, backgroundColor: IOS_BORDER, marginLeft: 56 },

  // Segmented Control
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    borderRadius: 9,
    padding: 2,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 7,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: IOS_CARD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  segmentText: { fontSize: 13, fontWeight: '500', color: IOS_LABEL },
  segmentTextActive: { fontWeight: '600' },

  // Text Input
  textInput: {
    flex: 1,
    fontSize: 17,
    color: IOS_LABEL,
    paddingVertical: 0,
  },

  // Alert
  alertBox: {
    backgroundColor: IOS_CARD,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: IOS_BORDER,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: IOS_LABEL,
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: IOS_LABEL,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    lineHeight: 18,
  },
  alertDivider: { height: 0.5, backgroundColor: IOS_BORDER },
  alertActions: { flexDirection: 'row' },
  alertBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  alertBtnCancel: { fontSize: 17, color: IOS_BLUE },
  alertBtnOk: { fontSize: 17, fontWeight: '600', color: IOS_BLUE },

  // Footer
  footer: { alignItems: 'center' },
  footerText: { fontSize: 11, color: IOS_SECONDARY, textAlign: 'center' },
});
