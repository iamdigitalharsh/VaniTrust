"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { AudioRecorder } from "@/components/AudioRecorder";
import { TrustHUD } from "@/components/TrustHUD";
import { TrustHUDSkeleton } from "@/components/TrustHUDSkeleton";
import { SampleQueries } from "@/components/SampleQueries";
import { SettingsModal } from "@/components/SettingsModal";
import { PRESET_SCENARIOS } from "@/data/scenarios";
import { PresetScenario, TrustReport } from "@/types";
import { ShieldCheck, HelpCircle } from "lucide-react";

export default function Home() {
  const [sarvamKey, setSarvamKey] = useState<string>("");
  const [geminiKey, setGeminiKey] = useState<string>("");
  const [failproofKey, setFailproofKey] = useState<string>("");
  const [tavilyKey, setTavilyKey] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Active query & verification state
  const [currentQuery, setCurrentQuery] = useState<string>(PRESET_SCENARIOS[0].audioQueryText);
  const [currentReport, setCurrentReport] = useState<TrustReport | null>(PRESET_SCENARIOS[0].presetReport);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSarvam = localStorage.getItem("SARVAM_API_KEY") || "";
      const savedGemini = localStorage.getItem("GEMINI_API_KEY") || "";
      const savedFailproof = localStorage.getItem("FAILPROOF_API_KEY") || "";
      const savedTavily = localStorage.getItem("TAVILY_API_KEY") || "";
      setSarvamKey(savedSarvam);
      setGeminiKey(savedGemini);
      setFailproofKey(savedFailproof);
      setTavilyKey(savedTavily);
    }
  }, []);

  const handleSaveSarvamKey = (key: string) => {
    setSarvamKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("SARVAM_API_KEY", key);
    }
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("GEMINI_API_KEY", key);
    }
  };

  const handleSaveFailproofKey = (key: string) => {
    setFailproofKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("FAILPROOF_API_KEY", key);
    }
  };

  const handleSaveTavilyKey = (key: string) => {
    setTavilyKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("TAVILY_API_KEY", key);
    }
  };

  const handleSelectScenario = (scenario: PresetScenario) => {
    setSelectedScenarioId(scenario.id);
    setCurrentQuery(scenario.audioQueryText);
    setCurrentReport(scenario.presetReport);
  };

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
          tavilyKey,
          gemmaKey: geminiKey,
        }),
      });

      if (!res.ok) {
        throw new Error("Verification request failed");
      }

      const report: TrustReport = await res.json();
      setCurrentReport(report);
    } catch (err) {
      console.error("Error processing request:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayVoice = async (textToSpeak: string) => {
    setIsPlayingVoice(true);

    try {
      // 1. Attempt Sarvam Bulbul TTS via backend (reads Vercel env secrets or client override)
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          languageCode: "hi-IN",
          speaker: "ritu",
          sarvamKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audioPlayerRef.current = audio;
          audio.onended = () => setIsPlayingVoice(false);
          await audio.play();
          return;
        }
      }

      // 2. Client-side browser Web Speech fallback if server TTS is unconfigured or quota reached
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
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCustomKey={Boolean(sarvamKey || geminiKey || tavilyKey || failproofKey)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Simple & Clear Product Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            सरकारी योजनाओं और स्वास्थ्य की <span className="text-orange-400">सटीक जानकारी</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            अपनी भाषा में बोलें और नियमों से जांची गई प्रमाणिक जानकारी तुरंत सुनें व पढ़ें।
          </p>
        </div>

        {/* Popular Questions Carousel / Grid */}
        <SampleQueries
          selectedId={selectedScenarioId}
          onSelectScenario={handleSelectScenario}
          isProcessing={isProcessing}
        />

        {/* 2-Column Clean Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Voice / Text Input */}
          <div className="lg:col-span-5 space-y-4">
            <AudioRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
              isProcessing={isProcessing}
              sarvamKey={sarvamKey}
              geminiKey={geminiKey}
            />

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                यह प्रणाली हर उत्तर को भारत सरकार के आधिकारिक नियमों और स्वास्थ्य दिशानिर्देशों से जांचकर ही प्रस्तुत करती है ताकि कोई गलत सलाह न मिले।
              </p>
            </div>
          </div>

          {/* Right Column: Verified Guidance Card or Skeleton */}
          <div className="lg:col-span-7">
            {isProcessing ? (
              <TrustHUDSkeleton />
            ) : currentReport ? (
              <TrustHUD
                report={currentReport}
                userQuery={currentQuery}
                sarvamKey={sarvamKey}
                onPlayVoice={handlePlayVoice}
                isPlayingVoice={isPlayingVoice}
              />
            ) : (
              <div className="min-h-[18rem] rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <HelpCircle className="w-10 h-10 mb-2 text-slate-700" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-400">कोई सवाल सक्रिय नहीं है</p>
                <p className="text-xs text-slate-500 mt-1">
                  माइक पर क्लिक करके बोलें या ऊपर दिए गए किसी सवाल को चुनें।
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Clean MVP Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            VaniTrust (सत्य-वाणी) — Accurate Vernacular Voice Guidance
          </div>
          <div className="text-slate-400 text-xs">
            National Health Authority • Ministry of Agriculture • Statutory Guidelines
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sarvamKey={sarvamKey}
        onSaveSarvamKey={handleSaveSarvamKey}
        geminiKey={geminiKey}
        onSaveGeminiKey={handleSaveGeminiKey}
        failproofKey={failproofKey}
        onSaveFailproofKey={handleSaveFailproofKey}
        tavilyKey={tavilyKey}
        onSaveTavilyKey={handleSaveTavilyKey}
      />
    </div>
  );
}
