import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  // Return cached recommendations (generated via POST)
  const cached = await prisma.patternEntry.findMany({
    where: { isActive: true },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(cached);
}

export async function POST() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { metrics: { orderBy: { checkpointHours: "desc" }, take: 1 } },
    orderBy: { publishedAt: "desc" },
  });

  if (posts.length < 3) {
    return NextResponse.json({ error: "Need at least 3 published posts to generate recommendations" }, { status: 400 });
  }

  // Build performance summary grouped by pillar and contentType
  const byPillar: Record<string, { views: number[]; engagement: number[]; saves: number[]; count: number }> = {};
  const byType: Record<string, { views: number[]; engagement: number[]; saves: number[]; count: number }> = {};
  const topPosts: { caption: string; pillar: string; contentType: string; views: number; saves: number; engagement: number }[] = [];
  const bottomPosts: typeof topPosts = [];

  for (const p of posts) {
    const m = p.metrics[0];
    if (!m) continue;

    const views = m.views ?? 0;
    const eng = m.engagementRate ?? 0;
    const saves = m.saves ?? 0;

    if (!byPillar[p.pillar]) byPillar[p.pillar] = { views: [], engagement: [], saves: [], count: 0 };
    byPillar[p.pillar].views.push(views);
    byPillar[p.pillar].engagement.push(eng);
    byPillar[p.pillar].saves.push(saves);
    byPillar[p.pillar].count++;

    const ct = p.contentType;
    if (!byType[ct]) byType[ct] = { views: [], engagement: [], saves: [], count: 0 };
    byType[ct].views.push(views);
    byType[ct].engagement.push(eng);
    byType[ct].saves.push(saves);
    byType[ct].count++;

    topPosts.push({ caption: p.caption?.slice(0, 100) ?? "", pillar: p.pillar, contentType: p.contentType, views, saves, engagement: eng });
  }

  topPosts.sort((a, b) => b.views - a.views);
  bottomPosts.push(...topPosts.splice(Math.floor(topPosts.length * 0.7)));

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const pillarSummary = Object.entries(byPillar).map(([pillar, d]) => ({
    pillar,
    count: d.count,
    avgViews: avg(d.views),
    avgEngagement: Math.round(avg(d.engagement) * 100) / 100,
    avgSaves: avg(d.saves),
  })).sort((a, b) => b.avgViews - a.avgViews);

  const typeSummary = Object.entries(byType).map(([type, d]) => ({
    type,
    count: d.count,
    avgViews: avg(d.views),
    avgEngagement: Math.round(avg(d.engagement) * 100) / 100,
    avgSaves: avg(d.saves),
  })).sort((a, b) => b.avgViews - a.avgViews);

  const prompt = `You are a social media strategist analysing performance data for Tax3, a London 90s streetwear brand targeting 17–26 year olds.

PILLAR PERFORMANCE (sorted best to worst by views):
${JSON.stringify(pillarSummary, null, 2)}

CONTENT TYPE PERFORMANCE:
${JSON.stringify(typeSummary, null, 2)}

TOP 5 POSTS:
${JSON.stringify(topPosts.slice(0, 5), null, 2)}

BOTTOM 5 POSTS (lowest performing):
${JSON.stringify(bottomPosts.slice(-5), null, 2)}

Based on this real data, generate a JSON array of 8–10 pattern entries:
[
  {
    "pattern": "Clear, specific insight about what works or what to avoid (e.g. 'Lifestyle reels with model in fit from frame 1')",
    "category": "one of: pillar | format | hook | timing | hashtag | style | avoid",
    "avgViews": <number from real data>,
    "avgLikes": <number>,
    "avgEngagement": <float>,
    "sampleSize": <how many posts this is based on>,
    "score": <float 0-10, where >6 = do more, <4 = avoid>,
    "notes": "Actionable advice in Tax3's voice — short and direct"
  }
]

Rules:
- Use ONLY the real data provided, don't make up numbers
- Include both positive (what to do more) and negative (what to avoid) patterns
- category "avoid" = patterns that underperform, score should be 1–3
- Be specific and actionable, not generic
- Notes should read like advice from a streetwear-savvy strategist, not a corporate consultant`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "You are a data-driven social media strategist. Return valid JSON array only.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const patterns = JSON.parse(cleaned);

  // Clear old patterns and insert new ones
  await prisma.patternEntry.updateMany({ where: { isActive: true }, data: { isActive: false } });
  await prisma.patternEntry.createMany({
    data: patterns.map((p: {
      pattern: string; category: string; avgViews: number; avgLikes: number;
      avgEngagement: number; sampleSize: number; score: number; notes?: string;
    }) => ({
      pattern: p.pattern,
      category: p.category,
      avgViews: p.avgViews ?? 0,
      avgLikes: p.avgLikes ?? 0,
      avgEngagement: p.avgEngagement ?? 0,
      sampleSize: p.sampleSize ?? 1,
      score: p.score ?? 5,
      notes: p.notes ?? null,
      isActive: true,
    })),
  });

  return NextResponse.json({ success: true, count: patterns.length });
}
