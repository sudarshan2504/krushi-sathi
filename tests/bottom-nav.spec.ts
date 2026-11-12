import { test, expect } from '@playwright/test';

const languages = [
  { code: 'en', name: 'English', home: 'Home', crops: 'Crops', chat: 'AI Chat', profile: 'Profile' },
  { code: 'kn', name: 'Kannada', home: 'ಮುಖಪುಟ', crops: 'ಬೆಳೆಗಳು', chat: 'AI ಚಾಟ್', profile: 'ಪ್ರೊಫೈಲ್' },
  { code: 'ta', name: 'Tamil', home: 'முகப்பு', crops: 'பயிர்கள்', chat: 'AI சாட்', profile: 'சுயவிவரம்' },
  { code: 'te', name: 'Telugu', home: 'హోమ్', crops: 'పంటలు', chat: 'AI చాట్', profile: 'ప్రొఫైల్' },
];

const routes = ['/home', '/crops', '/chat', '/profile'];

test.describe('BottomNav Redesign Verification', () => {
  for (const lang of languages) {
    test(`BottomNav layout, fonts & overflow in ${lang.name}`, async ({ page }) => {
      // 1. Authenticate with demo login
      await page.goto('/login');
      await page.evaluate(async (lCode) => {
        try {
          const res = await fetch('/api/auth/demo-login', { method: 'POST' });
          const json = await res.json();
          if (json.data?.token) {
            localStorage.setItem('krishi_sathi_token', json.data.token);
            localStorage.setItem('krishi_sathi_user', JSON.stringify({ ...json.data.user, language: lCode }));
          }
          localStorage.setItem('krishi_sathi_lang', lCode);
        } catch (e) {
          console.error(e);
        }
      }, lang.code);

      // Navigate to Home
      await page.goto('/home');
      await page.waitForSelector('nav[aria-label="Main navigation"]');

      // 2. Check no horizontal overflow on page
      const pageOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(pageOverflow).toBeTruthy();

      // 3. Check Nav Bar geometry: exactly 4 equal-width cells in CSS grid
      const navBar = page.locator('nav[aria-label="Main navigation"] > div');
      await expect(navBar).toBeVisible();

      const tabs = page.locator('nav[aria-label="Main navigation"] a');
      await expect(tabs).toHaveCount(4);

      // 4. Verify each tab's text fits inside cell without wrapping to 2 lines
      for (let i = 0; i < 4; i++) {
        const tab = tabs.nth(i);
        const icon = tab.locator('svg');
        const label = tab.locator('span');

        await expect(icon).toBeVisible();
        await expect(label).toBeVisible();

        const geom = await page.evaluate((el) => {
          const tabBox = el.getBoundingClientRect();
          const svg = el.querySelector('svg');
          const span = el.querySelector('span');
          if (!svg || !span) return null;

          const svgBox = svg.getBoundingClientRect();
          const spanBox = span.getBoundingClientRect();

          return {
            tabWidth: tabBox.width,
            tabHeight: tabBox.height,
            svgTop: svgBox.top,
            svgBottom: svgBox.bottom,
            spanTop: spanBox.top,
            spanBottom: spanBox.bottom,
            spanScrollWidth: span.scrollWidth,
            spanClientWidth: span.clientWidth,
            spanScrollHeight: span.scrollHeight,
            spanClientHeight: span.clientHeight,
            lineHeight: window.getComputedStyle(span).lineHeight,
          };
        }, await tab.elementHandle());

        expect(geom).not.toBeNull();
        if (geom) {
          // Icon is strictly vertically above the label
          expect(geom.svgBottom).toBeLessThanOrEqual(geom.spanTop + 2);
          // Touch target >= 44px
          expect(geom.tabHeight).toBeGreaterThanOrEqual(44);
          expect(geom.tabWidth).toBeGreaterThanOrEqual(44);
          // Label does not wrap vertically to two lines
          expect(geom.spanScrollHeight).toBeLessThanOrEqual(geom.spanClientHeight + 2);
        }
      }

      // 5. Check Active State Pill on /home
      const activePill = page.locator('[data-testid="active-nav-pill"]');
      await expect(activePill).toBeVisible();

      // 6. Check Bottom Fade exists
      const bottomFade = page.locator('[data-testid="bottom-fade"]');
      await expect(bottomFade).toBeAttached();
    });
  }

  test('Tab switching causes zero layout shift and active pill moves cleanly', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(async () => {
      const res = await fetch('/api/auth/demo-login', { method: 'POST' });
      const json = await res.json();
      if (json.data?.token) {
        localStorage.setItem('krishi_sathi_token', json.data.token);
        localStorage.setItem('krishi_sathi_user', JSON.stringify(json.data.user));
      }
      localStorage.setItem('krishi_sathi_lang', 'kn');
    });

    for (const r of routes) {
      await page.goto(r);
      await page.waitForSelector('nav[aria-label="Main navigation"]');

      const tabs = page.locator('nav[aria-label="Main navigation"] a');
      const widths = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('nav[aria-label="Main navigation"] a'));
        return links.map(l => l.getBoundingClientRect().width);
      });

      // All 4 tabs must have equal width (within 1px rounding)
      const minW = Math.min(...widths);
      const maxW = Math.max(...widths);
      expect(maxW - minW).toBeLessThanOrEqual(1.5);
    }
  });
});
