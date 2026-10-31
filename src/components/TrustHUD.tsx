"use client";

import React, { useState } from "react";
import { TrustReport, VerifiedClaim } from "@/types";
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Volume2, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Info
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
  sarvamKey,
  onPlayVoice,
  isPlayingVoice,
}) => {
  const [activeTab, setActiveTab] = useState<"claims" | "comparison">("claims");

  const getScoreTheme = (score: number, status: string) => {
    if (status === "critical_blocked" || score < 50) {
      return {
        bg: "bg-red-950/40 border-red-500/40 text-red-400",
        badge: "bg-red-500/20 text-red-300 border-red-500/30",
        ring: "ring-red-500/30",
        icon: ShieldAlert,
        label: "CRITICAL MISINFORMATION INTERCEPTED",
        glow: "shadow-red-500/20",
      };
    }
    if (status === "warning" || score < 80) {
      return {
        bg: "bg-amber-950/40 border-amber-500/40 text-amber-400",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        ring: "ring-amber-500/30",
        icon: AlertTriangle,
        label: "FACTUAL INACCURACIES SANITIZED",
        glow: "shadow-amber-500/20",
      };
    }
    return {
      bg: "bg-emerald-950/40 border-emerald-500/40 text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      ring: "ring-emerald-500/30",
      icon: ShieldCheck,
      label: "GROUND-TRUTH VERIFIED & SAFE",
      glow: "shadow-emerald-500/20",
    };
  };

  const theme = getScoreTheme(report.overallTrustScore, report.status);
  const StatusIcon = theme.icon;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Banner: Verification Status & Score */}
      <div className={`p-6 border-b ${theme.bg} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-950/70 border border-slate-700/50 ${theme.glow} shadow-xl`}>
            <StatusIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                {theme.label}
              </span>
              <span className="text-xs text-slate-400">
                Latency: {report.latencyMs}ms
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Failproof AI Trust HUD
            </h2>
          </div>
        </div>

        {/* Big Trust Gauge Score */}
        <div className="flex items-center space-x-6">
          {report.hallucinationsIntercepted > 0 && (
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400 block">
                Intercepted
              </span>
              <span className="text-2xl font-black text-red-400 font-mono">
                {report.hallucinationsIntercepted} Hallucination{report.hallucinationsIntercepted > 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-700/60 shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Trust Index
            </span>
            <span className={`text-3xl font-extrabold font-mono ${
              report.overallTrustScore >= 80 ? "text-emerald-400" : report.overallTrustScore >= 50 ? "text-amber-400" : "text-red-400"
            }`}>
              {report.overallTrustScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Query Banner */}
      <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-orange-400 font-bold uppercase tracking-wider text-[10px]">
            Vernacular Query:
          </span>
          <span className="text-slate-200 italic truncate font-medium">"{userQuery}"</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Source:</span>
          <span className="text-slate-300 font-mono">{report.verificationSource}</span>
        </div>
      </div>

      {/* Action / Voice Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-orange-950/30 via-slate-900 to-emerald-950/30 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("claims")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "claims"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Claim Breakdown ({report.claims.length})
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "comparison"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Before / After Diff
          </button>
        </div>

        {/* Speak with Sarvam Bulbul */}
        <button
          onClick={() => onPlayVoice(report.sanitizedSafeText)}
          disabled={isPlayingVoice}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isPlayingVoice ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-950" />
          )}
          <span>{isPlayingVoice ? "Synthesizing Bulbul Voice..." : "Hear Verified Voice (Sarvam Bulbul)"}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {activeTab === "claims" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">
                Granular Claim Verification Pipeline
              </span>
              <span className="text-[11px]">
                Audited against Indian gazettes & verified authorities
              </span>
            </div>

            {report.claims.map((claim) => (
              <div
                key={claim.id}
                className={`p-4 rounded-xl border transition-all ${
                  claim.status === "hallucination"
                    ? "bg-red-950/20 border-red-500/30"
                    : claim.status === "caution"
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-slate-950/50 border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    {claim.status === "hallucination" ? (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : claim.status === "caution" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {claim.claim}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {claim.verdictReason}
                      </p>

                      {claim.originalUnsafeText && (
                        <div className="mt-2 text-xs flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40">
                            Hallucinated:
                          </span>
                          <span className="line-through text-red-300 font-mono">
                            {claim.originalUnsafeText}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            Verified Truth:
                          </span>
                          <span className="text-emerald-300 font-semibold">
                            {claim.safeReplacementText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 block mb-1">
                      {claim.confidence}% Conf.
                    </span>
                    <span className="text-[10px] text-slate-500 block max-w-[120px] truncate" title={claim.sourceAuthority}>
                      {claim.sourceAuthority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Before / After Comparison */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw Unverified LLM */}
            <div className="p-4 rounded-xl bg-red-950/10 border border-red-800/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Raw Unverified Vernacular Output
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-serif italic bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {report.unverifiedText}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-red-900/30 text-[11px] text-red-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Contains unverified hallucinations & risk factors</span>
              </div>
            </div>

            {/* Failproof Sanitized Output */}
            <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-800/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Failproof Grounded Output (To Voice)
                  </h4>
                </div>
                <p className="text-xs text-emerald-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {report.sanitizedSafeText}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/30 text-[11px] text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passed all truth & safety guardrails</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

