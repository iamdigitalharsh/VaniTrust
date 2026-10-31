export type ClaimStatus = 'verified' | 'hallucination' | 'caution';

export interface VerifiedClaim {
  id: string;
  claim: string;
  status: ClaimStatus;
  confidence: number; // 0 - 100
  sourceAuthority: string;
  verdictReason: string;
  originalUnsafeText?: string;
  safeReplacementText?: string;
}

export interface TrustReport {
  overallTrustScore: number; // 0 - 100
  status: 'safe' | 'warning' | 'critical_blocked';
  claims: VerifiedClaim[];
  hallucinationsIntercepted: number;
  unverifiedText: string;
  sanitizedSafeText: string;
  verificationSource: string;
  timestamp: string;
  latencyMs: number;
}

export interface PresetScenario {
  id: string;
  title: string;
  category: 'Government Welfare' | 'Health & Medicine' | 'Legal & Khata' | 'Emergency';
  language: string;
  audioQueryText: string;
  spokenAudioText: string;
  simulatedRisk: string;
  description: string;
  sampleUnverifiedResponse: string;
  presetReport: TrustReport;
}

