import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => ({}));
  const action: "approve" | "reject" = body.action ?? "approve";
  const notes: string = body.notes ?? "";

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.post.update({
    where: { id: params.id },
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
