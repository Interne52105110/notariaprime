import { variationIR, type FoyerFiscal } from './foyer';
import { abattementsPlusValue, surtaxePlusValue } from './fiscal';
export interface SCIAnnuelle {
 foyer?:FoyerFiscal;
 loyers:number; charges:number; interets:number; principal:number; chargesFiscalesIR:number;
 amortissement:number; ccaVerse:number; ccaDeductibleIR:number; ccaDeductibleIS:number;
 tmi:number; distribution:number; isReduit:boolean; bareme:boolean;
}
export function liquidationSCI(p:SCIAnnuelle){
 for(const [k,v] of Object.entries(p))if(typeof v==='number'&&(!Number.isFinite(v)||v<0))throw Error(`Montant invalide : ${k}.`);
 if(p.tmi>45||p.distribution>100||p.ccaDeductibleIR>p.ccaVerse||p.ccaDeductibleIS>p.ccaVerse)throw Error('Vérifiez les taux et les intérêts déductibles.');
 const baseIR=p.loyers-p.charges-p.interets-p.chargesFiscalesIR-p.ccaDeductibleIR;
 if(p.foyer && (p.bareme || p.ccaVerse>0)) throw Error("Le mode foyer SCI suppose zéro intérêt de CCA et des dividendes au PFU, pour éviter une double liquidation de revenus mobiliers. Utilisez la TMI ou le simulateur DGFiP pour les autres cas.");
 const impotIR=variationIR(Math.max(0,baseIR),p.tmi,p.foyer), psIR=Math.max(0,baseIR)*.172;
 // CCA interest has no 40% dividend allowance under the progressive option.
 const taxeCCA=p.ccaVerse*(p.bareme?p.tmi/100+.186:.314);
 const resultatComptable=p.loyers-p.charges-p.interets-p.ccaVerse-p.amortissement;
 const baseIS=Math.max(0,resultatComptable+p.ccaVerse-p.ccaDeductibleIS);
 const impotIS=p.isReduit?Math.min(42500,baseIS)*.15+Math.max(0,baseIS-42500)*.25:baseIS*.25;
 const cashAvantDistribution=p.loyers-p.charges-p.interets-p.ccaVerse-p.principal-impotIS;
 const distribuable=Math.min(Math.max(0,resultatComptable-impotIS),Math.max(0,cashAvantDistribution));
 const dividendes=distribuable*p.distribution/100;
 const taxeDividendes=dividendes*(p.bareme ? .6*p.tmi/100+.186 : .314);
 const tresorerieIS=cashAvantDistribution-dividendes;
 const revenuAssociesIS=dividendes-taxeDividendes+p.ccaVerse-taxeCCA;
 const cashIR=p.loyers-p.charges-p.interets-p.principal-impotIR-psIR-taxeCCA;
 return {baseIR,impotIR,psIR,taxeCCA,resultatComptable,baseIS,impotIS,distribuable,dividendes,taxeDividendes,tresorerieIS,revenuAssociesIS,cashIR,cashIS:tresorerieIS+revenuAssociesIS,deficitIR:Math.max(0,-baseIR)};
}

export function reventeSCI(p:{acquisition:number;fraisAcquisition:number;vente:number;fraisVente:number;travauxIR:number;amortissements:number;valeurBruteIS:number;annees:number;autreBeneficeIS:number;isReduit:boolean}){
 for(const v of Object.values(p))if(typeof v==='number'&&(!Number.isFinite(v)||v<0))throw Error('Montant de revente invalide.');
 if(!Number.isInteger(p.annees)||p.fraisVente>p.vente||p.amortissements>p.valeurBruteIS)throw Error('Vérifiez la durée, les frais et les amortissements.');
 const abattements=abattementsPlusValue(p.annees);
 const gainIR=Math.max(0,p.vente-p.fraisVente-p.acquisition-p.fraisAcquisition-p.travauxIR);
 const baseIR=gainIR*(1-abattements.ir/100),basePS=gainIR*(1-abattements.ps/100);
 const impotIR=baseIR*.19+basePS*.172+surtaxePlusValue(baseIR);
 // Same capitalised acquisition expenses assumed in IS book value; no invented amortisation.
 const vnc=p.valeurBruteIS-p.amortissements;
 const gainIS=Math.max(0,p.vente-p.fraisVente-vnc);
 const is=(b:number)=>p.isReduit?Math.min(42500,b)*.15+Math.max(0,b-42500)*.25:b*.25;
 const impotIS=is(p.autreBeneficeIS+gainIS)-is(p.autreBeneficeIS);
 return {abattements,gainIR,impotIR,vnc,gainIS,impotIS,netIR:p.vente-p.fraisVente-impotIR,netIS:p.vente-p.fraisVente-impotIS};
}
