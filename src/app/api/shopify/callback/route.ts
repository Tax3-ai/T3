import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const shop = searchParams.get("shop") || process.env.SHOPIFY_STORE_URL!;

  const storedState = req.cookies.get("shopify_oauth_state")?.value;
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // Exchange code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.json({ error: "Failed to get access token", details: tokenData }, { status: 400 });
  }

  // Store token in DB
  await prisma.settings.upsert({
    where: { key: "shopify_access_token" },
    update: { value: accessToken },
    create: { key: "shopify_access_token", value: accessToken },
  });

  await prisma.settings.upsert({
    where: { key: "shopify_store_url" },
    update: { value: shop },
    create: { key: "shopify_store_url", value: shop },
  });

  // Redirect to dashboard with success
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?shopify=connected`);
}
