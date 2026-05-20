import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [stats, recentPosts, pendingPosts] = await Promise.all([
    getDashboardStats(),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: { metrics: { orderBy: { checkpointHours: "desc" }, take: 1 } },
      orderBy: { publishedAt: "desc" },
      take: 25,
    }),
    prisma.post.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Use spread to avoid mutating the date-sorted recentPosts array
  const topPerformer = [...recentPosts].sort((a, b) => {
    const aV = a.metrics[0]?.views ?? 0;
    const bV = b.metrics[0]?.views ?? 0;
    return bV - aV;
  })[0] ?? null;

  const parsePost = (p: typeof recentPosts[0]) => ({
    ...p,
    hashtags: JSON.parse(p.hashtags ?? "[]"),
    mediaUrls: p.mediaUrls ? JSON.parse(p.mediaUrls) : null,
  });

  return NextResponse.json({
    stats: { ...stats, topPerformer: topPerformer ? parsePost(topPerformer) : null },
    recentPosts: recentPosts.map(parsePost),
    pendingApproval: pendingPosts.map((p) => ({
      ...p,
      hashtags: JSON.parse(p.hashtags ?? "[]"),
      mediaUrls: p.mediaUrls ? JSON.parse(p.mediaUrls) : null,
    })),
  });
}
