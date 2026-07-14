import { NextResponse } from "next/server";
import { getListAnalytics } from "@/lib/email-marketing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const analytics = await getListAnalytics();

    const topCustomersBySegment = Object.fromEntries(
      Object.entries(analytics.segmentedCustomers).map(([segment, customers]) => [
        segment,
        [...customers]
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5)
          .map((c) => ({
            name: c.name,
            orderCount: c.orderCount,
            totalSpent: Math.round(c.totalSpent * 100) / 100,
            daysSinceLastOrder: c.daysSinceLastOrder,
          })),
      ])
    );

    return NextResponse.json({
      listSize: analytics.listSize,
      totalRevenue: analytics.totalRevenue,
      totalOrders: analytics.totalOrders,
      avgOrderValue: analytics.avgOrderValue,
      repeatPurchaseRate: analytics.repeatPurchaseRate,
      estimatedLtv: analytics.estimatedLtv,
      segments: analytics.segments,
      topCustomersBySegment,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load list analytics" },
      { status: 500 }
    );
  }
}
