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
  
  const round2 = (n: number) => Math.round(n * 100) / 100;
  return {
    bruts: round2(emolumentsBruts),
    majoration: round2(majoration),
    avantRemise: round2(emolumentsAvantRemise),
    remise10: 0,
    remise20: round2(remise20),
    nets: round2(emolumentsNets)
  };
}

// ============================================================================
// CALCUL DES TAXES
// ============================================================================

export function calculerTaxes(
  montantActe: string,
  selectedDepartement: string,
  typeBien: string,
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>,
  primoAccedant: boolean = false,
  valeurMobilier: number = 0
) {
  if (!montantActe || typeBien === 'neuf' || typeBien === 'aucune') return;

  const montant = parseFloat(montantActe.replace(/\s/g, ''));
  if (isNaN(montant)) return;

  // Art. 1245 CGI : les meubles meublants justifiés par un inventaire
  // détaillé sont exclus de l'assiette des DMTO. Tolérance ~5% du prix
  // sans inventaire ; au-delà l'inventaire est requis.
  const mobilier = Math.max(0, Math.min(valeurMobilier || 0, montant));
  const assietteDMTO = montant - mobilier;

  // LF 2025 art. 116 : les primo-accédants en résidence principale échappent à la
  // hausse votée par les départements et restent au taux plafond historique de 4.50%.
  const tauxDepartementalBase = departements[selectedDepartement]?.taux || 4.50;
  const tauxDepartemental = primoAccedant ? Math.min(tauxDepartementalBase, 4.50) : tauxDepartementalBase;
  const tauxCommunal = 1.20;
  
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const taxeDepartementale = round2(assietteDMTO * (tauxDepartemental / 100));
  const taxeCommunale = round2(assietteDMTO * (tauxCommunal / 100));
  // Art. 1647-V CGI : prélèvement de 2,37% sur la seule taxe départementale
  const fraisAssiette = round2(taxeDepartementale * 0.0237);

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

/**
 * Contribution de sécurité immobilière (CGI art. 879 à 881 M).
 * @param tauxPourMille 1 (0,10 %) pour une publication d'acte translatif
 *   (vente, partage…) ; 0,5 (0,05 %) pour une inscription d'hypothèque.
 *   Minimum de perception : 15 € (art. 881 M).
 */
export function calculerCSI(
  montantActe: string,
  setDebours: React.Dispatch<React.SetStateAction<Debours>>,
  tauxPourMille: number = 1
) {
  if (!montantActe) return;

  const montant = parseFloat(montantActe.replace(/\s/g, ''));
  if (isNaN(montant)) return;

  const csi = Math.round(Math.max(montant * (tauxPourMille / 1000), 15) * 100) / 100;

  setDebours(prev => ({
    ...prev,
    csi: csi
  }));
}

/**
 * Taxe de publicité foncière sur l'inscription d'une hypothèque
 * conventionnelle : 0,715 % du capital garanti (CGI art. 663, 844).
 */
export function calculerTPF(
  montantActe: string,
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>
) {
  if (!montantActe) return;
  const montant = parseFloat(montantActe.replace(/\s/g, ''));
  if (isNaN(montant)) return;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const tpf = round2(montant * 0.00715);

  setTaxes(prev => ({
    ...prev,
    departementale: 0,
    communale: 0,
    fraisAssiette: 0,
    droitPartage: 0,
    tpf,
  }));
}

/**
 * Droit de partage (CGI art. 746) : 2,50 %, ramené à 1,10 % depuis le
 * 1ᵉʳ janvier 2022 pour les partages des intérêts patrimoniaux consécutifs
 * à un divorce, une séparation de corps ou une rupture de PACS.
 */
export function calculerDroitPartage(
  montantActe: string,
  regime: 'standard' | 'divorce',
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>
) {
  if (!montantActe) return;
  const montant = parseFloat(montantActe.replace(/\s/g, ''));
  if (isNaN(montant)) return;

  const taux = regime === 'divorce' ? 1.10 : 2.50;
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const droitPartage = round2(montant * (taux / 100));

  setTaxes(prev => ({
    ...prev,
    departementale: 0,
    communale: 0,
    fraisAssiette: 0,
    tpf: 0,
    droitPartage,
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
  
  // Appliquer les débours. La CSI est remise à 0 à chaque changement d'acte :
  // elle n'est recalculée (page.tsx) que pour les actes publiés au SPF.
  setDebours(prev => ({
    ...prev,
    csi: 0,
    etatsHypothecaires: config.debours?.etatsHypothecaires?.defaut
      ? (config.debours.etatsHypothecaires.montant ?? 50) : 0,
    cadastre: config.debours?.cadastre?.defaut
      ? (config.debours.cadastre.montant ?? 0) : 0,
  }));
  
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
        montant: config.formalites?.notification?.montant || 15.09
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
      },
      // Télé@ctes : uniquement pour les actes publiés au SPF (alignés sur la
      // publicité foncière). Lettres recommandées : non systématiques (off).
      teleactes: {
        actif: config.formalites?.publiciteFonciere?.defaut || false,
        montant: 50
      },
      lettresRecommandees: { actif: false, montant: 7.08 },
      // Déclaration de plus-value (A444-172 n°206) : à activer pour les ventes
      // de biens taxables (résidence secondaire, locatif…).
      declarationPlusValue: { actif: false, montant: 56.60 }
    }));
  }
  
  // Appliquer les documents
  if (config.documents) {
    setDocuments({
      pagesActe: config.documents.pagesActe || 10,
      copiesExecutoires: config.documents.copiesExecutoires || 0,
      copiesAuthentiques: config.documents.copiesAuthentiques || 1,
      copiesHypothecaires: config.documents.copiesHypothecaires || 0,
      archivageNumerise: true
    });
  }
  
  // Appliquer le type de taxes
  if (config.taxes) {
    if (config.taxes.type === 'dmto') {
      setTaxes(prev => ({
        ...prev,
        typeBien: 'ancien',
        tpf: 0,
        droitPartage: 0,
      }));
    } else if (config.taxes.type === 'tva') {
      setTaxes(prev => ({
        ...prev,
        typeBien: 'neuf',
        tpf: 0,
        droitPartage: 0,
      }));
    } else if (config.taxes.type === 'tpf') {
      setTaxes(prev => ({
        ...prev,
        typeBien: 'tpf',
        departementale: 0,
        communale: 0,
        fraisAssiette: 0,
        droitPartage: 0,
      }));
    } else if (config.taxes.type === 'partage') {
      setTaxes(prev => ({
        ...prev,
        typeBien: 'partage',
        // Préserve le régime choisi par l'utilisateur entre deux recalculs.
        regimePartage: prev.regimePartage ?? 'standard',
        departementale: 0,
        communale: 0,
        fraisAssiette: 0,
        tpf: 0,
      }));
    } else {
      // 'aucune', 'donation', etc. : pas de taxe automatique
      setTaxes({
        typeBien: 'aucune',
        departementale: 0,
        communale: 0,
        fraisAssiette: 0,
        tpf: 0,
        droitPartage: 0,
      });
    }
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
  doc.text('Conforme tarif réglementé 2026/2028 - Arrêté du 25 février 2026', pageWidth / 2, y, { align: 'center' });
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
    if (taxes.tpf && taxes.tpf > 0) {
      doc.text(`Taxe de publicité foncière (0,715%) :`, 20, y);
      doc.text(`${taxes.tpf.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
    }
    if (taxes.droitPartage && taxes.droitPartage > 0) {
      doc.text(`Droit de partage (${taxes.regimePartage === 'divorce' ? '1,10' : '2,50'}%) :`, 20, y);
      doc.text(`${taxes.droitPartage.toFixed(2)} €`, pageWidth - 60, y);
      y += lineHeight;
    }
    if (taxes.droitFixe && taxes.droitFixe > 0) {
      doc.text(`Droit fixe d'enregistrement :`, 20, y);
      doc.text(`${taxes.droitFixe.toFixed(2)} €`, pageWidth - 60, y);
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
  doc.text('Décret n°2020-179 du 27 février 2020 • Arrêté du 25 février 2026 (en vigueur 01/03/2026 - 29/02/2028)', pageWidth / 2, footerY, { align: 'center' });
  if (appliquerRemise) {
    doc.text('Remise de 20% appliquée sur la tranche >100 000€', pageWidth / 2, footerY + 4, { align: 'center' });
  }
  doc.text(`Généré par NotariaPrime - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, footerY + 8, { align: 'center' });
  
  doc.save(`notariaprime_${Date.now()}.pdf`);
}