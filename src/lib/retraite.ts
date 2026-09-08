/** Départs à compter du 1er septembre 2026, régime général sédentaire. */
export function parametresRetraite(naissance: string) {
  const [an,mois] = naissance.split('-').map(Number);
  if (an < 1950 || an > 2008 || !mois) throw new RangeError('Date hors périmètre');
  if (an===1950) return {ans:60,mois:0,trimestres:162};
  if (an===1951) return {ans:60,mois:mois<7?0:4,trimestres:163};
  if (an===1952) return {ans:60,mois:9,trimestres:164};
  if (an===1953) return {ans:61,mois:2,trimestres:165};
  if (an===1954) return {ans:61,mois:7,trimestres:165};
  if (an<=1957) return {ans:62,mois:0,trimestres:166};
  if (an<=1960) return {ans:62,mois:0,trimestres:167};
  if (an===1961) return {ans:62,mois:mois<9?0:3,trimestres:168};
  if (an===1962) return {ans:62,mois:6,trimestres:169};
  if (an<=1964 || (an===1965 && mois<=3)) return {ans:62,mois:9,trimestres:170};
  if (an===1965) return {ans:63,mois:0,trimestres:171};
  if (an===1966) return {ans:63,mois:3,trimestres:172};
  if (an===1967) return {ans:63,mois:6,trimestres:172};
  if (an===1968) return {ans:63,mois:9,trimestres:172};
  return {ans:64,mois:0,trimestres:172};
}
export const PASS_2026 = 48060;
export function pointsAnnuelsAgircArrco(salaire: number) {
  return (Math.min(salaire,PASS_2026)*.062+Math.max(0,Math.min(salaire,8*PASS_2026)-PASS_2026)*.17)/20.1877;
}
/** Taux proportionnel : 50 % diminué de 1,25 % de ce taux par trimestre. */
export function pensionBasePrive(sam:number, trimestres:number, requis:number, age:number, trimestresSurcote=0) {
  const manquants = Math.max(0,Math.min(requis-trimestres,Math.ceil((67-age)*4),20));
  const taux = .5*(1-manquants*.0125);
  const base = Math.min(PASS_2026*.5,sam*taux*Math.min(1,trimestres/requis));
  return {taux,manquants,pension:base*(1+Math.max(0,trimestresSurcote)*.0125)};
}
