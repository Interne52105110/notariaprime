"use client";

import MainLayout from '@/components/MainLayout';
import React, { useState, useEffect } from 'react';
import { 
  Calculator, FileText, Euro, Building, Users, Home,
  FileSignature, Landmark, Briefcase, File, ChevronDown,
  Info, Check, X, AlertCircle, HelpCircle, MapPin,
  Download, Save, History, Plus, Minus, UserPlus, FileEdit
} from 'lucide-react';
import jsPDF from 'jspdf';
import { actesConfig, configParDefaut, type ConfigActe } from '@/config/actesConfig';

// ============================================================================
// NOUVEAUTÉ 2025/2026 : TVA DIFFÉRENCIÉE + MAJORATION DOM-TOM CORRIGÉE
// ============================================================================

const TVA_CONFIG = {
  metropole: 20.0,
  guadeloupe: 8.5,
  martinique: 8.5,
  guyane: 0,
  reunion: 8.5,
  mayotte: 0,
} as const;

const MAJORATION_DOM_TOM: Record<string, number> = {
  '971': 23, // Guadeloupe
  '972': 24, // Martinique
  '973': 20, // Guyane
  '974': 36, // La Réunion
  '976': 36, // Mayotte
};

function getTauxTVA(codeDepartement: string): number {
  const mapping: Record<string, number> = {
    '971': TVA_CONFIG.guadeloupe,
    '972': TVA_CONFIG.martinique,
    '973': TVA_CONFIG.guyane,
    '974': TVA_CONFIG.reunion,
    '976': TVA_CONFIG.mayotte,
  };
  
  return mapping[codeDepartement] ?? TVA_CONFIG.metropole;
}

function getMajorationDOMTOM(codeDepartement: string): number {
  return MAJORATION_DOM_TOM[codeDepartement] || 0;
}

// ============================================================================
// TYPES TYPESCRIPT
// ============================================================================

interface TrancheTarif {
  min: number;
  max: number;
  taux: number;
}

interface ActeConfig {
  label: string;
  type: 'proportionnel' | 'fixe' | 'non_tarife';
  tranches?: TrancheTarif[];
  montant?: number;
  description?: string;
  honorairesEstimes?: string;
}

interface CategorieActes {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  actes: Record<string, ActeConfig>;
}

interface Donateur {
  id: number;
  nom: string;
  montant: string;
  lien: string;
}

interface Donataire {
  id: number;
  nom: string;
  part: string;
}

interface HistoriqueCalcul {
  id: number;
  date: string;
  acte: string;
  montant: string;
  total: number;
  details: {
    emoluments: number;
    debours: number;
    formalites: number;
    documents: number;
    taxes: number;
  };
}

interface Departement {
  nom: string;
  taux: number;
  tauxTVA: number;
  majoration: number;
}

function PretaxeContent() {
  // États principaux
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedActe, setSelectedActe] = useState('');
  const [montantActe, setMontantActe] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('75');
  const [activeTab, setActiveTab] = useState('emoluments');
  
  // États pour les calculs
  const [emoluments, setEmoluments] = useState(0);
  const [emolumentsDetail, setEmolumentsDetail] = useState({
    bruts: 0,
    majoration: 0,
    avantRemise: 0,
    remise10: 0,
    remise20: 0,
    nets: 0
  });
  
  const [appliquerRemise, setAppliquerRemise] = useState(false);
  
  const [debours, setDebours] = useState({
    csi: 15,
    etatsHypothecaires: 0,
    cadastre: 0,
    urbanisme: 0
  });
  
  const [formalites, setFormalites] = useState({
    publiciteFonciere: { actif: false, montant: 339.58 },
    cadastre: { actif: false, montant: 11.32 },
    casierJudiciaire: { actif: false, montant: 37.73 },
    notification: { actif: false, montant: 37.73 },
    mesurage: { actif: false, montant: 15.09 },
    diagnostics: {
      dpe: { actif: false, montant: 15.09 },
      amiante: { actif: false, montant: 15.09 },
      plomb: { actif: false, montant: 15.09 },
      termites: { actif: false, montant: 15.09 },
      gaz: { actif: false, montant: 15.09 },
      electricite: { actif: false, montant: 15.09 },
      erp: { actif: false, montant: 15.09 }
    },
    transmissionCSN: { actif: false, montant: 15.31 },
    requisition: { actif: false, montant: 18.87 },
    teleactes: 50,
    lettresRecommandees: 7.08
  });
  
  const [documents, setDocuments] = useState({
    pagesActe: 10,
    copiesExecutoires: 0,
    copiesAuthentiques: 1,
    copiesHypothecaires: 0
  });
  
  const [taxes, setTaxes] = useState({
    typeBien: 'ancien',
    departementale: 0,
    communale: 0,
    fraisAssiette: 0
  });

  // États pour les donations multiples
  const [donateurs, setDonateurs] = useState<Donateur[]>([
    { id: 1, nom: 'Donateur 1', montant: '', lien: 'parent' }
  ]);
  const [donataires, setDonataires] = useState<Donataire[]>([
    { id: 1, nom: 'Donataire 1', part: '100' }
  ]);
  const [usufruit, setUsufruit] = useState({
    actif: false,
    ageUsufruitier: '',
    valeur: 0
  });
  
  // États pour l'historique
  const [historiqueCalculs, setHistoriqueCalculs] = useState<HistoriqueCalcul[]>([]);
  const [afficherHistorique, setAfficherHistorique] = useState(false);

  // ============================================================================
  // 🔥 FONCTION POUR APPLIQUER LA CONFIG PAR DÉFAUT
  // ============================================================================
  
  const appliquerConfigParDefaut = (acteKey: string) => {
    const config: ConfigActe = actesConfig[acteKey] || configParDefaut;
    
    // Appliquer les débours
    if (config.debours) {
      setDebours(prev => ({
        ...prev,
        csi: config.debours?.csi?.auto ? prev.csi : 15,
        etatsHypothecaires: config.debours?.etatsHypothecaires?.defaut ? 
          config.debours.etatsHypothecaires.montant : 0,
        cadastre: config.debours?.cadastre?.defaut ? 
          config.debours.cadastre.montant : 0
      }));
    }
    
    // Appliquer les formalités
    if (config.formalites) {
      setFormalites(prev => ({
        ...prev,
        publiciteFonciere: {
          actif: config.formalites?.publiciteFonciere?.defaut || false,
          montant: config.formalites?.publiciteFonciere?.montant || 339.58
        },
        cadastre: {
          actif: config.formalites?.cadastre?.defaut || false,
          montant: config.formalites?.cadastre?.montant || 11.32
        },
        casierJudiciaire: {
          actif: config.formalites?.casierJudiciaire?.defaut || false,
          montant: config.formalites?.casierJudiciaire?.montant || 37.73
        },
        notification: {
          actif: config.formalites?.notification?.defaut || false,
          montant: config.formalites?.notification?.montant || 37.73
        },
        mesurage: {
          actif: config.formalites?.mesurage?.defaut || false,
          montant: config.formalites?.mesurage?.montant || 15.09
        },
        diagnostics: {
          dpe: {
            actif: config.formalites?.diagnostics?.dpe?.defaut || false,
            montant: config.formalites?.diagnostics?.dpe?.montant || 15.09
          },
          amiante: {
            actif: config.formalites?.diagnostics?.amiante?.defaut || false,
            montant: config.formalites?.diagnostics?.amiante?.montant || 15.09
          },
          plomb: {
            actif: config.formalites?.diagnostics?.plomb?.defaut || false,
            montant: config.formalites?.diagnostics?.plomb?.montant || 15.09
          },
          termites: {
            actif: config.formalites?.diagnostics?.termites?.defaut || false,
            montant: config.formalites?.diagnostics?.termites?.montant || 15.09
          },
          gaz: {
            actif: config.formalites?.diagnostics?.gaz?.defaut || false,
            montant: config.formalites?.diagnostics?.gaz?.montant || 15.09
          },
          electricite: {
            actif: config.formalites?.diagnostics?.electricite?.defaut || false,
            montant: config.formalites?.diagnostics?.electricite?.montant || 15.09
          },
          erp: {
            actif: config.formalites?.diagnostics?.erp?.defaut || false,
            montant: config.formalites?.diagnostics?.erp?.montant || 15.09
          }
        },
        transmissionCSN: {
          actif: config.formalites?.transmissionCSN?.defaut || false,
          montant: config.formalites?.transmissionCSN?.montant || 15.31
        },
        requisition: {
          actif: config.formalites?.requisition?.defaut || false,
          montant: config.formalites?.requisition?.montant || 18.87
        }
      }));
    }
    
    // Appliquer les documents
    if (config.documents) {
      setDocuments({
        pagesActe: config.documents.pagesActe || 10,
        copiesExecutoires: config.documents.copiesExecutoires || 0,
        copiesAuthentiques: config.documents.copiesAuthentiques || 1,
        copiesHypothecaires: config.documents.copiesHypothecaires || 0
      });
    }
    
    // Appliquer le type de taxes
    if (config.taxes) {
      setTaxes(prev => ({
        ...prev,
        typeBien: config.taxes?.type === 'tva' ? 'neuf' : 'ancien'
      }));
    }
  };
  
  const ajouterDonateur = () => {
    const newId = Math.max(...donateurs.map(d => d.id)) + 1;
    setDonateurs([...donateurs, { id: newId, nom: `Donateur ${newId}`, montant: '', lien: 'parent' }]);
  };
  
  const supprimerDonateur = (id: number) => {
    if (donateurs.length > 1) {
      setDonateurs(donateurs.filter(d => d.id !== id));
    }
  };
  
  const ajouterDonataire = () => {
    const newId = Math.max(...donataires.map(d => d.id)) + 1;
    setDonataires([...donataires, { id: newId, nom: `Donataire ${newId}`, part: '0' }]);
  };
  
  const supprimerDonataire = (id: number) => {
    if (donataires.length > 1) {
      setDonataires(donataires.filter(d => d.id !== id));
    }
  };
  
  const calculerUsufruit = (age: string | number): number => {
    const ageNum = parseInt(String(age));
    if (ageNum < 21) return 90;
    if (ageNum < 31) return 80;
    if (ageNum < 41) return 70;
    if (ageNum < 51) return 60;
    if (ageNum < 61) return 50;
    if (ageNum < 71) return 40;
    if (ageNum < 81) return 30;
    if (ageNum < 91) return 20;
    return 10;
  };

  // ============================================================================
  // DÉPARTEMENTS
  // ============================================================================
  
  const departements: Record<string, Departement> = {
    '01': { nom: 'Ain', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '02': { nom: 'Aisne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '03': { nom: 'Allier', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '04': { nom: 'Alpes-de-Haute-Provence', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '05': { nom: 'Hautes-Alpes', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '06': { nom: 'Alpes-Maritimes', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '07': { nom: 'Ardèche', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '08': { nom: 'Ardennes', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '09': { nom: 'Ariège', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '10': { nom: 'Aube', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '11': { nom: 'Aude', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '12': { nom: 'Aveyron', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '13': { nom: 'Bouches-du-Rhône', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '14': { nom: 'Calvados', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '15': { nom: 'Cantal', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '16': { nom: 'Charente', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '17': { nom: 'Charente-Maritime', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '18': { nom: 'Cher', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '19': { nom: 'Corrèze', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '21': { nom: 'Côte-d\'Or', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '22': { nom: 'Côtes-d\'Armor', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '23': { nom: 'Creuse', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '24': { nom: 'Dordogne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '25': { nom: 'Doubs', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '26': { nom: 'Drôme', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '27': { nom: 'Eure', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '28': { nom: 'Eure-et-Loir', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '29': { nom: 'Finistère', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '2A': { nom: 'Corse-du-Sud', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '2B': { nom: 'Haute-Corse', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '30': { nom: 'Gard', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '31': { nom: 'Haute-Garonne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '32': { nom: 'Gers', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '33': { nom: 'Gironde', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '34': { nom: 'Hérault', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '35': { nom: 'Ille-et-Vilaine', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '36': { nom: 'Indre', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '37': { nom: 'Indre-et-Loire', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '38': { nom: 'Isère', taux: 3.80, tauxTVA: 20.0, majoration: 0 },
    '39': { nom: 'Jura', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '40': { nom: 'Landes', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '41': { nom: 'Loir-et-Cher', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '42': { nom: 'Loire', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '43': { nom: 'Haute-Loire', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '44': { nom: 'Loire-Atlantique', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '45': { nom: 'Loiret', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '46': { nom: 'Lot', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '47': { nom: 'Lot-et-Garonne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '48': { nom: 'Lozère', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '49': { nom: 'Maine-et-Loire', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '50': { nom: 'Manche', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '51': { nom: 'Marne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '52': { nom: 'Haute-Marne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '53': { nom: 'Mayenne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '54': { nom: 'Meurthe-et-Moselle', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '55': { nom: 'Meuse', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '56': { nom: 'Morbihan', taux: 3.80, tauxTVA: 20.0, majoration: 0 },
    '57': { nom: 'Moselle', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '58': { nom: 'Nièvre', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '59': { nom: 'Nord', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '60': { nom: 'Oise', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '61': { nom: 'Orne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '62': { nom: 'Pas-de-Calais', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '63': { nom: 'Puy-de-Dôme', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '64': { nom: 'Pyrénées-Atlantiques', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '65': { nom: 'Hautes-Pyrénées', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '66': { nom: 'Pyrénées-Orientales', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '67': { nom: 'Bas-Rhin', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '68': { nom: 'Haut-Rhin', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '69': { nom: 'Rhône', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '70': { nom: 'Haute-Saône', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '71': { nom: 'Saône-et-Loire', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '72': { nom: 'Sarthe', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '73': { nom: 'Savoie', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '74': { nom: 'Haute-Savoie', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '75': { nom: 'Paris', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '76': { nom: 'Seine-Maritime', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '77': { nom: 'Seine-et-Marne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '78': { nom: 'Yvelines', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '79': { nom: 'Deux-Sèvres', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '80': { nom: 'Somme', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '81': { nom: 'Tarn', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '82': { nom: 'Tarn-et-Garonne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '83': { nom: 'Var', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '84': { nom: 'Vaucluse', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '85': { nom: 'Vendée', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '86': { nom: 'Vienne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '87': { nom: 'Haute-Vienne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '88': { nom: 'Vosges', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '89': { nom: 'Yonne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '90': { nom: 'Territoire de Belfort', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '91': { nom: 'Essonne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '92': { nom: 'Hauts-de-Seine', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '93': { nom: 'Seine-Saint-Denis', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '94': { nom: 'Val-de-Marne', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '95': { nom: 'Val-d\'Oise', taux: 4.50, tauxTVA: 20.0, majoration: 0 },
    '971': { nom: 'Guadeloupe', taux: 4.50, tauxTVA: 8.5, majoration: 23 },
    '972': { nom: 'Martinique', taux: 4.50, tauxTVA: 8.5, majoration: 24 },
    '973': { nom: 'Guyane', taux: 4.50, tauxTVA: 0, majoration: 20 },
    '974': { nom: 'La Réunion', taux: 4.50, tauxTVA: 8.5, majoration: 36 },
    '976': { nom: 'Mayotte', taux: 3.80, tauxTVA: 0, majoration: 36 }
  };

  // ============================================================================
  // CATÉGORIES D'ACTES
  // ============================================================================
  
  const categoriesActes: Record<string, CategorieActes> = {
  
  'actes_non_tarifies': {
    label: '⚖️ Actes non tarifés (honoraires libres)',
    icon: FileEdit,
    actes: {
      'statuts_societe_simple': {
        label: 'Statuts société (EURL/SASU simple)',
        type: 'non_tarife',
        description: 'Rédaction statuts société unipersonnelle standard',
        honorairesEstimes: '800-1 000€ HT'
      },
      'statuts_societe_complexe': {
        label: 'Statuts société (SARL/SAS pluripersonnelle)',
        type: 'non_tarife',
        description: 'Rédaction statuts avec clauses spécifiques',
        honorairesEstimes: '1 500-2 500€ HT'
      },
      'bail_commercial': {
        label: 'Bail commercial',
        type: 'non_tarife',
        description: 'Rédaction bail 3/6/9 - Usage: ~1 mois loyer annuel HT',
        honorairesEstimes: '800-2 000€ HT + enregistrement 25€'
      },
      'bail_professionnel': {
        label: 'Bail professionnel',
        type: 'non_tarife',
        description: 'Bail professions libérales - Usage: ~1 mois loyer annuel HT',
        honorairesEstimes: '500-1 000€ HT'
      },
      'commodat': {
        label: 'Commodat (prêt à usage)',
        type: 'non_tarife',
        description: 'Contrat de prêt gratuit d\'un bien',
        honorairesEstimes: '400-800€ HT'
      },
      'promesse_vente': {
        label: 'Promesse de vente',
        type: 'non_tarife',
        description: 'Compromis de vente immobilière',
        honorairesEstimes: '500-1 200€ HT'
      },
      'convention_indivision': {
        label: 'Convention d\'indivision',
        type: 'non_tarife',
        description: 'Organisation gestion bien indivis',
        honorairesEstimes: '600-1 200€ HT'
      },
      'vente_fonds_commerce': {
        label: 'Vente de fonds de commerce',
        type: 'non_tarife',
        description: 'Sans publicité foncière',
        honorairesEstimes: '1 000-2 500€ HT'
      },
      'pacte_actionnaires': {
        label: 'Pacte d\'actionnaires',
        type: 'non_tarife',
        description: 'Clauses gouvernance et cession',
        honorairesEstimes: '1 500-3 000€ HT'
      },
      'mandat_vente': {
        label: 'Mandat de vente/recherche',
        type: 'non_tarife',
        description: 'Mandat immobilier',
        honorairesEstimes: '300-800€ HT'
      },
      'transaction_mediation': {
        label: 'Transaction (Art. 2044 CC)',
        type: 'non_tarife',
        description: 'Résolution amiable conflits',
        honorairesEstimes: '800-2 000€ HT'
      },
      'consultation': {
        label: 'Consultation juridique',
        type: 'non_tarife',
        description: 'Conseil détachable',
        honorairesEstimes: '150-500€ HT/heure'
      },
      'pacte_tontine': {
        label: 'Pacte tontinier',
        type: 'non_tarife',
        description: 'Clause d\'accroissement concubins',
        honorairesEstimes: '600-1 200€ HT'
      }
    }
  },

  'biens_immobiliers': {
    label: 'Actes relatifs aux biens immobiliers',
    icon: Home,
    actes: {
      'vente_immeuble': { 
        label: 'Vente d\'immeuble',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 3.870 },
          { min: 6500, max: 17000, taux: 1.596 },
          { min: 17000, max: 60000, taux: 1.064 },
          { min: 60000, max: Infinity, taux: 0.799 }
        ]
      },
      'vente_terrain': { 
        label: 'Vente de terrain à bâtir',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 3.870 },
          { min: 6500, max: 17000, taux: 1.596 },
          { min: 17000, max: 60000, taux: 1.064 },
          { min: 60000, max: Infinity, taux: 0.799 }
        ]
      },
      'vefa': { 
        label: 'Vente en état futur d\'achèvement (VEFA)',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 3.870 },
          { min: 6500, max: 17000, taux: 1.596 },
          { min: 17000, max: 60000, taux: 1.064 },
          { min: 60000, max: Infinity, taux: 0.799 }
        ]
      },
      'echange': { 
        label: 'Échange d\'immeubles',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 3.870 },
          { min: 6500, max: 17000, taux: 1.596 },
          { min: 17000, max: 60000, taux: 1.064 },
          { min: 60000, max: Infinity, taux: 0.799 }
        ]
      },
      'licitation': { 
        label: 'Licitation',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 4.837 },
          { min: 6500, max: 17000, taux: 1.995 },
          { min: 17000, max: 60000, taux: 1.330 },
          { min: 60000, max: Infinity, taux: 0.998 }
        ]
      },
      'partage': { 
        label: 'Partage',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 4.837 },
          { min: 6500, max: 17000, taux: 1.995 },
          { min: 17000, max: 60000, taux: 1.330 },
          { min: 60000, max: Infinity, taux: 0.998 }
        ]
      },
      'bail_construction': { 
        label: 'Bail à construction',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 0.798 },
          { min: 17000, max: 60000, taux: 0.532 },
          { min: 60000, max: Infinity, taux: 0.399 }
        ]
      },
      'servitude_fixe': { 
        label: 'Constitution servitude ≤ 4 875€',
        type: 'fixe',
        montant: 188.66
      },
      'servitude_proportionnel': { 
        label: 'Constitution servitude > 4 875€',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 3.870 },
          { min: 6500, max: 17000, taux: 1.596 },
          { min: 17000, max: 60000, taux: 1.064 },
          { min: 60000, max: Infinity, taux: 0.799 }
        ]
      }
    }
  },

  'famille': {
    label: 'Actes relatifs à la famille',
    icon: Users,
    actes: {
      'contrat_mariage': { 
        label: 'Contrat de mariage',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 2.580 },
          { min: 6500, max: 17000, taux: 1.064 },
          { min: 17000, max: 60000, taux: 0.709 },
          { min: 60000, max: Infinity, taux: 0.532 }
        ]
      },
      'changement_regime': { 
        label: 'Changement de régime matrimonial',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 0.798 },
          { min: 17000, max: 60000, taux: 0.532 },
          { min: 60000, max: Infinity, taux: 0.399 }
        ]
      },
      'pacs': { 
        label: 'PACS',
        type: 'fixe',
        montant: 84.51
      },
      'divorce_consentement': { 
        label: 'Dépôt convention divorce par consentement mutuel',
        type: 'fixe',
        montant: 41.20
      },
      'liquidation_regime': { 
        label: 'Liquidation de régime matrimonial',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 2.515 },
          { min: 6500, max: 17000, taux: 1.038 },
          { min: 17000, max: 60000, taux: 0.692 },
          { min: 60000, max: Infinity, taux: 0.519 }
        ]
      }
    }
  },

  'successions': {
    label: 'Actes relatifs aux successions et libéralités',
    icon: FileSignature,
    actes: {
      'donation': { 
        label: 'Donation',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 4.837 },
          { min: 6500, max: 17000, taux: 1.995 },
          { min: 17000, max: 60000, taux: 1.330 },
          { min: 60000, max: Infinity, taux: 0.998 }
        ]
      },
      'donation_partage': { 
        label: 'Donation-partage',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 4.837 },
          { min: 6500, max: 17000, taux: 1.995 },
          { min: 17000, max: 60000, taux: 1.330 },
          { min: 60000, max: Infinity, taux: 0.998 }
        ]
      },
      'testament': { 
        label: 'Testament authentique',
        type: 'fixe',
        montant: 113.19
      },
      'notoriete': { 
        label: 'Acte de notoriété',
        type: 'fixe',
        montant: 56.60
      },
      'attestation_propriete': { 
        label: 'Attestation de propriété immobilière',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 0.968 },
          { min: 6500, max: 17000, taux: 0.399 },
          { min: 17000, max: 60000, taux: 0.266 },
          { min: 60000, max: Infinity, taux: 0.200 }
        ]
      },
      'inventaire': { 
        label: 'Inventaire successoral',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      },
      'renonciation': { 
        label: 'Renonciation à succession',
        type: 'fixe',
        montant: 57.69
      },
      'declaration_succession': {
        label: 'Déclaration de succession',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.548 },
          { min: 6500, max: 17000, taux: 0.638 },
          { min: 17000, max: 30000, taux: 0.425 },
          { min: 30000, max: Infinity, taux: 0.319 }
        ]
      }
    }
  },

  'prets': {
    label: 'Actes relatifs aux prêts et sûretés',
    icon: Landmark,
    actes: {
      'pret_hypothecaire': { 
        label: 'Prêt avec hypothèque conventionnelle',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 0.798 },
          { min: 17000, max: 60000, taux: 0.532 },
          { min: 60000, max: Infinity, taux: 0.399 }
        ]
      },
      'pret_viager': { 
        label: 'Prêt viager hypothécaire',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 2.322 },
          { min: 6500, max: 17000, taux: 0.958 },
          { min: 17000, max: 60000, taux: 0.638 },
          { min: 60000, max: Infinity, taux: 0.479 }
        ]
      },
      'mainlevee_saisie': { 
        label: 'Mainlevée de saisie',
        type: 'fixe',
        montant: 26.41
      },
      'mainlevee_hypo_inf': { 
        label: 'Mainlevée hypothèque < 77 090€',
        type: 'fixe',
        montant: 78.00
      },
      'mainlevee_hypo_sup': { 
        label: 'Mainlevée hypothèque ≥ 77 090€',
        type: 'fixe',
        montant: 150.00
      },
      'caution_hypothecaire': { 
        label: 'Caution hypothécaire',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 0.968 },
          { min: 6500, max: 17000, taux: 0.399 },
          { min: 17000, max: 60000, taux: 0.266 },
          { min: 60000, max: Infinity, taux: 0.200 }
        ]
      },
      'ppd': { 
        label: 'Privilège de prêteur de deniers',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 0.798 },
          { min: 17000, max: 60000, taux: 0.532 },
          { min: 60000, max: Infinity, taux: 0.399 }
        ]
      }
    }
  },

  'societes': {
    label: 'Actes relatifs aux sociétés',
    icon: Briefcase,
    actes: {
      'constitution_societe': { 
        label: 'Constitution de société',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 0.798 },
          { min: 17000, max: 60000, taux: 0.532 },
          { min: 60000, max: Infinity, taux: 0.399 }
        ]
      },
      'augmentation_capital': { 
        label: 'Augmentation de capital',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 0.968 },
          { min: 6500, max: 17000, taux: 0.399 },
          { min: 17000, max: 60000, taux: 0.266 },
          { min: 60000, max: Infinity, taux: 0.200 }
        ]
      },
      'cession_parts': { 
        label: 'Cession de parts sociales',
        type: 'proportionnel',
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      },
      'dissolution': { 
        label: 'Dissolution de société',
        type: 'fixe',
        montant: 230.77
      },
      'transformation': { 
        label: 'Transformation de société',
        type: 'fixe',
        montant: 192.31
      }
    }
  },

  'divers': {
    label: 'Actes divers et procurations',
    icon: File,
    actes: {
      'procuration': { 
        label: 'Procuration',
        type: 'fixe',
        montant: 26.41
      },
      'quittance': { 
        label: 'Quittance',
        type: 'fixe',
        montant: 26.41
      },
      'consentement_adoption': { 
        label: 'Consentement à adoption',
        type: 'fixe',
        montant: 77.11
      }
    }
  }
};

  // ============================================================================
  // CALCUL DES ÉMOLUMENTS
  // ============================================================================
  
  const calculerEmoluments = (montant: number, tranches: TrancheTarif[]) => {
    let emolumentsBruts = 0;
    
    tranches.forEach(tranche => {
      if (montant > tranche.min) {
        const montantDansTranche = Math.min(montant - tranche.min, tranche.max - tranche.min);
        emolumentsBruts += montantDansTranche * (tranche.taux / 100);
      }
    });

    const tauxMajoration = getMajorationDOMTOM(selectedDepartement);
    const majoration = emolumentsBruts * (tauxMajoration / 100);
    const emolumentsAvantRemise = emolumentsBruts + majoration;

    let remise20 = 0;
    let emolumentsNets = emolumentsAvantRemise;
    
    if (appliquerRemise && montant > 100000) {
      let emolumentsAuDela100k = 0;
      
      tranches.forEach(tranche => {
        if (100000 < tranche.max) {
          const debut = Math.max(100000, tranche.min);
          const fin = montant > tranche.max ? tranche.max : montant;
          if (fin > debut) {
            emolumentsAuDela100k += (fin - debut) * (tranche.taux / 100);
          }
        }
      });
      
      const majorationAuDela100k = emolumentsAuDela100k * (tauxMajoration / 100);
      remise20 = (emolumentsAuDela100k + majorationAuDela100k) * 0.20;
      
      emolumentsNets = emolumentsAvantRemise - remise20;
    }
    
    return {
      bruts: emolumentsBruts,
      majoration: majoration,
      avantRemise: emolumentsAvantRemise,
      remise10: 0,
      remise20: remise20,
      nets: emolumentsNets
    };
  };

  const calculerTaxes = () => {
    if (!montantActe || taxes.typeBien === 'neuf') return;
    
    const montant = parseFloat(montantActe.replace(/\s/g, ''));
    if (isNaN(montant)) return;
    
    const tauxDepartemental = departements[selectedDepartement]?.taux || 4.50;
    const tauxCommunal = 1.20;
    
    const taxeDepartementale = montant * (tauxDepartemental / 100);
    const taxeCommunale = montant * (tauxCommunal / 100);
    const totalDroits = taxeDepartementale + taxeCommunale;
    const fraisAssiette = totalDroits * 0.0237;
    
    setTaxes(prev => ({
      ...prev,
      departementale: taxeDepartementale,
      communale: taxeCommunale,
      fraisAssiette: fraisAssiette
    }));
  };

  const calculerCSI = () => {
    if (!montantActe) return;
    
    const montant = parseFloat(montantActe.replace(/\s/g, ''));
    if (isNaN(montant)) return;
    
    const csi = Math.max(montant * 0.001, 15);
    
    setDebours(prev => ({
      ...prev,
      csi: csi
    }));
  };
  
  const sauvegarderCalcul = () => {
    const nouveauCalcul: HistoriqueCalcul = {
      id: Date.now(),
      date: new Date().toLocaleString('fr-FR'),
      acte: categoriesActes[selectedCategory]?.actes[selectedActe]?.label || 'N/A',
      montant: montantActe,
      total: totalGeneral,
      details: {
        emoluments: totalEmolumentsTTC,
        debours: totalDebours,
        formalites: totalFormalitesTTC,
        documents: totalDocumentsTTC,
        taxes: totalTaxes
      }
    };
    
    setHistoriqueCalculs([nouveauCalcul, ...historiqueCalculs]);
    alert('Calcul sauvegardé !');
  };
  
  const exporterPDF = () => {
    const deptInfo = departements[selectedDepartement];
    const acteInfo = categoriesActes[selectedCategory]?.actes[selectedActe];
    
    const doc = new jsPDF();
    
    let y = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Calcul Frais Notariés', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Conforme tarif réglementé 2025/2026', pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(11);
    doc.text(`Date : ${new Date().toLocaleString('fr-FR')}`, 20, y);
    y += lineHeight;
    doc.text(`Département : ${deptInfo?.nom} (${selectedDepartement})`, 20, y);
    y += lineHeight;
    
    if (deptInfo?.majoration > 0) {
      doc.setTextColor(255, 100, 0);
      doc.text(`⚠ Territoire DOM-TOM - Majoration +${deptInfo.majoration}%`, 20, y);
      doc.setTextColor(0, 0, 0);
      y += lineHeight;
    }
    
    doc.text(`Type d'acte : ${acteInfo?.label || 'N/A'}`, 20, y);
    y += lineHeight;
    
    if (acteInfo?.type === 'non_tarife') {
      doc.setFont('helvetica', 'bold');
      doc.text('⚖ ACTE NON TARIFÉ - HONORAIRES LIBRES', 20, y);
      doc.setFont('helvetica', 'normal');
      y += lineHeight;
      doc.text(`Estimation : ${acteInfo.honorairesEstimes}`, 20, y);
      y += lineHeight * 2;
      doc.setFontSize(9);
      doc.text('Ces honoraires sont libres et doivent être convenus avec votre notaire.', 20, y);
      doc.text('Ils ne sont pas réglementés par le décret n°2020-179.', 20, y + 5);
    } else {
      doc.text(`Montant : ${montantActe} €`, 20, y);
      y += lineHeight * 2;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ÉMOLUMENTS', 20, y);
      y += lineHeight + 2;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Émoluments bruts :`, 20, y);
      doc.text(`${emolumentsDetail.bruts.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
      
      if (emolumentsDetail.majoration > 0) {
        doc.setTextColor(255, 100, 0);
        doc.text(`Majoration DOM-TOM (+${deptInfo?.majoration}%) :`, 20, y);
        doc.text(`+${emolumentsDetail.majoration.toFixed(2)} €`, pageWidth - 60, y);
        doc.setTextColor(0, 0, 0);
        y += lineHeight;
      }
      
      if (appliquerRemise && emolumentsDetail.remise20 > 0) {
        doc.setTextColor(0, 150, 0);
        doc.text(`Remise 20% (>100k€) :`, 20, y);
        doc.text(`-${emolumentsDetail.remise20.toFixed(2)} €`, pageWidth - 60, y);
        doc.setTextColor(0, 0, 0);
        y += lineHeight;
      }
      
      doc.text(`Total HT :`, 20, y);
      doc.text(`${emolumentsDetail.nets.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
      
      const tauxTVAText = getTauxTVA(selectedDepartement) === 0 ? 
        `TVA (0% - Exonéré) :` : 
        `TVA (${getTauxTVA(selectedDepartement)}%) :`;
      doc.text(tauxTVAText, 20, y);
      doc.text(`${(emolumentsDetail.nets * getTauxTVA(selectedDepartement) / 100).toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Total TTC :`, 20, y);
      doc.text(`${totalEmolumentsTTC.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight * 2;
      
      doc.setFontSize(12);
      doc.text('DÉBOURS', 20, y);
      y += lineHeight + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`CSI :`, 20, y);
      doc.text(`${debours.csi.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total débours :`, 20, y);
      doc.text(`${totalDebours.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight * 2;
      
      doc.setFontSize(12);
      doc.text('FORMALITÉS', 20, y);
      y += lineHeight + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total TTC :`, 20, y);
      doc.text(`${totalFormalitesTTC.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight * 2;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('DOCUMENTS', 20, y);
      y += lineHeight + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total TTC :`, 20, y);
      doc.text(`${totalDocumentsTTC.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight * 2;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TAXES ET DROITS', 20, y);
      y += lineHeight + 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      if (taxes.typeBien === 'ancien') {
        doc.text(`Taxe départementale :`, 20, y);
        doc.text(`${taxes.departementale.toFixed(2)} €`, pageWidth - 60, y);
        y += lineHeight;
        doc.text(`Taxe communale :`, 20, y);
        doc.text(`${taxes.communale.toFixed(2)} €`, pageWidth - 60, y);
        y += lineHeight;
        doc.text(`Frais d'assiette :`, 20, y);
        doc.text(`${taxes.fraisAssiette.toFixed(2)} €`, pageWidth - 60, y);
        y += lineHeight;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Total taxes :`, 20, y);
      doc.text(`${totalTaxes.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight * 3;
      
      doc.setDrawColor(50, 50, 50);
      doc.setLineWidth(0.5);
      doc.line(20, y - 5, pageWidth - 20, y - 5);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL GÉNÉRAL', 20, y);
      doc.text(`${totalGeneral.toFixed(2)} €`, pageWidth - 60, y);
      
      doc.setLineWidth(0.5);
      doc.line(20, y + 3, pageWidth - 20, y + 3);
    }
    
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Calcul conforme au Décret n°2020-179 du 27 février 2020', pageWidth / 2, footerY, { align: 'center' });
    if (appliquerRemise) {
      doc.text('Remise de 20% appliquée sur la tranche >100 000€', pageWidth / 2, footerY + 4, { align: 'center' });
    }
    doc.text(`Généré par NotariaPrime - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, footerY + 8, { align: 'center' });
    
    doc.save(`notariaprime_${Date.now()}.pdf`);
  };

  // ============================================================================
  // 🔥 useEffect POUR APPLIQUER LA CONFIG AUTOMATIQUEMENT
  // ============================================================================
  
  useEffect(() => {
    if (selectedActe) {
      // 🔥 Appliquer la configuration par défaut
      appliquerConfigParDefaut(selectedActe);
      
      const acte = categoriesActes[selectedCategory]?.actes[selectedActe];
      if (acte && acte.type !== 'non_tarife') {
        if (acte.type === 'fixe' && acte.montant) {
          const detail = {
            bruts: acte.montant,
            majoration: 0,
            avantRemise: acte.montant,
            remise10: 0,
            remise20: 0,
            nets: acte.montant
          };
          setEmolumentsDetail(detail);
          setEmoluments(acte.montant);
        } else if (acte.type === 'proportionnel' && montantActe && acte.tranches) {
          const montant = parseFloat(montantActe.replace(/\s/g, ''));
          if (!isNaN(montant)) {
            const detail = calculerEmoluments(montant, acte.tranches);
            setEmolumentsDetail(detail);
            setEmoluments(detail.nets);
            calculerCSI();
            calculerTaxes();
          }
        }
      }
    }
  }, [selectedActe, montantActe, selectedDepartement, taxes.typeBien, selectedCategory, appliquerRemise]);

  const tauxTVA = getTauxTVA(selectedDepartement);
  const totalEmoluments = emolumentsDetail.nets;
  const montantTVA = totalEmoluments * (tauxTVA / 100);
  const totalEmolumentsTTC = totalEmoluments + montantTVA;
  
  const totalDebours = Object.values(debours).reduce((sum, val) => sum + val, 0);
  
  const totalFormalites = 
    (formalites.publiciteFonciere.actif ? formalites.publiciteFonciere.montant : 0) +
    (formalites.cadastre.actif ? formalites.cadastre.montant : 0) +
    (formalites.casierJudiciaire.actif ? formalites.casierJudiciaire.montant : 0) +
    (formalites.notification.actif ? formalites.notification.montant : 0) +
    (formalites.mesurage.actif ? formalites.mesurage.montant : 0) +
    Object.values(formalites.diagnostics).reduce((sum, d) => sum + (d.actif ? d.montant : 0), 0) +
    (formalites.transmissionCSN.actif ? formalites.transmissionCSN.montant : 0) +
    (formalites.requisition.actif ? formalites.requisition.montant : 0) +
    formalites.teleactes +
    formalites.lettresRecommandees;
  
  const totalFormalitesTTC = totalFormalites * (1 + tauxTVA / 100);
  
  const fraisRole = documents.pagesActe * 2;
  const copiesExec = documents.copiesExecutoires * 4;
  const copiesAuth = documents.copiesAuthentiques * 40;
  const copiesHypo = documents.copiesHypothecaires * 4;
  const totalDocuments = fraisRole + copiesExec + copiesAuth + copiesHypo;
  const totalDocumentsTTC = totalDocuments * (1 + tauxTVA / 100);
  
  const totalTaxes = taxes.departementale + taxes.communale + taxes.fraisAssiette;
  
  const totalGeneral = totalEmolumentsTTC + totalDebours + totalFormalitesTTC + totalDocumentsTTC + totalTaxes;

  const acteActuel = categoriesActes[selectedCategory]?.actes[selectedActe];
  const estActeNonTarife = acteActuel?.type === 'non_tarife';

  // ============================================================================
  // 🔥 FONCTION POUR VÉRIFIER SI UNE FORMALITÉ EST OBLIGATOIRE
  // ============================================================================
  
  const estFormaliteObligatoire = (nomFormalite: string): boolean => {
    if (!selectedActe) return false;
    const config = actesConfig[selectedActe];
    if (!config || !config.formalites) return false;
    
    const formalite = config.formalites[nomFormalite as keyof typeof config.formalites];
    return (formalite as any)?.obligatoire === true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Calculateur de frais notariés</h1>
                  <p className="text-indigo-600 font-medium">Conforme au tarif réglementé 2025/2026</p>
                </div>
              </div>
            </div>
            {!estActeNonTarife && (
              <div className="text-right">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <p className="text-sm text-indigo-600 font-medium mb-1">Total général</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Département
              </label>
              <select
                value={selectedDepartement}
                onChange={(e) => setSelectedDepartement(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {Object.entries(departements).map(([code, dept]) => (
                  <option key={code} value={code}>
                    {code} - {dept.nom}
                    {dept.majoration > 0 && ` • +${dept.majoration}%`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Catégorie d'acte</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedActe('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Sélectionnez...</option>
                {Object.entries(categoriesActes).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Type d'acte</label>
              <select
                value={selectedActe}
                onChange={(e) => setSelectedActe(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
              >
                <option value="">Sélectionnez...</option>
                {selectedCategory && Object.entries(categoriesActes[selectedCategory].actes).map(([key, acte]) => (
                  <option key={key} value={key}>{acte.label}</option>
                ))}
              </select>
            </div>
          </div>

          {estActeNonTarife && acteActuel && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <FileEdit className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">⚖️ Acte non tarifé - Honoraires libres</h3>
                  <p className="text-sm text-blue-800 mb-3">{acteActuel.description}</p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-gray-900 mb-1">💰 Estimation des honoraires</p>
                    <p className="text-lg font-bold text-indigo-600">{acteActuel.honorairesEstimes}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Ces honoraires sont libres et doivent être convenus avec votre notaire.
                      Ils ne sont pas réglementés par le décret n°2020-179.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedActe && !estActeNonTarife && categoriesActes[selectedCategory]?.actes[selectedActe]?.type === 'proportionnel' && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Montant de l'opération</label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={montantActe}
                  onChange={(e) => setMontantActe(e.target.value)}
                  placeholder="450 000"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-lg font-medium"
                />
              </div>
            </div>
          )}
          
          {getMajorationDOMTOM(selectedDepartement) > 0 && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Territoire DOM-TOM : {departements[selectedDepartement]?.nom}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    • Majoration : <strong>+{getMajorationDOMTOM(selectedDepartement)}%</strong> (Article A444-176)
                    <br />
                    • TVA : <strong>{getTauxTVA(selectedDepartement)}%</strong>
                    {getTauxTVA(selectedDepartement) === 0 && <span> - EXONÉRÉ (Article 294 CGI)</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {selectedCategory === 'successions' && (selectedActe === 'donation' || selectedActe === 'donation_partage') && (
            <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-6 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Configuration de la donation
              </h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">Donateurs</label>
                  <button
                    onClick={ajouterDonateur}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
                {donateurs.map((donateur) => (
                  <div key={donateur.id} className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="text"
                      value={donateur.nom}
                      onChange={(e) => {
                        setDonateurs(donateurs.map(d => 
                          d.id === donateur.id ? {...d, nom: e.target.value} : d
                        ));
                      }}
                      placeholder="Nom"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={donateur.montant}
                      onChange={(e) => {
                        setDonateurs(donateurs.map(d => 
                          d.id === donateur.id ? {...d, montant: e.target.value} : d
                        ));
                      }}
                      placeholder="Montant"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={donateur.lien}
                      onChange={(e) => {
                        setDonateurs(donateurs.map(d => 
                          d.id === donateur.id ? {...d, lien: e.target.value} : d
                        ));
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="parent">Parent</option>
                      <option value="grand-parent">Grand-parent</option>
                      <option value="epoux">Époux</option>
                      <option value="autre">Autre</option>
                    </select>
                    {donateurs.length > 1 && (
                      <button
                        onClick={() => supprimerDonateur(donateur.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedActe === 'donation_partage' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">Donataires</label>
                    <button
                      onClick={ajouterDonataire}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                  {donataires.map((donataire) => (
                    <div key={donataire.id} className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200">
                      <input
                        type="text"
                        value={donataire.nom}
                        onChange={(e) => {
                          setDonataires(donataires.map(d => 
                            d.id === donataire.id ? {...d, nom: e.target.value} : d
                          ));
                        }}
                        placeholder="Nom"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={donataire.part}
                          onChange={(e) => {
                            setDonataires(donataires.map(d => 
                              d.id === donataire.id ? {...d, part: e.target.value} : d
                            ));
                          }}
                          placeholder="Part"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="ml-1 text-sm text-gray-600">%</span>
                      </div>
                      {donataires.length > 1 && (
                        <button
                          onClick={() => supprimerDonataire(donataire.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={sauvegarderCalcul}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={exporterPDF}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
            <button
              onClick={() => setAfficherHistorique(!afficherHistorique)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <History className="w-4 h-4" />
              Historique ({historiqueCalculs.length})
            </button>
            <button
              onClick={() => appliquerConfigParDefaut(selectedActe)}
              disabled={!selectedActe}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          </div>
        </div>
        
        {afficherHistorique && historiqueCalculs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Historique des calculs</h2>
              <button
                onClick={() => setAfficherHistorique(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {historiqueCalculs.map((calcul) => (
                <div key={calcul.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{calcul.acte}</p>
                      <p className="text-sm text-gray-600">{calcul.date}</p>
                      <p className="text-sm text-gray-600">Montant : {calcul.montant} €</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">{calcul.total.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!estActeNonTarife && selectedActe && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: 'emoluments', label: 'Émoluments', icon: Calculator },
                    { id: 'debours', label: 'Débours', icon: Euro },
                    { id: 'formalites', label: 'Formalités', icon: FileText },
                    { id: 'documents', label: 'Documents', icon: File },
                    { id: 'taxes', label: 'Taxes', icon: Building }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'emoluments' && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-900">
                            Calcul selon tranches réglementaires.
                          </p>
                          {getMajorationDOMTOM(selectedDepartement) > 0 && (
                            <p className="text-sm text-blue-900 mt-2 font-medium">
                              ⚠️ Majoration DOM-TOM de {getMajorationDOMTOM(selectedDepartement)}% appliquée
                            </p>
                          )}
                          {montantActe && parseFloat(montantActe.replace(/\s/g, '')) > 100000 && (
                            <div className="mt-3">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={appliquerRemise}
                                  onChange={(e) => setAppliquerRemise(e.target.checked)}
                                  className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                                />
                                <span className="text-sm font-medium text-blue-900">
                                  Appliquer la remise de 20% au-delà de 100 000€
                                </span>
                              </label>
                              <p className="text-xs text-blue-700 mt-1 ml-6">
                                Article A444-174 - Remise optionnelle rarement pratiquée
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Émoluments bruts</span>
                        <span className="font-semibold text-lg">{emolumentsDetail.bruts.toFixed(2)} €</span>
                      </div>
                      
                      {emolumentsDetail.majoration > 0 && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 bg-orange-50 px-3 rounded-lg">
                          <span className="text-orange-900 font-medium">
                            Majoration DOM-TOM (+{getMajorationDOMTOM(selectedDepartement)}%)
                          </span>
                          <span className="font-semibold text-lg text-orange-900">
                            +{emolumentsDetail.majoration.toFixed(2)} €
                          </span>
                        </div>
                      )}
                      
                      {emolumentsDetail.remise20 > 0 && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-green-600">Remise 20% (au-delà 100k€)</span>
                          <span className="text-green-600 text-lg">-{emolumentsDetail.remise20.toFixed(2)} €</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Total HT</span>
                        <span className="font-semibold text-lg">{totalEmoluments.toFixed(2)} €</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">
                          TVA ({tauxTVA}%)
                          {tauxTVA === 0 && <span className="text-green-600 font-medium"> - EXONÉRÉ</span>}
                        </span>
                        <span className="text-lg">{montantTVA.toFixed(2)} €</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-4 border-t-2 border-gray-200">
                        <span className="font-bold text-xl">Total TTC</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {totalEmolumentsTTC.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'debours' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Contribution de Sécurité Immobilière (CSI)</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-600">Montant calculé: <span className="font-semibold">{debours.csi.toFixed(2)} €</span></p>
                        <p className="text-xs text-gray-500 mt-1">0,1% du prix avec minimum 15€</p>
                      </div>
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl">Total débours</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {totalDebours.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'formalites' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      {Object.entries({
                        'publiciteFonciere': { label: 'Publicité foncière', item: formalites.publiciteFonciere },
                        'cadastre': { label: 'Documents cadastraux', item: formalites.cadastre },
                        'casierJudiciaire': { label: 'Casier judiciaire', item: formalites.casierJudiciaire },
                        'notification': { label: 'Notification préemption', item: formalites.notification },
                        'mesurage': { label: 'Certificat mesurage', item: formalites.mesurage },
                        'transmissionCSN': { label: 'Transmission CSN', item: formalites.transmissionCSN },
                        'requisition': { label: 'Réquisition SPF', item: formalites.requisition }
                      }).map(([key, { label, item }]) => {
                        const obligatoire = estFormaliteObligatoire(key);
                        return (
                          <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={item.actif}
                                disabled={obligatoire}
                                onChange={(e) => {
                                  if (!obligatoire) {
                                    setFormalites(prev => ({
                                      ...prev,
                                      [key]: { ...item, actif: e.target.checked }
                                    }));
                                  }
                                }}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded disabled:opacity-50"
                              />
                              <span className="text-sm font-medium text-gray-700">{label}</span>
                              {obligatoire && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                  Obligatoire
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{item.montant.toFixed(2)} €</span>
                          </label>
                        );
                      })}
                      
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Diagnostics</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(formalites.diagnostics).map(([key, diag]) => (
                            <label key={key} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={diag.actif}
                                  onChange={(e) => {
                                    setFormalites(prev => ({
                                      ...prev,
                                      diagnostics: {
                                        ...prev.diagnostics,
                                        [key]: { ...diag, actif: e.target.checked }
                                      }
                                    }));
                                  }}
                                  className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                                />
                                <span className="text-xs font-medium text-gray-700">{key.toUpperCase()}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-900">{diag.montant.toFixed(2)}€</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl">Total TTC (TVA {tauxTVA}%)</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {totalFormalitesTTC.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de pages de l'acte</label>
                        <input
                          type="number"
                          value={documents.pagesActe}
                          onChange={(e) => setDocuments(prev => ({ ...prev, pagesActe: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="1"
                        />
                        <p className="text-sm text-gray-600 mt-2">Frais de rôle : {(documents.pagesActe * 2).toFixed(2)} € (2€/page)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Copies exécutoires</label>
                        <input
                          type="number"
                          value={documents.copiesExecutoires}
                          onChange={(e) => setDocuments(prev => ({ ...prev, copiesExecutoires: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                        />
                        <p className="text-sm text-gray-600 mt-2">4€ par copie</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Copies authentiques</label>
                        <input
                          type="number"
                          value={documents.copiesAuthentiques}
                          onChange={(e) => setDocuments(prev => ({ ...prev, copiesAuthentiques: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                        />
                        <p className="text-sm text-gray-600 mt-2">40€ par copie</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Copies hypothécaires</label>
                        <input
                          type="number"
                          value={documents.copiesHypothecaires}
                          onChange={(e) => setDocuments(prev => ({ ...prev, copiesHypothecaires: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                        />
                        <p className="text-sm text-gray-600 mt-2">4€ par copie</p>
                      </div>
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl">Total TTC (TVA {tauxTVA}%)</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {totalDocumentsTTC.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'taxes' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Type de bien</h3>
                      <div className="space-y-3">
                        <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            value="ancien"
                            checked={taxes.typeBien === 'ancien'}
                            onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
                            className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <span className="font-medium text-gray-900">Bien ancien</span>
                            <p className="text-sm text-gray-600">Soumis aux droits de mutation</p>
                          </div>
                        </label>
                        <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            value="neuf"
                            checked={taxes.typeBien === 'neuf'}
                            onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
                            className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <span className="font-medium text-gray-900">Bien neuf (VEFA)</span>
                            <p className="text-sm text-gray-600">Soumis à la TVA uniquement</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {taxes.typeBien === 'ancien' && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Droits de mutation</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Taxe départementale ({departements[selectedDepartement]?.taux}%)</span>
                              <span className="font-medium">{taxes.departementale.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Taxe communale (1,20%)</span>
                              <span className="font-medium">{taxes.communale.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Frais d'assiette (2,37%)</span>
                              <span className="font-medium">{taxes.fraisAssiette.toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl">Total des taxes</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {totalTaxes.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-3 text-indigo-600" />
                Récapitulatif final
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Émoluments TTC</span>
                  <span className="font-semibold text-lg">{totalEmolumentsTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Débours</span>
                  <span className="font-semibold text-lg">{totalDebours.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Formalités TTC</span>
                  <span className="font-semibold text-lg">{totalFormalitesTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Documents TTC</span>
                  <span className="font-semibold text-lg">{totalDocumentsTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Taxes et droits</span>
                  <span className="font-semibold text-lg">{totalTaxes.toFixed(2)} €</span>
                </div>
<div className="flex justify-between items-center pt-6 border-t-2 border-gray-300">
  <span className="text-2xl font-bold text-gray-900">TOTAL GÉNÉRAL</span>
  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    {totalGeneral.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })} €
  </span>
</div>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Calcul conforme au tarif réglementé 2025/2026
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Décret n°2020-179 du 27 février 2020
                      {getMajorationDOMTOM(selectedDepartement) > 0 && 
                        ` • Article A444-176 (majoration DOM-TOM +${getMajorationDOMTOM(selectedDepartement)}%)`
                      }
                      {' • TVA '}{getTauxTVA(selectedDepartement)}%
                      {getTauxTVA(selectedDepartement) === 0 && ' (exonéré - Art. 294 CGI)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PretaxeIntelligente() {
  return (
    <MainLayout showFeedback={false}>
      <PretaxeContent />
    </MainLayout>
  );
}