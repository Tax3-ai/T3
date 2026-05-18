import { prisma } from "./prisma";

export async function getShopifyCredentials() {
  const [tokenRow, storeRow] = await Promise.all([
    prisma.settings.findUnique({ where: { key: "shopify_access_token" } }),
    prisma.settings.findUnique({ where: { key: "shopify_store_url" } }),
  ]);

  if (!tokenRow || !storeRow) throw new Error("Shopify not connected");

  return {
    accessToken: tokenRow.value,
    storeUrl: storeRow.value,
  };
}

export async function shopifyFetch(endpoint: string) {
  const { accessToken, storeUrl } = await getShopifyCredentials();

  const res = await fetch(`https://${storeUrl}/admin/api/2025-01/${endpoint}`, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${err}`);
  }

  return res.json();
}
