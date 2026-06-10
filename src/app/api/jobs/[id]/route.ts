import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.repairJob.findUnique({
    where: { id: params.id },
    include: { customer: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const job = await prisma.repairJob.update({
    where: { id: params.id },
    data: {
      quotedPrice: body.quotedPrice !== undefined ? parseFloat(body.quotedPrice) || null : undefined,
      finalPrice: body.finalPrice !== undefined ? parseFloat(body.finalPrice) || null : undefined,
      technicianNotes: body.technicianNotes,
      internalNotes: body.internalNotes,
      estimatedReady: body.estimatedReady ? new Date(body.estimatedReady) : undefined,
    },
    include: { customer: true },
  });
  return NextResponse.json(job);
}
