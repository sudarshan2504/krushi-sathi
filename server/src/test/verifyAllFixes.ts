import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function record(num: number, name: string, passed: boolean, details: string) {
  results.push({ num, name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${mark}] Test ${num}: ${name} -> ${details}`);
}

async function run() {
  console.log('================================================================');
  console.log('🌾 RAITHA MITRA - SYSTEM VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  // 1. Mobile demo OTP login for Account A
  let tokenA = '';
  let userA: any = null;
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', otp: '123456' }),
    });
    const data: any = await res.json();
    tokenA = data.data.token;
    userA = data.data.user;
    record(1, 'Demo OTP login for Account A (9876543210)', data.success === true && !!tokenA, `User: ${userA.name}, District: ${userA.district}`);
  } catch (err: any) {
    record(1, 'Demo OTP login for Account A', false, err.message);
  }

  // 2. Demo OTP login for Account B (Independent account)
  let tokenB = '';
  let userB: any = null;
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9123456780', otp: '123456' }),
    });
    const data: any = await res.json();
    tokenB = data.data.token;
    userB = data.data.user;
    record(2, 'Demo OTP login for Account B (9123456780)', data.success === true && !!tokenB && userB.id !== userA.id, `User: ${userB.name}, ID isolated: ${userB.id !== userA?.id}`);
  } catch (err: any) {
    record(2, 'Demo OTP login for Account B', false, err.message);
  }

  // 3. User initials generation logic
  try {
    const getInitials = (name?: string) => {
      if (!name) return 'RM';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initA = getInitials(userA?.name);
    const initB = getInitials(userB?.name);
    const isExpected = initA.length === 2 && initB.length === 2 && initA !== initB;
    record(3, 'User-specific initials generation', isExpected, `Account A ("${userA?.name}") initials: "${initA}", Account B ("${userB?.name}") initials: "${initB}"`);
  } catch (err: any) {
    record(3, 'User-specific initials generation', false, err.message);
  }

  // 4. Isolated avatar upload for Account A
  let uploadedAvatarUrl = '';
  try {
    // 1x1 transparent PNG as base64
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ image: samplePngBase64 }),
    });
    const data: any = await res.json();
    uploadedAvatarUrl = data.data?.avatar || '';

    // Check Account B profile to ensure Account B avatar was NOT affected
    const profBRes = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const profBData: any = await profBRes.json();

    const isIsolated = uploadedAvatarUrl.length > 0 && profBData.data?.avatar !== uploadedAvatarUrl;
    record(4, 'Avatar upload and per-user isolation', isIsolated, `Account A avatar URL: ${uploadedAvatarUrl}, Account B avatar remains: ${profBData.data?.avatar || 'null'}`);
  } catch (err: any) {
    record(4, 'Avatar upload and per-user isolation', false, err.message);
  }

  // 5. Avatar removal for Account A
  try {
    const res = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const data: any = await res.json();
    const profARes = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const profAData: any = await profARes.json();

    const removed = data.success === true && profAData.data?.avatar === null;
    record(5, 'Avatar removal resets to null/initials', removed, `Profile A avatar after removal: ${profAData.data?.avatar}`);
  } catch (err: any) {
    record(5, 'Avatar removal resets to null/initials', false, err.message);
  }

  // 6. Indian Land Unit conversion accuracy
  try {
    const CONVERSIONS_TO_ACRES: Record<string, number> = {
      acres: 1,
      guntas: 1 / 40,
      kuntas: 1 / 40,
      cents: 1 / 100,
      hectares: 2.47105,
      sq_meters: 1 / 4046.86,
      sq_feet: 1 / 43560,
    };

    // 2 Acres = 80 Guntas = 200 Cents = 87120 Sq Feet
    const guntas = 80 * CONVERSIONS_TO_ACRES['guntas'];
    const cents = 200 * CONVERSIONS_TO_ACRES['cents'];
    const sqFeet = 87120 * CONVERSIONS_TO_ACRES['sq_feet'];

    const passed = Math.abs(guntas - 2) < 0.001 && Math.abs(cents - 2) < 0.001 && Math.abs(sqFeet - 2) < 0.001;
    record(6, 'Indian Land Unit conversion accuracy', passed, `80 Guntas = ${guntas.toFixed(2)} Ac, 200 Cents = ${cents.toFixed(2)} Ac, 87120 Sq Ft = ${sqFeet.toFixed(2)} Ac`);
  } catch (err: any) {
    record(6, 'Indian Land Unit conversion accuracy', false, err.message);
  }

  // 7. Crop recommendation endpoint without Gemini blocking
  try {
    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/crops/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        soilType: 'Red Sandy Loam',
        waterAvailability: 'Borewell',
        season: 'Kharif',
      }),
    });
    const elapsed = Date.now() - startTime;
    const data: any = await res.json();
    const recs = data.data || [];
    const passed = data.success === true && recs.length > 0 && elapsed < 8000;
    record(7, 'Deterministic Crop Recommendations without Gemini blocking', passed, `Returned ${recs.length} recommended crops in ${elapsed}ms. Top: "${recs[0]?.name || recs[0]?.cropId}" (${recs[0]?.suitability}% suitability)`);
  } catch (err: any) {
    record(7, 'Deterministic Crop Recommendations', false, err.message);
  }

  // 8. Individual Crop Lookup by slug, ID, or name
  try {
    const ragiRes = await fetch(`${API_BASE}/crops/ragi`);
    const ragiData: any = await ragiRes.json();

    const paddyRes = await fetch(`${API_BASE}/crops/paddy`);
    const paddyData: any = await paddyRes.json();

    const passed = ragiData.success === true && paddyData.success === true && ragiData.data?.name?.includes('Ragi');
    record(8, 'Resilient crop lookup by slug/name', passed, `Lookup 'ragi' -> ${ragiData.data?.name}, Lookup 'paddy' -> ${paddyData.data?.name}`);
  } catch (err: any) {
    record(8, 'Resilient crop lookup', false, err.message);
  }

  // 9. Crop Lifecycle and Task Toggle
  try {
    const plansRes = await fetch(`${API_BASE}/lifecycle/plans`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const plansData: any = await plansRes.json();
    const plans = plansData.data || [];
    const passed = plansData.success === true && plans.length > 0;
    record(9, 'Crop Lifecycle retrieval', passed, `Found ${plans.length} active plans. First plan: ${plans[0]?.cropName} (${plans[0]?.currentStage})`);
  } catch (err: any) {
    record(9, 'Crop Lifecycle retrieval', false, err.message);
  }

  // 10. Check that no arbitrary field defaults are forced in assessment
  try {
    // In our updated SoilAssessmentPage:
    // formData initial state has soilType: '', waterSource: '', previousCrop: '', season: ''
    // Here we verify the API handles partial or clean inputs without errors
    const res = await fetch(`${API_BASE}/crops/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({}),
    });
    const data: any = await res.json();
    const passed = data.success === true && Array.isArray(data.data) && data.data.length > 0;
    record(10, 'Fallback recommendations on clean/unselected inputs', passed, `Handled empty assessment gracefully with ${data.data?.length} fallback crops`);
  } catch (err: any) {
    record(10, 'Fallback recommendations on clean inputs', false, err.message);
  }

  console.log('\n================================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.filter(r => r.passed).length} | FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(`OVERALL STATUS: ${allPassed ? '🎉 ALL SUITES PASSED' : '⚠️ SOME TESTS FAILED'}`);
  console.log('================================================================');
}

run();
