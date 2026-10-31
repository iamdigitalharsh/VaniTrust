import { NextRequest, NextResponse } from "next/server";
import { SarvamService } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, languageCode, speaker, pace, sarvamKey } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required for TTS." }, { status: 400 });
    }

    const safeText = text.trim().substring(0, 600);
    const sarvam = new SarvamService(sarvamKey);

    // If Sarvam key is provided, attempt high-fidelity Bulbul regional synthesis
    if (sarvam.hasKey()) {
      try {
        const result = await sarvam.textToSpeech(safeText, {
          languageCode: languageCode || "hi-IN",
          speaker: speaker || "ritu",
          pace: pace || 1.0,
        });

        if (result && result.audioBase64) {
          return NextResponse.json({
            audioBase64: result.audioBase64,
            provider: "Sarvam Bulbul TTS",
          });
        }
      } catch (sarvamErr: any) {
        console.warn("Sarvam TTS error (e.g. quota limit), activating client Web Speech fallback:", sarvamErr.message);
      }
    }

    // Graceful fallback: return 200 so the client smoothly falls back to browser Web Speech API
    return NextResponse.json({
      fallback: true,
      provider: "Browser Web Speech Engine (Fallback)",
      message: "Sarvam voice quota unavailable; activating client-side regional synthesis.",
    });
  } catch (err: any) {
    console.error("TTS API error:", err);
    return NextResponse.json({
      fallback: true,
      provider: "Browser Web Speech Engine (Fallback)",
      details: err.message,
    });
  }
}
