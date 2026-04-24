import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBrandBible } from "@/lib/brand-bible";

export const dynamic = "force-dynamic";

export async function GET() {
  const bible = await getBrandBible();
  if (!bible) return NextResponse.json({ error: "Brand bible not found" }, { status: 404 });
  return NextResponse.json(bible);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const existing = await prisma.brandBible.findFirst();
  const stringified = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v));

  const data = {
    brandName: body.brandName,
    tagline: body.tagline,
    originStory: body.originStory,
    mission: body.mission,
    vision: body.vision,
    personality: stringified(body.personality),
    audience: stringified(body.audience),
    voice: stringified(body.voice),
    visual: stringified(body.visual),
    contentPillars: stringified(body.contentPillars),
    competitors: stringified(body.competitors),
    redLines: stringified(body.redLines),
    offLimitPhrases: stringified(body.offLimitPhrases),
    lovedPhrases: stringified(body.lovedPhrases),
    slogans: stringified(body.slogans),
    inspirationAccounts: stringified(body.inspirationAccounts),
    avoidAccounts: stringified(body.avoidAccounts),
    topics: stringified(body.topics),
  };

  const bible = existing
    ? await prisma.brandBible.update({ where: { id: existing.id }, data })
    : await prisma.brandBible.create({ data });

  return NextResponse.json(bible);
}
