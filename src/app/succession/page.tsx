"use client";
import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { droitsSuccession, type LienSuccession } from '@/lib/succession';
const liens: Record<LienSuccession,string> = { enfant:'Enfant', parent:'Père ou mère', 'petit-enfant':'Petit-enfant', 'arriere-petit-enfant':'Arrière-petit-enfant', conjoint:'Époux survivant', 'partenaire-pacs':'Partenaire de PACS légataire', 'frere-soeur':'Frère ou sœur', 'neveu-niece':'Neveu ou nièce', 'parent-4e':'Autre parent jusqu’au 4e degré', autre:'Autre / concubin' };
const euros = (n:number) => n.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const initial = { nom:'Héritier 1', part:'', lien:'enfant' as LienSuccession, handicap:false, abattement:'', rappel:'', representation:'' as ''|'enfant'|'frere-soeur', nombre:'1', fratrie:false, nue:false, age:'70' };
export default function Succession() {
  const [heritiers,setHeritiers] = useState([{...initial,id:1}]);
  const [resultats,setResultats] = useState<ReturnType<typeof droitsSuccession>[]|null>(null);
  const [erreur,setErreur] = useState('');
  const modifier = (id:number, patch:Partial<typeof initial>) => { setHeritiers(h=>h.map(x=>x.id===id?{...x,...patch}:x));setResultats(null); };
  const nombre = (s:string) => s.trim() ? Number(s.replace(/\s/g,'').replace(',','.')) : 0;
  function calculer() { try { setErreur(''); setResultats(heritiers.map(h=>droitsSuccession({partNette:nombre(h.part),lien:h.lien,handicap:h.handicap,abattementConsomme:nombre(h.abattement),baseAnterieureTaxable:nombre(h.rappel),representation:h.representation||undefined,nombreRepresentants:nombre(h.nombre),fratrieExoneree:h.fratrie,nuePropriete:h.nue,ageUsufruitier:nombre(h.age)}))); } catch { setErreur('Vérifiez les montants, les âges et le nombre de représentants.');setResultats(null); } }
  const champ = 'block w-full border border-gray-300 rounded-lg p-3 mt-1 bg-white';
  return <MainLayout><div className="max-w-5xl mx-auto px-5 py-10 space-y-7">
    <h1 className="text-3xl font-bold">Droits de succession</h1>
    <p>Impôt à payer à l’État par héritier ou légataire. Pour les émoluments, formalités et débours des actes du notaire, utilisez la <Link href="/pretaxe" className="underline text-indigo-700">prétaxe des actes</Link>.</p>
    <p className="p-4 bg-blue-50 rounded-xl text-sm">Saisissez la part nette revenant à chaque personne après liquidation du régime matrimonial, dettes déductibles et exonérations des biens. Les quotes-parts civiles ne sont pas déterminées ici. Un partenaire de PACS doit notamment avoir été institué légataire. Assurance-vie : <Link className="underline" href="/assurance-vie">calcul distinct</Link>.</p>
    {heritiers.map(h=><fieldset key={h.id} className="border rounded-xl p-5 space-y-4"><legend className="font-semibold px-2">{h.nom}</legend><div className="grid sm:grid-cols-2 gap-4">
      <label>Nom<input className={champ} value={h.nom} onChange={e=>modifier(h.id,{nom:e.target.value})}/></label>
      <label>Lien avec le défunt<select className={champ} value={h.lien} onChange={e=>modifier(h.id,{lien:e.target.value as LienSuccession,representation:'',fratrie:false})}>{Object.entries(liens).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label>Part nette reçue en pleine propriété (€)<input className={champ} inputMode="decimal" value={h.part} onChange={e=>modifier(h.id,{part:e.target.value})}/></label>
      <label>Abattement déjà utilisé sur les donations rappelables (€)<input className={champ} inputMode="decimal" value={h.abattement} onChange={e=>modifier(h.id,{abattement:e.target.value})}/></label>
      <label>Base taxable antérieure ayant consommé les tranches (€)<input className={champ} inputMode="decimal" value={h.rappel} onChange={e=>modifier(h.id,{rappel:e.target.value})}/></label>
      {['petit-enfant','arriere-petit-enfant','neveu-niece'].includes(h.lien)&&<label>Représentation admise dans le dossier<select className={champ} value={h.representation} onChange={e=>modifier(h.id,{representation:e.target.value as typeof h.representation})}><option value="">Aucune</option><option value="enfant">Souche d’un enfant du défunt</option><option value="frere-soeur">Souche d’un frère ou d’une sœur</option></select></label>}
      {h.representation&&<label>Nombre de représentants se partageant cet abattement<input className={champ} type="number" min="1" value={h.nombre} onChange={e=>modifier(h.id,{nombre:e.target.value})}/></label>}
    </div><p className="text-xs text-gray-600">Rappel fiscal : seulement les donations de moins de quinze ans. En représentation, renseignez votre fraction des abattements déjà consommés ; le partage proposé est égal par souche.</p>
    <label className="block"><input type="checkbox" checked={h.handicap} onChange={e=>modifier(h.id,{handicap:e.target.checked})}/> Handicap répondant aux conditions fiscales de l’article 779 II</label>
    {h.lien==='frere-soeur'&&<label className="block text-sm"><input type="checkbox" checked={h.fratrie} onChange={e=>modifier(h.id,{fratrie:e.target.checked})}/> Les trois conditions d’exonération sont remplies : célibataire, veuf, divorcé ou séparé de corps ; plus de 50 ans ou infirmité empêchant de subvenir à ses besoins ; domicile constant avec le défunt pendant les cinq années précédant le décès.</label>}
    <label className="block"><input type="checkbox" checked={h.nue} onChange={e=>modifier(h.id,{nue:e.target.checked})}/> Part reçue en nue-propriété (usufruit viager)</label>
    {h.nue&&<label className="block">Âge révolu de l’usufruitier au décès<input className={champ} type="number" min="0" max="120" value={h.age} onChange={e=>modifier(h.id,{age:e.target.value})}/></label>}
    {heritiers.length>1&&<button className="text-red-700 underline" onClick={()=>{setHeritiers(x=>x.filter(a=>a.id!==h.id));setResultats(null);}}>Retirer {h.nom}</button>}
    </fieldset>)}
    <div className="flex flex-wrap gap-4"><button className="border rounded-lg p-3" onClick={()=>{setHeritiers(h=>[...h,{...initial,id:Math.max(...h.map(x=>x.id))+1,nom:`Héritier ${h.length+1}`}]);setResultats(null);}}>Ajouter un héritier</button><button className="bg-indigo-700 text-white rounded-lg p-3" onClick={calculer}>Calculer les droits de succession</button></div>
    {erreur&&<p role="alert" className="text-red-700">{erreur}</p>}
    {resultats&&<section aria-live="polite" className="bg-indigo-50 rounded-xl p-5 space-y-4"><h2 className="font-bold text-xl">Droits estimés : {euros(resultats.reduce((s,r)=>s+r.droits,0))}</h2>{resultats.map((r,i)=><div key={heritiers[i].id} className="border-t pt-3"><h3 className="font-semibold">{heritiers[i].nom} : {euros(r.droits)} {r.exonere?'— exonération personnelle':''}</h3><p>Valeur fiscale : {euros(r.valeurFiscale)} ; abattement disponible : {euros(r.abattement)} ; base imposable : {euros(r.base)}.</p></div>)}</section>}
    <p className="text-sm">Barèmes CGI 777, abattements 779 et 788, exonérations 796-0 bis et ter, démembrement 669. <a className="underline" href="https://www.impots.gouv.fr/particulier/questions/comment-dois-je-calculer-les-droits-de-succession">Références DGFiP</a>. Les frais d’actes notariaux ne sont pas inclus dans ces droits.</p>
  </div></MainLayout>;
}
