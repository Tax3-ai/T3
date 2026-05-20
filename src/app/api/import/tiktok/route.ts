import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface OEmbedResponse {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
}

function extractVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

function extractUsername(url: string): string | null {
  const match = url.match(/@([\w.]+)/);
  return match ? match[1] : null;
}

function guessPillar(title: string): string {
  const c = (title ?? "").toLowerCase();
  if (c.includes("bts") || c.includes("behind") || c.includes("process") || c.includes("making")) return "behind_scenes";
  if (c.includes("campaign") || c.includes("drop") || c.includes("collection")) return "campaign";
  if (c.includes("event") || c.includes("pop") || c.includes("show")) return "events";
  if (c.includes("community") || c.includes("we") || c.includes("you")) return "community";
  return "lifestyle";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, views = 0, likes = 0, comments = 0, shares = 0, publishedAt } = body;

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Could not extract video ID from URL" }, { status: 400 });
    }

    // Check if already imported
    const existing = await prisma.post.findFirst({ where: { platformPostId: videoId } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Post already imported", postId: existing.id });
    }

    // Fetch oEmbed data from TikTok
    let title = "";
    let thumbnailUrl: string | null = null;
    let authorName: string | null = extractUsername(url);

    try {
      const oembedRes = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (oembedRes.ok) {
        const oembed: OEmbedResponse = await oembedRes.json();
        title = oembed.title ?? "";
        thumbnailUrl = oembed.thumbnail_url ?? null;
        authorName = oembed.author_name ?? authorName;
      }
    } catch {
      // oEmbed failed — continue with manual data
    }

    const hashtags = (title.match(/#\w+/g) ?? []).map((h) => h.toLowerCase());
    const cleanCaption = title.replace(/#\w+/g, "").trim();

    const post = await prisma.post.create({
      data: {
        platform: "TIKTOK",
        status: "PUBLISHED",
        contentType: "REEL",
        caption: cleanCaption || title || `TikTok video by @${authorName}`,
        hashtags: JSON.stringify(hashtags),
        pillar: guessPillar(title),
        thumbnailUrl,
        videoUrl: url,
        permalink: url,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        platformPostId: videoId,
        approvalStatus: "APPROVED",
        flaggedForReview: false,
      },
    });

    const engagementRate = views > 0
      ? ((likes + comments + shares) / views) * 100
      : 0;

    await prisma.postMetrics.create({
      data: {
        postId: post.id,
        checkpointHours: 24,
        views,
        likes,
        comments,
        shares,
        saves: 0,
        engagementRate,
        recordedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, postId: post.id, title, account: authorName });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
