import { NextRequest, NextResponse } from "next/server";
import { generateJobNumber } from "@/lib/utils";
import { sendTelegramMessage, telegramMsg } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const jobs = await prisma.repairJob.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(search ? {
          OR: [
            { jobNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { phone: { contains: search } } },
            { deviceModel: { contains: search, mode: "insensitive" } },
            { deviceBrand: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerPhone, customerEmail, deviceBrand, deviceModel, deviceColor, imei, faultDescription, repairType, quotedPrice, estimatedReady } = body;

  try {
    const { prisma } = await import("@/lib/prisma");

    let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
    if (!customer) {
      customer = await prisma.customer.create({ data: { name: customerName, phone: customerPhone, email: customerEmail || null } });
    }

    const jobNumber = generateJobNumber();
    const job = await prisma.repairJob.create({
      data: {
        jobNumber, customerId: customer.id,
        deviceBrand, deviceModel, deviceColor: deviceColor || null, imei: imei || null,
        faultDescription, repairType,
        quotedPrice: quotedPrice ? parseFloat(quotedPrice) : null,
        estimatedReady: estimatedReady ? new Date(estimatedReady) : null,
        statusHistory: { create: { status: "RECEIVED" } },
      },
      include: { customer: true },
    });

    await sendTelegramMessage(telegramMsg("JOB_CREATED", {
      jobNumber: job.jobNumber, name: customer.name, phone: customer.phone,
      device: `${deviceBrand} ${deviceModel}`, fault: faultDescription,
    }));

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database not available. Please configure DATABASE_URL." }, { status: 503 });
  }
}
