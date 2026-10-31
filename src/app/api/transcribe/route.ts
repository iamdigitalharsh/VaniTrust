import { NextRequest, NextResponse } from "next/server";
import { SarvamService } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientKey = (formData.get("sarvamKey") as string) || "";
    const languageCode = (formData.get("languageCode") as string) || "hi-IN";

    if (!file) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    const sarvam = new SarvamService(clientKey);

    if (!sarvam.hasKey()) {
      return NextResponse.json(
        {
          error: "SARVAM_API_KEY_MISSING",
          message: "Please enter your Sarvam API Key in Settings or set SARVAM_API_KEY in .env.local",
        },
        { status: 401 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await sarvam.transcribeAudio(buffer, file.type || "audio/wav", languageCode);

    return NextResponse.json({
      transcript: result.transcript,
      detectedLanguage: result.detectedLanguage,
      provider: "Sarvam Saarika ASR",
    });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json(
      { error: "Transcription failed", details: err.message },
      { status: 500 }
    );
  }
}

