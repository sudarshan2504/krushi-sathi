const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3';
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const viewports = [
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
];

const tabs = [
  { route: '/home', name: 'home' },
  { route: '/crops', name: 'crops' },
  { route: '/chat', name: 'chat' },
  { route: '/profile', name: 'profile' },
];

async function runVerification() {
  console.log('Launching Edge for BottomNav verification...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const results = [];

  for (const vp of viewports) {
    console.log(`\n=== Testing Viewport ${vp.name}px (${vp.width}x${vp.height}) ===`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });

    for (const lang of languages) {
      console.log(`  -> Testing Language: ${lang.name} (${lang.code})`);

      // Set user authentication & language in localStorage
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
      await page.evaluate(async (lCode) => {
        try {
          const res = await fetch('http://localhost:5000/api/auth/demo-login', { method: 'POST' });
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

      for (const tab of tabs) {
        await page.goto(`http://localhost:5173${tab.route}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 600));

        // Evaluate DOM metrics for Nav and Labels
        const check = await page.evaluate((lCode, tName, vpW) => {
          const nav = document.querySelector('nav[aria-label="Main navigation"]');
          if (!nav) return { error: 'Nav not found' };

          const navBox = nav.getBoundingClientRect();
          const links = Array.from(nav.querySelectorAll('a'));
          const pageOverflow = document.documentElement.scrollWidth > window.innerWidth;

          const tabsData = links.map((a) => {
            const span = a.querySelector('span');
            const svg = a.querySelector('svg');
            const spanBox = span ? span.getBoundingClientRect() : null;
            const svgBox = svg ? svg.getBoundingClientRect() : null;
            const aBox = a.getBoundingClientRect();

            return {
              text: span?.textContent?.trim() || '',
              scrollWidth: span?.scrollWidth || 0,
              clientWidth: span?.clientWidth || 0,
              isTruncated: span ? span.scrollWidth > span.clientWidth + 1 : false,
              cellWidth: Math.round(aBox.width),
              cellHeight: Math.round(aBox.height),
              svgAboveSpan: svgBox && spanBox ? svgBox.bottom <= spanBox.top + 2 : false,
              isActive: a.getAttribute('aria-current') === 'page',
            };
          });

          // Check if bottom fade exists
          const fadeEl = document.querySelector('div[style*="calc(104px"]');

          return {
            pageOverflow,
            navWidth: Math.round(navBox.width),
            navHeight: Math.round(navBox.height),
            navBottom: Math.round(navBox.bottom),
            fadeFound: !!fadeEl,
            tabsData,
          };
        }, lang.code, tab.name, vp.width);

        // Capture full screen screenshot for primary active tab (home), or key permutations
        const filename = `nav-${lang.code}-${tab.name}-${vp.name}.png`;
        const filePath = path.join(artifactDir, filename);

        // Also capture element screenshot of just the bottom nav bar area
        const navElement = await page.$('nav[aria-label="Main navigation"]');
        if (navElement) {
          await navElement.screenshot({ path: filePath });
        } else {
          await page.screenshot({ path: filePath });
        }

        results.push({
          viewport: vp.name,
          language: lang.code,
          activeTab: tab.name,
          file: filename,
          metrics: check,
        });

        // If Home tab, also capture the full mobile view to see the bottom fade with content
        if (tab.name === 'home') {
          const fullFilename = `screen-full-${lang.code}-${vp.name}.png`;
          const fullPath = path.join(artifactDir, fullFilename);
          await page.screenshot({ path: fullPath });
        }
      }
    }
  }

  await browser.close();

  // Print summary of verification metrics
  console.log('\n========================================');
  console.log('BOTTOM NAV VERIFICATION AUDIT RESULTS');
  console.log('========================================');
  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    const m = r.metrics;
    if (m.error) {
      console.log(`❌ [${r.viewport}px | ${r.language} | ${r.activeTab}]: ERROR - ${m.error}`);
      failCount++;
      continue;
    }

    const anyTruncated = m.tabsData.some(t => t.isTruncated);
    const allVertical = m.tabsData.every(t => t.svgAboveSpan);
    const minTargetOk = m.tabsData.every(t => t.cellHeight >= 44 && t.cellWidth >= 44);

    if (!m.pageOverflow && allVertical && minTargetOk) {
      console.log(`✅ [${r.viewport}px | ${r.language} | ${r.activeTab}]: Vertical layout OK, Cells: ${m.tabsData.map(t => `${t.text}(${t.cellWidth}px)`).join(', ')}, Target >= 44px, No page overflow`);
      passCount++;
    } else {
      console.log(`⚠️ [${r.viewport}px | ${r.language} | ${r.activeTab}]: Issues detected - PageOverflow: ${m.pageOverflow}, AllVertical: ${allVertical}, MinTarget: ${minTargetOk}`);
      failCount++;
    }
  }

  console.log(`\nAudit Complete: ${passCount} Passed, ${failCount} Failed out of ${results.length} permutations.`);
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
