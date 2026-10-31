"use client";

import React from "react";
import { PRESET_SCENARIOS } from "@/data/scenarios";
import { PresetScenario } from "@/types";
import { Play, AlertOctagon, HeartPulse, Building2, Flame } from "lucide-react";

interface PresetSelectorProps {
  onSelectScenario: (scenario: PresetScenario) => void;
  selectedId?: string;
  isProcessing: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectScenario,
  selectedId,
  isProcessing,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Government Welfare":
        return Building2;
      case "Health & Medicine":
        return HeartPulse;
      default:
        return Flame;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Instant Judge Demos (Zero-Lag Presets)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">
          Click any scenario to simulate live speech & hallucination catch
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_SCENARIOS.map((scenario) => {
          const Icon = getCategoryIcon(scenario.category);
          const isSelected = selectedId === scenario.id;

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              disabled={isProcessing}
              className={`p-4 rounded-xl border text-left transition-all duration-200 relative group flex flex-col justify-between ${
                isSelected
                  ? "bg-orange-950/30 border-orange-500/60 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    <Icon className="w-3 h-3" />
                    <span>{scenario.category}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {scenario.language}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                  {scenario.title}
                </h4>

                <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
                  "{scenario.audioQueryText}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-red-400/90 font-medium truncate max-w-[170px]" title={scenario.simulatedRisk}>
                  ⚠️ {scenario.simulatedRisk}
                </span>

                <div className="flex items-center space-x-1 text-xs text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Demo</span>
                  <Play className="w-3 h-3 fill-orange-400" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

