const { test } = require('node:test');
const assert = require('node:assert/strict');
const { anneesRevolues, abattementsPlusValue, surtaxePlusValue, BAREME_IR_2026 } = require('../src/lib/fiscal.ts');
const sci = require('../src/app/sci/calculs.ts');
const pretaxe = require('../src/app/pretaxe/PretaxeCalculations.ts');
const { BAREME_SUCCESSION } = require('../src/lib/donation.ts');

test('durée de date à date : veille et jour anniversaire, y compris années bissextiles', () => {
  assert.equal(anneesRevolues('2020-09-08', '2026-09-07'), 5);
  assert.equal(anneesRevolues('2020-09-08', '2026-09-08'), 6);
  assert.equal(anneesRevolues('2004-09-08', '2026-09-08'), 22);
  assert.ok(Number.isNaN(anneesRevolues('2026-09-08', '2020-09-08')));
});
for (const [years, ir, ps] of [[5,0,0],[5.9,0,0],[6,6,1.65],[6.9,6,1.65],[21,96,26.4],[22,100,28],[23,100,37],[29,100,91],[30,100,100]]) {
  test(`CGI 150 VC : abattements à ${years} ans`, () => {
    const result = abattementsPlusValue(years);
    assert.equal(result.ir, ir);
    assert.ok(Math.abs(result.ps - ps) < 1e-9);
  });
}
for (const [pv, expected] of [[50000,0],[55000,850],[60000,1200],[100000,2000],[103400,2442],[110000,3300],[150000,4500],[155000,5450],[160000,6400],[200000,8000],[205000,9250],[210000,10500],[250000,12500],[255000,14050],[260000,15600],[300000,18000]]) {
  test(`CGI 1609 nonies G : surtaxe sur ${pv} €`, () => assert.ok(Math.abs(surtaxePlusValue(pv) - expected) < 1e-8));
}
test('SCI : un prêt sans intérêt ne produit pas NaN', () => {
  assert.equal(sci.calculerEmprunt(120000, 0, 10).mensualite, 1000);
  assert.equal(sci.calculerEmprunt(120000, 0, 10).interetsTotal, 0);
  assert.throws(() => sci.calculerEmprunt(120000, 0, 0), RangeError);
});
test('SCI : la moins-value ne crée pas de crédit fiscal fictif', () => {
  const result = sci.calculerPlusValue({ tauxValorisationAnnuelle:'0', prixReventeManuel:'100000', dureeAmortissement:'30' },200000,1);
  assert.equal(result.IR.fiscaliteTotal,0);
  assert.equal(result.IS.impotIS,0);
});
test('SCI : zéro revalorisation est conservé et la surtaxe est comprise', () => {
  const result = sci.calculerPlusValue({ tauxValorisationAnnuelle:'0', prixReventeManuel:'', dureeAmortissement:'30' },200000,10);
  assert.equal(result.prixVenteEstime,200000);
  const taxable = sci.calculerPlusValue({ tauxValorisationAnnuelle:'0', prixReventeManuel:'400000', dureeAmortissement:'30' },100000,1);
  assert.equal(taxable.IR.taxeAdditionnelle,18000);
  assert.equal(taxable.IR.fiscaliteTotal,126600);
});
test('IFI : seuil strict et décote entre 1,3 et 1,4 M€', () => {
  assert.equal(sci.calculerIFI(1300000,0).impotIFI,0);
  assert.equal(sci.calculerIFI(1350000,0).impotIFI,2225);
  assert.equal(sci.calculerIFI(1400000,0).impotIFI,3200);
});
test('IR : bornes de la loi de finances 2026', () => {
  assert.deepEqual(BAREME_IR_2026.map(t=>t.max),[11600,29579,84577,181917,Infinity]);
});
test('donation entre époux/PACS : le barème est imposable après 80 724 €', () => {
  for (const lien of ['conjoint','partenaire-pacs']) {
    assert.equal(BAREME_SUCCESSION[lien].abattement,80724);
    assert.deepEqual(BAREME_SUCCESSION[lien].tranches.map(t=>t.max),[8072,15932,31865,552324,902838,1805677,Infinity]);
    assert.equal(BAREME_SUCCESSION[lien].tranches[0].taux,5);
  }
  assert.equal(BAREME_SUCCESSION.autre.abattement,0);
});
test('A444-91 : émolument de vente et remise plafonnée à la fraction au-delà de 100 k€', () => {
  const tranches = [{min:0,max:6500,taux:3.870},{min:6500,max:17000,taux:1.596},{min:17000,max:60000,taux:1.064},{min:60000,max:Infinity,taux:0.799}];
  assert.equal(pretaxe.calculerEmoluments(300000,tranches,'75',false).nets,2794.25);
  assert.equal(pretaxe.calculerEmoluments(300000,tranches,'75',true).nets,2474.65);
});
test('DMTO Morbihan : taux départemental 5 %, ou 4,5 % pour primo-accédant éligible', () => {
  let taxes={};const setTaxes=fn=>{taxes=fn(taxes);};
  pretaxe.calculerTaxes('300000','56','ancien',setTaxes,false);
  assert.equal(taxes.departementale,15000);
  assert.equal(taxes.communale,3600);
  assert.equal(taxes.fraisAssiette,356);
  pretaxe.calculerTaxes('300000','56','ancien',setTaxes,true);
  assert.equal(taxes.departementale,13500);
});

const { repartirDeficitFoncier, plusDeCinqAns, limiterDettesIFI, plusValueProfessionnelle } = require('../src/lib/fiscal.ts');
const { appliquerBareme } = require('../src/lib/donation.ts');
test('BOFiP déficit : 15000 loyers, 18000 intérêts, 20000 autres charges', () => {
  assert.deepEqual(repartirDeficitFoncier(15000,18000,20000),{deficit:23000,imputation:10700,report:12300});
  assert.deepEqual(repartirDeficitFoncier(10000,8000,5000),{deficit:3000,imputation:3000,report:0});
});
test('forfait travaux : cinq ans exactement puis lendemain', () => {
  assert.equal(plusDeCinqAns('2021-09-08','2026-09-08'),false);
  assert.equal(plusDeCinqAns('2021-09-08','2026-09-09'),true);
});
test('IFI limitation dette gros patrimoines', () => {
  assert.equal(limiterDettesIFI(6000000,5000000),4300000);
  assert.equal(limiterDettesIFI(5000000,4000000),4000000);
});
test('donations : rappel fiscal officiel et donation entre époux', () => {
  const tranches = BAREME_SUCCESSION.enfant.tranches;
  assert.equal(appliquerBareme(150000,tranches)-appliquerBareme(50000,tranches),20000);
  assert.ok(Math.abs(appliquerBareme(100000-80724,BAREME_SUCCESSION.conjoint.tranches)-1691.20)<0.001);
});
test('vente neuf : exemple DGFiP 100000 euros, ancien puis neuf sans taxe résiduelle', () => {
  let taxes = {}; const update = f => { taxes = f(taxes); };
  pretaxe.calculerTaxes('100000','75','ancien',update);
  pretaxe.calculerTaxes('100000','75','neuf',update);
  assert.equal(taxes.departementale,700); assert.equal(taxes.communale,0); assert.equal(taxes.fraisAssiette,15);
  pretaxe.calculerTaxes('','75','ancien',update); assert.equal(taxes.departementale,0);
});
test('actif professionnel : vente sous le coût historique mais au-dessus de la VNC', () => {
  assert.equal(plusValueProfessionnelle(80000,100000,40000),20000);
  assert.equal(plusValueProfessionnelle(80000,100000,0),-20000);
});
test('SCI transmission : aucune survalorisation IS ni second parent inventé', () => {
  const result=sci.calculerTransmission({valeurTransmission:'200000',regimeFiscal:'IS',demembrement:false,associes:[]});
  assert.equal(result.valeurRevaluee,200000); assert.equal(result.nombreBeneficiaires,1); assert.equal(result.baseImposable,100000);
  assert.ok(Math.abs(result.droitsTotal-18194.35)<0.001);
});

const succession = require('../src/lib/succession.ts');
const retraite = require('../src/lib/retraite.ts');
const av = require('../src/lib/assurance-vie.ts');
const actes = require('../src/lib/actes-successoraux.ts');
for(const [lien,part,expected] of [['conjoint',500000,0],['partenaire-pacs',500000,0],['enfant',100000,0],['enfant',200000,18194],['autre',10000,5044],['petit-enfant',10000,437],['neveu-niece',10000,1118]]) {
 test(`Succession ${lien} ${part}`,()=>assert.equal(succession.droitsSuccession({lien,partNette:part}).droits,expected));
}
test('Succession : fratrie exonérée, représentation et rappel',()=>{
 assert.equal(succession.droitsSuccession({lien:'frere-soeur',partNette:300000,fratrieExoneree:true}).droits,0);
 assert.equal(succession.droitsSuccession({lien:'petit-enfant',partNette:50000,representation:'enfant',nombreRepresentants:2}).droits,0);
 assert.equal(succession.droitsSuccession({lien:'enfant',partNette:100000,abattementConsomme:100000,baseAnterieureTaxable:50000}).droits,20000);
 assert.throws(()=>succession.droitsSuccession({lien:'enfant',partNette:-1}),RangeError);
});
for(const [age,u] of [[20,90],[21,80],[30,80],[31,70],[60,50],[61,40],[90,20],[91,10]]) test(`CGI 669 âge ${age}`,()=>assert.equal(succession.usufruitFiscal(age),u));
test('Dutreil : réduction à 69 ans, exclusion à 70 ans et nue-propriété',()=>{
 const args=[50000,150000,0,BAREME_SUCCESSION.enfant.tranches];
 assert.ok(Math.abs(succession.reductionDroitsDutreil(...args,69,true)-4097.175)<.001);
 assert.equal(succession.reductionDroitsDutreil(...args,70,true),0);
 assert.equal(succession.reductionDroitsDutreil(...args,69,false),0);
});
for(const [date,ans,mois,t] of [['1961-08-31',62,0,168],['1961-09-01',62,3,168],['1964-09-08',62,9,170],['1965-03-31',62,9,170],['1965-04-01',63,0,171],['1966-01-01',63,3,172],['1968-01-01',63,9,172],['1969-01-01',64,0,172]]) test(`Retraite septembre 2026 ${date}`,()=>assert.deepEqual(retraite.parametresRetraite(date),{ans,mois,trimestres:t}));
test('Agirc-Arrco exemple officiel salaire 75500 euros',()=>assert.ok(Math.abs(retraite.pointsAnnuelsAgircArrco(75500)-378.67)<.01));
test('Décote relative, taux plein automatique et surcote après plafond',()=>{
 assert.equal(retraite.pensionBasePrive(30000,166,170,63).taux,.475);
 assert.equal(retraite.pensionBasePrive(30000,160,170,67).taux,.5);
 assert.ok(Math.abs(retraite.pensionBasePrive(48060,172,172,66,8).pension-26433)<1e-8);
});
test('AV abattement appliqué d’abord au taux 7,5 % et seuil tous contrats',()=>{
 assert.equal(av.impotRachatHuitAns(0,20000,100000,100000,4600),1685);
 assert.equal(av.impotRachatHuitAns(5000,5000,150000,100000,4600),670);
});
test('Actes : délivrance de legs et certificat mobilier',()=>{
 assert.equal(pretaxe.calculerEmoluments(100000,actes.ACTES_SUCCESSORAUX.delivrance_legs_avec.tranches,'75',false).bruts,704.28);
 assert.equal(pretaxe.calculerEmoluments(100000,actes.ACTES_SUCCESSORAUX.delivrance_legs_sans.tranches,'75',false).bruts,352.11);
});

const viager = require('../src/lib/viager.ts');
test('viager : taux nul et mensualités actualisées sont deux scénarios financiers cohérents', () => {
  assert.equal(viager.facteurMensuelViager(10,0),120);
  const p={valeur:300000,bouquet:90000,occupation:90000,horizon:10,taux:0,methode:'actualisee',coefficient:0};
  assert.equal(viager.scenarioViager(p).rente,1000);
  assert.equal(viager.scenarioViager(p).totalHorizon,210000);
  const rate=3.5;
  const r=viager.scenarioViager({...p,taux:rate}).rente;
  const pv=Array.from({length:120},(_,i)=>r/(1+rate/100)**((i+1)/12)).reduce((a,b)=>a+b,0);
  assert.ok(Math.abs(pv-120000)<1e-6);
});
test('viager : coefficient professionnel distinct de la durée du scénario', () => {
  const p={valeur:300000,bouquet:90000,occupation:90000,horizon:10,taux:3.5,methode:'coefficient',coefficient:8};
  assert.equal(viager.scenarioViager(p).rente,1250);
  assert.equal(viager.scenarioViager({...p,horizon:30}).rente,1250);
  assert.throws(()=>viager.scenarioViager({...p,coefficient:0}),RangeError);
  assert.throws(()=>viager.scenarioViager({...p,bouquet:250000}),RangeError);
  assert.throws(()=>viager.scenarioViager({...p,occupation:-1}),RangeError);
  assert.throws(()=>viager.facteurMensuelViager(0,3.5),RangeError);
});
test('viager : la fraction imposable suit l’âge au premier versement sans réduire la rente', () => {
  for(const [age,fraction] of [[49,.7],[50,.5],[59,.5],[60,.4],[69,.4],[70,.3]]) assert.equal(viager.fractionRenteImposable(age),fraction);
});

const holding = require('../src/lib/holding.ts');
const holdingBase = {valeur:200000,bati:160000,loyers:20000,charges:2000,taxe:1000,emprunt:0,taux:0,duree:10,amortissement:.025,comptabilite:1000,gestion:0,tmi:30,distribuer:false,tauxReduit:false};
test('holding : amortissement non décaissé et IS mère-fille compris dans la trésorerie',()=>{
 const r=holding.projectionHolding(holdingBase,1)[0];
 assert.equal(r.amort,4000);assert.equal(r.isSCI,3000);assert.equal(r.beneficeSCI,9000);
 assert.equal(r.remontee,9000);assert.equal(r.isHolding,112.5);
 assert.equal(r.netGroupe,12887.5);assert.equal(r.cashSCI,4000);assert.equal(r.cashHolding,8887.5);
 assert.equal(r.cumulHolding,r.cashSCI+r.cashHolding);
});
test('holding : prêt sans intérêt, capital remboursé non déductible, dividendes bornés au cash',()=>{
 assert.deepEqual(holding.echeanceAnnuelle(120000,0,10,1),{interets:0,principal:12000});
 const r=holding.projectionHolding({...holdingBase,emprunt:120000},1)[0];
 assert.equal(r.isSCI,3000);assert.equal(r.principal,12000);assert.equal(r.remontee,1000);
 assert.equal(r.netDirect,17000-12000-17000*.472);assert.equal(r.netGroupe,987.5);
});
test('holding : distribution personnelle et réserves distinctes, zéro rendement implicite',()=>{
 const r=holding.projectionHolding({...holdingBase,distribuer:true},1)[0];
 assert.equal(r.distribution,8887.5);assert.equal(r.pfu,8887.5*.314);assert.equal(r.cashSCI,4000);
 const a=holding.projectionHolding({...holdingBase,amortissement:0},2);
 assert.equal(a[1].cumulHolding,2*a[0].cumulHolding);
});
test('holding : amortissement plafonné au bâti et report des déficits avant IS',()=>{
 const a=holding.projectionHolding({...holdingBase,bati:20000,amortissement:1},3);
 assert.equal(a[0].isSCI,0);assert.equal(a[1].amort,0);assert.equal(a[1].baseSCI,12000);
 assert.equal(a.reduce((s,x)=>s+x.amort,0),20000);
 assert.equal(holding.impotSociete(50000,true),8250);assert.equal(holding.impotSociete(50000,false),12500);
});
