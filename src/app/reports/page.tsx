"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { StrategyReport } from "@/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<StrategyReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selected, setSelected] = useState<StrategyReport | null>(null);

  async function load() {
    const res = await fetch("/api/strategy");
    const data = await res.json();
    setReports(data);
    if (data.length > 0 && !selected) setSelected(data[0]);
  }

  useEffect(() => {
    load();
  }, []);

  async function generateReport() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/strategy", { method: "POST" });
      const report = await res.json();
      setReports((prev) => [report, ...prev]);
      setSelected(report);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Weekly Reports</h1>
          <p className="text-brand-gray-400 text-sm mt-0.5">
            AI-generated strategy insights. Auto-generated every Monday at 8am GMT.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={generateReport}
          loading={isGenerating}
        >
          Generate Report Now
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="space-y-2">
          {reports.length === 0 ? (
            <p className="text-brand-gray-400 text-sm">No reports yet.</p>
          ) : (
            reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                  selected?.id === r.id
                    ? "border-brand-red bg-brand-red/10 text-white"
                    : "border-brand-gray-700 bg-brand-gray-900 text-brand-gray-400 hover:border-brand-gray-600"
                }`}
              >
                <p className="font-medium">Week of {format(new Date(r.weekStarting), "d MMM")}</p>
                <p className="text-xs mt-0.5 opacity-60">
                  {r.totalPosts} posts published
                </p>
              </button>
            ))
          )}
        </div>

        {/* Report content */}
        <div className="lg:col-span-3">
          {selected ? (
            <ReportDetail report={selected} />
          ) : (
            <div className="text-center py-16 bg-brand-gray-900 rounded-xl border border-brand-gray-700">
              <span className="text-4xl block mb-3">📊</span>
              <p className="text-brand-gray-400 text-sm">No reports yet.</p>
              <p className="text-brand-gray-600 text-xs mt-1">
                Reports are auto-generated every Monday, or you can generate one manually.
              </p>
              <Button
                className="mt-4"
                size="sm"
                onClick={generateReport}
                loading={isGenerating}
              >
                Generate First Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportDetail({ report }: { report: StrategyReport }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Week of {format(new Date(report.weekStarting), "d MMMM yyyy")}
        </h2>
        <div className="flex gap-4 text-sm text-brand-gray-400">
          <span>{report.totalPosts} posts</span>
          <span>{Math.round(report.avgViews).toLocaleString()} avg views</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 border-emerald-500/20">
          <h3 className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-1.5">
            ✅ Wins
          </h3>
          <p className="text-brand-gray-200 text-sm leading-relaxed">{report.wins}</p>
        </Card>

        <Card className="p-4 border-red-500/20">
          <h3 className="text-brand-red font-semibold text-sm mb-2 flex items-center gap-1.5">
            📉 What Missed
          </h3>
          <p className="text-brand-gray-200 text-sm leading-relaxed">{report.losses}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2">🔍 Insights</h3>
        <p className="text-brand-gray-200 text-sm leading-relaxed">{report.insights}</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2">📅 Next Week Direction</h3>
        <p className="text-brand-gray-200 text-sm leading-relaxed">{report.nextWeekPlan}</p>
      </Card>

      {report.recommendations.length > 0 && (
        <Card className="p-4">
          <h3 className="text-white font-semibold text-sm mb-3">🎯 Action Items</h3>
          <ol className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-brand-red font-bold shrink-0">{i + 1}.</span>
                <span className="text-brand-gray-200">{rec}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
