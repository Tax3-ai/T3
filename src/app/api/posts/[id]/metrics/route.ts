import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const metrics = await prisma.postMetrics.findMany({
    where: { postId: params.id },
    orderBy: { checkpointHours: "asc" },
  });

  return NextResponse.json(metrics);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const metric = await prisma.postMetrics.upsert({
    where: {
      postId_checkpointHours: {
        postId: params.id,
        checkpointHours: body.checkpointHours,
      },
    },
    create: {
      postId: params.id,
      checkpointHours: body.checkpointHours,
      views: body.views ?? 0,
      likes: body.likes ?? 0,
      comments: body.comments ?? 0,
      shares: body.shares ?? 0,
      saves: body.saves ?? 0,
      completionRate: body.completionRate ?? null,
      followerGrowth: body.followerGrowth ?? null,
      engagementRate: body.engagementRate ?? null,
    },
    update: {
      views: body.views ?? 0,
      likes: body.likes ?? 0,
      comments: body.comments ?? 0,
      shares: body.shares ?? 0,
      saves: body.saves ?? 0,
      completionRate: body.completionRate ?? null,
      followerGrowth: body.followerGrowth ?? null,
      engagementRate: body.engagementRate ?? null,
    },
  });

  return NextResponse.json(metric);
}
