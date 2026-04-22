import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from './design-tokens';

interface Props {
  text: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ text, action, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{text.toUpperCase()}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  action: { fontSize: 12, fontWeight: '500', color: colors.accent },
});
