"use client";

import React from "react";
import { PRESET_SCENARIOS } from "@/data/scenarios";
import { PresetScenario } from "@/types";
import { HelpCircle, ChevronRight, HeartPulse, Building2, Flame } from "lucide-react";

interface SampleQueriesProps {
  onSelectScenario: (scenario: PresetScenario) => void;
  selectedId?: string;
  isProcessing: boolean;
}

export const SampleQueries: React.FC<SampleQueriesProps> = ({
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
      <div className="flex items-center space-x-2">
        <HelpCircle className="w-4 h-4 text-orange-400" aria-hidden="true" />
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          अक्सर पूछे जाने वाले सवाल (Common Questions)
        </h3>
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
              className={`p-4 rounded-xl border text-left transition-colors duration-150 flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                isSelected
                  ? "bg-orange-950/20 border-orange-500/50 ring-1 ring-orange-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center space-x-1 text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    <Icon className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                    <span>{scenario.category}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {scenario.language}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors leading-relaxed">
                  "{scenario.audioQueryText}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-orange-400">
                <span className="font-semibold">क्लिक करके जांचें</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
