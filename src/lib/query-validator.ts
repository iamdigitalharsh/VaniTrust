import { TrustReport } from "../types";

/**
 * Validates user queries before invoking expensive search (Tavily), reasoning (Gemma),
 * or verification pipelines (Failproof).
 *
 * Filters out:
 * - Common greetings & pleasantries (Hindi, Hinglish, English)
 * - Conversational fillers & general bot questions ("who are you", "kaise ho")
 * - Unclear, single-word, or gibberish inputs
 * - Excessively long strings (enforces length bounds)
 */

export interface ValidationOutcome {
  isValid: boolean;
  type: "actionable" | "greeting" | "too_short" | "gibberish" | "too_long";
  feedbackReport?: TrustReport;
}

// Normalized set of conversational greetings
const GREETINGS_EXACT = new Set([
  "hi",
  "hii",
  "hiii",
  "hello",
  "helloo",
  "helo",
  "hey",
  "heyy",
  "yo",
  "sup",
  "hola",
  "namaste",
  "namaskar",
  "pranam",
  "pranaam",
  "good morning",
  "good evening",
  "good afternoon",
  "good night",
  "ram ram",
  "jai shree ram",
  "radhe radhe",
  "salaam",
  "salam",
  "adaab",
  "sat sri akal",
  "kaise ho",
  "kya haal hai",
  "sab theek",
  "who are you",
  "what is your name",
  "what do you do",
  "help",
  "test",
  "testing",
  "ok",
  "okay",
  "bye",
  // Devanagari Hindi
  "नमस्ते",
  "नमस्कार",
  "प्रणाम",
  "हेलो",
  "हाय",
  "हेल्लो",
  "सुप्रभात",
  "शुभ प्रभात",
  "शुभ संध्या",
  "राम राम",
  "जय श्री राम",
  "राधे राधे",
  "सलाम",
  "आदाब",
  "सत श्री अकाल",
  "कैसे हो",
  "क्या हाल है",
  "आप कौन हो",
  "आप कौन हैं",
  "तुम कौन हो",
  "मदद",
  "टेस्ट",
  "चेक",
]);

// Substring triggers for greetings and introductory phrases
const GREETING_PHRASES = [
  "who are you",
  "what can you do",
  "how are you",
  "aap kaun ho",
  "aap kaun hain",
  "tum kaun ho",
  "kya kaam karte ho",
  "kya kar sakte ho",
  "kya haal chaal",
  "आप कौन हैं",
  "आप क्या करते हैं",
  "आप क्या कर सकते हो",
  "तुम क्या कर सकते हो",
  "मुझे मदद चाहिए",
];

export function validateQuery(rawQuery: string, startTime: number = Date.now()): ValidationOutcome {
  if (!rawQuery || typeof rawQuery !== "string") {
    return {
      isValid: false,
      type: "too_short",
      feedbackReport: createFeedbackReport(
        rawQuery || "",
        "सत्य-वाणी इनपुट फिल्टर",
        "कृपया अपना प्रश्न बोलें या टाइप करें।",
        "अस्पष्ट अथवा खाली सवाल (Empty Query)",
        "कोई इनपुट प्राप्त नहीं हुआ।",
        startTime
      ),
    };
  }

  const query = rawQuery.trim();
  const lower = query.toLowerCase().replace(/[?!.,;:~`@#$%^&*()_+={}\[\]|\\/<>'"-]/g, " ").replace(/\s+/g, " ").trim();

  // 1. Length bounds: Reject or truncate if too long (> 350 chars)
  if (query.length > 350) {
    return {
      isValid: false,
      type: "too_long",
      feedbackReport: createFeedbackReport(
        query.substring(0, 100) + "...",
        "सत्य-वाणी सुरक्षा फिल्टर",
        "आपका सवाल बहुत लंबा है। कृपया अपना सवाल 1-2 संक्षिप्त वाक्यों में पूछें ताकि सही आधिकारिक स्रोतों से तुरंत जांच हो सके।",
        "अति-दीर्घ इनपुट (Input Exceeds Limit)",
        "सवालों की सीमा 300 अक्षरों तक निर्धारित है।",
        startTime
      ),
    };
  }

  // 2. Too short or single character (e.g., "a", "?", "1")
  if (query.length < 3 || lower.length < 2) {
    return {
      isValid: false,
      type: "too_short",
      feedbackReport: createFeedbackReport(
        query,
        "सत्य-वाणी इनपुट फिल्टर",
        "आपका सवाल बहुत छोटा या अधूरा है। कृपया पूरी बात पूछें — उदाहरण के लिए: 'आयुष्मान भारत में कितना मुफ्त इलाज मिलता है?' या 'पीएम किसान की किस्त कब आएगी?'",
        "अधूरा सवाल (Incomplete Query)",
        "सटीक सत्यापन के लिए कम से कम एक योजना अथवा विषय का नाम आवश्यक है।",
        startTime
      ),
    };
  }

  // 3. Exact greeting or pleasantry
  if (GREETINGS_EXACT.has(lower) || GREETING_PHRASES.some((phrase) => lower.includes(phrase))) {
    return {
      isValid: false,
      type: "greeting",
      feedbackReport: createFeedbackReport(
        query,
        "सत्य-वाणी (VaniTrust) प्रणाली",
        "नमस्ते! मैं सत्य-वाणी (VaniTrust) हूँ — आपकी भाषा में सरकारी योजनाओं, सब्सिडी और स्वास्थ्य सलाह की सत्यता जांचने वाला डिजिटल रक्षक।\n\nआप मुझसे पूछ सकते हैं:\n• आयुष्मान भारत में मुफ्त इलाज की वास्तविक सीमा क्या है?\n• क्या पीएम किसान में ₹4,000 बोनस की कोई सरकारी घोषणा हुई है?\n• 6 महीने के बच्चे को बुखार में कौन सी दवा देनी चाहिए?",
        "अभिवादन एवं मार्गदर्शन (Conversational Welcome)",
        "यह एक सामान्य अभिवादन है। सत्यापन केवल सरकारी योजनाओं, नियमों अथवा स्वास्थ्य दावों पर लागू होता है।",
        startTime
      ),
    };
  }

  // 4. Repeated character gibberish (e.g. "aaaaaa", "asdfasdf", "1111111")
  const isRepeated = /^(.)\1{4,}$/.test(query);
  const isOnlyDigits = /^[0-9\s]+$/.test(query);
  if (isRepeated || isOnlyDigits) {
    return {
      isValid: false,
      type: "gibberish",
      feedbackReport: createFeedbackReport(
        query,
        "सत्य-वाणी इनपुट फिल्टर",
        "यह सवाल समझ नहीं आया। कृपया किसी विशिष्ट सरकारी योजना या स्वास्थ्य विषय का नाम लिखकर या बोलकर पूछें।",
        "अस्पष्ट इनपुट (Invalid Input)",
        "दर्ज किया गया इनपुट किसी ज्ञात योजना या नीति से संबंधित नहीं है।",
        startTime
      ),
    };
  }

  // Passed validation and represents an actionable query
  return {
    isValid: true,
    type: "actionable",
  };
}

function createFeedbackReport(
  query: string,
  source: string,
  safeMessage: string,
  claimTitle: string,
  reason: string,
  startTime: number
): TrustReport {
  return {
    overallTrustScore: 100,
    status: "safe",
    claims: [
      {
        id: "claim-validation-info",
        claim: claimTitle,
        status: "verified",
        confidence: 100,
        sourceAuthority: source,
        verdictReason: reason,
      },
    ],
    hallucinationsIntercepted: 0,
    unverifiedText: query,
    sanitizedSafeText: safeMessage,
    verificationSource: source,
    timestamp: new Date().toLocaleTimeString(),
    latencyMs: Math.max(12, Date.now() - startTime),
  };
}
