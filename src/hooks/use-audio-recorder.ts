"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseAudioRecorderOptions {
  selectedLanguage: string;
  sarvamKey?: string;
  geminiKey?: string;
  onTranscriptionComplete: (transcript: string, language: string) => void;
}

export function useAudioRecorder({
  selectedLanguage,
  sarvamKey = "",
  geminiKey = "",
  onTranscriptionComplete,
}: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
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

  const handleAudioUpload = useCallback(
    async (audioBlob: Blob) => {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "query.wav");
        formData.append("languageCode", selectedLanguage);
        if (sarvamKey) {
          formData.append("sarvamKey", sarvamKey);
        }
        if (geminiKey) {
          formData.append("geminiKey", geminiKey);
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
    },
    [selectedLanguage, sarvamKey, geminiKey, onTranscriptionComplete]
  );

  const startRecording = useCallback(async () => {
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
  }, [handleAudioUpload]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  return {
    isRecording,
    recordingDuration,
    recordingError,
    startRecording,
    stopRecording,
  };
}

