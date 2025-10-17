// Path: C:\notariaprime\src\app\pretaxe\PretaxeCalculations.ts

import jsPDF from 'jspdf';
import { actesConfig, configParDefaut, type ConfigActe } from '@/config/actesConfig';
import {
  TrancheTarif,
  EmolumentsDetail,
  TVA_CONFIG,
  MAJORATION_DOM_TOM,
  departements,
  Debours,
  Formalites,
  Documents,
  Taxes,
  CategorieActes
} from './PretaxeTypes';

// ============================================================================
// FONCTIONS UTILITAIRES TVA ET MAJORATIONS
// ============================================================================

export function getTauxTVA(codeDepartement: string): number {
  const mapping: Record<string, number> = {
    '971': TVA_CONFIG.guadeloupe,
    '972': TVA_CONFIG.martinique,
    '973': TVA_CONFIG.guyane,
    '974': TVA_CONFIG.reunion,
    '976': TVA_CONFIG.mayotte,
  };
  
  return mapping[codeDepartement] ?? TVA_CONFIG.metropole;
}

export function getMajorationDOMTOM(codeDepartement: string): number {
  return MAJORATION_DOM_TOM[codeDepartement] || 0;
}

// ============================================================================
// CALCUL DES ÉMOLUMENTS
// ============================================================================

export function calculerEmoluments(
  montant: number,
  tranches: TrancheTarif[],
  selectedDepartement: string,
  appliquerRemise: boolean
): EmolumentsDetail {
  let emolumentsBruts = 0;
  
  tranches.forEach(tranche => {
    if (montant > tranche.min) {
      const montantDansTranche = Math.min(montant - tranche.min, tranche.max - tranche.min);
      emolumentsBruts += montantDansTranche * (tranche.taux / 100);
    }
  });

  const tauxMajoration = getMajorationDOMTOM(selectedDepartement);
  const majoration = emolumentsBruts * (tauxMajoration / 100);
  const emolumentsAvantRemise = emolumentsBruts + majoration;

  let remise20 = 0;
  let emolumentsNets = emolumentsAvantRemise;
  
  if (appliquerRemise && montant > 100000) {
    let emolumentsAuDela100k = 0;
    
    tranches.forEach(tranche => {
      if (100000 < tranche.max) {
        const debut = Math.max(100000, tranche.min);
        const fin = montant > tranche.max ? tranche.max : montant;
        if (fin > debut) {
          emolumentsAuDela100k += (fin - debut) * (tranche.taux / 100);
        }
      }
    });
    
    const majorationAuDela100k = emolumentsAuDela100k * (tauxMajoration / 100);
    remise20 = (emolumentsAuDela100k + majorationAuDela100k) * 0.20;
    
    emolumentsNets = emolumentsAvantRemise - remise20;
  }
  
  return {
    bruts: emolumentsBruts,
    majoration: majoration,
    avantRemise: emolumentsAvantRemise,
    remise10: 0,
    remise20: remise20,
    nets: emolumentsNets
  };
}

// ============================================================================
// CALCUL DES TAXES
// ============================================================================

export function calculerTaxes(
  montantActe: string,
  selectedDepartement: string,
  typeBien: string,
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>
) {
  if (!montantActe || typeBien === 'neuf') return;
  
  const montant = parseFloat(montantActe.replace(/\s/g, ''));
  if (isNaN(montant)) return;
  
  const tauxDepartemental = departements[selectedDepartement]?.taux || 4.50;
  const tauxCommunal = 1.20;
  
  const taxeDepartementale = montant * (tauxDepartemental / 100);
  const taxeCommunale = montant * (tauxCommunal / 100);
  const totalDroits = taxeDepartementale + taxeCommunale;
  const fraisAssiette = totalDroits * 0.0237;
  
  setTaxes(prev => ({
    ...prev,
    departementale: taxeDepartementale,
    communale: taxeCommunale,
    fraisAssiette: fraisAssiette
  }));
}

// ============================================================================
// CALCUL CSI
// ============================================================================

export function calculerCSI(
  montantActe: string,
  setDebours: React.Dispatch<React.SetStateAction<Debours>>
) {
  if (!montantActe) return;
  
  const montant = parseFloat(montantActe.replace(/\s/g, ''));
  if (isNaN(montant)) return;
  
  const csi = Math.max(montant * 0.001, 15);
  
  setDebours(prev => ({
    ...prev,
    csi: csi
  }));
}

// ============================================================================
// CALCUL USUFRUIT
// ============================================================================

export function calculerUsufruit(age: string | number): number {
  const ageNum = parseInt(String(age));
  if (ageNum < 21) return 90;
  if (ageNum < 31) return 80;
  if (ageNum < 41) return 70;
  if (ageNum < 51) return 60;
  if (ageNum < 61) return 50;
  if (ageNum < 71) return 40;
  if (ageNum < 81) return 30;
  if (ageNum < 91) return 20;
  return 10;
}

// ============================================================================
// APPLICATION CONFIG PAR DÉFAUT
// ============================================================================

export function appliquerConfigParDefaut(
  acteKey: string,
  setDebours: React.Dispatch<React.SetStateAction<Debours>>,
  setFormalites: React.Dispatch<React.SetStateAction<Formalites>>,
  setDocuments: React.Dispatch<React.SetStateAction<Documents>>,
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>
) {
  const config: ConfigActe = actesConfig[acteKey] || configParDefaut;
  
  // Appliquer les débours
  if (config.debours) {
    setDebours(prev => ({
      ...prev,
      csi: config.debours?.csi?.auto ? prev.csi : 15,
      etatsHypothecaires: config.debours?.etatsHypothecaires?.defaut ? 
        config.debours.etatsHypothecaires.montant : 0,
      cadastre: config.debours?.cadastre?.defaut ? 
        config.debours.cadastre.montant : 0
    }));
  }
  
  // Appliquer les formalités
  if (config.formalites) {
    setFormalites(prev => ({
      ...prev,
      publiciteFonciere: {
        actif: config.formalites?.publiciteFonciere?.defaut || false,
        montant: config.formalites?.publiciteFonciere?.montant || 339.58
      },
      cadastre: {
        actif: config.formalites?.cadastre?.defaut || false,
        montant: config.formalites?.cadastre?.montant || 11.32
      },
      casierJudiciaire: {
        actif: config.formalites?.casierJudiciaire?.defaut || false,
        montant: config.formalites?.casierJudiciaire?.montant || 37.73
      },
      notification: {
        actif: config.formalites?.notification?.defaut || false,
        montant: config.formalites?.notification?.montant || 37.73
      },
      mesurage: {
        actif: config.formalites?.mesurage?.defaut || false,
        montant: config.formalites?.mesurage?.montant || 15.09
      },
      diagnostics: {
        dpe: {
          actif: config.formalites?.diagnostics?.dpe?.defaut || false,
          montant: config.formalites?.diagnostics?.dpe?.montant || 15.09
        },
        amiante: {
          actif: config.formalites?.diagnostics?.amiante?.defaut || false,
          montant: config.formalites?.diagnostics?.amiante?.montant || 15.09
        },
        plomb: {
          actif: config.formalites?.diagnostics?.plomb?.defaut || false,
          montant: config.formalites?.diagnostics?.plomb?.montant || 15.09
        },
        termites: {
          actif: config.formalites?.diagnostics?.termites?.defaut || false,
          montant: config.formalites?.diagnostics?.termites?.montant || 15.09
        },
        gaz: {
          actif: config.formalites?.diagnostics?.gaz?.defaut || false,
          montant: config.formalites?.diagnostics?.gaz?.montant || 15.09
        },
        electricite: {
          actif: config.formalites?.diagnostics?.electricite?.defaut || false,
          montant: config.formalites?.diagnostics?.electricite?.montant || 15.09
        },
        erp: {
          actif: config.formalites?.diagnostics?.erp?.defaut || false,
          montant: config.formalites?.diagnostics?.erp?.montant || 15.09
        }
      },
      transmissionCSN: {
        actif: config.formalites?.transmissionCSN?.defaut || false,
        montant: config.formalites?.transmissionCSN?.montant || 15.31
      },
      requisition: {
        actif: config.formalites?.requisition?.defaut || false,
        montant: config.formalites?.requisition?.montant || 18.87
      }
    }));
  }
  
  // Appliquer les documents
  if (config.documents) {
    setDocuments({
      pagesActe: config.documents.pagesActe || 10,
      copiesExecutoires: config.documents.copiesExecutoires || 0,
      copiesAuthentiques: config.documents.copiesAuthentiques || 1,
      copiesHypothecaires: config.documents.copiesHypothecaires || 0
    });
  }
  
  // Appliquer le type de taxes
  if (config.taxes) {
    setTaxes(prev => ({
      ...prev,
      typeBien: config.taxes?.type === 'tva' ? 'neuf' : 'ancien'
    }));
  }
}

// ============================================================================
// VÉRIFIER SI FORMALITÉ EST OBLIGATOIRE
// ============================================================================

export function estFormaliteObligatoire(nomFormalite: string, selectedActe: string): boolean {
  if (!selectedActe) return false;
  const config = actesConfig[selectedActe];
  if (!config || !config.formalites) return false;
  
  const formalite = config.formalites[nomFormalite as keyof typeof config.formalites];
  return (formalite as any)?.obligatoire === true;
}

// ============================================================================
// EXPORT PDF
// ============================================================================

export function exporterPDF(
  selectedDepartement: string,
  selectedCategory: string,
  selectedActe: string,
  montantActe: string,
  emolumentsDetail: EmolumentsDetail,
  totalEmolumentsTTC: number,
  debours: Debours,
  totalDebours: number,
  totalFormalitesTTC: number,
  totalDocumentsTTC: number,
  taxes: Taxes,
  totalTaxes: number,
  totalGeneral: number,
  appliquerRemise: boolean,
  categoriesActes: Record<string, CategorieActes>
) {
  const deptInfo = departements[selectedDepartement];
  const acteInfo = categoriesActes[selectedCategory]?.actes[selectedActe];
  
  const doc = new jsPDF();
  
  let y = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('NotariaPrime - Calcul Frais Notariés', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Conforme tarif réglementé 2025/2026', pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  doc.setFontSize(11);
  doc.text(`Date : ${new Date().toLocaleString('fr-FR')}`, 20, y);
  y += lineHeight;
  doc.text(`Département : ${deptInfo?.nom} (${selectedDepartement})`, 20, y);
  y += lineHeight;
  
  if (deptInfo?.majoration > 0) {
    doc.setTextColor(255, 100, 0);
    doc.text(`⚠ Territoire DOM-TOM - Majoration +${deptInfo.majoration}%`, 20, y);
    doc.setTextColor(0, 0, 0);
    y += lineHeight;
  }
  
  doc.text(`Type d'acte : ${acteInfo?.label || 'N/A'}`, 20, y);
  y += lineHeight;
  
  if (acteInfo?.type === 'non_tarife') {
    doc.setFont('helvetica', 'bold');
    doc.text('⚖ ACTE NON TARIFÉ - HONORAIRES LIBRES', 20, y);
    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    doc.text(`Estimation : ${acteInfo.honorairesEstimes}`, 20, y);
    y += lineHeight * 2;
    doc.setFontSize(9);
    doc.text('Ces honoraires sont libres et doivent être convenus avec votre notaire.', 20, y);
    doc.text('Ils ne sont pas réglementés par le décret n°2020-179.', 20, y + 5);
  } else {
    doc.text(`Montant : ${montantActe} €`, 20, y);
    y += lineHeight * 2;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ÉMOLUMENTS', 20, y);
    y += lineHeight + 2;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Émoluments bruts :`, 20, y);
    doc.text(`${emolumentsDetail.bruts.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight;
    
    if (emolumentsDetail.majoration > 0) {
      doc.setTextColor(255, 100, 0);
      doc.text(`Majoration DOM-TOM (+${deptInfo?.majoration}%) :`, 20, y);
      doc.text(`+${emolumentsDetail.majoration.toFixed(2)} €`, pageWidth - 60, y);
      doc.setTextColor(0, 0, 0);
      y += lineHeight;
    }
    
    if (appliquerRemise && emolumentsDetail.remise20 > 0) {
      doc.setTextColor(0, 150, 0);
      doc.text(`Remise 20% (>100k€) :`, 20, y);
      doc.text(`-${emolumentsDetail.remise20.toFixed(2)} €`, pageWidth - 60, y);
      doc.setTextColor(0, 0, 0);
      y += lineHeight;
    }
    
    doc.text(`Total HT :`, 20, y);
    doc.text(`${emolumentsDetail.nets.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight;
    
    const tauxTVAText = getTauxTVA(selectedDepartement) === 0 ? 
      `TVA (0% - Exonéré) :` : 
      `TVA (${getTauxTVA(selectedDepartement)}%) :`;
    doc.text(tauxTVAText, 20, y);
    doc.text(`${(emolumentsDetail.nets * getTauxTVA(selectedDepartement) / 100).toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total TTC :`, 20, y);
    doc.text(`${totalEmolumentsTTC.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight * 2;
    
    doc.setFontSize(12);
    doc.text('DÉBOURS', 20, y);
    y += lineHeight + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`CSI :`, 20, y);
    doc.text(`${debours.csi.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total débours :`, 20, y);
    doc.text(`${totalDebours.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight * 2;
    
    doc.setFontSize(12);
    doc.text('FORMALITÉS', 20, y);
    y += lineHeight + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total TTC :`, 20, y);
    doc.text(`${totalFormalitesTTC.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight * 2;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DOCUMENTS', 20, y);
    y += lineHeight + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total TTC :`, 20, y);
    doc.text(`${totalDocumentsTTC.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight * 2;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TAXES ET DROITS', 20, y);
    y += lineHeight + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (taxes.typeBien === 'ancien') {
      doc.text(`Taxe départementale :`, 20, y);
      doc.text(`${taxes.departementale.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
      doc.text(`Taxe communale :`, 20, y);
      doc.text(`${taxes.communale.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
      doc.text(`Frais d'assiette :`, 20, y);
      doc.text(`${taxes.fraisAssiette.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`Total taxes :`, 20, y);
    doc.text(`${totalTaxes.toFixed(2)} €`, pageWidth - 60, y);
    y += lineHeight * 3;
    
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(20, y - 5, pageWidth - 20, y - 5);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GÉNÉRAL', 20, y);
    doc.text(`${totalGeneral.toFixed(2)} €`, pageWidth - 60, y);
    
    doc.setLineWidth(0.5);
    doc.line(20, y + 3, pageWidth - 20, y + 3);
  }
  
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Calcul conforme au Décret n°2020-179 du 27 février 2020', pageWidth / 2, footerY, { align: 'center' });
  if (appliquerRemise) {
    doc.text('Remise de 20% appliquée sur la tranche >100 000€', pageWidth / 2, footerY + 4, { align: 'center' });
  }
  doc.text(`Généré par NotariaPrime - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, footerY + 8, { align: 'center' });
  
  doc.save(`notariaprime_${Date.now()}.pdf`);
}