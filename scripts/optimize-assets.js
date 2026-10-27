const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimize() {
  const assetsDir = path.join(__dirname, '../client/src/assets');
  const publicDir = path.join(__dirname, '../client/public');
  const publicAssetsDir = path.join(__dirname, '../client/public/assets');

  console.log('Optimizing assets...');

  // 1. Optimize krushi-sathi-logo
  const logoSrc = path.join(assetsDir, 'krushi-sathi-logo.png');
  if (fs.existsSync(logoSrc)) {
    // Generate optimized WebP
    const webpBuffer = await sharp(logoSrc)
      .resize({ width: 512, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer();

    fs.writeFileSync(path.join(assetsDir, 'krushi-sathi-logo.webp'), webpBuffer);
    fs.writeFileSync(path.join(publicDir, 'krushi-sathi-logo.webp'), webpBuffer);

    // Optimize PNG (for legacy/apple-touch-icon)
    const pngBuffer = await sharp(logoSrc)
      .resize({ width: 512, withoutEnlargement: true })
      .png({ compressionLevel: 9, effort: 7 })
      .toBuffer();

    fs.writeFileSync(logoSrc, pngBuffer);
    fs.writeFileSync(path.join(publicDir, 'krushi-sathi-logo.png'), pngBuffer);
    if (fs.existsSync(publicAssetsDir)) {
      fs.writeFileSync(path.join(publicAssetsDir, 'krushi-sathi-logo.png'), pngBuffer);
    }

    console.log(`Logo optimized: WebP is ${(webpBuffer.length / 1024).toFixed(1)} KB, PNG is ${(pngBuffer.length / 1024).toFixed(1)} KB`);
  }

  // 2. Optimize farmer_banner.jpg -> farmer_banner.webp
  const bannerSrc = path.join(assetsDir, 'farmer_banner.jpg');
  if (fs.existsSync(bannerSrc)) {
    const bannerWebp = await sharp(bannerSrc)
      .resize({ width: 320, height: 320, fit: 'cover' })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();

    fs.writeFileSync(path.join(assetsDir, 'farmer_banner.webp'), bannerWebp);
    console.log(`Farmer banner optimized to WebP: ${(bannerWebp.length / 1024).toFixed(1)} KB (was 521 KB)`);
  }

  // 3. Clean up unused farm_landscape.jpg
  const landscapeSrc = path.join(assetsDir, 'farm_landscape.jpg');
  if (fs.existsSync(landscapeSrc)) {
    fs.unlinkSync(landscapeSrc);
    console.log('Removed unused farm_landscape.jpg (saved 832 KB)');
  }

  // 4. Also generate standard PWA icon sizes (192x192, 512x512, maskable 512x512)
  const iconsDir = path.join(publicDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  await sharp(logoSrc)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'));

  await sharp(logoSrc)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'));

  // Maskable icon with safe-zone margin (410px logo centered on 512x512 background with #176B3A)
  const innerLogo = await sharp(logoSrc)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: '#176B3A'
    }
  })
    .composite([{ input: innerLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));

  console.log('PWA icons (192, 512, maskable) created successfully.');
}

optimize().catch(err => {
  console.error(err);
  process.exit(1);
});
