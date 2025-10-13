"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Calculator, TrendingUp, ArrowRight, Sparkles,
  CheckCircle, FileCheck, Building2, Clock, Zap,
  Shield, Brain, Target
} from 'lucide-react';

function FonctionnalitesContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
      setIsMobile(window.innerWidth < 768);
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">4 outils professionnels</span>
          </div>

          <h1 className={`font-bold mb-6 leading-tight ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
            <span className="text-gray-900">Tous les calculateurs dont vous</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              avez réellement besoin
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl">
            Conçus avec et pour les professionnels du notariat. Conformes aux réglementations 2025, 
            ultra-rapides et d'une précision irréprochable.
          </p>

          <div className="flex items-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Conforme 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Calcul &lt; 100ms</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Export PDF inclus</span>
            </div>
          </div>
        </div>
      </section>

      {/* Prétaxe Notariale - Disponible */}
      <section className="py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-16 items-center ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-semibold text-green-700">DISPONIBLE</span>
              </div>

              <h2 className="text-4xl font-bold mb-4 text-gray-900">Calcul de prétaxe notariale</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Le calculateur de frais de notaire le plus précis et rapide. Conforme au décret n°2016-230 
                et aux tarifs réglementés 2025. Application automatique du barème dégressif.
              </p>

              <div className="space-y-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Calcul par tranches automatique
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    <strong>Barème officiel :</strong> 3,870% jusqu'à 6 500€ • 1,596% de 6 500€ à 17 000€ 
                    • 1,064% de 17 000€ à 60 000€ • 0,799% au-delà. Application instantanée sur votre montant.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                    Frais annexes inclus
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Intégration automatique : droits de mutation (5,80% en moyenne), contribution de sécurité 
                    immobilière (0,10%), émoluments de formalités, débours estimés. Tout est calculé.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-indigo-600" />
                    Export professionnel
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Génération PDF avec détail ligne par ligne : base de calcul, taux appliqué, montant HT, 
                    TVA 20%, total TTC. Présentation professionnelle prête pour vos clients.
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
                  <h3 className="font-bold text-gray-900 mb-2">Types d'actes supportés</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Vente immobilière', 'VEFA', 'Donation', 'Partage successoral', 'SCI', 'Bail emphytéotique'].map((type) => (
                      <span key={type} className="px-3 py-1 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-gray-700">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a href="/pretaxe" className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                Utiliser le calculateur
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Example Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-gray-500">EXEMPLE DE CALCUL</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  CONFORME 2025
                </span>
              </div>

              <div className="mb-6 pb-6 border-b-2 border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Prix de vente</div>
                <div className="text-3xl font-bold text-gray-900">250 000,00 €</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-xs font-semibold text-gray-500 mb-3">ÉMOLUMENTS PROPORTIONNELS</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tranche 1 (0-6 500€) × 3,870%</span>
                  <span className="font-semibold text-gray-900">251,55 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tranche 2 (6 500-17 000€) × 1,596%</span>
                  <span className="font-semibold text-gray-900">167,58 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tranche 3 (17 000-60 000€) × 1,064%</span>
                  <span className="font-semibold text-gray-900">457,52 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tranche 4 (&gt; 60 000€) × 0,799%</span>
                  <span className="font-semibold text-gray-900">1 518,10 €</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-gray-100 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-900">Émoluments HT</span>
                  <span className="font-bold text-gray-900">2 394,75 €</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>TVA 20%</span>
                  <span>478,95 €</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Droits de mutation (5,80%)</span>
                  <span className="font-semibold text-gray-900">14 500,00 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Contribution sécu. immo (0,10%)</span>
                  <span className="font-semibold text-gray-900">250,00 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais divers et débours</span>
                  <span className="font-semibold text-gray-900">450,00 €</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total frais de notaire</span>
                  <span className="text-2xl font-bold text-indigo-600">18 073,70 €</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Soit 7,23% du prix de vente</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plus-Value Immobilière */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-16 items-center ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Example Card first on desktop */}
            <div className={`${isDesktop ? 'order-1' : 'order-2'} bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-gray-500">SCÉNARIO D'OPTIMISATION</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-xs font-semibold text-gray-500 mb-3">DONNÉES DE BASE</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Acquisition (2010)</div>
                    <div className="font-bold text-gray-900">180 000 €</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Vente (2025)</div>
                    <div className="font-bold text-gray-900">320 000 €</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Travaux justifiés</div>
                    <div className="font-bold text-gray-900">35 000 €</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Durée détention</div>
                    <div className="font-bold text-gray-900">15 ans</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mb-6 border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Plus-value brute</span>
                  <span className="text-xl font-bold text-green-600">105 000 €</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="text-xs font-semibold text-gray-500 mb-3">ABATTEMENTS APPLIQUÉS</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Abattement IR (6% × 15 ans)</span>
                  <span className="font-semibold text-green-600">-90%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Abattement PS (1,65% × 15 ans)</span>
                  <span className="font-semibold text-green-600">-24,75%</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impôt sur le revenu (19%)</span>
                  <span className="font-semibold text-gray-900">1 995 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prélèvements sociaux (17,2%)</span>
                  <span className="font-semibold text-gray-900">13 566 €</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">Total fiscalité</span>
                  <span className="text-2xl font-bold text-green-600">15 561 €</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-700">
                  <Sparkles className="w-3 h-3" />
                  <span className="font-semibold">Économie de 22 539 € grâce aux abattements</span>
                </div>
              </div>
            </div>

            <div className={isDesktop ? 'order-2' : 'order-1'}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-semibold text-green-700">DISPONIBLE</span>
              </div>

              <h2 className="text-4xl font-bold mb-4 text-gray-900">Calcul de plus-value immobilière</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Simulez la fiscalité sur vos ventes et identifiez les leviers d'optimisation. 
                Conforme aux articles 150 U et suivants du CGI. Mise à jour automatique des taux 2025.
              </p>

              <div className="space-y-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Abattements pour durée de détention
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Application automatique des abattements progressifs. <strong>Exonération totale d'IR après 22 ans</strong>, 
                    de prélèvements sociaux après 30 ans. Calcul au jour près pour une précision maximale.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    Optimisation par les travaux
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    <strong>Deux méthodes :</strong> forfait 15% du prix d'acquisition sans justificatif, ou montant réel 
                    avec factures. L'outil choisit automatiquement la méthode la plus favorable.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Simulation comparative
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Comparez plusieurs scénarios : vente immédiate vs attente d'exonération, impact de travaux 
                    supplémentaires, démembrement de propriété pour optimiser la fiscalité.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-gray-900 mb-2">Cas particuliers gérés</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Résidence principale', 'Première cession', 'Indivision', 'SCI familiale'].map((cas) => (
                      <span key={cas} className="px-3 py-1 bg-white border border-green-200 rounded-lg text-sm font-medium text-gray-700">
                        {cas}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a href="/plusvalue" className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                Utiliser le calculateur
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Outils en développement */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-full mb-6">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">Prochainement disponibles</span>
            </div>
            <h2 className={`font-bold mb-4 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              L'avenir de NotariaPrime
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deux nouveaux outils puissants en développement actif
            </p>
          </div>

          <div className={`grid gap-8 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Scanner OCR */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                  EN DÉVELOPPEMENT
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-4 text-gray-900">Scanner OCR Pro</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Extraction automatique des données depuis vos documents notariés. 
                Gagnez des heures sur la saisie manuelle avec une précision de 98,5%.
              </p>

              <div className="bg-white rounded-xl p-5 mb-6 border border-purple-200">
                <div className="text-xs font-semibold text-gray-500 mb-4">RECONNAISSANCE INTELLIGENTE</div>
                <div className="space-y-3">
                  {[
                    { title: 'Actes de vente', desc: 'Prix, parties, références cadastrales' },
                    { title: 'Factures de travaux', desc: 'Montants, dates, nature des travaux' },
                    { title: 'Compromis de vente', desc: 'Conditions suspensives, clauses' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>Vérification humaine recommandée pour validation finale</span>
              </div>
            </div>

            {/* Expertise IA */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                  EN DÉVELOPPEMENT
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-4 text-gray-900">Expertise IA</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Estimation immobilière basée sur l'IA et les données DVF. 
                Analyse de 15M+ transactions sur 5 ans de données gouvernementales.
              </p>

              <div className="bg-white rounded-xl p-5 mb-6 border border-amber-200">
                <div className="text-xs font-semibold text-gray-500 mb-4">ANALYSE MULTI-CRITÈRES</div>
                <div className="space-y-3">
                  {[
                    { title: 'Comparables géolocalisés', desc: 'Rayon 500m à 2km selon densité' },
                    { title: 'Pondération temporelle', desc: 'Priorité aux transactions récentes' },
                    { title: 'Ajustements qualitatifs', desc: 'État, exposition, étage, prestations' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Brain className="w-4 h-4 text-amber-600" />
                <span>Base DVF Gouv + cadastre • Mise à jour mensuelle</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a href="/roadmap" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">
              Consultez la roadmap complète
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Infrastructure technique */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`font-bold mb-4 text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Une infrastructure de pointe
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Performance, sécurité et transparence au cœur de notre technologie
            </p>
          </div>

          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {[
              {
                icon: Zap,
                title: 'Performance',
                desc: 'Résultats en moins de 500ms grâce à Next.js et au calcul côté client',
                badge: 'Edge computing'
              },
              {
                icon: Shield,
                title: 'Confidentialité',
                desc: 'Aucune donnée envoyée sur nos serveurs. Calculs 100% locaux dans votre navigateur',
                badge: 'Zero-knowledge'
              },
              {
                icon: Brain,
                title: 'Open Source',
                desc: 'Code source public sur GitHub. Auditable par tous, contributions bienvenues',
                badge: 'MIT License'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{item.desc}</p>
                <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`font-bold mb-6 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
            Prêt à gagner du temps ?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Rejoignez les professionnels qui utilisent NotariaPrime quotidiennement 
            pour simplifier leurs calculs notariaux
          </p>
          
          <div className={`flex gap-4 justify-center mb-10 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <a href="/pretaxe" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="https://github.com/Interne52105110/notariaprime" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl font-semibold transition-all">
              Voir sur GitHub
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Sans inscription
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              100% Gratuit
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Open Source
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FonctionnalitesPage() {
  return (
    <MainLayout>
      <FonctionnalitesContent />
    </MainLayout>
  );
}