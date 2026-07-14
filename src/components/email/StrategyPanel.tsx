"use client";

import { Card } from "@/components/ui/Card";
import type { EmailStrategyReport } from "@/types";
import { format } from "date-fns";

export function StrategyPanel({ report }: { report: EmailStrategyReport }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-brand-gray-500">
        Generated {format(new Date(report.createdAt), "d MMM yyyy, HH:mm")} · list size {report.listSize} ·
        repeat rate {(report.repeatPurchaseRate * 100).toFixed(1)}%
      </p>

      <Card className="p-4 border-brand-red/20">
        <h3 className="text-brand-red font-semibold text-sm mb-2 flex items-center gap-1.5">
          💰 Monetization Ideas
        </h3>
        <ol className="space-y-2">
          {report.monetizationIdeas.map((idea, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-brand-red font-bold shrink-0">{i + 1}.</span>
              <span className="text-brand-gray-200">{idea}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-4 border-emerald-500/20">
        <h3 className="text-emerald-400 font-semibold text-sm mb-3 flex items-center gap-1.5">
          🔁 Retention & Lifecycle Plan
        </h3>
        <div className="space-y-3">
          {report.retentionPlan.map((flow, i) => (
            <div key={i} className="text-sm border-l-2 border-emerald-500/30 pl-3">
              <p className="text-white font-medium">{flow.flow}</p>
              <p className="text-brand-gray-400 text-xs mt-0.5">⏱ Trigger: {flow.trigger}</p>
              <p className="text-brand-gray-200 text-xs mt-0.5">{flow.goal}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-white font-semibold text-sm mb-3">🎯 Next Actions</h3>
        <ol className="space-y-2">
          {report.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-brand-red font-bold shrink-0">{i + 1}.</span>
              <span className="text-brand-gray-200">{rec}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
