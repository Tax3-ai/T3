"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
} from "date-fns";
import { clsx } from "clsx";
import type { Post } from "@/types";

interface ContentCalendarProps {
  posts: Post[];
}

const PILLAR_COLORS: Record<string, string> = {
  lifestyle: "#8B5CF6",
  behind_scenes: "#F59E0B",
  campaign: "#E31E24",
  community: "#10B981",
  events: "#3B82F6",
};

export function ContentCalendar({ posts }: ContentCalendarProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getPostsForDay = (day: Date) =>
    posts.filter((p) =>
      p.scheduledAt && isSameDay(new Date(p.scheduledAt), day)
    ).sort((a, b) => {
      const aT = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const bT = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return aT - bT;
    });

  const SLOTS = ["09:00", "13:00", "18:00"];

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          className="text-sm text-brand-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-brand-gray-800 transition-colors"
        >
          ← Prev week
        </button>
        <span className="text-sm font-medium text-white">
          {format(weekStart, "d MMM")} – {format(addDays(weekStart, 6), "d MMM yyyy")}
        </span>
        <button
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="text-sm text-brand-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-brand-gray-800 transition-colors"
        >
          Next week →
        </button>
      </div>

      {/* Pillar legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {Object.entries(PILLAR_COLORS).map(([p, c]) => (
          <div key={p} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-brand-gray-400 capitalize">{p.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={clsx(
              "text-center text-xs pb-1",
              isToday(day) ? "text-brand-red font-bold" : "text-brand-gray-400"
            )}
          >
            <div>{format(day, "EEE")}</div>
            <div
              className={clsx(
                "w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-medium",
                isToday(day) && "bg-brand-red text-white"
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={clsx(
                "min-h-32 rounded-lg border p-1.5 flex flex-col gap-1",
                isToday(day)
                  ? "border-brand-red/40 bg-brand-red/5"
                  : "border-brand-gray-700 bg-brand-gray-900"
              )}
            >
              {/* Slot markers */}
              {SLOTS.map((slot) => {
                const slotHour = parseInt(slot);
                const slotPost = dayPosts.find((p) => {
                  if (!p.scheduledAt) return false;
                  return new Date(p.scheduledAt).getHours() === slotHour;
                });

                return (
                  <div key={slot} className="flex items-start gap-1 min-h-7">
                    <span className="text-[9px] text-brand-gray-600 w-8 shrink-0 mt-0.5">{slot}</span>
                    {slotPost ? (
                      <div
                        className="flex-1 rounded px-1 py-0.5 text-[10px] leading-tight truncate"
                        style={{
                          backgroundColor: `${PILLAR_COLORS[slotPost.pillar]}20`,
                          color: PILLAR_COLORS[slotPost.pillar],
                          borderLeft: `2px solid ${PILLAR_COLORS[slotPost.pillar]}`,
                        }}
                        title={slotPost.caption}
                      >
                        <span className="mr-0.5">
                          {slotPost.platform === "INSTAGRAM" ? "📸" : "🎵"}
                        </span>
                        {slotPost.hook?.slice(0, 20) || slotPost.caption.slice(0, 20)}
                      </div>
                    ) : (
                      <div className="flex-1 border border-dashed border-brand-gray-700 rounded h-5 opacity-30" />
                    )}
                  </div>
                );
              })}

              {/* Extra posts beyond 3 slots */}
              {dayPosts.length > 3 && (
                <p className="text-[10px] text-brand-gray-400 text-center">
                  +{dayPosts.length - 3} more
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Drop 2 highlight */}
      <div className="mt-4 p-3 rounded-lg border border-brand-red/30 bg-brand-red/5 flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-brand-red text-sm font-semibold">Drop 2 — June 16th</p>
          <p className="text-brand-gray-400 text-xs">Build anticipation now. 3 weeks of campaign content needed.</p>
        </div>
      </div>
    </div>
  );
}
