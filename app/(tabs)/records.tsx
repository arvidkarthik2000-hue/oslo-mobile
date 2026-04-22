/**
 * Records tab — category rows with counts. Tap category → filtered list.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../../components/design-tokens';
import { CategoryRow } from '../../components';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

const CATEGORIES = [
  { key: 'lab_report', label: 'Lab Reports', icon: '🧪' },
  { key: 'prescription', label: 'Prescriptions', icon: '💊' },
  { key: 'imaging_report', label: 'Imaging', icon: '🩻' },
  { key: 'discharge_summary', label: 'Discharge Summaries', icon: '🏥' },
  { key: 'consultation_note', label: 'Consultation Notes', icon: '🩺' },
  { key: 'other', label: 'Other', icon: '📋' },
];

export default function RecordsScreen() {
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      let path = '/documents/counts';
      if (profileId) path += `?profile_id=${profileId}`;
      const res = await api.get<{ counts: Record<string, number> }>(path);
      setCounts(res.counts || {});
    } catch (err) {
      console.error('Failed to load counts:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalDocs = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Records</Text>
          <Text style={styles.subtitle}>
            {totalDocs} document{totalDocs !== 1 ? 's' : ''} stored
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : totalDocs === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyText}>No records uploaded yet</Text>
          </View>
        ) : (
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => {
              const count = counts[cat.key] || 0;
              if (count === 0) return null;
              return (
                <CategoryRow
                  key={cat.key}
                  title={`${cat.icon}  ${cat.label}`}
                  count={count}
                  onPress={() => {
                    router.push({
                      pathname: '/records/[category]',
                      params: { category: cat.key },
                    });
                  }}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingBottom: spacing(10) },
  header: {
    padding: spacing(5),
    paddingBottom: spacing(2),
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(10),
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing(3) },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  categories: {
    padding: spacing(5),
    gap: spacing(1),
  },
});
