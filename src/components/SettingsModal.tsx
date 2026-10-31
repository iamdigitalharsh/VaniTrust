"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Key, Check, Save, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sarvamKey: string;
  onSaveSarvamKey: (key: string) => void;
  failproofKey: string;
  onSaveFailproofKey: (key: string) => void;
  tavilyKey: string;
  onSaveTavilyKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sarvamKey,
  onSaveSarvamKey,
  failproofKey,
  onSaveFailproofKey,
  tavilyKey,
  onSaveTavilyKey,
}) => {
  const [localSarvam, setLocalSarvam] = useState(sarvamKey);
  const [localFailproof, setLocalFailproof] = useState(failproofKey);
  const [localTavily, setLocalTavily] = useState(tavilyKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSarvamKey(localSarvam.trim());
    onSaveFailproofKey(localFailproof.trim());
    onSaveTavilyKey(localTavily.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-orange-400" aria-hidden="true" />
            <h3 id="settings-title" className="font-bold text-base text-white">
              API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Close settings dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="sarvam-key-input"
              className="text-xs font-semibold text-slate-200 block mb-1"
            >
              Sarvam AI Key (Vernacular Speech & Audio)
            </label>
            <input
              ref={firstInputRef}
              id="sarvam-key-input"
              type="password"
              value={localSarvam}
              onChange={(e) => setLocalSarvam(e.target.value)}
              placeholder="e.g. sk_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="tavily-key-input"
                className="text-xs font-semibold text-slate-200 block"
              >
                Tavily Search Key (Live Web Fact-Checking)
              </label>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-400 hover:underline inline-flex items-center space-x-0.5"
              >
                <span>Code: SHIPHAPPENS</span>
                <ExternalLink className="w-3 h-3 ml-0.5" aria-hidden="true" />
              </a>
            </div>
            <input
              id="tavily-key-input"
              type="password"
              value={localTavily}
              onChange={(e) => setLocalTavily(e.target.value)}
              placeholder="e.g. tvly-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Powers real-time search across Indian government portals (.gov.in).
            </p>
          </div>

          <div>
            <label
              htmlFor="failproof-key-input"
              className="text-xs font-semibold text-slate-200 block mb-1"
            >
              Failproof Verification Key (Optional)
            </label>
            <input
              id="failproof-key-input"
              type="password"
              value={localFailproof}
              onChange={(e) => setLocalFailproof(e.target.value)}
              placeholder="e.g. fp_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs transition-colors active:scale-[0.96]"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-800" aria-hidden="true" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
