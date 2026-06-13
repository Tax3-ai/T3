"use client";
import { useState } from "react";
import Link from "next/link";


const agents = [
  {
    slug: "admin",
    agentName: "Admin Agent",
    character: "Betsy",
    role: "Personal Assistant",
    ethnicity: "Indian",
    style: "Smart — blazer, glasses",
    bio: "Betsy never takes a day off. She organises your calendar, handles your emails and keeps every task on track — around the clock. When you decide to switch off, Betsy doesn't.",
    avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Betsy-admin&skinColor=d78774&backgroundColor=0a0a0a",
    color: "from-green-500/20",
  },
  {
    slug: "social-media",
    agentName: "Social Media Agent",
    character: "Maya",
    role: "Social Media Manager",
    ethnicity: "Black British",
    style: "Casual — streetwear, confident",
    bio: "Maya lives on social. She creates content for every platform, schedules it at the perfect time, responds to your audience and tracks what's working — all without being asked twice.",
    avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Maya-social&skinColor=4a3728&backgroundColor=0a0a0a",
    color: "from-green-500/20",
  },
  {
    slug: "customer-support",
    agentName: "Customer Support Agent",
    character: "Alex",
    role: "Customer Support Lead",
    ethnicity: "Mixed heritage",
    style: "Smart casual — glasses, friendly",
    bio: "Alex is endlessly patient. He answers every customer query instantly, 24 hours a day. He never gets frustrated, never makes a customer feel like a burden, and always knows what to say.",
    avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Alex-support&skinColor=c8a882&backgroundColor=0a0a0a",
    color: "from-green-500/20",
  },
  {
    slug: "sales",
    agentName: "Sales Agent",
    character: "Marcus",
    role: "Sales Executive",
    ethnicity: "Black",
    style: "Sharp — suit, no glasses",
    bio: "Marcus never lets a lead go cold. He qualifies every inbound enquiry, follows up without fail, keeps your CRM spotless and books meetings straight into your calendar. He doesn't miss.",
    avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Marcus-sales&skinColor=3d2b1f&backgroundColor=0a0a0a",
    color: "from-green-500/20",
  },
  {
    slug: "finance",
    agentName: "Finance Agent",
    character: "Claire",
    role: "Finance Manager",
    ethnicity: "East Asian",
    style: "Professional — glasses, smart",
    bio: "Claire keeps your numbers clean. She sends invoices, chases late payments, tracks every expense and delivers clear financial reports — so you always know where your money is.",
    avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Claire-finance&skinColor=f0c8a0&backgroundColor=0a0a0a",
    color: "from-green-500/20",
  },
];

const pricing = [
  { name: "Starter", description: "One agent, fully deployed", price: "£500", period: "/mo", agentCount: 1, features: ["1 AI agent of your choice", "Full setup & configuration", "Integrations with your tools", "Monthly performance report", "Email support"], cta: "Get Started", highlighted: false },
  { name: "Growth", description: "Three agents working in sync", price: "£1,200", period: "/mo", agentCount: 3, features: ["3 AI agents of your choice", "Priority setup within 48h", "Cross-agent workflow automation", "Weekly performance reports", "Dedicated account manager", "Slack support"], cta: "Most Popular", highlighted: true },
  { name: "Enterprise", description: "Full AI workforce", price: "Custom", period: "", agentCount: 999, features: ["All 5 agents + custom builds", "Same-day deployment", "Custom integrations & APIs", "Real-time dashboards", "SLA guarantee", "24/7 priority support"], cta: "Book a Call", highlighted: false },
];

export default function HomePage() {
  const [formData, setFormData] = useState({ name: "", company: "", email: "", phone: "", agents: [] as string[], message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleAgent(name: string) {
    setFormData(p => ({ ...p, agents: p.agents.includes(name) ? p.agents.filter(a => a !== name) : [...p.agents, name] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) setSubmitted(true);
      else setError("Something went wrong. Please try again.");
    } catch { setError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  }

  return (
    <div style={{ background: "#050505", minHeight: "100vh" }}>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 grid-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: "rgba(34,197,94,0.05)" }} />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-green-500 text-sm uppercase tracking-widest font-mono mb-6">// Axon AI — Intelligent Workforce Solutions</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-6">
            Hire Your First<br />
            <span className="text-green-500 glow-green-text">AI Employee</span><br />
            Today.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Meet Betsy, Maya, Alex, Marcus and Claire — your new AI team. They work 24/7, never call in sick, and cost a fraction of a full-time hire.
          </p>

          {/* Avatar strip */}
          <div className="flex justify-center gap-3 mb-10">
            {agents.map(a => (
              <div key={a.slug} className="relative group">
                <div className="w-14 h-14 border-2 border-green-500/30 group-hover:border-green-500 transition-all overflow-hidden" style={{ background: "#0A0A0A", imageRendering: "pixelated" }}>
                  <img src={a.avatar} alt={a.character} width={56} height={56} style={{ imageRendering: "pixelated" }} />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-green-500 text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{a.character}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#agents" className="bg-green-500 text-black font-black px-8 py-4 text-lg uppercase tracking-widest hover:bg-green-400 transition-all glow-green">Meet the Team →</a>
            <a href="#book-demo" className="border border-green-500 text-green-500 font-black px-8 py-4 text-lg uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">Book Free Demo</a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[{ value: "83%", label: "Cost saving vs. hire" }, { value: "24/7", label: "Always working" }, { value: "<48h", label: "Time to deploy" }].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-green-500 glow-green-text">{s.value}</div>
                <div className="text-gray-500 text-xs uppercase tracking-wide mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-green-500/50 animate-bounce text-sm font-mono">scroll ↓</div>
      </section>

      {/* Meet the Team */}
      <section id="agents" className="py-24 px-4 border-y border-green-500/10" style={{ background: "#080808" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-500 text-sm uppercase tracking-widest font-mono mb-4">// The Team</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Meet Your New<br /><span className="text-green-500">AI Employees.</span></h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Each one is purpose-built, fully configured, and ready to start within 48 hours. No interviews. No notice period.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <Link key={agent.slug} href={`/agents/${agent.slug}`} className="group border border-green-500/20 hover:border-green-500 transition-all block overflow-hidden" style={{ background: "#0A0A0A" }}>
                {/* Avatar area */}
                <div className="relative h-48 flex items-center justify-center border-b border-green-500/10" style={{ background: "#050505" }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "radial-gradient(circle at center, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />
                  <div className="w-32 h-32" style={{ imageRendering: "pixelated" }}>
                    <img src={agent.avatar} alt={agent.character} width={128} height={128} style={{ imageRendering: "pixelated" }} />
                  </div>
                  <div className="absolute top-3 right-3 bg-green-500 text-black text-xs font-black px-2 py-1 uppercase tracking-widest">Available</div>
                </div>
                {/* Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-green-500 text-xs font-mono uppercase tracking-widest">{agent.role}</p>
                  </div>
                  <h3 className="text-white font-black text-2xl mb-1 group-hover:text-green-500 transition-colors">{agent.character}</h3>
                  <p className="text-gray-600 text-xs mb-3 font-mono">{agent.agentName}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{agent.bio}</p>
                  <span className="text-green-500 text-sm font-mono group-hover:translate-x-1 inline-block transition-transform">View profile →</span>
                </div>
              </Link>
            ))}

            {/* Bespoke CTA */}
            <div className="border border-green-500/30 p-8 flex flex-col justify-center items-center text-center" style={{ background: "rgba(34,197,94,0.03)" }}>
              <div className="w-20 h-20 border-2 border-dashed border-green-500/40 flex items-center justify-center mb-6">
                <span className="text-green-500 text-3xl">+</span>
              </div>
              <p className="text-green-500 text-sm uppercase tracking-widest font-mono mb-3">// Custom Build</p>
              <h3 className="text-white font-black text-xl mb-3">Need Someone Bespoke?</h3>
              <p className="text-gray-500 text-sm mb-6">We build custom AI agents for your specific workflows. You name the role — we build the person.</p>
              <a href="#book-demo" className="border border-green-500 text-green-500 font-bold px-6 py-3 text-sm uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">Talk to Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-500 text-sm uppercase tracking-widest font-mono mb-4">// Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">From Demo to<span className="text-green-500"> Deployed in 48h</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Book a Demo", desc: "30-minute call. We learn your business, identify which agents will have the biggest impact, and answer every question." },
              { step: "02", title: "We Configure", desc: "Our team sets up your agents with your tools, tone of voice, workflows, and business rules. No work from you." },
              { step: "03", title: "Test & Refine", desc: "You review everything. We fine-tune until it's exactly right. Your sign-off before anything goes live." },
              { step: "04", title: "Go Live", desc: "Your agents start working immediately. We monitor performance and optimise continuously." },
            ].map(s => (
              <div key={s.step}>
                <div className="text-6xl font-black text-green-500/10 mb-4 font-mono">{s.step}</div>
                <h3 className="text-white font-black text-lg mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 border-y border-green-500/10" style={{ background: "#080808" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-500 text-sm uppercase tracking-widest font-mono mb-4">// Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Transparent. Scalable.<br /><span className="text-green-500 glow-green-text">Exceptional ROI.</span></h2>
            <p className="text-gray-400 text-lg">One AI employee vs. one full-time hire. The numbers speak for themselves.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map(plan => (
              <div key={plan.name} className={`relative p-8 ${plan.highlighted ? "border-2 border-green-500 glow-green" : "border border-green-500/20 hover:border-green-500/50 transition-colors"}`} style={{ background: plan.highlighted ? "rgba(34,197,94,0.05)" : "#0A0A0A" }}>
                {plan.highlighted && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-black px-4 py-1 uppercase tracking-widest">Most Popular</div>}
                <div className="mb-6">
                  <h3 className="text-white font-black text-xl mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-5xl font-black ${plan.highlighted ? "text-green-500 glow-green-text" : "text-white"}`}>{plan.price}</span>
                    <span className="text-gray-500 mb-2">{plan.period}</span>
                  </div>
                  {plan.agentCount !== 999 && <p className="text-green-500/70 text-sm mt-2 font-mono">{plan.agentCount} agent{plan.agentCount > 1 ? "s" : ""} included</p>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => <li key={f} className="flex items-center gap-3 text-sm text-gray-300"><span className="text-green-500 font-bold">✓</span>{f}</li>)}
                </ul>
                <a href="#book-demo" className={`block w-full text-center font-black py-3 uppercase tracking-widest text-sm transition-all ${plan.highlighted ? "bg-green-500 text-black hover:bg-green-400" : "border border-green-500/40 text-green-500 hover:bg-green-500 hover:text-black"}`}>{plan.cta}</a>
              </div>
            ))}
          </div>
          <div className="mt-12 border border-green-500/20 p-6 text-center" style={{ background: "#0A0A0A" }}>
            <p className="text-gray-400 text-sm"><span className="text-green-500 font-bold">Average UK full-time employee costs £35,000+ per year.</span> An Axon AI agent starts at <span className="text-green-500 font-bold">£6,000/year</span> — that&apos;s an 83% saving before you factor in recruitment, sick days, or management overhead.</p>
          </div>
        </div>
      </section>

      {/* Book Demo */}
      <section id="book-demo" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-green-500 text-sm uppercase tracking-widest font-mono mb-4">// Deploy Now</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Book Your<span className="text-green-500 glow-green-text"> Free Demo</span></h2>
            <p className="text-gray-400 text-lg">30-minute session. We&apos;ll introduce your team, show you exactly how they work, and get you set up same day if you&apos;re ready.</p>
          </div>
          {submitted ? (
            <div className="border border-green-500 p-10 text-center glow-green" style={{ background: "rgba(34,197,94,0.1)" }}>
              <div className="flex justify-center gap-2 mb-6">
                {agents.map(a => (
                  <div key={a.slug} className="w-10 h-10" style={{ imageRendering: "pixelated" }}>
                    <img src={a.avatar} alt={a.character} width={40} height={40} style={{ imageRendering: "pixelated" }} />
                  </div>
                ))}
              </div>
              <h3 className="text-green-500 font-black text-2xl mb-2 glow-green-text">Demo Request Received</h3>
              <p className="text-gray-400">We&apos;ll be in touch within 2 hours. Your team is ready to get to work.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-green-500/20 p-8 space-y-6" style={{ background: "#0A0A0A" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Full Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full border border-green-500/20 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" style={{ background: "#050505" }} placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Company *</label>
                  <input type="text" required value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} className="w-full border border-green-500/20 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" style={{ background: "#050505" }} placeholder="Acme Ltd" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full border border-green-500/20 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" style={{ background: "#050505" }} placeholder="john@acme.com" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full border border-green-500/20 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" style={{ background: "#050505" }} placeholder="+44 7700 900000" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-widest mb-3">Which team members do you need?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agents.map(agent => (
                    <label key={agent.slug} className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${formData.agents.includes(agent.character) ? "border-green-500 text-green-500" : "border-green-500/20 text-gray-400 hover:border-green-500/50"}`} style={formData.agents.includes(agent.character) ? { background: "rgba(34,197,94,0.1)" } : {}}>
                      <input type="checkbox" className="sr-only" checked={formData.agents.includes(agent.character)} onChange={() => toggleAgent(agent.character)} />
                      <div className="w-8 h-8 flex-shrink-0" style={{ imageRendering: "pixelated" }}>
                        <img src={agent.avatar} alt={agent.character} width={32} height={32} style={{ imageRendering: "pixelated" }} />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{agent.character}</div>
                        <div className="text-xs text-gray-500">{agent.role}</div>
                      </div>
                      <span className={`ml-auto w-4 h-4 border flex items-center justify-center text-xs flex-shrink-0 ${formData.agents.includes(agent.character) ? "border-green-500 bg-green-500 text-black" : "border-gray-600"}`}>
                        {formData.agents.includes(agent.character) && "✓"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Anything else?</label>
                <textarea rows={3} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} className="w-full border border-green-500/20 text-white px-4 py-3 focus:outline-none focus:border-green-500 transition-colors resize-none" style={{ background: "#050505" }} placeholder="Tell us about your business and what you're looking to automate..." />
              </div>
              {error && <div className="border border-red-500/30 text-red-400 p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)" }}>{error}</div>}
              <button type="submit" disabled={submitting} className="w-full bg-green-500 text-black font-black py-4 uppercase tracking-widest text-lg hover:bg-green-400 transition-all glow-green disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Sending..." : "Book Free Demo →"}
              </button>
              <p className="text-gray-600 text-xs text-center">No commitment. No credit card. We&apos;ll reach out within 2 hours.</p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-500/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 flex items-center justify-center"><span className="text-black font-black text-sm">AX</span></div>
                <span className="text-white font-black text-xl tracking-widest">AXON AI</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">Deploying intelligent AI employees for forward-thinking businesses. Automate. Scale. Dominate.</p>
              <div className="flex gap-2 mt-4">
                {agents.map(a => (
                  <div key={a.slug} className="w-8 h-8" style={{ imageRendering: "pixelated" }}>
                    <img src={a.avatar} alt={a.character} width={32} height={32} style={{ imageRendering: "pixelated" }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">The Team</h4>
              <ul className="space-y-2">
                {agents.map(a => (
                  <li key={a.slug}><Link href={`/agents/${a.slug}`} className="text-gray-500 hover:text-green-500 transition-colors text-sm">{a.character} <span className="text-gray-700">— {a.role}</span></Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-500 hover:text-green-500 transition-colors text-sm">How It Works</a></li>
                <li><a href="#pricing" className="text-gray-500 hover:text-green-500 transition-colors text-sm">Pricing</a></li>
                <li><a href="#book-demo" className="text-gray-500 hover:text-green-500 transition-colors text-sm">Book Demo</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-500/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">© 2026 Axon AI. All rights reserved.</p>
            <p className="text-gray-700 text-xs font-mono">Axon AI — Intelligent Workforce Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
