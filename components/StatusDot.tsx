import React from 'react';
import { View } from 'react-native';
import { colors } from './design-tokens';

export type StatusLevel = 'ok' | 'watch' | 'flag';

const dotColor: Record<StatusLevel, string> = {
  ok: colors.statusOk,
  watch: colors.statusWatch,
  flag: colors.statusFlag,
};

export function StatusDot({ status }: { status: StatusLevel }) {
  return (
    <View
      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor[status] }}
    />
  );
}
