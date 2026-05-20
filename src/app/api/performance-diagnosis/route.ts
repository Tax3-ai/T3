import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import type { Diagnosis } from "@/types/diagnosis";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  const cached = await prisma.settings.findUnique({ where: { key: "performance_diagnosis" } });
  if (!cached) return NextResponse.json(null);
  try {
    return NextResponse.json(JSON.parse(cached.value));
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { metrics: { orderBy: { checkpointHours: "desc" }, take: 1 } },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  if (posts.length < 2) {
    return NextResponse.json({ error: "Need at least 2 published posts to run a diagnosis" }, { status: 400 });
  }

  const postsWithMetrics = posts.filter((p) => p.metrics[0]);

  // Platform breakdown
  const byPlatform: Record<string, { views: number[]; likes: number[]; engagement: number[]; saves: number[]; count: number }> = {};
  const byPillar: Record<string, { views: number[]; count: number }> = {};
  const byHour: Record<number, number[]> = {};

  const postSummaries = postsWithMetrics.map((p) => {
    const m = p.metrics[0];
    const platform = p.platform;
    if (!byPlatform[platform]) byPlatform[platform] = { views: [], likes: [], engagement: [], saves: [], count: 0 };
    byPlatform[platform].views.push(m.views);
    byPlatform[platform].likes.push(m.likes);
    byPlatform[platform].engagement.push(m.engagementRate ?? 0);
    byPlatform[platform].saves.push(m.saves ?? 0);
    byPlatform[platform].count++;

    if (!byPillar[p.pillar]) byPillar[p.pillar] = { views: [], count: 0 };
    byPillar[p.pillar].views.push(m.views);
    byPillar[p.pillar].count++;

    if (p.publishedAt) {
      const hour = new Date(p.publishedAt).getUTCHours();
      if (!byHour[hour]) byHour[hour] = [];
      byHour[hour].push(m.views);
    }

    return {
      platform,
      pillar: p.pillar,
      contentType: p.contentType,
      caption: p.caption?.slice(0, 120) ?? "",
      views: m.views,
      likes: m.likes,
      comments: m.comments,
      shares: m.shares,
      saves: m.saves ?? 0,
      engagementRate: Math.round((m.engagementRate ?? 0) * 100) / 100,
      publishedAt: p.publishedAt?.toISOString().slice(0, 10),
    };
  });

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const round = (n: number) => Math.round(n * 10) / 10;

  const platformStats = Object.entries(byPlatform).map(([platform, d]) => ({
    platform,
    count: d.count,
    avgViews: Math.round(avg(d.views)),
    avgLikes: Math.round(avg(d.likes)),
    avgEngagement: round(avg(d.engagement)),
    avgSaves: Math.round(avg(d.saves)),
  }));

  const pillarStats = Object.entries(byPillar).map(([pillar, d]) => ({
    pillar,
    count: d.count,
    avgViews: Math.round(avg(d.views)),
  })).sort((a, b) => b.avgViews - a.avgViews);

  const bestHour = Object.entries(byHour)
    .map(([h, views]) => ({ hour: parseInt(h), avgViews: Math.round(avg(views)) }))
    .sort((a, b) => b.avgViews - a.avgViews)[0];

  const sorted = [...postSummaries].sort((a, b) => b.views - a.views);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  const overallAvgViews = Math.round(avg(postsWithMetrics.map(p => p.metrics[0].views)));
  const overallAvgEng = round(avg(postsWithMetrics.map(p => p.metrics[0].engagementRate ?? 0)));

  const prompt = `You are a brutally honest social media strategist analysing the performance of Tax3 — a London 90s streetwear brand (target: 17–26, aesthetic: cinematic 90s, red/white/black, UK/US audience).

OVERALL STATS:
- Total posts analysed: ${postsWithMetrics.length}
- Average views: ${overallAvgViews}
- Average engagement rate: ${overallAvgEng}%
- Best posting time: ${bestHour ? `${bestHour.hour}:00 UTC (${bestHour.avgViews} avg views)` : "not enough data"}

PLATFORM BREAKDOWN:
${JSON.stringify(platformStats, null, 2)}

CONTENT PILLAR BREAKDOWN:
${JSON.stringify(pillarStats, null, 2)}

TOP 5 POSTS:
${JSON.stringify(top5, null, 2)}

BOTTOM 5 POSTS:
${JSON.stringify(bottom5, null, 2)}

Your job: give a real, data-driven diagnosis of why this account isn't performing and a concrete plan to fix it.

Return ONLY valid JSON in this exact format:
{
  "headline": "One punchy sentence describing the main problem (e.g. 'Hooks aren't stopping the scroll — 80% of posts die in the first 3 seconds')",
  "overallScore": <number 1-10, be honest>,
  "summary": "2-3 sentences. Be direct. Tell them what the data actually says. Don't sugarcoat it.",
  "issues": [
    {
      "issue": "Short title (e.g. 'Low hook retention')",
      "detail": "1-2 sentences explaining what the data shows and why it's a problem",
      "severity": "high | medium | low"
    }
  ],
  "actionPlan": [
    {
      "week": 1,
      "focus": "Theme for this week",
      "actions": ["Specific action 1", "Specific action 2", "Specific action 3"]
    },
    {
      "week": 2,
      "focus": "Theme",
      "actions": ["...", "...", "..."]
    },
    {
      "week": 3,
      "focus": "Theme",
      "actions": ["...", "...", "..."]
    }
  ],
  "quickWins": ["Something you can do TODAY", "Something to change immediately", "Quick tweak with big impact"]
}

Rules:
- Be brutally honest — JB needs real feedback not empty praise
- Base everything on the actual numbers provided
- Quick wins should be actionable TODAY
- Action plan should be realistic for a small brand team
- Use streetwear-native language, not corporate speak
- 3-5 issues max`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: "You are a brutally honest social media strategist. Return valid JSON only, no markdown.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const diagnosis: Diagnosis = { ...JSON.parse(cleaned), generatedAt: new Date().toISOString() };

  await prisma.settings.upsert({
    where: { key: "performance_diagnosis" },
    create: { key: "performance_diagnosis", value: JSON.stringify(diagnosis) },
    update: { value: JSON.stringify(diagnosis) },
  });

  return NextResponse.json(diagnosis);
}
