import { NextResponse } from "next/server";
import { generatePost } from "@/lib/claude";
import { publishScheduledPosts, flagUnderperformers } from "@/lib/scheduler";
import type { Platform, ContentPillar } from "@/types";

/**
 * Internal trigger endpoint — callable from the dashboard without exposing CRON_SECRET.
 * This is a convenience wrapper; the actual cron uses /api/cron/daily with Bearer auth.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const slot: "morning" | "midday" | "evening" = body.slot ?? "morning";

  const slotPillars: Record<string, { ig: ContentPillar; tt: ContentPillar }> = {
    morning: { ig: "lifestyle", tt: "lifestyle" },
    midday: { ig: "behind_scenes", tt: "campaign" },
    evening: { ig: "campaign", tt: "behind_scenes" },
  };

  const pillars = slotPillars[slot] ?? slotPillars.morning;

  try {
    const [igPost, ttPost] = await Promise.allSettled([
      generatePost({ platform: "INSTAGRAM" as Platform, pillar: pillars.ig, slot }),
      generatePost({ platform: "TIKTOK" as Platform, pillar: pillars.tt, slot }),
    ]);

    await flagUnderperformers();
    const { published, failed } = await publishScheduledPosts();

    return NextResponse.json({
      slot,
      generated: {
        instagram: igPost.status === "fulfilled" ? igPost.value.id : null,
        tiktok: ttPost.status === "fulfilled" ? ttPost.value.id : null,
      },
      published,
      failed,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
