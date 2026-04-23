/**
 * POC initialization — calls /auth/dev-create on first launch,
 * stores tokens, syncs backend demo data to local store.
 */
import { useAuthStore } from '../store/auth';
import { useDocumentsStore } from '../store/documents';
import type { DocumentRecord } from '../store/documents';
import { api } from './api';
import { seedDemoData } from './seed-demo-data';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';

export async function initializeDemoUser(): Promise<boolean> {
  const { accessToken, setTokens, setActiveProfile } =
    useAuthStore.getState();

  // Already initialized
  if (accessToken) {
    // Sync backend data if local store is empty
    await syncBackendToLocal();
    return true;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/dev-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      console.error('dev-create failed:', res.status);
      return false;
    }

    const data = await res.json();
    setTokens(data.access_token, data.refresh_token, data.owner_id);
    setActiveProfile(data.profile_id);
    console.log('Demo user initialized:', data.owner_id);

    // Sync backend demo data to local store (backend seeds on first dev-create)
    await syncBackendToLocal();

    return true;
  } catch (err) {
    console.error('dev-create network error:', err);
    return false;
  }
}

/**
 * Fetch documents from backend and populate the local Zustand store.
 * Falls back to local seed data if backend sync fails.
 */
async function syncBackendToLocal(): Promise<void> {
  const { documents, addDocument, clear } = useDocumentsStore.getState();

  // Skip if we already have local data with real UUIDs (not demo- prefixed)
  if (documents.length > 0 && !documents[0].document_id.startsWith('demo-')) {
    return;
  }

  try {
    const docsRes = await api.get<{ documents: any[]; total: number }>(
      '/documents?limit=20'
    );
    const backendDocs = docsRes.documents || [];
    if (backendDocs.length === 0) {
      // Backend has no data — use local seed as fallback
      if (documents.length === 0) seedDemoData();
      return;
    }

    // Clear local demo data (fake IDs) before syncing real data
    if (documents.length > 0 && documents[0].document_id.startsWith('demo-')) {
      clear();
    }

    // Fetch each document's detail to get extraction data
    for (const doc of backendDocs) {
      try {
        const detail = await api.get<{
          document_id: string;
          profile_id: string;
          classified_as: string;
          provider_name: string | null;
          uploaded_at: string;
          document_date: string | null;
          extractions: Array<{
            extraction_id: string;
            json_payload: any;
            is_current: boolean;
          }>;
        }>(`/documents/${doc.document_id}`);

        const currentExt = detail.extractions?.find((e) => e.is_current);
        const record: DocumentRecord = {
          document_id: detail.document_id,
          profile_id: detail.profile_id,
          classified_as: detail.classified_as || 'other',
          extraction_id: currentExt?.extraction_id,
          processing_status: 'complete',
          uploaded_at: detail.uploaded_at,
          provider_name: detail.provider_name || undefined,
          file_name: detail.provider_name
            ? `${detail.provider_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
            : 'document.pdf',
          tests: currentExt?.json_payload?.tests,
          medications: currentExt?.json_payload?.medications,
        };
        addDocument(record);
      } catch (err) {
        console.warn('Failed to fetch doc detail:', doc.document_id, err);
      }
    }
    console.log(`Synced ${backendDocs.length} documents from backend`);
  } catch (err) {
    console.warn('Backend sync failed, using local seed:', err);
    if (documents.length === 0) seedDemoData();
  }
}
