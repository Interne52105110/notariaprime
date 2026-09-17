'use client';
import type { DonateurPretaxe, TransmissionDonation } from './pretaxeAuditRules';
import { basesDonation, nouveauDonateur } from './pretaxeAuditRules';

interface Props { donateurs: DonateurPretaxe[]; onChange: (value: DonateurPretaxe[]) => void; publication: string; onPublicationChange: (value:string)=>void; mobiliere: boolean; }
const input = 'mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm';
export default function DonationPretaxeForm({donateurs,onChange,publication,onPublicationChange,mobiliere}:Props) {
  const bases = basesDonation(donateurs);
  const update = (id:string, changes:Partial<DonateurPretaxe>) => onChange(donateurs.map(d=>d.id===id?{...d,...changes}:d));
  const transmission = (donateur:DonateurPretaxe,id:string,changes:Partial<TransmissionDonation>) => update(donateur.id,{transmissions:donateur.transmissions.map(t=>t.id===id?{...t,...changes}:t)});
  return <section className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-5 space-y-5">
    <h3 className="text-lg font-semibold text-purple-900">Qui donne quoi ?</h3>
    <p className="text-sm text-gray-700">Ajoutez uniquement les personnes qui donnent. Pour chaque bien, saisissez la valeur en pleine propriété de la fraction donnée par ce donateur. Les apports peuvent être différents ; aucune répartition à 50/50 n’est supposée.</p>
    {donateurs.map((d,i)=><fieldset key={d.id} className="rounded-xl border bg-white p-4 space-y-4">
      <legend className="px-2 font-semibold">Donateur {i+1}</legend>
      <div className="flex items-end gap-3"><label className="flex-1 text-sm">Nom ou repère du donateur<input aria-label={`Nom du donateur ${i+1}`} className={input} value={d.nom} onChange={e=>update(d.id,{nom:e.target.value})} placeholder={`Donateur ${i+1}`}/></label>{donateurs.length>1&&<button type="button" className="p-3 text-sm text-red-700" onClick={()=>onChange(donateurs.filter(x=>x.id!==d.id))}>Retirer ce donateur</button>}</div>
      {d.transmissions.map((t,j)=><div key={t.id} className="grid gap-3 rounded-lg bg-gray-50 p-3 md:grid-cols-2">
        <label className="text-sm">Bien ou apport {j+1}<input aria-label={`Bien ${j+1} du donateur ${i+1}`} className={input} value={t.bien} onChange={e=>transmission(d,t.id,{bien:e.target.value})} placeholder="Maison, parts, somme d’argent…"/></label>
        <label className="text-sm">Bénéficiaires et attribution (description)<input className={input} value={t.beneficiaires} onChange={e=>transmission(d,t.id,{beneficiaires:e.target.value})} placeholder="Enfant A : ¾ ; enfant B : ¼…"/></label>
        <label className="text-sm font-medium">Valeur en pleine propriété de la fraction donnée (€)<input aria-label={`Assiette donateur ${i+1} apport ${j+1}`} inputMode="decimal" className={input} value={t.pleinePropriete} onChange={e=>transmission(d,t.id,{pleinePropriete:e.target.value})} placeholder="150 000"/></label>
        <label className="text-sm">Droits transmis<select className={input} value={t.droit} onChange={e=>transmission(d,t.id,{droit:e.target.value as TransmissionDonation['droit']})}><option value="pleine_propriete">Pleine propriété</option><option value="nue_propriete_reserve">Nue-propriété avec réserve d’usufruit</option><option value="autre">Usufruit seul ou autre démembrement à qualifier</option></select></label>
        {t.droit==='nue_propriete_reserve'&&<p className="text-sm text-purple-900 md:col-span-2">L’émolument conserve la base en pleine propriété (A444-67 / A444-68). La valorisation fiscale de la nue-propriété, les âges et les abattements se traitent séparément dans le calcul des droits de donation.</p>}
        {t.droit==='autre'&&<p role="status" className="text-sm text-amber-800 md:col-span-2">Ce démembrement nécessite une qualification spécifique. Le total est suspendu pour éviter d’appliquer une base non confirmée.</p>}
        {d.transmissions.length>1&&<button type="button" className="text-left text-sm text-red-700" onClick={()=>update(d.id,{transmissions:d.transmissions.filter(x=>x.id!==t.id)})}>Retirer cet apport</button>}
      </div>)}
      <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" className="rounded-lg border border-purple-300 px-3 py-2 text-sm text-purple-800" onClick={()=>update(d.id,{transmissions:[...d.transmissions,{id:crypto.randomUUID(),bien:'',beneficiaires:'',pleinePropriete:'',droit:'pleine_propriete'}]})}>Ajouter un bien ou un apport</button><span className="text-sm font-semibold">Assiette de ce donateur : {bases[i].valide?bases[i].base.toLocaleString('fr-FR')+' €':'à compléter'}</span></div>
    </fieldset>)}
    <button type="button" className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white" onClick={()=>onChange([...donateurs,nouveauDonateur(crypto.randomUUID())])}>Ajouter un donateur</button>
    <p className="text-sm">Les émoluments sont calculés séparément pour chaque donateur, puis additionnés. Les attributions aux enfants décrivent le dossier ; elles ne déclenchent pas un nouvel émolument par enfant. Pour une donation-partage, inclure dans l’assiette les rapports prévus par A444-68.</p>
    {!mobiliere&&<label className="block text-sm font-medium">Assiette immobilière publiée pour la CSI (€), si connue<input aria-label="Donation : assiette de publication CSI" className={input} inputMode="decimal" value={publication} onChange={e=>onPublicationChange(e.target.value)} placeholder="À compléter selon les droits publiés"/><span className="mt-2 block font-normal">Une valeur vide ne produit aucune CSI automatique. Ne recopiez pas systématiquement l’assiette des émoluments.</span></label>}
    <p className="text-sm text-amber-900">Le total des frais reste partiel : droits de donation et taxes de publication à compléter selon le dossier. <a className="underline" href="/donation">Calculer séparément les droits de donation</a>.</p>
  </section>;
}
