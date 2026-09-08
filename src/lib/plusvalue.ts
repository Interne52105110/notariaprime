/** Les montants communs sont proratisés ; les valeurs d'un droit démembré sont déjà celles du cédant. */
export function basesPlusValue(p:{acquisition:number;vente:number;quotePart:number;sci:boolean;demembre:boolean;acquisitionDroit?:number;venteDroit?:number;fraisAcquisition:number;fraisVente:number;travaux:number;forfaitAcquisition:boolean;forfaitTravaux:boolean}) {
  const q=p.sci?1:p.quotePart/100;
  if(!Number.isFinite(q)||q<=0||q>1)throw new RangeError('Quote-part invalide');
  const montants=[p.acquisition,p.vente,p.fraisAcquisition,p.fraisVente,p.travaux];
  if(montants.some(v=>!Number.isFinite(v)||v<0))throw new RangeError('Montants invalides');
  if(p.demembre&&[p.acquisitionDroit,p.venteDroit].some(v=>v===undefined||!Number.isFinite(v)||v<0))throw new RangeError('Renseigner les prix du droit cédé');
  const acquisition=p.demembre?p.acquisitionDroit!:p.acquisition*q;
  const vente=p.demembre?p.venteDroit!:p.vente*q;
  const facteur=p.demembre?1:q;
  const fraisAcquisition=p.forfaitAcquisition?acquisition*.075:p.fraisAcquisition*facteur;
  const travaux=p.forfaitTravaux?acquisition*.15:p.travaux*facteur;
  const fraisVente=p.fraisVente*facteur;
  if(fraisVente>vente||p.demembre&&vente>p.vente*q)throw new RangeError('Prix et frais du droit incohérents');
  return {acquisition,acquisitionCorrigee:acquisition+fraisAcquisition+travaux,venteCorrigee:vente-fraisVente,prixPourSeuil15000:p.vente*q,fraisAcquisition,travaux};
}

/** CGI 150 VE, rédaction février 2026 : le zonage seul ne suffit pas. */
export function abattementExceptionnelPV(confirmation:boolean,taux:number,promesse:string,cession:string) {
  if(!confirmation||![60,75,85].includes(taux)||!/^\d{4}-\d{2}-\d{2}$/.test(promesse)||!/^\d{4}-\d{2}-\d{2}$/.test(cession))return 0;
  const d=new Date(promesse+'T00:00:00Z');
  if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==promesse||promesse<'2024-01-01'||promesse>'2027-12-31'||cession<promesse||cession>`${d.getUTCFullYear()+2}-12-31`)return 0;
  return taux;
}
