// ============================================================================
// FICHIER : src/config/actesConfig.ts
// Configuration des onglets par type d'acte (49 ACTES CONFIGURÉS)
// ============================================================================

export interface ConfigFormalite {
  defaut: boolean;
  montant: number;
  obligatoire?: boolean;
}

export interface ConfigActe {
  debours?: {
    csi?: { auto: boolean };
    cadastre?: { defaut: boolean; montant: number };
    etatsHypothecaires?: { defaut: boolean; montant: number };
  };
  formalites: {
    publiciteFonciere?: ConfigFormalite;
    cadastre?: ConfigFormalite;
    casierJudiciaire?: ConfigFormalite;
    notification?: ConfigFormalite;
    mesurage?: ConfigFormalite;
    diagnostics?: {
      dpe?: ConfigFormalite;
      amiante?: ConfigFormalite;
      plomb?: ConfigFormalite;
      termites?: ConfigFormalite;
      gaz?: ConfigFormalite;
      electricite?: ConfigFormalite;
      erp?: ConfigFormalite;
    };
    transmissionCSN?: ConfigFormalite;
    requisition?: ConfigFormalite;
  };
  documents?: {
    pagesActe: number;
    copiesExecutoires: number;
    copiesAuthentiques: number;
    copiesHypothecaires: number;
  };
  taxes?: {
    applicable: boolean;
    type?: 'dmto' | 'tva' | 'donation' | 'aucune';
    calculAuto: boolean;
  };
}

export const actesConfig: Record<string, ConfigActe> = {
  
  // ============================================================================
  // 🏠 BIENS IMMOBILIERS (9 actes)
  // ============================================================================
  
  'vente_immeuble': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true },
      mesurage: { defaut: true, montant: 15.09 },
      diagnostics: {
        dpe: { defaut: true, montant: 15.09 },
        amiante: { defaut: true, montant: 15.09 },
        plomb: { defaut: true, montant: 15.09 },
        termites: { defaut: true, montant: 15.09 },
        gaz: { defaut: true, montant: 15.09 },
        electricite: { defaut: true, montant: 15.09 },
        erp: { defaut: true, montant: 15.09 }
      }
    },
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'vente_terrain': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true },
      mesurage: { defaut: false, montant: 15.09 },
      diagnostics: {
        dpe: { defaut: false, montant: 15.09 },
        amiante: { defaut: false, montant: 15.09 },
        plomb: { defaut: false, montant: 15.09 },
        termites: { defaut: false, montant: 15.09 },
        gaz: { defaut: false, montant: 15.09 },
        electricite: { defaut: false, montant: 15.09 },
        erp: { defaut: false, montant: 15.09 }
      }
    },
    documents: {
      pagesActe: 12,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'vefa': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true },
      diagnostics: {
        dpe: { defaut: true, montant: 15.09 },
        amiante: { defaut: false, montant: 15.09 },
        plomb: { defaut: false, montant: 15.09 },
        termites: { defaut: false, montant: 15.09 },
        gaz: { defaut: false, montant: 15.09 },
        electricite: { defaut: false, montant: 15.09 },
        erp: { defaut: true, montant: 15.09 }
      }
    },
    documents: {
      pagesActe: 20,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'tva',
      calculAuto: true
    }
  },

  'echange': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true },
      diagnostics: {
        dpe: { defaut: true, montant: 15.09 },
        amiante: { defaut: true, montant: 15.09 },
        plomb: { defaut: true, montant: 15.09 },
        termites: { defaut: true, montant: 15.09 },
        gaz: { defaut: true, montant: 15.09 },
        electricite: { defaut: true, montant: 15.09 },
        erp: { defaut: true, montant: 15.09 }
      }
    },
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'licitation': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true },
      notification: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 18,
      copiesExecutoires: 1,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'partage': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true },
      notification: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 20,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'bail_construction': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 25,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'servitude_fixe': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 8,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'servitude_proportionnel': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 10,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  // ============================================================================
  // 👨‍👩‍👧 FAMILLE (5 actes)
  // ============================================================================
  
  'contrat_mariage': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 },
      requisition: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 12,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'changement_regime': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 },
      notification: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'pacs': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 },
      requisition: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 5,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'divorce_consentement': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 },
      requisition: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 8,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'liquidation_regime': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      notification: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 20,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  // ============================================================================
  // 💰 SUCCESSIONS ET DONATIONS (8 actes)
  // ============================================================================
  
  'donation': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58 },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87 },
      notification: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'donation',
      calculAuto: true
    }
  },

  'donation_partage': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58 },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87 },
      notification: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 18,
      copiesExecutoires: 0,
      copiesAuthentiques: 3,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: true,
      type: 'donation',
      calculAuto: true
    }
  },

  'testament': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 },
      requisition: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 3,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'notoriete': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 },
      casierJudiciaire: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 5,
      copiesExecutoires: 0,
      copiesAuthentiques: 3,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'attestation_propriete': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: true, montant: 11.32 }
    },
    documents: {
      pagesActe: 8,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'inventaire': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 25,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'renonciation': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 3,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'declaration_succession': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: true, montant: 11.32 },
      casierJudiciaire: { defaut: true, montant: 37.73 }
    },
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  // ============================================================================
  // 🏦 PRÊTS ET SÛRETÉS (7 actes)
  // ============================================================================
  
  'pret_hypothecaire': {
    debours: {
      etatsHypothecaires: { defaut: true, montant: 50 }
    },
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 12,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 1
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'pret_viager': {
    debours: {
      etatsHypothecaires: { defaut: true, montant: 50 }
    },
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 1
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'mainlevee_saisie': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 3,
      copiesExecutoires: 1,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'mainlevee_hypo_inf': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 3,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 1
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'mainlevee_hypo_sup': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 3,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 1
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'caution_hypothecaire': {
    debours: {
      etatsHypothecaires: { defaut: true, montant: 50 }
    },
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 10,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 1
    },
    taxes: {
      applicable: true,
      type: 'dmto',
      calculAuto: true
    }
  },

  'ppd': {
    formalites: {
      publiciteFonciere: { defaut: true, montant: 339.58, obligatoire: true },
      cadastre: { defaut: true, montant: 11.32 },
      requisition: { defaut: true, montant: 18.87, obligatoire: true }
    },
    documents: {
      pagesActe: 10,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 1
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  // ============================================================================
  // 🏢 SOCIÉTÉS (5 actes)
  // ============================================================================
  
  'constitution_societe': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      transmissionCSN: { defaut: true, montant: 15.31 }
    },
    documents: {
      pagesActe: 20,
      copiesExecutoires: 0,
      copiesAuthentiques: 3,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'augmentation_capital': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      transmissionCSN: { defaut: true, montant: 15.31 }
    },
    documents: {
      pagesActe: 12,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'cession_parts': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      transmissionCSN: { defaut: true, montant: 15.31 }
    },
    documents: {
      pagesActe: 10,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'dissolution': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      transmissionCSN: { defaut: true, montant: 15.31 }
    },
    documents: {
      pagesActe: 8,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'transformation': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      transmissionCSN: { defaut: true, montant: 15.31 }
    },
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  // ============================================================================
  // 📄 DIVERS (3 actes)
  // ============================================================================
  
  'procuration': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 2,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'quittance': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 2,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'consentement_adoption': {
    formalites: {
      publiciteFonciere: { defaut: false, montant: 0 },
      cadastre: { defaut: false, montant: 0 }
    },
    documents: {
      pagesActe: 3,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  // ============================================================================
  // ⚖️ ACTES NON TARIFÉS - HONORAIRES LIBRES (13 actes)
  // Note: Ces actes n'ont pas besoin de configuration détaillée car ils
  // affichent uniquement une estimation d'honoraires dans l'interface
  // ============================================================================
  
  'statuts_societe_simple': {
    formalites: {},
    documents: {
      pagesActe: 10,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'statuts_societe_complexe': {
    formalites: {},
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 3,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'bail_commercial': {
    formalites: {},
    documents: {
      pagesActe: 12,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'bail_professionnel': {
    formalites: {},
    documents: {
      pagesActe: 8,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'commodat': {
    formalites: {},
    documents: {
      pagesActe: 5,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'promesse_vente': {
    formalites: {},
    documents: {
      pagesActe: 8,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'convention_indivision': {
    formalites: {},
    documents: {
      pagesActe: 10,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'vente_fonds_commerce': {
    formalites: {},
    documents: {
      pagesActe: 15,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'pacte_actionnaires': {
    formalites: {},
    documents: {
      pagesActe: 20,
      copiesExecutoires: 0,
      copiesAuthentiques: 3,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'mandat_vente': {
    formalites: {},
    documents: {
      pagesActe: 3,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'transaction_mediation': {
    formalites: {},
    documents: {
      pagesActe: 8,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'consultation': {
    formalites: {},
    documents: {
      pagesActe: 2,
      copiesExecutoires: 0,
      copiesAuthentiques: 1,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  },

  'pacte_tontine': {
    formalites: {},
    documents: {
      pagesActe: 6,
      copiesExecutoires: 0,
      copiesAuthentiques: 2,
      copiesHypothecaires: 0
    },
    taxes: {
      applicable: false,
      type: 'aucune',
      calculAuto: false
    }
  }
};

// ============================================================================
// CONFIGURATION PAR DÉFAUT (FALLBACK)
// ============================================================================

export const configParDefaut: ConfigActe = {
  formalites: {
    publiciteFonciere: { defaut: false, montant: 339.58 },
    cadastre: { defaut: false, montant: 11.32 },
    casierJudiciaire: { defaut: false, montant: 37.73 },
    notification: { defaut: false, montant: 37.73 },
    mesurage: { defaut: false, montant: 15.09 },
    diagnostics: {
      dpe: { defaut: false, montant: 15.09 },
      amiante: { defaut: false, montant: 15.09 },
      plomb: { defaut: false, montant: 15.09 },
      termites: { defaut: false, montant: 15.09 },
      gaz: { defaut: false, montant: 15.09 },
      electricite: { defaut: false, montant: 15.09 },
      erp: { defaut: false, montant: 15.09 }
    },
    transmissionCSN: { defaut: false, montant: 15.31 },
    requisition: { defaut: false, montant: 18.87 }
  },
  documents: {
    pagesActe: 10,
    copiesExecutoires: 0,
    copiesAuthentiques: 1,
    copiesHypothecaires: 0
  },
  taxes: {
    applicable: false,
    type: 'aucune',
    calculAuto: false
  }
};