import { NextResponse } from "next/server";
import { collectAllDueMetrics } from "@/lib/analytics";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await collectAllDueMetrics();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Metrics collection failed" },
      { status: 500 }
    );
  }
}
