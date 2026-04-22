/**
 * Home tab — greeting, recent activity, values to watch, quick actions.
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, radius } from '../../components/design-tokens';
import { QuickAction } from '../../components/QuickAction';
import { StatusPill } from '../../components/StatusPill';
import { AIDisclaimer } from '../../components';
import { OnboardingTooltip } from '../../components/OnboardingTooltip';
import { useAuthStore } from '../../store/auth';
import { useDocumentsStore } from '../../store/documents';
import type { LabTest } from '../../store/documents';
import { api } from '../../lib/api';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const profileId = useAuthStore((s) => s.activeProfileId);
  const documents = useDocumentsStore((s) => s.documents);
  const recent = useDocumentsStore((s) => s.getRecent(3));
  const flagged = useDocumentsStore((s) => s.getFlaggedValues(3));

  React.useEffect(() => {
    if (profileId) {
      api.get<{ medications: any[] }>(`/smart-report/${profileId}/medications`)
        .then((res) => setMedications(res.medications || []))
        .catch(() => {});
    }
  }, [profileId]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Could re-fetch from server; for POC just delay
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file) return;

      // Navigate to upload flow with file info
      router.push({
        pathname: '/upload/review',
        params: {
          uri: file.uri,
          name: file.name || 'document',
          mimeType: file.mimeType || 'application/pdf',
          size: String(file.size || 0),
        },
      });
    } catch (err) {
      Alert.alert('Error', 'Could not pick document. Please try again.');
    }
  };

  const flagToStatus = (flag?: string) => {
    switch (flag) {
      case 'watch': return 'watch' as const;
      case 'flag': case 'critical': return 'flag' as const;
      default: return 'ok' as const;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Onboarding tooltip */}
        <OnboardingTooltip
          id="home-welcome"
          text="👋 Welcome to OSLO! Upload a lab report using the File button below to get started."
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.name}>Demo User</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickAction icon="📷" label="Scan" onPress={() => Alert.alert('Coming soon', 'Camera scanner will be available on Day 3.')} />
          <QuickAction icon="📄" label="File" onPress={pickDocument} />
          <QuickAction icon="🎤" label="Voice" onPress={() => router.push('/timeline/add-note')} />
          <QuickAction icon="📤" label="Share" onPress={() => Alert.alert('Coming soon', 'Share intent handler will be available on Day 3.')} />
        </View>

        {/* Smart Report CTA */}
        {documents.length > 0 && (
          <TouchableOpacity
            style={styles.smartReportCard}
            onPress={() => router.push('/smart-report')}
          >
            <Text style={styles.smartReportTitle}>🧠 View your Smart Report</Text>
            <Text style={styles.smartReportSub}>
              AI-synthesized health summary across all your records
            </Text>
          </TouchableOpacity>
        )}

        {/* Current Medications */}
        {medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 Current Medications</Text>
            {medications.map((med: any, i: number) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medName}>{med.name || med.drug_name}</Text>
                <Text style={styles.medDetail}>
                  {med.dosage || med.dose}{med.frequency ? ` · ${med.frequency}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Values to Watch */}
        {flagged.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Values to Watch</Text>
            {flagged.map((t: LabTest, i: number) => (
              <View key={i} style={styles.watchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.watchName}>{t.test_name}</Text>
                  <Text style={styles.watchValue}>
                    {t.value_num} {t.unit}
                    {t.ref_low != null && t.ref_high != null
                      ? `  (ref: ${t.ref_low}–${t.ref_high})`
                      : ''}
                  </Text>
                </View>
                <StatusPill status={flagToStatus(t.flag)} text={t.flag === 'critical' ? 'Critical' : t.flag === 'flag' ? 'High' : t.flag === 'watch' ? 'Watch' : 'Normal'} />
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {recent.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recent.map((doc) => (
              <TouchableOpacity
                key={doc.document_id}
                style={styles.recentCard}
                onPress={() =>
                  router.push({
                    pathname: '/document/[id]',
                    params: { id: doc.document_id },
                  })
                }
              >
                <Text style={styles.recentIcon}>
                  {doc.classified_as === 'lab_report'
                    ? '🧪'
                    : doc.classified_as === 'prescription'
                      ? '💊'
                      : '📋'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle}>
                    {(doc.classified_as || 'Document')
                      .replace(/_/g, ' ')
                      .replace(/^\w/, (c: string) => c.toUpperCase())}
                  </Text>
                  <Text style={styles.recentSub}>
                    {doc.provider_name || doc.file_name || 'Uploaded'} ·{' '}
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptyText}>
              Upload your first document using the File button above.
            </Text>
          </View>
        )}

        {/* Subscribe Banner */}
        <TouchableOpacity
          style={styles.subscribeBanner}
          onPress={() => router.push('/subscribe')}
        >
          <Text style={styles.subscribeText}>
            ✨ Upgrade to Family Plan — ₹199/month
          </Text>
        </TouchableOpacity>

        {/* Emergency Profile Shortcut */}
        <TouchableOpacity
          style={styles.emergencyCard}
          onPress={() => router.push('/emergency')}
        >
          <Text style={styles.emergencyIcon}>🆘</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Emergency Profile</Text>
            <Text style={styles.emergencySub}>
              Quick access to critical health info
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={styles.settingsLink}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsText}>⚙️ Settings</Text>
        </TouchableOpacity>

        <AIDisclaimer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { paddingBottom: spacing(10) },
  header: {
    padding: spacing(6),
    paddingBottom: spacing(2),
  },
  greeting: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing(1),
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing(5),
    paddingHorizontal: spacing(4),
  },
  smartReportCard: {
    marginHorizontal: spacing(5),
    marginBottom: spacing(4),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  smartReportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  smartReportSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing(1),
  },
  section: {
    paddingHorizontal: spacing(5),
    marginBottom: spacing(4),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing(3),
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  watchName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  watchValue: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  recentIcon: { fontSize: 28 },
  recentTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  recentSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  emptyState: {
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
  subscribeBanner: {
    marginHorizontal: spacing(5),
    marginVertical: spacing(3),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginHorizontal: spacing(5),
    marginVertical: spacing(2),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.statusFlagBg,
    borderWidth: 1,
    borderColor: colors.statusFlag + '20',
  },
  emergencyIcon: { fontSize: 24 },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  emergencySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  settingsLink: {
    marginHorizontal: spacing(5),
    marginVertical: spacing(2),
    padding: spacing(3),
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
