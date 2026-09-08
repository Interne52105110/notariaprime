"use client";

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { facteurMensuelViager, fractionRenteImposable, scenarioViager } from '@/lib/viager';

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
type Methode = 'lineaire' | 'actualisee' | 'coefficient';

export default function ViagerCalculator() {
  const [valeur, setValeur] = useState('300000');
  const [bouquet, setBouquet] = useState('90000');
  const [occupe, setOccupe] = useState(true);
  const [droit, setDroit] = useState('DUH');
  const [occupation, setOccupation] = useState('100000');
  const [loyer, setLoyer] = useState('1000');
  const [horizon, setHorizon] = useState('15');
  const [taux, setTaux] = useState('3.5');
  const [methode, setMethode] = useState<Methode>('actualisee');
  const [coefficient, setCoefficient] = useState('');
  const [reference, setReference] = useState('');
  const [taxe, setTaxe] = useState('1500');
  const [partTaxe, setPartTaxe] = useState('100');
  const [beneficiaires, setBeneficiaires] = useState([{ id: 1, nom: 'Vendeur 1', age: '76', part: '100' }]);
  const [afficher, setAfficher] = useState(false);
  const [erreur, setErreur] = useState('');
  const numeric = (s: string) => s.trim() === '' ? NaN : Number(s);
  const parametres = { valeur: numeric(valeur), bouquet: numeric(bouquet), occupation: occupe ? numeric(occupation) : 0, horizon: numeric(horizon), taux: numeric(taux), methode, coefficient: numeric(coefficient) };
  let resultat: ReturnType<typeof scenarioViager> | null = null;
  try { resultat = scenarioViager(parametres); } catch { /* Validation visible at submit. */ }
  const calculer = () => {
    try {
      scenarioViager(parametres);
      if (!Number.isFinite(numeric(taxe)) || numeric(taxe) < 0 || !Number.isFinite(numeric(partTaxe)) || numeric(partTaxe) < 0 || numeric(partTaxe) > 100) throw new Error('Vérifiez la taxe foncière et sa répartition.');
      if (beneficiaires.some(b => !Number.isFinite(numeric(b.age)) || numeric(b.age) < 0 || numeric(b.age) > 120 || !Number.isFinite(numeric(b.part)) || numeric(b.part) < 0) || Math.abs(beneficiaires.reduce((s, b) => s + numeric(b.part), 0) - 100) > .000001) throw new Error('Renseignez les âges et répartissez exactement 100 % de la rente.');
      if (methode === 'coefficient' && !reference.trim()) throw new Error('Indiquez la source et les conditions du coefficient actuariel.');
      setErreur(''); setAfficher(true);
    } catch (e) { setErreur(e instanceof Error ? e.message : 'Vérifiez les données.'); setAfficher(false); }
  };
  const input = 'mt-1 w-full rounded-lg border border-slate-300 p-3 text-slate-900';
  const champ = (label: string, v: string, setter: (s: string) => void, suffix = '', min = '0') => <label className="block text-sm font-medium">{label}{suffix && ` (${suffix})`}<input className={input} type="number" min={min} step="any" value={v} onChange={e => setter(e.target.value)} required /></label>;
  return <MainLayout><main className="mx-auto max-w-6xl px-4 py-10 text-slate-800">
    <h1 className="text-3xl font-bold text-blue-950">Simulateur de viager</h1>
    <p className="mt-3 text-lg">Comparez un bouquet et une rente, la valeur d’occupation et la fiscalité des versements.</p>
    <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p>Le montant de la rente est convenu dans l’acte. Les scénarios financiers ci-dessous utilisent une durée que vous choisissez ; cette durée n’est ni une espérance de vie calculée, ni une date de fin du viager. Le paiement continue selon les clauses de l’acte tant que la rente est due.</p>
      <p className="mt-2">Pour une valorisation actuarielle, saisissez le coefficient établi pour votre dossier, avec sa table de mortalité, son taux, sa périodicité et ses clauses de réversion. Aucun barème Daubry ou TGH/TGF n’est intégré à cet outil.</p>
    </div>
    <form onSubmit={e => { e.preventDefault(); calculer(); }} onChange={() => { setAfficher(false); setErreur(''); }} className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Bien et occupation</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {champ('Valeur libre du bien', valeur, setValeur, '€')}
        {champ('Bouquet versé à la signature', bouquet, setBouquet, '€')}
        <label className="block">Type de viager<select className={input} value={occupe ? 'occupe' : 'libre'} onChange={e => setOccupe(e.target.value === 'occupe')}><option value="occupe">Occupé</option><option value="libre">Libre</option></select></label>
        {occupe && <label>Droit réservé<select className={input} value={droit} onChange={e => setDroit(e.target.value)}><option>DUH</option><option>Usufruit</option></select></label>}
        {occupe && champ('Valeur économique du droit réservé', occupation, setOccupation, '€')}
      </div>
      {occupe && <details className="mt-5 rounded-lg bg-slate-50 p-4"><summary className="cursor-pointer font-medium">Repère pour valoriser l’occupation</summary>
        <p className="my-3">La valeur du DUH dépend des droits effectivement réservés et de la négociation. La règle fiscale de 60 % de l’usufruit (CGI 762 bis, mutations gratuites) ne fixe pas sa valeur économique dans une vente en viager.</p>
        {champ('Valeur locative mensuelle', loyer, setLoyer, '€')}
        <p className="mt-3">À titre de scénario, la valeur actuelle de ce loyer sur {horizon || '…'} ans, au taux de {taux || '…'} %, est de {(() => { try { return Number.isFinite(numeric(loyer)) && numeric(loyer) >= 0 ? euros(numeric(loyer) * facteurMensuelViager(numeric(horizon), numeric(taux))) : '—'; } catch { return '—'; } })()}. Ce repère ne s’applique pas automatiquement au droit réservé.</p>
      </details>}
      <h2 className="mb-4 mt-8 text-xl font-semibold">Conversion du capital en rente</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <label>Méthode<select className={input} value={methode} onChange={e => setMethode(e.target.value as Methode)}><option value="actualisee">Scénario financier actualisé</option><option value="lineaire">Scénario linéaire sans intérêts</option><option value="coefficient">Coefficient actuariel fourni par un professionnel</option></select></label>
        {champ('Horizon du scénario', horizon, setHorizon, 'années', '0.01')}
        {methode !== 'lineaire' && champ('Taux annuel effectif du scénario', taux, setTaux, '%')}
        {methode === 'coefficient' && <>{champ('Coefficient de capitalisation d’une rente annuelle de 1 €', coefficient, setCoefficient, '', '0.000001')}<label>Source et conditions du coefficient<input className={input} value={reference} onChange={e => setReference(e.target.value)} placeholder="Table, date, taux, âge(s), réversion, mensualités…" required /></label><p className="md:col-span-2 text-sm">Rente mensuelle = capital / (coefficient × 12). Utilisez un coefficient correspondant à des mensualités à terme échu et à la réversion prévue. Dans ce mode, la durée et le taux du scénario ne recalculent pas le coefficient fourni.</p></>}
      </div>
      <h2 className="mb-4 mt-8 text-xl font-semibold">Bénéficiaires et fiscalité de la rente</h2>
      <p className="mb-4 text-sm">Pour chaque fraction de rente personnelle, indiquez l’âge lors du premier versement. Ces âges déterminent la fraction imposable, jamais le prix de la rente. En cas de rente réversible ou constituée sur plusieurs têtes, les règles fiscales peuvent retenir un autre âge : la ventilation ci-dessous ne liquide pas ces cas particuliers.</p>
      {beneficiaires.map(b => <div key={b.id} className="mb-4 grid items-end gap-3 rounded-xl border p-4 md:grid-cols-4">
        <label>Nom<input className={input} value={b.nom} onChange={e => setBeneficiaires(a => a.map(x => x.id === b.id ? { ...x, nom: e.target.value } : x))} /></label>
        {champ(`Âge au premier versement — ${b.nom}`, b.age, s => setBeneficiaires(a => a.map(x => x.id === b.id ? { ...x, age: s } : x)), 'ans')}
        {champ(`Part de rente — ${b.nom}`, b.part, s => setBeneficiaires(a => a.map(x => x.id === b.id ? { ...x, part: s } : x)), '%')}
        {beneficiaires.length > 1 && <button type="button" className="rounded-lg border p-3 text-red-700" onClick={() => { setBeneficiaires(a => a.filter(x => x.id !== b.id)); setAfficher(false); }}>Retirer {b.nom}</button>}
      </div>)}
      <button type="button" className="rounded-lg border px-4 py-2" onClick={() => { setBeneficiaires(a => [...a, { id: Math.max(...a.map(x => x.id)) + 1, nom: `Vendeur ${a.length + 1}`, age: '', part: '0' }]); setAfficher(false); }}>Ajouter un bénéficiaire</button>
      <h2 className="mb-4 mt-8 text-xl font-semibold">Taxe foncière</h2>
      <div className="grid gap-5 md:grid-cols-2">{champ('Taxe foncière annuelle hors TEOM', taxe, setTaxe, '€')}{champ('Part supportée par l’acheteur selon l’acte', partTaxe, setPartTaxe, '%')}</div>
      <p className="mt-3 text-sm">Le redevable légal est le propriétaire en présence d’un DUH ; en cas d’usufruit, c’est l’usufruitier (CGI 1400). Une répartition économique convenue dans l’acte ne change pas le redevable auprès de l’administration. La TEOM et les travaux ne sont pas compris ici.</p>
      {erreur && <p role="alert" className="mt-5 text-red-700">{erreur}</p>}
      <button className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white" type="submit">Calculer le scénario</button>
    </form>
    {afficher && resultat && <section className="mt-8 space-y-6" aria-label="Résultats du viager">
      <div className="grid gap-4 md:grid-cols-3">{[['Valeur occupée', euros(resultat.valeurOccupee)], ['Capital converti', euros(resultat.capital)], ['Rente mensuelle initiale', euros(resultat.rente)]].map(([label, value]) => <div key={label} className="rounded-xl bg-blue-50 p-6"><h2>{label}</h2><p className="mt-2 text-2xl font-bold text-blue-900">{value}</p></div>)}</div>
      <div className="rounded-xl border p-5"><h2 className="text-xl font-semibold">Part annuelle imposable à l’impôt sur le revenu</h2>{beneficiaires.map(b => { const annuel = resultat!.rente * 12 * numeric(b.part) / 100; const fraction = fractionRenteImposable(numeric(b.age)); return <p key={b.id} className="mt-3">{b.nom} : {euros(annuel)} de rente brute × {fraction * 100} % = <strong>{euros(annuel * fraction)}</strong> de revenu imposable par année complète.</p>; })}<p className="mt-3 text-sm">Il s’agit de l’assiette, pas du montant de l’impôt. Le bouquet n’entre pas dans cette assiette ; une éventuelle plus-value immobilière relève d’un calcul distinct. Les prélèvements sociaux et l’impôt du foyer ne sont pas liquidés ici.</p></div>
      <div className="overflow-x-auto rounded-xl border p-5"><h2 className="mb-4 text-xl font-semibold">Sensibilité à la durée réelle des versements</h2><table className="w-full text-left"><thead><tr><th className="p-2">Durée</th><th className="p-2">Bouquet et rentes</th><th className="p-2">Avec taxe foncière acheteur</th></tr></thead><tbody>{Array.from(new Set([5, 10, numeric(horizon), 20, 25, 30])).sort((a,b) => a-b).map(n => <tr className="border-t" key={n}><td className="p-2">{n} ans</td><td className="p-2">{euros(numeric(bouquet) + resultat!.rente * 12 * n)}</td><td className="p-2">{euros(numeric(bouquet) + resultat!.rente * 12 * n + numeric(taxe) * numeric(partTaxe) / 100 * n)}</td></tr>)}</tbody></table><p className="mt-3 text-sm">Montants nominaux, rente et taxe constantes. Indexation contractuelle, frais d’acte, travaux, fiscalité et changement d’occupation exclus. Ces durées ne prédisent pas la longévité.</p></div>
      <div className="overflow-x-auto rounded-xl border p-5"><h2 className="mb-4 text-xl font-semibold">Comparer les bouquets à hypothèses identiques</h2><table className="w-full text-left"><thead><tr><th className="p-2">Bouquet</th><th className="p-2">Rente mensuelle</th></tr></thead><tbody>{Array.from(new Set([0, numeric(bouquet), resultat.valeurOccupee / 3])).map(b => <tr key={b} className="border-t"><td className="p-2">{euros(b)}</td><td className="p-2">{euros(scenarioViager({...parametres, bouquet:b}).rente)}</td></tr>)}</tbody></table></div>
      <button onClick={() => window.print()} className="rounded-xl border px-5 py-3 print:hidden">Imprimer / enregistrer en PDF</button>
    </section>}
    <section className="mt-10 space-y-3 rounded-xl bg-slate-50 p-6"><h2 className="text-xl font-semibold">Méthode et références</h2>
      <p>Le scénario actualisé divise le capital par la somme des facteurs d’actualisation des mensualités à terme échu sur l’horizon choisi ; à taux nul, il rejoint la division linéaire. Une tarification viagère actuarielle pondère chaque paiement par une probabilité de survie et tient compte de la réversion : elle requiert un coefficient spécifique.</p>
      <p>Les fractions imposables sont de 70 % avant 50 ans, 50 % de 50 à 59 ans, 40 % de 60 à 69 ans, et 30 % à partir de 70 ans, selon l’âge fiscalement retenu au premier versement (CGI 158, 6).</p>
      <p>Le viager est un contrat aléatoire. L’article 1975 du Code civil vise le décès dans les vingt jours dû à une maladie dont la personne était atteinte lors du contrat ; tout décès dans ce délai n’annule pas automatiquement la vente.</p>
      <p><a className="text-blue-700 underline" href="https://www.service-public.gouv.fr/particuliers/vosdroits/F2762" target="_blank" rel="noreferrer">Service Public — vente en viager</a> · <a className="text-blue-700 underline" href="https://www.service-public.gouv.fr/particuliers/vosdroits/F3173" target="_blank" rel="noreferrer">Service Public — imposition des rentes</a> · <a className="text-blue-700 underline" href="/plusvalue">Calcul de plus-value immobilière</a></p>
    </section>
  </main></MainLayout>;
}
