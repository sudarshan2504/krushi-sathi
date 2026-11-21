import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImagePath = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3/.user_uploaded/media_1795268837912_5266dc8b.jpg';

async function generateIcons() {
  if (!fs.existsSync(sourceImagePath)) {
    throw new Error('Source image not found at ' + sourceImagePath);
  }

  console.log('Loading source image...');
  const sourceBuffer = fs.readFileSync(sourceImagePath);

  // 1. Create a transparent-corner squircle version (1024x1024)
  // Mask radius: rx=200, ry=200 for 1024x1024
  const squircleSvg = Buffer.from(
    '<svg width="1024" height="1024"><rect x="0" y="0" width="1024" height="1024" rx="200" ry="200" fill="#ffffff"/></svg>'
  );

  const squircle1024 = await sharp(sourceBuffer)
    .resize(1024, 1024)
    .composite([{ input: squircleSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. Create circular version (1024x1024)
  const circleSvg = Buffer.from(
    '<svg width="1024" height="1024"><circle cx="512" cy="512" r="512" fill="#ffffff"/></svg>'
  );

  const circle1024 = await sharp(sourceBuffer)
    .resize(1024, 1024)
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Mipmap directories and sizes
  const mipmaps = [
    { dir: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
    { dir: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
    { dir: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
    { dir: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
    { dir: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
  ];

  const resBase = path.resolve(__dirname, '../client/android/app/src/main/res');

  for (const item of mipmaps) {
    const targetDir = path.join(resBase, item.dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // A. ic_launcher.png (squircle with transparent corners)
    await sharp(squircle1024)
      .resize(item.launcherSize, item.launcherSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // B. ic_launcher_round.png (circular)
    await sharp(circle1024)
      .resize(item.launcherSize, item.launcherSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // C. ic_launcher_foreground.png (108dp canvas, safe zone ~72dp: 68% of canvas)
    // Scale squircle to safe zone dimension
    const innerSize = Math.round(item.foregroundSize * 0.72);
    const scaledInner = await sharp(squircle1024)
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();

    const top = Math.round((item.foregroundSize - innerSize) / 2);
    const left = Math.round((item.foregroundSize - innerSize) / 2);

    await sharp({
      create: {
        width: item.foregroundSize,
        height: item.foregroundSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: scaledInner, top, left }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated ${item.dir}: ic_launcher (${item.launcherSize}px), ic_launcher_round (${item.launcherSize}px), ic_launcher_foreground (${item.foregroundSize}px)`);
  }

  // 3. Update Web / PWA icons
  const publicIconsDir = path.resolve(__dirname, '../client/public/icons');
  if (fs.existsSync(publicIconsDir)) {
    await sharp(squircle1024).resize(192, 192).png().toFile(path.join(publicIconsDir, 'icon-192x192.png'));
    await sharp(squircle1024).resize(512, 512).png().toFile(path.join(publicIconsDir, 'icon-512x512.png'));
    
    // Maskable icon with 20% safe-padding (inner size ~384x384 in 512x512 canvas)
    const maskableInner = await sharp(squircle1024).resize(384, 384).png().toBuffer();
    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: maskableInner, top: 64, left: 64 }])
      .png()
      .toFile(path.join(publicIconsDir, 'icon-maskable-512x512.png'));

    console.log('Updated client/public/icons (192x192, 512x512, maskable)');
  }

  // Also update client/public/krushi-sathi-logo.webp if appropriate
  const logoWebpPath = path.resolve(__dirname, '../client/public/krushi-sathi-logo.webp');
  await sharp(squircle1024).resize(512, 512).webp({ quality: 90 }).toFile(logoWebpPath);
  console.log('Updated client/public/krushi-sathi-logo.webp');

  console.log('\nAll Android and Web icons successfully generated!');
}

generateIcons().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
