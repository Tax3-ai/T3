import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getBrandBibleAsPromptContext } from "@/lib/brand-bible";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Pull live Tax3 context
    const brandContext = await getBrandBibleAsPromptContext().catch(() => "");

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [recentPosts, pendingApprovals, suggestions] = await Promise.all([
      prisma.post.findMany({
        where: { publishedAt: { gte: oneWeekAgo }, status: "PUBLISHED" },
        include: { metrics: { orderBy: { checkpointHours: "desc" }, take: 1 } },
        orderBy: { publishedAt: "desc" },
        take: 10,
      }).catch(() => []),
      prisma.post.findMany({
        where: { approvalStatus: "PENDING" },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }).catch(() => []),
      prisma.contentSuggestion.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }).catch(() => []),
    ]);

    const postSummary = recentPosts.map((p) => ({
      platform: p.platform,
      pillar: p.pillar,
      hook: p.hook,
      views: p.metrics[0]?.views ?? 0,
      likes: p.metrics[0]?.likes ?? 0,
      engagement: p.metrics[0]?.engagementRate ?? 0,
      publishedAt: p.publishedAt,
    }));

    const systemPrompt = `You are the Tax3 social media agent — a sharp, knowledgeable assistant built into the Tax3 dashboard.

${brandContext}

LIVE DASHBOARD CONTEXT:
Recent published posts (last 7 days):
${postSummary.length > 0 ? JSON.stringify(postSummary, null, 2) : "No posts published this week yet."}

Posts awaiting approval: ${pendingApprovals.length}
${pendingApprovals.map((p) => `- [${p.platform}] "${p.hook}" scheduled ${p.scheduledAt?.toISOString()}`).join("\n") || "None"}

Pending content suggestions: ${suggestions.length}
${suggestions.map((s) => `- [${s.platform}] "${s.hook}"`).join("\n") || "None"}

Your job:
- Help JB with content strategy, caption writing, post ideas, performance analysis
- Give direct, confident answers — no fluff, no corporate speak
- You know Tax3 inside out — the brand, the aesthetic, the audience, the goals
- If asked to write content, write it properly with hooks, captions, hashtags
- Keep responses concise unless detail is needed
- You're London, you get culture, you know streetwear`;

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
