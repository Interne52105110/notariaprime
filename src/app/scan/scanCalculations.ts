// src/app/scan/scanCalculations.ts

import { DonneesExtraites } from './ScanTypes';
import { 
  calculerEmoluments, 
  getTauxTVA,
  getMajorationDOMTOM
} from '../pretaxe/PretaxeCalculations';
import { actesConfig } from '@/config/actesConfig';
import { departements } from '../pretaxe/PretaxeTypes';
import type { 
  Debours, 
  Formalites, 
  Documents, 
  Taxes 
} from '../pretaxe/PretaxeTypes';

/**
 * Interface pour le résultat complet du calcul
 */
export interface CalculCompletScan {
  typeActe: string;
  montantBase: number;
  
  // Émoluments
  emoluments: {
    tranches: { montant: number; taux: number; emolument: number }[];
    bruts: number;
    majoration: number;
    avantRemise: number;
    remise10: number;
    remise20: number;
    nets: number;
    montantTVA: number;
    tauxTVA: number;
    totalEmolumentsTTC: number;
  };
  
  // Taxes (droits de mutation)
  taxes: {
    departementale: number;
    communale: number;
    fraisAssiette: number;
    total: number;
  };
  
  // Débours (avec détail)
  debours: {
    csi: number;
    etatsHypothecaires: number;
    cadastre: number;
    urbanisme: number;
    total: number;
  };
  
  // Formalités (avec détail)
  formalites: {
    items: {
      publiciteFonciere: { actif: boolean; montant: number };
      cadastre: { actif: boolean; montant: number };
      casierJudiciaire: { actif: boolean; montant: number };
      notification: { actif: boolean; montant: number };
      mesurage: { actif: boolean; montant: number };
      diagnostics: {
        dpe: { actif: boolean; montant: number };
        amiante: { actif: boolean; montant: number };
        plomb: { actif: boolean; montant: number };
        termites: { actif: boolean; montant: number };
        gaz: { actif: boolean; montant: number };
        electricite: { actif: boolean; montant: number };
        erp: { actif: boolean; montant: number };
      };
      transmissionCSN: { actif: boolean; montant: number };
      requisition: { actif: boolean; montant: number };
    };
    teleactes: number;
    lettresRecommandees: number;
    totalHT: number;
    totalTTC: number;
  };
  
  // Documents (avec détail)
  documents: {
    pagesActe: number;
    fraisRole: number;
    copiesExecutoires: number;
    copiesAuthentiques: number;
    copiesHypothecaires: number;
    totalHT: number;
    totalTTC: number;
  };
  
  // Totaux
  totalFraisNotaire: number;
  totalGeneral: number;
  pourcentageTotal: number;
  
  // Répartition
  repartition: {
    emoluments: number;
    droits: number;
    formalites: number;
    debours: number;
    documents: number;
  };
  
  // Comparaison avec montants annoncés
  verification?: {
    montantAnnonce?: number;
    montantCalcule: number;
    difference?: number;
    pourcentageDifference?: number;
    alerte: boolean;
    message?: string;
  };
}

/**
 * Mapper le type d'acte détecté vers la clé actesConfig
 */
function mapTypeActeVersConfig(typeDetecte: string): string {
  const mapping: Record<string, string> = {
    'vente': 'vente_immeuble',
    'donation': 'donation',
    'succession': 'declaration_succession',
    'pret': 'pret_hypothecaire',
    'hypotheque': 'pret_hypothecaire',
    'partage': 'partage',
    'bail': 'bail_construction'
  };
  
  return mapping[typeDetecte] || 'vente_immeuble';
}

/**
 * Déterminer automatiquement les débours selon la CONFIG
 */
function determinerDeboursAvecConfig(
  acteKey: string, 
  montant: number
): { debours: Debours; total: number } {
  const config = actesConfig[acteKey];
  const debours: Debours = {
    csi: Math.max(montant * 0.001, 15),
    etatsHypothecaires: 0,
    cadastre: 0,
    urbanisme: 0
  };
  
  // Utiliser la config si disponible
  // Note: La config actuelle n'a pas de structure .variables
  // On utilise les valeurs par défaut ou on peut les définir par type d'acte
  if (config?.debours) {
    // Si la config a des valeurs spécifiques, les utiliser
    // Sinon, garder les valeurs par défaut (0)
  }
  
  const total = Object.values(debours).reduce((sum, val) => sum + val, 0);
  
  return { debours, total };
}

/**
 * Déterminer automatiquement les formalités selon la CONFIG
 */
function determinerFormalitesAvecConfig(
  acteKey: string,
  tauxTVA: number
): { formalites: Formalites; totalHT: number; totalTTC: number } {
  const config = actesConfig[acteKey];
  
  // Structure complète des formalités
  const formalites: Formalites = {
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
  };
  
  // Appliquer la config par défaut de l'acte
  if (config?.formalites) {
    const cfg = config.formalites;
    if (cfg.publiciteFonciere?.defaut) formalites.publiciteFonciere.actif = true;
    if (cfg.cadastre?.defaut) formalites.cadastre.actif = true;
    if (cfg.casierJudiciaire?.defaut) formalites.casierJudiciaire.actif = true;
    if (cfg.notification?.defaut) formalites.notification.actif = true;
    if (cfg.mesurage?.defaut) formalites.mesurage.actif = true;
    if (cfg.transmissionCSN?.defaut) formalites.transmissionCSN.actif = true;
    if (cfg.requisition?.defaut) formalites.requisition.actif = true;
    
    // Diagnostics
    if (cfg.diagnostics?.dpe?.defaut) formalites.diagnostics.dpe.actif = true;
    if (cfg.diagnostics?.amiante?.defaut) formalites.diagnostics.amiante.actif = true;
    if (cfg.diagnostics?.plomb?.defaut) formalites.diagnostics.plomb.actif = true;
    if (cfg.diagnostics?.termites?.defaut) formalites.diagnostics.termites.actif = true;
    if (cfg.diagnostics?.gaz?.defaut) formalites.diagnostics.gaz.actif = true;
    if (cfg.diagnostics?.electricite?.defaut) formalites.diagnostics.electricite.actif = true;
    if (cfg.diagnostics?.erp?.defaut) formalites.diagnostics.erp.actif = true;
  }
  
  // Calculer le total HT
  let totalHT = 
    (formalites.publiciteFonciere.actif ? formalites.publiciteFonciere.montant : 0) +
    (formalites.cadastre.actif ? formalites.cadastre.montant : 0) +
    (formalites.casierJudiciaire.actif ? formalites.casierJudiciaire.montant : 0) +
    (formalites.notification.actif ? formalites.notification.montant : 0) +
    (formalites.mesurage.actif ? formalites.mesurage.montant : 0) +
    (formalites.transmissionCSN.actif ? formalites.transmissionCSN.montant : 0) +
    (formalites.requisition.actif ? formalites.requisition.montant : 0) +
    Object.values(formalites.diagnostics).reduce((sum, d) => sum + (d.actif ? d.montant : 0), 0) +
    formalites.teleactes +
    formalites.lettresRecommandees;
  
  const totalTTC = totalHT * (1 + tauxTVA / 100);
  
  return { formalites, totalHT, totalTTC };
}

/**
 * Déterminer automatiquement les documents selon la CONFIG
 */
function determinerDocumentsAvecConfig(
  acteKey: string,
  tauxTVA: number
): { documents: Documents; totalHT: number; totalTTC: number } {
  const config = actesConfig[acteKey];
  
  const documents: Documents = {
    pagesActe: config?.documents?.pagesActe || 10,
    copiesExecutoires: config?.documents?.copiesExecutoires || 0,
    copiesAuthentiques: config?.documents?.copiesAuthentiques || 1,
    copiesHypothecaires: config?.documents?.copiesHypothecaires || 0
  };
  
  const fraisRole = documents.pagesActe * 2;
  const copiesExec = documents.copiesExecutoires * 4;
  const copiesAuth = documents.copiesAuthentiques * 40;
  const copiesHypo = documents.copiesHypothecaires * 4;
  const totalHT = fraisRole + copiesExec + copiesAuth + copiesHypo;
  const totalTTC = totalHT * (1 + tauxTVA / 100);
  
  return {
    documents,
    totalHT,
    totalTTC
  };
}

/**
 * Extraire les montants annoncés dans le texte pour vérification
 * Distingue entre droits de mutation et frais totaux
 */
function extraireMontantsAnnonces(texte: string): {
  droitsMutation?: number;
  fraisNotaire?: number;
  totalGeneral?: number;
} {
  const resultat: {
    droitsMutation?: number;
    fraisNotaire?: number;
    totalGeneral?: number;
  } = {};
  
  // 1. Rechercher DROITS DE MUTATION spécifiquement
  const patternsDroits = [
    /(?:droits? de mutation|droits? d'enregistrement|taxe|impôt)[\s:]+(?:de\s+)?(\d+(?:[\s\.]?\d+)*)\s*(?:euros?|€|EUR)/gi,
    /(?:trésor public|taxes? de publicité)[\s:]+(?:de\s+)?(\d+(?:[\s\.]?\d+)*)\s*(?:euros?|€|EUR)/gi,
  ];
  
  for (const regex of patternsDroits) {
    let match;
    while ((match = regex.exec(texte)) !== null) {
      const montantStr = match[1].replace(/[\s\.]/g, '');
      const montant = parseInt(montantStr);
      if (!isNaN(montant) && montant >= 1000 && montant <= 100000000) {
        if (!resultat.droitsMutation || montant > resultat.droitsMutation) {
          resultat.droitsMutation = montant;
        }
      }
    }
  }
  
  // 2. Rechercher FRAIS NOTAIRE (émoluments)
  const patternsFrais = [
    /(?:émoluments?|frais (?:de )?notaire|honoraires? notariaux?)[\s:]+(?:de\s+)?(\d+(?:[\s\.]?\d+)*)\s*(?:euros?|€|EUR)/gi,
    /(?:rémunération du notaire)[\s:]+(?:de\s+)?(\d+(?:[\s\.]?\d+)*)\s*(?:euros?|€|EUR)/gi,
  ];
  
  for (const regex of patternsFrais) {
    let match;
    while ((match = regex.exec(texte)) !== null) {
      const montantStr = match[1].replace(/[\s\.]/g, '');
      const montant = parseInt(montantStr);
      if (!isNaN(montant) && montant >= 100 && montant <= 100000000) {
        if (!resultat.fraisNotaire || montant > resultat.fraisNotaire) {
          resultat.fraisNotaire = montant;
        }
      }
    }
  }
  
  // 3. Rechercher TOTAL GÉNÉRAL
  const patternsTotal = [
    /(?:total général|montant total|total à payer|coût total)[\s:]+(?:de\s+)?(\d+(?:[\s\.]?\d+)*)\s*(?:euros?|€|EUR)/gi,
  ];
  
  for (const regex of patternsTotal) {
    let match;
    while ((match = regex.exec(texte)) !== null) {
      const montantStr = match[1].replace(/[\s\.]/g, '');
      const montant = parseInt(montantStr);
      if (!isNaN(montant) && montant >= 1000 && montant <= 100000000) {
        if (!resultat.totalGeneral || montant > resultat.totalGeneral) {
          resultat.totalGeneral = montant;
        }
      }
    }
  }
  
  return resultat;
}

/**
 * FONCTION PRINCIPALE : Calculer automatiquement tous les frais
 * Utilise EXACTEMENT la même config et les mêmes fonctions que pretaxe
 */
export function calculerFraisCompletsScan(
  typeActe: string,
  donnees: DonneesExtraites,
  texteBrut: string
): CalculCompletScan | null {
  // Extraire le montant principal
  const montant = 
    donnees.prixVente || 
    donnees.valeurBien || 
    donnees.montantDonation || 
    donnees.actifSuccession || 
    donnees.montantPret || 
    0;
  
  if (montant === 0) {
    console.warn('⚠️ Aucun montant détecté');
    return null;
  }
  
  // Mapper vers config
  const acteKey = mapTypeActeVersConfig(typeActe);
  const acteConfig = actesConfig[acteKey];
  
  if (!acteConfig || acteConfig.type === 'non_tarife') {
    console.warn('⚠️ Acte non tarifé ou configuration manquante');
    return null;
  }
  
  const departement = donnees.departement || '75';
  
  // 🔧 CORRECTION : Forcer "ancien" par défaut car la détection neuf/ancien est imparfaite
  const typeBien = 'ancien';
  
  console.log('📋 Configuration utilisée:', acteKey);
  console.log('📋 Type de bien:', typeBien, '(détecté:', donnees.typeBien, ')');
  
  // 1. CALCUL ÉMOLUMENTS (EXACTEMENT comme pretaxe)
  const emolumentsDetail = calculerEmoluments(
    montant,
    acteConfig.tranches || [],
    departement,
    false // Pas de remise par défaut
  );
  
  const tauxTVA = getTauxTVA(departement);
  const montantTVA = emolumentsDetail.nets * (tauxTVA / 100);
  const totalEmolumentsTTC = emolumentsDetail.nets + montantTVA;
  
  // Construire les tranches pour affichage
  const tranches: { montant: number; taux: number; emolument: number }[] = [];
  if (acteConfig.tranches) {
    acteConfig.tranches.forEach(tranche => {
      if (montant > tranche.min) {
        const montantDansTranche = Math.min(montant - tranche.min, tranche.max - tranche.min);
        const emolumentTranche = montantDansTranche * (tranche.taux / 100);
        tranches.push({
          montant: montantDansTranche,
          taux: tranche.taux,
          emolument: emolumentTranche
        });
      }
    });
  }
  
  // 2. CALCUL TAXES (droits de mutation) - EXACTEMENT comme pretaxe
  let taxesCalculees = {
    departementale: 0,
    communale: 0,
    fraisAssiette: 0,
    total: 0
  };
  
  if (typeBien === 'ancien') {
    const tauxDept = departements[departement]?.taux || 4.50;
    const tauxComm = 1.20;
    
    taxesCalculees.departementale = montant * (tauxDept / 100);
    taxesCalculees.communale = montant * (tauxComm / 100);
    const totalDroits = taxesCalculees.departementale + taxesCalculees.communale;
    taxesCalculees.fraisAssiette = totalDroits * 0.0237;
    taxesCalculees.total = totalDroits + taxesCalculees.fraisAssiette;
  }
  
  // 3. DÉBOURS - Utilise la CONFIG de l'acte
  const { debours, total: totalDebours } = determinerDeboursAvecConfig(acteKey, montant);
  
  // 4. FORMALITÉS - Utilise la CONFIG de l'acte
  const { formalites, totalHT: totalFormalitesHT, totalTTC: totalFormalitesTTC } = 
    determinerFormalitesAvecConfig(acteKey, tauxTVA);
  
  // 5. DOCUMENTS - Utilise la CONFIG de l'acte
  const { documents, totalHT: totalDocumentsHT, totalTTC: totalDocumentsTTC } = 
    determinerDocumentsAvecConfig(acteKey, tauxTVA);
  
  // 6. TOTAUX
  const totalFraisNotaire = totalEmolumentsTTC + taxesCalculees.total + totalDebours + totalFormalitesTTC + totalDocumentsTTC;
  const totalGeneral = montant + totalFraisNotaire;
  const pourcentageTotal = (totalFraisNotaire / montant) * 100;
  
  // 7. VÉRIFICATION avec montants annoncés - LOGIQUE AMÉLIORÉE
  const montantsAnnonces = extraireMontantsAnnonces(texteBrut);
  let verification: CalculCompletScan['verification'] = {
    montantCalcule: totalFraisNotaire,
    alerte: false
  };
  
  // PRIORITÉ 1 : Droits de mutation détectés dans le document
  if (montantsAnnonces.droitsMutation) {
    const difference = Math.abs(taxesCalculees.total - montantsAnnonces.droitsMutation);
    const pourcentageDiff = taxesCalculees.total > 0 ? (difference / montantsAnnonces.droitsMutation) * 100 : 0;
    
    verification = {
      montantAnnonce: montantsAnnonces.droitsMutation,
      montantCalcule: taxesCalculees.total,
      difference,
      pourcentageDifference: pourcentageDiff,
      alerte: pourcentageDiff > 5,
      message: pourcentageDiff > 5 
        ? `⚠️ Droits de mutation : écart de ${pourcentageDiff.toFixed(1)}% détecté. Document indique ${montantsAnnonces.droitsMutation.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€, calcul donne ${taxesCalculees.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€`
        : `✅ Droits de mutation cohérents. Document : ${montantsAnnonces.droitsMutation.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€, calcul : ${taxesCalculees.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€ (écart : ${pourcentageDiff.toFixed(1)}%)\n\n💡 Les autres frais (émoluments : ${totalEmolumentsTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€, débours : ${totalDebours.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€, formalités : ${totalFormalitesTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€, documents : ${totalDocumentsTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€) sont calculés selon le barème réglementaire 2025.`
    };
  }
  // PRIORITÉ 2 : Frais notaire détectés
  else if (montantsAnnonces.fraisNotaire) {
    const fraisNotaireSeuls = totalEmolumentsTTC + totalDebours + totalFormalitesTTC + totalDocumentsTTC;
    const difference = Math.abs(fraisNotaireSeuls - montantsAnnonces.fraisNotaire);
    const pourcentageDiff = fraisNotaireSeuls > 0 ? (difference / montantsAnnonces.fraisNotaire) * 100 : 0;
    
    verification = {
      montantAnnonce: montantsAnnonces.fraisNotaire,
      montantCalcule: fraisNotaireSeuls,
      difference,
      pourcentageDifference: pourcentageDiff,
      alerte: pourcentageDiff > 5,
      message: pourcentageDiff > 5 
        ? `⚠️ Frais notaire : écart de ${pourcentageDiff.toFixed(1)}% détecté`
        : `✅ Frais notaire cohérents (écart : ${pourcentageDiff.toFixed(1)}%)`
    };
  }
  // PRIORITÉ 3 : Total général détecté
  else if (montantsAnnonces.totalGeneral) {
    const difference = Math.abs(totalGeneral - montantsAnnonces.totalGeneral);
    const pourcentageDiff = totalGeneral > 0 ? (difference / montantsAnnonces.totalGeneral) * 100 : 0;
    
    verification = {
      montantAnnonce: montantsAnnonces.totalGeneral,
      montantCalcule: totalGeneral,
      difference,
      pourcentageDifference: pourcentageDiff,
      alerte: pourcentageDiff > 5,
      message: pourcentageDiff > 5 
        ? `⚠️ Total général : écart de ${pourcentageDiff.toFixed(1)}% détecté`
        : `✅ Total général cohérent (écart : ${pourcentageDiff.toFixed(1)}%)`
    };
  }
  // AUCUN MONTANT DÉTECTÉ : Informer l'utilisateur
  else {
    verification = {
      montantCalcule: totalFraisNotaire,
      alerte: false,
      message: `ℹ️ Aucun montant de référence trouvé dans le document.\n\n📊 Calcul effectué selon le barème réglementaire 2025 :\n• Droits de mutation : ${taxesCalculees.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n• Émoluments notaire : ${totalEmolumentsTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n• Débours : ${totalDebours.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n• Formalités : ${totalFormalitesTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n• Documents : ${totalDocumentsTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€\n\n💰 Total frais : ${totalFraisNotaire.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€`
    };
  }
  
  // Résultat final
  const resultat: CalculCompletScan = {
    typeActe: acteConfig.label,
    montantBase: montant,
    
    emoluments: {
      tranches,
      bruts: emolumentsDetail.bruts,
      majoration: emolumentsDetail.majoration,
      avantRemise: emolumentsDetail.avantRemise,
      remise10: emolumentsDetail.remise10,
      remise20: emolumentsDetail.remise20,
      nets: emolumentsDetail.nets,
      montantTVA,
      tauxTVA,
      totalEmolumentsTTC
    },
    
    taxes: taxesCalculees,
    
    debours: {
      ...debours,
      total: totalDebours
    },
    
    formalites: {
      items: formalites,
      teleactes: formalites.teleactes,
      lettresRecommandees: formalites.lettresRecommandees,
      totalHT: totalFormalitesHT,
      totalTTC: totalFormalitesTTC
    },
    
    documents: {
      pagesActe: documents.pagesActe,
      fraisRole: documents.pagesActe * 2,
      copiesExecutoires: documents.copiesExecutoires * 4,
      copiesAuthentiques: documents.copiesAuthentiques * 40,
      copiesHypothecaires: documents.copiesHypothecaires * 4,
      totalHT: totalDocumentsHT,
      totalTTC: totalDocumentsTTC
    },
    
    totalFraisNotaire,
    totalGeneral,
    pourcentageTotal,
    
    repartition: {
      emoluments: totalEmolumentsTTC,
      droits: taxesCalculees.total,
      formalites: totalFormalitesTTC,
      debours: totalDebours,
      documents: totalDocumentsTTC
    },
    
    verification
  };
  
  console.log('✅ Calcul complet terminé:', resultat);
  
  return resultat;
}