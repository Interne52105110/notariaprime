import type { Debours, Documents, Formalites, Taxes } from './PretaxeTypes';
import { arrondirCentimes, quantite, sommeMontants } from '@/lib/montants';

export type NatureLigne = 'formalites' | 'documents' | 'debours' | 'taxes';
export interface LignePretaxe { id: string; nature: NatureLigne; libelle: string; reference?: string; quantite: number; prixUnitaire: number; ht: number; tva: number; total: number; }
export interface FormaliteAjoutee { id: string; code: string; libelle: string; quantite: number; }
export interface DepenseAjoutee { id: string; libelle: string; montant: number; nature: 'debours' | 'taxes'; }
export const TARIFS_FORMALITES: Record<string, {libelle: string; montant: number; article: string}> = {
  '187': {libelle:'Purge d’un droit de préemption', montant:37.73, article:'A444-171'},
  '191': {libelle:'Bordereau d’inscription en suite immédiate de l’acte', montant:7.54, article:'A444-171'},
  '193': {libelle:'Demande d’état, par réquisition', montant:3.77, article:'A444-171'},
  '196': {libelle:'Demande d’acte d’état civil', montant:11.24, article:'A444-172'},
  '204': {libelle:'Obtention de document — préciser la pièce', montant:56.60, article:'A444-172'},
  '219': {libelle:'Consultation de fichier — préciser le fichier', montant:11.32, article:'A444-173'},
};
export const FORMALITES_STANDARD = {
  publiciteFonciere: {libelle:'Forfait de formalités de publicité foncière', code:'194', article:'A444-171', montant:339.58},
  cadastre: {libelle:'Extrait cadastral hors forfait', code:'197', article:'A444-172', montant:3.77},
  notification: {libelle:'Notification hors purge d’un droit de préemption', code:'216', article:'A444-173', montant:15.09},
  mesurage: {libelle:'Obtention d’un certificat de mesurage', code:'221A', article:'A444-172-1', montant:15.09},
  transmissionCSN: {libelle:'Transmission des informations de mutation au CSN', code:'195', article:'A444-171', montant:15.31},
  requisition: {libelle:'Réquisition de mention en marge', code:'188', article:'A444-171', montant:18.87},
  declarationPlusValue: {libelle:'Établissement de la déclaration de plus-value', code:'206', article:'A444-172', montant:56.60},
} as const;
export type CleFormaliteStandard = keyof typeof FORMALITES_STANDARD;
const diagnosticCodes: Record<string,string> = {dpe:'221B', amiante:'221D', plomb:'221C', termites:'221E', gaz:'221G', electricite:'221H', erp:'221F'};

export function ligne(id: string, nature: NatureLigne, libelle: string, count: number, unit: number, vat: number, majoration = 0, reference?: string): LignePretaxe {
  const q = quantite(count);
  const prixUnitaire = Number((unit * (1 + majoration / 100)).toFixed(5));
  const ht = arrondirCentimes(q * prixUnitaire);
  const tva = arrondirCentimes(ht * vat / 100);
  return { id, nature, libelle, reference, quantite:q, prixUnitaire, ht, tva, total:sommeMontants([ht,tva]) };
}

export function lignesFormalites(formalites: Formalites, ajoutees: FormaliteAjoutee[], vat: number, majoration: number) {
  const result: LignePretaxe[] = [];
  for (const key of Object.keys(FORMALITES_STANDARD) as CleFormaliteStandard[]) {
    const tarif = FORMALITES_STANDARD[key], item = formalites[key];
    if (item.actif) result.push(ligne(key,'formalites',tarif.libelle,item.quantite ?? 1,tarif.montant,vat,majoration,`${tarif.article} n°${tarif.code}`));
  }
  for (const [key,item] of Object.entries(formalites.diagnostics)) if(item.actif) result.push(ligne(key,'formalites',`Obtention diagnostic ${key.toUpperCase()}`,item.quantite ?? 1,15.09,vat,majoration,`A444-172-1 n°${diagnosticCodes[key]}`));
  for (const item of ajoutees) {
    const tarif = TARIFS_FORMALITES[item.code];
    if(tarif) result.push(ligne(item.id,'formalites',item.libelle || tarif.libelle,item.quantite,tarif.montant,vat,majoration,`${tarif.article} n°${item.code}`));
  }
  return result;
}

export function lignesDocuments(doc: Documents, vat: number, majoration: number) {
  const pages = quantite(doc.pagesActe), result: LignePretaxe[] = [];
  for (const [key,label] of [['copiesExecutoires','Copies exécutoires'],['copiesAuthentiques','Copies authentiques'],['copiesHypothecaires','Copies hypothécaires'],['copiesLibres','Copies sur libre']] as const) {
    const count = quantite(doc[key] ?? 0);
    if(count) result.push(ligne(key,'documents',`${label} : ${count} × ${pages} pages`,count*pages,key==='copiesLibres'?.38:1.13,vat,majoration,`A444-173 n°${key==='copiesLibres'?'213':'212'}`));
  }
  if(doc.archivageNumerise && pages) result.push(ligne('archive','documents','Archivage numérisé, par page',pages,.19,vat,majoration,'A444-173 n°214'));
  return result;
}

export function lignesDepenses(debours: Debours, taxes: Taxes, ajoutees: DepenseAjoutee[]) {
  const result: LignePretaxe[] = [];
  const add = (id:string,nature:NatureLigne,label:string,value:number|undefined) => {if(value)result.push(ligne(id,nature,label,1,value,0));};
  add('csi','taxes','Contribution de sécurité immobilière',debours.csi);
  add('eh','debours','États hypothécaires : coût justifié',debours.etatsHypothecaires);
  add('cadastre','debours','Documents cadastraux : débours justifiés',debours.cadastre);
  add('urbanisme','debours','Documents d’urbanisme : débours justifiés',debours.urbanisme);
  add('departement','taxes','Taxe départementale',taxes.departementale);
  add('commune','taxes','Taxe communale',taxes.communale);
  add('assiette','taxes','Frais d’assiette et de recouvrement',taxes.fraisAssiette);
  add('tpf','taxes','Taxe de publicité foncière',taxes.tpf);
  add('partage','taxes','Droit de partage',taxes.droitPartage);
  add('fixe','taxes','Droit fixe d’enregistrement',taxes.droitFixe);
  add('complement','taxes','Droits complémentaires renseignés',taxes.complement);
  for(const item of ajoutees)add(item.id,item.nature,item.libelle||'Dépense à préciser',item.montant);
  return result;
}

/** TVA arrondie sur le sous-total HT, comme le récapitulatif professionnel. */
export function totalLignes(rows: LignePretaxe[], vat = 0) {
  const ht = sommeMontants(rows.map(r=>r.ht));
  return {ht, tva:arrondirCentimes(ht*vat/100), ttc:sommeMontants([ht,arrondirCentimes(ht*vat/100)])};
}

export function totalPretaxe(emolumentsHT:number,formalitesHT:number,documentsHT:number,ecretementHT:number,tauxTVA:number,debours:number,taxes:number){
  const netHT = sommeMontants([emolumentsHT,formalitesHT,documentsHT,-ecretementHT]);
  const tva = arrondirCentimes(netHT*tauxTVA/100);
  return {tva,total:sommeMontants([netHT,tva,debours,taxes])};
}
