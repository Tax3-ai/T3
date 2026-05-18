"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface AttributedPost {
  post: {
    id: string;
    platform: string;
    caption: string;
    thumbnailUrl: string | null;
    permalink: string | null;
    publishedAt: string | null;
    views: number;
    likes: number;
  };
  attribution: {
    orderCount: number;
    totalRevenue: number;
    currency: string;
    revenuePerView: number | null;
  };
}

interface TrafficSource {
  source: string;
  orders: number;
  revenue: number;
}

interface Summary {
  totalOrders: number;
  totalRevenue: number;
  attributedOrders: number;
  attributedRevenue: number;
  unattributedOrders: number;
}

interface Product {
  id: number;
  title: string;
  status: string;
  image: { src: string } | null;
  variants: { price: string; inventory_quantity: number }[];
}

type DateRange = "2026" | "all";
type Tab = "attribution" | "sources" | "products";

export default function ShopifyPage() {
  const [attributed, setAttributed] = useState<AttributedPost[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshingProducts, setRefreshingProducts] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncMsg, setSyncMsg] = useState("");
  const [syncCount, setSyncCount] = useState<number | null>(null);
  const [totalKnown] = useState(17893);
  const [activeTab, setActiveTab] = useState<Tab>("attribution");
  const [dateRange, setDateRange] = useState<DateRange>("2026");

  const fetchData = useCallback(async (range: DateRange = dateRange) => {
    setLoading(true);
    const allTime = range === "all";
    const [attrRes, prodRes] = await Promise.all([
      fetch(`/api/shopify/attribution?allTime=${allTime}`),
      fetch("/api/shopify/products", { cache: "no-store" }),
    ]);
    const attrData = await attrRes.json();
    const prodData = await prodRes.json();
    setAttributed(attrData.attributed || []);
    setSummary(attrData.summary || null);
    setTrafficSources(attrData.trafficSources || []);
    setProducts(Array.isArray(prodData) ? prodData : []);
    setLoading(false);
  }, [dateRange]);

  useEffect(() => { fetchData(dateRange); }, [dateRange]);

  const syncOrders = async (allTime = false) => {
    setSyncing(true);
    setSyncMsg("");
    setSyncCount(null);

    // Poll for progress while syncing
    const pollInterval = setInterval(async () => {
      const statusRes = await fetch("/api/shopify/sync-status");
      const status = await statusRes.json();
      setSyncCount(status.count);
    }, 2000);

    try {
      const res = await fetch("/api/shopify/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allTime }),
      });
      const data = await res.json();
      setSyncMsg(data.error ? `Error: ${typeof data.error === "string" ? data.error : JSON.stringify(data.error)}` : `✓ Synced ${data.synced} orders`);
    } finally {
      clearInterval(pollInterval);
      setSyncing(false);
      setSyncCount(null);
      fetchData(dateRange);
    }
  };

  const refreshProducts = async () => {
    setRefreshingProducts(true);
    const res = await fetch("/api/shopify/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setRefreshingProducts(false);
  };

  const fmt = (n: number, currency = "GBP") =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);

  const sourceIcon: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    google: "🔍",
    facebook: "👤",
    direct: "🔗",
    pinterest: "📌",
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Shopify</h1>
          <p className="text-brand-gray-400 text-sm mt-1">Sales attribution & product performance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date range toggle */}
          <div className="flex bg-brand-gray-800 rounded-lg p-1 text-sm">
            <button
              onClick={() => setDateRange("2026")}
              className={`px-3 py-1.5 rounded-md transition-colors ${dateRange === "2026" ? "bg-brand-red text-white" : "text-brand-gray-400 hover:text-white"}`}
            >
              2026
            </button>
            <button
              onClick={() => setDateRange("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${dateRange === "all" ? "bg-brand-red text-white" : "text-brand-gray-400 hover:text-white"}`}
            >
              All time
            </button>
          </div>
          {/* Sync buttons */}
          <button
            onClick={() => syncOrders(false)}
            disabled={syncing}
            className="bg-[#96bf48] hover:bg-[#7da33a] disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors"
          >
              🔄 Sync 2026
          </button>
          <button
            onClick={() => syncOrders(true)}
            disabled={syncing}
            className="bg-brand-gray-700 hover:bg-brand-gray-600 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Sync All Time
          </button>
        </div>
      </div>

      {/* Sync progress bar */}
      {syncing && (
        <div className="mb-4 border border-brand-gray-700 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white font-medium">⏳ Syncing orders...</span>
            <span className="text-brand-gray-400">
              {syncCount !== null ? `${syncCount.toLocaleString()} / ${totalKnown.toLocaleString()}` : "Starting..."}
            </span>
          </div>
          <div className="w-full bg-brand-gray-800 rounded-full h-2">
            <div
              className="bg-[#96bf48] h-2 rounded-full transition-all duration-500"
              style={{ width: syncCount ? `${Math.min((syncCount / totalKnown) * 100, 100)}%` : "2%" }}
            />
          </div>
          <p className="text-brand-gray-500 text-xs">This may take a few minutes for large stores — don&apos;t close the tab.</p>
        </div>
      )}

      {syncMsg && !syncing && (
        <div className={`mb-4 text-sm px-4 py-2 rounded-lg ${syncMsg.startsWith("Error") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
          {syncMsg}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-xl p-4">
            <p className="text-brand-gray-400 text-xs mb-1">Total Revenue</p>
            <p className="text-white text-2xl font-bold">{fmt(summary.totalRevenue)}</p>
            <p className="text-brand-gray-500 text-xs mt-1">{summary.totalOrders} orders</p>
          </div>
          <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-xl p-4">
            <p className="text-brand-gray-400 text-xs mb-1">Attributed Revenue</p>
            <p className="text-green-400 text-2xl font-bold">{fmt(summary.attributedRevenue)}</p>
            <p className="text-brand-gray-500 text-xs mt-1">{summary.attributedOrders} posts tracked</p>
          </div>
          <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-xl p-4">
            <p className="text-brand-gray-400 text-xs mb-1">Social Attribution</p>
            <p className="text-white text-2xl font-bold">
              {summary.totalOrders > 0
                ? Math.round((summary.attributedOrders / summary.totalOrders) * 100)
                : 0}%
            </p>
            <p className="text-brand-gray-500 text-xs mt-1">from tracked posts</p>
          </div>
          <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-xl p-4">
            <p className="text-brand-gray-400 text-xs mb-1">Unattributed</p>
            <p className="text-brand-gray-300 text-2xl font-bold">{summary.unattributedOrders}</p>
            <p className="text-brand-gray-500 text-xs mt-1">orders (direct / other)</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "attribution", label: "📊 Post Attribution" },
          { key: "sources", label: "🌐 Traffic Sources" },
          { key: "products", label: "🛍️ Products" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-brand-red text-white"
                : "bg-brand-gray-800 text-brand-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Attribution tab */}
      {activeTab === "attribution" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-brand-gray-400 text-center py-12">Loading...</div>
          ) : attributed.length === 0 ? (
            <div className="border border-brand-gray-700 rounded-xl p-10 text-center space-y-3">
              <p className="text-4xl">📊</p>
              <p className="text-white font-semibold">No attributed sales yet</p>
              <p className="text-brand-gray-400 text-sm max-w-sm mx-auto">
                Attribution kicks in once posts go out with UTM tracked links. Once posts are published through the dashboard, sales will appear here automatically.
              </p>
            </div>
          ) : (
            attributed.map(({ post, attribution }) => (
              <div key={post.id} className="border border-brand-gray-700 rounded-xl p-5 flex gap-4 items-start">
                <div className="w-16 h-16 rounded-lg bg-brand-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {post.thumbnailUrl ? (
                    <Image src={post.thumbnailUrl} alt="" width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-2xl">{post.platform === "INSTAGRAM" ? "📸" : "🎵"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-brand-gray-400 uppercase">{post.platform}</span>
                    {post.publishedAt && (
                      <span className="text-xs text-brand-gray-500">
                        · {new Date(post.publishedAt).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm truncate">{post.caption}</p>
                  <div className="flex gap-4 mt-2 text-xs text-brand-gray-400">
                    <span>👁 {post.views.toLocaleString()} views</span>
                    <span>❤️ {post.likes.toLocaleString()} likes</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-green-400 text-xl font-bold">{fmt(attribution.totalRevenue, attribution.currency)}</p>
                  <p className="text-brand-gray-400 text-xs">{attribution.orderCount} order{attribution.orderCount !== 1 ? "s" : ""}</p>
                  {attribution.revenuePerView && (
                    <p className="text-brand-gray-500 text-xs mt-0.5">
                      {fmt(attribution.revenuePerView, attribution.currency)}/view
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Traffic sources tab */}
      {activeTab === "sources" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-brand-gray-400 text-center py-12">Loading...</div>
          ) : trafficSources.length === 0 ? (
            <div className="text-brand-gray-400 text-center py-12">No traffic data yet — sync orders first.</div>
          ) : (
            <>
              {trafficSources.map(({ source, orders, revenue }) => {
                const maxRevenue = trafficSources[0]?.revenue || 1;
                const pct = Math.round((revenue / maxRevenue) * 100);
                const icon = sourceIcon[source.toLowerCase()] || "🌐";
                return (
                  <div key={source} className="border border-brand-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="text-white font-medium capitalize">{source}</span>
                        <span className="text-brand-gray-500 text-xs">{orders} order{orders !== 1 ? "s" : ""}</span>
                      </div>
                      <span className="text-green-400 font-bold">{fmt(revenue)}</span>
                    </div>
                    <div className="w-full bg-brand-gray-800 rounded-full h-1.5">
                      <div className="bg-brand-red h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Products tab */}
      {activeTab === "products" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={refreshProducts}
              disabled={refreshingProducts}
              className="bg-brand-gray-700 hover:bg-brand-gray-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              {refreshingProducts ? "⏳ Refreshing..." : "🔄 Refresh Products"}
            </button>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="text-brand-gray-400 col-span-3 text-center py-12">Loading...</div>
          ) : products.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-brand-gray-400">No products found.</div>
          ) : (
            products.map((product) => {
              const price = product.variants?.[0]?.price;
              const stock = product.variants?.reduce((s, v) => s + (v.inventory_quantity || 0), 0);
              return (
                <div key={product.id} className="border border-brand-gray-700 rounded-xl p-4 flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-lg bg-brand-gray-700 shrink-0 overflow-hidden">
                    {product.image?.src ? (
                      <Image src={product.image.src} alt={product.title} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {price && <p className="text-green-400 text-sm font-semibold">£{parseFloat(price).toFixed(2)}</p>}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${product.status === "active" ? "bg-green-500/20 text-green-400" : "bg-brand-gray-700 text-brand-gray-400"}`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-brand-gray-500 text-xs mt-1">{stock} in stock</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
      )}
    </div>
  );
}
