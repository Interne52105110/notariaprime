"use client";

import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Calculator, TrendingUp, Euro, Calendar, FileText, Download, 
  AlertCircle, Info, CheckCircle, Clock, Percent,
  ArrowRight, Gift, Users, Lightbulb, BarChart3, Target, Zap,
  ChevronRight, PieChart
} from 'lucide-react';
// Graphiques CSS natifs - pas besoin de recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  modeAcquisition: 'achat' | 'donation' | 'succession' | 'echange';
  typeBien: 'principal' | 'secondaire' | 'locatif' | 'sci';
  estDemembre: boolean;
  typeDroit: 'pleine' | 'usufruit' | 'nue';
  ageUsufruitier: string;
  pourcentageDetention: string;
  nombreCoproprietaires: string;
  prixAcquisition: string;
  dateAcquisition: string;
  valeurVenale: string;
  fraisAcquisition: 'forfait' | 'reel';
  fraisAcquisitionMontant: string;
  prixVente: string;
  dateVente: string;
  dateVentePrevue: string;
  fraisVente: string;
  travaux: 'aucun' | 'forfait' | 'reel';
  travauxMontant: string;
  premiereVente: boolean;
  retraite: boolean;
  revenuFiscal: string;
  expropriation: boolean;
  zoneTendue: boolean;
}

interface Results {
  plusValueBrute: number;
  prixAcquisitionCorrige: number;
  prixVenteCorrige: number;
  dureeDetention: number;
  dureeDetentionJours: number;
  abattementIR: number;
  abattementPS: number;
  plusValueIR: number;
  plusValuePS: number;
  impotRevenu: number;
  prelevementsSociaux: number;
  taxeAdditionnelle: number;
  totalFiscalite: number;
  exoneration: boolean;
  motifExoneration: string;
  suggestions: string[];
  economieAbattements: number;
  valeurDemembrement?: {
    usufruit: number;
    nue: number;
  };
}

interface Scenario {
  nom: string;
  dateVente: string;
  travaux?: number;
  results: Results;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

function PlusValueContent() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    modeAcquisition: 'achat',
    typeBien: 'secondaire',
    estDemembre: false,
    typeDroit: 'pleine',
    ageUsufruitier: '',
    pourcentageDetention: '100',
    nombreCoproprietaires: '1',
    prixAcquisition: '',
    dateAcquisition: '',
    valeurVenale: '',
    fraisAcquisition: 'forfait',
    fraisAcquisitionMontant: '',
    prixVente: '',
    dateVente: '',
    dateVentePrevue: '',
    fraisVente: '',
    travaux: 'aucun',
    travauxMontant: '',
    premiereVente: false,
    retraite: false,
    revenuFiscal: '',
    expropriation: false,
    zoneTendue: false
  });

  useEffect(() => {
    setMounted(true);
    // Initialiser la date de vente avec la date actuelle côté client uniquement
    setFormData(prev => ({
      ...prev,
      dateVente: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const [results, setResults] = useState<Results | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeTab, setActiveTab] = useState('acquisition');
  const [showComparison, setShowComparison] = useState(false);

  // ============================================================================
  // FONCTIONS DE CALCUL
  // ============================================================================

  const calculerDureeDetention = (dateDebut: string, dateFin: string): { annees: number; jours: number } => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffMs = fin.getTime() - debut.getTime();
    const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const annees = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return { annees, jours };
  };

  const calculerAbattementIR = (duree: number): number => {
    if (duree < 6) return 0;
    if (duree < 22) return Math.min((duree - 5) * 6, 96);
    if (duree >= 22) return 100;
    return 100;
  };

  const calculerAbattementPS = (duree: number): number => {
    if (duree < 6) return 0;
    if (duree < 22) return Math.min((duree - 5) * 1.65, 26.4);
    if (duree < 23) return 26.4;
    if (duree < 30) return 26.4 + Math.floor(duree - 22) * 9;
    return 100;
  };

  const calculerValeurUsufruit = (age: number): number => {
    if (age < 21) return 90;
    if (age < 31) return 80;
    if (age < 41) return 70;
    if (age < 51) return 60;
    if (age < 61) return 50;
    if (age < 71) return 40;
    if (age < 81) return 30;
    if (age < 91) return 20;
    return 10;
  };

  const calculerTaxeAdditionnelle = (plusValue: number): number => {
    if (plusValue <= 50000) return 0;
    if (plusValue <= 60000) return (plusValue - 50000) * 0.02;
    if (plusValue <= 100000) return 200 + (plusValue - 60000) * 0.03;
    if (plusValue <= 110000) return 1400 + (plusValue - 100000) * 0.04;
    if (plusValue <= 150000) return 1800 + (plusValue - 110000) * 0.05;
    if (plusValue <= 260000) return 4000 + (plusValue - 150000) * 0.06;
    return 10600;
  };

  const genererSuggestions = (data: FormData, res: Results): string[] => {
    const suggestions: string[] = [];
    const duree = res.dureeDetention;

    // Suggestion durée de détention
    if (duree < 6) {
      suggestions.push("⏰ Attendre 6 ans de détention vous permettrait de bénéficier des premiers abattements (6% par an pour l'IR).");
    } else if (duree < 22) {
      const anneesRestantes = 22 - duree;
      const economie = res.impotRevenu * (1 - res.abattementIR / 100);
      suggestions.push(`⏰ Dans ${anneesRestantes.toFixed(1)} ans, vous serez totalement exonéré d'impôt sur le revenu (économie estimée : ${economie.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €).`);
    } else if (duree < 30) {
      const anneesRestantes = 30 - duree;
      const economie = res.prelevementsSociaux;
      suggestions.push(`⏰ Dans ${anneesRestantes.toFixed(1)} ans, vous serez totalement exonéré de prélèvements sociaux (économie : ${economie.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €).`);
    }

    // Suggestion travaux
    if (data.travaux === 'aucun' && data.modeAcquisition === 'achat' && duree > 5) {
      const prixAcq = parseFloat(data.prixAcquisition.replace(/\s/g, '')) || 0;
      const travauxForfait = prixAcq * 0.15;
      suggestions.push(`🔨 Le forfait travaux de 15% (${travauxForfait.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €) réduirait votre plus-value sans justificatif (détention {'>'} 5 ans).`);
    }

    if (data.travaux === 'forfait' && data.travauxMontant) {
      const travauxReel = parseFloat(data.travauxMontant.replace(/\s/g, ''));
      const prixAcq = parseFloat(data.prixAcquisition.replace(/\s/g, '')) || 0;
      const travauxForfait = prixAcq * 0.15;
      if (travauxReel > travauxForfait) {
        const economie = (travauxReel - travauxForfait) * 0.362;
        suggestions.push(`📄 Vos travaux réels (${travauxReel.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €) sont supérieurs au forfait. Économie supplémentaire avec justificatifs : ${economie.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €.`);
      }
    }

    // Suggestion démembrement
    if (!data.estDemembre && data.typeBien !== 'principal') {
      suggestions.push("👥 Un démembrement de propriété (donation de la nue-propriété) pourrait optimiser la transmission et réduire la fiscalité future.");
    }

    // Suggestion SCI
    if (data.typeBien === 'locatif' && data.typeBien !== 'sci') {
      suggestions.push("🏢 Pour un bien locatif, une SCI familiale peut offrir des avantages de transmission et de gestion patrimoniale.");
    }

    // Suggestion frais réels
    if (data.fraisAcquisition === 'forfait' && data.modeAcquisition === 'achat') {
      const prixAcq = parseFloat(data.prixAcquisition.replace(/\s/g, '')) || 0;
      const fraisForfait = prixAcq * 0.075;
      suggestions.push(`📋 Si vos frais d'acquisition réels dépassent ${fraisForfait.toLocaleString('fr-FR', {maximumFractionDigits: 0})} € (forfait 7,5%), optez pour les frais réels avec justificatifs.`);
    }

    // Suggestion résidence principale
    if (data.typeBien === 'secondaire') {
      suggestions.push("🏠 Si ce bien devient votre résidence principale avant la vente, vous bénéficierez d'une exonération totale (Art. 150 U II 1° CGI).");
    }

    return suggestions;
  };

  // ============================================================================
  // CALCUL PRINCIPAL
  // ============================================================================

  const calculerPlusValue = (dateVenteCustom?: string, travauxCustom?: number): Results | null => {
    const dateVenteUtilisee = dateVenteCustom || formData.dateVente;
    
    if (!formData.dateAcquisition || !formData.prixVente) {
      return null;
    }

    // --- 1. EXONÉRATIONS TOTALES ---
    
    if (formData.typeBien === 'principal') {
      return {
        plusValueBrute: 0,
        prixAcquisitionCorrige: 0,
        prixVenteCorrige: parseFloat(formData.prixVente.replace(/\s/g, '')),
        dureeDetention: 0,
        dureeDetentionJours: 0,
        abattementIR: 100,
        abattementPS: 100,
        plusValueIR: 0,
        plusValuePS: 0,
        impotRevenu: 0,
        prelevementsSociaux: 0,
        taxeAdditionnelle: 0,
        totalFiscalite: 0,
        exoneration: true,
        motifExoneration: 'Résidence principale - Exonération totale (Art. 150 U II 1° CGI)',
        suggestions: [],
        economieAbattements: 0
      };
    }

    if (formData.premiereVente && formData.typeBien === 'secondaire') {
      const prixVenteBrut = parseFloat(formData.prixVente.replace(/\s/g, ''));
      if (prixVenteBrut <= 150000) {
        return {
          plusValueBrute: 0,
          prixAcquisitionCorrige: 0,
          prixVenteCorrige: prixVenteBrut,
          dureeDetention: 0,
          dureeDetentionJours: 0,
          abattementIR: 100,
          abattementPS: 100,
          plusValueIR: 0,
          plusValuePS: 0,
          impotRevenu: 0,
          prelevementsSociaux: 0,
          taxeAdditionnelle: 0,
          totalFiscalite: 0,
          exoneration: true,
          motifExoneration: 'Première cession résidence secondaire avec engagement de rachat sous 24 mois (Art. 150 U II 1° bis CGI)',
          suggestions: [],
          economieAbattements: 0
        };
      }
    }

    if (formData.retraite && formData.revenuFiscal) {
      const rfr = parseFloat(formData.revenuFiscal.replace(/\s/g, ''));
      if (rfr <= 12679) {
        return {
          plusValueBrute: 0,
          prixAcquisitionCorrige: 0,
          prixVenteCorrige: parseFloat(formData.prixVente.replace(/\s/g, '')),
          dureeDetention: 0,
          dureeDetentionJours: 0,
          abattementIR: 100,
          abattementPS: 100,
          plusValueIR: 0,
          plusValuePS: 0,
          impotRevenu: 0,
          prelevementsSociaux: 0,
          taxeAdditionnelle: 0,
          totalFiscalite: 0,
          exoneration: true,
          motifExoneration: `Retraité modeste - RFR ≤ 12 679€ (Art. 150 U II 6° CGI)`,
          suggestions: [],
          economieAbattements: 0
        };
      }
    }

    if (formData.expropriation) {
      return {
        plusValueBrute: 0,
        prixAcquisitionCorrige: 0,
        prixVenteCorrige: parseFloat(formData.prixVente.replace(/\s/g, '')),
        dureeDetention: 0,
        dureeDetentionJours: 0,
        abattementIR: 100,
        abattementPS: 100,
        plusValueIR: 0,
        plusValuePS: 0,
        impotRevenu: 0,
        prelevementsSociaux: 0,
        taxeAdditionnelle: 0,
        totalFiscalite: 0,
        exoneration: true,
        motifExoneration: 'Expropriation avec réemploi sous 12 mois (Art. 150 U II 4° CGI)',
        suggestions: [],
        economieAbattements: 0
      };
    }

    const prixVenteBrut = parseFloat(formData.prixVente.replace(/\s/g, ''));
    if (prixVenteBrut < 15000) {
      return {
        plusValueBrute: 0,
        prixAcquisitionCorrige: 0,
        prixVenteCorrige: prixVenteBrut,
        dureeDetention: 0,
        dureeDetentionJours: 0,
        abattementIR: 100,
        abattementPS: 100,
        plusValueIR: 0,
        plusValuePS: 0,
        impotRevenu: 0,
        prelevementsSociaux: 0,
        taxeAdditionnelle: 0,
        totalFiscalite: 0,
        exoneration: true,
        motifExoneration: 'Prix de vente < 15 000€ (Art. 150 U II 5° CGI)',
        suggestions: [],
        economieAbattements: 0
      };
    }

    // --- 2. CALCUL PRIX D'ACQUISITION CORRIGÉ ---
    
    let prixAcqBase = 0;
    
    if (formData.modeAcquisition === 'achat') {
      prixAcqBase = parseFloat(formData.prixAcquisition.replace(/\s/g, '')) || 0;
    } else {
      prixAcqBase = parseFloat(formData.valeurVenale.replace(/\s/g, '')) || 0;
    }

    // Démembrement
    if (formData.estDemembre && formData.typeDroit !== 'pleine' && formData.ageUsufruitier) {
      const age = parseInt(formData.ageUsufruitier);
      const valeurUsufruitPct = calculerValeurUsufruit(age);
      
      if (formData.typeDroit === 'usufruit') {
        prixAcqBase = prixAcqBase * (valeurUsufruitPct / 100);
      } else if (formData.typeDroit === 'nue') {
        prixAcqBase = prixAcqBase * ((100 - valeurUsufruitPct) / 100);
      }
    }

    // Indivision / Copropriété
    if (formData.typeBien === 'sci' || parseInt(formData.nombreCoproprietaires) > 1) {
      const pourcentage = parseFloat(formData.pourcentageDetention) / 100;
      prixAcqBase = prixAcqBase * pourcentage;
    }

    let fraisAcq = 0;
    if (formData.fraisAcquisition === 'forfait' && formData.modeAcquisition === 'achat') {
      fraisAcq = prixAcqBase * 0.075;
    } else if (formData.fraisAcquisition === 'reel' && formData.fraisAcquisitionMontant) {
      fraisAcq = parseFloat(formData.fraisAcquisitionMontant.replace(/\s/g, ''));
    }

    const dureeDet = calculerDureeDetention(formData.dateAcquisition, dateVenteUtilisee);
    const duree = dureeDet.annees;
    
    let montantTravaux = travauxCustom !== undefined ? travauxCustom : 0;
    
    if (travauxCustom === undefined) {
      if (formData.travaux === 'forfait' && duree > 5 && formData.modeAcquisition === 'achat') {
        montantTravaux = prixAcqBase * 0.15;
      } else if (formData.travaux === 'reel' && formData.travauxMontant) {
        montantTravaux = parseFloat(formData.travauxMontant.replace(/\s/g, ''));
      }
    }

    const prixAcquisitionCorrige = prixAcqBase + fraisAcq + montantTravaux;

    // --- 3. PRIX DE VENTE CORRIGÉ ---
    
    const fraisVenteMontant = parseFloat(formData.fraisVente.replace(/\s/g, '') || '0');
    let prixVenteCorrige = prixVenteBrut - fraisVenteMontant;

    // Appliquer démembrement et copropriété au prix de vente aussi
    if (formData.estDemembre && formData.typeDroit !== 'pleine' && formData.ageUsufruitier) {
      const age = parseInt(formData.ageUsufruitier);
      const valeurUsufruitPct = calculerValeurUsufruit(age);
      
      if (formData.typeDroit === 'usufruit') {
        prixVenteCorrige = prixVenteCorrige * (valeurUsufruitPct / 100);
      } else if (formData.typeDroit === 'nue') {
        prixVenteCorrige = prixVenteCorrige * ((100 - valeurUsufruitPct) / 100);
      }
    }

    if (formData.typeBien === 'sci' || parseInt(formData.nombreCoproprietaires) > 1) {
      const pourcentage = parseFloat(formData.pourcentageDetention) / 100;
      prixVenteCorrige = prixVenteCorrige * pourcentage;
    }

    // --- 4. PLUS-VALUE BRUTE ---
    
    const plusValueBrute = Math.max(0, prixVenteCorrige - prixAcquisitionCorrige);

    // --- 5. ABATTEMENTS ---
    
    let abattementIR = calculerAbattementIR(duree);
    let abattementPS = calculerAbattementPS(duree);

    // Zone tendue : abattement exceptionnel
    if (formData.zoneTendue) {
      abattementIR = Math.max(abattementIR, 70);
      abattementPS = Math.max(abattementPS, 70);
    }

    // --- 6. PLUS-VALUES IMPOSABLES ---
    
    const plusValueIR = plusValueBrute * (1 - abattementIR / 100);
    const plusValuePS = plusValueBrute * (1 - abattementPS / 100);

    // --- 7. FISCALITÉ ---
    
    const impotRevenu = plusValueIR * 0.19;
    const prelevementsSociaux = plusValuePS * 0.172;
    const taxeAdditionnelle = calculerTaxeAdditionnelle(plusValueIR);
    
    const totalFiscalite = impotRevenu + prelevementsSociaux + taxeAdditionnelle;

    // Calcul économie abattements
    const fiscaliteSansAbattement = plusValueBrute * 0.362 + calculerTaxeAdditionnelle(plusValueBrute);
    const economieAbattements = fiscaliteSansAbattement - totalFiscalite;

    const resultats: Results = {
      plusValueBrute,
      prixAcquisitionCorrige,
      prixVenteCorrige,
      dureeDetention: duree,
      dureeDetentionJours: dureeDet.jours,
      abattementIR,
      abattementPS,
      plusValueIR,
      plusValuePS,
      impotRevenu,
      prelevementsSociaux,
      taxeAdditionnelle,
      totalFiscalite,
      exoneration: false,
      motifExoneration: '',
      suggestions: [],
      economieAbattements
    };

    resultats.suggestions = genererSuggestions(formData, resultats);

    // Valeur démembrement
    if (formData.estDemembre && formData.ageUsufruitier) {
      const age = parseInt(formData.ageUsufruitier);
      const valeurUsufruitPct = calculerValeurUsufruit(age);
      resultats.valeurDemembrement = {
        usufruit: valeurUsufruitPct,
        nue: 100 - valeurUsufruitPct
      };
    }

    return resultats;
  };

  const handleCalculer = () => {
    const res = calculerPlusValue();
    if (res) {
      setResults(res);
      genererScenarios();
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  };

  // ============================================================================
  // SCENARIOS COMPARATIFS
  // ============================================================================

  const genererScenarios = () => {
    const scenariosGeneres: Scenario[] = [];
    const dateAcq = new Date(formData.dateAcquisition);
    const today = new Date();

    // Scénario 1 : Vente immédiate
    const res1 = calculerPlusValue(today.toISOString().split('T')[0]);
    if (res1) {
      scenariosGeneres.push({
        nom: 'Vente immédiate',
        dateVente: today.toISOString().split('T')[0],
        results: res1
      });
    }

    // Scénario 2 : Attente 22 ans (exonération IR)
    const date22ans = new Date(dateAcq);
    date22ans.setFullYear(date22ans.getFullYear() + 22);
    if (date22ans > today) {
      const res2 = calculerPlusValue(date22ans.toISOString().split('T')[0]);
      if (res2) {
        scenariosGeneres.push({
          nom: 'Attente exonération IR (22 ans)',
          dateVente: date22ans.toISOString().split('T')[0],
          results: res2
        });
      }
    }

    // Scénario 3 : Attente 30 ans (exonération totale)
    const date30ans = new Date(dateAcq);
    date30ans.setFullYear(date30ans.getFullYear() + 30);
    if (date30ans > today) {
      const res3 = calculerPlusValue(date30ans.toISOString().split('T')[0]);
      if (res3) {
        scenariosGeneres.push({
          nom: 'Exonération totale (30 ans)',
          dateVente: date30ans.toISOString().split('T')[0],
          results: res3
        });
      }
    }

    // Scénario 4 : Avec travaux optimisés
    if (formData.travaux === 'aucun' && formData.modeAcquisition === 'achat') {
      const prixAcq = parseFloat(formData.prixAcquisition.replace(/\s/g, '')) || 0;
      const travauxForfait = prixAcq * 0.15;
      const res4 = calculerPlusValue(undefined, travauxForfait);
      if (res4) {
        scenariosGeneres.push({
          nom: 'Avec forfait travaux 15%',
          dateVente: formData.dateVente,
          travaux: travauxForfait,
          results: res4
        });
      }
    }

    setScenarios(scenariosGeneres);
  };

  // ============================================================================
  // GRAPHIQUES
  // ============================================================================

  const graphiqueEvolution = useMemo(() => {
    if (!formData.dateAcquisition || !formData.prixVente) return [];

    const data = [];
    const dateAcq = new Date(formData.dateAcquisition);

    for (let annee = 0; annee <= 35; annee++) {
      const dateVente = new Date(dateAcq);
      dateVente.setFullYear(dateVente.getFullYear() + annee);
      
      const res = calculerPlusValue(dateVente.toISOString().split('T')[0]);
      
      if (res && !res.exoneration) {
        data.push({
          annee,
          fiscalite: Math.round(res.totalFiscalite),
          ir: Math.round(res.impotRevenu),
          ps: Math.round(res.prelevementsSociaux),
          abattementIR: res.abattementIR,
          abattementPS: res.abattementPS
        });
      }
    }

    return data;
  }, [formData.dateAcquisition, formData.prixVente, formData.prixAcquisition, formData.travaux, formData.travauxMontant]);

  // ============================================================================
  // EXPORT PDF
  // ============================================================================

  const exporterPDF = async () => {
    if (!results) {
      alert('Veuillez d\'abord calculer la plus-value');
      return;
    }

    // Utilisation basique sans jsPDF pour éviter les erreurs
    const contenu = `
CALCUL PLUS-VALUE IMMOBILIÈRE
Date: ${new Date().toLocaleDateString('fr-FR')}

${results.exoneration ? 
`EXONÉRATION TOTALE
${results.motifExoneration}` :
`RÉSULTATS
Plus-value brute: ${results.plusValueBrute.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €
Durée de détention: ${results.dureeDetention.toFixed(2)} ans (${results.dureeDetentionJours} jours)

FISCALITÉ
Impôt sur le revenu (19%): ${results.impotRevenu.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €
Prélèvements sociaux (17,2%): ${results.prelevementsSociaux.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €
${results.taxeAdditionnelle > 0 ? `Taxe additionnelle: ${results.taxeAdditionnelle.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €\n` : ''}
TOTAL: ${results.totalFiscalite.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €

Économie grâce aux abattements: ${results.economieAbattements.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €`
}
    `;

    const blob = new Blob([contenu], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plusvalue_${Date.now()}.txt`;
    a.click();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Calculateur de Plus-Value Immobilière</h1>
                  <p className="text-emerald-600 font-medium">Conforme aux articles 150 U et suivants du CGI 2025</p>
                </div>
              </div>
            </div>
            {results && !results.exoneration && (
              <div className="text-right">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                  <p className="text-sm text-emerald-600 font-medium mb-1">Fiscalité totale</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {results.totalFiscalite.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-emerald-600 mt-2">
                    Économie : {results.economieAbattements.toLocaleString('fr-FR', {maximumFractionDigits: 0})} € grâce aux abattements
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'acquisition', label: 'Acquisition', icon: Calendar },
                { id: 'vente', label: 'Vente', icon: Euro },
                { id: 'travaux', label: 'Travaux', icon: FileText },
                { id: 'exonerations', label: 'Exonérations', icon: CheckCircle },
                { id: 'optimisation', label: 'Optimisation', icon: Lightbulb }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des tabs */}
          <div className="mt-6">
            {activeTab === 'acquisition' && (
              <div className="space-y-6">
                {/* Mode d'acquisition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Comment avez-vous acquis le bien ? *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'achat', label: 'Achat', icon: Euro },
                      { value: 'donation', label: 'Donation', icon: Gift },
                      { value: 'succession', label: 'Succession', icon: Users },
                      { value: 'echange', label: 'Échange', icon: ArrowRight }
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setFormData({...formData, modeAcquisition: mode.value as any})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.modeAcquisition === mode.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <mode.icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <p className="text-sm font-medium">{mode.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type de bien */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Type de bien *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'principal', label: 'Résidence principale' },
                      { value: 'secondaire', label: 'Résidence secondaire' },
                      { value: 'locatif', label: 'Bien locatif' },
                      { value: 'sci', label: 'SCI à l\'IR / Indivision' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({...formData, typeBien: type.value as any})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.typeBien === type.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-sm font-medium">{type.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        <strong>Important :</strong> Ce calculateur concerne uniquement les SCI à l'IR (impôt sur le revenu). 
                        Les SCI à l'IS relèvent du régime des plus-values professionnelles (calculateur distinct).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Démembrement */}
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                  <div className="flex items-center gap-3 mb-4">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Démembrement de propriété</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">Le bien est-il démembré ?</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, estDemembre: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.estDemembre
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, estDemembre: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.estDemembre
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {formData.estDemembre && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Vous détenez :
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'pleine', label: 'Pleine propriété' },
                            { value: 'usufruit', label: 'Usufruit' },
                            { value: 'nue', label: 'Nue-propriété' }
                          ].map((type) => (
                            <button
                              key={type.value}
                              onClick={() => setFormData({...formData, typeDroit: type.value as any})}
                              className={`p-3 rounded-lg border-2 transition-all text-sm ${
                                formData.typeDroit === type.value
                                  ? 'border-emerald-500 bg-white'
                                  : 'border-gray-300 bg-white hover:border-emerald-300'
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.typeDroit !== 'pleine' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Âge de l'usufruitier *
                          </label>
                          <input
                            type="number"
                            value={formData.ageUsufruitier}
                            onChange={(e) => setFormData({...formData, ageUsufruitier: e.target.value})}
                            placeholder="65"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <p className="text-xs text-gray-600 mt-2">
                            Nécessaire pour calculer la valeur de l'usufruit selon le barème de l'Art. 669 CGI
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Copropriété / Indivision */}
                {(formData.typeBien === 'sci' || formData.estDemembre) && (
                  <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Indivision / Copropriété</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pourcentage de détention
                        </label>
                        <input
                          type="number"
                          value={formData.pourcentageDetention}
                          onChange={(e) => setFormData({...formData, pourcentageDetention: e.target.value})}
                          placeholder="50"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre de copropriétaires
                        </label>
                        <input
                          type="number"
                          value={formData.nombreCoproprietaires}
                          onChange={(e) => setFormData({...formData, nombreCoproprietaires: e.target.value})}
                          placeholder="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Prix ou valeur selon mode d'acquisition */}
                {formData.modeAcquisition === 'achat' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Prix d'acquisition *
                    </label>
                    <input
                      type="text"
                      value={formData.prixAcquisition}
                      onChange={(e) => setFormData({...formData, prixAcquisition: e.target.value})}
                      placeholder="180 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Valeur vénale au moment de la {formData.modeAcquisition} *
                    </label>
                    <input
                      type="text"
                      value={formData.valeurVenale}
                      onChange={(e) => setFormData({...formData, valeurVenale: e.target.value})}
                      placeholder="180 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Valeur déclarée dans l'acte de {formData.modeAcquisition}
                    </p>
                  </div>
                )}

                {/* Date d'acquisition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Date d'acquisition *
                  </label>
                  <input
                    type="date"
                    value={formData.dateAcquisition}
                    onChange={(e) => setFormData({...formData, dateAcquisition: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Frais d'acquisition */}
                {formData.modeAcquisition === 'achat' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Frais d'acquisition
                    </label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <button
                        onClick={() => setFormData({...formData, fraisAcquisition: 'forfait'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.fraisAcquisition === 'forfait'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-sm font-medium">Forfait 7,5%</p>
                      </button>
                      <button
                        onClick={() => setFormData({...formData, fraisAcquisition: 'reel'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.fraisAcquisition === 'reel'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-sm font-medium">Montant réel</p>
                      </button>
                    </div>
                    {formData.fraisAcquisition === 'reel' && (
                      <input
                        type="text"
                        value={formData.fraisAcquisitionMontant}
                        onChange={(e) => setFormData({...formData, fraisAcquisitionMontant: e.target.value})}
                        placeholder="13 500"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vente' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Prix de vente *
                  </label>
                  <input
                    type="text"
                    value={formData.prixVente}
                    onChange={(e) => setFormData({...formData, prixVente: e.target.value})}
                    placeholder="320 000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Date de vente prévue *
                  </label>
                  <input
                    type="date"
                    value={formData.dateVente}
                    onChange={(e) => setFormData({...formData, dateVente: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Calcul au jour près</p>
                        <p>La durée de détention est calculée avec précision pour optimiser vos abattements.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Frais de vente (diagnostics, etc.)
                  </label>
                  <input
                    type="text"
                    value={formData.fraisVente}
                    onChange={(e) => setFormData({...formData, fraisVente: e.target.value})}
                    placeholder="1 500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'travaux' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Travaux réalisés
                  </label>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <button
                      onClick={() => setFormData({...formData, travaux: 'aucun'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.travaux === 'aucun'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium">Aucun</p>
                    </button>
                    <button
                      onClick={() => setFormData({...formData, travaux: 'forfait'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.travaux === 'forfait'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium">Forfait 15%</p>
                    </button>
                    <button
                      onClick={() => setFormData({...formData, travaux: 'reel'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.travaux === 'reel'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium">Montant réel</p>
                    </button>
                  </div>

                  {formData.travaux === 'reel' && (
                    <input
                      type="text"
                      value={formData.travauxMontant}
                      onChange={(e) => setFormData({...formData, travauxMontant: e.target.value})}
                      placeholder="35 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Forfait 15%</p>
                        <p>Applicable si détention {'>'} 5 ans, sans justificatifs. Sinon montant réel avec factures.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exonerations' && (
              <div className="space-y-6">
                {/* Première vente résidence secondaire */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Première vente d'une résidence secondaire</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Article 150 U II 1° bis du CGI - Exonération sous CONDITIONS STRICTES :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Vous n'avez pas été propriétaire de votre résidence principale les 4 années précédentes</li>
                        <li>• Vous vous engagez à racheter une résidence principale dans les 24 mois</li>
                        <li>• Le prix de vente ne dépasse pas 150 000€ (hors zone tendue)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Je remplis TOUTES ces conditions
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, premiereVente: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.premiereVente
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, premiereVente: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.premiereVente
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-500'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>

                {/* Retraité ou invalide */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Retraité modeste ou personne invalide</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Article 150 U II 6° du CGI - Exonération si :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Vous êtes titulaire d'une pension de vieillesse OU d'une carte mobilité inclusion (invalidité)</li>
                        <li>• Votre revenu fiscal de référence (RFR) ne dépasse pas 12 679€ (1 part) / 16 103€ (1,5 part) / 19 527€ (2 parts)</li>
                        <li>• Le bien n'était pas loué au moment de la vente</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Je suis retraité(e) ou invalide
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, retraite: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.retraite
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, retraite: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.retraite
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-500'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {formData.retraite && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Votre revenu fiscal de référence (RFR) de l'année N-1
                      </label>
                      <input
                        type="text"
                        value={formData.revenuFiscal}
                        onChange={(e) => setFormData({...formData, revenuFiscal: e.target.value})}
                        placeholder="12 000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Visible sur votre avis d'imposition, ligne "Revenu fiscal de référence"
                      </p>
                    </div>
                  )}
                </div>

                {/* Expropriation */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Bien exproprié pour cause d'utilité publique</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Article 150 U II 4° du CGI - Exonération si :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Expropriation pour cause d'utilité publique</li>
                        <li>• Vous réemployez l'indemnité dans l'acquisition, construction ou agrandissement d'un bien dans les 12 mois</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Mon bien a été exproprié et je vais réemployer l'indemnité
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, expropriation: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.expropriation
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, expropriation: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.expropriation
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-500'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zone tendue */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Vente en zone tendue</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Abattement exceptionnel de 70% à 85% si :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Le bien est situé en zone A, A bis ou B1</li>
                        <li>• Vous vous engagez à démolir et reconstruire dans les 4 ans</li>
                        <li>• Au moins 50% des surfaces reconstruites sont en logement social</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Je remplis ces conditions
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, zoneTendue: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.zoneTendue
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, zoneTendue: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.zoneTendue
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-500'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'optimisation' && results && (
              <div className="space-y-6">
                {/* Suggestions */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                    <h3 className="text-lg font-bold text-gray-900">Suggestions d'optimisation</h3>
                  </div>
                  {results.suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {results.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                          <p className="text-sm text-gray-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Aucune optimisation supplémentaire détectée. Votre configuration est déjà optimale !</p>
                  )}
                </div>

                {/* Graphique évolution fiscalité */}
                {graphiqueEvolution.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <BarChart3 className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-lg font-bold text-gray-900">Évolution de la fiscalité selon la durée de détention</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={graphiqueEvolution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="annee" 
                          label={{ value: 'Années de détention', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Fiscalité (€)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value: number) => value.toLocaleString('fr-FR') + ' €'}
                          labelFormatter={(label) => `Année ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="fiscalite" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          name="Fiscalité totale"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ir" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Impôt sur le revenu"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ps" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="Prélèvements sociaux"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-blue-600 font-medium mb-1">Exonération IR</p>
                        <p className="text-2xl font-bold text-blue-900">22 ans</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <p className="text-xs text-amber-600 font-medium mb-1">Exonération PS</p>
                        <p className="text-2xl font-bold text-amber-900">30 ans</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparaison scénarios */}
                {scenarios.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">Comparaison de scénarios</h3>
                      </div>
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
                      >
                        {showComparison ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>

                    {showComparison && (
                      <div className="space-y-4">
                        {scenarios.map((scenario, index) => (
                          <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">{scenario.nom}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(scenario.dateVente).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Plus-value</p>
                                <p className="font-semibold text-gray-900">
                                  {scenario.results.plusValueBrute.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Abattements</p>
                                <p className="font-semibold text-gray-900">
                                  IR: {scenario.results.abattementIR.toFixed(0)}% / PS: {scenario.results.abattementPS.toFixed(0)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Fiscalité</p>
                                <p className="font-bold text-emerald-600">
                                  {scenario.results.totalFiscalite.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                                </p>
                              </div>
                            </div>
                            {scenario.travaux && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                  Travaux inclus : {scenario.travaux.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!showComparison && (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={scenarios}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nom" angle={-15} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: number) => value.toLocaleString('fr-FR') + ' €'}
                          />
                          <Bar dataKey="results.totalFiscalite" fill="#10b981" name="Fiscalité totale" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}

                {/* Valeur démembrement */}
                {results.valeurDemembrement && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <PieChart className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Valeur du démembrement</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium mb-2">Usufruit</p>
                        <p className="text-3xl font-bold text-blue-900">{results.valeurDemembrement.usufruit}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <p className="text-sm text-green-600 font-medium mb-2">Nue-propriété</p>
                        <p className="text-3xl font-bold text-green-900">{results.valeurDemembrement.nue}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Barème fiscal de l'article 669 du CGI
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCalculer}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Calculator className="w-5 h-5" />
              Calculer
            </button>
            <button
              onClick={exporterPDF}
              disabled={!results}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Résultats */}
        {results && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Résultats du calcul</h2>

            {results.exoneration ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">Exonération Totale</h3>
                <p className="text-green-700">{results.motifExoneration}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Durée détention avec précision */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Durée de détention (calcul au jour près)</h3>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-blue-900">{results.dureeDetention.toFixed(2)}</p>
                    <p className="text-lg text-blue-700">ans</p>
                    <p className="text-sm text-blue-600 ml-4">({results.dureeDetentionJours} jours)</p>
                  </div>
                </div>

                {/* Plus-value brute */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Plus-value brute</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix de vente corrigé</span>
                      <span className="font-semibold">{results.prixVenteCorrige.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix d'acquisition corrigé</span>
                      <span className="font-semibold">-{results.prixAcquisitionCorrige.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                      <span className="font-bold text-gray-900">Plus-value brute</span>
                      <span className="font-bold text-gray-900">{results.plusValueBrute.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                  </div>
                </div>

                {/* Abattements */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-900 mb-4">Abattements pour durée de détention</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Abattement IR</p>
                      <p className="text-3xl font-bold text-emerald-900">{results.abattementIR.toFixed(2)}%</p>
                      <div className="mt-2 bg-emerald-100 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${results.abattementIR}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Abattement PS</p>
                      <p className="text-3xl font-bold text-green-900">{results.abattementPS.toFixed(2)}%</p>
                      <div className="mt-2 bg-green-100 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${results.abattementPS}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-700 font-medium text-center">
                    Économie totale grâce aux abattements : {results.economieAbattements.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                  </p>
                </div>

                {/* Fiscalité */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <span className="text-gray-900 font-medium">Impôt sur le revenu (19%)</span>
                      <p className="text-xs text-gray-500">
                        Sur {results.plusValueIR.toLocaleString('fr-FR', {maximumFractionDigits: 0})} € de PV imposable
                      </p>
                    </div>
                    <span className="font-semibold text-lg">{results.impotRevenu.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <span className="text-gray-900 font-medium">Prélèvements sociaux (17,2%)</span>
                      <p className="text-xs text-gray-500">
                        Sur {results.plusValuePS.toLocaleString('fr-FR', {maximumFractionDigits: 0})} € de PV imposable
                      </p>
                    </div>
                    <span className="font-semibold text-lg">{results.prelevementsSociaux.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                  </div>
                  {results.taxeAdditionnelle > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <span className="text-gray-900 font-medium">Taxe additionnelle</span>
                        <p className="text-xs text-gray-500">
                          Sur PV imposable {'>'} 50 000€
                        </p>
                      </div>
                      <span className="font-semibold text-lg">{results.taxeAdditionnelle.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-6 border-t-2 border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl px-6 -mx-6">
                    <div>
                      <span className="font-bold text-xl text-gray-900">TOTAL FISCALITÉ</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {((results.totalFiscalite / results.plusValueBrute) * 100).toFixed(1)}% de la plus-value brute
                      </p>
                    </div>
                    <span className="font-bold text-3xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {results.totalFiscalite.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>

                {/* Net vendeur */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-600 font-medium mb-1">Net vendeur après fiscalité</p>
                      <p className="text-xs text-gray-600">
                        Prix de vente - frais - fiscalité
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {(results.prixVenteCorrige - results.totalFiscalite).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT AVEC LAYOUT
// ============================================================================

export default function PlusValuePage() {
  return (
    <MainLayout showFeedback={false}>
      <PlusValueContent />
    </MainLayout>
  );
}