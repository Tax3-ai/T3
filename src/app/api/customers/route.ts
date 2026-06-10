import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = new URL(req.url).searchParams.get("search");
  const customers = await prisma.customer.findMany({
    where: search ? { OR: [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ]} : undefined,
    include: { _count: { select: { repairJobs: true, orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}
