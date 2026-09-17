"use client";
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {toolResources} from '@/content/tool-resources';
import {toolHelp} from '@/content/tool-help';

export function ToolHelpNav() {
  const path = usePathname();
  if (!toolHelp[path]) return null;
  return <nav aria-label="Aide au calcul" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3 text-sm text-indigo-800 print:hidden">
    <Link href="/features" className="inline-flex min-h-11 items-center underline underline-offset-4">Tous les simulateurs</Link>
    <a href="#outil-methode" className="inline-flex min-h-11 items-center underline underline-offset-4">Comment remplir les champs</a>
    <a href="#outil-exemples" className="inline-flex min-h-11 items-center underline underline-offset-4">Exemples</a>
    <a href="#outil-faq" className="inline-flex min-h-11 items-center underline underline-offset-4">Questions fréquentes</a>
  </nav>;
}

export default function ToolResources() {
  const path = usePathname();
  const r = toolResources[path];
  const help = toolHelp[path];
  if (!r || !help) return null;
  return <article aria-label="Guide d’utilisation du simulateur" className="mx-auto mb-12 max-w-6xl px-5 text-slate-800">
    <section id="outil-methode" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Comprendre votre simulation</p>
      <h2 className="mt-2 text-2xl font-bold md:text-3xl">{help.title}</h2>
      <p className="mt-4 max-w-4xl leading-relaxed">{help.intro}</p>
      <ol className="mt-6 grid gap-5 md:grid-cols-3">{help.steps.map(([title, body], index) => <li key={title} className="rounded-xl border border-slate-200 bg-white p-5">
        <span aria-hidden="true" className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-800">{index + 1}</span>
        <h3 className="font-semibold text-slate-900">{title}</h3><p className="mt-2 leading-relaxed text-slate-700">{body}</p>
      </li>)}</ol>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div><h3 className="font-semibold">Les informations à réunir</h3><p className="mt-2 leading-relaxed">{r.pieces}</p></div>
        <div><h3 className="font-semibold">Le périmètre du résultat</h3><p className="mt-2 leading-relaxed">{r.limite}</p></div>
      </div>
    </section>
    <section id="outil-exemples" className="scroll-mt-28 pt-9">
      <h2 className="text-2xl font-bold">Exemples commentés</h2>
      <p className="mt-2 text-slate-600">Ces cas illustrent la méthode avec des hypothèses fixes. Ils ne reprennent pas les chiffres de votre formulaire.</p>
      <div className="mt-5 space-y-5">{help.examples.map(example => <section key={example.title} className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 md:p-7">
        <h3 className="text-xl font-semibold">{example.title}</h3><p className="mt-3 leading-relaxed">{example.context}</p>
        <table className="mt-5 w-full table-fixed text-left text-sm sm:text-base">
          <caption className="sr-only">Détail du calcul : {example.title}</caption>
          <thead><tr className="border-b border-indigo-200"><th scope="col" className="w-3/5 py-3 pr-3">Étape</th><th scope="col" className="py-3">Montant ou résultat</th></tr></thead>
          <tbody>{example.rows.map(([label, value]) => <tr key={label} className="border-b border-indigo-100 last:border-0"><th scope="row" className="break-words py-3 pr-3 font-normal">{label}</th><td className="break-words py-3 font-semibold">{value}</td></tr>)}</tbody>
        </table>
        <p className="mt-4 leading-relaxed"><strong>À retenir. </strong>{example.conclusion}</p>
      </section>)}</div>
    </section>
    <section id="outil-faq" className="scroll-mt-28 pt-9">
      <h2 className="text-2xl font-bold">Questions fréquentes sur ce calculateur</h2>
      <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 md:px-7">{help.faq.map(([question, answer]) => <details key={question} className="group py-1">
        <summary className="cursor-pointer rounded py-4 pr-2 font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{question}</summary>
        <p className="pb-5 leading-relaxed text-slate-700">{answer}</p>
      </details>)}</div>
    </section>
    <section id="outil-sources" className="mt-9 rounded-2xl bg-slate-50 p-5 md:p-7">
      <h2 className="text-xl font-bold">Sources et ressources pour votre dossier</h2>
      <ul className="mt-4 space-y-3">{help.sources.map(([url, label]) => <li key={url}><a href={url} className="break-words text-indigo-800 underline underline-offset-4">{label}</a></li>)}</ul>
      <div className="mt-6 flex flex-wrap gap-3">
        {r.guides.map(([slug, title]) => <Link key={slug} href={'/guides/' + slug} className="rounded-lg border border-indigo-200 bg-white px-4 py-3 font-medium text-indigo-800 underline">{title}</Link>)}
        {help.related.map(([url, title]) => <Link key={url} href={url} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 underline">{title}</Link>)}
      </div>
      <p className="mt-6 text-sm leading-relaxed">Aide révisée le <time dateTime="2026-09-17">17 septembre 2026</time> · Édition NotariaPrime · <Link href="/methodologie-fiscale" className="underline">Méthodes et étendue des contrôles</Link> · <Link href="/contact" className="underline">Signaler un écart</Link></p>
      <div className="mt-5 flex flex-wrap gap-4 print:hidden"><button onClick={() => window.print()} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm">Imprimer la simulation et ses hypothèses</button><a href="#outil-calculateur" className="inline-flex items-center py-3 text-sm text-indigo-800 underline">Revenir au calculateur</a></div>
    </section>
  </article>;
}
