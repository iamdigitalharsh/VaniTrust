"use client";

import React, { useState } from "react";
import { X, Key, Check, ShieldCheck, Mic, ExternalLink, Save } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sarvamKey: string;
  onSaveSarvamKey: (key: string) => void;
  failproofKey: string;
  onSaveFailproofKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sarvamKey,
  onSaveSarvamKey,
  failproofKey,
  onSaveFailproofKey,
}) => {
  const [localSarvam, setLocalSarvam] = useState(sarvamKey);
  const [localFailproof, setLocalFailproof] = useState(failproofKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSarvamKey(localSarvam.trim());
    onSaveFailproofKey(localFailproof.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-lg text-white">Sponsor API Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Sarvam AI Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <Mic className="w-3.5 h-3.5 text-orange-400" />
                <span>Sarvam AI Subscription Key (Culture Coded Track)</span>
              </label>
              <a
                href="https://sarvam.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-orange-400 hover:underline flex items-center space-x-0.5"
              >
                <span>Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={localSarvam}
              onChange={(e) => setLocalSarvam(e.target.value)}
              placeholder="e.g. sk_sarvam_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Powers Saarika Vernacular ASR & Bulbul Speech Synthesizer.
            </p>
          </div>

          {/* Failproof AI Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Failproof AI API Key (Trust Issues Track)</span>
              </label>
              <span className="text-[11px] text-slate-400">Optional / Cloud verification</span>
            </div>
            <input
              type="password"
              value={localFailproof}
              onChange={(e) => setLocalFailproof(e.target.value)}
              placeholder="e.g. fp_live_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              When empty, uses the built-in deterministic fact & gazette verification engine.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Keys are stored securely in browser local storage.
            </span>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-orange-600/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

