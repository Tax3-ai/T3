import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { deviceBrand, deviceModel, repairType } = await req.json();

  const rule = await prisma.pricingRule.findFirst({
    where: {
      deviceBrand: { equals: deviceBrand, mode: "insensitive" },
      repairType: { equals: repairType, mode: "insensitive" },
      isActive: true,
      OR: [
        { deviceModel: { equals: deviceModel, mode: "insensitive" } },
        { deviceModel: null },
      ],
    },
    orderBy: { deviceModel: "desc" },
  });

  if (!rule) return NextResponse.json({ found: false, message: "No pricing available for this combination — please contact us for a custom quote." });
  return NextResponse.json({ found: true, minPrice: rule.minPrice, maxPrice: rule.maxPrice, repairType: rule.repairType });
}
