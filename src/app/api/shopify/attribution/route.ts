import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const allTime = searchParams.get("allTime") === "true";
    const since = allTime ? undefined : new Date("2026-01-01T00:00:00Z");
    const dateFilter = since ? { createdAt: { gte: since } } : {};

    // All orders in range
    const allOrders = await prisma.shopifyOrder.findMany({
      where: dateFilter,
    });

    const totalRevenue = allOrders.reduce((s, o) => s + o.totalPrice, 0);
    const totalOrders = allOrders.length;

    // Attributed orders (have utm_content = post ID)
    const attributedOrders = allOrders.filter((o) => o.utmContent);

    // Group by post ID
    const byPost: Record<string, {
      orderCount: number;
      totalRevenue: number;
      currency: string;
      orders: typeof allOrders;
    }> = {};

    for (const order of attributedOrders) {
      const pid = order.utmContent!;
      if (!byPost[pid]) {
        byPost[pid] = { orderCount: 0, totalRevenue: 0, currency: order.currency, orders: [] };
      }
      byPost[pid].orderCount++;
      byPost[pid].totalRevenue += order.totalPrice;
      byPost[pid].orders.push(order);
    }

    // Enrich with post data
    const postIds = Object.keys(byPost);
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      include: { metrics: { orderBy: { checkpointHours: "desc" }, take: 1 } },
    });

    const attributed = posts.map((post) => {
      const attr = byPost[post.id];
      const latestMetrics = post.metrics[0];
      return {
        post: {
          id: post.id,
          platform: post.platform,
          caption: post.caption.substring(0, 100),
          thumbnailUrl: post.thumbnailUrl,
          permalink: post.permalink,
          publishedAt: post.publishedAt,
          views: latestMetrics?.views || 0,
          likes: latestMetrics?.likes || 0,
        },
        attribution: {
          orderCount: attr.orderCount,
          totalRevenue: Math.round(attr.totalRevenue * 100) / 100,
          currency: attr.currency,
          revenuePerView: latestMetrics?.views
            ? Math.round((attr.totalRevenue / latestMetrics.views) * 10000) / 10000
            : null,
        },
      };
    }).sort((a, b) => b.attribution.totalRevenue - a.attribution.totalRevenue);

    // Traffic source breakdown
    const sources: Record<string, { orders: number; revenue: number }> = {};
    for (const order of allOrders) {
      const src = order.utmSource || (order.referringSite ? new URL(order.referringSite).hostname.replace("www.", "") : "direct");
      if (!sources[src]) sources[src] = { orders: 0, revenue: 0 };
      sources[src].orders++;
      sources[src].revenue += order.totalPrice;
    }

    const trafficSources = Object.entries(sources)
      .map(([source, data]) => ({ source, ...data, revenue: Math.round(data.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      attributed,
      trafficSources,
      summary: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        attributedOrders: attributedOrders.length,
        attributedRevenue: Math.round(attributedOrders.reduce((s, o) => s + o.totalPrice, 0) * 100) / 100,
        unattributedOrders: totalOrders - attributedOrders.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
