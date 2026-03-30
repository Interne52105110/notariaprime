// ============================================
// FILE: src/app/lmnp/page.tsx
// DESCRIPTION: Simulateur LMNP / LMP - Location Meublée
// VERSION: 1.0 - Calcul complet Micro-BIC vs Réel
// ============================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  Building2,
  TrendingUp,
  Calculator,
  PieChart as PieChartIcon,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Landmark,
  Percent,
  Euro,
  Calendar,
  Shield,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Clock,
  Award,
  Save,
  FolderOpen,
  Trash2,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

// Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

type TypeLocation = 'classique' | 'tourisme_classe' | 'tourisme_non_classe';
type OngletActif = 'simulation' | 'amortissement' | 'plusvalue' | 'faq';

interface FormData {
  typeLocation: TypeLocation;
  zoneTendue: boolean;
  valeurBien: string;
  quotePartTerrain: string;
  valeurMobilier: string;
  loyerMensuel: string;
  tauxOccupation: string;
  assurance: string;
  taxeFonciere: string;
  copropriete: string;
  gestion: string;
  entretien: string;
  cfe: string;
  interetsEmprunt: string;
  autresRevenus: string;
  tmi: number;
}

interface ComposantAmortissement {
  nom: string;
  pourcentage: number;
  duree: number;
  valeur: number;
  amortissementAnnuel: number;
}

interface ResultatComparaison {
  recettesBrutes: number;
  // Micro-BIC
  microAbattement: number;
  microResultatFiscal: number;
  microIR: number;
  microPS: number;
  microTotalImpots: number;
  microCashFlow: number;
  microTauxAbattement: number;
  microPlafond: number;
  microEligible: boolean;
  // Réel
  reelCharges: number;
  reelAmortissements: number;
  reelTotalDeductions: number;
  reelResultatFiscal: number;
  reelIR: number;
  reelPS: number;
  reelTotalImpots: number;
  reelCashFlow: number;
  // Status
  isLMP: boolean;
  economieReel: number;
  meilleurRegime: 'micro' | 'reel';
}

interface DonneePlusValue {
  annee: number;
  prixRevente: number;
  // LMNP
  lmnpAbattementIR: number;
  lmnpAbattementPS: number;
  lmnpPlusValueImposableIR: number;
  lmnpPlusValueImposablePS: number;
  lmnpImpotIR: number;
  lmnpImpotPS: number;
  lmnpTotalImpot: number;
  lmnpNetVendeur: number;
  // LMP
  lmpExonere: boolean;
  lmpPlusValueCT: number;
  lmpPlusValueLT: number;
  lmpImpotCT: number;
  lmpImpotLT: number;
  lmpTotalImpot: number;
  lmpNetVendeur: number;
}

// ============================================
// CONSTANTES
// ============================================

const PRELEVEMENTS_SOCIAUX = 0.186; // 18.6% LFSS 2026 (BIC meublé = revenus du patrimoine)
const PS_PLUS_VALUE_IMMO = 0.172; // 17.2% pour PV immobilières des particuliers (non impactées LFSS 2026)
const COTISATIONS_SSI = 0.40;

const BAREME_IR_2025 = [
  { min: 0, max: 11294, taux: 0 },
  { min: 11294, max: 28797, taux: 0.11 },
  { min: 28797, max: 82341, taux: 0.30 },
  { min: 82341, max: 177106, taux: 0.41 },
  { min: 177106, max: Infinity, taux: 0.45 }
];

const COMPOSANTS_AMORTISSEMENT = [
  { nom: 'Gros oeuvre', pourcentage: 0.50, duree: 50 },
  { nom: 'Toiture', pourcentage: 0.10, duree: 25 },
  { nom: 'Installations electriques', pourcentage: 0.10, duree: 25 },
  { nom: 'Agencements interieurs', pourcentage: 0.15, duree: 15 },
  { nom: 'Mobilier', pourcentage: 0.15, duree: 10 }
];

// Abattements plus-value des particuliers (LMNP)
const ABATTEMENTS_PV_IR = [
  { debut: 0, fin: 5, taux: 0 },
  { debut: 6, fin: 21, taux: 0.06 },
  { debut: 22, fin: 22, taux: 0.04 }
  // Exoneration totale a partir de 22 ans
];

const ABATTEMENTS_PV_PS = [
  { debut: 0, fin: 5, taux: 0 },
  { debut: 6, fin: 21, taux: 0.0165 },
  { debut: 22, fin: 22, taux: 0.018 },
  { debut: 23, fin: 30, taux: 0.09 }
  // Exoneration totale a partir de 30 ans
];

const COLORS_CHART = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff', '#818cf8'];

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

function formatEurosDecimal(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(montant);
}

function formatPourcent(valeur: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valeur / 100);
}

function formatMontantSaisie(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerAbattementMicroBIC(
  type: TypeLocation,
  zoneTendue: boolean
): { taux: number; plafond: number } {
  if (type === 'tourisme_classe') {
    return { taux: 0.71, plafond: 188700 };
  }
  if (type === 'tourisme_non_classe' && zoneTendue) {
    return { taux: 0.30, plafond: 15000 };
  }
  // Classique ou tourisme non classe hors zone tendue
  return { taux: 0.50, plafond: 77700 };
}

function calculerAmortissements(
  valeurBien: number,
  quotePartTerrain: number,
  valeurMobilier: number
): ComposantAmortissement[] {
  const valeurAmortissable = valeurBien * (1 - quotePartTerrain / 100);

  const composantsImmo = COMPOSANTS_AMORTISSEMENT.slice(0, 4).map(c => {
    const valeur = valeurAmortissable * c.pourcentage;
    return {
      nom: c.nom,
      pourcentage: c.pourcentage * 100,
      duree: c.duree,
      valeur,
      amortissementAnnuel: valeur / c.duree
    };
  });

  const composantMobilier = {
    nom: 'Mobilier',
    pourcentage: 100,
    duree: 10,
    valeur: valeurMobilier,
    amortissementAnnuel: valeurMobilier / 10
  };

  return [...composantsImmo, composantMobilier];
}

function calculerImpotTMI(resultatFiscal: number, tmi: number): number {
  if (resultatFiscal <= 0) return 0;
  return resultatFiscal * (tmi / 100);
}

function calculerAbattementPVParticuliers(anneeDetention: number): { abattementIR: number; abattementPS: number } {
  let abattementIR = 0;
  let abattementPS = 0;

  if (anneeDetention >= 22) {
    abattementIR = 1; // 100% exoneration IR
  } else if (anneeDetention >= 6) {
    abattementIR = (anneeDetention - 5) * 0.06;
    if (anneeDetention >= 22) abattementIR = 1;
  }

  if (anneeDetention >= 30) {
    abattementPS = 1; // 100% exoneration PS
  } else if (anneeDetention >= 23) {
    abattementPS = (16 * 0.0165) + (1 * 0.018) + ((anneeDetention - 22) * 0.09);
  } else if (anneeDetention >= 6) {
    const anneesTrancheBase = Math.min(anneeDetention, 21) - 5;
    abattementPS = anneesTrancheBase * 0.0165;
    if (anneeDetention >= 22) {
      abattementPS += 0.018;
    }
  }

  return {
    abattementIR: Math.min(abattementIR, 1),
    abattementPS: Math.min(abattementPS, 1)
  };
}

function calculerPlusValueLMNP(
  prixAchat: number,
  prixRevente: number,
  anneeDetention: number,
  tmi: number,
  totalAmortissementsDeduits: number = 0 // Réforme LF 2025 art. 84
): {
  abattementIR: number;
  abattementPS: number;
  pvImposableIR: number;
  pvImposablePS: number;
  impotIR: number;
  impotPS: number;
  total: number;
  pvBruteAvantReforme: number;
  pvBruteApresReforme: number;
  amortissementsReintegres: number;
} {
  // Réforme LF 2025 (art. 84) : réintégration des amortissements dans la PV
  // Le prix d'acquisition est minoré des amortissements déduits
  const prixAcquisitionCorrige = Math.max(0, prixAchat - totalAmortissementsDeduits);
  const plusValueBrute = Math.max(0, prixRevente - prixAcquisitionCorrige);
  const pvSansReforme = Math.max(0, prixRevente - prixAchat);

  if (plusValueBrute === 0) {
    return { abattementIR: 0, abattementPS: 0, pvImposableIR: 0, pvImposablePS: 0, impotIR: 0, impotPS: 0, total: 0, pvBruteAvantReforme: pvSansReforme, pvBruteApresReforme: 0, amortissementsReintegres: totalAmortissementsDeduits };
  }

  const { abattementIR, abattementPS } = calculerAbattementPVParticuliers(anneeDetention);

  const pvImposableIR = plusValueBrute * (1 - abattementIR);
  const pvImposablePS = plusValueBrute * (1 - abattementPS);

  const impotIR = pvImposableIR * 0.19; // Taux forfaitaire 19%
  const impotPS = pvImposablePS * PS_PLUS_VALUE_IMMO; // PV immobilière = 17.2% (non impactée LFSS 2026)

  // Surtaxe pour PV > 50 000
  let surtaxe = 0;
  if (pvImposableIR > 260000) surtaxe = pvImposableIR * 0.06;
  else if (pvImposableIR > 250000) surtaxe = pvImposableIR * 0.05;
  else if (pvImposableIR > 200000) surtaxe = pvImposableIR * 0.04;
  else if (pvImposableIR > 150000) surtaxe = pvImposableIR * 0.03;
  else if (pvImposableIR > 100000) surtaxe = pvImposableIR * 0.02;
  else if (pvImposableIR > 50000) surtaxe = pvImposableIR * 0.02;

  return {
    abattementIR: abattementIR * 100,
    abattementPS: abattementPS * 100,
    pvImposableIR,
    pvImposablePS,
    impotIR,
    impotPS,
    total: impotIR + impotPS + surtaxe,
    pvBruteAvantReforme: pvSansReforme,
    pvBruteApresReforme: plusValueBrute,
    amortissementsReintegres: totalAmortissementsDeduits
  };
}

function calculerPlusValueLMP(
  prixAchat: number,
  prixRevente: number,
  totalAmortissements: number,
  anneeDetention: number,
  recettesAnnuelles: number,
  tmi: number
): {
  exonere: boolean;
  pvCT: number;
  pvLT: number;
  impotCT: number;
  impotLT: number;
  total: number;
} {
  const plusValueBrute = Math.max(0, prixRevente - prixAchat);

  // Exoneration si CA < 90 000 et activite > 5 ans
  if (recettesAnnuelles < 90000 && anneeDetention >= 5) {
    return { exonere: true, pvCT: 0, pvLT: 0, impotCT: 0, impotLT: 0, total: 0 };
  }

  // PV court terme = amortissements deduits (repris)
  const pvCT = Math.min(totalAmortissements, plusValueBrute);
  // PV long terme = surplus
  const pvLT = Math.max(0, plusValueBrute - pvCT);

  const impotCT = pvCT * (tmi / 100) + pvCT * PRELEVEMENTS_SOCIAUX;
  // PV LT : 12.8% + 18.6% = 31.4% (LFSS 2026)
  const impotLT = pvLT * 0.128 + pvLT * PRELEVEMENTS_SOCIAUX;

  return {
    exonere: false,
    pvCT,
    pvLT,
    impotCT,
    impotLT,
    total: impotCT + impotLT
  };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function SimulateurLMNP() {
  const [activeTab, setActiveTab] = useState<OngletActif>('simulation');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [nomSimulation, setNomSimulation] = useState('');
  const [simulations, setSimulations] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    typeLocation: 'classique',
    zoneTendue: false,
    valeurBien: '250 000',
    quotePartTerrain: '20',
    valeurMobilier: '15 000',
    loyerMensuel: '900',
    tauxOccupation: '90',
    assurance: '400',
    taxeFonciere: '1 200',
    copropriete: '1 800',
    gestion: '600',
    entretien: '500',
    cfe: '300',
    interetsEmprunt: '3 000',
    autresRevenus: '40 000',
    tmi: 30
  });

  // ============================================
  // RESPONSIVE
  // ============================================

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // SAUVEGARDE / CHARGEMENT
  // ============================================

  const STORAGE_KEY = 'notariaprime-lmnp';

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
  // HANDLERS
  // ============================================

  const updateField = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFieldFormatted = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: formatMontantSaisie(value) }));
  };

  // ============================================
  // CALCULS PRINCIPAUX
  // ============================================

  const resultats = useMemo((): ResultatComparaison | null => {
    const valeurBien = parseNumber(formData.valeurBien);
    const valeurMobilier = parseNumber(formData.valeurMobilier);
    const loyerMensuel = parseNumber(formData.loyerMensuel);
    const tauxOccupation = parseNumber(formData.tauxOccupation) / 100;
    const autresRevenus = parseNumber(formData.autresRevenus);
    const quotePartTerrain = parseNumber(formData.quotePartTerrain);

    if (valeurBien <= 0 || loyerMensuel <= 0) return null;

    // Recettes annuelles
    const recettesBrutes = loyerMensuel * 12 * tauxOccupation;

    // Determination statut LMP / LMNP
    const isLMP = recettesBrutes > 23000 && recettesBrutes > autresRevenus;

    // --- MICRO-BIC ---
    const { taux: tauxAbattement, plafond: plafondMicro } = calculerAbattementMicroBIC(
      formData.typeLocation,
      formData.zoneTendue
    );
    const microEligible = recettesBrutes <= plafondMicro;
    const microAbattement = recettesBrutes * tauxAbattement;
    const microResultatFiscal = recettesBrutes - microAbattement;
    const microIR = calculerImpotTMI(microResultatFiscal, formData.tmi);
    const microPS = isLMP
      ? microResultatFiscal * COTISATIONS_SSI
      : microResultatFiscal * PRELEVEMENTS_SOCIAUX;
    const microTotalImpots = microIR + microPS;
    const microCashFlow = recettesBrutes - microTotalImpots;

    // --- REGIME REEL ---
    const charges =
      parseNumber(formData.assurance) +
      parseNumber(formData.taxeFonciere) +
      parseNumber(formData.copropriete) +
      parseNumber(formData.gestion) +
      parseNumber(formData.entretien) +
      parseNumber(formData.cfe) +
      parseNumber(formData.interetsEmprunt);

    const composants = calculerAmortissements(valeurBien, quotePartTerrain, valeurMobilier);
    const totalAmortissements = composants.reduce((acc, c) => acc + c.amortissementAnnuel, 0);

    const reelTotalDeductions = charges + totalAmortissements;
    // En reel, amortissement ne peut pas creer de deficit (plafonne au resultat avant amort.)
    const resultatAvantAmort = recettesBrutes - charges;
    const amortissementDeductible = Math.min(totalAmortissements, Math.max(0, resultatAvantAmort));
    const reelResultatFiscal = Math.max(0, recettesBrutes - charges - amortissementDeductible);

    const reelIR = calculerImpotTMI(reelResultatFiscal, formData.tmi);
    const reelPS = isLMP
      ? reelResultatFiscal * COTISATIONS_SSI
      : reelResultatFiscal * PRELEVEMENTS_SOCIAUX;
    const reelTotalImpots = reelIR + reelPS;
    const reelCashFlow = recettesBrutes - charges - reelTotalImpots;

    const economieReel = microTotalImpots - reelTotalImpots;
    const meilleurRegime = reelTotalImpots < microTotalImpots ? 'reel' : 'micro';

    return {
      recettesBrutes,
      microAbattement,
      microResultatFiscal,
      microIR,
      microPS,
      microTotalImpots,
      microCashFlow,
      microTauxAbattement: tauxAbattement * 100,
      microPlafond: plafondMicro,
      microEligible,
      reelCharges: charges,
      reelAmortissements: totalAmortissements,
      reelTotalDeductions,
      reelResultatFiscal,
      reelIR,
      reelPS,
      reelTotalImpots,
      reelCashFlow,
      isLMP,
      economieReel,
      meilleurRegime
    };
  }, [formData]);

  // ============================================
  // EXPORT PDF
  // ============================================

  const exporterPDF = () => {
    if (!resultats) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Simulateur LMNP / LMP', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Statut : ${resultats.isLMP ? 'LMP (Loueur Meuble Professionnel)' : 'LMNP (Loueur Meuble Non Professionnel)'}`, 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Micro-BIC', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Recettes brutes : ${resultats.recettesBrutes.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Abattement (${resultats.microTauxAbattement}%) : ${resultats.microAbattement.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Resultat fiscal : ${resultats.microResultatFiscal.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Total impots : ${resultats.microTotalImpots.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Cash-flow net : ${resultats.microCashFlow.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Regime Reel', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Charges deductibles : ${resultats.reelCharges.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Amortissements : ${resultats.reelAmortissements.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Resultat fiscal : ${resultats.reelResultatFiscal.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Total impots : ${resultats.reelTotalImpots.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Cash-flow net : ${resultats.reelCashFlow.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommandation', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Meilleur regime : ${resultats.meilleurRegime === 'micro' ? 'Micro-BIC' : 'Regime Reel'}`, 20, y);
    y += 7;
    doc.text(`Economie annuelle : ${Math.abs(resultats.economieReel).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'Avertissement : cette simulation est fournie a titre informatif et ne constitue pas un conseil fiscal. Consultez un professionnel avant toute decision.';
    const lines = doc.splitTextToSize(disclaimer, 170);
    lines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`lmnp-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ============================================
  // DONNEES AMORTISSEMENT
  // ============================================

  const composantsAmort = useMemo(() => {
    const valeurBien = parseNumber(formData.valeurBien);
    const quotePartTerrain = parseNumber(formData.quotePartTerrain);
    const valeurMobilier = parseNumber(formData.valeurMobilier);
    return calculerAmortissements(valeurBien, quotePartTerrain, valeurMobilier);
  }, [formData.valeurBien, formData.quotePartTerrain, formData.valeurMobilier]);

  const tableauAmortissement = useMemo(() => {
    const data: { annee: number; amortissement: number; cumul: number; valeurResiduelle: number }[] = [];
    const totalValeur = composantsAmort.reduce((acc, c) => acc + c.valeur, 0);
    let cumul = 0;

    for (let annee = 1; annee <= 50; annee++) {
      let amortAnnuel = 0;
      composantsAmort.forEach(c => {
        if (annee <= c.duree) {
          amortAnnuel += c.amortissementAnnuel;
        }
      });
      cumul += amortAnnuel;
      if (amortAnnuel > 0) {
        data.push({
          annee,
          amortissement: amortAnnuel,
          cumul,
          valeurResiduelle: Math.max(0, totalValeur - cumul)
        });
      }
    }
    return data;
  }, [composantsAmort]);

  // ============================================
  // DONNEES PLUS-VALUE
  // ============================================

  const donneesPlusValue = useMemo((): DonneePlusValue[] => {
    const prixAchat = parseNumber(formData.valeurBien);
    const recettesAnnuelles = resultats?.recettesBrutes || 0;
    const totalAmortCumul = (annee: number) => {
      let cumul = 0;
      composantsAmort.forEach(c => {
        cumul += c.amortissementAnnuel * Math.min(annee, c.duree);
      });
      return cumul;
    };

    const data: DonneePlusValue[] = [];
    const tauxValoAnnuel = 0.015; // +1.5%/an

    for (let annee = 1; annee <= 30; annee++) {
      const prixRevente = prixAchat * Math.pow(1 + tauxValoAnnuel, annee);

      const amortCumul = totalAmortCumul(annee);
      const lmnpPV = calculerPlusValueLMNP(prixAchat, prixRevente, annee, formData.tmi, amortCumul);
      const lmpPV = calculerPlusValueLMP(
        prixAchat, prixRevente, totalAmortCumul(annee), annee, recettesAnnuelles, formData.tmi
      );

      data.push({
        annee,
        prixRevente,
        lmnpAbattementIR: lmnpPV.abattementIR,
        lmnpAbattementPS: lmnpPV.abattementPS,
        lmnpPlusValueImposableIR: lmnpPV.pvImposableIR,
        lmnpPlusValueImposablePS: lmnpPV.pvImposablePS,
        lmnpImpotIR: lmnpPV.impotIR,
        lmnpImpotPS: lmnpPV.impotPS,
        lmnpTotalImpot: lmnpPV.total,
        lmnpNetVendeur: prixRevente - lmnpPV.total,
        lmpExonere: lmpPV.exonere,
        lmpPlusValueCT: lmpPV.pvCT,
        lmpPlusValueLT: lmpPV.pvLT,
        lmpImpotCT: lmpPV.impotCT,
        lmpImpotLT: lmpPV.impotLT,
        lmpTotalImpot: lmpPV.total,
        lmpNetVendeur: prixRevente - lmpPV.total
      });
    }
    return data;
  }, [formData.valeurBien, formData.tmi, resultats?.recettesBrutes, composantsAmort]);

  // ============================================
  // DONNEES GRAPHIQUES
  // ============================================

  const donneesBarComparaison = useMemo(() => {
    if (!resultats) return [];
    return [
      { name: 'Micro-BIC', impots: resultats.microTotalImpots, cashFlow: resultats.microCashFlow },
      { name: 'Reel', impots: resultats.reelTotalImpots, cashFlow: resultats.reelCashFlow }
    ];
  }, [resultats]);

  const donneesCashFlow20Ans = useMemo(() => {
    if (!resultats) return [];
    const data: { annee: string; microBIC: number; reel: number }[] = [];
    for (let i = 1; i <= 20; i++) {
      data.push({
        annee: `An ${i}`,
        microBIC: resultats.microCashFlow * i,
        reel: resultats.reelCashFlow * i
      });
    }
    return data;
  }, [resultats]);

  const donneesRepartitionCharges = useMemo(() => {
    const assurance = parseNumber(formData.assurance);
    const taxeFonciere = parseNumber(formData.taxeFonciere);
    const copropriete = parseNumber(formData.copropriete);
    const gestion = parseNumber(formData.gestion);
    const entretien = parseNumber(formData.entretien);
    const cfe = parseNumber(formData.cfe);
    const interets = parseNumber(formData.interetsEmprunt);
    const totalAmort = composantsAmort.reduce((acc, c) => acc + c.amortissementAnnuel, 0);

    return [
      { name: 'Assurance', value: assurance },
      { name: 'Taxe fonciere', value: taxeFonciere },
      { name: 'Copropriete', value: copropriete },
      { name: 'Gestion', value: gestion },
      { name: 'Entretien', value: entretien },
      { name: 'CFE', value: cfe },
      { name: 'Interets emprunt', value: interets },
      { name: 'Amortissements', value: totalAmort }
    ].filter(d => d.value > 0);
  }, [formData, composantsAmort]);

  const donneesPVGraphique = useMemo(() => {
    return donneesPlusValue
      .filter(d => d.annee % 5 === 0 || d.annee === 1 || d.annee === 22 || d.annee === 30)
      .map(d => ({
        annee: `An ${d.annee}`,
        lmnpImpot: d.lmnpTotalImpot,
        lmpImpot: d.lmpTotalImpot
      }));
  }, [donneesPlusValue]);

  // ============================================
  // FAQ DATA
  // ============================================

  const faqData = [
    {
      q: "Quelle difference entre LMNP et LMP ?",
      r: "Le statut de Loueur Meuble Professionnel (LMP) s'applique lorsque les recettes locatives depassent 23 000 euros par an ET sont superieures aux autres revenus d'activite du foyer fiscal (salaires, BIC, BNC, etc.). Dans tous les autres cas, le loueur est considere comme Non Professionnel (LMNP). Les consequences sont majeures : en LMP, les deficits s'imputent sur le revenu global sans limitation, les plus-values relevent du regime professionnel avec exoneration possible apres 5 ans, mais les cotisations SSI s'appliquent (environ 40% du benefice). En LMNP, les deficits ne sont reportables que sur les revenus de meme nature pendant 10 ans, les plus-values suivent le regime des particuliers avec exoneration progressive (22 ans IR, 30 ans PS), et les prelevements sociaux de 18,6% s'appliquent (hausse CSG LFSS 2026)."
    },
    {
      q: "Comment fonctionne l'amortissement en LMNP ?",
      r: "L'amortissement est le principal avantage du regime reel en LMNP. Il permet de deduire chaque annee une fraction de la valeur du bien et du mobilier. Le bien est decompose en composants : gros oeuvre (50% sur 50 ans), toiture (10% sur 25 ans), installations electriques (10% sur 25 ans), agencements interieurs (15% sur 15 ans). Le mobilier s'amortit generalement sur 10 ans. Attention : le terrain n'est pas amortissable (en general 20% de la valeur). Regle cruciale : l'amortissement ne peut pas creer de deficit, il est plafonne au resultat avant amortissement. L'excedent d'amortissement est reportable sans limitation de duree, ce qui constitue un avantage considerable par rapport au regime foncier classique."
    },
    {
      q: "Micro-BIC ou reel : comment choisir ?",
      r: "Le choix depend du montant de vos charges reelles comparees a l'abattement forfaitaire du micro-BIC. En micro-BIC classique, l'abattement est de 50% (71% pour le meuble de tourisme classe). Si vos charges reelles + amortissements depassent ce pourcentage de vos recettes, le reel est plus avantageux. En pratique, le regime reel est quasi systematiquement plus favorable grace a l'amortissement du bien, surtout les premieres annees ou les interets d'emprunt sont eleves. Le micro-BIC est interessant pour sa simplicite (pas de comptabilite) et quand le bien est entierement paye avec peu de charges. Pour un bien finance a credit, le reel est presque toujours gagnant."
    },
    {
      q: "Quelles charges sont deductibles en meuble ?",
      r: "En regime reel, les charges deductibles sont nombreuses : interets d'emprunt et frais de dossier bancaire, assurance emprunteur et PNO (proprietaire non occupant), taxe fonciere (hors ordures menageres si recuperee sur le locataire), charges de copropriete non recuperables, frais de gestion (agence, comptable), travaux d'entretien et de reparation, CFE (Cotisation Fonciere des Entreprises), frais de deplacement lies a la gestion, frais de publicite pour la location, honoraires du centre de gestion agree (CGA), eau, electricite, internet si charges par le proprietaire. Les travaux d'amelioration sont amortissables s'ils augmentent la valeur du bien."
    },
    {
      q: "Qu'est-ce que le deficit en LMNP ?",
      r: "En LMNP, un deficit apparait quand les charges deductibles (hors amortissements) depassent les recettes. Ce deficit est reportable uniquement sur les revenus de location meublee non professionnelle pendant 10 ans. Il ne peut pas s'imputer sur les salaires ou autres revenus. En revanche, en LMP, le deficit est imputable sur le revenu global sans limitation de montant, ce qui est beaucoup plus avantageux pour les contribuables a TMI elevee. L'excedent d'amortissement non deduit (car plafonne au resultat avant amortissement) est quant a lui reportable sans limitation de duree, tant en LMNP qu'en LMP."
    },
    {
      q: "LMNP et plus-value : comment ca marche ?",
      r: "En LMNP, la plus-value de cession releve du regime des plus-values des particuliers. La plus-value brute est la difference entre le prix de vente et le prix d'acquisition (prix d'achat + frais d'acquisition). Elle beneficie d'un abattement progressif pour duree de detention : 6% par an de la 6e a la 21e annee, puis 4% la 22e annee pour l'IR (exoneration totale apres 22 ans). Pour les prelevements sociaux : 1,65% par an de la 6e a la 21e annee, 1,60% la 22e annee, puis 9% par an de la 23e a la 30e annee (exoneration totale apres 30 ans). Le taux d'imposition est de 19% pour l'IR + 17,2% de PS sur la partie imposable (les PV immobilieres ne sont pas impactees par la hausse LFSS 2026). ATTENTION : depuis la loi de finances 2025 (art. 84), les amortissements deduits en LMNP sont desormais reintegres dans le calcul de la plus-value, ce qui augmente sensiblement la base imposable."
    },
    {
      q: "Faut-il s'inscrire au greffe pour le LMNP ?",
      r: "Oui, tout loueur en meuble doit s'immatriculer aupres du Guichet Unique de l'INPI (anciennement greffe du tribunal de commerce) dans les 15 jours suivant le debut de l'activite. Cette formalite est obligatoire et gratuite. Vous recevrez un numero SIRET qui sera necessaire pour votre declaration fiscale. Vous devrez egalement choisir votre regime fiscal (micro-BIC ou reel) et votre regime de TVA (franchise en base dans la plupart des cas). L'option pour le regime reel doit etre exercee avant le 1er fevrier de l'annee au titre de laquelle vous souhaitez en beneficier, ou lors de votre immatriculation. L'adhesion a un CGA (Centre de Gestion Agree) ou a un OGA est recommandee pour eviter la majoration de 10% du benefice en reel."
    },
    {
      q: "LMNP et cotisations sociales : quoi de neuf en 2025 ?",
      r: "Depuis 2021, les LMNP dont les recettes depassent 23 000 euros par an sont soumis aux cotisations sociales SSI (ex-RSI) s'ils remplissent les conditions du LMP. En LMNP strict (recettes < 23 000 euros ou < aux autres revenus), les prelevements sociaux s'appliquent sur le benefice. Depuis le 1er janvier 2026 (LFSS 2026), le taux de prelevements sociaux sur les revenus du patrimoine passe de 17,2% a 18,6% (hausse de la CSG de 9,2% a 10,6%). La flat tax passe donc de 30% a 31,4%. En LMP, les cotisations SSI representent environ 40% du benefice mais sont deductibles du revenu imposable l'annee suivante. Autre reforme majeure : la loi de finances 2025 (art. 84) impose desormais la reintegration des amortissements dans le calcul de la plus-value lors de la revente du bien LMNP."
    },
    {
      q: "Peut-on cumuler LMNP et revenus fonciers ?",
      r: "Oui, il est parfaitement possible de cumuler des revenus de location meublee (BIC) et des revenus de location nue (revenus fonciers). Les deux categories de revenus sont independantes et declarees separement. Les revenus de location meublee sont declares en BIC (formulaire 2042 C PRO) et les revenus fonciers en revenus fonciers (formulaire 2044). Les deficits de chaque categorie ne peuvent s'imputer que sur les revenus de meme nature. Un deficit LMNP ne peut pas reduire vos revenus fonciers et inversement. Cette strategie de diversification peut etre interessante : la location nue pour le micro-foncier (abattement 30%, plafond 15 000 euros) et la location meublee au regime reel pour l'amortissement."
    },
    {
      q: "Comment passer de LMNP a LMP ?",
      r: "Le passage de LMNP a LMP est automatique des lors que les deux conditions cumulatives sont remplies : recettes locatives > 23 000 euros ET recettes > autres revenus du foyer. Ce passage n'est pas un choix, c'est une consequence de votre situation. Les implications sont significatives : les amortissements anterieurs restent acquis, mais les plus-values futures releveront du regime professionnel (avec reintegration des amortissements). Vous serez soumis aux cotisations SSI au lieu des prelevements sociaux. En contrepartie, les deficits pourront s'imputer sur le revenu global. Pour revenir en LMNP, il suffit que l'une des conditions ne soit plus remplie (baisse des loyers, augmentation des autres revenus). La vigilance est de mise chaque annee car le basculement peut avoir des consequences fiscales importantes, notamment sur la plus-value en cas de revente."
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
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Simulateur LMNP / LMP
                  </h1>
                  <p className="text-gray-600 font-medium mt-1">
                    Location Meublee Non Professionnelle / Professionnelle
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Fiscalite 2025 / 2026</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Determinez votre statut LMNP ou LMP et comparez les regimes Micro-BIC et Reel
              pour optimiser la fiscalite de votre location meublee. Simulation complete avec
              amortissements par composants, plus-value a la revente et projections sur 20 ans.
            </p>
            <div className="mt-4 flex gap-2">
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

          {/* ============================================ */}
          {/* ONGLETS */}
          {/* ============================================ */}

          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'simulation' as OngletActif, label: 'Simulation', icon: Calculator },
              { id: 'amortissement' as OngletActif, label: 'Amortissement', icon: TrendingUp },
              { id: 'plusvalue' as OngletActif, label: 'Plus-Value', icon: BarChart3 },
              { id: 'faq' as OngletActif, label: 'FAQ', icon: HelpCircle }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 border-2 border-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ============================================ */}
          {/* TAB: SIMULATION */}
          {/* ============================================ */}

          {activeTab === 'simulation' && (
            <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>

              {/* FORMULAIRE */}
              <div className="space-y-6">

                {/* Type de location */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Type de location
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { value: 'classique' as TypeLocation, label: 'Classique' },
                        { value: 'tourisme_classe' as TypeLocation, label: 'Tourisme classe' },
                        { value: 'tourisme_non_classe' as TypeLocation, label: 'Tourisme non classe' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateField('typeLocation', opt.value)}
                          className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                            formData.typeLocation === opt.value
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.zoneTendue}
                          onChange={e => updateField('zoneTendue', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                      <span className="text-sm font-medium text-gray-700">Zone tendue</span>
                    </div>
                    {formData.typeLocation === 'tourisme_non_classe' && formData.zoneTendue && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Depuis 2024, les meubles de tourisme non classes en zone tendue ne beneficient que d'un abattement de 30% avec un plafond de 15 000 euros.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bien immobilier */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600" />
                    Bien immobilier
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valeur du bien (acquisition)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.valeurBien}
                          onChange={e => updateFieldFormatted('valeurBien', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                          placeholder="250 000"
                        />
                        <Euro className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quote-part terrain (%)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.quotePartTerrain}
                            onChange={e => updateField('quotePartTerrain', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                            placeholder="20"
                          />
                          <Percent className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valeur du mobilier</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.valeurMobilier}
                            onChange={e => updateFieldFormatted('valeurMobilier', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                            placeholder="15 000"
                          />
                          <Euro className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenus locatifs */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Euro className="w-5 h-5 text-indigo-600" />
                    Revenus locatifs
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loyer mensuel</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.loyerMensuel}
                          onChange={e => updateFieldFormatted('loyerMensuel', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                          placeholder="900"
                        />
                        <Euro className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Taux d'occupation (%)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.tauxOccupation}
                          onChange={e => updateField('tauxOccupation', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                          placeholder="90"
                        />
                        <Percent className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charges annuelles */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-indigo-600" />
                    Charges annuelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { field: 'assurance' as keyof FormData, label: 'Assurance PNO' },
                      { field: 'taxeFonciere' as keyof FormData, label: 'Taxe fonciere' },
                      { field: 'copropriete' as keyof FormData, label: 'Copropriete' },
                      { field: 'gestion' as keyof FormData, label: 'Frais de gestion' },
                      { field: 'entretien' as keyof FormData, label: 'Entretien / Travaux' },
                      { field: 'cfe' as keyof FormData, label: 'CFE' }
                    ].map(item => (
                      <div key={item.field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData[item.field] as string}
                            onChange={e => updateFieldFormatted(item.field, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10 text-sm"
                            placeholder="0"
                          />
                          <Euro className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interets d'emprunt annuels</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.interetsEmprunt}
                        onChange={e => updateFieldFormatted('interetsEmprunt', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                        placeholder="3 000"
                      />
                      <Euro className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Situation fiscale */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Situation fiscale
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Autres revenus du foyer (annuels)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.autresRevenus}
                          onChange={e => updateFieldFormatted('autresRevenus', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
                          placeholder="40 000"
                        />
                        <Euro className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tranche marginale d'imposition (TMI)</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[0, 11, 30, 41, 45].map(taux => (
                          <button
                            key={taux}
                            onClick={() => updateField('tmi', taux)}
                            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                              formData.tmi === taux
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                            }`}
                          >
                            {taux}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESULTATS */}
              <div className="space-y-6">

                {/* Badge statut LMP / LMNP */}
                {resultats && (
                  <div className={`rounded-2xl shadow-lg border-2 p-6 ${
                    resultats.isLMP
                      ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
                      : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        resultats.isLMP ? 'bg-orange-600' : 'bg-indigo-600'
                      }`}>
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                          resultats.isLMP
                            ? 'bg-orange-600 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {resultats.isLMP ? 'LMP' : 'LMNP'}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {resultats.isLMP
                            ? 'Loueur Meuble Professionnel - Recettes > 23 000 euros et > autres revenus'
                            : 'Loueur Meuble Non Professionnel'
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Recettes : {formatEuros(resultats.recettesBrutes)} | Autres revenus : {formatEuros(parseNumber(formData.autresRevenus))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparaison Micro-BIC vs Reel */}
                {resultats && (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Calculator className="w-6 h-6 text-indigo-600" />
                      Comparaison des regimes
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Colonne Micro-BIC */}
                      <div className={`rounded-xl border-2 p-4 ${
                        resultats.meilleurRegime === 'micro'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900">Micro-BIC</h4>
                          {resultats.meilleurRegime === 'micro' && (
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">Optimal</span>
                          )}
                        </div>
                        {!resultats.microEligible && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                            Non eligible : recettes &gt; {formatEuros(resultats.microPlafond)}
                          </div>
                        )}
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recettes brutes</span>
                            <span className="font-semibold">{formatEuros(resultats.recettesBrutes)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Abattement ({resultats.microTauxAbattement}%)</span>
                            <span className="font-semibold text-green-600">-{formatEuros(resultats.microAbattement)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="text-gray-700 font-medium">Resultat fiscal</span>
                            <span className="font-bold">{formatEuros(resultats.microResultatFiscal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">IR (TMI {formData.tmi}%)</span>
                            <span className="font-semibold text-red-600">{formatEuros(resultats.microIR)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{resultats.isLMP ? 'SSI (~40%)' : 'PS (18,6%)'}</span>
                            <span className="font-semibold text-red-600">{formatEuros(resultats.microPS)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="text-gray-700 font-bold">Total impots</span>
                            <span className="font-bold text-red-700">{formatEuros(resultats.microTotalImpots)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between bg-gray-100 -mx-4 px-4 py-2 rounded-b-lg">
                            <span className="text-gray-700 font-bold">Cash flow net</span>
                            <span className="font-bold text-indigo-700">{formatEuros(resultats.microCashFlow)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Colonne Reel */}
                      <div className={`rounded-xl border-2 p-4 ${
                        resultats.meilleurRegime === 'reel'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900">Regime Reel</h4>
                          {resultats.meilleurRegime === 'reel' && (
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">Optimal</span>
                          )}
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recettes brutes</span>
                            <span className="font-semibold">{formatEuros(resultats.recettesBrutes)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Charges reelles</span>
                            <span className="font-semibold text-green-600">-{formatEuros(resultats.reelCharges)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amortissements</span>
                            <span className="font-semibold text-green-600">-{formatEuros(resultats.reelAmortissements)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="text-gray-700 font-medium">Resultat fiscal</span>
                            <span className="font-bold">{formatEuros(resultats.reelResultatFiscal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">IR (TMI {formData.tmi}%)</span>
                            <span className="font-semibold text-red-600">{formatEuros(resultats.reelIR)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{resultats.isLMP ? 'SSI (~40%)' : 'PS (18,6%)'}</span>
                            <span className="font-semibold text-red-600">{formatEuros(resultats.reelPS)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="text-gray-700 font-bold">Total impots</span>
                            <span className="font-bold text-red-700">{formatEuros(resultats.reelTotalImpots)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between bg-gray-100 -mx-4 px-4 py-2 rounded-b-lg">
                            <span className="text-gray-700 font-bold">Cash flow net</span>
                            <span className="font-bold text-indigo-700">{formatEuros(resultats.reelCashFlow)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Economie */}
                    {resultats.economieReel !== 0 && (
                      <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                        resultats.economieReel > 0
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                          resultats.economieReel > 0 ? 'text-green-600' : 'text-blue-600'
                        }`} />
                        <p className="text-sm font-medium text-gray-800">
                          {resultats.economieReel > 0
                            ? `Le regime reel vous fait economiser ${formatEuros(resultats.economieReel)} par an par rapport au Micro-BIC.`
                            : `Le Micro-BIC vous fait economiser ${formatEuros(Math.abs(resultats.economieReel))} par an par rapport au regime reel.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Export PDF */}
                {resultats && (
                  <div className="flex justify-end">
                    <button
                      onClick={exporterPDF}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Exporter en PDF
                    </button>
                  </div>
                )}

                {/* Graphique comparaison bar */}
                {resultats && (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Comparaison visuelle
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={donneesBarComparaison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatEuros(value)} />
                        <Legend />
                        <Bar dataKey="impots" name="Total impots" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cashFlow" name="Cash flow net" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Graphique cash flow 20 ans */}
                {resultats && (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Cash flow cumule sur 20 ans
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={donneesCashFlow20Ans}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="annee" interval={3} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatEuros(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="microBIC" name="Micro-BIC" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="reel" name="Reel" stroke="#6366f1" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Repartition des charges (Pie) */}
                {donneesRepartitionCharges.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-indigo-600" />
                      Repartition des deductions (regime reel)
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={donneesRepartitionCharges}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }: any) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {donneesRepartitionCharges.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatEuros(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: AMORTISSEMENT */}
          {/* ============================================ */}

          {activeTab === 'amortissement' && (
            <div className="space-y-8">

              {/* Decomposition par composant */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  Decomposition par composant
                </h3>

                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800 flex items-start gap-2">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Terrain non amortissable</p>
                    <p>La quote-part terrain ({formData.quotePartTerrain}%) de la valeur du bien n'est pas amortissable. Base amortissable immobiliere : {formatEuros(parseNumber(formData.valeurBien) * (1 - parseNumber(formData.quotePartTerrain) / 100))}.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-900">Composant</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Quote-part</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Valeur</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Duree</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Amort. annuel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {composantsAmort.map((c, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{c.nom}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{c.pourcentage.toFixed(0)}%</td>
                          <td className="py-3 px-4 text-right font-semibold">{formatEuros(c.valeur)}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{c.duree} ans</td>
                          <td className="py-3 px-4 text-right font-bold text-indigo-600">{formatEuros(c.amortissementAnnuel)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-indigo-50">
                        <td className="py-3 px-4 font-bold text-gray-900" colSpan={2}>TOTAL</td>
                        <td className="py-3 px-4 text-right font-bold">{formatEuros(composantsAmort.reduce((a, c) => a + c.valeur, 0))}</td>
                        <td className="py-3 px-4 text-right text-gray-600">-</td>
                        <td className="py-3 px-4 text-right font-bold text-indigo-700">{formatEuros(composantsAmort.reduce((a, c) => a + c.amortissementAnnuel, 0))}/an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tableau amortissement annuel */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  Tableau d'amortissement annuel
                </h3>

                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tableauAmortissement.filter(d => d.annee <= 30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="annee" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatEuros(value)}
                        labelFormatter={(label) => `Annee ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="amortissement" name="Amortissement annuel" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-900">Annee</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Amortissement</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Cumul</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Valeur residuelle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableauAmortissement.map(row => (
                        <tr key={row.annee} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                          <td className="py-2 px-4 font-medium text-gray-900">Annee {row.annee}</td>
                          <td className="py-2 px-4 text-right font-semibold text-indigo-600">{formatEuros(row.amortissement)}</td>
                          <td className="py-2 px-4 text-right text-gray-700">{formatEuros(row.cumul)}</td>
                          <td className="py-2 px-4 text-right text-gray-600">{formatEuros(row.valeurResiduelle)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: PLUS-VALUE */}
          {/* ============================================ */}

          {activeTab === 'plusvalue' && (
            <div className="space-y-8">

              {/* Explication */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div className="space-y-2 text-sm text-indigo-900">
                    <p className="font-semibold text-lg">Fiscalite de la plus-value a la revente</p>
                    <p>
                      <strong>LMNP :</strong> regime des plus-values des particuliers. Abattement progressif
                      pour duree de detention. Exoneration totale d'IR apres 22 ans, de prelevements sociaux apres 30 ans.
                      Les amortissements deduits ne sont pas reintegres.
                    </p>
                    <p>
                      <strong>LMP :</strong> regime des plus-values professionnelles. Les amortissements sont
                      reintegres (plus-value court terme). Exoneration totale possible si recettes &lt; 90 000 euros
                      et activite &gt; 5 ans.
                    </p>
                  </div>
                </div>
              </div>

              {/* Graphique PV */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  Impot sur la plus-value selon la duree de detention
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={donneesPVGraphique}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="annee" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatEuros(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="lmnpImpot" name="LMNP (PV particuliers)" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="lmpImpot" name="LMP (PV professionnelles)" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau detaille */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  Tableau de simulation de revente (valorisation +1,5%/an)
                </h3>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-3 font-bold text-gray-900">Annee</th>
                        <th className="text-right py-3 px-3 font-bold text-gray-900">Prix revente</th>
                        <th className="text-center py-3 px-3 font-bold text-indigo-700" colSpan={2}>LMNP</th>
                        <th className="text-center py-3 px-3 font-bold text-amber-700" colSpan={2}>LMP</th>
                      </tr>
                      <tr className="border-b border-gray-200 text-xs text-gray-500">
                        <th></th>
                        <th></th>
                        <th className="text-right py-2 px-3">Impot PV</th>
                        <th className="text-right py-2 px-3">Net vendeur</th>
                        <th className="text-right py-2 px-3">Impot PV</th>
                        <th className="text-right py-2 px-3">Net vendeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donneesPlusValue
                        .filter(d => d.annee <= 30 && (d.annee <= 10 || d.annee % 2 === 0))
                        .map(d => (
                          <tr key={d.annee} className={`border-b border-gray-100 hover:bg-indigo-50 transition-colors ${
                            d.annee === 5 || d.annee === 22 || d.annee === 30 ? 'bg-yellow-50' : ''
                          }`}>
                            <td className="py-2 px-3 font-medium text-gray-900">
                              An {d.annee}
                              {d.annee === 22 && <span className="ml-1 text-xs text-green-600 font-bold">(Exo IR LMNP)</span>}
                              {d.annee === 30 && <span className="ml-1 text-xs text-green-600 font-bold">(Exo totale LMNP)</span>}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-700">{formatEuros(d.prixRevente)}</td>
                            <td className="py-2 px-3 text-right font-semibold text-red-600">{formatEuros(d.lmnpTotalImpot)}</td>
                            <td className="py-2 px-3 text-right font-bold text-indigo-700">{formatEuros(d.lmnpNetVendeur)}</td>
                            <td className="py-2 px-3 text-right font-semibold text-red-600">
                              {d.lmpExonere ? (
                                <span className="text-green-600">Exonere</span>
                              ) : (
                                formatEuros(d.lmpTotalImpot)
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-amber-700">{formatEuros(d.lmpNetVendeur)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Abattements LMNP detailles */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Percent className="w-6 h-6 text-indigo-600" />
                  Abattements LMNP (regime des plus-values des particuliers)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-900">Duree de detention</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Abattement IR</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">Abattement PS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[5, 10, 15, 20, 22, 25, 30].map(annee => {
                        const pv = donneesPlusValue.find(d => d.annee === annee);
                        return (
                          <tr key={annee} className={`border-b border-gray-100 ${
                            annee === 22 || annee === 30 ? 'bg-green-50' : ''
                          }`}>
                            <td className="py-2 px-4 font-medium text-gray-900">{annee} ans</td>
                            <td className="py-2 px-4 text-right font-semibold text-indigo-600">
                              {pv ? `${pv.lmnpAbattementIR.toFixed(1)}%` : '-'}
                              {annee >= 22 && <span className="ml-1 text-xs text-green-600">(Exonere)</span>}
                            </td>
                            <td className="py-2 px-4 text-right font-semibold text-purple-600">
                              {pv ? `${pv.lmnpAbattementPS.toFixed(1)}%` : '-'}
                              {annee >= 30 && <span className="ml-1 text-xs text-green-600">(Exonere)</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                  Questions frequentes sur le LMNP / LMP
                </h2>
                <p className="text-gray-600 mt-2">
                  Tout ce que vous devez savoir sur la location meublee et sa fiscalite
                </p>
              </div>

              <div className="space-y-3">
                {faqData.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
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
                  Ce simulateur est fourni a titre informatif uniquement et ne constitue pas un conseil fiscal
                  ou juridique. Les resultats sont des estimations basees sur les informations fournies et la
                  legislation fiscale 2025/2026 en vigueur.
                </p>
                <p>
                  La fiscalite de la location meublee est complexe et comporte de nombreuses regles specifiques
                  (plafonnement des amortissements, report de deficits, cotisations sociales, etc.) qui peuvent
                  varier selon votre situation personnelle.
                </p>
                <p className="font-semibold">
                  Pour une analyse personnalisee de votre situation, consultez un expert-comptable,
                  un notaire ou un conseiller en gestion de patrimoine.
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
