// src/app/scan/typeDetector.ts

import type { TypeActeDetecte } from './ScanTypes';

/**
 * DÉTECTION DU TYPE D'ACTE
 */

export function detecterTypeActe(texte: string): TypeActeDetecte {
  const texteLower = texte.toLowerCase();
  
  const patterns = {
    vente: {
      mots: ['vente', 'acquéreur', 'vendeur', 'prix de vente', 'achat', 'acquisition', 'cession'],
      poids: [10, 8, 8, 10, 7, 7, 6]
    },
    bail: {
      mots: ['bail', 'loyer', 'bailleur', 'preneur', 'location', 'bail commercial', 'locatif'],
      poids: [10, 9, 9, 9, 7, 10, 8]
    },
    donation: {
      mots: ['donation', 'donateur', 'donataire', 'libéralité', 'présent d\'usage', 'don manuel'],
      poids: [10, 9, 9, 7, 5, 6]
    },
    succession: {
      mots: ['succession', 'héritier', 'défunt', 'testament', 'décès', 'actif successoral', 'dévolution'],
      poids: [10, 8, 9, 7, 8, 7, 6]
    },
    partage: {
      mots: ['partage', 'licitation', 'indivision', 'lot', 'soulte', 'copartageant'],
      poids: [10, 8, 9, 6, 7, 6]
    },
    pret: {
      mots: ['prêt', 'emprunt', 'crédit', 'hypothèque', 'garantie', 'financement', 'mensualité'],
      poids: [10, 8, 8, 7, 6, 7, 5]
    },
    hypotheque: {
      mots: ['hypothèque', 'inscription', 'privilège', 'créancier', 'débiteur', 'garantie'],
      poids: [10, 8, 7, 6, 6, 6]
    }
  };

  let maxScore = 0;
  let typeDetecte = 'vente';
  let scores: { [key: string]: number } = {};

  Object.entries(patterns).forEach(([type, config]) => {
    let score = 0;
    config.mots.forEach((mot, index) => {
      if (texteLower.includes(mot)) {
        score += config.poids[index];
      }
    });
    scores[type] = score;
    if (score > maxScore) {
      maxScore = score;
      typeDetecte = type;
    }
  });

  const maxPossible = patterns[typeDetecte as keyof typeof patterns].poids.reduce((a, b) => a + b, 0);
  const confiance = maxScore > 0 ? Math.min((maxScore / maxPossible) * 100, 95) : 0;
  
  console.log('🎯 Scores de détection:', scores, '→', typeDetecte, confiance.toFixed(1) + '%');
  
  return { type: typeDetecte, confiance };
}