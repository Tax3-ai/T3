"use client";
import { useEffect, useState } from "react";
import { DEVICE_BRANDS, REPAIR_TYPES } from "@/lib/constants";

interface Rule { id: string; deviceBrand: string; deviceModel: string | null; repairType: string; minPrice: number; maxPrice: number; }

const blank = { deviceBrand:"", deviceModel:"", repairType:"", minPrice:"", maxPrice:"" };

export default function PricingPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  function load() { fetch("/api/pricing").then(r => r.json()).then(d => { setRules(d); setLoading(false); }); }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch("/api/pricing", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    setSaving(false); setForm(blank); load();
  }

  async function del(id: string) {
    await fetch("/api/pricing", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    load();
  }

  const inp = "bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-primary outline-none text-sm w-full transition-colors";

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pricing Rules</h1>
        <p className="text-gray-500 text-sm mt-1">Powers the repair cost estimator widget on the website</p>
      </div>

      <div className="card p-5 mb-8">
        <h2 className="text-white font-semibold text-sm mb-4">Add Rule</h2>
        <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="label">Brand *</label>
            <select required value={form.deviceBrand} onChange={e => setForm(p => ({...p, deviceBrand:e.target.value}))} className={inp}>
              <option value="">Select...</option>
              {DEVICE_BRANDS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Model <span className="text-gray-600">(optional)</span></label>
            <input value={form.deviceModel} onChange={e => setForm(p => ({...p, deviceModel:e.target.value}))} className={inp} placeholder="iPhone 15 Pro" />
          </div>
          <div>
            <label className="label">Repair Type *</label>
            <select required value={form.repairType} onChange={e => setForm(p => ({...p, repairType:e.target.value}))} className={inp}>
              <option value="">Select...</option>
              {REPAIR_TYPES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Min £ *</label>
            <input required type="number" step="0.01" value={form.minPrice} onChange={e => setForm(p => ({...p, minPrice:e.target.value}))} className={inp} placeholder="50" />
          </div>
          <div>
            <label className="label">Max £ *</label>
            <input required type="number" step="0.01" value={form.maxPrice} onChange={e => setForm(p => ({...p, maxPrice:e.target.value}))} className={inp} placeholder="90" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary col-span-2 md:col-span-1">{saving ? "Adding..." : "Add Rule"}</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="text-center py-16 text-gray-500">Loading...</div> :
         rules.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No pricing rules yet.</p>
            <p className="text-sm mt-1">Add rules above to power the estimator widget.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {["Brand","Model","Repair Type","Min","Max",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {rules.map(r => (
                <tr key={r.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{r.deviceBrand}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.deviceModel || <span className="text-gray-600">All models</span>}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{r.repairType}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">£{r.minPrice}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">£{r.maxPrice}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(r.id)} className="text-red-400 hover:text-red-300 text-sm transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
