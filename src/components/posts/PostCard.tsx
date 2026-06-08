"use client";

import { useState, useRef } from "react";
import { PlatformBadge, StatusBadge, Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow, format } from "date-fns";
import Image from "next/image";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post & { metrics?: Array<{ views: number; likes: number; shares: number; saves: number; engagementRate?: number | null; checkpointHours: number }> };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdate?: () => void;
  compact?: boolean;
}

const PILLAR_COLORS: Record<string, string> = {
  lifestyle: "#8B5CF6",
  behind_scenes: "#F59E0B",
  campaign: "#E31E24",
  community: "#10B981",
  events: "#3B82F6",
};

export function PostCard({ post, onApprove, onReject, onUpdate, compact }: PostCardProps) {
  const latestMetrics = post.metrics?.sort((a, b) => b.checkpointHours - a.checkpointHours)[0];
  const pillarColor = PILLAR_COLORS[post.pillar] ?? "#888";

  // Media URL editing
  const [mediaOpen, setMediaOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(post.videoUrl ?? "");
  const [thumbUrl, setThumbUrl] = useState(post.thumbnailUrl ?? "");
  const [mediaSaving, setMediaSaving] = useState(false);
  const [mediaSaved, setMediaSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMedia = !!(post.videoUrl || videoUrl.trim());

  // Higgsfield AI video generation
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<"idle" | "queued" | "in_progress" | "completed" | "failed">("idle");
  const [genRequestId, setGenRequestId] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function generateAiVideo() {
    setGenerating(true);
    setGenStatus("queued");
    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json() as { requestId?: string; error?: string };
      if (!res.ok || data.error) {
        setGenStatus("failed");
        setGenerating(false);
        return;
      }
      setGenRequestId(data.requestId ?? null);
      // Poll every 8 seconds until done
      pollTimer.current = setInterval(async () => {
        try {
          const poll = await fetch(`/api/generate/video?requestId=${data.requestId}&postId=${post.id}`);
          const job = await poll.json() as { status: string; videoUrl?: string };
          setGenStatus(job.status as typeof genStatus);
          if (job.status === "completed") {
            if (pollTimer.current) clearInterval(pollTimer.current);
            if (job.videoUrl) setVideoUrl(job.videoUrl);
            setGenerating(false);
            onUpdate?.();
          } else if (job.status === "failed") {
            if (pollTimer.current) clearInterval(pollTimer.current);
            setGenerating(false);
          }
        } catch {
          // keep polling
        }
      }, 8000);
    } catch {
      setGenStatus("failed");
      setGenerating(false);
    }
  }

  async function saveMedia() {
    setMediaSaving(true);
    try {
      await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: videoUrl.trim() || null,
          thumbnailUrl: thumbUrl.trim() || null,
        }),
      });
      setMediaSaved(true);
      setMediaOpen(false);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setMediaSaved(false), 3000);
      onUpdate?.();
    } finally {
      setMediaSaving(false);
    }
  }

  const inner = (
    <Card
      className={compact ? "p-3" : "p-4"}
      hover={!!(onApprove || post.permalink)}
    >
      {/* Thumbnail */}
      {post.thumbnailUrl && (
        <div className={`relative w-full overflow-hidden rounded-lg mb-3 bg-brand-gray-800 ${
          compact ? "h-40" : "h-56"
        }`}>
          <Image
            src={post.thumbnailUrl}
            alt={post.caption?.slice(0, 60) ?? "Post thumbnail"}
            fill
            className="object-cover"
            unoptimized
          />
          {post.contentType === "REEL" || post.contentType === "VIDEO" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg">▶</span>
              </div>
            </div>
          ) : null}
        </div>
      )}
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PlatformBadge platform={post.platform} />
          <StatusBadge status={post.status} />
          <Badge
            className="capitalize"
            style={{ backgroundColor: `${pillarColor}20`, color: pillarColor, border: `1px solid ${pillarColor}40` } as React.CSSProperties}
          >
            {post.pillar.replace("_", " ")}
          </Badge>
          {post.flaggedForReview && (
            <Badge variant="yellow">⚠ Review</Badge>
          )}
        </div>
        <span className="text-xs text-brand-gray-400 whitespace-nowrap">
          {post.scheduledAt
            ? `🕐 ${format(new Date(post.scheduledAt), "MMM d, HH:mm")}`
            : post.publishedAt
            ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
            : "Unscheduled"}
        </span>
      </div>

      {/* Performance score badge */}
      {post.performanceScore !== undefined && post.performanceScore !== null && (
        <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${
          post.performanceScore >= 7 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : post.performanceScore >= 5 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {post.performanceScore >= 7 ? "🔥" : post.performanceScore >= 5 ? "📈" : "📉"}
          {post.performanceScore}/10
        </div>
      )}
      {/* Hook */}
      {post.hook && !compact && (
        <div className="mb-2 text-xs bg-brand-red/10 border border-brand-red/20 rounded-md px-3 py-1.5 text-brand-red font-medium">
          🎣 Hook: {post.hook}
        </div>
      )}

      {/* Caption */}
      <p className={`text-brand-gray-200 text-sm leading-relaxed ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
        {post.caption}
      </p>

      {/* Audio */}
      {post.audioTrack && !compact && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-gray-400">
          <span>🎵</span>
          <span>{post.audioTrack}</span>
        </div>
      )}

      {/* Hashtags */}
      {!compact && post.hashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {post.hashtags.slice(0, 5).map((tag) => (
            <span key={tag} className="text-xs text-brand-gray-400 hover:text-brand-red transition-colors">
              #{tag}
            </span>
          ))}
          {post.hashtags.length > 5 && (
            <span className="text-xs text-brand-gray-600">+{post.hashtags.length - 5}</span>
          )}
        </div>
      )}

      {/* Metrics */}
      {latestMetrics && (
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-brand-gray-700 pt-3">
          {[
            { label: "Views", value: fmtNum(latestMetrics.views) },
            { label: "Likes", value: fmtNum(latestMetrics.likes) },
            { label: "Shares", value: fmtNum(latestMetrics.shares) },
            { label: "Eng.", value: `${(latestMetrics.engagementRate ?? 0).toFixed(1)}%` },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-white text-sm font-semibold">{m.value}</p>
              <p className="text-brand-gray-400 text-xs">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Predicted score */}
      {post.predictedScore !== null && post.predictedScore !== undefined && !latestMetrics && (
        <div className="mt-3 flex items-center gap-2 text-xs text-brand-gray-400">
          <span>Predicted score:</span>
          <ScoreBar score={post.predictedScore} />
          <span>{post.predictedScore}/10</span>
        </div>
      )}

      {/* AI reasoning */}
      {post.aiReasoning && !compact && (
        <details className="mt-3 group">
          <summary className="text-xs text-brand-gray-400 cursor-pointer hover:text-white transition-colors">
            🤖 AI Reasoning
          </summary>
          <p className="mt-1.5 text-xs text-brand-gray-400 bg-brand-gray-800 rounded-lg p-2.5 leading-relaxed">
            {post.aiReasoning}
          </p>
        </details>
      )}

      {/* Media URL section */}
      {(onApprove || onReject) && post.approvalStatus === "PENDING" && !compact && (
        <div className="mt-3 border-t border-brand-gray-700 pt-3">
          <button
            type="button"
            onClick={() => setMediaOpen((o) => !o)}
            className="flex items-center gap-2 text-xs w-full text-left hover:opacity-80 transition-opacity"
          >
            <span className={hasMedia ? "text-emerald-400" : "text-yellow-400"}>
              {hasMedia ? "✅" : "⚠️"}
            </span>
            <span className={hasMedia ? "text-emerald-400" : "text-yellow-400 font-medium"}>
              {mediaSaved
                ? "Media saved!"
                : hasMedia
                ? "Media attached — click to change"
                : "No media attached — post will fail to publish"}
            </span>
            <span className="ml-auto text-brand-gray-500">{mediaOpen ? "▲" : "▼"}</span>
          </button>

          {mediaOpen && (
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-xs text-brand-gray-400 mb-1">
                  Video URL <span className="text-brand-gray-500">(required — Cloudinary, S3, or direct link)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/... or https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-md px-3 py-1.5 text-xs text-white placeholder-brand-gray-500 focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-gray-400 mb-1">
                  Thumbnail URL <span className="text-brand-gray-500">(optional — cover image)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={thumbUrl}
                  onChange={(e) => setThumbUrl(e.target.value)}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-md px-3 py-1.5 text-xs text-white placeholder-brand-gray-500 focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={saveMedia}
                  loading={mediaSaving}
                  className="flex-1"
                >
                  💾 Save URLs
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={generateAiVideo}
                  loading={generating}
                  className="flex-1"
                  title="Generate a video with Higgsfield AI using this post’s visual brief"
                >
                  {genStatus === "queued" && "⏳ Queued..."}
                  {genStatus === "in_progress" && "🎬 Generating..."}
                  {genStatus === "completed" && "✅ Done!"}
                  {genStatus === "failed" && "❌ Failed"}
                  {genStatus === "idle" && "🤖 AI Video"}
                </Button>
              </div>
              {genStatus !== "idle" && genStatus !== "completed" && genStatus !== "failed" && (
                <p className="text-xs text-brand-gray-500 text-center">
                  Higgsfield is rendering your video — this takes 30–120 seconds. Page will update automatically.
                </p>
              )}
              {genStatus === "failed" && (
                <p className="text-xs text-red-400 text-center">
                  Generation failed. Check HIGGSFIELD_API_KEY is set in Vercel env vars.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Approval actions */}
      {(onApprove || onReject) && post.approvalStatus === "PENDING" && (
        <div className="mt-3 flex gap-2 border-t border-brand-gray-700 pt-3">
          {onApprove && (
            <Button size="sm" variant="success" onClick={() => onApprove(post.id)} className="flex-1">
              ✓ Approve
            </Button>
          )}
          {onReject && (
            <Button size="sm" variant="danger" onClick={() => onReject(post.id)} className="flex-1">
              ✕ Reject
            </Button>
          )}
        </div>
      )}
    </Card>
  );

  return post.permalink ? (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "block", textDecoration: "none", cursor: "pointer" }}
    >
      {inner}
    </a>
  ) : (
    inner
  );
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "#10B981" : score >= 5 ? "#F59E0B" : "#E31E24";
  return (
    <div className="flex-1 h-1.5 bg-brand-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
