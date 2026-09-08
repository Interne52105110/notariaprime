/** Economic scenarios, with monthly payments in arrears. No mortality table is embedded. */
export function facteurMensuelViager(annees: number, tauxAnnuel: number): number {
  if (!Number.isFinite(annees) || annees <= 0 || !Number.isFinite(tauxAnnuel) || tauxAnnuel < 0) throw new RangeError('Durée positive et taux positif ou nul requis.');
  const mois = annees * 12;
  const i = Math.expm1(Math.log1p(tauxAnnuel / 100) / 12);
  return i === 0 ? mois : -Math.expm1(-mois * Math.log1p(i)) / i;
}

export function fractionRenteImposable(agePremierVersement: number): number {
  if (!Number.isFinite(agePremierVersement) || agePremierVersement < 0) throw new RangeError('Âge invalide.');
  return agePremierVersement < 50 ? .7 : agePremierVersement < 60 ? .5 : agePremierVersement < 70 ? .4 : .3;
}

export function scenarioViager(p: { valeur: number; bouquet: number; occupation: number; horizon: number; taux: number; methode: 'lineaire' | 'actualisee' | 'coefficient'; coefficient: number }) {
  for (const n of [p.valeur, p.bouquet, p.occupation]) if (!Number.isFinite(n) || n < 0) throw new RangeError('Montants positifs ou nuls requis.');
  if (p.valeur <= 0 || p.occupation > p.valeur || p.bouquet > p.valeur - p.occupation) throw new RangeError('Le bouquet et la valeur d’occupation ne peuvent dépasser la valeur du bien.');
  const facteur = facteurMensuelViager(p.horizon, p.methode === 'lineaire' ? 0 : p.taux);
  if (p.methode === 'coefficient' && (!Number.isFinite(p.coefficient) || p.coefficient <= 0)) throw new RangeError('Coefficient actuariel annuel positif requis.');
  const capital = p.valeur - p.occupation - p.bouquet;
  const rente = capital / (p.methode === 'coefficient' ? p.coefficient * 12 : facteur);
  return { capital, rente, totalHorizon: p.bouquet + rente * 12 * p.horizon, valeurOccupee: p.valeur - p.occupation };
}
