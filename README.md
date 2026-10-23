# 🌾 Raitha Mitra (Krishi Sathi) — Intelligent Farming Assistant with Google Gemini API

> **Raitha Mitra (ರೈತ ಮಿತ್ರ / Krishi Sathi)** is a comprehensive digital agricultural assistant built for Indian farmers. It combines real-time weather data, soil assessments, active crop lifecycle tracking, and disease diagnostics with the official **Google Gemini API** (`@google/genai` SDK) and an **ICAR-grounded Local Agronomy Fallback Engine** supporting Kannada, English, Tamil, and Telugu.

---

## 🌟 Key Features

1. **Official Google Gemini API Integration**:
   - Integrated via the official `@google/genai` TypeScript SDK.
   - Default model: `gemini-2.5-flash` (with automatic fallback to `gemini-2.0-flash` or `gemini-1.5-flash`).
   - Server-side only API key storage — strictly isolated from frontend code, network responses, and client bundles.
2. **Context-Aware Agronomy Assistant**:
   - Automatically injects the farmer's real context into the prompt:
     - Soil type, pH, Nitrogen, Phosphorus, Potassium, Organic Carbon.
     - Active crop, variety, sown date, and current lifecycle stage (e.g., Vegetative, Flowering, Maturity).
     - Live localized weather from Open-Meteo (temperature, humidity, precipitation, wind speed).
     - Verified ICAR & UAS (University of Agricultural Sciences) crop guidelines.
3. **Four Native Languages Supported**:
   - 🌾 **Kannada (ಕನ್ನಡ)**: ಸರಳ ಮತ್ತು ಸುಲಭ ಗ್ರಾಮೀಣ ಕನ್ನಡ ಶೈಲಿ.
   - 🌾 **English**: Plain, farmer-friendly terms without heavy academic jargon.
   - 🌾 **Tamil (தமிழ்)**: விவசாயிகளுக்கு எளிதில் புரியும் தமிழ் நடை.
   - 🌾 **Telugu (తెలుగు)**: రైతులకు సులభంగా అర్థమయ్యే తెలుగు భాష.
4. **Agricultural Safety & Strict Fact Grounding**:
   - Differentiates suspected symptoms from confirmed diagnoses.
   - Never fabricates pesticide dosages, chemical cocktails, or guaranteed yield/profit claims.
   - Mandates protective equipment (mask, gloves, boots) and urges consultation with local Krishi Vigyan Kendras (KVK) and Raitha Samparka Kendras (RSK).
5. **Local Demo Mode Resilience (College Project Ready)**:
   - If `GEMINI_API_KEY` is missing, expired, invalid, or over quota, the application **never crashes**.
   - Gracefully falls back to the built-in ICAR rule-based agronomy knowledge base with a clear, honest notice (`mode: 'local_demo'`).
   - Distinguishes demo responses from live Gemini responses in the UI with distinct visual badges.
6. **Local Demo OTP Authentication**:
   - Quick testing without third-party SMS/email gateways.
   - Enter any 10-digit mobile number (e.g., `9876543210`) and use OTP `123456`.
7. **Security & Production Hardening**:
   - Rate limiting (30 requests/minute per farmer).
   - Strict input validation (non-empty, max 2000 characters).
   - Multi-turn conversation isolation with cross-farmer authorization protection (farmers cannot view or post to other farmers' chat sessions).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
From the repository root:
```bash
# Install dependencies for both server and client workspaces
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in both the root and `server/` directory:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="raitha-mitra-secure-jwt-secret-key-change-in-production"
DEMO_OTP_ENABLED="true"
DEMO_OTP_CODE="123456"

# Google Gemini API Configuration
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"
```

> **Note**: If you do not have a Gemini API key immediately, leave `GEMINI_API_KEY=""`. The application will launch seamlessly in **Local Demo Mode** using its verified ICAR agricultural knowledge base!

### 3. Initialize the Database
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 4. Start the Application
From the repository root, start both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Gemini Status**: [http://localhost:5000/api/chat/status](http://localhost:5000/api/chat/status)

---

## 🔑 How to Obtain a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click on **"Get API key"** in the top navigation or dashboard.
4. Click **"Create API key"** (select an existing Google Cloud project or create a new one).
5. Copy your generated API key.
6. Paste the key into `server/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```
7. Restart the backend server (`npm run dev`) or update it on the fly using the in-app **Chat Settings** modal!

---

## 🧪 Automated Integration Tests (12/12 Requirements)

An automated verification test suite is included in `server/src/test/runGeminiIntegrationTests.ts` covering all required functional, safety, and security criteria:

```bash
cd server
npx tsx src/test/runGeminiIntegrationTests.ts
```

### Test Suite Coverage:
| # | Test Requirement | Description | Status |
|---|-------------------|-------------|:------:|
| 1 | English Farming Question | Agronomy response with fertilizer / pest advice & source references | ✅ PASS |
| 2 | Kannada Farming Question | Answers in fluent rural Kannada (ಕನ್ನಡ) script | ✅ PASS |
| 3 | Tamil Farming Question | Answers in fluent Tamil (தமிழ்) script | ✅ PASS |
| 4 | Telugu Farming Question | Answers in fluent Telugu (తెలుగు) script | ✅ PASS |
| 5 | Multi-turn Context | Follow-up questions maintain crop and soil memory | ✅ PASS |
| 6 | Empty Message Validation | Rejects blank prompts with HTTP 400 | ✅ PASS |
| 7 | Invalid / Missing Key Handling | Graceful fallback without crashing; displays local demo banner | ✅ PASS |
| 8 | Rate Limiting Protection | Rejects excessive rapid calls with HTTP 429 | ✅ PASS |
| 9 | Network Timeout Resilience | Aborts hung requests and falls back to ICAR knowledge base | ✅ PASS |
| 10 | Safety & Grounding Rules | Disclaims chemical hazard, requires PPE, refers to KVK/RSK | ✅ PASS |
| 11 | Chat Persistence in SQLite | Conversation threads and messages saved with farmer relation | ✅ PASS |
| 12 | Cross-Farmer Access Control | Rejects unauthorized attempts to read/post to another user's chat (HTTP 403/404) | ✅ PASS |

---

## 📁 Architecture & File Structure

```text
krushi sathi/
├── package.json                   # Root workspace scripts (npm run dev, build)
├── .env.example                   # Root environment template
├── .gitignore                     # Git ignore rules for secrets (.env, *.db)
│
├── server/                        # Express + TypeScript + Prisma Backend
│   ├── .env.example               # Backend environment template
│   ├── src/
│   │   ├── config.ts              # Loads GEMINI_API_KEY and GEMINI_MODEL
│   │   ├── services/
│   │   │   ├── aiService.ts       # Official @google/genai SDK integration & fallback engine
│   │   │   ├── weatherService.ts  # Live Open-Meteo weather integration
│   │   │   └── recommendationEngine.ts # Crop, soil, and fertilizer logic
│   │   ├── prompts/
│   │   │   └── farmerChatPrompt.ts# Grounded system instructions & multilingual templates
│   │   ├── routes/
│   │   │   ├── chatRoutes.ts      # Rate-limited, validated, authorized chat endpoints
│   │   │   └── authRoutes.ts      # Local demo OTP login (123456)
│   │   ├── data/
│   │   │   └── agronomyKnowledge.ts # ICAR & agricultural university curated database
│   │   └── test/
│   │       └── runGeminiIntegrationTests.ts # 12-step end-to-end test suite
│   └── prisma/
│       └── schema.prisma          # Database schema (User, ChatSession, ChatMessage, etc.)
│
└── client/                        # Vite + React + Tailwind + Lucide Frontend
    └── src/
        ├── types/index.ts         # TypeScript models (mode: 'gemini' | 'local_demo')
        ├── services/api.ts        # Axios API client
        └── pages/
            └── ChatPage.tsx       # Chat UI with mode badges, source tags, settings modal
```

---

## 🛡️ Agricultural Advisory Disclaimer

*Raitha Mitra provides agricultural guidance for educational and assistive purposes based on ICAR, agricultural university publications, and AI language models. It is not an unconditional guarantee of crop suitability, yield, or profitability. Field conditions, localized microclimates, and regional pest strains vary. Farmers must always read and comply with approved pesticide labels, wear protective gear, and consult their local Krishi Vigyan Kendra (KVK) or Raitha Samparka Kendra extension officers before making chemical application decisions.*
