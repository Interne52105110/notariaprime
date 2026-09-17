import type { CategorieActes } from './PretaxeTypes';
import { ACTES_SUCCESSORAUX } from '@/lib/actes-successoraux';
import { ACTES_PRECIS } from './pretaxeAuditRules';
import { FileEdit, Home, Users, FileSignature, Landmark, Briefcase, File } from 'lucide-react';

export const categoriesActes: Record<string, CategorieActes> = {

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
      'partage_indivis': ACTES_PRECIS.partage_indivis,
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
        label: 'Bail à construction (trois composantes)',
        type: 'proportionnel',
        // A444-104 : première composante ; les deux autres sont ajoutées par le calculateur dédié.
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
        label: 'Contrat de mariage',
        type: 'proportionnel',
        // A444-82 2° : au-delà de 30 800 €. En deçà : émolument fixe 188,68 €.
        tranches: [
          { min: 0, max: 6500, taux: 1.290 },
          { min: 6500, max: 17000, taux: 0.532 },
          { min: 17000, max: 60000, taux: 0.355 },
          { min: 60000, max: Infinity, taux: 0.266 }
        ]
      },
      'changement_regime': {
        label: 'Changement de régime matrimonial',
        type: 'proportionnel',
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
        montant: 84.51,
        droitFixeEnreg: 125 // CGI 680
      },
      'divorce_consentement': {
        label: 'Dépôt convention divorce par consentement mutuel',
        type: 'fixe',
        montant: 41.20
      },
      'liquidation_regime': {
        label: 'Projet de liquidation du régime matrimonial (A444-83)',
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
      ...ACTES_SUCCESSORAUX,
      'donation_mobiliere': ACTES_PRECIS.donation_mobiliere,
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
        montant: 113.19 // Enregistrement après décès : CGI 636, non dû à la rédaction.
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
        droitFixeEnreg: 125 // CGI 680 : acte innommé, pas de multiplication par vacation
      },
      'renonciation': {
        label: 'Renonciation à succession (honoraires à convenir)',
        type: 'non_tarife',
        description: 'Prestation à convenir avec le notaire ; pas d’assimilation au tarif de notoriété.',
        droitFixeEnreg: 125 // CGI 680 : renonciation pure et simple reçue par notaire
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
      'pret_professionnel': ACTES_PRECIS.pret_professionnel,
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
        description: 'Acte de société non réservé : honoraires libres (annexe 4-9, 4° C. com.). Si l\'augmentation porte sur un apport immobilier, l\'émolument A444-158 s\'applique sur la valeur du bien. Incorporation de bénéfices, réserves ou provisions : enregistrement gratuit (CGI 812). Apports purs et simples : CGI 810, sous réserve des mutations taxables visées à 809 et des apports à titre onéreux.',
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
        description: 'Honoraires libres. Dissolution sans transmission de biens : enregistrement gratuit (CGI 811). En cas de partage de l\'actif, droit de partage 2,50 % (CGI art. 746) et émolument de partage A444-121.',
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
