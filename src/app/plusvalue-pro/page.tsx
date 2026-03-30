"use client";

import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import {
  Calculator, TrendingUp, Euro, Calendar, FileText, Download,
  AlertCircle, Info, CheckCircle, Clock,
  ArrowRight, Users, Lightbulb, BarChart3, Target,
  PieChart, HelpCircle, ChevronDown, ChevronUp, BookOpen,
  Building, Shield, Briefcase, Scale, Percent, Award
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell
} from 'recharts';

// ============================================
// TYPES
// ============================================

interface FormData {
  typeCession: 'fonds' | 'entreprise_individuelle' | 'parts_sociales' | 'immeuble_pro';
  prixCession: string;
  prixAcquisition: string;
  amortissements: string;
  dureeDetention: string;
  typeActivite: 'ventes' | 'services' | 'liberale';
  caMoyen: string;
  nombreSalaries: string;
  statut: 'ei' | 'societe';
  tmi: '0' | '11' | '30' | '41' | '45';
  departRetraite: boolean;
  optionBareme: boolean;
  totalBilan: string;
}

interface Exoneration {
  nom: string;
  article: string;
  eligible: boolean;
  tauxExoneration: number;
  montantExonere: number;
  economie: number;
  conditions: string[];
  conditionsRemplies: boolean[];
  description: string;
}

interface ResultatsCalcul {
  plusValueBrute: number;
  pvCourtTerme: number;
  pvLongTerme: number;
  exonerations: Exoneration[];
  meilleurRegime: Exoneration | null;
  pvNetteImposableCT: number;
  pvNetteImposableLT: number;
  impotCT: number;
  cotisationsSocialesCT: number;
  impotLT: number;
  psLT: number;
  totalFiscalite: number;
  netDeCession: number;
  suggestions: string[];
}

interface SimulationPoint {
  annee: number;
  pvBrute: number;
  exoneration: number;
  pvTaxable: number;
  fiscalite: number;
}

// ============================================
// CONSTANTES
// ============================================

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5'];

const TMI_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '11', label: '11%' },
  { value: '30', label: '30%' },
  { value: '41', label: '41%' },
  { value: '45', label: '45%' },
];

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

function formatPourcent(val: number): string {
  return `${val.toFixed(1)} %`;
}

function formatMontantInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerExonerations(form: FormData, pvBrute: number, pvCT: number, pvLT: number): Exoneration[] {
  const ca = parseNumber(form.caMoyen);
  const duree = parseNumber(form.dureeDetention);
  const prixCession = parseNumber(form.prixCession);
  const salaries = parseNumber(form.nombreSalaries);
  const bilan = parseNumber(form.totalBilan);
  const tmi = parseNumber(form.tmi);
  const exonerations: Exoneration[] = [];

  // 1. Art. 151 septies - Petites entreprises
  {
    const seuilTotal = form.typeActivite === 'ventes' ? 250000 : 90000;
    const seuilPartiel = form.typeActivite === 'ventes' ? 350000 : 126000;
    const plage = form.typeActivite === 'ventes' ? 100000 : 36000;

    const condActivite = duree >= 5;
    const condCA = ca < seuilPartiel;

    let taux = 0;
    if (condActivite && ca < seuilTotal) {
      taux = 1;
    } else if (condActivite && ca >= seuilTotal && ca < seuilPartiel) {
      taux = (seuilPartiel - ca) / plage;
    }

    const montantExonere = pvBrute * taux;
    const economie = montantExonere * (tmi / 100 + 0.186);

    exonerations.push({
      nom: 'Petites entreprises',
      article: 'Art. 151 septies CGI',
      eligible: condActivite && condCA,
      tauxExoneration: taux * 100,
      montantExonere,
      economie,
      conditions: [
        `Activite exercee depuis >= 5 ans (actuel: ${duree} ans)`,
        `CA moyen < ${formatEuros(seuilPartiel)} (actuel: ${formatEuros(ca)})`,
      ],
      conditionsRemplies: [condActivite, condCA],
      description: ca < seuilTotal && condActivite
        ? 'Exoneration totale (CT + LT + PS)'
        : `Exoneration partielle : ${(taux * 100).toFixed(1)}%`
    });
  }

  // 2. Art. 238 quindecies - Cession < 500K
  {
    const condActivite = duree >= 5;
    const condValeur = prixCession < 1000000;

    let taux = 0;
    if (condActivite && prixCession < 500000) {
      taux = 1;
    } else if (condActivite && prixCession >= 500000 && prixCession < 1000000) {
      taux = (1000000 - prixCession) / 500000;
    }

    const montantExonere = pvBrute * taux;
    const economie = montantExonere * (tmi / 100 + 0.186);

    exonerations.push({
      nom: 'Cession d\'entreprise < 500K',
      article: 'Art. 238 quindecies CGI',
      eligible: condActivite && condValeur,
      tauxExoneration: taux * 100,
      montantExonere,
      economie,
      conditions: [
        `Activite exercee depuis >= 5 ans (actuel: ${duree} ans)`,
        `Valeur des elements cedes < 1 000 000 EUR (actuel: ${formatEuros(prixCession)})`,
        'Cession a titre onereux d\'une entreprise ou branche complete',
      ],
      conditionsRemplies: [condActivite, condValeur, true],
      description: prixCession < 500000 && condActivite
        ? 'Exoneration totale (IR + PS)'
        : `Exoneration partielle : ${(taux * 100).toFixed(1)}%`
    });
  }

  // 3. Art. 151 septies A - Depart a la retraite
  {
    const condPME = salaries < 250 && (ca < 50000000 || bilan < 43000000);
    const condActivite = duree >= 5;
    const condRetraite = form.departRetraite;
    const condSociete = form.statut === 'ei' || form.typeCession === 'parts_sociales';

    const allConditions = condPME && condActivite && condRetraite && condSociete;
    const taux = allConditions ? 1 : 0;
    const montantExonere = pvBrute * taux;
    // PS restent dus sur LT meme si exonere IR
    const economieIR = montantExonere * (tmi / 100);
    const economiePS_CT = pvCT * taux * 0.40;
    const economie = economieIR + economiePS_CT;

    exonerations.push({
      nom: 'Depart a la retraite',
      article: 'Art. 151 septies A CGI',
      eligible: allConditions,
      tauxExoneration: taux * 100,
      montantExonere,
      economie,
      conditions: [
        `PME (< 250 salaries, CA < 50M ou bilan < 43M) - ${salaries} salaries`,
        `Activite exercee depuis >= 5 ans (actuel: ${duree} ans)`,
        'Depart a la retraite dans les 24 mois',
        'Cession a un tiers (pas de controle par le cedant)',
      ],
      conditionsRemplies: [condPME, condActivite, condRetraite, condSociete],
      description: allConditions
        ? 'Exoneration IR totale (PS restent dus sur PV LT)'
        : 'Non applicable - conditions non remplies'
    });
  }

  // 4. Art. 151 septies B - Immeuble professionnel
  {
    const condImmeuble = form.typeCession === 'immeuble_pro';
    const condDuree = duree > 5;

    let taux = 0;
    if (condImmeuble && duree >= 15) {
      taux = 1;
    } else if (condImmeuble && duree > 5) {
      taux = (duree - 5) * 0.10;
    }

    const montantExonere = pvLT * taux;
    const economie = montantExonere * 0.30;

    exonerations.push({
      nom: 'Immeuble professionnel (abattement)',
      article: 'Art. 151 septies B CGI',
      eligible: condImmeuble && condDuree,
      tauxExoneration: taux * 100,
      montantExonere,
      economie,
      conditions: [
        `Immeuble affecte a l'exploitation professionnelle`,
        `Detention > 5 ans (actuel: ${duree} ans)`,
        `Abattement: 10% par annee au-dela de la 5e (${Math.min(Math.max(0, Math.floor(duree - 5)), 10) * 10}%)`,
      ],
      conditionsRemplies: [condImmeuble, condDuree, duree >= 15],
      description: duree >= 15
        ? 'Exoneration totale PV LT sur immeuble'
        : `Abattement de ${(taux * 100).toFixed(0)}% sur la PV LT`
    });
  }

  // 5. Art. 150-0 D ter - Parts sociales dirigeant retraite
  {
    const condParts = form.typeCession === 'parts_sociales';
    const condRetraite = form.departRetraite;
    const condDuree = duree >= 2;

    const allConditions = condParts && condRetraite && condDuree;
    const abattementFixe = allConditions ? Math.min(500000, pvBrute) : 0;
    const taux = pvBrute > 0 ? abattementFixe / pvBrute : 0;
    const economie = abattementFixe * 0.30;

    exonerations.push({
      nom: 'Dirigeant partant a la retraite (parts)',
      article: 'Art. 150-0 D ter CGI',
      eligible: allConditions,
      tauxExoneration: taux * 100,
      montantExonere: abattementFixe,
      economie,
      conditions: [
        'Cession de parts / actions de societe',
        'Depart a la retraite du dirigeant',
        `Dirigeant depuis >= 2 ans (actuel: ${duree} ans)`,
        'Detention > 25% des droits a un moment',
        'PME au sens europeen',
      ],
      conditionsRemplies: [condParts, condRetraite, condDuree, true, true],
      description: allConditions
        ? `Abattement fixe de ${formatEuros(abattementFixe)}`
        : 'Non applicable - conditions non remplies'
    });
  }

  return exonerations;
}

function calculerResultats(form: FormData): ResultatsCalcul | null {
  const prixCession = parseNumber(form.prixCession);
  const prixAcquisition = parseNumber(form.prixAcquisition);
  const amortissements = parseNumber(form.amortissements);
  const duree = parseNumber(form.dureeDetention);
  const tmi = parseNumber(form.tmi);

  if (prixCession === 0) return null;

  const plusValueBrute = prixCession - prixAcquisition;
  if (plusValueBrute <= 0) {
    return {
      plusValueBrute,
      pvCourtTerme: 0,
      pvLongTerme: 0,
      exonerations: [],
      meilleurRegime: null,
      pvNetteImposableCT: 0,
      pvNetteImposableLT: 0,
      impotCT: 0,
      cotisationsSocialesCT: 0,
      impotLT: 0,
      psLT: 0,
      totalFiscalite: 0,
      netDeCession: prixCession,
      suggestions: ['Aucune plus-value : la cession degage une moins-value.'],
    };
  }

  // Decomposition CT / LT
  let pvCT = 0;
  let pvLT = 0;

  if (duree < 2) {
    // Tout est CT si detention < 2 ans
    pvCT = plusValueBrute;
    pvLT = 0;
  } else {
    // Amortissements = CT, le reste = LT
    pvCT = Math.min(amortissements, plusValueBrute);
    pvLT = Math.max(0, plusValueBrute - pvCT);
  }

  // Calcul des exonerations
  const exonerations = calculerExonerations(form, plusValueBrute, pvCT, pvLT);

  // Trouver le meilleur regime
  const eligibles = exonerations.filter(e => e.eligible && e.economie > 0);
  const meilleurRegime = eligibles.length > 0
    ? eligibles.reduce((best, curr) => curr.economie > best.economie ? curr : best)
    : null;

  // Appliquer la meilleure exoneration
  let pvNetteImposableCT = pvCT;
  let pvNetteImposableLT = pvLT;

  if (meilleurRegime) {
    const taux = meilleurRegime.tauxExoneration / 100;
    // Art. 151 septies B n'affecte que la PV LT
    if (meilleurRegime.article === 'Art. 151 septies B CGI') {
      pvNetteImposableLT = pvLT * (1 - taux);
    } else if (meilleurRegime.article === 'Art. 150-0 D ter CGI') {
      // Abattement fixe sur la PV globale
      const abattement = meilleurRegime.montantExonere;
      const resteApresAbattement = Math.max(0, plusValueBrute - abattement);
      pvNetteImposableCT = 0;
      pvNetteImposableLT = resteApresAbattement;
    } else if (meilleurRegime.article === 'Art. 151 septies A CGI') {
      // IR exonere mais PS restent sur LT
      pvNetteImposableCT = 0;
      pvNetteImposableLT = 0;
    } else {
      // Exoneration globale (151 septies, 238 quindecies)
      pvNetteImposableCT = pvCT * (1 - taux);
      pvNetteImposableLT = pvLT * (1 - taux);
    }
  }

  // Calcul imposition CT
  const impotCT = pvNetteImposableCT * (tmi / 100);
  const cotisationsSocialesCT = pvNetteImposableCT * 0.425; // ~42.5% cotisations sociales

  // Calcul imposition LT
  let impotLT = 0;
  let psLT = 0;

  if (form.optionBareme) {
    impotLT = pvNetteImposableLT * (tmi / 100);
  } else {
    impotLT = pvNetteImposableLT * 0.128; // flat tax 12.8%
  }
  psLT = pvNetteImposableLT * 0.186; // PS 18.6% LFSS 2026

  // Exception art. 151 septies A : PS restent dus sur PV LT
  if (meilleurRegime?.article === 'Art. 151 septies A CGI') {
    psLT = pvLT * 0.186; // PS 18.6% LFSS 2026
    impotLT = 0;
  }

  const totalFiscalite = impotCT + cotisationsSocialesCT + impotLT + psLT;
  const netDeCession = prixCession - totalFiscalite;

  // Suggestions
  const suggestions: string[] = [];

  if (duree < 2) {
    suggestions.push('La detention est inferieure a 2 ans : toute la plus-value est a court terme, imposee comme un revenu ordinaire.');
  }
  if (duree >= 2 && duree < 5) {
    const anneesManquantes = 5 - duree;
    suggestions.push(`Attendre ${anneesManquantes} an(s) pour atteindre 5 ans d'activite ouvrirait les regimes d'exoneration (art. 151 septies, 238 quindecies, 151 septies A).`);
  }

  if (!form.departRetraite && duree >= 5) {
    suggestions.push('Un depart a la retraite dans les 24 mois avant/apres la cession pourrait ouvrir droit a une exoneration totale d\'IR (art. 151 septies A).');
  }

  if (form.typeCession === 'immeuble_pro' && duree > 5 && duree < 15) {
    const anneesRestantes = 15 - duree;
    suggestions.push(`Immeuble professionnel : dans ${anneesRestantes} an(s), l'exoneration sera totale sur la PV LT (abattement de 10% par an au-dela de 5 ans).`);
  }

  if (pvCT > 0 && duree < 2) {
    suggestions.push('Envisager d\'attendre 2 ans de detention pour reclassifier une partie de la PV en long terme (taux forfaitaire de 30% vs bareme + cotisations).');
  }

  if (form.optionBareme && tmi <= 11 && pvLT > 0) {
    suggestions.push('Avec un TMI faible, l\'option pour le bareme progressif est avantageuse sur la PV long terme.');
  } else if (!form.optionBareme && tmi <= 11 && pvLT > 0) {
    suggestions.push('Votre TMI est faible (11%) : opter pour le bareme progressif pourrait etre plus avantageux que la flat tax (12.8%).');
  }

  if (meilleurRegime) {
    suggestions.push(`Regime optimal identifie : ${meilleurRegime.nom} (${meilleurRegime.article}) - economie estimee de ${formatEuros(meilleurRegime.economie)}.`);
  }

  return {
    plusValueBrute,
    pvCourtTerme: pvCT,
    pvLongTerme: pvLT,
    exonerations,
    meilleurRegime,
    pvNetteImposableCT,
    pvNetteImposableLT,
    impotCT,
    cotisationsSocialesCT,
    impotLT,
    psLT,
    totalFiscalite,
    netDeCession,
    suggestions,
  };
}

// ============================================
// COMPOSANT FAQ
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const faqData = [
    {
      category: "Plus-values professionnelles",
      questions: [
        {
          q: "Quelle difference entre plus-value court terme et long terme ?",
          r: "**PV COURT TERME (CT) :**\n• Bien detenu depuis moins de 2 ans\n• Ou : fraction de la PV correspondant aux amortissements deduits\n• Imposee comme un revenu ordinaire (bareme IR)\n• Soumise aux cotisations sociales (~42.5%)\n• Possibilite d'etalement sur 3 ans\n\n**PV LONG TERME (LT) :**\n• Bien detenu depuis 2 ans ou plus (hors amortissements)\n• Taux forfaitaire : 12.8% d'IR + 18.6% PS = 31.4% (flat tax LFSS 2026)\n• Ou option pour le bareme progressif\n• Regimes d'exoneration specifiques applicables",
          source: "Articles 39 duodecies et 39 terdecies du CGI"
        },
        {
          q: "Quels sont les regimes d'exoneration des PV professionnelles ?",
          r: "**5 REGIMES PRINCIPAUX :**\n\n• **Art. 151 septies** : Petites entreprises (CA < seuils + activite >= 5 ans)\n• **Art. 238 quindecies** : Cession d'entreprise < 500 000 EUR\n• **Art. 151 septies A** : Depart a la retraite\n• **Art. 151 septies B** : Immeuble professionnel (abattement 10%/an apres 5 ans)\n• **Art. 150-0 D ter** : Dirigeant cedant ses parts (abattement 500 000 EUR)\n\n**Certains regimes sont cumulables** entre eux, notamment les articles 151 septies et 151 septies A.",
          source: "CGI - Regimes d'exoneration des PV professionnelles"
        },
        {
          q: "Comment fonctionne l'exoneration depart a la retraite ?",
          r: "**ART. 151 SEPTIES A - CONDITIONS :**\n\n• **PME** au sens europeen (< 250 salaries, CA < 50M EUR ou bilan < 43M EUR)\n• **Activite exercee pendant au moins 5 ans**\n• **Depart a la retraite** dans les 24 mois avant ou apres la cession\n• Cession a un **tiers** (pas de controle par le cedant apres la cession)\n\n**EFFETS :**\n• Exoneration totale d'impot sur le revenu (CT et LT)\n• **Prelevements sociaux restent dus** sur la PV long terme (18.6% depuis LFSS 2026)\n• Exoneration des cotisations sociales sur la PV CT\n\n**C'est l'un des regimes les plus avantageux** pour un cedant proche de la retraite.",
          source: "Article 151 septies A du CGI"
        },
        {
          q: "Peut-on cumuler plusieurs exonerations ?",
          r: "**OUI, sous certaines conditions :**\n\n**Cumuls possibles :**\n• Art. 151 septies + Art. 151 septies A (retraite)\n• Art. 151 septies + Art. 151 septies B (immeuble)\n• Art. 238 quindecies + Art. 151 septies B\n\n**Cumuls impossibles :**\n• Art. 151 septies + Art. 238 quindecies (meme PV)\n• Art. 150-0 D ter + Art. 151 septies (regimes differents)\n\n**Strategie :** Appliquer d'abord le regime le plus favorable, puis verifier si un second regime peut couvrir le solde non exonere.",
          source: "Doctrine fiscale BOI-BIC-PVMV-40-20"
        }
      ]
    },
    {
      category: "Cas pratiques",
      questions: [
        {
          q: "Comment est imposee la plus-value sur parts sociales ?",
          r: "**CESSION DE PARTS DE SOCIETE :**\n\n**Regime de droit commun :**\n• PV = Prix de cession - Prix d'acquisition des parts\n• Flat tax : 12.8% IR + 18.6% PS = 31.4% (LFSS 2026)\n• Ou option bareme progressif + PS 18.6%\n\n**Dirigeant partant a la retraite (art. 150-0 D ter) :**\n• Abattement fixe de 500 000 EUR\n• Conditions : PME, detention > 25%, dirigeant >= 2 ans, retraite dans 24 mois\n\n**Attention :** Les parts de SCI a l'IS relevent du regime des plus-values mobilieres, pas immobilieres.",
          source: "Articles 150-0 A et 150-0 D ter du CGI"
        },
        {
          q: "Qu'est-ce que l'article 151 septies ?",
          r: "**ART. 151 SEPTIES - PETITES ENTREPRISES :**\n\n**Exoneration totale si :**\n• Activite exercee depuis au moins 5 ans\n• CA moyen < 250 000 EUR (ventes/hebergement/fourniture)\n• CA moyen < 90 000 EUR (services/liberale)\n\n**Exoneration partielle entre :**\n• 250 000 - 350 000 EUR (ventes) : formule = (350 000 - CA) / 100 000\n• 90 000 - 126 000 EUR (services) : formule = (126 000 - CA) / 36 000\n\n**Avantage majeur :** Exoneration totale incluant les prelevements sociaux\n\n**S'applique a :** Toutes les PV (CT + LT, tous types d'actifs professionnels)",
          source: "Article 151 septies du CGI"
        },
        {
          q: "Comment calculer la plus-value sur un fonds de commerce ?",
          r: "**CALCUL DE LA PV SUR FONDS DE COMMERCE :**\n\n**Plus-value brute :**\n• PV = Prix de cession - Valeur d'inscription a l'actif\n\n**Decomposition CT / LT :**\n• Si detention < 2 ans : tout en CT\n• Si detention >= 2 ans : amortissements = CT, solde = LT\n• Le fonds de commerce n'est pas amortissable (sauf cas exceptionnels)\n• Donc souvent : PV 100% long terme si detention >= 2 ans\n\n**Regimes applicables :**\n• Art. 238 quindecies si fonds < 500 000 EUR\n• Art. 151 septies si petite entreprise\n• Art. 151 septies A si depart retraite",
          source: "Articles 38 et 39 duodecies du CGI"
        },
        {
          q: "Quand opter pour le bareme progressif vs flat tax ?",
          r: "**COMPARAISON :**\n\n**Flat tax (PFU) a 31.4% (depuis LFSS 2026) :**\n• 12.8% IR + 18.6% PS\n• Avantageuse si TMI >= 30%\n• Pas de possibilite de deduire la CSG\n\n**Bareme progressif :**\n• TMI + 18.6% PS\n• Avantageuse si TMI < 12.8% (tranches 0% ou 11%)\n• Permet de deduire 6.8% de CSG des revenus\n• Tous les revenus mobiliers passent au bareme\n\n**Regles pratiques :**\n• TMI 0% ou 11% : bareme progressif souvent meilleur\n• TMI 30% : quasi equivalent (option bareme + deduction CSG)\n• TMI 41% ou 45% : flat tax tres nettement meilleure"
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
                          if (line.startsWith('•')) {
                            return (
                              <p key={i} className="ml-4 mb-1">
                                <span className="text-indigo-500 mr-2">•</span>
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

                      {'source' in item && item.source && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 italic flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            {item.source}
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

function PlusValueProContent() {
  const [formData, setFormData] = useState<FormData>({
    typeCession: 'fonds',
    prixCession: '',
    prixAcquisition: '',
    amortissements: '',
    dureeDetention: '',
    typeActivite: 'ventes',
    caMoyen: '',
    nombreSalaries: '',
    statut: 'ei',
    tmi: '30',
    departRetraite: false,
    optionBareme: false,
    totalBilan: '',
  });

  const [results, setResults] = useState<ResultatsCalcul | null>(null);
  const [activeTab, setActiveTab] = useState<'calcul' | 'exonerations' | 'simulation' | 'faq'>('calcul');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCalculer = () => {
    const res = calculerResultats(formData);
    if (res) {
      setResults(res);
    } else {
      alert('Veuillez remplir au minimum le prix de cession.');
    }
  };

  const reinitialiser = () => {
    setFormData({
      typeCession: 'fonds',
      prixCession: '',
      prixAcquisition: '',
      amortissements: '',
      dureeDetention: '',
      typeActivite: 'ventes',
      caMoyen: '',
      nombreSalaries: '',
      statut: 'ei',
      tmi: '30',
      departRetraite: false,
      optionBareme: false,
      totalBilan: '',
    });
    setResults(null);
  };

  // ============================================
  // DONNEES GRAPHIQUES
  // ============================================

  // ============================================
  // EXPORT PDF
  // ============================================

  const exporterPDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Plus-Value Professionnelle', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultats du calcul', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Plus-value brute : ${results.plusValueBrute.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`PV Court Terme : ${results.pvCourtTerme.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`PV Long Terme : ${results.pvLongTerme.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Imposition', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`PV nette imposable CT : ${results.pvNetteImposableCT.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Impot CT (IR) : ${results.impotCT.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Cotisations sociales CT : ${results.cotisationsSocialesCT.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`PV nette imposable LT : ${results.pvNetteImposableLT.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Impot LT (12,8%) : ${results.impotLT.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`PS LT (17,2%) : ${results.psLT.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Fiscalite totale : ${results.totalFiscalite.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Net de cession', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Net de cession : ${results.netDeCession.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    if (results.exonerations.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Exonerations applicables', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      results.exonerations.forEach(exo => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${exo.nom} - Eligible: ${exo.eligible ? 'Oui' : 'Non'} - Exonere: ${exo.montantExonere.toLocaleString('fr-FR')} EUR (economie: ${exo.economie.toLocaleString('fr-FR')} EUR)`, 20, y);
        y += 7;
      });
      y += 5;
    }

    if (results.suggestions.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommandations', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      results.suggestions.forEach(s => {
        if (y > 270) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`- ${s}`, 170);
        lines.forEach((line: string) => { doc.text(line, 20, y); y += 6; });
      });
      y += 5;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    if (y > 260) { doc.addPage(); y = 20; }
    const disclaimer = 'Avertissement : cette simulation est fournie a titre informatif et ne constitue pas un conseil fiscal. Consultez un professionnel avant toute decision.';
    const dlines = doc.splitTextToSize(disclaimer, 170);
    dlines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`plusvalue-pro-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const graphiquePVDecomposition = useMemo(() => {
    if (!results || results.plusValueBrute <= 0) return [];
    return [
      { name: 'PV brute', value: results.plusValueBrute },
      { name: 'Exoneree', value: Math.max(0, results.plusValueBrute - results.pvNetteImposableCT - results.pvNetteImposableLT) },
      { name: 'Taxable CT', value: results.pvNetteImposableCT },
      { name: 'Taxable LT', value: results.pvNetteImposableLT },
    ];
  }, [results]);

  const graphiqueFiscalite = useMemo(() => {
    if (!results || results.totalFiscalite <= 0) return [];
    const data: Array<{ name: string; value: number }> = [];
    if (results.impotCT > 0) data.push({ name: 'IR (CT)', value: results.impotCT });
    if (results.cotisationsSocialesCT > 0) data.push({ name: 'Cotisations sociales (CT)', value: results.cotisationsSocialesCT });
    if (results.impotLT > 0) data.push({ name: 'IR (LT)', value: results.impotLT });
    if (results.psLT > 0) data.push({ name: 'PS (LT)', value: results.psLT });
    return data;
  }, [results]);

  const graphiqueEvolutionDetention = useMemo(() => {
    if (!formData.prixCession || !formData.prixAcquisition) return [];
    const data: SimulationPoint[] = [];
    for (let annee = 0; annee <= 20; annee++) {
      const simForm: FormData = {
        ...formData,
        dureeDetention: annee.toString(),
      };
      const res = calculerResultats(simForm);
      if (res) {
        const exonerationMontant = Math.max(0, res.plusValueBrute - res.pvNetteImposableCT - res.pvNetteImposableLT);
        data.push({
          annee,
          pvBrute: res.plusValueBrute,
          exoneration: exonerationMontant,
          pvTaxable: res.pvNetteImposableCT + res.pvNetteImposableLT,
          fiscalite: res.totalFiscalite,
        });
      }
    }
    return data;
  }, [formData.prixCession, formData.prixAcquisition, formData.amortissements, formData.typeActivite, formData.caMoyen, formData.tmi, formData.typeCession, formData.statut, formData.departRetraite, formData.optionBareme, formData.nombreSalaries, formData.totalBilan]);

  const graphiqueComparaisonScenarios = useMemo(() => {
    if (!results || results.plusValueBrute <= 0) return [];
    const prixCession = parseNumber(formData.prixCession);
    const prixAcquisition = parseNumber(formData.prixAcquisition);
    const duree = parseNumber(formData.dureeDetention);

    const scenarios = [];

    // Scenario actuel
    scenarios.push({
      nom: 'Actuel',
      fiscalite: results.totalFiscalite,
      net: results.netDeCession,
    });

    // Scenario avec retraite
    if (!formData.departRetraite && duree >= 5) {
      const simRetraite: FormData = { ...formData, departRetraite: true };
      const resRetraite = calculerResultats(simRetraite);
      if (resRetraite) {
        scenarios.push({
          nom: 'Avec retraite',
          fiscalite: resRetraite.totalFiscalite,
          net: resRetraite.netDeCession,
        });
      }
    }

    // Scenario dans 3 ans
    if (duree < 5) {
      const sim5 = calculerResultats({ ...formData, dureeDetention: '5' });
      if (sim5) {
        scenarios.push({
          nom: 'A 5 ans',
          fiscalite: sim5.totalFiscalite,
          net: sim5.netDeCession,
        });
      }
    }

    // Scenario avec bareme
    if (!formData.optionBareme) {
      const simBareme = calculerResultats({ ...formData, optionBareme: true });
      if (simBareme) {
        scenarios.push({
          nom: 'Option bareme',
          fiscalite: simBareme.totalFiscalite,
          net: simBareme.netDeCession,
        });
      }
    }

    return scenarios;
  }, [results, formData]);

  // ============================================
  // RENDER TABS
  // ============================================

  const tabs = [
    { id: 'calcul' as const, label: 'Calcul', icon: Calculator },
    { id: 'exonerations' as const, label: 'Exonerations', icon: Shield },
    { id: 'simulation' as const, label: 'Simulation', icon: TrendingUp },
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Calculateur Plus-Value Professionnelle
                </h1>
                <p className="text-indigo-600 font-medium mt-1">
                  Regimes d'exoneration et simulation fiscale 2025/2026
                </p>
              </div>
            </div>
            {results && results.plusValueBrute > 0 && (
              <div className="text-right">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                  <p className="text-sm text-indigo-600 font-medium mb-1">Fiscalite totale</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatEuros(results.totalFiscalite)}
                  </p>
                  <p className="text-xs text-indigo-600 mt-2">
                    Net de cession : {formatEuros(results.netDeCession)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* TABS */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* TAB: CALCUL */}
        {/* ============================================ */}

        {activeTab === 'calcul' && (
          <div className="space-y-8">

            {/* SECTION 1 : Type de cession */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Type de cession</h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { value: 'fonds' as const, label: 'Fonds de commerce', icon: Building },
                  { value: 'entreprise_individuelle' as const, label: 'Entreprise individuelle', icon: Briefcase },
                  { value: 'parts_sociales' as const, label: 'Parts sociales', icon: Users },
                  { value: 'immeuble_pro' as const, label: 'Immeuble professionnel', icon: Building },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, typeCession: type.value })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.typeCession === type.value
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <type.icon className={`w-7 h-7 mx-auto mb-2 ${formData.typeCession === type.value ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <p className="text-sm font-medium">{type.label}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statut juridique</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, statut: 'ei' })}
                      className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.statut === 'ei'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Entreprise individuelle
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, statut: 'societe' })}
                      className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.statut === 'societe'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Societe (SARL, SAS...)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'activite</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'ventes' as const, label: 'Ventes / Hebergement' },
                      { value: 'services' as const, label: 'Services' },
                      { value: 'liberale' as const, label: 'Liberale' },
                    ].map((act) => (
                      <button
                        key={act.value}
                        onClick={() => setFormData({ ...formData, typeActivite: act.value })}
                        className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.typeActivite === act.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2 : Montants */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Euro className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Montants de la cession</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix de cession *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.prixCession}
                      onChange={(e) => setFormData({ ...formData, prixCession: formatMontantInput(e.target.value) })}
                      placeholder="500 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">EUR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix / Valeur d'acquisition *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.prixAcquisition}
                      onChange={(e) => setFormData({ ...formData, prixAcquisition: formatMontantInput(e.target.value) })}
                      placeholder="200 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">EUR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amortissements deduits
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.amortissements}
                      onChange={(e) => setFormData({ ...formData, amortissements: formatMontantInput(e.target.value) })}
                      placeholder="50 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">EUR</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Genere de la PV court terme</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duree de detention (annees)
                  </label>
                  <input
                    type="number"
                    value={formData.dureeDetention}
                    onChange={(e) => setFormData({ ...formData, dureeDetention: e.target.value })}
                    placeholder="10"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CA moyen 2 dernieres annees
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.caMoyen}
                      onChange={(e) => setFormData({ ...formData, caMoyen: formatMontantInput(e.target.value) })}
                      placeholder="180 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">EUR</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Seuils : {formData.typeActivite === 'ventes' ? '250 000 / 350 000 EUR' : '90 000 / 126 000 EUR'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de salaries
                  </label>
                  <input
                    type="number"
                    value={formData.nombreSalaries}
                    onChange={(e) => setFormData({ ...formData, nombreSalaries: e.target.value })}
                    placeholder="5"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3 : Fiscalite */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Percent className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Situation fiscale</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tranche marginale d'imposition (TMI)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {TMI_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, tmi: opt.value as FormData['tmi'] })}
                        className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          formData.tmi === opt.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total bilan (si societe)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.totalBilan}
                      onChange={(e) => setFormData({ ...formData, totalBilan: formatMontantInput(e.target.value) })}
                      placeholder="1 000 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">EUR</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Depart a la retraite ?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData({ ...formData, departRetraite: true })}
                        className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                          formData.departRetraite
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, departRetraite: false })}
                        className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                          !formData.departRetraite
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Option bareme progressif (PV LT) ?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData({ ...formData, optionBareme: true })}
                        className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                          formData.optionBareme
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, optionBareme: false })}
                        className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                          !formData.optionBareme
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOUTONS ACTION */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCalculer}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Calculator className="w-6 h-6" />
                Calculer la plus-value
              </button>
              <button
                onClick={reinitialiser}
                className="px-8 py-4 bg-gray-200 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-300 transition-all"
              >
                Reinitialiser
              </button>
            </div>

            {/* RESULTATS */}
            {results && results.plusValueBrute > 0 && (
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

                {/* Resultats principaux */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Resultats du calcul</h2>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-xs font-medium text-indigo-600 mb-1">Plus-value brute</p>
                      <p className="text-xl font-bold text-gray-900">{formatEuros(results.plusValueBrute)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-medium text-amber-600 mb-1">PV Court Terme</p>
                      <p className="text-xl font-bold text-gray-900">{formatEuros(results.pvCourtTerme)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 mb-1">PV Long Terme</p>
                      <p className="text-xl font-bold text-gray-900">{formatEuros(results.pvLongTerme)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <p className="text-xs font-medium text-green-600 mb-1">Net de cession</p>
                      <p className="text-xl font-bold text-green-700">{formatEuros(results.netDeCession)}</p>
                    </div>
                  </div>

                  {/* Detail imposition */}
                  <div className="border-2 border-gray-100 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Detail de l'imposition</h3>
                    <div className="space-y-3">
                      {results.pvNetteImposableCT > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">PV CT nette imposable</span>
                          <span className="font-semibold">{formatEuros(results.pvNetteImposableCT)}</span>
                        </div>
                      )}
                      {results.impotCT > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 ml-4">IR sur PV CT (TMI {formData.tmi}%)</span>
                          <span className="font-semibold text-red-600">{formatEuros(results.impotCT)}</span>
                        </div>
                      )}
                      {results.cotisationsSocialesCT > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 ml-4">Cotisations sociales CT (~42.5%)</span>
                          <span className="font-semibold text-red-600">{formatEuros(results.cotisationsSocialesCT)}</span>
                        </div>
                      )}
                      {results.pvNetteImposableLT > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">PV LT nette imposable</span>
                          <span className="font-semibold">{formatEuros(results.pvNetteImposableLT)}</span>
                        </div>
                      )}
                      {results.impotLT > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 ml-4">IR sur PV LT ({formData.optionBareme ? `bareme ${formData.tmi}%` : 'flat tax 12.8%'})</span>
                          <span className="font-semibold text-red-600">{formatEuros(results.impotLT)}</span>
                        </div>
                      )}
                      {results.psLT > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 ml-4">Prelevements sociaux LT (18,6%)</span>
                          <span className="font-semibold text-red-600">{formatEuros(results.psLT)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg px-4 mt-2">
                        <span className="font-bold text-gray-900">Total fiscalite</span>
                        <span className="font-bold text-indigo-700 text-lg">{formatEuros(results.totalFiscalite)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Regime optimal */}
                  {results.meilleurRegime && (
                    <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-green-800 text-lg">Regime d'exoneration optimal</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-green-700 font-medium">{results.meilleurRegime.nom}</p>
                          <p className="text-xs text-green-600">{results.meilleurRegime.article}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700">Taux d'exoneration</p>
                          <p className="font-bold text-green-800">{formatPourcent(results.meilleurRegime.tauxExoneration)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700">Economie estimee</p>
                          <p className="font-bold text-green-800">{formatEuros(results.meilleurRegime.economie)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar chart: PV decomposition */}
                  {graphiquePVDecomposition.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900">Decomposition de la plus-value</h3>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={graphiquePVDecomposition}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value: number) => formatEuros(value)} />
                            <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Pie chart: Fiscalite */}
                  {graphiqueFiscalite.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900">Repartition de la fiscalite</h3>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={graphiqueFiscalite}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }: Record<string, unknown>) => `${String(name)} (${(Number(percent || 0) * 100).toFixed(0)}%)`}
                            >
                              {graphiqueFiscalite.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatEuros(value)} />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {results.suggestions.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-amber-900">Recommandations et optimisations</h3>
                    </div>
                    <div className="space-y-2">
                      {results.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-amber-100">
                          <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resultat : moins-value */}
            {results && results.plusValueBrute <= 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Aucune plus-value</h3>
                <p className="text-blue-700">
                  La cession degage une moins-value de {formatEuros(Math.abs(results.plusValueBrute))}.
                  Aucune imposition n'est due sur cette operation.
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  La moins-value professionnelle peut s'imputer sur les benefices.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: EXONERATIONS */}
        {/* ============================================ */}

        {activeTab === 'exonerations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Regimes d'exoneration</h2>
                  <p className="text-sm text-gray-500">Eligibilite automatique selon vos donnees</p>
                </div>
              </div>

              {!results ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Effectuez d'abord un calcul dans l'onglet Calcul</p>
                  <p className="text-sm text-gray-400 mt-1">Les regimes seront analyses automatiquement</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.exonerations.map((exo, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border-2 p-6 transition-all ${
                        exo.eligible
                          ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            exo.eligible ? 'bg-green-600' : 'bg-gray-400'
                          }`}>
                            {exo.eligible ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{exo.nom}</h3>
                            <p className="text-sm text-gray-500">{exo.article}</p>
                          </div>
                        </div>
                        {exo.eligible && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-700">Economie estimee</p>
                            <p className="text-lg font-bold text-green-800">{formatEuros(exo.economie)}</p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{exo.description}</p>

                      {/* Conditions checklist */}
                      <div className="space-y-2">
                        {exo.conditions.map((cond, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              exo.conditionsRemplies[cIdx] ? 'bg-green-500' : 'bg-red-400'
                            }`}>
                              {exo.conditionsRemplies[cIdx] ? (
                                <CheckCircle className="w-3 h-3 text-white" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className={`text-sm ${exo.conditionsRemplies[cIdx] ? 'text-green-800' : 'text-red-700'}`}>
                              {cond}
                            </span>
                          </div>
                        ))}
                      </div>

                      {exo.eligible && exo.montantExonere > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Taux</p>
                            <p className="font-bold text-gray-900">{formatPourcent(exo.tauxExoneration)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Montant exonere</p>
                            <p className="font-bold text-gray-900">{formatEuros(exo.montantExonere)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Economie</p>
                            <p className="font-bold text-green-700">{formatEuros(exo.economie)}</p>
                          </div>
                        </div>
                      )}

                      {results.meilleurRegime?.article === exo.article && exo.eligible && (
                        <div className="mt-4 bg-white rounded-lg p-3 border border-green-300 flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-bold text-green-700">Regime le plus avantageux</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cumul des regimes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Cumul des regimes d'exoneration</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700"></th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700 text-xs">151 septies</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700 text-xs">238 quindecies</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700 text-xs">151 septies A</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700 text-xs">151 septies B</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700 text-xs">150-0 D ter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { nom: '151 septies', cumuls: ['—', 'Non', 'Oui', 'Oui', 'Non'] },
                      { nom: '238 quindecies', cumuls: ['Non', '—', 'Oui', 'Oui', 'Non'] },
                      { nom: '151 septies A', cumuls: ['Oui', 'Oui', '—', 'Oui', 'Non'] },
                      { nom: '151 septies B', cumuls: ['Oui', 'Oui', 'Oui', '—', 'Non'] },
                      { nom: '150-0 D ter', cumuls: ['Non', 'Non', 'Non', 'Non', '—'] },
                    ].map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium text-gray-900 text-xs">{row.nom}</td>
                        {row.cumuls.map((cell, cIdx) => (
                          <td key={cIdx} className="text-center py-2 px-2">
                            <span className={`text-xs font-semibold ${
                              cell === 'Oui' ? 'text-green-600' :
                              cell === 'Non' ? 'text-red-500' : 'text-gray-400'
                            }`}>
                              {cell}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: SIMULATION */}
        {/* ============================================ */}

        {activeTab === 'simulation' && (
          <div className="space-y-6">

            {/* Evolution selon duree de detention */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Evolution selon la duree de detention</h2>
                  <p className="text-sm text-gray-500">Impact du temps sur l'exoneration (art. 151 septies B)</p>
                </div>
              </div>

              {graphiqueEvolutionDetention.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphiqueEvolutionDetention}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="annee" label={{ value: 'Annees de detention', position: 'insideBottom', offset: -5 }} />
                      <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatEuros(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="fiscalite" name="Fiscalite totale" stroke="#6366f1" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="exoneration" name="Montant exonere" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="pvTaxable" name="PV taxable" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Renseignez les prix de cession et d'acquisition</p>
                  <p className="text-sm text-gray-400 mt-1">Le graphique s'affichera automatiquement</p>
                </div>
              )}
            </div>

            {/* Comparaison de scenarios */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Comparaison de scenarios</h2>
                  <p className="text-sm text-gray-500">Impact du depart a la retraite, du bareme progressif, de la duree</p>
                </div>
              </div>

              {graphiqueComparaisonScenarios.length > 0 ? (
                <>
                  <div className="h-72 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={graphiqueComparaisonScenarios}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nom" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatEuros(value)} />
                        <Legend />
                        <Bar dataKey="fiscalite" name="Fiscalite" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="net" name="Net de cession" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {graphiqueComparaisonScenarios.map((scenario, idx) => (
                      <div key={idx} className={`rounded-xl p-4 border-2 ${
                        idx === 0 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'
                      }`}>
                        <p className="text-sm font-bold text-gray-900 mb-2">{scenario.nom}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Fiscalite</span>
                            <span className="text-xs font-bold text-red-600">{formatEuros(scenario.fiscalite)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Net</span>
                            <span className="text-xs font-bold text-green-600">{formatEuros(scenario.net)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Scale className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Effectuez d'abord un calcul dans l'onglet Calcul</p>
                </div>
              )}
            </div>

            {/* Passage CT vers LT */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Impact CT vers LT</h2>
                  <p className="text-sm text-gray-500">Interet d'attendre le passage en long terme (2 ans)</p>
                </div>
              </div>

              {results && results.plusValueBrute > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
                    <h4 className="font-bold text-amber-900 mb-3">Cession avant 2 ans (tout CT)</h4>
                    <div className="space-y-2">
                      {(() => {
                        const simCT = calculerResultats({ ...formData, dureeDetention: '1' });
                        if (!simCT) return null;
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">PV CT (100%)</span>
                              <span className="font-semibold">{formatEuros(simCT.pvCourtTerme)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">IR (TMI {formData.tmi}%)</span>
                              <span className="font-semibold text-red-600">{formatEuros(simCT.impotCT)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Cotisations (~42.5%)</span>
                              <span className="font-semibold text-red-600">{formatEuros(simCT.cotisationsSocialesCT)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-amber-200">
                              <span className="font-bold">Total</span>
                              <span className="font-bold text-red-700">{formatEuros(simCT.totalFiscalite)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
                    <h4 className="font-bold text-green-900 mb-3">Cession apres 2 ans (LT possible)</h4>
                    <div className="space-y-2">
                      {(() => {
                        const simLT = calculerResultats({ ...formData, dureeDetention: '3' });
                        if (!simLT) return null;
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">PV CT (amortissements)</span>
                              <span className="font-semibold">{formatEuros(simLT.pvCourtTerme)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">PV LT</span>
                              <span className="font-semibold">{formatEuros(simLT.pvLongTerme)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Flat tax LT (31,4%)</span>
                              <span className="font-semibold text-red-600">{formatEuros(simLT.impotLT + simLT.psLT)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-200">
                              <span className="font-bold">Total</span>
                              <span className="font-bold text-green-700">{formatEuros(simLT.totalFiscalite)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const simCT = calculerResultats({ ...formData, dureeDetention: '1' });
                    const simLT = calculerResultats({ ...formData, dureeDetention: '3' });
                    if (!simCT || !simLT) return null;
                    const economie = simCT.totalFiscalite - simLT.totalFiscalite;
                    if (economie <= 0) return null;
                    return (
                      <div className="col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 flex items-center gap-3">
                        <Lightbulb className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                        <p className="text-sm text-indigo-800">
                          <strong>Economie potentielle en attendant 2 ans :</strong> {formatEuros(economie)} de fiscalite en moins.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Effectuez d'abord un calcul dans l'onglet Calcul</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: FAQ */}
        {/* ============================================ */}

        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Questions frequentes</h2>
                  <p className="text-sm text-gray-500">Plus-values professionnelles, exonerations et cas pratiques</p>
                </div>
              </div>

              <FAQSection />
            </div>

            {/* Disclaimer */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <h3 className="font-bold text-amber-900">Avertissement important</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Les regles fiscales en matiere de plus-values professionnelles sont <strong>complexes et evoluent regulierement</strong>.
                    Ce simulateur est fourni a titre indicatif et ne saurait se substituer a l'avis d'un professionnel qualifie.
                  </p>

                  <div className="bg-white rounded-lg p-4 border-2 border-amber-300 mt-4">
                    <p className="font-bold text-amber-900 mb-2">Consultation professionnelle recommandee :</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">-</span>
                        <span className="text-sm text-amber-800"><strong>Expert-comptable</strong> : pour le calcul precis et les declarations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">-</span>
                        <span className="text-sm text-amber-800"><strong>Avocat fiscaliste</strong> : pour les regimes d'exoneration et l'optimisation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">-</span>
                        <span className="text-sm text-amber-800"><strong>Notaire</strong> : pour la cession d'immeuble ou de fonds de commerce</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">-</span>
                        <span className="text-sm text-amber-800"><strong>Conseiller en gestion de patrimoine</strong> : pour une strategie globale</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm font-semibold text-amber-900">
                    <strong>NotariaPrime.fr</strong> decline toute responsabilite en cas d'utilisation des informations fournies
                    sans validation par un professionnel qualifie.
                  </p>

                  <div className="bg-amber-100 rounded-lg p-3 mt-2 border border-amber-400">
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <strong>Sources officielles :</strong> Code General des Impots (CGI), Bulletin Officiel des Finances Publiques (BOFiP),
                      Service-Public.fr, Legifrance.gouv.fr, Impots.gouv.fr
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function PlusValueProPage() {
  return (
    <MainLayout showFeedback={false}>
      <PlusValueProContent />
    </MainLayout>
  );
}
