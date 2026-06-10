"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Lead {
  id: string; name: string; phone: string; email: string | null;
  deviceBrand: string; deviceModel: string | null; faultDescription: string;
  estimatedMin: number | null; estimatedMax: number | null;
  status: string; telegramAlerted: boolean; createdAt: string;
}

const statusStyle: Record<string, string> = {
  NEW: "bg-yellow-900/40 text-yellow-300",
  CONTACTED: "bg-blue-900/40 text-blue-300",
  CONVERTED: "bg-green-900/40 text-green-300",
  LOST: "bg-red-900/40 text-red-300",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(d => { setLeads(d); setLoading(false); });
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Enquiries from the website estimator</p>
        </div>
        <span className="bg-yellow-900/30 text-yellow-400 text-sm px-3 py-1 rounded-full">
          {leads.filter(l => l.status === "NEW").length} new
        </span>
      </div>
      <div className="card overflow-hidden">
        {loading ? <div className="text-center py-16 text-gray-500">Loading...</div> :
         leads.length === 0 ? <div className="text-center py-16 text-gray-500">No leads yet — the estimator widget on the homepage captures them automatically.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {["Name","Phone","Device","Fault","Estimate","Status","Alerted","Date",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{l.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{l.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{l.deviceBrand}{l.deviceModel ? ` ${l.deviceModel}` : ""}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate">{l.faultDescription}</td>
                    <td className="px-4 py-3 text-sm text-white">{l.estimatedMin ? `£${l.estimatedMin}–£${l.estimatedMax}` : "TBC"}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[l.status] || ""}`}>{l.status}</span></td>
                    <td className="px-4 py-3 text-center text-sm">{l.telegramAlerted ? "✅" : "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <Link href={`/jobs/new?phone=${l.phone}&name=${encodeURIComponent(l.name)}`}
                        className="text-primary hover:text-primary-light text-xs font-medium whitespace-nowrap">Convert →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
