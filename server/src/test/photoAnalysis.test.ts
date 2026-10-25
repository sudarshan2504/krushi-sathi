import { analyzeCropPhotos, PhotoInputItem } from '../services/photoAnalysisService';
import { PrismaClient } from '@prisma/client';

import sharp from 'sharp';

const prisma = new PrismaClient();

async function runPhotoAnalysisTests() {
  console.log('================================================================');
  console.log('   KRUSHI SATHI — REAL PHOTO ANALYSIS UNIT TEST SUITE           ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Reject empty photos array
  try {
    await analyzeCropPhotos({
      photos: [],
      crop: 'Paddy',
      cropSlug: 'paddy',
    });
    console.log('❌ Test 1: Should have failed on empty photos array');
    failed++;
  } catch (err: any) {
    if (err.message.includes('At least one plant photo is required')) {
      console.log('✅ Test 1: Successfully caught empty photo array error');
      passed++;
    } else {
      console.log('❌ Test 1: Unexpected error:', err.message);
      failed++;
    }
  }

  // Test 2: Reject invalid MIME / fake image data
  try {
    await analyzeCropPhotos({
      photos: [
        {
          kind: 'closeup_leaf',
          dataUrl: 'data:image/jpeg;base64,bm90YW5pbWFnZWF0YWxs',
        },
      ],
      crop: 'Paddy',
      cropSlug: 'paddy',
    });
    console.log('❌ Test 2: Should have failed magic bytes check');
    failed++;
  } catch (err: any) {
    if (err.message.includes('not a valid JPEG, PNG, or WebP image')) {
      console.log('✅ Test 2: Successfully detected corrupted / non-image magic bytes');
      passed++;
    } else {
      console.log('❌ Test 2: Unexpected error:', err.message);
      failed++;
    }
  }

  // Test 3: Validate structured photo analysis execution with valid mock JPEG
  try {
    const validBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 34, g: 139, b: 34 },
      },
    })
      .jpeg()
      .toBuffer();

    const testJpegDataUrl = `data:image/jpeg;base64,${validBuffer.toString('base64')}`;

    const res = await analyzeCropPhotos({
      photos: [
        {
          kind: 'closeup_leaf',
          dataUrl: testJpegDataUrl,
        },
      ],
      crop: 'Tomato',
      cropSlug: 'tomato',
      language: 'en',
    });

    console.log('✅ Test 3: Photo analysis engine executed without crashing');
    console.log(`   Result Mode Success: ${res.success}, Photo Analysis Available: ${res.photoAnalysisAvailable}`);
    console.log(`   Notice: ${res.notice}`);
    passed++;
  } catch (err: any) {
    console.log('❌ Test 3: Failed with exception:', err.message);
    failed++;
  }

  // Test 4: Record and verify farmer diagnosis feedback in SQLite
  try {
    const feedback = await prisma.diagnosisFeedback.create({
      data: {
        problemSlug: 'early-blight-tomato',
        confidence: 'high',
        crop: 'Tomato',
        rating: 'correct',
        hasConsent: false,
      },
    });

    if (feedback.id && feedback.rating === 'correct') {
      console.log('✅ Test 4: Successfully recorded diagnosis feedback in SQLite');
      passed++;

      // Clean up test feedback record
      await prisma.diagnosisFeedback.delete({
        where: { id: feedback.id },
      });
    } else {
      console.log('❌ Test 4: Failed to verify created feedback');
      failed++;
    }
  } catch (err: any) {
    console.log('❌ Test 4: Feedback DB error:', err.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`   PHOTO ANALYSIS TEST SUITE: ${passed} passed, ${failed} failed`);
  console.log('================================================================\n');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runPhotoAnalysisTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
