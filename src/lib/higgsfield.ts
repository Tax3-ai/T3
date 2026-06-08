/**
 * Higgsfield AI — Video Generation
 *
 * Docs & API keys: https://cloud.higgsfield.ai/api-keys
 * Sign up at:      https://cloud.higgsfield.ai/sign-up
 *
 * Env vars required:
 *   HIGGSFIELD_API_KEY    — from cloud.higgsfield.ai
 *   HIGGSFIELD_API_SECRET — from cloud.higgsfield.ai
 *
 * The API is async: you submit a job, get a requestId, then poll until complete.
 * Generation typically takes 30–120 seconds depending on model.
 */

const BASE_URL = "https://cloud.higgsfield.ai/api/v1";

function getAuth(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  const secret = process.env.HIGGSFIELD_API_SECRET;
  if (!key || !secret) throw new Error("HIGGSFIELD_API_KEY / HIGGSFIELD_API_SECRET not set");
  return `${key}:${secret}`;
}

export interface HiggsVideoRequest {
  /** Text prompt describing the video — use the post's visualNotes + hook */
  prompt: string;
  /** Optional input image URL (for image-to-video mode) */
  imageUrl?: string;
  /** Aspect ratio — 9:16 for Reels/TikTok (default), 16:9 for landscape */
  aspectRatio?: "9:16" | "16:9" | "1:1";
  /** Motion strength 0.0–1.0 (default 0.7) */
  motionStrength?: number;
  /** Webhook URL to call when generation is complete */
  webhookUrl?: string;
}

export interface HiggsJobStatus {
  requestId: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

/**
 * Submit a video generation job.
 * Returns a requestId to poll with checkVideoJob().
 */
export async function generateVideo(req: HiggsVideoRequest): Promise<string> {
  const auth = getAuth();

  // Model: dop-lite is fast + affordable; dop is higher quality
  const model = req.imageUrl ? "higgsfield/dop-lite/image-to-video" : "higgsfield/dop-lite/text-to-video";

  const body: Record<string, unknown> = {
    prompt: req.prompt,
    aspect_ratio: req.aspectRatio ?? "9:16",
    motions_strength: req.motionStrength ?? 0.7,
    enhance_prompt: true,
  };

  if (req.imageUrl) {
    body.input_images = [req.imageUrl];
  }

  if (req.webhookUrl) {
    body.webhook_url = req.webhookUrl;
  }

  const res = await fetch(`${BASE_URL}/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({ arguments: body }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Higgsfield submit error ${res.status}: ${err}`);
  }

  const data = await res.json() as { request_id?: string; id?: string };
  const requestId = data.request_id ?? data.id;
  if (!requestId) throw new Error("Higgsfield did not return a request ID");
  return requestId;
}

/**
 * Check the status of a previously submitted video job.
 */
export async function checkVideoJob(requestId: string): Promise<HiggsJobStatus> {
  const auth = getAuth();

  const res = await fetch(`${BASE_URL}/requests/${requestId}`, {
    headers: { Authorization: `Bearer ${auth}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Higgsfield status error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    status?: string;
    state?: string;
    output?: { video_url?: string; thumbnail_url?: string };
    error?: string;
  };

  const rawStatus = (data.status ?? data.state ?? "").toLowerCase();

  let status: HiggsJobStatus["status"] = "queued";
  if (rawStatus.includes("progress") || rawStatus.includes("running")) status = "in_progress";
  else if (rawStatus.includes("complete") || rawStatus.includes("done") || rawStatus.includes("success")) status = "completed";
  else if (rawStatus.includes("fail") || rawStatus.includes("error") || rawStatus.includes("cancel")) status = "failed";

  return {
    requestId,
    status,
    videoUrl: data.output?.video_url,
    thumbnailUrl: data.output?.thumbnail_url,
    error: data.error,
  };
}

/**
 * Build a Higgsfield prompt from a post's AI-generated content.
 * Combines the visual notes (director's brief) with the hook for maximum relevance.
 */
export function buildVideoPrompt(opts: {
  hook?: string | null;
  visualNotes?: string | null;
  platform: string;
  pillar: string;
}): string {
  const parts: string[] = [];

  // Cinematic baseline for Tax3 aesthetic
  parts.push("Cinematic 90s streetwear fashion video, London aesthetic, red/white/black colour palette, high contrast.");

  if (opts.visualNotes) {
    parts.push(opts.visualNotes);
  }

  if (opts.hook) {
    parts.push(`Opening moment: ${opts.hook}`);
  }

  // Platform-specific framing
  if (opts.platform === "TIKTOK" || opts.platform === "INSTAGRAM") {
    parts.push("Vertical 9:16 format. Fast-paced cuts. Authentic street cast. No studio backgrounds.");
  }

  return parts.join(" ");
}
