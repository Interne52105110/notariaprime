// ============================================
// FILE: src/app/statut-juridique/page.tsx
// DESCRIPTION: Comparateur de Statut Juridique - NotariaPrime
// ============================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator, TrendingUp, FileText, Target,
  Lightbulb, Scale, Percent, Shield, Info,
  AlertCircle, HelpCircle, ChevronDown, ChevronUp,
  Briefcase, Star, CheckCircle, XCircle, Award, Zap,
  BarChart3, PieChart as PieChartIcon, Euro,
  Save, FolderOpen, Trash2, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

type TypeActivite = 'commerciale' | 'artisanale' | 'liberale' | 'immobiliere';
type Objectif = 'remuneration' | 'charges' | 'flexibilite' | 'protection';
type StatutKey = 'EI' | 'EURL_IR' | 'EURL_IS' | 'SARL' | 'SAS' | 'SASU' | 'SCI' | 'SA';
type TabKey = 'comparaison' | 'detail' | 'optimisation' | 'faq';

interface FormData {
  typeActivite: TypeActivite;
  chiffreAffaires: string;
  chargesExploitation: string;
  remunerationSouhaitee: string;
  nombreAssocies: '1' | '2+';
  objectif: Objectif;
  capitalSocial: string;
}

interface ResultatStatut {
  statut: StatutKey;
  label: string;
  ca: number;
  charges: number;
  resultatAvantRemuneration: number;
  remunerationNette: number;
  cotisationsSociales: number;
  tauxCotisations: number;
  is: number;
  dividendesBruts: number;
  fiscaliteDividendes: number;
  dividendesNets: number;
  revenuNetGlobal: number;
  coutTotalEntreprise: number;
  irEstime: number;
  disponible: boolean;
  regimeSocial: string;
  regimeFiscal: string;
}

// ============================================
// CONSTANTES
// ============================================

const PASS = 46368; // Plafond Annuel Securite Sociale 2025

const BAREME_IR = [
  { min: 0, max: 11294, taux: 0 },
  { min: 11294, max: 28797, taux: 0.11 },
  { min: 28797, max: 82341, taux: 0.30 },
  { min: 82341, max: 177106, taux: 0.41 },
  { min: 177106, max: Infinity, taux: 0.45 }
];

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#06b6d4'];

const STATUT_LABELS: Record<StatutKey, string> = {
  EI: 'Entreprise Individuelle',
  EURL_IR: 'EURL (IR)',
  EURL_IS: 'EURL (IS)',
  SARL: 'SARL (IS)',
  SAS: 'SAS (IS)',
  SASU: 'SASU (IS)',
  SCI: 'SCI (IR)',
  SA: 'SA (IS)'
};

const STATUT_SHORT: Record<StatutKey, string> = {
  EI: 'EI',
  EURL_IR: 'EURL IR',
  EURL_IS: 'EURL IS',
  SARL: 'SARL',
  SAS: 'SAS',
  SASU: 'SASU',
  SCI: 'SCI',
  SA: 'SA'
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function parseNumber(str: string): number {
  if (!str || str.trim() === '') return 0;
  let cleaned = str.replace(/\s+/g, '');
  cleaned = cleaned.replace(/\u00A0/g, '');
  cleaned = cleaned.replace(/\u202F/g, '');
  cleaned = cleaned.replace(',', '.');
  cleaned = cleaned.replace(/[^\d.-]/g, '');
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

function formatEuros(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant);
}

function formatPourcentage(valeur: number): string {
  return `${valeur.toFixed(1)} %`;
}

function formatMontantInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerIR(revenuImposable: number, parts: number = 1): number {
  const revenuParPart = revenuImposable / parts;
  let impotParPart = 0;

  for (const tranche of BAREME_IR) {
    if (revenuParPart > tranche.min) {
      const base = Math.min(revenuParPart, tranche.max) - tranche.min;
      impotParPart += base * tranche.taux;
    }
  }

  return impotParPart * parts;
}

function calculerCotisationsSSI(benefice: number): number {
  if (benefice <= 0) return 0;

  // Maladie-maternite: progressif 0-6.5%
  let maladie = 0;
  if (benefice <= 16454) {
    maladie = benefice * 0.005;
  } else if (benefice <= PASS) {
    maladie = benefice * 0.04;
  } else {
    maladie = benefice * 0.065;
  }

  // Retraite de base: 17.75% plafonne au PASS + 0.6% deplafonne
  const retraiteBase = Math.min(benefice, PASS) * 0.1775 + benefice * 0.006;

  // Retraite complementaire: 7% plafonne a 4xPASS
  const retraiteCompl = Math.min(benefice, 4 * PASS) * 0.07;

  // Invalidite-deces: 1.3%
  const invalidite = Math.min(benefice, PASS) * 0.013;

  // Allocations familiales: 0 a 3.1%
  let af = 0;
  if (benefice > PASS * 1.1) {
    af = benefice * 0.031;
  } else if (benefice > PASS) {
    af = benefice * 0.031 * ((benefice - PASS) / (PASS * 0.1));
  }

  // CSG/CRDS: 9.7% sur benefice + cotisations
  const baseCsgTemp = benefice + maladie + retraiteBase + retraiteCompl + invalidite + af;
  const csgCrds = baseCsgTemp * 0.097;

  // Formation: 0.25%
  const formation = benefice * 0.0025;

  return maladie + retraiteBase + retraiteCompl + invalidite + af + csgCrds + formation;
}

function calculerCotisationsSSIIteratif(remunerationNette: number): { cotisations: number; brut: number } {
  // Les cotisations SSI sont calculees sur le benefice (qui inclut les cotisations)
  // On cherche le benefice B tel que B - cotisations(B) = remunerationNette
  let benefice = remunerationNette * 1.6;
  for (let i = 0; i < 20; i++) {
    const cot = calculerCotisationsSSI(benefice);
    const netCalc = benefice - cot;
    const ecart = remunerationNette - netCalc;
    benefice += ecart * 0.5;
    if (Math.abs(ecart) < 1) break;
  }
  const cotisations = calculerCotisationsSSI(benefice);
  return { cotisations, brut: benefice };
}

function calculerIS(resultat: number): number {
  if (resultat <= 0) return 0;
  if (resultat <= 42500) return resultat * 0.15;
  return 42500 * 0.15 + (resultat - 42500) * 0.25;
}

function calculerChargesAssimileSalarie(remunerationNette: number): { cotisations: number; coutTotal: number; brut: number } {
  // Net -> Brut: brut = net / 0.78 (environ 22% charges salariales)
  const brut = remunerationNette / 0.78;
  // Charges patronales: ~45% du brut
  const chargesPatronales = brut * 0.45;
  // Charges salariales: ~22% du brut
  const chargesSalariales = brut * 0.22;
  const cotisationsTotal = chargesPatronales + chargesSalariales;
  const coutTotal = brut + chargesPatronales;
  return { cotisations: cotisationsTotal, coutTotal, brut };
}

function calculerFlatTax(dividendesBruts: number): number {
  return dividendesBruts * 0.314; // PFU 31.4% depuis LFSS 2026 (12.8% IR + 18.6% PS)
}

// ============================================
// CALCUL PRINCIPAL PAR STATUT
// ============================================

function calculerStatut(
  statut: StatutKey,
  ca: number,
  chargesExpl: number,
  remuSouhaitee: number,
  capitalSocial: number,
  typeActivite: TypeActivite,
  nombreAssocies: '1' | '2+'
): ResultatStatut {
  const resultatBrut = ca - chargesExpl;
  const disponible = isStatutDisponible(statut, typeActivite, nombreAssocies);

  const base: ResultatStatut = {
    statut,
    label: STATUT_LABELS[statut],
    ca,
    charges: chargesExpl,
    resultatAvantRemuneration: resultatBrut,
    remunerationNette: 0,
    cotisationsSociales: 0,
    tauxCotisations: 0,
    is: 0,
    dividendesBruts: 0,
    fiscaliteDividendes: 0,
    dividendesNets: 0,
    revenuNetGlobal: 0,
    coutTotalEntreprise: ca,
    irEstime: 0,
    disponible,
    regimeSocial: '',
    regimeFiscal: ''
  };

  if (!disponible || resultatBrut <= 0) return base;

  switch (statut) {
    case 'EI': {
      // IR - cotisations SSI sur le benefice
      // Le benefice = resultatBrut, on calcule les cotisations SSI dessus
      const cotisations = calculerCotisationsSSI(resultatBrut);
      const beneficeApresCharges = resultatBrut - cotisations;
      const ir = calculerIR(beneficeApresCharges);
      const netFinal = beneficeApresCharges - ir;

      return {
        ...base,
        remunerationNette: netFinal,
        cotisationsSociales: cotisations,
        tauxCotisations: resultatBrut > 0 ? (cotisations / resultatBrut) * 100 : 0,
        irEstime: ir,
        revenuNetGlobal: netFinal,
        coutTotalEntreprise: ca,
        regimeSocial: 'SSI (TNS)',
        regimeFiscal: 'IR (bareme progressif)'
      };
    }

    case 'EURL_IR': {
      // Similaire a EI, gerant associe unique = SSI
      const cotisations = calculerCotisationsSSI(resultatBrut);
      const beneficeApresCharges = resultatBrut - cotisations;
      const ir = calculerIR(beneficeApresCharges);
      const netFinal = beneficeApresCharges - ir;

      return {
        ...base,
        remunerationNette: netFinal,
        cotisationsSociales: cotisations,
        tauxCotisations: resultatBrut > 0 ? (cotisations / resultatBrut) * 100 : 0,
        irEstime: ir,
        revenuNetGlobal: netFinal,
        coutTotalEntreprise: ca,
        regimeSocial: 'SSI (TNS)',
        regimeFiscal: 'IR (bareme progressif)'
      };
    }

    case 'EURL_IS': {
      // IS - gerant associe unique = SSI sur sa remuneration
      const remuNette = Math.min(remuSouhaitee, resultatBrut * 0.8);
      const { cotisations, brut: remuBrute } = calculerCotisationsSSIIteratif(remuNette);
      const coutRemu = remuBrute;
      const resultatApresRemu = resultatBrut - coutRemu;
      const is = calculerIS(Math.max(0, resultatApresRemu));
      const beneficeApresIS = Math.max(0, resultatApresRemu) - is;

      // Dividendes: part > 10% du capital soumise a SSI
      const seuilSSIDividendes = capitalSocial * 0.10;
      let dividendesBruts = beneficeApresIS;
      let fiscDividendes = 0;

      if (dividendesBruts > seuilSSIDividendes) {
        const partSSI = dividendesBruts - seuilSSIDividendes;
        const cotSSIDiv = calculerCotisationsSSI(partSSI) * 0.5; // Approximation
        const partFlatTax = Math.min(dividendesBruts, seuilSSIDividendes);
        fiscDividendes = cotSSIDiv + calculerFlatTax(partFlatTax);
      } else {
        fiscDividendes = calculerFlatTax(dividendesBruts);
      }

      const dividendesNets = dividendesBruts - fiscDividendes;
      const ir = calculerIR(remuNette);

      return {
        ...base,
        remunerationNette: remuNette,
        cotisationsSociales: cotisations,
        tauxCotisations: remuNette > 0 ? (cotisations / remuNette) * 100 : 0,
        is,
        dividendesBruts,
        fiscaliteDividendes: fiscDividendes,
        dividendesNets,
        revenuNetGlobal: remuNette - ir + dividendesNets,
        irEstime: ir,
        coutTotalEntreprise: ca,
        regimeSocial: 'SSI (TNS)',
        regimeFiscal: 'IS (15%/25%)'
      };
    }

    case 'SARL': {
      // IS - gerant majoritaire = SSI
      const remuNette = Math.min(remuSouhaitee, resultatBrut * 0.8);
      const { cotisations, brut: remuBrute } = calculerCotisationsSSIIteratif(remuNette);
      const coutRemu = remuBrute;
      const resultatApresRemu = resultatBrut - coutRemu;
      const is = calculerIS(Math.max(0, resultatApresRemu));
      const beneficeApresIS = Math.max(0, resultatApresRemu) - is;

      const dividendesBruts = beneficeApresIS;
      // SARL: dividendes > 10% capital soumis SSI
      const seuilSSIDividendes = capitalSocial * 0.10;
      let fiscDividendes = 0;

      if (dividendesBruts > seuilSSIDividendes) {
        const partSSI = dividendesBruts - seuilSSIDividendes;
        const cotSSIDiv = calculerCotisationsSSI(partSSI) * 0.5;
        const partFlatTax = Math.min(dividendesBruts, seuilSSIDividendes);
        fiscDividendes = cotSSIDiv + calculerFlatTax(partFlatTax);
      } else {
        fiscDividendes = calculerFlatTax(dividendesBruts);
      }

      const dividendesNets = dividendesBruts - fiscDividendes;
      const ir = calculerIR(remuNette);

      return {
        ...base,
        remunerationNette: remuNette,
        cotisationsSociales: cotisations,
        tauxCotisations: remuNette > 0 ? (cotisations / remuNette) * 100 : 0,
        is,
        dividendesBruts,
        fiscaliteDividendes: fiscDividendes,
        dividendesNets,
        revenuNetGlobal: remuNette - ir + dividendesNets,
        irEstime: ir,
        coutTotalEntreprise: ca,
        regimeSocial: 'SSI (gerant majoritaire)',
        regimeFiscal: 'IS (15%/25%)'
      };
    }

    case 'SAS':
    case 'SASU': {
      // IS - president = assimile salarie
      const remuNette = Math.min(remuSouhaitee, resultatBrut * 0.6);
      const { cotisations, coutTotal } = calculerChargesAssimileSalarie(remuNette);
      const resultatApresRemu = resultatBrut - coutTotal;
      const is = calculerIS(Math.max(0, resultatApresRemu));
      const beneficeApresIS = Math.max(0, resultatApresRemu) - is;

      // Dividendes SAS: flat tax 31,4% uniquement (pas de SSI)
      const dividendesBruts = beneficeApresIS;
      const fiscDividendes = calculerFlatTax(dividendesBruts);
      const dividendesNets = dividendesBruts - fiscDividendes;
      const ir = calculerIR(remuNette);

      return {
        ...base,
        remunerationNette: remuNette,
        cotisationsSociales: cotisations,
        tauxCotisations: remuNette > 0 ? (cotisations / remuNette) * 100 : 0,
        is,
        dividendesBruts,
        fiscaliteDividendes: fiscDividendes,
        dividendesNets,
        revenuNetGlobal: remuNette - ir + dividendesNets,
        irEstime: ir,
        coutTotalEntreprise: ca,
        regimeSocial: 'Assimile salarie',
        regimeFiscal: 'IS (15%/25%)'
      };
    }

    case 'SCI': {
      // IR par defaut - pas de cotisations sociales (location nue)
      const ir = calculerIR(resultatBrut);
      const netFinal = resultatBrut - ir;

      return {
        ...base,
        remunerationNette: netFinal,
        cotisationsSociales: 0,
        tauxCotisations: 0,
        irEstime: ir,
        revenuNetGlobal: netFinal,
        coutTotalEntreprise: ca,
        regimeSocial: 'Aucun (revenus fonciers)',
        regimeFiscal: 'IR (transparence fiscale)'
      };
    }

    case 'SA': {
      // IS - PDG = assimile salarie, min 37 000 EUR capital
      const remuNette = Math.min(remuSouhaitee, resultatBrut * 0.6);
      const { cotisations, coutTotal } = calculerChargesAssimileSalarie(remuNette);
      const resultatApresRemu = resultatBrut - coutTotal;
      const is = calculerIS(Math.max(0, resultatApresRemu));
      const beneficeApresIS = Math.max(0, resultatApresRemu) - is;

      const dividendesBruts = beneficeApresIS;
      const fiscDividendes = calculerFlatTax(dividendesBruts);
      const dividendesNets = dividendesBruts - fiscDividendes;
      const ir = calculerIR(remuNette);

      return {
        ...base,
        remunerationNette: remuNette,
        cotisationsSociales: cotisations,
        tauxCotisations: remuNette > 0 ? (cotisations / remuNette) * 100 : 0,
        is,
        dividendesBruts,
        fiscaliteDividendes: fiscDividendes,
        dividendesNets,
        revenuNetGlobal: remuNette - ir + dividendesNets,
        irEstime: ir,
        coutTotalEntreprise: ca,
        regimeSocial: 'Assimile salarie',
        regimeFiscal: 'IS (15%/25%)'
      };
    }
  }

  return base;
}

function isStatutDisponible(statut: StatutKey, typeActivite: TypeActivite, nombreAssocies: '1' | '2+'): boolean {
  if (typeActivite === 'immobiliere') {
    return ['SCI', 'SARL', 'SAS', 'SA'].includes(statut);
  }
  if (nombreAssocies === '1') {
    return ['EI', 'EURL_IR', 'EURL_IS', 'SASU'].includes(statut);
  }
  // 2+ associes
  return ['SARL', 'SAS', 'SA'].includes(statut);
}

function getRecommandation(resultats: ResultatStatut[]): StatutKey | null {
  const disponibles = resultats.filter(r => r.disponible && r.revenuNetGlobal > 0);
  if (disponibles.length === 0) return null;
  const meilleur = disponibles.reduce((prev, curr) =>
    curr.revenuNetGlobal > prev.revenuNetGlobal ? curr : prev
  );
  return meilleur.statut;
}

// ============================================
// DONNEES FICHES DETAILLEES
// ============================================

interface FicheStatut {
  key: StatutKey;
  nom: string;
  description: string;
  avantages: string[];
  inconvenients: string[];
  regimeFiscal: string;
  regimeSocial: string;
  capitalMin: string;
  formalites: string[];
  responsabilite: string;
}

const FICHES_STATUTS: FicheStatut[] = [
  {
    key: 'EI',
    nom: 'Entreprise Individuelle (EI)',
    description: "Forme la plus simple d'entreprise, sans creation de personne morale. Depuis 2022, le patrimoine professionnel est automatiquement separe du patrimoine personnel.",
    avantages: [
      "Creation tres simple et rapide (pas de statuts)",
      "Aucun capital social requis",
      "Comptabilite simplifiee",
      "Regime micro-entreprise possible",
      "Patrimoine professionnel separe depuis 2022",
      "Pas de publication d'annonce legale"
    ],
    inconvenients: [
      "Cotisations SSI elevees (~40-45%)",
      "Pas de possibilite de s'associer",
      "Transmission/cession difficile",
      "Pas de dividendes",
      "Image moins professionnelle"
    ],
    regimeFiscal: "IR au bareme progressif par defaut. Option IS possible depuis 2022. Regime micro-entreprise possible.",
    regimeSocial: "Travailleur non-salarie (TNS) - regime SSI. Cotisations ~40-45% du benefice.",
    capitalMin: "Aucun",
    formalites: [
      "Declaration d'activite au guichet unique INPI",
      "Pas de statuts a rediger",
      "Pas de publication au BODACC"
    ],
    responsabilite: "Limitee au patrimoine professionnel depuis la loi du 14 fevrier 2022. Le patrimoine personnel est protege par defaut."
  },
  {
    key: 'EURL_IR',
    nom: 'EURL a l\'IR',
    description: "Societe a responsabilite limitee avec un seul associe, imposee a l'IR par defaut quand le gerant est l'associe unique.",
    avantages: [
      "Responsabilite limitee aux apports",
      "Credibilite aupres des banques et partenaires",
      "Possibilite d'opter pour l'IS",
      "Patrimoine clairement separe",
      "Transformation en SARL facile"
    ],
    inconvenients: [
      "Formalisme juridique (statuts, AG)",
      "Cotisations SSI elevees",
      "Couts de creation et de fonctionnement",
      "Comptabilite plus complexe",
      "Cession de parts taxee"
    ],
    regimeFiscal: "IR au bareme progressif par defaut (gerant associe unique). Option IS possible.",
    regimeSocial: "Gerant associe unique = TNS (SSI). Cotisations ~40-45% du benefice.",
    capitalMin: "1 EUR minimum (libre)",
    formalites: [
      "Redaction des statuts",
      "Depot du capital social",
      "Publication d'annonce legale (~150 EUR)",
      "Immatriculation au RCS via INPI"
    ],
    responsabilite: "Limitee aux apports dans le capital social."
  },
  {
    key: 'EURL_IS',
    nom: 'EURL a l\'IS',
    description: "EURL ayant opte pour l'impot sur les societes. Permet de dissocier remuneration du gerant et benefice de la societe.",
    avantages: [
      "IS a taux reduit (15% jusqu'a 42 500 EUR)",
      "Remuneration du gerant deductible",
      "Optimisation remuneration/dividendes",
      "Maitrise de la pression fiscale",
      "Possibilite de capitaliser dans la societe"
    ],
    inconvenients: [
      "Dividendes > 10% du capital soumis a SSI",
      "Double imposition (IS + IR/flat tax)",
      "Comptabilite plus lourde",
      "Plus-value de cession taxee"
    ],
    regimeFiscal: "IS: 15% jusqu'a 42 500 EUR, puis 25%. Dividendes: flat tax 31,4% ou bareme IR.",
    regimeSocial: "Gerant associe unique = TNS (SSI). Dividendes > 10% capital soumis a SSI.",
    capitalMin: "1 EUR minimum (libre)",
    formalites: [
      "Redaction des statuts avec option IS",
      "Depot du capital social",
      "Publication d'annonce legale",
      "Immatriculation au RCS"
    ],
    responsabilite: "Limitee aux apports dans le capital social."
  },
  {
    key: 'SARL',
    nom: 'SARL (Societe a Responsabilite Limitee)',
    description: "Forme societaire classique pour 2 a 100 associes. Le gerant majoritaire releve du regime SSI, le minoritaire du regime general.",
    avantages: [
      "Structure eprouvee et bien encadree",
      "Responsabilite limitee aux apports",
      "Gerant majoritaire : cotisations SSI moindres",
      "Transmission facilitee par les parts sociales",
      "Cadre juridique securisant"
    ],
    inconvenients: [
      "Rigidite statutaire",
      "Dividendes > 10% capital soumis a SSI (gerant majoritaire)",
      "Cession de parts soumise a agrement",
      "Formalisme important (AG, PV)",
      "Image moins moderne que la SAS"
    ],
    regimeFiscal: "IS par defaut: 15% jusqu'a 42 500 EUR, puis 25%. Option IR possible (5 ans max).",
    regimeSocial: "Gerant majoritaire: SSI (~40-45%). Gerant minoritaire: assimile salarie (~82% du net en cout total).",
    capitalMin: "1 EUR minimum (libre)",
    formalites: [
      "Redaction des statuts",
      "Depot du capital social",
      "Publication d'annonce legale (~200 EUR)",
      "Immatriculation au RCS via INPI",
      "Nomination du gerant"
    ],
    responsabilite: "Limitee aux apports. Le gerant peut etre tenu responsable en cas de faute de gestion."
  },
  {
    key: 'SAS',
    nom: 'SAS (Societe par Actions Simplifiee)',
    description: "Forme societaire tres flexible, de plus en plus populaire. Le president est assimile salarie avec une meilleure protection sociale.",
    avantages: [
      "Grande flexibilite statutaire",
      "Dividendes non soumis aux cotisations SSI",
      "Protection sociale du dirigeant (assimile salarie)",
      "Facilite d'entree/sortie d'investisseurs",
      "Image moderne et dynamique",
      "Pas de limite du nombre d'associes"
    ],
    inconvenients: [
      "Charges sociales elevees sur la remuneration (~82% du net)",
      "Cout de fonctionnement superieur",
      "Necessite de bons statuts (complexite)",
      "Pas de cotisation retraite SSI (retraite de base uniquement)",
      "Commissaire aux comptes possible"
    ],
    regimeFiscal: "IS obligatoire: 15% jusqu'a 42 500 EUR, puis 25%. Option IR possible (5 ans max).",
    regimeSocial: "President = assimile salarie. Charges patronales ~45% du brut. Dividendes: flat tax 31,4% uniquement.",
    capitalMin: "1 EUR minimum (libre)",
    formalites: [
      "Redaction des statuts (liberte de redaction)",
      "Depot du capital social",
      "Publication d'annonce legale (~250 EUR)",
      "Immatriculation au RCS via INPI",
      "Nomination du president"
    ],
    responsabilite: "Limitee aux apports. Responsabilite civile et penale du president en cas de faute."
  },
  {
    key: 'SASU',
    nom: 'SASU (SAS Unipersonnelle)',
    description: "Version unipersonnelle de la SAS. Ideale pour un entrepreneur seul souhaitant beneficier du statut d'assimile salarie et de dividendes sans SSI.",
    avantages: [
      "Memes avantages que la SAS",
      "Un seul associe suffit",
      "Dividendes: flat tax 31,4% seulement",
      "Protection sociale complete (assimile salarie)",
      "Transformation en SAS facile",
      "Optimisation dividendes tres efficace"
    ],
    inconvenients: [
      "Charges sociales elevees sur remuneration",
      "Cout de creation et de gestion",
      "Complexite des statuts",
      "Pas de regime micro possible"
    ],
    regimeFiscal: "IS: 15% jusqu'a 42 500 EUR, puis 25%. Option IR possible (5 ans max). Dividendes: flat tax 31,4%.",
    regimeSocial: "President = assimile salarie. Charges ~82% du net en cout total employeur.",
    capitalMin: "1 EUR minimum (libre)",
    formalites: [
      "Redaction des statuts",
      "Depot du capital social",
      "Publication d'annonce legale",
      "Immatriculation au RCS via INPI"
    ],
    responsabilite: "Limitee aux apports."
  },
  {
    key: 'SCI',
    nom: 'SCI (Societe Civile Immobiliere)',
    description: "Societe dediee a la gestion de patrimoine immobilier. Au minimum 2 associes. Regime IR par defaut avec option IS irrevocable.",
    avantages: [
      "Gestion collective du patrimoine immobilier",
      "Transmission facilitee (donation de parts)",
      "IR par defaut : transparence fiscale",
      "Abattement pour duree de detention (plus-value)",
      "Demembrement de propriete possible",
      "Protection du patrimoine familial"
    ],
    inconvenients: [
      "Minimum 2 associes obligatoires",
      "Pas d'activite commerciale (sauf IS)",
      "Location meublee = SSI",
      "Option IS irrevocable",
      "Comptabilite obligatoire si IS",
      "Responsabilite illimitee des associes"
    ],
    regimeFiscal: "IR par defaut (transparence). Option IS irrevocable. A l'IR: revenus fonciers. A l'IS: amortissement possible.",
    regimeSocial: "Pas de cotisations sociales en location nue. Location meublee: SSI sur benefices.",
    capitalMin: "1 EUR minimum (libre)",
    formalites: [
      "Redaction des statuts (au moins 2 associes)",
      "Depot du capital social",
      "Publication d'annonce legale",
      "Immatriculation au RCS"
    ],
    responsabilite: "Responsabilite indefinie et proportionnelle aux parts. Les associes sont responsables au-dela de leurs apports."
  },
  {
    key: 'SA',
    nom: 'SA (Societe Anonyme)',
    description: "Forme societaire destinee aux grandes entreprises. Minimum 2 actionnaires (7 si cotee) et 37 000 EUR de capital. Gouvernance structuree.",
    avantages: [
      "Credibilite maximale",
      "Possibilite d'introduction en bourse",
      "Structure de gouvernance claire",
      "Transmission facile des actions",
      "Appel public a l'epargne possible"
    ],
    inconvenients: [
      "Capital minimum 37 000 EUR",
      "Formalisme tres lourd",
      "Commissaire aux comptes obligatoire",
      "Couts de fonctionnement eleves",
      "Conseil d'administration ou directoire obligatoire",
      "Complexite juridique importante"
    ],
    regimeFiscal: "IS: 15% jusqu'a 42 500 EUR, puis 25%.",
    regimeSocial: "PDG/DG = assimile salarie. Dividendes: flat tax 31,4%.",
    capitalMin: "37 000 EUR minimum (50% libere a la creation)",
    formalites: [
      "Redaction des statuts complexes",
      "Depot de 37 000 EUR minimum",
      "Nomination CAC obligatoire",
      "Publication d'annonce legale",
      "Constitution du CA ou CS/Directoire"
    ],
    responsabilite: "Limitee aux apports. Responsabilite civile et penale des dirigeants."
  }
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ComparateurStatutJuridique() {
  const [activeTab, setActiveTab] = useState<TabKey>('comparaison');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedStatutDetail, setSelectedStatutDetail] = useState<StatutKey>('EI');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [nomSimulation, setNomSimulation] = useState('');
  const [simulations, setSimulations] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    typeActivite: 'commerciale',
    chiffreAffaires: '100 000',
    chargesExploitation: '20 000',
    remunerationSouhaitee: '36 000',
    nombreAssocies: '1',
    objectif: 'remuneration',
    capitalSocial: '5 000'
  });

  // ============================================
  // SAUVEGARDE / CHARGEMENT
  // ============================================

  const STORAGE_KEY = 'notariaprime-statut';

  const handleSauvegarder = () => {
    if (!nomSimulation.trim()) {
      alert('Veuillez donner un nom a votre simulation');
      return;
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.push({ nom: nomSimulation, date: new Date().toISOString(), data: formData });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setShowSaveModal(false);
    setNomSimulation('');
    alert('Simulation sauvegardee avec succes !');
  };

  const handleCharger = (index: number) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (saved[index]) {
      setFormData(saved[index].data);
      setShowLoadModal(false);
      alert('Simulation chargee avec succes !');
    }
  };

  const handleSupprimer = (index: number) => {
    if (confirm('Etes-vous sur de vouloir supprimer cette simulation ?')) {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      saved.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setSimulations(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
      alert('Simulation supprimee');
    }
  };

  useEffect(() => {
    if (showLoadModal) {
      setSimulations(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    }
  }, [showLoadModal]);

  // ============================================
  // CALCUL DES RESULTATS
  // ============================================

  const resultats = useMemo(() => {
    const ca = parseNumber(formData.chiffreAffaires);
    const charges = parseNumber(formData.chargesExploitation);
    const remu = parseNumber(formData.remunerationSouhaitee);
    const capital = parseNumber(formData.capitalSocial);

    const statuts: StatutKey[] = ['EI', 'EURL_IR', 'EURL_IS', 'SARL', 'SAS', 'SASU', 'SCI', 'SA'];

    return statuts.map(s =>
      calculerStatut(s, ca, charges, remu, capital, formData.typeActivite, formData.nombreAssocies)
    );
  }, [formData]);

  const resultatsDisponibles = useMemo(() =>
    resultats.filter(r => r.disponible),
    [resultats]
  );

  const recommandation = useMemo(() =>
    getRecommandation(resultats),
    [resultats]
  );

  // ============================================
  // EXPORT PDF
  // ============================================

  const exporterPDF = () => {
    if (resultatsDisponibles.length === 0) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Comparateur Statut Juridique', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Parametres', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Activite : ${formData.typeActivite}`, 20, y);
    y += 7;
    doc.text(`Chiffre d'affaires : ${formData.chiffreAffaires} EUR`, 20, y);
    y += 7;
    doc.text(`Charges d'exploitation : ${formData.chargesExploitation} EUR`, 20, y);
    y += 7;
    doc.text(`Remuneration souhaitee : ${formData.remunerationSouhaitee} EUR`, 20, y);
    y += 12;

    if (recommandation) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Recommandation : ${STATUT_LABELS[recommandation]}`, 20, y);
      y += 10;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparaison des statuts', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    resultatsDisponibles.forEach(r => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text(`${r.label}`, 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`  Remuneration nette : ${Math.round(r.remunerationNette).toLocaleString('fr-FR')} EUR`, 20, y);
      y += 6;
      doc.text(`  Cotisations sociales : ${Math.round(r.cotisationsSociales).toLocaleString('fr-FR')} EUR (${(r.tauxCotisations * 100).toFixed(1)}%)`, 20, y);
      y += 6;
      doc.text(`  IS : ${Math.round(r.is).toLocaleString('fr-FR')} EUR | Dividendes nets : ${Math.round(r.dividendesNets).toLocaleString('fr-FR')} EUR`, 20, y);
      y += 6;
      doc.text(`  Revenu net global : ${Math.round(r.revenuNetGlobal).toLocaleString('fr-FR')} EUR`, 20, y);
      y += 9;
    });

    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'Avertissement : cette simulation est fournie a titre informatif et ne constitue pas un conseil fiscal ou social. Les resultats sont des estimations. Consultez un professionnel avant toute decision.';
    const lines = doc.splitTextToSize(disclaimer, 170);
    lines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`statut-juridique-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ============================================
  // DONNEES GRAPHIQUES
  // ============================================

  const donneesBarChart = useMemo(() => {
    return resultatsDisponibles.map(r => ({
      name: STATUT_SHORT[r.statut],
      'Revenu net': Math.round(r.revenuNetGlobal),
      'Cotisations': Math.round(r.cotisationsSociales),
      'IR': Math.round(r.irEstime),
      'IS': Math.round(r.is),
      'Fisc. dividendes': Math.round(r.fiscaliteDividendes)
    }));
  }, [resultatsDisponibles]);

  const donneesRadar = useMemo(() => {
    const criteresParStatut: Record<StatutKey, { cout: number; protection: number; flexibilite: number; simplicite: number; transmission: number }> = {
      EI:      { cout: 7, protection: 4, flexibilite: 3, simplicite: 10, transmission: 2 },
      EURL_IR: { cout: 6, protection: 6, flexibilite: 4, simplicite: 6, transmission: 5 },
      EURL_IS: { cout: 7, protection: 6, flexibilite: 5, simplicite: 5, transmission: 5 },
      SARL:    { cout: 7, protection: 7, flexibilite: 4, simplicite: 5, transmission: 7 },
      SAS:     { cout: 5, protection: 9, flexibilite: 10, simplicite: 4, transmission: 9 },
      SASU:    { cout: 5, protection: 9, flexibilite: 9, simplicite: 5, transmission: 8 },
      SCI:     { cout: 8, protection: 3, flexibilite: 5, simplicite: 6, transmission: 9 },
      SA:      { cout: 3, protection: 9, flexibilite: 7, simplicite: 2, transmission: 10 }
    };

    return [
      { critere: 'Cout', fullMark: 10, ...Object.fromEntries(resultatsDisponibles.map(r => [STATUT_SHORT[r.statut], criteresParStatut[r.statut].cout])) },
      { critere: 'Protection', fullMark: 10, ...Object.fromEntries(resultatsDisponibles.map(r => [STATUT_SHORT[r.statut], criteresParStatut[r.statut].protection])) },
      { critere: 'Flexibilite', fullMark: 10, ...Object.fromEntries(resultatsDisponibles.map(r => [STATUT_SHORT[r.statut], criteresParStatut[r.statut].flexibilite])) },
      { critere: 'Simplicite', fullMark: 10, ...Object.fromEntries(resultatsDisponibles.map(r => [STATUT_SHORT[r.statut], criteresParStatut[r.statut].simplicite])) },
      { critere: 'Transmission', fullMark: 10, ...Object.fromEntries(resultatsDisponibles.map(r => [STATUT_SHORT[r.statut], criteresParStatut[r.statut].transmission])) }
    ];
  }, [resultatsDisponibles]);

  // ============================================
  // DONNEES OPTIMISATION
  // ============================================

  const optimisationMix = useMemo(() => {
    const ca = parseNumber(formData.chiffreAffaires);
    const charges = parseNumber(formData.chargesExploitation);
    const capital = parseNumber(formData.capitalSocial);
    const resultatBrut = ca - charges;
    if (resultatBrut <= 0) return [];

    const paliers: { pctRemu: number; remuNette: number; dividendesNets: number; total: number; label: string }[] = [];

    for (let pct = 0; pct <= 100; pct += 10) {
      const remuNetteCible = resultatBrut * 0.5 * (pct / 100);
      const { cotisations: _, coutTotal } = calculerChargesAssimileSalarie(remuNetteCible);
      const resultatApresRemu = resultatBrut - coutTotal;
      const is = calculerIS(Math.max(0, resultatApresRemu));
      const divBruts = Math.max(0, resultatApresRemu - is);
      const divNets = divBruts * 0.70;
      const ir = calculerIR(remuNetteCible);

      paliers.push({
        pctRemu: pct,
        remuNette: remuNetteCible - ir,
        dividendesNets: divNets,
        total: (remuNetteCible - ir) + divNets,
        label: `${pct}% remu`
      });
    }

    return paliers;
  }, [formData]);

  const seuilBasculeIS = useMemo(() => {
    // Trouver le seuil de benefice ou l'IS devient plus interessant que l'IR
    const results: { benefice: number; netIR: number; netIS: number }[] = [];

    for (let b = 10000; b <= 200000; b += 5000) {
      const cotSSI = calculerCotisationsSSI(b);
      const netAvantIR_EI = b - cotSSI;
      const irEI = calculerIR(netAvantIR_EI);
      const netIR = netAvantIR_EI - irEI;

      // Pour IS: on prend 60% en remuneration, le reste en dividendes
      const remuNette = b * 0.5;
      const { coutTotal } = calculerChargesAssimileSalarie(remuNette);
      const resultatIS = b - coutTotal;
      const is = calculerIS(Math.max(0, resultatIS));
      const divNets = Math.max(0, resultatIS - is) * 0.70;
      const ir2 = calculerIR(remuNette);
      const netIS = (remuNette - ir2) + divNets;

      results.push({ benefice: b, netIR, netIS });
    }

    return results;
  }, []);

  const acreImpact = useMemo(() => {
    const ca = parseNumber(formData.chiffreAffaires);
    const charges = parseNumber(formData.chargesExploitation);
    const resultatBrut = ca - charges;
    if (resultatBrut <= 0) return null;

    const cotisationsNormales = calculerCotisationsSSI(resultatBrut);
    const cotisationsACRE = cotisationsNormales * 0.5; // 50% reduction 1ere annee
    const economie = cotisationsNormales - cotisationsACRE;

    return {
      cotisationsNormales,
      cotisationsACRE,
      economie,
      beneficeNormal: resultatBrut - cotisationsNormales,
      beneficeACRE: resultatBrut - cotisationsACRE
    };
  }, [formData]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (['chiffreAffaires', 'chargesExploitation', 'remunerationSouhaitee', 'capitalSocial'].includes(field)) {
      setFormData(prev => ({ ...prev, [field]: formatMontantInput(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // ============================================
  // TABS
  // ============================================

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'comparaison', label: 'Comparaison', icon: <Scale className="w-4 h-4" /> },
    { key: 'detail', label: 'Detail par statut', icon: <FileText className="w-4 h-4" /> },
    { key: 'optimisation', label: 'Optimisation', icon: <Target className="w-4 h-4" /> },
    { key: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  // ============================================
  // FAQ DATA
  // ============================================

  const faqData = [
    {
      q: "Comment choisir entre EI et societe ?",
      r: "L'Entreprise Individuelle est ideale pour demarrer seul avec peu de formalites et de frais. Optez pour une societe (EURL, SASU) si vous souhaitez limiter votre responsabilite, optimiser votre fiscalite via l'IS, ou preparer l'entree d'associes. A partir de 40 000-50 000 EUR de benefice annuel, la societe a l'IS devient souvent plus avantageuse car le taux d'IS reduit (15%) est inferieur aux tranches hautes du bareme IR."
    },
    {
      q: "SARL ou SAS : quelle difference ?",
      r: "La principale difference reside dans le regime social du dirigeant et la flexibilite statutaire. En SARL, le gerant majoritaire releve du SSI (cotisations ~40-45% mais couverture sociale inferieure). En SAS, le president est assimile salarie (charges ~82% du net mais meilleure protection sociale, et surtout dividendes sans cotisations SSI). La SAS offre aussi une liberte totale dans la redaction des statuts, facilitant l'entree d'investisseurs."
    },
    {
      q: "Qu'est-ce que le regime TNS vs assimile salarie ?",
      r: "Le TNS (Travailleur Non Salarie) releve du regime SSI (ex-RSI) avec des cotisations d'environ 40-45% du benefice. L'assimile salarie releve du regime general de la Securite sociale avec des charges d'environ 82% du net (mais meilleure couverture retraite, chomage, maladie). Le TNS paie moins de cotisations mais recoit des prestations inferieures, notamment en matiere de retraite. Le choix depend de votre priorite : economie immediate (TNS) ou protection sociale (assimile salarie)."
    },
    {
      q: "Quand la societe a l'IS est-elle plus interessante ?",
      r: "La societe a l'IS devient generalement plus avantageuse a partir de 40 000-50 000 EUR de benefice annuel. En effet, le taux d'IS reduit de 15% (jusqu'a 42 500 EUR) est bien inferieur aux tranches IR de 30% ou 41%. De plus, vous pouvez optimiser le mix remuneration/dividendes pour minimiser la charge globale. Cependant, il faut tenir compte de la double imposition (IS + flat tax sur les dividendes ou IR sur la remuneration)."
    },
    {
      q: "Comment optimiser le mix remuneration/dividendes ?",
      r: "L'optimisation consiste a trouver le bon equilibre entre remuneration (soumise a charges sociales mais deductible du resultat) et dividendes (soumis a la flat tax de 30% en SAS, ou SSI + flat tax en SARL). En SAS/SASU, il est souvent optimal de se verser une remuneration moderee (pour valider les trimestres retraite) et de completer avec des dividendes non soumis aux cotisations SSI. En SARL, les dividendes > 10% du capital sont soumis aux cotisations SSI, reduisant l'interet de cette strategie."
    },
    {
      q: "Qu'est-ce que l'ACRE ?",
      r: "L'ACRE (Aide a la Creation ou a la Reprise d'Entreprise) offre une exoneration partielle de cotisations sociales pendant la premiere annee d'activite. L'exoneration est de 50% des cotisations (sauf CSG/CRDS) si vos revenus sont inferieurs a 46 368 EUR (PASS). Elle est degressive entre 1 et 1,4 PASS, et nulle au-dela. L'ACRE est accordee automatiquement aux createurs d'entreprise sans demande prealable depuis 2020."
    },
    {
      q: "Peut-on changer de statut juridique ?",
      r: "Oui, il est possible de changer de statut, mais les modalites varient. L'EI peut etre transformee en societe par un apport de fonds de commerce. L'EURL peut devenir SARL en accueillant des associes. La SARL peut etre transformee en SAS (et vice-versa) par decision unanime des associes. Chaque transformation implique des formalites juridiques et des consequences fiscales (droits d'enregistrement, imposition des plus-values latentes). Il est conseille de se faire accompagner par un professionnel."
    },
    {
      q: "Quels sont les couts de creation d'une societe ?",
      r: "Les couts varient selon le type de societe : EI/micro-entreprise : gratuit ou presque (uniquement frais d'immatriculation ~25 EUR). EURL/SARL/SAS/SASU : environ 500 a 2 000 EUR (annonce legale 150-250 EUR, greffe 37-70 EUR, honoraires expert-comptable ou avocat 500-1 500 EUR pour les statuts). SA : 2 000 a 5 000 EUR minimum + 37 000 EUR de capital. Il faut aussi prevoir les frais annuels : comptabilite (1 000-3 000 EUR/an), frais juridiques (AG, PV)."
    },
    {
      q: "SCI a l'IR ou a l'IS ?",
      r: "A l'IR, les revenus locatifs sont imposes au bareme progressif (plus prelevements sociaux 17,2% sur les revenus fonciers), mais les plus-values beneficient d'un abattement pour duree de detention (exoneration totale apres 30 ans). A l'IS, les loyers sont imposes a 15% puis 25%, avec possibilite d'amortir l'immeuble (avantage majeur), mais les plus-values sont calculees sur la valeur nette comptable (sans abattement). L'IR est preferable pour une detention longue avec revente prevue. L'IS est interessant pour maximiser les revenus locatifs a court/moyen terme."
    },
    {
      q: "Quel statut pour un investissement immobilier ?",
      r: "Pour de la location nue, la SCI a l'IR est le choix classique (transparence fiscale, transmission facilitee). Pour de la location meublee professionnelle, une SARL ou SAS de famille peut etre envisagee. Pour un patrimoine important avec peu de besoin de revenus, la SCI a l'IS permet d'amortir les biens et de capitaliser. Pour un investissement unique, l'achat en nom propre (avec regime micro-foncier si revenus < 15 000 EUR/an) reste la solution la plus simple. Le choix depend de vos objectifs : rendement, transmission, plus-value."
    }
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <MainLayout showFeedback={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* ============================================ */}
          {/* HEADER */}
          {/* ============================================ */}

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Comparateur de Statut Juridique
                  </h1>
                  <p className="text-gray-600 font-medium mt-1">
                    EI, EURL, SARL, SAS, SASU, SCI, SA — Trouvez la structure ideale pour votre projet
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-200">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-700">Bareme 2025/2026</span>
                </div>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                  title="Sauvegarder la simulation"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                  title="Charger une simulation"
                >
                  <FolderOpen className="w-4 h-4" />
                  Charger
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* TAB: COMPARAISON */}
          {/* ============================================ */}

          {activeTab === 'comparaison' && (
            <div className="space-y-8">

              {/* FORMULAIRE DE SAISIE */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Calculator className="w-7 h-7 text-indigo-600" />
                  Votre situation
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Type d'activite */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type d&apos;activite
                    </label>
                    <select
                      value={formData.typeActivite}
                      onChange={(e) => handleInputChange('typeActivite', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900 bg-white"
                    >
                      <option value="commerciale">Commerciale</option>
                      <option value="artisanale">Artisanale</option>
                      <option value="liberale">Liberale</option>
                      <option value="immobiliere">Immobiliere</option>
                    </select>
                  </div>

                  {/* CA previsionnel */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chiffre d&apos;affaires previsionnel annuel
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.chiffreAffaires}
                        onChange={(e) => handleInputChange('chiffreAffaires', e.target.value)}
                        placeholder="100 000"
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900"
                      />
                      <Euro className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Charges d'exploitation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Charges d&apos;exploitation (hors remuneration)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.chargesExploitation}
                        onChange={(e) => handleInputChange('chargesExploitation', e.target.value)}
                        placeholder="20 000"
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900"
                      />
                      <Euro className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Remuneration souhaitee */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Remuneration souhaitee du dirigeant (net)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.remunerationSouhaitee}
                        onChange={(e) => handleInputChange('remunerationSouhaitee', e.target.value)}
                        placeholder="36 000"
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900"
                      />
                      <Euro className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Nombre d'associes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre d&apos;associes
                    </label>
                    <select
                      value={formData.nombreAssocies}
                      onChange={(e) => handleInputChange('nombreAssocies', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900 bg-white"
                    >
                      <option value="1">Seul (1 associe)</option>
                      <option value="2+">Plusieurs (2+)</option>
                    </select>
                  </div>

                  {/* Objectif */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Objectif principal
                    </label>
                    <select
                      value={formData.objectif}
                      onChange={(e) => handleInputChange('objectif', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900 bg-white"
                    >
                      <option value="remuneration">Maximiser la remuneration</option>
                      <option value="charges">Minimiser les charges</option>
                      <option value="flexibilite">Flexibilite statutaire</option>
                      <option value="protection">Protection sociale</option>
                    </select>
                  </div>

                  {/* Capital social */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capital social envisage
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.capitalSocial}
                        onChange={(e) => handleInputChange('capitalSocial', e.target.value)}
                        placeholder="5 000"
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900"
                      />
                      <Euro className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Resultat brut */}
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 text-indigo-800">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">
                      Resultat brut avant remuneration : {formatEuros(parseNumber(formData.chiffreAffaires) - parseNumber(formData.chargesExploitation))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Export PDF */}
              <div className="flex justify-end">
                <button
                  onClick={exporterPDF}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exporter en PDF
                </button>
              </div>

              {/* RECOMMANDATION */}
              {recommandation && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900 mb-1">
                        Recommandation : {STATUT_LABELS[recommandation]}
                      </h3>
                      <p className="text-green-800">
                        Sur la base de vos parametres, le statut <strong>{STATUT_LABELS[recommandation]}</strong> offre
                        le meilleur revenu net global de{' '}
                        <strong>
                          {formatEuros(resultats.find(r => r.statut === recommandation)?.revenuNetGlobal || 0)}
                        </strong>
                        .
                      </p>
                      <p className="text-sm text-green-700 mt-2 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Cette recommandation est basee uniquement sur le critere financier. D&apos;autres facteurs (protection sociale, flexibilite, transmission) sont a considerer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TABLEAU COMPARATIF */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 overflow-x-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <BarChart3 className="w-7 h-7 text-indigo-600" />
                  Tableau comparatif
                </h2>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-3 text-gray-600 font-semibold min-w-[180px]">Metrique</th>
                      {resultatsDisponibles.map(r => (
                        <th
                          key={r.statut}
                          className={`text-right py-3 px-3 font-bold min-w-[120px] ${
                            r.statut === recommandation
                              ? 'text-green-700 bg-green-50 rounded-t-xl'
                              : 'text-gray-900'
                          }`}
                        >
                          <div className="flex flex-col items-end gap-1">
                            <span>{STATUT_SHORT[r.statut]}</span>
                            {r.statut === recommandation && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                Recommande
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Chiffre d'affaires", key: 'ca' },
                      { label: "Charges d'exploitation", key: 'charges' },
                      { label: 'Resultat avant remuneration', key: 'resultatAvantRemuneration' },
                      { label: 'Remuneration nette du dirigeant', key: 'remunerationNette' },
                      { label: 'Cotisations sociales', key: 'cotisationsSociales' },
                      { label: 'Taux de cotisations', key: 'tauxCotisations', isPct: true },
                      { label: 'Impot sur les societes (IS)', key: 'is' },
                      { label: 'Dividendes bruts distribuables', key: 'dividendesBruts' },
                      { label: 'Fiscalite sur dividendes', key: 'fiscaliteDividendes' },
                      { label: 'Dividendes nets', key: 'dividendesNets' },
                      { label: "IR estime sur remuneration", key: 'irEstime' },
                      { label: 'REVENU NET GLOBAL', key: 'revenuNetGlobal', isBold: true },
                    ].map((row, idx) => (
                      <tr
                        key={row.key}
                        className={`border-b border-gray-100 ${row.isBold ? 'bg-indigo-50 font-bold' : ''} ${
                          idx % 2 === 0 && !row.isBold ? 'bg-gray-50/50' : ''
                        }`}
                      >
                        <td className={`py-3 px-3 ${row.isBold ? 'text-indigo-900 font-bold' : 'text-gray-700'}`}>
                          {row.label}
                        </td>
                        {resultatsDisponibles.map(r => {
                          const val = r[row.key as keyof ResultatStatut] as number;
                          return (
                            <td
                              key={r.statut}
                              className={`text-right py-3 px-3 ${
                                r.statut === recommandation ? 'bg-green-50/50' : ''
                              } ${row.isBold ? 'text-indigo-900 text-base' : 'text-gray-900'}`}
                            >
                              {(row as any).isPct
                                ? formatPourcentage(val)
                                : formatEuros(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Regime social et fiscal */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-3 text-gray-600 text-xs font-medium">Regime social</td>
                      {resultatsDisponibles.map(r => (
                        <td key={r.statut} className="text-right py-3 px-3 text-xs text-gray-500">
                          {r.regimeSocial}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-gray-600 text-xs font-medium">Regime fiscal</td>
                      {resultatsDisponibles.map(r => (
                        <td key={r.statut} className="text-right py-3 px-3 text-xs text-gray-500">
                          {r.regimeFiscal}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* GRAPHIQUES */}
              <div className="grid lg:grid-cols-2 gap-8">

                {/* Bar Chart: Revenu net par statut */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    Revenu net global par statut
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={donneesBarChart} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis
                          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value: number) => formatEuros(value)}
                          contentStyle={{ borderRadius: '12px', border: '2px solid #e5e7eb' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="Revenu net" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stacked Bar: Decomposition */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-6 h-6 text-purple-600" />
                    Decomposition des prelevements
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={donneesBarChart} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis
                          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value: number) => formatEuros(value)}
                          contentStyle={{ borderRadius: '12px', border: '2px solid #e5e7eb' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="Cotisations" stackId="a" fill="#f97316" />
                        <Bar dataKey="IR" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="IS" stackId="a" fill="#06b6d4" />
                        <Bar dataKey="Fisc. dividendes" stackId="a" fill="#ec4899" />
                        <Bar dataKey="Revenu net" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart: Multi-criteres */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:col-span-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-indigo-600" />
                    Comparaison multi-criteres
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={donneesRadar} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="critere" tick={{ fontSize: 12, fill: '#374151' }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                        {resultatsDisponibles.map((r, i) => (
                          <Radar
                            key={r.statut}
                            name={STATUT_SHORT[r.statut]}
                            dataKey={STATUT_SHORT[r.statut]}
                            stroke={COLORS[i % COLORS.length]}
                            fill={COLORS[i % COLORS.length]}
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                        ))}
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #e5e7eb' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1"><span className="font-semibold">Cout :</span> faiblesse des charges globales</div>
                    <div className="flex items-center gap-1"><span className="font-semibold">Protection :</span> couverture sociale</div>
                    <div className="flex items-center gap-1"><span className="font-semibold">Flexibilite :</span> souplesse statutaire</div>
                    <div className="flex items-center gap-1"><span className="font-semibold">Simplicite :</span> facilite de gestion</div>
                    <div className="flex items-center gap-1"><span className="font-semibold">Transmission :</span> facilite de cession</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: DETAIL PAR STATUT */}
          {/* ============================================ */}

          {activeTab === 'detail' && (
            <div className="space-y-8">

              {/* Selecteur de statut */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-indigo-600" />
                  Fiche detaillee par statut
                </h2>
                <div className="flex flex-wrap gap-2">
                  {FICHES_STATUTS.map(fiche => (
                    <button
                      key={fiche.key}
                      onClick={() => setSelectedStatutDetail(fiche.key)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        selectedStatutDetail === fiche.key
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {STATUT_SHORT[fiche.key]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fiche detail */}
              {(() => {
                const fiche = FICHES_STATUTS.find(f => f.key === selectedStatutDetail);
                if (!fiche) return null;

                return (
                  <div className="space-y-6">
                    {/* En-tete */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                      <h3 className="text-3xl font-bold mb-2">{fiche.nom}</h3>
                      <p className="text-indigo-100 text-lg">{fiche.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Avantages */}
                      <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-6">
                        <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          Avantages
                        </h4>
                        <ul className="space-y-2">
                          {fiche.avantages.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">+</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Inconvenients */}
                      <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-6">
                        <h4 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                          <XCircle className="w-6 h-6 text-red-500" />
                          Inconvenients
                        </h4>
                        <ul className="space-y-2">
                          {fiche.inconvenients.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">-</span>
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Details techniques */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Percent className="w-5 h-5 text-indigo-600" />
                          Regime fiscal
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{fiche.regimeFiscal}</p>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          Regime social
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{fiche.regimeSocial}</p>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Euro className="w-5 h-5 text-indigo-600" />
                          Capital minimum
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{fiche.capitalMin}</p>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Scale className="w-5 h-5 text-indigo-600" />
                          Responsabilite du dirigeant
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{fiche.responsabilite}</p>
                      </div>
                    </div>

                    {/* Formalites */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        Formalites de creation
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {fiche.formalites.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded-lg">
                            <span className="text-indigo-500 font-bold mt-0.5">{i + 1}.</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: OPTIMISATION */}
          {/* ============================================ */}

          {activeTab === 'optimisation' && (
            <div className="space-y-8">

              {/* Mix remuneration / dividendes */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Lightbulb className="w-7 h-7 text-indigo-600" />
                  Mix remuneration / dividendes optimal (SAS/SASU a l&apos;IS)
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Repartition optimale de la remuneration du dirigeant entre salaire et dividendes pour une SAS/SASU.
                  Le resultat brut utilise est de {formatEuros(parseNumber(formData.chiffreAffaires) - parseNumber(formData.chargesExploitation))}.
                </p>

                {optimisationMix.length > 0 ? (
                  <>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-3 text-gray-600 font-semibold">Repartition</th>
                            <th className="text-right py-3 px-3 text-gray-600 font-semibold">Remuneration nette</th>
                            <th className="text-right py-3 px-3 text-gray-600 font-semibold">Dividendes nets</th>
                            <th className="text-right py-3 px-3 text-gray-600 font-semibold">Total net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimisationMix.map((p, i) => {
                            const isBest = optimisationMix.reduce((prev, curr) =>
                              curr.total > prev.total ? curr : prev
                            ).pctRemu === p.pctRemu;
                            return (
                              <tr
                                key={i}
                                className={`border-b border-gray-100 ${isBest ? 'bg-green-50 font-semibold' : i % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                              >
                                <td className="py-2 px-3 text-gray-700">
                                  {p.pctRemu}% remu / {100 - p.pctRemu}% div.
                                  {isBest && (
                                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                      Optimal
                                    </span>
                                  )}
                                </td>
                                <td className="text-right py-2 px-3 text-gray-900">{formatEuros(p.remuNette)}</td>
                                <td className="text-right py-2 px-3 text-gray-900">{formatEuros(p.dividendesNets)}</td>
                                <td className={`text-right py-2 px-3 ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                                  {formatEuros(p.total)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Graphique mix */}
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={optimisationMix.map(p => ({
                          name: `${p.pctRemu}%`,
                          Remuneration: Math.round(p.remuNette),
                          Dividendes: Math.round(p.dividendesNets)
                        }))} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} label={{ value: '% remuneration', position: 'bottom', offset: 5, fontSize: 11 }} />
                          <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value: number) => formatEuros(value)}
                            contentStyle={{ borderRadius: '12px', border: '2px solid #e5e7eb' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="Remuneration" stackId="a" fill="#6366f1" />
                          <Bar dataKey="Dividendes" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    Saisissez un chiffre d&apos;affaires et des charges pour voir l&apos;optimisation.
                  </div>
                )}
              </div>

              {/* Seuil de bascule EI -> Societe IS */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-purple-600" />
                  Seuil de bascule EI vers societe a l&apos;IS
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Comparaison du revenu net entre une EI (IR + SSI) et une SAS/SASU (IS + assimile salarie + dividendes)
                  en fonction du niveau de benefice.
                </p>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seuilBasculeIS.filter((_, i) => i % 2 === 0).map(d => ({
                      name: `${Math.round(d.benefice / 1000)}k`,
                      'EI (IR)': Math.round(d.netIR),
                      'SAS (IS)': Math.round(d.netIS)
                    }))} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} label={{ value: 'Benefice', position: 'bottom', offset: 5, fontSize: 11 }} />
                      <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => formatEuros(value)}
                        contentStyle={{ borderRadius: '12px', border: '2px solid #e5e7eb' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="EI (IR)" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="SAS (IS)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Analyse du seuil */}
                {(() => {
                  const seuil = seuilBasculeIS.find((d, i) =>
                    i > 0 && d.netIS > d.netIR && seuilBasculeIS[i - 1].netIS <= seuilBasculeIS[i - 1].netIR
                  );
                  return seuil ? (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-2 text-purple-800">
                        <Zap className="w-5 h-5" />
                        <span className="font-semibold">
                          Point de bascule estime : autour de {formatEuros(seuil.benefice)} de benefice annuel,
                          la societe a l&apos;IS (type SAS) devient plus avantageuse que l&apos;EI a l&apos;IR.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600">
                        Le point de bascule depend fortement de votre strategie de remuneration et du niveau de capital.
                        En general, il se situe entre 40 000 et 60 000 EUR de benefice annuel.
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Impact ACRE */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Star className="w-7 h-7 text-amber-500" />
                  Impact de l&apos;ACRE (1ere annee)
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  L&apos;ACRE (Aide a la Creation ou Reprise d&apos;Entreprise) offre une exoneration de 50% des cotisations sociales
                  la premiere annee pour les createurs d&apos;entreprise. Estimation basee sur votre resultat brut.
                </p>

                {acreImpact ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sans ACRE</p>
                      <p className="text-2xl font-bold text-gray-900">{formatEuros(acreImpact.cotisationsNormales)}</p>
                      <p className="text-sm text-gray-600">de cotisations sociales</p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                          Benefice net : <strong>{formatEuros(acreImpact.beneficeNormal)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-5 border-2 border-green-300">
                      <p className="text-xs font-semibold text-green-700 uppercase mb-1">Avec ACRE (annee 1)</p>
                      <p className="text-2xl font-bold text-green-700">{formatEuros(acreImpact.cotisationsACRE)}</p>
                      <p className="text-sm text-green-600">de cotisations sociales</p>
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-sm text-green-700">
                          Benefice net : <strong>{formatEuros(acreImpact.beneficeACRE)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 flex flex-col justify-center items-center">
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Economie</p>
                      <p className="text-3xl font-black text-amber-600">{formatEuros(acreImpact.economie)}</p>
                      <p className="text-sm text-amber-700 mt-1">la premiere annee</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    Saisissez un chiffre d&apos;affaires superieur aux charges pour voir l&apos;impact ACRE.
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Conditions de l&apos;ACRE :</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Creer ou reprendre une activite economique</li>
                        <li>Ne pas en avoir beneficie dans les 3 dernieres annees</li>
                        <li>Exoneration de 50% des cotisations (sauf CSG/CRDS) pendant 12 mois</li>
                        <li>Plafonnee aux revenus inferieurs a {formatEuros(PASS)}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: FAQ */}
          {/* ============================================ */}

          {activeTab === 'faq' && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <HelpCircle className="w-8 h-8 text-indigo-600" />
                  Questions frequentes
                </h2>
                <p className="text-gray-600 mt-2">
                  Tout ce que vous devez savoir pour choisir le bon statut juridique
                </p>
              </div>

              <div className="space-y-3">
                {faqData.map((faq, index) => {
                  const isOpen = openFAQ === index;
                  return (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
                    >
                      <button
                        onClick={() => setOpenFAQ(isOpen ? null : index)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 py-4 bg-gray-50 border-t-2 border-gray-200">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.r}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* DISCLAIMER */}
          {/* ============================================ */}

          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="space-y-2 text-sm text-amber-900">
                <p className="font-semibold text-lg">Avertissement legal</p>
                <p>
                  Ce comparateur est fourni a titre informatif uniquement et ne constitue pas un conseil juridique,
                  fiscal ou social. Les resultats sont des estimations basees sur les baremes 2025/2026 et des
                  approximations des taux de cotisations sociales.
                </p>
                <p>
                  Les cotisations SSI et les charges du regime general sont calculees de maniere simplifiee.
                  De nombreux parametres (situation familiale, nombre de parts fiscales, exonerations specifiques,
                  accords collectifs) ne sont pas pris en compte dans cette simulation.
                </p>
                <p className="font-semibold">
                  Pour une analyse personnalisee de votre situation, consultez un expert-comptable,
                  un avocat specialise en droit des societes ou un notaire.
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* MODALS SAUVEGARDE / CHARGEMENT */}
          {/* ============================================ */}

          {showSaveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Save className="w-6 h-6 text-blue-600" />
                  Sauvegarder la simulation
                </h3>
                <input
                  type="text"
                  value={nomSimulation}
                  onChange={(e) => setNomSimulation(e.target.value)}
                  placeholder="Nom de la simulation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSauvegarder}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => { setShowSaveModal(false); setNomSimulation(''); }}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {showLoadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                  Charger une simulation
                </h3>
                {simulations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">Aucune simulation sauvegardee</p>
                    <p className="text-sm">Effectuez une simulation et sauvegardez-la pour la retrouver ici</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {simulations.map((sim, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{sim.nom}</h4>
                            <p className="text-sm text-gray-600">
                              Sauvegardee le {new Date(sim.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCharger(index)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                            >
                              Charger
                            </button>
                            <button
                              onClick={() => handleSupprimer(index)}
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
