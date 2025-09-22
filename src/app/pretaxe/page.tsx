"use client";

import Layout from '@/components/Layout';
import React, { useState, useEffect } from 'react';
import { 
  Calculator, FileText, Euro, Building, Users, Home,
  FileSignature, Landmark, Briefcase, File, ChevronDown,
  Info, Check, X, AlertCircle, HelpCircle, MapPin,
  Download, Save, History, Plus, Minus, UserPlus
} from 'lucide-react';

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

export default function PretaxeIntelligente() {
  // États principaux
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedActe, setSelectedActe] = useState('');
  const [montantActe, setMontantActe] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('75');
  const [activeTab, setActiveTab] = useState('emoluments');
  
  // États pour les calculs
  const [emoluments, setEmoluments] = useState(0);
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
  const calculerUsufruit = (age) => {
    const ageNum = parseInt(age);
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

  const departements = {
    '01': { nom: 'Ain', taux: 4.50 },
    '02': { nom: 'Aisne', taux: 4.50 },
    '03': { nom: 'Allier', taux: 4.50 },
    '04': { nom: 'Alpes-de-Haute-Provence', taux: 4.50 },
    '05': { nom: 'Hautes-Alpes', taux: 4.50 },
    '06': { nom: 'Alpes-Maritimes', taux: 4.50 },
    '07': { nom: 'Ardèche', taux: 4.50 },
    '08': { nom: 'Ardennes', taux: 4.50 },
    '09': { nom: 'Ariège', taux: 4.50 },
    '10': { nom: 'Aube', taux: 4.50 },
    '11': { nom: 'Aude', taux: 4.50 },
    '12': { nom: 'Aveyron', taux: 4.50 },
    '13': { nom: 'Bouches-du-Rhône', taux: 4.50 },
    '14': { nom: 'Calvados', taux: 4.50 },
    '15': { nom: 'Cantal', taux: 4.50 },
    '16': { nom: 'Charente', taux: 4.50 },
    '17': { nom: 'Charente-Maritime', taux: 4.50 },
    '18': { nom: 'Cher', taux: 4.50 },
    '19': { nom: 'Corrèze', taux: 4.50 },
    '21': { nom: 'Côte-d\'Or', taux: 4.50 },
    '22': { nom: 'Côtes-d\'Armor', taux: 4.50 },
    '23': { nom: 'Creuse', taux: 4.50 },
    '24': { nom: 'Dordogne', taux: 4.50 },
    '25': { nom: 'Doubs', taux: 4.50 },
    '26': { nom: 'Drôme', taux: 4.50 },
    '27': { nom: 'Eure', taux: 4.50 },
    '28': { nom: 'Eure-et-Loir', taux: 4.50 },
    '29': { nom: 'Finistère', taux: 4.50 },
    '2A': { nom: 'Corse-du-Sud', taux: 4.50 },
    '2B': { nom: 'Haute-Corse', taux: 4.50 },
    '30': { nom: 'Gard', taux: 4.50 },
    '31': { nom: 'Haute-Garonne', taux: 4.50 },
    '32': { nom: 'Gers', taux: 4.50 },
    '33': { nom: 'Gironde', taux: 4.50 },
    '34': { nom: 'Hérault', taux: 4.50 },
    '35': { nom: 'Ille-et-Vilaine', taux: 4.50 },
    '36': { nom: 'Indre', taux: 4.50 },
    '37': { nom: 'Indre-et-Loire', taux: 4.50 },
    '38': { nom: 'Isère', taux: 3.80 },
    '39': { nom: 'Jura', taux: 4.50 },
    '40': { nom: 'Landes', taux: 4.50 },
    '41': { nom: 'Loir-et-Cher', taux: 4.50 },
    '42': { nom: 'Loire', taux: 4.50 },
    '43': { nom: 'Haute-Loire', taux: 4.50 },
    '44': { nom: 'Loire-Atlantique', taux: 4.50 },
    '45': { nom: 'Loiret', taux: 4.50 },
    '46': { nom: 'Lot', taux: 4.50 },
    '47': { nom: 'Lot-et-Garonne', taux: 4.50 },
    '48': { nom: 'Lozère', taux: 4.50 },
    '49': { nom: 'Maine-et-Loire', taux: 4.50 },
    '50': { nom: 'Manche', taux: 4.50 },
    '51': { nom: 'Marne', taux: 4.50 },
    '52': { nom: 'Haute-Marne', taux: 4.50 },
    '53': { nom: 'Mayenne', taux: 4.50 },
    '54': { nom: 'Meurthe-et-Moselle', taux: 4.50 },
    '55': { nom: 'Meuse', taux: 4.50 },
    '56': { nom: 'Morbihan', taux: 3.80 },
    '57': { nom: 'Moselle', taux: 4.50 },
    '58': { nom: 'Nièvre', taux: 4.50 },
    '59': { nom: 'Nord', taux: 4.50 },
    '60': { nom: 'Oise', taux: 4.50 },
    '61': { nom: 'Orne', taux: 4.50 },
    '62': { nom: 'Pas-de-Calais', taux: 4.50 },
    '63': { nom: 'Puy-de-Dôme', taux: 4.50 },
    '64': { nom: 'Pyrénées-Atlantiques', taux: 4.50 },
    '65': { nom: 'Hautes-Pyrénées', taux: 4.50 },
    '66': { nom: 'Pyrénées-Orientales', taux: 4.50 },
    '67': { nom: 'Bas-Rhin', taux: 4.50 },
    '68': { nom: 'Haut-Rhin', taux: 4.50 },
    '69': { nom: 'Rhône', taux: 4.50 },
    '70': { nom: 'Haute-Saône', taux: 4.50 },
    '71': { nom: 'Saône-et-Loire', taux: 4.50 },
    '72': { nom: 'Sarthe', taux: 4.50 },
    '73': { nom: 'Savoie', taux: 4.50 },
    '74': { nom: 'Haute-Savoie', taux: 4.50 },
    '75': { nom: 'Paris', taux: 4.50 },
    '76': { nom: 'Seine-Maritime', taux: 4.50 },
    '77': { nom: 'Seine-et-Marne', taux: 4.50 },
    '78': { nom: 'Yvelines', taux: 4.50 },
    '79': { nom: 'Deux-Sèvres', taux: 4.50 },
    '80': { nom: 'Somme', taux: 4.50 },
    '81': { nom: 'Tarn', taux: 4.50 },
    '82': { nom: 'Tarn-et-Garonne', taux: 4.50 },
    '83': { nom: 'Var', taux: 4.50 },
    '84': { nom: 'Vaucluse', taux: 4.50 },
    '85': { nom: 'Vendée', taux: 4.50 },
    '86': { nom: 'Vienne', taux: 4.50 },
    '87': { nom: 'Haute-Vienne', taux: 4.50 },
    '88': { nom: 'Vosges', taux: 4.50 },
    '89': { nom: 'Yonne', taux: 4.50 },
    '90': { nom: 'Territoire de Belfort', taux: 4.50 },
    '91': { nom: 'Essonne', taux: 4.50 },
    '92': { nom: 'Hauts-de-Seine', taux: 4.50 },
    '93': { nom: 'Seine-Saint-Denis', taux: 4.50 },
    '94': { nom: 'Val-de-Marne', taux: 4.50 },
    '95': { nom: 'Val-d\'Oise', taux: 4.50 },
    '971': { nom: 'Guadeloupe', taux: 4.50 },
    '972': { nom: 'Martinique', taux: 4.50 },
    '973': { nom: 'Guyane', taux: 4.50 },
    '974': { nom: 'La Réunion', taux: 4.50 },
    '976': { nom: 'Mayotte', taux: 3.80 }
  };

  // Catégories et actes selon l'Annexe 4-7 du Code de commerce
  const categoriesActes = {
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

  // Calcul des émoluments avec application des remises Table 5
  const calculerEmoluments = (montant, tranches) => {
    let emolumentsBruts = 0;
    
    tranches.forEach(tranche => {
      if (montant > tranche.min) {
        const montantDansTranche = Math.min(montant - tranche.min, tranche.max - tranche.min);
        emolumentsBruts += montantDansTranche * (tranche.taux / 100);
      }
    });

    // Application des remises (Table 5 - Article A444-174)
    let emolumentsNets = emolumentsBruts;
    
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
      
      const remise10 = emolumentsAuDela150k * 0.10;
      
      let remise20 = 0;
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
        
        remise20 = emolumentsAuDela10M * 0.10;
      }
      
      emolumentsNets = emolumentsBruts - remise10 - remise20;
    }
    
    return emolumentsNets;
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
    const nouveauCalcul = {
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
  
  // Fonction d'export PDF simplifiée
  const exporterPDF = () => {
    const contenu = `
CALCUL DE FRAIS NOTARIÉS
========================
Date : ${new Date().toLocaleString('fr-FR')}
Département : ${departements[selectedDepartement]?.nom}
Type d'acte : ${categoriesActes[selectedCategory]?.actes[selectedActe]?.label || 'N/A'}
Montant : ${montantActe} €

DÉTAIL DES FRAIS
================
Émoluments TTC : ${totalEmolumentsTTC.toFixed(2)} €
Débours : ${totalDebours.toFixed(2)} €
Formalités TTC : ${totalFormalitesTTC.toFixed(2)} €
Documents TTC : ${totalDocumentsTTC.toFixed(2)} €
Taxes et droits : ${totalTaxes.toFixed(2)} €

TOTAL GÉNÉRAL : ${totalGeneral.toFixed(2)} €
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
          if (acte.type === 'proportionnel') {
            setEmoluments(calculerEmoluments(montant, acte.tranches));
          } else {
            setEmoluments(acte.montant);
          }
          calculerCSI();
          calculerTaxes();
        }
      }
    }
  }, [selectedActe, montantActe, selectedDepartement, taxes.typeBien]);

  // Calcul des totaux
  const totalEmoluments = emoluments;
  const totalEmolumentsTTC = totalEmoluments * 1.20;
  
  const totalDebours = Object.values(debours).reduce((sum, val) => sum + val, 0);
  
  const totalFormalites = formalites.forfaitBase + formalites.teleactes + 
    (formalites.lettresRecommandees * 1) + formalites.prealables + formalites.posterieures;
  const totalFormalitesTTC = totalFormalites * 1.20;
  
  const fraisRole = documents.pagesActe * 2;
  const copiesExec = documents.copiesExecutoires * 4;
  const copiesAuth = documents.copiesAuthentiques * 40;
  const copiesHypo = documents.copiesHypothecaires * 4;
  const totalDocuments = fraisRole + copiesExec + copiesAuth + copiesHypo;
  const totalDocumentsTTC = totalDocuments * 1.20;
  
  const totalTaxes = taxes.departementale + taxes.communale + taxes.fraisAssiette;
  
  const totalGeneral = totalEmolumentsTTC + totalDebours + totalFormalitesTTC + totalDocumentsTTC + totalTaxes;

  return (
    <Layout>
      <div className="bg-white text-black">
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Calculator className="w-8 h-8 mr-3 text-indigo-600" />
                    Calculateur de frais notariés
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Conforme au tarif réglementé 2024 - Décret n°2020-179 et arrêtés modificatifs
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total général</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>

              {/* Sélecteurs principaux */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Département */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Département
                  </label>
                  <select
                    value={selectedDepartement}
                    onChange={(e) => setSelectedDepartement(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(departements).map(([code, dept]) => (
                      <option key={code} value={code}>
                        {code} - {dept.nom} ({dept.taux}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Catégorie d'acte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie d'acte
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedActe('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionnez une catégorie...</option>
                    {Object.entries(categoriesActes).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Type d'acte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'acte
                  </label>
                  <select
                    value={selectedActe}
                    onChange={(e) => setSelectedActe(e.target.value)}
                    disabled={!selectedCategory}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant de l'opération
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={montantActe}
                      onChange={(e) => setMontantActe(e.target.value)}
                      placeholder="450 000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
              
              {/* Section spéciale pour les donations */}
              {selectedCategory === 'successions' && (selectedActe === 'donation' || selectedActe === 'donation_partage') && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Configuration de la donation
                  </h3>
                  
                  {/* Donateurs multiples */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Donateurs</label>
                      <button
                        onClick={ajouterDonateur}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter un donateur
                      </button>
                    </div>
                    {donateurs.map((donateur) => (
                      <div key={donateur.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={donateur.nom}
                          onChange={(e) => {
                            setDonateurs(donateurs.map(d => 
                              d.id === donateur.id ? {...d, nom: e.target.value} : d
                            ));
                          }}
                          placeholder="Nom du donateur"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <select
                          value={donateur.lien}
                          onChange={(e) => {
                            setDonateurs(donateurs.map(d => 
                              d.id === donateur.id ? {...d, lien: e.target.value} : d
                            ));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="parent">Parent</option>
                          <option value="grand-parent">Grand-parent</option>
                          <option value="epoux">Époux</option>
                          <option value="autre">Autre</option>
                        </select>
                        {donateurs.length > 1 && (
                          <button
                            onClick={() => supprimerDonateur(donateur.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-gray-600 mt-2">
                      ℹ️ Abattements 2024 : Parent→Enfant: 100 000€ | Époux: 80 724€ | Grand-parent: 31 865€
                    </p>
                  </div>
                  
                  {/* Donataires pour donation-partage */}
                  {selectedActe === 'donation_partage' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Donataires</label>
                        <button
                          onClick={ajouterDonataire}
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter un donataire
                        </button>
                      </div>
                      {donataires.map((donataire) => (
                        <div key={donataire.id} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={donataire.nom}
                            onChange={(e) => {
                              setDonataires(donataires.map(d => 
                                d.id === donataire.id ? {...d, nom: e.target.value} : d
                              ));
                            }}
                            placeholder="Nom du donataire"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <span className="ml-1 text-sm">%</span>
                          </div>
                          {donataires.length > 1 && (
                            <button
                              onClick={() => supprimerDonataire(donataire.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Usufruit */}
                  <div className="mt-4">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={usufruit.actif}
                        onChange={(e) => setUsufruit({...usufruit, actif: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Donation avec réserve d'usufruit</span>
                    </label>
                    {usufruit.actif && (
                      <div className="ml-6 mt-2">
                        <label className="block text-sm text-gray-600 mb-1">
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
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          min="20"
                          max="100"
                        />
                        {usufruit.ageUsufruitier && (
                          <p className="text-xs text-gray-600 mt-1">
                            Valeur de l'usufruit : {usufruit.valeur}% | Nue-propriété : {100 - usufruit.valeur}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={sauvegarderCalcul}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </button>
                <button
                  onClick={exporterPDF}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter PDF
                </button>
                <button
                  onClick={() => setAfficherHistorique(!afficherHistorique)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <History className="w-4 h-4 mr-2" />
                  Historique ({historiqueCalculs.length})
                </button>
              </div>
            </div>
            
            {/* Section Historique */}
            {afficherHistorique && historiqueCalculs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Historique des calculs</h2>
                  <button
                    onClick={() => setAfficherHistorique(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {historiqueCalculs.map((calcul) => (
                    <div key={calcul.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{calcul.acte}</p>
                          <p className="text-sm text-gray-600">{calcul.date}</p>
                          <p className="text-sm text-gray-600">Montant : {calcul.montant} €</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600">{calcul.total.toFixed(2)} €</p>
                          <button
                            onClick={() => {
                              alert('Fonction de rechargement à implémenter');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1"
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

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm">
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
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                      {tab.id === 'emoluments' && emoluments > 0 && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                          {totalEmolumentsTTC.toFixed(2)}€
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'emoluments' && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                        <p className="text-sm text-blue-900">
                          Les émoluments sont calculés selon les tranches réglementaires.
                          Les remises de la Table 5 (10% au-delà de 150 000€, 20% au-delà de 10M€) sont appliquées automatiquement.
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total HT</span>
                        <span className="font-semibold">{totalEmoluments.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">TVA (20%)</span>
                        <span>{(totalEmoluments * 0.20).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span className="font-semibold">Total TTC</span>
                        <span className="font-bold text-lg text-indigo-600">
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
                      <div className="ml-6 bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Montant calculé: {debours.csi.toFixed(2)} €</p>
                        <p className="text-xs text-gray-500 mt-1">0,1% du prix avec minimum 15€</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total débours</span>
                        <span className="font-bold text-lg text-indigo-600">{totalDebours.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'formalites' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Forfait de base</span>
                        <span className="font-medium">{formalites.forfaitBase.toFixed(2)} €</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Téléactes</span>
                        <span className="font-medium">{formalites.teleactes.toFixed(2)} €</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total TTC</span>
                        <span className="font-bold text-lg text-indigo-600">{totalFormalitesTTC.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de pages de l'acte
                      </label>
                      <input
                        type="number"
                        value={documents.pagesActe}
                        onChange={(e) => setDocuments(prev => ({ ...prev, pagesActe: parseInt(e.target.value) || 0 }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Frais de rôle : {(documents.pagesActe * 2).toFixed(2)} € (2 € par page)
                      </p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total TTC</span>
                        <span className="font-bold text-lg text-indigo-600">{totalDocumentsTTC.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'taxes' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Type de bien</h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="ancien"
                            checked={taxes.typeBien === 'ancien'}
                            onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
                            className="mr-2"
                          />
                          <span>Ancien</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="neuf"
                            checked={taxes.typeBien === 'neuf'}
                            onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
                            className="mr-2"
                          />
                          <span>Neuf (VEFA)</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total des taxes</span>
                        <span className="font-bold text-lg text-indigo-600">{totalTaxes.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Récapitulatif */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Émoluments TTC</span>
                  <span className="font-medium">{totalEmolumentsTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Débours</span>
                  <span className="font-medium">{totalDebours.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Formalités TTC</span>
                  <span className="font-medium">{totalFormalitesTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Documents TTC</span>
                  <span className="font-medium">{totalDocumentsTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Taxes et droits</span>
                  <span className="font-medium">{totalTaxes.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold">TOTAL GÉNÉRAL</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </div>
          </div>  {/* Fermeture de max-w-7xl mx-auto */}
        </div>  {/* Fermeture de min-h-screen bg-gray-50 p-4 */}
      </div>  {/* Fermeture de bg-white text-black */}
    </Layout>
  );
}