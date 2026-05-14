import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.brandBible.findFirst();
  if (existing) {
    console.log("Brand bible already exists, skipping.");
    return;
  }

  await prisma.brandBible.create({
    data: {
      brandName: "Tax3",
      tagline: "Built Different.",
      originStory: "Tax3 started from nothing — car boot sales, pure belief, no business plan. Within 18 months it was online. Over £2M in lifetime sales. Hit a wall in 2024, accepted investment to come back stronger. The relaunch is the rebirth.",
      mission: "To build a streetwear brand that represents the culture — authentic, unapologetic, and built for those who move different.",
      vision: "To be the UK's most recognised independent streetwear brand with a global community.",
      personality: JSON.stringify(["Authentic", "Bold", "Cultural"]),
      audience: JSON.stringify({
        ageRange: "18-30",
        gender: "Male-skewed, all welcome",
        locations: ["UK", "London", "Manchester", "Birmingham"],
        income: "Working to middle class",
        aspiration: "Stand out, be recognised, wear culture",
        painPoint: "Generic fashion that doesn't represent who they are",
        slang: "UK street slang — bro, mandem, mad, drip, lowkey, W, built different",
        desiredEmotions: ["Confident", "Exclusive", "Part of something", "Recognised"],
        lifestyle: ["Music", "Football", "Streetwear", "Social media", "Grime", "Drill", "UK culture"]
      }),
      voice: JSON.stringify({
        person: "First person plural — 'we', 'us', 'the mandem'",
        formality: "Casual, street, direct",
        swearing: false,
        humour: "Dry, understated, confident",
        offLimitTopics: ["Politics", "Religion", "Other brands (negatively)", "Controversy"]
      }),
      visual: JSON.stringify({
        colors: { red: "#E31E24", black: "#0A0A0A", white: "#FFFFFF" },
        aesthetic: "90s streetwear — shell suits, baggy graphic tees, retro. Raw, real, no over-production.",
        faces: "Real people, real culture. No overly polished studio shots.",
        shotTypes: ["Street shots", "Campaign lifestyle", "Fit checks", "Behind the scenes", "Product close-ups"],
        rules: [
          "Never over-edit — keep it raw",
          "Red, black and white palette",
          "90s aesthetic always present",
          "Real locations over studios where possible",
          "People wearing the clothes, not mannequins"
        ]
      }),
      contentPillars: JSON.stringify([
        { slug: "lifestyle", name: "Lifestyle", ratio: 0.35, description: "Culture, fits, day-in-the-life", purpose: "Relatability and aspiration" },
        { slug: "campaign", name: "Campaign", ratio: 0.25, description: "Product drops, lookbooks, launch content", purpose: "Drive sales" },
        { slug: "behind_scenes", name: "Behind the Scenes", ratio: 0.20, description: "Process, making of, brand story", purpose: "Build trust and authenticity" },
        { slug: "community", name: "Community", ratio: 0.15, description: "Customer fits, reposts, shoutouts", purpose: "Social proof and loyalty" },
        { slug: "events", name: "Events", ratio: 0.05, description: "Pop-ups, shows, appearances", purpose: "Real-world presence" }
      ]),
      competitors: JSON.stringify([
        { account: "trapstar", relationship: "never_reference", strengths: "Strong brand identity" },
        { account: "corteiz", relationship: "aspiration", strengths: "Community-first drops, hype culture" },
        { account: "Newimprovedstudios", relationship: "aspiration", strengths: "Clean aesthetic, loyal following" }
      ]),
      redLines: JSON.stringify([
        "Never associate with Trapstar or Fully Paid",
        "No political statements",
        "No begging for follows or engagement",
        "No cringe corporate speak",
        "Never apologise for the brand"
      ]),
      offLimitPhrases: JSON.stringify(["Check out our new collection!", "We are excited to announce", "Don't miss out!", "Limited time offer"]),
      lovedPhrases: JSON.stringify(["Built different.", "The culture.", "W drop.", "No cap.", "Tap in.", "Real ones know."]),
      slogans: JSON.stringify(["Built Different.", "Tax3 Worldwide.", "The Culture."]),
      inspirationAccounts: JSON.stringify(["corteiz", "newimprovedstudios", "palace", "syna_world"]),
      avoidAccounts: JSON.stringify(["trapstar", "fullypaid"]),
      topics: JSON.stringify(["UK streetwear", "90s fashion", "Music culture", "Football culture", "London lifestyle", "Drop culture", "Fit checks"])
    }
  });

  console.log("✅ Brand bible seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
