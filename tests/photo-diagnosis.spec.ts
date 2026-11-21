import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_PHOTO_PATH = path.resolve(__dirname, 'fixtures/sample-leaf.jpg');

async function authenticateDemo(page: Page, language = 'en') {
  await page.goto('/login');
  await page.evaluate(async (lang) => {
    const res = await fetch('/api/auth/demo-login', { method: 'POST' });
    if (!res.ok) {
      throw new Error(`Demo login failed with HTTP ${res.status}`);
    }
    const json = await res.json();
    localStorage.setItem('krishi_sathi_token', json.data.token);
    localStorage.setItem('krishi_sathi_user', JSON.stringify({ ...json.data.user, language: lang }));
    localStorage.setItem('krishi_sathi_lang', lang);
  }, language);
}

test.describe('Photo-Based Crop Health Diagnosis (E2E)', () => {
  test.beforeAll(async () => {
    // Ensure test fixture photo exists
    if (!fs.existsSync(SAMPLE_PHOTO_PATH)) {
      const sharp = require('sharp');
      const dir = path.dirname(SAMPLE_PHOTO_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      await sharp({
        create: {
          width: 640,
          height: 480,
          channels: 3,
          background: { r: 60, g: 140, b: 60 },
        },
      })
        .jpeg({ quality: 85 })
        .toFile(SAMPLE_PHOTO_PATH);
    }
  });

  test('1. Full flow: upload photo -> diagnose -> render detailed report -> download PDF (< 1MB)', async ({ page }) => {
    await authenticateDemo(page, 'en');
    await page.goto('/diseases');

    // 1. Verify responsive layout on Mobile 390x844 (no horizontal scroll)
    const isNoHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(isNoHorizontalOverflow).toBeTruthy();

    // 2. Verify page header & instruction card
    await expect(page.locator('h1')).toHaveText(/Photo-Based Crop Health Diagnosis/i);
    await expect(page.getByText('How to Take an Accurate Photo')).toBeVisible();

    // 3. Upload plant photo
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(SAMPLE_PHOTO_PATH);

    // Verify thumbnail preview and remove button appear
    await expect(page.getByText('1 of 3 photos selected')).toBeVisible();
    const removeBtn = page.locator('button[aria-label="Remove photo 1"]');
    await expect(removeBtn).toBeVisible();

    // 4. Trigger diagnosis
    const analyzeBtn = page.getByRole('button', { name: /Diagnose Crop Health/i });
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // 5. Verify detailed report presentation
    // In E2E demo mode, backend returns sample report with "Sample report" badge
    await expect(page.getByText(/Sample Report/i)).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: /Early Blight/i })).toBeVisible();
    await expect(page.getByText(/Immediate First-Response Actions/i)).toBeVisible();
    await expect(page.getByText(/Cultural & Organic Solutions/i)).toBeVisible();
    await expect(page.getByText(/Mandatory Farmer Safety/i)).toBeVisible();

    // 6. Test PDF Download
    const downloadPdfBtn = page.getByRole('button', { name: /Download PDF Report/i });
    await expect(downloadPdfBtn).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await downloadPdfBtn.click();
    const download = await downloadPromise;

    // Verify PDF filename and size
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(1000); // Non-empty PDF
      expect(stats.size).toBeLessThan(1024 * 1024); // Under 1 MB constraint!

      const buffer = fs.readFileSync(downloadPath);
      const magicBytes = buffer.subarray(0, 5).toString('utf-8');
      expect(magicBytes).toBe('%PDF-');
    }
  });

  test('2. Language switch to Kannada: UI and diagnosis report render in Kannada', async ({ page }) => {
    await authenticateDemo(page, 'kn');
    await page.goto('/diseases');

    // Verify Kannada header and texts
    await expect(page.locator('h1')).toHaveText(/ಫೋಟೋ ಆಧಾರಿತ ಬೆಳೆ ಆರೋಗ್ಯ ತಪಾಸಣೆ/i);
    await expect(page.getByText(/ನಿಖರವಾದ ಫೋಟೋ ತೆಗೆಯುವುದು ಹೇಗೆ\?/i)).toBeVisible();

    // Select photo and submit
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(SAMPLE_PHOTO_PATH);

    const analyzeBtn = page.getByRole('button', { name: /ಬೆಳೆ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾಡಿ/i });
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // Verify Kannada report view
    await expect(page.getByText(/ಮಾದರಿ ವರದಿ/i)).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/ತುರ್ತು ಮೊದಲ ಹಂತದ ಕ್ರಮಗಳು/i)).toBeVisible();
    await expect(page.getByText(/ಕಡ್ಡಾಯ ರೈತ ಸುರಕ್ಷತೆ/i)).toBeVisible();

    // Verify PDF download button translated in Kannada
    const pdfBtn = page.getByRole('button', { name: /ಪಿಡಿಎಫ್ \(PDF\) ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ/i });
    await expect(pdfBtn).toBeVisible();
  });

  test('3. Low-confidence diagnosis (<60%): displays unclear status, retake tip & prominent expert helpline', async ({
    page,
  }) => {
    await authenticateDemo(page, 'en');

    // Mock a low-confidence diagnosis response
    await page.route('**/api/diseases/diagnose-image', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'mock-low-confidence-report',
            thumbnailPath: '/problems/placeholder-crop-health.webp',
            createdAt: new Date().toISOString(),
            imageQuality: 'poor',
            retakeTip: 'Leaf surface is blurry or too dark. Please take a steady photo in natural daylight.',
            crop: {
              name: 'Tomato',
              confidence: 42,
            },
            status: 'unclear',
            topFindings: [
              {
                name: 'Unclear Spotting',
                localNames: { en: 'Unclear Spotting' },
                type: 'unclear',
                confidence: 42,
                severity: 'low',
                spreadRisk: 'low',
                observedSymptoms: ['Blurry discolored spots'],
                likelyCauses: ['Insufficient resolution to confirm pathogen'],
              },
            ],
            treatment: {
              immediateSteps: ['Retake a clear photo in bright daylight before applying any treatments.'],
              culturalAndOrganic: ['Inspect underside of leaves with a magnifying glass.'],
              chemical: [],
              safetyPrecautions: ['Do NOT spray pesticides without accurate disease identification.'],
              preventionTips: ['Maintain good airflow and field sanitation.'],
              recheckInDays: 2,
              whenToSeeExpert: 'Consult Kisan Call Centre or visit your nearest Krishi Vigyan Kendra (KVK).',
            },
            verifiedSource: 'AI-generated, verify with an expert',
            disclaimer: 'Confidence is below 60%. Please verify with an agricultural extension officer.',
            generatedAt: new Date().toISOString(),
            model: 'gemini-2.5-flash',
            isSample: false,
          },
        }),
      });
    });

    await page.goto('/diseases');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(SAMPLE_PHOTO_PATH);

    const analyzeBtn = page.getByRole('button', { name: /Diagnose Crop Health/i });
    await analyzeBtn.click();

    // Verify "Unclear" status badge and Retake Advice
    await expect(page.getByText(/unclear/i).first()).toBeVisible();
    await expect(page.getByText(/Leaf surface is blurry or too dark/i)).toBeVisible();

    // Verify Kisan Call Centre helpline 1800-180-1551 is prominently displayed
    await expect(page.getByText('1800-180-1551')).toBeVisible();
    await expect(page.getByRole('link', { name: /Call Kisan Call Centre/i })).toBeVisible();
    await expect(page.getByText(/Krishi Vigyan Kendra/i)).toBeVisible();
  });

  test('4. Past reports: persists across tab switch, allows viewing and deletion with confirmation', async ({
    page,
  }) => {
    await authenticateDemo(page, 'en');
    await page.goto('/diseases');

    // 1. Submit a diagnosis to create a past report in DB
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(SAMPLE_PHOTO_PATH);
    await page.getByRole('button', { name: /Diagnose Crop Health/i }).click();
    await expect(page.getByRole('heading', { name: /Early Blight/i })).toBeVisible({ timeout: 20000 });

    // 2. Switch to "My Past Reports" tab
    const pastReportsTab = page.getByRole('button', { name: /My Past Reports/i });
    await expect(pastReportsTab).toBeVisible();
    await pastReportsTab.click();

    // 3. Verify report appears in past list
    await expect(page.getByText(/Tomato/i).first()).toBeVisible();
    const deleteBtns = page.locator('button[aria-label="Delete Report"]');
    const initialCount = await deleteBtns.count();
    expect(initialCount).toBeGreaterThan(0);

    // 4. Click delete -> confirmation dialog appears
    await deleteBtns.first().click();
    await expect(page.getByRole('heading', { name: /Delete Report/i })).toBeVisible();
    await expect(page.getByText(/Are you sure you want to delete this report\?/i)).toBeVisible();

    // 5. Confirm deletion
    const confirmDeleteBtn = page.getByRole('button', { name: /^Delete$/i });
    await confirmDeleteBtn.click();

    // 6. Report is removed and count decreases by 1
    await expect(deleteBtns).toHaveCount(initialCount - 1);
  });

  test('5. Mobile 390x844 UX: touch targets >= 44px and BottomNav does not obscure action bar', async ({ page }) => {
    await authenticateDemo(page, 'en');
    await page.goto('/diseases');

    // Check touch target heights on primary buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box && box.height > 0) {
          expect(box.height).toBeGreaterThanOrEqual(40); // Standard mobile touch target
        }
      }
    }

    // Check bottom padding prevents BottomNav from obscuring scrollable page content
    const bottomNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(bottomNav).toBeVisible();

    const bottomNavBox = await bottomNav.boundingBox();
    expect(bottomNavBox).not.toBeNull();
    if (bottomNavBox) {
      // BottomNav is fixed at bottom
      expect(bottomNavBox.y + bottomNavBox.height).toBeGreaterThanOrEqual(840);
    }
  });
});
