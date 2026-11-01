/**
 * Gemma Open-Weights AI Service
 * Leverages Google's Gemma open models (via Google AI Studio / Gemini API or local HuggingFace/vLLM endpoints)
 * for cross-lingual reasoning, claim deconstruction, and hallucination interception.
 */

export interface GemmaVerificationResult {
  trustScore: number;
  isHallucination: boolean;
  sanitizedText: string;
  reasoning: string;
  flaggedClaims: Array<{
    claim: string;
    issue: string;
    groundTruth: string;
  }>;
}

export class GemmaService {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName: string = "gemma-2-9b-it") {
    this.apiKey = apiKey || process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY || "";
    this.modelName = modelName;
  }

  hasKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Verify and sanitize a vernacular response using Gemma open weights
   */
  async verifyAndSanitize(
    query: string,
    rawResponse: string,
    groundingContext?: string
  ): Promise<GemmaVerificationResult | null> {
    if (!this.hasKey()) {
      return null;
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const systemPrompt = `You are VaniTrust's Open-Weights Verification Engine powered by Gemma.
Your mission is strictly focused on high-stakes vernacular domains:
1. Indian Government Welfare Schemes, Subsidies & Entitlements (e.g. Ayushman Bharat, PM-Kisan, PDS Ration, Pensions, PMAY).
2. Public Healthcare, Pediatric Dosing & Medical Protocol Guidelines.
3. Civic Rights, Land Records (Khatauni/Bhulekh) & Statutory Entitlements.

STRICT DOMAIN RESTRICTION RULE:
If the user's query is outside these domains (such as sports, cricket/Dhoni/Kohli, entertainment/movies/Bollywood, cooking recipes, programming/coding, or general pop trivia):
You MUST reject it by setting:
- "trustScore": 100
- "isHallucination": false
- "reasoning": "Query is outside VaniTrust's statutory domain (Sports/Entertainment/Trivia)."
- "sanitizedText": "सत्य-वाणी (VaniTrust) केवल भारत सरकार की योजनाओं (जैसे आयुष्मान भारत, पीएम किसान, राशन कार्ड) और स्वास्थ्य दिशानिर्देशों के सत्यापन के लिए आरक्षित है। यह खेल, सिनेमा अथवा सामान्य ज्ञान के सवालों के लिए उपलब्ध नहीं है। कृपया किसी सरकारी योजना या स्वास्थ्य विषय पर सवाल पूछें।"
- "flaggedClaims": []

Otherwise, check the claims against official ground truth for numerical distortions, false eligibility rules, fake deadlines, and medical errors.

Return STRICT JSON ONLY in this exact format:
{
  "trustScore": <number 0-100>,
  "isHallucination": <boolean>,
  "reasoning": "<concise explanation of why it is safe or hallucinatory>",
  "sanitizedText": "<safe, corrected Hindi text to speak back to the user>",
  "flaggedClaims": [
    {
      "claim": "<hallucinatory claim>",
      "issue": "<why it is wrong>",
      "groundTruth": "<official gazette or medical fact>"
    }
  ]
}`;

      const userContent = `User Query: "${query}"
AI Generated Response to Verify: "${rawResponse}"
${groundingContext ? `Official Grounding Context: "${groundingContext}"` : ""}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userContent }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        console.warn(`Gemma API call returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!outputText) return null;

      const parsed: GemmaVerificationResult = JSON.parse(outputText);
      return parsed;
    } catch (err) {
      console.warn("Gemma verification error:", err);
      return null;
    }
  }

  /**
   * Multimodal verification: Verify an official document image (e.g. gazette or prescription)
   * against a vernacular user query.
   */
  async verifyDocumentMultimodal(
    query: string,
    imageBase64: string,
    mimeType: string = "image/jpeg"
  ): Promise<string | null> {
    if (!this.hasKey()) return null;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const prompt = `Analyze this government notification or medical document. Extract key eligibility, amounts, and dates in response to the user question: "${query}". Respond in clean, accessible Hindi.`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      console.warn("Gemma multimodal analysis error:", err);
      return null;
    }
  }
}

