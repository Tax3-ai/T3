import { prisma } from "./prisma";
import { publishReel } from "./instagram";
import { publishVideo } from "./tiktok";

// Publish all posts that are approved + due
export async function publishScheduledPosts(): Promise<{
  published: string[];
  failed: string[];
}> {
  const now = new Date();
  const fiveMinuteWindow = new Date(now.getTime() + 5 * 60 * 1000);

  const due = await prisma.post.findMany({
    where: {
      status: "APPROVED",
      approvalStatus: { in: ["APPROVED", "AUTO_APPROVED"] },
      scheduledAt: { lte: fiveMinuteWindow },
    },
  });

  const published: string[] = [];
  const failed: string[] = [];

  for (const post of due) {
    try {
      if (!post.videoUrl && !post.mediaUrls) {
        // No media attached yet — flag for manual upload
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: "FAILED",
            approvalNotes: "No media URL attached. Upload video/image first.",
          },
        });
        failed.push(post.id);
        continue;
      }

      const hashtags: string[] = JSON.parse(post.hashtags ?? "[]");
      const fullCaption = `${post.caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`;
      let platformPostId: string | null = null;

      if (post.platform === "INSTAGRAM" && post.videoUrl) {
        platformPostId = await publishReel(post.videoUrl, fullCaption, post.thumbnailUrl ?? undefined);
      } else if (post.platform === "TIKTOK" && post.videoUrl) {
        platformPostId = await publishVideo(post.videoUrl, fullCaption);
      }

      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          platformPostId,
        },
      });

      published.push(post.id);
    } catch (err) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: "FAILED",
          approvalNotes: err instanceof Error ? err.message : "Unknown publish error",
        },
      });
      failed.push(post.id);
    }
  }

  return { published, failed };
}

// Calculate optimal posting times in GMT based on audience data
export function getOptimalPostingTimes(): Record<string, { instagram: Date; tiktok: Date }> {
  const today = new Date();
  const makeTime = (h: number, m: number) => {
    const d = new Date(today);
    d.setUTCHours(h, m, 0, 0);
    return d;
  };

  return {
    morning: {
      instagram: makeTime(9, 0),
      tiktok: makeTime(8, 0),
    },
    midday: {
      instagram: makeTime(13, 0),
      tiktok: makeTime(12, 30),
    },
    evening: {
      instagram: makeTime(18, 0),
      tiktok: makeTime(18, 30),
    },
  };
}

// Flag posts that are predicted to underperform
export async function flagUnderperformers(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const metrics = await prisma.postMetrics.findMany({
    where: {
      checkpointHours: 24,
      post: { publishedAt: { gte: thirtyDaysAgo } },
    },
  });

  if (metrics.length === 0) return 0;

  const avgViews = metrics.reduce((s, m) => s + m.views, 0) / metrics.length;

  // Flag pending posts that have a low predictedScore
  const pendingPosts = await prisma.post.findMany({
    where: { status: "PENDING_APPROVAL", predictedScore: { not: null } },
  });

  let flaggedCount = 0;
  for (const post of pendingPosts) {
    const predictedViews = (post.predictedScore ?? 5) * (avgViews / 7.5);
    if (predictedViews < avgViews * 0.5) {
      await prisma.post.update({
        where: { id: post.id },
        data: { flaggedForReview: true },
      });
      flaggedCount++;
    }
  }

  return flaggedCount;
}
