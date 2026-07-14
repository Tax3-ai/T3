"use client";

import { Card, StatCard } from "@/components/ui/Card";
import type { ListAnalyticsSummary } from "@/types";

function fmtGbp(n: number): string {
  return `£${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const SEGMENT_COLORS: Record<string, string> = {
  "VIP Win-Back": "#F59E0B",
  "VIP Customers": "#8B5CF6",
  "Lapsed / Churned": "#6B7280",
  "At Risk": "#EF4444",
  "Repeat Customers": "#10B981",
  "New Customers": "#3B82F6",
};

export function ListAnalyticsPanel({ analytics }: { analytics: ListAnalyticsSummary }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="List Size" value={analytics.listSize} icon="👥" subtext="known customer emails" />
        <StatCard
          label="Repeat Purchase Rate"
          value={`${(analytics.repeatPurchaseRate * 100).toFixed(1)}%`}
          icon="🔁"
          subtext="2+ orders"
          accentColor={analytics.repeatPurchaseRate < 0.2 ? "#F59E0B" : undefined}
        />
        <StatCard label="Avg Order Value" value={fmtGbp(analytics.avgOrderValue)} icon="🛒" subtext="per order" />
        <StatCard label="Revenue / Customer" value={fmtGbp(analytics.estimatedLtv)} icon="💰" subtext="lifetime to date" />
      </div>

      <Card className="p-4">
        <h3 className="text-white font-semibold text-sm mb-3">List Segments</h3>
        {analytics.listSize === 0 ? (
          <p className="text-brand-gray-400 text-sm">
            No customer emails synced yet. Sync Shopify orders (with the <code className="text-brand-gray-300">read_customers</code> scope
            granted) from the Shopify page to populate segments.
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.segments
              .filter((s) => s.count > 0)
              .sort((a, b) => b.revenue - a.revenue)
              .map((s) => {
                const color = SEGMENT_COLORS[s.name] ?? "#888";
                const pct = analytics.listSize > 0 ? (s.count / analytics.listSize) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white font-medium">{s.name}</span>
                      <span className="text-brand-gray-400">
                        {s.count} · {fmtGbp(s.revenue)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-brand-gray-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-xs text-brand-gray-500">{s.description}</p>
                  </div>
                );
              })}
          </div>
        )}
      </Card>
    </div>
  );
}
