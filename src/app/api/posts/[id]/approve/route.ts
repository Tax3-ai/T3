import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action: "approve" | "reject" = body.action ?? "approve";
  const notes: string = body.notes ?? "";

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.post.update({
    where: { id },
    data: {
      approvalStatus: action === "approve" ? "APPROVED" : "REJECTED",
      status: action === "approve" ? "APPROVED" : "DRAFT",
      approvalNotes: notes || null,
    },
  });

  return NextResponse.json({
    ...updated,
    hashtags: JSON.parse(updated.hashtags ?? "[]"),
  });
}
