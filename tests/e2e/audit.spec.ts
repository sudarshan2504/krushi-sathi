import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'tests/__screenshots__');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
] as const;

const LANGUAGES = ['en', 'kn', 'ta', 'te'] as const;

const PUBLIC_ROUTES = [
  { path: '/', name: 'splash' },
  { path: '/language', name: 'language' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
] as const;

const PROTECTED_ROUTES = [
  { path: '/home', name: 'home' },
  { path: '/soil', name: 'soil' },
  { path: '/crops', name: 'crops' },
  { path: '/crop-library', name: 'crop-library' },
  { path: '/crops/crop-ragi-finger-millet', name: 'crop-details' },
  { path: '/crops/lifecycle', name: 'crop-lifecycle' },
  { path: '/diseases', name: 'diseases' },
  { path: '/market-prices', name: 'market-prices' },
  { path: '/chat', name: 'chat' },
  { path: '/profile', name: 'profile' },
  { path: '/credits', name: 'credits' },
  { path: '/dev/crop-gallery', name: 'dev-crop-gallery' },
] as const;

async function installGeolocationMock(page: Page) {
  await page.addInitScript(() => {
    const mockPosition = {
      coords: {
        latitude: 12.2958,
        longitude: 76.6394,
        accuracy: 25,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          setTimeout(() => success(mockPosition as GeolocationPosition), 15);
        },
        watchPosition: () => 1,
        clearWatch: () => {},
      },
    });
  });
}

async function authenticateWithLanguage(page: Page, lang: string) {
  await page.goto('/login');
  await page.evaluate(async (lCode) => {
    const res = await fetch('/api/auth/demo-login', { method: 'POST' });
    if (!res.ok) throw new Error(`Demo login HTTP ${res.status}`);
    const json = await res.json();
    localStorage.setItem('krishi_sathi_token', json.data.token);
    localStorage.setItem(
      'krishi_sathi_user',
      JSON.stringify({ ...json.data.user, language: lCode })
    );
    localStorage.setItem('krishi_sathi_lang', lCode);
    localStorage.setItem('krushi_sathi_theme', 'light');
    document.documentElement.classList.remove('dark');
  }, lang);
}

async function runRouteChecks(
  page: Page,
  routePath: string,
  routeName: string,
  lang: string,
  vp: { name: string; width: number; height: number }
) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const badResponses: string[] = [];

  const onPageError = (err: Error) => pageErrors.push(err.message);
  const onConsole = (msg: any) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  };
  const onResponse = (resp: any) => {
    if (resp.status() >= 400) {
      badResponses.push(`${resp.status()} ${resp.url()}`);
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('response', onResponse);

  try {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.evaluate((lCode) => {
      localStorage.setItem('krishi_sathi_lang', lCode);
      const rawUser = localStorage.getItem('krishi_sathi_user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          parsed.language = lCode;
          localStorage.setItem('krishi_sathi_user', JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
    }, lang);

    await page.goto(routePath, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    // Wait for loading skeletons / initial paint transitions to settle
    await page.waitForTimeout(250);

    // Trigger lazy-loaded images by scrolling through the page, return to top, and await decode
    await page.evaluate(async () => {
      const totalHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const step = Math.max(300, Math.floor(window.innerHeight * 0.85));
      for (let y = 0; y <= totalHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 25));
      }
      window.scrollTo(0, totalHeight);
      await new Promise((r) => setTimeout(r, 40));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 40));

      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          const rect = img.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return Promise.resolve();
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, 5000);
          });
        })
      );
    });

    const contextLabel = `[${routePath} | ${vp.name} | ${lang}]`;

    // 1. Horizontal overflow check
    const overflowInfo = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(
      overflowInfo.scrollWidth,
      `${contextLabel} horizontal overflow: scrollWidth=${overflowInfo.scrollWidth} > innerWidth=${overflowInfo.innerWidth}`
    ).toBeLessThanOrEqual(overflowInfo.innerWidth);

    // 2. Interactive touch target check (>= 44px height)
    const smallControls = await page.evaluate(() => {
      const selector =
        'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="option"], [role="switch"]';
      const nodes = Array.from(document.querySelectorAll(selector));
      const issues: Array<{ tag: string; text: string; height: number; width: number; cls: string }> = [];

      for (const el of nodes) {
        const htmlEl = el as HTMLElement;
        const style = window.getComputedStyle(htmlEl);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          parseFloat(style.opacity || '1') === 0
        ) {
          continue;
        }
        // Skip screen-reader only clipped controls
        if (htmlEl.classList.contains('sr-only')) continue;

        const rect = htmlEl.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;

        if (rect.height < 43.9) {
          issues.push({
            tag: htmlEl.tagName.toLowerCase(),
            text: (htmlEl.innerText || htmlEl.getAttribute('aria-label') || '').trim().slice(0, 60),
            height: Number(rect.height.toFixed(1)),
            width: Number(rect.width.toFixed(1)),
            cls: String(htmlEl.className || '').slice(0, 80),
          });
        }
      }
      return issues;
    });
    expect(
      smallControls,
      `${contextLabel} interactive controls < 44px height: ${JSON.stringify(smallControls)}`
    ).toEqual([]);

    // 3. Minimum readable font size (>= 11px for visible leaf text)
    const tinyTexts = await page.evaluate(() => {
      const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'TITLE']);
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const issues: Array<{ text: string; fontSize: number; tag: string; cls: string }> = [];
      let node: Node | null;

      while ((node = walker.nextNode())) {
        if (!node.textContent || node.textContent.trim().length === 0) continue;
        const parent = node.parentElement;
        if (!parent || skipTags.has(parent.tagName)) continue;

        const cs = window.getComputedStyle(parent);
        if (
          cs.display === 'none' ||
          cs.visibility === 'hidden' ||
          parseFloat(cs.opacity || '1') === 0
        ) {
          continue;
        }
        const rect = parent.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        // Ignore sr-only visually hidden helper text
        if (rect.width <= 2 && rect.height <= 2) continue;

        const fontSize = parseFloat(cs.fontSize);
        if (fontSize < 10.9) {
          issues.push({
            text: node.textContent.trim().slice(0, 50),
            fontSize: Number(fontSize.toFixed(1)),
            tag: parent.tagName.toLowerCase(),
            cls: String(parent.className || '').slice(0, 80),
          });
        }
      }
      return issues;
    });
    expect(
      tinyTexts,
      `${contextLabel} text smaller than 11px: ${JSON.stringify(tinyTexts)}`
    ).toEqual([]);

    // 4. All visible <img> loaded cleanly
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const bad: Array<{ src: string; complete: boolean; naturalWidth: number }> = [];
      for (const img of imgs) {
        const cs = window.getComputedStyle(img);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const rect = img.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (!img.complete || img.naturalWidth === 0) {
          bad.push({
            src: img.getAttribute('src') || '',
            complete: img.complete,
            naturalWidth: img.naturalWidth,
          });
        }
      }
      return bad;
    });
    expect(
      brokenImages,
      `${contextLabel} broken visible images: ${JSON.stringify(brokenImages)}`
    ).toEqual([]);

    // 5. Axe accessibility audit (0 serious / critical violations)
    const axe = await new AxeBuilder({ page }).analyze();
    const blockingA11y = axe.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.help,
        targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
      }));
    expect(
      blockingA11y,
      `${contextLabel} serious/critical axe violations: ${JSON.stringify(blockingA11y, null, 2)}`
    ).toEqual([]);

    // 6. Save key screenshots
    if (
      (vp.name === '390x844' &&
        (routeName === 'home' ||
          (lang === 'en' &&
            ['splash', 'language', 'login', 'soil', 'crops', 'chat', 'profile'].includes(routeName)))) ||
      (routeName === 'home' && lang === 'kn' && ['360x740', '430x932'].includes(vp.name))
    ) {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${routeName}-${lang}-${vp.name}.png`),
      });
    }

    // 7. Capture open language dropdown screenshot on /home @ 390x844
    if (routeName === 'home' && lang === 'en' && vp.name === '390x844') {
      const langBtn = page.locator('button[aria-label^="Change language"]');
      await langBtn.click();
      await expect(page.getByRole('listbox', { name: 'Select language' })).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'home-language-dropdown-390x844.png'),
      });
      await page.keyboard.press('Escape');
    }

    // 8. Runtime console/page/HTTP error assertions
    expect(pageErrors, `${contextLabel} uncaught pageerrors`).toEqual([]);
    expect(consoleErrors, `${contextLabel} console.error calls`).toEqual([]);
    expect(badResponses, `${contextLabel} HTTP >= 400 responses`).toEqual([]);
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('response', onResponse);
  }
}

test.describe('Full Route x Viewport x Language UI & Accessibility Audit', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`Audit public route ${route.path} across 3 viewports x 4 languages`, async ({ page }) => {
      test.setTimeout(120000);
      await installGeolocationMock(page);
      await page.goto('/language', { waitUntil: 'domcontentloaded' });
      for (const lang of LANGUAGES) {
        for (const vp of VIEWPORTS) {
          await runRouteChecks(page, route.path, route.name, lang, vp);
        }
      }
    });
  }

  for (const route of PROTECTED_ROUTES) {
    test(`Audit protected route ${route.path} across 3 viewports x 4 languages`, async ({ page }) => {
      test.setTimeout(150000);
      await installGeolocationMock(page);
      await authenticateWithLanguage(page, 'en');
      for (const lang of LANGUAGES) {
        for (const vp of VIEWPORTS) {
          await runRouteChecks(page, route.path, route.name, lang, vp);
        }
      }
    });
  }
});

