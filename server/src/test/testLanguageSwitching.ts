import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

interface LangTest {
  id: number;
  description: string;
  query: string;
  uiLang: string;
  expectedLang: string;
  scriptRegex: RegExp;
}

const tests: LangTest[] = [
  {
    id: 1,
    description: 'Direct Kannada script input (UI set to en)',
    query: 'ರಾಗಿ ಬೆಳೆಯಲು ಯಾವ ಗೊಬ್ಬರ ಉತ್ತಮ?',
    uiLang: 'en',
    expectedLang: 'kn',
    scriptRegex: /[\u0C80-\u0CFF]/,
  },
  {
    id: 2,
    description: 'Explicit request to switch to Kannada in English',
    query: 'Please switch to Kannada and tell me about ragi',
    uiLang: 'en',
    expectedLang: 'kn',
    scriptRegex: /[\u0C80-\u0CFF]/,
  },
  {
    id: 3,
    description: 'Direct Tamil script input (UI set to en)',
    query: 'நெல் பயிருக்கு என்ன உரம் போட வேண்டும்?',
    uiLang: 'en',
    expectedLang: 'ta',
    scriptRegex: /[\u0B80-\u0BFF]/,
  },
  {
    id: 4,
    description: 'Explicit request to switch to Tamil',
    query: 'Reply in Tamil: How to prevent tomato blast?',
    uiLang: 'en',
    expectedLang: 'ta',
    scriptRegex: /[\u0B80-\u0BFF]/,
  },
  {
    id: 5,
    description: 'Direct Telugu script input (UI set to en)',
    query: 'వరి పంటకు ఏ ఎరువు వాడాలి?',
    uiLang: 'en',
    expectedLang: 'te',
    scriptRegex: /[\u0C00-\u0C7F]/,
  },
  {
    id: 6,
    description: 'Multi-turn: UI switched to Kannada with English query and English history',
    query: 'What crop is best for red soil in Mandya?',
    uiLang: 'kn',
    expectedLang: 'kn',
    scriptRegex: /[\u0C80-\u0CFF]/,
  },
];

async function run() {
  console.log('================================================================');
  console.log('🌐 RAITHA MITRA - GEMINI LANGUAGE SWITCHING VERIFICATION SUITE');
  console.log('================================================================\n');

  // Login
  const loginRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', otp: '123456' }),
  });
  const loginData: any = await loginRes.json();
  const token = loginData.data?.token;

  let passedCount = 0;

  for (const t of tests) {
    try {
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: t.query,
          language: t.uiLang,
        }),
      });

      const data: any = await res.json();
      const msg = data.data?.message;
      const returnedLang = msg?.language;
      const content = msg?.content || '';
      const hasProperScript = t.scriptRegex.test(content);
      const passed = returnedLang === t.expectedLang && hasProperScript;

      if (passed) passedCount++;

      const mark = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`[${mark}] Test ${t.id}: ${t.description}`);
      console.log(`       Query: "${t.query}" (UI Lang: ${t.uiLang})`);
      console.log(`       Resolved Lang: ${returnedLang} (Expected: ${t.expectedLang})`);
      console.log(`       Has Target Native Script: ${hasProperScript}`);
      console.log(`       Snippet: "${content.replace(/\n/g, ' ').slice(0, 100)}..."\n`);
    } catch (err: any) {
      console.log(`[❌ FAIL] Test ${t.id}: ${t.description} -> Error: ${err.message}\n`);
    }
  }

  console.log('================================================================');
  console.log(`TOTAL TESTS: ${tests.length} | PASSED: ${passedCount} | FAILED: ${tests.length - passedCount}`);
  console.log(`OVERALL: ${passedCount === tests.length ? '🎉 ALL LANGUAGE SWITCHING TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
  console.log('================================================================');
}

run();
