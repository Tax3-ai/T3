import Link from "next/link";
import { RepairEstimator } from "@/components/RepairEstimator";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image — circuit board / tech internals */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=50"
            alt=""
            className="w-full h-full object-cover opacity-[0.18]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-gray-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          <div className="absolute inset-0 hero-glow" />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Same-day repairs available
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-5">
              Expert Phone<br />
              <span className="gradient-text">Repairs</span> You<br />
              Can Trust
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Screens, batteries, water damage & more — fixed fast.
              SMS updates at every stage so you&apos;re never left guessing.
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

      {/* Feature strip — phone repair image */}
      <section className="relative overflow-hidden border-y border-gray-700/50">
        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&auto=format&fit=crop&q=60"
          alt="Phone repair technician"
          className="w-full h-52 md:h-72 object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-gray-950/90 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-white text-2xl md:text-4xl font-black tracking-tight">
              Professional repairs by <span className="gradient-text">certified technicians</span>
            </p>
            <p className="text-gray-400 mt-2 text-sm md:text-base">All repairs carry a 90-day warranty</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-3">How It Works</h2>
          <p className="text-gray-500 text-center text-sm mb-10">Simple, transparent, stress-free</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n:"01", icon:"📱", t:"Drop Off", d:"We log your device instantly and send a confirmation SMS.", img:"https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&auto=format&fit=crop&q=70" },
              { n:"02", icon:"🔍", t:"Diagnose", d:"We assess the fault and confirm the price before starting.", img:"https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&auto=format&fit=crop&q=70" },
              { n:"03", icon:"🔧", t:"Repair",   d:"Technicians get to work. You get SMS updates throughout.", img:"https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&auto=format&fit=crop&q=70" },
              { n:"04", icon:"✅", t:"Collect",  d:"Pick up your device. We follow up 7 days later to check in.", img:"https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&auto=format&fit=crop&q=70" },
            ].map((s) => (
              <div key={s.n} className="card-glow overflow-hidden">
                <div className="h-32 overflow-hidden relative">
                  <img src={s.img} alt={s.t} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-primary text-xs font-bold tracking-widest">{s.n}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{s.icon}</span>
                    <h3 className="text-white font-semibold">{s.t}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-16 bg-gray-900 border-t border-gray-700/50">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-3">What We Fix</h2>
          <p className="text-gray-500 text-center text-sm mb-10">All major brands covered</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:"📺", t:"Screen Replacement", d:"OEM & aftermarket screens for all major brands", img:"https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=70" },
              { icon:"🔋", t:"Battery Replacement", d:"Genuine capacity batteries, same-day fitting", img:"https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=600&auto=format&fit=crop&q=70" },
              { icon:"⚡", t:"Charging Port",        d:"USB-C, Lightning & Micro USB repair", img:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=70" },
              { icon:"📸", t:"Camera Repair",        d:"Front & rear camera module replacement", img:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=70" },
              { icon:"💧", t:"Water Damage",         d:"Component-level cleaning and recovery", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=70" },
              { icon:"💾", t:"Data Recovery",        d:"Retrieve photos, contacts & files", img:"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=70" },
            ].map((s) => (
              <div key={s.t} className="card-glow overflow-hidden group">
                <div className="h-36 overflow-hidden relative">
                  <img src={s.img} alt={s.t} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300 group-hover:scale-105 transform transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />
                  <span className="absolute top-3 left-3 text-2xl">{s.icon}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1">{s.t}</h3>
                  <p className="text-gray-400 text-sm">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands banner */}
      <section className="px-4 py-12 border-t border-gray-700/50">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">Brands we repair</p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {["Apple","Samsung","Google","OnePlus","Huawei","Sony","Motorola","Nokia"].map(brand => (
              <span key={brand} className="text-gray-400 font-semibold text-sm bg-gray-800 border border-gray-700 px-4 py-2 rounded-full hover:border-primary/40 hover:text-white transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
