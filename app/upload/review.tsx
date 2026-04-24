/**
 * Upload Review screen — after picking a file:
 * 1. Validates file size
 * 2. Creates document record on backend
 * 3. Uploads file to backend storage
 * 4. Triggers finalize (classify + extract + embed)
 * 5. Shows extraction review
 * 6. User confirms → saved to store + navigates home
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, radius } from '../../components/design-tokens';
import { ExtractionReview } from '../../components/ExtractionReview';
import { useAuthStore } from '../../store/auth';
import { useDocumentsStore } from '../../store/documents';
import type { LabTest } from '../../store/documents';
import { api, getApiUrl } from '../../lib/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type Phase = 'uploading' | 'storing' | 'processing' | 'review' | 'saving' | 'error';

export default function UploadReviewScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    name: string;
    mimeType: string;
    size: string;
  }>();

  const profileId = useAuthStore((s) => s.activeProfileId);
  const addDocument = useDocumentsStore((s) => s.addDocument);

  const [phase, setPhase] = useState<Phase>('uploading');
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [classifiedAs, setClassifiedAs] = useState<string>('other');
  const [tests, setTests] = useState<LabTest[]>([]);
  const [extractionPayload, setExtractionPayload] = useState<any>(null);
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setError('No profile found. Please restart the app.');
      setPhase('error');
      return;
    }

    // Client-side file size check
    const fileSize = parseInt(params.size || '0', 10);
    if (fileSize > MAX_FILE_SIZE) {
      setError(`File is too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Please select a file under 10MB.`);
      setPhase('error');
      return;
    }

    runPipeline();
  }, []);

  const runPipeline = async () => {
    try {
      // Step 1: Create document record
      setPhase('uploading');
      const createRes = await api.post<{
        document_id: string;
        upload_url: string | null;
        status: string;
      }>('/documents', {
        profile_id: profileId,
        source: 'upload',
        mime_type: params.mimeType || 'application/pdf',
        byte_size: parseInt(params.size || '0', 10),
        page_count: 1,
        file_name: params.name,
      });

      const docId = createRes.document_id;
      setDocumentId(docId);

      // Step 2: Upload actual file to backend storage
      setPhase('storing');
      const token = useAuthStore.getState().accessToken;
      const formData = new FormData();
      formData.append('file', {
        uri: params.uri,
        name: params.name || `upload_${Date.now()}`,
        type: params.mimeType || 'application/octet-stream',
      } as any);

      const uploadRes = await fetch(
        `${getApiUrl()}/documents/${docId}/upload-file`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const errBody = await uploadRes.json().catch(() => ({}));
        throw new Error(errBody.detail || `Upload failed (${uploadRes.status})`);
      }

      const uploadData = await uploadRes.json();
      const s3Key = uploadData.s3_key;
      const fileUrl = uploadData.file_url;
      const publicFileUrl = `${getApiUrl()}${fileUrl}`;

      // Step 3: Finalize (classify + extract + embed) with the public URL
      setPhase('processing');
      const finalizeRes = await api.post<{
        document_id: string;
        classified_as: string;
        classification_confidence: number | null;
        extraction_id: string | null;
        processing_status: string;
      }>(`/documents/${docId}/finalize`, {
        s3_key: s3Key,
        sha256: '',
        image_urls: [publicFileUrl],
      });

      setClassifiedAs(finalizeRes.classified_as || 'other');
      setExtractionId(finalizeRes.extraction_id || null);

      // Step 4: Fetch document detail to get extraction data
      const detail = await api.get<{
        document_id: string;
        provider_name: string | null;
        extractions: Array<{
          extraction_id: string;
          json_payload: any;
          is_current: boolean;
        }>;
      }>(`/documents/${docId}`);

      setProviderName(detail.provider_name || null);

      // Find current extraction
      const currentExt = detail.extractions?.find((e) => e.is_current);
      if (currentExt?.json_payload) {
        setExtractionPayload(currentExt.json_payload);

        // Parse tests for lab reports
        if (
          finalizeRes.classified_as === 'lab_report' &&
          currentExt.json_payload.tests
        ) {
          setTests(currentExt.json_payload.tests);
        }
      }

      setPhase('review');
    } catch (err: any) {
      console.error('Upload pipeline error:', err);
      setError(err?.message || 'Upload failed. Please try again.');
      setPhase('error');
    }
  };

  const handleConfirm = async (confirmedTests: LabTest[]) => {
    if (!documentId) return;

    setPhase('saving');
    try {
      // If tests were modified, submit correction
      const testsChanged = JSON.stringify(confirmedTests) !== JSON.stringify(tests);
      if (testsChanged && extractionId) {
        await api.post(`/documents/${documentId}/correct`, {
          corrected_payload: {
            ...extractionPayload,
            tests: confirmedTests,
          },
        });
      }

      // Add to local store
      addDocument({
        document_id: documentId,
        profile_id: profileId || '',
        classified_as: classifiedAs,
        extraction_id: extractionId || undefined,
        processing_status: 'complete',
        uploaded_at: new Date().toISOString(),
        provider_name: providerName || undefined,
        file_name: params.name,
        tests: confirmedTests,
        medications: extractionPayload?.medications,
      });

      // Navigate back to Home
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Save Error', err?.message || 'Could not save. Please try again.');
      setPhase('review');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (phase === 'uploading' || phase === 'storing' || phase === 'processing' || phase === 'saving') {
    const phaseMessages: Record<string, string> = {
      uploading: 'Creating document record...',
      storing: 'Uploading file to secure storage...',
      processing: 'Analyzing your document with AI...\nThis may take 15–20 seconds.',
      saving: 'Saving...',
    };
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.phaseText}>
            {phaseMessages[phase]}
          </Text>
          <Text style={styles.fileName}>{params.name}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.retryBtn} onPress={runPipeline}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Review phase
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header showing classification */}
      <View style={styles.classHeader}>
        <Text style={styles.classLabel}>Classified as</Text>
        <View style={styles.classBadge}>
          <Text style={styles.classText}>
            {(classifiedAs || 'other').replace(/_/g, ' ')}
          </Text>
        </View>
        {providerName && (
          <Text style={styles.providerText}>
            {providerName}
          </Text>
        )}
      </View>

      {classifiedAs === 'lab_report' && tests.length > 0 ? (
        <ExtractionReview
          tests={tests}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          documentClass={classifiedAs}
        />
      ) : (
        <View style={styles.genericReview}>
          <Text style={styles.genericTitle}>Document Processed</Text>
          <Text style={styles.genericSub}>
            {classifiedAs === 'prescription'
              ? `${extractionPayload?.medications?.length || 0} medications extracted`
              : 'Data has been extracted and saved.'}
          </Text>
          <View style={styles.genericActions}>
            <TouchableOpacity
              style={styles.cancelActionBtn}
              onPress={handleCancel}
            >
              <Text style={styles.cancelActionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmActionBtn}
              onPress={() => handleConfirm(tests)}
            >
              <Text style={styles.confirmActionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  phaseText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing(4),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  fileName: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: spacing(2),
  },
  errorIcon: { fontSize: 48, marginBottom: spacing(4) },
  errorText: {
    fontSize: 15,
    color: colors.statusFlag,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing(4),
    marginTop: spacing(6),
  },
  retryBtn: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
  },
  retryText: {
    color: colors.textOnDark,
    fontWeight: '500',
    fontSize: 15,
  },
  backBtn: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  backText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 15,
  },
  classHeader: {
    padding: spacing(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTertiary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    flexWrap: 'wrap',
  },
  classLabel: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  classBadge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
  },
  classText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'capitalize',
  },
  providerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  genericReview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(8),
  },
  genericTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  genericSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing(2),
    textAlign: 'center',
  },
  genericActions: {
    flexDirection: 'row',
    gap: spacing(4),
    marginTop: spacing(8),
  },
  cancelActionBtn: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3.5),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  cancelActionText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  confirmActionBtn: {
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(3.5),
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
  },
  confirmActionText: {
    fontSize: 15,
    color: colors.textOnDark,
    fontWeight: '600',
  },
});
