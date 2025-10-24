// ============================================
// FILE: src/app/sci/types.ts
// DESCRIPTION: Types & Interfaces TypeScript
// ============================================

export interface AssocieData {
  id: number;
  nom: string;
  partsSociales: string;
  apportNumeraire: string;
  apportNature: string;
  lienFamilial: 'conjoint' | 'enfant' | 'parent' | 'autre';
}

export interface BienImmobilier {
  id: number;
  nom: string;
  valeur: string;
  loyerMensuel: string;
  charges: string;
  taxeFonciere: string;
}

export interface FormData {
  regimeFiscal: 'IR' | 'IS';
  capitalSocial: string;
  nombreAssocies: string;
  associes: AssocieData[];
  biens: BienImmobilier[];
  
  // Financement
  emprunt: boolean;
  montantEmprunt: string;
  tauxInteret: string;
  dureeEmprunt: string;
  
  // Charges SCI
  fraisGestion: string;
  fraisComptable: string;
  assurances: string;
  travauxAnnuels: string;
  
  // Stratégie
  distributionDividendes: string;
  compteCourantAssocie: string;
  tauxInteretCCA: string;
  optionBaremeProgressif: boolean;
  dureeAmortissement: string;
  
  // Fiscalité IR
  trancheMarginalIR: string;
  nonResident: boolean;
  regimeFoncier: 'reel' | 'micro';
  
  // Transmission
  transmissionPrevue: boolean;
  valeurTransmission: string;
  typeTransmission: 'donation' | 'succession';
  demembrement: boolean;
  ageDonateur: string;
  
  // Revente
  simulerRevente: boolean;
  anneeRevente: string;
  tauxValorisationAnnuelle: string;
  prixReventeManuel: string;
}

export interface ResultatsIR {
  revenusFonciers: number;
  chargesDeductibles: number;
  revenuImposable: number;
  impotRevenu: number;
  prelevementsSociaux: number;
  fiscaliteTotal: number;
  tauxMarginal: number;
  cashFlowReel: number;
}

export interface ResultatsIS {
  resultatComptable: number;
  amortissementAnnuel: number;
  beneficeImposable: number;
  impotSocietes: number;
  resultatNet: number;
  dividendesDistribuables: number;
  dividendesDistribues: number;
  reserves: number;
  prelevementsForfaitaires: number;
  revenuNetAssocie: number;
  fiscaliteTotal: number;
  cashFlowReel: number;
}

export interface ResultatsPlusValue {
  prixVenteEstime: number;
  anneeRevente: number;
  IR: {
    plusValueBrute: number;
    abattementIR: number;
    abattementPS: number;
    plusValueImposableIR: number;
    plusValueImposablePS: number;
    impotIR: number;
    impotPS: number;
    fiscaliteTotal: number;
  };
  IS: {
    prixAchat: number;
    amortissementsCumules: number;
    valeurNetteComptable: number;
    prixVente: number;
    plusValueImposable: number;
    impotIS: number;
  };
  avantageIR: number;
}

export interface ResultatsTransmission {
  valeurBiens: number;
  plusValueLatente: number;
  valeurRevaluee: number;
  valeurTaxable: number;
  economieDemo: number;
  nombreBeneficiaires: number;
  baseImposable: number;
  droitsTotal: number;
  droitsSansDemo: number;
}

export interface ResultatsIFI {
  valeurPatrimoine: number;
  dettes: number;
  assietteIFI: number;
  impotIFI: number;
  tauxMoyen: number;
}

export interface ComparaisonResults {
  IR: ResultatsIR;
  IS: ResultatsIS;
  economie: number;
  regimeOptimal: 'IR' | 'IS';
  suggestions: string[];
  plusValue?: ResultatsPlusValue;
  ifi?: ResultatsIFI;
}

export interface SimulationSauvegardee {
  id: string;
  nom: string;
  date: string;
  formData: FormData;
  results: ComparaisonResults | null;
}