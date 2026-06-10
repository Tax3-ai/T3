import { prisma } from "./prisma";
import { getPostInsights as getIGInsights } from "./instagram";
import { getVideoStats as getTTStats } from "./tiktok";

const CHECKPOINTS = [1, 6, 24, 72, 168]; // hours

export async function collectMetricsForPost(postId: string): Promise<void> {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || !post.platformPostId || !post.publishedAt) return;

  const publishedAt = new Date(post.publishedAt);
  const hoursLive = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);

  // Find next checkpoint to record
  const recorded = await prisma.postMetrics.findMany({ where: { postId } });
  const recordedCheckpoints = new Set(recorded.map((r) => r.checkpointHours));

  for (const checkpoint of CHECKPOINTS) {
    if (hoursLive >= checkpoint && !recordedCheckpoints.has(checkpoint)) {
      try {
        let stats = { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 };

        if (post.platform === "INSTAGRAM") {
          const ig = await getIGInsights(post.platformPostId);
          stats = {
            views: ig.views,
            likes: ig.likes,
            comments: ig.comments,
            shares: ig.shares,
            saves: ig.saves,
          };
        } else if (post.platform === "TIKTOK") {
          const tt = await getTTStats(post.platformPostId);
          stats = { ...tt, saves: 0 };
        }

        const engagementRate =
          stats.views > 0
            ? ((stats.likes + stats.comments + stats.shares + stats.saves) / stats.views) * 100
            : 0;

        await prisma.postMetrics.upsert({
          where: { postId_checkpointHours: { postId, checkpointHours: checkpoint } },
          create: {
            postId,
            checkpointHours: checkpoint,
            views: stats.views,
            likes: stats.likes,
            comments: stats.comments,
            shares: stats.shares,
            saves: stats.saves,
            engagementRate,
            recordedAt: new Date(),
          },
          update: {
            views: stats.views,
            likes: stats.likes,
            comments: stats.comments,
            shares: stats.shares,
            saves: stats.saves,
            engagementRate,
            recordedAt: new Date(),
          },
        });

        await updatePatternLibrary(post, stats, engagementRate);
      } catch {
        // silently skip if API not configured
      }
    }
  }
}

async function updatePatternLibrary(
  post: { hook?: string | null; audioTrack?: string | null; pillar: string; scheduledAt?: Date | null; platform: string },
  stats: { views: number; likes: number; engagementRate?: number },
  engagementRate: number
) {
  const updates: Array<{ pattern: string; category: string }> = [];

  if (post.hook) updates.push({ pattern: extractHookPattern(post.hook), category: "hook" });
  if (post.audioTrack) updates.push({ pattern: post.audioTrack, category: "audio" });
  if (post.scheduledAt) {
    const h = new Date(post.scheduledAt).getHours();
    updates.push({ pattern: `Post at ${h}:00 GMT`, category: "timing" });
  }
  updates.push({ pattern: `${post.platform} ${post.pillar}`, category: "format" });

  for (const upd of updates) {
    const existing = await prisma.patternEntry.findFirst({ where: { pattern: upd.pattern } });
    if (existing) {
      const newSampleSize = existing.sampleSize + 1;
      const newAvgViews = (existing.avgViews * existing.sampleSize + stats.views) / newSampleSize;
      const newAvgEngagement = (existing.avgEngagement * existing.sampleSize + engagementRate) / newSampleSize;
      const newScore = Math.min(10, (newAvgViews / 1000) * 2 + newAvgEngagement * 3);

      await prisma.patternEntry.update({
        where: { id: existing.id },
        data: {
          sampleSize: newSampleSize,
          avgViews: newAvgViews,
          avgLikes: (existing.avgLikes * existing.sampleSize + stats.likes) / newSampleSize,
          avgEngagement: newAvgEngagement,
          score: newScore,
        },
      });
    } else {
      const score = Math.min(10, (stats.views / 1000) * 2 + engagementRate * 3);
      await prisma.patternEntry.create({
        data: {
          pattern: upd.pattern,
          category: upd.category,
          avgViews: stats.views,
          avgLikes: stats.likes,
          avgEngagement: engagementRate,
          sampleSize: 1,
          score,
        },
      });
    }
  }
}

function extractHookPattern(hook: string): string {
  // Generalise hook into a pattern category
  const lower = hook.toLowerCase();
  if (lower.startsWith("pov:")) return "POV hook";
  if (lower.includes("?")) return "Question hook";
  if (lower.includes("never") || lower.includes("first")) return "Novelty hook";
  if (lower.includes("wait") || lower.includes("watch")) return "Curiosity hook";
  return "Statement hook";
}

// Sentinel checkpoint value for "live/current" metrics — always the highest,
// so dashboard queries (orderBy checkpointHours desc, take 1) pick this first.
const LIVE_CHECKPOINT = 99999;

/**
 * Refresh live metrics for every published post, regardless of age.
 * Upserts a LIVE_CHECKPOINT record so the dashboard always shows current numbers.
 * Called daily by /api/cron/refresh-metrics.
 */
export async function refreshLiveMetrics(): Promise<{ updated: number; errors: number }> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", platformPostId: { not: null } },
    select: { id: true, platform: true, platformPostId: true, permalink: true },
  });

  let updated = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      let stats: { views: number; likes: number; comments: number; shares: number; saves: number } | null = null;

      if (post.platform === "INSTAGRAM") {
        const ig = await getIGInsights(post.platformPostId!);
        stats = { views: ig.views, likes: ig.likes, comments: ig.comments, shares: ig.shares, saves: ig.saves };
      } else if (post.platform === "TIKTOK") {
        // Try official TikTok API first, fall back to tikwm scraper
        try {
          const tt = await getTTStats(post.platformPostId!);
          stats = { views: tt.views, likes: tt.likes, comments: tt.comments, shares: tt.shares, saves: 0 };
        } catch {
          // Fallback: re-scrape via tikwm using stored permalink/URL
          const videoUrl = post.permalink;
          if (videoUrl) {
            const tikwmRes = await fetch(
              `https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`,
              { headers: { "User-Agent": "Mozilla/5.0" } }
            );
            if (tikwmRes.ok) {
              const tikwm = await tikwmRes.json() as { code: number; data?: { play_count?: number; digg_count?: number; comment_count?: number; share_count?: number; collect_count?: number } };
              if (tikwm.code === 0 && tikwm.data) {
                const d = tikwm.data;
                stats = {
                  views: d.play_count ?? 0,
                  likes: d.digg_count ?? 0,
                  comments: d.comment_count ?? 0,
                  shares: d.share_count ?? 0,
                  saves: d.collect_count ?? 0,
                };
              }
            }
          }
        }
      }

      if (!stats) continue;

      const engagementRate =
        stats.views > 0
          ? ((stats.likes + stats.comments + stats.shares + stats.saves) / stats.views) * 100
          : 0;

      await prisma.postMetrics.upsert({
        where: { postId_checkpointHours: { postId: post.id, checkpointHours: LIVE_CHECKPOINT } },
        create: {
          postId: post.id,
          checkpointHours: LIVE_CHECKPOINT,
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments,
          shares: stats.shares,
          saves: stats.saves,
          engagementRate,
          recordedAt: new Date(),
        },
        update: {
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments,
          shares: stats.shares,
          saves: stats.saves,
          engagementRate,
          recordedAt: new Date(),
        },
      });

      updated++;
    } catch {
      errors++;
    }
  }

  return { updated, errors };
}

export async function collectAllDueMetrics(): Promise<void> {
  const publishedPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED", platformPostId: { not: null } },
    select: { id: true, publishedAt: true },
  });

  for (const post of publishedPosts) {
    if (!post.publishedAt) continue;
    const hoursLive = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60);
    const maxCheckpoint = Math.max(...CHECKPOINTS.filter((c) => c <= hoursLive));
    if (maxCheckpoint > 0) {
      await collectMetricsForPost(post.id);
    }
  }
}

export async function getDashboardStats() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalPosts, pendingApproval, scheduled, publishedThisWeek, recentMetrics] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { approvalStatus: "PENDING" } }),
      prisma.post.count({ where: { status: "SCHEDULED" } }),
      prisma.post.count({ where: { publishedAt: { gte: oneWeekAgo } } }),
      prisma.postMetrics.findMany({
        where: { post: { publishedAt: { gte: oneWeekAgo } }, checkpointHours: { gte: 24 } },
      }),
    ]);

  const avgViews7d =
    recentMetrics.length > 0
      ? recentMetrics.reduce((s, m) => s + m.views, 0) / recentMetrics.length
      : 0;

  const avgEngagement7d =
    recentMetrics.length > 0
      ? recentMetrics.reduce((s, m) => s + (m.engagementRate ?? 0), 0) / recentMetrics.length
      : 0;

  return {
    totalPosts,
    pendingApproval,
    scheduledPosts: scheduled,
    publishedThisWeek,
    avgViews7d: Math.round(avgViews7d),
    avgEngagement7d: parseFloat(avgEngagement7d.toFixed(2)),
    followerGrowth7d: 0, // populated when API is connected
  };
}
