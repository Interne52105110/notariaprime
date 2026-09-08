import { BAREME_SUCCESSION as DONATION, appliquerBareme } from './donation';
export type LienSuccession = keyof typeof DONATION | 'parent' | 'parent-4e';
export interface EntreeSuccession {
  partNette: number; lien: LienSuccession; handicap?: boolean;
  abattementConsomme?: number; baseAnterieureTaxable?: number;
  representation?: 'enfant' | 'frere-soeur'; nombreRepresentants?: number;
  fratrieExoneree?: boolean; nuePropriete?: boolean; ageUsufruitier?: number;
}
export function usufruitFiscal(age: number): number {
  if (!Number.isFinite(age) || age < 0 || age > 120) throw new RangeError('Âge invalide');
  return Math.max(10, 90 - Math.max(0, Math.floor((age - 1) / 10) - 1) * 10);
}
/** CGI 777, 779, 788 IV, 796-0 bis/ter, 669. Parts civiles déterminées en amont. */
export function droitsSuccession(e: EntreeSuccession) {
  for (const n of [e.partNette, e.abattementConsomme ?? 0, e.baseAnterieureTaxable ?? 0]) if (!Number.isFinite(n) || n < 0) throw new RangeError('Montant invalide');
  const exonere = ['conjoint','partenaire-pacs'].includes(e.lien) || (e.lien === 'frere-soeur' && !!e.fratrieExoneree);
  const lien = e.representation ?? e.lien;
  const nombre = e.representation ? (e.nombreRepresentants ?? 1) : 1;
  if (!Number.isInteger(nombre) || nombre < 1) throw new RangeError('Nombre de représentants invalide');
  const ligneDirecte = ['enfant','parent','petit-enfant','arriere-petit-enfant'].includes(lien);
  const tranches = ligneDirecte ? DONATION.enfant.tranches : lien === 'frere-soeur' ? DONATION['frere-soeur'].tranches : ['neveu-niece','parent-4e'].includes(lien) ? DONATION['neveu-niece'].tranches : DONATION.autre.tranches;
  let abattement = (['enfant','parent'].includes(lien) ? 100000 : lien === 'frere-soeur' ? 15932 : lien === 'neveu-niece' ? 7967 : 1594) / nombre;
  if (e.handicap) abattement = (abattement === 1594 ? 0 : abattement) + 159325;
  const disponible = Math.max(0, abattement - (e.abattementConsomme ?? 0));
  const valeurFiscale = e.partNette * (e.nuePropriete ? (100-usufruitFiscal(e.ageUsufruitier ?? NaN))/100 : 1);
  const base = exonere ? 0 : Math.max(0, valeurFiscale-disponible);
  const rappel = e.baseAnterieureTaxable ?? 0;
  const droits = exonere ? 0 : Math.round(appliquerBareme(base+rappel,tranches)-appliquerBareme(rappel,tranches));
  return { valeurFiscale, abattement: disponible, base, droits, exonere, net: e.partNette-droits };
}
/** CGI 790 : double liquidation ; fraction éligible dans les tranches supérieures. */
export function reductionDroitsDutreil(base: number, fractionEligible: number, rappel: number, tranches: Array<{max:number;taux:number}>, age: number, pleinePropriete: boolean) {
  if (!pleinePropriete || !Number.isFinite(age) || age < 0 || age >= 70 || base <= 0) return 0;
  const eligible = Math.max(0, Math.min(base, fractionEligible));
  return (appliquerBareme(rappel+base,tranches)-appliquerBareme(rappel+base-eligible,tranches))*0.5;
}
