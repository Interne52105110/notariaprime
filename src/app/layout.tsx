import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NotariaPrime - Calculateur de frais notariés",
  description: "Plateforme open source pour calculer vos frais notariés. 100% gratuit, conforme au tarif réglementé 2025/2026.",
  
  // Open Graph pour réseaux sociaux
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://notariaprime.fr',
    siteName: 'NotariaPrime',
    title: 'NotariaPrime - Calculateur de frais notariés',
    description: 'Calculateur de frais notariés open source • 100% gratuit • Conforme tarif 2025/2026',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NotariaPrime - Calculateur de frais notariés',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'NotariaPrime - Calculateur de frais notariés',
    description: 'Calculateur de frais notariés open source • 100% gratuit • Conforme tarif 2025/2026',
    images: ['/images/og-image.png'],
  },
  
  // Meta tags additionnels
  keywords: ['frais notariés', 'notaire', 'calculateur', 'émoluments', 'open source', 'gratuit', 'DOM-TOM', 'tarif réglementé'],
  authors: [{ name: 'NotariaPrime' }],
  creator: 'NotariaPrime',
  publisher: 'NotariaPrime',
  
  // Favicon
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  
  // Robots
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
  
  // Verification
  verification: {
    // google: 'votre-code-google-search-console',
    // yandex: 'votre-code-yandex',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <head>
        {/* Charset et viewport déjà gérés par Next.js */}
        
        {/* Theme color pour mobile */}
        <meta name="theme-color" content="#4f46e5" />
        
        {/* Liens canonical */}
        <link rel="canonical" href="https://notariaprime.fr" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}