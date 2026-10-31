"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Globe, Send } from "lucide-react";

interface AudioRecorderProps {
  onTranscriptionComplete: (transcript: string, language: string) => void;
  isProcessing: boolean;
  sarvamKey: string;
}

const INDIAN_LANGUAGES = [
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "hi-IN", label: "Hinglish (Hindi-English)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "en-IN", label: "English (India)" },
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
          ? "Microphone access was denied. Please allow microphone permissions or type your question below."
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
        throw new Error(data.message || data.error || "Could not transcribe audio");
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
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
      {/* Language Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Globe className="w-4 h-4 text-orange-400" />
          <span className="text-slate-400 font-medium">भाषा (Language):</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isRecording || isProcessing}
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang.label} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[11px] text-slate-400">
          बोलकर या लिखकर पूछें
        </span>
      </div>

      {/* Mic Action Area */}
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="relative mb-5">
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full bg-orange-500/10 animate-pulse" />
            </>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 transform active:scale-95 shadow-xl ${
              isRecording
                ? "bg-red-600 text-white shadow-red-500/30 ring-4 ring-red-500/20"
                : "bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/20 ring-4 ring-slate-800"
            } ${isProcessing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : isRecording ? (
              <Square className="w-7 h-7 fill-white text-white" />
            ) : (
              <Mic className="w-8 h-8 text-slate-950" />
            )}
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-base text-white">
            {isRecording
              ? `सुन रहे हैं... (${recordingDuration}s)`
              : isProcessing
              ? "जानकारी जांची जा रही है..."
              : "माइक दबाकर सवाल पूछें"}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs">
            {isRecording
              ? "अपना सवाल बोलें। पूरा होने पर लाल बटन दबाएं।"
              : "सरकारी योजनाओं, स्वास्थ्य या कानूनी नियमों के बारे में पूछें"}
          </p>
        </div>

        {/* Live Audio Visualizer */}
        {isRecording && (
          <div className="flex items-center space-x-1 mt-4 h-5">
            {[30, 60, 90, 40, 80, 100, 70, 50, 85, 30].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-orange-400 rounded-full animate-bounce"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {recordingError && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs max-w-md">
            {recordingError}
          </div>
        )}
      </div>

      {/* Text Input Option */}
      <div className="pt-4 border-t border-slate-800">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isProcessing || isRecording}
            placeholder="या यहाँ अपना सवाल लिखें (उदा. आयुष्मान कार्ड में कितना खर्च मिलता है?)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={!manualText.trim() || isProcessing}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>पूछें</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
