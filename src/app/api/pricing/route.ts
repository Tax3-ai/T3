import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rules = await prisma.pricingRule.findMany({ orderBy: [{ deviceBrand: "asc" }, { repairType: "asc" }] });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rule = await prisma.pricingRule.create({
    data: {
      deviceBrand: body.deviceBrand,
      deviceModel: body.deviceModel || null,
      repairType: body.repairType,
      minPrice: parseFloat(body.minPrice),
      maxPrice: parseFloat(body.maxPrice),
    },
  });
  return NextResponse.json(rule, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.pricingRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
