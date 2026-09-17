'use client';
import type {Dispatch,SetStateAction} from 'react';
import type {Documents} from './PretaxeTypes';
import {quantite} from '@/lib/montants';
interface Props {documents:Documents;setDocuments:Dispatch<SetStateAction<Documents>>;totalDocumentsTTC:number;tauxTVA:number;majoration:number;forfait:boolean;}
export default function DocumentsTab({documents,setDocuments,totalDocumentsTTC,tauxTVA,majoration,forfait}:Props){
  return <div className="space-y-5"><p className="rounded-lg bg-blue-50 p-4 text-sm">Les copies authentiques, exécutoires et hypothécaires sont tarifées à 1,13 € HT par page délivrée ; les copies sur libre à 0,38 € HT ; l’archivage à 0,19 € HT par page (A444-173).{majoration?` Majoration territoriale : +${majoration} %.`:''} Aucun frais de rôle supplémentaire n’est ajouté.</p>
    {forfait&&<p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Forfait n°194 sélectionné : ajoutez seulement les copies supplémentaires qui ne sont pas déjà comprises dans ce forfait.</p>}
    <div className="grid gap-4 md:grid-cols-2">{([['pagesActe','Nombre de pages de l’acte'],['copiesExecutoires','Nombre de copies exécutoires'],['copiesAuthentiques','Nombre de copies authentiques'],['copiesHypothecaires','Nombre de copies hypothécaires'],['copiesLibres','Nombre de copies sur libre']] as const).map(([key,label])=><label className="text-sm" key={key}>{label}<input aria-label={label} className="mt-2 w-full rounded border p-3" type="number" min="0" step="1" value={documents[key]??0} onChange={e=>setDocuments(p=>({...p,[key]:quantite(Number(e.target.value))}))}/></label>)}</div>
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={documents.archivageNumerise??false} onChange={e=>setDocuments(p=>({...p,archivageNumerise:e.target.checked}))}/>Archivage numérisé de l’acte — n°214</label>
    <p className="border-t pt-4 text-right font-semibold">Total TTC (TVA {tauxTVA} %) : {totalDocumentsTTC.toFixed(2)} €</p></div>;
}
