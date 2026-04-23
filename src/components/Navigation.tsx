"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "⚡" },
  { label: "Approval Queue", href: "/approval", icon: "✅" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Trends", href: "/trends", icon: "📈" },
  { label: "Reports", href: "/reports", icon: "📊" },
  { label: "Brand Bible", href: "/brand-bible", icon: "📖" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-gray-700 bg-brand-black/90 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">T3</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-sm tracking-wider">TAX3</span>
            <span className="text-brand-gray-400 text-[10px] uppercase tracking-widest">Social Agent</span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                pathname === item.href
                  ? "bg-brand-red/20 text-brand-red border border-brand-red/30"
                  : "text-brand-gray-400 hover:text-white hover:bg-brand-gray-800"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow" />
            <span className="text-xs text-brand-gray-400">Agent Active</span>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-brand-gray-700 flex overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-0.5 px-4 py-2 text-xs whitespace-nowrap flex-shrink-0 transition-colors",
              pathname === item.href
                ? "text-brand-red border-b-2 border-brand-red"
                : "text-brand-gray-400"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
