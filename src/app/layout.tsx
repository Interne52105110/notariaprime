import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
  metadataBase: new URL("https://notariaprime.fr"),
  title: {
    default: "NotariaPrime — Calculateurs notariés et fiscaux gratuits",
    template: "%s",
  },
  description: "Plateforme open source de calculateurs notariés et fiscaux français : frais d'acquisition, plus-value, LMNP, SCI, donation, IFI, assurance vie. Conforme tarif réglementé 2026/2028.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://notariaprime.fr",
    siteName: "NotariaPrime",
    title: "NotariaPrime — Calculateurs notariés et fiscaux gratuits",
    description: "15+ simulateurs fiscaux et notariés français, conformes au tarif réglementé 2026/2028. Open source, 100% gratuit.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "NotariaPrime — calculateurs notariés et fiscaux" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NotariaPrime — Calculateurs notariés et fiscaux",
    description: "15+ simulateurs fiscaux et notariés français, conformes au tarif réglementé 2026/2028.",
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
        {/* Google Analytics - chargé uniquement après consentement via CookieBanner */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YBC8WDQD0W"
          strategy="afterInteractive"
          id="gtag-script"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });
            gtag('config', 'G-YBC8WDQD0W', {
              anonymize_ip: true
            });
          `}
        </Script>
        <CookieBanner />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}