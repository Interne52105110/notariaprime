"use client";

import MainLayout from '@/components/MainLayout';
import React, { useState, useEffect } from 'react';
import { 
  Calculator, FileText, Euro, Building, Users, Home,
  FileSignature, Landmark, Briefcase, File, ChevronDown,
  Info, Check, X, AlertCircle, HelpCircle, MapPin,
  Download, Save, History, Plus, Minus, UserPlus
} from 'lucide-react';

// ============================================================================
// NOUVEAUTÉ 2025/2026 : TVA DIFFÉRENCIÉE + MAJORATION DOM-TOM
// CORRIGÉ : Guyane (973) et Mayotte (976) exonérés de TVA (Article 294 CGI)
// ============================================================================

const TVA_CONFIG = {
  metropole: 20.0,
  guadeloupe: 8.5,
  martinique: 8.5,
  guyane: 0,        // ✅ Exonéré TVA (Art. 294 CGI)
  reunion: 8.5,
  mayotte: 0,       // ✅ Exonéré TVA (Art. 294 CGI)
} as const;

const MAJORATION_DOM_TOM: Record<string, number> = {
  '971': 30, // Guadeloupe
  '972': 30, // Martinique
  '973': 30, // Guyane
  '974': 30, // La Réunion
  '976': 30, // Mayotte
};

function getTauxTVA(codeDepartement: string): number {
  const mapping: Record<string, number> = {
    '971': TVA_CONFIG.guadeloupe,  // 8,5%
    '972': TVA_CONFIG.martinique,  // 8,5%
    '973': TVA_CONFIG.guyane,      // 0% ✅ Exonéré
    '974': TVA_CONFIG.reunion,     // 8,5%
    '976': TVA_CONFIG.mayotte,     // 0% ✅ Exonéré
  };
  
  return mapping[codeDepartement] ?? TVA_CONFIG.metropole;
}

function getMajorationDOMTOM(codeDepartement: string): number {
  return MAJORATION_DOM_TOM[codeDepartement] || 0;
}

// ============================================================================
// TYPES TYPESCRIPT (inchangés)
// ============================================================================

interface TrancheTarif {
  min: number;
  max: number;
  taux: number;
}

interface ActeConfig {
  label: string;
  type: 'proportionnel' | 'fixe';
  tranches?: TrancheTarif[];
  montant?: number;
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
  
  const [debours, setDebours] = useState({
    csi: 15,
    etatsHypothecaires: 0,
    cadastre: 0,
    urbanisme: 0
  });
  
  const [formalites, setFormalites] = useState({
    forfaitBase: 130,
    teleactes: 50,
    lettresRecommandees: 7.08,
    prealables: 100,
    posterieures: 100
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
  
  // Fonction pour ajouter/supprimer des donateurs
  const ajouterDonateur = () => {
    const newId = Math.max(...donateurs.map(d => d.id)) + 1;
    setDonateurs([...donateurs, { id: newId, nom: `Donateur ${newId}`, montant: '', lien: 'parent' }]);
  };
  
  const supprimerDonateur = (id: number) => {
    if (donateurs.length > 1) {
      setDonateurs(donateurs.filter(d => d.id !== id));
    }
  };
  
  // Fonction pour ajouter/supprimer des donataires
  const ajouterDonataire = () => {
    const newId = Math.max(...donataires.map(d => d.id)) + 1;
    setDonataires([...donataires, { id: newId, nom: `Donataire ${newId}`, part: '0' }]);
  };
  
  const supprimerDonataire = (id: number) => {
    if (donataires.length > 1) {
      setDonataires(donataires.filter(d => d.id !== id));
    }
  };
  
  // Barème usufruit selon l'âge (Article 669 CGI)
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
  // DÉPARTEMENTS AVEC TVA ET MAJORATION (MODIFIÉ)
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
    // DOM-TOM avec TVA CORRIGÉE
    '971': { nom: 'Guadeloupe', taux: 4.50, tauxTVA: 8.5, majoration: 30 },
    '972': { nom: 'Martinique', taux: 4.50, tauxTVA: 8.5, majoration: 30 },
    '973': { nom: 'Guyane', taux: 4.50, tauxTVA: 0, majoration: 30 },        // ✅ Exonéré TVA
    '974': { nom: 'La Réunion', taux: 4.50, tauxTVA: 8.5, majoration: 30 },
    '976': { nom: 'Mayotte', taux: 3.80, tauxTVA: 0, majoration: 30 }        // ✅ Exonéré TVA
  };

  // Catégories et actes selon l'Annexe 4-7 du Code de commerce (INCHANGÉ)
  const categoriesActes: Record<string, CategorieActes> = {
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
        'servitude': { 
          label: 'Constitution de servitude',
          type: 'fixe',
          montant: 134.61
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
          montant: 101.41
        },
        'divorce_consentement': { 
          label: 'Dépôt convention divorce par consentement mutuel',
          type: 'fixe',
          montant: 50.70
        },
        'liquidation_regime': { 
          label: 'Liquidation de régime matrimonial',
          type: 'proportionnel',
          tranches: [
            { min: 0, max: 6500, taux: 2.580 },
            { min: 6500, max: 17000, taux: 1.064 },
            { min: 17000, max: 60000, taux: 0.709 },
            { min: 60000, max: Infinity, taux: 0.532 }
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
          montant: 115.39
        },
        'notoriete': { 
          label: 'Acte de notoriété',
          type: 'fixe',
          montant: 69.23
        },
        'attestation_propriete': { 
          label: 'Attestation de propriété immobilière',
          type: 'fixe',
          montant: 134.61
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
          montant: 26.92
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
        'mainlevee': { 
          label: 'Mainlevée d\'hypothèque',
          type: 'fixe',
          montant: 96.92
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
          montant: 26.92
        },
        'quittance': { 
          label: 'Quittance',
          type: 'fixe',
          montant: 26.92
        },
        'apostille': { 
          label: 'Apostille',
          type: 'fixe',
          montant: 50.00
        },
        'consentement_adoption': { 
          label: 'Consentement à adoption',
          type: 'fixe',
          montant: 76.92
        }
      }
    }
  };

  // ============================================================================
  // CALCUL DES ÉMOLUMENTS CORRIGÉ AVEC MAJORATION DOM-TOM
  // ============================================================================
  
  const calculerEmoluments = (montant: number, tranches: TrancheTarif[]) => {
    // Étape 1: Calcul des émoluments bruts
    let emolumentsBruts = 0;
    
    tranches.forEach(tranche => {
      if (montant > tranche.min) {
        const montantDansTranche = Math.min(montant - tranche.min, tranche.max - tranche.min);
        emolumentsBruts += montantDansTranche * (tranche.taux / 100);
      }
    });

    // Étape 2: Application majoration DOM-TOM (AVANT remises)
    const tauxMajoration = getMajorationDOMTOM(selectedDepartement);
    const majoration = emolumentsBruts * (tauxMajoration / 100);
    const emolumentsAvantRemise = emolumentsBruts + majoration;

    // Étape 3: Application des remises Table 5 (Article A444-174)
    let remise10 = 0;
    let remise20 = 0;
    let emolumentsNets = emolumentsAvantRemise;
    
    if (montant > 150000) {
      let emolumentsAuDela150k = 0;
      
      tranches.forEach(tranche => {
        if (150000 < tranche.max) {
          const debut = Math.max(150000, tranche.min);
          const fin = montant > tranche.max ? tranche.max : montant;
          if (fin > debut) {
            emolumentsAuDela150k += (fin - debut) * (tranche.taux / 100);
          }
        }
      });
      
      const majorationAuDela150k = emolumentsAuDela150k * (tauxMajoration / 100);
      remise10 = (emolumentsAuDela150k + majorationAuDela150k) * 0.10;
      
      if (montant > 10000000) {
        let emolumentsAuDela10M = 0;
        
        tranches.forEach(tranche => {
          if (10000000 < tranche.max) {
            const debut = Math.max(10000000, tranche.min);
            const fin = montant > tranche.max ? tranche.max : montant;
            if (fin > debut) {
              emolumentsAuDela10M += (fin - debut) * (tranche.taux / 100);
            }
          }
        });
        
        const majorationAuDela10M = emolumentsAuDela10M * (tauxMajoration / 100);
        remise20 = (emolumentsAuDela10M + majorationAuDela10M) * 0.10;
      }
      
      emolumentsNets = emolumentsAvantRemise - remise10 - remise20;
    }
    
    return {
      bruts: emolumentsBruts,
      majoration: majoration,
      avantRemise: emolumentsAvantRemise,
      remise10: remise10,
      remise20: remise20,
      nets: emolumentsNets
    };
  };

  // Calcul des taxes selon le département
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

  // Calcul de la CSI
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
  
  // Fonction de sauvegarde
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
    alert('Calcul sauvegardé dans l\'historique !');
  };
  
  // Fonction d'export PDF améliorée
  const exporterPDF = () => {
    const deptInfo = departements[selectedDepartement];
    const contenu = `
CALCUL DE FRAIS NOTARIÉS - TARIF 2025/2026
==========================================
Date : ${new Date().toLocaleString('fr-FR')}
Département : ${deptInfo?.nom} (${selectedDepartement})
${deptInfo?.majoration > 0 ? `⚠️ TERRITOIRE DOM-TOM - MAJORATION +${deptInfo.majoration}%\n` : ''}
Type d'acte : ${categoriesActes[selectedCategory]?.actes[selectedActe]?.label || 'N/A'}
Montant : ${montantActe} €

DÉTAIL DES ÉMOLUMENTS
=====================
Émoluments bruts : ${emolumentsDetail.bruts.toFixed(2)} €
${emolumentsDetail.majoration > 0 ? `Majoration DOM-TOM (+${deptInfo?.majoration}%) : +${emolumentsDetail.majoration.toFixed(2)} €\n` : ''}
${emolumentsDetail.remise10 > 0 ? `Remise 10% (>150k€) : -${emolumentsDetail.remise10.toFixed(2)} €\n` : ''}
${emolumentsDetail.remise20 > 0 ? `Remise 20% (>10M€) : -${emolumentsDetail.remise20.toFixed(2)} €\n` : ''}
Total HT : ${emolumentsDetail.nets.toFixed(2)} €
TVA (${getTauxTVA(selectedDepartement)}%) : ${(emolumentsDetail.nets * getTauxTVA(selectedDepartement) / 100).toFixed(2)} €
TOTAL TTC : ${totalEmolumentsTTC.toFixed(2)} €

AUTRES FRAIS
============
Débours : ${totalDebours.toFixed(2)} €
  - CSI : ${debours.csi.toFixed(2)} €
Formalités TTC : ${totalFormalitesTTC.toFixed(2)} €
Documents TTC : ${totalDocumentsTTC.toFixed(2)} €
Taxes et droits : ${totalTaxes.toFixed(2)} €
  - Taxe départementale : ${taxes.departementale.toFixed(2)} €
  - Taxe communale : ${taxes.communale.toFixed(2)} €
  - Frais assiette : ${taxes.fraisAssiette.toFixed(2)} €

═══════════════════════════════════════
TOTAL GÉNÉRAL : ${totalGeneral.toFixed(2)} €
═══════════════════════════════════════

Calcul conforme au Décret n°2020-179 du 27 février 2020
${deptInfo?.majoration > 0 ? 'Article A444-176 du Code de commerce (majoration DOM-TOM)\n' : ''}
Tarif applicable : 2025/2026 (inchangé depuis 2020)
    `;
    
    const blob = new Blob([contenu], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcul_notarie_${Date.now()}.txt`;
    a.click();
  };

  // Effet pour recalculer quand les paramètres changent
  useEffect(() => {
    if (selectedActe && montantActe) {
      const montant = parseFloat(montantActe.replace(/\s/g, ''));
      if (!isNaN(montant)) {
        const acte = categoriesActes[selectedCategory]?.actes[selectedActe];
        if (acte) {
          if (acte.type === 'proportionnel' && acte.tranches) {
            const detail = calculerEmoluments(montant, acte.tranches);
            setEmolumentsDetail(detail);
            setEmoluments(detail.nets);
          } else if (acte.type === 'fixe' && acte.montant) {
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
          }
          calculerCSI();
          calculerTaxes();
        }
      }
    }
  }, [selectedActe, montantActe, selectedDepartement, taxes.typeBien, selectedCategory]);

  // Calcul des totaux avec TVA différenciée
  const tauxTVA = getTauxTVA(selectedDepartement);
  const totalEmoluments = emolumentsDetail.nets;
  const montantTVA = totalEmoluments * (tauxTVA / 100);
  const totalEmolumentsTTC = totalEmoluments + montantTVA;
  
  const totalDebours = Object.values(debours).reduce((sum, val) => sum + val, 0);
  
  const totalFormalites = formalites.forfaitBase + formalites.teleactes + 
    (formalites.lettresRecommandees * 1) + formalites.prealables + formalites.posterieures;
  const totalFormalitesTTC = totalFormalites * (1 + tauxTVA / 100);
  
  const fraisRole = documents.pagesActe * 2;
  const copiesExec = documents.copiesExecutoires * 4;
  const copiesAuth = documents.copiesAuthentiques * 40;
  const copiesHypo = documents.copiesHypothecaires * 4;
  const totalDocuments = fraisRole + copiesExec + copiesAuth + copiesHypo;
  const totalDocumentsTTC = totalDocuments * (1 + tauxTVA / 100);
  
  const totalTaxes = taxes.departementale + taxes.communale + taxes.fraisAssiette;
  
  const totalGeneral = totalEmolumentsTTC + totalDebours + totalFormalitesTTC + totalDocumentsTTC + totalTaxes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header avec design unifié */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Calculateur de frais notariés
                  </h1>
                  <p className="text-indigo-600 font-medium">
                    Conforme au tarif réglementé 2025/2026
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                Décret n°2020-179 et arrêtés modificatifs - Calcul instantané et précis
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <p className="text-sm text-indigo-600 font-medium mb-1">Total général</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
            </div>
          </div>

          {/* Sélecteurs principaux avec design amélioré */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Département */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Département
              </label>
              <select
                value={selectedDepartement}
                onChange={(e) => setSelectedDepartement(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
              >
                {Object.entries(departements).map(([code, dept]) => (
                  <option key={code} value={code}>
                    {code} - {dept.nom} ({dept.taux}%)
                    {dept.majoration > 0 && ` • DOM +${dept.majoration}%`}
                    {dept.tauxTVA === 0 && ' • Exo. TVA'}
                    {dept.tauxTVA > 0 && dept.tauxTVA < 20 && ` • TVA ${dept.tauxTVA}%`}
                  </option>
                ))}
              </select>
            </div>

            {/* Catégorie d'acte */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Catégorie d'acte
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedActe('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
              >
                <option value="">Sélectionnez une catégorie...</option>
                {Object.entries(categoriesActes).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Type d'acte */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Type d'acte
              </label>
              <select
                value={selectedActe}
                onChange={(e) => setSelectedActe(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white disabled:bg-gray-100"
              >
                <option value="">Sélectionnez un acte...</option>
                {selectedCategory && Object.entries(categoriesActes[selectedCategory].actes).map(([key, acte]) => (
                  <option key={key} value={key}>{acte.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Montant de l'acte */}
          {selectedActe && categoriesActes[selectedCategory]?.actes[selectedActe]?.type === 'proportionnel' && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Montant de l'opération
              </label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={montantActe}
                  onChange={(e) => setMontantActe(e.target.value)}
                  placeholder="450 000"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-lg font-medium"
                />
              </div>
            </div>
          )}
          
          {/* NOUVEAUTÉ: Bandeau DOM-TOM */}
          {getMajorationDOMTOM(selectedDepartement) > 0 && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Territoire DOM-TOM : {departements[selectedDepartement]?.nom}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    • Majoration des émoluments : <strong>+{getMajorationDOMTOM(selectedDepartement)}%</strong> (Article A444-176 du Code de commerce)
                    <br />
                    • TVA : <strong>{getTauxTVA(selectedDepartement)}%</strong>
                    {getTauxTVA(selectedDepartement) === 0 && <span> - EXONÉRÉ (Article 294 CGI)</span>}
                    {getTauxTVA(selectedDepartement) > 0 && getTauxTVA(selectedDepartement) < 20 && <span> (taux réduit au lieu de 20%)</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Section spéciale pour les donations (CONSERVÉE INTÉGRALEMENT) */}
          {selectedCategory === 'successions' && (selectedActe === 'donation' || selectedActe === 'donation_partage') && (
            <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-6 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Configuration de la donation
              </h3>
              
              {/* Donateurs multiples */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">Donateurs</label>
                  <button
                    onClick={ajouterDonateur}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un donateur
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
                      placeholder="Nom du donateur"
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
                <div className="text-xs text-gray-600 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="w-4 h-4 inline mr-1" />
                  Abattements 2024 : Parent→Enfant: 100 000€ | Époux: 80 724€ | Grand-parent: 31 865€
                </div>
              </div>
              
              {/* Donataires pour donation-partage */}
              {selectedActe === 'donation_partage' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">Donataires</label>
                    <button
                      onClick={ajouterDonataire}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un donataire
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
                        placeholder="Nom du donataire"
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
              
              {/* Usufruit */}
              <div className="mt-6">
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={usufruit.actif}
                    onChange={(e) => setUsufruit({...usufruit, actif: e.target.checked})}
                    className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Donation avec réserve d'usufruit</span>
                </label>
                {usufruit.actif && (
                  <div className="ml-7 mt-3 p-4 bg-white rounded-lg border border-gray-200">
                    <label className="block text-sm text-gray-600 mb-2">
                      Âge de l'usufruitier
                    </label>
                    <input
                      type="number"
                      value={usufruit.ageUsufruitier}
                      onChange={(e) => {
                        const age = e.target.value;
                        setUsufruit({
                          ...usufruit,
                          ageUsufruitier: age,
                          valeur: calculerUsufruit(age)
                        });
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="20"
                      max="100"
                    />
                    {usufruit.ageUsufruitier && (
                      <p className="text-xs text-gray-600 mt-2">
                        Valeur de l'usufruit : {usufruit.valeur}% | Nue-propriété : {100 - usufruit.valeur}%
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Boutons d'action avec design unifié */}
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={sauvegarderCalcul}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={exporterPDF}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
            <button
              onClick={() => setAfficherHistorique(!afficherHistorique)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <History className="w-4 h-4" />
              Historique ({historiqueCalculs.length})
            </button>
          </div>
        </div>
        
        {/* Section Historique */}
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
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{calcul.total.toFixed(2)} €</p>
                      <button
                        onClick={() => alert('Fonction de rechargement à implémenter')}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1 hover:underline"
                      >
                        Recharger
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs avec design unifié */}
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
                  {tab.id === 'emoluments' && emoluments > 0 && (
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-semibold">
                      {totalEmolumentsTTC.toFixed(2)}€
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content complet */}
          <div className="p-6">
            {activeTab === 'emoluments' && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-blue-900">
                        Les émoluments sont calculés selon les tranches réglementaires.
                        Les remises de la Table 5 (10% au-delà de 150 000€, 20% au-delà de 10M€) sont appliquées automatiquement.
                      </p>
                      {getMajorationDOMTOM(selectedDepartement) > 0 && (
                        <p className="text-sm text-blue-900 mt-2 font-medium">
                          ⚠️ Majoration DOM-TOM de {getMajorationDOMTOM(selectedDepartement)}% appliquée (Article A444-176)
                        </p>
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
                  
                  {emolumentsDetail.remise10 > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-green-600">Remise 10% (au-delà 150k€)</span>
                      <span className="text-green-600 text-lg">-{emolumentsDetail.remise10.toFixed(2)} €</span>
                    </div>
                  )}
                  
                  {emolumentsDetail.remise20 > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-green-600">Remise 20% (au-delà 10M€)</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Formalités obligatoires</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Forfait de base</span>
                        <span className="font-medium">{formalites.forfaitBase.toFixed(2)} €</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Téléactes</span>
                        <span className="font-medium">{formalites.teleactes.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Frais complémentaires</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Lettres recommandées</span>
                        <span className="font-medium">{formalites.lettresRecommandees.toFixed(2)} €</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Formalités préalables</span>
                        <span className="font-medium">{formalites.prealables.toFixed(2)} €</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Formalités postérieures</span>
                        <span className="font-medium">{formalites.posterieures.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">
                      Total TTC (TVA {tauxTVA}%)
                      {tauxTVA === 0 && <span className="text-sm font-normal text-gray-600"> - Exonéré</span>}
                    </span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {totalFormalitesTTC.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Configuration des documents</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de pages de l'acte
                      </label>
                      <input
                        type="number"
                        value={documents.pagesActe}
                        onChange={(e) => setDocuments(prev => ({ ...prev, pagesActe: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Frais de rôle : {(documents.pagesActe * 2).toFixed(2)} € (2 € par page)
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Copies exécutoires
                      </label>
                      <input
                        type="number"
                        value={documents.copiesExecutoires}
                        onChange={(e) => setDocuments(prev => ({ ...prev, copiesExecutoires: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        4 € par copie
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Copies authentiques
                      </label>
                      <input
                        type="number"
                        value={documents.copiesAuthentiques}
                        onChange={(e) => setDocuments(prev => ({ ...prev, copiesAuthentiques: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        40 € par copie
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Copies hypothécaires
                      </label>
                      <input
                        type="number"
                        value={documents.copiesHypothecaires}
                        onChange={(e) => setDocuments(prev => ({ ...prev, copiesHypothecaires: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        4 € par copie
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">
                      Total TTC (TVA {tauxTVA}%)
                      {tauxTVA === 0 && <span className="text-sm font-normal text-gray-600"> - Exonéré</span>}
                    </span>
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

        {/* Récapitulatif avec design unifié */}
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
                {totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          {/* Indication de conformité */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start">
              <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Calcul conforme au tarif réglementé 2025/2026
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Décret n°2020-179 du 27 février 2020 et arrêtés modificatifs
                  {getMajorationDOMTOM(selectedDepartement) > 0 && 
                    ` • Article A444-176 (majoration DOM-TOM +${getMajorationDOMTOM(selectedDepartement)}%)`
                  }
                  {' • TVA '}
                  {getTauxTVA(selectedDepartement)}%
                  {getTauxTVA(selectedDepartement) === 0 && ' (exonéré - Art. 294 CGI)'}
                  {getTauxTVA(selectedDepartement) > 0 && getTauxTVA(selectedDepartement) < 20 && ' (taux réduit)'}
                </p>
              </div>
            </div>
          </div>
        </div>
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