import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeeklyReport } from "@/lib/claude";

export async function GET() {
  const reports = await prisma.strategyReport.findMany({
    orderBy: { weekStarting: "desc" },
    take: 10,
  });

  return NextResponse.json(
    reports.map((r) => ({
      ...r,
      topPosts: JSON.parse(r.topPosts),
      recommendations: JSON.parse(r.recommendations),
    }))
  );
}

export async function POST() {
  try {
    const reportText = await generateWeeklyReport();
    const data = JSON.parse(reportText);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const publishedThisWeek = await prisma.post.findMany({
      where: { publishedAt: { gte: oneWeekAgo }, status: "PUBLISHED" },
      include: { metrics: true },
      take: 20,
    });

    const topPosts = publishedThisWeek
      .sort((a, b) => {
        const aViews = Math.max(...(a.metrics.map((m) => m.views)), 0);
        const bViews = Math.max(...(b.metrics.map((m) => m.views)), 0);
        return bViews - aViews;
      })
      .slice(0, 5)
      .map((p) => p.id);

    const avgViews =
      publishedThisWeek.length > 0
        ? publishedThisWeek.reduce((s, p) => {
            const max = Math.max(...p.metrics.map((m) => m.views), 0);
            return s + max;
          }, 0) / publishedThisWeek.length
        : 0;

    const weekStarting = new Date();
    weekStarting.setDate(weekStarting.getDate() - 7);
    weekStarting.setHours(0, 0, 0, 0);

    const report = await prisma.strategyReport.create({
      data: {
        weekStarting,
        totalPosts: publishedThisWeek.length,
        avgViews,
        avgEngagement: 0,
        topPosts: JSON.stringify(topPosts),
        wins: data.wins ?? "",
        losses: data.losses ?? "",
        insights: data.insights ?? "",
        nextWeekPlan: data.nextWeekPlan ?? "",
        recommendations: JSON.stringify(data.recommendations ?? []),
      },
    });

    return NextResponse.json({
      ...report,
      topPosts: JSON.parse(report.topPosts),
      recommendations: JSON.parse(report.recommendations),
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
