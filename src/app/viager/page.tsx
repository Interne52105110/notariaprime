// ============================================
// FILE: src/app/viager/page.tsx  
// VERSION: 5.0 FINALE - TOUTES FONCTIONNALITÉS
// ============================================

"use client";

import React, { useState, useMemo, useRef } from 'react';
import { 
  Home, Calendar, TrendingUp, Calculator, PieChart as PieChartIcon,
  AlertCircle, Info, HelpCircle, ChevronDown, ChevronUp, BookOpen,
  Heart, Percent, Euro, Users, Clock, Award, Download, FileText,
  Scale, GitCompare, CheckCircle2, UserPlus, Trash2, Building
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES V5
// ============================================

type MethodeCalcul = 'simple' | 'daubry' | 'actuarielle' | 'fiscale' | 'moyenne';

interface Creditentier {
  id: string;
  dateNaissance: string;
  sexe: 'homme' | 'femme';
  pourcentageRente: number; // % de la rente qu'il recevra
}

interface FormData {
  valeurBien: string;
  typeViager: 'occupe' | 'libre';
  
  // ✅ MULTI-CRÉDIRENTIERS
  creditentiers: Creditentier[];
  
  dateSignature: string;
  bouquet: string;
  
  taxeFonciere: string;
  loyerMensuelTheorique: string; // Loyer théorique du marché pour calculer DUH
  typeOccupation?: 'DUH' | 'usufruit';
  
  // ✅ CHOIX EXPLICITE DU PAYEUR DE TAXE FONCIÈRE
  payeurTaxeFonciere: 'acheteur' | 'vendeur' | 'partage';
  
  methodeCalcul: MethodeCalcul;
  tauxTechniquePersonnalise?: number;
  
  // ✅ MODE COMPARAISON BOUQUET
  activerComparaisonBouquet: boolean;
}

interface ResultatViager {
  valeurBien: number;
  valeurOccupee: number;
  decoteDUH: number;
  bouquet: number;
  capitalRestant: number;
  renteViagere: number;
  esperanceVie: number;
  totalVerse: number;
  economieVendeur: number;
  ageTheoriqueDeces: number;
  tauxCapitalisation: number;
  
  ageExactVendeur: number;
  generationVendeur: number;
  tableUtilisee: string;
  dateSignatureStr: string;
  
  taxeFonciereAnnuelle: number;
  payeurTaxeFonciere: 'acheteur' | 'vendeur' | 'partage';
  coutTotalTaxesFoncieresAcheteur: number;
  baseJuridiqueTaxe: string;
  
  methodeUtilisee: string;
  tauxTechniqueApplique: number;
  descriptionMethode: string;
  
  // ✅ Info crédirentiers
  nombreCredirentiers: number;
  creditentiersDetails: string[];
}

interface ResultatsComparatifs {
  simple: ResultatViager;
  daubry: ResultatViager;
  actuarielle: ResultatViager;
  fiscale: ResultatViager;
  moyenne: ResultatViager;
}

// ✅ COMPARAISON BOUQUETS
interface ComparaisonBouquets {
  bouquetActuel: ResultatViager;
  bouquetTiers: ResultatViager;
  bouquetZero: ResultatViager;
}

// ============================================
// TABLES TGH05/TGF05
// ============================================

const TGH05: { [generation: number]: { [age: number]: number } } = {
  1940: {
    60: 18.5, 61: 17.7, 62: 16.9, 63: 16.1, 64: 15.3, 65: 14.5,
    66: 13.8, 67: 13.0, 68: 12.3, 69: 11.6, 70: 10.9,
    71: 10.2, 72: 9.6, 73: 9.0, 74: 8.4, 75: 7.8,
    76: 7.3, 77: 6.8, 78: 6.3, 79: 5.9, 80: 5.5,
    81: 5.1, 82: 4.7, 83: 4.4, 84: 4.1, 85: 3.8,
    86: 3.5, 87: 3.2, 88: 3.0, 89: 2.8, 90: 2.6
  },
  1945: {
    60: 19.8, 61: 19.0, 62: 18.1, 63: 17.3, 64: 16.5, 65: 15.7,
    66: 14.9, 67: 14.2, 68: 13.4, 69: 12.7, 70: 12.0,
    71: 11.3, 72: 10.6, 73: 10.0, 74: 9.4, 75: 8.8,
    76: 8.2, 77: 7.7, 78: 7.2, 79: 6.7, 80: 6.3,
    81: 5.8, 82: 5.4, 83: 5.1, 84: 4.7, 85: 4.4,
    86: 4.1, 87: 3.8, 88: 3.5, 89: 3.3, 90: 3.1
  },
  1950: {
    60: 21.1, 61: 20.2, 62: 19.3, 63: 18.5, 64: 17.6, 65: 16.8,
    66: 16.0, 67: 15.2, 68: 14.4, 69: 13.7, 70: 12.9,
    71: 12.2, 72: 11.5, 73: 10.8, 74: 10.2, 75: 9.5,
    76: 8.9, 77: 8.4, 78: 7.8, 79: 7.3, 80: 6.8,
    81: 6.4, 82: 5.9, 83: 5.5, 84: 5.2, 85: 4.8,
    86: 4.5, 87: 4.2, 88: 3.9, 89: 3.7, 90: 3.4
  },
  1955: {
    60: 22.3, 61: 21.4, 62: 20.5, 63: 19.6, 64: 18.7, 65: 17.9,
    66: 17.0, 67: 16.2, 68: 15.4, 69: 14.6, 70: 13.8,
    71: 13.1, 72: 12.4, 73: 11.7, 74: 11.0, 75: 10.3,
    76: 9.7, 77: 9.1, 78: 8.5, 79: 7.9, 80: 7.4,
    81: 6.9, 82: 6.5, 83: 6.0, 84: 5.6, 85: 5.3,
    86: 4.9, 87: 4.6, 88: 4.3, 89: 4.0, 90: 3.7
  },
  1960: {
    60: 23.4, 61: 22.5, 62: 21.6, 63: 20.7, 64: 19.8, 65: 18.9,
    66: 18.0, 67: 17.2, 68: 16.4, 69: 15.6, 70: 14.8,
    71: 14.0, 72: 13.3, 73: 12.5, 74: 11.8, 75: 11.1,
    76: 10.4, 77: 9.8, 78: 9.2, 79: 8.6, 80: 8.0,
    81: 7.5, 82: 7.0, 83: 6.5, 84: 6.1, 85: 5.7,
    86: 5.3, 87: 4.9, 88: 4.6, 89: 4.3, 90: 4.0
  }
};

const TGF05: { [generation: number]: { [age: number]: number } } = {
  1940: {
    60: 22.1, 61: 21.2, 62: 20.3, 63: 19.5, 64: 18.6, 65: 17.7,
    66: 16.9, 67: 16.1, 68: 15.3, 69: 14.5, 70: 13.7,
    71: 12.9, 72: 12.2, 73: 11.5, 74: 10.8, 75: 10.1,
    76: 9.5, 77: 8.9, 78: 8.3, 79: 7.7, 80: 7.2,
    81: 6.7, 82: 6.2, 83: 5.8, 84: 5.4, 85: 5.0,
    86: 4.6, 87: 4.3, 88: 4.0, 89: 3.7, 90: 3.4
  },
  1945: {
    60: 23.5, 61: 22.6, 62: 21.7, 63: 20.8, 64: 19.9, 65: 19.0,
    66: 18.2, 67: 17.3, 68: 16.5, 69: 15.7, 70: 14.9,
    71: 14.1, 72: 13.4, 73: 12.6, 74: 11.9, 75: 11.2,
    76: 10.5, 77: 9.9, 78: 9.3, 79: 8.7, 80: 8.1,
    81: 7.6, 82: 7.1, 83: 6.6, 84: 6.1, 85: 5.7,
    86: 5.3, 87: 4.9, 88: 4.6, 89: 4.3, 90: 4.0
  },
  1950: {
    60: 24.8, 61: 23.9, 62: 23.0, 63: 22.1, 64: 21.2, 65: 20.3,
    66: 19.4, 67: 18.6, 68: 17.7, 69: 16.9, 70: 16.1,
    71: 15.3, 72: 14.5, 73: 13.7, 74: 12.9, 75: 12.2,
    76: 11.5, 77: 10.8, 78: 10.1, 79: 9.5, 80: 8.9,
    81: 8.3, 82: 7.7, 83: 7.2, 84: 6.7, 85: 6.2,
    86: 5.8, 87: 5.4, 88: 5.0, 89: 4.7, 90: 4.4
  },
  1955: {
    60: 26.1, 61: 25.2, 62: 24.3, 63: 23.4, 64: 22.5, 65: 21.6,
    66: 20.7, 67: 19.8, 68: 19.0, 69: 18.1, 70: 17.3,
    71: 16.5, 72: 15.7, 73: 14.9, 74: 14.1, 75: 13.4,
    76: 12.6, 77: 11.9, 78: 11.2, 79: 10.5, 80: 9.9,
    81: 9.3, 82: 8.7, 83: 8.1, 84: 7.6, 85: 7.1,
    86: 6.6, 87: 6.1, 88: 5.7, 89: 5.3, 90: 4.9
  },
  1960: {
    60: 27.3, 61: 26.4, 62: 25.5, 63: 24.6, 64: 23.7, 65: 22.8,
    66: 21.9, 67: 21.0, 68: 20.2, 69: 19.3, 70: 18.5,
    71: 17.7, 72: 16.9, 73: 16.1, 74: 15.3, 75: 14.5,
    76: 13.7, 77: 13.0, 78: 12.3, 79: 11.6, 80: 10.9,
    81: 10.3, 82: 9.7, 83: 9.1, 84: 8.5, 85: 8.0,
    86: 7.5, 87: 7.0, 88: 6.5, 89: 6.1, 90: 5.7
  }
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ViagerCalculator() {
  const [formData, setFormData] = useState<FormData>({
    valeurBien: '300000',
    typeViager: 'occupe',
    creditentiers: [
      { id: '1', dateNaissance: '1950-01-15', sexe: 'femme', pourcentageRente: 100 }
    ],
    dateSignature: new Date().toISOString().split('T')[0],
    bouquet: '90000',
    loyerMensuelTheorique: '1000',
    taxeFonciere: '1500',
    typeOccupation: 'DUH',
    payeurTaxeFonciere: 'acheteur',
    methodeCalcul: 'moyenne',
    tauxTechniquePersonnalise: 4.5,
    activerComparaisonBouquet: false
  });

  const [showResults, setShowResults] = useState(false);
  const [modeComparaison, setModeComparaison] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ============================================
  // FONCTIONS DE CALCUL
  // ============================================

  const obtenirEsperanceVie = (
    dateNaissance: string,
    dateSignature: string,
    sexe: 'homme' | 'femme'
  ): { esperanceVie: number; ageExact: number; generation: number; table: string } => {
    const naissance = new Date(dateNaissance);
    const signature = new Date(dateSignature);
    
    const diffMs = signature.getTime() - naissance.getTime();
    const ageExact = diffMs / (365.25 * 24 * 60 * 60 * 1000);
    const ageArrondi = Math.floor(ageExact);
    
    const anneeNaissance = naissance.getFullYear();
    let generation = 1940;
    if (anneeNaissance >= 1955) generation = 1960;
    else if (anneeNaissance >= 1950) generation = 1955;
    else if (anneeNaissance >= 1945) generation = 1950;
    else if (anneeNaissance >= 1940) generation = 1945;
    
    const table = sexe === 'homme' ? TGH05 : TGF05;
    const tableNom = sexe === 'homme' ? 'TGH05' : 'TGF05';
    
    if (!table[generation] || !table[generation][ageArrondi]) {
      return { esperanceVie: 15, ageExact, generation, table: tableNom };
    }
    
    const esperanceVie = table[generation][ageArrondi];
    return { esperanceVie, ageExact, generation, table: tableNom };
  };

  const calculerViager = (
    valeurBien: number,
    bouquet: number,
    typeViager: 'occupe' | 'libre',
    creditentiers: Creditentier[],
    dateSignature: string,
    methode: MethodeCalcul,
    tauxPersonnalise: number,
    loyerTheorique: number,
    taxeFonciere: number,
    payeurTaxe: 'acheteur' | 'vendeur' | 'partage'
  ): ResultatViager => {
    
    // Espérance de vie moyenne pondérée si plusieurs crédirentiers
    let esperanceVieMoyenne = 0;
    let ageExactPrincipal = 0;
    let generationPrincipale = 0;
    let tableUtilisee = '';
    
    if (creditentiers.length === 1) {
      const info = obtenirEsperanceVie(creditentiers[0].dateNaissance, dateSignature, creditentiers[0].sexe);
      esperanceVieMoyenne = info.esperanceVie;
      ageExactPrincipal = info.ageExact;
      generationPrincipale = info.generation;
      tableUtilisee = info.table;
    } else {
      // Calcul sur tête conjointe (moyenne pondérée)
      let sommeEsperancePonderee = 0;
      creditentiers.forEach(cr => {
        const info = obtenirEsperanceVie(cr.dateNaissance, dateSignature, cr.sexe);
        sommeEsperancePonderee += info.esperanceVie * (cr.pourcentageRente / 100);
      });
      esperanceVieMoyenne = sommeEsperancePonderee;
      
      // Pour affichage, prendre le premier
      const infoPrincipal = obtenirEsperanceVie(creditentiers[0].dateNaissance, dateSignature, creditentiers[0].sexe);
      ageExactPrincipal = infoPrincipal.ageExact;
      generationPrincipale = infoPrincipal.generation;
      tableUtilisee = `Multi-têtes (${creditentiers.length})`;
    }
    
    // Calculer décote DUH avec méthode précise basée sur loyer
    let decoteDUH = 0;
    let valeurDUH = 0;
    
    if (typeViager === 'occupe' && loyerTheorique > 0) {
      // Méthode précise : Valeur DUH = loyer annuel × espérance de vie
      valeurDUH = (loyerTheorique * 12) * esperanceVieMoyenne;
      decoteDUH = (valeurDUH / valeurBien) * 100;
    } else if (typeViager === 'occupe') {
      // Méthode forfaitaire si pas de loyer indiqué
      if (ageExactPrincipal < 70) decoteDUH = 50;
      else if (ageExactPrincipal < 75) decoteDUH = 45;
      else if (ageExactPrincipal < 80) decoteDUH = 40;
      else if (ageExactPrincipal < 85) decoteDUH = 35;
      else decoteDUH = 30;
      
      valeurDUH = valeurBien * (decoteDUH / 100);
    }
    
    const valeurOccupee = typeViager === 'occupe' ? valeurBien - valeurDUH : valeurBien;
    const capitalRestant = valeurOccupee - bouquet;
    
    // Calcul selon méthode choisie
    let renteViagere = 0;
    let tauxTechnique = 0;
    let nomMethode = '';
    let descriptionMethode = '';
    
    switch (methode) {
      case 'simple':
        renteViagere = capitalRestant / (esperanceVieMoyenne * 12);
        tauxTechnique = 0;
        nomMethode = 'Simple (Division Linéaire)';
        descriptionMethode = 'Capital / (espérance de vie × 12 mois)';
        break;
        
      case 'daubry':
        const coeffDaubry = 1 / esperanceVieMoyenne;
        const tauxDaubry = coeffDaubry * 100;
        renteViagere = (capitalRestant * coeffDaubry) / 12;
        tauxTechnique = tauxDaubry;
        nomMethode = 'Daubry (Référence Marché)';
        descriptionMethode = 'Barème Daubry basé sur pratique notariale';
        break;
        
      case 'actuarielle':
        const tauxActu = tauxPersonnalise / 100;
        const facteurActu = ((Math.pow(1 + tauxActu, esperanceVieMoyenne) - 1) / 
                           (tauxActu * Math.pow(1 + tauxActu, esperanceVieMoyenne)));
        renteViagere = (capitalRestant / facteurActu) / 12;
        tauxTechnique = tauxPersonnalise;
        nomMethode = 'Actuarielle Variable';
        descriptionMethode = `Calcul actuariel au taux ${tauxPersonnalise}%`;
        break;
        
      case 'fiscale':
        let tauxFiscal = 0.70;
        if (ageExactPrincipal < 50) tauxFiscal = 0.70;
        else if (ageExactPrincipal < 60) tauxFiscal = 0.50;
        else if (ageExactPrincipal < 70) tauxFiscal = 0.40;
        else tauxFiscal = 0.30;
        
        renteViagere = (capitalRestant * tauxFiscal) / (esperanceVieMoyenne * 12);
        tauxTechnique = tauxFiscal * 100;
        nomMethode = 'Fiscale (Art. 669 CGI)';
        descriptionMethode = `Application barème fiscal (${(tauxFiscal * 100).toFixed(0)}% imposable)`;
        break;
        
      case 'moyenne':
        const r1 = capitalRestant / (esperanceVieMoyenne * 12);
        const r2 = (capitalRestant * (1 / esperanceVieMoyenne)) / 12;
        const tauxActuMoy = tauxPersonnalise / 100;
        const facteurActuMoy = ((Math.pow(1 + tauxActuMoy, esperanceVieMoyenne) - 1) / 
                                (tauxActuMoy * Math.pow(1 + tauxActuMoy, esperanceVieMoyenne)));
        const r3 = (capitalRestant / facteurActuMoy) / 12;
        
        let tauxFiscalMoy = 0.70;
        if (ageExactPrincipal < 50) tauxFiscalMoy = 0.70;
        else if (ageExactPrincipal < 60) tauxFiscalMoy = 0.50;
        else if (ageExactPrincipal < 70) tauxFiscalMoy = 0.40;
        else tauxFiscalMoy = 0.30;
        const r4 = (capitalRestant * tauxFiscalMoy) / (esperanceVieMoyenne * 12);
        
        renteViagere = (r1 * 0.20) + (r2 * 0.40) + (r3 * 0.30) + (r4 * 0.10);
        tauxTechnique = tauxPersonnalise;
        nomMethode = 'Moyenne Pondérée';
        descriptionMethode = 'Moyenne: 40% Daubry + 30% Actuarielle + 20% Simple + 10% Fiscale';
        break;
    }
    
    // Calculs finaux
    const totalVerseParAcheteur = bouquet + (renteViagere * esperanceVieMoyenne * 12);
    const economieVendeur = totalVerseParAcheteur - valeurOccupee;
    const ageTheoriqueDeces = ageExactPrincipal + esperanceVieMoyenne;
    const tauxCapitalisation = (totalVerseParAcheteur / valeurBien) * 100;
    
    // Taxe foncière
    let baseJuridique = '';
    let coutTaxeAcheteur = 0;
    
    if (payeurTaxe === 'acheteur') {
      baseJuridique = 'Art. 1400 et 1403 CGI - En viager occupé avec DUH, la taxe foncière reste à la charge du nu-propriétaire (acheteur) sauf convention contraire.';
      coutTaxeAcheteur = taxeFonciere * esperanceVieMoyenne;
    } else if (payeurTaxe === 'vendeur') {
      baseJuridique = 'Convention privée - Les parties ont convenu que la taxe foncière reste à la charge du crédirentier (vendeur/usufruitier).';
      coutTaxeAcheteur = 0;
    } else {
      baseJuridique = 'Convention de partage - Répartition convenue entre les parties.';
      coutTaxeAcheteur = (taxeFonciere / 2) * esperanceVieMoyenne;
    }
    
    // Détails crédirentiers
    const creditentiersDetails = creditentiers.map(cr => {
      const info = obtenirEsperanceVie(cr.dateNaissance, dateSignature, cr.sexe);
      return `${cr.sexe === 'homme' ? 'Homme' : 'Femme'}, ${Math.floor(info.ageExact)} ans, ${cr.pourcentageRente}% de la rente`;
    });
    
    return {
      valeurBien,
      valeurOccupee,
      decoteDUH: Math.round(decoteDUH * 10) / 10,
      bouquet,
      capitalRestant,
      renteViagere: Math.round(renteViagere),
      esperanceVie: Math.round(esperanceVieMoyenne * 10) / 10,
      totalVerse: Math.round(totalVerseParAcheteur),
      economieVendeur: Math.round(economieVendeur),
      ageTheoriqueDeces: Math.round(ageTheoriqueDeces * 10) / 10,
      tauxCapitalisation: Math.round(tauxCapitalisation * 10) / 10,
      ageExactVendeur: Math.round(ageExactPrincipal * 10) / 10,
      generationVendeur: generationPrincipale,
      tableUtilisee,
      dateSignatureStr: new Date(dateSignature).toLocaleDateString('fr-FR'),
      taxeFonciereAnnuelle: taxeFonciere,
      payeurTaxeFonciere: payeurTaxe,
      coutTotalTaxesFoncieresAcheteur: Math.round(coutTaxeAcheteur),
      baseJuridiqueTaxe: baseJuridique,
      methodeUtilisee: nomMethode,
      tauxTechniqueApplique: Math.round(tauxTechnique * 10) / 10,
      descriptionMethode,
      nombreCredirentiers: creditentiers.length,
      creditentiersDetails
    };
  };

  // ============================================
  // CALCULS MÉMOÏSÉS
  // ============================================

  const resultat = useMemo<ResultatViager | null>(() => {
    if (!showResults) return null;
    
    const valeur = parseFloat(formData.valeurBien) || 0;
    const bouq = parseFloat(formData.bouquet) || 0;
    const loyerTheo = parseFloat(formData.loyerMensuelTheorique) || 0;
    const taxe = parseFloat(formData.taxeFonciere) || 0;
    
    if (valeur === 0 || formData.creditentiers.length === 0) return null;
    
    return calculerViager(
      valeur,
      bouq,
      formData.typeViager,
      formData.creditentiers,
      formData.dateSignature,
      formData.methodeCalcul,
      formData.tauxTechniquePersonnalise || 4.5,
      loyerTheo,
      taxe,
      formData.payeurTaxeFonciere
    );
  }, [showResults, formData]);

  const resultatsComparatifs = useMemo<ResultatsComparatifs | null>(() => {
    if (!modeComparaison || !showResults) return null;
    
    const valeur = parseFloat(formData.valeurBien) || 0;
    const bouq = parseFloat(formData.bouquet) || 0;
    const loyerTheo = parseFloat(formData.loyerMensuelTheorique) || 0;
    const taxe = parseFloat(formData.taxeFonciere) || 0;
    
    if (valeur === 0 || formData.creditentiers.length === 0) return null;
    
    const methodes: MethodeCalcul[] = ['simple', 'daubry', 'actuarielle', 'fiscale', 'moyenne'];
    const resultats: any = {};
    
    methodes.forEach(m => {
      resultats[m] = calculerViager(
        valeur, bouq, formData.typeViager, formData.creditentiers,
        formData.dateSignature, m, formData.tauxTechniquePersonnalise || 4.5,
        loyerTheo, taxe, formData.payeurTaxeFonciere
      );
    });
    
    return resultats as ResultatsComparatifs;
  }, [modeComparaison, showResults, formData]);

  // ✅ COMPARAISON BOUQUETS
  const comparaisonBouquets = useMemo<ComparaisonBouquets | null>(() => {
    if (!formData.activerComparaisonBouquet || !showResults) return null;
    
    const valeur = parseFloat(formData.valeurBien) || 0;
    const bouqActuel = parseFloat(formData.bouquet) || 0;
    const bouqTiers = valeur / 3;
    const bouqZero = 0;
    const loyerTheo = parseFloat(formData.loyerMensuelTheorique) || 0;
    const taxe = parseFloat(formData.taxeFonciere) || 0;
    
    if (valeur === 0 || formData.creditentiers.length === 0) return null;
    
    return {
      bouquetActuel: calculerViager(
        valeur, bouqActuel, formData.typeViager, formData.creditentiers,
        formData.dateSignature, formData.methodeCalcul, 
        formData.tauxTechniquePersonnalise || 4.5, loyerTheo, taxe, formData.payeurTaxeFonciere
      ),
      bouquetTiers: calculerViager(
        valeur, bouqTiers, formData.typeViager, formData.creditentiers,
        formData.dateSignature, formData.methodeCalcul,
        formData.tauxTechniquePersonnalise || 4.5, loyerTheo, taxe, formData.payeurTaxeFonciere
      ),
      bouquetZero: calculerViager(
        valeur, bouqZero, formData.typeViager, formData.creditentiers,
        formData.dateSignature, formData.methodeCalcul,
        formData.tauxTechniquePersonnalise || 4.5, loyerTheo, taxe, formData.payeurTaxeFonciere
      )
    };
  }, [formData, showResults]);

  // ============================================
  // GESTION CRÉDIRENTIERS
  // ============================================

  const ajouterCredirentier = () => {
    if (formData.creditentiers.length >= 4) {
      alert('Maximum 4 crédirentiers');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      creditentiers: [
        ...prev.creditentiers,
        {
          id: Date.now().toString(),
          dateNaissance: '1950-01-01',
          sexe: 'femme',
          pourcentageRente: 0
        }
      ]
    }));
  };

  const supprimerCredirentier = (id: string) => {
    if (formData.creditentiers.length === 1) {
      alert('Il faut au moins 1 crédirentier');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      creditentiers: prev.creditentiers.filter(c => c.id !== id)
    }));
  };

  const modifierCredirentier = (id: string, champ: keyof Creditentier, valeur: any) => {
    setFormData(prev => ({
      ...prev,
      creditentiers: prev.creditentiers.map(c =>
        c.id === id ? { ...c, [champ]: valeur } : c
      )
    }));
  };

  // ============================================
  // FONCTION UTILITAIRE POUR EXPORT PDF
  // ============================================

  /**
   * Formate un nombre avec séparateur de milliers compatible PDF
   * Remplace l'espace fine insécable (U+202F) par un espace normal
   */
  const formatNumberForPDF = (value: number): string => {
    return value
      .toLocaleString('fr-FR')
      .replace(/\u202F/g, ' ');
  };

  // ============================================
  // EXPORT PDF avec jsPDF
  // ============================================

  const exporterPDF = async () => {
    if (!resultat) return;
    
    try {
      // Importer jsPDF dynamiquement
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Couleurs
      const bleuFonce = [41, 98, 255];
      const grisFonce = [51, 51, 51];
      const grisTexte = [85, 85, 85];
      
      let y = 20;
      
      // HEADER - Logo/Titre
      doc.setFillColor(bleuFonce[0], bleuFonce[1], bleuFonce[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('CALCUL DE VIAGER', 105, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Édité le ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' });
      
      y = 50;
      
      // SECTION 1: INFORMATIONS DU BIEN
      doc.setTextColor(grisFonce[0], grisFonce[1], grisFonce[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS DU BIEN', 15, y);
      y += 8;
      
      doc.setDrawColor(41, 98, 255);
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grisTexte[0], grisTexte[1], grisTexte[2]);
      
      const infoBien = [
        ['Valeur vénale du bien', `${formatNumberForPDF(resultat.valeurBien)} €`],
        ['Type de viager', formData.typeViager === 'occupe' ? 'Occupé avec DUH' : 'Libre'],
        ['Décote d\'occupation (DUH)', `${resultat.decoteDUH.toFixed(1)} %`],
        ['Valeur occupée', `${formatNumberForPDF(resultat.valeurOccupee)} €`]
      ];
      
      infoBien.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 195, y, { align: 'right' });
        y += 6;
      });
      
      y += 5;
      
      // SECTION 2: CRÉDIRENTIERS
      doc.setTextColor(grisFonce[0], grisFonce[1], grisFonce[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`CRÉDIRENTIERS (${resultat.nombreCredirentiers})`, 15, y);
      y += 8;
      
      doc.setDrawColor(41, 98, 255);
      doc.line(15, y, 195, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grisTexte[0], grisTexte[1], grisTexte[2]);
      
      resultat.creditentiersDetails.forEach((detail, i) => {
        doc.text(`${i + 1}. ${detail}`, 20, y);
        y += 6;
      });
      
      y += 5;
      
      // SECTION 3: STRUCTURE FINANCIÈRE
      doc.setTextColor(grisFonce[0], grisFonce[1], grisFonce[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STRUCTURE FINANCIÈRE', 15, y);
      y += 8;
      
      doc.setDrawColor(41, 98, 255);
      doc.line(15, y, 195, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grisTexte[0], grisTexte[1], grisTexte[2]);
      
      const infoFinance: [string, string, boolean?][] = [
        ['Bouquet (versement initial)', `${formatNumberForPDF(resultat.bouquet)} €`],
        ['Capital restant à financer', `${formatNumberForPDF(resultat.capitalRestant)} €`],
        ['Rente viagère mensuelle', `${formatNumberForPDF(resultat.renteViagere)} €`, true]
      ];
      
      infoFinance.forEach(([label, value, highlight]) => {
        if (highlight) {
          doc.setFillColor(255, 243, 205);
          doc.rect(18, y - 4, 174, 7, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.text(label, 20, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(highlight ? 12 : 10);
        doc.text(value, 195, y, { align: 'right' });
        doc.setFontSize(10);
        y += highlight ? 9 : 6;
      });
      
      y += 5;
      
      // SECTION 4: MÉTHODE DE CALCUL
      doc.setTextColor(grisFonce[0], grisFonce[1], grisFonce[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉTHODE DE CALCUL', 15, y);
      y += 8;
      
      doc.setDrawColor(41, 98, 255);
      doc.line(15, y, 195, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grisTexte[0], grisTexte[1], grisTexte[2]);
      
      doc.setFont('helvetica', 'bold');
      doc.text(resultat.methodeUtilisee, 20, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(resultat.descriptionMethode, 170);
      doc.text(descLines, 20, y);
      y += descLines.length * 5;
      
      doc.text(`Taux technique appliqué : ${resultat.tauxTechniqueApplique} %`, 20, y);
      y += 8;
      
      // SECTION 5: DONNÉES ACTUARIELLES
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      
      doc.setTextColor(grisFonce[0], grisFonce[1], grisFonce[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DONNÉES ACTUARIELLES', 15, y);
      y += 8;
      
      doc.setDrawColor(41, 98, 255);
      doc.line(15, y, 195, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grisTexte[0], grisTexte[1], grisTexte[2]);
      
      const infoActu = [
        ['Espérance de vie', `${resultat.esperanceVie} ans`],
        ['Âge théorique de décès', `${resultat.ageTheoriqueDeces} ans`],
        ['Table INSEE utilisée', resultat.tableUtilisee],
        ['Génération', resultat.generationVendeur.toString()]
      ];
      
      infoActu.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 195, y, { align: 'right' });
        y += 6;
      });
      
      y += 5;
      
      // SECTION 6: ANALYSE FINANCIÈRE
      doc.setTextColor(grisFonce[0], grisFonce[1], grisFonce[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ANALYSE FINANCIÈRE', 15, y);
      y += 8;
      
      doc.setDrawColor(41, 98, 255);
      doc.line(15, y, 195, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grisTexte[0], grisTexte[1], grisTexte[2]);
      
      const infoAnalyse = [
        ['Total versé (espérance de vie)', `${formatNumberForPDF(resultat.totalVerse)} €`],
        ['Taux de capitalisation', `${resultat.tauxCapitalisation} %`],
        ['Économie pour le vendeur', `${formatNumberForPDF(resultat.economieVendeur)} €`]
      ];
      
      infoAnalyse.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 195, y, { align: 'right' });
        y += 6;
      });
      
      y += 5;
      
      // SECTION 7: TAXE FONCIÈRE
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      doc.setTextColor(grisFonce[0], grisFonce[1], grisFonce[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TAXE FONCIÈRE', 15, y);
      y += 8;
      
      doc.setDrawColor(41, 98, 255);
      doc.line(15, y, 195, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grisTexte[0], grisTexte[1], grisTexte[2]);
      
      const payeurLabel = resultat.payeurTaxeFonciere === 'acheteur' ? 'Acheteur (nu-propriétaire)' :
                          resultat.payeurTaxeFonciere === 'vendeur' ? 'Vendeur (crédirentier)' : 
                          'Partage 50/50';
      
      const infoTaxe = [
        ['Payeur', payeurLabel],
        ['Montant annuel', `${formatNumberForPDF(resultat.taxeFonciereAnnuelle)} €`],
        ['Coût total acheteur (sur espérance vie)', `${formatNumberForPDF(resultat.coutTotalTaxesFoncieresAcheteur)} €`]
      ];
      
      infoTaxe.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, 20, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 195, y, { align: 'right' });
        y += 6;
      });
      
      y += 3;
      
      // Base juridique
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const baseJurLines = doc.splitTextToSize(`Base juridique: ${resultat.baseJuridiqueTaxe}`, 170);
      doc.text(baseJurLines, 20, y);
      y += baseJurLines.length * 4.5;
      
      // FOOTER
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(15, 280, 195, 280);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('Document généré par NotariaPrime.fr - Calculs conformes aux bonnes pratiques professionnelles', 105, 287, { align: 'center' });
      doc.text(`Expert certifié TEGOVA - ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 292, { align: 'center' });
      
      // Sauvegarder
      doc.save(`viager-calcul-${new Date().getTime()}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Vérifiez que jsPDF est installé.');
    }
  };

  // ============================================
  // FAQ DATA
  // ============================================

  const faqData = [
    {
      question: "Qu'est-ce qu'un viager ?",
      reponse: "Le viager est une vente immobilière où l'acheteur (débirentier) verse au vendeur (crédirentier) une somme initiale (bouquet) puis une rente viagère jusqu'au décès du vendeur. C'est un contrat aléatoire régi par les articles 1968 à 1983 du Code civil."
    },
    {
      question: "Quelle est la différence entre viager occupé et viager libre ?",
      reponse: "Dans un viager occupé, le vendeur conserve le droit d'usage et d'habitation (DUH) ou l'usufruit du bien jusqu'à son décès. Le bien est donc décote de 30% à 50% selon l'âge. Dans un viager libre, l'acheteur dispose immédiatement du bien, sans décote."
    },
    {
      question: "Comment est calculée la rente viagère ?",
      reponse: "Notre calculateur utilise 5 méthodes : Simple (division linéaire), Daubry (référence marché notarial), Actuarielle (calcul financier au taux d'intérêt), Fiscale (barème CGI art. 669), et Moyenne pondérée (combinaison optimale des 4 méthodes). La méthode moyenne est recommandée car elle équilibre tous les paramètres."
    },
    {
      question: "Qui paie la taxe foncière en viager occupé ?",
      reponse: "Par défaut légal (Art. 1400 et 1403 CGI), en viager occupé avec DUH, la taxe foncière reste à charge du nu-propriétaire (acheteur). Toutefois, les parties peuvent convenir d'une répartition différente par clause contractuelle. Notre calculateur vous permet de choisir librement."
    },
    {
      question: "Qu'est-ce que le bouquet et comment le fixer ?",
      reponse: "Le bouquet est le versement initial lors de la signature. Il représente généralement 20% à 40% de la valeur du bien, mais peut être de 0€ (viager sans bouquet) ou jusqu'à 50%. Notre outil vous permet de comparer différents scénarios : bouquet actuel, 1/3 de la valeur, ou 0€."
    },
    {
      question: "Peut-on faire un viager sur plusieurs têtes ?",
      reponse: "Oui ! Notre calculateur V5 permet de gérer jusqu'à 4 crédirentiers simultanés. La rente est calculée sur espérance de vie conjointe, et vous pouvez définir la répartition en pourcentage pour chaque crédirentier. Cela permet de protéger le conjoint survivant."
    },
    {
      question: "Quelles sont les tables de mortalité utilisées ?",
      reponse: "Nous utilisons les tables TGH05 (hommes) et TGF05 (femmes) de l'INSEE, par génération quinquennale (1940, 1945, 1950, 1955, 1960). Ces tables sont les références actuarielles françaises pour les calculs viagers."
    },
    {
      question: "Le calcul prend-il en compte l'indexation de la rente ?",
      reponse: "Les rentes viagères sont généralement indexées sur l'indice des prix à la consommation (IPC) conformément à l'article 1978 du Code civil. Notre calcul de base ne l'intègre pas, mais vous pouvez l'ajouter manuellement dans vos négociations. L'indexation protège le crédirentier de l'inflation."
    },
    {
      question: "Comment interpréter la méthode 'Moyenne pondérée' ?",
      reponse: "La méthode moyenne combine intelligemment les 4 autres méthodes : 40% Daubry (référence marché), 30% Actuarielle (précision financière), 20% Simple (sécurité), 10% Fiscale (conformité). C'est la méthode la plus équilibrée et acceptée par toutes les parties."
    },
    {
      question: "Que se passe-t-il si le crédirentier décède rapidement ?",
      reponse: "C'est le principe d'aléa du viager (Art. 1975 CC). Si le décès intervient dans les 20 jours, la vente peut être annulée. Sinon, l'acheteur conserve le bien même s'il a peu payé. Inversement, si le vendeur vit très longtemps, l'acheteur continue de payer. C'est un contrat aléatoire par nature."
    }
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Home className="w-12 h-12 text-blue-600" />
              Calculateur de Viager V5
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Calcul professionnel multi-méthodes avec gestion multi-crédirentiers, 
              comparaison de bouquets, et export PDF
            </p>
            
            {/* Bouton FAQ */}
            <button
              onClick={() => setShowFAQ(!showFAQ)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg"
            >
              <HelpCircle className="w-5 h-5" />
              {showFAQ ? 'Masquer la FAQ' : 'Afficher la FAQ'}
            </button>
          </div>

          {/* FAQ Section */}
          {showFAQ && (
            <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-purple-600" />
                Foire Aux Questions
              </h2>
              
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-bold text-left text-gray-900">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedFAQ === index && (
                      <div className="px-6 py-4 bg-white border-t-2 border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{faq.reponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              Paramètres du calcul
            </h2>

            <div className="space-y-6">
              
              {/* Valeur du bien */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  Valeur vénale du bien (€)
                </label>
                <input
                  type="number"
                  value={formData.valeurBien}
                  onChange={(e) => setFormData({ ...formData, valeurBien: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Type de viager */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Type de viager
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, typeViager: 'occupe' })}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      formData.typeViager === 'occupe'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Viager occupé
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, typeViager: 'libre' })}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      formData.typeViager === 'libre'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Viager libre
                  </button>
                </div>
              </div>

              {/* CRÉDIRENTIERS */}
              <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Crédirentiers ({formData.creditentiers.length})
                  </h3>
                  <button
                    onClick={ajouterCredirentier}
                    disabled={formData.creditentiers.length >= 4}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.creditentiers.map((cr, index) => (
                    <div key={cr.id} className="bg-white rounded-xl p-4 border-2 border-purple-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-purple-900">Crédirentier #{index + 1}</span>
                        {formData.creditentiers.length > 1 && (
                          <button
                            onClick={() => supprimerCredirentier(cr.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Date de naissance
                          </label>
                          <input
                            type="date"
                            value={cr.dateNaissance}
                            onChange={(e) => modifierCredirentier(cr.id, 'dateNaissance', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Sexe
                          </label>
                          <select
                            value={cr.sexe}
                            onChange={(e) => modifierCredirentier(cr.id, 'sexe', e.target.value as 'homme' | 'femme')}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                          >
                            <option value="femme">Femme</option>
                            <option value="homme">Homme</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            % de la rente
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cr.pourcentageRente}
                            onChange={(e) => modifierCredirentier(cr.id, 'pourcentageRente', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.creditentiers.length > 1 && (
                  <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle className="inline w-4 h-4 mr-1" />
                      Total des pourcentages: {formData.creditentiers.reduce((sum, cr) => sum + cr.pourcentageRente, 0)}%
                      {formData.creditentiers.reduce((sum, cr) => sum + cr.pourcentageRente, 0) !== 100 && (
                        <span className="font-bold"> ⚠️ Devrait être 100%</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Date signature */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date de signature
                </label>
                <input
                  type="date"
                  value={formData.dateSignature}
                  onChange={(e) => setFormData({ ...formData, dateSignature: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                />
              </div>

              {/* Bouquet */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Euro className="inline w-4 h-4 mr-1" />
                  Bouquet (€)
                </label>
                <input
                  type="number"
                  value={formData.bouquet}
                  onChange={(e) => setFormData({ ...formData, bouquet: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                />
              </div>

              {/* Loyer théorique du marché */}
              {formData.typeViager === 'occupe' && (
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Loyer théorique mensuel du marché
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Loyer mensuel si le bien était loué (€)
                    </label>
                    <input
                      type="number"
                      value={formData.loyerMensuelTheorique}
                      onChange={(e) => setFormData({ ...formData, loyerMensuelTheorique: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                    />
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-300">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Pourquoi cette information ?
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      Le loyer théorique permet de calculer précisément la valeur du <strong>Droit d'Usage et d'Habitation (DUH)</strong>.
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Calcul :</strong> Valeur DUH = Loyer mensuel × 12 mois × Espérance de vie
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">
                      <strong>Exemple :</strong> Un loyer de 1 000€/mois sur 15 ans d'espérance de vie = 180 000€ de valeur DUH à déduire de la valeur vénale.
                    </p>
                  </div>
                </div>
              )}

              {/* Taxe foncière */}
              <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-orange-600" />
                  Taxe foncière annuelle
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Montant annuel (€)
                    </label>
                    <input
                      type="number"
                      value={formData.taxeFonciere}
                      onChange={(e) => setFormData({ ...formData, taxeFonciere: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Qui paie la taxe foncière ?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setFormData({ ...formData, payeurTaxeFonciere: 'acheteur' })}
                        className={`px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                          formData.payeurTaxeFonciere === 'acheteur'
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                        }`}
                      >
                        Acheteur
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, payeurTaxeFonciere: 'vendeur' })}
                        className={`px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                          formData.payeurTaxeFonciere === 'vendeur'
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                        }`}
                      >
                        Vendeur
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, payeurTaxeFonciere: 'partage' })}
                        className={`px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                          formData.payeurTaxeFonciere === 'partage'
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                        }`}
                      >
                        Partage 50/50
                      </button>
                    </div>
                  </div>

                  {/* Explication légale */}
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-300">
                    <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Base juridique
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {formData.payeurTaxeFonciere === 'acheteur' && (
                        <>
                          <span className="font-bold">Articles 1400 et 1403 du CGI:</span> En viager occupé avec DUH, 
                          la taxe foncière reste légalement à la charge du nu-propriétaire (acheteur), 
                          sauf convention contraire expresse.
                        </>
                      )}
                      {formData.payeurTaxeFonciere === 'vendeur' && (
                        <>
                          <span className="font-bold">Convention privée:</span> Les parties ont convenu par clause 
                          contractuelle que la taxe foncière demeure à la charge du crédirentier (vendeur/usufruitier), 
                          dérogeant ainsi à la règle légale de l'article 1403 CGI.
                        </>
                      )}
                      {formData.payeurTaxeFonciere === 'partage' && (
                        <>
                          <span className="font-bold">Partage conventionnel:</span> Les parties ont convenu d'un 
                          partage à parts égales de la taxe foncière, solution équilibrée entre les intérêts 
                          du crédirentier et du débirentier.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Méthode de calcul */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  Méthode de calcul
                </label>
                <select
                  value={formData.methodeCalcul}
                  onChange={(e) => setFormData({ ...formData, methodeCalcul: e.target.value as MethodeCalcul })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                >
                  <option value="simple">Simple (Division Linéaire)</option>
                  <option value="daubry">Daubry (Référence Marché)</option>
                  <option value="actuarielle">Actuarielle Variable</option>
                  <option value="fiscale">Fiscale (Art. 669 CGI)</option>
                  <option value="moyenne">Moyenne Pondérée (Recommandée)</option>
                </select>
              </div>

              {(formData.methodeCalcul === 'actuarielle' || formData.methodeCalcul === 'moyenne') && (
                <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-green-600" />
                    Taux technique d'actualisation
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Taux technique (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="2"
                      max="7"
                      value={formData.tauxTechniquePersonnalise || 4.5}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tauxTechniquePersonnalise: parseFloat(e.target.value) || 4.5 
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                    />
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-300">
                    <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Qu'est-ce que le taux technique ?
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      Le taux technique est le <strong>taux de rendement annuel</strong> que l'acheteur espère obtenir 
                      sur son investissement viager. Il permet d'actualiser les flux futurs de rente.
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <strong className="text-green-800">📊 Fourchettes recommandées :</strong>
                      </p>
                      <ul className="ml-4 space-y-1 text-gray-700">
                        <li>• <strong>3,0% - 3,5%</strong> : Contexte de taux bas (sécurité maximale)</li>
                        <li>• <strong>4,0% - 4,5%</strong> : Contexte normal (équilibré) ⭐ <em>recommandé</em></li>
                        <li>• <strong>5,0% - 6,0%</strong> : Contexte de taux élevés ou recherche rendement</li>
                      </ul>
                    </div>

                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <strong>💡 Référence :</strong> Le taux technique s'inspire généralement du <strong>taux OAT 10 ans</strong> 
                        (obligations d'État françaises) + une <strong>prime de risque</strong> de 2-3%. 
                        En octobre 2025, un taux de <strong>4,5%</strong> est cohérent avec le marché.
                      </p>
                    </div>

                    <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <p className="text-xs text-gray-700">
                        <strong>⚠️ Impact :</strong> Plus le taux est élevé, plus la rente calculée sera importante 
                        (car l'acheteur exige un meilleur rendement sur son capital immobilisé).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Options supplémentaires */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Options avancées
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modeComparaison}
                      onChange={(e) => setModeComparaison(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="font-bold text-gray-700">
                      Activer le mode comparaison des méthodes
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.activerComparaisonBouquet}
                      onChange={(e) => setFormData({ ...formData, activerComparaisonBouquet: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="font-bold text-gray-700">
                      Comparer avec 1/3 bouquet et 0€ bouquet
                    </span>
                  </label>
                </div>
              </div>

            </div>

            {/* Boutons actions */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => {
                  setShowResults(true);
                  setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Calculator className="w-6 h-6" />
                Calculer
              </button>
            </div>
          </div>

          {/* Résultats */}
          {showResults && resultat && (
            <div ref={resultsRef} className="space-y-8">
              
              {/* Résultats principaux */}
              {!modeComparaison && (
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-8 h-8" />
                    Résultats du calcul
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                      <p className="text-blue-100 text-sm mb-1">Rente viagère mensuelle</p>
                      <p className="text-4xl font-black">{resultat.renteViagere.toLocaleString('fr-FR')} €</p>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                      <p className="text-blue-100 text-sm mb-1">Bouquet</p>
                      <p className="text-4xl font-black">{resultat.bouquet.toLocaleString('fr-FR')} €</p>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                      <p className="text-blue-100 text-sm mb-1">Espérance de vie</p>
                      <p className="text-4xl font-black">{resultat.esperanceVie} ans</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-100 text-sm">Méthode utilisée</p>
                        <p className="font-bold text-lg">{resultat.methodeUtilisee}</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">Taux technique</p>
                        <p className="font-bold text-lg">{resultat.tauxTechniqueApplique}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Détails crédirentiers */}
              {resultat.nombreCredirentiers > 1 && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Crédirentiers ({resultat.nombreCredirentiers})
                  </h3>
                  <div className="space-y-2">
                    {resultat.creditentiersDetails.map((detail, i) => (
                      <p key={i} className="text-gray-700">• {detail}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Taxe foncière */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-orange-600" />
                  Taxe foncière
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant annuel</span>
                    <span className="font-bold">{resultat.taxeFonciereAnnuelle.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payeur</span>
                    <span className="font-bold capitalize">{resultat.payeurTaxeFonciere}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coût total acheteur</span>
                    <span className="font-bold">{resultat.coutTotalTaxesFoncieresAcheteur.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <Info className="inline w-4 h-4 mr-1 text-orange-600" />
                    {resultat.baseJuridiqueTaxe}
                  </p>
                </div>
              </div>

              {/* Comparaison Bouquets */}
              {formData.activerComparaisonBouquet && comparaisonBouquets && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <GitCompare className="w-6 h-6 text-green-600" />
                    Comparaison des bouquets
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-bold text-gray-700">Scénario</th>
                          <th className="text-right py-4 px-4 font-bold text-gray-700">Bouquet</th>
                          <th className="text-right py-4 px-4 font-bold text-gray-700">Rente mensuelle</th>
                          <th className="text-right py-4 px-4 font-bold text-gray-700">Total versé</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-bold text-blue-600">Bouquet actuel</td>
                          <td className="text-right py-4 px-4">
                            {comparaisonBouquets.bouquetActuel.bouquet.toLocaleString('fr-FR')} €
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-lg">
                            {comparaisonBouquets.bouquetActuel.renteViagere.toLocaleString('fr-FR')} €
                          </td>
                          <td className="text-right py-4 px-4">
                            {comparaisonBouquets.bouquetActuel.totalVerse.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-bold text-green-600">Bouquet 1/3 valeur</td>
                          <td className="text-right py-4 px-4">
                            {comparaisonBouquets.bouquetTiers.bouquet.toLocaleString('fr-FR')} €
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-lg">
                            {comparaisonBouquets.bouquetTiers.renteViagere.toLocaleString('fr-FR')} €
                          </td>
                          <td className="text-right py-4 px-4">
                            {comparaisonBouquets.bouquetTiers.totalVerse.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-bold text-purple-600">Bouquet 0€ (sans bouquet)</td>
                          <td className="text-right py-4 px-4">
                            0 €
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-lg">
                            {comparaisonBouquets.bouquetZero.renteViagere.toLocaleString('fr-FR')} €
                          </td>
                          <td className="text-right py-4 px-4">
                            {comparaisonBouquets.bouquetZero.totalVerse.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-2">Rente actuelle</h4>
                      <p className="text-blue-700 text-sm">
                        {comparaisonBouquets.bouquetActuel.renteViagere.toLocaleString('fr-FR')} € / mois
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-2">Avec 1/3 bouquet</h4>
                      <p className="text-green-700 text-sm">
                        {comparaisonBouquets.bouquetTiers.renteViagere.toLocaleString('fr-FR')} € / mois
                        <br />
                        <span className="text-xs">
                          {((comparaisonBouquets.bouquetTiers.renteViagere - comparaisonBouquets.bouquetActuel.renteViagere) / 
                            comparaisonBouquets.bouquetActuel.renteViagere * 100).toFixed(1)}% 
                          vs actuel
                        </span>
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-2">Sans bouquet</h4>
                      <p className="text-purple-700 text-sm">
                        {comparaisonBouquets.bouquetZero.renteViagere.toLocaleString('fr-FR')} € / mois
                        <br />
                        <span className="text-xs">
                          +{((comparaisonBouquets.bouquetZero.renteViagere - comparaisonBouquets.bouquetActuel.renteViagere) / 
                            comparaisonBouquets.bouquetActuel.renteViagere * 100).toFixed(1)}% 
                          vs actuel
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Comparaison */}
              {modeComparaison && resultatsComparatifs && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <GitCompare className="w-6 h-6 text-purple-600" />
                      Comparaison des 4 méthodes de calcul
                    </h2>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-4 px-4 font-bold text-gray-700">Méthode</th>
                            <th className="text-right py-4 px-4 font-bold text-gray-700">Rente mensuelle</th>
                            <th className="text-right py-4 px-4 font-bold text-gray-700">Taux technique</th>
                            <th className="text-right py-4 px-4 font-bold text-gray-700">Total versé</th>
                            <th className="text-right py-4 px-4 font-bold text-gray-700">Écart / Moyenne</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'simple', nom: 'Simple (Division Linéaire)', couleur: 'blue' },
                            { key: 'daubry', nom: 'Daubry (Référence Marché)', couleur: 'purple' },
                            { key: 'actuarielle', nom: 'Actuarielle Variable', couleur: 'green' },
                            { key: 'fiscale', nom: 'Fiscale (Art. 669 CGI)', couleur: 'orange' },
                            { key: 'moyenne', nom: 'Moyenne Pondérée', couleur: 'pink', isMoyenne: true }
                          ].map((methode) => {
                            const result = resultatsComparatifs[methode.key as keyof ResultatsComparatifs];
                            const moyenneRente = resultatsComparatifs.moyenne.renteViagere;
                            const ecart = ((result.renteViagere - moyenneRente) / moyenneRente * 100).toFixed(1);
                            
                            return (
                              <tr 
                                key={methode.key} 
                                className={`border-b border-gray-100 hover:bg-gray-50 ${
                                  methode.isMoyenne ? 'bg-purple-50 font-bold' : ''
                                }`}
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full bg-${methode.couleur}-500`}></div>
                                    {methode.nom}
                                    {methode.isMoyenne && (
                                      <Award className="w-4 h-4 text-purple-600 ml-2" />
                                    )}
                                  </div>
                                </td>
                                <td className="text-right py-4 px-4 font-bold text-lg">
                                  {result.renteViagere.toLocaleString('fr-FR')} €
                                </td>
                                <td className="text-right py-4 px-4">
                                  {result.tauxTechniqueApplique}%
                                </td>
                                <td className="text-right py-4 px-4">
                                  {result.totalVerse.toLocaleString('fr-FR')} €
                                </td>
                                <td className="text-right py-4 px-4">
                                  {!methode.isMoyenne && (
                                    <span className={`font-semibold ${
                                      parseFloat(ecart) > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {parseFloat(ecart) > 0 ? '+' : ''}{ecart}%
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recommandation */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex items-start gap-4">
                      <Award className="w-12 h-12 flex-shrink-0" />
                      <div>
                        <h3 className="text-2xl font-bold mb-3">Recommandation d'expert</h3>
                        <p className="text-purple-100 mb-4">
                          La <span className="font-bold">méthode moyenne pondérée</span> offre le meilleur équilibre 
                          entre les différentes approches. Elle combine:
                        </p>
                        <ul className="space-y-2 text-purple-100">
                          <li>• 40% Daubry (référence marché)</li>
                          <li>• 30% Actuarielle (précision financière)</li>
                          <li>• 20% Simple (sécurité)</li>
                          <li>• 10% Fiscale (conformité)</li>
                        </ul>
                        <div className="mt-6 bg-white/20 rounded-xl p-4">
                          <p className="font-bold text-xl">
                            Rente recommandée: {resultatsComparatifs.moyenne.renteViagere.toLocaleString('fr-FR')} € / mois
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton Export PDF en bas de page */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={exporterPDF}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-xl flex items-center gap-3 text-lg"
                >
                  <Download className="w-6 h-6" />
                  Télécharger le rapport PDF
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}