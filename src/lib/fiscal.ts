/** Règles communes vérifiées le 8 septembre 2026. Sources : docs/AUDIT-FISCAL-2026-09-08.md. */
export const BAREME_IR_2026 = [
  { min: 0, max: 11600, taux: 0 },
  { min: 11600, max: 29579, taux: 0.11 },
  { min: 29579, max: 84577, taux: 0.30 },
  { min: 84577, max: 181917, taux: 0.41 },
  { min: 181917, max: Infinity, taux: 0.45 },
];

/** Années révolues de date à date, sans approximation par 365,25 jours. */
export function anneesRevolues(debutISO: string, finISO: string): number {
  const debut = new Date(`${debutISO}T00:00:00Z`);
  const fin = new Date(`${finISO}T00:00:00Z`);
  if (!Number.isFinite(debut.getTime()) || !Number.isFinite(fin.getTime()) || fin < debut) return NaN;
  let annees = fin.getUTCFullYear() - debut.getUTCFullYear();
  const anniversaire = new Date(debut);
  anniversaire.setUTCFullYear(fin.getUTCFullYear());
  if (fin < anniversaire) annees--;
  return annees;
}

/** CGI 150 VC : pourcentages d'abattement, non des fractions. */
export function abattementsPlusValue(duree: number) {
  const annees = Math.max(0, Math.floor(duree));
  return {
    ir: annees >= 22 ? 100 : Math.max(0, annees - 5) * 6,
    ps: annees >= 30 ? 100 : annees >= 22 ? 28 + (annees - 22) * 9 : Math.max(0, annees - 5) * 1.65,
  };
}

/** CGI 1609 nonies G : taux sur la PV entière et lissages légaux. */
export function surtaxePlusValue(pv: number): number {
  if (pv <= 50000) return 0;
  if (pv <= 60000) return pv * 0.02 - (60000 - pv) * 0.05;
  if (pv <= 100000) return pv * 0.02;
  if (pv <= 110000) return pv * 0.03 - (110000 - pv) * 0.10;
  if (pv <= 150000) return pv * 0.03;
  if (pv <= 160000) return pv * 0.04 - (160000 - pv) * 0.15;
  if (pv <= 200000) return pv * 0.04;
  if (pv <= 210000) return pv * 0.05 - (210000 - pv) * 0.20;
  if (pv <= 250000) return pv * 0.05;
  if (pv <= 260000) return pv * 0.06 - (260000 - pv) * 0.25;
  return pv * 0.06;
}

/** CGI 977 : la décote ne s'applique qu'aux contribuables assujettis. */
export function decoteIFI(assiette: number): number {
  return assiette > 1300000 && assiette < 1400000 ? 17500 - assiette * 0.0125 : 0;
}

/** CGI 156 I 3° : les loyers s'imputent d'abord sur les intérêts. */
export function repartirDeficitFoncier(loyers: number, interets: number, autresCharges: number, plafond = 10700) {
  const deficit = Math.max(0, interets + autresCharges - loyers);
  const imputation = Math.min(deficit, Math.max(0, autresCharges), plafond);
  return { deficit, imputation, report: deficit - imputation };
}

export function plusDeCinqAns(debutISO: string, finISO: string): boolean {
  const anniversaire = new Date(`${debutISO}T00:00:00Z`);
  anniversaire.setUTCFullYear(anniversaire.getUTCFullYear() + 5);
  return new Date(`${finISO}T00:00:00Z`) > anniversaire;
}

/** CGI 974 IV : limitation générale, hors preuve d'un objectif non principalement fiscal. */
export function limiterDettesIFI(patrimoineBrutTaxable: number, dettes: number): number {
  const seuil = patrimoineBrutTaxable * 0.6;
  return patrimoineBrutTaxable > 5000000 && dettes > seuil ? seuil + (dettes - seuil) * 0.5 : dettes;
}

/** Plus-value d'un actif professionnel amortissable, avant exonérations. */
export function plusValueProfessionnelle(cession: number, acquisition: number, amortissements: number) {
  return cession - Math.max(0, acquisition - Math.min(acquisition, Math.max(0, amortissements)));
}
