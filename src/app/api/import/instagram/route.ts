import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://graph.facebook.com/v21.0";
const IG_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;

interface IGMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
  like_count?: number;
  comments_count?: number;
  view_count?: number;
}

interface IGInsight {
  name: string;
  values?: Array<{ value: number }>;
  value?: number;
}

async function fetchAllMedia(): Promise<IGMedia[]> {
  const all: IGMedia[] = [];
  let url = `${BASE_URL}/${IG_ID}/media?fields=id,caption,media_type,timestamp,permalink,thumbnail_url,media_url,like_count,comments_count&limit=50&access_token=${TOKEN}`;

  while (url) {
    const res = await fetch(url);
    const data = await res.json() as { data: IGMedia[]; paging?: { next?: string } };
    if (!data.data) break;
    all.push(...data.data);
    url = data.paging?.next ?? "";
  }

  return all;
}

async function fetchInsights(mediaId: string, mediaType: string, fallback: { likes: number; comments: number }): Promise<{
  views: number; likes: number; comments: number; shares: number; saves: number; reach: number;
}> {
  // Try video metrics first for VIDEO, then fall back to image metrics
  const metricSets = ["views,likes,comments,shares,saved,reach", "reach,likes,comments,shares,saved,total_interactions"];

  for (const metrics of metricSets) {
    try {
      const res = await fetch(
        `${BASE_URL}/${mediaId}/insights?metric=${metrics}&access_token=${TOKEN}`
      );
      const data = await res.json() as { data: IGInsight[]; error?: { message: string } };
      if (data.error || !data.data) continue;

      const get = (name: string): number => {
        const item = data.data.find((d) => d.name === name);
        return item?.value ?? item?.values?.[0]?.value ?? 0;
      };

      return {
        views: get("views") || get("reach"),
        likes: get("likes") || fallback.likes,
        comments: get("comments") || fallback.comments,
        shares: get("shares"),
        saves: get("saved"),
        reach: get("reach"),
      };
    } catch {
      continue;
    }
  }

  // Final fallback: use like_count and comments_count from media fields
  return { views: 0, likes: fallback.likes, comments: fallback.comments, shares: 0, saves: 0, reach: 0 };
}

function mapContentType(mediaType: string): string {
  if (mediaType === "VIDEO") return "REEL";
  if (mediaType === "CAROUSEL_ALBUM") return "CAROUSEL";
  return "REEL"; // treat images as reels for now
}

function guessPillar(caption: string): string {
  const c = (caption ?? "").toLowerCase();
  if (c.includes("bts") || c.includes("behind") || c.includes("process") || c.includes("making")) return "behind_scenes";
  if (c.includes("campaign") || c.includes("drop") || c.includes("collection")) return "campaign";
  if (c.includes("event") || c.includes("pop") || c.includes("show")) return "events";
  if (c.includes("community") || c.includes("you") || c.includes("we")) return "community";
  return "lifestyle";
}

export async function POST() {
  try {
    const media = await fetchAllMedia();

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of media) {
      // Check if already imported
      const existing = await prisma.post.findFirst({
        where: { platformPostId: item.id },
      });
      if (existing) {
        // Backfill permalink + thumbnail if missing
        if (!existing.permalink || !existing.thumbnailUrl) {
          await prisma.post.update({
            where: { id: existing.id },
            data: {
              permalink: existing.permalink ?? item.permalink ?? null,
              thumbnailUrl: existing.thumbnailUrl ?? item.thumbnail_url ?? item.media_url ?? null,
              videoUrl: existing.videoUrl ?? (item.media_type === "VIDEO" ? item.media_url ?? null : null),
            },
          });
        }
        skipped++;
        continue;
      }

      try {
        const insights = await fetchInsights(item.id, item.media_type, {
          likes: item.like_count ?? 0,
          comments: item.comments_count ?? 0,
        });
        const caption = item.caption ?? "";
        const publishedAt = new Date(item.timestamp);

        // Extract hashtags from caption
        const hashtags = (caption.match(/#\w+/g) ?? []).map((h) => h.toLowerCase());
        const cleanCaption = caption.replace(/#\w+/g, "").trim();

        const post = await prisma.post.create({
          data: {
            platform: "INSTAGRAM",
            status: "PUBLISHED",
            contentType: mapContentType(item.media_type),
            caption: cleanCaption || caption,
            hashtags: JSON.stringify(hashtags),
            pillar: guessPillar(caption),
            thumbnailUrl: item.thumbnail_url ?? item.media_url ?? null,
            videoUrl: item.media_type === "VIDEO" ? item.media_url ?? null : null,
            permalink: item.permalink ?? null,
            publishedAt,
            platformPostId: item.id,
            approvalStatus: "APPROVED",
            flaggedForReview: false,
          },
        });

        // Store metrics as a 24h checkpoint snapshot
        const engagementRate =
          insights.views > 0
            ? ((insights.likes + insights.comments + insights.shares + insights.saves) / insights.views) * 100
            : 0;

        await prisma.postMetrics.create({
          data: {
            postId: post.id,
            checkpointHours: 24,
            views: insights.views,
            likes: insights.likes,
            comments: insights.comments,
            shares: insights.shares,
            saves: insights.saves,
            engagementRate,
            recordedAt: new Date(),
          },
        });

        imported++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      total: media.length,
      imported,
      skipped,
      errors,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Preview how many posts are on Instagram vs already imported
  try {
    const media = await fetchAllMedia();
    const platformIds = media.map((m) => m.id);
    const alreadyImported = await prisma.post.count({
      where: { platformPostId: { in: platformIds } },
    });
    return NextResponse.json({
      totalOnInstagram: media.length,
      alreadyImported,
      toImport: media.length - alreadyImported,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
