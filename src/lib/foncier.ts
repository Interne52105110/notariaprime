import { variationIR, type FoyerFiscal } from './foyer';
import { repartirDeficitFoncier } from './fiscal';
export type ReportFoncier={annee:number;montant:number};
export interface ParametresFoncier {foyer?:FoyerFiscal;loyers:number;interets:number;autresCharges:number;travaux:number;locaux:number;tmi:number;tauxPS:number;annee:number;renovation:boolean;travauxEligibles:number;microConfirme:boolean;reports:ReportFoncier[]}
export function consommerReportsFoncier(reports:ReportFoncier[],annee:number,revenu:number) {
  let restant=Math.max(0,revenu),utilise=0;
  const suite=reports.filter(r=>r.annee<annee&&r.annee+10>=annee).map(r=>({...r})).sort((a,b)=>a.annee-b.annee);
  for(const r of suite){const montant=Math.min(r.montant,restant);r.montant-=montant;restant-=montant;utilise+=montant;}
  return {revenu:restant,utilise,reports:suite.filter(r=>r.montant>0)};
}
export function liquidationFoncier(p:ParametresFoncier) {
  if([p.loyers,p.interets,p.autresCharges,p.travaux,p.locaux,p.tmi,p.tauxPS,p.travauxEligibles,...p.reports.map(r=>r.montant)].some(n=>!Number.isFinite(n)||n<0)||p.tmi>100||p.tauxPS>100||p.travauxEligibles>p.travaux)throw new RangeError('Montants fonciers incohérents');
  const chargesCash=p.interets+p.autresCharges+p.travaux;
  const deductions=chargesCash+20*p.locaux;
  const plafond=10700+(p.renovation&&p.annee>=2026&&p.annee<=2027?Math.min(10700,p.travauxEligibles):0);
  const deficit=repartirDeficitFoncier(p.loyers,p.interets,deductions-p.interets,plafond);
  const reportReel=consommerReportsFoncier(p.reports,p.annee,Math.max(0,p.loyers-deductions));
  const reportMicro=consommerReportsFoncier(p.reports,p.annee,p.loyers*.7);
  const gainGlobal=-variationIR(-deficit.imputation,p.tmi,p.foyer);
  const regime=(base:number,deduction:number,gain:number)=>{
    const ir=variationIR(base,p.tmi,p.foyer),ps=base*p.tauxPS/100,fiscalite=ir+ps;
    return {revenusBruts:p.loyers,deductions:deduction,revenuImposable:base,impotRevenu:ir,prelevementsSociaux:ps,totalFiscalite:fiscalite,revenuNetApresImpot:p.loyers-chargesCash-fiscalite+gain};
  };
  const micro=regime(reportMicro.revenu,p.loyers*.3,0),reel=regime(reportReel.revenu,deductions,gainGlobal);
  const microApplicable=p.microConfirme&&p.loyers<=15000&&p.loyers>0;
  const regimeOptimal:'micro'|'reel'=microApplicable&&micro.revenuNetApresImpot>reel.revenuNetApresImpot?'micro':'reel';
  return {micro,reel,microApplicable,regimeOptimal,economie:microApplicable?Math.abs(reel.revenuNetApresImpot-micro.revenuNetApresImpot):0,gainGlobal,reportUtiliseReel:reportReel.utilise,reportUtiliseMicro:reportMicro.utilise,reportsReel:[...reportReel.reports,...(deficit.report>0?[{annee:p.annee,montant:deficit.report}]:[])],reportsMicro:reportMicro.reports,deficitFoncier:deficit.deficit>0?{montantDeficit:deficit.deficit,imputationRevenuGlobal:deficit.imputation,reportSurRevenusFonciers:deficit.report}:null};
}
export function projectionFoncier(p:ParametresFoncier) {
  let reportsReel=p.reports,reportsMicro=p.reports,cumulReel=0,cumulMicro=0;
  return Array.from({length:10},(_,i)=>{
    const commun={...p,annee:p.annee+i,travaux:i===0?p.travaux:0,travauxEligibles:i===0?p.travauxEligibles:0};
    const reel=liquidationFoncier({...commun,reports:reportsReel}),micro=liquidationFoncier({...commun,reports:reportsMicro});
    reportsReel=reel.reportsReel;reportsMicro=micro.reportsMicro;
    cumulReel+=reel.reel.revenuNetApresImpot;cumulMicro+=micro.micro.revenuNetApresImpot;
    return {annee:String(p.annee+i),'Micro-Foncier (cumule)':micro.microApplicable?Math.round(cumulMicro):undefined,'Regime Reel (cumule)':Math.round(cumulReel)};
  });
}
