import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const type = searchParams.get("type");

  const items = await prisma.trendingItem.findMany({
    where: {
      isActive: true,
      expiresAt: { gte: new Date() },
      ...(platform ? { platform } : {}),
      ...(type ? { itemType: type } : {}),
    },
    orderBy: [{ growthRate: "desc" }, { saturation: "asc" }],
    take: 50,
  });

  return NextResponse.json(
    items.map((item) => ({
      ...item,
      niches: JSON.parse(item.niches),
      exampleUrls: JSON.parse(item.exampleUrls),
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const item = await prisma.trendingItem.create({
    data: {
      platform: body.platform,
      itemType: body.itemType,
      value: body.value,
      category: body.category ?? null,
      saturation: body.saturation ?? 0.5,
      growthRate: body.growthRate ?? 0,
      usageCount: body.usageCount ?? 0,
      niches: JSON.stringify(body.niches ?? []),
      exampleUrls: JSON.stringify(body.exampleUrls ?? []),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    ...item,
    niches: JSON.parse(item.niches),
    exampleUrls: JSON.parse(item.exampleUrls),
  }, { status: 201 });
}
