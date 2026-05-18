import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tax3 Social Agent",
  description: "Autonomous social media growth agent for Tax3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-black text-white`}>
        <Navigation />
        <main className="pt-14 md:pt-14 min-h-screen">
          {children}
        </main>
        <footer className="border-t border-brand-gray-700 py-6 px-4">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-gray-400">
            <span>© {new Date().getFullYear()} Tax3. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
