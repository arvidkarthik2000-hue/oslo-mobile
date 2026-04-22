import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from './design-tokens';
import type { StatusLevel } from './StatusDot';

const pillColors: Record<StatusLevel, { bg: string; fg: string }> = {
  ok: { bg: colors.statusOkBg, fg: colors.statusOk },
  watch: { bg: colors.statusWatchBg, fg: colors.statusWatch },
  flag: { bg: colors.statusFlagBg, fg: colors.statusFlag },
};

export function StatusPill({ status, text }: { status: StatusLevel; text: string }) {
  const { bg, fg } = pillColors[status];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing(2),
    paddingVertical: 2,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, fontWeight: '500' },
});
