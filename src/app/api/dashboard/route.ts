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
      take: 10,
    }),
    prisma.post.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const topPerformer = recentPosts.sort((a, b) => {
    const aV = a.metrics[0]?.views ?? 0;
    const bV = b.metrics[0]?.views ?? 0;
    return bV - aV;
  })[0] ?? null;

  return NextResponse.json({
    stats: { ...stats, topPerformer },
    recentPosts: recentPosts.map((p) => ({
      ...p,
      hashtags: JSON.parse(p.hashtags ?? "[]"),
    })),
    pendingApproval: pendingPosts.map((p) => ({
      ...p,
      hashtags: JSON.parse(p.hashtags ?? "[]"),
    })),
  });
}
