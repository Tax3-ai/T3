/**
 * POST /api/generate/video
 * Submits a Higgsfield video generation job for a post.
 * The post's visualNotes + hook are used to build the prompt.
 *
 * Body: { postId: string, imageUrl?: string }
 *
 * Returns immediately with { requestId } — poll /api/generate/video/status?requestId=xxx
 *
 * GET /api/generate/video/status?requestId=xxx
 * Polls the Higgsfield job and, if complete, saves videoUrl + thumbnailUrl to the post.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVideo, checkVideoJob, buildVideoPrompt } from "@/lib/higgsfield";

export const dynamic = "force-dynamic";

// ─── Submit job ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!process.env.HIGGSFIELD_API_KEY || !process.env.HIGGSFIELD_API_SECRET) {
    return NextResponse.json(
      { error: "Higgsfield API keys not configured. Add HIGGSFIELD_API_KEY + HIGGSFIELD_API_SECRET to your environment variables." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json() as { postId: string; imageUrl?: string };
    const { postId, imageUrl } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const prompt = buildVideoPrompt({
      hook: post.hook,
      visualNotes: post.aiReasoning, // aiReasoning often contains visual direction
      platform: post.platform,
      pillar: post.pillar,
    });

    const requestId = await generateVideo({
      prompt,
      imageUrl,
      aspectRatio: "9:16",
      motionStrength: 0.7,
    });

    // Store the requestId so we can poll it later
    await prisma.post.update({
      where: { id: postId },
      data: {
        approvalNotes: `higgs:${requestId}`, // temporary storage until video is ready
      },
    });

    return NextResponse.json({ requestId, postId, prompt });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Video generation failed" },
      { status: 500 }
    );
  }
}

// ─── Poll job status ─────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");
  const postId = searchParams.get("postId");

  if (!requestId) {
    return NextResponse.json({ error: "requestId is required" }, { status: 400 });
  }

  try {
    const job = await checkVideoJob(requestId);

    // If complete and we have a postId, save the video URL to the post
    if (job.status === "completed" && job.videoUrl && postId) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          videoUrl: job.videoUrl,
          thumbnailUrl: job.thumbnailUrl ?? null,
          approvalNotes: null, // clear the temp requestId storage
        },
      });
    }

    return NextResponse.json(job);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Status check failed" },
      { status: 500 }
    );
  }
}
