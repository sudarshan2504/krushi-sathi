import fs from 'fs';
import path from 'path';
import { chromium, Browser } from 'playwright';
import { DiseaseReportData } from '../schemas/diseaseReportSchema';

export interface GeneratePdfOptions {
  reportId: string;
  reportData: DiseaseReportData;
  farmerName?: string;
  language?: string;
  thumbnailPath?: string | null;
}

const CACHE_DIR = path.resolve(__dirname, '../../uploads/reports/cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export function getCachedPdfPath(reportId: string, language: string = 'en'): string {
  return path.join(CACHE_DIR, `report_${reportId}_${language}.pdf`);
}

/**
 * Encodes local thumbnail file to base64 data URI for offline Chromium rendering.
 */
function getThumbnailBase64(thumbnailPath?: string | null): string | null {
  if (!thumbnailPath) return null;
  try {
    const cleanRelPath = thumbnailPath.startsWith('/') ? thumbnailPath.substring(1) : thumbnailPath;
    const fullPath = path.resolve(__dirname, '../../', cleanRelPath);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    }
  } catch (err) {
    console.warn('[reportPdfService] Could not read thumbnail file for PDF:', err);
  }
  return null;
}

/**
 * Builds HTML template with embedded Noto Sans font declarations and Indian script fallbacks.
 */
export function buildReportHtml(options: GeneratePdfOptions): string {
  const { reportId, reportData, farmerName = 'Farmer', language = 'en', thumbnailPath } = options;
  const thumbUri = getThumbnailBase64(thumbnailPath);

  const top = reportData.topFindings?.[0];
  const localName =
    top?.localNames?.[language as keyof typeof top.localNames] ||
    top?.name ||
    'Crop Health Observation';

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    healthy: { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
    disease: { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
    pest: { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
    nutrient_deficiency: { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
    environmental_stress: { bg: '#e0f2f1', text: '#00695c', border: '#80cbc4' },
    unclear: { bg: '#f5f5f5', text: '#616161', border: '#e0e0e0' },
  };

  const colors = statusColors[reportData.status] || statusColors.unclear;

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>Krushi Sathi Diagnostic Report - ${reportId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Kannada:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Noto Sans', 'Noto Sans Kannada', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Nirmala UI', system-ui, -apple-system, sans-serif;
      color: #212529;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      padding: 10px 20px;
    }

    .header-table {
      width: 100%;
      border-bottom: 2px solid #2e7d32;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: #1b5e20;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 11px;
      color: #558b2f;
      text-transform: uppercase;
      font-weight: 600;
    }

    .meta-info {
      text-align: right;
      font-size: 11px;
      color: #616161;
    }

    .badge-sample {
      display: inline-block;
      background: #fbc02d;
      color: #212121;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 10px;
      margin-bottom: 4px;
    }

    .summary-card {
      background: #f9fbf9;
      border: 1px solid #c8e6c9;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 16px;
      display: table;
      width: 100%;
    }

    .summary-col {
      display: table-cell;
      vertical-align: middle;
    }

    .photo-col {
      width: 120px;
      padding-right: 14px;
    }

    .photo-thumb {
      width: 110px;
      height: 110px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #c8e6c9;
      display: block;
    }

    .photo-placeholder {
      width: 110px;
      height: 110px;
      background: #e8f5e9;
      border-radius: 6px;
      text-align: center;
      line-height: 110px;
      color: #2e7d32;
      font-weight: 600;
      font-size: 11px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      background: ${colors.bg};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      margin-top: 6px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1b5e20;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 4px;
      margin: 16px 0 8px 0;
    }

    .finding-card {
      background: #fafafa;
      border-left: 4px solid #2e7d32;
      padding: 10px 14px;
      margin-bottom: 10px;
      border-radius: 0 6px 6px 0;
    }

    .list-ordered {
      padding-left: 20px;
      margin-bottom: 10px;
    }

    .list-ordered li {
      margin-bottom: 6px;
    }

    .safety-box {
      background: #fff8e1;
      border: 2px solid #ffb300;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 14px 0;
    }

    .safety-title {
      font-size: 13px;
      font-weight: 700;
      color: #b78103;
      margin-bottom: 6px;
    }

    .helpline-card {
      background: #e8f5e9;
      border: 1.5px solid #81c784;
      border-radius: 8px;
      padding: 10px 14px;
      margin: 14px 0;
    }

    .helpline-number {
      font-size: 16px;
      font-weight: 700;
      color: #1b5e20;
    }

    .chemical-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 12px;
    }

    .chemical-table th {
      background: #e8f5e9;
      color: #1b5e20;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #c8e6c9;
    }

    .chemical-table td {
      padding: 6px 8px;
      border: 1px solid #e0e0e0;
    }

    .disclaimer-box {
      font-size: 10px;
      color: #757575;
      border-top: 1px solid #eeeeee;
      padding-top: 8px;
      margin-top: 16px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: middle;">
        <div class="brand-title">🌾 Krushi Sathi</div>
        <div class="brand-subtitle">AI Agricultural Crop Health Advisory • ICAR Grounded</div>
      </td>
      <td class="meta-info" style="vertical-align: middle;">
        ${reportData.isSample ? '<div class="badge-sample">SAMPLE REPORT</div>' : ''}
        <div><strong>Report ID:</strong> ${reportId}</div>
        <div><strong>Date:</strong> ${new Date(reportData.generatedAt).toLocaleDateString()}</div>
        <div><strong>Source:</strong> ${reportData.verifiedSource || 'AI-generated, verify with an expert'}</div>
      </td>
    </tr>
  </table>

  <!-- Summary Card -->
  <div class="summary-card">
    ${
      thumbUri
        ? `<div class="summary-col photo-col"><img src="${thumbUri}" class="photo-thumb" alt="Crop Photo" /></div>`
        : `<div class="summary-col photo-col"><div class="photo-placeholder">Field Photo</div></div>`
    }
    <div class="summary-col">
      <div style="font-size: 16px; font-weight: 700; color: #1b5e20;">${localName}</div>
      <div style="font-size: 12px; color: #616161;"><strong>Crop:</strong> ${reportData.crop.name} ${reportData.crop.scientificName ? `<em>(${reportData.crop.scientificName})</em>` : ''} | <strong>Farmer:</strong> ${farmerName}</div>
      <div class="status-badge">Status: ${reportData.status.toUpperCase()} • Confidence: ${top ? top.confidence : 0}%</div>
      <div style="font-size: 11px; color: #757575; margin-top: 4px;"><strong>Image Quality:</strong> ${reportData.imageQuality.toUpperCase()} ${reportData.retakeTip ? ` • <em>Tip: ${reportData.retakeTip}</em>` : ''}</div>
    </div>
  </div>

  <!-- Key Findings -->
  <div class="section-title">🔍 Clinical Findings & Observed Symptoms</div>
  ${
    reportData.topFindings && reportData.topFindings.length > 0
      ? reportData.topFindings
          .map(
            (finding, i) => `
    <div class="finding-card">
      <div style="font-weight: 700; color: #2e7d32;">#${i + 1} ${finding.name} (${finding.type.toUpperCase()}) - Severity: ${finding.severity.toUpperCase()}</div>
      <div style="margin-top: 4px;"><strong>Observed in photo:</strong> ${finding.observedSymptoms.join(', ') || 'Characteristic symptoms identified'}</div>
      ${finding.likelyCauses?.length ? `<div style="font-size: 11px; color: #616161; margin-top: 2px;"><strong>Likely Causes:</strong> ${finding.likelyCauses.join(', ')}</div>` : ''}
    </div>`
          )
          .join('')
      : '<div>No specific disease symptoms detected.</div>'
  }

  <!-- Treatment Plan -->
  <div class="section-title">🛠️ Step-by-Step Integrated Treatment Plan</div>

  <div style="font-weight: 600; color: #2e7d32; margin-top: 6px;">1. Immediate First-Response Actions</div>
  <ol class="list-ordered">
    ${(reportData.treatment?.immediateSteps || ['Isolate and monitor affected plant rows']).map(step => `<li>${step}</li>`).join('')}
  </ol>

  <div style="font-weight: 600; color: #2e7d32; margin-top: 6px;">2. Cultural & Organic Management</div>
  <ol class="list-ordered">
    ${(reportData.treatment?.culturalAndOrganic || ['Ensure adequate plant spacing and air circulation']).map(step => `<li>${step}</li>`).join('')}
  </ol>

  ${
    reportData.treatment?.chemical && reportData.treatment.chemical.length > 0
      ? `
  <div style="font-weight: 600; color: #c62828; margin-top: 6px;">3. Synthetic Chemical Options (If Economic Threshold Exceeded)</div>
  <table class="chemical-table">
    <thead>
      <tr>
        <th>Active Ingredient</th>
        <th>Class</th>
        <th>Purpose</th>
        <th>Application Guidance</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.treatment.chemical
        .map(
          chem => `
        <tr>
          <td><strong>${chem.activeIngredient}</strong></td>
          <td>${chem.class}</td>
          <td>${chem.purpose}</td>
          <td>${chem.applicationNotes}</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>
  <div style="font-size: 10px; color: #d32f2f; margin-bottom: 8px;">⚠️ Strictly adhere to the manufacturer container label for dilution rate and Pre-Harvest Interval (waiting period). Never mix products unless authorized.</div>
  `
      : ''
  }

  <!-- Highlighted Safety Precautions Box -->
  <div class="safety-box">
    <div class="safety-title">⚠️ Mandatory Farmer Safety & Environmental Precautions</div>
    <ul style="padding-left: 18px; font-size: 11px;">
      ${(reportData.treatment?.safetyPrecautions || []).map(p => `<li>${p}</li>`).join('')}
    </ul>
  </div>

  <!-- Prevention & Monitoring -->
  <div class="section-title">🛡️ Prevention & Expert Escalation</div>
  <div style="font-size: 12px; margin-bottom: 6px;">
    <strong>Recheck schedule:</strong> Re-inspect field in ${reportData.treatment?.recheckInDays || 5} days.
  </div>
  <ul style="padding-left: 18px; font-size: 11px; margin-bottom: 8px;">
    ${(reportData.treatment?.preventionTips || ['Rotate crops in subsequent seasons']).map(tip => `<li>${tip}</li>`).join('')}
  </ul>

  <!-- Expert Helpline Callout -->
  <div class="helpline-card">
    <div style="font-weight: 700; color: #1b5e20;">📞 Agricultural Helpline & Extension Support</div>
    <div style="margin: 4px 0;"><strong>Kisan Call Centre (Toll-Free):</strong> <span class="helpline-number">${reportData.helpline || '1800-180-1551'}</span></div>
    <div style="font-size: 11px; color: #424242;">${reportData.treatment?.whenToSeeExpert || 'Contact your nearest Krishi Vigyan Kendra (KVK) or Raitha Samparka Kendra if symptoms persist.'}</div>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer-box">
    <strong>Disclaimer:</strong> ${reportData.disclaimer || 'Krushi Sathi AI diagnosis is an automated preliminary advisory tool. Field conditions and multi-pathogen infections should be verified with an agricultural officer before substantial investments.'}
    <div style="margin-top: 2px;">Generated by Krushi Sathi • Model: ${reportData.model} • AI & ICAR Best-Practice Engine</div>
  </div>

</body>
</html>`;
}

/**
 * Generates an A4 PDF using Playwright headless Chromium.
 * Results are cached to disk per report ID + language for instant subsequent downloads.
 */
export async function generateReportPdf(options: GeneratePdfOptions): Promise<Buffer> {
  const { reportId, language = 'en' } = options;
  const cachePath = getCachedPdfPath(reportId, language);

  // Return cached PDF if present
  if (fs.existsSync(cachePath)) {
    try {
      const cachedBuf = fs.readFileSync(cachePath);
      if (cachedBuf.length > 0) {
        return cachedBuf;
      }
    } catch (e) {
      console.warn('[reportPdfService] Error reading cached PDF, regenerating:', e);
    }
  }

  const html = buildReportHtml(options);

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    // Wait for fonts to be ready
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        bottom: '12mm',
        left: '12mm',
        right: '12mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9px; color: #757575; width: 100%; text-align: center; font-family: 'Noto Sans', sans-serif;">
          <span>Krushi Sathi Diagnostic Report • </span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    await browser.close();
    browser = null;

    // Cache the generated PDF
    try {
      fs.writeFileSync(cachePath, pdfBuffer);
    } catch (cacheErr) {
      console.warn('[reportPdfService] Failed to cache PDF:', cacheErr);
    }

    return pdfBuffer;
  } catch (err: any) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error('[reportPdfService] Playwright PDF generation error:', err);
    throw new Error(`Failed to generate diagnostic PDF: ${err.message}`);
  }
}
