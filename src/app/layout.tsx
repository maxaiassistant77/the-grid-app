import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Grid — Track Your AI Agent",
  description: "Gamified AI agent dashboard. Track performance, compete on the leaderboard, build in public.",
  keywords: ["AI agent", "dashboard", "leaderboard", "artificial intelligence", "automation", "performance tracking"],
  authors: [{ name: "Effortless AI" }],
  openGraph: {
    title: "The Grid — Track Your AI Agent",
    description: "Gamified AI agent dashboard. Track performance, compete on the leaderboard, build in public.",
    url: "https://the-grid-app.vercel.app",
    siteName: "The Grid",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Grid - AI Agent Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Grid — Track Your AI Agent",
    description: "Gamified AI agent dashboard. Track performance, compete on the leaderboard, build in public.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#6c5ce7",
      },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
