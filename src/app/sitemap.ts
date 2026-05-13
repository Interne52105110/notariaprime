import type { MetadataRoute } from "next";

const BASE = "https://notariaprime.fr";

// Calculateurs (priority haute : c'est le coeur produit)
const CALCULATEURS = [
  "assurance-vie",
  "donation",
  "holding",
  "ifi",
  "investissement-locatif",
  "lmnp",
  "plusvalue",
  "plusvalue-pro",
  "pret",
  "pretaxe",
  "retraite",
  "revenus-fonciers",
  "sci",
  "statut-juridique",
  "viager",
];

// Pages éditoriales / institutionnelles
const PAGES_EDITO = [
  { path: "about", priority: 0.7 },
  { path: "features", priority: 0.7 },
  { path: "prestations", priority: 0.7 },
  { path: "prestations/comptabilite-notariale", priority: 0.6 },
  { path: "prestations/developpement-informatique", priority: 0.6 },
  { path: "prestations/expertise-immobiliere", priority: 0.6 },
  { path: "documentation", priority: 0.6 },
  { path: "contact", priority: 0.5 },
  { path: "roadmap", priority: 0.4 },
];

// Pages légales (priority basse : nécessaires mais pas cibles SEO)
const PAGES_LEGALES = ["mentions-legales", "cgu", "confidentialite"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...CALCULATEURS.map((slug) => ({
      url: `${BASE}/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...PAGES_EDITO.map(({ path, priority }) => ({
      url: `${BASE}/${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...PAGES_LEGALES.map((slug) => ({
      url: `${BASE}/${slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
