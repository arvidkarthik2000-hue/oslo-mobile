/**
 * Trend detail screen — full-screen line chart with ref-band overlay.
 * Accessed by tapping a MetricCard on the Trends tab.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Svg, { Line, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { colors, spacing, radius } from '../../components/design-tokens';
import { StatusDot } from '../../components';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 50 };
const CHART_WIDTH = SCREEN_WIDTH - spacing(10);
const CHART_HEIGHT = 220;
const PLOT_WIDTH = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

interface DataPoint {
  value: number;
  observed_at: string;
  flag?: string;
}

interface TrendData {
  test_name: string;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
  flag: string | null;
  data_points: DataPoint[];
}

export default function TrendDetailScreen() {
  const { test } = useLocalSearchParams<{ test: string }>();
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrend();
  }, [test]);

  const loadTrend = async () => {
    if (!profileId || !test) return;
    try {
      // Fetch all trends and find the one matching this test
      const res = await api.get<{ metrics: any[] }>(`/trends/${profileId}`);
      const metric = res.metrics?.find(
        (m: any) => m.test_name === decodeURIComponent(test)
      );
      if (metric) {
        // Build data points from sparkline + latest value
        const points: DataPoint[] = metric.sparkline.map((v: number, i: number) => ({
          value: v,
          observed_at: new Date(
            Date.now() - (metric.sparkline.length - 1 - i) * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          flag: i === metric.sparkline.length - 1 ? metric.flag : undefined,
        }));
        setData({
          test_name: metric.test_name,
          unit: metric.unit,
          ref_low: metric.ref_low,
          ref_high: metric.ref_high,
          flag: metric.flag,
          data_points: points,
        });
      }
    } catch (err) {
      console.error('Failed to load trend:', err);
    } finally {
      setLoading(false);
    }
  };

  const flagToStatus = (flag?: string | null) => {
    switch (flag) {
      case 'watch': return 'watch' as const;
      case 'flag': case 'critical': return 'flag' as const;
      default: return 'ok' as const;
    }
  };

  const renderChart = () => {
    if (!data || data.data_points.length < 2) return null;

    const values = data.data_points.map((p) => p.value);
    const allValues = [...values];
    if (data.ref_low != null) allValues.push(data.ref_low);
    if (data.ref_high != null) allValues.push(data.ref_high);

    const minVal = Math.min(...allValues) * 0.9;
    const maxVal = Math.max(...allValues) * 1.1;
    const range = maxVal - minVal || 1;

    const scaleX = (i: number) =>
      CHART_PADDING.left + (i / (values.length - 1)) * PLOT_WIDTH;
    const scaleY = (v: number) =>
      CHART_PADDING.top + PLOT_HEIGHT - ((v - minVal) / range) * PLOT_HEIGHT;

    // Ref band
    const refBandY =
      data.ref_low != null && data.ref_high != null
        ? {
            top: scaleY(data.ref_high),
            bottom: scaleY(data.ref_low),
          }
        : null;

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Reference band */}
        {refBandY && (
          <Rect
            x={CHART_PADDING.left}
            y={refBandY.top}
            width={PLOT_WIDTH}
            height={refBandY.bottom - refBandY.top}
            fill={colors.statusOkBg}
            opacity={0.5}
          />
        )}

        {/* Ref range labels */}
        {data.ref_high != null && (
          <SvgText
            x={CHART_PADDING.left - 6}
            y={scaleY(data.ref_high) + 4}
            fontSize={10}
            fill={colors.textTertiary}
            textAnchor="end"
          >
            {data.ref_high}
          </SvgText>
        )}
        {data.ref_low != null && (
          <SvgText
            x={CHART_PADDING.left - 6}
            y={scaleY(data.ref_low) + 4}
            fontSize={10}
            fill={colors.textTertiary}
            textAnchor="end"
          >
            {data.ref_low}
          </SvgText>
        )}

        {/* Data line */}
        {values.map((v, i) => {
          if (i === 0) return null;
          return (
            <Line
              key={`line-${i}`}
              x1={scaleX(i - 1)}
              y1={scaleY(values[i - 1])}
              x2={scaleX(i)}
              y2={scaleY(v)}
              stroke={colors.accent}
              strokeWidth={2}
            />
          );
        })}

        {/* Data points */}
        {values.map((v, i) => {
          const pointFlag = data.data_points[i]?.flag;
          const pointColor =
            pointFlag === 'flag' || pointFlag === 'critical'
              ? colors.statusFlag
              : pointFlag === 'watch'
                ? colors.statusWatch
                : colors.accent;
          return (
            <Circle
              key={`point-${i}`}
              cx={scaleX(i)}
              cy={scaleY(v)}
              r={5}
              fill={pointColor}
              stroke="#fff"
              strokeWidth={2}
            />
          );
        })}

        {/* X-axis date labels */}
        {data.data_points.map((p, i) => {
          if (data.data_points.length > 6 && i % 2 !== 0) return null;
          const d = new Date(p.observed_at);
          return (
            <SvgText
              key={`date-${i}`}
              x={scaleX(i)}
              y={CHART_HEIGHT - 8}
              fontSize={9}
              fill={colors.textTertiary}
              textAnchor="middle"
            >
              {d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>No trend data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const latestPoint = data.data_points[data.data_points.length - 1];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{data.test_name}</Text>
            <StatusDot status={flagToStatus(data.flag)} />
          </View>
          <Text style={styles.subtitle}>
            Latest: {latestPoint?.value} {data.unit || ''}
            {data.ref_low != null && data.ref_high != null
              ? `  ·  Ref: ${data.ref_low}–${data.ref_high}`
              : ''}
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {renderChart()}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Your values</Text>
            </View>
            {data.ref_low != null && (
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: colors.statusOkBg }]} />
                <Text style={styles.legendText}>Reference range</Text>
              </View>
            )}
          </View>
        </View>

        {/* All readings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Readings</Text>
          {data.data_points
            .slice()
            .reverse()
            .map((p, i) => (
              <View key={i} style={styles.readingRow}>
                <Text style={styles.readingDate}>
                  {new Date(p.observed_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.readingValue}>
                  {p.value} {data.unit || ''}
                </Text>
                <StatusDot status={flagToStatus(p.flag)} />
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { paddingBottom: spacing(10) },
  errorText: {
    fontSize: 16,
    color: colors.statusFlag,
    fontWeight: '500',
  },
  header: {
    padding: spacing(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  back: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: spacing(2),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing(1),
  },
  chartContainer: {
    padding: spacing(4),
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing(5),
    marginTop: spacing(3),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  section: {
    padding: spacing(5),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing(3),
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  readingDate: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  readingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: spacing(3),
  },
});
