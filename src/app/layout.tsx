import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import SessionProvider from "@/components/session-provider";
import PortalBanner from "@/components/portal-banner";
import MobileTabBar from "@/components/mobile-tab-bar";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "petHub",
  description: "Track your pets' pees and poops with your family.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "petHub",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4257269140990083" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4257269140990083"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <Header />
          <PortalBanner />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="border-t mt-12">
            <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-600">
              petHub · Keep the pack in sync
            </div>
          </footer>
          <MobileTabBar />
        </SessionProvider>
      </body>
    </html>
  );
}
