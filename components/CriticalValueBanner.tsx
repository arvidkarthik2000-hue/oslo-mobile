/**
 * CriticalValueBanner — red banner shown when critical flags are present.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from './design-tokens';

interface CriticalValueBannerProps {
  flags: string[];
}

export function CriticalValueBanner({ flags }: CriticalValueBannerProps) {
  if (!flags || flags.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Values requiring attention</Text>
        {flags.map((f, i) => (
          <Text key={i} style={styles.flag}>
            • {f}
          </Text>
        ))}
        <Text style={styles.disclaimer}>
          Please consult your doctor for clinical interpretation.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing(3),
    margin: spacing(4),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.statusFlagBg,
    borderWidth: 1,
    borderColor: colors.statusFlag + '30',
  },
  icon: { fontSize: 20 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.statusFlag,
    marginBottom: spacing(1),
  },
  flag: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: spacing(2),
    fontStyle: 'italic',
  },
});
