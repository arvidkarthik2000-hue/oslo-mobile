/**
 * Demo data seeder — creates realistic pre-loaded data on first launch.
 * Called when no documents exist in the store.
 */
import { useDocumentsStore } from '../store/documents';
import type { DocumentRecord, LabTest } from '../store/documents';
import { api } from './api';
import { useAuthStore } from '../store/auth';

// Realistic Indian lab report data spread over 6 months
const SEED_DOCUMENTS: Array<{
  classified_as: string;
  provider_name: string;
  date: string;
  tests?: LabTest[];
  medications?: any[];
}> = [
  {
    classified_as: 'lab_report',
    provider_name: 'Dr Lal PathLabs',
    date: '2025-10-15',
    tests: [
      { test_name: 'Hemoglobin', value_num: 13.8, unit: 'g/dL', ref_low: 13.0, ref_high: 17.5, flag: 'ok', loinc_code: '718-7' },
      { test_name: 'Fasting Glucose', value_num: 112, unit: 'mg/dL', ref_low: 70, ref_high: 100, flag: 'watch', loinc_code: '1558-6' },
      { test_name: 'HbA1c', value_num: 6.8, unit: '%', ref_low: 4.0, ref_high: 5.6, flag: 'watch', loinc_code: '4548-4' },
      { test_name: 'Total Cholesterol', value_num: 228, unit: 'mg/dL', ref_low: 0, ref_high: 200, flag: 'watch', loinc_code: '2093-3' },
      { test_name: 'LDL Cholesterol', value_num: 148, unit: 'mg/dL', ref_low: 0, ref_high: 100, flag: 'flag', loinc_code: '2089-1' },
      { test_name: 'HDL Cholesterol', value_num: 42, unit: 'mg/dL', ref_low: 40, ref_high: 60, flag: 'ok', loinc_code: '2085-9' },
      { test_name: 'Creatinine', value_num: 0.9, unit: 'mg/dL', ref_low: 0.7, ref_high: 1.3, flag: 'ok', loinc_code: '2160-0' },
      { test_name: 'TSH', value_num: 3.2, unit: 'mIU/L', ref_low: 0.4, ref_high: 4.0, flag: 'ok', loinc_code: '3016-3' },
    ],
  },
  {
    classified_as: 'lab_report',
    provider_name: 'Thyrocare Technologies',
    date: '2026-01-10',
    tests: [
      { test_name: 'Hemoglobin', value_num: 14.1, unit: 'g/dL', ref_low: 13.0, ref_high: 17.5, flag: 'ok', loinc_code: '718-7' },
      { test_name: 'Fasting Glucose', value_num: 118, unit: 'mg/dL', ref_low: 70, ref_high: 100, flag: 'watch', loinc_code: '1558-6' },
      { test_name: 'HbA1c', value_num: 7.1, unit: '%', ref_low: 4.0, ref_high: 5.6, flag: 'flag', loinc_code: '4548-4' },
      { test_name: 'Total Cholesterol', value_num: 215, unit: 'mg/dL', ref_low: 0, ref_high: 200, flag: 'watch', loinc_code: '2093-3' },
      { test_name: 'LDL Cholesterol', value_num: 132, unit: 'mg/dL', ref_low: 0, ref_high: 100, flag: 'flag', loinc_code: '2089-1' },
      { test_name: 'HDL Cholesterol', value_num: 44, unit: 'mg/dL', ref_low: 40, ref_high: 60, flag: 'ok', loinc_code: '2085-9' },
      { test_name: 'Triglycerides', value_num: 195, unit: 'mg/dL', ref_low: 0, ref_high: 150, flag: 'watch', loinc_code: '2571-8' },
      { test_name: 'SGPT (ALT)', value_num: 34, unit: 'U/L', ref_low: 7, ref_high: 56, flag: 'ok', loinc_code: '1742-6' },
      { test_name: 'Vitamin D', value_num: 18, unit: 'ng/mL', ref_low: 30, ref_high: 100, flag: 'flag', loinc_code: '1989-3' },
    ],
  },
  {
    classified_as: 'lab_report',
    provider_name: 'Apollo Diagnostics',
    date: '2026-04-05',
    tests: [
      { test_name: 'Hemoglobin', value_num: 13.5, unit: 'g/dL', ref_low: 13.0, ref_high: 17.5, flag: 'ok', loinc_code: '718-7' },
      { test_name: 'Fasting Glucose', value_num: 126, unit: 'mg/dL', ref_low: 70, ref_high: 100, flag: 'flag', loinc_code: '1558-6' },
      { test_name: 'HbA1c', value_num: 7.8, unit: '%', ref_low: 4.0, ref_high: 5.6, flag: 'flag', loinc_code: '4548-4' },
      { test_name: 'Total Cholesterol', value_num: 198, unit: 'mg/dL', ref_low: 0, ref_high: 200, flag: 'ok', loinc_code: '2093-3' },
      { test_name: 'LDL Cholesterol', value_num: 118, unit: 'mg/dL', ref_low: 0, ref_high: 100, flag: 'watch', loinc_code: '2089-1' },
      { test_name: 'Creatinine', value_num: 1.0, unit: 'mg/dL', ref_low: 0.7, ref_high: 1.3, flag: 'ok', loinc_code: '2160-0' },
      { test_name: 'TSH', value_num: 4.8, unit: 'mIU/L', ref_low: 0.4, ref_high: 4.0, flag: 'watch', loinc_code: '3016-3' },
      { test_name: 'SGPT (ALT)', value_num: 42, unit: 'U/L', ref_low: 7, ref_high: 56, flag: 'ok', loinc_code: '1742-6' },
      { test_name: 'SGOT (AST)', value_num: 38, unit: 'U/L', ref_low: 5, ref_high: 40, flag: 'ok', loinc_code: '1920-8' },
      { test_name: 'Vitamin D', value_num: 24, unit: 'ng/mL', ref_low: 30, ref_high: 100, flag: 'watch', loinc_code: '1989-3' },
    ],
  },
  {
    classified_as: 'prescription',
    provider_name: 'Dr. S. Krishnan, MD (Gen Med)',
    date: '2025-11-01',
    medications: [
      { drug_name: 'Atorvastatin', dose: '10mg', frequency: '0-0-1', duration: 'Ongoing', active: true },
      { drug_name: 'Metformin', dose: '500mg', frequency: '1-0-1', duration: 'Ongoing', active: true },
    ],
  },
  {
    classified_as: 'prescription',
    provider_name: 'Dr. S. Krishnan, MD (Gen Med)',
    date: '2026-01-15',
    medications: [
      { drug_name: 'Atorvastatin', dose: '10mg', frequency: '0-0-1', duration: 'Ongoing', active: true },
      { drug_name: 'Metformin', dose: '500mg', frequency: '1-0-1', duration: 'Ongoing', active: true },
      { drug_name: 'Vitamin D3', dose: '60000 IU', frequency: 'Weekly', duration: '8 weeks', active: true },
    ],
  },
];

/**
 * Seeds the local document store with demo data.
 * Does NOT hit the backend — purely local for instant demo.
 */
export function seedDemoData(): void {
  const { documents, addDocument } = useDocumentsStore.getState();
  const profileId = useAuthStore.getState().activeProfileId;

  // Don't re-seed if data exists
  if (documents.length > 0) return;
  if (!profileId) return;

  for (const seed of SEED_DOCUMENTS) {
    const doc: DocumentRecord = {
      document_id: `demo-${seed.date}-${seed.classified_as}-${Math.random().toString(36).slice(2, 8)}`,
      profile_id: profileId,
      classified_as: seed.classified_as,
      processing_status: 'complete',
      uploaded_at: new Date(seed.date).toISOString(),
      provider_name: seed.provider_name,
      file_name: `${seed.provider_name.replace(/[^a-zA-Z]/g, '_')}_${seed.date}.pdf`,
      tests: seed.tests,
      medications: seed.medications,
    };
    addDocument(doc);
  }

  console.log(`Seeded ${SEED_DOCUMENTS.length} demo documents`);
}
