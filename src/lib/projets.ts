import { echeancierPret } from './pret';
import { abattementsPlusValue, surtaxePlusValue } from './fiscal';
import { liquidationFoncier, type ReportFoncier } from './foncier';
import { impotSociete } from './holding';
import { variationIR, type FoyerFiscal } from './foyer';

function montants(values:number[]) { if(values.some(v=>!Number.isFinite(v)||v<0)) throw Error('Renseignez des montants positifs ou nuls.'); }
export interface Capacite { revenus:number; credits:number; effort:number; mois:number; taux:number; assurance:number; apport:number; fraisCredit:number; fraisAchatPct:number }
export function capaciteEmprunt(p:Capacite) {
  montants(Object.values(p));
  if(p.effort>100||p.taux>100||p.assurance>100||p.fraisAchatPct>100||!Number.isInteger(p.mois)||p.mois<1||p.mois>600) throw Error('Durée de 1 à 600 mois et taux de 0 à 100 % requis.');
  const disponible=Math.max(0,p.revenus*p.effort/100-p.credits),i=p.taux/1200;
  const coefficient=i===0?1/p.mois:i/(-Math.expm1(-p.mois*Math.log1p(i)));
  const capital=Math.floor(disponible/(coefficient+p.assurance/1200)*100)/100;
  const budget=Math.max(0,(capital+p.apport-p.fraisCredit)/(1+p.fraisAchatPct/100));
  return {disponible,capital,budget,fraisAchat:budget*p.fraisAchatPct/100,assuranceMensuelle:capital*p.assurance/1200,financementInsuffisant:capital+p.apport<p.fraisCredit,resteAvantVieCourante:p.revenus-p.credits-disponible};
}

export interface Relance { prix:number; travaux:number; ancien:boolean; niveau:'intermediaire'|'social'|'tres-social'; dateAcquisition:string; debut:string; annee:number; dejaAmorti:number; plafondFoyer:number; autresAmortissements:number; loyers:number; charges:number; interets:number; tmi:number; confirme:boolean; foyer?:FoyerFiscal }
export function relanceLogement(p:Relance) {
  montants([p.prix,p.travaux,p.annee,p.dejaAmorti,p.plafondFoyer,p.autresAmortissements,p.loyers,p.charges,p.interets,p.tmi]);
  const dateValide=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
  if(!p.confirme)throw Error('Confirmez les conditions du dispositif avant de calculer.');
  if(!dateValide(p.dateAcquisition)||!dateValide(p.debut)||p.dateAcquisition<'2026-02-21'||p.dateAcquisition>'2028-12-31'||p.debut.slice(0,7)<p.dateAcquisition.slice(0,7)||!Number.isInteger(p.annee)||p.annee<2026||p.annee>2066||p.tmi>45)throw Error('Vérifiez les dates, l’année et la TMI. Acquisitions du 21 février 2026 au 31 décembre 2028.');
  if(!p.ancien&&p.travaux!==0)throw Error('Saisissez zéro travaux séparés pour un logement neuf.');
  if(p.prix<=0||p.ancien&&p.travaux<p.prix*.3)throw Error('Ce modèle ancien couvre la réhabilitation lourde avec au moins 30 % du prix en travaux ; autre assimilation au neuf à faire vérifier séparément.');
  if(![8000,10000,12000].includes(p.plafondFoyer))throw Error('Plafond du foyer invalide.');
  if(!['intermediaire','social','tres-social'].includes(p.niveau))throw Error('Niveau de loyer invalide.');
  const base=(p.prix+(p.ancien?p.travaux:0))*.8;
  if(p.dejaAmorti>base)throw Error('Les amortissements antérieurs dépassent la base.');
  const taux=(p.ancien?{intermediaire:.03,social:.035,'tres-social':.04}:{intermediaire:.035,social:.045,'tres-social':.055})[p.niveau];
  const debutAn=Number(p.debut.slice(0,4));
  const mois=p.annee<debutAn?0:p.annee===debutAn?13-Number(p.debut.slice(5,7)):12;
  const theorique=base*taux*mois/12;
  const deduction=Math.min(theorique,base-p.dejaAmorti,Math.max(0,p.plafondFoyer-p.autresAmortissements));
  const fiscal=(amort:number)=>{
    const net=p.loyers-p.charges-p.interets-amort;
    const global=Math.min(10700,Math.max(0,p.charges+amort-Math.max(0,p.loyers-p.interets)));
    return {net,imposable:Math.max(0,net),global,report:Math.max(0,-net)-global,ir:variationIR(Math.max(0,net)-global,p.tmi,p.foyer),ps:Math.max(0,net)*.172};
  };
  const sans=fiscal(0),avec=fiscal(deduction);
  return {base,taux,mois,theorique,deduction,cumul:p.dejaAmorti+deduction,sans,avec,gainIR:sans.ir-avec.ir,gainPS:sans.ps-avec.ps};
}

export interface Strategie { prix:number; fraisAchat:number; loyers:number; charges:number; credit:number; mois:number; taux:number; assurance:number; horizon:number; hausse:number; vente:number; fraisVente:number; terrain:number; amortAnnees:number; comptabilite:number; tmi:number; isReduit:boolean }
/** Location nue directe vs SCI IS, sans distribution avant la vente. Financement propre par CCA non rémunéré. */
export function strategieImmobiliere(p:Strategie) {
  montants([p.prix,p.fraisAchat,p.loyers,p.charges,p.credit,p.mois,p.taux,p.assurance,p.horizon,p.vente,p.fraisVente,p.terrain,p.amortAnnees,p.comptabilite,p.tmi]);
  if(p.prix<=0||p.vente<=15000||p.fraisVente>p.vente||p.credit>p.prix+p.fraisAchat||!Number.isInteger(p.horizon)||p.horizon<1||p.horizon>30||p.terrain>100||p.amortAnnees<1||p.tmi>45||!Number.isFinite(p.hausse)||p.hausse<=-100||p.hausse>100)throw Error('Vérifiez les valeurs : horizon entier de 1 à 30 ans, vente au-delà de 15 000 €, emprunt limité au coût d’acquisition.');
  const pret=p.credit>0?echeancierPret({capital:p.credit,mois:p.mois,taux:p.taux,assurance:p.assurance,assuranceRestant:false,frais:0}):null;
  const apport=p.prix+p.fraisAchat-p.credit;
  let reports:ReportFoncier[]=[],deficitIS=0,cashIS=0,cca=apport,amorti=0,reserves=0,netDirect=-apport,netPersonnelIS=-apport;
  const lignes=[];
  for(let an=1;an<=p.horizon;an++){
    const ls=pret?.lignes.slice((an-1)*12,an*12)??[];
    const interets=ls.reduce((s,l)=>s+l.interets+l.assurance,0),principal=ls.reduce((s,l)=>s+l.capital,0);
    const loyers=p.loyers*(1+p.hausse/100)**(an-1),charges=p.charges*(1+p.hausse/100)**(an-1);
    const ir=liquidationFoncier({loyers,interets,autresCharges:charges,travaux:0,locaux:1,tmi:p.tmi,tauxPS:17.2,annee:2026+an-1,renovation:false,travauxEligibles:0,microConfirme:false,reports});
    reports=ir.reportsReel;
    const cashIR=ir.reel.revenuNetApresImpot-principal;
    const baseAmort=(p.prix+p.fraisAchat)*(1-p.terrain/100);
    const dotation=Math.min(baseAmort/p.amortAnnees,Math.max(0,baseAmort-amorti));amorti+=dotation;
    const resultat=loyers-charges-interets-p.comptabilite-dotation;
    const gainVente=an===p.horizon?p.vente-p.fraisVente-(p.prix+p.fraisAchat-amorti):0;
    const resultatTotal=resultat+gainVente;
    const utilise=Math.min(deficitIS,Math.max(0,resultatTotal),1e6+Math.max(0,resultatTotal-1e6)*.5);
    const is=impotSociete(Math.max(0,resultatTotal-utilise),p.isReduit);
    deficitIS=deficitIS-utilise+Math.max(0,-resultatTotal);
    reserves+=resultatTotal-is;
    cashIS+=loyers-charges-interets-principal-p.comptabilite-is;
    // In the sale year the sale itself supplies cash before any additional shareholder advance.
    const restant=pret?pret.lignes[Math.min(an*12,pret.lignes.length)-1].restant:0;
    if(an===p.horizon)cashIS+=p.vente-p.fraisVente-restant;
    const avance=Math.max(0,-cashIS);cca+=avance;cashIS+=avance;netPersonnelIS-=avance;
    netDirect+=cashIR;
    lignes.push({annee:2026+an-1,loyers,interets,principal,ir:ir.reel.totalFiscalite-ir.gainGlobal,cashIR,dotation,is,avance,cashIS,restant});
  }
  const abatt=abattementsPlusValue(p.horizon),gainIR=Math.max(0,p.vente-p.fraisVente-p.prix-p.fraisAchat);
  const pvIR=gainIR*(1-abatt.ir/100),taxeVenteIR=pvIR*.19+gainIR*(1-abatt.ps/100)*.172+surtaxePlusValue(pvIR);
  const dette=lignes[lignes.length-1].restant;
  const sortieIR=p.vente-p.fraisVente-dette-taxeVenteIR;
  netDirect+=sortieIR;
  const remboursementCCA=Math.min(cca,Math.max(0,cashIS));
  const dividende=Math.min(Math.max(0,reserves),Math.max(0,cashIS-remboursementCCA));
  const pfu=dividende*.314,sortieIS=remboursementCCA+dividende-pfu;
  netPersonnelIS+=sortieIS;
  return {apport,lignes,amorti,taxeVenteIR,sortieIR,remboursementCCA,dividende,pfu,sortieIS,netDirect,netPersonnelIS,residuelSCI:cashIS-remboursementCCA-dividende,ccaNonRembourse:cca-remboursementCCA};
}
