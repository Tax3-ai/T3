import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await shopifyFetch(
      "products.json?limit=250&status=active&fields=id,title,status,variants,image,created_at"
    );
    return NextResponse.json(data.products || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
