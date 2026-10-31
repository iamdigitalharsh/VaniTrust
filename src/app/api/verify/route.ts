import { NextRequest, NextResponse } from "next/server";
import { FailproofService } from "@/lib/failproof";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, rawResponse, contextCategory, failproofKey } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required for verification." }, { status: 400 });
    }

    // Default simulated unverified LLM output if user provides only the raw question
    let responseToTest = rawResponse;
    if (!responseToTest) {
      const q = query.toLowerCase();
      if (q.includes("आयुष्मान") || q.includes("ayushman")) {
        responseToTest = "हाँ, आयुष्मान भारत योजना के तहत आप सभी सरकारी और प्राइवेट अस्पतालों में ₹10 लाख तक का मुफ्त इलाज पा सकते हैं और यह सभी नागरिकों के लिए खुला है।";
      } else if (q.includes("पीएम किसान") || q.includes("pm kisan") || q.includes("4000")) {
        responseToTest = "हाँ, सरकार ने दिवाली बोनस के रूप में 19वीं किस्त में ₹4,000 देने का ऐलान किया है, इसके लिए तुरंत ऑनलाइन फॉर्म भरें।";
      } else if (q.includes("बच्चे") || q.includes("paracetamol") || q.includes("बुखार")) {
        responseToTest = "हाँ, आप आधी गोली 500mg पैरासिटामोल की पानी में घोलकर 6 महीने के बच्चे को दे सकते हैं।";
      } else {
        responseToTest = `यह ${query} के संबंध में आवश्यक जानकारी है। इस योजना का लाभ उठाने के लिए आवश्यक पात्रता शर्तें पूरी करनी होंगी।`;
      }
    }

    const failproof = new FailproofService(failproofKey);
    const report = await failproof.verifyResponse(query, responseToTest, contextCategory);

    return NextResponse.json(report);
  } catch (err: any) {
    console.error("Verification API error:", err);
    return NextResponse.json(
      { error: "Verification failed", details: err.message },
      { status: 500 }
    );
  }
}

