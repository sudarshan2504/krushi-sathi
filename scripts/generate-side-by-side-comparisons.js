const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3';
const mockupDir = 'f:/krushi sathi/design-source/mockups';

const pairs = [
  {
    name: '01_Splash',
    screenshot: path.join(artifactDir, 'verification-splash-390.png'),
    mockup: path.join(mockupDir, '01_Splash_Intro.jpg'),
    output: path.join(artifactDir, 'comparison-01-splash-390.png'),
  },
  {
    name: '02_Language',
    screenshot: path.join(artifactDir, 'verification-language-390.png'),
    mockup: path.join(mockupDir, '02_Language_Selection.jpg'),
    output: path.join(artifactDir, 'comparison-02-language-390.png'),
  },
  {
    name: '03_Login',
    screenshot: path.join(artifactDir, 'verification-login-390.png'),
    mockup: path.join(mockupDir, '03_Login_Screen.jpg'),
    output: path.join(artifactDir, 'comparison-03-login-390.png'),
  },
  {
    name: '04_Home',
    screenshot: path.join(artifactDir, 'verification-home-390.png'),
    mockup: path.join(mockupDir, '04_Home_Dashboard.jpg'),
    output: path.join(artifactDir, 'comparison-04-home-390.png'),
  },
  {
    name: '05_Profile',
    screenshot: path.join(artifactDir, 'verification-profile-390.png'),
    mockup: path.join(mockupDir, '05_Profile_Dashboard.jpg'),
    output: path.join(artifactDir, 'comparison-05-profile-390.png'),
  },
];

async function generateComparisons() {
  const targetH = 844;
  const targetW = 390;

  for (const pair of pairs) {
    if (!fs.existsSync(pair.screenshot) || !fs.existsSync(pair.mockup)) {
      console.log(`Skipping ${pair.name}: missing files`);
      continue;
    }

    console.log(`Generating side-by-side for ${pair.name}...`);

    // Normalize screenshot to 390x844
    const screenBuffer = await sharp(pair.screenshot)
      .resize(targetW, targetH, { fit: 'fill' })
      .toBuffer();

    // Normalize mockup to 390x844
    const mockupBuffer = await sharp(pair.mockup)
      .resize(targetW, targetH, { fit: 'fill' })
      .toBuffer();

    // Composite side by side: [Mockup (Left)] [Actual Screen (Right)]
    const combinedW = targetW * 2 + 20; // 20px divider
    const combinedH = targetH + 60; // 60px header

    const headerSvg = Buffer.from(`
      <svg width="${combinedW}" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="${combinedW}" height="60" fill="#144D29" />
        <text x="30" y="38" font-family="sans-serif" font-size="18" font-weight="bold" fill="#84CC16">
          MOCKUP DESIGN (${pair.name})
        </text>
        <text x="${targetW + 40}" y="38" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">
          CURRENT IMPLEMENTATION (390x844)
        </text>
      </svg>
    `);

    const headerBuffer = await sharp(headerSvg).png().toBuffer();

    const canvas = await sharp({
      create: {
        width: combinedW,
        height: combinedH,
        channels: 4,
        background: { r: 24, g: 30, b: 27, alpha: 1 },
      },
    })
      .composite([
        { input: headerBuffer, left: 0, top: 0 },
        { input: mockupBuffer, left: 0, top: 60 },
        { input: screenBuffer, left: targetW + 20, top: 60 },
      ])
      .png()
      .toFile(pair.output);

    console.log(`Saved: ${pair.output}`);
  }
}

generateComparisons().catch(err => {
  console.error('Comparison generation failed:', err);
  process.exit(1);
});
