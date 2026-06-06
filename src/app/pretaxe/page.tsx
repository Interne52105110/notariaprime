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
  Usufruit,
  Taxes,
  Documents,
  Formalites
} from './PretaxeTypes';
import {
  getTauxTVA,
  getMajorationDOMTOM,
  calculerEmoluments,
  calculerTaxes,
  calculerCSI,
  calculerTPF,
  calculerDroitPartage,
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
import OCRScanner from './OCRScanner';

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
        label: 'Licitation (gré à gré, cessant l\'indivision)',
        type: 'proportionnel',
        // A444-87 1°a : licitation de gré à gré faisant cesser l'indivision.
        // Autres cas : part acquise 3,870/1,596/1,064/0,798 (1°b) ;
        // adjudication volontaire 7,740/3,193/2,128/1,596 (2°).
        tranches: [
          { min: 0, max: 6500, taux: 2.580 },
          { min: 6500, max: 17000, taux: 1.064 },
          { min: 17000, max: 60000, taux: 0.709 },
          { min: 60000, max: Infinity, taux: 0.532 }
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
        label: 'Bail à construction (composante principale)',
        type: 'proportionnel',
        // A444-104 : émolument composite. Composante 1° (versements des 5
        // premières années + valeur des constructions remises). S'y ajoutent
        // la composante 2° (1,258/0,692/0,472/0,346) et la 3° valeur résiduelle
        // (2,322/1,277/0,871/0,639), non gérées ici.
        tranches: [
          { min: 0, max: 6500, taux: 3.289 },
          { min: 6500, max: 17000, taux: 1.809 },
          { min: 17000, max: 30000, taux: 1.234 },
          { min: 30000, max: Infinity, taux: 0.905 }
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
        label: 'Contrat de mariage (valeur > 30 800 €)',
        type: 'proportionnel',
        droitFixeEnreg: 125, // CGI art. 847 1° (minimum de perception)
        // A444-82 2° : au-delà de 30 800 €. En deçà : émolument fixe 188,68 €.
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      },
      'changement_regime': {
        label: 'Changement de régime matrimonial (valeur > 30 800 €)',
        type: 'proportionnel',
        droitFixeEnreg: 125, // CGI art. 847 1°
        // A444-82 : même barème que le contrat de mariage.
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
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
        montant: 113.19,
        droitFixeEnreg: 125 // CGI art. 848 5° (libéralités à cause de mort)
      },
      'notoriete': {
        label: 'Acte de notoriété',
        type: 'fixe',
        montant: 56.60,
        droitFixeEnreg: 25 // CGI art. 846 bis (notoriété autre qu'usucapion)
      },
      'attestation_propriete': {
        label: 'Attestation de propriété immobilière',
        type: 'proportionnel',
        droitFixeEnreg: 125, // CGI art. 680 (attestation après décès)
        // A444-59 : attestation notariée (paliers à 30 000 €).
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 1.064 },
          { min: 17000, max: 30000, taux: 0.726 },
          { min: 30000, max: Infinity, taux: 0.532 }
        ]
      },
      'inventaire': {
        label: 'Inventaire successoral',
        type: 'fixe',
        // A444-155 : acte d'inventaire = émolument fixe.
        montant: 75.46,
        droitFixeEnreg: 125 // CGI art. 848 2° (par vacation)
      },
      'renonciation': {
        label: 'Renonciation à succession (pure et simple)',
        type: 'fixe',
        montant: 57.69,
        droitFixeEnreg: 125 // CGI art. 847 2° (renonciation pure et simple)
      },
      'declaration_succession': {
        label: 'Déclaration de succession',
        type: 'proportionnel',
        // A444-63 : sur l'actif brut total.
        tranches: [
          { min: 0, max: 6500, taux: 1.548 },
          { min: 6500, max: 17000, taux: 0.851 },
          { min: 17000, max: 30000, taux: 0.580 },
          { min: 30000, max: Infinity, taux: 0.426 }
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
        // A444-143 : prêt, obligation, ouverture de crédit.
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      },
      'pret_viager': {
        label: 'Prêt viager hypothécaire',
        type: 'proportionnel',
        // A444-143 (barème des prêts).
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      },
      'mainlevee_saisie': {
        label: 'Mainlevée de saisie',
        type: 'fixe',
        montant: 26.41,
        droitFixeEnreg: 25 // CGI art. 846 bis (mainlevée d'hypothèque)
      },
      'mainlevee_hypo_inf': {
        label: 'Mainlevée hypothèque < 77 090€',
        type: 'fixe',
        montant: 78.00,
        droitFixeEnreg: 25 // CGI art. 846 bis
      },
      'mainlevee_hypo_sup': {
        label: 'Mainlevée hypothèque ≥ 77 090€',
        type: 'fixe',
        montant: 150.00,
        droitFixeEnreg: 25 // CGI art. 846 bis
      },
      'caution_hypothecaire': {
        label: 'Caution / affectation hypothécaire (relatif à l\'acte principal)',
        type: 'proportionnel',
        relatif: true,
        // A444-136 : ¼ (tiers dans l'acte principal), ½ (autres cas) ou
        // totalité (pas d'acte principal) de l'émolument du prêt (A444-143).
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      },
      'ppd': {
        label: 'Privilège de prêteur de deniers (relatif à l\'acte principal)',
        type: 'proportionnel',
        relatif: true,
        // A444-148 (sûreté) : même logique de quotité que la caution.
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      }
    }
  },

  'societes': {
    label: 'Actes relatifs aux sociétés',
    icon: Briefcase,
    actes: {
      'constitution_societe': {
        label: 'Constitution de société — apport en publicité foncière',
        type: 'proportionnel',
        droitFixeSociete: true, // CGI art. 810 : 375 € (<225k) / 500 € (≥225k)
        // A444-158 : en matière de sociétés, actes relatifs à des biens soumis
        // à publicité foncière (apport immobilier). Sans bien immobilier, la
        // constitution relève des honoraires libres.
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 0.798 },
          { min: 17000, max: 60000, taux: 0.532 },
          { min: 60000, max: Infinity, taux: 0.399 }
        ]
      },
      'augmentation_capital': {
        label: 'Augmentation de capital',
        type: 'non_tarife',
        droitFixeSociete: true, // CGI art. 812 : 375 € (<225k) / 500 € (≥225k)
        description: 'Acte de société non réservé : honoraires libres (annexe 4-9, 4° C. com.). Si l\'augmentation porte sur un apport immobilier, l\'émolument A444-158 s\'applique sur la valeur du bien. Droit fixe d\'enregistrement 375/500 € selon le capital (CGI art. 812) ; apports purs et simples enregistrés gratuitement (art. 810).',
        honorairesEstimes: '500-1 500€ HT'
      },
      'cession_parts': {
        label: 'Cession de parts sociales',
        type: 'non_tarife',
        description: 'Honoraires libres (annexe 4-9, 4°). Droit d\'enregistrement (CGI art. 726) : 3 % sur les parts de SARL/SNC après abattement de 23 000 € × (parts cédées / total des parts) ; 0,1 % pour les actions de SA/SAS ; 5 % pour les sociétés à prépondérance immobilière.',
        honorairesEstimes: '300-800€ HT + droit d\'enregistrement'
      },
      'dissolution': {
        label: 'Dissolution de société',
        type: 'non_tarife',
        droitFixeSociete: true, // CGI art. 811 : 375 € (<225k) / 500 € (≥225k) si sans transmission
        description: 'Honoraires libres. Dissolution sans transmission de biens : droit fixe 375/500 € selon le capital (CGI art. 811). En cas de partage de l\'actif, droit de partage 2,50 % (CGI art. 746) et émolument de partage A444-121.',
        honorairesEstimes: '500-1 500€ HT'
      },
      'transformation': {
        label: 'Transformation de société',
        type: 'non_tarife',
        description: 'Acte de société non réservé : honoraires libres (annexe 4-9, 4°). Enregistrement au droit fixe le cas échéant.',
        honorairesEstimes: '500-1 200€ HT'
      }
    }
  },

  'associations': {
    label: 'Actes relatifs aux associations',
    icon: Users,
    actes: {
      'fusion_apport_association_immobilier': {
        label: "Fusion / apport d'association — bien soumis à publicité foncière",
        type: 'proportionnel',
        droitFixeEnreg: 125, // CGI art. 680 : droit fixe pour fusion d'assos non lucratives conforme statuts
        // A444-159 : en matière d'association (n°160 du tableau 5), actes
        // relatifs à des biens faisant l'objet d'une publicité foncière.
        // Barème identique en chiffres au n°54 / A444-91 (ventes), mais base
        // juridique distincte — ne pas substituer les fondements.
        // Sans bien immobilier transféré, l'acte relève des honoraires libres
        // (silence du tarif pour les associations, annexe 4-9 par analogie).
        tranches: [
          { min: 0, max: 6500, taux: 3.870 },
          { min: 6500, max: 17000, taux: 1.596 },
          { min: 17000, max: 60000, taux: 1.064 },
          { min: 60000, max: Infinity, taux: 0.799 }
        ]
      },
      'acte_association_hors_immobilier': {
        label: "Acte d'association sans transfert d'immeuble",
        type: 'non_tarife',
        description: "Honoraires libres (silence du tarif pour les associations, annexe 4-9 par analogie avec les actes de société non immobiliers ; fondement renvoi R.444-3, libre fixation R.444-16). Régime spécial fusions art. 816 CGI inapplicable aux associations (réservé aux personnes morales passibles de l'IS) ; droit fixe d'enregistrement 125 € (art. 680 CGI) pour fusion d'assos non lucratives conforme statuts, sinon DMTG/DMTO selon qualification (vigilance sur la prise en charge d'un passif → risque d'apport à titre onéreux).",
        honorairesEstimes: 'à convenir'
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
        montant: 26.41,
        droitFixeEnreg: 25 // CGI art. 846 bis
      },
      'quittance': {
        label: 'Quittance (pure et simple)',
        type: 'proportionnel',
        // A444-161 1° : quittance pure et simple (paliers à 30 000 €).
        tranches: [
          { min: 0, max: 6500, taux: 1.935 },
          { min: 6500, max: 17000, taux: 1.064 },
          { min: 17000, max: 30000, taux: 0.726 },
          { min: 30000, max: Infinity, taux: 0.532 }
        ]
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

  // Quotité pour les sûretés accessoires (caution, PPD) : ¼ (tiers dans
  // l'acte principal), ½ (autres cas) ou totalité (pas d'acte principal).
  const [quotiteSurete, setQuotiteSurete] = useState(0.5);
  
  const [debours, setDebours] = useState({
    csi: 15,
    etatsHypothecaires: 0,
    cadastre: 0,
    urbanisme: 0
  });
  
  const [formalites, setFormalites] = useState<Formalites>({
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
    teleactes: { actif: false, montant: 50 },
    lettresRecommandees: { actif: false, montant: 7.08 },
    declarationPlusValue: { actif: false, montant: 56.60 }
  });
  
  const [documents, setDocuments] = useState<Documents>({
    pagesActe: 10,
    copiesExecutoires: 0,
    copiesAuthentiques: 1,
    copiesHypothecaires: 0,
    archivageNumerise: true
  });
  
  const [taxes, setTaxes] = useState<Taxes>({
    typeBien: 'ancien',
    departementale: 0,
    communale: 0,
    fraisAssiette: 0,
    primoAccedant: false,
    valeurMobilier: 0,
    accessoiresSurete: 20
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
            const detailBase = calculerEmoluments(montant, acte.tranches, selectedDepartement, appliquerRemise);
            // Sûretés accessoires : l'émolument est une quotité de celui de
            // l'acte principal (A444-127/136/148).
            const r2 = (n: number) => Math.round(n * 100) / 100;
            const detail = acte.relatif
              ? {
                  bruts: r2(detailBase.bruts * quotiteSurete),
                  majoration: r2(detailBase.majoration * quotiteSurete),
                  avantRemise: r2(detailBase.avantRemise * quotiteSurete),
                  remise10: 0,
                  remise20: r2(detailBase.remise20 * quotiteSurete),
                  nets: r2(detailBase.nets * quotiteSurete),
                }
              : detailBase;
            setEmolumentsDetail(detail);
            setEmoluments(detail.nets);
            // Régime de taxe selon le type d'acte
            const configActe = actesConfig[selectedActe];
            const typeTaxe = configActe?.taxes?.type;
            // La CSI n'est due que pour les actes publiés au service de la
            // publicité foncière (CGI art. 879). Sinon elle reste à 0.
            const publie = configActe?.formalites?.publiciteFonciere?.defaut === true;
            if (typeTaxe === 'dmto') {
              calculerCSI(montantActe, setDebours); // publication : CSI 0,10 %
              calculerTaxes(
                montantActe,
                selectedDepartement,
                taxes.typeBien,
                setTaxes,
                taxes.primoAccedant === true,
                Number(taxes.valeurMobilier) || 0
              );
            } else if (typeTaxe === 'tpf') {
              // Assiette d'une sûreté = capital garanti + accessoires (intérêts,
              // frais, indemnités), usuellement +20 % (ou +15 %).
              const accPct = Number(taxes.accessoiresSurete ?? 20);
              const baseSurete = Math.round(montant * (1 + accPct / 100) * 100) / 100;
              calculerCSI(montantActe, setDebours, 0.5, baseSurete); // inscription hypo : CSI 0,05 %
              calculerTPF(montantActe, setTaxes, baseSurete);
            } else if (typeTaxe === 'partage') {
              calculerCSI(montantActe, setDebours); // publication : CSI 0,10 %
              calculerDroitPartage(montantActe, taxes.regimePartage ?? 'standard', setTaxes);
            } else if (publie) {
              calculerCSI(montantActe, setDebours);
            }
          }
        }
      }

      // Droit fixe d'enregistrement (CGI art. 674/680/846 bis/847/848/811…)
      let droitFixe = 0;
      if (acte?.droitFixeSociete) {
        const capital = parseFloat((montantActe || '').replace(/\s/g, ''));
        droitFixe = (!isNaN(capital) && capital >= 225000) ? 500 : 375;
      } else if (acte?.droitFixeEnreg) {
        droitFixe = acte.droitFixeEnreg;
      }
      setTaxes(prev => ({ ...prev, droitFixe }));
    }
  }, [selectedActe, montantActe, selectedDepartement, taxes.typeBien, taxes.primoAccedant, taxes.valeurMobilier, taxes.regimePartage, taxes.accessoiresSurete, selectedCategory, appliquerRemise, quotiteSurete]);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const tauxTVA = getTauxTVA(selectedDepartement);
  const totalEmoluments = round2(emolumentsDetail.nets);
  const montantTVA = round2(totalEmoluments * (tauxTVA / 100));
  const totalEmolumentsTTC = round2(totalEmoluments + montantTVA);

  const totalDebours = round2(Object.values(debours).reduce((sum, val) => sum + val, 0));

  const totalFormalites = round2(
    (formalites.publiciteFonciere.actif ? formalites.publiciteFonciere.montant : 0) +
    (formalites.cadastre.actif ? formalites.cadastre.montant : 0) +
    (formalites.casierJudiciaire.actif ? formalites.casierJudiciaire.montant : 0) +
    (formalites.notification.actif ? formalites.notification.montant : 0) +
    (formalites.mesurage.actif ? formalites.mesurage.montant : 0) +
    Object.values(formalites.diagnostics).reduce((sum, d) => sum + (d.actif ? d.montant : 0), 0) +
    (formalites.transmissionCSN.actif ? formalites.transmissionCSN.montant : 0) +
    (formalites.requisition.actif ? formalites.requisition.montant : 0) +
    (formalites.teleactes.actif ? formalites.teleactes.montant : 0) +
    (formalites.lettresRecommandees.actif ? formalites.lettresRecommandees.montant : 0) +
    (formalites.declarationPlusValue.actif ? formalites.declarationPlusValue.montant : 0)
  );

  const totalFormalitesTTC = round2(totalFormalites * (1 + tauxTVA / 100));

  // Copies authentiques/exécutoires/hypothécaires (A444-172 n°212) : 1,13 €
  // par page délivrée, toutes natures confondues. Archivage numérisé
  // (A444-173 n°214) : 0,19 €/page. Le tarif réglementé ne prévoit pas de
  // « frais de rôle » distinct : seules les copies et l'archivage de l'acte
  // sont facturés à la page (confirmé par les exemples de taxe : copie de
  // 15 pages = 15 × 1,13 = 16,95 €).
  const TARIF_COPIE_PAGE = 1.13;
  const TARIF_ARCHIVAGE_PAGE = 0.19;
  const nbCopies = documents.copiesExecutoires + documents.copiesAuthentiques + documents.copiesHypothecaires;
  const copies = round2(nbCopies * documents.pagesActe * TARIF_COPIE_PAGE);
  const archivage = documents.archivageNumerise ? round2(documents.pagesActe * TARIF_ARCHIVAGE_PAGE) : 0;
  const totalDocuments = round2(copies + archivage);
  const totalDocumentsTTC = round2(totalDocuments * (1 + tauxTVA / 100));

  const totalTaxes = round2(
    taxes.departementale + taxes.communale + taxes.fraisAssiette +
    (taxes.tpf || 0) + (taxes.droitPartage || 0) + (taxes.droitFixe || 0)
  );

  // Écrêtement (art. R.444-6 et A.444-175 du Code de commerce) : pour une
  // mutation immobilière à titre onéreux, la somme des émoluments d'acte et de
  // formalités (nette des remises) ne peut excéder 10 % de la valeur du bien,
  // sans pouvoir être inférieure à 90 €. L'excédent est restitué (émolument
  // d'écrêtement négatif).
  const PLANCHER_ECRETEMENT = 90;
  const montantAssietteActe = parseFloat((montantActe || '').replace(/\s/g, '')) || 0;
  const estMutationEcretable = taxes.typeBien === 'ancien' || taxes.typeBien === 'neuf';
  let ecretementHT = 0;
  if (estMutationEcretable && montantAssietteActe > 0) {
    const plafondEcretement = Math.max(PLANCHER_ECRETEMENT, montantAssietteActe * 0.10);
    const baseEcretable = totalEmoluments + totalFormalites; // HT (acte + formalités)
    if (baseEcretable > plafondEcretement) {
      ecretementHT = round2(baseEcretable - plafondEcretement);
    }
  }
  const ecretementTTC = round2(ecretementHT * (1 + tauxTVA / 100));

  const totalGeneral = round2(totalEmolumentsTTC + totalDebours + totalFormalitesTTC + totalDocumentsTTC + totalTaxes - ecretementTTC);

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
                  <p className="text-indigo-600 font-medium">Conforme tarif réglementé 2026/2028 — Arrêté du 25 février 2026</p>
                </div>
              </div>
            </div>
            {!estActeNonTarife && (
              <div className="text-right">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <p className="text-sm text-indigo-600 font-medium mb-1">Total général</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>
            )}
          </div>

          <OCRScanner
            onExtract={(data) => {
              if (data.departement && departements[data.departement]) {
                setSelectedDepartement(data.departement);
              }
              if (data.categoryKey && categoriesActes[data.categoryKey]) {
                setSelectedCategory(data.categoryKey);
                if (data.acteKey && categoriesActes[data.categoryKey].actes[data.acteKey]) {
                  setSelectedActe(data.acteKey);
                }
              }
              if (data.montant) {
                setMontantActe(data.montant);
              }
              if (data.valeurMobilier != null) {
                setTaxes((prev) => ({ ...prev, valeurMobilier: data.valeurMobilier }));
              }
            }}
          />

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
                    isRelatif={acteActuel?.relatif || false}
                    quotiteSurete={quotiteSurete}
                    setQuotiteSurete={setQuotiteSurete}
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
                    montantActe={montantActe}
                    regimeTaxe={actesConfig[selectedActe]?.taxes?.type || 'aucune'}
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
              ecretementTTC={ecretementTTC}
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