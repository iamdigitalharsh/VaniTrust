"use client";

import React from "react";
import { ShieldCheck, Mic, Sparkles, Settings, Terminal, Radio } from "lucide-react";

interface NavbarProps {
  onOpenSettings: () => void;
  hasSarvamKey: boolean;
  hasFailproofKey: boolean;
  demoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  hasSarvamKey,
  hasFailproofKey,
  demoMode,
  onToggleDemoMode,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Vani<span className="text-orange-400">Trust</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 font-medium">
                सत्य-वाणी
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Vernacular Voice AI with Real-Time Hallucination Guardrails
            </p>
          </div>
        </div>

        {/* Hackathon Track Badges */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-600/30 text-xs text-orange-300">
            <Mic className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold">Track: Culture Coded</span>
            <span className="text-[10px] bg-orange-500/20 px-1 rounded text-orange-200">Sarvam</span>
          </div>
          <span className="text-slate-600 font-mono">+</span>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-600/30 text-xs text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Trust Issues</span>
            <span className="text-[10px] bg-emerald-500/20 px-1 rounded text-emerald-200">Failproof</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              demoMode
                ? "bg-purple-950/50 border-purple-500/40 text-purple-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title="Toggle Live Judge Presets / Ground Truth Sandbox"
          >
            <Radio className={`w-3.5 h-3.5 ${demoMode ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
            <span>{demoMode ? "Judge Sim: ON" : "Live Mic Mode"}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Keys</span>
            {(hasSarvamKey || hasFailproofKey) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

