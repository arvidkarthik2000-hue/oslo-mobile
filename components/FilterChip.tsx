import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from './design-tokens';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active ? styles.active : styles.inactive]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? colors.accentStrong : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    marginRight: spacing(2),
  },
  active: { backgroundColor: colors.accentMuted },
  inactive: { backgroundColor: colors.bgTertiary },
  label: { fontSize: 13, fontWeight: '500' },
});
