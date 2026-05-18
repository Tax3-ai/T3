import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.shopifyOrder.count();
    const latest = await prisma.shopifyOrder.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, orderNumber: true },
    });
    return NextResponse.json({ count, oldestOrder: latest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
