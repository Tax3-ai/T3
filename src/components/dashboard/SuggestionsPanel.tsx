"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlatformBadge, Badge } from "@/components/ui/Badge";
import type { ContentSuggestion } from "@/types";

interface SuggestionsPanelProps {
  suggestions: ContentSuggestion[];
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function SuggestionsPanel({
  suggestions,
  onAccept,
  onDismiss,
  onRefresh,
  isRefreshing,
}: SuggestionsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">AI Suggestions</h3>
        <Button size="sm" variant="ghost" onClick={onRefresh} loading={isRefreshing}>
          Refresh
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-brand-gray-400 text-sm">No suggestions yet.</p>
          <Button size="sm" variant="secondary" onClick={onRefresh} className="mt-3" loading={isRefreshing}>
            Generate Suggestions
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.slice(0, 5).map((s, i) => (
            <div
              key={s.id}
              className="border border-brand-gray-700 rounded-lg p-3 hover:border-brand-gray-600 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-brand-gray-400">#{i + 1}</span>
                    <PlatformBadge platform={s.platform} />
                    <Badge className="capitalize text-xs" variant="default">
                      {s.pillar.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-white text-sm font-medium line-clamp-1">{s.hook}</p>
                  <p className="text-brand-gray-400 text-xs mt-0.5 line-clamp-2">{s.captionDraft}</p>
                </div>
              </div>

              {expanded === s.id && (
                <div className="mt-2 space-y-2 text-xs">
                  {s.audioSuggestion && (
                    <p className="text-brand-gray-400">🎵 Audio: {s.audioSuggestion}</p>
                  )}
                  <p className="text-brand-gray-400">🎬 Visual: {s.visualNotes}</p>
                  <p className="text-emerald-400 bg-emerald-500/10 rounded p-2">{s.reasoning}</p>
                  {s.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.hashtags.map((h) => (
                        <span key={h} className="text-brand-gray-400">#{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2 flex items-center gap-2">
                <button
                  className="text-xs text-brand-gray-400 hover:text-white"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  {expanded === s.id ? "▲ Less" : "▼ Details"}
                </button>
                <div className="flex-1" />
                <Button size="sm" variant="danger" onClick={() => onDismiss(s.id)}>
                  Skip
                </Button>
                <Button size="sm" variant="success" onClick={() => onAccept(s.id)}>
                  Use this
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
