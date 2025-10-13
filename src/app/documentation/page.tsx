"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  BookOpen, Calculator, TrendingUp, Search, 
  ChevronRight, FileText, HelpCircle, Zap,
  CheckCircle, AlertTriangle, Info, ExternalLink
} from 'lucide-react';

function DocumentationContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: BookOpen },
    { id: 'pretaxe', title: 'Prétaxe Notariale', icon: Calculator },
    { id: 'plusvalue', title: 'Plus-Value Immobilière', icon: TrendingUp },
    { id: 'faq', title: 'FAQ', icon: HelpCircle }
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
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
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Documentation</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl">
            Guide complet d'utilisation de NotariaPrime. Apprenez à maîtriser tous nos outils de calcul.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className={`grid gap-12 ${isDesktop ? 'grid-cols-[250px_1fr]' : 'grid-cols-1'}`}>
          {/* Sidebar */}
          {isDesktop && (
            <aside className="sticky top-24 self-start">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Besoin d'aide ?</p>
                    <a href="/contact" className="text-xs text-blue-700 hover:underline">
                      Contactez-nous
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Content */}
          <main className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section id="introduction" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                Introduction
              </h2>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8 not-prose mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Bienvenue sur NotariaPrime !</h3>
                <p className="text-gray-700 leading-relaxed">
                  NotariaPrime est une plateforme gratuite et open source qui simplifie vos calculs notariaux. 
                  Aucune inscription requise, aucun abonnement, juste des outils précis et conformes aux 
                  réglementations 2025.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fonctionnalités principales</h3>
              <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <Calculator className="w-8 h-8 text-indigo-600 mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Prétaxe Notariale</h4>
                  <p className="text-sm text-gray-600">Calcul des frais de notaire selon le barème réglementé</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <TrendingUp className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">Plus-Value Immobilière</h4>
                  <p className="text-sm text-gray-600">Simulation fiscale et optimisation</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl not-prose mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-900 mb-2">Important</p>
                    <p className="text-sm text-yellow-800">
                      NotariaPrime est un outil d'aide à la décision. Les résultats doivent être validés 
                      par un professionnel qualifié avant toute utilisation officielle.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Prétaxe */}
            <section id="pretaxe" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calculator className="w-8 h-8 text-indigo-600" />
                Calculateur de Prétaxe Notariale
              </h2>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Comment ça marche ?</h3>
              <p className="text-gray-700 mb-6">
                Le calculateur de prétaxe applique automatiquement le barème réglementé des émoluments 
                proportionnels conformément au décret n°2016-230.
              </p>

              <h4 className="text-xl font-bold text-gray-900 mb-4">Étape 1 : Saisir le montant</h4>
              <div className="bg-gray-50 rounded-xl p-6 not-prose mb-6">
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span className="text-gray-700">Accédez au calculateur via le bouton <strong>"Calculer"</strong> ou le menu</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span className="text-gray-700">Entrez le prix de vente du bien immobilier</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span className="text-gray-700">Sélectionnez le type d'acte (vente, VEFA, donation, etc.)</span>
                  </li>
                </ol>
              </div>

              <h4 className="text-xl font-bold text-gray-900 mb-4">Étape 2 : Comprendre le résultat</h4>
              <p className="text-gray-700 mb-4">Le calculateur affiche :</p>
              <div className="bg-white rounded-xl border-2 border-gray-200 not-prose mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h5 className="font-bold text-gray-900 mb-3">Émoluments proportionnels</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tranche 1 (0-6 500€) × 3,870%</span>
                      <span className="font-semibold">251,55 €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tranche 2 (6 500-17 000€) × 1,596%</span>
                      <span className="font-semibold">167,58 €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tranche 3 (17 000-60 000€) × 1,064%</span>
                      <span className="font-semibold">457,52 €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tranche 4 (&gt; 60 000€) × 0,799%</span>
                      <span className="font-semibold">1 518,10 €</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-900">Total émoluments HT</span>
                    <span className="font-bold text-gray-900">2 394,75 €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA 20%</span>
                    <span className="text-gray-600">478,95 €</span>
                  </div>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-700">Droits de mutation (5,80%)</span>
                    <span className="text-gray-900">14 500,00 €</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-700">Contribution sécurité immo (0,10%)</span>
                    <span className="text-gray-900">250,00 €</span>
                  </div>
                  <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                    <span className="text-gray-700">Frais divers</span>
                    <span className="text-gray-900">450,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-lg text-gray-900">Total frais de notaire</span>
                    <span className="font-bold text-lg text-indigo-600">18 073,70 €</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl not-prose">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 mb-2">Astuce</p>
                    <p className="text-sm text-green-800">
                      Vous pouvez exporter le résultat en PDF pour le partager avec votre client ou l'archiver.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Plus-Value */}
            <section id="plusvalue" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                Calculateur de Plus-Value Immobilière
              </h2>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Données à saisir</h3>
              <p className="text-gray-700 mb-6">
                Pour calculer la plus-value immobilière, vous aurez besoin des informations suivantes :
              </p>

              <div className="space-y-4 not-prose mb-8">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-3">1. Informations sur l'acquisition</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Prix d'acquisition initial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Date d'acquisition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Frais d'acquisition (réels ou forfait 7,5%)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-3">2. Informations sur la vente</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Prix de vente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Date de vente</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-3">3. Travaux réalisés</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Montant réel avec factures, ou</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Forfait 15% (si bien détenu &gt; 5 ans)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Abattements appliqués</h3>
              <p className="text-gray-700 mb-6">
                Le calculateur applique automatiquement les abattements pour durée de détention :
              </p>

              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden not-prose mb-8">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Durée</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Abattement IR</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Abattement PS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-gray-700">&lt; 6 ans</td>
                      <td className="px-6 py-3 text-gray-700">0%</td>
                      <td className="px-6 py-3 text-gray-700">0%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-700">6-21 ans</td>
                      <td className="px-6 py-3 text-gray-700">6% par an</td>
                      <td className="px-6 py-3 text-gray-700">1,65% par an</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-700">22e année</td>
                      <td className="px-6 py-3 text-gray-700">4%</td>
                      <td className="px-6 py-3 text-gray-700">1,60%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-700">&gt; 22 ans</td>
                      <td className="px-6 py-3 font-semibold text-green-700">Exonération totale IR</td>
                      <td className="px-6 py-3 text-gray-700">9% par an</td>
                    </tr>
                    <tr className="bg-green-50">
                      <td className="px-6 py-3 text-gray-700">&gt; 30 ans</td>
                      <td className="px-6 py-3 font-semibold text-green-700">Exonération totale IR</td>
                      <td className="px-6 py-3 font-semibold text-green-700">Exonération totale PS</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl not-prose">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Bon à savoir</p>
                    <p className="text-sm text-blue-800">
                      La résidence principale est totalement exonérée de plus-value. Le calculateur 
                      détecte automatiquement cette situation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-indigo-600" />
                Questions fréquentes
              </h2>

              <div className="space-y-4 not-prose">
                {[
                  {
                    q: 'Les calculs sont-ils fiables ?',
                    a: 'Oui, nos calculateurs sont conformes aux textes réglementaires en vigueur (décret n°2016-230 pour les émoluments, articles 150 U et suivants du CGI pour les plus-values). Ils sont régulièrement mis à jour.'
                  },
                  {
                    q: 'Mes données sont-elles sauvegardées ?',
                    a: 'Non, vos calculs sont traités localement dans votre navigateur et ne sont jamais envoyés sur nos serveurs. Vos données restent 100% privées et confidentielles.'
                  },
                  {
                    q: 'Puis-je utiliser NotariaPrime hors ligne ?',
                    a: 'Cette fonctionnalité est en développement (PWA). Pour l\'instant, une connexion internet est nécessaire pour accéder à la plateforme.'
                  },
                  {
                    q: 'Comment exporter mes calculs ?',
                    a: 'Un bouton "Exporter en PDF" est disponible sur chaque page de résultat. Le PDF contient tous les détails du calcul avec mise en forme professionnelle.'
                  },
                  {
                    q: 'Que faire si je trouve un bug ?',
                    a: 'Vous pouvez nous contacter via la page Contact ou créer une issue sur GitHub. Nous corrigeons les bugs en priorité.'
                  }
                ].map((faq, i) => (
                  <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-start gap-2">
                      <span className="text-indigo-600 flex-shrink-0">Q.</span>
                      {faq.q}
                    </h4>
                    <p className="text-gray-700 pl-6">{faq.a}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8 mt-8 not-prose">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Besoin d'aide supplémentaire ?</h3>
                <p className="text-gray-700 mb-6">
                  Notre équipe est disponible pour répondre à toutes vos questions
                </p>
                <div className="flex gap-4 flex-wrap">
                  <a 
                    href="/contact" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Nous contacter
                  </a>
                  <a 
                    href="https://github.com/Interne52105110/notariaprime"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl font-semibold transition-all"
                  >
                    Voir sur GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <MainLayout>
      <DocumentationContent />
    </MainLayout>
  );
}