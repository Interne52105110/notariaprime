export function echeanceAnnuelle(capital: number, taux: number, duree: number, annee: number) {
  if (capital <= 0) return { interets: 0, principal: 0 };
  if (![capital,taux,duree,annee].every(Number.isFinite) || taux < 0 || duree <= 0 || annee < 1) throw new RangeError('Paramètres de prêt invalides.');
  const mois = Math.round(duree * 12), i = taux / 1200;
  const mensualite = i === 0 ? capital / mois : capital * i / -Math.expm1(-mois * Math.log1p(i));
  let restant = capital, interets = 0, principal = 0;
  for (let m = 1; m <= Math.min(mois, annee * 12); m++) {
    const interet = restant * i, amortissement = Math.min(restant, mensualite - interet);
    if (m > (annee - 1) * 12) { interets += interet; principal += amortissement; }
    restant = Math.max(0, restant - amortissement);
  }
  return { interets, principal };
}

export function impotSociete(benefice: number, tauxReduit = true) {
  const b = Math.max(0, benefice);
  return tauxReduit ? Math.min(b, 42500) * .15 + Math.max(0, b - 42500) * .25 : b * .25;
}

export interface HoldingParametres {
  valeur: number; bati: number; loyers: number; charges: number; taxe: number;
  emprunt: number; taux: number; duree: number; amortissement: number;
  comptabilite: number; gestion: number; tmi: number; distribuer: boolean; tauxReduit: boolean;
}

/** SCI à l'IS détenue à 100 % par une holding IS, régime mère-fille éligible.
 * Pas de rendement implicite sur le cash. Reports fiscaux et réserves suivis séparément.
 */
export function projectionHolding(p: HoldingParametres, annees = 30) {
  let deficitSCI = 0, deficitHolding = 0, reservesSCI = 0, reservesHolding = 0;
  let cashSCI = 0, cashHolding = 0, cumulPersonnel = 0, cumulDirect = 0;
  return Array.from({ length: annees }, (_, index) => {
    const annee = index + 1;
    const pret = p.emprunt > 0 ? echeanceAnnuelle(p.emprunt, p.taux, p.duree, annee) : { interets:0, principal:0 };
    const amort = Math.max(0, Math.min(p.bati * p.amortissement, p.bati - p.bati * p.amortissement * index));
    const marge = p.loyers - p.charges - p.taxe - pret.interets;
    const impotDirect = Math.max(0, marge) * (p.tmi / 100 + .172);
    const netDirect = marge - pret.principal - impotDirect;
    cumulDirect += netDirect;
    const resultatSCI = marge - p.comptabilite - amort;
    const reportUtilise = Math.min(deficitSCI, Math.max(0,resultatSCI), 1e6 + Math.max(0,resultatSCI - 1e6) * .5);
    const baseSCI = Math.max(0,resultatSCI - reportUtilise);
    const isSCI = impotSociete(baseSCI,p.tauxReduit);
    deficitSCI = deficitSCI - reportUtilise + Math.max(0,-resultatSCI);
    reservesSCI += resultatSCI - isSCI;
    const cashSCIAnnee = marge - p.comptabilite - pret.principal - isSCI;
    cashSCI += cashSCIAnnee;
    const remontee = Math.max(0,Math.min(cashSCI,reservesSCI));
    cashSCI -= remontee; reservesSCI -= remontee;
    const quotePart = remontee * .05;
    const resultatHoldingFiscal = quotePart - p.gestion;
    const reportHolding = Math.min(deficitHolding, Math.max(0,resultatHoldingFiscal),1e6 + Math.max(0,resultatHoldingFiscal - 1e6)*.5);
    const isHolding = impotSociete(Math.max(0,resultatHoldingFiscal-reportHolding),p.tauxReduit);
    deficitHolding = deficitHolding - reportHolding + Math.max(0,-resultatHoldingFiscal);
    const beneficeHolding = remontee - p.gestion - isHolding;
    reservesHolding += beneficeHolding; cashHolding += beneficeHolding;
    const distribution = p.distribuer ? Math.max(0,Math.min(reservesHolding,cashHolding)) : 0;
    reservesHolding -= distribution; cashHolding -= distribution;
    const pfu = distribution * .314;
    cumulPersonnel += distribution - pfu;
    const netGroupe = cashSCIAnnee - p.gestion - isHolding;
    return { annee, ...pret, amort, resultatSCI, baseSCI, isSCI, remontee, quotePart, isHolding,
      beneficeSCI:resultatSCI-isSCI, distribution, pfu, netDistribue:distribution-pfu,
      netDirect, impotDirect, netGroupe, cashSCI, cashHolding, cumulPersonnel,
      cumulDirect, cumulHolding:p.distribuer ? cumulPersonnel : cashSCI+cashHolding,
      differenceAnnuelle:(p.distribuer ? distribution-pfu : netGroupe)-netDirect };
  });
}
