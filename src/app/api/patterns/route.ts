import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const patterns = await prisma.patternEntry.findMany({
    where: { isActive: true },
    orderBy: { score: "desc" },
  });
  return NextResponse.json(patterns);
}
