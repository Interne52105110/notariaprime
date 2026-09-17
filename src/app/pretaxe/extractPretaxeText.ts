import { categoriesActes } from './ocrMappings';
import { lireMontant } from '@/lib/montants';

export interface ExtractedHit { montant?:string; departement?:string; categoryKey?:string; acteKey?:string; acteLabel?:string; valeurMobilier?:number; preuves:string[]; avertissements:string[]; }
const normaliser=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase();
export function montantsDansTexte(text:string) {
  const re=/((?:\d{1,3}(?:[ \u00a0\u202f.,]\d{3})+|\d+)(?:[.,]\d{1,2})?)\s*(?:€|EUR\b|euros?\b)/gi;
  return [...text.matchAll(re)].map(m=>({value:lireMontant(m[1]),index:m.index!,citation:text.slice(Math.max(0,m.index!-100),m.index!+m[0].length),contexte:text.slice(Math.max(0,m.index!-100),m.index!)})).filter(m=>m.value!==null);
}

/** Propositions fondées sur des mentions explicites ; aucune valeur de repli. */
export function parseExtractedText(text:string):ExtractedHit {
  const result:ExtractedHit={preuves:[],avertissements:[]};
  const lower=normaliser(text);
  const candidates:{index:number;length:number;categoryKey:string;acteKey:string;acteLabel:string}[]=[];
  for(const [categoryKey,category] of Object.entries(categoriesActes))for(const [acteKey,keywords] of Object.entries(category.actes))for(const keyword of keywords){
    const index=lower.indexOf(normaliser(keyword));
    if(index>=0)candidates.push({index,length:keyword.length,categoryKey,acteKey,acteLabel:keywords[0]});
  }
  candidates.sort((a,b)=>a.index-b.index||b.length-a.length);
  const first=candidates[0];
  if(first){result.categoryKey=first.categoryKey;result.acteKey=first.acteKey;result.acteLabel=first.acteLabel;result.preuves.push(text.slice(Math.max(0,first.index-25),first.index+first.length+60));}
  const amounts=montantsDansTexte(text);
  const pret=result.categoryKey==='prets'&&!result.acteKey?.startsWith('mainlevee');
  const vente=['vente_immeuble','vente_terrain','vefa'].includes(result.acteKey??'');
  const valid=amounts.filter(m=>{
    const ctx=normaliser(m.contexte).split(/[;\n.!?]/).at(-1)??'';
    if(/frais|garantie|accessoires|ancien|mobilier|meubles|indemnite|penalite|amende/.test(ctx))return false;
    return pret ? /(?:capital (?:du pret|emprunte)|montant (?:du pret|emprunte))\s*[:=]?\s*(?:de\s*)?$/.test(ctx) : vente && /(?:prix (?:de vente|principal|convenu|de cession)|\bprix)\s*[:=]?\s*(?:de\s*)?$/.test(ctx);
  });
  const distinct=[...new Set(valid.map(m=>m.value!))];
  if(distinct.length===1){result.montant=distinct[0].toLocaleString('fr-FR',{maximumFractionDigits:2});result.preuves.push(valid[0].citation);}
  else result.avertissements.push(distinct.length>1?'Plusieurs prix ou capitaux explicites : choisissez l’assiette après lecture.':'Aucune assiette unique et explicite reconnue : montant à compléter.');
  const immobilier=[...text.matchAll(/\b(?:bien(?:\s+immobilier)?|immeuble|terrain)\s+(?:est\s+)?(?:situ[eé]e?|sis|sise)(?=\s)[^;\n.!?]{0,180}?\b(\d{5})\b/gi)];
  const departments=[...new Set(immobilier.map(m=>m[1].startsWith('97')?m[1].slice(0,3):m[1].startsWith('20')?'':m[1].slice(0,2)).filter(Boolean))];
  if(departments.length===1){result.departement=departments[0];result.preuves.push(immobilier[0][0]);}
  else result.avertissements.push('Département du bien non établi : ne pas utiliser l’adresse de l’étude.');
  if(vente && result.montant){
    const furniture=amounts.filter(m=>/(?:valeur (?:du mobilier|des meubles)|meubles (?:a concurrence de|meublants)|mobilier estime)\s*[:=]?\s*(?:a|de)?\s*$/i.test(normaliser(m.contexte)));
    if(furniture.length===1 && furniture[0].value! < lireMontant(result.montant)!){result.valeurMobilier=furniture[0].value!;result.preuves.push(furniture[0].citation);}
  }
  if(result.acteKey?.startsWith('donation'))result.avertissements.push('Donation : renseignez les biens et droits transmis par chaque donateur ; un montant global ne suffit pas.');
  result.avertissements.push('Vérifiez l’acte principal : un document peut citer d’autres actes.');
  return result;
}
