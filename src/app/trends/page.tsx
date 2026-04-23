"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PlatformBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { TrendingItem, PatternEntry } from "@/types";

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendingItem[]>([]);
  const [patterns, setPatterns] = useState<PatternEntry[]>([]);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    Promise.all([
      fetch("/api/trends").then((r) => r.json()),
      fetch("/api/patterns").then((r) => r.json()),
    ]).then(([t, p]) => {
      setTrends(t);
      setPatterns(p);
    });
  }, []);

  const filtered = filter === "ALL" ? trends : trends.filter((t) => t.itemType === filter);

  const freshScore = (t: TrendingItem) => t.growthRate * (1 - t.saturation);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Trend Tracker</h1>
        <p className="text-brand-gray-400 text-sm mt-0.5">
          Trending sounds, hooks, formats and hashtags — refreshed daily.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "AUDIO", "HOOK", "FORMAT", "HASHTAG"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              filter === f
                ? "bg-brand-red text-white"
                : "bg-brand-gray-800 text-brand-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Trending items */}
      <div className="grid md:grid-cols-2 gap-3">
        {filtered
          .sort((a, b) => freshScore(b) - freshScore(a))
          .map((item) => (
            <TrendCard key={item.id} item={item} />
          ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-brand-gray-400">
          <span className="text-4xl block mb-3">📈</span>
          <p>No trends found. They refresh daily via cron.</p>
        </div>
      )}

      {/* Pattern Library */}
      {patterns.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Pattern Library — What's Working for Tax3
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {patterns.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrendCard({ item }: { item: TrendingItem }) {
  const freshness = 1 - item.saturation;
  const freshColor = freshness > 0.7 ? "#10B981" : freshness > 0.4 ? "#F59E0B" : "#E31E24";

  const typeEmoji: Record<string, string> = {
    AUDIO: "🎵",
    HASHTAG: "#️⃣",
    FORMAT: "🎬",
    HOOK: "🎣",
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeEmoji[item.itemType] ?? "•"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PlatformBadge platform={item.platform} />
            <Badge variant="gray">{item.itemType}</Badge>
            {item.category && (
              <Badge variant="default" className="capitalize">{item.category}</Badge>
            )}
          </div>
          <p className="text-white text-sm font-medium break-words">{item.value}</p>

          <div className="mt-2 flex items-center gap-3 text-xs text-brand-gray-400">
            <span>📈 Growth: {Math.round(item.growthRate * 100)}%</span>
            <span>•</span>
            <div className="flex items-center gap-1.5 flex-1">
              <span>Freshness:</span>
              <div className="flex-1 h-1.5 bg-brand-gray-700 rounded-full overflow-hidden max-w-20">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${freshness * 100}%`, backgroundColor: freshColor }}
                />
              </div>
              <span style={{ color: freshColor }}>
                {freshness > 0.7 ? "Fresh 🟢" : freshness > 0.4 ? "Growing 🟡" : "Saturated 🔴"}
              </span>
            </div>
          </div>

          {item.niches.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {item.niches.map((n) => (
                <span key={n} className="text-xs text-brand-gray-400 bg-brand-gray-800 px-1.5 py-0.5 rounded">
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function PatternCard({ pattern }: { pattern: PatternEntry }) {
  const scoreColor = pattern.score >= 7 ? "#10B981" : pattern.score >= 5 ? "#F59E0B" : "#E31E24";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Badge variant="default" className="capitalize mb-2">{pattern.category}</Badge>
          <p className="text-white text-sm">{pattern.pattern}</p>
          {pattern.notes && (
            <p className="text-brand-gray-400 text-xs mt-1">{pattern.notes}</p>
          )}
          <div className="mt-2 flex gap-3 text-xs text-brand-gray-400">
            <span>Avg views: {Math.round(pattern.avgViews).toLocaleString()}</span>
            <span>•</span>
            <span>Eng: {pattern.avgEngagement.toFixed(1)}%</span>
            <span>•</span>
            <span>{pattern.sampleSize} posts</span>
          </div>
        </div>
        <div className="text-center shrink-0">
          <div
            className="text-2xl font-black"
            style={{ color: scoreColor }}
          >
            {pattern.score.toFixed(1)}
          </div>
          <div className="text-[10px] text-brand-gray-400">/10</div>
        </div>
      </div>
    </Card>
  );
}
