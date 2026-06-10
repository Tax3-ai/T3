import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FixIt Repairs",
  description: "Professional mobile device repair — screen, battery, water damage & more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-50`}>
        <Nav />
        <main className="pt-14 min-h-screen">{children}</main>
        <footer className="border-t border-gray-700 py-6 px-4 mt-16">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} FixIt Repairs. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="/store" className="hover:text-white transition-colors">Shop</a>
              <a href="/book" className="hover:text-white transition-colors">Book a Repair</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
