import Engine from 'publicodes';
import reglesTI from 'modele-ti';
import reglesAS from 'modele-as';
import { impotSociete } from './holding';
import { BAREME_IR_2026 } from './fiscal';

const moteurTI = new Engine<string>(reglesTI, {warn:{experimentalRules:false}});
const moteurAS = new Engine<string>(reglesAS, {warn:{experimentalRules:false}});
const commun = {
  date:'08/09/2026', 'établissement . commune . département':"'75'",
  'établissement . commune . département . outre-mer':'non',
  'entreprise . date de création':'01/01/2020',
  "situation personnelle . domiciliation fiscale à l'étranger":'non',
  'impôt . méthode de calcul':"'barème standard'",
  'paramètres . impôt . foyer fiscal . situation de famille':"'célibataire'",
  'impôt . foyer fiscal . situation de famille . question':"'célibataire'",
  'impôt . foyer fiscal . enfants à charge':0,
  'impôt . foyer fiscal . autres revenus imposables':'0 €/an',
};
export type ActiviteSociale = 'commerciale' | 'artisanale' | 'liberale' | 'immobiliere';
const cache = new Map<string, { brut:number; net:number; cotisations:number; ir:number; psDividendes:number; irDividendes:number }>();

/** Règles Urssaf juillet 2026. Métropole, année pleine, activité libérale non réglementée, un célibataire sans autres revenus. */
export function social2026(p:{as?:boolean; entrepriseIR?:boolean; brut?:number; net?:number; activite?:ActiviteSociale; dividendesSSI?:number; dividendesPS?:number; acre?:boolean; ir?:boolean}) {
  const cle=JSON.stringify(p); const saved=cache.get(cle);if(saved)return saved;
  const as=p.as===true, prefix=as?'assimilé salarié':'indépendant';
  const e=(as?moteurAS:moteurTI).shallowCopy();
  const situation:Record<string,string|number>={...commun};
  if(as)Object.assign(situation,{
    'assimilé salarié . rémunération . avantages en nature':'non',
    'assimilé salarié . régimes spécifiques . taux réduits':'non',
    'assimilé salarié . cotisations . prévoyances . santé . montant':'0 €/mois',
    'assimilé salarié . cotisations . prévoyances . santé . taux employeur':'50 %',
    'entreprise . salariés . effectif . seuil':"'moins de 11'",
    'assimilé salarié . régimes spécifiques . alsace moselle':'non',
    'assimilé salarié . cotisations . ATMP . taux':'1 %',
    'assimilé salarié . exonérations . JEI':'non','entreprise . TVA':'oui',
  });
  else Object.assign(situation,{
    'entreprise . imposition':p.entrepriseIR?"'IR'":"'IS'", 'entreprise . activité':`'${p.activite==='liberale'?'libérale':p.activite==='artisanale'?'artisanale':'commerciale'}'`,
    'entreprise . activité . libérale . réglementée':'non',
    'indépendant . dividendes . soumis à prélèvements sociaux':`${p.dividendesPS??0} €/an`,
    'indépendant . dividendes . soumis à cotisations sociales':`${p.dividendesSSI??0} €/an`,
    'indépendant . dividendes . imposition':"'PFU'",'indépendant . revenus de remplacement':'non',
    'indépendant . revenus étrangers':'non','indépendant . conjoint collaborateur':'non',
    'indépendant . cotisations et contributions . cotisations facultatives . retraite':'0 €/an',
    'indépendant . cotisations et contributions . cotisations facultatives . prévoyance':'0 €/an',
    'indépendant . cotisations et contributions . cotisations . exonérations . invalidité':'non',
    'indépendant . cotisations et contributions . cotisations . exonérations . Acre':p.acre?'oui':'non',
    'situation personnelle . RSA':'non','entreprise . activité . saisonnière':'non',
    'entreprise . activité . commerciale . débit de tabac':'non',
  });
  if(p.acre)situation['entreprise . date de création']='01/01/2026';
  const montant=p.brut??p.net??0;
  if(!Number.isFinite(montant)||montant<0)throw new RangeError('Rémunération invalide.');
  situation[`${prefix} . rémunération . ${p.brut!==undefined?(as?'totale':'brute'):'nette'}`]=`${montant} €/an`;
  if(p.entrepriseIR){
    delete situation[`${prefix} . rémunération . brute`];
    situation["entreprise . chiffre d'affaires"]=`${montant} €/an`;
    situation['entreprise . charges']='0 €/an';
  }
  e.setSituation(situation);
  const evaluer=(regle:string)=>{
    const r=e.evaluate({valeur:regle,unité:'€/an'});
    if(typeof r.nodeValue!=='number'||!Number.isFinite(r.nodeValue))throw new Error(`Calcul social indisponible : ${regle}`);
    return r.nodeValue;
  };
  const resultat={brut:evaluer(`${prefix} . rémunération . ${as?'totale':'brute'}`),net:evaluer(`${prefix} . rémunération . nette`),
    cotisations:evaluer(`${prefix} . ${as?'cotisations':'cotisations et contributions'}`),
    ir:p.ir===false?0:evaluer(`${prefix} . rémunération . impôt`),
    psDividendes:as||!p.dividendesPS?0:evaluer('indépendant . dividendes . prélèvements sociaux'),
    irDividendes:as||!((p.dividendesPS??0)+(p.dividendesSSI??0))?0:evaluer('indépendant . dividendes . PFU')};
  if(cache.size>600)cache.clear();cache.set(cle,resultat);return resultat;
}

export function calculStatut2026(statut:string,benefice:number,netSouhaite:number,referenceDividendes:number,activite:ActiviteSociale,tauxReduit=false){
  const resultat={remunerationNette:0,cotisationsSociales:0,tauxCotisations:0,is:0,dividendesBruts:0,fiscaliteDividendes:0,dividendesNets:0,revenuNetGlobal:0,irEstime:0};
  if(benefice<=0)return resultat;
  if(statut==='SCI'){
    const ir=BAREME_IR_2026.reduce((s,t)=>s+Math.max(0,Math.min(benefice,t.max)-t.min)*t.taux,0),ps=benefice*.172;
    return {...resultat,remunerationNette:benefice,irEstime:ir,cotisationsSociales:ps,revenuNetGlobal:benefice-ir-ps};
  }
  const as=['SAS','SASU','SA'].includes(statut),is=['SAS','SASU','SA','EURL_IS','SARL'].includes(statut);
  // L'EI/EURL IR : même assiette sociale, mais l'IR professionnel ne bénéficie pas de l'abattement art. 62.
  const maximum=social2026({as,brut:benefice,activite,ir:false});
  let salaire=maximum;
  if(is && netSouhaite<maximum.net) salaire=social2026({as,net:Math.max(0,netSouhaite),activite,ir:false});
  const cout=Math.min(benefice,Math.max(0,salaire.brut));
  const impotIS=is?impotSociete(Math.max(0,benefice-cout),tauxReduit):0;
  const dividendes=is?Math.max(0,benefice-cout-impotIS):0;
  const dividendesPS=as?dividendes:Math.min(dividendes,Math.max(0,referenceDividendes)*.1);
  const dividendesSSI=as?0:dividendes-dividendesPS;
  const final=social2026({as,entrepriseIR:!is,brut:cout,activite,dividendesSSI,dividendesPS});
  const surcotisations=as?0:Math.max(0,final.cotisations-salaire.cotisations);
  const fiscalite=as?dividendes*.314:surcotisations+final.psDividendes+final.irDividendes;
  return {...resultat,remunerationNette:salaire.net,cotisationsSociales:salaire.cotisations,
    tauxCotisations:salaire.net>0?salaire.cotisations/salaire.net*100:0,is:impotIS,
    dividendesBruts:dividendes,fiscaliteDividendes:fiscalite,dividendesNets:dividendes-fiscalite,
    irEstime:final.ir,revenuNetGlobal:salaire.net-final.ir+dividendes-fiscalite};
}
