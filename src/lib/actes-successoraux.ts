import type { ActeConfig, TrancheTarif } from '@/app/pretaxe/PretaxeTypes';
const tranches = (limites:number[], taux:number[]):TrancheTarif[] => limites.map((max,i)=>({min:i?limites[i-1]:0,max,taux:taux[i]}));
const attestation = tranches([6500,17000,30000,Infinity],[1.935,1.064,.726,.532]);
export const ACTES_SUCCESSORAUX: Record<string,ActeConfig> = {
  certificat_propriete: {label:'Certificat de propriété mobilière',type:'proportionnel',tranches:[{min:0,max:Infinity,taux:.484}]},
  delivrance_legs_avec: {label:'Délivrance de legs avec décharge, quittance ou acceptation',type:'proportionnel',tranches:attestation},
  delivrance_legs_sans: {label:'Délivrance de legs sans décharge ni quittance',type:'proportionnel',tranches:tranches([6500,17000,30000,Infinity],[.967,.532,.363,.266])},
  ouverture_testament: {label:'Ouverture et description de testament olographe',type:'fixe',montant:26.41},
  consentement_execution: {label:'Consentement à exécution sans délivrance',type:'fixe',montant:75.46},
  cantonnement: {label:'Cantonnement par le légataire ou conjoint survivant',type:'proportionnel',tranches:tranches([6500,17000,30000,Infinity],[2.580,1.064,.709,.532])},
};
export const ASSIETTES_SUCCESSORALES: Record<string,string> = {
  declaration_succession:'Actif brut total, y compris la totalité des biens communs, de participation ou de société d’acquêts (A444-63). Ne pas utiliser la part nette fiscale de chaque héritier.',
  attestation_propriete:'Valeur des droits immobiliers transmis après décès (A444-59). Publication au SPF : CSI 0,10 %, minimum 15 €. Le droit fixe de 125 € est distinct des droits de succession.',
  certificat_propriete:'Valeur des biens mobiliers concernés : 15,09 € HT jusqu’à 3 120 €, puis 0,484 % sur la valeur entière (A444-84).',
  delivrance_legs_avec:'Valeur des biens délivrés. Tarif A444-64 1°.',
  delivrance_legs_sans:'Valeur des biens délivrés. Tarif A444-64 2°.',
  cantonnement:'Somme cantonnée (A444-62).',
  inventaire:'Émolument fixe de l’inventaire (A444-155). Prisée et vacations éventuelles à distinguer. Droit fixe de 125 € par acte au titre du CGI 680, sans multiplication automatique par le nombre de vacations.',
  notoriete:'Acte constatant la dévolution successorale : 56,60 € HT (A444-66), avant formalités, copies et droit fixe.',
  partage:'Actif brut partagé pour les émoluments (A444-121). Le droit de partage utilise l’actif net partagé, à renseigner séparément.',
};
