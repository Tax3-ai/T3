"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer {
  id: string; name: string; phone: string; email: string | null;
  createdAt: string; _count: { repairJobs: number; orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const p = search ? `?search=${encodeURIComponent(search)}` : "";
      fetch(`/api/customers${p}`).then(r => r.json()).then(d => { setCustomers(d); setLoading(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} total</p>
        </div>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone or email..."
        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary outline-none text-sm w-full max-w-md mb-6 transition-colors" />
      <div className="card overflow-hidden">
        {loading ? <div className="text-center py-16 text-gray-500">Loading...</div> :
         customers.length === 0 ? <div className="text-center py-16 text-gray-500">No customers found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {["Name","Phone","Email","Jobs","Orders","Joined",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white text-sm">{c.name}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-center"><span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-full">{c._count.repairJobs}</span></td>
                    <td className="px-4 py-3 text-center"><span className="bg-green-900/40 text-green-300 text-xs px-2 py-0.5 rounded-full">{c._count.orders}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <Link href={`/jobs/new?phone=${c.phone}&name=${encodeURIComponent(c.name)}`}
                        className="text-primary hover:text-primary-light text-xs font-medium">New Job</Link>
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
