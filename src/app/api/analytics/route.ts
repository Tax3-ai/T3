import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

// Score a post 1–10 based on its metrics relative to account averages
function scorePost(
  views: number,
  likes: number,
  saves: number,
  shares: number,
  avgViews: number,
  avgEngagement: number
): number {
  if (views === 0 && likes === 0) return 0;

  const engagementRate = views > 0 ? ((likes + saves + shares) / views) * 100 : 0;
  const savesRate = views > 0 ? (saves / views) * 100 : 0;
  const viewsRatio = avgViews > 0 ? views / avgViews : 1;

  // Weighted components
  const viewScore = Math.min(viewsRatio * 3, 10); // 0–10, avg = 3
  const engScore = Math.min((engagementRate / Math.max(avgEngagement, 1)) * 3, 10); // relative to account avg
  const saveScore = Math.min(savesRate * 20, 10); // saves are high-intent, reward them
  const shareScore = Math.min((shares / Math.max(views, 1)) * 1000, 10);

  const raw = viewScore * 0.35 + engScore * 0.35 + saveScore * 0.2 + shareScore * 0.1;
  return Math.round(Math.min(Math.max(raw, 0.5), 10) * 10) / 10;
}

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { metrics: { orderBy: { checkpointHours: "desc" }, take: 1 } },
    orderBy: { publishedAt: "desc" },
  });

  if (posts.length === 0) {
    return NextResponse.json({ scoredPosts: [], averages: null });
  }

  const postsWithMetrics = posts.filter((p) => p.metrics.length > 0);

  // Calculate account averages
  const avgViews =
    postsWithMetrics.reduce((s, p) => s + (p.metrics[0]?.views ?? 0), 0) /
    Math.max(postsWithMetrics.length, 1);
  const avgEngagement =
    postsWithMetrics.reduce((s, p) => s + (p.metrics[0]?.engagementRate ?? 0), 0) /
    Math.max(postsWithMetrics.length, 1);
  const avgLikes =
    postsWithMetrics.reduce((s, p) => s + (p.metrics[0]?.likes ?? 0), 0) /
    Math.max(postsWithMetrics.length, 1);
  const avgSaves =
    postsWithMetrics.reduce((s, p) => s + (p.metrics[0]?.saves ?? 0), 0) /
    Math.max(postsWithMetrics.length, 1);

  // Score each post
  const scoredPosts = posts.map((p) => {
    const m = p.metrics[0];
    const score = m
      ? scorePost(m.views, m.likes, m.saves, m.shares, avgViews, avgEngagement)
      : null;
    return {
      id: p.id,
      pillar: p.pillar,
      contentType: p.contentType,
      publishedAt: p.publishedAt,
      thumbnailUrl: p.thumbnailUrl,
      permalink: p.permalink,
      caption: p.caption?.slice(0, 80),
      score,
      metrics: m
        ? {
            views: m.views,
            likes: m.likes,
            saves: m.saves,
            shares: m.shares,
            engagementRate: m.engagementRate,
          }
        : null,
    };
  });

  return NextResponse.json({
    scoredPosts,
    averages: {
      views: Math.round(avgViews),
      engagement: Math.round(avgEngagement * 100) / 100,
      likes: Math.round(avgLikes),
      saves: Math.round(avgSaves),
    },
    totalPosts: posts.length,
  });
}
