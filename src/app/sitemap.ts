import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { guides } from "@/content/guides";

// Pas de date artificielle à chaque build : `new Date()` signalait à
// Google que toutes les pages changeaient en permanence, ce qui décrédibilise
// le sitemap. Google ignore changefreq/priority ; seule la liste d'URLs compte.

// Calculateurs (coeur produit)
const CALCULATEURS = [
  "capacite-emprunt", "strategie-immobiliere", "relance-logement",
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
  "succession",
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
  { path: "methodologie-fiscale", priority: 0.6 },
  { path: "cours-comptable-taxateur", priority: 0.7 },
  { path: "contact", priority: 0.5 },
  { path: "roadmap", priority: 0.4 },
];

// Pages légales (nécessaires mais pas cibles SEO)
const PAGES_LEGALES = ["mentions-legales", "cgu", "confidentialite"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/guides` },
    ...guides.map(g => ({ url: `${SITE_URL}/guides/${g.slug}`, lastModified: "2026-09-14" })),
    ...CALCULATEURS.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...PAGES_EDITO.map(({ path, priority }) => ({
      url: `${SITE_URL}/${path}`,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...PAGES_LEGALES.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
