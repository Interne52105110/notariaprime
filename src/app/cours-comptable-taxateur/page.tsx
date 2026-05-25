"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import {
  GraduationCap, Receipt, Wallet, Newspaper, MonitorSmartphone,
  AlertTriangle, ListChecks, BookOpen, Info, CheckCircle, ChevronRight,
} from 'lucide-react';

const sections = [
  { id: 'metier', title: 'Le métier', icon: GraduationCap },
  { id: 'taxe', title: 'A. La taxe', icon: Receipt },
  { id: 'compta', title: 'B. Comptabilité notariale', icon: Wallet },
  { id: 'actus', title: 'C. Actualités 2025/2026', icon: Newspaper },
  { id: 'genapi', title: 'D. Genapi / iNot compta', icon: MonitorSmartphone },
  { id: 'pieges', title: 'E. Points d’attention', icon: AlertTriangle },
  { id: 'cas', title: 'F. Cas pratiques', icon: ListChecks },
  { id: 'sources', title: 'Sources', icon: BookOpen },
];

const emolumentsTranches = [
  { tranche: '0 → 6 500 €', taux: '3,870 %' },
  { tranche: '6 500 → 17 000 €', taux: '1,596 %' },
  { tranche: '17 000 → 60 000 €', taux: '1,064 %' },
  { tranche: 'au-delà de 60 000 €', taux: '0,799 %' },
];

const actesTable = [
  { acte: 'Vente ancien', emol: 'proportionnels (barème)', droits: 'DMTO (~5,8–6,3 %) + CSI 0,10 %' },
  { acte: 'Vente neuf / VEFA', emol: 'proportionnels', droits: 'TVA (dans le prix) + TPF 0,715 % + CSI' },
  { acte: 'Donation', emol: 'proportionnels sur valeur', droits: 'DMTG après abattements (barème progressif)' },
  { acte: 'Succession', emol: 'proportionnels (déclaration)', droits: 'DMTG ; émoluments notoriété/attestation' },
  { acte: 'Prêt / hypothèque', emol: 'proportionnels sur capital', droits: 'TPF + CSI + contribution additionnelle' },
  { acte: 'Partage', emol: 'proportionnels', droits: 'droit de partage 2,50 % (ou 1,80 %)' },
];

const sources = [
  { label: 'Lexbase — La réforme du tarif des notaires (arrêté 25/02/2026)', url: 'https://www.lexbase.fr/revues-juridiques/30605861-texteslareformedutarifdesnotaires' },
  { label: 'Notaires de France — Augmentation des DMTO (LF 2025)', url: 'https://www.notaires.fr/fr/actualites/vente-immobiliere-et-augmentation-des-droits-de-mutation-titre-onereux' },
  { label: 'Service-Public — Hausse des droits de mutation', url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18183' },
  { label: 'Laroche & Associés — DMTO et primo-accédants (LF 2025)', url: 'https://www.laroche.notaires.fr/blog/dmto-et-primo-accedants-ce-que-prevoit-vraiment-la-loi-de-finances-2025' },
  { label: 'not-compta.fr — Réglementation comptable notariale', url: 'https://not-compta.fr/prestations/comptable-taxateur/reglementation-comptable-notariale/' },
  { label: 'OINF — Traitement des sommes maniées et des intérêts (2025)', url: 'https://oinf.fr/2025/04/08/le-traitement-des-sommes-maniees-par-les-notaires-et-des-interets-produits/' },
];

function CoursContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState('metier');

  useEffect(() => {
    const updateDeviceType = () => setIsDesktop(window.innerWidth > 1024);
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Cours — Comptable-taxateur notarial</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl">
            Support de révision complet et à jour 2025/2026 : taxation des actes, comptabilité
            notariale, derniers textes (arrêté tarifaire, loi de finances 2025) et logiciel.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className={`grid gap-12 ${isDesktop ? 'grid-cols-[260px_1fr]' : 'grid-cols-1'}`}>
          {/* Sidebar */}
          {isDesktop && (
            <aside className="sticky top-24 self-start">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm transition-all ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Montants et taux donnés à titre indicatif. À recouper avec l&apos;arrêté tarifaire
                    en vigueur et les délibérations de votre département.
                  </p>
                </div>
              </div>
            </aside>
          )}

          {/* Content */}
          <main className="max-w-none">

            {/* Le métier */}
            <section id="metier" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
                Le métier en une phrase
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le <strong>comptable-taxateur</strong> d&apos;un office notarial exerce deux métiers liés :
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <Receipt className="w-8 h-8 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Taxateur</h3>
                  <p className="text-sm text-gray-600">
                    Il <em>taxe</em> les actes : calcul des émoluments du notaire + droits et taxes
                    + débours, établissement de la demande de provision puis du décompte définitif.
                  </p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <Wallet className="w-8 h-8 text-emerald-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Comptable</h3>
                  <p className="text-sm text-gray-600">
                    Il tient la comptabilité notariale réglementée : comptes clients individualisés,
                    maniement des fonds via la Caisse des Dépôts, rapprochements, inspections.
                  </p>
                </div>
              </div>
            </section>

            {/* A. La taxe */}
            <section id="taxe" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Receipt className="w-8 h-8 text-indigo-600" />
                A. La taxe (taxation des actes)
              </h2>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Les 3 composantes des « frais de notaire »</h3>
              <p className="text-gray-700 mb-4">
                Le notaire ne conserve que le premier bloc et reverse le reste :
              </p>
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Bloc</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Pour qui</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Part (vente ancien)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="px-6 py-3 text-gray-700">Émoluments (+ TVA 20 %)</td><td className="px-6 py-3 text-gray-700">le notaire</td><td className="px-6 py-3 text-gray-700">~10–15 %</td></tr>
                    <tr><td className="px-6 py-3 text-gray-700">Droits et taxes (DMTO, TVA, CSI…)</td><td className="px-6 py-3 text-gray-700">État / département / commune</td><td className="px-6 py-3 text-gray-700">~80 %</td></tr>
                    <tr><td className="px-6 py-3 text-gray-700">Débours / frais</td><td className="px-6 py-3 text-gray-700">tiers (cadastre, géomètre, syndic…)</td><td className="px-6 py-3 text-gray-700">~5–10 %</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Émoluments proportionnels</h3>
              <p className="text-gray-700 mb-4">
                Barème national dégressif par tranches (art. A444-x C. com.), fixé par
                <strong> arrêté du 25 février 2026, applicable jusqu&apos;au 29 février 2028</strong>.
              </p>
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Tranche d&apos;assiette</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Taux (HT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {emolumentsTranches.map((t) => (
                      <tr key={t.tranche}>
                        <td className="px-6 py-3 text-gray-700">{t.tranche}</td>
                        <td className="px-6 py-3 font-semibold text-gray-900">{t.taux}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    On applique le taux <strong>dans chaque tranche</strong> puis on additionne — jamais
                    le taux du haut sur la totalité. Puis on ajoute la <strong>TVA 20 %</strong>.
                    <br />Exemple (assiette 200 000 €) : 251,55 + 167,58 + 457,52 + 1 118,60 =
                    <strong> 1 995,25 € HT</strong> → <strong>2 394,30 € TTC</strong>.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Émoluments de formalité, remise, honoraires</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span><strong>Formalité (fixes)</strong> : montants fixes pour les formalités annexes (copies, états hypothécaires, publication…).</span></li>
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span><strong>Remise (nouveauté 2026)</strong> : plafond porté de 10 % à <strong>20 %</strong>, applicable dès <strong>100 000 €</strong> d&apos;assiette (avant 150 000 €). Doit être uniforme pour tous les clients.</span></li>
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span><strong>Honoraires libres</strong> : prestations hors tarif réglementé (conseil, négociation), fixés librement par convention écrite — à distinguer des émoluments.</span></li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Droits et taxes</h3>
              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">DMTO — vente d&apos;ancien</h4>
                  <p className="text-sm text-gray-700">Droit départemental <strong>4,50 % → jusqu&apos;à 5,00 %</strong> + taxe communale <strong>1,20 %</strong> + frais d&apos;assiette <strong>2,37 % du droit départemental</strong>. Total ~5,80 % → jusqu&apos;à ~6,31 %.</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Neuf / VEFA</h4>
                  <p className="text-sm text-gray-700">Pas de DMTO : TVA 20 % (incluse dans le prix) + taxe de publicité foncière réduite ~<strong>0,715 %</strong>. Frais réduits (2–3 %).</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">CSI — Contribution de Sécurité Immobilière</h4>
                  <p className="text-sm text-gray-700"><strong>0,10 %</strong> du prix, versée à l&apos;État pour la publicité foncière. Remplace l&apos;ancien « salaire du conservateur ».</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Droit de partage</h4>
                  <p className="text-sm text-gray-700"><strong>2,50 %</strong> de l&apos;actif net ; réduit à <strong>1,80 %</strong> pour les partages liés à divorce/séparation/succession.</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Mutation à titre gratuit (donation / succession)</h4>
                  <p className="text-sm text-gray-700">Calcul après <strong>abattements</strong> (ex. 100 000 € parent-enfant) puis <strong>barème progressif</strong> par tranches.</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Logique de taxation par type d&apos;acte</h3>
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-4 overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Acte</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Émoluments</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Droits / taxes principaux</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {actesTable.map((r) => (
                      <tr key={r.acte}>
                        <td className="px-6 py-3 font-medium text-gray-900">{r.acte}</td>
                        <td className="px-6 py-3 text-gray-700">{r.emol}</td>
                        <td className="px-6 py-3 text-gray-700">{r.droits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* B. Comptabilité notariale */}
            <section id="compta" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-emerald-600" />
                B. La comptabilité notariale
              </h2>

              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Une comptabilité « spéciale »</h3>
                <p className="text-gray-700">
                  Le notaire manie en permanence l&apos;argent des clients (prix de vente, fonds de prêt,
                  droits à reverser). La comptabilité notariale est donc <strong>réglementée et contrôlée</strong>,
                  pour garantir que <strong>chaque euro client est représenté</strong> à tout instant.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Comptes clients &amp; plan comptable</h4>
                  <p className="text-sm text-gray-700">Chaque dossier a un compte client individualisé. Fonds de tiers enregistrés dans les subdivisions du compte <strong>« 542 100 — comptes de dépôts clients »</strong>. Règle d&apos;or : <strong>aucun compte client ne doit être débiteur</strong> (premier point regardé en inspection).</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Maniement des fonds — Caisse des Dépôts (CDC)</h4>
                  <p className="text-sm text-gray-700">Les fonds détenus sont déposés à la CDC sur des comptes de disponibilités courantes ; seuls les fonds de tiers y figurent. Mouvements débit possibles uniquement pour régler l&apos;affaire à l&apos;origine du dépôt.</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Règle des espèces</h4>
                  <p className="text-sm text-gray-700">Pas plus de <strong>3 000 €</strong> en espèces plus de <strong>2 jours ouvrables</strong>, et <strong>≤ 5 %</strong> du total des fonds détenus.</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Consignation après 3 mois</h4>
                  <p className="text-sm text-gray-700">Les sommes restées au-delà de <strong>3 mois</strong> sur les comptes de disponibilités courantes sont transférées sur des <strong>comptes de dépôts obligatoires</strong> à la CDC. À surveiller : les dossiers « dormants ».</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">La provision préalable (lien taxe ↔ compta)</h4>
                  <p className="text-sm text-gray-700">Avant de signer, le notaire exige la consignation d&apos;une somme suffisante (émoluments, droits, débours, taxes). C&apos;est le taxateur qui chiffre cette demande de provision. Sous-provisionner → risque de solde débiteur.</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Contrôle &amp; inspection</p>
                    <p className="text-sm text-blue-800">Inspection de comptabilité <strong>annuelle</strong>, en principe <strong>inopinée</strong>, de chaque office. La trésorerie et la représentation des fonds clients sont au cœur du contrôle. Filet de sécurité de la profession : la <strong>garantie collective</strong> qui garantit les fonds clients.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* C. Actualités */}
            <section id="actus" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Newspaper className="w-8 h-8 text-indigo-600" />
                C. Actualités &amp; textes récents (2025/2026)
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-xl border-2 border-indigo-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Réforme du tarif — arrêté du 25 février 2026</h4>
                  <p className="text-sm text-gray-700">Nouveau tarif fixé jusqu&apos;au <strong>29 février 2028</strong>. Remise portée de <strong>10 % à 20 %</strong>, seuil abaissé de <strong>150 000 € à 100 000 €</strong>. Barème proportionnel à 4 tranches inchangé dans sa structure.</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-indigo-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Loi de finances 2025 — DMTO (art. 116)</h4>
                  <p className="text-sm text-gray-700">Les départements peuvent relever leur droit de <strong>+0,5 point (jusqu&apos;à 5,00 %)</strong>, du <strong>1ᵉʳ avril 2025 au 30 avril 2028</strong> (mesure temporaire). Frais d&apos;achat ancien vers ~6,3 %.</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-emerald-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Exonération primo-accédants</h4>
                  <p className="text-sm text-gray-700">L&apos;acquéreur non propriétaire de sa résidence principale dans les <strong>2 ans</strong> précédents, achetant sa RP, <strong>échappe à la hausse</strong>. Les départements peuvent en plus réduire/exonérer les DMTO, sous engagement d&apos;occupation <strong>≥ 5 ans</strong>. Le statut reste flou (achat conjoint avec un seul primo) → vigilance du taxateur.</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Maniement des fonds &amp; intérêts (2025)</h4>
                  <p className="text-sm text-gray-700">Rappel renforcé sur le traitement des sommes maniées et des intérêts produits par les fonds clients (régime spécifique, pas l&apos;office). Sujet sensible en inspection.</p>
                </div>
              </div>
            </section>

            {/* D. Genapi */}
            <section id="genapi" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MonitorSmartphone className="w-8 h-8 text-indigo-600" />
                D. Genapi / iNot compta (l&apos;outil)
              </h2>
              <p className="text-gray-700 mb-4">
                Connaître Genapi côté rédaction (iNot Actes) ne suffit pas : le <strong>module compta</strong>
                a une logique distincte — c&apos;est le principal point à monter en compétence.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span>Suite <strong>iNot (Genapi / groupe Septeo)</strong> : rédaction et compta partagent le dossier, mais le module compta a ses écrans propres.</span></li>
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span>Fonctions clés : saisie comptable par dossier, demandes de provision et décomptes, rapprochements, lettrage, états (trésorerie, comptes clients débiteurs), interface CDC et virements, édition des relevés/décomptes client.</span></li>
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span>Ce qui change vs côté clerc : on ne rédige plus l&apos;acte, on rattache les flux financiers au dossier et on contrôle que tout est représenté.</span></li>
              </ul>
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    <strong>Conseil :</strong> à l&apos;embauche, négocier une <strong>formation Genapi/Septeo
                    au module compta</strong> + quelques jours de doublure avec le comptable en poste.
                    C&apos;est standard et ça lève le principal point d&apos;inquiétude.
                  </p>
                </div>
              </div>
            </section>

            {/* E. Pièges */}
            <section id="pieges" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                E. Points d&apos;attention / pièges du taxateur
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Calcul par tranches : ne jamais appliquer 0,799 % sur toute l’assiette.',
                  'Neuf vs ancien : pas de DMTO dans le neuf, mais TVA + TPF réduite.',
                  'Taux DMTO départemental : vérifier la délibération du département et la qualité primo-accédant.',
                  'Provision suffisante : sous-estimer → compte client débiteur en inspection.',
                  'Débours : refacturés au réel, sans marge ; ne pas les confondre avec les émoluments.',
                  'Comptes débiteurs = interdit : le réflexe n°1 du contrôle.',
                  'Dossiers > 3 mois : penser à la consignation CDC.',
                  'TVA 20 % sur émoluments + honoraires ; attention aux régimes TVA sur le neuf.',
                  'Remise : si l’office en pratique une, elle doit être uniforme et tracée.',
                  'Restitution du trop-perçu au client après décompte définitif.',
                ].map((t, i) => (
                  <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-4 flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-sm text-gray-700">{t}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* F. Cas pratiques */}
            <section id="cas" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ListChecks className="w-8 h-8 text-indigo-600" />
                F. Cas pratiques (à refaire à la main)
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 1 — Vente d&apos;ancien 200 000 € (dpt à 4,50 %)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Émoluments HT 1 995,25 € → TTC <strong>2 394,30 €</strong></li>
                    <li>• DMTO : 9 000 (départ.) + 2 400 (comm.) + 213,30 (frais) = <strong>11 613,30 €</strong></li>
                    <li>• CSI : 200 000 × 0,10 % = <strong>200 €</strong></li>
                    <li>• + débours (~400–1 200 €) + formalités</li>
                    <li>• <strong>Total ≈ 14 600–15 400 €</strong> (~7,3–7,7 %). Dpt à 5,00 % → +~1 000 €.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 2 — Même vente, primo-accédant (dpt ayant voté la hausse)</h4>
                  <p className="text-sm text-gray-700">La hausse de +0,5 pt ne s&apos;applique pas : on retient le taux d&apos;avant hausse (4,50 %). Bien qualifier et tracer le statut dans le dossier.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 3 — Vente neuf / VEFA 250 000 € TTC</h4>
                  <p className="text-sm text-gray-700">Pas de DMTO ; TPF ~0,715 % ≈ 1 788 € ; CSI 0,10 % = 250 € ; émoluments proportionnels. « Frais » ~2,5 % ≈ 6 000–7 000 €.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 4 — Provision</h4>
                  <p className="text-sm text-gray-700">Sur le Cas 1, le taxateur appelle une provision couvrant émoluments TTC + DMTO + CSI + débours estimés + marge de sécurité, avant signature.</p>
                </div>
              </div>
              <div className="mt-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                <p className="text-sm text-indigo-900">
                  Pour s&apos;entraîner sur la partie taxe : utilisez le calculateur
                  {' '}<a href="/pretaxe" className="font-semibold underline">Frais de Notaire</a>{' '}
                  de NotariaPrime.
                </p>
              </div>
            </section>

            {/* Sources */}
            <section id="sources" className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                Sources (mai 2026)
              </h2>
              <ul className="space-y-2 mb-6">
                {sources.map((s) => (
                  <li key={s.url} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">{s.label}</a>
                  </li>
                ))}
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Pour la valeur juridique opposable, se référer au <strong>Code de commerce (art. A444-x)</strong>,
                    à l&apos;<strong>arrêté tarifaire du 25/02/2026</strong>, à la <strong>loi de finances 2025 (art. 116)</strong>
                    et aux <strong>délibérations</strong> du conseil départemental concerné. Ce cours est un
                    support pédagogique, pas un conseil juridique.
                  </p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default function CoursComptableTaxateurPage() {
  return (
    <MainLayout>
      <CoursContent />
    </MainLayout>
  );
}
