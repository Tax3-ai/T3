import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
export const metadata: Metadata = {
  title: 'Axon AI — Your AI Workforce. Ready Now.',
  description: 'Deploy AI agents that work like employees. Admin, Sales, Support, Social Media, and Finance agents available 24/7.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{background:'#050505',color:'white'}}>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
