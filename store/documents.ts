/**
 * Document store — tracks uploaded documents and their extractions.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LabTest {
  test_name: string;
  loinc_code?: string;
  value_num?: number;
  unit?: string;
  ref_low?: number;
  ref_high?: number;
  flag?: string; // 'ok' | 'watch' | 'flag' | 'critical'
}

export interface Medication {
  drug_name: string;
  dose: string;
  frequency: string;
  duration?: string;
  active?: boolean;
}

export interface DocumentRecord {
  document_id: string;
  profile_id: string;
  classified_as: string;
  classification_confidence?: number;
  extraction_id?: string;
  processing_status: string;
  uploaded_at: string;
  provider_name?: string;
  file_name?: string;
  // Denormalized extraction for quick access
  tests?: LabTest[];
  medications?: Medication[];
}

interface DocumentsState {
  documents: DocumentRecord[];
  addDocument: (doc: DocumentRecord) => void;
  updateDocument: (id: string, partial: Partial<DocumentRecord>) => void;
  getRecent: (n?: number) => DocumentRecord[];
  getFlaggedValues: (n?: number) => LabTest[];
  clear: () => void;
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],

      addDocument: (doc) =>
        set((s) => ({
          documents: [doc, ...s.documents],
        })),

      updateDocument: (id, partial) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.document_id === id ? { ...d, ...partial } : d
          ),
        })),

      getRecent: (n = 3) => get().documents.slice(0, n),

      getFlaggedValues: (n = 3) => {
        const allTests: LabTest[] = [];
        for (const doc of get().documents) {
          if (doc.tests) {
            for (const t of doc.tests) {
              if (t.flag && t.flag !== 'ok') {
                allTests.push(t);
              }
            }
          }
        }
        return allTests.slice(0, n);
      },

      clear: () => set({ documents: [] }),
    }),
    {
      name: 'oslo-documents',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
