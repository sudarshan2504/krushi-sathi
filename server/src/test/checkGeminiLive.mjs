import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing with API key present:', !!apiKey, 'length:', apiKey ? apiKey.length : 0);

const client = new GoogleGenAI({ apiKey });

async function testModels() {
  console.log('\n--- 1. Testing Chat Models ---');
  const modelsToTest = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
  for (const model of modelsToTest) {
    try {
      console.log(`Trying ${model}...`);
      const res = await client.interactions.create({
        model,
        input: 'Hello! Reply in one short sentence in Kannada: "Namaskara! How can I help your farm today?"',
      });
      console.log(`[SUCCESS ${model}]:`, res.output_text);
      break;
    } catch (e) {
      console.log(`[FAIL ${model}]:`, e.message || e);
    }
  }

  console.log('\n--- 2. Testing TTS Models ---');
  const ttsModels = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];
  for (const model of ttsModels) {
    try {
      console.log(`Trying TTS ${model}...`);
      const ttsRes = await client.interactions.create({
        model,
        input: [{
          type: 'user_input',
          content: [{
            type: 'text',
            text: 'ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಬೆಳೆಗೆ ನೀರು ಯಾವಾಗ ಹಾಯಿಸಬೇಕು?',
            annotations: [{
              type: 'speech_metadata',
              style: 'warm, friendly and respectful farming companion',
            }],
          }],
        }],
        response_format: { type: 'audio' },
        generation_config: {
          speech_config: [
            { voice: 'Aoede' },
          ],
        },
      });
      console.log(`[SUCCESS TTS ${model}]: Audio received! Data length:`, ttsRes?.output_audio?.data?.length || 0, 'mime:', ttsRes?.output_audio?.mime_type);
      break;
    } catch (e) {
      console.log(`[FAIL TTS ${model}]:`, e.message || e);
    }
  }
}

testModels().catch(console.error);
