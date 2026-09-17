import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'NOCMON V1.1',
  description: 'Sistem monitoring jaringan ISP, telemetri bandwidth, GIS ODP, kabel fiber optik, dan pelanggan ONU/PPPoE.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} dark`}>
      <body className="bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
