import { NextRequest, NextResponse } from "next/server";
import { SarvamService } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, languageCode, speaker, pace, sarvamKey } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required for TTS." }, { status: 400 });
    }

    const sarvam = new SarvamService(sarvamKey);

    if (!sarvam.hasKey()) {
      return NextResponse.json(
        {
          error: "SARVAM_API_KEY_MISSING",
          message: "Sarvam API Key is required to generate Bulbul voice audio.",
        },
        { status: 401 }
      );
    }

    const result = await sarvam.textToSpeech(text, {
      languageCode: languageCode || "hi-IN",
      speaker: speaker || "meera",
      pace: pace || 1.0,
    });

    return NextResponse.json({
      audioBase64: result.audioBase64,
      provider: "Sarvam Bulbul TTS",
    });
  } catch (err: any) {
    console.error("TTS API error:", err);
    return NextResponse.json(
      { error: "TTS generation failed", details: err.message },
      { status: 500 }
    );
  }
}

