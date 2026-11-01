import { TrustReport } from "@/types";

/**
 * Validates user queries before invoking expensive search (Tavily), reasoning (Gemma),
 * or verification pipelines (Failproof).
 *
 * Enforces:
 * 1. Strict Domain Specificity (Only Government Schemes, Subsidies, Civic Rights & Healthcare)
 * 2. Conversational & Greeting Filters (Hindi, Hinglish, English)
 * 3. Gibberish & Input Length Bounds
 */

export interface ValidationOutcome {
  isValid: boolean;
  type: "actionable" | "greeting" | "out_of_domain" | "too_short" | "gibberish" | "too_long";
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

// Out-of-Domain Keywords and Topics (Sports, Celebrities, Entertainment, Cooking, Jokes, Coding, Foreign Trivia)
interface OutOfDomainRule {
  category: string;
  keywords: string[];
}

const OUT_OF_DOMAIN_RULES: OutOfDomainRule[] = [
  {
    category: "खेल एवं खिलाड़ी (Sports & Cricket)",
    keywords: [
      "dhoni", "dhone", "ms dhoni", "m s dhoni", "mahendra singh dhoni",
      "kohli", "virat kohli", "rohit sharma", "sachin", "tendulkar", "bumrah",
      "hardik pandya", "kl rahul", "cricket", "ipl", "bcci", "football",
      "messi", "ronaldo", "fifa", "world cup", "t20", "stadium", "batsman",
      "bowler", "wicket", "tennis", "badminton", "olympics", "match score",
      "धोनी", "विराट कोहली", "रोहित शर्मा", "सचिन", "क्रिकेट", "आईपीएल",
      "फुटबॉल", "विश्व कप", "खिलाड़ी", "रन", "विकेट",
    ],
  },
  {
    category: "मनोरंजन एवं सिनेमा (Entertainment & Bollywood)",
    keywords: [
      "bollywood", "hollywood", "movie", "movies", "film", "films", "cinema",
      "actor", "actress", "hero", "heroine", "shah rukh", "shahrukh", "srk",
      "salman khan", "aamir khan", "deepika", "alia bhatt", "ranbir", "song",
      "songs", "singer", "netflix", "trailer", "box office", "dance",
      "फिल्म", "सिनेमा", "गाना", "गाने", "गायक", "अभिनेता", "अभिनेत्री", "शाहरुख",
      "सलमान खान", "मूवी", "नाच", "गाने सुनाओ",
    ],
  },
  {
    category: "खान-पान एवं रेसिपी (Food & Cooking)",
    keywords: [
      "recipe", "recipes", "cook", "cooking", "biryani", "pizza", "burger", "cake",
      "restaurant", "रेसिपी", "खाना कैसे बनाएं", "बिरयानी", "व्यंजन", "समोसा",
    ],
  },
  {
    category: "मनोरंजक गपशप, चुटकुले एवं ज्योतिष (Jokes, Poetry & Astrology)",
    keywords: [
      "joke", "jokes", "chutkula", "chutkule", "shayari", "poem", "poetry",
      "horoscope", "kundali", "rashi", "zodiac", "astrology",
      "चुटकला", "चुटकुले", "शायरी", "कविता", "राशिफल", "कुंडली", "ग्रह",
    ],
  },
  {
    category: "सॉफ्टवेयर कोडिंग एवं सामान्य ज्ञान (Coding & Trivia)",
    keywords: [
      "python code", "javascript code", "write a code", "write code", "html code",
      "css code", "coding", "algorithm", "capital of", "president of usa",
      "who invented", "speed of light", "capital of france", "dinosaur", "dinosaurs",
      "मौसम कैसा है", "weather in",
    ],
  },
];

// Anchors indicating legitimate in-domain public welfare, civic, or healthcare intent
const IN_DOMAIN_KEYWORDS = [
  // Schemes & Government
  "योजना", "yojana", "scheme", "सरकार", "sarkar", "govt", "government", "सब्सिडी", "subsidy",
  "राशन", "ration", "पेंशन", "pension", "किसान", "kisan", "आयुष्मान", "ayushman", "pmay",
  "आवास", "awas", "ladli", "लाडली", "उज्ज्वला", "ujjawala", "मजदूरी", "मनरेगा", "mgnrega",
  "scholarship", "छात्रवृत्ति", "मुफ्त", "free", "रजिस्ट्रेशन", "apply", "form", "पोर्टल",
  "portal", "गाइडलाइन", "guideline", "नियम", "rule", "गजट", "gazette", "अधिसूचना", "notification",
  "अस्पताल", "hospital", "क्लीनिक", "clinic", "eligibility", "पात्रता", "किस्त", "installment",
  "pm-jay", "pmjay", "nha", "csc",
  // Healthcare, Pediatric & Medicine
  "दवा", "dawa", "medicine", "tablet", "syrup", "paracetamol", "पैरासिटामोल", "बुखार", "fever",
  "खांसी", "cough", "दर्द", "pain", "बच्चा", "baby", "infant", "बच्चे", "child", "खुराक",
  "dosage", "dose", "टीका", "vaccine", "डॉक्टर", "doctor", "मरीज", "patient", "बीमारी",
  "disease", "इलाज", "treatment", "गर्भवती", "pregnant", "स्वास्थ्य", "health", "ओआरएस", "ors",
  "mg", "मिलीग्राम",
  // Legal, Land & Civic Identity
  "आधार", "aadhaar", "aadhar", "pan card", "voter", "खतौनी", "khatauni", "भूलेख", "land",
  "जमीन", "registry", "प्रमाण पत्र", "certificate", "जाति", "caste", "आय", "income", "निवास",
  "domicile", "कानून", "law", "अधिकार", "right", "हेल्पलाइन", "helpline", "complaint", "शिकायत",
  "रुपये", "rupees", "लाख", "lakh", "हजार", "thousand", "कवरेज", "coverage", "लाभ", "benefit",
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

  // 5. Strict Domain Specificity Check
  // Check if query contains recognized in-domain keywords
  const hasInDomainSignal = IN_DOMAIN_KEYWORDS.some((kw) => lower.includes(kw));

  // Check if query explicitly matches an out-of-domain topic (Sports, Bollywood, Jokes, Recipes, Coding)
  for (const rule of OUT_OF_DOMAIN_RULES) {
    const matchedKeyword = rule.keywords.find((kw) => {
      // Match whole word or exact token boundary
      const regex = new RegExp(`(^|\\s)${kw}(\\s|$)`, "i");
      return regex.test(lower) || lower.includes(` ${kw} `) || lower.startsWith(`${kw} `) || lower.endsWith(` ${kw}`) || lower === kw;
    });

    if (matchedKeyword) {
      return {
        isValid: false,
        type: "out_of_domain",
        feedbackReport: createFeedbackReport(
          query,
          "सत्य-वाणी डोमेन रक्षक (Domain Guardrail)",
          `सत्य-वाणी (VaniTrust) केवल भारत सरकार की कल्याणकारी योजनाओं (जैसे आयुष्मान भारत, पीएम किसान, राशन कार्ड), नागरिक अधिकारों और स्वास्थ्य संबंधी प्रमाणिक दिशानिर्देशों के सत्यापन के लिए आरक्षित है।\n\nयह प्रश्न हमारे कार्यक्षेत्र (${rule.category}) से बाहर है। खेल, मनोरंजन, सिनेमा अथवा सामान्य ज्ञान की जानकारी के लिए कृपया सामान्य खोज का उपयोग करें। यदि आपके पास किसी सरकारी योजना, सब्सिडी, पेंशन या दवा संबंधी सवाल है, तो कृपया पूछें।`,
          "डोमेन सीमा प्रतिबंध (Domain Restricted: Out of Scope)",
          `यह प्रश्न '${rule.category}' से संबंधित है। सत्य-वाणी केवल सरकारी योजनाओं और स्वास्थ्य नियमों की सत्यता जांचता है।`,
          startTime
        ),
      };
    }
  }

  // 6. Generic Out-of-Domain Catch: If query lacks ANY welfare, health, or civic anchor
  // and starts with "who is" or "kaun hai" or asks about random foreign/trivia topics
  const isGeneralTrivia =
    /^(who is|who was|who are|tell me about|what is the capital of|kaun hai|koun hai)\s+/i.test(lower) ||
    /(\bधोनी\b|\bकोहली\b|\bशाहरुख\b|\bसलमान\b)/.test(lower);

  if (isGeneralTrivia && !hasInDomainSignal) {
    return {
      isValid: false,
      type: "out_of_domain",
      feedbackReport: createFeedbackReport(
        query,
        "सत्य-वाणी डोमेन रक्षक (Domain Guardrail)",
        "सत्य-वाणी (VaniTrust) केवल भारत सरकार की कल्याणकारी योजनाओं (जैसे आयुष्मान भारत, पीएम किसान, राशन कार्ड), नागरिक अधिकारों और स्वास्थ्य व दवा संबंधी प्रमाणिक दिशानिर्देशों के लिए आरक्षित है।\n\nयह प्रश्न हमारे कार्यक्षेत्र (सामान्य ज्ञान / व्यक्ति विशेष) से बाहर है। कृपया किसी सरकारी योजना, सब्सिडी, पेंशन अथवा स्वास्थ्य संबंधी विषय पर सवाल पूछें।",
        "डोमेन सीमा प्रतिबंध (Domain Restricted: Out of Scope)",
        "यह प्रश्न सामान्य ज्ञान अथवा व्यक्ति विशेष से संबंधित है और सरकारी योजनाओं या स्वास्थ्य के कार्यक्षेत्र में नहीं आता।",
        startTime
      ),
    };
  }

  // Query is valid and represents an actionable civic / welfare / health domain query
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
