import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, spacing, radius } from './design-tokens';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function QuickAction({ icon, label, onPress, disabled }: QuickActionProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing(2),
    width: 72,
  },
  disabled: {
    opacity: 0.4,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
