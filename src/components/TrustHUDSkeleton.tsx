"use client";

import React from "react";

export const TrustHUDSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="जानकारी जांची जा रही है (Verifying guidelines and rules)"
      className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm p-6 space-y-5 animate-pulse"
    >
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-800 rounded" />
            <div className="h-3 w-32 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="h-8 w-28 bg-slate-800 rounded-xl" />
      </div>

      {/* Query echo skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-800/60 rounded" />
        <div className="h-8 w-full bg-slate-950/60 rounded-lg border border-slate-800" />
      </div>

      {/* Answer skeleton */}
      <div className="space-y-2.5">
        <div className="h-3 w-36 bg-slate-800/60 rounded" />
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="h-4 w-full bg-slate-800/80 rounded" />
          <div className="h-4 w-5/6 bg-slate-800/80 rounded" />
          <div className="h-4 w-4/6 bg-slate-800/80 rounded" />
        </div>
      </div>

      {/* Verification details skeleton */}
      <div className="space-y-2 pt-2">
        <div className="h-3 w-40 bg-slate-800/60 rounded" />
        <div className="h-14 w-full bg-slate-950/40 rounded-xl border border-slate-800/80" />
      </div>
    </div>
  );
};

