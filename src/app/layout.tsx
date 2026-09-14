import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { SITE_URL } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Site-wide defaults. Per-page title/description/canonical/OpenGraph
// live in src/lib/seo.ts and are exported via each route's layout.tsx
// (calculateurs, prestations, etc.). The home (page /) uses these
// defaults directly. Removing the hardcoded canonical and the global
// openGraph from this file lets per-page metadata take precedence
// rather than being overridden by the layout default.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NotariaPrime — Calculateurs notariés et fiscaux gratuits",
    template: "%s",
  },
  description: "19 calculateurs et 12 guides pour préparer achat immobilier, donation, succession et investissement. Simulations gratuites, exemples et sources fiscales.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "NotariaPrime",
    title: "NotariaPrime — Calculateurs notariés et fiscaux gratuits",
    description: "19 calculateurs et 12 guides immobiliers et patrimoniaux : simulations gratuites, exemples chiffrés et sources fiscales.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "NotariaPrime — calculateurs notariés et fiscaux" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NotariaPrime — Calculateurs notariés et fiscaux",
    description: "19 calculateurs et 12 guides immobiliers et patrimoniaux, avec exemples chiffrés et sources fiscales.",
    images: ["/images/og-image.png"],
  },
  keywords: ["calculateur notarial", "frais notariés", "fiscalité immobilière", "LMNP", "SCI", "donation", "IFI", "plus-value", "open source"],
  authors: [{ name: "NotariaPrime" }],
  creator: "NotariaPrime",
  publisher: "NotariaPrime",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "LbY4NXudNFiALFA-XV8m4NF7ZtGFNVM4oMq5SLcztcU",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <head>
        {/* Theme color pour mobile */}
        <meta name="theme-color" content="#4f46e5" />
        {/* Canonical per-page is set by each route's layout.tsx via
            alternates.canonical (src/lib/seo.ts). No hardcoded canonical
            here so that subpages don't all point to the home. */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <CookieBanner />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
