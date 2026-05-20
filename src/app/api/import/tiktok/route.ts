import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface TikWMData {
  title?: string;
  cover?: string;
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
  collect_count?: number;
  create_time?: number;
  author?: { unique_id?: string };
}

interface TikWMResponse {
  code: number;
  data?: TikWMData;
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
    const { url } = body;

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

    // Fetch stats + metadata from tikwm
    let title = "";
    let thumbnailUrl: string | null = null;
    let authorName: string | null = extractUsername(url);
    let views = body.views ?? 0;
    let likes = body.likes ?? 0;
    let comments = body.comments ?? 0;
    let shares = body.shares ?? 0;
    let saves = body.saves ?? 0;
    let publishedAt = body.publishedAt;

    try {
      const tikwmRes = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (tikwmRes.ok) {
        const tikwm: TikWMResponse = await tikwmRes.json();
        if (tikwm.code === 0 && tikwm.data) {
          const d = tikwm.data;
          title = d.title ?? "";
          thumbnailUrl = d.cover ?? null;
          authorName = d.author?.unique_id ?? authorName;
          views = d.play_count ?? views;
          likes = d.digg_count ?? likes;
          comments = d.comment_count ?? comments;
          shares = d.share_count ?? shares;
          saves = d.collect_count ?? saves;
          if (d.create_time) publishedAt = new Date(d.create_time * 1000).toISOString();
        }
      }
    } catch {
      // tikwm failed — fall back to manual values
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
