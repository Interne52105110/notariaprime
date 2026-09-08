export interface ParametresPret { capital:number; mois:number; taux:number; assurance:number; assuranceRestant:boolean; frais:number }
const cent=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function echeancierPret(p:ParametresPret){
  p={...p,capital:cent(p.capital),frais:cent(p.frais)};
  if(![p.capital,p.mois,p.taux,p.assurance,p.frais].every(Number.isFinite)||p.capital<=0||!Number.isInteger(p.mois)||p.mois<1||p.mois>600||p.taux<0||p.taux>100||p.assurance<0||p.assurance>100||p.frais<0||p.frais>=p.capital)throw Error('Capital positif, durée de 1 à 600 mois, taux de 0 à 100 % et frais inférieurs au capital requis.');
  const taux=p.taux/1200;
  const mensualite=cent(taux===0?p.capital/p.mois:p.capital*taux/(-Math.expm1(-p.mois*Math.log1p(taux))));
  let restant=cent(p.capital);
  const lignes:{mois:number;capital:number;interets:number;assurance:number;paiement:number;restant:number}[]=[];
  for(let mois=1;mois<=p.mois;mois++){
    const interets=cent(restant*taux);
    const assurance=cent((p.assuranceRestant?restant:p.capital)*p.assurance/1200);
    const capital=mois===p.mois?restant:Math.min(restant,cent(mensualite-interets));
    restant=cent(restant-capital);
    lignes.push({mois,capital,interets,assurance,paiement:cent(capital+interets+assurance),restant});
  }
  const interets=cent(lignes.reduce((s,m)=>s+m.interets,0));
  const assurance=cent(lignes.reduce((s,m)=>s+m.assurance,0));
  const cout=cent(interets+assurance+p.frais);
  // Annual effective yield with fees paid at disbursement and monthly payments in arrears.
  const van=(r:number)=>lignes.reduce((s,m)=>s+m.paiement/Math.pow(1+r,m.mois),0)-(p.capital-p.frais);
  let bas=0,haut=1;
  while(van(haut)>0&&haut<1024)haut*=2;
  for(let i=0;i<100;i++){const milieu=(bas+haut)/2;if(van(milieu)>0)bas=milieu;else haut=milieu;}
  const tauxEffectif=(Math.pow(1+(bas+haut)/2,12)-1)*100;
  return {mensualite,lignes,interets,assurance,cout,total:cent(p.capital+cout),tauxEffectif};
}
