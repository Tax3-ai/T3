import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmailStrategyReport, parseStrategyReport } from "@/lib/email-marketing";

export const dynamic = "force-dynamic";

export async function GET() {
  const reports = await prisma.emailStrategyReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(reports.map(parseStrategyReport));
}

export async function POST() {
  try {
    const report = await generateEmailStrategyReport();
    return NextResponse.json(report, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Strategy report generation failed" },
      { status: 500 }
    );
  }
}
