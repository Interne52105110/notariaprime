// Path: C:\notariaprime\src\app\pretaxe\PretaxeCalculations.ts

import { arrondirRatio, lireMontant } from '@/lib/montants';
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
  Taxes
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
  if (!Number.isFinite(montant) || montant < 0 || montant > 1e12) throw new RangeError('Assiette invalide');
  // A444-54 : assiette arrondie à l'euro. A444-58 : minimum 500 € si positive.
  const base = montant > 0 ? Math.max(500, Math.round(montant)) : 0;
  const numerateur = (debut: number) => tranches.reduce((sum, tranche) => {
    const part = Math.max(0, Math.min(base, tranche.max) - Math.max(debut, tranche.min));
    return sum + BigInt(Math.round(part)) * BigInt(Math.round(tranche.taux * 1000));
  }, BigInt(0));
  // Les taux sont en millièmes de pourcent : aucune multiplication monétaire binaire.
  const brut = numerateur(0);
  const majoration = BigInt(getMajorationDOMTOM(selectedDepartement));
  const avant = brut * (BigInt(100) + majoration);
  const auDela = appliquerRemise && base > 100000 ? numerateur(100000) * (BigInt(100) + majoration) : BigInt(0);
  const euros = (n: bigint, d: bigint) => arrondirRatio(n * BigInt(100), d) / 100;
  return {
    bruts: euros(brut, BigInt(100000)),
    majoration: euros(brut * majoration, BigInt(10000000)),
    avantRemise: euros(avant, BigInt(10000000)),
    remise10: 0,
    remise20: euros(auDela, BigInt(50000000)),
    nets: euros(avant * BigInt(5) - auDela, BigInt(50000000)),
  };
}

/** A444-82 : forfait jusqu'au seuil, barème sur TOUTE l'assiette au-delà. */
export function calculerEmolumentsMariage(montant:number, departement:string, remise:boolean):EmolumentsDetail {
  if(!Number.isFinite(montant)||montant<0)throw new RangeError('Assiette invalide');
  if(montant<=30800){
    const bruts=188.68, majoration=Math.round(bruts*getMajorationDOMTOM(departement))/100;
    const nets=Math.round((bruts+majoration)*100)/100;
    return {bruts,majoration,avantRemise:nets,remise10:0,remise20:0,nets};
  }
  return calculerEmoluments(montant,[{min:0,max:6500,taux:1.29},{min:6500,max:17000,taux:.532},{min:17000,max:60000,taux:.355},{min:60000,max:Infinity,taux:.266}],departement,remise);
}
/** A444-104 : trois assiettes distinctes définies par l'acte. */
export function calculerEmolumentsBail(bases:[number,number,number],departement:string,remise:boolean):EmolumentsDetail {
  if(bases.some(n=>!Number.isFinite(n)||n<0))throw new RangeError('Assiette invalide');
  const taux=[[3.289,1.809,1.234,.905],[1.258,.692,.472,.346],[2.322,1.277,.871,.639]];
  const limites=[0,6500,17000,30000,Infinity];
  const total:EmolumentsDetail={bruts:0,majoration:0,avantRemise:0,remise10:0,remise20:0,nets:0};
  bases.forEach((base,i)=>{
    const detail=calculerEmoluments(base,taux[i].map((t,j)=>({min:limites[j],max:limites[j+1],taux:t})),departement,remise);
    for(const key of Object.keys(total) as (keyof EmolumentsDetail)[])total[key]=Math.round((total[key]+detail[key])*100)/100;
  });
  return total;
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
  if (!montantActe || typeBien === 'aucune') {
    setTaxes(prev => ({ ...prev, departementale: 0, communale: 0, fraisAssiette: 0 }));
    return;
  }

  const montant = lireMontant(montantActe);
  if (montant === null) return;

  // CGI 735 : prix distinct et désignation/estimation des meubles dans l’acte.
  // Aucun forfait automatique de 5 % sans justification.
  const mobilier = Math.max(0, Math.min(valeurMobilier || 0, montant));
  const assietteDMTO = montant - mobilier;

  // LF 2025 art. 116 : les primo-accédants en résidence principale échappent à la
  // hausse votée par les départements et restent au taux plafond historique de 4.50%.
  const tauxDepartementalBase = departements[selectedDepartement]?.taux || 4.50;
  const tauxDepartemental = typeBien === 'neuf' ? 0.70 : primoAccedant ? Math.min(tauxDepartementalBase, 4.50) : tauxDepartementalBase;
  const tauxCommunal = typeBien === 'neuf' ? 0 : 1.20;
  
  // Les droits payés au Trésor sont arrondis à l'euro le plus proche (CGI art. 1724).
  const roundEuro = (n: number) => Math.round(n);
  const taxeDepartementale = roundEuro(assietteDMTO * (tauxDepartemental / 100));
  const taxeCommunale = roundEuro(assietteDMTO * (tauxCommunal / 100));
  // Art. 1647-V CGI : prélèvement de 2,37% sur la seule taxe départementale
  const fraisAssiette = roundEuro(taxeDepartementale * (typeBien === 'neuf' ? 0.0214 : 0.0237));

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
  tauxPourMille: number = 1,
  baseOverride?: number
) {
  if (!montantActe) return;

  const montant = lireMontant(montantActe);
  if (montant === null) return;

  // Pour une sûreté, l'assiette est le capital majoré des accessoires (cf.
  // baseOverride). CSI arrondie à l'euro (CGI art. 1724), minimum 15 € (art. 881 M).
  const base = baseOverride ?? montant;
  const csi = Math.round(Math.max(base * (tauxPourMille / 1000), 15));

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
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>,
  baseOverride?: number
) {
  if (!montantActe) return;
  const montant = lireMontant(montantActe);
  if (montant === null) return;

  // Assiette = capital garanti majoré des accessoires (baseOverride). TPF
  // arrondie à l'euro le plus proche (CGI art. 1724).
  const base = baseOverride ?? montant;
  const tpf = Math.round(base * 0.00715);

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
  const montant = lireMontant(montantActe);
  if (montant === null) return;

  const taux = regime === 'divorce' ? 1.10 : 2.50;
  // Droit de partage arrondi à l'euro le plus proche (CGI art. 1724).
  const droitPartage = Math.max(25, Math.round(Math.max(0, Math.round(montant)) * (taux / 100))); // minimum CGI 674, hors exonération particulière

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
    urbanisme: 0,
    etatsHypothecaires: 0,
    cadastre: 0,
  }));
  
  // Appliquer les formalités
  if (config.formalites) {
    setFormalites(prev => ({
      ...prev,
      publiciteFonciere: {
        actif: !['donation','donation_partage','donation_mobiliere'].includes(acteKey) && (config.formalites?.publiciteFonciere?.defaut || false),
        montant: config.formalites?.publiciteFonciere?.montant ?? 339.58
      },
      cadastre: {
        actif: false,
        montant: config.formalites?.cadastre?.montant ?? 11.32
      },
      casierJudiciaire: {
        actif: config.formalites?.casierJudiciaire?.defaut || false,
        montant: config.formalites?.casierJudiciaire?.montant ?? 37.73
      },
      notification: {
        actif: false,
        montant: config.formalites?.notification?.montant ?? 15.09
      },
      mesurage: {
        actif: false,
        montant: config.formalites?.mesurage?.montant ?? 15.09
      },
      diagnostics: {
        dpe: {
          actif: false,
          montant: config.formalites?.diagnostics?.dpe?.montant ?? 15.09
        },
        amiante: {
          actif: false,
          montant: config.formalites?.diagnostics?.amiante?.montant ?? 15.09
        },
        plomb: {
          actif: false,
          montant: config.formalites?.diagnostics?.plomb?.montant ?? 15.09
        },
        termites: {
          actif: false,
          montant: config.formalites?.diagnostics?.termites?.montant ?? 15.09
        },
        gaz: {
          actif: false,
          montant: config.formalites?.diagnostics?.gaz?.montant ?? 15.09
        },
        electricite: {
          actif: false,
          montant: config.formalites?.diagnostics?.electricite?.montant ?? 15.09
        },
        erp: {
          actif: false,
          montant: config.formalites?.diagnostics?.erp?.montant ?? 15.09
        }
      },
      transmissionCSN: {
        actif: config.formalites?.transmissionCSN?.defaut || false,
        montant: config.formalites?.transmissionCSN?.montant ?? 15.31
      },
      requisition: {
        actif: false,
        montant: config.formalites?.requisition?.montant ?? 18.87
      },
      // Télé@ctes : uniquement pour les actes publiés au SPF (alignés sur la
      // publicité foncière). Lettres recommandées : non systématiques (off).
      teleactes: {
        actif: false,
        montant: 0
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
      pagesActe: 0,
      copiesExecutoires: 0,
      copiesAuthentiques: 0,
      copiesHypothecaires: 0,
      copiesLibres: 0,
      archivageNumerise: false
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
  return formalite != null && 'obligatoire' in formalite && formalite.obligatoire === true;
}
