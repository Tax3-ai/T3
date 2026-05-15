import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  try {
  // Pull top performing posts for context
  const topPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { metrics: { orderBy: { checkpointHours: "desc" }, take: 1 } },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const topHashtags = topPosts
    .flatMap((p) => {
      try { return JSON.parse(p.hashtags ?? "[]"); } catch { return []; }
    })
    .reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {});

  const sortedHashtags = Object.entries(topHashtags)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 20)
    .map(([tag]) => tag);

  const prompt = `You are a social media trend analyst for the UK streetwear niche, specifically for a brand called Tax3 — a 90s-inspired streetwear label targeting 17–26 year olds in London and the US.

Tax3's most used hashtags: ${sortedHashtags.join(", ")}

Generate 15 trending items for Instagram and TikTok that are REAL and RELEVANT to:
- 90s streetwear / nostalgia aesthetic
- UK streetwear (London street culture)
- Shell suits, baggy graphic tees, retro fits
- Competitors/niche: Protect.ldn, Godmade, Mertra, Gone Club, Blancs
- Dance/music culture crossover (UK drill, afrobeats adjacent)
- Youth fashion 17–26

Return a JSON array:
[
  {
    "platform": "INSTAGRAM" or "TIKTOK",
    "itemType": "HASHTAG" or "AUDIO" or "FORMAT" or "HOOK",
    "value": "The actual hashtag (without #), sound name, format name, or hook pattern",
    "category": "streetwear | nostalgia | lifestyle | dance | music | fashion",
    "saturation": 0.0–1.0 (0=fresh/underused, 1=oversaturated),
    "growthRate": 0.0–5.0 (how fast it's growing, 5 = exploding),
    "usageCount": estimated posts using this,
    "niches": ["relevant", "niches"],
    "notes": "Why this is relevant for Tax3 right now"
  }
]

Mix of:
- 5 trending hashtags (Instagram + TikTok)
- 4 trending audio/sounds
- 3 trending formats (e.g. "slow-mo fit reveal", "GRWM", "outfit transition")
- 3 trending hooks (opening lines that are working in this niche)`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: "You are a UK streetwear social media trend analyst. Return valid JSON array only.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const trends = JSON.parse(cleaned);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Deactivate old trends
  await prisma.trendingItem.updateMany({ where: { isActive: true }, data: { isActive: false } });

  // Insert one at a time to avoid silent failures
  let saved = 0;
  for (const t of trends) {
    try {
      await prisma.trendingItem.create({
        data: {
          platform: (t.platform === "TIKTOK" ? "TIKTOK" : "INSTAGRAM") as string,
          itemType: (["HASHTAG","AUDIO","FORMAT","HOOK"].includes(t.itemType) ? t.itemType : "HASHTAG") as string,
          value: String(t.value ?? ""),
          category: t.category ? String(t.category) : null,
          saturation: Number(t.saturation ?? 0.5),
          growthRate: Number(t.growthRate ?? 1),
          usageCount: Number(t.usageCount ?? 0),
          niches: JSON.stringify(Array.isArray(t.niches) ? t.niches : []),
          exampleUrls: JSON.stringify([]),
          isActive: true,
          expiresAt,
        },
      });
      saved++;
    } catch (e) {
      console.error("Failed to insert trend:", t.value, e);
    }
  }

  return NextResponse.json({ success: true, count: saved });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
