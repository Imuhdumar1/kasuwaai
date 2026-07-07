import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PWA } from "@/components/pwa";

export const metadata: Metadata = {
  title: "KasuwaAI — Business, Sales & Debt Tracking",
  description:
    "AI-powered sales recording and debt tracking for traders, shop owners, and SMEs. Record sales by voice in English or Hausa, track debts, and manage your business.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "KasuwaAI", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <PWA />
          {children}
        </Providers>
      </body>
    </html>
  );
}
