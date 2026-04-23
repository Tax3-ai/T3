import Anthropic from "@anthropic-ai/sdk";
import { getBrandBibleAsPromptContext } from "./brand-bible";
import { prisma } from "./prisma";
import type { Platform, ContentPillar, GenerateContentRequest } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const POSTING_TIMES: Record<string, Record<Platform, string>> = {
  morning: { INSTAGRAM: "09:00", TIKTOK: "08:00" },
  midday: { INSTAGRAM: "13:00", TIKTOK: "12:30" },
  evening: { INSTAGRAM: "18:00", TIKTOK: "18:30" },
};

export async function generatePost(req: GenerateContentRequest) {
  const brandContext = await getBrandBibleAsPromptContext();

  // Get active trending items for context
  const trends = await prisma.trendingItem.findMany({
    where: {
      platform: req.platform,
      isActive: true,
      expiresAt: { gte: new Date() },
    },
    orderBy: { growthRate: "desc" },
    take: 10,
  });

  const trendContext =
    trends.length > 0
      ? `\nCURRENT TRENDING ON ${req.platform}:\n` +
        trends
          .map((t) => `- [${t.itemType}] ${t.value} (freshness: ${Math.round((1 - t.saturation) * 100)}%)`)
          .join("\n")
      : "";

  // Get top performing patterns
  const patterns = await prisma.patternEntry.findMany({
    where: { isActive: true },
    orderBy: { score: "desc" },
    take: 5,
  });

  const patternContext =
    patterns.length > 0
      ? `\nTOP PERFORMING PATTERNS FOR THIS BRAND:\n` +
        patterns.map((p) => `- [${p.category}] ${p.pattern} (score: ${p.score}/10)`).join("\n")
      : "";

  const pillarGuide: Record<ContentPillar, string> = {
    lifestyle:
      "Show the Tax3 lifestyle — events, travel, outfits, cultural moments. Aspirational but relatable.",
    behind_scenes:
      "Pull back the curtain — collection process, campaign prep, brand journey, real ups and downs.",
    campaign:
      "Drive sales — new drops, best sellers, product features. Make people NEED it.",
    community:
      "Brand values, customer love, what Tax3 stands for. Build the tribe.",
    events: "Pop-ups, activations, appearances. Build hype and FOMO.",
  };

  const prompt = `You are the social media strategist for Tax3, a premium London streetwear brand.

${brandContext}
${trendContext}
${patternContext}

Your task: Generate ONE optimised ${req.platform} post for the "${req.pillar}" content pillar.

PILLAR DIRECTION: ${pillarGuide[req.pillar]}
POSTING SLOT: ${req.slot} (${POSTING_TIMES[req.slot][req.platform]} GMT)
${req.instructions ? `EXTRA BRIEF: ${req.instructions}` : ""}

Return a JSON object with EXACTLY this structure:
{
  "hook": "The first 3 seconds / opening line (make it stop the scroll)",
  "caption": "Full caption with line breaks, personality, CTA. Use brand voice. 150-300 chars.",
  "hashtags": ["array", "of", "10-15", "hashtags", "no", "hash", "symbol"],
  "audioSuggestion": "Trending sound name or genre that fits (or null)",
  "visualNotes": "Director's brief: shot type, pacing, overlays, what to show",
  "contentType": "REEL or CAROUSEL",
  "predictedScore": 7.5,
  "reasoning": "Why this will work — tie to brand, audience, trending data",
  "flaggedForReview": false
}

Rules:
- Never use banned phrases: ${["gay", "shit", "bitch", "fuck off", "y fi dat", "broke"].join(", ")}
- Never reference: Trapstar, Fully Paid, gang violence, politics
- Always sound authentically Tax3 — cool, innovative, London
- Hashtags: mix of niche streetwear + broad reach
- flaggedForReview = true if you think this might underperform (explain in reasoning)`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system:
      "You are a viral social media strategist for a premium streetwear brand. Always respond with valid JSON only — no markdown, no explanation outside the JSON.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const data = JSON.parse(text);

  const scheduledAt = new Date();
  const [hours, minutes] = POSTING_TIMES[req.slot][req.platform].split(":").map(Number);
  scheduledAt.setHours(hours, minutes, 0, 0);
  if (scheduledAt < new Date()) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
  }

  const post = await prisma.post.create({
    data: {
      platform: req.platform,
      status: "PENDING_APPROVAL",
      contentType: data.contentType ?? "REEL",
      caption: data.caption,
      hashtags: JSON.stringify(data.hashtags),
      audioTrack: data.audioSuggestion ?? null,
      hook: data.hook,
      pillar: req.pillar,
      approvalStatus: "PENDING",
      aiReasoning: data.reasoning,
      predictedScore: data.predictedScore ?? null,
      flaggedForReview: data.flaggedForReview ?? false,
      scheduledAt,
    },
  });

  return post;
}

export async function generateWeeklyReport(): Promise<string> {
  const brandContext = await getBrandBibleAsPromptContext();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const posts = await prisma.post.findMany({
    where: { publishedAt: { gte: oneWeekAgo }, status: "PUBLISHED" },
    include: { metrics: true },
  });

  if (posts.length === 0) {
    return "No published posts this week yet.";
  }

  const postSummaries = posts.map((p) => {
    const latestMetrics = p.metrics.sort((a, b) => b.checkpointHours - a.checkpointHours)[0];
    return {
      platform: p.platform,
      pillar: p.pillar,
      hook: p.hook,
      views: latestMetrics?.views ?? 0,
      likes: latestMetrics?.likes ?? 0,
      engagement: latestMetrics?.engagementRate ?? 0,
      shares: latestMetrics?.shares ?? 0,
      saves: latestMetrics?.saves ?? 0,
    };
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system:
      "You are a strategic social media analyst for a premium streetwear brand. Write in a clear, direct, action-oriented style. Return valid JSON only.",
    messages: [
      {
        role: "user",
        content: `${brandContext}

This week's published posts performance data:
${JSON.stringify(postSummaries, null, 2)}

Generate a weekly strategy report as JSON:
{
  "wins": "What worked this week and why",
  "losses": "What underperformed and why",
  "insights": "Key patterns and learnings from the data",
  "nextWeekPlan": "Concrete direction for next week",
  "recommendations": ["5 specific action items for next week"]
}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "{}";
}

export async function generateSuggestions(count: number = 5) {
  const brandContext = await getBrandBibleAsPromptContext();

  const trends = await prisma.trendingItem.findMany({
    where: { isActive: true, expiresAt: { gte: new Date() } },
    orderBy: { growthRate: "desc" },
    take: 15,
  });

  const topPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { metrics: true },
    take: 5,
    orderBy: { publishedAt: "desc" },
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system:
      "You are a viral content strategist for a premium London streetwear brand. Return valid JSON only.",
    messages: [
      {
        role: "user",
        content: `${brandContext}

Current trends: ${JSON.stringify(trends.map((t) => ({ type: t.itemType, value: t.value, platform: t.platform })))}

Recent top posts: ${JSON.stringify(topPosts.map((p) => ({ platform: p.platform, pillar: p.pillar, hook: p.hook })))}

Generate ${count} content suggestions as a JSON array. Each suggestion:
{
  "platform": "INSTAGRAM or TIKTOK",
  "pillar": "lifestyle|behind_scenes|campaign|community|events",
  "hook": "Opening hook",
  "captionDraft": "Draft caption",
  "hashtags": ["5", "hashtags"],
  "audioSuggestion": "Sound suggestion or null",
  "visualNotes": "What to film/show",
  "reasoning": "Why this will work for Tax3 right now"
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  const suggestions = JSON.parse(text);

  await prisma.contentSuggestion.deleteMany({ where: { status: "PENDING" } });
  await prisma.contentSuggestion.createMany({
    data: suggestions.map((s: {
      platform: string;
      pillar: string;
      hook: string;
      captionDraft: string;
      hashtags: string[];
      audioSuggestion?: string;
      visualNotes: string;
      reasoning: string;
    }) => ({
      platform: s.platform,
      pillar: s.pillar,
      hook: s.hook,
      captionDraft: s.captionDraft,
      hashtags: JSON.stringify(s.hashtags),
      audioSuggestion: s.audioSuggestion ?? null,
      visualNotes: s.visualNotes,
      reasoning: s.reasoning,
    })),
  });

  return suggestions;
}
