import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { ArrowRight, CheckCircle, History } from 'lucide-react';
import { releases } from '@/data/releases';

export default function Roadmap() {
  return <MainLayout>
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <header className="mb-12 max-w-3xl">
        <p className="mb-4 text-sm font-semibold text-indigo-600">Mis à jour le {releases[0].dateLabel}</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">Évolutions et historique</h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-600">Retrouvez les améliorations livrées sur NotariaPrime, leurs limites et les pistes pour la suite.</p>
        <a href="#historique" className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:underline">Voir les dernières mises à jour <ArrowRight className="h-4 w-4"/></a>
      </header>

      <section aria-labelledby="disponible" className="mb-12 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 md:p-8">
        <h2 id="disponible" className="flex items-center gap-3 text-xl font-bold text-gray-900"><CheckCircle className="h-6 w-6 shrink-0 text-indigo-600"/>Disponible aujourd’hui</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div><h3 className="font-semibold text-gray-900">Simulateurs et guides</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">Fiscalité, immobilier, financement et retraite, avec les hypothèses et références propres à chaque outil.</p><Link href="/features" className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:underline">Parcourir les outils</Link></div>
          <div><h3 className="font-semibold text-gray-900">Prétaxe manuelle et analyse de documents</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">Saisie détaillée, import PDF ou image, texte à analyser et export PDF. Les informations extraites sont proposées pour vérification.</p><Link href="/pretaxe" className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:underline">Utiliser la prétaxe</Link></div>
        </div>
        <p className="mt-6 border-t border-indigo-100 pt-5 text-sm leading-relaxed text-gray-600">L’accès hors connexion dépend des pages et ressources déjà chargées. Une connexion peut être nécessaire pour charger les modules d’analyse et obtenir les dernières mises à jour.</p>
      </section>

      <section id="historique" aria-labelledby="historique-titre" className="scroll-mt-28">
        <h2 id="historique-titre" className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900"><History className="h-6 w-6 text-indigo-600"/>Historique des améliorations</h2>
        <div className="space-y-6">
          {releases.map(release=><article id={release.id} key={release.id} className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3"><time dateTime={release.date} className="text-sm font-semibold text-gray-500">{release.dateLabel}</time><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">En ligne</span></div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">{release.title}</h3>
            <p className="mt-3 leading-relaxed text-gray-600">{release.summary}</p>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-gray-700">{release.changes.map(change=><li key={change}>{change}</li>)}</ul>
            <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">{release.limit}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">{release.links.map(link=><Link key={link.href} href={link.href} className="text-sm font-semibold text-indigo-700 hover:underline">{link.label}</Link>)}<a href={release.source} className="text-sm text-gray-500 underline">Détail des modifications</a></div>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="suite" className="mt-12 rounded-2xl bg-gray-50 p-6 md:p-8">
        <h2 id="suite" className="text-2xl font-bold text-gray-900">Pistes pour la suite</h2>
        <p className="mt-3 leading-relaxed text-gray-600">Les retours et les cas documentés guideront les prochaines évolutions. Ces pistes n’ont pas de date de livraison annoncée.</p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-gray-700"><li>Étendre les cas de prétaxe contrôlés et préciser les prestations selon la situation.</li><li>Améliorer l’identification des personnes, biens et droits transmis dans les documents analysés, avec une validation explicite des données.</li><li>Enrichir les exemples et les explications à partir des écarts reproductibles signalés.</li></ul>
        <div className="mt-6 flex flex-wrap gap-5"><Link href="/contact" className="font-semibold text-indigo-700 hover:underline">Signaler un besoin ou un écart</Link><Link href="/methodologie-fiscale" className="text-gray-600 underline">Méthodes et références</Link></div>
      </section>
    </div>
  </MainLayout>;
}
