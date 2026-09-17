const { test } = require('node:test');
const assert = require('node:assert/strict');
const { toolHelp } = require('../src/content/tool-help.ts');
const { liquidationSCI } = require('../src/lib/sci.ts');
const { echeancierPret } = require('../src/lib/pret.ts');
const { droitsSuccession, usufruitFiscal } = require('../src/lib/succession.ts');
const { appliquerBareme, BAREME_SUCCESSION } = require('../src/lib/donation.ts');
const { pensionBasePrive } = require('../src/lib/retraite.ts');
const { relanceLogement, capaciteEmprunt } = require('../src/lib/projets.ts');
const { abattementsPlusValue, decoteIFI, repartirDeficitFoncier, plusValueProfessionnelle } = require('../src/lib/fiscal.ts');
const { calculerEmoluments } = require('../src/app/pretaxe/PretaxeCalculations.ts');
const { categoriesActes } = require('../src/app/pretaxe/pretaxeCatalog.ts');
const money = (route,row,actual,example=0) => {
  const value=toolHelp[route].examples[example].rows[row][1];
  assert.match(value,/^[\d\s.,−-]+ €$/);
  const expected=Number(value.replace('−','-').replace(/[^\d,.-]/g,'').replace(',','.'));
  assert.ok(Math.abs(expected-actual)<0.005,`${route}: published ${value}, engine ${actual}`);
};
test('Aide : exemple SCI cohérent avec les bases, impôts et trésoreries du moteur',()=>{
  const r=liquidationSCI({loyers:15000,charges:3000,interets:0,principal:0,chargesFiscalesIR:0,amortissement:5000,ccaVerse:0,ccaDeductibleIR:0,ccaDeductibleIS:0,tmi:30,distribution:0,isReduit:false,bareme:false});
  [r.baseIR,r.impotIR+r.psIR,r.cashIR,r.baseIS,r.impotIS,r.tresorerieIS].forEach((v,i)=>money('/sci',i,v));
});
test('Aide : première échéance du prêt et durée complète',()=>{
  const r=echeancierPret({capital:200000,mois:240,taux:3.5,assurance:0,assuranceRestant:false,frais:0});
  [r.mensualite,r.lignes[0].interets,r.lignes[0].capital,r.lignes[0].restant].forEach((v,i)=>money('/pret',i,v));
});
test('Aide : transmission en pleine propriété et nue-propriété',()=>{
  money('/succession',3,droitsSuccession({partNette:200000,lien:'enfant'}).droits);
  const base=300000*(100-usufruitFiscal(65))/100-100000;
  money('/donation',2,base);money('/donation',3,appliquerBareme(base,BAREME_SUCCESSION.enfant.tranches));
});
test('Aide : vente, émolument et TVA hors autres frais',()=>{
  const catalogue=Object.assign({},...Object.values(categoriesActes).map(c=>c.actes));
  const r=calculerEmoluments(300000,catalogue.vente_immeuble.tranches,'0',false);
  money('/pretaxe',0,r.nets);money('/pretaxe',1,Math.round(r.nets*20)/100);money('/pretaxe',2,r.nets+Math.round(r.nets*20)/100);
});
test('Aide : capacité, retraite de base et plafond Relance logement',()=>{
  money('/capacite-emprunt',2,capaciteEmprunt({revenus:4000,credits:200,effort:35,mois:240,taux:3.5,assurance:.3,apport:20000,fraisCredit:2000,fraisAchatPct:8}).disponible);
  const pension=pensionBasePrive(30000,172,172,64).pension;money('/retraite',0,pension);money('/retraite',1,pension/12);
  const p={prix:250000,travaux:0,ancien:false,niveau:'intermediaire',dateAcquisition:'2026-03-01',debut:'2026-03-01',annee:2027,dejaAmorti:0,plafondFoyer:8000,autresAmortissements:3000,loyers:12000,charges:2000,interets:1000,tmi:30,confirme:true};
  const r=relanceLogement(p);money('/relance-logement',0,r.base);money('/relance-logement',1,r.theorique);
  assert.equal(r.deduction,5000);
});
test('Aide : abattements immobiliers, décote IFI et déficit foncier',()=>{
  const abatt=abattementsPlusValue(22);money('/plusvalue',4,100000*(1-abatt.ps/100)*.172);
  money('/ifi',2,-decoteIFI(1350000));money('/ifi',3,500000*.005+50000*.007-decoteIFI(1350000));
  const d=repartirDeficitFoncier(15000,18000,20000);money('/revenus-fonciers',0,d.deficit);money('/revenus-fonciers',2,d.imputation);money('/revenus-fonciers',3,d.report);
  assert.equal(plusValueProfessionnelle(80000,100000,40000),20000);
});
