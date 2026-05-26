"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import {
  GraduationCap, Receipt, Wallet, Newspaper, MonitorSmartphone,
  AlertTriangle, ListChecks, BookOpen, Info, CheckCircle, ChevronRight,
  Layers, ExternalLink,
} from 'lucide-react';

const sections = [
  { id: 'metier', title: 'Le métier', icon: GraduationCap },
  { id: 'taxe', title: 'A. La taxe', icon: Receipt },
  { id: 'difficultes', title: 'B. Difficultés du métier', icon: Layers },
  { id: 'compta', title: 'C. Comptabilité notariale', icon: Wallet },
  { id: 'actus', title: 'D. Actualités 2025/2026', icon: Newspaper },
  { id: 'logiciels', title: 'E. Logiciels & prise en main', icon: MonitorSmartphone },
  { id: 'reflexes', title: 'F. Réflexes / pièges', icon: AlertTriangle },
  { id: 'cas', title: 'G. Cas pratiques', icon: ListChecks },
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
  { acte: 'Partage', emol: 'proportionnels', droits: 'droit de partage 2,50 % (1,10 % si divorce)' },
];

// Barème de l'usufruit / nue-propriété — art. 669 du CGI (par âge de l'usufruitier)
const art669 = [
  { age: 'moins de 21 ans', usu: '90 %', np: '10 %' },
  { age: '21 à 30 ans', usu: '80 %', np: '20 %' },
  { age: '31 à 40 ans', usu: '70 %', np: '30 %' },
  { age: '41 à 50 ans', usu: '60 %', np: '40 %' },
  { age: '51 à 60 ans', usu: '50 %', np: '50 %' },
  { age: '61 à 70 ans', usu: '40 %', np: '60 %' },
  { age: '71 à 80 ans', usu: '30 %', np: '70 %' },
  { age: '81 à 90 ans', usu: '20 %', np: '80 %' },
  { age: '91 ans et plus', usu: '10 %', np: '90 %' },
];

const logiciels = [
  { nom: 'Genapi Compta', editeur: 'Septeo (Genapi)', desc: 'Module de comptabilité notariale de la suite iNot : comptes clients, provisions, décomptes, rapprochements, déclarations. Éditeur majoritaire du marché.', url: 'https://www.genapi.septeo.com/nos-solutions/genapi-compta-logiciel-comptabilite-notaire' },
  { nom: 'Genapi Actes (iNot / Kivia)', editeur: 'Septeo (Genapi)', desc: 'Le module rédaction d’actes — celui que connaissent les clercs. Partage le dossier avec la compta.', url: 'https://www.genapi.septeo.com/nos-solutions/genapi-actes-logiciel-redaction-actes' },
  { nom: 'Fichorga', editeur: 'Septeo', desc: 'Autre solution historique du notariat, aujourd’hui dans le giron Septeo.', url: 'https://www.septeo.com/fr/job/notary' },
  { nom: 'Fiducial', editeur: 'Fiducial Informatique', desc: 'Éditeur concurrent proposant des logiciels métier pour offices notariaux.', url: 'https://www.fiducial.fr/' },
];

const ressources = [
  { label: 'Genapi Compta — page produit officielle (Septeo)', url: 'https://www.genapi.septeo.com/nos-solutions/genapi-compta-logiciel-comptabilite-notaire' },
  { label: 'Genapi — formation « aide aux déclarations mensuelles avec iNot comptabilité » (IC2H)', url: 'https://www.genapi.fr/bt-produits/ic2h-001-laide-aux-declarations-mensuelles-avec-inot-comptabilite-1-heure-3860.htm' },
  { label: 'Genapi — pôle formation comptabilité (classes virtuelles)', url: 'https://www.genapi.fr/boutique/bt-filtres/pole-formation-ct_45/classe-virtuelle-ct_81/comptabilite-ct_109/office-ct_113/duree-dune-heure-ct_190.htm' },
  { label: 'Espace client Septeo (Genapi) — support notaires', url: 'https://www.septeo.com/fr/articles/espace-client-septeo-notaires' },
  { label: 'Artlys — formation complète iNot (prise en main, organisme tiers)', url: 'https://artlys.fr/formation-complete-inot-maitrise-fonctionnalites-prise-main-notaires/' },
];

const sources = [
  { label: 'Lexbase — La réforme du tarif des notaires (arrêté 25/02/2026)', url: 'https://www.lexbase.fr/revues-juridiques/30605861-texteslareformedutarifdesnotaires' },
  { label: 'Notaires de France — Augmentation des DMTO (LF 2025)', url: 'https://www.notaires.fr/fr/actualites/vente-immobiliere-et-augmentation-des-droits-de-mutation-titre-onereux' },
  { label: 'Service-Public — Hausse des droits de mutation', url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18183' },
  { label: 'Laroche & Associés — DMTO et primo-accédants (LF 2025)', url: 'https://www.laroche.notaires.fr/blog/dmto-et-primo-accedants-ce-que-prevoit-vraiment-la-loi-de-finances-2025' },
  { label: 'not-compta.fr — Réglementation comptable notariale', url: 'https://not-compta.fr/prestations/comptable-taxateur/reglementation-comptable-notariale/' },
  { label: 'Actu-Juridique — La responsabilité du notaire face à l’impôt', url: 'https://www.actu-juridique.fr/professions/la-responsabilite-du-notaire-face-a-limpot/' },
  { label: 'Chambre de Paris — Assurance-vie et fiscalité : tout est à déclarer au notaire', url: 'https://paris.notaires.fr/fr/actualites/assurance-vie-et-fiscalite-tout-est-declarer-au-notaire' },
  { label: 'Service-Public — Évaluation de la succession et calcul des droits', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F14198' },
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
            Support de révision complet et à jour 2025/2026 : taxation des actes, difficultés
            réelles du métier, comptabilité notariale, derniers textes et logiciels.
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
                    Montants et taux indicatifs. À recouper avec l&apos;arrêté tarifaire en vigueur,
                    le JurisClasseur « Commentaire du tarif des notaires » et les délibérations de votre département.
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
                Le comptable-taxateur d&apos;un office notarial exerce deux métiers liés :
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <Receipt className="w-8 h-8 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Taxateur</h3>
                  <p className="text-sm text-gray-600">
                    Il taxe les actes : calcul des émoluments du notaire, des droits et taxes et des
                    débours ; établissement de la demande de provision puis du décompte définitif.
                  </p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <Wallet className="w-8 h-8 text-emerald-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Comptable</h3>
                  <p className="text-sm text-gray-600">
                    Il tient la comptabilité notariale réglementée : comptes clients individualisés,
                    maniement des fonds via la Caisse des Dépôts, rapprochements, déclarations, inspections.
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
              <p className="text-gray-700 mb-4">Le notaire ne conserve que le premier bloc et reverse le reste :</p>
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-8 overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
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
                Barème national dégressif par tranches (art. A444-x C. com.), fixé par arrêté du 25 février 2026, applicable jusqu&apos;au 29 février 2028.
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
                    On applique le taux dans chaque tranche puis on additionne — jamais le taux du haut sur la totalité. Puis on ajoute la TVA 20 %. Exemple (assiette 200 000 €) : 251,55 + 167,58 + 457,52 + 1 118,60 = 1 995,25 € HT, soit 2 394,30 € TTC.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Formalité, remise, honoraires</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span>Émoluments de <strong>formalité (fixes)</strong> : montants fixes pour les formalités annexes (copies, états hypothécaires, publication…).</span></li>
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span><strong>Remise (nouveauté 2026)</strong> : plafond porté de 10 % à 20 %, applicable dès 100 000 € d&apos;assiette (avant 150 000 €), uniforme pour tous les clients.</span></li>
                <li className="flex items-start gap-2 text-gray-700"><ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" /><span><strong>Honoraires libres</strong> : prestations hors tarif réglementé (conseil, négociation), fixés par convention écrite — à ne pas confondre avec les émoluments.</span></li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Droits et taxes</h3>
              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">DMTO — vente d&apos;ancien</h4><p className="text-sm text-gray-700">Droit départemental 4,50 % (jusqu&apos;à 5,00 % depuis avril 2025) + taxe communale 1,20 % + frais d&apos;assiette 2,37 % du droit départemental. Total ~5,80 % → jusqu&apos;à ~6,31 %.</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Neuf / VEFA</h4><p className="text-sm text-gray-700">Pas de DMTO : TVA 20 % (incluse dans le prix) + taxe de publicité foncière réduite ~0,715 %. Frais réduits (2–3 %).</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">CSI — Contribution de Sécurité Immobilière</h4><p className="text-sm text-gray-700">0,10 % du prix, versée à l&apos;État pour la publicité foncière. Remplace l&apos;ancien « salaire du conservateur ».</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Droit de partage</h4><p className="text-sm text-gray-700">2,50 % de l&apos;actif net partagé (CGI art. 746) ; ramené à 1,10 % depuis 2022 pour les partages consécutifs à un divorce, une séparation de corps ou une rupture de PACS. Un partage de succession reste à 2,50 %.</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Mutation à titre gratuit (donation / succession)</h4><p className="text-sm text-gray-700">Calcul après abattements (ex. 100 000 € parent-enfant) puis barème progressif par tranches.</p></div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Logique de taxation par type d&apos;acte</h3>
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden overflow-x-auto">
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

            {/* B. Difficultés du métier */}
            <section id="difficultes" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Layers className="w-8 h-8 text-rose-600" />
                B. Les difficultés réelles du métier
              </h2>
              <p className="text-gray-700 mb-6">
                Le barème est la partie facile. La vraie difficulté du taxateur, ce sont les cas
                particuliers, souvent tranchés par le JurisClasseur « Commentaire du tarif des notaires »
                ou par la Commission Statut et Éthique du CSN. Quelques exemples typiques :
              </p>

              <div className="space-y-5">
                {/* Démembrement */}
                <div className="bg-white rounded-xl border-2 border-rose-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Layers className="w-5 h-5 text-rose-600" /> Vente d&apos;un bien démembré (usufruit + nue-propriété → même acquéreur)</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Quand l&apos;usufruitier et le nu-propriétaire vendent en un même acte, à un même acquéreur, le notaire perçoit <strong>un seul émolument calculé sur la valeur totale du bien</strong> (la pleine propriété reconstituée) — et non deux émoluments séparés (Tableau 5 du tarif, vente / cession de gré à gré).
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Opinion divergente</strong> (Me Saint-Geniest) : si des <strong>prix distincts</strong> sont stipulés pour l&apos;usufruit et la nue-propriété et qu&apos;<strong>aucune obligation solidaire</strong> n&apos;est prévue, on peut soutenir un calcul de l&apos;émolument sur chaque prix séparément. Point de doctrine à trancher selon la position de l&apos;étude.
                  </p>
                </div>

                {/* art 669 */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Valeur de l&apos;usufruit / nue-propriété — art. 669 du CGI</h3>
                  <p className="text-sm text-gray-700 mb-3">Barème fiscal par âge de l&apos;usufruitier, indispensable pour démembrements, donations et successions :</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[420px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-900">Âge de l&apos;usufruitier</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-900">Usufruit</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-900">Nue-propriété</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {art669.map((r) => (
                          <tr key={r.age}>
                            <td className="px-4 py-2 text-gray-700">{r.age}</td>
                            <td className="px-4 py-2 text-gray-700">{r.usu}</td>
                            <td className="px-4 py-2 text-gray-700">{r.np}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Base émoluments succession */}
                <div className="bg-white rounded-xl border-2 border-rose-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Base de perception des émoluments en succession</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    L&apos;émolument de la déclaration de succession ne se calcule <strong>pas sur l&apos;actif net</strong>. La base de perception retient :
                  </p>
                  <div className="bg-rose-50 rounded-lg p-4 text-sm text-gray-800 font-medium mb-3">
                    Actif brut de succession + forfait mobilier + assurances-vie taxables + donations rapportées
                  </div>
                  <p className="text-sm text-gray-700">
                    Pour les biens de communauté, on intègre l&apos;actif brut de communauté, les biens propres et l&apos;abattement résidence principale selon les règles d&apos;assiette. À vérifier au cas par cas dans le JurisClasseur — c&apos;est une source fréquente d&apos;erreur de taxation.
                  </p>
                </div>

                {/* Assurance vie > 70 ans */}
                <div className="bg-white rounded-xl border-2 border-rose-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Assurance-vie : primes versées après 70 ans</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Pour les contrats souscrits après le 20 novembre 1991, les primes versées après le 70ᵉ anniversaire de l&apos;assuré sont soumises aux droits de succession après un <strong>abattement global de 30 500 €</strong> — abattement unique pour <strong>tous les contrats et tous les bénéficiaires confondus</strong>, partagé au prorata des primes. Les produits/intérêts restent exonérés.
                  </p>
                  <p className="text-sm text-gray-700">
                    Position de la Commission Statut et Éthique du CSN : <strong>la base de calcul de l&apos;émolument doit être la même que l&apos;assiette fiscale</strong>. Les primes versées après 70 ans, au-delà de 30 500 €, sont donc intégrées dans l&apos;actif taxable <strong>et</strong> dans la base de l&apos;émolument.
                  </p>
                </div>

                {/* PVI complexe */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Plus-value immobilière : complexité vs émolument dérisoire</h3>
                  <p className="text-sm text-gray-700">
                    Le notaire peut devoir liquider une PVI très complexe (pluralité d&apos;origines de propriété, apport en démembrement à une société, exonérations) alors qu&apos;il n&apos;est rémunéré que par un émolument d&apos;environ <strong>56,60 €</strong>. Le risque de responsabilité est sans rapport avec le tarif — d&apos;où l&apos;importance d&apos;une taxation rigoureuse.
                  </p>
                </div>

                {/* Responsabilité + déclarations */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Responsabilité fiscale &amp; déclarations périodiques</h3>
                  <p className="text-sm text-gray-700">
                    Le notaire (et derrière lui le taxateur) répond du calcul et du reversement de l&apos;impôt : une erreur engage sa responsabilité. À cela s&apos;ajoutent les déclarations à produire dans les délais — <strong>mensuelles</strong> (TVA, droits d&apos;enregistrement, RCM) et <strong>trimestrielles</strong> (CRPCEN, la caisse de retraite et de prévoyance des clercs et employés de notaires).
                  </p>
                </div>
              </div>
            </section>

            {/* C. Comptabilité notariale */}
            <section id="compta" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-emerald-600" />
                C. La comptabilité notariale
              </h2>

              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Une comptabilité « spéciale »</h3>
                <p className="text-gray-700">
                  Le notaire manie en permanence l&apos;argent des clients (prix de vente, fonds de prêt, droits à reverser). La comptabilité notariale est donc réglementée et contrôlée, pour garantir que chaque euro client est représenté à tout instant.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Comptes clients &amp; plan comptable</h4><p className="text-sm text-gray-700">Chaque dossier a un compte client individualisé. Les fonds de tiers sont enregistrés dans les subdivisions du compte « 542 100 — comptes de dépôts clients ». Règle d&apos;or : aucun compte client ne doit être débiteur (premier point regardé en inspection).</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Maniement des fonds — Caisse des Dépôts (CDC)</h4><p className="text-sm text-gray-700">Les fonds détenus sont déposés à la CDC sur des comptes de disponibilités courantes ; seuls les fonds de tiers y figurent. Les mouvements en débit ne sont possibles que pour régler l&apos;affaire à l&apos;origine du dépôt.</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Règle des espèces</h4><p className="text-sm text-gray-700">Pas plus de 3 000 € en espèces plus de 2 jours ouvrables, et ≤ 5 % du total des fonds détenus.</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Consignation après 3 mois</h4><p className="text-sm text-gray-700">Les sommes restées au-delà de 3 mois sur les comptes de disponibilités courantes sont transférées sur des comptes de dépôts obligatoires à la CDC. À surveiller : les dossiers « dormants ».</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">La provision préalable (lien taxe ↔ compta)</h4><p className="text-sm text-gray-700">Avant de signer, le notaire exige la consignation d&apos;une somme suffisante (émoluments, droits, débours, taxes). C&apos;est le taxateur qui chiffre cette demande de provision. Sous-provisionner expose à un solde débiteur.</p></div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Contrôle &amp; inspection</p>
                    <p className="text-sm text-blue-800">Inspection de comptabilité annuelle, en principe inopinée, de chaque office. La trésorerie et la représentation des fonds clients sont au cœur du contrôle. Filet de sécurité de la profession : la garantie collective, qui garantit les fonds clients.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* D. Actualités */}
            <section id="actus" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Newspaper className="w-8 h-8 text-indigo-600" />
                D. Actualités &amp; textes récents (2025/2026)
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-xl border-2 border-indigo-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Réforme du tarif — arrêté du 25 février 2026</h4><p className="text-sm text-gray-700">Nouveau tarif fixé jusqu&apos;au 29 février 2028. Remise portée de 10 % à 20 %, seuil abaissé de 150 000 € à 100 000 €. Barème proportionnel à 4 tranches inchangé dans sa structure.</p></div>
                <div className="bg-white rounded-xl border-2 border-indigo-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Loi de finances 2025 — DMTO (art. 116)</h4><p className="text-sm text-gray-700">Les départements peuvent relever leur droit de +0,5 point (jusqu&apos;à 5,00 %), du 1ᵉʳ avril 2025 au 30 avril 2028 (mesure temporaire). Frais d&apos;achat ancien vers ~6,3 %.</p></div>
                <div className="bg-white rounded-xl border-2 border-emerald-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Exonération primo-accédants</h4><p className="text-sm text-gray-700">L&apos;acquéreur non propriétaire de sa résidence principale dans les 2 ans précédents, achetant sa RP, échappe à la hausse. Les départements peuvent en plus réduire/exonérer les DMTO, sous engagement d&apos;occupation ≥ 5 ans. Le statut reste flou (achat conjoint avec un seul primo) → vigilance du taxateur.</p></div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6"><h4 className="font-bold text-gray-900 mb-2">Maniement des fonds &amp; intérêts (2025)</h4><p className="text-sm text-gray-700">Rappel renforcé sur le traitement des sommes maniées et des intérêts produits par les fonds clients (régime spécifique, pas l&apos;office). Sujet sensible en inspection.</p></div>
              </div>
            </section>

            {/* E. Logiciels */}
            <section id="logiciels" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MonitorSmartphone className="w-8 h-8 text-indigo-600" />
                E. Logiciels de compta notariale &amp; prise en main
              </h2>
              <p className="text-gray-700 mb-6">
                Connaître Genapi côté rédaction (iNot Actes) ne suffit pas : le module compta a sa
                propre logique (flux financiers rattachés au dossier, déclarations, rapprochements).
                Le marché est concentré autour de quelques éditeurs :
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {logiciels.map((l) => (
                  <a key={l.nom} href={l.url} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-300 transition">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900">{l.nom}</h4>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-indigo-600 font-medium mb-2">{l.editeur}</p>
                    <p className="text-sm text-gray-600">{l.desc}</p>
                  </a>
                ))}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Ressources de prise en main / formation</h3>
              <ul className="space-y-2 mb-8">
                {ressources.map((r) => (
                  <li key={r.url} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">{r.label}</a>
                  </li>
                ))}
              </ul>

              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Conseil : à l&apos;embauche, négocier une formation Genapi/Septeo au module compta (les classes virtuelles « aide aux déclarations » sont un bon point d&apos;entrée) et quelques jours de doublure avec le comptable en poste. C&apos;est la voie la plus rapide pour combler l&apos;écart entre la rédaction et la compta.
                  </p>
                </div>
              </div>
            </section>

            {/* F. Réflexes */}
            <section id="reflexes" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                F. Réflexes &amp; pièges à éviter
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Calcul par tranches : ne jamais appliquer 0,799 % sur toute l’assiette.',
                  'Neuf vs ancien : pas de DMTO dans le neuf, mais TVA + TPF réduite.',
                  'Taux DMTO départemental : vérifier la délibération et la qualité primo-accédant.',
                  'Démembrement : un seul émolument sur la valeur totale (sauf prix distincts sans solidarité).',
                  'Succession : base de l’émolument = actif brut + forfait mobilier + AV taxables + donations rapportées.',
                  'Assurance-vie > 70 ans : abattement 30 500 € global, intégrée à la base de l’émolument.',
                  'Provision suffisante : sous-estimer → compte client débiteur en inspection.',
                  'Débours : refacturés au réel, sans marge ; à distinguer des émoluments.',
                  'Comptes débiteurs = interdit : le réflexe n°1 du contrôle.',
                  'Dossiers > 3 mois : penser à la consignation CDC.',
                  'Déclarations mensuelles (TVA, enregistrement) et trimestrielles (CRPCEN) dans les délais.',
                  'Restitution du trop-perçu au client après décompte définitif.',
                ].map((t, i) => (
                  <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-4 flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-sm text-gray-700">{t}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* G. Cas pratiques */}
            <section id="cas" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ListChecks className="w-8 h-8 text-indigo-600" />
                G. Cas pratiques (à refaire à la main)
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 1 — Vente d&apos;ancien 200 000 € (dpt à 4,50 %)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Émoluments HT 1 995,25 € → TTC 2 394,30 €</li>
                    <li>• DMTO : 9 000 (départ.) + 2 400 (comm.) + 213,30 (frais) = 11 613,30 €</li>
                    <li>• CSI : 200 000 × 0,10 % = 200 €</li>
                    <li>• + débours (~400–1 200 €) + formalités</li>
                    <li>• Total ≈ 14 600–15 400 € (~7,3–7,7 %). Dpt à 5,00 % → +~1 000 €.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 2 — Vente d&apos;un bien démembré (US + NP → même acquéreur)</h4>
                  <p className="text-sm text-gray-700">Bien de 300 000 € vendu par l&apos;usufruitier (65 ans) et le nu-propriétaire. Émolument unique calculé sur 300 000 € (pleine propriété), pas séparément sur US (40 %) et NP (60 %) — sauf prix distincts stipulés sans solidarité.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 3 — Succession avec assurance-vie après 70 ans</h4>
                  <p className="text-sm text-gray-700">Primes versées après 70 ans = 80 000 € : taxables après abattement 30 500 €, soit 49 500 € intégrés à l&apos;actif taxable et à la base de l&apos;émolument de la déclaration de succession.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Cas 4 — Vente neuf / VEFA 250 000 € TTC</h4>
                  <p className="text-sm text-gray-700">Pas de DMTO ; TPF ~0,715 % ≈ 1 788 € ; CSI 0,10 % = 250 € ; émoluments proportionnels. « Frais » ~2,5 % ≈ 6 000–7 000 €.</p>
                </div>
              </div>
              <div className="mt-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                <p className="text-sm text-indigo-900">
                  Pour s&apos;entraîner sur la partie taxe, utilisez le calculateur <a href="/pretaxe" className="font-semibold underline">Frais de Notaire</a> de NotariaPrime.
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
                    Pour la valeur juridique opposable, se référer au Code de commerce (art. A444-x), à l&apos;arrêté tarifaire du 25/02/2026, au CGI (art. 669, 757 B), à la loi de finances 2025 (art. 116), au JurisClasseur « Commentaire du tarif des notaires » et aux délibérations du conseil départemental concerné. Ce cours est un support pédagogique, pas un conseil juridique.
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
