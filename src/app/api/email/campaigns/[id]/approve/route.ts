import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCampaign } from "@/lib/email-marketing";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action: "approve" | "reject" = body.action ?? "approve";
  const notes: string = body.notes ?? "";

  const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.emailCampaign.update({
    where: { id },
    data: {
      approvalStatus: action === "approve" ? "APPROVED" : "REJECTED",
      status: action === "approve" ? "APPROVED" : "REJECTED",
      approvalNotes: notes || null,
    },
  });

  return NextResponse.json(parseCampaign(updated));
}
