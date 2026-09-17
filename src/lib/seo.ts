import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";

const BASE = SITE_URL;
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
export const PAGE_META: Record<string, PageMeta> = {
  "/guides": {"title": "Guides immobiliers et patrimoniaux — NotariaPrime", "description": "Préparez achat, donation, succession et investissement : guides chiffrés, pièces à réunir, sources officielles et liens vers les calculateurs."},
  "/capacite-emprunt": {"title": "Capacité d’emprunt et budget immobilier — NotariaPrime", "description": "Estimez votre mensualité disponible, votre capacité de crédit et votre budget d’achat avec apport, assurance et frais. Hypothèses à adapter à la banque."},
  "/strategie-immobiliere": {"title": "Investissement immobilier : achat, location et revente", "description": "Comparez une location nue en direct et une SCI à l’IS sur toute la durée : emprunt, trésorerie annuelle, impôt à la vente et distribution du produit."},
  "/relance-logement": {"title": "Relance logement 2026 : simulateur d’amortissement", "description": "Estimez la déduction Jeanbrun dans le neuf ou l’ancien réhabilité : base, taux, plafond du foyer, prorata et effet fiscal indicatif sous conditions."},
  // ---------- Calculateurs ----------
  "/assurance-vie": {
    title: "Assurance-vie : rachats et transmission en 2026",
    description: "Estimez l’impôt d’un rachat et la transmission avant ou après 70 ans. Abattements, certificats de l’assureur et limites du calcul expliqués.",
    keywords: ["assurance vie", "fiscalité", "succession", "abattement 152500", "70 ans", "transmission"],
  },
  "/donation": {
    title: "Droits de donation : abattements et calcul en 2026",
    description: "Estimez les droits par bénéficiaire : lien de parenté, dons antérieurs, nue-propriété et Dutreil. Vérifiez les conditions et plafonds disponibles.",
    keywords: ["donation", "droits de donation", "abattement parent enfant", "donation-partage", "barème"],
  },
  "/holding": {
    title: "Holding patrimoniale : trésorerie et fiscalité",
    description: "Comparez détention directe et SCI avec holding à l’IS : trésorerie, régime mère-fille, distributions et transmission sous hypothèses explicites.",
    keywords: ["holding patrimoniale", "régime mère-fille", "SCI", "trésorerie", "distribution"],
  },
  "/ifi": {
    title: "Calculateur IFI 2026 : patrimoine, dettes et plafonnement",
    description: "Estimez votre IFI : patrimoine immobilier taxable, abattement de résidence principale, dettes admissibles, barème, décote et plafonnement.",
    keywords: ["IFI", "impôt fortune immobilière", "barème IFI 2026", "résidence principale", "abattement 30%"],
  },
  "/investissement-locatif": {
    title: "Investissement locatif : rentabilité et fiscalité",
    description: "Estimez rendement, trésorerie et effort d’épargne après fiscalité. Comparez les dispositifs locatifs proposés avec leurs conditions et limites.",
    keywords: ["investissement locatif", "rentabilité locative", "cashflow", "TRI", "micro-foncier", "LMNP"],
  },
  "/lmnp": {
    title: "Calculateur LMNP 2026 — amortissement, fiscalité, régime réel",
    description: "Simulez votre fiscalité LMNP (Loueur Meublé Non Professionnel) : amortissement bien + mobilier, régime réel vs micro-BIC, déficit reportable, plus-value. Règles 2026, hypothèses et limites détaillées.",
    keywords: ["LMNP", "loueur meublé", "amortissement LMNP", "régime réel", "micro-BIC", "plus-value LMNP"],
  },
  "/plusvalue": {
    title: "Calculateur plus-value immobilière 2026 — abattements, exonérations",
    description: "Calculez la plus-value immobilière nette : abattement durée de détention IR + prélèvements sociaux, exonération résidence principale, taux 19% + 17,2% PS, surtaxe au-delà 50 000 €.",
    keywords: ["plus-value immobilière", "abattement durée détention", "exonération résidence principale", "surtaxe"],
  },
  "/plusvalue-pro": {
    title: "Plus-value professionnelle : IR, IS et exonérations",
    description: "Calculez une cession d’actif ou de titres : valeur nette comptable, court et long terme, exonérations sous conditions et cotisations à renseigner.",
    keywords: ["plus-value professionnelle", "151 septies", "238 quindecies", "cession entreprise", "régime court terme"],
  },
  "/pret": {
    title: "Prêt immobilier : mensualité et coût du crédit",
    description: "Calculez les mensualités d’un prêt à taux fixe, son assurance, son coût total et son taux effectif estimé. Échéancier détaillé à exporter.",
    keywords: ["prêt immobilier", "capacité emprunt", "mensualité", "TAEG", "tableau amortissement", "assurance emprunteur"],
  },
  "/pretaxe": {
    title: "Calculateur frais de notaire 2026 — émoluments, DMTO, prétaxe des actes",
    description: "Calculez les frais de notaire d'une vente, donation, succession ou acte de société : émoluments au tarif réglementé 2026/2028, droits de mutation (DMTO) par département, CSI, formalités et débours. Prétaxe détaillée, 49 types d'actes.",
    keywords: ["frais de notaire", "calcul frais de notaire", "émoluments notaire", "DMTO", "prétaxe", "tarif réglementé notaire 2026", "droits de mutation"],
  },
  "/retraite": {
    title: "Simulateur retraite — pension, cotisations, fiscalité",
    description: "Projetez votre retraite à partir des relevés : base, complémentaire, décote, surcote et comparaison des dates de départ.",
    keywords: ["simulateur retraite", "pension", "AGIRC-ARRCO", "décote surcote", "abattement 10%"],
  },
  "/revenus-fonciers": {
    title: "Calculateur revenus fonciers — fiscalité, micro vs réel",
    description: "Calculez vos revenus fonciers nets imposables : régime micro-foncier (abattement 30%) vs régime réel (déduction des charges), déficit foncier 10 700 €, imputation sur revenu global.",
    keywords: ["revenus fonciers", "micro-foncier", "régime réel", "déficit foncier", "charges déductibles"],
  },
  "/sci": {
    title: "SCI IR ou IS : fiscalité des loyers et revente",
    description: "Comparez SCI à l’IR et à l’IS : impôts annuels, amortissement, intérêts de compte courant, distributions et fiscalité de la vente de l’immeuble.",
    keywords: ["SCI", "SCI IR vs IS", "société civile immobilière", "transmission SCI", "amortissement"],
  },
  "/statut-juridique": {
    title: "Comparateur de statuts : SASU, EURL et entreprise individuelle",
    description: "Comparez le revenu net selon les formes et régimes proposés : cotisations, rémunération, dividendes et impôts sous les hypothèses précisées dans le calculateur.",
    keywords: ["statut juridique", "SASU", "EURL", "entreprise individuelle", "comparateur statut"],
  },
  "/succession": {
    title: "Calculateur droits de succession 2026 — abattements, barème par héritier",
    description: "Calculez les droits de succession dus par chaque héritier : abattement 100 000 € par enfant, barème progressif, conjoint exonéré, représentation, nue-propriété, rappel fiscal des donations.",
    keywords: ["droits de succession", "abattement succession", "barème succession", "héritier", "conjoint survivant", "nue-propriété"],
  },
  "/viager": {
    title: "Calculateur viager — bouquet, rente et fiscalité",
    description: "Comparez les scénarios de bouquet et de rente, la valeur d'occupation et la fiscalité. Calcul financier ou coefficient actuariel fourni par votre professionnel.",
    keywords: ["viager", "bouquet viager", "rente viagère", "fiscalité rente viagère", "viager occupé"],
  },

  // ---------- Pages éditoriales ----------
  "/about": {
    title: "À propos de NotariaPrime : outils et méthode",
    description: "NotariaPrime est une plateforme open source de calcul des frais notariés et de simulation fiscale. Gratuit : sources, hypothèses et limites des simulations sont documentées.",
  },
  "/features": {
    title: "Fonctionnalités — calculs notariés, fiscalité, export PDF",
    description: "Explorez 19 calculateurs et 12 guides : frais de notaire, fiscalité, transmission, budget immobilier et comparaison de projets avec hypothèses détaillées.",
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
    description: "Documentation NotariaPrime : barèmes notariaux 2026/2028, DMTO par département, formules de calcul des plus-values, sources réglementaires (BOI, décrets, Code civil).",
  },
  "/cours-comptable-taxateur": {
    title: "Cours comptable-taxateur notarial 2026 — taxation, comptabilité, Genapi",
    description: "Cours complet et à jour 2025/2026 pour comptable-taxateur en office notarial : taxation des actes (émoluments, DMTO, CSI), comptabilité notariale (comptes clients, CDC, inspection), arrêté tarifaire 25/02/2026, loi de finances 2025, Genapi/iNot compta, cas pratiques.",
    keywords: ["comptable taxateur", "taxateur notarial", "comptabilité notariale", "émoluments notaire", "DMTO 2025", "barème notaire 2026", "Genapi compta", "Caisse des Dépôts notaire"],
  },
  "/methodologie-fiscale": {
    title: "Méthodologie fiscale — calculs, sources et hypothèses des simulateurs",
    description: "Sources officielles (Légifrance, DGFiP, BOFiP, Urssaf), hypothèses et limites de chaque simulateur NotariaPrime : barèmes 2026, DMTO, plus-values, IFI, SCI, LMNP, retraite.",
    keywords: ["méthodologie fiscale", "sources DGFiP", "barème 2026", "hypothèses de calcul", "BOFiP"],
  },
  "/contact": {
    title: "Contact — équipe NotariaPrime, support, demandes",
    description: "Contactez l'équipe NotariaPrime : support utilisateur, signalement d'erreur dans un calcul, demande de fonctionnalité, partenariat éditorial ou prestation sur-mesure.",
  },
  "/roadmap": {
    title: "Évolutions et historique des améliorations — NotariaPrime",
    description: "Les améliorations livrées sur NotariaPrime : prétaxe, analyse de documents, simulateurs et guides. Historique daté, périmètre des changements et pistes pour la suite.",
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
