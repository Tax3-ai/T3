"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListAnalyticsPanel } from "@/components/email/ListAnalyticsPanel";
import { StrategyPanel } from "@/components/email/StrategyPanel";
import { CampaignCard } from "@/components/email/CampaignCard";
import type { EmailCampaign, EmailCampaignGoal, EmailStrategyReport, ListAnalyticsSummary } from "@/types";

type Tab = "overview" | "strategy" | "campaigns";

const GOALS: { value: EmailCampaignGoal; label: string }[] = [
  { value: "MONETIZATION", label: "Monetization" },
  { value: "WINBACK", label: "Win-Back" },
  { value: "VIP", label: "VIP / Loyalty" },
  { value: "RETENTION", label: "Retention" },
  { value: "WELCOME", label: "Welcome" },
  { value: "REPLENISHMENT", label: "Replenishment" },
  { value: "LAUNCH", label: "Launch" },
];

export default function EmailAgentPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [analytics, setAnalytics] = useState<ListAnalyticsSummary | null>(null);
  const [reports, setReports] = useState<EmailStrategyReport[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isGeneratingFlows, setIsGeneratingFlows] = useState(false);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [goal, setGoal] = useState<EmailCampaignGoal>("MONETIZATION");
  const [segment, setSegment] = useState<string>("All subscribers");
  const [instructions, setInstructions] = useState("");

  const load = useCallback(async () => {
    const [analyticsRes, reportsRes, campaignsRes] = await Promise.all([
      fetch("/api/email/analytics"),
      fetch("/api/email/strategy"),
      fetch("/api/email/campaigns"),
    ]);
    setAnalytics(await analyticsRes.json());
    setReports(await reportsRes.json());
    setCampaigns(await campaignsRes.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generateStrategy() {
    setIsGeneratingStrategy(true);
    try {
      const res = await fetch("/api/email/strategy", { method: "POST" });
      if (res.ok) {
        setTab("strategy");
        await load();
      }
    } finally {
      setIsGeneratingStrategy(false);
    }
  }

  async function generateFlows() {
    setIsGeneratingFlows(true);
    try {
      await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flows: true }),
      });
      setTab("campaigns");
      await load();
    } finally {
      setIsGeneratingFlows(false);
    }
  }

  async function generateCampaign() {
    setIsGeneratingCampaign(true);
    try {
      await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "CAMPAIGN", goal, segment, instructions }),
      });
      setInstructions("");
      await load();
    } finally {
      setIsGeneratingCampaign(false);
    }
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    await fetch(`/api/email/campaigns/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
  }

  const pending = campaigns.filter((c) => c.approvalStatus === "PENDING");
  const decided = campaigns.filter((c) => c.approvalStatus !== "PENDING");
  const segmentOptions = ["All subscribers", ...(analytics?.segments.map((s) => s.name) ?? [])];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Email Marketing Agent</h1>
          <p className="text-brand-gray-400 text-sm mt-0.5">
            Monetize your list, design campaigns, and build retention flows from real purchase data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={generateFlows} loading={isGeneratingFlows}>
            ⚙ Generate Lifecycle Flows
          </Button>
          <Button size="sm" variant="primary" onClick={generateStrategy} loading={isGeneratingStrategy}>
            📊 Generate Strategy Report
          </Button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-brand-gray-700">
        {([
          ["overview", "Overview"],
          ["strategy", "Strategy"],
          ["campaigns", `Campaigns${pending.length > 0 ? ` (${pending.length})` : ""}`],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? "border-brand-red text-white"
                : "border-transparent text-brand-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" &&
        (analytics ? (
          <ListAnalyticsPanel analytics={analytics} />
        ) : (
          <p className="text-brand-gray-400 text-sm">Loading list analytics...</p>
        ))}

      {tab === "strategy" && (
        reports.length === 0 ? (
          <div className="text-center py-16 bg-brand-gray-900 rounded-xl border border-brand-gray-700">
            <span className="text-4xl block mb-3">📊</span>
            <p className="text-brand-gray-400 text-sm">No strategy report yet.</p>
            <p className="text-brand-gray-600 text-xs mt-1">
              Generate one to get monetization ideas and a retention plan based on your current list.
            </p>
            <Button className="mt-4" size="sm" onClick={generateStrategy} loading={isGeneratingStrategy}>
              Generate First Report
            </Button>
          </div>
        ) : (
          <StrategyPanel report={reports[0]} />
        )
      )}

      {tab === "campaigns" && (
        <div className="space-y-8">
          <Card className="p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Draft a Campaign</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-brand-gray-400 mb-1">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as EmailCampaignGoal)}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-red transition-colors"
                >
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-brand-gray-400 mb-1">Target Segment</label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-red transition-colors"
                >
                  {segmentOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Optional brief — e.g. a specific product, offer, or occasion to tie this campaign to"
              rows={2}
              className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-brand-gray-500 focus:outline-none focus:border-brand-red transition-colors mb-3"
            />
            <Button size="sm" onClick={generateCampaign} loading={isGeneratingCampaign}>
              ✨ Generate Campaign
            </Button>
          </Card>

          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Awaiting Review ({pending.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onApprove={(id) => handleAction(id, "approve")}
                    onReject={(id) => handleAction(id, "reject")}
                  />
                ))}
              </div>
            </div>
          )}

          {decided.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                History ({decided.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {decided.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </div>
            </div>
          )}

          {campaigns.length === 0 && (
            <div className="text-center py-16 text-brand-gray-400">
              <span className="text-4xl block mb-3">✉️</span>
              <p className="font-medium">No campaigns yet.</p>
              <p className="text-sm mt-1">Draft one above, or generate the full lifecycle flow set.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
