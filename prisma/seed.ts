import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Tax3 brand bible...");

  await prisma.brandBible.deleteMany();

  await prisma.brandBible.create({
    data: {
      brandName: "Tax3",
      tagline: "Only for the fly.",
      originStory: `Tax3 rejects the idea that creativity, freedom, and expression should be taxed by expectation or permission.

Tax3 didn't start in a studio. It didn't start with investors, connections, or a plan. It started with an idea — and the belief that no one should be able to tax your creativity, your freedom, or how you choose to express yourself.

No fashion background. No business experience. Just the decision to start anyway.

Tax3 is more than clothing, it's a mindset.`,
      mission:
        "To build a global streetwear community where creativity, freedom, and self-expression are never taxed by expectation.",
      vision:
        "An 8-figure brand with a global customer base, stocked in Selfridges and Flannels, with a foundation that gives back — providing capital, advice, and consultancy to young aspiring entrepreneurs.",
      personality: JSON.stringify(["Cool", "Innovative", "Unique"]),
      audience: JSON.stringify({
        ageRange: "17-26",
        gender: "Unisex",
        locations: ["London", "United States"],
        income: "£20k+ annually (or equivalent buying power)",
        lifestyle: [
          "Travel abroad",
          "Going out to events",
          "Eating out",
          "Living for moments",
        ],
        aspiration: "Freedom",
        painPoint: "Looking unique",
        followsAccounts: [
          "Streetwear blog pages",
          "Streetwear brands",
          "Rappers",
          "Cultured artists",
          "Athletes with great style",
          "Clothing reviewers",
          "Brand owners",
          "Fit check creators",
        ],
        slang: "London slang",
        desiredEmotions: ["Cool", "Creative", "Meaningful"],
      }),
      voice: JSON.stringify({
        person: "We (brand) / I (founder)",
        formality: "Casual",
        swearing: true,
        humour: "Sarcastic but charming; wholesome when talking about journey",
        lovedPhrases: [
          "Cold",
          "Dope",
          "Tuff",
          "Colddd",
          "Yeah this is dope",
          "Yeah this is cold",
          "Tax3 to the world",
          "Time to apply pressure",
          "Munyun",
          "We up now",
          "The Tax3 way",
        ],
        bannedPhrases: ["gay", "shit", "bitch", "fuck off", "y fi dat", "broke"],
        offLimitTopics: [
          "Founder earnings",
          "People no longer with the brand",
          "Past supplier issues",
          "Political views",
          "Homophobia",
          "Gang violence / fighting / abuse glorification",
        ],
      }),
      visual: JSON.stringify({
        colors: {
          primary: "#E31E24",
          secondary: "#FFFFFF",
          tertiary: "#0A0A0A",
        },
        aesthetic: "Cinematic",
        faces: "Models, founder, influencers, artists",
        shotTypes: ["Lifestyle", "Product-focused", "B-roll", "POV"],
        rules: [
          "No head cut-offs",
          "Trainers to be visible in wide shots",
          "Subtitles above social captions",
          "Always show logo",
        ],
        neverPost: [
          "Gang violence",
          "Fights",
          "Abuse",
          "Content glorifying violence",
        ],
      }),
      contentPillars: JSON.stringify([
        {
          name: "Lifestyle",
          slug: "lifestyle",
          ratio: 0.5,
          purpose: "growth",
          description:
            "Day-in-the-life, travel, events, fit checks, cultural moments",
        },
        {
          name: "Behind the Scenes",
          slug: "behind_scenes",
          ratio: 0.3,
          purpose: "growth + trust",
          description:
            "Collection process, campaign prep, brand journey, ups and downs",
        },
        {
          name: "Campaign",
          slug: "campaign",
          ratio: 0.2,
          purpose: "sales",
          description: "New drops, best sellers, campaign launches",
        },
        {
          name: "Community",
          slug: "community",
          ratio: 0.1,
          purpose: "retention",
          description: "Customer features, brand message, what we stand for",
        },
        {
          name: "Events",
          slug: "events",
          ratio: 0.1,
          purpose: "hype",
          description: "Pop-ups, events, activations",
        },
      ]),
      competitors: JSON.stringify([
        {
          account: "protect.ldn",
          platform: "instagram",
          strengths: "Viral campaigns, cool aesthetic, clear audience",
          relationship: "competitor",
        },
        {
          account: "godmade",
          platform: "instagram",
          strengths:
            "Consistent brand image, major retail store inclusion, founder-led content",
          relationship: "competitor",
        },
        {
          account: "mertra",
          platform: "instagram",
          strengths:
            "Viral campaigns, innovative, unique pieces, major brand collabs",
          relationship: "competitor",
        },
        {
          account: "gone.club",
          platform: "instagram",
          strengths:
            "Founder-led content, strong brand message, clean aesthetic",
          relationship: "competitor",
        },
        {
          account: "blancs",
          platform: "instagram",
          strengths:
            "Founder-led content, high profile collabs/gifting, minimalistic collections",
          relationship: "competitor",
        },
        {
          account: "y.g.studios",
          platform: "instagram",
          strengths: "Aesthetic inspiration",
          relationship: "aspiration",
        },
        {
          account: "brokenplanet",
          platform: "instagram",
          strengths: "Aesthetic inspiration, global streetwear brand",
          relationship: "aspiration",
        },
        {
          account: "flystr8",
          platform: "instagram",
          strengths: "",
          relationship: "avoid_comparison",
        },
        {
          account: "bandobandit",
          platform: "instagram",
          strengths: "",
          relationship: "avoid_comparison",
        },
        {
          account: "trendsetter",
          platform: "instagram",
          strengths: "",
          relationship: "avoid_comparison",
        },
        {
          account: "trapstar",
          platform: "instagram",
          strengths: "",
          relationship: "never_reference",
        },
        {
          account: "fullypaid",
          platform: "instagram",
          strengths: "",
          relationship: "never_reference",
        },
      ]),
      redLines: JSON.stringify([
        "Never post gang violence, fights, or abuse",
        "Never reference Trapstar or Fully Paid",
        "Never discuss political topics",
        "Never discuss founder earnings",
        "Never glorify fake engagement",
        "Always respect platform ToS",
        "No copyrighted audio outside licensed trending library",
        "No homophobic content",
      ]),
      offLimitPhrases: JSON.stringify([
        "gay",
        "shit",
        "bitch",
        "fuck off",
        "y fi dat",
        "broke",
      ]),
      lovedPhrases: JSON.stringify([
        "Cold",
        "Dope",
        "Tuff",
        "Colddd",
        "Yeah this is dope",
        "Yeah this is cold",
        "Tax3 to the world",
        "Time to apply pressure",
        "Munyun",
        "We up now",
        "The Tax3 way",
      ]),
      slogans: JSON.stringify([
        "The Tax3 Way",
        "Only for the fly",
        "Tax3 to the world",
        "Can't be taxed",
      ]),
      inspirationAccounts: JSON.stringify([
        "y.g.studios",
        "protect.ldn",
        "brokenplanet",
      ]),
      avoidAccounts: JSON.stringify(["flystr8", "bandobandit", "trendsetter"]),
      topics: JSON.stringify([
        "Running a brand",
        "Process of making a collection",
        "New drops landing",
        "Best sellers",
        "How we started",
        "What the brand stands for",
        "Ups and downs",
        "Pop-up/events",
        "Prep for campaigns",
        "Campaigns",
      ]),
    },
  });

  console.log("Brand bible seeded.");

  // Seed some example competitor posts
  await prisma.competitorPost.deleteMany();
  await prisma.competitorPost.createMany({
    data: [
      {
        account: "protect.ldn",
        platform: "INSTAGRAM",
        url: "https://www.instagram.com/p/DRKWiOQjC6s/",
        hook: "We had to do this...",
        format: "REEL",
        aspectRatio: "9:16",
        pillars: JSON.stringify(["campaign", "lifestyle"]),
        notes: "Aspirational viral example from brand bible",
      },
      {
        account: "protect.ldn",
        platform: "INSTAGRAM",
        url: "https://www.instagram.com/p/DPjkj5zjKeO/",
        format: "REEL",
        aspectRatio: "9:16",
        pillars: JSON.stringify(["lifestyle"]),
        notes: "Aspirational viral example from brand bible",
      },
      {
        account: "gone.club",
        platform: "INSTAGRAM",
        url: "https://www.instagram.com/p/DRMLa5vDBlW/",
        format: "REEL",
        pillars: JSON.stringify(["behind_scenes", "lifestyle"]),
        notes: "Aspirational viral example from brand bible",
      },
      {
        account: "brokenplanet",
        platform: "INSTAGRAM",
        url: "https://www.instagram.com/p/DOwExJfDPZE/",
        format: "REEL",
        pillars: JSON.stringify(["campaign"]),
        notes: "Aspirational viral example from brand bible",
      },
    ],
  });

  // Seed initial trending items
  await prisma.trendingItem.deleteMany();
  const expiresAt = addDays(new Date(), 7);
  await prisma.trendingItem.createMany({
    data: [
      {
        platform: "INSTAGRAM",
        itemType: "HOOK",
        value: "POV: you just discovered...",
        category: "pov",
        saturation: 0.4,
        growthRate: 0.8,
        niches: JSON.stringify(["streetwear", "fashion", "lifestyle"]),
        exampleUrls: JSON.stringify([]),
        expiresAt,
      },
      {
        platform: "INSTAGRAM",
        itemType: "HOOK",
        value: "This shouldn't be this fire but...",
        category: "reaction",
        saturation: 0.3,
        growthRate: 0.9,
        niches: JSON.stringify(["streetwear", "fashion"]),
        exampleUrls: JSON.stringify([]),
        expiresAt,
      },
      {
        platform: "TIKTOK",
        itemType: "HOOK",
        value: "Tell me you're [X] without telling me you're [X]",
        category: "challenge",
        saturation: 0.6,
        growthRate: 0.5,
        niches: JSON.stringify(["fashion", "lifestyle"]),
        exampleUrls: JSON.stringify([]),
        expiresAt,
      },
      {
        platform: "INSTAGRAM",
        itemType: "FORMAT",
        value: "Get Ready With Me (GRWM) - Outfit reveal",
        category: "lifestyle",
        saturation: 0.5,
        growthRate: 0.7,
        niches: JSON.stringify(["streetwear", "fashion"]),
        exampleUrls: JSON.stringify([]),
        expiresAt,
      },
      {
        platform: "TIKTOK",
        itemType: "FORMAT",
        value: "Behind-the-scenes brand creation montage",
        category: "behind_scenes",
        saturation: 0.2,
        growthRate: 0.95,
        niches: JSON.stringify(["streetwear", "brand building"]),
        exampleUrls: JSON.stringify([]),
        expiresAt,
      },
      {
        platform: "INSTAGRAM",
        itemType: "HASHTAG",
        value: "#streetwear #streetwearfashion #ukstreet #londonstreet #outfitcheck",
        category: "lifestyle",
        saturation: 0.5,
        growthRate: 0.6,
        niches: JSON.stringify(["streetwear"]),
        exampleUrls: JSON.stringify([]),
        expiresAt,
      },
      {
        platform: "TIKTOK",
        itemType: "HASHTAG",
        value: "#streetwear #fyp #ootd #outfitcheck #fashion",
        category: "lifestyle",
        saturation: 0.6,
        growthRate: 0.5,
        niches: JSON.stringify(["streetwear"]),
        exampleUrls: JSON.stringify([]),
        expiresAt,
      },
    ],
  });

  // Seed pattern library
  await prisma.patternEntry.deleteMany();
  await prisma.patternEntry.createMany({
    data: [
      {
        pattern: "First 3 seconds: product reveal with cinematic zoom",
        category: "hook",
        score: 8.5,
        sampleSize: 12,
        notes: "Consistently drives high completion rates for product content",
      },
      {
        pattern: "Caption: short punchy statement + question CTA",
        category: "hook",
        score: 7.8,
        sampleSize: 24,
        notes: "Questions drive 40%+ more comments",
      },
      {
        pattern: "Posting at 6pm GMT on weekdays",
        category: "timing",
        score: 8.2,
        sampleSize: 18,
        notes: "Peak audience activity for 17-26 UK demographic",
      },
      {
        pattern: "9:16 aspect ratio with text overlay at bottom third",
        category: "format",
        score: 7.5,
        sampleSize: 30,
        notes: "Subtitle-style text above caption area per brand rules",
      },
      {
        pattern: "UK drill / Afroswing trending audio under 30 seconds",
        category: "audio",
        score: 8.8,
        sampleSize: 15,
        notes: "Best performing audio category for this audience",
      },
    ],
  });

  console.log("All seed data complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
