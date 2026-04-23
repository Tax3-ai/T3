import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSuggestions } from "@/lib/claude";

export async function GET() {
  const suggestions = await prisma.contentSuggestion.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(
    suggestions.map((s) => ({
      ...s,
      hashtags: JSON.parse(s.hashtags),
    }))
  );
}

export async function POST() {
  try {
    const suggestions = await generateSuggestions(5);
    return NextResponse.json(suggestions, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  const updated = await prisma.contentSuggestion.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ ...updated, hashtags: JSON.parse(updated.hashtags) });
}
