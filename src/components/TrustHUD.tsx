"use client";

import React, { useState } from "react";
import { TrustReport } from "@/types";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  FileCheck
} from "lucide-react";

interface TrustHUDProps {
  report: TrustReport;
  userQuery: string;
  sarvamKey: string;
  onPlayVoice: (textToSpeak: string) => void;
  isPlayingVoice: boolean;
}

export const TrustHUD: React.FC<TrustHUDProps> = ({
  report,
  userQuery,
  onPlayVoice,
  isPlayingVoice,
}) => {
  const [showFactDetails, setShowFactDetails] = useState(false);

  const isCritical = report.status === "critical_blocked" || report.overallTrustScore < 50;
  const isWarning = report.status === "warning" || report.overallTrustScore < 80;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Status Bar */}
      <div className={`p-5 border-b flex flex-wrap items-center justify-between gap-3 ${
        isCritical
          ? "bg-red-950/30 border-red-900/40"
          : isWarning
          ? "bg-amber-950/30 border-amber-900/40"
          : "bg-emerald-950/30 border-emerald-900/40"
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCritical
              ? "bg-red-500/20 text-red-400"
              : isWarning
              ? "bg-amber-500/20 text-amber-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}>
            {isCritical ? (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isCritical
                ? "भ्रामक जानकारी हटाई गई (Misinformation Corrected)"
                : isWarning
                ? "तथ्य सुधार के साथ प्रमाणित उत्तर"
                : "आधिकारिक नियमों से प्रमाणित (Verified)"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              स्रोतों से मिलान: {report.verificationSource}
            </p>
          </div>
        </div>

        {/* Listen Button */}
        <button
          onClick={() => onPlayVoice(report.sanitizedSafeText)}
          disabled={isPlayingVoice}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md transition-colors active:scale-[0.96] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-400"
          aria-label={isPlayingVoice ? "आवाज़ चल रही है" : "सत्यापित उत्तर सुनें (Listen to verified response)"}
        >
          {isPlayingVoice ? (
            <Loader2 className="w-4 h-4 motion-safe:animate-spin text-slate-950" aria-hidden="true" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-950" aria-hidden="true" />
          )}
          <span>{isPlayingVoice ? "आवाज़ चल रही है..." : "उत्तर सुनें (Listen)"}</span>
        </button>
      </div>

      {/* Verified Answer Body */}
      <div className="p-6 space-y-4">
        <div>
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block mb-1">
            आपका सवाल (Your Question):
          </span>
          <p className="text-xs text-slate-300 font-medium italic bg-slate-950/60 px-3.5 py-2.5 rounded-lg border border-slate-800">
            "{userQuery}"
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            सटीक और सुरक्षित उत्तर (Verified Guidance):
          </span>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-sm leading-relaxed">
            {report.sanitizedSafeText}
          </div>
        </div>

        {/* Fact check dropdown toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowFactDetails(!showFactDetails)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 rounded p-1"
            aria-expanded={showFactDetails}
          >
            <FileCheck className="w-4 h-4 text-orange-400" aria-hidden="true" />
            <span>{showFactDetails ? "तथ्य विवरण छुपाएं" : "जांचे गए नियमों का विवरण देखें (View Fact-Check Details)"}</span>
          </button>
        </div>

        {/* Detailed Claim Breakdown */}
        {showFactDetails && (
          <div className="pt-2 space-y-3">
            {report.claims.map((claim) => (
              <div
                key={claim.id}
                className={`p-3.5 rounded-xl border text-xs ${
                  claim.status === "hallucination"
                    ? "bg-red-950/20 border-red-800/30 text-slate-200"
                    : "bg-slate-950/40 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {claim.status === "hallucination" ? (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{claim.claim}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{claim.verdictReason}</p>
                    <div className="text-xs text-slate-400 pt-0.5">
                      आधिकारिक स्रोत: <span className="text-slate-300 font-medium">{claim.sourceAuthority}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
