import { NextRequest, NextResponse } from "next/server";

const DEMO_PRODUCTS = [
  // Screens
  { id: "demo-1", sku: "SCR-IP15PM-BLK-OEM", name: "iPhone 15 Pro Max Screen (OEM)", description: "Genuine OEM replacement screen with True Tone support. Includes fitting kit.", category: "Screens", brand: "Apple", compatibleWith: "iPhone 15 Pro Max", condition: "OEM", price: 139.99, costPrice: null, stockQty: 4, lowStockAlert: 3, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-2", sku: "SCR-IP15-BLK-OEM", name: "iPhone 15 Screen (OEM)", description: "OEM quality screen replacement for iPhone 15. Full touch and display functionality.", category: "Screens", brand: "Apple", compatibleWith: "iPhone 15 / 15 Plus", condition: "OEM", price: 109.99, costPrice: null, stockQty: 6, lowStockAlert: 3, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-3", sku: "SCR-IP14-BLK-AM", name: "iPhone 14 Screen (Aftermarket)", description: "High-quality aftermarket screen. Excellent colour accuracy and touch response.", category: "Screens", brand: "Apple", compatibleWith: "iPhone 14 / 14 Plus", condition: "AFTERMARKET", price: 79.99, costPrice: null, stockQty: 8, lowStockAlert: 3, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-4", sku: "SCR-SAM-S24U-BLK-OEM", name: "Samsung Galaxy S24 Ultra Screen", description: "OEM AMOLED screen for Samsung Galaxy S24 Ultra. Vivid colours, high refresh rate.", category: "Screens", brand: "Samsung", compatibleWith: "Galaxy S24 Ultra", condition: "OEM", price: 129.99, costPrice: null, stockQty: 3, lowStockAlert: 2, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-5", sku: "SCR-SAM-S23-BLK-AM", name: "Samsung Galaxy S23 Screen", description: "Quality aftermarket AMOLED replacement for S23.", category: "Screens", brand: "Samsung", compatibleWith: "Galaxy S23 / S23+", condition: "AFTERMARKET", price: 69.99, costPrice: null, stockQty: 5, lowStockAlert: 2, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },

  // Batteries
  { id: "demo-6", sku: "BAT-IP15-OEM", name: "iPhone 15 Battery (OEM)", description: "Genuine capacity OEM battery. Restores full battery health. Includes adhesive strips.", category: "Batteries", brand: "Apple", compatibleWith: "iPhone 15 / 15 Plus", condition: "OEM", price: 44.99, costPrice: null, stockQty: 10, lowStockAlert: 4, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-7", sku: "BAT-IP14-OEM", name: "iPhone 14 Battery (OEM)", description: "OEM replacement battery for iPhone 14 series.", category: "Batteries", brand: "Apple", compatibleWith: "iPhone 14 / 14 Plus", condition: "OEM", price: 39.99, costPrice: null, stockQty: 12, lowStockAlert: 4, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-8", sku: "BAT-SAM-S24-OEM", name: "Samsung Galaxy S24 Battery", description: "High-capacity replacement battery for Galaxy S24.", category: "Batteries", brand: "Samsung", compatibleWith: "Galaxy S24", condition: "OEM", price: 34.99, costPrice: null, stockQty: 8, lowStockAlert: 3, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },

  // Charging
  { id: "demo-9", sku: "CHG-USBC-65W-WHT", name: "65W USB-C Fast Charger", description: "Universal 65W GaN fast charger. Compatible with iPhone 15, Samsung, Google Pixel and more.", category: "Charging", brand: null, compatibleWith: "Universal USB-C", condition: "NEW", price: 24.99, costPrice: null, stockQty: 20, lowStockAlert: 5, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-10", sku: "CBL-USBC-2M-BLK", name: "USB-C Cable 2m (Braided)", description: "Premium braided USB-C to USB-C cable. 100W charging support, tangle-free.", category: "Charging", brand: null, compatibleWith: "Universal USB-C", condition: "NEW", price: 12.99, costPrice: null, stockQty: 25, lowStockAlert: 5, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-11", sku: "CBL-LTNG-1M-WHT", name: "Lightning Cable 1m (MFi Certified)", description: "Apple MFi certified Lightning cable. Fast charge compatible.", category: "Charging", brand: "Apple", compatibleWith: "iPhone (Lightning)", condition: "NEW", price: 14.99, costPrice: null, stockQty: 18, lowStockAlert: 5, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },

  // Cases & Covers
  { id: "demo-12", sku: "CASE-IP15PM-CLR", name: "iPhone 15 Pro Max Clear Case", description: "Ultra-slim transparent case. Scratch resistant with reinforced corners.", category: "Cases & Covers", brand: null, compatibleWith: "iPhone 15 Pro Max", condition: "NEW", price: 14.99, costPrice: null, stockQty: 30, lowStockAlert: 8, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-13", sku: "CASE-IP15-MAG-BLK", name: "iPhone 15 MagSafe Case (Black)", description: "MagSafe compatible silicone case. Strong magnetic alignment, soft microfibre interior.", category: "Cases & Covers", brand: null, compatibleWith: "iPhone 15 / 15 Pro", condition: "NEW", price: 19.99, costPrice: null, stockQty: 15, lowStockAlert: 5, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-14", sku: "CASE-SAM-S24-ARM", name: "Samsung S24 Armoured Case", description: "Military-grade drop protection with built-in kickstand.", category: "Cases & Covers", brand: "Samsung", compatibleWith: "Galaxy S24 / S24+", condition: "NEW", price: 17.99, costPrice: null, stockQty: 12, lowStockAlert: 4, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },

  // Screen Protectors
  { id: "demo-15", sku: "SP-IP15PM-TEMP-2PK", name: "iPhone 15 Pro Max Tempered Glass (2-pack)", description: "9H hardness tempered glass. Includes alignment frame for bubble-free fitting.", category: "Screen Protectors", brand: null, compatibleWith: "iPhone 15 Pro Max", condition: "NEW", price: 9.99, costPrice: null, stockQty: 40, lowStockAlert: 10, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-16", sku: "SP-IP15-PRIV", name: "iPhone 15 Privacy Screen Protector", description: "Anti-spy privacy filter. Blocks side viewing. 9H hardness.", category: "Screen Protectors", brand: null, compatibleWith: "iPhone 15 / 15 Pro", condition: "NEW", price: 11.99, costPrice: null, stockQty: 22, lowStockAlert: 6, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
  { id: "demo-17", sku: "SP-SAM-S24-TEMP", name: "Samsung S24 Tempered Glass", description: "Curved edge-to-edge tempered glass for Galaxy S24. Fingerprint sensor compatible.", category: "Screen Protectors", brand: "Samsung", compatibleWith: "Galaxy S24", condition: "NEW", price: 8.99, costPrice: null, stockQty: 28, lowStockAlert: 8, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },

  // Audio
  { id: "demo-18", sku: "AUD-TWS-PRO-WHT", name: "Wireless Earbuds Pro (White)", description: "Active noise cancellation, 30hr total battery life, IPX5 water resistant.", category: "Audio", brand: null, compatibleWith: "Universal Bluetooth", condition: "NEW", price: 34.99, costPrice: null, stockQty: 10, lowStockAlert: 3, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },

  // Tools
  { id: "demo-19", sku: "TOOL-KIT-PRO-21", name: "21-in-1 Phone Repair Tool Kit", description: "Professional repair kit with pentalobe, Phillips, Torx screwdrivers, spudgers, suction cups and more.", category: "Tools", brand: null, compatibleWith: "Universal", condition: "NEW", price: 18.99, costPrice: null, stockQty: 8, lowStockAlert: 2, images: "[]", isActive: true, weight: null, barcode: null, variants: [] },
];

function filterProducts(products: typeof DEMO_PRODUCTS, category: string | null, search: string | null, activeOnly: boolean) {
  return products.filter(p => {
    if (activeOnly && !p.isActive) return false;
    if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const activeOnly = searchParams.get("active") !== "false";

  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
        ...(search ? { OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ]} : {}),
      },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });
    // If DB is empty, fall back to demo products
    if (products.length === 0) {
      return NextResponse.json(filterProducts(DEMO_PRODUCTS, category, search, activeOnly));
    }
    return NextResponse.json(products);
  } catch {
    // DB not available — return demo products
    return NextResponse.json(filterProducts(DEMO_PRODUCTS, category, search, activeOnly));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        sku: body.sku, name: body.name, description: body.description || null,
        category: body.category, brand: body.brand || null,
        compatibleWith: body.compatibleWith || null, condition: body.condition || "NEW",
        price: parseFloat(body.price),
        costPrice: body.costPrice ? parseFloat(body.costPrice) : null,
        stockQty: parseInt(body.stockQty) || 0,
        lowStockAlert: parseInt(body.lowStockAlert) || 5,
        weight: body.weight ? parseFloat(body.weight) : null,
        barcode: body.barcode || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database not available." }, { status: 503 });
  }
}
