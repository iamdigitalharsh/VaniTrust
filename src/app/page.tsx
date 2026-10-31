"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { AudioRecorder } from "@/components/AudioRecorder";
import { TrustHUD } from "@/components/TrustHUD";
import { PresetSelector } from "@/components/PresetSelector";
import { SettingsModal } from "@/components/SettingsModal";
import { JudgeCheatSheet } from "@/components/JudgeCheatSheet";
import { PRESET_SCENARIOS } from "@/data/scenarios";
import { PresetScenario, TrustReport } from "@/types";
import { ShieldCheck, Mic, Award, Zap, Sparkles } from "lucide-react";

export default function Home() {
  const [sarvamKey, setSarvamKey] = useState<string>("");
  const [failproofKey, setFailproofKey] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Active query & verification state
  const [currentQuery, setCurrentQuery] = useState<string>(PRESET_SCENARIOS[0].audioQueryText);
  const [currentReport, setCurrentReport] = useState<TrustReport | null>(PRESET_SCENARIOS[0].presetReport);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load saved keys from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSarvam = localStorage.getItem("SARVAM_API_KEY") || "";
      const savedFailproof = localStorage.getItem("FAILPROOF_API_KEY") || "";
      setSarvamKey(savedSarvam);
      setFailproofKey(savedFailproof);
    }
  }, []);

  const handleSaveSarvamKey = (key: string) => {
    setSarvamKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("SARVAM_API_KEY", key);
    }
  };

  const handleSaveFailproofKey = (key: string) => {
    setFailproofKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("FAILPROOF_API_KEY", key);
    }
  };

  // Select a preset scenario
  const handleSelectScenario = (scenario: PresetScenario) => {
    setSelectedScenarioId(scenario.id);
    setCurrentQuery(scenario.audioQueryText);
    setCurrentReport(scenario.presetReport);
  };

  // Transcription from Live Microphone completed
  const handleTranscriptionComplete = async (transcript: string, language: string) => {
    setCurrentQuery(transcript);
    setSelectedScenarioId("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: transcript,
          failproofKey,
        }),
      });

      if (!res.ok) {
        throw new Error("Verification request failed");
      }

      const report: TrustReport = await res.json();
      setCurrentReport(report);
    } catch (err) {
      console.error("Error processing transcription:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Synthesize and play audio response via Sarvam Bulbul (with Web Speech fallback)
  const handlePlayVoice = async (textToSpeak: string) => {
    setIsPlayingVoice(true);

    try {
      if (sarvamKey) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToSpeak,
            languageCode: "hi-IN",
            speaker: "meera",
            sarvamKey,
          }),
        });

        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audioPlayerRef.current = audio;
          audio.onended = () => setIsPlayingVoice(false);
          await audio.play();
          return;
        }
      }

      // Fallback: Browser Web Speech API if Sarvam key is not yet set
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = "hi-IN";
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingVoice(false);
        utterance.onerror = () => setIsPlayingVoice(false);
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text to speech is not supported in this browser.");
        setIsPlayingVoice(false);
      }
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlayingVoice(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 bg-grid-pattern">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasSarvamKey={Boolean(sarvamKey)}
        hasFailproofKey={Boolean(failproofKey)}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Pitch Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ship Happens 2026 • Dual Sponsor Track Integration</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Vernacular Voice AI with <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">Zero Hallucinations</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Combining <strong>Sarvam AI</strong> (Culture Coded) for authentic Indian voice interaction with <strong>Failproof AI</strong> (Trust Issues) to intercept and ground misinformation in real time.
          </p>
        </div>

        {/* Presenter / Judge Cheat Sheet */}
        <JudgeCheatSheet />

        {/* Zero-Lag Demo Presets */}
        <PresetSelector
          onSelectScenario={handleSelectScenario}
          selectedId={selectedScenarioId}
          isProcessing={isProcessing}
        />

        {/* Two-Column Working Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Audio Recording Input (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <AudioRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
              isProcessing={isProcessing}
              sarvamKey={sarvamKey}
            />

            {/* Architecture Card */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs space-y-3">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Verification Pipeline Flow</span>
              </h4>
              <div className="space-y-2 text-slate-400 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-orange-950 text-orange-400 flex items-center justify-center font-mono font-bold text-[10px]">1</span>
                  <span><strong>Sarvam Saarika:</strong> Vernacular acoustic speech-to-text</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">2</span>
                  <span><strong>Failproof AI:</strong> Atomic claim extraction & gazette grounding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-400 flex items-center justify-center font-mono font-bold text-[10px]">3</span>
                  <span><strong>Trust Interceptor:</strong> Strikes out unverified hallucinated text</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-orange-950 text-orange-400 flex items-center justify-center font-mono font-bold text-[10px]">4</span>
                  <span><strong>Sarvam Bulbul:</strong> Expressive regional voice synthesis of safe truth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Trust HUD (7 cols) */}
          <div className="lg:col-span-7">
            {currentReport ? (
              <TrustHUD
                report={currentReport}
                userQuery={currentQuery}
                sarvamKey={sarvamKey}
                onPlayVoice={handlePlayVoice}
                isPlayingVoice={isPlayingVoice}
              />
            ) : (
              <div className="h-80 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShieldCheck className="w-12 h-12 mb-3 text-slate-700" />
                <p className="text-sm font-medium text-slate-400">No Query Active</p>
                <p className="text-xs text-slate-500 mt-1">
                  Tap the microphone or select one of the instant demo presets above.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070a12] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built with ❤️ at <strong>Ship Happens</strong> (Delhi NCR / Gurugram)
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Primary Track: <strong>Culture Coded (Sarvam)</strong></span>
            <span>•</span>
            <span>Secondary: <strong>Trust Issues (Failproof AI)</strong></span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sarvamKey={sarvamKey}
        onSaveSarvamKey={handleSaveSarvamKey}
        failproofKey={failproofKey}
        onSaveFailproofKey={handleSaveFailproofKey}
      />
    </div>
  );
}

