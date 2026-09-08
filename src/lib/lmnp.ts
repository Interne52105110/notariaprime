import { abattementsPlusValue, anneesRevolues, surtaxePlusValue } from './fiscal';

export type TypeMeuble = 'classique' | 'tourisme_classe' | 'tourisme_non_classe';
// CGI 50-0 ; BOI-BAREME-000044 du 19 août 2026 (recettes 2026).
export function microMeuble(type: TypeMeuble, recettes: number, n1: number, n2: number, conditions: boolean) {
  const plafond = type === 'tourisme_non_classe' ? 15000 : 83600;
  const taux = type === 'tourisme_non_classe' ? .3 : .5;
  const abattement = Math.min(recettes, Math.max(305, recettes * taux));
  return { plafond, taux, abattement, base: recettes - abattement, eligible: conditions && (n1 <= plafond || n2 <= plafond) };
}

export interface MeubleAnnuel {
  type: TypeMeuble; recettes: number; n1: number; n2: number; conditionsMicro: boolean;
  autresRevenus: number; charges: number; fraisReel: number; amortissement: number; reportAmortissement: number;
  deficitImputable: number; tmi: number; ps: number; socialForce: boolean;
  cotisationsMicro?: number; cotisationsReel?: number; cotisationsDeductibles?: number;
}

export function liquidationMeuble(p: MeubleAnnuel) {
  for (const [cle, valeur] of Object.entries(p)) if (typeof valeur === 'number' && (!Number.isFinite(valeur) || valeur < 0)) throw Error(`Montant invalide : ${cle}.`);
  if (p.tmi > 45 || p.ps > 18.6) throw Error('Vérifiez les taux fiscaux.');
  const lmp = p.recettes > 23000 && p.recettes > p.autresRevenus;
  const cotisant = p.socialForce || lmp || (p.type !== 'classique' && p.recettes > 23000);
  const micro = microMeuble(p.type, p.recettes, p.n1, p.n2, p.conditionsMicro);
  if (cotisant && (p.cotisationsReel === undefined || p.cotisationsDeductibles === undefined || (micro.eligible && p.cotisationsMicro === undefined))) throw Error('Renseignez les cotisations annuelles de chaque régime applicable et leur part déductible au réel, issues de votre estimation Urssaf (zéro accepté).');
  const socialDeductible = cotisant ? p.cotisationsDeductibles! : 0;
  if (socialDeductible > (p.cotisationsReel ?? 0)) throw Error('La part déductible ne peut pas dépasser les cotisations au réel.');
  const avantAmortissement = p.recettes - p.charges - p.fraisReel - socialDeductible;
  const amortissementDeduit = Math.min(p.amortissement + p.reportAmortissement, Math.max(0, avantAmortissement));
  const reportAmortissement = p.amortissement + p.reportAmortissement - amortissementDeduit;
  const avantDeficits = Math.max(0, avantAmortissement - amortissementDeduit);
  const deficitUtilise = lmp ? 0 : Math.min(avantDeficits, p.deficitImputable);
  const baseReel = avantDeficits - deficitUtilise;
  const socialMicro = cotisant ? (p.cotisationsMicro ?? 0) : micro.base * p.ps / 100;
  const socialReel = cotisant ? p.cotisationsReel! : baseReel * p.ps / 100;
  const irMicro = micro.base * p.tmi / 100;
  const irReel = baseReel * p.tmi / 100;
  const cashMicro = p.recettes - p.charges - irMicro - socialMicro;
  const cashReel = p.recettes - p.charges - p.fraisReel - irReel - socialReel;
  return { lmp, cotisant, micro, avantAmortissement, amortissementDeduit, reportAmortissement,
    deficitCree: Math.max(0, -avantAmortissement), deficitUtilise, deficitRestant: p.deficitImputable - deficitUtilise,
    baseReel, socialMicro, socialReel, irMicro, irReel, cashMicro, cashReel,
    economieReel: micro.eligible ? cashReel - cashMicro : null };
}

export function planAmortissementMeuble(prix: number, terrain: number, mobilier: number, dureeImmo: number, dureeMobilier: number) {
  if (![prix, terrain, mobilier, dureeImmo, dureeMobilier].every(Number.isFinite) || prix < 0 || mobilier < 0 || terrain < 0 || terrain > 100 || dureeImmo <= 0 || dureeMobilier <= 0) throw Error('Vérifiez les valeurs, la quote-part du terrain et les durées.');
  const base = prix * (1 - terrain / 100);
  return { base, immo: base / dureeImmo, mobilier: mobilier / dureeMobilier, total: base / dureeImmo + mobilier / dureeMobilier };
}

export function plusValueMeuble(p: { acquisition: number; vente: number; fraisAcquisition: number; fraisVente: number; travaux: number; reintegration: number; exceptionResidence: boolean; dateAcquisition: string; dateVente: string; ps: number }) {
  for (const v of [p.acquisition,p.vente,p.fraisAcquisition,p.fraisVente,p.travaux,p.reintegration,p.ps]) if (!Number.isFinite(v) || v < 0) throw Error('Vérifiez les montants de la revente.');
  if (!p.dateAcquisition || !p.dateVente || !Number.isFinite(Date.parse(p.dateAcquisition)) || !Number.isFinite(Date.parse(p.dateVente)) || p.dateVente < p.dateAcquisition) throw Error('Les dates de détention sont invalides.');
  if (p.fraisVente > p.vente || p.reintegration > p.acquisition + p.fraisAcquisition + p.travaux) throw Error('Frais ou amortissements supérieurs à leur base.');
  const annees = anneesRevolues(p.dateAcquisition, p.dateVente);
  const reintegration = p.exceptionResidence ? 0 : p.reintegration;
  const brute = Math.max(0,p.vente-p.fraisVente-p.acquisition-p.fraisAcquisition-p.travaux+reintegration);
  const abattements = abattementsPlusValue(annees);
  const exonere = p.vente <= 15000;
  const baseIR = exonere ? 0 : brute*(1-abattements.ir/100);
  const basePS = exonere ? 0 : brute*(1-abattements.ps/100);
  const ir=baseIR*.19, social=basePS*p.ps/100, surtaxe=surtaxePlusValue(baseIR);
  return {annees,reintegration,brute,abattements,ir,social,surtaxe,total:ir+social+surtaxe,net:p.vente-p.fraisVente-ir-social-surtaxe};
}
