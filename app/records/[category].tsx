/**
 * Filtered document list — shown when tapping a category in Records tab.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

interface DocumentItem {
  document_id: string;
  profile_id: string;
  classified_as: string;
  uploaded_at: string;
  provider_name?: string;
  document_date?: string;
  mime_type?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  lab_report: 'Lab Reports',
  prescription: 'Prescriptions',
  imaging_report: 'Imaging Reports',
  discharge_summary: 'Discharge Summaries',
  consultation_note: 'Consultation Notes',
  other: 'Other Documents',
};

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'lab_report': return '🧪';
    case 'prescription': return '💊';
    case 'imaging_report': return '🩻';
    case 'discharge_summary': return '🏥';
    case 'consultation_note': return '🩺';
    default: return '📋';
  }
};

export default function CategoryListScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const profileId = useAuthStore((s) => s.activeProfileId);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, [category]);

  const loadDocuments = async () => {
    try {
      let path = `/documents?category=${category}&limit=50`;
      if (profileId) path += `&profile_id=${profileId}`;

      const res = await api.get<{ documents: DocumentItem[]; total: number }>(path);
      setDocuments(res.documents || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDocument = ({ item }: { item: DocumentItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/document/[id]',
          params: { id: item.document_id },
        })
      }
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{categoryIcon(item.classified_as)}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.provider_name || (item.classified_as || 'Document').replace(/_/g, ' ')}
        </Text>
        <Text style={styles.cardDate}>
          {item.document_date
            ? new Date(item.document_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : new Date(item.uploaded_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {CATEGORY_LABELS[category || ''] || 'Documents'}
        </Text>
        <Text style={styles.count}>{total} document{total !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No documents in this category</Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.document_id}
          renderItem={renderDocument}
          contentContainerStyle={{ paddingBottom: spacing(10) }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
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
  count: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing(1),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
  },
  icon: { fontSize: 24 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  cardDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textTertiary,
  },
});
