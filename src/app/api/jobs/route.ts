import { NextRequest, NextResponse } from "next/server";
import { generateJobNumber } from "@/lib/utils";
import { sendTelegramMessage, telegramMsg } from "@/lib/telegram";

const DEMO_JOBS = [
  { id: "demo-1",  jobNumber: "JOB-260601-1021", status: "COLLECTED",      deviceBrand: "Apple",   deviceModel: "iPhone 15 Pro",  faultDescription: "Cracked screen replacement",          quotedPrice: 249, createdAt: new Date(Date.now() - 13 * 86400000).toISOString(), customer: { name: "James Whitfield",   phone: "07700 900123" } },
  { id: "demo-2",  jobNumber: "JOB-260602-1047", status: "COLLECTED",      deviceBrand: "Samsung", deviceModel: "Galaxy S24",     faultDescription: "Battery swollen, not charging",       quotedPrice: 129, createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), customer: { name: "Priya Sharma",      phone: "07700 900456" } },
  { id: "demo-3",  jobNumber: "JOB-260603-1058", status: "COLLECTED",      deviceBrand: "Apple",   deviceModel: "iPhone 14",      faultDescription: "Water damage — full diagnostic",      quotedPrice: 180, createdAt: new Date(Date.now() - 11 * 86400000).toISOString(), customer: { name: "Daniel O'Brien",    phone: "07700 900789" } },
  { id: "demo-4",  jobNumber: "JOB-260604-1073", status: "COLLECTED",      deviceBrand: "Google",  deviceModel: "Pixel 8",        faultDescription: "Back glass cracked",                  quotedPrice: 95,  createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), customer: { name: "Sophie Nguyen",     phone: "07700 900321" } },
  { id: "demo-5",  jobNumber: "JOB-260605-1089", status: "COLLECTED",      deviceBrand: "OnePlus", deviceModel: "12",             faultDescription: "Charging port replaced",              quotedPrice: 75,  createdAt: new Date(Date.now() - 9  * 86400000).toISOString(), customer: { name: "Marcus Webb",       phone: "07700 900654" } },
  { id: "demo-6",  jobNumber: "JOB-260607-1102", status: "IN_REPAIR",      deviceBrand: "Apple",   deviceModel: "iPhone 15 Pro",  faultDescription: "Face ID not working after drop",      quotedPrice: 199, createdAt: new Date(Date.now() - 7  * 86400000).toISOString(), customer: { name: "Aisha Patel",       phone: "07700 900987" } },
  { id: "demo-7",  jobNumber: "JOB-260608-1115", status: "AWAITING_PARTS", deviceBrand: "Samsung", deviceModel: "Galaxy S24",     faultDescription: "Camera lens shattered",               quotedPrice: 145, createdAt: new Date(Date.now() - 6  * 86400000).toISOString(), customer: { name: "Tom Gallagher",     phone: "07700 900147" } },
  { id: "demo-8",  jobNumber: "JOB-260609-1128", status: "DIAGNOSED",      deviceBrand: "Apple",   deviceModel: "iPhone 14",      faultDescription: "No service after iOS update",         quotedPrice: 60,  createdAt: new Date(Date.now() - 5  * 86400000).toISOString(), customer: { name: "Chloe Martinez",    phone: "07700 900258" } },
  { id: "demo-9",  jobNumber: "JOB-260610-1141", status: "READY",          deviceBrand: "Google",  deviceModel: "Pixel 8",        faultDescription: "Screen unresponsive at bottom",       quotedPrice: 110, createdAt: new Date(Date.now() - 3  * 86400000).toISOString(), customer: { name: "Ryan Fletcher",     phone: "07700 900369" } },
  { id: "demo-10", jobNumber: "JOB-260611-1154", status: "READY",          deviceBrand: "OnePlus", deviceModel: "12",             faultDescription: "Speaker crackling on calls",          quotedPrice: 55,  createdAt: new Date(Date.now() - 2  * 86400000).toISOString(), customer: { name: "Fatima Al-Rashid",  phone: "07700 900471" } },
  { id: "demo-11", jobNumber: "JOB-260612-1167", status: "READY",          deviceBrand: "Apple",   deviceModel: "iPhone 15 Pro",  faultDescription: "Microphone not working during calls", quotedPrice: 89,  createdAt: new Date(Date.now() - 1  * 86400000).toISOString(), customer: { name: "Ben Holloway",      phone: "07700 900582" } },
  { id: "demo-12", jobNumber: "JOB-260612-1178", status: "IN_REPAIR",      deviceBrand: "Samsung", deviceModel: "Galaxy S24",     faultDescription: "OLED screen replacement",             quotedPrice: 220, createdAt: new Date(Date.now() - 1  * 86400000).toISOString(), customer: { name: "Laura Brennan",     phone: "07700 900693" } },
  { id: "demo-13", jobNumber: "JOB-260613-1189", status: "RECEIVED",       deviceBrand: "Apple",   deviceModel: "iPhone 14",      faultDescription: "Home button stuck / not clicking",    quotedPrice: null,createdAt: new Date().toISOString(),                            customer: { name: "Noah Chambers",     phone: "07700 900704" } },
  { id: "demo-14", jobNumber: "JOB-260613-1190", status: "RECEIVED",       deviceBrand: "Google",  deviceModel: "Pixel 8",        faultDescription: "Phone won't turn on after getting wet",quotedPrice: null,createdAt: new Date().toISOString(),                            customer: { name: "Imogen Clarke",     phone: "07700 900815" } },
];

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

    if (jobs.length === 0) {
      // DB empty or unavailable — return demo data (filtered to match query params)
      let demo = DEMO_JOBS as typeof DEMO_JOBS;
      if (status) demo = demo.filter(j => j.status === status);
      if (search) {
        const q = search.toLowerCase();
        demo = demo.filter(j =>
          j.jobNumber.toLowerCase().includes(q) ||
          j.customer.name.toLowerCase().includes(q) ||
          j.customer.phone.includes(q) ||
          j.deviceModel.toLowerCase().includes(q) ||
          j.deviceBrand.toLowerCase().includes(q)
        );
      }
      return NextResponse.json(demo);
    }

    return NextResponse.json(jobs);
  } catch {
    // DB unavailable — return demo data
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    let demo = DEMO_JOBS as typeof DEMO_JOBS;
    if (status) demo = demo.filter(j => j.status === status);
    if (search) {
      const q = search.toLowerCase();
      demo = demo.filter(j =>
        j.jobNumber.toLowerCase().includes(q) ||
        j.customer.name.toLowerCase().includes(q) ||
        j.customer.phone.includes(q) ||
        j.deviceModel.toLowerCase().includes(q) ||
        j.deviceBrand.toLowerCase().includes(q)
      );
    }
    return NextResponse.json(demo);
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
