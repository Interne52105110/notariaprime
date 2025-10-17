// src/app/scan/dataExtractor.ts

import type { DonneesExtraites } from './ScanTypes';

/**
 * EXTRACTION DES DONNÉES STRUCTURÉES
 */

export function extraireDonnees(texte: string, typeActe: string): DonneesExtraites {
  const donnees: DonneesExtraites = {};

  // MONTANTS
  const regexMontants = [
    /(?:prix|somme|montant|valeur|moyennant)[\s:]+(?:de\s+)?(\d+(?:[\s\.]?\d+)*)\s*(?:euros?|€|EUR)/gi,
    /(?:pour\s+la\s+somme\s+(?:de\s+)?|moyennant\s+)(\d+(?:[\s\.]?\d+)*)\s*(?:euros?|€|EUR)?/gi,
    /(\d{1,3}(?:[\s\.]\d{3})+)\s*(?:euros?|€|EUR)/gi,
    /(\d{4,})\s*(?:euros?|€|EUR)/gi,
    /moyennant\s+(?:le\s+)?prix\s+(?:de\s+)?(\d+(?:[\s\.]?\d+)*)/gi,
    /\b(\d{5,})\b/g
  ];
  
  const montantsTrouves: number[] = [];
  for (const regex of regexMontants) {
    let match;
    while ((match = regex.exec(texte)) !== null) {
      const montantStr = match[1].replace(/[\s\.]/g, '');
      const montant = parseInt(montantStr);
      if (!isNaN(montant) && montant >= 1000 && montant <= 100000000) {
        montantsTrouves.push(montant);
      }
    }
  }
  
  if (montantsTrouves.length > 0) {
    const montantPrincipal = Math.max(...montantsTrouves);
    
    if (typeActe === 'vente') {
      donnees.prixVente = montantPrincipal;
    } else if (typeActe === 'bail') {
      const regexLoyerAnnuel = /loyer\s+annuel[^\d]*(\d+(?:[\s\.]\d{3})*)/gi;
      const matchLoyer = regexLoyerAnnuel.exec(texte);
      if (matchLoyer) {
        const loyerAnnuel = parseInt(matchLoyer[1].replace(/[\s\.]/g, ''));
        if (loyerAnnuel >= 1000) {
          donnees.valeurBien = loyerAnnuel;
        }
      } else {
        donnees.valeurBien = montantPrincipal;
      }
    } else if (typeActe === 'donation') {
      donnees.montantDonation = montantPrincipal;
      donnees.valeurBien = montantPrincipal;
    } else if (typeActe === 'succession') {
      donnees.actifSuccession = montantPrincipal;
      donnees.valeurBien = montantPrincipal;
    } else if (typeActe === 'pret' || typeActe === 'hypotheque') {
      donnees.montantPret = montantPrincipal;
    } else {
      donnees.valeurBien = montantPrincipal;
    }
  }

  // DATES
  const regexDates = [
    /(?:le|du|date)[\s:]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g
  ];
  
  for (const regex of regexDates) {
    const match = texte.match(regex);
    if (match) {
      const parts = match[0].match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
      if (parts) {
        donnees.dateActe = `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[3]}`;
        break;
      }
    }
  }

  // ADRESSE
  const regexAdresses = [
    /(?:situé|sis|située|cadastré|domicilié)[\s\S]{0,50}?(\d+[^\n]{20,80}(?:\d{5})[^\n]{0,30})/i,
    /(?:commune\s+de|ville\s+de)[\s:]*([\w\-]+)[\s,]/i,
    /(\d{5})\s+([\w\-]+)/
  ];
  
  for (const regex of regexAdresses) {
    const match = texte.match(regex);
    if (match && match[1]) {
      donnees.adresse = match[1].trim();
      
      const cpMatch = match[1].match(/(\d{5})/);
      if (cpMatch) {
        donnees.codePostal = cpMatch[1];
        donnees.departement = cpMatch[1].substring(0, 2);
      }
      break;
    }
  }

  // SURFACE
  const regexSurface = /(\d+(?:,\d+)?)\s*(?:m²|m2|mètres?\s*carrés?)/i;
  const matchSurface = texte.match(regexSurface);
  if (matchSurface) {
    donnees.surface = parseFloat(matchSurface[1].replace(',', '.'));
  }

  // TYPE DE BIEN - AMÉLIORATION ✅
  // Détection contextuelle plus précise pour éviter les faux positifs
  const texteLower = texte.toLowerCase();
  
  // 1. NEUF : Vérifier le contexte autour du mot "neuf"
  const regexNeufContexte = /(?:bien|immeuble|logement|appartement|maison|construction)\s+(?:est\s+)?(?:en\s+état\s+)?neuf|vefa|construction\s+neuve|achèvement\s+récent|livraison\s+\d{4}/i;
  
  // 2. TERRAIN : Plus facile à détecter
  const regexTerrain = /(?:terrain|parcelle)(?:\s+(?:à\s+bâtir|constructible|nu|agricole))?/i;
  
  // 3. ANCIEN : Par défaut si pas neuf ni terrain
  if (regexNeufContexte.test(texte)) {
    donnees.typeBien = 'neuf';
    console.log('✅ Détection NEUF confirmée avec contexte');
  } else if (regexTerrain.test(texte)) {
    donnees.typeBien = 'terrain';
    console.log('✅ Détection TERRAIN confirmée');
  } else {
    donnees.typeBien = 'ancien';
    console.log('✅ Bien ANCIEN par défaut (aucun indicateur de neuf/terrain trouvé)');
  }
  
  // Log de debug pour comprendre les faux positifs
  if (texteLower.includes('neuf') && donnees.typeBien !== 'neuf') {
    console.log('⚠️ Le mot "neuf" existe dans le texte mais contexte incorrect pour bien neuf');
  }

  // PARTIES
  if (typeActe === 'vente') {
    const matchVendeur = texte.match(/(?:vendeur|cédant)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){1,3})/i);
    if (matchVendeur) donnees.vendeur = matchVendeur[1].trim();
    
    const matchAcquereur = texte.match(/(?:acquéreur|cessionnaire)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){1,3})/i);
    if (matchAcquereur) donnees.acquereur = matchAcquereur[1].trim();
  }
  
  if (typeActe === 'donation') {
    const matchDonateur = texte.match(/(?:donateur|disposant)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){1,3})/i);
    if (matchDonateur) donnees.donateur = matchDonateur[1].trim();
    
    const matchDonataire = texte.match(/(?:donataire|gratifié)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){1,3})/i);
    if (matchDonataire) donnees.donataire = matchDonataire[1].trim();
    
    const liens = ['enfant', 'fils', 'fille', 'conjoint', 'époux', 'épouse', 'frère', 'soeur', 'neveu', 'nièce', 'petit-enfant'];
    for (const lien of liens) {
      if (new RegExp(`\\b${lien}\\b`, 'i').test(texte)) {
        if (lien === 'fils' || lien === 'fille') donnees.lienParente = 'enfant';
        else if (lien === 'époux' || lien === 'épouse') donnees.lienParente = 'conjoint';
        else donnees.lienParente = lien;
        break;
      }
    }
    
    const matchAge = texte.match(/(?:âgé|née?)[\s:]+(?:de\s+)?(\d{2})\s*ans/i);
    if (matchAge) donnees.ageDonateur = parseInt(matchAge[1]);
  }
  
  if (typeActe === 'succession') {
    const matchDefunt = texte.match(/(?:défunt|décédé|de\s+cujus)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){1,3})/i);
    if (matchDefunt) donnees.defunt = matchDefunt[1].trim();
    
    const regexHeritiers = /(?:héritier|ayant\s+droit)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){1,3})/gi;
    const heritiers: string[] = [];
    let match;
    while ((match = regexHeritiers.exec(texte)) !== null) {
      heritiers.push(match[1].trim());
    }
    if (heritiers.length > 0) donnees.heritiers = heritiers;
    
    const liens = ['enfant', 'conjoint', 'frère', 'soeur', 'neveu', 'nièce', 'petit-enfant'];
    for (const lien of liens) {
      if (new RegExp(`\\b${lien}\\b`, 'i').test(texte)) {
        donnees.lienParente = lien;
        break;
      }
    }
  }
  
  if (typeActe === 'pret' || typeActe === 'hypotheque') {
    const matchEmprunteur = texte.match(/(?:emprunteur|débiteur)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){1,3})/i);
    if (matchEmprunteur) donnees.emprunteur = matchEmprunteur[1].trim();
    
    const matchPreteur = texte.match(/(?:prêteur|créancier|banque)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){0,3})/i);
    if (matchPreteur) donnees.preteur = matchPreteur[1].trim();
    
    const matchDuree = texte.match(/(?:durée|sur)[\s:]*(\d+)\s*(?:ans?|années?)/i);
    if (matchDuree) donnees.dureePret = parseInt(matchDuree[1]);
    
    const matchTaux = texte.match(/(?:taux|intérêt)[\s:]*(\d+(?:[,.]\d+)?)\s*%/i);
    if (matchTaux) donnees.tauxInteret = parseFloat(matchTaux[1].replace(',', '.'));
  }

  // RÉFÉRENCES
  const regexRef = /(?:référence|réf|n°|numéro)[\s:]*([A-Z0-9\-\/]+)/i;
  const matchRef = texte.match(regexRef);
  if (matchRef) donnees.reference = matchRef[1].trim();
  
  const regexNotaire = /(?:notaire|maître|me)[\s:]*([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+){0,2})/i;
  const matchNotaire = texte.match(regexNotaire);
  if (matchNotaire) donnees.notaire = matchNotaire[1].trim();

  return donnees;
}