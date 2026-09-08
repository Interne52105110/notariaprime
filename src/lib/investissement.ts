export function plafondLoyer2026(zone:string,surfaceUtile:number){
  if(surfaceUtile<=0)return 0;
  const tarif:Record<string,number>={Abis:19.71,A:14.64,B1:11.80,B2:10.26,C:10.26};
  const coefficient=Math.min(1.2,Math.round((.7+19/surfaceUtile)*100)/100);
  return (tarif[zone]??0)*surfaceUtile*coefficient;
}

export function reductionsLocatives(p:{dispositif:'pinel'|'denormandie';base:number;surface:number;anneeAcquisition:number;duree:6|9|12;initial:6|9;pinelPlus?:boolean}){
  const result=Array(12).fill(0) as number[];
  if(p.dispositif==='pinel' && (p.anneeAcquisition<2015||p.anneeAcquisition>2024))return result;
  if(p.dispositif==='denormandie' && (p.anneeAcquisition<2019||p.anneeAcquisition>2027))return result;
  const base=Math.max(0,Math.min(p.base,300000,p.surface*5500));
  const initial=Math.min(p.initial,p.duree);
  const classique=p.dispositif==='denormandie'||p.anneeAcquisition<=2022||p.pinelPlus;
  const tauxInitial=classique?.02:p.anneeAcquisition===2023?(initial===6?.105/6:.15/9):(initial===6?.09/6:.12/9);
  for(let a=1;a<=p.duree;a++){
    let taux=tauxInitial;
    if(a>initial)taux=a<=9?(classique?.02:p.anneeAcquisition===2023?.045/3:.03/3):(classique?.01:p.anneeAcquisition===2023?.025/3:.02/3);
    result[a-1]=base*taux;
  }
  return result;
}

/** Seuls les flux présentant un unique changement de signe ont un TRI annoncé. */
export function triAnnuel(flux:number[]):number|null{
  if(flux.length<2||flux.some(v=>!Number.isFinite(v)))return null;
  const signes=flux.filter(v=>v!==0).map(Math.sign);
  if(signes.length<2||signes.slice(1).filter((s,i)=>s!==signes[i]).length!==1)return null;
  const van=(r:number)=>flux.reduce((s,v,i)=>s+v/(1+r)**i,0);
  let lo=-.9999,hi=1;
  for(let i=0;i<30&&Math.sign(van(lo))===Math.sign(van(hi));i++)hi=hi*2+1;
  if(!Number.isFinite(van(hi))||Math.sign(van(lo))===Math.sign(van(hi)))return null;
  for(let i=0;i<160;i++){const mid=(lo+hi)/2,v=van(mid);if(Math.abs(v)<1e-7)return mid*100;if(Math.sign(v)===Math.sign(van(lo)))lo=mid;else hi=mid;}
  return (lo+hi)/2*100;
}

export function revenuFoncierAnnuel(loyers:number,interetsAssurance:number,charges:number,travaux:number,plafond=10700){
  const apresInterets=loyers-interetsAssurance;
  const deficitHorsInterets=Math.max(0,charges+travaux-Math.max(0,apresInterets));
  const global=Math.min(deficitHorsInterets,plafond);
  return {imposable:Math.max(0,apresInterets-charges-travaux),global,
    report:Math.max(0,-apresInterets)+deficitHorsInterets-global};
}
