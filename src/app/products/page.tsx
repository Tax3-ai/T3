"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface Product {
  id: string; sku: string; name: string; category: string;
  compatibleWith: string | null; condition: string;
  price: number; stockQty: number; lowStockAlert: number; isActive: boolean;
}

const blank = { sku:"",name:"",description:"",category:"",brand:"",compatibleWith:"",condition:"NEW",price:"",costPrice:"",stockQty:"0",lowStockAlert:"5",barcode:"",weight:"" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);

  function load() {
    const p = new URLSearchParams({ active: "false" });
    if (search) p.set("search", search);
    if (category) p.set("category", category);
    fetch(`/api/products?${p}`).then(r => r.json()).then(d => { setProducts(d); setLoading(false); });
  }

  useEffect(() => { load(); }, [search, category]);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch("/api/products", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    setSaving(false); setShowAdd(false); setForm(blank); load();
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inp = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-primary outline-none text-sm transition-colors";
  const lbl = "block text-xs font-medium text-gray-400 mb-1";

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Inventory & online store catalog</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Product</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..."
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary outline-none text-sm w-60 transition-colors" />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary outline-none text-sm transition-colors">
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="text-center py-16 text-gray-500">Loading...</div> :
         products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">No products yet</p>
            <button onClick={() => setShowAdd(true)} className="text-primary text-sm">Add your first product →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {["SKU","Name","Category","Compatible","Condition","Price","Stock","Active"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium text-white max-w-[180px]">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{p.compatibleWith || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.condition === "NEW" ? "bg-green-900/40 text-green-300" : "bg-yellow-900/40 text-yellow-300"}`}>{p.condition}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">£{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={p.stockQty <= p.lowStockAlert ? "text-red-400 font-bold" : "text-white"}>{p.stockQty}</span>
                      {p.stockQty <= p.lowStockAlert && <span className="text-red-400 text-xs ml-1">⚠</span>}
                    </td>
                    <td className="px-4 py-3 text-center">{p.isActive ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Product">
        <form onSubmit={addProduct} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={lbl}>SKU * <span className="text-gray-600 font-normal">(e.g. SCR-IP15-BLK-OEM)</span></label>
              <input required value={form.sku} onChange={e => set("sku", e.target.value.toUpperCase())} className={inp} placeholder="SCR-IP15-BLK-OEM" />
            </div>
            <div className="col-span-2"><label className={lbl}>Product Name *</label><input required value={form.name} onChange={e => set("name",e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Category *</label>
              <select required value={form.category} onChange={e => set("category",e.target.value)} className={inp}>
                <option value="">Select...</option>
                {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Condition</label>
              <select value={form.condition} onChange={e => set("condition",e.target.value)} className={inp}>
                {["NEW","OEM","AFTERMARKET","REFURBISHED"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Brand</label><input value={form.brand} onChange={e => set("brand",e.target.value)} className={inp} placeholder="Apple" /></div>
            <div><label className={lbl}>Compatible With</label><input value={form.compatibleWith} onChange={e => set("compatibleWith",e.target.value)} className={inp} placeholder="iPhone 15" /></div>
            <div><label className={lbl}>Sale Price (£) *</label><input required type="number" step="0.01" value={form.price} onChange={e => set("price",e.target.value)} className={inp} placeholder="89.99" /></div>
            <div><label className={lbl}>Cost Price (£)</label><input type="number" step="0.01" value={form.costPrice} onChange={e => set("costPrice",e.target.value)} className={inp} placeholder="42.00" /></div>
            <div><label className={lbl}>Stock Qty</label><input type="number" value={form.stockQty} onChange={e => set("stockQty",e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Low Stock Alert</label><input type="number" value={form.lowStockAlert} onChange={e => set("lowStockAlert",e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Barcode</label><input value={form.barcode} onChange={e => set("barcode",e.target.value)} className={inp} placeholder="EAN/UPC" /></div>
            <div><label className={lbl}>Weight (g)</label><input type="number" value={form.weight} onChange={e => set("weight",e.target.value)} className={inp} /></div>
            <div className="col-span-2"><label className={lbl}>Description</label><textarea value={form.description} onChange={e => set("description",e.target.value)} rows={2} className={`${inp} resize-none`} /></div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Saving..." : "Add Product"}</button>
        </form>
      </Modal>
    </div>
  );
}
