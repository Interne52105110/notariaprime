const {test}=require('node:test');
const assert=require('node:assert/strict');
const {capaciteEmprunt,relanceLogement,strategieImmobiliere}=require('../src/lib/projets.ts');
const {impotFoyer,variationIR}=require('../src/lib/foyer.ts');
const {reductionPlafonnementIFI,abattementsPlusValue}=require('../src/lib/fiscal.ts');
const {liquidationFoncier}=require('../src/lib/foncier.ts');
const {liquidationMeuble,plusValueMeuble}=require('../src/lib/lmnp.ts');
const {liquidationSCI}=require('../src/lib/sci.ts');
const {echeancierPret}=require('../src/lib/pret.ts');
const {guides}=require('../src/content/guides.ts');
const {toolResources}=require('../src/content/tool-resources.ts');
const near=(a,b)=>assert.ok(Math.abs(a-b)<.011,`${a} attendu ${b}`);
const seul={revenu:25000,adultes:1,enfants:0};
const cap={revenus:2000,credits:0,effort:35,mois:120,taux:0,assurance:0,apport:20000,fraisCredit:2000,fraisAchatPct:10};
const rel={prix:250000,travaux:0,ancien:false,niveau:'intermediaire',dateAcquisition:'2026-03-20',debut:'2026-03-01',annee:2027,dejaAmorti:0,plafondFoyer:8000,autresAmortissements:0,loyers:12000,charges:2000,interets:3000,tmi:30,confirme:true};
const strat={prix:100000,fraisAchat:0,loyers:0,charges:0,credit:0,mois:120,taux:0,assurance:0,horizon:1,hausse:0,vente:100000,fraisVente:0,terrain:100,amortAnnees:40,comptabilite:0,tmi:0,isReduit:false};

test('IFI : le plafonnement ne peut rendre l’impôt négatif',()=>{near(reductionPlafonnementIFI(7400,0,12000),7400);near(reductionPlafonnementIFI(7400,20000,10000),2400);near(reductionPlafonnementIFI(7400,100000,10000),0);assert.throws(()=>reductionPlafonnementIFI(-1,0,0));});
test('Foyer seul : liquidation manuelle 25 000 puis 35 000, décote incluse',()=>{
 assert.deepEqual(impotFoyer(25000,seul),{parts:1,brut:1474,decote:230,net:1244});
 assert.deepEqual(impotFoyer(35000,seul),{parts:1,brut:3604,decote:0,net:3604});
 near(variationIR(10000,30,seul),2360);
});
test('Foyer : avantage ordinaire de deux enfants plafonné à 3 614 €',()=>{
 const couple={revenu:200000,adultes:2,enfants:0};
 near(impotFoyer(200000,couple).net-impotFoyer(200000,{...couple,enfants:2}).net,3614);
});
test('Foyer : déficit limité à l’impôt avant et revenus nuls sans crédit fictif',()=>{near(variationIR(-100000,45,seul),-1244);near(variationIR(1000,30,{...seul,revenu:0}),0);assert.throws(()=>impotFoyer(20000,{...seul,enfants:.5}));assert.throws(()=>variationIR(NaN,30,seul));});
test('Foncier : économie de déficit plafonnée par le foyer et projection sans crédit fictif',()=>{
 const r=liquidationFoncier({loyers:1000,interets:0,autresCharges:12000,travaux:0,locaux:1,tmi:30,tauxPS:17.2,annee:2026,renovation:false,travauxEligibles:0,microConfirme:false,reports:[],foyer:seul});
 near(r.gainGlobal,1244);near(r.deficitFoncier.imputationRevenuGlobal,10700);near(r.deficitFoncier.reportSurRevenusFonciers,320);
});
test('LMNP : le mode foyer remplace la TMI sans changer les PS',()=>{
 const p={type:'classique',recettes:20000,n1:20000,n2:20000,conditionsMicro:true,autresRevenus:30000,charges:10000,fraisReel:0,amortissement:0,reportAmortissement:0,deficitImputable:0,tmi:30,ps:18.6,socialForce:false};
 const r=liquidationMeuble({...p,foyer:seul});near(r.irMicro,2360);near(r.irReel,2360);near(r.socialReel,1860);
});
test('SCI : pas de double liquidation des intérêts de compte courant en mode foyer',()=>{
 const p={loyers:10000,charges:0,interets:0,principal:0,chargesFiscalesIR:0,amortissement:0,ccaVerse:0,ccaDeductibleIR:0,ccaDeductibleIS:0,tmi:30,distribution:0,isReduit:false,bareme:false,foyer:seul};
 near(liquidationSCI(p).impotIR,2360);assert.throws(()=>liquidationSCI({...p,ccaVerse:1}));assert.throws(()=>liquidationSCI({...p,bareme:true}));
});
test('Capacité : zéro intérêt, 700 € sur 120 mois, frais financés par enveloppe',()=>{const r=capaciteEmprunt(cap);near(r.capital,84000);near(r.budget,92727.2727);near(r.budget+r.fraisAchat+cap.fraisCredit,104000);});
test('Capacité : assurance comprise, mensualité ne dépasse pas le disponible',()=>{const r=capaciteEmprunt({...cap,taux:3.5,assurance:.3});const p=echeancierPret({capital:r.capital,mois:120,taux:3.5,assurance:.3,assuranceRestant:false,frais:0});near(p.lignes[0].interets+p.lignes[0].capital+p.lignes[0].assurance,r.disponible);});
test('Capacité : crédits existants saturés et apport insuffisant',()=>{const r=capaciteEmprunt({...cap,credits:800,apport:0});near(r.capital,0);near(r.budget,0);assert.equal(r.financementInsuffisant,true);assert.throws(()=>capaciteEmprunt({...cap,mois:0}));});
test('Relance : 250 000 € neuf, base 200 000 €, déduction annuelle 7 000 €',()=>{const r=relanceLogement(rel);near(r.base,200000);near(r.deduction,7000);near(r.gainIR,2100);near(r.gainPS,1204);});
test('Relance : début au premier du mois avant la signature, prorata de dix mois',()=>{const r=relanceLogement({...rel,annee:2026});assert.equal(r.mois,10);near(r.deduction,5833.3333);});
test('Relance : année avant achèvement et dernier mois seulement',()=>{near(relanceLogement({...rel,debut:'2027-12-01',annee:2026}).deduction,0);near(relanceLogement({...rel,debut:'2027-12-01'}).deduction,583.3333);});
test('Relance ancien : travaux dans la base, foncier exclu de l’ensemble',()=>{const r=relanceLogement({...rel,prix:200000,travaux:60000,ancien:true});near(r.base,208000);near(r.deduction,6240);assert.throws(()=>relanceLogement({...rel,prix:200000,travaux:59999,ancien:true}));});
test('Relance : plafond foyer partagé et base amortie restante',()=>{near(relanceLogement({...rel,autresAmortissements:6500}).deduction,1500);near(relanceLogement({...rel,dejaAmorti:199500}).deduction,500);near(relanceLogement({...rel,autresAmortissements:9000}).deduction,0);});
test('Relance : déficit venant des intérêts distinct de l’imputation globale',()=>{const r=relanceLogement({...rel,loyers:1000,interets:2000,charges:5000});near(r.avec.global,10700);near(r.avec.report,2300);near(r.avec.ps,0);});
test('Relance : confirmation, dates et double déduction contrôlées',()=>{
 for(const change of [{confirme:false},{dateAcquisition:'2026-02-20'},{dateAcquisition:'2029-01-01'},{debut:'2026-02-30'},{debut:'2026-02-01'},{travaux:1000},{dejaAmorti:200001},{annee:2027.5}])assert.throws(()=>relanceLogement({...rel,...change}));
});
test('Stratégie : sans gain, dette, recettes ni amortissement, les apports sont rendus',()=>{const r=strategieImmobiliere(strat);near(r.netDirect,0);near(r.netPersonnelIS,0);near(r.remboursementCCA,100000);near(r.dividende,0);});
test('Stratégie : remboursement du capital ne constitue ni charge fiscale ni bénéfice',()=>{const r=strategieImmobiliere({...strat,credit:60000,horizon:2});near(r.lignes[0].principal,6000);near(r.lignes[1].restant,48000);near(r.netDirect,0);near(r.netPersonnelIS,0);near(r.remboursementCCA,46000);near(r.dividende,0);});
test('Stratégie : vente sous le prix, IS nul et compte courant partiellement perdu',()=>{const r=strategieImmobiliere({...strat,vente:80000});near(r.netDirect,-20000);near(r.netPersonnelIS,-20000);near(r.ccaNonRembourse,20000);near(r.lignes[0].is,0);});
test('Stratégie : 20 000 € de gain, IS 5 000 puis PFU 4 710 sur le dividende',()=>{const r=strategieImmobiliere({...strat,vente:120000});near(r.taxeVenteIR,7240);near(r.netDirect,12760);near(r.lignes[0].is,5000);near(r.dividende,15000);near(r.pfu,4710);near(r.netPersonnelIS,10290);});
test('Stratégie : déficits amortissements compensés à la vente, pas de double imposition',()=>{const r=strategieImmobiliere({...strat,terrain:0,horizon:2,amortAnnees:10});near(r.amorti,20000);near(r.lignes[1].is,0);near(r.netPersonnelIS,0);});
test('Stratégie : échéancier épuisé avant la vente et zéro dette restante',()=>{const r=strategieImmobiliere({...strat,credit:60000,mois:12,horizon:3});near(r.lignes[1].principal,0);near(r.lignes[2].restant,0);near(r.netDirect,0);near(r.netPersonnelIS,0);});
test('Stratégie : loyers conservés en SCI puis fiscalité du dividende final',()=>{const r=strategieImmobiliere({...strat,loyers:10000,horizon:2});near(r.dividende,15000);near(r.netPersonnelIS,10290);near(r.residuelSCI,0);});
test('Guide LMNP : 35 000 puis 55 000 € de plus-value et surtaxe, PS immobiliers 17,2 %',()=>{const p={acquisition:200000,vente:250000,fraisAcquisition:15000,fraisVente:0,travaux:0,reintegration:0,exceptionResidence:false,dateAcquisition:'2022-01-01',dateVente:'2026-09-14',ps:17.2};near(plusValueMeuble(p).total,12670);near(plusValueMeuble({...p,reintegration:20000}).total,20760);assert.throws(()=>plusValueMeuble({...p,dateVente:'2025-09-14'}));});
test('Guide plus-value : 22 années révolues, IR exonéré et PS 12 384 €',()=>{const a=abattementsPlusValue(22);near(a.ir,100);near(100000*(1-a.ps/100)*.172,12384);});
test('Guides : douze sujets distincts, titres et descriptions uniques, sources et maillage complets',()=>{
 assert.equal(guides.length,12);for(const key of ['slug','title','description'])assert.equal(new Set(guides.map(g=>g[key])).size,12);
 for(const g of guides){assert.ok(g.sources.length>=1);assert.ok(g.sections.length>=2);assert.ok(g.documents.length>=2);for(const [route]of g.tools)assert.ok(require('node:fs').existsSync(require('node:path').join(__dirname,'../src/app',route,'page.tsx')),route);}
 assert.equal(Object.keys(toolResources).length,19);for(const r of Object.values(toolResources))for(const [slug]of r.guides)assert.ok(guides.some(g=>g.slug===slug),slug);
});
