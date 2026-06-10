"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { REPAIR_STATUSES } from "@/lib/constants";

interface HistoryItem { id: string; status: string; smsSent: boolean; createdAt: string; }
interface Job {
  id: string; jobNumber: string; status: string;
  deviceBrand: string; deviceModel: string; deviceColor: string | null; imei: string | null;
  faultDescription: string; repairType: string;
  quotedPrice: number | null; finalPrice: number | null;
  technicianNotes: string | null; internalNotes: string | null;
  followUpSent: boolean; collectedAt: string | null; estimatedReady: string | null;
  createdAt: string;
  customer: { name: string; phone: string; email: string | null };
  statusHistory: HistoryItem[];
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState("");
  const [techNotes, setTechNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  async function load() {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) { router.push("/dashboard"); return; }
    const d: Job = await res.json();
    setJob(d); setPrice(d.quotedPrice?.toString() || "");
    setTechNotes(d.technicianNotes || ""); setInternalNotes(d.internalNotes || "");
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function updateStatus(status: string) {
    setBusy(true);
    await fetch(`/api/jobs/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load(); setBusy(false);
  }

  async function save() {
    setBusy(true);
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotedPrice: price, technicianNotes: techNotes, internalNotes }),
    });
    await load(); setBusy(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!job) return null;

  const statusIdx = REPAIR_STATUSES.findIndex(s => s.value === job.status);

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white font-mono">{job.jobNumber}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-gray-500 text-sm">{new Date(job.createdAt).toLocaleString("en-GB")}</p>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
      </div>

      {/* Progress */}
      <div className="card p-5 mb-6">
        <div className="flex items-center">
          {REPAIR_STATUSES.filter(s => s.value !== "CANCELLED").map((s, i, arr) => {
            const idx = REPAIR_STATUSES.findIndex(r => r.value === s.value);
            const isCurrent = s.value === job.status;
            const isPast = statusIdx > idx;
            return (
              <div key={s.value} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${isCurrent ? "bg-primary border-primary text-white scale-110" : isPast ? "bg-green-600 border-green-600 text-white" : "bg-transparent border-gray-600 text-gray-600"}`}>
                    {isPast ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] hidden sm:block text-center leading-tight transition-colors ${isCurrent ? "text-white" : isPast ? "text-green-400" : "text-gray-600"}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className={`h-0.5 flex-1 mx-1 transition-colors ${isPast ? "bg-green-600" : "bg-gray-700"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Details */}
          <div className="card p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Job Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Customer</p>
                <p className="text-white font-medium">{job.customer.name}</p>
                <p className="text-gray-400">{job.customer.phone}</p>
                {job.customer.email && <p className="text-gray-400">{job.customer.email}</p>}
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Device</p>
                <p className="text-white font-medium">{job.deviceBrand} {job.deviceModel}</p>
                {job.deviceColor && <p className="text-gray-400">{job.deviceColor}</p>}
                {job.imei && <p className="text-gray-500 font-mono text-xs">IMEI: {job.imei}</p>}
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Repair Type</p>
                <p className="text-white">{job.repairType}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Quoted Price</p>
                <p className="text-white font-semibold">{job.quotedPrice ? `£${job.quotedPrice}` : "Not quoted yet"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs mb-1">Fault Description</p>
                <p className="text-white">{job.faultDescription}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Notes & Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Quoted Price (£)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Technician Notes</label>
                <textarea value={techNotes} onChange={e => setTechNotes(e.target.value)} rows={3}
                  className="input resize-none" placeholder="Parts used, repair details..." />
              </div>
              <div>
                <label className="label">Internal Notes <span className="text-gray-600">(staff only)</span></label>
                <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={2}
                  className="input resize-none" placeholder="Any internal notes..." />
              </div>
              <button onClick={save} disabled={busy}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                {busy ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Status Control */}
          <div className="card p-5">
            <h2 className="text-white font-semibold text-sm mb-2">Update Status</h2>
            <p className="text-gray-500 text-xs mb-4">Changing status automatically SMS's the customer</p>
            <div className="space-y-2">
              {REPAIR_STATUSES.map(s => (
                <button key={s.value} disabled={busy || s.value === job.status} onClick={() => updateStatus(s.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${s.value === job.status
                      ? "bg-primary/20 border border-primary/40 text-primary cursor-default"
                      : "bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-40"}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color}`} />
                  {s.label}
                  {s.value === job.status && <span className="ml-auto text-xs opacity-60">Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="card p-5">
            <h2 className="text-white font-semibold text-sm mb-4">History</h2>
            <div className="space-y-3">
              {job.statusHistory.map((h, i) => (
                <div key={h.id} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {i < job.statusHistory.length - 1 && <div className="w-px flex-1 bg-gray-700 mt-1" />}
                  </div>
                  <div className="pb-3 flex-1">
                    <StatusBadge status={h.status} />
                    <p className="text-gray-500 text-xs mt-1">{new Date(h.createdAt).toLocaleString("en-GB")}</p>
                    {h.smsSent && <p className="text-green-400 text-xs mt-0.5">✓ SMS sent</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
