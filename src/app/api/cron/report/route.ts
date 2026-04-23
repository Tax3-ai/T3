import { NextResponse } from "next/server";
import { generateWeeklyReport } from "@/lib/claude";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reportText = await generateWeeklyReport();
    const data = JSON.parse(reportText);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const publishedThisWeek = await prisma.post.findMany({
      where: { publishedAt: { gte: oneWeekAgo }, status: "PUBLISHED" },
      include: { metrics: true },
    });

    const weekStarting = new Date();
    weekStarting.setDate(weekStarting.getDate() - 7);
    weekStarting.setHours(0, 0, 0, 0);

    const topPosts = publishedThisWeek
      .sort((a, b) => {
        const aMax = Math.max(...a.metrics.map((m) => m.views), 0);
        const bMax = Math.max(...b.metrics.map((m) => m.views), 0);
        return bMax - aMax;
      })
      .slice(0, 5)
      .map((p) => p.id);

    await prisma.strategyReport.create({
      data: {
        weekStarting,
        totalPosts: publishedThisWeek.length,
        avgViews: 0,
        avgEngagement: 0,
        topPosts: JSON.stringify(topPosts),
        wins: data.wins ?? "",
        losses: data.losses ?? "",
        insights: data.insights ?? "",
        nextWeekPlan: data.nextWeekPlan ?? "",
        recommendations: JSON.stringify(data.recommendations ?? []),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Report failed" },
      { status: 500 }
    );
  }
}
