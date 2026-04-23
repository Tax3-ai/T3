"use client";

import { PlatformBadge, StatusBadge, Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow, format } from "date-fns";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post & { metrics?: Array<{ views: number; likes: number; shares: number; saves: number; engagementRate?: number | null; checkpointHours: number }> };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  compact?: boolean;
}

const PILLAR_COLORS: Record<string, string> = {
  lifestyle: "#8B5CF6",
  behind_scenes: "#F59E0B",
  campaign: "#E31E24",
  community: "#10B981",
  events: "#3B82F6",
};

export function PostCard({ post, onApprove, onReject, compact }: PostCardProps) {
  const latestMetrics = post.metrics?.sort((a, b) => b.checkpointHours - a.checkpointHours)[0];
  const pillarColor = PILLAR_COLORS[post.pillar] ?? "#888";

  return (
    <Card
      className={compact ? "p-3" : "p-4"}
      hover={!!onApprove}
    >
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
