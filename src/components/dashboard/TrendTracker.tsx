"use client";

import { Card } from "@/components/ui/Card";
import { Badge, PlatformBadge } from "@/components/ui/Badge";
import type { TrendingItem } from "@/types";

interface TrendTrackerProps {
  trends: TrendingItem[];
}

function SaturationMeter({ value }: { value: number }) {
  const freshness = 1 - value;
  const color = freshness > 0.7 ? "#10B981" : freshness > 0.4 ? "#F59E0B" : "#E31E24";
  const label = freshness > 0.7 ? "Fresh 🟢" : freshness > 0.4 ? "Growing 🟡" : "Saturated 🔴";

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-brand-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${freshness * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs whitespace-nowrap" style={{ color }}>{label}</span>
    </div>
  );
}

export function TrendTracker({ trends }: TrendTrackerProps) {
  const byType: Record<string, TrendingItem[]> = {};
  for (const t of trends) {
    if (!byType[t.itemType]) byType[t.itemType] = [];
    byType[t.itemType].push(t);
  }

  const typeEmoji: Record<string, string> = {
    AUDIO: "🎵",
    HASHTAG: "#",
    FORMAT: "🎬",
    HOOK: "🎣",
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Trend Tracker</h3>
      <div className="space-y-4">
        {Object.entries(byType).map(([type, items]) => (
          <div key={type}>
            <h4 className="text-xs text-brand-gray-400 uppercase tracking-wider mb-2">
              {typeEmoji[type] ?? "•"} {type}
            </h4>
            <div className="space-y-2">
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <PlatformBadge platform={item.platform} />
                  <span className="text-brand-gray-200 flex-1 truncate text-xs">
                    {item.value}
                  </span>
                  <SaturationMeter value={item.saturation} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {trends.length === 0 && (
          <p className="text-xs text-brand-gray-400 text-center py-4">
            No trending data yet. Trends refresh daily.
          </p>
        )}
      </div>
    </Card>
  );
}
