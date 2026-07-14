import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCampaign, generateLifecycleFlows, parseCampaign } from "@/lib/email-marketing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const goal = searchParams.get("goal");
  const type = searchParams.get("type");

  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(goal ? { goal } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: [{ flowStepOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(campaigns.map(parseCampaign));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  try {
    if (body.flows === true) {
      const campaigns = await generateLifecycleFlows();
      return NextResponse.json(campaigns, { status: 201 });
    }

    if (!body.goal || !body.segment) {
      return NextResponse.json(
        { error: "goal and segment are required to generate a campaign" },
        { status: 400 }
      );
    }

    const campaign = await generateCampaign({
      type: body.type === "FLOW" ? "FLOW" : "CAMPAIGN",
      goal: body.goal,
      segment: body.segment,
      instructions: body.instructions,
      flowTrigger: body.flowTrigger,
      flowStepOrder: body.flowStepOrder,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Campaign generation failed" },
      { status: 500 }
    );
  }
}
