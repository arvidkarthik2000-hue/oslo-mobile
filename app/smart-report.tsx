/**
 * Smart Report screen — AI-synthesized health summary across systems.
 * Accessed from Home tab "View your Smart Report" card.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius } from '../components/design-tokens';
import { StatusDot } from '../components';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';

interface Section {
  system: string;
  status: string;
  key_values: Array<{ name: string; value: string; flag?: string }>;
}

export default function SmartReportScreen() {
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    if (!profileId) {
      setError('No profile found.');
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<{
        report_markdown: string;
        sections: Section[] | null;
        generated_at: string;
        cached: boolean;
      }>(`/smart-report/${profileId}`);

      setMarkdown(res.report_markdown);
      setSections(res.sections || []);
    } catch (err: any) {
      setError(err?.detail || 'Smart Report unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSystem = (system: string) => {
    setExpandedSystems((prev) => {
      const next = new Set(prev);
      if (next.has(system)) next.delete(system);
      else next.add(system);
      return next;
    });
  };

  const handleShare = async () => {
    if (!markdown) return;
    try {
      await Share.share({
        message: markdown,
        title: 'OSLO Smart Report',
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const statusToLevel = (status: string) => {
    switch (status) {
      case 'watch': return 'watch' as const;
      case 'flag': case 'alert': return 'flag' as const;
      default: return 'ok' as const;
    }
  };

  const systemEmoji = (system: string) => {
    const map: Record<string, string> = {
      cardiovascular: '❤️',
      liver: '🫁',
      renal: '🫘',
      metabolic: '🔥',
      inflammatory: '🩸',
      hormonal: '⚡',
    };
    return map[system.toLowerCase()] || '🔬';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Generating Smart Report...</Text>
          <Text style={styles.loadingHint}>This may take up to 30 seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); setError(null); loadReport(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🧠 Smart Report</Text>
          <Text style={styles.subtitle}>
            AI-synthesized summary of your health records
          </Text>
        </View>

        {/* System cards */}
        {sections.length > 0 ? (
          sections.map((section) => (
            <TouchableOpacity
              key={section.system}
              style={styles.systemCard}
              onPress={() => toggleSystem(section.system)}
              activeOpacity={0.7}
            >
              <View style={styles.systemHeader}>
                <Text style={styles.systemEmoji}>
                  {systemEmoji(section.system)}
                </Text>
                <Text style={styles.systemName}>
                  {section.system.charAt(0).toUpperCase() + section.system.slice(1)}
                </Text>
                <StatusDot status={statusToLevel(section.status)} />
                <Text style={styles.expandIcon}>
                  {expandedSystems.has(section.system) ? '▼' : '▶'}
                </Text>
              </View>

              {expandedSystems.has(section.system) && section.key_values && (
                <View style={styles.keyValues}>
                  {section.key_values.map((kv, i) => (
                    <View key={i} style={styles.kvRow}>
                      <Text style={styles.kvName}>{kv.name}</Text>
                      <Text style={styles.kvValue}>{kv.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : markdown ? (
          <View style={styles.markdownWrap}>
            <Text style={styles.markdownText}>{markdown}</Text>
          </View>
        ) : null}

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>📤 Share with doctor</Text>
        </TouchableOpacity>
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
    padding: spacing(8),
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing(4),
    fontWeight: '500',
  },
  loadingHint: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: spacing(2),
  },
  errorIcon: { fontSize: 48, marginBottom: spacing(3) },
  errorText: {
    fontSize: 15,
    color: colors.statusFlag,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing(4),
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
  },
  retryText: {
    color: colors.textOnDark,
    fontWeight: '500',
  },
  scroll: { paddingBottom: spacing(10) },
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
  systemCard: {
    marginHorizontal: spacing(5),
    marginTop: spacing(3),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  systemEmoji: { fontSize: 20 },
  systemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  keyValues: {
    marginTop: spacing(3),
    paddingTop: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.borderTertiary,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing(1.5),
  },
  kvName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  kvValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  markdownWrap: {
    padding: spacing(5),
  },
  markdownText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  shareBtn: {
    marginHorizontal: spacing(5),
    marginTop: spacing(5),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textOnDark,
  },
});
