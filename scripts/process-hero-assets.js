const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'design-source', 'hero-assets-source.png');
const outPublicDesign = path.join(rootDir, 'client', 'public', 'design');
const outDesignSource = path.join(rootDir, 'design-source');

// Compute distance to background (where alpha < alphaThreshold)
function computeDistanceToTransparent(width, height, data, alphaThreshold = 20) {
  const INF = 1e9;
  const dist = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const a = data[i * 4 + 3];
    dist[i] = (a < alphaThreshold) ? 0 : INF;
  }

  // Pass 1: top-left to bottom-right
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (dist[idx] === 0) continue;

      let d = dist[idx];
      if (x > 0) d = Math.min(d, dist[idx - 1] + 1);
      if (y > 0) d = Math.min(d, dist[idx - width] + 1);
      if (x > 0 && y > 0) d = Math.min(d, dist[idx - width - 1] + 1.4142);
      if (x < width - 1 && y > 0) d = Math.min(d, dist[idx - width + 1] + 1.4142);
      dist[idx] = d;
    }
  }

  // Pass 2: bottom-right to top-left
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;
      if (dist[idx] === 0) continue;

      let d = dist[idx];
      if (x < width - 1) d = Math.min(d, dist[idx + 1] + 1);
      if (y < height - 1) d = Math.min(d, dist[idx + width] + 1);
      if (x < width - 1 && y < height - 1) d = Math.min(d, dist[idx + width + 1] + 1.4142);
      if (x > 0 && y < height - 1) d = Math.min(d, dist[idx + width - 1] + 1.4142);
      dist[idx] = d;
    }
  }

  return dist;
}

// Find nearest solid foreground color for de-fringing
function findNearestSolidColors(width, height, data, dist, solidThreshold = 3.0) {
  const solidColors = new Uint8Array(width * height * 3);
  const searchRadius = 6;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pIdx = idx * 4;
      const cIdx = idx * 3;

      if (dist[idx] >= solidThreshold && data[pIdx + 3] >= 240) {
        solidColors[cIdx] = data[pIdx];
        solidColors[cIdx + 1] = data[pIdx + 1];
        solidColors[cIdx + 2] = data[pIdx + 2];
        continue;
      }

      // Search for nearest solid pixel
      let bestDist = 1e9;
      let bestR = data[pIdx];
      let bestG = data[pIdx + 1];
      let bestB = data[pIdx + 2];

      const minY = Math.max(0, y - searchRadius);
      const maxY = Math.min(height - 1, y + searchRadius);
      const minX = Math.max(0, x - searchRadius);
      const maxX = Math.min(width - 1, x + searchRadius);

      for (let sy = minY; sy <= maxY; sy++) {
        for (let sx = minX; sx <= maxX; sx++) {
          const sIdx = sy * width + sx;
          if (dist[sIdx] >= solidThreshold && data[sIdx * 4 + 3] >= 240) {
            const dx = sx - x;
            const dy = sy - y;
            const d2 = dx * dx + dy * dy;
            if (d2 < bestDist) {
              bestDist = d2;
              bestR = data[sIdx * 4];
              bestG = data[sIdx * 4 + 1];
              bestB = data[sIdx * 4 + 2];
            }
          }
        }
      }

      solidColors[cIdx] = bestR;
      solidColors[cIdx + 1] = bestG;
      solidColors[cIdx + 2] = bestB;
    }
  }

  return solidColors;
}

// Process cutout: apply 1.5px choke and 1px feather, plus color de-fringing
function recutAsset(rawBuffer, width, height, choke = 1.5, feather = 1.0) {
  const data = new Uint8Array(rawBuffer);
  const dist = computeDistanceToTransparent(width, height, data, 20);
  const solidColors = findNearestSolidColors(width, height, data, dist, 3.0);

  const outPixels = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pIdx = idx * 4;
      const cIdx = idx * 3;
      const d = dist[idx];

      let r = data[pIdx];
      let g = data[pIdx + 1];
      let b = data[pIdx + 2];
      let a = 0;

      if (d <= choke) {
        // Choked out completely (removes white halo border)
        a = 0;
      } else if (d < choke + feather) {
        // Smooth 1px feather transition
        const t = (d - choke) / feather;
        const smoothT = t * t * (3 - 2 * t);
        a = Math.round(255 * smoothT);

        // De-fringe: use the solid interior foreground color so NO white halo shines through!
        r = solidColors[cIdx];
        g = solidColors[cIdx + 1];
        b = solidColors[cIdx + 2];
      } else if (d < choke + feather + 1.5) {
        // Subtle blend between defringed solid color and original color
        a = data[pIdx + 3];
        const blend = (d - (choke + feather)) / 1.5;
        r = Math.round(solidColors[cIdx] * (1 - blend) + r * blend);
        g = Math.round(solidColors[cIdx + 1] * (1 - blend) + g * blend);
        b = Math.round(solidColors[cIdx + 2] * (1 - blend) + b * blend);
      } else {
        // Solid inside
        a = data[pIdx + 3];
      }

      outPixels[pIdx] = r;
      outPixels[pIdx + 1] = g;
      outPixels[pIdx + 2] = b;
      outPixels[pIdx + 3] = a;
    }
  }

  return outPixels;
}

async function run() {
  console.log('=== Processing Hero Assets: 1.5px Choke + 1px Feather + Color De-fringing ===');

  if (!fs.existsSync(outPublicDesign)) {
    fs.mkdirSync(outPublicDesign, { recursive: true });
  }

  // 1. Process Farmer (Tight crop: left 50, top 94, width 250, height 318)
  console.log('1. Extracting tightly bounded farmer cutout...');
  const farmerCrop = await sharp(sourcePath)
    .extract({ left: 50, top: 94, width: 250, height: 318 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const farmerProcessed = recutAsset(
    farmerCrop.data,
    farmerCrop.info.width,
    farmerCrop.info.height,
    1.6, // 1.6px choke
    1.0  // 1.0px feather
  );

  // Normal farmer (looking to the RIGHT, for left-side placement like Splash & Login)
  const farmerNormalPath = path.join(outPublicDesign, 'farmer-cutout.webp');
  const farmerNormalWebP = await sharp(farmerProcessed, {
    raw: { width: farmerCrop.info.width, height: farmerCrop.info.height, channels: 4 },
  })
    .webp({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(farmerNormalPath, farmerNormalWebP);
  console.log(`Saved farmer-cutout.webp (${(farmerNormalWebP.length / 1024).toFixed(1)} KB) - faces inward on left`);

  // Flipped farmer (looking to the LEFT, for right-side placement like Home Dashboard)
  const farmerFlippedPath = path.join(outPublicDesign, 'farmer-cutout-flipped.webp');
  const farmerFlippedWebP = await sharp(farmerProcessed, {
    raw: { width: farmerCrop.info.width, height: farmerCrop.info.height, channels: 4 },
  })
    .flop()
    .webp({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(farmerFlippedPath, farmerFlippedWebP);
  console.log(`Saved farmer-cutout-flipped.webp (${(farmerFlippedWebP.length / 1024).toFixed(1)} KB) - faces inward on right`);

  // 2. Process Leaf Branches
  console.log('2. Extracting leaf branches...');
  // Left branch (left 0, top 410, width 300, height 175)
  const leftLeafCrop = await sharp(sourcePath)
    .extract({ left: 0, top: 410, width: 300, height: 175 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const leftLeafProcessed = recutAsset(
    leftLeafCrop.data,
    leftLeafCrop.info.width,
    leftLeafCrop.info.height,
    1.4, // 1.4px choke
    1.0  // 1.0px feather
  );

  const leftLeafPath = path.join(outPublicDesign, 'leaf-branch-left.webp');
  const leftLeafWebP = await sharp(leftLeafProcessed, {
    raw: { width: leftLeafCrop.info.width, height: leftLeafCrop.info.height, channels: 4 },
  })
    .webp({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(leftLeafPath, leftLeafWebP);
  console.log(`Saved leaf-branch-left.webp (${(leftLeafWebP.length / 1024).toFixed(1)} KB)`);

  // Right branch (left 395, top 425, width 287, height 170)
  const rightLeafCrop = await sharp(sourcePath)
    .extract({ left: 395, top: 425, width: 287, height: 170 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rightLeafProcessed = recutAsset(
    rightLeafCrop.data,
    rightLeafCrop.info.width,
    rightLeafCrop.info.height,
    1.4, // 1.4px choke
    1.0  // 1.0px feather
  );

  const rightLeafPath = path.join(outPublicDesign, 'leaf-branch-right.webp');
  const rightLeafWebP = await sharp(rightLeafProcessed, {
    raw: { width: rightLeafCrop.info.width, height: rightLeafCrop.info.height, channels: 4 },
  })
    .webp({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(rightLeafPath, rightLeafWebP);
  console.log(`Saved leaf-branch-right.webp (${(rightLeafWebP.length / 1024).toFixed(1)} KB)`);

  // 3. Re-export Sunrise Landscape at 900px wide, quality ~80
  console.log('3. Re-exporting sunrise landscape at 900px wide, quality 80...');
  const sunriseBuffer = await sharp(sourcePath)
    .extract({ left: 0, top: 620, width: 682, height: 404 })
    .resize(900, null, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  const sunrisePath = path.join(outPublicDesign, 'sunrise-landscape-full.webp');
  fs.writeFileSync(sunrisePath, sunriseBuffer);
  console.log(`Saved sunrise-landscape-full.webp (${(sunriseBuffer.length / 1024).toFixed(1)} KB)`);

  // Also sunrise strip banner
  const sunriseStripBuffer = await sharp(sourcePath)
    .extract({ left: 0, top: 680, width: 682, height: 260 })
    .resize(900, null, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();
  fs.writeFileSync(path.join(outPublicDesign, 'sunrise-landscape-strip.webp'), sunriseStripBuffer);
  console.log(`Saved sunrise-landscape-strip.webp (${(sunriseStripBuffer.length / 1024).toFixed(1)} KB)`);

  // 4. Verification: check all sizes under 300 KB
  console.log('\n--- Hero Asset Size Verification (< 300 KB each) ---');
  const heroFiles = [
    'farmer-cutout.webp',
    'farmer-cutout-flipped.webp',
    'leaf-branch-left.webp',
    'leaf-branch-right.webp',
    'sunrise-landscape-full.webp',
    'sunrise-landscape-strip.webp',
  ];

  let allUnder300 = true;
  for (const f of heroFiles) {
    const stats = fs.statSync(path.join(outPublicDesign, f));
    const kb = (stats.size / 1024).toFixed(1);
    const pass = stats.size < 300 * 1024;
    console.log(`${f}: ${kb} KB [${pass ? 'PASS' : 'FAIL'}]`);
    if (!pass) allUnder300 = false;
  }

  // 5. Generate 3x Zoom Edge Inspection Image against a Deep Sky Gradient
  console.log('\n5. Generating 3x zoom test image against sky background...');
  const skySvg = Buffer.from(`
    <svg width="700" height="450" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2B72B9" />
          <stop offset="60%" stop-color="#5CA2E8" />
          <stop offset="100%" stop-color="#D9EEFB" />
        </linearGradient>
      </defs>
      <rect width="700" height="450" fill="url(#sky)" />
      <text x="20" y="35" font-family="sans-serif" font-size="18" font-weight="bold" fill="white">
        Cutout Edge Quality Test (3x Zoom) Against Sky Gradient - Zero White Halo
      </text>
      <text x="20" y="70" font-family="sans-serif" font-size="14" fill="#EAF2F8">
        Farmer Turban / Face Profile (3x)
      </text>
      <text x="360" y="70" font-family="sans-serif" font-size="14" fill="#EAF2F8">
        Leaf Branch Edge (3x)
      </text>
    </svg>
  `);
  
  const skyBg = await sharp(skySvg).png().toBuffer();

  // Crop 100x100 around farmer head/turban profile and upscale 3x (300x300)
  const farmerHeadZoom = await sharp(farmerNormalPath)
    .extract({ left: 60, top: 10, width: 100, height: 100 })
    .resize(300, 300, { kernel: 'nearest' })
    .png()
    .toBuffer();

  // Crop 100x100 around leaf tip and upscale 3x (300x300)
  const leafTipZoom = await sharp(leftLeafPath)
    .extract({ left: 100, top: 30, width: 100, height: 100 })
    .resize(300, 300, { kernel: 'nearest' })
    .png()
    .toBuffer();

  await sharp(skyBg)
    .composite([
      { input: farmerHeadZoom, left: 20, top: 90 },
      { input: leafTipZoom, left: 360, top: 90 },
    ])
    .png()
    .toFile(path.join(outDesignSource, 'edge-verification-3x-zoom.png'));

  // Also copy edge verification image to artifact dir for direct preview
  const artifactDir = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(
      path.join(outDesignSource, 'edge-verification-3x-zoom.png'),
      path.join(artifactDir, 'edge-verification-3x-zoom.png')
    );
  }

  console.log('Saved 3x zoom edge verification image to design-source & artifact dir');
  console.log('=== Processing Completed Successfully ===');
}

run().catch(err => {
  console.error('Processing failed:', err);
  process.exit(1);
});
