import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { themeBootstrap } from "@/lib/theme";
import { ProgressProvider } from "@/components/progress-provider";
import { Shell } from "@/components/shell";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
import "./interactions.css";
import "./pwa.css";
import "./refinements.css";
import { PwaProvider } from "@/components/pwa-provider";
import { InteractionProvider } from "@/components/interaction-provider";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EduCode Hub — Belajar Laravel 12 & Persiapan SERKOM RPL",
    template: "%s | EduCode Hub",
  },
  description:
    "Portal belajar Laravel 12: jobsheet Kopi Ulee Kareng, flashcards, latihan kode, simulasi, pengujian, dan portofolio SERKOM RPL.",
  applicationName: "EduCode Hub",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "EduCode Hub",
    statusBarStyle: "default",
  },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "EduCode Hub",
    title: "EduCode Hub — Belajar Laravel 12",
    description: "Belajar terarah dari konsep hingga praktik dan pengujian.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "EduCode Hub — Belajar Laravel 12",
    description: "Jobsheet, flashcards, dan latihan kode SERKOM RPL.",
  },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#141923" },
  ],
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          id="educode-theme"
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
      </head>
      <body>
        <ThemeProvider>
          <InteractionProvider>
            <PwaProvider>
              <ProgressProvider>
                <Shell>{children}</Shell>
              </ProgressProvider>
            </PwaProvider>
          </InteractionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
