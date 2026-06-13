'use client';
import Link from 'next/link';
import { useState } from 'react';
export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md" style={{background:'rgba(5,5,5,0.85)'}}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 flex items-center justify-center">
            <span className="text-black font-black text-sm">AX</span>
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-white">AXON</span>
            <span className="text-green-500 text-xs block leading-none tracking-[0.3em] font-mono">AI AGENCY</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#agents" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Agents</Link>
          <Link href="/#pricing" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Pricing</Link>
          <Link href="/#how-it-works" className="text-gray-400 hover:text-green-500 transition-colors text-sm">How It Works</Link>
          <Link href="/#book-demo" className="bg-green-500 text-black font-bold px-5 py-2 text-sm hover:bg-green-400 transition-all">Book a Demo</Link>
        </div>
        <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
          <div className={`w-6 h-0.5 bg-current mb-1.5 ${open?'rotate-45 translate-y-2':''}`}/>
          <div className={`w-6 h-0.5 bg-current mb-1.5 ${open?'opacity-0':''}`}/>
          <div className={`w-6 h-0.5 bg-current ${open?'-rotate-45 -translate-y-2':''}`}/>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 px-6 py-4 flex flex-col gap-4" style={{background:'#0A0A0A'}}>
          <Link href="/#agents" className="text-gray-400 hover:text-green-500" onClick={() => setOpen(false)}>Agents</Link>
          <Link href="/#pricing" className="text-gray-400 hover:text-green-500" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/#how-it-works" className="text-gray-400 hover:text-green-500" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="/#book-demo" className="bg-green-500 text-black font-bold px-5 py-3 text-sm text-center" onClick={() => setOpen(false)}>Book a Demo</Link>
        </div>
      )}
    </nav>
  );
}
