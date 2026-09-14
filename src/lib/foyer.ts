import { BAREME_IR_2026 } from './fiscal';

export interface FoyerFiscal { revenu: number; adultes: 1 | 2; enfants: number }
/** Cas ordinaires en métropole : enfants à charge exclusive, sans case T/L ou demi-part spéciale.
 * CGI 197, barème 2026 (revenus 2025), quotient plafonné et décote. Hors réductions/crédits/CEHR/CDHR.
 */
export function impotFoyer(revenu: number, foyer: FoyerFiscal) {
  if (![revenu, foyer.revenu].every(n => Number.isFinite(n) && n >= 0) || ![1, 2].includes(foyer.adultes) || !Number.isInteger(foyer.enfants) || foyer.enfants < 0 || foyer.enfants > 10) throw Error('Revenu, adultes ou enfants invalides.');
  const revenuArrondi = Math.round(revenu);
  const partsEnfants = Math.min(2, foyer.enfants) * .5 + Math.max(0, foyer.enfants - 2);
  const parts = foyer.adultes + partsEnfants;
  const bareme = (n: number) => BAREME_IR_2026.reduce((s, t) => s + Math.max(0, Math.min(n, t.max) - t.min) * t.taux, 0);
  const brut = Math.round(Math.max(bareme(revenuArrondi / parts) * parts, bareme(revenuArrondi / foyer.adultes) * foyer.adultes - partsEnfants * 2 * 1807));
  const decote = Math.round(Math.min(brut, Math.max(0, (foyer.adultes === 2 ? 1483 : 897) - brut * .4525)));
  const net = Math.max(0, brut - decote);
  return { parts, brut, decote, net };
}
export function variationIR(montant: number, tmi: number, foyer?: FoyerFiscal) {
  if (!Number.isFinite(montant) || !Number.isFinite(tmi) || tmi < 0 || tmi > 45) throw Error('Montant ou TMI invalide.');
  return foyer ? impotFoyer(Math.max(0, foyer.revenu + montant), foyer).net - impotFoyer(foyer.revenu, foyer).net : montant * tmi / 100;
}
