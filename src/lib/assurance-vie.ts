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

/** CGI 757 B : partage du plafond global entre toutes les bases non exonérées, tous contrats. */
export function abattement757B(baseBeneficiaire:number,totalBasesNonExonerees:number) {
  if(baseBeneficiaire<0||totalBasesNonExonerees<baseBeneficiaire)throw new RangeError('Bases 757 B incohérentes');
  return totalBasesNonExonerees>0?Math.min(baseBeneficiaire,30500*baseBeneficiaire/totalBasesNonExonerees):0;
}

/** Le solde de l'assureur inclut les PS déjà payés et les éventuelles restitutions. */
export function soldeSocialRachat(produits:number,soldeAssureur?:number) {
  if(!Number.isFinite(produits)||produits<0||soldeAssureur!==undefined&&!Number.isFinite(soldeAssureur))throw new RangeError('Montant invalide');
  return soldeAssureur??produits*.172;
}

/** Versements en fin de mois ; rendement effectif annuel net des frais, avant fiscalité. */
export function projectionAssuranceVie(initial:number,mensuel:number,rendement:number,annees:number) {
  if(![initial,mensuel,rendement,annees].every(Number.isFinite)||initial<0||mensuel<0||rendement<=-1||annees<0||annees>40)return [];
  let total=initial,versements=initial;
  const taux=Math.pow(1+rendement,1/12)-1,data=[];
  for(let annee=1;annee<=Math.floor(annees);annee++){
    for(let mois=0;mois<12;mois++){total=total*(1+taux)+mensuel;versements+=mensuel;}
    data.push({annee,versements,interets:total-versements,total});
  }
  return data;
}
