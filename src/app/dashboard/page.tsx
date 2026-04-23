"use client";

import { useEffect, useState, useCallback } from "react";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { ViewsChart, EngagementChart } from "@/components/dashboard/MetricsChart";
import { TrendTracker } from "@/components/dashboard/TrendTracker";
import { SuggestionsPanel } from "@/components/dashboard/SuggestionsPanel";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/Button";
import type { Post, TrendingItem, ContentSuggestion, DashboardStats } from "@/types";

interface DashboardData {
  stats: DashboardStats & { topPerformer?: Post };
  recentPosts: Post[];
  pendingApproval: Post[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [trends, setTrends] = useState<TrendingItem[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);
  const [chartData, setChartData] = useState<Array<{ date: string; views: number; likes: number; engagement: number }>>([]);

  const load = useCallback(async () => {
    const [dashRes, trendsRes, sugRes] = await Promise.all([
      fetch("/api/dashboard"),
      fetch("/api/trends"),
      fetch("/api/suggestions"),
    ]);
    const [dash, trendData, sugData] = await Promise.all([
      dashRes.json(),
      trendsRes.json(),
      sugRes.json(),
    ]);
    setData(dash);
    setTrends(trendData);
    setSuggestions(sugData);

    // Build chart data from recent posts
    if (dash.recentPosts?.length > 0) {
      const byDate: Record<string, { views: number; likes: number; engagement: number; count: number }> = {};
      for (const post of dash.recentPosts) {
        if (!post.publishedAt) continue;
        const date = new Date(post.publishedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
        if (!byDate[date]) byDate[date] = { views: 0, likes: 0, engagement: 0, count: 0 };
        const m = post.metrics?.[0];
        if (m) {
          byDate[date].views += m.views;
          byDate[date].likes += m.likes;
          byDate[date].engagement += m.engagementRate ?? 0;
          byDate[date].count++;
        }
      }
      setChartData(
        Object.entries(byDate).map(([date, v]) => ({
          date,
          views: v.views,
          likes: v.likes,
          engagement: v.count > 0 ? parseFloat((v.engagement / v.count).toFixed(2)) : 0,
        }))
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generateBatch() {
    setIsGenerating(true);
    try {
      await fetch("/api/cron/daily?slot=morning", {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? "dev-cron-secret"}` },
      });
      await load();
    } finally {
      setIsGenerating(false);
    }
  }

  async function refreshSuggestions() {
    setIsRefreshingSuggestions(true);
    try {
      await fetch("/api/suggestions", { method: "POST" });
      const res = await fetch("/api/suggestions");
      setSuggestions(await res.json());
    } finally {
      setIsRefreshingSuggestions(false);
    }
  }

  async function handleSuggestion(id: string, status: "ACCEPTED" | "DISMISSED") {
    await fetch("/api/suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brand-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            TAX3 <span className="text-brand-red">AGENT</span>
          </h1>
          <p className="text-brand-gray-400 text-sm mt-0.5">
            Autonomous growth — 3 posts/day · Instagram & TikTok
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={load}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={generateBatch}
            loading={isGenerating}
          >
            Generate Posts
          </Button>
        </div>
      </div>

      {/* Pending approval alert */}
      {data.stats.pendingApproval > 0 && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <span className="text-2xl">⏳</span>
          <div className="flex-1">
            <p className="text-yellow-400 font-semibold text-sm">
              {data.stats.pendingApproval} post{data.stats.pendingApproval !== 1 ? "s" : ""} awaiting your approval
            </p>
            <p className="text-yellow-400/60 text-xs">Review before they can be scheduled and published.</p>
          </div>
          <a
            href="/approval"
            className="text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-500/40 rounded-lg px-3 py-1.5 transition-colors"
          >
            Review →
          </a>
        </div>
      )}

      {/* Stats */}
      <StatsRow stats={data.stats} />

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <ViewsChart data={chartData} />
          <EngagementChart data={chartData} />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent posts feed */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Posts</h2>
          {data.recentPosts.length > 0 ? (
            data.recentPosts.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} compact />
            ))
          ) : (
            <div className="text-center py-12 bg-brand-gray-900 rounded-xl border border-brand-gray-700">
              <span className="text-4xl block mb-3">🚀</span>
              <p className="text-brand-gray-400 text-sm">No posts yet.</p>
              <p className="text-brand-gray-600 text-xs mt-1">Click "Generate Posts" to start the agent.</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <TrendTracker trends={trends} />
          <SuggestionsPanel
            suggestions={suggestions}
            onAccept={(id) => handleSuggestion(id, "ACCEPTED")}
            onDismiss={(id) => handleSuggestion(id, "DISMISSED")}
            onRefresh={refreshSuggestions}
            isRefreshing={isRefreshingSuggestions}
          />
        </div>
      </div>

      {/* Top performer */}
      {data.stats.topPerformer && (
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            🏆 Top Performer
          </h2>
          <PostCard post={data.stats.topPerformer} />
        </div>
      )}
    </div>
  );
}
