// ============================================
// FILE: src/app/retraite/page.tsx
// DESCRIPTION: Simulateur Retraite - NotariaPrime
// VERSION: 1.0 - Estimation pension francaise
// ============================================

"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Calculator, TrendingUp, Euro, Calendar, Info, AlertCircle,
  HelpCircle, ChevronDown, ChevronUp, BookOpen, Landmark,
  Percent, Clock, Award, Target, Users, Briefcase,
  Shield, CheckCircle2, ArrowRight, BarChart3, PieChart as PieChartIcon, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';

import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

type Statut = 'salarie' | 'fonctionnaire' | 'independant' | 'liberal';
type ObjectifDepart = 'plus_tot' | 'taux_plein' | 'surcote';
type TabId = 'estimation' | 'optimisation' | 'complementaire' | 'faq';

interface FormData {
  dateNaissance: string;
  sexe: 'homme' | 'femme';
  statut: Statut;
  salaireBrutAnnuel: string;
  evolutionSalariale: string;
  trimestresAcquis: string;
  ageDebutActivite: string;
  trimestresChomage: string;
  trimestresMaladie: string;
  trimestresMaternite: string;
  trimestresRachetes: string;
  objectifDepart: ObjectifDepart;
}

interface ResultatRetraite {
  ageLegal: number;
  ageLegalMois: number;
  ageTauxPlein: number;
  trimestresRequis: number;
  trimestresTotaux: number;
  trimestresManquants: number;
  trimestresExcedentaires: number;

  sam: number;
  tauxLiquidation: number;
  pensionBase: number;
  pensionBaseAnnuelle: number;

  pointsAgircArrco: number;
  pensionComplementaire: number;
  pensionComplementaireAnnuelle: number;

  pensionBruteMensuelle: number;
  pensionBruteAnnuelle: number;
  pensionNetteMensuelle: number;
  pensionNetteAnnuelle: number;

  tauxRemplacement: number;
  dernierRevenuNet: number;

  anneeDepart: number;
  ageDepartEffectif: number;
}

interface ScenarioDepart {
  nom: string;
  age: number;
  trimestres: number;
  pensionMensuelle: number;
  pensionAnnuelle: number;
  totalCumule85: number;
  tauxRemplacement: number;
  decoteSurcote: string;
}

// ============================================
// CONSTANTES 2025/2026
// ============================================

const PASS_2025 = 46368;
const TAUX_PLEIN = 0.50;
const DECOTE_PAR_TRIMESTRE = 0.0125;
const SURCOTE_PAR_TRIMESTRE = 0.0125;
const MAX_TRIMESTRES_DECOTE = 20;
const MINIMUM_CONTRIBUTIF = 8970;

// Agirc-Arrco
const VALEUR_POINT_AGIRC_ARRCO = 1.4159;
const PRIX_ACHAT_POINT_T1 = 19.6321;
const PRIX_ACHAT_POINT_T2 = 19.6321;
const TAUX_ACQUISITION_T1 = 0.0620 + 0.0821;
const TAUX_ACQUISITION_T2 = 0.0864 + 0.1295;

// Prelevements sociaux retraite
const CSG_RETRAITE = 0.083;
const CRDS_RETRAITE = 0.005;
const CASA_RETRAITE = 0.003;
const TOTAL_PRELEVEMENTS = CSG_RETRAITE + CRDS_RETRAITE + CASA_RETRAITE;

// Age legal par annee de naissance (reforme 2023)
const AGE_LEGAL_MAP: { [annee: number]: { ans: number; mois: number } } = {
  1961: { ans: 62, mois: 3 },
  1962: { ans: 62, mois: 6 },
  1963: { ans: 62, mois: 9 },
  1964: { ans: 63, mois: 0 },
  1965: { ans: 63, mois: 3 },
  1966: { ans: 63, mois: 6 },
  1967: { ans: 63, mois: 9 },
};

// Duree requise par annee de naissance
const DUREE_REQUISE_MAP: { [annee: number]: number } = {
  1961: 168,
  1962: 169,
  1963: 170,
  1964: 171,
  1965: 172,
  1966: 172,
  1967: 172,
};

const COLORS_CHART = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8'];

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

function formatEuros(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatEurosDecimal(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPourcentage(value: number): string {
  return `${value.toFixed(1)} %`;
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function getAgeLegal(anneeNaissance: number): { ans: number; mois: number } {
  if (anneeNaissance <= 1960) return { ans: 62, mois: 0 };
  if (anneeNaissance >= 1968) return { ans: 64, mois: 0 };
  return AGE_LEGAL_MAP[anneeNaissance] || { ans: 64, mois: 0 };
}

function getDureeRequise(anneeNaissance: number): number {
  if (anneeNaissance <= 1960) return 167;
  if (anneeNaissance >= 1965) return 172;
  return DUREE_REQUISE_MAP[anneeNaissance] || 172;
}

function calculerSAM(salaireBrut: number, evolutionPct: number, anneesCotisees: number): number {
  // Simulation des 25 meilleures annees
  const salaires: number[] = [];
  const evolution = evolutionPct / 100;

  for (let i = 0; i < anneesCotisees; i++) {
    // Salaire de l'annee i (en partant du present vers le passe)
    const salaire = salaireBrut / Math.pow(1 + evolution, i);
    // Plafonner au PASS pour le regime de base
    const salaireRetenu = Math.min(salaire, PASS_2025);
    salaires.push(salaireRetenu);
  }

  // Trier par ordre decroissant et prendre les 25 meilleures
  salaires.sort((a, b) => b - a);
  const meilleures25 = salaires.slice(0, Math.min(25, salaires.length));

  if (meilleures25.length === 0) return 0;
  return meilleures25.reduce((sum, s) => sum + s, 0) / meilleures25.length;
}

function calculerPointsAgircArrco(
  salaireBrut: number,
  evolutionPct: number,
  anneesCotisees: number
): number {
  let totalPoints = 0;
  const evolution = evolutionPct / 100;

  for (let i = 0; i < anneesCotisees; i++) {
    const salaire = salaireBrut / Math.pow(1 + evolution, i);

    // Tranche 1 : jusqu'au PASS
    const assiette1 = Math.min(salaire, PASS_2025);
    const points1 = (assiette1 * TAUX_ACQUISITION_T1) / PRIX_ACHAT_POINT_T1;

    // Tranche 2 : entre PASS et 8*PASS
    const assiette2 = Math.max(0, Math.min(salaire, PASS_2025 * 8) - PASS_2025);
    const points2 = (assiette2 * TAUX_ACQUISITION_T2) / PRIX_ACHAT_POINT_T2;

    totalPoints += points1 + points2;
  }

  return totalPoints;
}

function calculerRetraite(formData: FormData): ResultatRetraite | null {
  const dateNaissance = formData.dateNaissance;
  if (!dateNaissance) return null;

  const anneeNaissance = parseInt(dateNaissance.split('-')[0]);
  if (isNaN(anneeNaissance) || anneeNaissance < 1950 || anneeNaissance > 2005) return null;

  const salaireBrut = parseNumber(formData.salaireBrutAnnuel);
  if (salaireBrut <= 0) return null;

  const evolutionPct = parseNumber(formData.evolutionSalariale) || 1.5;
  const trimestresAcquis = Math.max(0, Math.round(parseNumber(formData.trimestresAcquis)));
  const ageDebut = parseNumber(formData.ageDebutActivite) || 22;
  const trimestresChomage = Math.round(parseNumber(formData.trimestresChomage));
  const trimestresMaladie = Math.round(parseNumber(formData.trimestresMaladie));
  const trimestresMaternite = Math.round(parseNumber(formData.trimestresMaternite));
  const trimestresRachetes = Math.round(parseNumber(formData.trimestresRachetes));

  const ageLegalInfo = getAgeLegal(anneeNaissance);
  const ageLegal = ageLegalInfo.ans + ageLegalInfo.mois / 12;
  const trimestresRequis = getDureeRequise(anneeNaissance);

  // Trimestres totaux projetes
  const ageActuel = 2026 - anneeNaissance;
  const trimestresSpeciaux = trimestresChomage + trimestresMaladie + trimestresMaternite + trimestresRachetes;

  // Projection des trimestres jusqu'a l'age legal
  const anneesJusquAgeLegal = Math.max(0, ageLegal - ageActuel);
  const trimestresProjection = Math.round(anneesJusquAgeLegal * 4);
  const trimestresTotaux = trimestresAcquis + trimestresSpeciaux + trimestresProjection;

  // Annees effectivement cotisees (pour SAM)
  const anneesCotisees = Math.max(1, Math.round(trimestresTotaux / 4));

  // SAM
  let sam = 0;
  let pensionBase = 0;
  let pensionBaseAnnuelle = 0;

  if (formData.statut === 'fonctionnaire') {
    // Fonctionnaire: 75% du traitement des 6 derniers mois
    const traitementRef = salaireBrut;
    const ratio = Math.min(1, trimestresTotaux / trimestresRequis);
    pensionBaseAnnuelle = traitementRef * 0.75 * ratio;
    sam = traitementRef;
  } else {
    // Regime general: SAM x taux x (duree / duree requise)
    sam = calculerSAM(salaireBrut, evolutionPct, anneesCotisees);

    // Calcul du taux de liquidation
    let tauxLiquidation = TAUX_PLEIN;
    let trimestresManquants = 0;
    let trimestresExcedentaires = 0;

    if (trimestresTotaux < trimestresRequis) {
      trimestresManquants = trimestresRequis - trimestresTotaux;
      if (formData.objectifDepart === 'plus_tot') {
        const decote = Math.min(trimestresManquants, MAX_TRIMESTRES_DECOTE) * DECOTE_PAR_TRIMESTRE;
        tauxLiquidation = TAUX_PLEIN - decote;
      }
    } else {
      trimestresExcedentaires = trimestresTotaux - trimestresRequis;
      if (formData.objectifDepart === 'surcote') {
        const surcote = trimestresExcedentaires * SURCOTE_PAR_TRIMESTRE;
        tauxLiquidation = TAUX_PLEIN + surcote;
      }
    }

    const dureeRetenue = Math.min(trimestresTotaux, trimestresRequis);
    pensionBaseAnnuelle = sam * tauxLiquidation * (dureeRetenue / trimestresRequis);

    // Plafond de la pension de base
    const plafondPension = PASS_2025 * 0.50;
    pensionBaseAnnuelle = Math.min(pensionBaseAnnuelle, plafondPension);

    // Minimum contributif si taux plein et carriere complete
    if (tauxLiquidation >= TAUX_PLEIN && trimestresTotaux >= trimestresRequis) {
      pensionBaseAnnuelle = Math.max(pensionBaseAnnuelle, MINIMUM_CONTRIBUTIF);
    }
  }

  pensionBase = pensionBaseAnnuelle / 12;

  // Retraite complementaire
  let pointsAgircArrco = 0;
  let pensionComplementaireAnnuelle = 0;
  let pensionComplementaire = 0;

  if (formData.statut === 'salarie') {
    pointsAgircArrco = calculerPointsAgircArrco(salaireBrut, evolutionPct, anneesCotisees);
    pensionComplementaireAnnuelle = pointsAgircArrco * VALEUR_POINT_AGIRC_ARRCO;
    pensionComplementaire = pensionComplementaireAnnuelle / 12;
  } else if (formData.statut === 'independant') {
    // SSI complementaire : estime a environ 25-35% de la base
    pensionComplementaireAnnuelle = pensionBaseAnnuelle * 0.30;
    pensionComplementaire = pensionComplementaireAnnuelle / 12;
  } else if (formData.statut === 'liberal') {
    // CIPAV/CNAVPL : estime plus faible
    pensionComplementaireAnnuelle = pensionBaseAnnuelle * 0.20;
    pensionComplementaire = pensionComplementaireAnnuelle / 12;
  } else if (formData.statut === 'fonctionnaire') {
    // RAFP complementaire : estime
    pensionComplementaireAnnuelle = pensionBaseAnnuelle * 0.05;
    pensionComplementaire = pensionComplementaireAnnuelle / 12;
  }

  // Totaux
  const pensionBruteMensuelle = pensionBase + pensionComplementaire;
  const pensionBruteAnnuelle = pensionBaseAnnuelle + pensionComplementaireAnnuelle;
  const pensionNetteMensuelle = pensionBruteMensuelle * (1 - TOTAL_PRELEVEMENTS);
  const pensionNetteAnnuelle = pensionBruteAnnuelle * (1 - TOTAL_PRELEVEMENTS);

  // Taux de remplacement
  const dernierRevenuNet = salaireBrut * 0.78; // approximation net/brut
  const tauxRemplacement = dernierRevenuNet > 0 ? (pensionNetteAnnuelle / dernierRevenuNet) * 100 : 0;

  const trimestresManquants = Math.max(0, trimestresRequis - trimestresTotaux);
  const trimestresExcedentaires = Math.max(0, trimestresTotaux - trimestresRequis);

  return {
    ageLegal: ageLegalInfo.ans,
    ageLegalMois: ageLegalInfo.mois,
    ageTauxPlein: trimestresTotaux >= trimestresRequis
      ? ageLegalInfo.ans + ageLegalInfo.mois / 12
      : Math.min(67, ageLegalInfo.ans + ageLegalInfo.mois / 12 + trimestresManquants / 4),
    trimestresRequis,
    trimestresTotaux,
    trimestresManquants,
    trimestresExcedentaires,
    sam,
    tauxLiquidation: formData.statut === 'fonctionnaire' ? 75 : (pensionBaseAnnuelle / (sam * (Math.min(trimestresTotaux, trimestresRequis) / trimestresRequis))) * 100 || 50,
    pensionBase,
    pensionBaseAnnuelle,
    pointsAgircArrco,
    pensionComplementaire,
    pensionComplementaireAnnuelle,
    pensionBruteMensuelle,
    pensionBruteAnnuelle,
    pensionNetteMensuelle,
    pensionNetteAnnuelle,
    tauxRemplacement,
    dernierRevenuNet,
    anneeDepart: anneeNaissance + Math.ceil(ageLegal),
    ageDepartEffectif: ageLegal,
  };
}

function calculerScenarios(formData: FormData, resultatBase: ResultatRetraite): ScenarioDepart[] {
  const anneeNaissance = parseInt(formData.dateNaissance.split('-')[0]);
  const salaireBrut = parseNumber(formData.salaireBrutAnnuel);
  const evolutionPct = parseNumber(formData.evolutionSalariale) || 1.5;
  const trimestresRequis = getDureeRequise(anneeNaissance);
  const ageLegalInfo = getAgeLegal(anneeNaissance);
  const ageLegal = ageLegalInfo.ans + ageLegalInfo.mois / 12;

  const scenarios: ScenarioDepart[] = [];
  const offsets = [-2, 0, 2, 4];
  const noms = ['Depart anticipe (-2 ans)', 'Age legal', 'Surcote +2 ans', 'Surcote +4 ans'];

  for (let i = 0; i < offsets.length; i++) {
    const ageDepart = ageLegal + offsets[i];
    if (ageDepart < 60) continue;

    const ageActuel = 2026 - anneeNaissance;
    const anneesRestantes = Math.max(0, ageDepart - ageActuel);
    const trimestresProjection = Math.round(anneesRestantes * 4);
    const trimestresAcquis = Math.round(parseNumber(formData.trimestresAcquis));
    const trimestresSpeciaux = Math.round(parseNumber(formData.trimestresChomage)) +
      Math.round(parseNumber(formData.trimestresMaladie)) +
      Math.round(parseNumber(formData.trimestresMaternite)) +
      Math.round(parseNumber(formData.trimestresRachetes));
    const trimestresTotaux = trimestresAcquis + trimestresSpeciaux + trimestresProjection;

    const anneesCotisees = Math.max(1, Math.round(trimestresTotaux / 4));
    const sam = calculerSAM(salaireBrut, evolutionPct, anneesCotisees);

    let tauxLiquidation = TAUX_PLEIN;
    let decoteSurcoteText = 'Taux plein';

    if (trimestresTotaux < trimestresRequis) {
      const manquants = Math.min(trimestresRequis - trimestresTotaux, MAX_TRIMESTRES_DECOTE);
      tauxLiquidation = TAUX_PLEIN - manquants * DECOTE_PAR_TRIMESTRE;
      decoteSurcoteText = `Decote -${manquants} trim.`;
    } else if (trimestresTotaux > trimestresRequis && offsets[i] > 0) {
      const excedentaires = trimestresTotaux - trimestresRequis;
      tauxLiquidation = TAUX_PLEIN + excedentaires * SURCOTE_PAR_TRIMESTRE;
      decoteSurcoteText = `Surcote +${excedentaires} trim.`;
    }

    const dureeRetenue = Math.min(trimestresTotaux, trimestresRequis);
    let pensionBaseAnnuelle = sam * tauxLiquidation * (dureeRetenue / trimestresRequis);
    pensionBaseAnnuelle = Math.min(pensionBaseAnnuelle, PASS_2025 * 0.50);

    let pensionComplAnnuelle = 0;
    if (formData.statut === 'salarie') {
      const points = calculerPointsAgircArrco(salaireBrut, evolutionPct, anneesCotisees);
      pensionComplAnnuelle = points * VALEUR_POINT_AGIRC_ARRCO;
    } else if (formData.statut === 'independant') {
      pensionComplAnnuelle = pensionBaseAnnuelle * 0.30;
    } else if (formData.statut === 'liberal') {
      pensionComplAnnuelle = pensionBaseAnnuelle * 0.20;
    } else {
      pensionComplAnnuelle = pensionBaseAnnuelle * 0.05;
    }

    const pensionBruteAnnuelle = pensionBaseAnnuelle + pensionComplAnnuelle;
    const pensionNetteAnnuelle = pensionBruteAnnuelle * (1 - TOTAL_PRELEVEMENTS);
    const pensionNetteMensuelle = pensionNetteAnnuelle / 12;

    // Cumul jusqu'a 85 ans
    const anneesRetraite = Math.max(0, 85 - ageDepart);
    const totalCumule85 = pensionNetteAnnuelle * anneesRetraite;

    const dernierRevenuNet = salaireBrut * 0.78;
    const tauxRemplacement = dernierRevenuNet > 0 ? (pensionNetteAnnuelle / dernierRevenuNet) * 100 : 0;

    scenarios.push({
      nom: noms[i],
      age: ageDepart,
      trimestres: trimestresTotaux,
      pensionMensuelle: pensionNetteMensuelle,
      pensionAnnuelle: pensionNetteAnnuelle,
      totalCumule85,
      tauxRemplacement,
      decoteSurcote: decoteSurcoteText,
    });
  }

  return scenarios;
}

// ============================================
// COMPOSANT FAQ
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const faqData = [
    {
      category: "Conditions de depart",
      questions: [
        {
          q: "A quel age puis-je partir a la retraite ?",
          r: "**Age legal de depart (reforme 2023) :**\n\nL'age legal depend de votre annee de naissance :\n\n**Generations concernees :**\n\u2022 Nes en 1961 : 62 ans et 3 mois\n\u2022 Nes en 1962 : 62 ans et 6 mois\n\u2022 Nes en 1963 : 62 ans et 9 mois\n\u2022 Nes en 1964 : 63 ans\n\u2022 Nes en 1965 : 63 ans et 3 mois\n\u2022 Nes en 1966 : 63 ans et 6 mois\n\u2022 Nes en 1967 : 63 ans et 9 mois\n\u2022 Nes en 1968 et apres : 64 ans\n\n**Age du taux plein automatique :** 67 ans (quel que soit le nombre de trimestres).\n\n**Depart anticipe possible :** carriere longue (debut avant 16, 18 ou 20 ans), handicap, incapacite permanente.",
          source: "Loi n 2023-270 du 14 avril 2023 - Reforme des retraites"
        },
        {
          q: "Comment est calculee la retraite de base ?",
          r: "**Formule du regime general (CNAV) :**\n\n**Pension = SAM x Taux x (Duree cotisee / Duree requise)**\n\n**SAM (Salaire Annuel Moyen) :**\n\u2022 Moyenne des 25 meilleures annees de salaire\n\u2022 Salaires revalorisees selon l'inflation\n\u2022 Plafonnes au Plafond de la Securite Sociale (PASS)\n\n**Taux de liquidation :**\n\u2022 Taux plein : 50%\n\u2022 Taux reduit (decote) : -1,25% par trimestre manquant\n\u2022 Taux majore (surcote) : +1,25% par trimestre supplementaire\n\n**Duree requise :**\n\u2022 172 trimestres (43 ans) pour les nes en 1965 et apres\n\n**Plafond de la pension de base :** environ 50% du PASS, soit ~23 184 EUR/an en 2025.",
          source: "Articles L351-1 a L351-10 du Code de la Securite sociale"
        },
        {
          q: "Qu'est-ce que le taux plein ?",
          r: "**Le taux plein correspond au taux maximum de 50% :**\n\n**Vous obtenez le taux plein si :**\n\u2022 Vous avez cotise le nombre de trimestres requis (172 pour les nes en 1965+)\n\u2022 OU vous atteignez 67 ans (taux plein automatique)\n\n**Avantages du taux plein :**\n\u2022 Pas de decote sur votre pension\n\u2022 Acces au minimum contributif (~8 970 EUR/an en 2025)\n\u2022 Pas de coefficient de solidarite Agirc-Arrco (supprime en 2025)\n\n**Sans le taux plein :**\n\u2022 Decote de 1,25% par trimestre manquant\n\u2022 Maximum 20 trimestres de decote\n\u2022 Soit une reduction maximale de 25% du taux (taux minimum = 37,5%)",
          source: "Article L351-1 du Code de la Securite sociale"
        }
      ]
    },
    {
      category: "Mecanismes de calcul",
      questions: [
        {
          q: "Qu'est-ce que la decote et la surcote ?",
          r: "**DECOTE (depart avant le taux plein) :**\n\u2022 Penalite de 1,25% par trimestre manquant\n\u2022 Maximum 20 trimestres de decote\n\u2022 Reduction maximale : 25% du taux\n\u2022 Taux minimum possible : 37,5% (au lieu de 50%)\n\n**Exemple :** 4 trimestres manquants = decote de 5%\nTaux applique = 50% - 5% = 45%\n\n**SURCOTE (depart apres le taux plein) :**\n\u2022 Bonus de 1,25% par trimestre supplementaire\n\u2022 Applicable uniquement apres l'age legal ET apres le taux plein\n\u2022 Pas de plafond de surcote\n\n**Exemple :** 8 trimestres au-dela = surcote de 10%\nTaux applique = 50% + 10% = 60%\n\n**Impact financier significatif :** chaque annee de surcote augmente la pension d'environ 5%.",
          source: "Articles L351-1-2 et L351-1-3 du Code de la Securite sociale"
        },
        {
          q: "Comment fonctionne la retraite complementaire Agirc-Arrco ?",
          r: "**Systeme par points pour les salaries du prive :**\n\n**Acquisition des points :**\n\u2022 Cotisations sur le salaire brut\n\u2022 Tranche 1 (jusqu'au PASS) : taux global 14,41%\n\u2022 Tranche 2 (PASS a 8xPASS) : taux global 21,59%\n\u2022 Taux d'appel : 127% (seuls 100% generent des points)\n\n**Calcul de la pension :**\n\u2022 Pension = Nombre de points x Valeur du point\n\u2022 Valeur du point 2025 : 1,4159 EUR\n\n**Coefficient de solidarite (malus) :**\n\u2022 Historiquement -10% pendant 3 ans si depart des l'age legal\n\u2022 Supprime en 2025 sous certaines conditions\n\n**Part importante du revenu :** la complementaire peut representer 40 a 60% de la pension totale pour les cadres.",
          source: "Accord national interprofessionnel Agirc-Arrco"
        },
        {
          q: "Faut-il racheter des trimestres ?",
          r: "**Le rachat de trimestres (versement pour la retraite - VPLR) :**\n\n**Ce que vous pouvez racheter :**\n\u2022 Annees d'etudes superieures (max 12 trimestres)\n\u2022 Annees incompletes de cotisation\n\u2022 Periodes de stage ou d'apprentissage non cotisees\n\n**Cout du rachat :**\n\u2022 Variable selon l'age, le revenu et l'option choisie\n\u2022 Option taux seul : moins cher, ameliore uniquement le taux\n\u2022 Option taux + duree : plus cher, ameliore taux et duree\n\u2022 Cout moyen : 3 000 a 7 000 EUR par trimestre\n\n**Quand c'est rentable :**\n\u2022 Proche de la retraite avec quelques trimestres manquants\n\u2022 Decote importante evitable\n\u2022 Deductible du revenu imposable (TMI elevee)\n\n**Quand eviter :**\n\u2022 Beaucoup de trimestres a racheter (cout prohibitif)\n\u2022 Taux plein atteignable naturellement",
          source: "Article L351-14-1 du Code de la Securite sociale"
        }
      ]
    },
    {
      category: "Statuts specifiques",
      questions: [
        {
          q: "Quelle est la retraite d'un independant (TNS) ?",
          r: "**Regime aligne depuis 2020 :**\n\n**Retraite de base :**\n\u2022 Meme formule que les salaries (SAM x Taux x Duree)\n\u2022 Memes conditions d'age et de trimestres\n\u2022 Caisse : Securite Sociale des Independants (SSI)\n\n**Retraite complementaire :**\n\u2022 Artisans/Commercants : regime complementaire SSI\n\u2022 Cotisations et droits souvent inferieurs aux salaries\n\u2022 Pension complementaire typiquement 25-35% de la base\n\n**Specificites :**\n\u2022 Revenus declares souvent inferieurs au salaire brut equivalent\n\u2022 Possibilite de cotiser volontairement sur des montants superieurs\n\u2022 Retraite moyenne plus faible que les salaries (~30%)\n\n**Recommandation :** complementer avec PER, assurance-vie ou immobilier.",
          source: "Loi n 2019-1446 - Fusion RSI/CPAM"
        },
        {
          q: "Comment preparer sa retraite en complement ?",
          r: "**Les 5 piliers de la preparation retraite :**\n\n**1. Plan d'Epargne Retraite (PER) :**\n\u2022 Deductible du revenu imposable (selon TMI)\n\u2022 Sortie en capital ou rente\n\u2022 Plafond 2025 : 10% du revenu net ou 4 637 EUR minimum\n\n**2. Assurance-vie :**\n\u2022 Cadre fiscal avantageux apres 8 ans\n\u2022 Abattement annuel 4 600 EUR (9 200 EUR couple)\n\u2022 Sortie souple en capital\n\n**3. Investissement immobilier :**\n\u2022 SCPI, LMNP, immobilier locatif\n\u2022 Revenus complementaires reguliers\n\u2022 Preparation 15-20 ans avant la retraite\n\n**4. Epargne salariale :**\n\u2022 PEE, PERCO, interessement, participation\n\u2022 Avantages fiscaux et sociaux\n\n**5. Rachat de trimestres :**\n\u2022 Si proche de la retraite avec decote\n\u2022 Deductible fiscalement",
          source: "Loi PACTE 2019 - PER"
        }
      ]
    },
    {
      category: "Questions pratiques",
      questions: [
        {
          q: "Qu'est-ce que le cumul emploi-retraite ?",
          r: "**Travailler en etant retraite :**\n\n**Cumul integral (depuis 2023) :**\n\u2022 Possible si taux plein obtenu\n\u2022 Pas de plafond de revenus d'activite\n\u2022 Genere de nouveaux droits a la retraite (depuis reforme 2023)\n\n**Cumul plafonne :**\n\u2022 Si depart sans taux plein\n\u2022 Revenus activite + pension <= dernier salaire (ou 1,6 SMIC)\n\u2022 En cas de depassement : suspension de la pension\n\n**Retraite progressive :**\n\u2022 A partir de 2 ans avant l'age legal\n\u2022 Travail a temps partiel (40 a 80%)\n\u2022 Perception d'une fraction de la pension\n\u2022 Continue a cotiser et ameliorer ses droits\n\n**Avantages fiscaux :** le cumul est soumis a l'IR et aux prelevements sociaux classiques.",
          source: "Articles L161-22 et L161-22-1-5 du Code de la Securite sociale"
        },
        {
          q: "Comment est imposee la pension de retraite ?",
          r: "**Fiscalite de la pension de retraite :**\n\n**Prelevements sociaux (prelevement a la source) :**\n\u2022 CSG : 8,3% (taux normal) ou 6,6% (taux median) ou 3,8% (taux reduit)\n\u2022 CRDS : 0,5%\n\u2022 CASA : 0,3%\n\u2022 Total prelevement normal : 9,1%\n\n**Impot sur le revenu :**\n\u2022 Soumis au bareme progressif de l'IR\n\u2022 Abattement de 10% (comme les salaires)\n\u2022 Plafond abattement : 4 321 EUR (2025)\n\u2022 Plancher abattement : 442 EUR\n\n**Exonerations possibles :**\n\u2022 RFR < 12 230 EUR (1 part) : exoneration CSG\n\u2022 RFR < 15 988 EUR : taux reduit 3,8%\n\u2022 RFR < 24 813 EUR : taux median 6,6%\n\n**Pension nette :** environ 90-91% de la pension brute pour le taux normal.",
          source: "Article 158-5-a du CGI et CSS L136-8"
        }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {faqData.map((category, catIndex) => (
        <div key={catIndex} className="space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
              <BookOpen className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white">{category.category}</h3>
              <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {category.questions.length}
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-300 via-transparent to-transparent"></div>
          </div>

          {category.questions.map((item, qIndex) => {
            const key = `${catIndex}-${qIndex}`;
            const isOpen = openIndex === key;

            return (
              <div
                key={key}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all overflow-hidden shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : key)}
                  className="w-full px-6 py-4 flex items-start justify-between gap-4 text-left hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mt-0.5">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 leading-relaxed">
                      {item.q}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="pl-9 space-y-4">
                      <div
                        className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {item.r.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <p key={i} className="font-bold text-gray-900 mb-2">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          if (line.startsWith('\u2022')) {
                            return (
                              <p key={i} className="ml-4 mb-1">
                                <span className="text-indigo-500 mr-2">{'\u2022'}</span>
                                {line.substring(1).trim()}
                              </p>
                            );
                          }
                          if (line.trim() === '') {
                            return <div key={i} className="h-2"></div>;
                          }
                          return <p key={i} className="mb-2">{line}</p>;
                        })}
                      </div>

                      {item.source && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 italic flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Source : {item.source}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function SimulateurRetraite() {
  const [activeTab, setActiveTab] = useState<TabId>('estimation');
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    dateNaissance: '1975-06-15',
    sexe: 'homme',
    statut: 'salarie',
    salaireBrutAnnuel: '42000',
    evolutionSalariale: '1.5',
    trimestresAcquis: '80',
    ageDebutActivite: '22',
    trimestresChomage: '0',
    trimestresMaladie: '0',
    trimestresMaternite: '0',
    trimestresRachetes: '0',
    objectifDepart: 'taux_plein',
  });

  const resultat = useMemo(() => calculerRetraite(formData), [formData]);
  const scenarios = useMemo(() => {
    if (!resultat) return [];
    return calculerScenarios(formData, resultat);
  }, [formData, resultat]);

  // Donnees graphiques
  const dataScenarios = useMemo(() => {
    return scenarios.map(s => ({
      nom: s.nom,
      pension: Math.round(s.pensionMensuelle),
      age: s.age,
    }));
  }, [scenarios]);

  const dataCumule = useMemo(() => {
    if (scenarios.length === 0) return [];
    const data: { age: number; [key: string]: number }[] = [];
    for (let age = 60; age <= 90; age++) {
      const point: { age: number; [key: string]: number } = { age };
      scenarios.forEach(s => {
        if (age >= s.age) {
          point[s.nom] = Math.round(s.pensionAnnuelle * (age - s.age));
        } else {
          point[s.nom] = 0;
        }
      });
      data.push(point);
    }
    return data;
  }, [scenarios]);

  const dataDecomposition = useMemo(() => {
    if (!resultat) return [];
    return [
      { name: 'Pension de base', value: Math.round(resultat.pensionBaseAnnuelle), color: '#6366f1' },
      { name: 'Complementaire', value: Math.round(resultat.pensionComplementaireAnnuelle), color: '#8b5cf6' },
    ];
  }, [resultat]);

  const dataRevenus = useMemo(() => {
    if (!resultat) return [];
    const salaireBrut = parseNumber(formData.salaireBrutAnnuel);
    const salaireNet = salaireBrut * 0.78;
    const anneeNaissance = parseInt(formData.dateNaissance.split('-')[0]);
    const ageLegal = getAgeLegal(anneeNaissance);
    const ageRetraite = ageLegal.ans;

    const data = [];
    for (let age = Math.max(50, 2026 - anneeNaissance - 5); age <= 85; age++) {
      if (age < ageRetraite) {
        data.push({
          age,
          revenuActivite: Math.round(salaireNet),
          pensionRetraite: 0,
        });
      } else {
        data.push({
          age,
          revenuActivite: 0,
          pensionRetraite: Math.round(resultat.pensionNetteAnnuelle),
        });
      }
    }
    return data;
  }, [resultat, formData.salaireBrutAnnuel, formData.dateNaissance]);

  // ============================================
  // EXPORT PDF
  // ============================================

  const exporterPDF = () => {
    if (!resultat) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Simulateur Retraite', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estimation de pension', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Age legal de depart : ${resultat.ageLegal} ans${resultat.ageLegalMois > 0 ? ` ${resultat.ageLegalMois} mois` : ''}`, 20, y);
    y += 7;
    doc.text(`Trimestres : ${resultat.trimestresTotaux} / ${resultat.trimestresRequis} requis`, 20, y);
    y += 7;
    if (resultat.trimestresManquants > 0) {
      doc.text(`Trimestres manquants : ${resultat.trimestresManquants}`, 20, y);
      y += 7;
    }
    doc.text(`SAM (Salaire Annuel Moyen) : ${Math.round(resultat.sam).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Taux de liquidation : ${(resultat.tauxLiquidation * 100).toFixed(2)} %`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Montants de pension', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pension de base annuelle : ${Math.round(resultat.pensionBaseAnnuelle).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Pension complementaire annuelle : ${Math.round(resultat.pensionComplementaireAnnuelle).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Pension brute mensuelle : ${Math.round(resultat.pensionBruteMensuelle).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Pension nette mensuelle : ${Math.round(resultat.pensionNetteMensuelle).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Pension nette annuelle : ${Math.round(resultat.pensionNetteAnnuelle).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Taux de remplacement : ${(resultat.tauxRemplacement * 100).toFixed(1)} %`, 20, y);
    y += 12;

    if (scenarios.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Scenarios de depart', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      scenarios.forEach(s => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.text(`${s.nom} : ${Math.round(s.pensionMensuelle).toLocaleString('fr-FR')} EUR/mois (${s.decoteSurcote})`, 20, y);
        y += 7;
      });
      y += 5;
    }

    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'Avertissement : cette estimation est fournie a titre indicatif et ne constitue pas un conseil. Les montants sont bases sur les regles 2025/2026. Consultez info-retraite.fr ou un professionnel pour une estimation personnalisee.';
    const lines = doc.splitTextToSize(disclaimer, 170);
    lines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`retraite-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Formatters pour tooltip
  const tooltipFormatter = useCallback((value: number) => formatEuros(value), []);
  const yAxisFormatter = useCallback((value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return `${value}`;
  }, []);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const tabs = [
    { id: 'estimation' as TabId, label: 'Estimation', icon: Calculator },
    { id: 'optimisation' as TabId, label: 'Optimisation', icon: Target },
    { id: 'complementaire' as TabId, label: 'Complementaire', icon: Shield },
    { id: 'faq' as TabId, label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ============================================ */}
          {/* HEADER */}
          {/* ============================================ */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Clock className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                Simulateur Retraite
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Estimation de pension francaise {'\u2022'} Regime de base et complementaire {'\u2022'} Optimisation
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-700 bg-indigo-100 px-4 py-2 rounded-full w-fit mx-auto">
              <Info className="w-4 h-4" />
              Bareme 2025/2026 - Reforme des retraites integree
            </div>
          </div>

          {/* ============================================ */}
          {/* TABS */}
          {/* ============================================ */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-2">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] px-4 py-3 font-semibold transition-all rounded-xl whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <tab.icon className="w-5 h-5" />
                    {isDesktop && tab.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* TAB: ESTIMATION */}
          {/* ============================================ */}
          {activeTab === 'estimation' && (
            <div className="space-y-6">
              {/* Formulaire */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Colonne gauche: Informations personnelles */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Users className="w-7 h-7 text-indigo-600" />
                    Informations personnelles
                  </h2>

                  <div className="space-y-4">
                    {/* Date de naissance */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        value={formData.dateNaissance}
                        onChange={(e) => updateField('dateNaissance', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                      />
                    </div>

                    {/* Sexe */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Sexe</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'homme', label: 'Homme' },
                          { value: 'femme', label: 'Femme' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateField('sexe', opt.value)}
                            className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                              formData.sexe === opt.value
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Statut */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Statut professionnel</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'salarie', label: 'Salarie prive' },
                          { value: 'fonctionnaire', label: 'Fonctionnaire' },
                          { value: 'independant', label: 'Independant (TNS)' },
                          { value: 'liberal', label: 'Liberal' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateField('statut', opt.value)}
                            className={`px-3 py-3 rounded-xl border-2 font-medium transition-all text-sm ${
                              formData.statut === opt.value
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Salaire brut annuel */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        {formData.statut === 'fonctionnaire' ? 'Traitement brut annuel' : 'Salaire / Revenu brut annuel'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.salaireBrutAnnuel}
                          onChange={(e) => updateField('salaireBrutAnnuel', e.target.value)}
                          className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                          placeholder="42 000"
                        />
                        <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Evolution salariale */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Evolution salariale estimee (% / an)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.evolutionSalariale}
                          onChange={(e) => updateField('evolutionSalariale', e.target.value)}
                          className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                          placeholder="1.5"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Objectif de depart */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Objectif de depart</label>
                      <select
                        value={formData.objectifDepart}
                        onChange={(e) => updateField('objectifDepart', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white"
                      >
                        <option value="plus_tot">Depart au plus tot</option>
                        <option value="taux_plein">Taux plein</option>
                        <option value="surcote">Surcote (travailler plus longtemps)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Colonne droite: Carriere */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Briefcase className="w-7 h-7 text-indigo-600" />
                    Carriere et trimestres
                  </h2>

                  <div className="space-y-4">
                    {/* Age debut activite */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Age de debut d&apos;activite
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.ageDebutActivite}
                          onChange={(e) => updateField('ageDebutActivite', e.target.value)}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                          placeholder="22"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">ans</span>
                      </div>
                    </div>

                    {/* Trimestres acquis */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Trimestres deja cotises
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.trimestresAcquis}
                          onChange={(e) => updateField('trimestresAcquis', e.target.value)}
                          className="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                          placeholder="80"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">trim.</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Consultable sur info-retraite.fr ou votre releve de carriere
                      </p>
                    </div>

                    {/* Separator */}
                    <div className="pt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm font-semibold text-gray-500">Periodes speciales</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                    </div>

                    {/* Periodes speciales */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Chomage (trim.)</label>
                        <input
                          type="text"
                          value={formData.trimestresChomage}
                          onChange={(e) => updateField('trimestresChomage', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Maladie (trim.)</label>
                        <input
                          type="text"
                          value={formData.trimestresMaladie}
                          onChange={(e) => updateField('trimestresMaladie', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Maternite (trim.)</label>
                        <input
                          type="text"
                          value={formData.trimestresMaternite}
                          onChange={(e) => updateField('trimestresMaternite', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Rachetes (trim.)</label>
                        <input
                          type="text"
                          value={formData.trimestresRachetes}
                          onChange={(e) => updateField('trimestresRachetes', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Info carriere longue */}
                    {parseNumber(formData.ageDebutActivite) > 0 && parseNumber(formData.ageDebutActivite) < 20 && (
                      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-amber-800 text-sm">Carriere longue detectee</p>
                            <p className="text-xs text-amber-700 mt-1">
                              Debut d&apos;activite avant 20 ans. Vous pourriez beneficier d&apos;un depart anticipe
                              sous conditions. Contactez votre caisse de retraite pour une etude personnalisee.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ============================================ */}
              {/* RESULTATS */}
              {/* ============================================ */}
              {resultat && (
                <div className="space-y-6">
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

                  {/* Indicateurs principaux */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <p className="text-sm font-semibold text-gray-500">Age legal</p>
                      </div>
                      <p className="text-3xl font-black text-indigo-600">
                        {resultat.ageLegal} ans
                        {resultat.ageLegalMois > 0 && <span className="text-lg"> {resultat.ageLegalMois} mois</span>}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <p className="text-sm font-semibold text-gray-500">Trimestres</p>
                      </div>
                      <p className="text-3xl font-black text-purple-600">
                        {resultat.trimestresTotaux}
                        <span className="text-lg text-gray-400"> / {resultat.trimestresRequis}</span>
                      </p>
                      {resultat.trimestresManquants > 0 && (
                        <p className="text-xs text-red-500 mt-1">-{resultat.trimestresManquants} manquants</p>
                      )}
                      {resultat.trimestresExcedentaires > 0 && (
                        <p className="text-xs text-green-500 mt-1">+{resultat.trimestresExcedentaires} excedentaires</p>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Euro className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-semibold text-gray-500">Pension nette / mois</p>
                      </div>
                      <p className="text-3xl font-black text-green-600">
                        {formatEuros(resultat.pensionNetteMensuelle)}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                        <p className="text-sm font-semibold text-gray-500">Taux remplacement</p>
                      </div>
                      <p className="text-3xl font-black text-amber-600">
                        {formatPourcentage(resultat.tauxRemplacement)}
                      </p>
                    </div>
                  </div>

                  {/* Detail des resultats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Tableau recapitulatif */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-600" />
                        Detail de la pension estimee
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'SAM (Salaire Annuel Moyen)', value: formatEuros(resultat.sam), sub: formData.statut === 'fonctionnaire' ? 'Traitement de reference' : 'Moyenne des 25 meilleures annees' },
                          { label: 'Pension de base (annuelle)', value: formatEuros(resultat.pensionBaseAnnuelle), sub: `soit ${formatEuros(resultat.pensionBase)} / mois` },
                          { label: formData.statut === 'salarie' ? `Complementaire Agirc-Arrco` : 'Complementaire', value: formatEuros(resultat.pensionComplementaireAnnuelle), sub: formData.statut === 'salarie' ? `${Math.round(resultat.pointsAgircArrco).toLocaleString('fr-FR')} points acquis` : `soit ${formatEuros(resultat.pensionComplementaire)} / mois` },
                          { label: 'Pension brute totale', value: formatEuros(resultat.pensionBruteAnnuelle), sub: `soit ${formatEuros(resultat.pensionBruteMensuelle)} / mois`, highlight: true },
                          { label: `Prelevements (${formatPourcentage(TOTAL_PRELEVEMENTS * 100)})`, value: `-${formatEuros(resultat.pensionBruteAnnuelle - resultat.pensionNetteAnnuelle)}`, sub: 'CSG 8,3% + CRDS 0,5% + CASA 0,3%', negative: true },
                          { label: 'Pension nette totale', value: formatEuros(resultat.pensionNetteAnnuelle), sub: `soit ${formatEuros(resultat.pensionNetteMensuelle)} / mois`, highlight: true, green: true },
                        ].map((row, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl ${
                              row.highlight ? (row.green ? 'bg-green-50 border border-green-200' : 'bg-indigo-50 border border-indigo-200') :
                              row.negative ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                            }`}
                          >
                            <div>
                              <p className={`font-semibold text-sm ${row.highlight ? (row.green ? 'text-green-800' : 'text-indigo-800') : row.negative ? 'text-red-800' : 'text-gray-700'}`}>
                                {row.label}
                              </p>
                              {row.sub && (
                                <p className="text-xs text-gray-500 mt-0.5">{row.sub}</p>
                              )}
                            </div>
                            <p className={`font-bold text-lg ${
                              row.green ? 'text-green-700' : row.negative ? 'text-red-600' : row.highlight ? 'text-indigo-700' : 'text-gray-900'
                            }`}>
                              {row.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decomposition pie chart */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChartIcon className="w-6 h-6 text-indigo-600" />
                        Decomposition de la pension
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dataDecomposition}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: Record<string, unknown>) =>
                              `${String(name)}: ${(Number(percent || 0) * 100).toFixed(0)}%`
                            }
                            outerRadius={100}
                            dataKey="value"
                          >
                            {dataDecomposition.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={tooltipFormatter} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Comparaison revenus */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Comparaison avec le revenu d&apos;activite</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Dernier revenu net annuel</span>
                            <span className="font-bold text-gray-900">{formatEuros(resultat.dernierRevenuNet)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pension nette annuelle</span>
                            <span className="font-bold text-green-600">{formatEuros(resultat.pensionNetteAnnuelle)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
                              style={{ width: `${Math.min(100, resultat.tauxRemplacement)}%` }}
                            ></div>
                          </div>
                          <p className="text-center text-sm">
                            Taux de remplacement : <span className="font-bold text-indigo-600">{formatPourcentage(resultat.tauxRemplacement)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graphique revenus avant/apres retraite */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                      Evolution des revenus avant / apres retraite
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={dataRevenus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" tickFormatter={(v: number) => `${v} ans`} />
                        <YAxis tickFormatter={yAxisFormatter} />
                        <Tooltip
                          formatter={tooltipFormatter}
                          labelFormatter={(label: number) => `Age : ${label} ans`}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="revenuActivite" name="Revenu d'activite" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="pensionRetraite" name="Pension retraite" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Info regime */}
                  <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-indigo-800">
                        <p className="font-semibold mb-1">A propos de cette estimation</p>
                        <p>
                          Cette simulation est une estimation indicative basee sur les regles 2025/2026 et votre situation actuelle.
                          Le montant reel pourra varier selon l&apos;evolution de votre carriere, les revalorisations et les eventuelles reformes.
                          Pour une estimation personnalisee, consultez votre releve de situation individuelle sur{' '}
                          <span className="font-bold">info-retraite.fr</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: OPTIMISATION */}
          {/* ============================================ */}
          {activeTab === 'optimisation' && (
            <div className="space-y-6">
              {!resultat ? (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">
                    Remplissez d&apos;abord vos informations dans l&apos;onglet Estimation pour voir les scenarios d&apos;optimisation.
                  </p>
                </div>
              ) : (
                <>
                  {/* Scenarios de depart */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Target className="w-7 h-7 text-indigo-600" />
                      Scenarios de depart
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {scenarios.map((scenario, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            idx === 1
                              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {idx === 1 && (
                            <div className="flex items-center gap-1 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs font-bold text-indigo-600 uppercase">Age legal</span>
                            </div>
                          )}
                          <h3 className="font-bold text-gray-900 mb-3">{scenario.nom}</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Age</span>
                              <span className="font-semibold">{scenario.age.toFixed(1)} ans</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Trimestres</span>
                              <span className="font-semibold">{scenario.trimestres}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Decote/Surcote</span>
                              <span className={`font-semibold ${
                                scenario.decoteSurcote.includes('Decote') ? 'text-red-600' :
                                scenario.decoteSurcote.includes('Surcote') ? 'text-green-600' : 'text-indigo-600'
                              }`}>
                                {scenario.decoteSurcote}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-sm text-gray-500">Pension nette / mois</p>
                              <p className="text-2xl font-black text-indigo-600">{formatEuros(scenario.pensionMensuelle)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Taux remplacement</p>
                              <p className="text-lg font-bold text-gray-900">{formatPourcentage(scenario.tauxRemplacement)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total cumule a 85 ans</p>
                              <p className="text-lg font-bold text-green-600">{formatEuros(scenario.totalCumule85)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Graphiques d'optimisation */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar chart: pension par scenario */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                        Pension mensuelle par scenario
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataScenarios}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nom" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                          <YAxis tickFormatter={yAxisFormatter} />
                          <Tooltip formatter={tooltipFormatter} />
                          <Bar dataKey="pension" name="Pension nette / mois" radius={[8, 8, 0, 0]}>
                            {dataScenarios.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Line chart: pension cumulee */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                        Pension cumulee selon l&apos;age
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dataCumule}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="age" tickFormatter={(v: number) => `${v}`} />
                          <YAxis tickFormatter={yAxisFormatter} />
                          <Tooltip
                            formatter={tooltipFormatter}
                            labelFormatter={(label: number) => `Age : ${label} ans`}
                          />
                          <Legend />
                          {scenarios.map((s, idx) => (
                            <Line
                              key={idx}
                              type="monotone"
                              dataKey={s.nom}
                              stroke={COLORS_CHART[idx % COLORS_CHART.length]}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Rachat de trimestres */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <Award className="w-7 h-7 text-purple-600" />
                      Rachat de trimestres
                    </h2>

                    {resultat.trimestresManquants > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                          <p className="text-sm text-purple-800">
                            Vous avez <span className="font-bold">{resultat.trimestresManquants} trimestres manquants</span> pour
                            le taux plein. Le rachat pourrait vous permettre d&apos;eviter une decote.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              trimestres: Math.min(4, resultat.trimestresManquants),
                              cout: Math.min(4, resultat.trimestresManquants) * 5000,
                              gain: Math.min(4, resultat.trimestresManquants) * DECOTE_PAR_TRIMESTRE * resultat.sam * 0.5 / 12,
                            },
                            {
                              trimestres: Math.min(8, resultat.trimestresManquants),
                              cout: Math.min(8, resultat.trimestresManquants) * 5500,
                              gain: Math.min(8, resultat.trimestresManquants) * DECOTE_PAR_TRIMESTRE * resultat.sam * 0.5 / 12,
                            },
                            {
                              trimestres: Math.min(12, resultat.trimestresManquants),
                              cout: Math.min(12, resultat.trimestresManquants) * 6000,
                              gain: Math.min(12, resultat.trimestresManquants) * DECOTE_PAR_TRIMESTRE * resultat.sam * 0.5 / 12,
                            },
                          ].filter(s => s.trimestres > 0).map((scenario, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <p className="font-bold text-gray-900 mb-2">
                                Racheter {scenario.trimestres} trimestre{scenario.trimestres > 1 ? 's' : ''}
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Cout estime</span>
                                  <span className="font-semibold text-red-600">{formatEuros(scenario.cout)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Gain mensuel</span>
                                  <span className="font-semibold text-green-600">+{formatEuros(scenario.gain)}/mois</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Rentabilise en</span>
                                  <span className="font-semibold text-indigo-600">
                                    {scenario.gain > 0 ? `${Math.ceil(scenario.cout / (scenario.gain * 12))} ans` : '-'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Estimation indicative. Le cout reel depend de l&apos;age, du revenu et de l&apos;option choisie (taux seul ou taux + duree).
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-semibold text-green-800">
                            Vous disposez de suffisamment de trimestres pour le taux plein. Le rachat n&apos;est pas necessaire.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cumul emploi-retraite */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <Briefcase className="w-7 h-7 text-indigo-600" />
                      Cumul emploi-retraite
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <h4 className="font-bold text-indigo-800 mb-2">Cumul integral</h4>
                        <ul className="text-sm text-indigo-700 space-y-1">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Possible si taux plein obtenu</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Pas de plafond de revenus d&apos;activite</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Genere de nouveaux droits (depuis 2023)</span>
                          </li>
                        </ul>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-bold text-amber-800 mb-2">Retraite progressive</h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>A partir de 2 ans avant l&apos;age legal</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>Travail a temps partiel (40 a 80%)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>Perception d&apos;une fraction de la pension</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: COMPLEMENTAIRE */}
          {/* ============================================ */}
          {activeTab === 'complementaire' && (
            <div className="space-y-6">
              {!resultat ? (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">
                    Remplissez d&apos;abord vos informations dans l&apos;onglet Estimation.
                  </p>
                </div>
              ) : (
                <>
                  {/* Agirc-Arrco / regime complementaire */}
                  {formData.statut === 'salarie' && (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Landmark className="w-7 h-7 text-indigo-600" />
                        Retraite complementaire Agirc-Arrco
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                          <p className="text-sm text-indigo-600 font-semibold">Points acquis (estimation)</p>
                          <p className="text-3xl font-black text-indigo-700 mt-1">
                            {Math.round(resultat.pointsAgircArrco).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                          <p className="text-sm text-purple-600 font-semibold">Valeur du point 2025</p>
                          <p className="text-3xl font-black text-purple-700 mt-1">
                            {formatEurosDecimal(VALEUR_POINT_AGIRC_ARRCO)}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                          <p className="text-sm text-green-600 font-semibold">Pension complementaire</p>
                          <p className="text-3xl font-black text-green-700 mt-1">
                            {formatEuros(resultat.pensionComplementaire)}/mois
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-3">Detail des cotisations Agirc-Arrco</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-2">
                            <p className="font-semibold text-gray-700">Tranche 1 (jusqu&apos;au PASS : {formatEuros(PASS_2025)})</p>
                            <div className="flex justify-between text-gray-600">
                              <span>Part salariale</span>
                              <span>6,20%</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Part employeur</span>
                              <span>8,21%</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-800 border-t pt-1">
                              <span>Total T1</span>
                              <span>14,41%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-semibold text-gray-700">Tranche 2 (PASS a 8xPASS)</p>
                            <div className="flex justify-between text-gray-600">
                              <span>Part salariale</span>
                              <span>8,64%</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Part employeur</span>
                              <span>12,95%</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-800 border-t pt-1">
                              <span>Total T2</span>
                              <span>21,59%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Autres statuts */}
                  {formData.statut !== 'salarie' && (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Landmark className="w-7 h-7 text-indigo-600" />
                        Retraite complementaire
                        {formData.statut === 'fonctionnaire' && ' - RAFP'}
                        {formData.statut === 'independant' && ' - SSI'}
                        {formData.statut === 'liberal' && ' - CIPAV / CNAVPL'}
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                          <p className="text-sm text-indigo-600 font-semibold">Pension complementaire estimee</p>
                          <p className="text-3xl font-black text-indigo-700 mt-1">
                            {formatEuros(resultat.pensionComplementaire)}/mois
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                          <p className="text-sm text-green-600 font-semibold">Part dans la pension totale</p>
                          <p className="text-3xl font-black text-green-700 mt-1">
                            {resultat.pensionBruteMensuelle > 0
                              ? formatPourcentage((resultat.pensionComplementaire / resultat.pensionBruteMensuelle) * 100)
                              : '0 %'}
                          </p>
                        </div>
                      </div>

                      {formData.statut === 'fonctionnaire' && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <span className="font-bold">RAFP (Retraite Additionnelle de la Fonction Publique) :</span>{' '}
                            regime complementaire par points, base sur les primes et indemnites (dans la limite de 20% du traitement indiciaire).
                            Prestation forfaitaire si moins de 5 125 points, rente viagere au-dela.
                          </p>
                        </div>
                      )}
                      {formData.statut === 'independant' && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <p className="text-sm text-amber-800">
                            <span className="font-bold">SSI (Securite Sociale des Independants) :</span>{' '}
                            regime complementaire obligatoire pour artisans et commercants. Pension moyenne inferieure de 30% a celle des salaries.
                            Fortement recommande de completer avec un PER ou une assurance-vie.
                          </p>
                        </div>
                      )}
                      {formData.statut === 'liberal' && (
                        <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                          <p className="text-sm text-violet-800">
                            <span className="font-bold">CIPAV / CNAVPL :</span>{' '}
                            regime par points. 8 classes de cotisation pour la CIPAV. Pension complementaire souvent
                            modeste. Les professions liberales ont generalement les pensions les plus basses - la preparation
                            individuelle est indispensable.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complement PER et assurance-vie */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Shield className="w-7 h-7 text-purple-600" />
                      Complements de revenus a la retraite
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* PER */}
                      <div className="p-5 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
                          <Landmark className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Plan d&apos;Epargne Retraite (PER)</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Deductible du revenu imposable</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Sortie en capital ou rente</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>Plafond 2025 : 10% du revenu net</span>
                          </li>
                        </ul>
                        {(() => {
                          const salaire = parseNumber(formData.salaireBrutAnnuel);
                          const plafondPER = Math.max(4637, salaire * 0.78 * 0.10);
                          return (
                            <div className="mt-3 p-3 bg-indigo-100 rounded-lg">
                              <p className="text-xs text-indigo-700">Votre plafond PER estime :</p>
                              <p className="text-lg font-bold text-indigo-800">{formatEuros(plafondPER)}/an</p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Assurance-vie */}
                      <div className="p-5 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-3">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Assurance-vie</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            <span>Fiscalite allegee apres 8 ans</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            <span>Abattement 4 600 EUR (9 200 EUR couple)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            <span>Sortie libre en capital</span>
                          </li>
                        </ul>
                        <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                          <p className="text-xs text-purple-700">Complement mensuel pour 100k EUR a 3% :</p>
                          <p className="text-lg font-bold text-purple-800">~{formatEuros(Math.round(100000 * 0.03 / 12))}/mois</p>
                        </div>
                      </div>

                      {/* Immobilier */}
                      <div className="p-5 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-3">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Revenus immobiliers</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>SCPI : rendement moyen 4-5%</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>LMNP : amortissement fiscal</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Revenus reguliers et indexation</span>
                          </li>
                        </ul>
                        <div className="mt-3 p-3 bg-green-100 rounded-lg">
                          <p className="text-xs text-green-700">Revenus SCPI pour 100k EUR a 4,5% :</p>
                          <p className="text-lg font-bold text-green-800">~{formatEuros(Math.round(100000 * 0.045 / 12))}/mois</p>
                        </div>
                      </div>
                    </div>

                    {/* Estimation du deficit */}
                    <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        Objectif de complement de revenus
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500">Dernier revenu net mensuel</p>
                          <p className="text-xl font-bold text-gray-900">{formatEuros(resultat.dernierRevenuNet / 12)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Pension nette mensuelle</p>
                          <p className="text-xl font-bold text-green-600">{formatEuros(resultat.pensionNetteMensuelle)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Deficit mensuel a combler</p>
                          <p className="text-xl font-bold text-red-600">
                            {formatEuros(Math.max(0, resultat.dernierRevenuNet / 12 - resultat.pensionNetteMensuelle))}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all relative"
                            style={{ width: `${Math.min(100, resultat.tauxRemplacement)}%` }}
                          >
                            <span className="absolute right-2 top-0 text-xs font-bold text-white leading-4">
                              {formatPourcentage(resultat.tauxRemplacement)}
                            </span>
                          </div>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-1">
                          Taux de remplacement actuel - Objectif recommande : 70-80%
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: FAQ */}
          {/* ============================================ */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <HelpCircle className="w-7 h-7 text-indigo-600" />
                  Questions frequentes sur la retraite
                </h2>
                <FAQSection />
              </div>

              {/* Ressources utiles */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  Ressources utiles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      titre: 'Info Retraite',
                      desc: 'Simulateur officiel multi-regimes. Consultez votre releve de situation individuelle.',
                      url: 'info-retraite.fr',
                    },
                    {
                      titre: 'Assurance Retraite',
                      desc: 'Site de la CNAV pour le regime general. Demande de retraite en ligne.',
                      url: 'lassuranceretraite.fr',
                    },
                    {
                      titre: 'Agirc-Arrco',
                      desc: 'Retraite complementaire des salaries du prive. Espace personnel.',
                      url: 'agirc-arrco.fr',
                    },
                    {
                      titre: 'Service Public',
                      desc: 'Toutes les informations officielles sur la reforme des retraites 2023.',
                      url: 'service-public.fr',
                    },
                  ].map((resource, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all">
                      <h4 className="font-bold text-gray-900 mb-1">{resource.titre}</h4>
                      <p className="text-xs text-gray-600 mb-2">{resource.desc}</p>
                      <p className="text-xs text-indigo-600 font-semibold">{resource.url}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* FOOTER DISCLAIMER */}
          {/* ============================================ */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Avertissement :</span> Ce simulateur fournit une estimation indicative basee sur
                les regles en vigueur en 2025/2026 et les informations saisies. Il ne se substitue pas a une consultation
                aupres de votre caisse de retraite. Les montants reels dependent de l&apos;ensemble de votre carriere,
                des revalorisations futures et des eventuelles evolutions legislatives. Donnees PASS 2025 : {formatEuros(PASS_2025)}.
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
