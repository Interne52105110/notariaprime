import jsPDF from 'jspdf';
import type { RapportPretaxe } from './PretaxeReport';

export function creerPDFPretaxe(rapport:RapportPretaxe) {
  const doc = new jsPDF();
  let y=20;
  const clean=(value:string)=>value.replace(/[\u202f\u00a0]/g,' ').replace(/[’]/g,"'").replace(/[−–—]/g,'-').replace(/→/g,'vers').replace(/€ /g,'EUR ');
  const money=(v:number)=>clean(v.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}))+' EUR';
  const room=(height:number)=>{if(y+height>275){doc.addPage();y=20;}};
  const paragraph=(text:string,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');const lines:string[]=doc.splitTextToSize(clean(text),170);for(const l of lines){room(6);doc.text(l,20,y);y+=6;}y+=2;};
  doc.setFontSize(15);paragraph('NotariaPrime - Pretaxe estimative',true);
  doc.setFontSize(10);paragraph(`Edition : ${new Date().toLocaleDateString('fr-FR')} | ${rapport.departement}`);paragraph(rapport.acte,true);
  paragraph('DETAIL : EMOLUMENTS HT ET SOMMES HORS TVA',true);
  for(const e of rapport.emoluments){paragraph(`${e.libelle} | Assiette : ${money(e.base)} | Emolument HT : ${money(e.ht)}`);}
  for(const l of rapport.lignes){paragraph(`${l.libelle}${l.reference?' ('+l.reference+')':''} | ${l.quantite} x ${l.prixUnitaire.toLocaleString('fr-FR',{maximumFractionDigits:5})} EUR | ${money(l.ht)}`);}
  y+=4;paragraph('RECAPITULATIF',true);
  const recap:[string,number][]=[['Emoluments d’acte HT',rapport.emolumentsHT],['Formalites HT',rapport.formalitesHT],['Copies et archivage HT',rapport.documentsHT],['Ecretement HT (R444-9 / A444-175)',-rapport.ecretementHT],[`TVA ${rapport.tauxTVA} % sur les emoluments nets`,rapport.tva],['Tresor public, dont CSI',rapport.taxes],['Debours justifies',rapport.debours],['TOTAL ESTIME DES POSTES RENSEIGNES',rapport.total]];
  for(const [label,v] of recap){if(!v&&label.startsWith('Ecretement'))continue;room(9);doc.setFont('helvetica',label.startsWith('TOTAL')?'bold':'normal');doc.text(clean(label),20,y);doc.text(money(v),190,y,{align:'right'});y+=9;}
  y+=4;for(const note of rapport.notes)paragraph(note);
  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text(`NotariaPrime - Page ${i}/${pages}`,105,290,{align:'center'});}
  return doc;
}
export function exporterPretaxePDF(rapport:RapportPretaxe){creerPDFPretaxe(rapport).save(`notariaprime_pretaxe_${Date.now()}.pdf`);}
