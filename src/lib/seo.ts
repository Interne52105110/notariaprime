import type { Metadata } from "next";

const BASE = "https://notariaprime.fr";
const OG_IMAGE = `${BASE}/images/og-image.png`;

interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
}

// Catalogue centralisé des titres + descriptions par route. Chaque page
// calculateur ou éditoriale référence cet objet via layout.tsx, ce qui
// produit un <title>, une <meta description> et un canonical uniques
// (sans cette table, toutes les pages héritaient du metadata global du
// root layout — Google les voyait comme duplicate content et n'indexait
// que la home).
const PAGE_META: Record<string, PageMeta> = {
  // ---------- Calculateurs ----------
  "/assurance-vie": {
    title: "Calculateur Assurance vie 2026 — fiscalité, succession, abattements",
    description: "Simulez la fiscalité de votre contrat d'assurance vie : versements avant/après 70 ans, abattement 152 500 €, prélèvement 20%/31,25%, transmission. Gratuit, conforme 2025/2026.",
    keywords: ["assurance vie", "fiscalité", "succession", "abattement 152500", "70 ans", "transmission"],
  },
  "/donation": {
    title: "Calculateur Donation 2026 — droits, abattements parent-enfant",
    description: "Calculez les droits de donation : abattement 100 000 € parent-enfant, 31 865 € grand-parent, 80 724 € conjoint. Barème progressif, présent d'usage, donation-partage.",
    keywords: ["donation", "droits de donation", "abattement parent enfant", "donation-partage", "barème"],
  },
  "/holding": {
    title: "Calculateur Holding patrimoniale — fiscalité, montage, IS vs IR",
    description: "Simulez le montage d'une holding patrimoniale : régime mère-fille, intégration fiscale, apport-cession 150-0 B ter, comparaison IS/IR. Frais notariés et fiscalité chiffrés.",
    keywords: ["holding patrimoniale", "régime mère-fille", "intégration fiscale", "150-0 B ter", "apport cession"],
  },
  "/ifi": {
    title: "Calculateur IFI 2026 — Impôt sur la Fortune Immobilière",
    description: "Simulez votre IFI 2026 : barème progressif au-delà de 1,3 M€, abattement résidence principale 30%, plafonnement, dettes déductibles. Calcul gratuit, conforme dernière réforme.",
    keywords: ["IFI", "impôt fortune immobilière", "barème IFI 2026", "résidence principale", "abattement 30%"],
  },
  "/investissement-locatif": {
    title: "Simulateur investissement locatif — rentabilité, cashflow, fiscalité",
    description: "Calculez la rentabilité brute, nette et nette-nette d'un investissement locatif. Cashflow mensuel, fiscalité (micro-foncier, réel, LMNP), TRI sur 20 ans, sensibilité aux loyers.",
    keywords: ["investissement locatif", "rentabilité locative", "cashflow", "TRI", "micro-foncier", "LMNP"],
  },
  "/lmnp": {
    title: "Calculateur LMNP 2026 — amortissement, fiscalité, régime réel",
    description: "Simulez votre fiscalité LMNP (Loueur Meublé Non Professionnel) : amortissement bien + mobilier, régime réel vs micro-BIC, déficit reportable, plus-value. Conforme PLF 2026.",
    keywords: ["LMNP", "loueur meublé", "amortissement LMNP", "régime réel", "micro-BIC", "Censi-Bouvard"],
  },
  "/plusvalue": {
    title: "Calculateur plus-value immobilière 2026 — abattements, exonérations",
    description: "Calculez la plus-value immobilière nette : abattement durée de détention IR + prélèvements sociaux, exonération résidence principale, taux 19% + 17,2% PS, surtaxe au-delà 50 000 €.",
    keywords: ["plus-value immobilière", "abattement durée détention", "exonération résidence principale", "surtaxe"],
  },
  "/plusvalue-pro": {
    title: "Calculateur plus-value professionnelle — sociétés, entreprises",
    description: "Simulez la plus-value professionnelle sur cession d'éléments d'actif : régime court terme/long terme, article 151 septies, 238 quindecies, 41 (transmission entreprise).",
    keywords: ["plus-value professionnelle", "151 septies", "238 quindecies", "cession entreprise", "régime court terme"],
  },
  "/pret": {
    title: "Simulateur prêt immobilier — capacité d'emprunt, mensualité, TAEG",
    description: "Calculez votre capacité d'emprunt, votre mensualité, le coût total du crédit et le TAEG. Tableau d'amortissement, assurance emprunteur, comparaison taux fixe/variable.",
    keywords: ["prêt immobilier", "capacité emprunt", "mensualité", "TAEG", "tableau amortissement", "assurance emprunteur"],
  },
  "/pretaxe": {
    title: "Calculateur prélèvement à la source — taux, revenus, retenue",
    description: "Simulez votre taux de prélèvement à la source : taux personnalisé, taux neutre, taux individualisé, retenue sur salaire, acomptes BIC/BNC. Mise à jour barème 2026.",
    keywords: ["prélèvement à la source", "taux PAS", "taux neutre", "taux individualisé", "acomptes"],
  },
  "/retraite": {
    title: "Simulateur retraite — pension, cotisations, fiscalité",
    description: "Estimez votre future pension de retraite : régime de base, complémentaire AGIRC-ARRCO, décote/surcote, abattement 10%, comparaison statuts (cadre, TNS, fonction publique).",
    keywords: ["simulateur retraite", "pension", "AGIRC-ARRCO", "décote surcote", "abattement 10%"],
  },
  "/revenus-fonciers": {
    title: "Calculateur revenus fonciers — fiscalité, micro vs réel",
    description: "Calculez vos revenus fonciers nets imposables : régime micro-foncier (abattement 30%) vs régime réel (déduction des charges), déficit foncier 10 700 €, imputation sur revenu global.",
    keywords: ["revenus fonciers", "micro-foncier", "régime réel", "déficit foncier", "charges déductibles"],
  },
  "/sci": {
    title: "Simulateur SCI — IR vs IS, fiscalité, transmission",
    description: "Comparez SCI à l'IR vs SCI à l'IS : fiscalité des loyers, amortissement, plus-value, transmission par parts. Coûts de création, frais notariés, exemples chiffrés.",
    keywords: ["SCI", "SCI IR vs IS", "société civile immobilière", "transmission SCI", "amortissement"],
  },
  "/statut-juridique": {
    title: "Comparateur statut juridique — SAS, SARL, EURL, SCI, micro",
    description: "Comparez les statuts juridiques pour votre activité : SAS, SASU, SARL, EURL, SCI, auto-entrepreneur. Fiscalité, charges sociales, responsabilité, capital, transmission.",
    keywords: ["statut juridique", "SAS vs SARL", "EURL", "SCI", "auto-entrepreneur", "comparateur statut"],
  },
  "/viager": {
    title: "Calculateur viager — bouquet, rente, espérance de vie",
    description: "Calculez le bouquet et la rente viagère d'un bien immobilier : barème INSEE espérance de vie, valeur d'occupation, viager libre vs occupé, fiscalité de la rente.",
    keywords: ["viager", "bouquet viager", "rente viagère", "espérance de vie INSEE", "viager occupé"],
  },

  // ---------- Pages éditoriales ----------
  "/about": {
    title: "À propos — NotariaPrime, calculateur notarié open source",
    description: "NotariaPrime est une plateforme open source de calcul des frais notariés et de simulation fiscale. 100% gratuit, conforme au tarif réglementé 2025/2026, mise à jour mensuelle.",
  },
  "/features": {
    title: "Fonctionnalités — calculs notariés, fiscalité, export PDF",
    description: "Découvrez les fonctionnalités de NotariaPrime : 15+ simulateurs fiscaux, calcul des frais notariés conforme au décret 2020-179, export PDF, comparaison statuts, OCR documents.",
  },
  "/prestations": {
    title: "Prestations — comptabilité, développement, expertise immobilière",
    description: "Les prestations NotariaPrime : comptabilité notariale, développement informatique sur-mesure, expertise immobilière. Devis gratuit, intervention France métropolitaine.",
  },
  "/prestations/comptabilite-notariale": {
    title: "Comptabilité notariale — tenue, déclarations, conformité CSN",
    description: "Comptabilité notariale externalisée : tenue des comptes clients, rapprochements bancaires, déclarations CSN, conformité au décret 2020-179, accompagnement des études.",
  },
  "/prestations/developpement-informatique": {
    title: "Développement informatique notarial — sur-mesure, intégration",
    description: "Développement informatique pour études notariales : applications métier, intégrations Genapi/iNot, automatisation des actes, API, formation, maintenance.",
  },
  "/prestations/expertise-immobiliere": {
    title: "Expertise immobilière — évaluation, succession, partage",
    description: "Expertise immobilière indépendante : évaluation pour succession, partage, divorce, IFI. Rapports conformes à la Charte de l'expertise en évaluation immobilière.",
  },
  "/documentation": {
    title: "Documentation — barèmes, formules, sources réglementaires",
    description: "Documentation NotariaPrime : barèmes notariaux 2025/2026, DMTO par département, formules de calcul des plus-values, sources réglementaires (BOI, décrets, Code civil).",
  },
  "/contact": {
    title: "Contact — équipe NotariaPrime, support, demandes",
    description: "Contactez l'équipe NotariaPrime : support utilisateur, signalement d'erreur dans un calcul, demande de fonctionnalité, partenariat éditorial ou prestation sur-mesure.",
  },
  "/roadmap": {
    title: "Roadmap NotariaPrime — prochaines fonctionnalités",
    description: "Roadmap publique de NotariaPrime : nouveaux simulateurs en cours de développement, mises à jour réglementaires PLF 2026, intégrations Genapi, suivi des releases.",
  },

  // ---------- Pages légales ----------
  "/mentions-legales": {
    title: "Mentions légales — NotariaPrime",
    description: "Mentions légales de NotariaPrime : éditeur, hébergeur, directeur de publication, propriété intellectuelle, médiation à la consommation.",
  },
  "/cgu": {
    title: "Conditions générales d'utilisation — NotariaPrime",
    description: "Conditions générales d'utilisation de NotariaPrime : objet du service, accès gratuit, responsabilité, valeur indicative des simulations, propriété intellectuelle.",
  },
  "/confidentialite": {
    title: "Politique de confidentialité — RGPD",
    description: "Politique de confidentialité NotariaPrime : aucune donnée personnelle collectée par défaut, Google Analytics anonymisé sur consentement, droits RGPD, cookies techniques.",
  },
};

/**
 * Builds page metadata for Next.js export. Includes canonical, OpenGraph
 * and Twitter cards so every page has its own preview when shared on
 * LinkedIn / X / Slack and is not seen as a duplicate of the home.
 */
export function buildMetadata(path: string): Metadata {
  const meta = PAGE_META[path];
  if (!meta) {
    throw new Error(`buildMetadata: no metadata defined for path "${path}". Add it to src/lib/seo.ts.`);
  }
  const url = `${BASE}${path}`;
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: "NotariaPrime",
      title: meta.title,
      description: meta.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [OG_IMAGE],
    },
  };
}
