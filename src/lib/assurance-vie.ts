/** CGI 125-0 A : ordre d'imputation de l'abattement et seuil tous contrats. */
export function impotRachatHuitAns(produitsAvant:number, produitsApres:number, primesAvant:number, primesApres:number, abattementDisponible:number) {
  const fractionReduite = primesApres>0 ? Math.min(1,Math.max(0,150000-primesAvant)/primesApres) : 1;
  const produits75 = produitsApres*fractionReduite;
  const produits128 = produitsApres-produits75;
  let abattement=Math.max(0,abattementDisponible);
  let impot=0;
  for(const [produits,taux] of [[produitsAvant,.075],[produits75,.075],[produits128,.128]]) {
    const applique=Math.min(produits,abattement);abattement-=applique;impot+=(produits-applique)*taux;
  }
  return impot;
}
