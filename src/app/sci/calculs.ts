// ============================================
// FILE: src/app/sci/calculs.ts
// DESCRIPTION: Toute la logique de calcul fiscal
// ============================================

import type { FormData, ResultatsIR, ResultatsIS, ResultatsPlusValue, ResultatsTransmission, ResultatsIFI, ComparaisonResults, SimulationSauvegardee } from './types';

// ============================================
// CONSTANTES FISCALES 2025
// ============================================

export const TAUX_IS_REDUIT = 0.15;
export const SEUIL_IS_REDUIT = 42500;
export const TAUX_IS_NORMAL = 0.25;
export const TAUX_PRELEVEMENT_FORFAITAIRE = 0.128;
export const TAUX_PRELEVEMENTS_SOCIAUX = 0.172;
export const TAUX_PFU = 0.30;
export const ABATTEMENT_40_POURCENT = 0.40;
export const SEUIL_MICRO_FONCIER = 15000;
export const ABATTEMENT_MICRO_FONCIER = 0.30;
export const TMO_2025 = 3.50;
export const PLAFOND_TAUX_CCA = TMO_2025 + 1.31;

// Barème IR 2025
export const BAREME_IR = [
  { max: 11294, taux: 0 },
  { max: 28797, taux: 0.11 },
  { max: 82341, taux: 0.30 },
  { max: 177106, taux: 0.41 },
  { max: Infinity, taux: 0.45 }
];

// Barème IFI 2025
export const BAREME_IFI = [
  { min: 0, max: 800000, taux: 0 },
  { min: 800000, max: 1300000, taux: 0.005 },
  { min: 1300000, max: 2570000, taux: 0.007 },
  { min: 2570000, max: 5000000, taux: 0.01 },
  { min: 5000000, max: 10000000, taux: 0.0125 },
  { min: 10000000, max: Infinity, taux: 0.015 }
];

// Barème donations 2025
export const BAREME_DONATIONS = [
  { max: 8072, taux: 0.05 },
  { max: 12109, taux: 0.10 },
  { max: 15932, taux: 0.15 },
  { max: 552324, taux: 0.20 },
  { max: 902838, taux: 0.30 },
  { max: 1805677, taux: 0.40 },
  { max: Infinity, taux: 0.45 }
];

// Abattement pour durée de détention (plus-value immobilière IR)
export const ABATTEMENT_IR_DUREE = [
  { annees: 0, abattementIR: 0, abattementPS: 0 },
  { annees: 6, abattementIR: 6, abattementPS: 1.65 },
  { annees: 7, abattementIR: 12, abattementPS: 3.3 },
  { annees: 8, abattementIR: 18, abattementPS: 4.95 },
  { annees: 9, abattementIR: 24, abattementPS: 6.6 },
  { annees: 10, abattementIR: 30, abattementPS: 8.25 },
  { annees: 11, abattementIR: 36, abattementPS: 9.9 },
  { annees: 12, abattementIR: 42, abattementPS: 11.55 },
  { annees: 13, abattementIR: 48, abattementPS: 13.2 },
  { annees: 14, abattementIR: 54, abattementPS: 14.85 },
  { annees: 15, abattementIR: 60, abattementPS: 16.5 },
  { annees: 16, abattementIR: 66, abattementPS: 18.15 },
  { annees: 17, abattementIR: 72, abattementPS: 19.8 },
  { annees: 18, abattementIR: 78, abattementPS: 21.45 },
  { annees: 19, abattementIR: 84, abattementPS: 23.1 },
  { annees: 20, abattementIR: 90, abattementPS: 24.75 },
  { annees: 21, abattementIR: 96, abattementPS: 26.4 },
  { annees: 22, abattementIR: 100, abattementPS: 28.05 },
  { annees: 23, abattementIR: 100, abattementPS: 37.05 },
  { annees: 24, abattementIR: 100, abattementPS: 46.05 },
  { annees: 25, abattementIR: 100, abattementPS: 55.05 },
  { annees: 26, abattementIR: 100, abattementPS: 64.05 },
  { annees: 27, abattementIR: 100, abattementPS: 73.05 },
  { annees: 28, abattementIR: 100, abattementPS: 82.05 },
  { annees: 29, abattementIR: 100, abattementPS: 91.05 },
  { annees: 30, abattementIR: 100, abattementPS: 100 }
];

// Barème démembrement (usufruit selon âge)
export const BAREME_DEMEMBREMENT = [
  { ageMax: 20, usufruitPourcent: 90 },
  { ageMax: 30, usufruitPourcent: 80 },
  { ageMax: 40, usufruitPourcent: 70 },
  { ageMax: 50, usufruitPourcent: 60 },
  { ageMax: 60, usufruitPourcent: 50 },
  { ageMax: 70, usufruitPourcent: 40 },
  { ageMax: 80, usufruitPourcent: 30 },
  { ageMax: 90, usufruitPourcent: 20 },
  { ageMax: Infinity, usufruitPourcent: 10 }
];

// ============================================
// CALCUL EMPRUNT
// ============================================

export function calculerEmprunt(montant: number, tauxAnnuel: number, dureeAnnees: number) {
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const nombreMois = dureeAnnees * 12;
  
  const mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, nombreMois)) / 
                     (Math.pow(1 + tauxMensuel, nombreMois) - 1);
  
  const coutTotal = mensualite * nombreMois;
  const interetsTotal = coutTotal - montant;
  
  return {
    mensualite,
    coutTotal,
    interetsTotal,
    capitalRestant: montant
  };
}

export function calculerDonneesEmpruntAnnee(
  capitalInitial: number, 
  annee: number, 
  mensualite: number, 
  tauxAnnuel: number
) {
  const tauxMensuel = tauxAnnuel / 100 / 12;
  let capitalRestant = capitalInitial;
  let interetsAnnuels = 0;
  let capitalRembourse = 0;
  
  const moisDebut = (annee - 1) * 12 + 1;
  const moisFin = annee * 12;
  
  for (let mois = 1; mois <= moisFin; mois++) {
    const interetsMois = capitalRestant * tauxMensuel;
    const capitalMois = mensualite - interetsMois;
    
    if (mois >= moisDebut) {
      interetsAnnuels += interetsMois;
      capitalRembourse += capitalMois;
    }
    
    capitalRestant -= capitalMois;
    if (capitalRestant < 0) capitalRestant = 0;
  }
  
  return {
    interetsAnnuels,
    capitalRembourse,
    capitalRestant
  };
}

// ============================================
// CALCUL IR
// ============================================

export function calculerResultatsIR(
  formData: FormData,
  revenusBruts: number,
  chargesAnnuelles: number,
  interetsEmprunt: number,
  remboursementCapital: number
): ResultatsIR {
  const fraisGestion = parseFloat(formData.fraisGestion.replace(/\s/g, '')) || 0;
  const fraisComptable = parseFloat(formData.fraisComptable.replace(/\s/g, '')) || 0;
  const assurances = parseFloat(formData.assurances.replace(/\s/g, '')) || 0;
  const travaux = parseFloat(formData.travauxAnnuels.replace(/\s/g, '')) || 0;
  
  let revenusFonciers = revenusBruts;
  let chargesDeductibles = 0;
  let revenuImposable = 0;
  
  // Régime micro-foncier
  if (formData.regimeFoncier === 'micro' && revenusBruts <= SEUIL_MICRO_FONCIER) {
    revenuImposable = revenusBruts * (1 - ABATTEMENT_MICRO_FONCIER);
    chargesDeductibles = revenusBruts * ABATTEMENT_MICRO_FONCIER;
  } else {
    // Régime réel
    chargesDeductibles = chargesAnnuelles + interetsEmprunt + fraisGestion + 
                        fraisComptable + assurances + travaux;
    revenuImposable = Math.max(0, revenusBruts - chargesDeductibles);
  }
  
  // Fiscalité
  const trancheMarginal = parseFloat(formData.trancheMarginalIR) / 100;
  let impotRevenu = revenuImposable * trancheMarginal;
  
  // Non-résidents : taux minimum 20%
  if (formData.nonResident) {
    impotRevenu = Math.max(impotRevenu, revenuImposable * 0.20);
  }
  
  // Prélèvements sociaux (exonérés pour non-résidents)
  const prelevementsSociaux = formData.nonResident ? 0 : revenuImposable * TAUX_PRELEVEMENTS_SOCIAUX;
  
  const fiscaliteTotal = impotRevenu + prelevementsSociaux;
  
  // Cash-flow réel = revenus - charges - fiscalité - remboursement capital
  const cashFlowReel = revenusBruts - chargesDeductibles - fiscaliteTotal - remboursementCapital;
  
  return {
    revenusFonciers,
    chargesDeductibles,
    revenuImposable,
    impotRevenu,
    prelevementsSociaux,
    fiscaliteTotal,
    tauxMarginal: trancheMarginal * 100,
    cashFlowReel
  };
}

// ============================================
// CALCUL IS
// ============================================

export function calculerResultatsIS(
  formData: FormData,
  revenusBruts: number,
  chargesAnnuelles: number,
  interetsEmprunt: number,
  remboursementCapital: number,
  valeurBiens: number
): ResultatsIS {
  const fraisGestion = parseFloat(formData.fraisGestion.replace(/\s/g, '')) || 0;
  const fraisComptable = parseFloat(formData.fraisComptable.replace(/\s/g, '')) || 0;
  const assurances = parseFloat(formData.assurances.replace(/\s/g, '')) || 0;
  const travaux = parseFloat(formData.travauxAnnuels.replace(/\s/g, '')) || 0;
  
  const chargesDeductibles = chargesAnnuelles + interetsEmprunt + fraisGestion + 
                            fraisComptable + assurances + travaux;
  
  // Intérêts CCA déductibles
  const montantCCA = parseFloat(formData.compteCourantAssocie.replace(/\s/g, '')) || 0;
  const tauxCCA = Math.min(parseFloat(formData.tauxInteretCCA) || 0, PLAFOND_TAUX_CCA);
  const interetsCCA = montantCCA * (tauxCCA / 100);
  
  const resultatComptable = revenusBruts - chargesDeductibles - interetsCCA;
  
  // Amortissement
  const dureeAmortissement = parseFloat(formData.dureeAmortissement) || 30;
  const amortissementAnnuel = valeurBiens / dureeAmortissement;
  
  const beneficeImposable = Math.max(0, resultatComptable - amortissementAnnuel);
  
  // Impôt sur les sociétés
  let impotSocietes = 0;
  if (beneficeImposable <= SEUIL_IS_REDUIT) {
    impotSocietes = beneficeImposable * TAUX_IS_REDUIT;
  } else {
    impotSocietes = SEUIL_IS_REDUIT * TAUX_IS_REDUIT + 
                   (beneficeImposable - SEUIL_IS_REDUIT) * TAUX_IS_NORMAL;
  }
  
  const resultatNet = beneficeImposable - impotSocietes;
  const dividendesDistribuables = resultatNet;
  
  // Distribution
  const tauxDistribution = parseFloat(formData.distributionDividendes) / 100;
  const dividendesDistribues = dividendesDistribuables * tauxDistribution;
  const reserves = dividendesDistribuables * (1 - tauxDistribution);
  
  // Fiscalité des dividendes
  let prelevementsForfaitaires = 0;
  
  if (formData.nonResident) {
    // Non-résidents : 12,8% uniquement (pas de PS)
    prelevementsForfaitaires = dividendesDistribues * TAUX_PRELEVEMENT_FORFAITAIRE;
  } else if (formData.optionBaremeProgressif) {
    // Option barème progressif avec abattement 40%
    const dividendesImposables = dividendesDistribues * (1 - ABATTEMENT_40_POURCENT);
    const trancheMarginal = parseFloat(formData.trancheMarginalIR) / 100;
    const impotBareme = dividendesImposables * trancheMarginal;
    const prelevementsSociaux = dividendesDistribues * TAUX_PRELEVEMENTS_SOCIAUX;
    prelevementsForfaitaires = impotBareme + prelevementsSociaux;
  } else {
    // Flat tax 30%
    prelevementsForfaitaires = dividendesDistribues * TAUX_PFU;
  }
  
  const fiscaliteTotal = impotSocietes + prelevementsForfaitaires;
  const revenuNetAssocie = dividendesDistribues - prelevementsForfaitaires;
  
  // Cash-flow réel = revenus nets perçus + mise en réserve - remboursement capital
  const cashFlowReel = revenuNetAssocie + reserves - remboursementCapital;
  
  return {
    resultatComptable,
    amortissementAnnuel,
    beneficeImposable,
    impotSocietes,
    resultatNet,
    dividendesDistribuables,
    dividendesDistribues,
    reserves,
    prelevementsForfaitaires,
    revenuNetAssocie,
    fiscaliteTotal,
    cashFlowReel
  };
}

// ============================================
// CALCUL PLUS-VALUE
// ============================================

export function calculerPlusValue(
  formData: FormData,
  valeurAchat: number,
  anneeRevente: number
): ResultatsPlusValue {
  const tauxValo = parseFloat(formData.tauxValorisationAnnuelle) / 100 || 0.01;
  const prixManuel = formData.prixReventeManuel ? 
    parseFloat(formData.prixReventeManuel.replace(/\s/g, '')) : null;
  
  // Prix de vente
  const prixVenteEstime = prixManuel || valeurAchat * Math.pow(1 + tauxValo, anneeRevente);
  
  // PLUS-VALUE IR
  const plusValueBruteIR = prixVenteEstime - valeurAchat;
  
  let abattementIR = 0;
  let abattementPS = 0;
  
  if (anneeRevente < 6) {
    abattementIR = 0;
    abattementPS = 0;
  } else if (anneeRevente >= 30) {
    abattementIR = 100;
    abattementPS = 100;
  } else {
    const tranche = ABATTEMENT_IR_DUREE.find(t => anneeRevente <= t.annees);
    if (tranche) {
      abattementIR = tranche.abattementIR;
      abattementPS = tranche.abattementPS;
    } else {
      const derniere = ABATTEMENT_IR_DUREE[ABATTEMENT_IR_DUREE.length - 1];
      abattementIR = derniere.abattementIR;
      abattementPS = derniere.abattementPS;
    }
  }
  
  const plusValueImposableIR = plusValueBruteIR * (1 - abattementIR / 100);
  const plusValueImposablePS = plusValueBruteIR * (1 - abattementPS / 100);
  
  const impotIR = plusValueImposableIR * 0.19;
  const impotPS = plusValueImposablePS * TAUX_PRELEVEMENTS_SOCIAUX;
  const fiscaliteTotalIR = impotIR + impotPS;
  
  // PLUS-VALUE IS
  const dureeAmortissement = parseFloat(formData.dureeAmortissement) || 30;
  const amortissementsCumules = Math.min(
    (valeurAchat / dureeAmortissement) * anneeRevente,
    valeurAchat
  );
  
  const valeurNetteComptable = valeurAchat - amortissementsCumules;
  const plusValueImposableIS = prixVenteEstime - valeurNetteComptable;
  const impotIS = plusValueImposableIS * TAUX_IS_NORMAL;
  
  const avantageIR = impotIS - fiscaliteTotalIR;
  
  return {
    prixVenteEstime,
    anneeRevente,
    IR: {
      plusValueBrute: plusValueBruteIR,
      abattementIR,
      abattementPS,
      plusValueImposableIR,
      plusValueImposablePS,
      impotIR,
      impotPS,
      fiscaliteTotal: fiscaliteTotalIR
    },
    IS: {
      prixAchat: valeurAchat,
      amortissementsCumules,
      valeurNetteComptable,
      prixVente: prixVenteEstime,
      plusValueImposable: plusValueImposableIS,
      impotIS
    },
    avantageIR
  };
}

// ============================================
// CALCUL TRANSMISSION
// ============================================

export function calculerTransmission(formData: FormData): ResultatsTransmission {
  const valeurBiens = parseFloat(formData.valeurTransmission.replace(/\s/g, '')) || 0;
  
  // Valorisation IS : inclut les réserves et plus-values latentes
  let plusValueLatente = 0;
  if (formData.regimeFiscal === 'IS') {
    // Estimation : les réserves peuvent représenter 30-50% de plus que la valeur des biens
    plusValueLatente = valeurBiens * 0.40;
  }
  
  const valeurRevaluee = valeurBiens + plusValueLatente;
  
  // Démembrement
  let valeurTaxable = valeurRevaluee;
  let economieDemo = 0;
  
  if (formData.demembrement && formData.ageDonateur) {
    const age = parseInt(formData.ageDonateur);
    const bareme = BAREME_DEMEMBREMENT.find(b => age <= b.ageMax);
    const usufruitPourcent = bareme ? bareme.usufruitPourcent : 10;
    const nuePropPourcent = 100 - usufruitPourcent;
    
    valeurTaxable = valeurRevaluee * (nuePropPourcent / 100);
    economieDemo = valeurRevaluee - valeurTaxable;
  }
  
  // Calcul par bénéficiaire (exemple : 2 enfants)
  const nombreBeneficiaires = formData.associes.filter(a => a.lienFamilial === 'enfant').length || 2;
  const valeurParBeneficiaire = valeurTaxable / nombreBeneficiaires;
  
  // Abattements donation : 100k€ par parent et par enfant tous les 15 ans
  const abattementTotal = 200000; // 100k × 2 parents
  const baseImposable = Math.max(0, valeurParBeneficiaire - abattementTotal);
  
  // Droits de donation
  let droitsTotal = 0;
  let cumul = 0;
  
  for (const tranche of BAREME_DONATIONS) {
    if (cumul >= baseImposable) break;
    
    const montantTranche = Math.min(baseImposable - cumul, tranche.max - cumul);
    droitsTotal += montantTranche * tranche.taux;
    cumul += montantTranche;
  }
  
  droitsTotal *= nombreBeneficiaires;
  
  // Calcul sans démembrement pour comparaison
  let droitsSansDemo = 0;
  if (formData.demembrement) {
    const valeurSansDemo = valeurRevaluee / nombreBeneficiaires;
    const baseImposableSansDemo = Math.max(0, valeurSansDemo - abattementTotal);
    let cumulSansDemo = 0;
    
    for (const tranche of BAREME_DONATIONS) {
      if (cumulSansDemo >= baseImposableSansDemo) break;
      const montantTranche = Math.min(baseImposableSansDemo - cumulSansDemo, tranche.max - cumulSansDemo);
      droitsSansDemo += montantTranche * tranche.taux;
      cumulSansDemo += montantTranche;
    }
    
    droitsSansDemo *= nombreBeneficiaires;
  }
  
  return {
    valeurBiens,
    plusValueLatente,
    valeurRevaluee,
    valeurTaxable,
    economieDemo,
    nombreBeneficiaires,
    baseImposable,
    droitsTotal,
    droitsSansDemo
  };
}

// ============================================
// CALCUL IFI
// ============================================

export function calculerIFI(valeurPatrimoine: number, dettes: number): ResultatsIFI {
  const assietteIFI = Math.max(0, valeurPatrimoine - dettes);
  
  if (assietteIFI < 1300000) {
    return {
      valeurPatrimoine,
      dettes,
      assietteIFI,
      impotIFI: 0,
      tauxMoyen: 0
    };
  }
  
  let impotIFI = 0;
  let cumul = 0;
  
  for (const tranche of BAREME_IFI) {
    if (cumul >= assietteIFI) break;
    if (assietteIFI <= tranche.min) continue;
    
    const base = Math.min(assietteIFI, tranche.max) - Math.max(cumul, tranche.min);
    impotIFI += base * tranche.taux;
    cumul = Math.min(assietteIFI, tranche.max);
  }
  
  const tauxMoyen = (impotIFI / assietteIFI) * 100;
  
  return {
    valeurPatrimoine,
    dettes,
    assietteIFI,
    impotIFI,
    tauxMoyen
  };
}

// ============================================
// SUGGESTIONS
// ============================================

export function genererSuggestions(
  formData: FormData,
  resultatsIR: ResultatsIR,
  resultatsIS: ResultatsIS,
  economie: number,
  plusValue?: ResultatsPlusValue
): string[] {
  const suggestions: string[] = [];
  
  // Régime optimal
  if (economie > 0) {
    suggestions.push(`✅ L'IS est plus avantageux avec ${Math.abs(economie).toLocaleString('fr-FR')} € d'économie par an`);
  } else {
    suggestions.push(`✅ L'IR est plus avantageux avec ${Math.abs(economie).toLocaleString('fr-FR')} € d'économie par an`);
  }
  
  // Plus-value
  if (plusValue && plusValue.avantageIR < 0) {
    suggestions.push(`⚠️ Attention : à la revente (année ${plusValue.anneeRevente}), l'IS coûte ${Math.abs(plusValue.avantageIR).toLocaleString('fr-FR')} € de plus que l'IR en fiscalité`);
  }
  
  // Micro-foncier
  if (formData.regimeFiscal === 'IR' && resultatsIR.revenusFonciers < SEUIL_MICRO_FONCIER && formData.regimeFoncier === 'reel') {
    const economieMicro = resultatsIR.revenusFonciers * ABATTEMENT_MICRO_FONCIER - resultatsIR.chargesDeductibles;
    if (economieMicro > 0) {
      suggestions.push(`💡 Le micro-foncier pourrait être avantageux (abattement 30% vs charges réelles)`);
    }
  }
  
  // CCA
  const montantCCA = parseFloat(formData.compteCourantAssocie.replace(/\s/g, '')) || 0;
  if (montantCCA > 0) {
    suggestions.push(`💰 Remboursez en priorité le CCA (${montantCCA.toLocaleString('fr-FR')} €) : 0% de fiscalité vs 30% sur les dividendes`);
  }
  
  // Distribution IS
  if (formData.regimeFiscal === 'IS' && parseFloat(formData.distributionDividendes) > 50) {
    suggestions.push(`📊 Optimisation IS : réduire la distribution de dividendes permet de capitaliser en réserve sans fiscalité immédiate`);
  }
  
  // Transmission
  if (formData.regimeFiscal === 'IS' && !formData.transmissionPrevue) {
    suggestions.push(`⚠️ Pour une transmission familiale, l'IR est généralement plus avantageux que l'IS (valorisation des réserves)`);
  }
  
  // Amortissement
  if (formData.regimeFiscal === 'IS') {
    const duree = parseFloat(formData.dureeAmortissement) || 30;
    if (duree === 30) {
      suggestions.push(`🔧 Vérifiez la durée d'amortissement optimale selon la nature du bien (20-50 ans selon BOFIP)`);
    }
  }
  
  return suggestions;
}

// ============================================
// GRAPHIQUES
// ============================================

export function genererDonneesGraphiques(
  formData: FormData,
  resultatsIR: ResultatsIR,
  resultatsIS: ResultatsIS
) {
  const duree = formData.emprunt ? parseInt(formData.dureeEmprunt) || 20 : 20;
  const donnees = [];
  
  let tresoIR = 0;
  let tresoIS = 0;
  
  for (let annee = 1; annee <= duree; annee++) {
    tresoIR += resultatsIR.cashFlowReel;
    tresoIS += resultatsIS.cashFlowReel;
    
    donnees.push({
      annee,
      'Cash-flow IR': resultatsIR.cashFlowReel,
      'Cash-flow IS': resultatsIS.cashFlowReel,
      'Tréso cumulée IR': tresoIR,
      'Tréso cumulée IS': tresoIS
    });
  }
  
  return donnees;
}

// ============================================
// SAUVEGARDE LOCALSTORAGE
// ============================================

export function sauvegarderSimulation(
  nom: string,
  formData: FormData,
  results: ComparaisonResults | null
) {
  const simulations: SimulationSauvegardee[] = JSON.parse(
    localStorage.getItem('sci_simulations') || '[]'
  );
  
  const newSimulation: SimulationSauvegardee = {
    id: Date.now().toString(),
    nom,
    date: new Date().toISOString(),
    formData,
    results
  };
  
  simulations.push(newSimulation);
  localStorage.setItem('sci_simulations', JSON.stringify(simulations));
}

export function chargerSimulations(): SimulationSauvegardee[] {
  return JSON.parse(localStorage.getItem('sci_simulations') || '[]');
}

export function chargerSimulation(id: string): SimulationSauvegardee | null {
  const simulations = chargerSimulations();
  return simulations.find(s => s.id === id) || null;
}

export function supprimerSimulation(id: string) {
  const simulations = chargerSimulations();
  const filtered = simulations.filter(s => s.id !== id);
  localStorage.setItem('sci_simulations', JSON.stringify(filtered));
}

// ============================================
// GÉNÉRATION PDF
// ============================================

export function genererPDF(
  formData: FormData,
  results: ComparaisonResults,
  graphiqueData: any[]
) {
  // Import dynamique de jsPDF
  import('jspdf').then(({ default: jsPDF }) => {
    const doc = new jsPDF();
    let y = 20;
    
    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport de simulation SCI', 105, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;
    
    // Résumé exécutif
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé exécutif', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Régime optimal : SCI à l'${results.regimeOptimal}`, 20, y);
    y += 7;
    doc.text(`Économie annuelle : ${Math.abs(results.economie).toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Économie sur 20 ans : ${(Math.abs(results.economie) * 20).toLocaleString('fr-FR')} €`, 20, y);
    y += 15;
    
    // Informations générales
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations générales', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Capital social : ${formData.capitalSocial} €`, 20, y);
    y += 7;
    doc.text(`Nombre d'associés : ${formData.associes.length}`, 20, y);
    y += 7;
    doc.text(`Nombre de biens : ${formData.biens.length}`, 20, y);
    y += 15;
    
    // Financement
    if (formData.emprunt) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Financement', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Montant emprunté : ${formData.montantEmprunt} €`, 20, y);
      y += 7;
      doc.text(`Taux : ${formData.tauxInteret}%`, 20, y);
      y += 7;
      doc.text(`Durée : ${formData.dureeEmprunt} ans`, 20, y);
      y += 15;
    }
    
    // Résultats IR
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résultats SCI à l\'IR', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Revenus fonciers : ${results.IR.revenusFonciers.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Charges déductibles : ${results.IR.chargesDeductibles.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Fiscalité totale : ${results.IR.fiscaliteTotal.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Cash-flow net réel : ${results.IR.cashFlowReel.toLocaleString('fr-FR')} €`, 20, y);
    y += 15;
    
    // Résultats IS
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résultats SCI à l\'IS', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Résultat comptable : ${results.IS.resultatComptable.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Amortissement : ${results.IS.amortissementAnnuel.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Impôt sur les sociétés : ${results.IS.impotSocietes.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Fiscalité totale : ${results.IS.fiscaliteTotal.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Cash-flow net réel : ${results.IS.cashFlowReel.toLocaleString('fr-FR')} €`, 20, y);
    y += 15;
    
    // Plus-value si disponible
    if (results.plusValue) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Simulation de revente', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Année de revente : ${results.plusValue.anneeRevente}`, 20, y);
      y += 7;
      doc.text(`Prix de vente estimé : ${results.plusValue.prixVenteEstime.toLocaleString('fr-FR')} €`, 20, y);
      y += 7;
      doc.text(`Fiscalité IR : ${results.plusValue.IR.fiscaliteTotal.toLocaleString('fr-FR')} €`, 20, y);
      y += 7;
      doc.text(`Fiscalité IS : ${results.plusValue.IS.impotIS.toLocaleString('fr-FR')} €`, 20, y);
      y += 7;
      
      if (results.plusValue.avantageIR > 0) {
        doc.text(`✓ IR plus avantageux : ${results.plusValue.avantageIR.toLocaleString('fr-FR')} € d'économie`, 20, y);
      } else {
        doc.text(`⚠ IS plus coûteux : ${Math.abs(results.plusValue.avantageIR).toLocaleString('fr-FR')} € de surcoût`, 20, y);
      }
      y += 15;
    }
    
    // IFI si applicable
    if (results.ifi && results.ifi.impotIFI > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Impôt sur la Fortune Immobilière (IFI)', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Patrimoine immobilier : ${results.ifi.valeurPatrimoine.toLocaleString('fr-FR')} €`, 20, y);
      y += 7;
      doc.text(`Dettes déductibles : ${results.ifi.dettes.toLocaleString('fr-FR')} €`, 20, y);
      y += 7;
      doc.text(`Assiette IFI : ${results.ifi.assietteIFI.toLocaleString('fr-FR')} €`, 20, y);
      y += 7;
      doc.text(`Impôt IFI : ${results.ifi.impotIFI.toLocaleString('fr-FR')} €`, 20, y);
      y += 15;
    }
    
    // Conseils
    if (results.suggestions.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Conseils d\'optimisation', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      results.suggestions.forEach((suggestion) => {
        const lines = doc.splitTextToSize(suggestion, 170);
        lines.forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 20, y);
          y += 7;
        });
        y += 3;
      });
    }
    
    // Disclaimer
    doc.addPage();
    y = 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Avertissement important', 20, y);
    y += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const disclaimer = [
      'Cette simulation est fournie à titre informatif uniquement et ne constitue pas un conseil',
      'juridique, fiscal ou patrimonial personnalisé. Les calculs sont basés sur la réglementation',
      'fiscale 2025 et peuvent évoluer.',
      '',
      'La création d\'une SCI et le choix du régime fiscal (IR/IS) ont des conséquences importantes',
      'et durables. L\'option pour l\'IS est irrévocable.',
      '',
      'Consultez impérativement des professionnels (notaire, avocat fiscaliste, expert-comptable)',
      'avant toute décision.'
    ];
    
    disclaimer.forEach(line => {
      doc.text(line, 20, y);
      y += 5;
    });
    
    // Téléchargement
    doc.save(`simulation-sci-${new Date().toISOString().split('T')[0]}.pdf`);
  }).catch(error => {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du PDF. Vérifiez que jsPDF est installé.');
  });
}