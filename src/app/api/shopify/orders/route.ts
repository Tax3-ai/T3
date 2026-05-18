import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { prisma } from "@/lib/prisma";
import { getShopifyCredentials } from "@/lib/shopify";

function parseUtm(landingSite?: string) {
  let utmSource = null, utmMedium = null, utmCampaign = null, utmContent = null;
  if (landingSite) {
    try {
      const u = new URL(
        landingSite.startsWith("http") ? landingSite : `https://tax3.co.uk${landingSite}`
      );
      utmSource = u.searchParams.get("utm_source");
      utmMedium = u.searchParams.get("utm_medium");
      utmCampaign = u.searchParams.get("utm_campaign");
      utmContent = u.searchParams.get("utm_content");
    } catch {}
  }
  return { utmSource, utmMedium, utmCampaign, utmContent };
}

async function upsertPage(orders: any[]): Promise<number> {
  // Try fast path: bulk insert new records, skip duplicates
  const creates = orders.map((order: any) => {
    const { utmSource, utmMedium, utmCampaign, utmContent } = parseUtm(order.landing_site);
    return {
      shopifyId: String(order.id),
      orderNumber: String(order.order_number),
      totalPrice: parseFloat(order.total_price),
      currency: order.currency,
      utmSource, utmMedium, utmCampaign, utmContent,
      referringSite: order.referring_site ?? null,
      landingPage: order.landing_site ?? null,
      createdAt: new Date(order.created_at),
      processedAt: order.processed_at ? new Date(order.processed_at) : null,
    };
  });

  // Insert new records in bulk (skip existing)
  const { count: inserted } = await prisma.shopifyOrder.createMany({
    data: creates,
    skipDuplicates: true,
  });

  // Update records that already existed (createMany skips them)
  const existingIds = new Set(
    (await prisma.shopifyOrder.findMany({
      where: { shopifyId: { in: creates.map((c) => c.shopifyId) } },
      select: { shopifyId: true },
    })).map((r) => r.shopifyId)
  );
  const toUpdate = creates.filter((c) => existingIds.has(c.shopifyId));
  if (toUpdate.length > inserted) {
    await Promise.all(
      toUpdate.map((c) =>
        prisma.shopifyOrder.update({
          where: { shopifyId: c.shopifyId },
          data: {
            totalPrice: c.totalPrice,
            currency: c.currency,
            utmSource: c.utmSource,
            utmMedium: c.utmMedium,
            utmCampaign: c.utmCampaign,
            utmContent: c.utmContent,
            referringSite: c.referringSite,
            landingPage: c.landingPage,
            processedAt: c.processedAt,
          },
        })
      )
    );
  }

  return creates.length;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const allTime = body.allTime === true;

    const sinceDate = allTime ? "2017-01-01T00:00:00Z" : "2026-01-01T00:00:00Z";
    const { accessToken, storeUrl } = await getShopifyCredentials();
    const dateParam = sinceDate ? `&created_at_min=${sinceDate}` : "";
    const fields = "id,order_number,total_price,currency,created_at,processed_at,referring_site,landing_site";

    let pageUrl: string | null = `https://${storeUrl}/admin/api/2025-01/orders.json?status=any&limit=250${dateParam}&fields=${fields}`;
    let synced = 0;

    // Process page-by-page: fetch a page, write it, fetch the next
    while (pageUrl) {
      const response: Response = await fetch(pageUrl, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Shopify API error ${response.status}`);

      const data = await response.json();
      const pageOrders = data.orders || [];

      if (pageOrders.length > 0) {
        synced += await upsertPage(pageOrders);
      }

      // Check for next page in Link header
      const linkHeader: string | null = response.headers.get("Link");
      const nextMatch: RegExpMatchArray | null = linkHeader?.match(/<([^>]+)>;\s*rel="next"/) || null;
      pageUrl = nextMatch ? nextMatch[1] : null;
    }

    return NextResponse.json({ success: true, synced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const allTime = searchParams.get("allTime") === "true";
    const since = allTime ? new Date("2017-01-01T00:00:00Z") : new Date("2026-01-01T00:00:00Z");

    const orders = await prisma.shopifyOrder.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
