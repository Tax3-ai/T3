import { NextResponse } from "next/server";
import { generatePost } from "@/lib/claude";
import { publishScheduledPosts, flagUnderperformers } from "@/lib/scheduler";
import type { Platform, ContentPillar } from "@/types";

// Called by Vercel Cron three times per day
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slot = (searchParams.get("slot") ?? "morning") as "morning" | "midday" | "evening";

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
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
