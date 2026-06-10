import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { GOOGLE_REVIEW_URL } from "@/lib/constants";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

  const jobs = await prisma.repairJob.findMany({
    where: { status: "COLLECTED", followUpSent: false, collectedAt: { gte: eightDaysAgo, lte: sevenDaysAgo } },
    include: { customer: true },
  });

  const results = [];
  for (const job of jobs) {
    const first = job.customer.name.split(" ")[0];
    const msg = `Hi ${first}! It's been a week since you collected your ${job.deviceBrand} ${job.deviceModel}. How is everything working? If you have a moment, we'd love a Google review: ${GOOGLE_REVIEW_URL} — FixIt Repairs`;
    const sent = await sendSMS(job.customer.phone, msg);
    await prisma.repairJob.update({ where: { id: job.id }, data: { followUpSent: true } });
    results.push({ jobNumber: job.jobNumber, sent });
  }

  return NextResponse.json({ processed: results.length, results });
}
