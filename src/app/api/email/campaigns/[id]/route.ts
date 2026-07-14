import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCampaign } from "@/lib/email-marketing";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(parseCampaign(campaign));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  const allowed = [
    "name", "preheader", "body", "cta", "status", "approvalStatus",
    "approvalNotes", "scheduledAt", "estimatedRevenue",
  ];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      updateData[key] = key === "scheduledAt" && body[key] ? new Date(body[key]) : body[key];
    }
  }
  if (body.subjectLines !== undefined) {
    updateData.subjectLines = JSON.stringify(body.subjectLines);
  }

  const campaign = await prisma.emailCampaign.update({ where: { id }, data: updateData });
  return NextResponse.json(parseCampaign(campaign));
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.emailCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
