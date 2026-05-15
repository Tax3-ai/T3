"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PatternEntry {
  id: string;
  pattern: string;
  category: string;
  avgViews: number;
  avgEngagement: number;
  sampleSize: number;
  score: number;
  notes?: string | null;
}

interface RecommendationsPanelProps {
  patterns: PatternEntry[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

const CATEGORY_EMOJI: Record<string, string> = {
  pillar: "🎯",
  format: "🎬",
  hook: "🎣",
  timing: "🕐",
  hashtag: "#",
  style: "✨",
  avoid: "🚫",
};

export function RecommendationsPanel({ patterns, onRefresh, isRefreshing }: RecommendationsPanelProps) {
  const [tab, setTab] = useState<"do" | "avoid">("do");

  const doMore = patterns.filter((p) => p.category !== "avoid" && p.score >= 6).sort((a, b) => b.score - a.score);
  const avoid = patterns.filter((p) => p.category === "avoid" || p.score < 4).sort((a, b) => a.score - b.score);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Content Intelligence</h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={onRefresh}
          loading={isRefreshing}
        >
          {patterns.length === 0 ? "Analyse Posts" : "Refresh"}
        </Button>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-3xl">🧠</p>
          <p className="text-xs text-brand-gray-400">
            No analysis yet. Hit &quot;Analyse Posts&quot; to get recommendations based on your real post data.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-brand-gray-800 rounded-lg p-1">
            <button
              onClick={() => setTab("do")}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                tab === "do"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-brand-gray-400 hover:text-white"
              }`}
            >
              ✅ Do More ({doMore.length})
            </button>
            <button
              onClick={() => setTab("avoid")}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                tab === "avoid"
                  ? "bg-red-500/20 text-brand-red border border-red-500/30"
                  : "text-brand-gray-400 hover:text-white"
              }`}
            >
              🚫 Avoid ({avoid.length})
            </button>
          </div>

          <div className="space-y-3">
            {(tab === "do" ? doMore : avoid).map((p) => (
              <div
                key={p.id}
                className={`rounded-lg p-3 border ${
                  tab === "do"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-white leading-tight">
                    {CATEGORY_EMOJI[p.category] ?? "•"} {p.pattern}
                  </span>
                  <span
                    className={`text-xs font-bold shrink-0 ${
                      p.score >= 7 ? "text-emerald-400" : p.score >= 5 ? "text-yellow-400" : "text-red-400"
                    }`}
                  >
                    {p.score}/10
                  </span>
                </div>
                {p.notes && (
                  <p className="text-xs text-brand-gray-400 leading-relaxed">{p.notes}</p>
                )}
                {p.avgViews > 0 && (
                  <div className="flex gap-3 mt-2 text-xs text-brand-gray-500">
                    <span>👁 {fmtNum(p.avgViews)} avg views</span>
                    <span>📊 {p.avgEngagement.toFixed(1)}% eng</span>
                    <span>n={p.sampleSize}</span>
                  </div>
                )}
              </div>
            ))}
            {(tab === "do" ? doMore : avoid).length === 0 && (
              <p className="text-xs text-brand-gray-400 text-center py-3">
                {tab === "do" ? "No strong patterns found yet." : "No patterns to avoid — everything is performing!"}
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
