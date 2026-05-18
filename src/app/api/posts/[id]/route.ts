import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { metrics: { orderBy: { checkpointHours: "asc" } } },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...post,
    hashtags: JSON.parse(post.hashtags ?? "[]"),
    mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  const allowed = [
    "caption", "hashtags", "audioTrack", "hook", "thumbnailUrl",
    "videoUrl", "mediaUrls", "scheduledAt", "pillar", "status",
    "approvalStatus", "approvalNotes",
  ];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "hashtags" || key === "mediaUrls") {
        updateData[key] = JSON.stringify(body[key]);
      } else if (key === "scheduledAt") {
        updateData[key] = body[key] ? new Date(body[key]) : null;
      } else {
        updateData[key] = body[key];
      }
    }
  }

  const post = await prisma.post.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    ...post,
    hashtags: JSON.parse(post.hashtags ?? "[]"),
  });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
