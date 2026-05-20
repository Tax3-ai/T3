"use client";

import { useEffect, useState, useCallback } from "react";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { ViewsChart, EngagementChart } from "@/components/dashboard/MetricsChart";
import { TrendTracker } from "@/components/dashboard/TrendTracker";
import { SuggestionsPanel } from "@/components/dashboard/SuggestionsPanel";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/Button";
import type { Post, TrendingItem, ContentSuggestion, DashboardStats } from "@/types";

interface DashboardData {
  stats: DashboardStats & { topPerformer?: Post };
  recentPosts: Post[];
  pendingApproval: Post[];
}

interface TikTokForm {
  url: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  publishedAt: string;
}

const EMPTY_TIKTOK_FORM: TikTokForm = { url: "", views: "0", likes: "0", comments: "0", shares: "0", publishedAt: "" };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [tikTokForm, setTikTokForm] = useState<TikTokForm>(EMPTY_TIKTOK_FORM);
  const [tikTokImporting, setTikTokImporting] = useState(false);
  const [tikTokMsg, setTikTokMsg] = useState<string | null>(null);
  const [trends, setTrends] = useState<TrendingItem[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [patterns, setPatterns] = useState<Array<{id:string;pattern:string;category:string;avgViews:number;avgEngagement:number;sampleSize:number;score:number;notes?:string|null}>>([]);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<Array<{ date: string; views: number; likes: number; engagement: number }>>([]);

  const load = useCallback(async () => {
    const [dashRes, trendsRes, sugRes, analyticsRes, recsRes] = await Promise.all([
      fetch("/api/dashboard"),
      fetch("/api/trends"),
      fetch("/api/suggestions"),
      fetch("/api/analytics"),
      fetch("/api/recommendations"),
    ]);
    const [dash, trendData, sugData, analyticsData, recsData] = await Promise.all([
      dashRes.json(),
      trendsRes.json(),
      sugRes.json(),
      analyticsRes.json(),
      recsRes.json(),
    ]);
    setData(dash);
    setTrends(trendData);
    setSuggestions(sugData);
    setPatterns(Array.isArray(recsData) ? recsData : []);
    // Build score map: postId -> score
    if (analyticsData?.scoredPosts) {
      const map: Record<string, number> = {};
      for (const p of analyticsData.scoredPosts) {
        if (p.score !== null) map[p.id] = p.score;
      }
      setScoreMap(map);
    }

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

  async function importTikTokPost() {
    setTikTokImporting(true);
    setTikTokMsg(null);
    try {
      const res = await fetch("/api/import/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: tikTokForm.url,
          views: parseInt(tikTokForm.views) || 0,
          likes: parseInt(tikTokForm.likes) || 0,
          comments: parseInt(tikTokForm.comments) || 0,
          shares: parseInt(tikTokForm.shares) || 0,
          publishedAt: tikTokForm.publishedAt || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTikTokMsg(`✅ Imported: ${data.title || tikTokForm.url}`);
        setTikTokForm(EMPTY_TIKTOK_FORM);
        await load();
      } else {
        setTikTokMsg(`❌ ${data.error}`);
      }
    } catch {
      setTikTokMsg("❌ Import failed — check the URL and try again.");
    } finally {
      setTikTokImporting(false);
    }
  }

  async function importFromInstagram() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/import/instagram", { method: "POST" });
      const data = await res.json();
      alert(`Import complete! ${data.imported} posts imported, ${data.skipped} already existed.`);
      await load();
    } catch {
      alert("Import failed — check console for details.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateBatch() {
    setIsGenerating(true);
    try {
      await fetch("/api/generate/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: "morning" }),
      });
      await load();
    } finally {
      setIsGenerating(false);
    }
  }

  async function seedTrends() {
    setIsSeeding(true);
    try {
      await fetch("/api/trends/seed", { method: "POST" });
      const res = await fetch("/api/trends");
      setTrends(await res.json());
    } finally {
      setIsSeeding(false);
    }
  }

  async function refreshRecommendations() {
    setIsRefreshingRecs(true);
    try {
      await fetch("/api/recommendations", { method: "POST" });
      const res = await fetch("/api/recommendations");
      const data = await res.json();
      setPatterns(Array.isArray(data) ? data : []);
    } finally {
      setIsRefreshingRecs(false);
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
            variant="secondary"
            size="sm"
            onClick={() => { setShowTikTokModal(true); setTikTokMsg(null); }}
          >
            ↓ Import TikTok
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={importFromInstagram}
            loading={isGenerating}
          >
            ↓ Import from Instagram
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

      {/* TikTok Import Modal */}
      {showTikTokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">🎵 Import TikTok Post</h2>
              <button onClick={() => setShowTikTokModal(false)} className="text-brand-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <p className="text-brand-gray-400 text-xs">Works for both <strong className="text-white">@tax3official</strong> and <strong className="text-white">@tax3.files</strong>. Paste the full TikTok video URL.</p>
            <div className="space-y-3">
              <div>
                <label className="text-brand-gray-400 text-xs mb-1 block">TikTok Video URL *</label>
                <input
                  type="url"
                  placeholder="https://www.tiktok.com/@tax3official/video/..."
                  value={tikTokForm.url}
                  onChange={e => setTikTokForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-brand-gray-600 focus:outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <label className="text-brand-gray-400 text-xs mb-1 block">Date Posted (optional)</label>
                <input
                  type="date"
                  value={tikTokForm.publishedAt}
                  onChange={e => setTikTokForm(f => ({ ...f, publishedAt: e.target.value }))}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["views", "likes", "comments", "shares"] as const).map(field => (
                  <div key={field}>
                    <label className="text-brand-gray-400 text-xs mb-1 block capitalize">{field}</label>
                    <input
                      type="number"
                      min="0"
                      value={tikTokForm[field]}
                      onChange={e => setTikTokForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full bg-brand-gray-800 border border-brand-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-red"
                    />
                  </div>
                ))}
              </div>
            </div>
            {tikTokMsg && (
              <p className={`text-sm px-3 py-2 rounded-lg ${
                tikTokMsg.startsWith("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}>{tikTokMsg}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowTikTokModal(false)}
                className="flex-1 bg-brand-gray-800 hover:bg-brand-gray-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={importTikTokPost}
                disabled={!tikTokForm.url || tikTokImporting}
                className="flex-1 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                {tikTokImporting ? "Importing..." : "Import Post"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            data.recentPosts.map((post) => (
              <PostCard key={post.id} post={{ ...post, performanceScore: scoreMap[post.id] ?? null }} compact />
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
          <TrendTracker trends={trends} onSeed={seedTrends} isSeeding={isSeeding} />
          <RecommendationsPanel
            patterns={patterns}
            onRefresh={refreshRecommendations}
            isRefreshing={isRefreshingRecs}
          />
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
