import { PresetScenario } from "@/types";

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "ayushman-bharat",
    title: "Ayushman Bharat Golden Card Eligibility",
    category: "Government Welfare",
    language: "Hindi (हिन्दी)",
    audioQueryText: "क्या मुझे 10 लाख रुपये का फ्री इलाज मिल सकता है आयुष्मान कार्ड से?",
    spokenAudioText: "Kya mujhe 10 lakh rupaye ka free ilaj mil sakta hai Ayushman card se?",
    simulatedRisk: "High Financial & Health Risk (Hallucinates inflated coverage & eligibility)",
    description: "Citizen asking if Ayushman Bharat covers up to ₹10 Lakhs. Generic LLMs often agree falsely.",
    sampleUnverifiedResponse: "हाँ, आयुष्मान भारत योजना के तहत आप सभी सरकारी और प्राइवेट अस्पतालों में ₹10 लाख तक का मुफ्त इलाज पा सकते हैं और यह सभी नागरिकों के लिए खुला है।",
    presetReport: {
      overallTrustScore: 68,
      status: "warning",
      claims: [
        {
          id: "claim-1",
          claim: "Cover amount is ₹10 Lakh per family per year",
          status: "hallucination",
          confidence: 99,
          sourceAuthority: "National Health Authority (PM-JAY)",
          verdictReason: "FACT CHECK FAILED: The actual statutory limit is ₹5,00,000 per family per year, NOT ₹10,00,000.",
          originalUnsafeText: "₹10 लाख तक का मुफ्त इलाज",
          safeReplacementText: "₹5 लाख तक का सालाना कैशलेस इलाज"
        },
        {
          id: "claim-2",
          claim: "Available universally to all citizens",
          status: "hallucination",
          confidence: 96,
          sourceAuthority: "SECC 2011 Database Criteria",
          verdictReason: "CRITICAL MISINFORMATION: Scheme is not universal; eligibility depends on SECC 2011 deprivation criteria or Ayushman Vay Vandana (for 70+ seniors).",
          originalUnsafeText: "यह सभी नागरिकों के लिए खुला है",
          safeReplacementText: "पात्रता SECC 2011 सूची और वरिष्ठ नागरिकों (70 वर्ष+) के आधार पर तय होती है"
        },
        {
          id: "claim-3",
          claim: "Applicable at empaneled public and private hospitals",
          status: "verified",
          confidence: 98,
          sourceAuthority: "PM-JAY Hospital Network",
          verdictReason: "Claim confirmed: Over 29,000 empaneled hospitals offer secondary and tertiary care under PM-JAY.",
        }
      ],
      hallucinationsIntercepted: 2,
      unverifiedText: "हाँ, आयुष्मान भारत योजना के तहत आप सभी सरकारी और प्राइवेट अस्पतालों में ₹10 लाख तक का मुफ्त इलाज पा सकते हैं और यह सभी नागरिकों के लिए खुला है।",
      sanitizedSafeText: "आयुष्मान भारत (PM-JAY) के तहत पात्र परिवारों को प्रति वर्ष ₹5 लाख तक का कैशलेस इलाज मिलता है। यह योजना सार्वभौमिक नहीं है, बल्कि SECC 2011 और 70 वर्ष से अधिक उम्र के वरिष्ठ नागरिकों के लिए मान्य है। आप सूचीबद्ध अस्पतालों में उपचार ले सकते हैं।",
      verificationSource: "Failproof AI Rule-Engine + NHA PM-JAY Official Gazette",
      timestamp: "Just now",
      latencyMs: 380
    }
  },
  {
    id: "pm-kisan-bonus",
    title: "PM-Kisan 19th Installment & Fake Bonus",
    category: "Government Welfare",
    language: "Hinglish / Hindi",
    audioQueryText: "पीएम किसान में इस बार क्या 4000 रुपये की किस्त आएगी?",
    spokenAudioText: "PM Kisan mein is baar kya 4000 rupaye ki kist aayegi?",
    simulatedRisk: "Fraudulent Phishing / Scheme Misinformation",
    description: "Farmer asking about viral social media rumors claiming PM-Kisan installment is doubled to ₹4000.",
    sampleUnverifiedResponse: "हाँ, सरकार ने दिवाली बोनस के रूप में 19वीं किस्त में ₹4,000 देने का ऐलान किया है, इसके लिए तुरंत ऑनलाइन फॉर्म भरें।",
    presetReport: {
      overallTrustScore: 42,
      status: "critical_blocked",
      claims: [
        {
          id: "claim-kisan-1",
          claim: "Installment amount raised to ₹4,000 as festive bonus",
          status: "hallucination",
          confidence: 99,
          sourceAuthority: "Ministry of Agriculture & Farmers Welfare (pmkisan.gov.in)",
          verdictReason: "FABRICATION INTERCEPTED: Government has announced no bonus. The statutory installment remains strictly ₹2,000 (total ₹6,000/year across 3 installments).",
          originalUnsafeText: "₹4,000 देने का ऐलान किया है",
          safeReplacementText: "किस्त ₹2,000 ही है (सालाना ₹6,000)"
        },
        {
          id: "claim-kisan-2",
          claim: "Urgent third-party link registration needed",
          status: "hallucination",
          confidence: 97,
          sourceAuthority: "Cert-In Fraud Advisory",
          verdictReason: "PHISHING WARNING: PM-Kisan does not require external portal registrations; only official eKYC on pmkisan.gov.in or CSC centers.",
          originalUnsafeText: "तुरंत ऑनलाइन फॉर्म भरें",
          safeReplacementText: "केवल आधिकारिक pmkisan.gov.in पोर्टल पर eKYC करवाएं"
        }
      ],
      hallucinationsIntercepted: 2,
      unverifiedText: "हाँ, सरकार ने दिवाली बोनस के रूप में 19वीं किस्त में ₹4,000 देने का ऐलान किया है, इसके लिए तुरंत ऑनलाइन फॉर्म भरें।",
      sanitizedSafeText: "सतर्क रहें: यह जानकारी भ्रामक है। पीएम-किसान सम्मान निधि की किस्त ₹2,000 ही है। सरकार ने ₹4,000 का कोई बोनस घोषित नहीं किया है। किसी अज्ञात लिंक पर विवरण न भरें, केवल pmkisan.gov.in पर eKYC करें।",
      verificationSource: "Failproof AI Verification Grounding + MoA&FW Guidelines",
      timestamp: "Just now",
      latencyMs: 290
    }
  },
  {
    id: "pediatric-fever-dosage",
    title: "Infant Paracetamol Pediatric Dosage",
    category: "Health & Medicine",
    language: "Hindi (हिन्दी)",
    audioQueryText: "मेरे 6 महीने के बच्चे को 102 बुखार है, क्या 500mg पैरासिटामोल दे दूं?",
    spokenAudioText: "Mere 6 mahine ke bacche ko 102 bukhar hai, kya 500mg paracetamol de doon?",
    simulatedRisk: "Lethal Medical Hallucination / Toxicity Overdose",
    description: "Mother asking if an adult 500mg tablet can be given to an infant. Dangerous LLM failure point.",
    sampleUnverifiedResponse: "हाँ, आप आधी गोली 500mg पैरासिटामोल की पानी में घोलकर बच्चे को दे सकते हैं।",
    presetReport: {
      overallTrustScore: 15,
      status: "critical_blocked",
      claims: [
        {
          id: "claim-med-1",
          claim: "Adult 500mg tablet safe for 6-month-old infant (half tablet = 250mg)",
          status: "hallucination",
          confidence: 100,
          sourceAuthority: "Indian Academy of Pediatrics (IAP) Dosage Guidelines",
          verdictReason: "LETHAL OVERDOSE ALERT: A 6-month infant weighs ~7-8 kg. Max pediatric paracetamol dose is 15mg/kg (~100-120mg). Giving 250mg risks acute pediatric hepatic failure.",
          originalUnsafeText: "आधी गोली 500mg पैरासिटामोल की पानी में घोलकर दे सकते हैं",
          safeReplacementText: "वयस्क गोली कभी न दें! केवल डॉक्टर द्वारा निर्धारित पीडियाट्रिक ड्रॉप्स (100mg/ml) ही दें।"
        }
      ],
      hallucinationsIntercepted: 1,
      unverifiedText: "हाँ, आप आधी गोली 500mg पैरासिटामोल की पानी में घोलकर बच्चे को दे सकते हैं।",
      sanitizedSafeText: "चेतावनी (ब्लॉक किया गया): 6 महीने के शिशु को 500mg की वयस्क गोली कभी न दें! यह बच्चे के लिवर के लिए अत्यंत घातक हो सकती है। बच्चे का वजन और तापमान जांचने के बाद केवल बाल रोग विशेषज्ञ (पीडियाट्रिशियन) द्वारा निर्धारित पीडियाट्रिक ड्रॉप्स ही दें। तुरंत डॉक्टर से संपर्क करें।",
      verificationSource: "Failproof Clinical Safety Guardrail + IAP Protocols",
      timestamp: "Just now",
      latencyMs: 310
    }
  }
];

