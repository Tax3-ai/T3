"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { REPAIR_STATUSES } from "@/lib/constants";

interface Job {
  id: string; jobNumber: string; status: string;
  deviceBrand: string; deviceModel: string; faultDescription: string;
  quotedPrice: number | null; createdAt: string;
  customer: { name: string; phone: string };
}

// Demo stats shown when the DB is empty/unavailable and demo jobs are displayed
const DEMO_STATS = { total: 47, active: 12, ready: 3, newToday: 2, revenue: 8420 };
const DEMO_JOB_ID_PREFIX = "demo-";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (search) p.set("search", search);
    fetch(`/api/jobs?${p}`).then(r => r.json()).then(d => { setJobs(d); setLoading(false); });
  }, [statusFilter, search]);

  const isDemo = jobs.length > 0 && jobs[0]?.id?.startsWith(DEMO_JOB_ID_PREFIX);
  const today = new Date().toDateString();
  const stats = isDemo
    ? [
        { label: "Total Jobs",          value: DEMO_STATS.total,              color: "text-white" },
        { label: "Active",              value: DEMO_STATS.active,             color: "text-blue-400" },
        { label: "Ready to Collect",    value: DEMO_STATS.ready,              color: "text-green-400" },
        { label: "New Today",           value: DEMO_STATS.newToday,           color: "text-yellow-400" },
        { label: "Revenue (collected)", value: `£${DEMO_STATS.revenue.toLocaleString()}`, color: "text-primary" },
      ]
    : [
        { label: "Total Jobs",          value: jobs.length,                                                                                         color: "text-white" },
        { label: "Active",              value: jobs.filter(j => !["COLLECTED","CANCELLED"].includes(j.status)).length,                              color: "text-blue-400" },
        { label: "Ready to Collect",    value: jobs.filter(j => j.status === "READY").length,                                                       color: "text-green-400" },
        { label: "New Today",           value: jobs.filter(j => new Date(j.createdAt).toDateString() === today).length,                             color: "text-yellow-400" },
        { label: "Revenue (collected)", value: `£${jobs.filter(j => j.status === "COLLECTED").reduce((s,j) => s+(j.quotedPrice||0),0).toFixed(0)}`, color: "text-primary" },
      ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Repair job management</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">+ New Job</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs, customers, devices..."
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary outline-none text-sm w-64 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          {[{ value: "", label: "All" }, ...REPAIR_STATUSES].map(s => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.value ? "bg-primary text-white" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden mb-8">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-3">No jobs found</p>
            <Link href="/jobs/new" className="text-primary hover:text-primary-light text-sm">Create first job →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {["Job #","Customer","Device","Fault","Status","Price","Date",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">{job.jobNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{job.customer.name}</p>
                      <p className="text-xs text-gray-500">{job.customer.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{job.deviceBrand} {job.deviceModel}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">{job.faultDescription}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3 text-sm text-white">{job.quotedPrice ? `£${job.quotedPrice}` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${job.id}`} className="text-primary hover:text-primary-light text-sm font-medium">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href:"/jobs/new",      icon:"🔧", label:"New Job",     desc:"Log a device for repair" },
          { href:"/customers",     icon:"👥", label:"Customers",   desc:"View customer database" },
          { href:"/products",      icon:"📦", label:"Products",    desc:"Inventory & store catalog" },
          { href:"/leads",         icon:"📋", label:"Leads",       desc:"Website enquiries" },
        ].map(n => (
          <Link key={n.href} href={n.href} className="card p-5 hover:border-primary/30 transition-colors group">
            <span className="text-2xl mb-2 block">{n.icon}</span>
            <p className="text-white font-medium text-sm group-hover:text-primary transition-colors">{n.label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{n.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
