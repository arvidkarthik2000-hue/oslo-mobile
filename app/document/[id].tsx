/**
 * Document detail screen — shows classification, extraction data,
 * explain button, and correction option.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { StatusPill } from '../../components/StatusPill';
import { api } from '../../lib/api';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const data = await api.get<any>(`/documents/${id}`);
      setDoc(data);
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!id) return;
    setExplaining(true);
    try {
      const res = await api.post<{
        explanation_markdown: string;
        critical_flags: string[];
        urgency: string;
      }>(`/documents/${id}/explain`);
      setExplanation(res.explanation_markdown);
    } catch (err: any) {
      setExplanation('Explanation unavailable. Tap to retry.');
    } finally {
      setExplaining(false);
    }
  };

  const flagToStatus = (flag?: string) => {
    switch (flag) {
      case 'watch': return 'watch' as const;
      case 'flag': case 'critical': return 'flag' as const;
      default: return 'ok' as const;
    }
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

  if (!doc) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Document not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExt = doc.extractions?.find((e: any) => e.is_current);
  const tests = currentExt?.json_payload?.tests || [];
  const medications = currentExt?.json_payload?.medications || [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.classBadge}>
            <Text style={styles.classText}>
              {(doc.classified_as || 'other').replace(/_/g, ' ')}
            </Text>
          </View>
          {doc.provider_name && (
            <Text style={styles.provider}>{doc.provider_name}</Text>
          )}
          <Text style={styles.date}>
            {doc.document_date
              ? new Date(doc.document_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : new Date(doc.uploaded_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
          </Text>
        </View>

        {/* Lab Values Table */}
        {doc.classified_as === 'lab_report' && tests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lab Values</Text>
            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 3 }]}>Test</Text>
              <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>Value</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'center' }]}>Unit</Text>
              <Text style={[styles.th, { flex: 2, textAlign: 'center' }]}>Ref</Text>
              <Text style={[styles.th, { flex: 1 }]}></Text>
            </View>
            {tests.map((t: any, i: number) => (
              <View
                key={i}
                style={[styles.row, i % 2 === 1 && styles.rowAlt]}
              >
                <Text style={[styles.td, { flex: 3 }]} numberOfLines={2}>
                  {t.test_name}
                </Text>
                <Text
                  style={[
                    styles.td,
                    { flex: 2, textAlign: 'right', fontWeight: '600' },
                  ]}
                >
                  {t.value_num ?? '—'}
                </Text>
                <Text style={[styles.td, { flex: 1.5, textAlign: 'center' }]}>
                  {t.unit || ''}
                </Text>
                <Text style={[styles.td, { flex: 2, textAlign: 'center' }]}>
                  {t.ref_low != null && t.ref_high != null
                    ? `${t.ref_low}–${t.ref_high}`
                    : '—'}
                </Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <StatusPill status={flagToStatus(t.flag)} text={t.flag === 'critical' ? 'Critical' : t.flag === 'flag' ? 'High' : t.flag === 'watch' ? 'Watch' : 'Normal'} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Prescription */}
        {doc.classified_as === 'prescription' && medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medications</Text>
            {medications.map((m: any, i: number) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medName}>{m.drug_name}</Text>
                <Text style={styles.medDetail}>
                  {m.dose} · {m.frequency}
                  {m.duration ? ` · ${m.duration}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Compare to Previous */}
        {doc.classified_as === 'lab_report' && (
          <View style={styles.section}>
            {comparison ? (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>📊 Comparison with previous</Text>
                {comparison.previous_date && (
                  <Text style={styles.compareDate}>
                    vs {new Date(comparison.previous_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {comparison.provider_name ? ` · ${comparison.provider_name}` : ''}
                  </Text>
                )}
                {comparison.diffs?.map((d: any, i: number) => (
                  <View key={i} style={styles.diffRow}>
                    <Text style={styles.diffName}>{d.test_name}</Text>
                    <Text style={[
                      styles.diffChange,
                      { color: d.change_pct > 0 ? colors.statusFlag : d.change_pct < 0 ? colors.accent : colors.textSecondary }
                    ]}>
                      {d.previous_value} → {d.current_value} ({d.change_pct > 0 ? '+' : ''}{d.change_pct?.toFixed(1)}%)
                    </Text>
                  </View>
                ))}
                {(!comparison.diffs || comparison.diffs.length === 0) && (
                  <Text style={styles.noDiff}>No previous report found for comparison.</Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.explainBtn}
                onPress={async () => {
                  setComparing(true);
                  try {
                    const res = await api.get<any>(`/documents/${id}/compare`);
                    setComparison(res);
                  } catch {
                    setComparison({ diffs: [] });
                  } finally {
                    setComparing(false);
                  }
                }}
                disabled={comparing}
              >
                {comparing ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.explainText}>📊 Compare to previous report</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Explain Button */}
        {doc.classified_as === 'lab_report' && (
          <View style={styles.section}>
            {explanation ? (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>🧠 Understanding your report</Text>
                <Text style={styles.explanationText}>{explanation}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.explainBtn}
                onPress={handleExplain}
                disabled={explaining}
              >
                {explaining ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.explainText}>✨ Explain this report</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Fallback for documents with no usable extraction */}
        {tests.length === 0 && medications.length === 0 && (
          <View style={styles.section}>
            <View style={styles.emptyExtraction}>
              <Text style={styles.emptyExtractionIcon}>📄</Text>
              <Text style={styles.emptyExtractionTitle}>
                {doc.classified_as === 'other'
                  ? "This document couldn't be automatically analyzed"
                  : 'No extraction data available'}
              </Text>
              <Text style={styles.emptyExtractionText}>
                {doc.s3_key ? `File: ${doc.s3_key.split('/').pop() || 'document'}` : 'Document uploaded'}
                {'\n'}
                {doc.uploaded_at
                  ? `Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : ''}
                {doc.byte_size ? `\nSize: ${(doc.byte_size / 1024).toFixed(1)} KB` : ''}
              </Text>
            </View>
          </View>
        )}
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
  classBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    marginBottom: spacing(2),
  },
  classText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'capitalize',
  },
  provider: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing(1),
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
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  th: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  rowAlt: {
    backgroundColor: colors.bgSecondary,
  },
  td: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  medRow: {
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  medName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  medDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  explainBtn: {
    padding: spacing(4),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  explainText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.accent,
  },
  explanationBox: {
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: spacing(2),
  },
  explanationText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  compareDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing(3),
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  diffName: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  diffChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  noDiff: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyExtraction: {
    alignItems: 'center' as const,
    padding: spacing(6),
  },
  emptyExtractionIcon: { fontSize: 48, marginBottom: spacing(3) },
  emptyExtractionTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: spacing(2),
  },
  emptyExtractionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
