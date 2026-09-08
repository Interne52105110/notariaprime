// Donations entre vifs : CGI 777, 779, 790 B, 790 D, 790 E et 790 F.
export const BAREME_SUCCESSION = {
  enfant: {
    abattement: 100000,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 12109, taux: 10 },
      { max: 15932, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  'petit-enfant': {
    abattement: 31865,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 12109, taux: 10 },
      { max: 15932, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  'arriere-petit-enfant': {
    abattement: 5310,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 12109, taux: 10 },
      { max: 15932, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  conjoint: {
    abattement: 80724,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 15932, taux: 10 },
      { max: 31865, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  'partenaire-pacs': {
    abattement: 80724,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 15932, taux: 10 },
      { max: 31865, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  'frere-soeur': {
    abattement: 15932,
    tranches: [
      { max: 24430, taux: 35 },
      { max: Infinity, taux: 45 }
    ]
  },
  'neveu-niece': {
    abattement: 7967,
    tranches: [
      { max: Infinity, taux: 55 }
    ]
  },
  autre: {
    abattement: 0,
    tranches: [
      { max: Infinity, taux: 60 }
    ]
  }
};

export function appliquerBareme(
  base: number,
  tranches: Array<{ max: number; taux: number }>
): number {
  let droits = 0;
  let reste = Math.max(0, base);
  let trancheInf = 0;
  for (const tranche of tranches) {
    if (reste <= 0) break;
    const montantTranche = Math.min(reste, tranche.max - trancheInf);
    droits += montantTranche * (tranche.taux / 100);
    reste -= montantTranche;
    trancheInf = tranche.max;
  }
  return droits;
}

