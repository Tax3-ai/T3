import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Post } from "@/types";

function parsePost(p: {
  id: string; platform: string; status: string; contentType: string;
  caption: string; hashtags: string; audioTrack: string | null; hook: string | null;
  pillar: string; thumbnailUrl: string | null; videoUrl: string | null;
  mediaUrls: string | null; scheduledAt: Date | null; publishedAt: Date | null;
  platformPostId: string | null; approvalStatus: string; approvalNotes: string | null;
  aiReasoning: string | null; predictedScore: number | null; flaggedForReview: boolean;
  createdAt: Date; updatedAt: Date;
  metrics?: Array<{ id: string; postId: string; checkpointHours: number; views: number; likes: number; comments: number; shares: number; saves: number; completionRate: number | null; followerGrowth: number | null; engagementRate: number | null; recordedAt: Date }>;
}): Post {
  return {
    ...p,
    platform: p.platform as Post["platform"],
    status: p.status as Post["status"],
    contentType: p.contentType as Post["contentType"],
    approvalStatus: p.approvalStatus as Post["approvalStatus"],
    pillar: p.pillar as Post["pillar"],
    hashtags: JSON.parse(p.hashtags ?? "[]"),
    mediaUrls: p.mediaUrls ? JSON.parse(p.mediaUrls) : null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const status = searchParams.get("status");
  const pillar = searchParams.get("pillar");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const page = parseInt(searchParams.get("page") ?? "1");

  const posts = await prisma.post.findMany({
    where: {
      ...(platform ? { platform } : {}),
      ...(status ? { status } : {}),
      ...(pillar ? { pillar } : {}),
    },
    include: { metrics: { orderBy: { checkpointHours: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const total = await prisma.post.count({
    where: {
      ...(platform ? { platform } : {}),
      ...(status ? { status } : {}),
      ...(pillar ? { pillar } : {}),
    },
  });

  return NextResponse.json({
    posts: posts.map(parsePost),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const post = await prisma.post.create({
    data: {
      platform: body.platform,
      status: "DRAFT",
      contentType: body.contentType ?? "REEL",
      caption: body.caption,
      hashtags: JSON.stringify(body.hashtags ?? []),
      audioTrack: body.audioTrack ?? null,
      hook: body.hook ?? null,
      pillar: body.pillar,
      thumbnailUrl: body.thumbnailUrl ?? null,
      videoUrl: body.videoUrl ?? null,
      mediaUrls: body.mediaUrls ? JSON.stringify(body.mediaUrls) : null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      approvalStatus: "PENDING",
      aiReasoning: body.aiReasoning ?? null,
      predictedScore: body.predictedScore ?? null,
      flaggedForReview: body.flaggedForReview ?? false,
    },
  });

  return NextResponse.json(parsePost(post), { status: 201 });
}
