import { prisma } from "./prisma";
import type { BrandBible } from "@/types";

function parseBible(raw: {
  id: string;
  brandName: string;
  tagline: string;
  originStory: string;
  mission: string;
  vision: string;
  personality: string;
  audience: string;
  voice: string;
  visual: string;
  contentPillars: string;
  competitors: string;
  redLines: string;
  offLimitPhrases: string;
  lovedPhrases: string;
  slogans: string;
  inspirationAccounts: string;
  avoidAccounts: string;
  topics: string;
  updatedAt: Date;
  createdAt: Date;
}): BrandBible {
  return {
    ...raw,
    personality: JSON.parse(raw.personality),
    audience: JSON.parse(raw.audience),
    voice: JSON.parse(raw.voice),
    visual: JSON.parse(raw.visual),
    contentPillars: JSON.parse(raw.contentPillars),
    competitors: JSON.parse(raw.competitors),
    redLines: JSON.parse(raw.redLines),
    offLimitPhrases: JSON.parse(raw.offLimitPhrases),
    lovedPhrases: JSON.parse(raw.lovedPhrases),
    slogans: JSON.parse(raw.slogans),
    inspirationAccounts: JSON.parse(raw.inspirationAccounts),
    avoidAccounts: JSON.parse(raw.avoidAccounts),
    topics: JSON.parse(raw.topics),
  };
}

export async function getBrandBible(): Promise<BrandBible | null> {
  const raw = await prisma.brandBible.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!raw) return null;
  return parseBible(raw);
}

export async function getBrandBibleAsPromptContext(): Promise<string> {
  const bible = await getBrandBible();
  if (!bible) return "No brand bible found.";

  return `
BRAND: ${bible.brandName}
TAGLINE: ${bible.tagline}
MISSION: ${bible.mission}

PERSONALITY: ${bible.personality.join(", ")}
TONE: ${bible.voice.humour}. ${bible.voice.formality}. Swearing: ${bible.voice.swearing ? "allowed" : "not allowed"}.
PERSON: ${bible.voice.person}

AUDIENCE: Ages ${bible.audience.ageRange}, based in ${bible.audience.locations.join(", ")}.
Aspirations: ${bible.audience.aspiration}. Pain point: ${bible.audience.painPoint}.
Slang: ${bible.audience.slang}.
Desired emotions: ${bible.audience.desiredEmotions.join(", ")}.

LOVED PHRASES: ${bible.lovedPhrases.join(", ")}
SLOGANS: ${bible.slogans.join(" | ")}
BANNED PHRASES: ${bible.offLimitPhrases.join(", ")}
OFF LIMIT TOPICS: ${bible.voice.offLimitTopics.join("; ")}

VISUAL RULES: ${bible.visual.rules.join("; ")}
AESTHETIC: ${bible.visual.aesthetic}
COLORS: Red (#E31E24), Black (#0A0A0A), White (#FFFFFF)

CONTENT PILLARS (with ratios):
${bible.contentPillars.map((p) => `- ${p.name} (${Math.round(p.ratio * 100)}%): ${p.description}`).join("\n")}

INSPIRATION ACCOUNTS: ${bible.inspirationAccounts.join(", ")}
AVOID COMPARISON TO: ${bible.avoidAccounts.join(", ")}
NEVER REFERENCE: Trapstar, Fully Paid

RED LINES:
${bible.redLines.map((r) => `- ${r}`).join("\n")}
  `.trim();
}
