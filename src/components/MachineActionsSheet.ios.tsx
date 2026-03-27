/**
 * MachineActionsSheet.ios.tsx
 * Nutzt ActionSheetIOS — nativ, kein Custom-UI.
 * Metro lädt diese Datei automatisch auf iOS.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActionSheetIOS, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { Machine } from '../data/machines';

interface Props {
  machine: Machine;
}

const ACTIONS = [
  { label: 'Wartung melden',         icon: 'construct-outline'    as const, destructive: false },
  { label: 'Störung melden',         icon: 'warning-outline'      as const, destructive: true  },
  { label: 'Techniker anfordern',    icon: 'person-add-outline'   as const, destructive: false },
  { label: 'Als PDF exportieren',    icon: 'share-outline'        as const, destructive: false },
];

export function MachineActionsSheet({ machine }: Props) {
  function openSheet() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: machine.model,
        message: machine.serialNo,
        options: [...ACTIONS.map((a) => a.label), 'Abbrechen'],
        cancelButtonIndex: ACTIONS.length,
        destructiveButtonIndex: ACTIONS.findIndex((a) => a.destructive),
      },
      (index) => {
        if (index === ACTIONS.length) return; // Abbrechen
        const action = ACTIONS[index];
        Alert.alert(
          action.label,
          `Aktion für ${machine.model} (${machine.serialNo}) wird ausgeführt.`,
          [{ text: 'OK' }]
        );
      }
    );
  }

  return (
    <View style={styles.card}>
      {/* iOS-style section header */}
      <Text style={styles.sectionHeader}>SCHNELLAKTIONEN</Text>
      <View style={styles.tableCard}>
        {ACTIONS.map((action, i) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.row, i < ACTIONS.length - 1 && styles.rowDivider]}
            onPress={openSheet}
            activeOpacity={0.5}
          >
            <View style={[styles.iconWrap, action.destructive && styles.iconWrapRed]}>
              <Ionicons
                name={action.icon}
                size={16}
                color={action.destructive ? '#fff' : '#fff'}
              />
            </View>
            <Text style={[styles.rowLabel, action.destructive && styles.rowLabelDestructive]}>
              {action.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionFooter}>Öffnet nativen iOS Action Sheet</Text>
    </View>
  );
}

const IOS_BLUE = '#2B5BE8';
const IOS_RED  = '#FF3B30';

const styles = StyleSheet.create({
  card: { gap: 6 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C6C70',
    letterSpacing: 0.4,
    marginLeft: 16,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: IOS_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapRed: { backgroundColor: IOS_RED },
  rowLabel: { flex: 1, fontSize: 15, color: '#000000' },
  rowLabelDestructive: { color: IOS_RED },
  sectionFooter: { fontSize: 12, color: '#6C6C70', marginLeft: 16 },
});
