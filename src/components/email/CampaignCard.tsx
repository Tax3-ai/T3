"use client";

import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { EmailCampaign } from "@/types";

interface CampaignCardProps {
  campaign: EmailCampaign;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const GOAL_COLORS: Record<string, string> = {
  MONETIZATION: "#E31E24",
  RETENTION: "#10B981",
  WINBACK: "#F59E0B",
  WELCOME: "#3B82F6",
  VIP: "#8B5CF6",
  REPLENISHMENT: "#06B6D4",
  LAUNCH: "#EC4899",
};

export function CampaignCard({ campaign, onApprove, onReject }: CampaignCardProps) {
  const goalColor = GOAL_COLORS[campaign.goal] ?? "#888";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            style={{ backgroundColor: `${goalColor}20`, color: goalColor, border: `1px solid ${goalColor}40` } as React.CSSProperties}
          >
            {campaign.goal.replace("_", " ")}
          </Badge>
          <StatusBadge status={campaign.status} />
          {campaign.type === "FLOW" && (
            <Badge variant="blue">
              ⚙ Flow{campaign.flowStepOrder ? ` · Step ${campaign.flowStepOrder}` : ""}
            </Badge>
          )}
        </div>
      </div>

      <h3 className="text-white font-semibold text-sm mb-1">{campaign.name}</h3>
      <p className="text-xs text-brand-gray-400 mb-3">
        🎯 {campaign.segment}
        {campaign.flowTrigger && <> · ⏱ {campaign.flowTrigger}</>}
      </p>

      <div className="space-y-1.5 mb-3">
        {campaign.subjectLines.map((s, i) => (
          <div key={i} className="text-xs bg-brand-gray-800 rounded-md px-2.5 py-1.5 text-brand-gray-200">
            <span className="text-brand-gray-500 mr-1">{String.fromCharCode(65 + i)}:</span>
            {s}
          </div>
        ))}
      </div>

      {campaign.preheader && (
        <p className="text-xs text-brand-gray-500 italic mb-2">{campaign.preheader}</p>
      )}

      <p className="text-brand-gray-200 text-sm leading-relaxed whitespace-pre-line line-clamp-6">
        {campaign.body}
      </p>

      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-brand-red/10 text-brand-red border border-brand-red/20">
        {campaign.cta}
      </div>

      {campaign.aiReasoning && (
        <details className="mt-3 group">
          <summary className="text-xs text-brand-gray-400 cursor-pointer hover:text-white transition-colors">
            🤖 Why this angle
          </summary>
          <p className="mt-1.5 text-xs text-brand-gray-400 bg-brand-gray-800 rounded-lg p-2.5 leading-relaxed">
            {campaign.aiReasoning}
          </p>
          {campaign.predictedImpact && (
            <p className="mt-1.5 text-xs text-brand-gray-500 leading-relaxed">
              📊 {campaign.predictedImpact}
            </p>
          )}
        </details>
      )}

      {(onApprove || onReject) && campaign.approvalStatus === "PENDING" && (
        <div className="mt-3 flex gap-2 border-t border-brand-gray-700 pt-3">
          {onApprove && (
            <Button size="sm" variant="success" onClick={() => onApprove(campaign.id)} className="flex-1">
              ✓ Approve
            </Button>
          )}
          {onReject && (
            <Button size="sm" variant="danger" onClick={() => onReject(campaign.id)} className="flex-1">
              ✕ Reject
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
