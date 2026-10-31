"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Terminal, Mic, ShieldAlert, Award, Zap } from "lucide-react";

export const JudgeCheatSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            90-Second Live Judge Pitch Guide (No Slides Needed)
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
            For Presenters
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-800 text-xs space-y-4 bg-slate-950/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-orange-400 font-bold mb-2">
                <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>The Problem (15s)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                "GenAI in Indian languages is booming, but <strong>hallucination rates in Hindi and regional dialects are dangerously high</strong>. If an AI gives false ₹10 Lakh medical advice or toxic infant drug dosage, real people suffer."
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>The Multi-Track Tech (30s)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                "We combined <strong>Sarvam AI</strong> (Culture Coded) for native Indian voice input/output with <strong>Failproof AI</strong> (Trust Issues) for claim-level verification and hallucination interception before voice synthesis."
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>The Live Proof (45s)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                "Watch this live: When asked if Ayushman Bharat covers ₹10 Lakhs, standard AI lies. Our <strong>Failproof Trust HUD</strong> catches the false claim in 300ms and <strong>Sarvam Bulbul</strong> speaks back only the verified ₹5 Lakh limit."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

