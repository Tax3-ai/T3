import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const shop = process.env.SHOPIFY_STORE_URL!;
  const apiKey = process.env.SHOPIFY_API_KEY!;
  const scopes = "read_orders,read_all_orders,read_products,read_analytics";
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/shopify/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${apiKey}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  const response = NextResponse.redirect(installUrl);
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
  });
  return response;
}
