// ============================================
// FILE: src/app/holding/page.tsx
// DESCRIPTION: Simulateur Holding Patrimoniale - NotariaPrime
// ============================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, TrendingUp, Calculator, PieChart as PieChartIcon,
  AlertCircle, Info, HelpCircle, ChevronDown, ChevronUp, BookOpen,
  Landmark, Euro, Plus, Trash2, Shield, ArrowRight, ArrowDown,
  Briefcase, Users, Gift, Scale, Banknote, BarChart3, Percent,
  Home, FileText, Target, Lightbulb, RefreshCw, Save, FolderOpen, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

interface BienImmobilier {
  id: number;
  nom: string;
  valeur: string;
  loyerMensuel: string;
  chargesMensuelles: string;
  taxeFonciere: string;
}

interface FormData {
  biens: BienImmobilier[];
  empruntActif: boolean;
  montantEmprunt: string;
  tauxEmprunt: string;
  dureeEmprunt: string;
  tmi: number;
  revenusAutres: string;
  objectif: 'capitalisation' | 'distribution' | 'transmission';
  fraisGestionHolding: string;
  fraisComptables: string;
  tauxAmortissement: string;
  decoteIlliquidite: string;
  ageDonateur: string;
  nombreEnfants: string;
}

// ============================================
// CONSTANTES
// ============================================

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff'];
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const BAREME_IR = [
  { min: 0, max: 11294, taux: 0 },
  { min: 11294, max: 28797, taux: 0.11 },
  { min: 28797, max: 82341, taux: 0.30 },
  { min: 82341, max: 177106, taux: 0.41 },
  { min: 177106, max: Infinity, taux: 0.45 }
];

const TAUX_PS_FONCIER = 0.172; // PS revenus fonciers (non impactés LFSS 2026)
const FLAT_TAX_IR = 0.128;
const FLAT_TAX_PS = 0.186; // LFSS 2026
const FLAT_TAX_TOTAL = 0.314; // 12.8% IR + 18.6% PS (LFSS 2026)
const IS_TAUX_REDUIT = 0.15;
const IS_TAUX_REDUIT_PLAFOND = 42500;
const IS_TAUX_NORMAL = 0.25;
const QUOTE_PART_MERE_FILLE = 0.05;

const BAREME_USUFRUIT = [
  { ageMax: 20, usufruit: 90, nuePropriete: 10 },
  { ageMax: 30, usufruit: 80, nuePropriete: 20 },
  { ageMax: 40, usufruit: 70, nuePropriete: 30 },
  { ageMax: 50, usufruit: 60, nuePropriete: 40 },
  { ageMax: 60, usufruit: 50, nuePropriete: 50 },
  { ageMax: 70, usufruit: 40, nuePropriete: 60 },
  { ageMax: 80, usufruit: 30, nuePropriete: 70 },
  { ageMax: 90, usufruit: 20, nuePropriete: 80 },
  { ageMax: Infinity, usufruit: 10, nuePropriete: 90 }
];

const ABATTEMENT_DONATION_ENFANT = 100000;

const BAREME_DONATION_LIGNE_DIRECTE = [
  { max: 8072, taux: 0.05 },
  { max: 12109, taux: 0.10 },
  { max: 15932, taux: 0.15 },
  { max: 552324, taux: 0.20 },
  { max: 902838, taux: 0.30 },
  { max: 1805677, taux: 0.40 },
  { max: Infinity, taux: 0.45 }
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function parseNumber(str: string): number {
  if (!str || str.trim() === '') return 0;
  let cleaned = str.replace(/\s+/g, '').replace(/\u00A0/g, '').replace(/\u202F/g, '');
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

function formatMontantInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerIS(resultatFiscal: number): number {
  if (resultatFiscal <= 0) return 0;
  if (resultatFiscal <= IS_TAUX_REDUIT_PLAFOND) {
    return resultatFiscal * IS_TAUX_REDUIT;
  }
  return IS_TAUX_REDUIT_PLAFOND * IS_TAUX_REDUIT + (resultatFiscal - IS_TAUX_REDUIT_PLAFOND) * IS_TAUX_NORMAL;
}

function calculerIRSurRevensFonciers(revenuImposable: number, tmi: number): number {
  return revenuImposable * (tmi / 100);
}

function calculerMensualiteEmprunt(capital: number, tauxAnnuel: number, dureeMois: number): number {
  if (capital <= 0 || tauxAnnuel <= 0 || dureeMois <= 0) return 0;
  const tauxMensuel = tauxAnnuel / 100 / 12;
  return capital * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -dureeMois));
}

function calculerInteretsAnnuels(capital: number, tauxAnnuel: number, dureeMois: number, annee: number): number {
  if (capital <= 0 || tauxAnnuel <= 0 || dureeMois <= 0) return 0;
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const mensualite = calculerMensualiteEmprunt(capital, tauxAnnuel, dureeMois);
  let capitalRestant = capital;
  let interetsAnnee = 0;

  for (let m = 1; m <= Math.min(annee * 12, dureeMois); m++) {
    const interet = capitalRestant * tauxMensuel;
    if (m > (annee - 1) * 12 && m <= annee * 12) {
      interetsAnnee += interet;
    }
    capitalRestant -= (mensualite - interet);
  }
  return interetsAnnee;
}

function calculerDroitsDonation(montantTaxable: number): number {
  if (montantTaxable <= 0) return 0;
  let droits = 0;
  let restant = montantTaxable;
  let tranchePrecedente = 0;

  for (const tranche of BAREME_DONATION_LIGNE_DIRECTE) {
    const base = Math.min(restant, tranche.max - tranchePrecedente);
    if (base <= 0) break;
    droits += base * tranche.taux;
    restant -= base;
    tranchePrecedente = tranche.max;
  }
  return droits;
}

function getValeurUsufruit(age: number): { usufruit: number; nuePropriete: number } {
  for (const tranche of BAREME_USUFRUIT) {
    if (age <= tranche.ageMax) {
      return { usufruit: tranche.usufruit, nuePropriete: tranche.nuePropriete };
    }
  }
  return { usufruit: 10, nuePropriete: 90 };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function HoldingPatrimoniale() {
  const [activeTab, setActiveTab] = useState<'comparaison' | 'flux' | 'transmission' | 'faq'>('comparaison');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [nomSimulation, setNomSimulation] = useState('');
  const [simulations, setSimulations] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    biens: [
      { id: 1, nom: 'Bien 1', valeur: '300 000', loyerMensuel: '1 200', chargesMensuelles: '200', taxeFonciere: '1 500' }
    ],
    empruntActif: true,
    montantEmprunt: '250 000',
    tauxEmprunt: '3.5',
    dureeEmprunt: '20',
    tmi: 30,
    revenusAutres: '50 000',
    objectif: 'capitalisation',
    fraisGestionHolding: '2 000',
    fraisComptables: '1 500',
    tauxAmortissement: '2.5',
    decoteIlliquidite: '20',
    ageDonateur: '55',
    nombreEnfants: '2'
  });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // SAUVEGARDE / CHARGEMENT
  // ============================================

  const STORAGE_KEY = 'notariaprime-holding';

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

  const ajouterBien = () => {
    if (formData.biens.length >= 5) return;
    const newId = Math.max(...formData.biens.map(b => b.id), 0) + 1;
    setFormData({
      ...formData,
      biens: [...formData.biens, {
        id: newId,
        nom: `Bien ${newId}`,
        valeur: '',
        loyerMensuel: '',
        chargesMensuelles: '',
        taxeFonciere: ''
      }]
    });
  };

  const supprimerBien = (id: number) => {
    if (formData.biens.length <= 1) return;
    setFormData({
      ...formData,
      biens: formData.biens.filter(b => b.id !== id)
    });
  };

  const modifierBien = (id: number, champ: keyof BienImmobilier, valeur: string) => {
    setFormData({
      ...formData,
      biens: formData.biens.map(b =>
        b.id === id ? { ...b, [champ]: champ === 'nom' ? valeur : formatMontantInput(valeur) } : b
      )
    });
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFieldFormatted = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: formatMontantInput(value) }));
  };

  // ============================================
  // CALCULS
  // ============================================

  const resultats = useMemo(() => {
    // Agreger les donnees des biens
    const totalValeur = formData.biens.reduce((s, b) => s + parseNumber(b.valeur), 0);
    const totalLoyerAnnuel = formData.biens.reduce((s, b) => s + parseNumber(b.loyerMensuel) * 12, 0);
    const totalChargesAnnuelles = formData.biens.reduce((s, b) => s + parseNumber(b.chargesMensuelles) * 12, 0);
    const totalTaxeFonciere = formData.biens.reduce((s, b) => s + parseNumber(b.taxeFonciere), 0);

    const montantEmprunt = parseNumber(formData.montantEmprunt);
    const tauxEmprunt = parseNumber(formData.tauxEmprunt);
    const dureeEmprunt = parseNumber(formData.dureeEmprunt);
    const fraisGestion = parseNumber(formData.fraisGestionHolding);
    const fraisComptables = parseNumber(formData.fraisComptables);
    const tauxAmortissement = parseNumber(formData.tauxAmortissement) / 100;
    const decoteIlliquidite = parseNumber(formData.decoteIlliquidite) / 100;
    const ageDonateur = parseNumber(formData.ageDonateur);
    const nombreEnfants = Math.max(1, parseNumber(formData.nombreEnfants));
    const tmi = formData.tmi;

    // Interets emprunt annee 1
    const interetsAn1 = formData.empruntActif
      ? calculerInteretsAnnuels(montantEmprunt, tauxEmprunt, dureeEmprunt * 12, 1)
      : 0;

    // Valeur du bati (80% de la valeur totale, terrain non amortissable)
    const valeurBati = totalValeur * 0.80;
    const amortissementAnnuel = valeurBati * tauxAmortissement;

    // ====== DETENTION DIRECTE (IR) ======
    const revenusBruts = totalLoyerAnnuel;
    const chargesDeductiblesIR = totalChargesAnnuelles + totalTaxeFonciere + interetsAn1;
    const revenuFoncierNet = Math.max(0, revenusBruts - chargesDeductiblesIR);
    const irFoncier = calculerIRSurRevensFonciers(revenuFoncierNet, tmi);
    const psFoncier = revenuFoncierNet * TAUX_PS_FONCIER;
    const totalImpotDirect = irFoncier + psFoncier;
    const netDisponibleDirect = revenusBruts - totalChargesAnnuelles - totalTaxeFonciere - interetsAn1 - totalImpotDirect;

    // ====== VIA HOLDING IS ======
    const chargesDeductiblesIS = totalChargesAnnuelles + totalTaxeFonciere + interetsAn1 + amortissementAnnuel + fraisGestion + fraisComptables;
    const resultatFiscalIS = Math.max(0, revenusBruts - chargesDeductiblesIS);
    const montantIS = calculerIS(resultatFiscalIS);
    const beneficeApresIS = resultatFiscalIS - montantIS;

    // Si distribution: flat tax
    const montantDistribue = formData.objectif === 'capitalisation' ? 0 : beneficeApresIS;
    const flatTaxSurDistribution = montantDistribue * FLAT_TAX_TOTAL;
    const netDistribue = montantDistribue - flatTaxSurDistribution;

    // Si capitalisation: tresorerie restant en societe
    const tresorerieHolding = formData.objectif === 'capitalisation' ? beneficeApresIS : 0;

    const totalImpotHolding = montantIS + flatTaxSurDistribution;
    const netDisponibleHolding = formData.objectif === 'capitalisation'
      ? beneficeApresIS // reste en societe
      : netDistribue;

    const differenceAnnuelle = (formData.objectif === 'capitalisation' ? beneficeApresIS : netDistribue) - netDisponibleDirect;

    // ====== PROJECTIONS 10/20/30 ANS ======
    const projections: Array<{
      annee: number;
      cumulDirect: number;
      cumulHolding: number;
      differenceAnnuelle: number;
    }> = [];

    let cumulDirect = 0;
    let cumulHolding = 0;

    for (let annee = 1; annee <= 30; annee++) {
      const interetsAnnee = formData.empruntActif && annee <= dureeEmprunt
        ? calculerInteretsAnnuels(montantEmprunt, tauxEmprunt, dureeEmprunt * 12, annee)
        : 0;

      // Direct
      const chargesIRAnnee = totalChargesAnnuelles + totalTaxeFonciere + interetsAnnee;
      const revNetIRAnnee = Math.max(0, revenusBruts - chargesIRAnnee);
      const irAnnee = calculerIRSurRevensFonciers(revNetIRAnnee, tmi);
      const psAnnee = revNetIRAnnee * TAUX_PS_FONCIER;
      const netDirectAnnee = revenusBruts - totalChargesAnnuelles - totalTaxeFonciere - interetsAnnee - irAnnee - psAnnee;

      // Holding
      const chargesISAnnee = totalChargesAnnuelles + totalTaxeFonciere + interetsAnnee + amortissementAnnuel + fraisGestion + fraisComptables;
      const resultatISAnnee = Math.max(0, revenusBruts - chargesISAnnee);
      const isAnnee = calculerIS(resultatISAnnee);
      const benefAnnee = resultatISAnnee - isAnnee;

      let netHoldingAnnee: number;
      if (formData.objectif === 'capitalisation') {
        // Tresorerie reinvestie a 3% net par an
        netHoldingAnnee = benefAnnee;
        cumulHolding = cumulHolding * 1.03 + netHoldingAnnee;
      } else {
        const distrib = benefAnnee;
        const flatTax = distrib * FLAT_TAX_TOTAL;
        netHoldingAnnee = distrib - flatTax;
        cumulHolding += netHoldingAnnee;
      }

      cumulDirect += netDirectAnnee;

      projections.push({
        annee,
        cumulDirect: Math.round(cumulDirect),
        cumulHolding: Math.round(cumulHolding),
        differenceAnnuelle: Math.round(netHoldingAnnee - netDirectAnnee)
      });
    }

    // ====== FLUX FINANCIERS ======
    const fluxMereFille = beneficeApresIS;
    const quotePart5 = fluxMereFille * QUOTE_PART_MERE_FILLE;
    const isQuotePart = quotePart5 * IS_TAUX_NORMAL;
    const netRemonteMereFille = fluxMereFille - isQuotePart;

    const capaciteAutofinancementDirect = netDisponibleDirect;
    const capaciteAutofinancementHolding = beneficeApresIS;

    const repartitionFlux = [
      { name: 'IS sur loyers', value: Math.round(montantIS) },
      { name: 'Frais de structure', value: Math.round(fraisGestion + fraisComptables) },
      { name: formData.objectif === 'capitalisation' ? 'Tresorerie reinvestie' : 'Distribution nette', value: Math.round(formData.objectif === 'capitalisation' ? tresorerieHolding : netDistribue) },
      ...(formData.objectif !== 'capitalisation' ? [{ name: 'Flat tax dividendes', value: Math.round(flatTaxSurDistribution) }] : [])
    ].filter(f => f.value > 0);

    // ====== TRANSMISSION ======
    const valeurPartsHolding = totalValeur - montantEmprunt; // actif net
    const valeurPartsAvecDecote = valeurPartsHolding * (1 - decoteIlliquidite);
    const { usufruit: pctUsufruit, nuePropriete: pctNuePropriete } = getValeurUsufruit(ageDonateur);
    const valeurNuePropriete = valeurPartsAvecDecote * (pctNuePropriete / 100);
    const valeurNueProprieteParEnfant = valeurNuePropriete / nombreEnfants;

    // Donation directe du bien
    const valeurBienParEnfant = totalValeur / nombreEnfants;
    const baseImposableDirecte = Math.max(0, valeurBienParEnfant - ABATTEMENT_DONATION_ENFANT);
    const droitsDonationDirecte = calculerDroitsDonation(baseImposableDirecte) * nombreEnfants;

    // Donation des parts (avec decote + demembrement)
    const baseImposableParts = Math.max(0, valeurNueProprieteParEnfant - ABATTEMENT_DONATION_ENFANT);
    const droitsDonationParts = calculerDroitsDonation(baseImposableParts) * nombreEnfants;

    const economieDonation = droitsDonationDirecte - droitsDonationParts;

    // Comparaison annuelle (bar chart data)
    const comparaisonAnnuelle = [
      {
        name: 'Revenus bruts',
        direct: revenusBruts,
        holding: revenusBruts
      },
      {
        name: 'Charges deductibles',
        direct: chargesDeductiblesIR,
        holding: chargesDeductiblesIS
      },
      {
        name: 'Impots',
        direct: totalImpotDirect,
        holding: totalImpotHolding
      },
      {
        name: 'Net disponible',
        direct: Math.max(0, netDisponibleDirect),
        holding: Math.max(0, netDisponibleHolding)
      }
    ];

    // Detail des couts (stacked bar)
    const detailCouts = [
      {
        name: 'Detention directe',
        IR: Math.round(irFoncier),
        PS: Math.round(psFoncier),
        Charges: Math.round(totalChargesAnnuelles + totalTaxeFonciere),
        'Frais structure': 0
      },
      {
        name: 'Via holding',
        IR: 0,
        PS: Math.round(formData.objectif !== 'capitalisation' ? montantDistribue * FLAT_TAX_PS : 0),
        IS: Math.round(montantIS),
        'Flat tax IR': Math.round(formData.objectif !== 'capitalisation' ? montantDistribue * FLAT_TAX_IR : 0),
        Charges: Math.round(totalChargesAnnuelles + totalTaxeFonciere),
        'Frais structure': Math.round(fraisGestion + fraisComptables)
      }
    ];

    return {
      // Direct
      revenusBruts,
      chargesDeductiblesIR,
      interetsAn1,
      revenuFoncierNet,
      irFoncier,
      psFoncier,
      totalImpotDirect,
      netDisponibleDirect,
      // Holding
      chargesDeductiblesIS,
      amortissementAnnuel,
      resultatFiscalIS,
      montantIS,
      beneficeApresIS,
      montantDistribue,
      flatTaxSurDistribution,
      netDistribue,
      tresorerieHolding,
      totalImpotHolding,
      netDisponibleHolding,
      fraisStructure: fraisGestion + fraisComptables,
      // Comparaison
      differenceAnnuelle,
      projections,
      comparaisonAnnuelle,
      detailCouts,
      // Flux
      fluxMereFille,
      quotePart5,
      isQuotePart,
      netRemonteMereFille,
      capaciteAutofinancementDirect,
      capaciteAutofinancementHolding,
      repartitionFlux,
      // Transmission
      totalValeur,
      montantEmprunt,
      valeurPartsHolding,
      valeurPartsAvecDecote,
      pctUsufruit,
      pctNuePropriete,
      valeurNuePropriete,
      valeurNueProprieteParEnfant,
      droitsDonationDirecte,
      droitsDonationParts,
      economieDonation,
      valeurBienParEnfant,
      nombreEnfants,
      decoteIlliquidite
    };
  }, [formData]);

  // ============================================
  // EXPORT PDF
  // ============================================

  const exporterPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Holding Patrimoniale', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detention directe (IR)', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Revenus bruts : ${resultats.revenusBruts.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Charges deductibles : ${resultats.chargesDeductiblesIR.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Fiscalite totale : ${resultats.totalImpotDirect.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Net disponible : ${resultats.netDisponibleDirect.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Via Holding (IS)', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Charges deductibles : ${resultats.chargesDeductiblesIS.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Amortissement annuel : ${resultats.amortissementAnnuel.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Resultat fiscal IS : ${resultats.resultatFiscalIS.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`IS paye : ${resultats.montantIS.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Fiscalite totale holding : ${resultats.totalImpotHolding.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Net disponible : ${resultats.netDisponibleHolding.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparaison', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Difference annuelle : ${resultats.differenceAnnuelle >= 0 ? '+' : ''}${resultats.differenceAnnuelle.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    const diff10 = (resultats.projections[9]?.cumulHolding ?? 0) - (resultats.projections[9]?.cumulDirect ?? 0);
    doc.text(`Difference cumulee sur 10 ans : ${diff10 >= 0 ? '+' : ''}${diff10.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    const diff20 = (resultats.projections[19]?.cumulHolding ?? 0) - (resultats.projections[19]?.cumulDirect ?? 0);
    doc.text(`Difference cumulee sur 20 ans : ${diff20 >= 0 ? '+' : ''}${diff20.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transmission', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Valeur patrimoine : ${resultats.totalValeur.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Droits donation directe : ${resultats.droitsDonationDirecte.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Droits donation parts holding : ${resultats.droitsDonationParts.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Economie transmission : ${resultats.economieDonation.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'Avertissement : cette simulation est fournie a titre informatif et ne constitue pas un conseil fiscal, juridique ou patrimonial. Consultez un professionnel avant toute decision.';
    const lines = doc.splitTextToSize(disclaimer, 170);
    lines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`holding-patrimoniale-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ============================================
  // DONNEES GRAPHIQUES
  // ============================================

  const graphProjection = useMemo(() => {
    return resultats.projections.filter(p => p.annee % 2 === 0 || p.annee === 1);
  }, [resultats.projections]);

  // ============================================
  // TABS
  // ============================================

  const tabs = [
    { id: 'comparaison' as const, label: 'Comparaison', icon: Scale },
    { id: 'flux' as const, label: 'Flux Financiers', icon: ArrowRight },
    { id: 'transmission' as const, label: 'Transmission', icon: Gift },
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle }
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
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Simulateur Holding Patrimoniale
                  </h1>
                  <p className="text-gray-600 font-medium mt-1">
                    Structuration patrimoniale via holding immobiliere
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200">
                <Landmark className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">Bareme 2025/2026</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm max-w-3xl">
              Comparez la detention directe de biens immobiliers avec une structuration via holding patrimoniale (societe IS).
              Simulez les economies fiscales, les flux financiers et les avantages en matiere de transmission.
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
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ============================================ */}
          {/* TAB: COMPARAISON */}
          {/* ============================================ */}

          {activeTab === 'comparaison' && (
            <div className="space-y-8">

              {/* Formulaire de saisie */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Calculator className="w-7 h-7 text-indigo-600" />
                  Parametres de la simulation
                </h2>

                {/* Biens immobiliers */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Home className="w-5 h-5 text-indigo-500" />
                      Patrimoine immobilier
                    </h3>
                    {formData.biens.length < 5 && (
                      <button
                        onClick={ajouterBien}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un bien
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {formData.biens.map((bien, index) => (
                      <div key={bien.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={bien.nom}
                            onChange={(e) => modifierBien(bien.id, 'nom', e.target.value)}
                            className="font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 text-base"
                          />
                          {formData.biens.length > 1 && (
                            <button
                              onClick={() => supprimerBien(bien.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Valeur du bien</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={bien.valeur}
                                onChange={(e) => modifierBien(bien.id, 'valeur', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                                placeholder="300 000"
                              />
                              <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Loyer mensuel</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={bien.loyerMensuel}
                                onChange={(e) => modifierBien(bien.id, 'loyerMensuel', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                                placeholder="1 200"
                              />
                              <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Charges mensuelles</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={bien.chargesMensuelles}
                                onChange={(e) => modifierBien(bien.id, 'chargesMensuelles', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                                placeholder="200"
                              />
                              <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Taxe fonciere/an</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={bien.taxeFonciere}
                                onChange={(e) => modifierBien(bien.id, 'taxeFonciere', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                                placeholder="1 500"
                              />
                              <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financement */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-indigo-500" />
                    Financement
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.empruntActif}
                        onChange={(e) => updateField('empruntActif', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Emprunt bancaire</span>
                    </label>
                  </div>
                  {formData.empruntActif && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Montant emprunte</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.montantEmprunt}
                            onChange={(e) => updateFieldFormatted('montantEmprunt', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Taux annuel</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.tauxEmprunt}
                            onChange={(e) => updateField('tauxEmprunt', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Duree (annees)</label>
                        <input
                          type="text"
                          value={formData.dureeEmprunt}
                          onChange={(e) => updateField('dureeEmprunt', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Situation personnelle */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Situation personnelle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tranche marginale IR (TMI)</label>
                      <select
                        value={formData.tmi}
                        onChange={(e) => updateField('tmi', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none bg-white"
                      >
                        <option value={0}>0 %</option>
                        <option value={11}>11 %</option>
                        <option value={30}>30 %</option>
                        <option value={41}>41 %</option>
                        <option value={45}>45 %</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Revenus autres du foyer</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.revenusAutres}
                          onChange={(e) => updateFieldFormatted('revenusAutres', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Objectif principal</label>
                      <select
                        value={formData.objectif}
                        onChange={(e) => updateField('objectif', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none bg-white"
                      >
                        <option value="capitalisation">Capitalisation (reinvestissement)</option>
                        <option value="distribution">Distribution (dividendes)</option>
                        <option value="transmission">Transmission du patrimoine</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Parametres holding */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    Parametres de la holding
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Frais de gestion annuels</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.fraisGestionHolding}
                          onChange={(e) => updateFieldFormatted('fraisGestionHolding', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Frais comptables annuels</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.fraisComptables}
                          onChange={(e) => updateFieldFormatted('fraisComptables', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">EUR</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Taux amortissement bati (%)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.tauxAmortissement}
                          onChange={(e) => updateField('tauxAmortissement', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultats comparatifs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Colonne : Detention directe */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Detention directe</h3>
                      <p className="text-xs text-gray-500">Personne physique - Revenus fonciers (IR)</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Revenus locatifs bruts</span>
                      <span className="font-semibold text-gray-900">{formatEuros(resultats.revenusBruts)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Charges deductibles</span>
                      <span className="font-semibold text-red-600">- {formatEuros(resultats.chargesDeductiblesIR)}</span>
                    </div>
                    {resultats.interetsAn1 > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-100 pl-4">
                        <span className="text-xs text-gray-500">dont interets emprunt</span>
                        <span className="text-xs text-gray-500">{formatEuros(resultats.interetsAn1)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Revenu foncier net imposable</span>
                      <span className="font-semibold text-gray-900">{formatEuros(resultats.revenuFoncierNet)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">IR (TMI {formData.tmi}%)</span>
                      <span className="font-semibold text-red-600">- {formatEuros(resultats.irFoncier)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Prelevements sociaux (17,2%)</span>
                      <span className="font-semibold text-red-600">- {formatEuros(resultats.psFoncier)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 bg-red-50 -mx-2 px-2 rounded-lg">
                      <span className="text-sm font-bold text-red-700">Total impots et PS</span>
                      <span className="font-bold text-red-700">{formatEuros(resultats.totalImpotDirect)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-gradient-to-r from-orange-50 to-red-50 -mx-2 px-4 rounded-xl mt-2">
                      <span className="font-bold text-gray-900">Net disponible annuel</span>
                      <span className="text-xl font-bold text-orange-600">{formatEuros(resultats.netDisponibleDirect)}</span>
                    </div>
                  </div>
                </div>

                {/* Colonne : Via Holding */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Via Holding IS</h3>
                      <p className="text-xs text-gray-500">Societe a l&apos;IS - {formData.objectif === 'capitalisation' ? 'Capitalisation' : 'Distribution'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Revenus locatifs bruts</span>
                      <span className="font-semibold text-gray-900">{formatEuros(resultats.revenusBruts)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Charges + amortissement</span>
                      <span className="font-semibold text-red-600">- {formatEuros(resultats.chargesDeductiblesIS)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 pl-4">
                      <span className="text-xs text-gray-500">dont amortissement du bati</span>
                      <span className="text-xs text-gray-500">{formatEuros(resultats.amortissementAnnuel)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 pl-4">
                      <span className="text-xs text-gray-500">dont frais de structure</span>
                      <span className="text-xs text-gray-500">{formatEuros(resultats.fraisStructure)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Resultat fiscal IS</span>
                      <span className="font-semibold text-gray-900">{formatEuros(resultats.resultatFiscalIS)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Impot sur les societes (IS)</span>
                      <span className="font-semibold text-red-600">- {formatEuros(resultats.montantIS)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Benefice apres IS</span>
                      <span className="font-semibold text-gray-900">{formatEuros(resultats.beneficeApresIS)}</span>
                    </div>

                    {formData.objectif !== 'capitalisation' && (
                      <>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Flat tax sur dividendes (31,4%)</span>
                          <span className="font-semibold text-red-600">- {formatEuros(resultats.flatTaxSurDistribution)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 bg-indigo-50 -mx-2 px-2 rounded-lg">
                          <span className="text-sm font-bold text-indigo-700">Total impots (IS + flat tax)</span>
                          <span className="font-bold text-indigo-700">{formatEuros(resultats.totalImpotHolding)}</span>
                        </div>
                      </>
                    )}

                    {formData.objectif === 'capitalisation' && (
                      <div className="flex justify-between py-2 border-b border-gray-100 bg-indigo-50 -mx-2 px-2 rounded-lg">
                        <span className="text-sm font-bold text-indigo-700">IS paye</span>
                        <span className="font-bold text-indigo-700">{formatEuros(resultats.montantIS)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-3 bg-gradient-to-r from-indigo-50 to-purple-50 -mx-2 px-4 rounded-xl mt-2">
                      <span className="font-bold text-gray-900">
                        {formData.objectif === 'capitalisation' ? 'Tresorerie en societe' : 'Net distribue annuel'}
                      </span>
                      <span className="text-xl font-bold text-indigo-600">{formatEuros(resultats.netDisponibleHolding)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synthese de la difference */}
              <div className={`rounded-2xl shadow-lg border-2 p-6 ${
                resultats.differenceAnnuelle >= 0
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className={`w-6 h-6 ${resultats.differenceAnnuelle >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <h3 className="text-lg font-bold text-gray-900">Synthese annuelle</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Difference annuelle</p>
                    <p className={`text-xl font-bold ${resultats.differenceAnnuelle >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {resultats.differenceAnnuelle >= 0 ? '+' : ''}{formatEuros(resultats.differenceAnnuelle)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Gain cumule a 10 ans</p>
                    <p className={`text-xl font-bold ${
                      (resultats.projections[9]?.cumulHolding ?? 0) - (resultats.projections[9]?.cumulDirect ?? 0) >= 0
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatEuros((resultats.projections[9]?.cumulHolding ?? 0) - (resultats.projections[9]?.cumulDirect ?? 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Gain cumule a 20 ans</p>
                    <p className={`text-xl font-bold ${
                      (resultats.projections[19]?.cumulHolding ?? 0) - (resultats.projections[19]?.cumulDirect ?? 0) >= 0
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatEuros((resultats.projections[19]?.cumulHolding ?? 0) - (resultats.projections[19]?.cumulDirect ?? 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Gain cumule a 30 ans</p>
                    <p className={`text-xl font-bold ${
                      (resultats.projections[29]?.cumulHolding ?? 0) - (resultats.projections[29]?.cumulDirect ?? 0) >= 0
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatEuros((resultats.projections[29]?.cumulHolding ?? 0) - (resultats.projections[29]?.cumulDirect ?? 0))}
                    </p>
                  </div>
                </div>
                {resultats.differenceAnnuelle >= 0 && (
                  <div className="mt-4 p-3 bg-white rounded-xl flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {formData.objectif === 'capitalisation'
                        ? "La holding permet de conserver davantage de tresorerie en societe, reinvestissable sans fiscalite supplementaire. L'avantage se renforce significativement dans le temps grace a l'effet de capitalisation."
                        : "Meme avec la double imposition (IS + flat tax), la deductibilite de l'amortissement et les charges de structure permettent un gain net annuel en faveur de la holding."
                      }
                    </p>
                  </div>
                )}
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

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Bar chart: Comparaison fiscalite annuelle */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Comparaison fiscalite annuelle
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resultats.comparaisonAnnuelle} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => formatEuros(value)} />
                      <Legend />
                      <Bar dataKey="direct" name="Detention directe" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="holding" name="Via holding" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Line chart: Patrimoine net cumule */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Patrimoine net cumule sur 30 ans
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={graphProjection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="annee" tick={{ fontSize: 11 }} label={{ value: 'Annees', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => formatEuros(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="cumulDirect" name="Detention directe" stroke="#f97316" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cumulHolding" name="Via holding" stroke="#6366f1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart: Repartition des flux */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-indigo-600" />
                    Repartition des flux (holding)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={resultats.repartitionFlux}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {resultats.repartitionFlux.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatEuros(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Stacked bar: Detail des couts */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Detail des couts annuels
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resultats.detailCouts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => formatEuros(value)} />
                      <Legend />
                      <Bar dataKey="IR" name="IR" stackId="a" fill="#f97316" />
                      <Bar dataKey="PS" name="PS" stackId="a" fill="#ef4444" />
                      <Bar dataKey="IS" name="IS" stackId="a" fill="#6366f1" />
                      <Bar dataKey="Flat tax IR" name="Flat tax IR" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="Charges" name="Charges" stackId="a" fill="#94a3b8" />
                      <Bar dataKey="Frais structure" name="Frais structure" stackId="a" fill="#64748b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: FLUX FINANCIERS */}
          {/* ============================================ */}

          {activeTab === 'flux' && (
            <div className="space-y-8">

              {/* Schema des flux */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <ArrowRight className="w-7 h-7 text-indigo-600" />
                  Schema des flux financiers
                </h2>

                <div className="flex flex-col items-center gap-4">

                  {/* SCI Fille */}
                  <div className="w-full max-w-md bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Home className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-bold text-blue-800">SCI(s) Fille(s)</h3>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">Detention des biens immobiliers</p>
                    <div className="space-y-1 text-sm">
                      <p>Loyers percus : <span className="font-bold">{formatEuros(resultats.revenusBruts)}</span></p>
                      <p>Charges et taxes : <span className="font-bold text-red-600">- {formatEuros(resultats.chargesDeductiblesIS - resultats.amortissementAnnuel - resultats.fraisStructure)}</span></p>
                      <p>Amortissement : <span className="font-bold text-red-600">- {formatEuros(resultats.amortissementAnnuel)}</span></p>
                      <p>IS paye : <span className="font-bold text-red-600">- {formatEuros(resultats.montantIS)}</span></p>
                    </div>
                  </div>

                  {/* Fleche */}
                  <div className="flex flex-col items-center">
                    <ArrowDown className="w-8 h-8 text-indigo-400" />
                    <div className="bg-indigo-100 px-4 py-1 rounded-full text-xs font-semibold text-indigo-700">
                      Remontee dividendes : {formatEuros(resultats.fluxMereFille)}
                    </div>
                    <div className="bg-green-100 px-4 py-1 rounded-full text-xs font-semibold text-green-700 mt-1">
                      Regime mere-fille : quasi exonere
                    </div>
                  </div>

                  {/* Holding Mere */}
                  <div className="w-full max-w-md bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-lg font-bold text-indigo-800">Holding Patrimoniale</h3>
                    </div>
                    <p className="text-sm text-indigo-700 mb-2">Regime mere-fille</p>
                    <div className="space-y-1 text-sm">
                      <p>Dividendes recus : <span className="font-bold">{formatEuros(resultats.fluxMereFille)}</span></p>
                      <p>Quote-part frais (5%) : <span className="font-bold text-red-600">- {formatEuros(resultats.quotePart5)}</span></p>
                      <p>IS sur quote-part : <span className="font-bold text-red-600">- {formatEuros(resultats.isQuotePart)}</span></p>
                      <p>Net disponible holding : <span className="font-bold text-green-600">{formatEuros(resultats.netRemonteMereFille)}</span></p>
                    </div>
                  </div>

                  {/* Fleche */}
                  <div className="flex flex-col items-center">
                    <ArrowDown className="w-8 h-8 text-purple-400" />
                    <div className="bg-purple-100 px-4 py-1 rounded-full text-xs font-semibold text-purple-700">
                      {formData.objectif === 'capitalisation' ? 'Reinvestissement' : 'Distribution aux associes'}
                    </div>
                  </div>

                  {/* Associes ou Reinvestissement */}
                  <div className="w-full max-w-md bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {formData.objectif === 'capitalisation' ? (
                        <RefreshCw className="w-6 h-6 text-purple-600" />
                      ) : (
                        <Users className="w-6 h-6 text-purple-600" />
                      )}
                      <h3 className="text-lg font-bold text-purple-800">
                        {formData.objectif === 'capitalisation' ? 'Reinvestissement' : 'Associes personnes physiques'}
                      </h3>
                    </div>
                    {formData.objectif === 'capitalisation' ? (
                      <div className="space-y-1 text-sm">
                        <p>Tresorerie disponible : <span className="font-bold text-green-600">{formatEuros(resultats.netRemonteMereFille)}</span></p>
                        <p className="text-purple-700">Reinvestissement dans de nouveaux actifs sans fiscalite supplementaire</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <p>Dividendes distribues : <span className="font-bold">{formatEuros(resultats.montantDistribue)}</span></p>
                        <p>Flat tax (31,4%) : <span className="font-bold text-red-600">- {formatEuros(resultats.flatTaxSurDistribution)}</span></p>
                        <p>Net percu : <span className="font-bold text-green-600">{formatEuros(resultats.netDistribue)}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Regime mere-fille detail */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-indigo-600" />
                  Regime mere-fille : detail du calcul
                </h2>

                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-800">
                      <p className="font-semibold mb-1">Principe du regime mere-fille (Art. 145 et 216 CGI)</p>
                      <p>Les dividendes remontes de la filiale vers la holding sont quasi exoneres d&apos;IS.
                        Seule une quote-part de frais et charges de 5% est reintegree dans le resultat imposable de la holding.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800">Calcul</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Dividendes remontes</span>
                        <span className="font-semibold">{formatEuros(resultats.fluxMereFille)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Quote-part 5%</span>
                        <span className="font-semibold">{formatEuros(resultats.quotePart5)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">IS sur quote-part (25%)</span>
                        <span className="font-semibold text-red-600">{formatEuros(resultats.isQuotePart)}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-green-50 -mx-2 px-2 rounded-lg">
                        <span className="font-bold text-green-700">Cout fiscal effectif</span>
                        <span className="font-bold text-green-700">
                          {resultats.fluxMereFille > 0 ? ((resultats.isQuotePart / resultats.fluxMereFille) * 100).toFixed(2) : '0'}% des dividendes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800">Capacite d&apos;autofinancement comparee</h4>
                    <div className="space-y-4">
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <p className="text-xs text-gray-500 mb-1">Detention directe</p>
                        <p className="text-xl font-bold text-orange-600">{formatEuros(resultats.capaciteAutofinancementDirect)}</p>
                        <p className="text-xs text-gray-500 mt-1">Apres IR + PS, disponible pour epargne personnelle</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                        <p className="text-xs text-gray-500 mb-1">Via holding</p>
                        <p className="text-xl font-bold text-indigo-600">{formatEuros(resultats.capaciteAutofinancementHolding)}</p>
                        <p className="text-xs text-gray-500 mt-1">Apres IS, reinvestissable au sein du groupe</p>
                      </div>
                      {resultats.capaciteAutofinancementHolding > resultats.capaciteAutofinancementDirect && (
                        <div className="bg-green-50 rounded-xl p-3 border border-green-200 text-center">
                          <p className="text-sm font-bold text-green-700">
                            + {formatEuros(resultats.capaciteAutofinancementHolding - resultats.capaciteAutofinancementDirect)} de capacite supplementaire
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tresorerie et reinvestissement */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Target className="w-7 h-7 text-indigo-600" />
                  Tresorerie et reinvestissement
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Euro className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-indigo-800">Convention de tresorerie</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      La holding peut consentir des avances de tresorerie a ses filiales via une convention de tresorerie intragroupe,
                      permettant d&apos;optimiser les flux financiers et de financer de nouvelles acquisitions.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className="font-bold text-green-800">Effet de levier fiscal</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Le taux IS (15% puis 25%) est inferieur au TMI + PS (jusqu&apos;a 62,2% pour TMI 45%).
                      La tresorerie non distribuee grossit plus vite dans la societe qu&apos;entre les mains du particulier.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-amber-800">Point de vigilance</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      A la sortie (distribution de dividendes), la double imposition IS + flat tax peut reduire l&apos;avantage.
                      L&apos;interet est maximal en capitalisation longue duree ou en transmission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: TRANSMISSION */}
          {/* ============================================ */}

          {activeTab === 'transmission' && (
            <div className="space-y-8">

              {/* Parametres transmission */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Gift className="w-7 h-7 text-indigo-600" />
                  Parametres de transmission
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Age du donateur</label>
                    <input
                      type="text"
                      value={formData.ageDonateur}
                      onChange={(e) => updateField('ageDonateur', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre d&apos;enfants</label>
                    <input
                      type="text"
                      value={formData.nombreEnfants}
                      onChange={(e) => updateField('nombreEnfants', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Decote d&apos;illiquidite (%)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.decoteIlliquidite}
                        onChange={(e) => updateField('decoteIlliquidite', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparaison donation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Donation directe */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Donation directe du bien</h3>
                      <p className="text-xs text-gray-500">Pleine propriete du bien immobilier</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Valeur totale du patrimoine</span>
                      <span className="font-semibold">{formatEuros(resultats.totalValeur)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Part par enfant ({resultats.nombreEnfants} enfants)</span>
                      <span className="font-semibold">{formatEuros(resultats.valeurBienParEnfant)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Abattement par enfant</span>
                      <span className="font-semibold text-green-600">- {formatEuros(ABATTEMENT_DONATION_ENFANT)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-red-50 -mx-2 px-4 rounded-xl">
                      <span className="font-bold text-red-700">Droits de donation totaux</span>
                      <span className="text-xl font-bold text-red-700">{formatEuros(resultats.droitsDonationDirecte)}</span>
                    </div>
                  </div>
                </div>

                {/* Donation des parts */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Donation des parts de holding</h3>
                      <p className="text-xs text-gray-500">Nue-propriete des parts + decote d&apos;illiquidite</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Valeur nette des parts (actif net)</span>
                      <span className="font-semibold">{formatEuros(resultats.valeurPartsHolding)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Decote d&apos;illiquidite ({parseNumber(formData.decoteIlliquidite)}%)</span>
                      <span className="font-semibold text-green-600">
                        - {formatEuros(resultats.valeurPartsHolding - resultats.valeurPartsAvecDecote)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Valeur apres decote</span>
                      <span className="font-semibold">{formatEuros(resultats.valeurPartsAvecDecote)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Demembrement : nue-propriete ({resultats.pctNuePropriete}%)</span>
                      <span className="font-semibold">{formatEuros(resultats.valeurNuePropriete)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Part par enfant</span>
                      <span className="font-semibold">{formatEuros(resultats.valeurNueProprieteParEnfant)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Abattement par enfant</span>
                      <span className="font-semibold text-green-600">- {formatEuros(ABATTEMENT_DONATION_ENFANT)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-indigo-50 -mx-2 px-4 rounded-xl">
                      <span className="font-bold text-indigo-700">Droits de donation totaux</span>
                      <span className="text-xl font-bold text-indigo-700">{formatEuros(resultats.droitsDonationParts)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Economie de droits */}
              {resultats.economieDonation > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg border-2 border-green-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">Economie de droits de donation</h3>
                      <p className="text-sm text-green-700">Grace a la decote d&apos;illiquidite et au demembrement</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Droits donation directe</p>
                      <p className="text-xl font-bold text-red-600">{formatEuros(resultats.droitsDonationDirecte)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Droits donation parts</p>
                      <p className="text-xl font-bold text-indigo-600">{formatEuros(resultats.droitsDonationParts)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Economie totale</p>
                      <p className="text-2xl font-bold text-green-600">{formatEuros(resultats.economieDonation)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Demembrement detail */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Scale className="w-7 h-7 text-indigo-600" />
                  Demembrement des parts
                </h2>

                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-800">
                      <p className="font-semibold mb-1">Strategie de demembrement (Art. 669 CGI)</p>
                      <p>Le donateur conserve l&apos;usufruit des parts (et donc les revenus) et transmet la nue-propriete a ses enfants.
                        Au deces du donateur, l&apos;usufruit rejoint la nue-propriete sans droits supplementaires.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Repartition selon l&apos;age du donateur</h4>
                    <div className="space-y-2">
                      {BAREME_USUFRUIT.filter(t => t.ageMax !== Infinity).map((tranche, i) => {
                        const isActive = parseNumber(formData.ageDonateur) <= tranche.ageMax &&
                          (i === 0 || parseNumber(formData.ageDonateur) > (BAREME_USUFRUIT[i - 1]?.ageMax ?? 0));
                        return (
                          <div
                            key={i}
                            className={`flex justify-between py-2 px-3 rounded-lg text-sm ${
                              isActive ? 'bg-indigo-100 border-2 border-indigo-300 font-bold' : 'border border-gray-100'
                            }`}
                          >
                            <span>{i === 0 ? 'Moins de' : `${(BAREME_USUFRUIT[i - 1]?.ageMax ?? 0) + 1} a`} {tranche.ageMax} ans</span>
                            <span>Usufruit {tranche.usufruit}% / NP {tranche.nuePropriete}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Votre situation</h4>
                    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-5 border border-gray-200 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Age du donateur</span>
                        <span className="font-bold">{formData.ageDonateur} ans</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Usufruit conserve</span>
                        <span className="font-bold text-indigo-600">{resultats.pctUsufruit}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Nue-propriete transmise</span>
                        <span className="font-bold text-purple-600">{resultats.pctNuePropriete}%</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Valeur NP des parts</span>
                        <span className="font-bold">{formatEuros(resultats.valeurNuePropriete)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Le donateur conserve les revenus (loyers) via l&apos;usufruit.
                        A son deces, les enfants recuperent la pleine propriete sans droits.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pacte Dutreil */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-indigo-600" />
                  Pacte Dutreil
                </h2>
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-2">Application limitee aux holdings patrimoniales</p>
                      <p className="mb-2">
                        Le Pacte Dutreil (Art. 787 B CGI) permet un abattement de 75% sur la valeur transmise, mais il est principalement
                        reserve aux societes operationnelles exercant une activite industrielle, commerciale, artisanale, agricole ou liberale.
                      </p>
                      <p className="mb-2">
                        Une holding patrimoniale purement immobiliere est generalement exclue du dispositif Dutreil.
                        Cependant, une holding animatrice de groupe (qui participe activement a la politique du groupe et rend des services a ses filiales)
                        peut etre eligible sous conditions strictes.
                      </p>
                      <p className="font-semibold">
                        Consultez un avocat fiscaliste specialise pour evaluer l&apos;eligibilite de votre holding au dispositif Dutreil.
                      </p>
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
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 lg:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Questions Frequentes
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Tout comprendre sur la structuration patrimoniale via holding
                </p>
              </div>

              <FAQSection openIndex={faqOpenIndex} setOpenIndex={setFaqOpenIndex} />
            </div>
          )}

          {/* ============================================ */}
          {/* DISCLAIMER */}
          {/* ============================================ */}

          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-amber-900">
                <p className="font-semibold text-lg">Avertissement legal</p>
                <p>
                  Ce simulateur est fourni a titre informatif uniquement et ne constitue pas un conseil juridique, fiscal
                  ou patrimonial personnalise. Les calculs sont bases sur la legislation fiscale en vigueur au 1er janvier 2025
                  et sont susceptibles d&apos;evoluer.
                </p>
                <p>
                  La structuration via holding patrimoniale implique des consequences fiscales, juridiques et financieres
                  complexes qui varient selon chaque situation personnelle. Les couts de creation, de gestion et les
                  implications en matiere d&apos;IFI ne sont pas tous modelises dans cette simulation simplifiee.
                </p>
                <p className="font-semibold">
                  Consultez imperativement un notaire, un avocat fiscaliste et un expert-comptable avant toute decision
                  de structuration patrimoniale.
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

function FAQSection({ openIndex, setOpenIndex }: { openIndex: number | null; setOpenIndex: (i: number | null) => void }) {
  const faqs = [
    {
      q: "Qu'est-ce qu'une holding patrimoniale ?",
      r: "Une holding patrimoniale est une societe (generalement une SAS ou une SARL) soumise a l'impot sur les societes (IS) qui detient des participations dans une ou plusieurs societes civiles immobilieres (SCI). Son role est de centraliser la gestion et les flux financiers du patrimoine immobilier familial. La holding percoit les dividendes de ses filiales sous le regime fiscal favorable dit 'mere-fille' (quasi exoneration, seule une quote-part de 5% est imposee). Cette structuration permet d'optimiser la fiscalite des revenus locatifs, de faciliter le reinvestissement de la tresorerie et de preparer la transmission du patrimoine. (Articles 145 et 216 du Code General des Impots)"
    },
    {
      q: "Quand creer une holding est-il interessant ?",
      r: "La creation d'une holding patrimoniale devient interessante dans plusieurs situations : lorsque votre tranche marginale d'imposition (TMI) est elevee (30% et plus), car le taux IS (15% puis 25%) est inferieur au TMI + prelevements sociaux ; lorsque vous detenez plusieurs biens immobiliers et souhaitez rationaliser leur gestion ; lorsque votre objectif est la capitalisation a long terme plutot que la distribution de revenus ; et lorsque vous anticipez une transmission de patrimoine a vos enfants. En general, la holding est pertinente a partir d'un patrimoine immobilier de 500 000 euros et des revenus locatifs annuels superieurs a 30 000 euros."
    },
    {
      q: "Quel est le cout de creation et de gestion ?",
      r: "La creation d'une holding coute entre 1 500 et 3 000 euros (frais juridiques, redaction des statuts, immatriculation). Les couts de gestion annuels comprennent : la comptabilite (1 500 a 3 000 euros par societe selon la complexite), l'expert-comptable pour les declarations fiscales, l'assemblee generale annuelle et le depot des comptes, la cotisation fonciere des entreprises (CFE), et eventuellement les honoraires d'un commissaire aux comptes si les seuils sont depasses. Au total, comptez entre 3 000 et 6 000 euros de frais annuels pour une holding avec une a deux filiales. Ces couts doivent etre compenses par les economies fiscales realisees."
    },
    {
      q: "Comment fonctionne le regime mere-fille ?",
      r: "Le regime mere-fille (Articles 145 et 216 du CGI) permet a la societe mere (la holding) de percevoir les dividendes de ses filiales en quasi exoneration d'impot. Les conditions sont : la holding doit detenir au moins 5% du capital de la filiale depuis au moins 2 ans, et les deux societes doivent etre soumises a l'IS. Concretement, les dividendes remontes de la SCI vers la holding sont exoneres d'IS, sauf une quote-part de frais et charges de 5% qui est reintegree dans le resultat imposable. Le cout fiscal reel est donc de 5% x 25% = 1,25% des dividendes remontes, ce qui est tres avantageux par rapport a l'imposition directe."
    },
    {
      q: "Holding et IFI : quel impact ?",
      r: "La holding ne permet pas d'echapper a l'Impot sur la Fortune Immobiliere (IFI). L'article 965 du CGI prevoit la transparence fiscale pour l'IFI : les parts de societes detenant de l'immobilier sont incluses dans l'assiette de l'IFI a hauteur de la fraction de la valeur des parts representant des actifs immobiliers. Cependant, des strategies d'optimisation existent : la decote d'illiquidite sur les parts de holding (10 a 25%) peut reduire l'assiette taxable, et la dette de la societe vient en deduction de la valeur des actifs immobiliers. La creation d'une holding ne doit donc pas etre motivee par l'IFI mais par l'optimisation de la fiscalite des revenus et de la transmission."
    },
    {
      q: "Comment transmettre via une holding ?",
      r: "La transmission via holding offre plusieurs avantages. Premierement, les parts de holding beneficient d'une decote d'illiquidite (15 a 25%) car elles ne sont pas cotees et sont difficilement cessibles, ce qui reduit la base taxable aux droits de donation. Deuxiemement, le demembrement des parts permet au donateur de conserver l'usufruit (et donc les revenus) tout en transmettant la nue-propriete aux enfants. La valeur de la nue-propriete depend de l'age du donateur selon le bareme de l'article 669 du CGI. Troisiemement, au deces du donateur, l'usufruit rejoint la nue-propriete sans droits supplementaires. Quatriemement, il est possible de fractionner la transmission dans le temps en utilisant les abattements renouvelables tous les 15 ans."
    },
    {
      q: "Peut-on integrer un bien existant dans une holding ?",
      r: "Oui, mais l'operation genere des couts fiscaux. L'apport d'un bien immobilier a une SCI puis la creation d'une holding au-dessus implique : des droits d'enregistrement sur l'apport (5% pour un immeuble apporte a titre onereux), une eventuelle plus-value de cession si l'apport est considere comme une vente, des frais de notaire, et des frais de restructuration juridique. Des mecanismes d'optimisation existent, comme l'apport en societe a l'IS suivi d'un report d'imposition de la plus-value (article 151 octies du CGI pour les professionnels, ou regime des apports partiels d'actif). Il est recommande de structurer la holding en amont de l'acquisition des biens pour eviter ces surcouts."
    },
    {
      q: "Holding IS vs SCI IR : quelle difference ?",
      r: "La SCI a l'IR est transparente fiscalement : les revenus fonciers sont imposes directement entre les mains des associes au bareme progressif + 17,2% de prelevements sociaux (les revenus fonciers ne sont pas impactes par la hausse LFSS 2026), mais l'amortissement du bien n'est pas deductible. La SCI a l'IS (ou le montage holding IS + SCI IS) permet de deduire l'amortissement du bien (reduction significative du resultat fiscal), de beneficier du taux IS reduit de 15% sur les premiers 42 500 euros, et de capitaliser la tresorerie dans la societe. En contrepartie, les plus-values sont calculees sur la valeur comptable nette (apres amortissement), ce qui les rend potentiellement plus elevees, et la distribution aux associes supporte la flat tax de 31,4% depuis 2026 (12,8% IR + 18,6% PS). Le choix depend de votre TMI, de votre objectif (distribution ou capitalisation) et de votre horizon temporel."
    },
    {
      q: "Quels sont les risques d'une holding ?",
      r: "Les principaux risques sont : le risque d'abus de droit si la holding n'a pas de substance economique reelle (l'administration fiscale peut requalifier le montage), les couts de structure qui grignottent la rentabilite sur des patrimoines trop petits, la complexite de gestion et de declaration, la double imposition a la sortie (IS + flat tax) qui peut effacer l'avantage fiscal en cas de distribution massive, la difficulte de revendre des parts de holding par rapport a un bien en direct, et l'evolution legislative qui peut modifier les regles fiscales applicables. Il est essentiel que la holding ait une raison economique valable au-dela de la seule optimisation fiscale."
    },
    {
      q: "Comment optimiser la tresorerie d'une holding ?",
      r: "Plusieurs strategies permettent d'optimiser la tresorerie accumulee dans la holding : le reinvestissement dans de nouveaux biens immobiliers via les filiales, grace a une capacite d'autofinancement superieure ; la mise en place d'une convention de tresorerie intragroupe pour rationaliser les flux entre la holding et ses filiales ; le placement de la tresorerie excedentaire sur des contrats de capitalisation (enveloppe fiscale avantageuse pour les personnes morales) ; le financement de travaux d'amelioration des biens existants pour augmenter les loyers ; et la constitution d'une reserve pour faire face aux imprevus (vacance locative, travaux urgents). Attention a ne pas laisser une tresorerie excessive dormante, car l'administration pourrait considerer que la holding n'a pas d'activite economique reelle."
    }
  ];

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
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
                <p className="text-gray-700 leading-relaxed text-sm">
                  {faq.r}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
