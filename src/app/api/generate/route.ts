import { NextResponse } from "next/server";
import { generatePost } from "@/lib/claude";
import type { GenerateContentRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body: GenerateContentRequest = await request.json();

    if (!body.platform || !body.pillar || !body.slot) {
      return NextResponse.json(
        { error: "platform, pillar, and slot are required" },
        { status: 400 }
      );
    }

    const post = await generatePost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
