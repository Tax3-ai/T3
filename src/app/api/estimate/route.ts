import { NextRequest, NextResponse } from "next/server";

// Fallback pricing table — used when DB is unavailable or has no rules
const FALLBACK_PRICING: Record<string, Record<string, [number, number]>> = {
  apple: {
    "screen replacement":  [79, 149],
    "battery replacement": [49, 79],
    "charging port":       [39, 69],
    "camera repair":       [59, 129],
    "water damage":        [49, 99],
    "data recovery":       [69, 149],
    "back glass":          [49, 89],
  },
  samsung: {
    "screen replacement":  [69, 139],
    "battery replacement": [39, 69],
    "charging port":       [29, 59],
    "camera repair":       [49, 99],
    "water damage":        [39, 89],
    "data recovery":       [59, 129],
  },
  google: {
    "screen replacement":  [79, 129],
    "battery replacement": [49, 79],
    "charging port":       [35, 65],
    "water damage":        [39, 89],
  },
  oneplus: {
    "screen replacement":  [69, 119],
    "battery replacement": [39, 69],
    "charging port":       [29, 55],
  },
  huawei: {
    "screen replacement":  [65, 119],
    "battery replacement": [39, 65],
    "charging port":       [29, 55],
  },
};

const DEFAULT_PRICING: Record<string, [number, number]> = {
  "screen replacement":  [39, 99],
  "battery replacement": [29, 59],
  "charging port":       [25, 55],
  "camera repair":       [39, 79],
  "water damage":        [39, 89],
  "data recovery":       [49, 149],
  "back glass":          [35, 69],
  "software issue":      [25, 49],
  "speaker / microphone":[25, 55],
};

async function lookupDB(deviceBrand: string, deviceModel: string, repairType: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.pricingRule.findFirst({
      where: {
        deviceBrand: { equals: deviceBrand, mode: "insensitive" },
        repairType:  { equals: repairType,  mode: "insensitive" },
        isActive: true,
        OR: [
          { deviceModel: { equals: deviceModel, mode: "insensitive" } },
          { deviceModel: null },
        ],
      },
      orderBy: { deviceModel: "desc" },
    });
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { deviceBrand, deviceModel, repairType } = await req.json();

  // Try database first
  const rule = await lookupDB(deviceBrand, deviceModel, repairType);
  if (rule) {
    return NextResponse.json({ found: true, minPrice: rule.minPrice, maxPrice: rule.maxPrice, repairType: rule.repairType });
  }

  // Fallback to hardcoded pricing
  const brandKey = (deviceBrand || "").toLowerCase();
  const repairKey = (repairType || "").toLowerCase();

  const brandPricing = FALLBACK_PRICING[brandKey];
  const range = brandPricing?.[repairKey] ?? DEFAULT_PRICING[repairKey];

  if (!range) {
    return NextResponse.json({ found: false, message: "No pricing available for this combination — please contact us for a custom quote." });
  }

  return NextResponse.json({ found: true, minPrice: range[0], maxPrice: range[1], repairType });
}
