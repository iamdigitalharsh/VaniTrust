"use client";

import React from "react";

export interface AudioVisualizerProps {
  isRecording: boolean;
  className?: string;
}

const BAR_HEIGHTS = [30, 60, 90, 40, 80, 100, 70, 50, 85, 30];

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  className = "",
}) => {
  if (!isRecording) return null;

  return (
    <div
      className={`flex items-center space-x-1 mt-4 h-5 ${className}`}
      aria-hidden="true"
    >
      {BAR_HEIGHTS.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-orange-400 rounded-full motion-safe:animate-bounce"
          style={{
            height: `${height}%`,
            animationDuration: `${0.4 + (index % 4) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};
