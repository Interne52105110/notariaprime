// ============================================================================
// TYPES TYPESCRIPT - PRETAXE
// ============================================================================

export interface TrancheTarif {
  min: number;
  max: number;
  taux: number;
}

export interface ActeConfig {
  label: string;
  type: 'proportionnel' | 'fixe' | 'non_tarife';
  tranches?: TrancheTarif[];
  montant?: number;
  description?: string;
  honorairesEstimes?: string;
}

export interface CategorieActes {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  actes: Record<string, ActeConfig>;
}

export interface Donateur {
  id: number;
  nom: string;
  montant: string;
  lien: string;
}

export interface Donataire {
  id: number;
  nom: string;
  part: string;
}

export interface HistoriqueCalcul {
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

export interface Departement {
  nom: string;
  taux: number;
  tauxTVA: number;
  majoration: number;
}

export interface EmolumentsDetail {
  bruts: number;
  majoration: number;
  avantRemise: number;
  remise10: number;
  remise20: number;
  nets: number;
}

export interface Debours {
  csi: number;
  etatsHypothecaires: number;
  cadastre: number;
  urbanisme: number;
}

export interface FormaliteItem {
  actif: boolean;
  montant: number;
}

export interface Formalites {
  publiciteFonciere: FormaliteItem;
  cadastre: FormaliteItem;
  casierJudiciaire: FormaliteItem;
  notification: FormaliteItem;
  mesurage: FormaliteItem;
  diagnostics: {
    dpe: FormaliteItem;
    amiante: FormaliteItem;
    plomb: FormaliteItem;
    termites: FormaliteItem;
    gaz: FormaliteItem;
    electricite: FormaliteItem;
    erp: FormaliteItem;
  };
  transmissionCSN: FormaliteItem;
  requisition: FormaliteItem;
  teleactes: number;
  lettresRecommandees: number;
}

export interface Documents {
  pagesActe: number;
  copiesExecutoires: number;
  copiesAuthentiques: number;
  copiesHypothecaires: number;
}

export interface Taxes {
  typeBien: string;
  departementale: number;
  communale: number;
  fraisAssiette: number;
}

export interface Usufruit {
  actif: boolean;
  ageUsufruitier: string;
  valeur: number;
}

// ============================================================================
// CONFIGURATION TVA ET MAJORATIONS DOM-TOM
// ============================================================================

export const TVA_CONFIG = {
  metropole: 20.0,
  guadeloupe: 8.5,
  martinique: 8.5,
  guyane: 0,
  reunion: 8.5,
  mayotte: 0,
} as const;

export const MAJORATION_DOM_TOM: Record<string, number> = {
  '971': 23, // Guadeloupe
  '972': 24, // Martinique
  '973': 20, // Guyane
  '974': 36, // La Réunion
  '976': 36, // Mayotte
};

// ============================================================================
// DÉPARTEMENTS
// ============================================================================

export const departements: Record<string, Departement> = {
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
