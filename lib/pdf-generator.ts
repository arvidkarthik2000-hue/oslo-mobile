/**
 * PDF Generator — creates doctor-presentable health summary PDFs.
 * Uses expo-print to generate HTML → PDF, then expo-sharing to share.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from '../components/design-tokens';

interface LabValue {
  name: string;
  value: string;
  unit?: string;
  ref_range?: string;
  flag?: string;
}

interface MedicationItem {
  name: string;
  dosage?: string;
  frequency?: string;
}

interface SmartReportPDFData {
  patientName: string;
  patientDOB?: string;
  bloodGroup?: string;
  generatedAt: string;
  reportMarkdown: string;
  sections?: Array<{
    system: string;
    status: string;
    key_values: LabValue[];
  }>;
  medications?: MedicationItem[];
}

const flagColor = (flag?: string) => {
  switch (flag) {
    case 'flag': case 'critical': return '#DC2626';
    case 'watch': return '#F59E0B';
    default: return '#059669';
  }
};

const flagLabel = (flag?: string) => {
  switch (flag) {
    case 'flag': return '⚠️ HIGH';
    case 'critical': return '🔴 CRITICAL';
    case 'watch': return '⚡ WATCH';
    default: return '✅ Normal';
  }
};

export function generateSmartReportHTML(data: SmartReportPDFData): string {
  const sectionsHTML = data.sections?.map(section => {
    const valuesHTML = section.key_values?.map(kv => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${kv.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${kv.value}${kv.unit ? ` ${kv.unit}` : ''}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${kv.ref_range || '—'}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;color:${flagColor(kv.flag)};font-weight:500;">${flagLabel(kv.flag)}</td>
      </tr>
    `).join('') || '';

    const statusColor = section.status === 'flag' ? '#DC2626' : section.status === 'watch' ? '#F59E0B' : '#059669';

    return `
      <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <div style="background:${statusColor}15;padding:12px 16px;border-bottom:1px solid #e5e7eb;">
          <h3 style="margin:0;color:#1f2937;font-size:16px;">
            ${section.system.charAt(0).toUpperCase() + section.system.slice(1)} System
            <span style="color:${statusColor};font-size:12px;margin-left:8px;">${section.status.toUpperCase()}</span>
          </h3>
        </div>
        ${valuesHTML ? `
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-weight:500;color:#6b7280;">Test</th>
            <th style="padding:8px 12px;text-align:left;font-weight:500;color:#6b7280;">Value</th>
            <th style="padding:8px 12px;text-align:left;font-weight:500;color:#6b7280;">Reference</th>
            <th style="padding:8px 12px;text-align:left;font-weight:500;color:#6b7280;">Status</th>
          </tr>
          ${valuesHTML}
        </table>` : ''}
      </div>
    `;
  }).join('') || '';

  const medsHTML = data.medications?.length ? `
    <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div style="background:#EEF2FF;padding:12px 16px;border-bottom:1px solid #e5e7eb;">
        <h3 style="margin:0;color:#1f2937;font-size:16px;">💊 Active Medications</h3>
      </div>
      <ul style="padding:12px 24px;margin:0;">
        ${data.medications.map(m => `
          <li style="padding:4px 0;color:#374151;font-size:13px;">
            <strong>${m.name}</strong>${m.dosage ? ` — ${m.dosage}` : ''}${m.frequency ? ` (${m.frequency})` : ''}
          </li>
        `).join('')}
      </ul>
    </div>
  ` : '';

  // Fallback to markdown text if no structured sections
  const bodyContent = sectionsHTML || `
    <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;color:#374151;padding:16px;">
      ${data.reportMarkdown.replace(/\n/g, '<br>')}
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0; padding: 0; color: #1f2937;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div style="background:${colors.accent};padding:24px 20px;color:white;">
        <div style="font-size:24px;font-weight:700;margin-bottom:4px;">OSLO Health</div>
        <div style="font-size:13px;opacity:0.85;">Smart Health Report</div>
      </div>

      <!-- Patient info bar -->
      <div style="background:#f9fafb;padding:14px 20px;border-bottom:1px solid #e5e7eb;display:flex;gap:24px;font-size:13px;color:#6b7280;">
        <span><strong>Patient:</strong> ${data.patientName}</span>
        ${data.patientDOB ? `<span><strong>DOB:</strong> ${data.patientDOB}</span>` : ''}
        ${data.bloodGroup ? `<span><strong>Blood Group:</strong> ${data.bloodGroup}</span>` : ''}
        <span style="margin-left:auto;"><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      <!-- Content -->
      <div style="padding:20px;">
        <h2 style="color:${colors.accent};font-size:18px;margin:0 0 16px;">Health Summary</h2>
        ${bodyContent}
        ${medsHTML}
      </div>

      <!-- Footer -->
      <div style="padding:16px 20px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;">
        <p style="margin:4px 0;">This report is AI-generated from uploaded health records and is for informational purposes only.</p>
        <p style="margin:4px 0;">It does not constitute medical advice. Please consult your physician for clinical decisions.</p>
        <p style="margin:4px 0;color:#d1d5db;">Powered by OSLO Health · Generated ${new Date().toISOString()}</p>
      </div>
    </body>
    </html>
  `;
}

export async function generateAndSharePDF(data: SmartReportPDFData): Promise<void> {
  const html = generateSmartReportHTML(data);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Smart Report',
      UTI: 'com.adobe.pdf',
    });
  } else {
    // Fallback: just print
    await Print.printAsync({ uri });
  }
}
