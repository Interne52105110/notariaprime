const {test} = require('node:test');
const assert = require('node:assert/strict');
const {lireMontant,arrondirCentimes,sommeMontants} = require('../src/lib/montants.ts');
const calculs = require('../src/app/pretaxe/PretaxeCalculations.ts');
const {categoriesActes} = require('../src/app/pretaxe/pretaxeCatalog.ts');
const rules = require('../src/app/pretaxe/pretaxeAuditRules.ts');
const lines = require('../src/app/pretaxe/pretaxeLines.ts');
const {parseExtractedText} = require('../src/app/pretaxe/extractPretaxeText.ts');
const {validerExtractionOllama} = require('../src/app/pretaxe/ollamaExtract.ts');
const {creerPDFPretaxe} = require('../src/app/pretaxe/pretaxePdf.ts');
const corpus = require('./fixtures/pretaxe-audit.json');
const catalogue = Object.assign({},...Object.values(categoriesActes).map(c=>c.actes));

test('montants : centimes, espaces insécables, deux conventions, saisies invalides',()=>{
  for(const s of ['123 456,78','123\u202f456,78','123456.78','123,456.78','123.456,78']) assert.equal(lireMontant(s),123456.78,s);
  assert.equal(lireMontant('0'),0); assert.equal(lireMontant('500'),500);
  for(const s of ['', '12abc', '1,2,3', '-1','Infinity','1.234,567']) assert.equal(lireMontant(s),null,s);
  assert.equal(arrondirCentimes(259.275),259.28);
  assert.equal(arrondirCentimes(-259.275),-259.28);
  assert.equal(sommeMontants([.1,.2]),.3);
});

for(const c of corpus.cases) test(`corpus ${c.case} ligne ${c.row} : ${c.acte}, base ${c.base}`,()=>{
  const acte=catalogue[c.acte]; assert.ok(acte,c.acte);
  let result=acte.type==='fixe'?acte.montant:calculs.calculerEmoluments(c.base,acte.tranches,'15',false).nets;
  if(acte.type==='fixe'&&!c.acte.startsWith('mainlevee'))result=arrondirCentimes(result*c.base);
  assert.equal(result,c.legalExpected);
  assert.equal(arrondirCentimes(result-c.professional),c.residual);
});
test('les cinq résidus professionnels ne sont pas masqués',()=>{
  assert.deepEqual(corpus.cases.filter(c=>c.residual).map(c=>c.case),['PT010','PT015','PT044','PT046','PT167']);
});

test('donation : deux donateurs aux apports inégaux, même donateur regroupé par biens',()=>{
  const make=(id,values)=>({id,nom:id,transmissions:values.map((base,i)=>({id:id+i,bien:'',beneficiaires:'A : 3/4 ; B : 1/4',pleinePropriete:String(base),droit:i%2?'nue_propriete_reserve':'pleine_propriete'}))});
  const bases=rules.basesDonation([make('M',[100000,137925]),make('Mme',[222675])]);
  assert.deepEqual(bases.map(b=>b.base),[237925,222675]);
  const details=bases.map(b=>calculs.calculerEmoluments(b.base,catalogue.donation.tranches,'15',false));
  assert.equal(rules.additionnerEmoluments(details).nets,5590.75);
  assert.equal(calculs.calculerEmoluments(460600,catalogue.donation.tranches,'15',false).nets,5093.77);
  // L'absence d'un second donateur ne crée aucune demi-part.
  assert.equal(rules.basesDonation([make('M',[237925])])[0].base,237925);
  const unknown=make('M',[100000]);unknown.transmissions[0].droit='autre';
  assert.equal(rules.basesDonation([unknown])[0].valide,false);
  assert.equal(rules.basesDonation([rules.nouveauDonateur('vide')])[0].valide,false);
});

for(const c of corpus.ecretements)test(`écrêtement ${c.id} : copies et archivage inclus`,()=>{
  const total=rules.calculerEcretement(c.base,true,c.acte_ht,c.formalites_ht-c.copies_archivage_ht,c.copies_archivage_ht);
  assert.equal(total,-c.observed);
});
test('écrêtement : virgule, minimum et application réservée aux mutations couvertes',()=>{
  assert.equal(rules.calculerEcretement(lireMontant('3 700,50'),true,143.21,780,15.2),568.36);
  assert.equal(rules.calculerEcretement(500,true,30,100,20),60);
  assert.equal(rules.calculerEcretement(500,false,30,100,20),0);
});

function defaults(acte) {
  let debours={csi:0,etatsHypothecaires:0,cadastre:0,urbanisme:0},formalites={},documents={},taxes={};
  calculs.appliquerConfigParDefaut(acte,fn=>debours=fn(debours),fn=>formalites=fn(formalites),value=>documents=typeof value==='function'?value(documents):value,value=>taxes=typeof value==='function'?value(taxes):value);
  return {debours,formalites,documents,taxes};
}
test('forfait : pas de copie ou cadastre doublé par défaut, diagnostics à sélectionner',()=>{
  const d=defaults('vente_immeuble');
  assert.equal(d.formalites.cadastre.actif,false);
  assert.equal(d.documents.copiesAuthentiques,0);
  assert.ok(Object.values(d.formalites.diagnostics).every(x=>!x.actif));
  assert.equal(d.formalites.notification.actif,false);
  assert.equal(d.formalites.requisition.actif,false);
  assert.equal(d.documents.pagesActe,0);
  assert.equal(d.documents.archivageNumerise,false);
  assert.equal(d.debours.etatsHypothecaires,0);
  assert.equal(defaults('donation').formalites.publiciteFonciere.actif,false);
});
test('formalités en quantité : deux pièces et cinq consultations, TVA globale',()=>{
  const d=defaults('procuration');
  for(const [k,v] of Object.entries(d.formalites))if(k!=='diagnostics')v.actif=false;
  const r=lines.lignesFormalites(d.formalites,[{id:'a',code:'204',libelle:'Pièces',quantite:2},{id:'b',code:'219',libelle:'Fichiers',quantite:5}],20,0);
  assert.equal(lines.totalLignes(r,20).ht,169.8);
  assert.equal(lines.totalLignes(r,20).ttc,203.76);
  const copies=lines.lignesDocuments({pagesActe:16,copiesAuthentiques:3,copiesExecutoires:0,copiesHypothecaires:0,copiesLibres:1,archivageNumerise:true},20,0);
  assert.equal(lines.totalLignes(copies,20).ht,63.36);
  const outreMer=lines.lignesDocuments({pagesActe:10,copiesAuthentiques:1,copiesExecutoires:0,copiesHypothecaires:0},8.5,23);
  assert.equal(outreMer[0].ht,13.9);
});
test('prêt professionnel : capital, TPF et CSI sur des bases distinctes',()=>{
  const d=defaults('pret_professionnel');
  calculs.calculerTPF('600000',fn=>d.taxes=fn(d.taxes),216000);
  calculs.calculerCSI('600000',fn=>d.debours=fn(d.debours),.5,720000);
  assert.equal(d.taxes.tpf,1544);assert.equal(d.debours.csi,360);
  const r=lines.lignesDepenses(d.debours,d.taxes,[{id:'csi2',nature:'taxes',libelle:'CSI distincte',montant:15}]);
  assert.equal(sommeMontants(r.filter(x=>x.nature==='taxes').map(x=>x.ht)),1919);
  assert.ok(!r.some(x=>x.nature==='debours'&&x.id==='csi'));
});

const extractionCases=[
 ['centimes','ACTE DE VENTE. Prix de vente : 123 456,78 euros.',{montant:123456.78}],
 ['petit prix','ACTE DE VENTE. Prix de vente : 500 euros.',{montant:500}],
 ['adresse du bien','Office notarial 15000 AURILLAC. ACTE DE VENTE. Bien situé à 33000 BORDEAUX. Prix de vente : 250 000 euros.',{departement:'33'}],
 ['acte cité',"PROCURATION pour signer une vente en l’état futur d’achèvement. Prix de vente : 250 000 euros.",{acteKey:'procuration'}],
 ['prêt','PRÊT HYPOTHÉCAIRE. Capital du prêt : 180 000 euros. Garantie : 216 000 euros. Frais : 2 000 euros.',{montant:180000}],
 ['procuration donation','PROCURATION POUR ACCEPTER UNE DONATION. Valeur des biens 200 000 euros.',{acteKey:'procuration'}],
 ['format anglais','ACTE DE VENTE. Prix de vente : 123,456.78 EUR.',{montant:123456.78}],
 ['prix absent','ACTE DE VENTE. Aucun prix communiqué. Provision pour frais : 8 000 euros. Emprunt ancien : 60 000 euros.',{montant:null}],
 ['prix multiples','ACTE DE VENTE. Prix de vente : 100 000 euros. Prix de vente : 200 000 euros.',{montant:null}],
];
for(const [name,text,expected] of extractionCases)test(`extraction : ${name}`,()=>{
  const result=parseExtractedText(text);
  for(const [key,v] of Object.entries(expected))assert.equal(key==='montant'?lireMontant(result.montant??''):result[key],v);
});
test('IA : rejette montant inventé, NaN, clé inconnue et département non justifié',()=>{
  const r=validerExtractionOllama(JSON.stringify({montant:'NaN',departement:'99',acteSuggestion:'inventer',valeurMobilier:-100}),'ACTE DE VENTE. Prix de vente : 100 000 euros.');
  assert.equal(r.montant,undefined);assert.equal(r.departement,undefined);assert.equal(r.acteSuggestion,undefined);assert.equal(r.valeurMobilier,undefined);
  assert.equal(validerExtractionOllama('{"montant":90000}','ACTE DE VENTE. Prix de vente : 100 000 euros.').montant,undefined);
});
test('PDF : détail, écrêtement et total réconciliés ; pagination des longues prétaxes',()=>{
  const totals=lines.totalPretaxe(143.19,781.27,15.2,569.66,20,50.98,248);
  assert.deepEqual(totals,{tva:74,total:742.98});
  const rapport={acte:'Vente',departement:'15 - Cantal',emoluments:[{libelle:'Vente',base:3700,ht:143.19}],lignes:Array.from({length:80},(_,i)=>lines.ligne(String(i),'formalites','Une formalité détaillée et sa justification '+i,1,1,20)),emolumentsHT:143.19,formalitesHT:781.27,documentsHT:15.2,ecretementHT:569.66,tauxTVA:20,debours:50.98,taxes:248,...totals,notes:['Estimation à compléter selon les pièces.']};
  const pdf=creerPDFPretaxe(rapport);assert.ok(pdf.getNumberOfPages()>2);
  const output=pdf.output();assert.ok(output.includes('Ecretement HT'));assert.ok(output.includes('742,98 EUR'));
});
