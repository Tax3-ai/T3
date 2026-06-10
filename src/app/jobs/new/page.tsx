"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEVICE_BRANDS, REPAIR_TYPES } from "@/lib/constants";
import { Suspense } from "react";

function NewJobForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: params.get("name") || "",
    customerPhone: params.get("phone") || "",
    customerEmail: "",
    deviceBrand: "", deviceModel: "", deviceColor: "", imei: "",
    faultDescription: "", repairType: "", quotedPrice: "", estimatedReady: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const job = await res.json();
      router.push(`/jobs/${job.id}`);
    } catch { setError("Failed to create job. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Repair Job</h1>
        <p className="text-gray-500 text-sm mt-1">Log a device for repair</p>
      </div>
      <form onSubmit={submit} className="space-y-5">

        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">Customer Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name *</label>
              <input required value={form.customerName} onChange={e => set("customerName",e.target.value)} className="input" placeholder="John Smith" />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input required value={form.customerPhone} onChange={e => set("customerPhone",e.target.value)} className="input" placeholder="07700 900000" />
            </div>
            <div>
              <label className="label">Email <span className="text-gray-600">(optional)</span></label>
              <input value={form.customerEmail} onChange={e => set("customerEmail",e.target.value)} className="input" placeholder="john@example.com" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">Device Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Brand *</label>
              <select required value={form.deviceBrand} onChange={e => set("deviceBrand",e.target.value)} className="input">
                <option value="">Select...</option>
                {DEVICE_BRANDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Model *</label>
              <input required value={form.deviceModel} onChange={e => set("deviceModel",e.target.value)} className="input" placeholder="iPhone 15 Pro" />
            </div>
            <div>
              <label className="label">Colour</label>
              <input value={form.deviceColor} onChange={e => set("deviceColor",e.target.value)} className="input" placeholder="Black" />
            </div>
            <div>
              <label className="label">IMEI <span className="text-gray-600">(optional)</span></label>
              <input value={form.imei} onChange={e => set("imei",e.target.value)} className="input" placeholder="15-digit IMEI" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">Repair Details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Repair Type *</label>
              <select required value={form.repairType} onChange={e => set("repairType",e.target.value)} className="input">
                <option value="">Select...</option>
                {REPAIR_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fault Description *</label>
              <textarea required value={form.faultDescription} onChange={e => set("faultDescription",e.target.value)}
                rows={3} className="input resize-none" placeholder="Describe the issue in detail..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Quoted Price (£)</label>
                <input type="number" step="0.01" value={form.quotedPrice} onChange={e => set("quotedPrice",e.target.value)} className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="label">Estimated Ready</label>
                <input type="datetime-local" value={form.estimatedReady} onChange={e => set("estimatedReady",e.target.value)} className="input" />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Creating..." : "Create Job"}</button>
        </div>
      </form>
    </div>
  );
}

export default function NewJobPage() {
  return <Suspense><NewJobForm /></Suspense>;
}
