/**
 * Sarvam AI API Client
 * Integrates Saarika (Speech-to-Text), Bulbul (Text-to-Speech), and Translation.
 */

export interface SarvamSTTOptions {
  languageCode?: string;
  model?: string;
}

export interface SarvamTTSOptions {
  languageCode?: string;
  speaker?: string;
  pace?: number;
}

export class SarvamService {
  private apiKey: string;
  private baseUrl = "https://api.sarvam.ai";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SARVAM_API_KEY || "";
  }

  hasKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Transcribe audio using Sarvam Saarika
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType: string = "audio/wav", languageCode: string = "hi-IN"): Promise<{ transcript: string; detectedLanguage?: string }> {
    if (!this.hasKey()) {
      throw new Error("Sarvam API key is not configured.");
    }

    const formData = new FormData();
    const uint8 = new Uint8Array(audioBuffer);
    const blob = new Blob([uint8], { type: mimeType });
    formData.append("file", blob, "recording.wav");
    formData.append("model", "saarika:v2");
    if (languageCode) {
      formData.append("language_code", languageCode);
    }

    const response = await fetch(`${this.baseUrl}/speech-to-text`, {
      method: "POST",
      headers: {
        "api-subscription-key": this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam STT failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      transcript: data.transcript || "",
      detectedLanguage: data.language_code || languageCode,
    };
  }

  /**
   * Convert text to expressive Indian regional voice using Sarvam Bulbul
   */
  async textToSpeech(text: string, options?: SarvamTTSOptions): Promise<{ audioBase64: string }> {
    if (!this.hasKey()) {
      throw new Error("Sarvam API key is not configured.");
    }

    const payload = {
      inputs: [text],
      target_language_code: options?.languageCode || "hi-IN",
      speaker: options?.speaker || "ritu",
      pitch: 0,
      pace: options?.pace || 1.0,
      loudness: 1.5,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: "bulbul:v3",
    };

    const response = await fetch(`${this.baseUrl}/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam TTS failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const audio = data.audios?.[0] || "";
    return { audioBase64: audio };
  }

  /**
   * Translate text between Indian languages and English
   */
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!this.hasKey()) {
      throw new Error("Sarvam API key is not configured.");
    }

    const payload = {
      input: text,
      source_language_code: sourceLang,
      target_language_code: targetLang,
      mode: "formal",
      model: "mayura:v1",
    };

    const response = await fetch(`${this.baseUrl}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam Translate failed: ${errText}`);
    }

    const data = await response.json();
    return data.translated_text || text;
  }
}
