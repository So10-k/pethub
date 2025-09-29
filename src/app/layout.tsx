import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import SessionProvider from "@/components/session-provider";
import PortalBanner from "@/components/portal-banner";
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
  description: "Track your pets’ pees and poops with your family.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <Header />
          {/* Global portal banner */}
          {/* @ts-expect-error Server Component */}
          <PortalBanner />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="border-t mt-12">
            <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-600">
              petHub · Keep the pack in sync
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
