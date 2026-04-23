"use client";

import { StatCard } from "@/components/ui/Card";

interface StatsRowProps {
  stats: {
    totalPosts: number;
    pendingApproval: number;
    scheduledPosts: number;
    publishedThisWeek: number;
    avgViews7d: number;
    avgEngagement7d: number;
    followerGrowth7d: number;
  };
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Pending Approval"
        value={stats.pendingApproval}
        icon="⏳"
        subtext="needs your review"
        accentColor={stats.pendingApproval > 0 ? "#F59E0B" : undefined}
      />
      <StatCard
        label="Scheduled"
        value={stats.scheduledPosts}
        icon="📅"
        subtext="upcoming posts"
      />
      <StatCard
        label="Avg Views (7d)"
        value={fmtNum(stats.avgViews7d)}
        icon="👁"
        subtext="per published post"
      />
      <StatCard
        label="Engagement (7d)"
        value={`${stats.avgEngagement7d.toFixed(1)}%`}
        icon="❤️"
        subtext="avg rate"
      />
      <StatCard
        label="Published This Week"
        value={stats.publishedThisWeek}
        icon="🚀"
        subtext={`of target 42`}
      />
      <StatCard
        label="Total Posts"
        value={stats.totalPosts}
        icon="📝"
        subtext="all time"
      />
      <StatCard
        label="Follower Growth"
        value={stats.followerGrowth7d > 0 ? `+${stats.followerGrowth7d}` : "—"}
        icon="👥"
        subtext="this week"
        accentColor={stats.followerGrowth7d > 0 ? "#10B981" : undefined}
      />
      <StatCard
        label="Target (90d)"
        value="£40K"
        icon="🎯"
        subtext="revenue goal"
        accentColor="#E31E24"
      />
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
