"use client";

import { useEffect, useState } from "react";
import { ContentCalendar } from "@/components/calendar/ContentCalendar";
import type { Post } from "@/types";

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/posts?limit=100")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []));
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Content Calendar</h1>
        <p className="text-brand-gray-400 text-sm mt-0.5">
          7-day rolling schedule — 3 posts/day per platform
        </p>
      </div>

      {/* Platform legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span>📸</span>
          <span className="text-brand-gray-400">Instagram — 09:00, 13:00, 18:00 GMT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🎵</span>
          <span className="text-brand-gray-400">TikTok — 08:00, 12:30, 18:30 GMT</span>
        </div>
      </div>

      <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-xl p-4">
        <ContentCalendar posts={posts} />
      </div>
    </div>
  );
}
