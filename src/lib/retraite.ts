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
  if (an===1961) return {ans:62,mois:mois<9?0:3,trimestres:mois<9?168:169};
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

/** Notice Agirc-Arrco septembre 2026, carrière courte/anticipation, hors ancienne tranche C. */
export function coefficientAgircArrco(age:number,manquants:number) {
  const parTrimestre=(n:number)=>n<=12?1-n*.01:n<=20?.88-(n-12)*.0125:.78-(n-20)*.0175;
  const ageCoef=parTrimestre(Math.max(0,Math.min(40,Math.ceil((67-age)*4-1e-8))));
  return manquants<=0||age>=67?1:Math.max(ageCoef,manquants<=20?parTrimestre(Math.ceil(manquants)):0);
}

export interface ProjectionRetraite {
  naissance:string; statut:'salarie'|'independant'|'fonctionnaire'|'liberal'; objectif:'legal'|'plein'|'surcote';
  trimestres:number; trimestresRegime:number; trimestresFutursAn:number; rachatTauxSeul:number; surcoteAcquise:number;
  reference:number; points:number; pointsFutursAn:number; complement:number; complementSaisi:boolean;
  socialBase:number; socialComplement:number; revenuNet:number;
}
/** Scénario à paramètres 2026 constants. Les durées futures sont une hypothèse saisie, pas une reconstitution de carrière. */
export function projectionRetraite(p:ProjectionRetraite, maintenant=new Date(), reportMois=0) {
  const regle=parametresRetraite(p.naissance);
  const naissance=new Date(p.naissance+'T00:00:00Z');
  if(!Number.isFinite(naissance.getTime())||naissance.toISOString().slice(0,10)!==p.naissance)throw new RangeError('Date de naissance invalide');
  for(const [cle,v] of Object.entries(p))if(typeof v==='number'&&(!Number.isFinite(v)||v<0))throw new RangeError('Valeur invalide : '+cle);
  if(p.trimestresFutursAn>4||p.socialBase>100||p.socialComplement>100||p.trimestresRegime>p.trimestres)throw new RangeError('Durées ou prélèvements incohérents');
  const moisNaissance=naissance.getUTCFullYear()*12+naissance.getUTCMonth();
  const ageLegalMois=regle.ans*12+regle.mois;
  const premierMoisLegal=moisNaissance+ageLegalMois+(naissance.getUTCDate()===1?0:1);
  const moisActuel=maintenant.getUTCFullYear()*12+maintenant.getUTCMonth();
  const premierMois=Math.max(premierMoisLegal,moisActuel+1);
  const futurs=(m:number)=>Math.floor(Math.max(0,m-(moisActuel+1))*p.trimestresFutursAn/12+1e-8);
  const mois67=moisNaissance+67*12+(naissance.getUTCDate()===1?0:1);
  let plein=premierMois;
  while(plein<mois67 && p.trimestres+p.rachatTauxSeul+futurs(plein)<regle.trimestres)plein++;
  const depart=(p.objectif==='legal'?premierMois:plein+(p.objectif==='surcote'?24:0))+reportMois;
  const age=(depart-moisNaissance-(naissance.getUTCDate()===1?0:1))/12;
  const dureeFuture=futurs(depart), total=p.trimestres+dureeFuture;
  const manquants=Math.max(0,regle.trimestres-total-p.rachatTauxSeul);
  const decote=Math.max(0,Math.min(manquants,Math.ceil((67-age)*4-1e-8),20));
  // La surcote exige une durée cotisée après l'âge légal et la durée requise : le seul âge de 67 ans ne suffit pas.
  const avantLegal=futurs(Math.max(premierMois,premierMoisLegal));
  const surcote=p.surcoteAcquise+Math.max(0,Math.min(dureeFuture-avantLegal,total-regle.trimestres));
  const ratio=Math.min(1,(p.trimestresRegime+dureeFuture)/regle.trimestres);
  const taux=(p.statut==='fonctionnaire'?.75:.5)*(1-decote*.0125);
  const baseSansSurcote=p.reference*taux*ratio;
  const base=p.statut==='liberal'?p.reference:(p.statut==='fonctionnaire'?baseSansSurcote:Math.min(PASS_2026/2,baseSansSurcote))*(1+surcote*.0125);
  const points=p.points+p.pointsFutursAn*Math.max(0,depart-(moisActuel+1))/12;
  const coefficient=coefficientAgircArrco(age,manquants);
  const complement=p.complementSaisi||p.statut!=='salarie'?p.complement:points*1.4386*coefficient;
  const net=base*(1-p.socialBase/100)+complement*(1-p.socialComplement/100);
  const date=new Date(Date.UTC(Math.floor(depart/12),depart%12,1)).toISOString().slice(0,10);
  return {date,age,agePlein:(plein-moisNaissance-(naissance.getUTCDate()===1?0:1))/12,regle,total,decote,surcote,ratio,taux,base,points,coefficient,complement,brut:base+complement,net,remplacement:p.revenuNet>0?net/p.revenuNet*100:null,cumul85:net*Math.max(0,85-age)};
}
