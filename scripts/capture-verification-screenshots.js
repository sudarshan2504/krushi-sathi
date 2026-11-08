const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3';
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function captureScreenshots() {
  console.log('Launching Edge for mobile verification screenshots...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Test at 390x844
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 1. Splash Page
  console.log('Capturing Splash Page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'verification-splash-390.png') });

  // 2. Language Selection
  console.log('Capturing Language Select Page...');
  await page.goto('http://localhost:5173/language', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'verification-language-390.png') });

  // 3. Login Page
  console.log('Capturing Login Page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'verification-login-390.png') });

  // 4. Authenticate via Demo Login and capture Home Page
  console.log('Authenticating as Ramesh Kumar via Instant Demo...');
  // Tap the Instant Demo button or set localStorage
  await page.evaluate(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/demo-login', { method: 'POST' });
      const json = await res.json();
      if (json.data?.token) {
        localStorage.setItem('krishi_sathi_token', json.data.token);
        localStorage.setItem('krishi_sathi_user', JSON.stringify(json.data.user));
      }
    } catch(e) {
      console.error(e);
    }
  });

  console.log('Capturing Home Dashboard...');
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'verification-home-390.png') });

  // 5. Profile Page
  console.log('Capturing Profile Dashboard...');
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'verification-profile-390.png') });

  // 6. Market Prices Page
  console.log('Capturing Market Prices Page...');
  await page.goto('http://localhost:5173/market-prices', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'verification-market-390.png') });

  // 7. Compact Viewport (360x740) for Android
  console.log('Capturing Home at 360x740 (Android Compact)...');
  await page.setViewport({ width: 360, height: 740, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'verification-home-360.png') });

  await browser.close();
  console.log('All verification screenshots saved to artifact directory!');
}

captureScreenshots().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
