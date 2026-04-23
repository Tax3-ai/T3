"use client";

import { useEffect, useState, useCallback } from "react";
import { ApprovalQueue } from "@/components/posts/ApprovalQueue";
import { Button } from "@/components/ui/Button";
import type { Post } from "@/types";

export default function ApprovalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/posts?status=PENDING_APPROVAL&limit=50");
    const data = await res.json();
    setPosts(data.posts ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generateNew(platform: "INSTAGRAM" | "TIKTOK", pillar: string, slot: string) {
    setIsGenerating(true);
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, pillar, slot }),
      });
      await load();
    } finally {
      setIsGenerating(false);
    }
  }

  const flagged = posts.filter((p) => p.flaggedForReview);
  const normal = posts.filter((p) => !p.flaggedForReview);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Approval Queue</h1>
          <p className="text-brand-gray-400 text-sm mt-0.5">
            Review AI-generated posts before they go live.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => generateNew("INSTAGRAM", "lifestyle", "morning")}
            loading={isGenerating}
          >
            + Instagram
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => generateNew("TIKTOK", "behind_scenes", "morning")}
            loading={isGenerating}
          >
            + TikTok
          </Button>
        </div>
      </div>

      {/* Flagged for review */}
      {flagged.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>⚠</span> Flagged for Review ({flagged.length})
            <span className="text-brand-gray-400 font-normal text-xs">Predicted to underperform — needs attention</span>
          </h2>
          <ApprovalQueue posts={flagged} onUpdate={load} />
        </div>
      )}

      {/* Normal queue */}
      <div>
        {flagged.length > 0 && (
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            All Posts ({normal.length})
          </h2>
        )}
        <ApprovalQueue posts={normal} onUpdate={load} />
      </div>
    </div>
  );
}
