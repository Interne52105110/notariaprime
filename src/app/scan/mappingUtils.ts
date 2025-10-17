// src/app/scan/mappingUtils.ts

import type { DonneesExtraites } from './ScanTypes';

/**
 * UTILITAIRES DE MAPPING
 * Convertit les données extraites (scan) vers le format pretaxe
 */

/**
 * Mappe le type d'acte détecté vers la clé pretaxe
 */
export function mapTypeActeVersPretaxe(typeDetecte: string): string {
  const mapping: Record<string, string> = {
    'vente': 'vente_immeuble',
    'donation': 'donation',
    'succession': 'declaration_succession',
    'pret': 'pret_hypothecaire',
    'hypotheque': 'pret_hypothecaire',
    'partage': 'partage',
    'bail': 'bail_construction'
  };
  
  return mapping[typeDetecte] || '';
}

/**
 * Mappe la catégorie pretaxe depuis le type d'acte
 */
export function mapCategorieActe(typeDetecte: string): string {
  const mapping: Record<string, string> = {
    'vente': 'biens_immobiliers',
    'donation': 'successions',
    'succession': 'successions',
    'pret': 'prets',
    'hypotheque': 'prets',
    'partage': 'biens_immobiliers',
    'bail': 'biens_immobiliers'
  };
  
  return mapping[typeDetecte] || 'biens_immobiliers';
}

/**
 * Extrait le montant principal selon le type d'acte
 */
export function extraireMontantPrincipal(donnees: DonneesExtraites): number {
  return donnees.prixVente || 
         donnees.valeurBien || 
         donnees.montantDonation || 
         donnees.actifSuccession || 
         donnees.montantPret || 
         0;
}

/**
 * Mappe les données extraites complètes vers le format pretaxe
 */
export function mapDonneesVersPretaxe(donnees: DonneesExtraites) {
  const montant = extraireMontantPrincipal(donnees);
  
  return {
    montantActe: montant > 0 ? montant.toString() : '',
    selectedDepartement: donnees.departement || '75',
    typeBien: donnees.typeBien || 'ancien',
    
    // Mapping optionnel pour future utilisation
    surface: donnees.surface,
    adresse: donnees.adresse,
    dateActe: donnees.dateActe,
    
    // Pour donations/successions
    lienParente: donnees.lienParente,
    ageDonateur: donnees.ageDonateur,
    
    // Pour prêts
    dureePret: donnees.dureePret,
    tauxInteret: donnees.tauxInteret
  };
}

/**
 * Génère des suggestions basées sur les données extraites
 */
export function genererSuggestions(
  donnees: DonneesExtraites, 
  typeActe: string,
  confiance: number
): string[] {
  const suggestions: string[] = [];
  
  if (confiance < 70) {
    suggestions.push('La détection du type d\'acte est incertaine. Vérifiez manuellement le résultat.');
  }
  
  const montant = extraireMontantPrincipal(donnees);
  if (!montant || montant === 0) {
    suggestions.push('Vérifiez que le document contient bien un montant en euros.');
  }
  
  if (!donnees.dateActe) {
    suggestions.push('Date de l\'acte non détectée. Ajoutez-la manuellement si nécessaire.');
  }
  
  if (!donnees.adresse && (typeActe === 'vente' || typeActe === 'donation')) {
    suggestions.push('Adresse du bien non détectée. Vérifiez le document.');
  }
  
  return suggestions;
}

/**
 * Génère des avertissements
 */
export function genererWarnings(
  donnees: DonneesExtraites,
  typeActe: string,
  confiance: number,
  montant: number
): string[] {
  const warnings: string[] = [];
  
  if (confiance < 50) {
    warnings.push('⚠️ Confiance très faible dans la détection. Vérification manuelle nécessaire.');
  }
  
  if (montant && montant < 10000) {
    warnings.push('Montant inhabituellement bas détecté. Vérifiez le document.');
  }
  
  if (montant && montant > 10000000) {
    warnings.push('Montant très élevé détecté. Vérifiez les calculs.');
  }
  
  if ((typeActe === 'donation' || typeActe === 'succession') && !donnees.lienParente) {
    warnings.push('Lien de parenté non détecté. Abattement calculé avec le barème par défaut.');
  }
  
  return warnings;
}

/**
 * Génère des informations utiles
 */
export function genererInformations(
  donnees: DonneesExtraites,
  typeActe: string
): string[] {
  const informations: string[] = [];
  
  if (donnees.typeBien === 'neuf' && typeActe === 'vente') {
    informations.push('Bien neuf détecté : droits de mutation réduits, TVA à prévoir.');
  }
  
  if (typeActe === 'donation' || typeActe === 'succession') {
    if (donnees.lienParente) {
      informations.push(`Lien de parenté détecté : ${donnees.lienParente}`);
    }
  }
  
  const montant = extraireMontantPrincipal(donnees);
  if (montant > 1000000) {
    informations.push('Montant élevé : pensez à consulter un notaire pour optimiser la fiscalité.');
  }
  
  if (donnees.departement && ['971', '972', '973', '974', '976'].includes(donnees.departement)) {
    informations.push('Territoire DOM-TOM : majoration des émoluments applicable.');
  }
  
  return informations;
}