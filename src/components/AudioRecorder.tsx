"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, Globe, Sparkles, Send } from "lucide-react";

interface AudioRecorderProps {
  onTranscriptionComplete: (transcript: string, language: string) => void;
  isProcessing: boolean;
  sarvamKey: string;
}

const INDIAN_LANGUAGES = [
  { code: "hi-IN", label: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "hi-IN", label: "Hinglish (Hindi-English)", flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi (मराठी)", flag: "🇮🇳" },
  { code: "ta-IN", label: "Tamil (தமிழ்)", flag: "🇮🇳" },
  { code: "te-IN", label: "Telugu (తెలుగు)", flag: "🇮🇳" },
  { code: "bn-IN", label: "Bengali (বাংলা)", flag: "🇮🇳" },
  { code: "en-IN", label: "English (India)", flag: "🇮🇳" },
];

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
  isProcessing,
  sarvamKey,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN");
  const [manualText, setManualText] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setRecordingError(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setRecordingError(
        err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access or type your query below."
          : "Unable to access microphone on this device."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "query.wav");
      formData.append("languageCode", selectedLanguage);
      if (sarvamKey) {
        formData.append("sarvamKey", sarvamKey);
      }

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Transcription failed");
      }

      if (data.transcript) {
        onTranscriptionComplete(data.transcript, selectedLanguage);
      }
    } catch (err: any) {
      setRecordingError(err.message || "Failed to transcribe audio.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      onTranscriptionComplete(manualText.trim(), selectedLanguage);
      setManualText("");
    }
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
      {/* Language Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <Globe className="w-4 h-4 text-orange-400" />
          <span className="font-medium text-xs text-slate-400">INPUT LANGUAGE:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isRecording || isProcessing}
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang.label} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Powered by <strong>Sarvam Saarika</strong> ASR</span>
        </div>
      </div>

      {/* Main Mic Action Area */}
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="relative mb-6">
          {/* Animated waveform rings when recording */}
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full bg-orange-500/10 animate-pulse" />
            </>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 transform active:scale-95 shadow-2xl ${
              isRecording
                ? "bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/40 ring-4 ring-red-500/30"
                : "bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-500 text-slate-950 hover:brightness-110 shadow-orange-500/25 ring-4 ring-slate-800"
            } ${isProcessing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            ) : isRecording ? (
              <Square className="w-9 h-9 fill-white text-white" />
            ) : (
              <Mic className="w-11 h-11 text-slate-950" />
            )}
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-white">
            {isRecording
              ? `Listening in ${INDIAN_LANGUAGES.find((l) => l.code === selectedLanguage)?.label}... (${recordingDuration}s)`
              : isProcessing
              ? "Verifying Claims & Guardrails..."
              : "Tap Mic to Speak in Hindi / Hinglish"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {isRecording
              ? "Speak your query naturally. Tap the square button when finished."
              : "Ask about government welfare schemes, legal queries, or medical assistance."}
          </p>
        </div>

        {/* Recording active sound bars animation */}
        {isRecording && (
          <div className="flex items-center space-x-1 mt-4 h-6">
            {[40, 75, 90, 60, 30, 85, 100, 70, 45, 95, 60, 35].map((height, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-orange-500 to-rose-400 rounded-full animate-bounce"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {recordingError && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-700/50 text-red-300 text-xs max-w-md">
            {recordingError}
          </div>
        )}
      </div>

      {/* Hallway fallback: Direct text input for noisy hackathon floor */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isProcessing || isRecording}
            placeholder="Or type vernacular query here (e.g. क्या मुझे ₹10 लाख का आयुष्मान कार्ड मिल सकता है?)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/80"
          />
          <button
            type="submit"
            disabled={!manualText.trim() || isProcessing}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>Verify</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

