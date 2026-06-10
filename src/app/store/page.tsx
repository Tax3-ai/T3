"use client";
import { useEffect, useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

const CATEGORY_IMAGES: Record<string, string> = {
  "Screens":           "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=75",
  "Batteries":         "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=400&auto=format&fit=crop&q=75",
  "Charging":          "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=75",
  "Cases & Covers":    "https://images.unsplash.com/photo-1615655406736-b37887a35764?w=400&auto=format&fit=crop&q=75",
  "Screen Protectors": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&auto=format&fit=crop&q=75",
  "Audio":             "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=75",
  "Tools":             "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&auto=format&fit=crop&q=75",
};

interface Product { id: string; sku: string; name: string; description: string | null; category: string; compatibleWith: string | null; price: number; stockQty: number; }
interface CartItem { product: Product; qty: number; }

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkout, setCheckout] = useState({ name:"", phone:"", email:"", address:"" });
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams({ active: "true" });
    if (category) p.set("category", category);
    if (search) p.set("search", search);
    fetch(`/api/products?${p}`).then(r => r.json()).then(d => { setProducts(d); setLoading(false); });
  }, [category, search]);

  function addToCart(p: Product) {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      return ex ? prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { product: p, qty: 1 }];
    });
  }

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  async function placeOrder() {
    if (!checkout.name || !checkout.phone) return;
    setOrdering(true);
    await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: checkout.name, customerPhone: checkout.phone,
        customerEmail: checkout.email, shippingAddress: checkout.address,
        items: cart.map(i => ({ productId: i.product.id, quantity: i.qty })),
      }),
    });
    setOrdering(false); setOrdered(true); setCart([]);
  }

  return (
    <div>
      {/* Store hero */}
      <div className="relative overflow-hidden h-40 md:h-52 border-b border-gray-700/50">
        <img
          src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1400&auto=format&fit=crop&q=60"
          alt="Mobile accessories"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-gray-950/90 flex items-center px-6">
          <div className="max-w-screen-xl mx-auto w-full flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Shop</h1>
              <p className="text-gray-400 text-sm mt-1">Accessories, cases, chargers & more</p>
            </div>
          </div>
        </div>
      </div>

    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div />
        <button onClick={() => setShowCart(true)} className="relative btn-secondary">
          🛒 Cart
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary outline-none text-sm w-60 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          {[{ value:"", label:"All" }, ...PRODUCT_CATEGORIES.map(c => ({ value:c, label:c }))].map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === c.value ? "bg-primary text-white" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center py-20 text-gray-500">Loading...</div> :
       products.length === 0 ? <div className="text-center py-20 text-gray-500">No products found</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} className="card-glow overflow-hidden group">
              <div className="h-40 overflow-hidden relative bg-gray-900">
                {CATEGORY_IMAGES[p.category] ? (
                  <img
                    src={CATEGORY_IMAGES[p.category]}
                    alt={p.category}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transform transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-primary/20 border border-primary/30 text-primary px-2 py-0.5 rounded-full">
                  {p.category}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-mono text-gray-600 mb-1">{p.sku}</p>
                <h3 className="text-white font-medium text-sm leading-snug mb-1">{p.name}</h3>
                {p.compatibleWith && <p className="text-gray-500 text-xs mb-2">For: {p.compatibleWith}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-white font-bold text-lg">£{p.price.toFixed(2)}</span>
                  <span className={`text-xs ${p.stockQty > 0 ? "text-green-400" : "text-red-400"}`}>
                    {p.stockQty > 0 ? `${p.stockQty} in stock` : "Out of stock"}
                  </span>
                </div>
                <button onClick={() => addToCart(p)} disabled={p.stockQty === 0}
                  className="mt-3 w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative bg-gray-800 border-l border-gray-700 w-full max-w-md h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            {ordered ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">Order Placed!</h3>
                <p className="text-gray-400 text-sm">We'll be in touch shortly to confirm your order.</p>
                <button onClick={() => { setShowCart(false); setOrdered(false); }} className="mt-6 text-primary text-sm">Continue Shopping</button>
              </div>
            ) : cart.length === 0 ? (
              <p className="text-gray-500 text-center py-16">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3 bg-gray-900 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">£{item.product.price.toFixed(2)} × {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCart(c => c.map(i => i.product.id === item.product.id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0))}
                          className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center text-sm">−</button>
                        <span className="text-white text-sm w-5 text-center">{item.qty}</span>
                        <button onClick={() => setCart(c => c.map(i => i.product.id === item.product.id ? { ...i, qty: i.qty + 1 } : i))}
                          className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center text-sm">+</button>
                      </div>
                      <p className="text-white text-sm font-bold w-16 text-right">£{(item.product.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 mb-6 flex justify-between text-white font-bold text-lg">
                  <span>Total</span><span>£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-sm">Your Details</h3>
                  {[{k:"name",ph:"Full Name *"},{k:"phone",ph:"Phone Number *"},{k:"email",ph:"Email (optional)"},{k:"address",ph:"Delivery address (or leave blank for collection)"}].map(f => (
                    <input key={f.k} placeholder={f.ph}
                      value={(checkout as Record<string,string>)[f.k]}
                      onChange={e => setCheckout(p => ({ ...p, [f.k]: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-primary outline-none text-sm transition-colors" />
                  ))}
                  <button onClick={placeOrder} disabled={ordering || !checkout.name || !checkout.phone} className="btn-primary w-full">
                    {ordering ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
