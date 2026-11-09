const puppeteer = require('puppeteer-core');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3';
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const mockupImg = path.join(artifactDir, '.user_uploaded/media_1794157042716_1caa67d2.jpg');

async function captureHomeSideBySide() {
  console.log('Launching Edge for Home 390x844 comparison...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // Authenticate as Ramesh Kumar
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/demo-login', { method: 'POST' });
      const json = await res.json();
      if (json.data?.token) {
        localStorage.setItem('krishi_sathi_token', json.data.token);
        localStorage.setItem('krishi_sathi_user', JSON.stringify(json.data.user));
      }
    } catch (e) {
      console.error(e);
    }
  });

  console.log('Navigating to Home Dashboard...');
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const homeScreenshotPath = path.join(artifactDir, 'verification-home-390.png');
  await page.screenshot({ path: homeScreenshotPath });
  console.log('Home screenshot saved:', homeScreenshotPath);

  await browser.close();

  // Create Side-by-Side comparison
  console.log('Compositing Side-by-Side comparison image...');
  const targetH = 844;
  const targetW = 390;

  // Resize mockup and live screenshot to exact 390x844
  const mockupResized = await sharp(mockupImg)
    .resize(targetW, targetH, { fit: 'fill' })
    .toBuffer();

  const liveResized = await sharp(homeScreenshotPath)
    .resize(targetW, targetH, { fit: 'fill' })
    .toBuffer();

  // Create a combined canvas: width = 390 * 2 + 20 (gap) = 800, height = 844 + 40 (header banner)
  const headerH = 40;
  const canvasW = targetW * 2 + 20;
  const canvasH = targetH + headerH;

  const sideBySideBuf = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 245, g: 243, b: 238, alpha: 1 }
    }
  })
    .composite([
      { input: mockupResized, left: 0, top: headerH },
      { input: liveResized, left: targetW + 20, top: headerH }
    ])
    .png()
    .toBuffer();

  const comparisonPath = path.join(artifactDir, 'home-side-by-side-comparison.png');
  fs.writeFileSync(comparisonPath, sideBySideBuf);
  console.log('Side-by-side comparison image written to:', comparisonPath);
}

captureHomeSideBySide();

