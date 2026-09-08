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
