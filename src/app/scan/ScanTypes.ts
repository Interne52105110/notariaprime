// src/app/scan/ScanTypes.ts

/**
 * Types spécifiques au module SCAN
 * (Les types de calcul sont dans pretaxe/PretaxeTypes.ts)
 */

// ============================================================================
// EXTRACTION
// ============================================================================

export interface ExtractionProgress {
  status: string;
  progress: number;
}

// ============================================================================
// DÉTECTION TYPE D'ACTE
// ============================================================================

export interface TypeActeDetecte {
  type: string;
  confiance: number;
  sousType?: string;
}

// ============================================================================
// DONNÉES EXTRAITES DU DOCUMENT
// ============================================================================

export interface DonneesExtraites {
  // Parties
  vendeur?: string;
  acquereur?: string;
  donateur?: string;
  donataire?: string;
  defunt?: string;
  heritiers?: string[];
  emprunteur?: string;
  preteur?: string;
  
  // Montants
  prixVente?: number;
  valeurBien?: number;
  montantPret?: number;
  actifSuccession?: number;
  montantDonation?: number;
  
  // Détails bien
  adresse?: string;
  surface?: number;
  typeBien?: 'ancien' | 'neuf' | 'terrain';
  departement?: string;
  commune?: string;
  codePostal?: string;
  
  // Dates
  dateActe?: string;
  dateAcquisition?: string;
  dateNaissance?: string;
  dateDeces?: string;
  
  // Spécificités
  reference?: string;
  notaire?: string;
  numeroActe?: string;
  
  // Donation/Succession
  lienParente?: string;
  ageDonateur?: number;
  ageDonataire?: number;
  ageDefunt?: number;
  quotitePP?: number;
  quotiteNP?: number;
  
  // Usufruit
  typeUsufruit?: 'viager' | 'temporaire';
  dureeUsufruit?: number;
  
  // Prêt
  dureePret?: number;
  tauxInteret?: number;
  typeGarantie?: string;
}

// ============================================================================
// RÉSULTAT COMPLET DE L'ANALYSE
// ============================================================================

export interface AnalyseResult {
  typeActe: string;
  confiance: number;
  donneesExtraites: DonneesExtraites;
  texteBrut: string;
  suggestions?: string[];
  warnings?: string[];
  informations?: string[];
}