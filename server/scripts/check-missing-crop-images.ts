import fs from 'fs';
import path from 'path';
import { CropImageMetadata } from '../src/services/cropImageService';

const SERVER_DATA_DIR = path.resolve(__dirname, '../src/data');
const CROPS_IMAGES_JSON = path.join(SERVER_DATA_DIR, 'crops-images.json');
const CLIENT_PUBLIC_CROPS_DIR = path.resolve(__dirname, '../../client/public/crops');

export function checkCropImages() {
  console.log('\n=============================================================');
  console.log('🔍 Krushi Sathi — Crop Images Verification & Status Audit');
  console.log('=============================================================');

  if (!fs.existsSync(CROPS_IMAGES_JSON)) {
    console.error('❌ crops-images.json not found! Run "npm run fetch:crop-images" first.');
    process.exit(1);
  }

  const raw = fs.readFileSync(CROPS_IMAGES_JSON, 'utf-8');
  const records: CropImageMetadata[] = JSON.parse(raw);

  const approved = records.filter(r => r.status === 'approved');
  const pending = records.filter(r => r.status === 'pending-review');
  const fallback = records.filter(r => r.status === 'use-fallback');

  const missingFiles: CropImageMetadata[] = [];
  records.forEach(r => {
    const filename = `${r.cropId}.webp`;
    const fullPath = path.join(CLIENT_PUBLIC_CROPS_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(r);
    }
  });

  console.log(`\n📊 AUDIT SUMMARY:`);
  console.log(`   Total Tracked Crops:       ${records.length}`);
  console.log(`   ✅ Approved Images:        ${approved.length}`);
  console.log(`   ⏳ Pending Review:         ${pending.length}`);
  console.log(`   🎨 Using Fallback Icon:    ${fallback.length}`);
  console.log(`   ❌ Missing Local Files:    ${missingFiles.length}`);

  if (pending.length > 0) {
    console.log(`\n⏳ CROPS REQUIRING REVIEW / APPROVAL (${pending.length}):`);
    pending.slice(0, 40).forEach((p, idx) => {
      console.log(`   ${idx + 1}. [${p.cropId}] ${p.name} (${p.scientificName}) — ${p.source} (${p.license})`);
    });
    if (pending.length > 40) {
      console.log(`   ...and ${pending.length - 40} more.`);
    }
    console.log(`\n💡 To review and approve these crops:`);
    console.log(`   Open the dev dashboard in your browser at: http://localhost:5173/dev/crop-gallery`);
  }

  if (missingFiles.length > 0) {
    console.log(`\n❌ CROPS WITH MISSING LOCAL WEBP FILES (${missingFiles.length}):`);
    missingFiles.forEach((m, idx) => {
      console.log(`   ${idx + 1}. [${m.cropId}] ${m.name} -> Expected at client/public/crops/${m.cropId}.webp`);
    });
  }

  if (pending.length === 0 && missingFiles.length === 0) {
    console.log(`\n🎉 All ${records.length} crops have approved local images!`);
  }

  console.log('=============================================================\n');
}

if (require.main === module || process.argv[1]?.includes('check-missing-crop-images')) {
  checkCropImages();
}
