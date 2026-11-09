const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = 'C:/Users/sudar/.gemini/antigravity/brain/87d2db42-2bb6-4c62-bfdf-c2130e104ff3/.user_uploaded';
const targetDirSrc = path.join(__dirname, '../client/src/assets/design');
const targetDirPublic = path.join(__dirname, '../client/public/design');

[targetDirSrc, targetDirPublic].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const splashImg = path.join(uploadsDir, 'media_1794157033099_da03b288.jpg');
const langImg = path.join(uploadsDir, 'media_1794157039587_d7be898a.jpg');
const loginImg = path.join(uploadsDir, 'media_1794157037291_1794445c.jpg');
const homeImg = path.join(uploadsDir, 'media_1794157042716_1caa67d2.jpg');
const profileImg = path.join(uploadsDir, 'media_1794157045954_bb1f305c.jpg');
const logoImg = path.join(uploadsDir, 'media_1793727797386_f459d0cc.png');

async function processAssets() {
  console.log('Processing Krushi Sathi redesign assets...');

  // 1. Process Logo: Make white background transparent and crop tightly
  try {
    const logoRaw = await sharp(logoImg).raw().toBuffer({ resolveWithObject: true });
    const { data, info } = logoRaw;
    const outputBuffer = Buffer.alloc(info.width * info.height * 4);

    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      
      // If pixel is near-white (background), set alpha to 0
      if (r > 240 && g > 240 && b > 240) {
        outputBuffer[i * 4] = r;
        outputBuffer[i * 4 + 1] = g;
        outputBuffer[i * 4 + 2] = b;
        outputBuffer[i * 4 + 3] = 0;
      } else {
        outputBuffer[i * 4] = r;
        outputBuffer[i * 4 + 1] = g;
        outputBuffer[i * 4 + 2] = b;
        outputBuffer[i * 4 + 3] = 255;
      }
    }

    const trimmedLogo = sharp(outputBuffer, {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).trim();

    const logoBuffer = await trimmedLogo.webp({ quality: 95 }).toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'krushi-sathi-logo.webp'), logoBuffer);
    fs.writeFileSync(path.join(targetDirPublic, 'krushi-sathi-logo.webp'), logoBuffer);

    const logoPngBuffer = await trimmedLogo.png().toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'krushi-sathi-logo.png'), logoPngBuffer);
    fs.writeFileSync(path.join(targetDirPublic, 'krushi-sathi-logo.png'), logoPngBuffer);

    // Also extract emblem only (top circle)
    const logoMeta = await sharp(logoPngBuffer).metadata();
    const emblemBuffer = await sharp(logoPngBuffer)
      .extract({
        left: Math.round(logoMeta.width * 0.2),
        top: 0,
        width: Math.round(logoMeta.width * 0.6),
        height: Math.round(logoMeta.height * 0.72)
      })
      .trim()
      .webp({ quality: 95 })
      .toBuffer();
    
    fs.writeFileSync(path.join(targetDirSrc, 'krushi-sathi-emblem.webp'), emblemBuffer);
    fs.writeFileSync(path.join(targetDirPublic, 'krushi-sathi-emblem.webp'), emblemBuffer);

    console.log('✔ Logo and emblem created.');
  } catch (err) {
    console.error('Error processing logo:', err);
  }

  // 2. Full Splash Background Scene (under 200KB WebP)
  try {
    const splashBuf = await sharp(splashImg)
      .resize(546, 1024, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'splash-hero-bg.webp'), splashBuf);
    fs.writeFileSync(path.join(targetDirPublic, 'splash-hero-bg.webp'), splashBuf);
    console.log('✔ Splash hero background created (' + Math.round(splashBuf.length / 1024) + ' KB).');
  } catch (err) {
    console.error('Error processing splash background:', err);
  }

  // 3. Sunrise Field Landscape Strip (from Language Select screen y: 710 to 890)
  try {
    const langLandscapeBuf = await sharp(langImg)
      .extract({ left: 0, top: 710, width: 565, height: 180 })
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'sunrise-landscape-strip.webp'), langLandscapeBuf);
    fs.writeFileSync(path.join(targetDirPublic, 'sunrise-landscape-strip.webp'), langLandscapeBuf);
    console.log('✔ Sunrise landscape strip created.');
  } catch (err) {
    console.error('Error processing landscape strip:', err);
  }

  // 4. Farmer gazing at Sunrise (Hero Strip for Login & Home)
  // From Splash (y: 530 to 820)
  try {
    const farmerSceneBuf = await sharp(splashImg)
      .extract({ left: 0, top: 535, width: 546, height: 265 })
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'farmer-sunrise-strip.webp'), farmerSceneBuf);
    fs.writeFileSync(path.join(targetDirPublic, 'farmer-sunrise-strip.webp'), farmerSceneBuf);

    // Also flipped version (farmer on right looking left, matching Home screen mockup)
    const farmerHomeBuf = await sharp(farmerSceneBuf)
      .flop() // horizontal flip
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'farmer-home-strip.webp'), farmerHomeBuf);
    fs.writeFileSync(path.join(targetDirPublic, 'farmer-home-strip.webp'), farmerHomeBuf);
    console.log('✔ Farmer sunrise strip and flipped home strip created.');
  } catch (err) {
    console.error('Error processing farmer scene strip:', err);
  }

  // 5. Farmhouse & Field Footer (from Profile Card)
  try {
    // In profile (505x1024), card is around y: 560 to 650
    const farmhouseBuf = await sharp(profileImg)
      .extract({ left: 20, top: 560, width: 465, height: 85 })
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'farmhouse-field-footer.webp'), farmhouseBuf);
    fs.writeFileSync(path.join(targetDirPublic, 'farmhouse-field-footer.webp'), farmhouseBuf);
    console.log('✔ Farmhouse field footer created.');
  } catch (err) {
    console.error('Error processing farmhouse landscape:', err);
  }

  // 6. Leaf corner branches
  try {
    // Left branch from splash
    const leafLeft = await sharp(splashImg)
      .extract({ left: 0, top: 0, width: 220, height: 260 })
      .webp({ quality: 85 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'leaf-branch-left.webp'), leafLeft);
    fs.writeFileSync(path.join(targetDirPublic, 'leaf-branch-left.webp'), leafLeft);

    // Right branch from language
    const leafRight = await sharp(langImg)
      .extract({ left: 380, top: 0, width: 185, height: 220 })
      .webp({ quality: 85 })
      .toBuffer();
    fs.writeFileSync(path.join(targetDirSrc, 'leaf-branch-right.webp'), leafRight);
    fs.writeFileSync(path.join(targetDirPublic, 'leaf-branch-right.webp'), leafRight);
    console.log('✔ Leaf corner branches created.');
  } catch (err) {
    console.error('Error processing leaf branches:', err);
  }

  console.log('All design assets generated successfully in client/src/assets/design and client/public/design!');
}

processAssets();

