/**
 * Trends tab — MetricCards grid with sparklines, filter by system.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { FilterChip, StatusDot, Sparkline } from '../../components';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

const SYSTEMS = [
  { key: '', label: 'All' },
  { key: 'cardiovascular', label: 'Cardiovascular' },
  { key: 'metabolic', label: 'Metabolic' },
  { key: 'renal', label: 'Renal' },
  { key: 'liver', label: 'Liver' },
  { key: 'endocrine', label: 'Endocrine' },
  { key: 'inflammatory', label: 'Inflammatory' },
];

interface MetricData {
  test_name: string;
  latest_value: number | null;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
  flag: string | null;
  sparkline: number[];
  data_points: number;
}

const flagToStatus = (flag?: string | null) => {
  switch (flag) {
    case 'watch': return 'watch' as const;
    case 'flag': case 'critical': return 'flag' as const;
    default: return 'ok' as const;
  }
};

export default function TrendsScreen() {
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [system, setSystem] = useState('');
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrends = useCallback(async () => {
    if (!profileId) return;
    try {
      let path = `/trends/${profileId}`;
      if (system) path += `?system=${system}`;
      const res = await api.get<{ metrics: MetricData[]; total_tests: number }>(path);
      setMetrics(res.metrics || []);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profileId, system]);

  useEffect(() => {
    setLoading(true);
    fetchTrends();
  }, [fetchTrends]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrends();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Trends</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filters}
      >
        {SYSTEMS.map((s) => (
          <FilterChip
            key={s.key}
            label={s.label}
            active={system === s.key}
            onPress={() => setSystem(s.key)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : metrics.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyTitle}>No trend data yet</Text>
          <Text style={styles.emptyText}>
            Upload multiple lab reports to see your health metrics over time.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {metrics.map((m) => (
            <TouchableOpacity
              key={m.test_name}
              style={styles.metricCard}
              activeOpacity={0.7}
            >
              <View style={styles.metricHeader}>
                <Text style={styles.metricName} numberOfLines={1}>
                  {m.test_name}
                </Text>
                <StatusDot status={flagToStatus(m.flag)} />
              </View>
              <View style={styles.metricValue}>
                <Text style={styles.valueText}>
                  {m.latest_value != null ? m.latest_value : '—'}
                </Text>
                <Text style={styles.unitText}>{m.unit || ''}</Text>
              </View>
              {m.sparkline.length >= 2 && (
                <View style={styles.sparkWrap}>
                  <Sparkline
                    data={m.sparkline}
                    width={140}
                    height={28}
                    color={
                      m.flag === 'flag' || m.flag === 'critical'
                        ? colors.statusFlag
                        : m.flag === 'watch'
                          ? colors.statusWatch
                          : colors.accent
                    }
                  />
                </View>
              )}
              <Text style={styles.dataPoints}>
                {m.data_points} reading{m.data_points !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  filtersScroll: {
    maxHeight: 44,
  },
  filters: {
    flexDirection: 'row',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing(4),
    gap: spacing(3),
    paddingBottom: spacing(10),
  },
  metricCard: {
    width: '47%',
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  metricName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing(2),
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing(1),
  },
  valueText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  unitText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  sparkWrap: {
    marginTop: spacing(3),
    alignItems: 'center',
  },
  dataPoints: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: spacing(2),
  },
});
