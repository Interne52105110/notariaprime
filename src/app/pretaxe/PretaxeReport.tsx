import type { LignePretaxe } from './pretaxeLines';
export { totalPretaxe } from './pretaxeLines';

export interface EmolumentRapport { libelle:string; base:number; ht:number; }
export interface RapportPretaxe {
  acte:string; departement:string; emoluments:EmolumentRapport[]; lignes:LignePretaxe[];
  emolumentsHT:number; formalitesHT:number; documentsHT:number; debours:number; taxes:number;
  ecretementHT:number; tauxTVA:number; tva:number; total:number; notes:string[];
}
const euro=(v:number)=>v.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
export default function PretaxeReport({rapport}:{rapport:RapportPretaxe}){
  const recap:[string,number][]=[['Émoluments d’acte HT',rapport.emolumentsHT],['Formalités HT',rapport.formalitesHT],['Copies et archivage HT',rapport.documentsHT],['Écrêtement HT (A444-175)',-rapport.ecretementHT],[`TVA ${rapport.tauxTVA} % sur les émoluments nets`,rapport.tva],['Trésor public, dont CSI',rapport.taxes],['Débours justifiés',rapport.debours]];
  return <section className="mt-6 rounded-2xl border bg-white p-5 md:p-8">
    <h2 className="text-xl font-bold">Détail de la prétaxe estimative</h2>
    <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-gray-600"><th className="p-3">Prestation / référence</th><th className="p-3 text-right">Assiette / quantité</th><th className="p-3 text-right">Prix unitaire HT</th><th className="p-3 text-right">Montant HT ou hors TVA</th></tr></thead><tbody>
      {rapport.emoluments.map((e,i)=><tr className="border-b" key={`emol-${i}`}><td className="p-3">{e.libelle}</td><td className="p-3 text-right whitespace-nowrap">{euro(e.base)} €</td><td className="p-3 text-right">Barème</td><td className="p-3 text-right whitespace-nowrap">{euro(e.ht)} €</td></tr>)}
      {rapport.lignes.map((l,i)=><tr key={`${l.id}-${i}`} className="border-b"><td className="p-3">{l.libelle}<span className="block text-xs text-gray-600">{l.reference|| (l.nature==='taxes'?'Trésor public':'Débours renseigné')}</span></td><td className="p-3 text-right">{l.quantite}</td><td className="p-3 text-right whitespace-nowrap">{l.prixUnitaire.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:5})} €</td><td className="p-3 text-right whitespace-nowrap">{euro(l.ht)} €</td></tr>)}
    </tbody></table></div>
    <dl className="ml-auto mt-6 max-w-xl space-y-3">{recap.filter(([label,v])=>v!==0||!label.startsWith('Écrêtement')).map(([label,value])=><div key={label} className="flex justify-between gap-4"><dt className="text-sm text-gray-700">{label}</dt><dd className="whitespace-nowrap font-medium">{euro(value)} €</dd></div>)}<div className="flex justify-between gap-4 border-t-2 pt-4 text-xl font-bold"><dt>Total estimé des postes renseignés</dt><dd className="whitespace-nowrap text-indigo-700">{euro(rapport.total)} €</dd></div></dl>
    <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{rapport.notes.map((note,i)=><p className={i?'mt-2':''} key={i}>{note}</p>)}</div>
  </section>;
}
