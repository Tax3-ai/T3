"use client";

import { useState } from "react";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/Button";
import type { Post } from "@/types";

interface ApprovalQueueProps {
  posts: Post[];
  onUpdate: () => void;
}

export function ApprovalQueue({ posts, onUpdate }: ApprovalQueueProps) {
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  async function handleAction(postId: string, action: "approve" | "reject", notes?: string) {
    setProcessing((s) => new Set(s).add(postId));
    try {
      await fetch(`/api/posts/${postId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      onUpdate();
    } finally {
      setProcessing((s) => {
        const next = new Set(s);
        next.delete(postId);
        return next;
      });
    }
  }

  async function approveAll() {
    for (const post of posts) {
      await handleAction(post.id, "approve");
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-brand-gray-400">
        <span className="text-4xl block mb-3">✅</span>
        <p className="font-medium">All clear — no posts awaiting approval.</p>
        <p className="text-sm mt-1">New AI-generated posts will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-brand-gray-400">
          {posts.length} post{posts.length !== 1 ? "s" : ""} awaiting your review
        </p>
        <Button size="sm" variant="success" onClick={approveAll}>
          Approve All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <div key={post.id} className={processing.has(post.id) ? "opacity-50 pointer-events-none" : ""}>
            <PostCard
              post={post}
              onApprove={(id) => handleAction(id, "approve")}
              onReject={(id) => handleAction(id, "reject")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
