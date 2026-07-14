import Anthropic from "@anthropic-ai/sdk";
import { getBrandBibleAsPromptContext } from "./brand-bible";
import { prisma } from "./prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DAY_MS = 1000 * 60 * 60 * 24;

interface CustomerSummary {
  email: string;
  name: string | null;
  orderCount: number;
  totalSpent: number;
  firstOrderAt: Date;
  lastOrderAt: Date;
  daysSinceLastOrder: number;
}

export interface ListSegment {
  name: string;
  count: number;
  revenue: number;
  description: string;
}

export interface ListAnalytics {
  listSize: number;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  repeatPurchaseRate: number;
  estimatedLtv: number;
  segments: ListSegment[];
  segmentedCustomers: Record<string, CustomerSummary[]>;
}

async function summariseCustomers(): Promise<CustomerSummary[]> {
  const orders = await prisma.shopifyOrder.findMany({
    where: { customerEmail: { not: null } },
    select: { customerEmail: true, customerName: true, totalPrice: true, createdAt: true },
  });

  const byEmail = new Map<string, CustomerSummary>();
  const now = Date.now();

  for (const o of orders) {
    const email = o.customerEmail!;
    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, {
        email,
        name: o.customerName,
        orderCount: 1,
        totalSpent: o.totalPrice,
        firstOrderAt: o.createdAt,
        lastOrderAt: o.createdAt,
        daysSinceLastOrder: 0,
      });
    } else {
      existing.orderCount += 1;
      existing.totalSpent += o.totalPrice;
      if (o.createdAt < existing.firstOrderAt) existing.firstOrderAt = o.createdAt;
      if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
    }
  }

  const customers = Array.from(byEmail.values());
  for (const c of customers) {
    c.daysSinceLastOrder = Math.floor((now - c.lastOrderAt.getTime()) / DAY_MS);
  }
  return customers;
}

export async function getListAnalytics(): Promise<ListAnalytics> {
  const customers = await summariseCustomers();

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0);
  const listSize = customers.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const repeatCustomers = customers.filter((c) => c.orderCount >= 2).length;
  const repeatPurchaseRate = listSize > 0 ? repeatCustomers / listSize : 0;
  const estimatedLtv = listSize > 0 ? totalRevenue / listSize : 0;

  // VIP threshold: 80th percentile of total spend
  const sortedSpend = [...customers].map((c) => c.totalSpent).sort((a, b) => a - b);
  const vipThreshold =
    sortedSpend.length > 0 ? sortedSpend[Math.floor(sortedSpend.length * 0.8)] : Infinity;
  const isVip = (c: CustomerSummary) => c.orderCount >= 3 || c.totalSpent >= vipThreshold;

  const buckets: Record<string, CustomerSummary[]> = {
    "VIP Win-Back": [],
    "VIP Customers": [],
    "Lapsed / Churned": [],
    "At Risk": [],
    "Repeat Customers": [],
    "New Customers": [],
  };

  for (const c of customers) {
    if (isVip(c) && c.daysSinceLastOrder > 90) buckets["VIP Win-Back"].push(c);
    else if (isVip(c)) buckets["VIP Customers"].push(c);
    else if (c.daysSinceLastOrder > 180) buckets["Lapsed / Churned"].push(c);
    else if (c.daysSinceLastOrder > 90) buckets["At Risk"].push(c);
    else if (c.orderCount >= 2) buckets["Repeat Customers"].push(c);
    else buckets["New Customers"].push(c);
  }

  const descriptions: Record<string, string> = {
    "VIP Win-Back": "Your highest-value customers who haven't ordered in 90+ days — top revenue-per-send priority.",
    "VIP Customers": "3+ orders or top 20% by spend, active in the last 90 days — protect and reward these.",
    "Lapsed / Churned": "No order in 180+ days — needs a strong reactivation offer or can be suppressed to protect deliverability.",
    "At Risk": "No order in 90-180 days — early churn signal, good window for a nudge before they lapse fully.",
    "Repeat Customers": "2+ orders, active in the last 90 days — nurture toward VIP with cross-sell/upsell.",
    "New Customers": "One order, active in the last 90 days — needs onboarding/nurture to drive the second purchase.",
  };

  const segments: ListSegment[] = Object.entries(buckets).map(([name, list]) => ({
    name,
    count: list.length,
    revenue: Math.round(list.reduce((s, c) => s + c.totalSpent, 0) * 100) / 100,
    description: descriptions[name],
  }));

  return {
    listSize,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    repeatPurchaseRate: Math.round(repeatPurchaseRate * 1000) / 1000,
    estimatedLtv: Math.round(estimatedLtv * 100) / 100,
    segments,
    segmentedCustomers: buckets,
  };
}

function stripJsonFence(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

export async function generateEmailStrategyReport() {
  const brandContext = await getBrandBibleAsPromptContext();
  const analytics = await getListAnalytics();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3072,
    system:
      "You are a senior email/CRM strategist for a premium streetwear ecommerce brand. Return valid JSON only — no markdown, no explanation outside the JSON.",
    messages: [
      {
        role: "user",
        content: `${brandContext}

CURRENT LIST & PURCHASE DATA:
- List size (customers with a known email): ${analytics.listSize}
- Total historic revenue: £${analytics.totalRevenue}
- Total orders: ${analytics.totalOrders}
- Average order value: £${analytics.avgOrderValue}
- Repeat purchase rate: ${(analytics.repeatPurchaseRate * 100).toFixed(1)}%
- Estimated revenue per customer to date: £${analytics.estimatedLtv}

SEGMENTS:
${analytics.segments.map((s) => `- ${s.name}: ${s.count} customers, £${s.revenue} lifetime revenue — ${s.description}`).join("\n")}

Your task: produce a monetization and retention strategy for this list. Be specific and revenue-focused, not generic email marketing advice — tie every idea to the segments and numbers above.

Return JSON:
{
  "monetizationIdeas": ["5-7 specific, prioritised ways to generate revenue from this list right now, each naming the segment it targets and the offer mechanic"],
  "retentionPlan": [
    { "flow": "e.g. VIP Win-Back", "trigger": "e.g. 90 days since last order + top 20% lifetime spend", "goal": "what this flow is trying to achieve and for which segment" }
  ],
  "recommendations": ["5 concrete next actions ranked by expected revenue impact, most impactful first"]
}

The retentionPlan should cover the standard lifecycle: welcome/onboarding, post-purchase, replenishment/repeat-purchase nudge, VIP/loyalty, and win-back — mapped to the real segments above.`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "{}";
  const data = JSON.parse(stripJsonFence(raw)) as {
    monetizationIdeas?: string[];
    retentionPlan?: Array<{ flow: string; trigger: string; goal: string }>;
    recommendations?: string[];
  };

  const report = await prisma.emailStrategyReport.create({
    data: {
      listSize: analytics.listSize,
      repeatPurchaseRate: analytics.repeatPurchaseRate,
      avgOrderValue: analytics.avgOrderValue,
      estimatedLtv: analytics.estimatedLtv,
      segments: JSON.stringify(analytics.segments),
      monetizationIdeas: JSON.stringify(data.monetizationIdeas ?? []),
      retentionPlan: JSON.stringify(data.retentionPlan ?? []),
      recommendations: JSON.stringify(data.recommendations ?? []),
    },
  });

  return parseStrategyReport(report);
}

export function parseStrategyReport(r: {
  id: string;
  listSize: number;
  repeatPurchaseRate: number;
  avgOrderValue: number;
  estimatedLtv: number;
  segments: string;
  monetizationIdeas: string;
  retentionPlan: string;
  recommendations: string;
  createdAt: Date;
}) {
  return {
    ...r,
    segments: JSON.parse(r.segments),
    monetizationIdeas: JSON.parse(r.monetizationIdeas),
    retentionPlan: JSON.parse(r.retentionPlan),
    recommendations: JSON.parse(r.recommendations),
  };
}

interface GenerateCampaignRequest {
  type: "CAMPAIGN" | "FLOW";
  goal: "MONETIZATION" | "RETENTION" | "WINBACK" | "WELCOME" | "VIP" | "REPLENISHMENT" | "LAUNCH";
  segment: string;
  instructions?: string;
  flowTrigger?: string;
  flowStepOrder?: number;
}

const GOAL_GUIDE: Record<GenerateCampaignRequest["goal"], string> = {
  MONETIZATION: "Drive immediate revenue — a compelling offer, urgency, and a clear single CTA to buy.",
  RETENTION: "Keep the brand top of mind and build loyalty without necessarily discounting — value, story, community.",
  WINBACK: "Re-engage someone who has gone quiet. Acknowledge the gap honestly, lead with a strong incentive to return.",
  WELCOME: "First impression for a new subscriber/customer — set expectations, brand story, a light incentive for a first/second purchase.",
  VIP: "Make top-spending customers feel recognised — early access, exclusivity, a reward, not a generic discount blast.",
  REPLENISHMENT: "Prompt a repeat purchase of something they've likely run out of or want to restock.",
  LAUNCH: "Build hype and convert for a new product/collection drop.",
};

export async function generateCampaign(req: GenerateCampaignRequest) {
  const brandContext = await getBrandBibleAsPromptContext();
  const analytics = await getListAnalytics();
  const segmentData = analytics.segments.find((s) => s.name === req.segment);

  const prompt = `You are the email/CRM strategist for Tax3, a premium London streetwear brand.

${brandContext}

TARGET SEGMENT: ${req.segment}
${segmentData ? `Segment size: ${segmentData.count} customers. Lifetime revenue from this segment: £${segmentData.revenue}. ${segmentData.description}` : ""}

CAMPAIGN TYPE: ${req.type === "FLOW" ? "Automated lifecycle flow email" : "One-off broadcast campaign"}
GOAL: ${req.goal} — ${GOAL_GUIDE[req.goal]}
${req.flowTrigger ? `FLOW TRIGGER: ${req.flowTrigger}` : ""}
${req.instructions ? `EXTRA BRIEF: ${req.instructions}` : ""}

Write ONE email. Use {{first_name}} as the merge tag for personalisation where natural. Sound authentically Tax3 — the brand voice above, not generic ecommerce email copy.

Return a JSON object with EXACTLY this structure:
{
  "name": "Short internal campaign name",
  "subjectLines": ["3 subject line variants for A/B testing, each under 50 characters"],
  "preheader": "Preview text, under 90 characters, complements (doesn't repeat) the subject line",
  "body": "Full email body copy with line breaks (\\n\\n between blocks). Should read like a real Tax3 email — hook, value/story, offer if relevant, CTA. 120-250 words.",
  "cta": "The single primary call-to-action button text",
  "reasoning": "Why this angle/offer will work for this segment specifically",
  "predictedImpact": "A concrete, honest prediction of expected outcome (e.g. open rate driver, likely conversion behaviour) — not a fabricated stat"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1536,
    system:
      "You are an expert ecommerce email copywriter and CRM strategist. Always respond with valid JSON only — no markdown, no explanation outside the JSON.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  let data: {
    name?: string;
    subjectLines?: string[];
    preheader?: string;
    body?: string;
    cta?: string;
    reasoning?: string;
    predictedImpact?: string;
  };
  try {
    data = JSON.parse(stripJsonFence(text));
  } catch {
    const retryResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1536,
      system: "You are a JSON repair assistant. Return only valid JSON — no markdown, no explanation.",
      messages: [{ role: "user", content: `Fix this invalid JSON and return only the corrected JSON:\n\n${text}` }],
    });
    const retryText = retryResponse.content[0].type === "text" ? retryResponse.content[0].text : "{}";
    data = JSON.parse(stripJsonFence(retryText));
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      type: req.type,
      goal: req.goal,
      segment: req.segment,
      name: data.name ?? `${req.goal} — ${req.segment}`,
      subjectLines: JSON.stringify(data.subjectLines ?? []),
      preheader: data.preheader ?? "",
      body: data.body ?? "",
      cta: data.cta ?? "Shop Now",
      flowTrigger: req.flowTrigger ?? null,
      flowStepOrder: req.flowStepOrder ?? null,
      status: "PENDING_APPROVAL",
      approvalStatus: "PENDING",
      aiReasoning: data.reasoning ?? null,
      predictedImpact: data.predictedImpact ?? null,
    },
  });

  return parseCampaign(campaign);
}

const LIFECYCLE_FLOWS: Array<{
  goal: GenerateCampaignRequest["goal"];
  segment: string;
  flowTrigger: string;
  flowStepOrder: number;
  instructions: string;
}> = [
  {
    goal: "WELCOME",
    segment: "New Customers",
    flowTrigger: "Immediately after first purchase or signup",
    flowStepOrder: 1,
    instructions: "Welcome them to Tax3, set the tone, tease what's coming.",
  },
  {
    goal: "REPLENISHMENT",
    segment: "New Customers",
    flowTrigger: "14 days after first purchase",
    flowStepOrder: 2,
    instructions: "Nudge toward a second purchase — show complementary products, no heavy discount yet.",
  },
  {
    goal: "VIP",
    segment: "VIP Customers",
    flowTrigger: "When a customer crosses the VIP threshold (3rd order or top 20% spend)",
    flowStepOrder: 1,
    instructions: "Recognise their status, give early access framing, make them feel like an insider.",
  },
  {
    goal: "RETENTION",
    segment: "At Risk",
    flowTrigger: "90 days since last order",
    flowStepOrder: 1,
    instructions: "Light-touch check-in before they fully lapse — remind them why they loved Tax3, no discount needed yet.",
  },
  {
    goal: "WINBACK",
    segment: "Lapsed / Churned",
    flowTrigger: "180 days since last order",
    flowStepOrder: 1,
    instructions: "Honest 'we miss you' reactivation with a strong, time-limited incentive to come back.",
  },
  {
    goal: "WINBACK",
    segment: "VIP Win-Back",
    flowTrigger: "90 days since last order, customer is VIP tier",
    flowStepOrder: 1,
    instructions: "This is your highest-value lapsed segment — a more generous, personal offer than the standard win-back.",
  },
];

export async function generateLifecycleFlows() {
  const results = [];
  for (const flow of LIFECYCLE_FLOWS) {
    const campaign = await generateCampaign({
      type: "FLOW",
      goal: flow.goal,
      segment: flow.segment,
      flowTrigger: flow.flowTrigger,
      flowStepOrder: flow.flowStepOrder,
      instructions: flow.instructions,
    });
    results.push(campaign);
  }
  return results;
}

export function parseCampaign(c: {
  id: string;
  type: string;
  goal: string;
  segment: string;
  name: string;
  subjectLines: string;
  preheader: string;
  body: string;
  cta: string;
  flowTrigger: string | null;
  flowStepOrder: number | null;
  status: string;
  approvalStatus: string;
  approvalNotes: string | null;
  aiReasoning: string | null;
  predictedImpact: string | null;
  estimatedRevenue: number | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...c,
    subjectLines: JSON.parse(c.subjectLines ?? "[]"),
  };
}
