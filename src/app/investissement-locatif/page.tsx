// ============================================
// FILE: src/app/investissement-locatif/page.tsx
// DESCRIPTION: Simulateur d'Investissement Locatif - NotariaPrime
// VERSION: 1.0 - Dispositifs Pinel, Denormandie, Loc'Avantages, Deficit Foncier, Malraux, LMNP
// ============================================

"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Home,
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
  Shield,
  CheckCircle2,
  Building,
  Target,
  BarChart3,
  FileText,
  MapPin,
  Layers,
  Wallet,
  Scale,
  TrendingDown,
  Save,
  FolderOpen,
  Trash2,
  Download,
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
  Bar,
  AreaChart,
  Area
} from 'recharts';

// Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

type ZoneGeo = 'Abis' | 'A' | 'B1' | 'B2' | 'C';
type TypeBien = 'neuf' | 'ancien' | 'ancien_travaux';
type Dispositif = 'aucun' | 'pinel' | 'denormandie' | 'loc_avantages' | 'deficit_foncier' | 'malraux' | 'lmnp';
type DureePinel = 6 | 9 | 12;
type NiveauLocAvantages = 'loc1' | 'loc2' | 'loc3';
type SecteurMalraux = 'zppaup' | 'sauvegarde';
type ActiveTab = 'simulation' | 'dispositifs' | 'projection' | 'faq';

interface FormData {
  prixAcquisition: string;
  fraisNotairePct: string;
  fraisNotaireMontant: string;
  fraisNotaireAuto: boolean;
  surface: string;
  zone: ZoneGeo;
  typeBien: TypeBien;
  montantTravaux: string;
  loyerMensuel: string;
  chargesMensuelles: string;
  taxeFonciere: string;
  vacanceLocative: string;
  apport: string;
  montantEmprunt: string;
  tauxEmprunt: string;
  dureeEmprunt: number;
  tauxAssurance: string;
  tmi: number;
}

interface DispositifConfig {
  dispositif: Dispositif;
  dureePinel: DureePinel;
  niveauLocAvantages: NiveauLocAvantages;
  intermediationLocAvantages: boolean;
  secteurMalraux: SecteurMalraux;
  montantTravauxMalraux: string;
}

interface ProjectionConfig {
  dureeProjection: number;
  tauxValorisationBien: string;
  tauxRevalorisationLoyer: string;
}

// ============================================
// CONSTANTES
// ============================================

const PLAFONDS_LOYER_PINEL: Record<string, number> = {
  'Abis': 18.89,
  'A': 14.03,
  'B1': 11.31,
  'B2': 9.83,
  'C': 9.83
};

const TAUX_PINEL: Record<number, number> = {
  6: 0.09,
  9: 0.12,
  12: 0.14
};

const PLAFOND_INVESTISSEMENT_PINEL = 300000;
const PLAFOND_M2_PINEL = 5500;

const TAUX_LOC_AVANTAGES: Record<string, { sans: number; avec: number }> = {
  'loc1': { sans: 0.15, avec: 0.20 },
  'loc2': { sans: 0.35, avec: 0.40 },
  'loc3': { sans: 0, avec: 0.65 }
};

const PLAFOND_DEFICIT_FONCIER = 10700;
const PLAFOND_DEFICIT_FONCIER_RENOVATION = 21400;

const TAUX_MALRAUX: Record<string, number> = {
  'zppaup': 0.22,
  'sauvegarde': 0.30
};
const PLAFOND_TRAVAUX_MALRAUX = 400000;

const PRELEVEMENTS_SOCIAUX = 0.172;

const PLAFONDS_RESSOURCES_PINEL: Record<string, Record<string, number>> = {
  'A bis': {
    'Personne seule': 43475,
    'Couple': 64976,
    'Pers. seule ou couple + 1 pers. à charge': 85175,
    'Pers. seule ou couple + 2 pers. à charge': 101693,
    'Pers. seule ou couple + 3 pers. à charge': 120995,
    'Pers. seule ou couple + 4 pers. à charge': 136151,
    'Majoration par personne supplémentaire': 15168
  },
  'A': {
    'Personne seule': 43475,
    'Couple': 64976,
    'Pers. seule ou couple + 1 pers. à charge': 78104,
    'Pers. seule ou couple + 2 pers. à charge': 93556,
    'Pers. seule ou couple + 3 pers. à charge': 110753,
    'Pers. seule ou couple + 4 pers. à charge': 124630,
    'Majoration par personne supplémentaire': 13886
  },
  'B1': {
    'Personne seule': 35435,
    'Couple': 47321,
    'Pers. seule ou couple + 1 pers. à charge': 56905,
    'Pers. seule ou couple + 2 pers. à charge': 68699,
    'Pers. seule ou couple + 3 pers. à charge': 80816,
    'Pers. seule ou couple + 4 pers. à charge': 91078,
    'Majoration par personne supplémentaire': 10161
  }
};

const ZONE_TO_PLAFOND_KEY: Record<string, string> = {
  'Abis': 'A bis',
  'A': 'A',
  'B1': 'B1'
};

const ZONES_LABELS: Record<ZoneGeo, string> = {
  'Abis': 'A bis (Paris et communes limitrophes)',
  'A': 'A (Grandes agglomerations)',
  'B1': 'B1 (Agglomerations > 250 000 hab.)',
  'B2': 'B2 (Communes > 50 000 hab.)',
  'C': 'C (Reste du territoire)'
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

function formatPct(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace('.', ',') + ' %';
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerFraisNotaire(prix: number, typeBien: TypeBien): number {
  if (typeBien === 'neuf') return prix * 0.025;
  return prix * 0.075;
}

function calculerMensualiteEmprunt(montant: number, tauxAnnuel: number, dureeMois: number): number {
  if (montant <= 0 || dureeMois <= 0) return 0;
  const tauxMensuel = tauxAnnuel / 100 / 12;
  if (tauxMensuel <= 0) return montant / dureeMois;
  return (montant * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois));
}

function calculerRendementBrut(loyerAnnuel: number, prixAcquisition: number): number {
  if (prixAcquisition <= 0) return 0;
  return (loyerAnnuel / prixAcquisition) * 100;
}

function calculerRendementNet(
  loyerAnnuel: number,
  charges: number,
  taxeFonciere: number,
  vacancePct: number,
  prixAcquisition: number,
  fraisNotaire: number
): number {
  const prixRevient = prixAcquisition + fraisNotaire;
  if (prixRevient <= 0) return 0;
  const loyerEffectif = loyerAnnuel * (1 - vacancePct / 100);
  const revenuNet = loyerEffectif - charges * 12 - taxeFonciere;
  return (revenuNet / prixRevient) * 100;
}

function calculerRendementNetNet(
  loyerAnnuel: number,
  charges: number,
  taxeFonciere: number,
  vacancePct: number,
  prixAcquisition: number,
  fraisNotaire: number,
  tmi: number,
  avantageFiscalAnnuel: number
): number {
  const prixRevient = prixAcquisition + fraisNotaire;
  if (prixRevient <= 0) return 0;
  const loyerEffectif = loyerAnnuel * (1 - vacancePct / 100);
  const revenuNet = loyerEffectif - charges * 12 - taxeFonciere;
  const impotRevenuFoncier = Math.max(0, revenuNet) * (tmi / 100 + PRELEVEMENTS_SOCIAUX);
  const revenuNetNet = revenuNet - impotRevenuFoncier + avantageFiscalAnnuel;
  return (revenuNetNet / prixRevient) * 100;
}

function calculerAvantageFiscalPinel(
  prixAcquisition: number,
  surface: number,
  duree: DureePinel
): { avantageTotal: number; avantageAnnuel: number; eligible: boolean; raison: string } {
  const plafondM2 = surface * PLAFOND_M2_PINEL;
  const baseEligible = Math.min(prixAcquisition, PLAFOND_INVESTISSEMENT_PINEL, plafondM2);
  const taux = TAUX_PINEL[duree] || 0;
  const avantageTotal = baseEligible * taux;
  const avantageAnnuel = avantageTotal / duree;

  const eligible = true;
  let raison = '';
  if (prixAcquisition > PLAFOND_INVESTISSEMENT_PINEL) {
    raison = `Prix plafonné à ${formatEuros(PLAFOND_INVESTISSEMENT_PINEL)}. `;
  }
  if (prixAcquisition > plafondM2) {
    raison += `Prix plafonné à ${formatEuros(plafondM2)} (5 500 €/m²). `;
  }

  return { avantageTotal, avantageAnnuel, eligible, raison };
}

function calculerAvantageFiscalDenormandie(
  prixAcquisition: number,
  montantTravaux: number,
  surface: number,
  duree: DureePinel
): { avantageTotal: number; avantageAnnuel: number; eligible: boolean; raison: string } {
  const coutTotal = prixAcquisition + montantTravaux;
  const tauxTravaux = montantTravaux / coutTotal;
  const eligible = tauxTravaux >= 0.25;
  let raison = '';
  if (!eligible) {
    raison = `Travaux insuffisants : ${(tauxTravaux * 100).toFixed(1)}% (minimum 25% requis).`;
  }
  const plafondM2 = surface * PLAFOND_M2_PINEL;
  const baseEligible = Math.min(coutTotal, PLAFOND_INVESTISSEMENT_PINEL, plafondM2);
  const taux = TAUX_PINEL[duree] || 0;
  const avantageTotal = eligible ? baseEligible * taux : 0;
  const avantageAnnuel = eligible ? avantageTotal / duree : 0;

  return { avantageTotal, avantageAnnuel, eligible, raison };
}

function calculerAvantageFiscalLocAvantages(
  loyerAnnuel: number,
  niveau: NiveauLocAvantages,
  intermediation: boolean,
  duree: number
): { avantageTotal: number; avantageAnnuel: number; taux: number } {
  const config = TAUX_LOC_AVANTAGES[niveau];
  const taux = intermediation ? config.avec : config.sans;
  if (niveau === 'loc3' && !intermediation) {
    return { avantageTotal: 0, avantageAnnuel: 0, taux: 0 };
  }
  const avantageAnnuel = loyerAnnuel * taux;
  const avantageTotal = avantageAnnuel * duree;
  return { avantageTotal, avantageAnnuel, taux };
}

function calculerDeficitFoncier(
  montantTravaux: number,
  revenusFonciers: number,
  renovationEnergetique: boolean
): { deductionAnnee1: number; reportable: number; plafond: number } {
  const plafond = renovationEnergetique ? PLAFOND_DEFICIT_FONCIER_RENOVATION : PLAFOND_DEFICIT_FONCIER;
  const deficit = montantTravaux - revenusFonciers;
  const deductionAnnee1 = Math.min(Math.max(deficit, 0), plafond);
  const reportable = Math.max(deficit - deductionAnnee1, 0);
  return { deductionAnnee1, reportable, plafond };
}

function calculerAvantageFiscalMalraux(
  montantTravaux: number,
  secteur: SecteurMalraux,
  duree: number
): { avantageTotal: number; avantageAnnuel: number; taux: number } {
  const taux = TAUX_MALRAUX[secteur];
  const travauxEligibles = Math.min(montantTravaux, PLAFOND_TRAVAUX_MALRAUX);
  const avantageTotal = travauxEligibles * taux;
  const avantageAnnuel = avantageTotal / Math.min(duree, 4);
  return { avantageTotal, avantageAnnuel, taux };
}

function calculerTRI(cashFlows: number[]): number {
  // Newton-Raphson method for IRR
  let guess = 0.05;
  for (let iter = 0; iter < 200; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const discount = Math.pow(1 + guess, t);
      npv += cashFlows[t] / discount;
      dnpv -= t * cashFlows[t] / Math.pow(1 + guess, t + 1);
    }
    if (Math.abs(npv) < 0.01) break;
    if (dnpv === 0) break;
    guess = guess - npv / dnpv;
    if (guess < -0.99) guess = -0.5;
    if (guess > 2) guess = 0.5;
  }
  return guess * 100;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function SimulateurInvestissementLocatif() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulation');
  const [isDesktop, setIsDesktop] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [nomSimulation, setNomSimulation] = useState('');
  const [simulations, setSimulations] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    prixAcquisition: '200000',
    fraisNotairePct: '7.5',
    fraisNotaireMontant: '15000',
    fraisNotaireAuto: true,
    surface: '45',
    zone: 'A',
    typeBien: 'ancien',
    montantTravaux: '0',
    loyerMensuel: '800',
    chargesMensuelles: '150',
    taxeFonciere: '1200',
    vacanceLocative: '5',
    apport: '40000',
    montantEmprunt: '160000',
    tauxEmprunt: '3.20',
    dureeEmprunt: 20,
    tauxAssurance: '0.36',
    tmi: 30
  });

  const [dispConfig, setDispConfig] = useState<DispositifConfig>({
    dispositif: 'aucun',
    dureePinel: 9,
    niveauLocAvantages: 'loc1',
    intermediationLocAvantages: false,
    secteurMalraux: 'sauvegarde',
    montantTravauxMalraux: '100000'
  });

  const [showPlafondsRessources, setShowPlafondsRessources] = useState(false);

  const [projConfig, setProjConfig] = useState<ProjectionConfig>({
    dureeProjection: 20,
    tauxValorisationBien: '1.5',
    tauxRevalorisationLoyer: '1.0'
  });

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // SAUVEGARDE / CHARGEMENT
  // ============================================

  const STORAGE_KEY = 'notariaprime-investissement';

  const handleSauvegarder = () => {
    if (!nomSimulation.trim()) {
      alert('Veuillez donner un nom a votre simulation');
      return;
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.push({ nom: nomSimulation, date: new Date().toISOString(), data: { formData, dispConfig, projConfig } });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setShowSaveModal(false);
    setNomSimulation('');
    alert('Simulation sauvegardee avec succes !');
  };

  const handleCharger = (index: number) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (saved[index]) {
      const d = saved[index].data;
      if (d.formData) setFormData(d.formData);
      if (d.dispConfig) setDispConfig(d.dispConfig);
      if (d.projConfig) setProjConfig(d.projConfig);
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

  // Auto-calc frais de notaire
  useEffect(() => {
    if (formData.fraisNotaireAuto) {
      const prix = parseNumber(formData.prixAcquisition);
      const frais = calculerFraisNotaire(prix, formData.typeBien);
      const pct = prix > 0 ? ((frais / prix) * 100).toFixed(1) : '0';
      setFormData(prev => ({
        ...prev,
        fraisNotaireMontant: Math.round(frais).toString(),
        fraisNotairePct: pct
      }));
    }
  }, [formData.prixAcquisition, formData.typeBien, formData.fraisNotaireAuto]);

  // Auto-calc montant emprunt
  useEffect(() => {
    const prix = parseNumber(formData.prixAcquisition);
    const frais = parseNumber(formData.fraisNotaireMontant);
    const travaux = parseNumber(formData.montantTravaux);
    const apport = parseNumber(formData.apport);
    const emprunt = Math.max(0, prix + frais + travaux - apport);
    setFormData(prev => ({ ...prev, montantEmprunt: Math.round(emprunt).toString() }));
  }, [formData.prixAcquisition, formData.fraisNotaireMontant, formData.montantTravaux, formData.apport]);

  // ============================================
  // CALCULS PRINCIPAUX (useMemo)
  // ============================================

  const resultats = useMemo(() => {
    const prix = parseNumber(formData.prixAcquisition);
    const fraisNotaire = parseNumber(formData.fraisNotaireMontant);
    const surface = parseNumber(formData.surface);
    const travaux = parseNumber(formData.montantTravaux);
    const loyerMensuel = parseNumber(formData.loyerMensuel);
    const loyerAnnuel = loyerMensuel * 12;
    const charges = parseNumber(formData.chargesMensuelles);
    const taxeFonciere = parseNumber(formData.taxeFonciere);
    const vacance = parseNumber(formData.vacanceLocative);
    const montantEmprunt = parseNumber(formData.montantEmprunt);
    const tauxEmprunt = parseNumber(formData.tauxEmprunt);
    const dureeEmpruntMois = formData.dureeEmprunt * 12;
    const tauxAssurance = parseNumber(formData.tauxAssurance);

    const prixRevient = prix + fraisNotaire + travaux;

    // Mensualite emprunt
    const mensualiteHorsAssurance = calculerMensualiteEmprunt(montantEmprunt, tauxEmprunt, dureeEmpruntMois);
    const mensualiteAssurance = (montantEmprunt * tauxAssurance / 100) / 12;
    const mensualiteTotale = mensualiteHorsAssurance + mensualiteAssurance;

    // Rendements
    const rendementBrut = calculerRendementBrut(loyerAnnuel, prix);

    const rendementNet = calculerRendementNet(
      loyerAnnuel, charges, taxeFonciere, vacance, prix, fraisNotaire
    );

    // Avantage fiscal selon dispositif
    let avantageFiscalAnnuel = 0;
    let avantageFiscalTotal = 0;
    let eligibilite = { eligible: true, raison: '' };

    if (dispConfig.dispositif === 'pinel') {
      const r = calculerAvantageFiscalPinel(prix, surface, dispConfig.dureePinel);
      avantageFiscalAnnuel = r.avantageAnnuel;
      avantageFiscalTotal = r.avantageTotal;
      eligibilite = { eligible: r.eligible, raison: r.raison };
    } else if (dispConfig.dispositif === 'denormandie') {
      const r = calculerAvantageFiscalDenormandie(prix, travaux, surface, dispConfig.dureePinel);
      avantageFiscalAnnuel = r.avantageAnnuel;
      avantageFiscalTotal = r.avantageTotal;
      eligibilite = { eligible: r.eligible, raison: r.raison };
    } else if (dispConfig.dispositif === 'loc_avantages') {
      const r = calculerAvantageFiscalLocAvantages(
        loyerAnnuel, dispConfig.niveauLocAvantages, dispConfig.intermediationLocAvantages, 6
      );
      avantageFiscalAnnuel = r.avantageAnnuel;
      avantageFiscalTotal = r.avantageTotal;
    } else if (dispConfig.dispositif === 'deficit_foncier') {
      const r = calculerDeficitFoncier(travaux, loyerAnnuel - charges * 12 - taxeFonciere, false);
      avantageFiscalAnnuel = r.deductionAnnee1 * (formData.tmi / 100);
      avantageFiscalTotal = avantageFiscalAnnuel;
    } else if (dispConfig.dispositif === 'malraux') {
      const mt = parseNumber(dispConfig.montantTravauxMalraux);
      const r = calculerAvantageFiscalMalraux(mt, dispConfig.secteurMalraux, 4);
      avantageFiscalAnnuel = r.avantageAnnuel;
      avantageFiscalTotal = r.avantageTotal;
    }

    const rendementNetNet = calculerRendementNetNet(
      loyerAnnuel, charges, taxeFonciere, vacance, prix, fraisNotaire, formData.tmi, avantageFiscalAnnuel
    );

    // Cash flow mensuel
    const loyerEffectifMensuel = loyerMensuel * (1 - vacance / 100);
    const chargesAnnuelles = charges * 12 + taxeFonciere;
    const revenuNetAnnuel = loyerEffectifMensuel * 12 - chargesAnnuelles;
    const impotAnnuel = Math.max(0, revenuNetAnnuel) * (formData.tmi / 100 + PRELEVEMENTS_SOCIAUX);
    const cashFlowMensuel = loyerEffectifMensuel - mensualiteTotale - charges - taxeFonciere / 12
      - impotAnnuel / 12 + avantageFiscalAnnuel / 12;

    // Effort epargne mensuel
    const effortEpargne = mensualiteTotale - loyerEffectifMensuel + charges + taxeFonciere / 12;

    // Cout total interets
    const totalInterets = mensualiteHorsAssurance * dureeEmpruntMois - montantEmprunt;
    const totalAssurance = mensualiteAssurance * dureeEmpruntMois;

    // Plafond loyer Pinel
    const plafondLoyerPinel = PLAFONDS_LOYER_PINEL[formData.zone] || 0;
    const loyerPlafondPinel = plafondLoyerPinel * surface;

    return {
      prix,
      fraisNotaire,
      surface,
      travaux,
      loyerMensuel,
      loyerAnnuel,
      charges,
      taxeFonciere,
      vacance,
      prixRevient,
      montantEmprunt,
      mensualiteHorsAssurance,
      mensualiteAssurance,
      mensualiteTotale,
      rendementBrut,
      rendementNet,
      rendementNetNet,
      cashFlowMensuel,
      effortEpargne,
      avantageFiscalAnnuel,
      avantageFiscalTotal,
      eligibilite,
      totalInterets,
      totalAssurance,
      plafondLoyerPinel,
      loyerPlafondPinel,
      impotAnnuel,
      chargesAnnuelles,
      revenuNetAnnuel
    };
  }, [formData, dispConfig]);

  // ============================================
  // EXPORT PDF
  // ============================================

  const exporterPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Investissement Locatif', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rendements', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rendement brut : ${resultats.rendementBrut.toFixed(2)} %`, 20, y);
    y += 7;
    doc.text(`Rendement net : ${resultats.rendementNet.toFixed(2)} %`, 20, y);
    y += 7;
    doc.text(`Rendement net-net : ${resultats.rendementNetNet.toFixed(2)} %`, 20, y);
    y += 7;
    doc.text(`Cash-flow mensuel : ${Math.round(resultats.cashFlowMensuel).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financement', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prix acquisition : ${resultats.prix.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Frais de notaire : ${resultats.fraisNotaire.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Prix de revient : ${resultats.prixRevient.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Mensualite totale : ${resultats.mensualiteTotale.toFixed(2)} EUR`, 20, y);
    y += 7;
    doc.text(`Total interets : ${Math.round(resultats.totalInterets).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenus locatifs', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Loyer annuel : ${resultats.loyerAnnuel.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Charges annuelles : ${Math.round(resultats.chargesAnnuelles).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Revenu net annuel : ${Math.round(resultats.revenuNetAnnuel).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Avantage fiscal annuel : ${Math.round(resultats.avantageFiscalAnnuel).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Avantage fiscal total : ${Math.round(resultats.avantageFiscalTotal).toLocaleString('fr-FR')} EUR`, 20, y);
    y += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'Avertissement : cette simulation est fournie a titre informatif et ne constitue pas un conseil fiscal ou une recommandation personnalisee. Consultez un professionnel avant toute decision.';
    const lines = doc.splitTextToSize(disclaimer, 170);
    lines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`investissement-locatif-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ============================================
  // DONNEES PROJECTION (useMemo)
  // ============================================

  const projectionData = useMemo(() => {
    const duree = projConfig.dureeProjection;
    const tauxValo = parseNumber(projConfig.tauxValorisationBien) / 100;
    const tauxLoyer = parseNumber(projConfig.tauxRevalorisationLoyer) / 100;
    const montantEmprunt = resultats.montantEmprunt;
    const tauxEmprunt = parseNumber(formData.tauxEmprunt);
    const dureeEmpruntMois = formData.dureeEmprunt * 12;
    const tauxMensuel = tauxEmprunt / 100 / 12;

    const data: Array<{
      annee: number;
      valeurBien: number;
      capitalRembourse: number;
      capitalRestant: number;
      loyerCumule: number;
      chargesCumulees: number;
      cashFlowCumule: number;
      patrimoine: number;
      [key: string]: string | number;
    }> = [];

    let capitalRestant = montantEmprunt;
    let loyerCumule = 0;
    let chargesCumulees = 0;
    let cashFlowCumule = 0;

    for (let annee = 1; annee <= duree; annee++) {
      const valeurBien = resultats.prix * Math.pow(1 + tauxValo, annee);
      const loyerAnnuel = resultats.loyerAnnuel * Math.pow(1 + tauxLoyer, annee - 1);
      const loyerEffectif = loyerAnnuel * (1 - resultats.vacance / 100);
      const chargesAnnee = resultats.chargesAnnuelles * Math.pow(1 + 0.02, annee - 1);

      // Amortissement capital sur l'annee
      for (let m = 0; m < 12; m++) {
        const moisGlobal = (annee - 1) * 12 + m;
        if (moisGlobal < dureeEmpruntMois && capitalRestant > 0) {
          const interetsMois = capitalRestant * tauxMensuel;
          const capitalMois = resultats.mensualiteHorsAssurance - interetsMois;
          capitalRestant = Math.max(0, capitalRestant - capitalMois);
        }
      }

      loyerCumule += loyerEffectif;
      chargesCumulees += chargesAnnee;

      const mensualiteAnnuelle = annee <= formData.dureeEmprunt
        ? resultats.mensualiteTotale * 12
        : 0;
      const cashFlowAnnee = loyerEffectif - chargesAnnee - mensualiteAnnuelle + resultats.avantageFiscalAnnuel;
      cashFlowCumule += cashFlowAnnee;

      const patrimoine = valeurBien - capitalRestant;

      data.push({
        annee,
        valeurBien: Math.round(valeurBien),
        capitalRembourse: Math.round(montantEmprunt - capitalRestant),
        capitalRestant: Math.round(capitalRestant),
        loyerCumule: Math.round(loyerCumule),
        chargesCumulees: Math.round(chargesCumulees),
        cashFlowCumule: Math.round(cashFlowCumule),
        patrimoine: Math.round(patrimoine)
      });
    }

    // Calcul TRI
    const apport = parseNumber(formData.apport);
    const cashFlows: number[] = [-(apport + resultats.travaux)];
    for (let i = 0; i < duree; i++) {
      const d = data[i];
      const mensualiteAnnuelle = i < formData.dureeEmprunt
        ? resultats.mensualiteTotale * 12
        : 0;
      const loyerAnnuel = resultats.loyerAnnuel * Math.pow(1 + tauxLoyer, i);
      const loyerEffectif = loyerAnnuel * (1 - resultats.vacance / 100);
      const chargesAnnee = resultats.chargesAnnuelles * Math.pow(1 + 0.02, i);
      let cf = loyerEffectif - chargesAnnee - mensualiteAnnuelle + resultats.avantageFiscalAnnuel;
      if (i === duree - 1) {
        cf += d.valeurBien - d.capitalRestant;
      }
      cashFlows.push(cf);
    }

    const tri = calculerTRI(cashFlows);
    const plusValue = data.length > 0 ? data[data.length - 1].valeurBien - resultats.prix : 0;

    return { data, tri, plusValue, cashFlows };
  }, [resultats, projConfig, formData.tauxEmprunt, formData.dureeEmprunt, formData.apport]);

  // ============================================
  // DONNEES GRAPHIQUES (useMemo)
  // ============================================

  const chartRendements = useMemo(() => [
    { name: 'Brut', value: Math.max(0, resultats.rendementBrut), fill: '#6366f1' },
    { name: 'Net', value: Math.max(0, resultats.rendementNet), fill: '#10b981' },
    { name: 'Net-net', value: resultats.rendementNetNet, fill: '#f59e0b' }
  ], [resultats.rendementBrut, resultats.rendementNet, resultats.rendementNetNet]);

  const chartCouts = useMemo(() => {
    return [
      { name: 'Capital rembourse', value: Math.round(resultats.montantEmprunt), color: '#6366f1' },
      { name: 'Interets emprunt', value: Math.round(resultats.totalInterets), color: '#f59e0b' },
      { name: 'Assurance emprunt', value: Math.round(resultats.totalAssurance), color: '#8b5cf6' },
      { name: 'Charges & taxe fonciere', value: Math.round(resultats.chargesAnnuelles * formData.dureeEmprunt), color: '#ef4444' },
      { name: 'Fiscalite estimee', value: Math.round(Math.max(0, resultats.impotAnnuel) * formData.dureeEmprunt), color: '#ec4899' }
    ].filter(d => d.value > 0);
  }, [resultats, formData.dureeEmprunt]);

  // Tooltip & axis formatters
  const tooltipFormatter = useCallback((value: number) => formatEuros(value), []);
  const yAxisFormatter = useCallback((value: number) => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
    if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k€`;
    return `${value}€`;
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const updateForm = useCallback((field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateDisp = useCallback((field: keyof DispositifConfig, value: string | number | boolean) => {
    setDispConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateProj = useCallback((field: keyof ProjectionConfig, value: string | number) => {
    setProjConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  // ============================================
  // RENDU
  // ============================================

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
                <Building className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900">
                Simulateur d&apos;Investissement Locatif
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rentabilite brute, nette et net-net &bull; Dispositifs fiscaux &bull; Projection patrimoniale
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-700 bg-indigo-100 px-4 py-2 rounded-full w-fit mx-auto">
              <Info className="w-4 h-4" />
              Baremes fiscaux 2025/2026 &mdash; Pinel, Denormandie, Loc&apos;Avantages, Deficit Foncier, Malraux
            </div>
            <div className="flex justify-center gap-2 mt-2">
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
          {/* TABS */}
          {/* ============================================ */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100">
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto px-4 pt-4">
              {[
                { id: 'simulation' as ActiveTab, label: 'Simulation', icon: Calculator },
                { id: 'dispositifs' as ActiveTab, label: 'Dispositifs fiscaux', icon: Shield },
                { id: 'projection' as ActiveTab, label: 'Projection', icon: TrendingUp },
                { id: 'faq' as ActiveTab, label: 'FAQ', icon: HelpCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </div>
                </button>
              ))}
            </div>

            {/* ============================================ */}
            {/* TAB: SIMULATION */}
            {/* ============================================ */}
            {activeTab === 'simulation' && (
              <div className="p-6 space-y-8">

                {/* Formulaire */}
                <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>

                  {/* Colonne gauche - Bien & Revenus */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Home className="w-5 h-5 text-indigo-600" />
                        Caracteristiques du bien
                      </h3>

                      <div className="space-y-4">
                        {/* Prix d'acquisition */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Euro className="w-4 h-4 text-indigo-600" />
                            Prix d&apos;acquisition
                          </label>
                          <input
                            type="number"
                            value={formData.prixAcquisition}
                            onChange={(e) => updateForm('prixAcquisition', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                            placeholder="200000"
                          />
                        </div>

                        {/* Frais de notaire */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            Frais de notaire
                            <span className="text-xs font-normal text-gray-500">
                              ({formData.typeBien === 'neuf' ? '~2,5% neuf' : '~7,5% ancien'})
                            </span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={formData.fraisNotaireMontant}
                              onChange={(e) => {
                                updateForm('fraisNotaireMontant', e.target.value);
                                updateForm('fraisNotaireAuto', false);
                              }}
                              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                              placeholder="15000"
                            />
                            <button
                              onClick={() => updateForm('fraisNotaireAuto', true)}
                              className={`px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                                formData.fraisNotaireAuto
                                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                              }`}
                              title="Calcul automatique"
                            >
                              Auto
                            </button>
                          </div>
                        </div>

                        {/* Surface */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            Surface habitable (m²)
                          </label>
                          <input
                            type="number"
                            value={formData.surface}
                            onChange={(e) => updateForm('surface', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                            placeholder="45"
                          />
                        </div>

                        {/* Zone geographique */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            Zone geographique
                          </label>
                          <select
                            value={formData.zone}
                            onChange={(e) => updateForm('zone', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold bg-white"
                          >
                            {Object.entries(ZONES_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Type de bien */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Building className="w-4 h-4 text-indigo-600" />
                            Type de bien
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'neuf' as TypeBien, label: 'Neuf' },
                              { id: 'ancien' as TypeBien, label: 'Ancien' },
                              { id: 'ancien_travaux' as TypeBien, label: 'Ancien + travaux' }
                            ].map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateForm('typeBien', t.id)}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                                  formData.typeBien === t.id
                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Montant travaux */}
                        {(formData.typeBien === 'ancien_travaux') && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                              <Euro className="w-4 h-4 text-indigo-600" />
                              Montant des travaux
                            </label>
                            <input
                              type="number"
                              value={formData.montantTravaux}
                              onChange={(e) => updateForm('montantTravaux', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                              placeholder="30000"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Revenus locatifs */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-600" />
                        Revenus et charges
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Loyer mensuel envisage
                          </label>
                          <input
                            type="number"
                            value={formData.loyerMensuel}
                            onChange={(e) => updateForm('loyerMensuel', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold"
                            placeholder="800"
                          />
                          {dispConfig.dispositif === 'pinel' && resultats.loyerPlafondPinel > 0 && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Plafond Pinel zone {formData.zone} : {formatEurosDecimal(resultats.loyerPlafondPinel)}/mois
                              ({formatEurosDecimal(resultats.plafondLoyerPinel)}/m²)
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Charges mensuelles proprietaire
                          </label>
                          <input
                            type="number"
                            value={formData.chargesMensuelles}
                            onChange={(e) => updateForm('chargesMensuelles', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold"
                            placeholder="150"
                          />
                          <p className="text-xs text-gray-500 mt-1">Copropriete, gestion, entretien, assurance PNO...</p>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Taxe fonciere annuelle
                          </label>
                          <input
                            type="number"
                            value={formData.taxeFonciere}
                            onChange={(e) => updateForm('taxeFonciere', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold"
                            placeholder="1200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Vacance locative estimee (%)
                          </label>
                          <input
                            type="number"
                            value={formData.vacanceLocative}
                            onChange={(e) => updateForm('vacanceLocative', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold"
                            placeholder="5"
                            min="0"
                            max="100"
                          />
                          <p className="text-xs text-gray-500 mt-1">5% = environ 18 jours/an sans locataire</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite - Financement & Fiscalite */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-purple-600" />
                        Financement
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Apport personnel
                          </label>
                          <input
                            type="number"
                            value={formData.apport}
                            onChange={(e) => updateForm('apport', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
                            placeholder="40000"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Montant emprunt (calcule automatiquement)
                          </label>
                          <input
                            type="number"
                            value={formData.montantEmprunt}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-semibold text-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Percent className="w-4 h-4 text-purple-600" />
                            Taux d&apos;emprunt annuel (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.tauxEmprunt}
                            onChange={(e) => updateForm('tauxEmprunt', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
                            placeholder="3.20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Duree de l&apos;emprunt
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[10, 15, 20, 25].map(duree => (
                              <button
                                key={duree}
                                onClick={() => updateForm('dureeEmprunt', duree)}
                                className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                                  formData.dureeEmprunt === duree
                                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {duree} ans
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Taux assurance emprunteur (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.tauxAssurance}
                            onChange={(e) => updateForm('tauxAssurance', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
                            placeholder="0.36"
                          />
                        </div>
                      </div>
                    </div>

                    {/* TMI */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-amber-600" />
                        Tranche marginale d&apos;imposition (TMI)
                      </h3>
                      <div className="grid grid-cols-5 gap-2">
                        {[0, 11, 30, 41, 45].map(tmi => (
                          <button
                            key={tmi}
                            onClick={() => updateForm('tmi', tmi)}
                            className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                              formData.tmi === tmi
                                ? 'bg-amber-100 text-amber-700 border-amber-300'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {tmi} %
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Prelevements sociaux de 17,2% appliques en plus de la TMI sur les revenus fonciers
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================ */}
                {/* RESULTATS KPI */}
                {/* ============================================ */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <BarChart3 className="w-7 h-7 text-indigo-600" />
                      Resultats de la simulation
                    </h2>
                    <button
                      onClick={exporterPDF}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Exporter en PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Rendement brut */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
                      <p className="text-sm font-medium text-indigo-100">Rendement brut</p>
                      <p className="text-3xl font-black mt-1">{formatPct(resultats.rendementBrut)}</p>
                      <p className="text-xs text-indigo-200 mt-1">Loyer annuel / prix achat</p>
                    </div>
                    {/* Rendement net */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                      <p className="text-sm font-medium text-emerald-100">Rendement net</p>
                      <p className="text-3xl font-black mt-1">{formatPct(resultats.rendementNet)}</p>
                      <p className="text-xs text-emerald-200 mt-1">Apres charges et vacance</p>
                    </div>
                    {/* Rendement net-net */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
                      <p className="text-sm font-medium text-amber-100">Rendement net-net</p>
                      <p className="text-3xl font-black mt-1">{formatPct(resultats.rendementNetNet)}</p>
                      <p className="text-xs text-amber-200 mt-1">Apres impots et PS</p>
                    </div>
                    {/* Cash flow mensuel */}
                    <div className={`rounded-xl p-5 text-white shadow-lg ${
                      resultats.cashFlowMensuel >= 0
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-red-500 to-red-600'
                    }`}>
                      <p className="text-sm font-medium opacity-80">Cash flow mensuel</p>
                      <p className="text-3xl font-black mt-1">{formatEuros(Math.round(resultats.cashFlowMensuel))}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {resultats.cashFlowMensuel >= 0 ? 'Autofinancement positif' : 'Effort d\'epargne necessaire'}
                      </p>
                    </div>
                  </div>

                  {/* Details supplementaires */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Landmark className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-gray-900">Financement</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mensualite emprunt</span>
                          <span className="font-bold">{formatEurosDecimal(resultats.mensualiteTotale)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">dont interets</span>
                          <span className="font-semibold text-gray-500">{formatEurosDecimal(resultats.mensualiteTotale - resultats.mensualiteAssurance - (resultats.mensualiteHorsAssurance > 0 ? resultats.montantEmprunt / (formData.dureeEmprunt * 12) : 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">dont assurance</span>
                          <span className="font-semibold text-gray-500">{formatEurosDecimal(resultats.mensualiteAssurance)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="text-gray-600">Cout total credit</span>
                          <span className="font-bold text-purple-700">{formatEuros(Math.round(resultats.totalInterets + resultats.totalAssurance))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Euro className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">Bilan annuel</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loyer annuel brut</span>
                          <span className="font-bold">{formatEuros(resultats.loyerAnnuel)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loyer effectif (apres vacance)</span>
                          <span className="font-semibold">{formatEuros(Math.round(resultats.loyerAnnuel * (1 - resultats.vacance / 100)))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Charges annuelles</span>
                          <span className="font-semibold text-red-600">-{formatEuros(Math.round(resultats.chargesAnnuelles))}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="text-gray-600">Revenu net foncier</span>
                          <span className="font-bold text-green-700">{formatEuros(Math.round(resultats.revenuNetAnnuel))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-gray-900">Couts totaux</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Prix d&apos;acquisition</span>
                          <span className="font-bold">{formatEuros(resultats.prix)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Frais de notaire</span>
                          <span className="font-semibold">{formatEuros(resultats.fraisNotaire)}</span>
                        </div>
                        {resultats.travaux > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Travaux</span>
                            <span className="font-semibold">{formatEuros(resultats.travaux)}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between">
                          <span className="text-gray-600">Prix de revient total</span>
                          <span className="font-bold text-indigo-700">{formatEuros(resultats.prixRevient)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Effort d&apos;epargne/mois</span>
                          <span className={`font-bold ${resultats.effortEpargne > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {resultats.effortEpargne > 0 ? formatEuros(Math.round(resultats.effortEpargne)) : 'Aucun'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graphiques */}
                  <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                    {/* Bar chart rendements */}
                    <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Comparaison des rendements
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartRendements}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
                          <Tooltip formatter={(value: number) => `${value.toFixed(2)} %`} />
                          <Bar dataKey="value" name="Rendement" radius={[8, 8, 0, 0]}>
                            {chartRendements.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie chart repartition couts */}
                    <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-indigo-600" />
                        Repartition des couts sur la duree
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={chartCouts}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: Record<string, unknown>) =>
                              `${String(name || '').length > 15 ? String(name).substring(0, 15) + '...' : String(name)} ${(Number(percent || 0) * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {chartCouts.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={tooltipFormatter} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* TAB: DISPOSITIFS FISCAUX */}
            {/* ============================================ */}
            {activeTab === 'dispositifs' && (
              <div className="p-6 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-indigo-600" />
                  Selection du dispositif fiscal
                </h2>

                {/* Selection dispositif */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'aucun' as Dispositif, label: 'Aucun', desc: 'Droit commun' },
                    { id: 'pinel' as Dispositif, label: 'Pinel', desc: 'Neuf - Termine fin 2024' },
                    { id: 'denormandie' as Dispositif, label: 'Denormandie', desc: 'Ancien + travaux' },
                    { id: 'loc_avantages' as Dispositif, label: 'Loc\'Avantages', desc: 'Loyers moderes' },
                    { id: 'deficit_foncier' as Dispositif, label: 'Deficit foncier', desc: 'Travaux deductibles' },
                    { id: 'malraux' as Dispositif, label: 'Malraux', desc: 'Patrimoine historique' },
                    { id: 'lmnp' as Dispositif, label: 'LMNP', desc: 'Meuble non pro' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => updateDisp('dispositif', d.id)}
                      className={`p-4 rounded-xl text-left transition-all border-2 ${
                        dispConfig.dispositif === d.id
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-300 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-bold text-sm">{d.label}</p>
                      <p className="text-xs opacity-70 mt-1">{d.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Configuration specifique selon dispositif */}
                {dispConfig.dispositif === 'pinel' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-blue-600" />
                      Configuration Pinel (taux reduits 2024)
                    </h3>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Le dispositif Pinel a pris fin le 31 decembre 2024. Ces taux s&apos;appliquent aux investissements realises avant cette date.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Duree d&apos;engagement de location
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {([6, 9, 12] as DureePinel[]).map(duree => (
                            <button
                              key={duree}
                              onClick={() => updateDisp('dureePinel', duree)}
                              className={`py-3 rounded-xl font-bold transition-all border-2 ${
                                dispConfig.dureePinel === duree
                                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <p>{duree} ans</p>
                              <p className="text-xs mt-1 opacity-70">Taux : {(TAUX_PINEL[duree] * 100)}%</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm font-bold text-gray-700 mb-2">Zones eligibles : A bis, A, B1</p>
                        <p className="text-sm text-gray-600">
                          Plafond loyer zone {formData.zone} : <strong>{PLAFONDS_LOYER_PINEL[formData.zone]?.toFixed(2) || 'N/A'} €/m²</strong>
                          {' '} soit <strong>{formatEurosDecimal((PLAFONDS_LOYER_PINEL[formData.zone] || 0) * parseNumber(formData.surface))}/mois</strong> pour {formData.surface} m²
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Plafond investissement : <strong>{formatEuros(PLAFOND_INVESTISSEMENT_PINEL)}</strong> et <strong>5 500 €/m²</strong>
                        </p>
                      </div>

                      {/* Plafonds de ressources locataires */}
                      {ZONE_TO_PLAFOND_KEY[formData.zone] && (
                        <div className="bg-white rounded-lg border overflow-hidden">
                          <button
                            onClick={() => setShowPlafondsRessources(!showPlafondsRessources)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                              <Info className="w-4 h-4 text-indigo-500" />
                              Plafonds de ressources des locataires (2025)
                            </span>
                            {showPlafondsRessources
                              ? <ChevronUp className="w-4 h-4 text-indigo-500" />
                              : <ChevronDown className="w-4 h-4 text-indigo-500" />
                            }
                          </button>
                          {showPlafondsRessources && (
                            <div className="px-4 pb-4">
                              <p className="text-xs text-gray-500 mb-3">
                                Revenus fiscaux de reference N-2 du locataire — Zone {ZONE_TO_PLAFOND_KEY[formData.zone]}
                              </p>
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-indigo-50">
                                    <th className="text-left p-2 border border-indigo-100 text-indigo-800 font-semibold">Composition du foyer</th>
                                    <th className="text-right p-2 border border-indigo-100 text-indigo-800 font-semibold">Plafond annuel</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(PLAFONDS_RESSOURCES_PINEL[ZONE_TO_PLAFOND_KEY[formData.zone]]).map(([label, montant]) => (
                                    <tr key={label} className="hover:bg-gray-50">
                                      <td className="p-2 border border-gray-100 text-gray-700">{label}</td>
                                      <td className="p-2 border border-gray-100 text-right font-semibold text-gray-900">{formatEuros(montant)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {dispConfig.dispositif === 'denormandie' && (
                  <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 border border-teal-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-teal-600" />
                      Configuration Denormandie
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Duree d&apos;engagement de location
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {([6, 9, 12] as DureePinel[]).map(duree => (
                            <button
                              key={duree}
                              onClick={() => updateDisp('dureePinel', duree)}
                              className={`py-3 rounded-xl font-bold transition-all border-2 ${
                                dispConfig.dureePinel === duree
                                  ? 'bg-teal-100 text-teal-700 border-teal-300'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <p>{duree} ans</p>
                              <p className="text-xs mt-1 opacity-70">Taux : {(TAUX_PINEL[duree] * 100)}%</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-700">
                          <strong>Condition :</strong> travaux minimum 25% du cout total de l&apos;operation.
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Zones : communes labellisees &quot;Coeur de ville&quot; + ORT (Operation de Revitalisation de Territoire)
                        </p>
                        {formData.typeBien === 'ancien_travaux' && (
                          <p className="text-sm mt-2 font-semibold">
                            Part travaux actuelle : {((parseNumber(formData.montantTravaux) / (parseNumber(formData.prixAcquisition) + parseNumber(formData.montantTravaux))) * 100).toFixed(1)}%
                            {parseNumber(formData.montantTravaux) / (parseNumber(formData.prixAcquisition) + parseNumber(formData.montantTravaux)) >= 0.25
                              ? <span className="text-green-600 ml-2">Eligible</span>
                              : <span className="text-red-600 ml-2">Insuffisant (min 25%)</span>
                            }
                          </p>
                        )}
                      </div>

                      {/* Plafonds de ressources locataires */}
                      {ZONE_TO_PLAFOND_KEY[formData.zone] && (
                        <div className="bg-white rounded-lg border overflow-hidden">
                          <button
                            onClick={() => setShowPlafondsRessources(!showPlafondsRessources)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-bold text-teal-700 flex items-center gap-2">
                              <Info className="w-4 h-4 text-teal-500" />
                              Plafonds de ressources des locataires (2025)
                            </span>
                            {showPlafondsRessources
                              ? <ChevronUp className="w-4 h-4 text-teal-500" />
                              : <ChevronDown className="w-4 h-4 text-teal-500" />
                            }
                          </button>
                          {showPlafondsRessources && (
                            <div className="px-4 pb-4">
                              <p className="text-xs text-gray-500 mb-3">
                                Revenus fiscaux de reference N-2 du locataire — Zone {ZONE_TO_PLAFOND_KEY[formData.zone]}
                              </p>
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-teal-50">
                                    <th className="text-left p-2 border border-teal-100 text-teal-800 font-semibold">Composition du foyer</th>
                                    <th className="text-right p-2 border border-teal-100 text-teal-800 font-semibold">Plafond annuel</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(PLAFONDS_RESSOURCES_PINEL[ZONE_TO_PLAFOND_KEY[formData.zone]]).map(([label, montant]) => (
                                    <tr key={label} className="hover:bg-gray-50">
                                      <td className="p-2 border border-gray-100 text-gray-700">{label}</td>
                                      <td className="p-2 border border-gray-100 text-right font-semibold text-gray-900">{formatEuros(montant)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {dispConfig.dispositif === 'loc_avantages' && (
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-violet-600" />
                      Configuration Loc&apos;Avantages (ex-Cosse)
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Niveau de loyer
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'loc1' as NiveauLocAvantages, label: 'Loc1', desc: 'Intermediaire' },
                            { id: 'loc2' as NiveauLocAvantages, label: 'Loc2', desc: 'Social' },
                            { id: 'loc3' as NiveauLocAvantages, label: 'Loc3', desc: 'Tres social' }
                          ].map(n => (
                            <button
                              key={n.id}
                              onClick={() => updateDisp('niveauLocAvantages', n.id)}
                              className={`py-3 rounded-xl font-bold transition-all border-2 text-center ${
                                dispConfig.niveauLocAvantages === n.id
                                  ? 'bg-violet-100 text-violet-700 border-violet-300'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <p>{n.label}</p>
                              <p className="text-xs mt-1 opacity-70">{n.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="intermediation"
                          checked={dispConfig.intermediationLocAvantages}
                          onChange={(e) => updateDisp('intermediationLocAvantages', e.target.checked)}
                          className="w-5 h-5 text-violet-600 rounded"
                        />
                        <label htmlFor="intermediation" className="text-sm font-semibold text-gray-700">
                          Intermediation locative (mandat de gestion par un organisme agree)
                        </label>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-700">
                          <strong>Reduction d&apos;impot :</strong>{' '}
                          {(() => {
                            const cfg = TAUX_LOC_AVANTAGES[dispConfig.niveauLocAvantages];
                            if (dispConfig.niveauLocAvantages === 'loc3' && !dispConfig.intermediationLocAvantages) {
                              return 'Loc3 necessite obligatoirement une intermediation locative.';
                            }
                            const taux = dispConfig.intermediationLocAvantages ? cfg.avec : cfg.sans;
                            return `${(taux * 100)}% des revenus locatifs bruts`;
                          })()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Engagement minimum : 6 ans de location
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {dispConfig.dispositif === 'deficit_foncier' && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                      Deficit foncier
                    </h3>

                    <div className="bg-white rounded-lg p-4 border space-y-3">
                      <p className="text-sm text-gray-700">
                        Les travaux d&apos;entretien, de reparation et d&apos;amelioration sont deductibles des revenus fonciers.
                        L&apos;excedent est imputable sur le revenu global dans la limite de :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <strong>10 700 €/an</strong> (cas general)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <strong>21 400 €/an</strong> pour les travaux de renovation energetique (jusqu&apos;au 31/12/2025)
                        </li>
                      </ul>
                      <p className="text-sm text-gray-600">
                        Le deficit non impute est reportable sur les revenus fonciers des 10 annees suivantes.
                      </p>
                      {formData.typeBien === 'ancien_travaux' && parseNumber(formData.montantTravaux) > 0 && (
                        <div className="bg-orange-50 rounded-lg p-3 mt-2">
                          <p className="text-sm font-semibold text-orange-800">
                            Avec {formatEuros(parseNumber(formData.montantTravaux))} de travaux :
                            economie d&apos;impot estimee en annee 1 = <strong>{formatEuros(Math.round(Math.min(parseNumber(formData.montantTravaux), PLAFOND_DEFICIT_FONCIER) * (formData.tmi / 100)))}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {dispConfig.dispositif === 'malraux' && (
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-rose-600" />
                      Loi Malraux
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Type de secteur
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'zppaup' as SecteurMalraux, label: 'ZPPAUP / AVAP', taux: '22%' },
                            { id: 'sauvegarde' as SecteurMalraux, label: 'Secteur sauvegarde / QAD', taux: '30%' }
                          ].map(s => (
                            <button
                              key={s.id}
                              onClick={() => updateDisp('secteurMalraux', s.id)}
                              className={`py-3 rounded-xl font-bold transition-all border-2 text-center ${
                                dispConfig.secteurMalraux === s.id
                                  ? 'bg-rose-100 text-rose-700 border-rose-300'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <p>{s.label}</p>
                              <p className="text-xs mt-1 opacity-70">Reduction : {s.taux}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Montant des travaux eligibles Malraux
                        </label>
                        <input
                          type="number"
                          value={dispConfig.montantTravauxMalraux}
                          onChange={(e) => updateDisp('montantTravauxMalraux', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-semibold"
                          placeholder="100000"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Plafond : {formatEuros(PLAFOND_TRAVAUX_MALRAUX)} sur 4 ans
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-700">
                          <strong>Avantage :</strong> non soumis au plafonnement global des niches fiscales (10 000 €/an).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {dispConfig.dispositif === 'lmnp' && (
                  <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-6 border border-cyan-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Home className="w-5 h-5 text-cyan-600" />
                      LMNP - Loueur Meuble Non Professionnel
                    </h3>

                    <div className="bg-white rounded-lg p-4 border space-y-3">
                      <p className="text-sm text-gray-700">
                        Le statut LMNP permet de beneficier d&apos;un regime fiscal avantageux sur les revenus de location meublee.
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                        <div className="bg-cyan-50 rounded-lg p-3">
                          <p className="text-sm font-bold text-cyan-800">Micro-BIC</p>
                          <p className="text-xs text-cyan-700 mt-1">
                            Abattement forfaitaire de 50% sur les recettes (plafond 77 700 €/an).
                            Abattement reduit a 30% pour les meubles de tourisme non classes depuis 2024.
                          </p>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-3">
                          <p className="text-sm font-bold text-cyan-800">Reel simplifie</p>
                          <p className="text-xs text-cyan-700 mt-1">
                            Deduction des charges reelles + amortissement du bien et du mobilier.
                            Permet souvent de neutraliser l&apos;imposition pendant 10-15 ans.
                          </p>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                        <p className="text-xs text-amber-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          Depuis 2025, la plus-value de revente ne beneficie plus de l&apos;exclusion de l&apos;amortissement
                          pour les meubles de tourisme. Le regime general (particuliers) reste inchange.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resultat avantage fiscal */}
                {dispConfig.dispositif !== 'aucun' && (
                  <div className="bg-white rounded-xl border-2 border-indigo-100 p-6 shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-6 h-6 text-indigo-600" />
                      Avantage fiscal estime
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-5 text-white">
                        <p className="text-sm text-indigo-100">Avantage fiscal annuel</p>
                        <p className="text-3xl font-black mt-1">{formatEuros(Math.round(resultats.avantageFiscalAnnuel))}</p>
                        <p className="text-xs text-indigo-200 mt-1">soit {formatEuros(Math.round(resultats.avantageFiscalAnnuel / 12))}/mois</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 text-white">
                        <p className="text-sm text-green-100">Avantage fiscal total</p>
                        <p className="text-3xl font-black mt-1">{formatEuros(Math.round(resultats.avantageFiscalTotal))}</p>
                        <p className="text-xs text-green-200 mt-1">sur la duree du dispositif</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white">
                        <p className="text-sm text-amber-100">Rendement net-net avec dispositif</p>
                        <p className="text-3xl font-black mt-1">{formatPct(resultats.rendementNetNet)}</p>
                        <p className="text-xs text-amber-200 mt-1">apres avantage fiscal</p>
                      </div>
                    </div>

                    {resultats.eligibilite.raison && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                        <p className="text-sm text-amber-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {resultats.eligibilite.raison}
                        </p>
                      </div>
                    )}

                    {/* Comparaison avec/sans */}
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left p-3 font-bold text-gray-700 border-b-2">Indicateur</th>
                            <th className="text-right p-3 font-bold text-gray-700 border-b-2">Sans dispositif</th>
                            <th className="text-right p-3 font-bold text-indigo-700 border-b-2">Avec {dispConfig.dispositif.replace('_', ' ')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-3 text-gray-600">Rendement net-net</td>
                            <td className="p-3 text-right font-semibold">{formatPct(calculerRendementNetNet(
                              resultats.loyerAnnuel, resultats.charges, resultats.taxeFonciere,
                              resultats.vacance, resultats.prix, resultats.fraisNotaire, formData.tmi, 0
                            ))}</td>
                            <td className="p-3 text-right font-bold text-indigo-700">{formatPct(resultats.rendementNetNet)}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 text-gray-600">Cash flow mensuel</td>
                            <td className="p-3 text-right font-semibold">{formatEuros(Math.round(resultats.cashFlowMensuel - resultats.avantageFiscalAnnuel / 12))}</td>
                            <td className="p-3 text-right font-bold text-indigo-700">{formatEuros(Math.round(resultats.cashFlowMensuel))}</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-gray-600">Economie fiscale totale</td>
                            <td className="p-3 text-right font-semibold">-</td>
                            <td className="p-3 text-right font-bold text-green-600">{formatEuros(Math.round(resultats.avantageFiscalTotal))}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================ */}
            {/* TAB: PROJECTION */}
            {/* ============================================ */}
            {activeTab === 'projection' && (
              <div className="p-6 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-indigo-600" />
                  Projection patrimoniale
                </h2>

                {/* Parametres de projection */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Parametres de projection</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Duree de projection (ans)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={30}
                        value={projConfig.dureeProjection}
                        onChange={(e) => updateProj('dureeProjection', parseInt(e.target.value) || 20)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Valorisation annuelle du bien (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={projConfig.tauxValorisationBien}
                        onChange={(e) => updateProj('tauxValorisationBien', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Revalorisation annuelle des loyers (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={projConfig.tauxRevalorisationLoyer}
                        onChange={(e) => updateProj('tauxRevalorisationLoyer', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* KPI projection */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm text-indigo-100">Plus-value estimee</p>
                    <p className="text-2xl font-black mt-1">{formatEuros(Math.round(projectionData.plusValue))}</p>
                    <p className="text-xs text-indigo-200 mt-1">a {projConfig.dureeProjection} ans</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm text-emerald-100">TRI global</p>
                    <p className="text-2xl font-black mt-1">{isFinite(projectionData.tri) ? formatPct(projectionData.tri) : 'N/A'}</p>
                    <p className="text-xs text-emerald-200 mt-1">taux de rendement interne</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm text-purple-100">Patrimoine net</p>
                    <p className="text-2xl font-black mt-1">
                      {projectionData.data.length > 0
                        ? formatEuros(projectionData.data[projectionData.data.length - 1].patrimoine)
                        : '-'}
                    </p>
                    <p className="text-xs text-purple-200 mt-1">valeur bien - capital restant du</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-sm text-amber-100">Cash flow cumule</p>
                    <p className="text-2xl font-black mt-1">
                      {projectionData.data.length > 0
                        ? formatEuros(projectionData.data[projectionData.data.length - 1].cashFlowCumule)
                        : '-'}
                    </p>
                    <p className="text-xs text-amber-200 mt-1">sur {projConfig.dureeProjection} ans</p>
                  </div>
                </div>

                {/* Graphique evolution patrimoine */}
                <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Evolution du patrimoine et du capital restant du
                  </h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={projectionData.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="annee" tickFormatter={(v: number) => `An ${v}`} />
                      <YAxis tickFormatter={yAxisFormatter} />
                      <Tooltip formatter={tooltipFormatter} labelFormatter={(v: number) => `Annee ${v}`} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="valeurBien"
                        name="Valeur du bien"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="patrimoine"
                        name="Patrimoine net"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="capitalRestant"
                        name="Capital restant du"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Graphique cash flow cumule */}
                <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-600" />
                    Cash flow cumule et loyers percus
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projectionData.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="annee" tickFormatter={(v: number) => `An ${v}`} />
                      <YAxis tickFormatter={yAxisFormatter} />
                      <Tooltip formatter={tooltipFormatter} labelFormatter={(v: number) => `Annee ${v}`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="loyerCumule"
                        name="Loyers cumules"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="cashFlowCumule"
                        name="Cash flow cumule"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="chargesCumulees"
                        name="Charges cumulees"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Tableau de rentabilite annuelle */}
                <div className="bg-white rounded-xl border-2 border-gray-100 p-5 overflow-x-auto">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Tableau de projection annuelle
                  </h4>
                  <table className="w-full text-sm border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 font-bold text-gray-700 border-b-2">Annee</th>
                        <th className="text-right p-3 font-bold text-gray-700 border-b-2">Valeur bien</th>
                        <th className="text-right p-3 font-bold text-gray-700 border-b-2">Capital rembourse</th>
                        <th className="text-right p-3 font-bold text-gray-700 border-b-2">Capital restant</th>
                        <th className="text-right p-3 font-bold text-gray-700 border-b-2">Patrimoine net</th>
                        <th className="text-right p-3 font-bold text-gray-700 border-b-2">Cash flow cumule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectionData.data
                        .filter((_, i) => i % Math.max(1, Math.floor(projConfig.dureeProjection / 10)) === 0 || i === projectionData.data.length - 1)
                        .map((row) => (
                        <tr key={row.annee} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-semibold text-gray-900">An {row.annee}</td>
                          <td className="p-3 text-right font-semibold">{formatEuros(row.valeurBien)}</td>
                          <td className="p-3 text-right text-green-600">{formatEuros(row.capitalRembourse)}</td>
                          <td className="p-3 text-right text-red-600">{formatEuros(row.capitalRestant)}</td>
                          <td className="p-3 text-right font-bold text-indigo-700">{formatEuros(row.patrimoine)}</td>
                          <td className={`p-3 text-right font-semibold ${row.cashFlowCumule >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatEuros(row.cashFlowCumule)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* TAB: FAQ */}
            {/* ============================================ */}
            {activeTab === 'faq' && (
              <div className="p-6">
                <FAQSection />
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* DISCLAIMER */}
          {/* ============================================ */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900">Avertissement</h3>
                <p className="text-sm text-amber-800 mt-1">
                  Ce simulateur fournit des estimations a titre indicatif et ne constitue en aucun cas un conseil en investissement,
                  un conseil fiscal ou une recommandation personnalisee. Les resultats dependent des hypotheses saisies et des baremes
                  fiscaux en vigueur, susceptibles d&apos;evoluer. Pour tout projet d&apos;investissement locatif, consultez un notaire,
                  un conseiller en gestion de patrimoine ou un expert-comptable.
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

// ============================================
// COMPOSANT FAQ
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Rentabilite et rendement",
      questions: [
        {
          q: "Comment calculer la rentabilite d'un investissement locatif ?",
          r: "La rentabilite d'un investissement locatif se mesure a plusieurs niveaux. Le rendement brut est le plus simple : (loyer annuel / prix d'acquisition) x 100. Il donne une premiere indication mais ne reflete pas la realite economique. Le rendement net integre les charges (copropriete, gestion, taxe fonciere, assurance PNO, vacance locative) et les frais de notaire. Le rendement net-net, le plus precis, deduit egalement la fiscalite (impot sur les revenus fonciers + prelevements sociaux de 17,2%). En France, un rendement brut de 5-7% est considere comme correct, un rendement net de 3-5% comme satisfaisant."
        },
        {
          q: "Quelle difference entre rendement brut, net et net-net ?",
          r: "Le rendement brut = (loyer annuel / prix achat) x 100. C'est un indicateur rapide de comparaison entre biens, mais il ne tient compte d'aucune charge. Le rendement net = ((loyer - charges annuelles) / (prix + frais notaire)) x 100. Il integre les charges de copropriete, la taxe fonciere, l'assurance, les frais de gestion et la vacance locative. Le rendement net-net = rendement net apres deduction de l'impot sur les revenus fonciers (TMI + prelevements sociaux 17,2%) et ajout de l'eventuel avantage fiscal. C'est le seul indicateur qui reflete votre rentabilite reelle. Exemple : un bien a 200 000€ loue 800€/mois = 4,8% brut, ~3,5% net, ~2,3% net-net pour une TMI a 30%."
        },
        {
          q: "Comment estimer le cash flow d'un investissement locatif ?",
          r: "Le cash flow mensuel est la difference entre vos recettes et toutes vos depenses : Cash flow = Loyer effectif - Mensualite emprunt (capital + interets + assurance) - Charges de copropriete - Taxe fonciere/12 - Frais de gestion - Impots sur revenus fonciers/12 + Avantage fiscal/12. Un cash flow positif (autofinancement) signifie que le bien se rembourse tout seul. Un cash flow negatif implique un effort d'epargne mensuel. Pour maximiser le cash flow : augmentez l'apport (reduit la mensualite), negociez le prix d'achat, optimisez la fiscalite (LMNP, deficit foncier), et ciblez des zones a fort rendement locatif."
        }
      ]
    },
    {
      category: "Dispositifs fiscaux",
      questions: [
        {
          q: "Le dispositif Pinel est-il encore valable en 2025 ?",
          r: "Le dispositif Pinel a officiellement pris fin le 31 decembre 2024. Les investisseurs ayant acquis un bien avant cette date continuent de beneficier de la reduction d'impot pendant toute la duree de leur engagement (6, 9 ou 12 ans). Les taux reduits de 2024 etaient : 9% sur 6 ans, 12% sur 9 ans, et 14% sur 12 ans, pour un plafond de 300 000€ d'investissement et 5 500€/m². Les zones eligibles etaient A bis, A et B1. Aucun dispositif equivalent n'a ete annonce pour le remplacer. Les alternatives actuelles sont le Denormandie (ancien avec travaux), Loc'Avantages, le deficit foncier ou le statut LMNP."
        },
        {
          q: "Qu'est-ce que le dispositif Denormandie ?",
          r: "Le Denormandie est un dispositif fiscal pour l'investissement dans l'ancien avec travaux, proroge jusqu'au 31 decembre 2027. Il offre les memes avantages que le Pinel (reduction d'impot de 9%, 12% ou 14% selon la duree d'engagement) mais s'applique aux logements anciens necessitant des travaux representant au moins 25% du cout total de l'operation. Les travaux eligibles sont : amelioration, renovation energetique, transformation en logement, modernisation. Les zones concernees sont les communes labellisees 'Coeur de ville' et celles ayant signe une convention ORT (Operation de Revitalisation de Territoire), soit plus de 300 villes moyennes."
        },
        {
          q: "Comment fonctionne le deficit foncier ?",
          r: "Le deficit foncier permet de deduire les charges et travaux de vos revenus fonciers, et d'imputer l'excedent sur votre revenu global. Les depenses deductibles sont : travaux d'entretien, de reparation et d'amelioration (pas de construction/agrandissement), interets d'emprunt (uniquement des revenus fonciers), charges de copropriete, assurances, frais de gestion. Le plafond d'imputation sur le revenu global est de 10 700€/an (21 400€ pour les travaux de renovation energetique jusqu'au 31/12/2025). Le deficit non impute se reporte sur les revenus fonciers des 10 annees suivantes. Condition : conserver le bien en location pendant 3 ans apres l'imputation."
        }
      ]
    },
    {
      category: "Financement et strategie",
      questions: [
        {
          q: "Quel apport pour un investissement locatif ?",
          r: "Pour un investissement locatif, les banques demandent generalement un apport de 10 a 20% du prix total (bien + frais de notaire + travaux). L'apport sert principalement a couvrir les frais de notaire (7,5% dans l'ancien, 2,5% dans le neuf) et les frais annexes. Certaines banques acceptent un financement a 110% (sans apport) pour les excellents profils : revenus eleves, CDI stable, patrimoine existant, faible endettement. L'apport influence directement votre cash flow : plus il est eleve, plus la mensualite est faible, plus le cash flow est positif. Strategie : un apport de 20-30% est souvent optimal pour concilier effet de levier du credit et cash flow positif."
        },
        {
          q: "Quelle zone choisir pour investir ?",
          r: "Le choix de la zone depend de votre strategie. Zone A bis / A (Paris, Lyon, Marseille) : prix eleves, rendement brut faible (3-4%) mais forte valorisation patrimoniale et faible vacance locative. Zone B1 (grandes villes > 250 000 hab.) : bon compromis rendement/securite (4-6% brut). Zone B2/C (villes moyennes, rural) : rendements bruts eleves (6-10%) mais risque de vacance locative plus fort, moins de valorisation. Criteres cles : tension locative (demande > offre), bassin d'emploi dynamique, transports, universites, evolution demographique. Les villes comme Rennes, Nantes, Montpellier, Toulouse offrent actuellement un bon equilibre rendement/securite."
        },
        {
          q: "Faut-il investir dans le neuf ou l'ancien ?",
          r: "Neuf : frais de notaire reduits (~2,5%), pas de travaux pendant 10 ans (garanties), normes energetiques actuelles (RE 2020), eligible a certains dispositifs (Pinel historique). Inconvenients : prix au m² plus eleve (20-30% de plus), rendement brut plus faible. Ancien : prix d'achat inferieur, meilleurs rendements locatifs, emplacement souvent plus central, possibilite de creer de la valeur avec des travaux. Inconvenients : frais de notaire plus eleves (~7,5%), travaux potentiels, performance energetique parfois faible. Ancien avec travaux : le meilleur des deux mondes avec les dispositifs Denormandie ou deficit foncier, mais necessite plus de gestion de projet. Pour un premier investissement, l'ancien bien situe est souvent le choix le plus pertinent."
        },
        {
          q: "Comment optimiser la fiscalite de son investissement locatif ?",
          r: "Plusieurs leviers s'offrent a vous selon votre situation. 1) LMNP (location meublee) : en regime reel, l'amortissement du bien et du mobilier permet souvent de neutraliser l'imposition pendant 10-15 ans. 2) Deficit foncier : en location nue avec travaux importants, deductibles des revenus fonciers et du revenu global (10 700€/an). 3) SCI a l'IS : pour les investisseurs a forte TMI, l'imposition a l'IS (15% jusqu'a 42 500€) + amortissement peut etre avantageux. 4) Regime micro-foncier : si vos revenus fonciers < 15 000€/an, abattement forfaitaire de 30%. 5) Loc'Avantages : reduction d'impot en echange de loyers moderes. Le choix depend de votre TMI, de votre patrimoine existant, et de votre strategie a long terme. Un conseiller en gestion de patrimoine peut vous aider a optimiser."
        }
      ]
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-indigo-600" />
          Questions frequentes sur l&apos;investissement locatif
        </h2>
        <p className="text-gray-600 mt-2">
          Tout ce que vous devez savoir pour reussir votre investissement immobilier
        </p>
      </div>

      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8 last:mb-0">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {category.category}
          </h3>
          <div className="space-y-3">
            {category.questions.map((faq, questionIndex) => {
              const globalIndex = categoryIndex * 100 + questionIndex;
              const isOpen = openIndex === globalIndex;

              return (
                <div
                  key={questionIndex}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
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
      ))}
    </div>
  );
}
