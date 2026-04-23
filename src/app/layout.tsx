import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      </body>
    </html>
  );
}
