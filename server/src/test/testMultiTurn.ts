import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testMultiTurnLanguageSwitch() {
  // Login
  const loginRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', otp: '123456' }),
  });
  const loginData: any = await loginRes.json();
  const token = loginData.data?.token;

  let convId: string | undefined = undefined;

  const steps = [
    { text: 'Hello, what crops can I grow in Mandya?', lang: 'en', expect: 'en' },
    { text: 'Can you please speak in Kannada now?', lang: 'en', expect: 'kn' },
    { text: 'ಟೊಮ್ಯಾಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಬಳಸಬೇಕು?', lang: 'kn', expect: 'kn' },
    { text: 'Now reply in English: what about pests?', lang: 'en', expect: 'en' },
    { text: 'தமிழுக்கு மாறவும் (switch to Tamil)', lang: 'ta', expect: 'ta' },
    { text: 'తెలుగులో చెప్పండి (tell in Telugu)', lang: 'te', expect: 'te' },
  ];

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    console.log(`\n--- Step ${i + 1}: Sending "${s.text}" (UI lang: ${s.lang}) ---`);
    const res = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: s.text,
        language: s.lang,
        conversationId: convId,
      }),
    });
    const data: any = await res.json();
    const msg = data.data?.message;
    convId = data.data?.conversationId;
    console.log(`Mode: ${msg?.mode} | Model: ${msg?.modelUsed} | Reported Lang: ${msg?.language}`);
    console.log(`Response snippet: ${msg?.content?.slice(0, 150)}...`);
  }
}

testMultiTurnLanguageSwitch();
