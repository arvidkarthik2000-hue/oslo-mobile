import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from './design-tokens';

interface Props {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  count?: number;
  onPress?: () => void;
}

export function CategoryRow({ icon, title, subtitle, count, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {count !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  text: { flex: 1 },
  title: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badge: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing(2),
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
});
