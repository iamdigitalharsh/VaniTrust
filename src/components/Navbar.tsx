"use client";

import React from "react";
import { ShieldCheck, Settings } from "lucide-react";

interface NavbarProps {
  onOpenSettings: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, hasCustomKey }) => {
  return (
    <header className="border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">
                Vani<span className="text-orange-400">Trust</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                सत्य-वाणी
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Verified Voice Assistant for Public Services & Schemes
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-700/40 text-[11px] text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Fact-Check Active</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            title="Configure API Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
            {hasCustomKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
