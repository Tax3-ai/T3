import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, telegramMsg } from "@/lib/telegram";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, deviceBrand, deviceModel, faultDescription, estimatedMin, estimatedMax } = body;

  const lead = await prisma.lead.create({
    data: { name, phone, email: email || null, deviceBrand, deviceModel: deviceModel || null, faultDescription,
      estimatedMin: estimatedMin ? parseFloat(estimatedMin) : null,
      estimatedMax: estimatedMax ? parseFloat(estimatedMax) : null,
    },
  });

  const estimate = estimatedMin && estimatedMax ? `£${estimatedMin}–£${estimatedMax}` : "TBC";
  await sendTelegramMessage(telegramMsg("NEW_LEAD", {
    name, phone, device: `${deviceBrand}${deviceModel ? ` ${deviceModel}` : ""}`, fault: faultDescription, estimate,
  }));
  await prisma.lead.update({ where: { id: lead.id }, data: { telegramAlerted: true } });

  return NextResponse.json(lead, { status: 201 });
}
