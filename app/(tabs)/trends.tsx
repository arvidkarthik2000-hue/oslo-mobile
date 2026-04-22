/**
 * Trends tab — placeholder shell for Day 4 build.
 * Filter chips + empty state pointing to upload flow.
 */
import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { colors, spacing } from '../../components/design-tokens';
import { FilterChip } from '../../components';

const SYSTEMS = ['All', 'Cardiovascular', 'Metabolic', 'Renal', 'Liver', 'Endocrine', 'Inflammatory'];

export default function TrendsScreen() {
  const [active, setActive] = React.useState('All');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Trends</Text>
      </View>

      <View style={styles.filters}>
        {SYSTEMS.map((s) => (
          <FilterChip
            key={s}
            label={s}
            active={active === s}
            onPress={() => setActive(s)}
          />
        ))}
      </View>

      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📈</Text>
        <Text style={styles.emptyTitle}>Trends coming soon</Text>
        <Text style={styles.emptyText}>
          Upload multiple lab reports to see your health metrics over time.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    padding: spacing(5),
    paddingBottom: spacing(2),
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(3),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(8),
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing(3) },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing(2),
    lineHeight: 20,
  },
});
