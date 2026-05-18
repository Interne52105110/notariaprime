import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NotariaPrime — Calculateurs notariés et fiscaux',
    short_name: 'NotariaPrime',
    description: 'Plateforme open source de 15+ calculateurs notariés et fiscaux français. Conforme tarif réglementé 2026/2028.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    lang: 'fr-FR',
    orientation: 'portrait-primary',
    categories: ['finance', 'productivity', 'business'],
    icons: [
      { src: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { src: '/images/og-image.png', sizes: '1200x630', type: 'image/png' },
    ],
  };
}
