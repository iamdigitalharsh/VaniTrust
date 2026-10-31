import { NextRequest, NextResponse } from "next/server";
import { SarvamService } from "@/lib/sarvam";

/**
 * Transcribe audio using Google Gemini 1.5 Flash multimodal capability
 * Serves as resilient backup if Sarvam Saarika is unavailable or out of quota.
 */
async function transcribeWithGemini(
  audioBuffer: Buffer,
  mimeType: string,
  apiKey: string
): Promise<string | null> {
  try {
    const base64Audio = audioBuffer.toString("base64");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Please transcribe this audio accurately. Output ONLY the exact transcribed text in the original spoken language (Hindi, Indian English, or regional Indic language). Do not add any preface, quotes, or markdown.",
            },
            {
              inlineData: {
                mimeType: mimeType || "audio/wav",
                data: base64Audio,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.0,
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Gemini ASR failed (${res.status}):`, errText);
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (err) {
    console.error("Gemini transcribe error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientKey = (formData.get("sarvamKey") as string) || "";
    const clientGeminiKey = (formData.get("geminiKey") as string) || "";
    const languageCode = (formData.get("languageCode") as string) || "hi-IN";

    if (!file) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    // Limit audio file size to 10MB to prevent memory exhaustion
    const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "Audio file too large. Maximum size allowed is 10MB." },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioMime = file.type || "audio/wav";

    const geminiKey = clientGeminiKey || process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY || "";
    const sarvam = new SarvamService(clientKey);

    // 1. Primary Attempt: Sarvam Saarika ASR (if key configured)
    if (sarvam.hasKey()) {
      try {
        const result = await sarvam.transcribeAudio(buffer, audioMime, languageCode);
        if (result && result.transcript && result.transcript.trim().length > 0) {
          return NextResponse.json({
            transcript: result.transcript,
            detectedLanguage: result.detectedLanguage,
            provider: "Sarvam Saarika ASR",
          });
        }
      } catch (sarvamErr: any) {
        console.warn("Sarvam transcription error, initiating Gemini backup:", sarvamErr.message);
      }
    }

    // 2. Backup Attempt: Google Gemini 1.5 Flash Audio ASR
    if (geminiKey) {
      const geminiTranscript = await transcribeWithGemini(buffer, audioMime, geminiKey);
      if (geminiTranscript && geminiTranscript.trim().length > 0) {
        return NextResponse.json({
          transcript: geminiTranscript,
          detectedLanguage: languageCode,
          provider: "Google Gemini Multimodal ASR (Backup)",
        });
      }
    }

    // 3. Fallback when keys are missing or failed
    if (!sarvam.hasKey() && !geminiKey) {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          message: "Please configure SARVAM_API_KEY or GEMINI_API_KEY in environment variables or Settings.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Transcription failed",
        message: "Audio transcription services are temporarily unavailable.",
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json(
      { error: "Transcription failed", details: err.message },
      { status: 500 }
    );
  }
}
