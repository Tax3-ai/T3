import Link from "next/link";
import { RepairEstimator } from "@/components/RepairEstimator";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative px-4 pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Same-day repairs available
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-5">
              Expert Phone<br />
              <span className="text-primary">Repairs</span> You<br />
              Can Trust
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Screens, batteries, water damage & more — fixed fast.
              SMS updates at every stage so you're never left guessing.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book" className="btn-primary text-base px-8 py-3.5">Book a Repair</Link>
              <Link href="/store" className="btn-secondary text-base px-8 py-3.5">Shop Accessories</Link>
            </div>
            <div className="flex gap-8 mt-10">
              {[["500+","Repairs Done"],["4.9★","Google Rating"],["1hr","Avg Turnaround"]].map(([v,l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-white">{v}</p>
                  <p className="text-gray-500 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div><RepairEstimator /></div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 border-t border-gray-700">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n:"01", icon:"📱", t:"Drop Off", d:"We log your device instantly and send a confirmation SMS." },
              { n:"02", icon:"🔍", t:"Diagnose", d:"We assess the fault and confirm the price before starting." },
              { n:"03", icon:"🔧", t:"Repair",   d:"Technicians get to work. You get SMS updates throughout." },
              { n:"04", icon:"✅", t:"Collect",  d:"Pick up your device. We follow up 7 days later to check in." },
            ].map((s) => (
              <div key={s.n} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-primary text-xs font-bold">{s.n}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{s.t}</h3>
                <p className="text-gray-400 text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-16 bg-gray-900">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">What We Fix</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:"📺", t:"Screen Replacement", d:"OEM & aftermarket screens for all major brands" },
              { icon:"🔋", t:"Battery Replacement", d:"Genuine capacity batteries, same-day fitting" },
              { icon:"⚡", t:"Charging Port",        d:"USB-C, Lightning & Micro USB repair" },
              { icon:"📸", t:"Camera Repair",        d:"Front & rear camera module replacement" },
              { icon:"💧", t:"Water Damage",         d:"Component-level cleaning and recovery" },
              { icon:"💾", t:"Data Recovery",        d:"Retrieve photos, contacts & files" },
            ].map((s) => (
              <div key={s.t} className="card flex gap-4 p-5 hover:border-primary/30 transition-colors">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <h3 className="text-white font-medium mb-1">{s.t}</h3>
                  <p className="text-gray-400 text-sm">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
