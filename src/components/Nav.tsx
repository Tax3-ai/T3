"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PUBLIC = [
  { label: "Home",  href: "/" },
  { label: "Book",  href: "/book" },
  { label: "Shop",  href: "/store" },
];

const STAFF = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Job",   href: "/jobs/new" },
  { label: "Customers", href: "/customers" },
  { label: "Products",  href: "/products" },
  { label: "Leads",     href: "/leads" },
  { label: "Pricing",   href: "/admin/pricing" },
];

export function Nav() {
  const path = usePathname();
  const isStaff = path.startsWith("/dashboard") || path.startsWith("/jobs") ||
    path.startsWith("/customers") || path.startsWith("/products") ||
    path.startsWith("/leads") || path.startsWith("/admin");

  const items = isStaff ? STAFF : PUBLIC;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-700 bg-gray-950/95 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">F</div>
          <div>
            <p className="text-white font-bold text-sm leading-none">FixIt Repairs</p>
            <p className="text-gray-500 text-[10px]">Mobile Device Repair</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                path === item.href || (item.href !== "/" && path.startsWith(item.href))
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!isStaff
            ? <Link href="/dashboard" className="btn-primary hidden sm:block">Staff Login</Link>
            : <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← Public Site</Link>
          }
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden border-t border-gray-700 flex overflow-x-auto">
        {items.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex-shrink-0 px-4 py-2 text-xs whitespace-nowrap transition-colors ${
              path === item.href ? "text-primary border-b-2 border-primary" : "text-gray-400"
            }`}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
