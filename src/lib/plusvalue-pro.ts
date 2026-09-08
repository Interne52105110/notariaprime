export interface CessionPro {
  regime: 'ir' | 'is' | 'titres'; nature: 'amortissable' | 'non_amortissable' | 'immeuble';
  cession: number; acquisition: number; amortissements: number; frais: number; detention: number; activite: number;
  secteur: 'ventes' | 'services'; recettes: number; valeurEntreprise: number;
  exoneration: 'aucune' | '151' | '238'; confirme151: boolean; confirme238: boolean;
  retraite: boolean; confirmeRetraite: boolean; immobilierB: boolean; confirmeB: boolean;
  tmi: number; cotisations?: number; resultatIS: number; isReduit: boolean;
  abattementTitres: boolean; confirmeTitres: boolean; soldeAbattementTitres: number; baremeTitres: boolean;
}

export function tauxExonerationPro(base: number, total: number, partiel: number) {
  return base <= total ? 1 : Math.max(0, (partiel-base)/(partiel-total));
}

export function liquidationCessionPro(p: CessionPro) {
  for (const [k,v] of Object.entries(p)) if (typeof v==='number' && (!Number.isFinite(v)||v<0)) throw Error(`Montant ou durée invalide : ${k}.`);
  if(p.tmi>45 || p.soldeAbattementTitres>500000) throw Error('Vérifiez le taux ou le solde d’abattement.');
  const amort = p.regime==='titres'||p.nature==='non_amortissable'?0:p.amortissements;
  if(amort>p.acquisition || p.frais>p.cession)throw Error('Les amortissements ou frais dépassent leur base.');
  const vnc=p.acquisition-amort;
  const gain=p.cession-p.frais-vnc;
  const positif=Math.max(0,gain);
  const courtTerme=p.regime==='ir'?(p.detention<2?positif:Math.min(amort,positif)):0;
  const longTerme=p.regime==='ir'?positif-courtTerme:0;
  const immo=p.nature==='immeuble';
  let tauxGeneral=0, tauxB=0, retraite=false, abattementTitres=0;
  const dispositifs:string[]=[];
  if(p.exoneration==='151'&&p.regime==='ir'){
    if(!p.confirme151 || p.activite<5)throw Error('Article 151 septies : confirmez les conditions et au moins cinq ans d’activité professionnelle.');
    tauxGeneral=tauxExonerationPro(p.recettes,p.secteur==='ventes'?250000:90000,p.secteur==='ventes'?350000:126000);
    dispositifs.push(`151 septies : ${(tauxGeneral*100).toFixed(2)} %`);
  }
  if(p.exoneration==='238'&&p.regime!=='titres'){
    if(immo)throw Error('L’article 238 quindecies n’exonère pas la plus-value immobilière.');
    if(!p.confirme238 || p.activite<5)throw Error('Article 238 quindecies : confirmez toutes les conditions de la transmission et cinq ans d’activité.');
    tauxGeneral=tauxExonerationPro(p.valeurEntreprise,500000,1000000);
    dispositifs.push(`238 quindecies : ${(tauxGeneral*100).toFixed(2)} %`);
  }
  if(p.immobilierB && p.regime==='ir'){
    if(!immo || !p.confirmeB)throw Error('Article 151 septies B : immeuble d’exploitation et affectation éligible à confirmer.');
    tauxB=Math.min(1,Math.max(0,Math.floor(p.detention)-5)/10);
    dispositifs.push(`151 septies B : ${Math.round(tauxB*100)} % sur le long terme`);
  }
  if(p.retraite && p.regime==='ir'){
    if(immo)throw Error('L’article 151 septies A ne couvre pas cette plus-value immobilière.');
    if(!p.confirmeRetraite || p.activite<5)throw Error('Article 151 septies A : les conditions de cession, retraite et durée d’activité doivent être remplies.');
    retraite=true;dispositifs.push('151 septies A : exonération d’IR, prélèvements LT maintenus');
  }
  if(p.abattementTitres && p.regime==='titres'){
    if(!p.confirmeTitres || p.detention<2)throw Error('Article 150-0 D ter : confirmez toutes les conditions du dirigeant et des titres détenus au moins deux ans.');
    abattementTitres=Math.min(positif,p.soldeAbattementTitres);
    dispositifs.push(`150-0 D ter : ${abattementTitres.toFixed(2)} € d’abattement IR`);
  }
  const baseCT=courtTerme*(1-tauxGeneral)*(retraite?0:1);
  const baseLT=longTerme*(1-tauxB)*(1-tauxGeneral)*(retraite?0:1);
  const basePS=longTerme*(1-tauxB)*(1-tauxGeneral);
  let ir=baseCT*p.tmi/100+baseLT*.128;
  let social=basePS*.186;
  let impotSociete=0;
  if(p.regime==='titres') {ir=(positif-abattementTitres)*(p.baremeTitres?p.tmi/100:.128);social=positif*.186;}
  if(p.regime==='is'){
    const is=(benefice:number)=>p.isReduit?Math.min(42500,benefice)*.15+Math.max(0,benefice-42500)*.25:benefice*.25;
    impotSociete=is(p.resultatIS+positif*(1-tauxGeneral))-is(p.resultatIS);ir=0;social=0;
  }
  const cotisationsManquantes=p.regime==='ir'&&courtTerme>0&&p.cotisations===undefined;
  const cotisations=p.regime==='ir'?(p.cotisations??0):0;
  const total=ir+social+impotSociete+cotisations;
  return {vnc,gain,courtTerme,longTerme,baseCT,baseLT,basePS,tauxGeneral,tauxB,abattementTitres,ir,social,impotSociete,cotisations,cotisationsManquantes,total,net:p.cession-p.frais-total,dispositifs};
}
