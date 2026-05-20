"use client";

import { useState } from "react";
import type { Diagnosis } from "@/types/diagnosis";

interface Props {
  diagnosis: Diagnosis | null;
  onRun: () => void;
  isRunning: boolean;
}

const SEVERITY_COLOR = {
  high: "text-red-400 bg-red-500/10 border-red-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const SEVERITY_LABEL = { high: "🔴 High", medium: "🟡 Medium", low: "🔵 Low" };

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 7 ? "#22c55e" : score >= 4 ? "#f59e0b" : "#ef4444";
  const pct = (score / 10) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-brand-gray-800 rounded-full h-2.5">
        <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-lg font-black" style={{ color }}>{score}/10</span>
    </div>
  );
}

export function PerformanceDiagnosis({ diagnosis, onRun, isRunning }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧠</span>
          <div>
            <h2 className="text-white font-bold text-sm">Performance Diagnosis</h2>
            {diagnosis?.generatedAt && (
              <p className="text-brand-gray-500 text-xs">
                Last run: {new Date(diagnosis.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {isRunning ? "⏳ Analysing..." : diagnosis ? "🔄 Re-run" : "▶ Run Diagnosis"}
          </button>
          {diagnosis && (
            <button onClick={() => setExpanded(!expanded)} className="text-brand-gray-400 hover:text-white text-sm px-2">
              {expanded ? "▲" : "▼"}
            </button>
          )}
        </div>
      </div>

      {!diagnosis && !isRunning && (
        <div className="px-5 py-10 text-center space-y-3">
          <p className="text-4xl">📊</p>
          <p className="text-white font-semibold text-sm">No diagnosis yet</p>
          <p className="text-brand-gray-400 text-xs max-w-xs mx-auto">
            Hit &quot;Run Diagnosis&quot; to get a data-driven breakdown of why your content is performing the way it is — and a concrete plan to fix it.
          </p>
        </div>
      )}

      {isRunning && (
        <div className="px-5 py-10 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-brand-gray-400 text-sm">Analysing your posts...</p>
        </div>
      )}

      {diagnosis && expanded && (
        <div className="divide-y divide-brand-gray-700/50">

          {/* Score + Headline */}
          <div className="px-5 py-4 space-y-3">
            <ScoreMeter score={diagnosis.overallScore} />
            <p className="text-white font-bold text-sm leading-snug">{diagnosis.headline}</p>
            <p className="text-brand-gray-400 text-xs leading-relaxed">{diagnosis.summary}</p>
          </div>

          {/* Quick Wins */}
          {diagnosis.quickWins?.length > 0 && (
            <div className="px-5 py-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">⚡ Quick Wins — Do These Now</h3>
              <div className="space-y-2">
                {diagnosis.quickWins.map((win, i) => (
                  <div key={i} className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <span className="text-emerald-400 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-emerald-300 text-xs leading-relaxed">{win}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {diagnosis.issues?.length > 0 && (
            <div className="px-5 py-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">🔍 What&apos;s Going Wrong</h3>
              <div className="space-y-3">
                {diagnosis.issues.map((issue, i) => (
                  <div key={i} className={`rounded-lg px-3 py-3 border ${SEVERITY_COLOR[issue.severity]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{issue.issue}</span>
                      <span className="text-xs">{SEVERITY_LABEL[issue.severity]}</span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{issue.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {diagnosis.actionPlan?.length > 0 && (
            <div className="px-5 py-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">📅 3-Week Action Plan</h3>
              <div className="flex gap-1 mb-4">
                {diagnosis.actionPlan.map((w) => (
                  <button
                    key={w.week}
                    onClick={() => setActiveWeek(w.week)}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                      activeWeek === w.week
                        ? "bg-brand-red text-white"
                        : "bg-brand-gray-800 text-brand-gray-400 hover:text-white"
                    }`}
                  >
                    Week {w.week}
                  </button>
                ))}
              </div>
              {diagnosis.actionPlan.filter((w) => w.week === activeWeek).map((w) => (
                <div key={w.week} className="space-y-2">
                  <p className="text-white text-xs font-semibold mb-2">🎯 {w.focus}</p>
                  {w.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 bg-brand-gray-800 rounded-lg px-3 py-2">
                      <span className="text-brand-red text-xs font-bold shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-brand-gray-300 text-xs leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
