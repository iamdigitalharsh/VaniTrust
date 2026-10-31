# VaniTrust (सत्य-वाणी) 🎙️🛡️
*High-Stakes Vernacular Voice AI with Real-Time Hallucination Guardrails*

Built for **Ship Happens Hackathon** (Delhi NCR / Gurugram)  
**Primary Track:** `Culture Coded` (Sarvam AI)  
**Force Multiplier Integration:** `Trust Issues` (Failproof AI)

---

## 💡 The Core Problem: Why Indian GenAI Hallucinates Dangerously
Generative AI and speech models in Indic languages (Hindi, Marathi, Tamil, Bengali, Hinglish) face severe token scarcity. In high stakes domains—such as **Ayushman Bharat healthcare eligibility**, **PM-Kisan farm subsidies**, and **pediatric medicine** LLMs hallucinate inflated figures, non-existent schemes, and lethal dosages with alarming confidence.

**VaniTrust** solves this by inserting an active **Failproof Verification HUD** directly between **Sarvam Saarika ASR** (voice input) and **Sarvam Bulbul TTS** (voice output).

---

## 🏗️ Architecture & Pipeline Flow

```
   🎤 User Speech (Hindi/Hinglish/Regional)
              │
              ▼
   [Sarvam Saarika ASR] (Acoustic Phonetic Transcription)
              │
              ▼
   [Reasoning & Deconstruction] (Atomic Claim Extraction)
              │
              ▼
   [Failproof AI Verification HUD]
   ├── Cross-checks against Indian Official Gazettes & Knowledge Grounding
   ├── Computes Real-Time Trust Index (0-100%)
   ├── Intercepts & strikes out false claims / hallucinations
   └── Generates Sanitized Safe Output
              │
              ▼
   [Sarvam Bulbul TTS] (Expressive Indian Voice Playback of Verified Truth)
```

---

## 🚀 Key Features

1. **Dual Sponsor Synergy:** 
   - Uses **Sarvam AI** for Saarika Speech-to-Text and Bulbul Text-to-Speech in native Indian dialects.
   - Uses **Failproof AI** for claim-level verification and real-time hallucination interception.
2. **Real-time Trust HUD:**
   - Visual Trust Gauge (0-100%).
   - Before & After diff showing hallucinated vs. grounded claims.
   - Statutory source citations (e.g., National Health Authority PM-JAY, Ministry of Agriculture).
3. **Zero-Lag Hackathon Demo Presets:**
   - 🩺 *Ayushman Bharat ₹10 Lakh Cap Hallucination*
   - 🌾 *PM-Kisan ₹4,000 Fake Bonus Hoax*
   - 💊 *Infant Paracetamol 500mg Lethal Overdose*
4. **90-Second Live Pitch Guide:**
   - Embedded presenter cheat sheet built directly into the UI for the judge walkthrough.

---

## 🛠️ Quickstart

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Configuration (Optional)
You can configure API keys via `.env.local` or directly inside the app's **Settings Modal**:

```env
SARVAM_API_KEY=your_sarvam_api_key
FAILPROOF_API_KEY=your_failproof_api_key
```

