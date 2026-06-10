import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const activeOnly = searchParams.get("active") !== "false";

  const products = await prisma.product.findMany({
    where: {
      ...(activeOnly ? { isActive: true } : {}),
      ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
      ...(search ? { OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]} : {}),
    },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      sku: body.sku, name: body.name, description: body.description || null,
      category: body.category, brand: body.brand || null,
      compatibleWith: body.compatibleWith || null, condition: body.condition || "NEW",
      price: parseFloat(body.price),
      costPrice: body.costPrice ? parseFloat(body.costPrice) : null,
      stockQty: parseInt(body.stockQty) || 0,
      lowStockAlert: parseInt(body.lowStockAlert) || 5,
      weight: body.weight ? parseFloat(body.weight) : null,
      barcode: body.barcode || null,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
