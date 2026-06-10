import { NextResponse } from "next/server";
import { refreshLiveMetrics } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — may need to iterate many posts

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshLiveMetrics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Metrics refresh failed" },
      { status: 500 }
    );
  }
}
