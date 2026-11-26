import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { generateReportPdf, buildReportHtml } from '../server/src/services/reportPdfService';
import { buildSampleReport } from '../server/src/services/photoDiagnosisService';

const ARTIFACTS_DIR = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3';
const OUTPUT_DIR = path.resolve(__dirname, '../server/uploads/reports/renders');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const languages = [
  { code: 'en', name: 'English', farmer: 'Ramesh Kumar' },
  { code: 'kn', name: 'Kannada', farmer: 'ರಮೇಶ್ ಕುಮಾರ್' },
  { code: 'ta', name: 'Tamil', farmer: 'ரமேஷ் குமார்' },
  { code: 'te', name: 'Telugu', farmer: 'రమేష్ కుమార్' },
];

async function main() {
  console.log('--- Generating Sample PDFs & Rendering Page 1 to PNG ---');
  const browser = await chromium.launch({ headless: true });

  for (const lang of languages) {
    console.log(`Processing ${lang.name} (${lang.code})...`);
    const reportData = buildSampleReport('Tomato', lang.code);
    const reportId = `sample_${lang.code}`;

    // 1. Generate real PDF through reportPdfService
    const pdfBuffer = await generateReportPdf({
      reportId,
      reportData,
      language: lang.code,
      farmerName: lang.farmer,
    });

    const localPdfPath = path.join(OUTPUT_DIR, `report_${reportId}_${lang.code}.pdf`);
    fs.writeFileSync(localPdfPath, pdfBuffer);
    console.log(`  PDF generated at: ${localPdfPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

    // 2. Render Page 1 to image using Chromium
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 }, // A4 at 96 DPI
      deviceScaleFactor: 2, // High resolution crisp text
    });

    const html = buildReportHtml({
      reportId,
      reportData,
      language: lang.code,
      farmerName: lang.farmer,
    });

    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document as any).fonts.ready);

    const outImageName = `report_page1_${lang.code}.png`;
    const localImagePath = path.join(OUTPUT_DIR, outImageName);
    const artifactImagePath = path.join(ARTIFACTS_DIR, outImageName);

    await page.screenshot({
      path: localImagePath,
      fullPage: false,
      clip: { x: 0, y: 0, width: 794, height: 1123 }, // Page 1 bounds
    });

    // Copy to artifacts dir for rendering in conversation
    fs.copyFileSync(localImagePath, artifactImagePath);
    console.log(`  Rendered image saved: ${localImagePath} & ${artifactImagePath}`);

    await page.close();
  }

  await browser.close();
  console.log('--- Finished generating all sample PDFs and page 1 images ---');
}

main().catch(err => {
  console.error('Error generating PDF samples:', err);
  process.exit(1);
});
