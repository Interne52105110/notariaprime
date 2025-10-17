// src\app\pretaxe\page.tsx

"use client";

import MainLayout from '@/components/MainLayout';
import React, { useState, useEffect } from 'react';
import { 
  Calculator, FileText, Euro, Building, Users, Home,
  FileSignature, Landmark, Briefcase, File,
  AlertCircle, MapPin, Download, Save, History, FileEdit,
  Plus, Minus, UserPlus, X
} from 'lucide-react';
import { actesConfig, configParDefaut } from '@/config/actesConfig';
import {
  departements,
  CategorieActes,
  Donateur,
  Donataire,
  HistoriqueCalcul,
  Usufruit
} from './PretaxeTypes';
import {
  getTauxTVA,
  getMajorationDOMTOM,
  calculerEmoluments,
  calculerTaxes,
  calculerCSI,
  calculerUsufruit,
  appliquerConfigParDefaut,
  exporterPDF
} from './PretaxeCalculations';
import EmolumentsTab from './EmolumentsTab';
import DeboursTab from './DeboursTab';
import FormalitesTab from './FormalitesTab';
import DocumentsTab from './DocumentsTab';
import TaxesTab from './TaxesTab';
import RecapitulatifTab from './RecapitulatifTab';

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
  const [usufruit, setUsufruit] = useState<Usufruit>({
    actif: false,
    ageUsufruitier: '',
    valeur: 0
  });
  
  // États pour l'historique
  const [historiqueCalculs, setHistoriqueCalculs] = useState<HistoriqueCalcul[]>([]);
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  
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

  // useEffect pour appliquer la config automatiquement
  useEffect(() => {
    if (selectedActe) {
      appliquerConfigParDefaut(selectedActe, setDebours, setFormalites, setDocuments, setTaxes);
      
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
            const detail = calculerEmoluments(montant, acte.tranches, selectedDepartement, appliquerRemise);
            setEmolumentsDetail(detail);
            setEmoluments(detail.nets);
            calculerCSI(montantActe, setDebours);
            calculerTaxes(montantActe, selectedDepartement, taxes.typeBien, setTaxes);
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
              onClick={() => exporterPDF(
                selectedDepartement,
                selectedCategory,
                selectedActe,
                montantActe,
                emolumentsDetail,
                totalEmolumentsTTC,
                debours,
                totalDebours,
                totalFormalitesTTC,
                totalDocumentsTTC,
                taxes,
                totalTaxes,
                totalGeneral,
                appliquerRemise,
                categoriesActes
              )}
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
              onClick={() => appliquerConfigParDefaut(selectedActe, setDebours, setFormalites, setDocuments, setTaxes)}
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
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                <nav className="flex space-x-2 px-6 py-3" aria-label="Tabs">
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
                      className={`px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all transform ${
                        activeTab === tab.id
                          ? 'bg-white text-indigo-600 shadow-md scale-105 border-2 border-indigo-500'
                          : 'text-gray-600 hover:bg-white/50 hover:text-indigo-600 hover:scale-102'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : ''}`} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'emoluments' && (
                  <EmolumentsTab
                    emolumentsDetail={emolumentsDetail}
                    totalEmoluments={totalEmoluments}
                    montantTVA={montantTVA}
                    totalEmolumentsTTC={totalEmolumentsTTC}
                    tauxTVA={tauxTVA}
                    selectedDepartement={selectedDepartement}
                    montantActe={montantActe}
                    appliquerRemise={appliquerRemise}
                    setAppliquerRemise={setAppliquerRemise}
                  />
                )}

                {activeTab === 'debours' && (
                  <DeboursTab
                    debours={debours}
                    totalDebours={totalDebours}
                  />
                )}

                {activeTab === 'formalites' && (
                  <FormalitesTab
                    formalites={formalites}
                    setFormalites={setFormalites}
                    totalFormalitesTTC={totalFormalitesTTC}
                    tauxTVA={tauxTVA}
                    selectedActe={selectedActe}
                  />
                )}

                {activeTab === 'documents' && (
                  <DocumentsTab
                    documents={documents}
                    setDocuments={setDocuments}
                    totalDocumentsTTC={totalDocumentsTTC}
                    tauxTVA={tauxTVA}
                  />
                )}

                {activeTab === 'taxes' && (
                  <TaxesTab
                    taxes={taxes}
                    setTaxes={setTaxes}
                    totalTaxes={totalTaxes}
                    selectedDepartement={selectedDepartement}
                  />
                )}
              </div>
            </div>

            <RecapitulatifTab
              totalEmolumentsTTC={totalEmolumentsTTC}
              totalDebours={totalDebours}
              totalFormalitesTTC={totalFormalitesTTC}
              totalDocumentsTTC={totalDocumentsTTC}
              totalTaxes={totalTaxes}
              totalGeneral={totalGeneral}
              selectedDepartement={selectedDepartement}
              appliquerRemise={appliquerRemise}
            />
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