import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RepairStatus } from "@prisma/client";
import { sendSMS, statusSMS } from "@/lib/sms";
import { sendTelegramMessage, telegramMsg } from "@/lib/telegram";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  const newStatus = status as RepairStatus;

  const job = await prisma.repairJob.findUnique({
    where: { id: params.id },
    include: { customer: true },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldStatus = job.status;
  const smsBody = statusSMS(newStatus, job.jobNumber, job.customer.name, `${job.deviceBrand} ${job.deviceModel}`, { price: job.quotedPrice ?? undefined });
  const smsSent = await sendSMS(job.customer.phone, smsBody);

  const updated = await prisma.repairJob.update({
    where: { id: params.id },
    data: {
      status: newStatus,
      collectedAt: newStatus === "COLLECTED" ? new Date() : undefined,
      statusHistory: { create: { status: newStatus, message: smsBody, smsSent, sentAt: smsSent ? new Date() : null } },
    },
    include: { customer: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  await sendTelegramMessage(telegramMsg("STATUS_CHANGED", {
    jobNumber: job.jobNumber, old: oldStatus, new: newStatus, name: job.customer.name,
  }));

  return NextResponse.json(updated);
}
