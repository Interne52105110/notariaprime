"use client";

import React, { useState, memo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { releases } from '@/data/releases';
import {
  Calculator, TrendingUp, ArrowRight, Sparkles, Shield, Zap,
  CheckCircle, Users, Award,
  Clock, Star,
  Brain, Gift, HeartHandshake, Briefcase,
  PiggyBank, Home, Building, Scale,
  Hotel, BarChart3, Landmark
} from 'lucide-react';

// Types
interface Stat {
  value: string;
  label: string;
  trend?: string;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

interface Solution {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  status: string;
  features: string[];
  link: string;
  isNew?: boolean;
}

// Composants mémorisés
const StatsCard = memo(({ stat }: { stat: Stat }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
      {stat.trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          stat.trend === 'TOUJOURS' || stat.trend === 'OFFICIEL'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {stat.trend}
        </span>
      )}
    </div>
    <p className="text-gray-600">{stat.label}</p>
  </div>
));

StatsCard.displayName = 'StatsCard';

const FeatureCard = memo(({ feature }: { feature: Feature }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-indigo-300">
    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
      <feature.icon className="w-6 h-6 text-indigo-600" />
    </div>

    <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>

    <div className="pt-4 border-t border-gray-100">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-indigo-600">{feature.metric}</span>
        <span className="text-sm text-gray-500">{feature.metricLabel}</span>
      </div>
    </div>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

const SolutionCard = memo(({ solution, index, onHover }: {
  solution: Solution;
  index: number;
  onHover: (index: number | null) => void;
}) => {
  const isAvailable = solution.status === 'Disponible';

  const handleClick = () => {
    if (isAvailable && solution.link) {
      window.location.href = solution.link;
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl border p-8 transition-all duration-300 ${
        isAvailable
          ? 'border-gray-200 hover:shadow-xl hover:border-indigo-300 cursor-pointer hover:-translate-y-1'
          : 'border-gray-100 opacity-75 bg-gray-50 cursor-not-allowed'
      }`}
      onMouseEnter={() => isAvailable && onHover(index)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 ${
        isAvailable
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
          : 'bg-gray-300'
      }`}>
        <solution.icon className={`w-7 h-7 ${isAvailable ? 'text-white' : 'text-gray-500'}`} />
      </div>

      <h3 className="text-xl font-bold mb-2 text-gray-900">{solution.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{solution.description}</p>

      <div className="space-y-2 mb-6">
        {solution.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${isAvailable ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div>

      {isAvailable ? (
        <a
          href={solution.link}
          aria-label={`Utiliser l’outil : ${solution.title}`}
          className="inline-flex items-center gap-2 text-indigo-600 font-semibold transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          Utiliser l&apos;outil
          <ArrowRight className="w-4 h-4" />
        </a>
      ) : (
        <span className="text-gray-500 text-sm">Bientôt disponible</span>
      )}
    </div>
  );
});

SolutionCard.displayName = 'SolutionCard';

// Catégories d'outils pour filtrage
const CATEGORIES = ['Tous', 'Immobilier', 'Fiscalité', 'Patrimoine', 'Entreprise'] as const;
type Category = typeof CATEGORIES[number];

function HomepageContent() {
  const [activeCategory, setActiveCategory] = useState<Category>('Tous');


  const stats: Stat[] = [
    { value: '19', label: 'Calculateurs professionnels', trend: 'COMPLET' },
    { value: '12', label: 'Guides pratiques', trend: 'EXEMPLES' },
    { value: '100%', label: 'Gratuit et open source', trend: 'TOUJOURS' },
    { value: '2026', label: 'Barèmes à jour', trend: 'OFFICIEL' }
  ];

  const features: Feature[] = [
    {
      icon: Zap,
      title: 'Ultra rapide',
      description: 'Résultats instantanés grâce à notre moteur optimisé',
      metric: 'Local',
      metricLabel: 'Calcul dans le navigateur'
    },
    {
      icon: Shield,
      title: 'Calculs locaux',
      description: 'Montants calculés dans votre navigateur ; audience mesurée avec consentement',
      metric: '0',
      metricLabel: 'Montant envoyé'
    },
    {
      icon: Scale,
      title: 'Références fiscales',
      description: 'Hypothèses, sources et limites précisées dans chaque outil',
      metric: '2026',
      metricLabel: 'Sources à consulter'
    },
    {
      icon: Brain,
      title: 'Open Source',
      description: 'Code public, auditable, contributions bienvenues',
      metric: 'MIT',
      metricLabel: 'Licence'
    }
  ];

  type SolutionWithCategory = Solution & { category: Category };

  const allSolutions: SolutionWithCategory[] = [
{title:"Droits de succession",description:"Calcul des droits par héritier après détermination des parts civiles",icon:Calculator,status:'Disponible',features:['Hypothèses explicites','Calcul détaillé','Guide et sources'],link:'/succession',category:'Patrimoine',isNew:true},
{title:"Capacité d’emprunt",description:"Revenus, assurance, apport et budget total d’acquisition",icon:Calculator,status:'Disponible',features:['Hypothèses explicites','Calcul détaillé','Guide et sources'],link:'/capacite-emprunt',category:'Immobilier',isNew:true},
{title:"Achat, location et revente",description:"Comparaison des flux en direct et en SCI IS jusqu’à la sortie",icon:Calculator,status:'Disponible',features:['Hypothèses explicites','Calcul détaillé','Guide et sources'],link:'/strategie-immobiliere',category:'Immobilier',isNew:true},
{title:"Relance logement",description:"Amortissement Jeanbrun et effet sur les revenus fonciers",icon:Calculator,status:'Disponible',features:['Hypothèses explicites','Calcul détaillé','Guide et sources'],link:'/relance-logement',category:'Fiscalité',isNew:true},

    // Immobilier
    {
      title: 'Calculateur de Prétaxe',
      icon: Calculator,
      description: 'Calcul instantané des frais de notaire conforme au tarif réglementé',
      status: 'Disponible',
      features: ['Barème dégressif automatique', 'Droits de mutation inclus', 'Export PDF professionnel', 'OCR intégré (scan docs)'],
      link: '/pretaxe',
      category: 'Immobilier'
    },
    {
      title: 'Plus-Value Immobilière',
      icon: TrendingUp,
      description: 'Simulation fiscale et optimisation des plus-values immobilières',
      status: 'Disponible',
      features: ['Abattements pour durée', 'Optimisation travaux', 'Simulations comparatives', 'Cas particuliers inclus'],
      link: '/plusvalue',
      category: 'Immobilier'
    },
    {
      title: 'Simulateur Viager',
      icon: HeartHandshake,
      description: 'Scénarios viager occupé/libre et fiscalité de la rente',
      status: 'Disponible',
      features: ['Bouquet et rente', 'Horizon choisi', 'Viager occupé/libre', 'Coefficient professionnel'],
      link: '/viager',
      category: 'Immobilier'
    },
    {
      title: 'Investissement Locatif',
      icon: BarChart3,
      description: 'Rentabilité, cash flow et comparaison des dispositifs fiscaux',
      status: 'Disponible',
      features: ['Rendement brut / net / net-net', 'Dispositifs Pinel, Denormandie', 'Projection sur 30 ans', 'Cash flow mensuel'],
      link: '/investissement-locatif',
      isNew: true,
      category: 'Immobilier'
    },
    {
      title: 'Prêt Immobilier',
      icon: Landmark,
      description: 'Simulateur de prêt avec tableau d\'amortissement complet',
      status: 'Disponible',
      features: ['Tableau d\'amortissement', 'Assurance emprunteur', 'Échéancier CSV', 'Coût total du crédit'],
      link: '/pret',
      category: 'Immobilier'
    },
    // Fiscalité
    {
      title: 'Revenus Fonciers',
      icon: Home,
      description: 'Comparaison micro-foncier vs régime réel avec déficit foncier',
      status: 'Disponible',
      features: ['Micro-foncier vs réel', 'Déficit foncier calculé', 'Projection sur 10 ans', 'Optimisation fiscale'],
      link: '/revenus-fonciers',
      isNew: true,
      category: 'Fiscalité'
    },
    {
      title: 'LMNP / LMP',
      icon: Hotel,
      description: 'Statut LMNP ou LMP, micro-BIC vs réel avec amortissement',
      status: 'Disponible',
      features: ['Détection statut auto', 'Dotation indicative', 'Micro-BIC vs réel', 'Plus-value à la revente'],
      link: '/lmnp',
      isNew: true,
      category: 'Fiscalité'
    },
    {
      title: 'Calcul IFI',
      icon: Scale,
      description: 'Calcul de l\'Impôt sur la Fortune Immobilière avec optimisations',
      status: 'Disponible',
      features: ['Patrimoine taxable', 'Abattement résidence principale', 'Passifs déductibles', 'Plafonnement IFI'],
      link: '/ifi',
      category: 'Fiscalité'
    },
    {
      title: 'Plus-Value Professionnelle',
      icon: Award,
      description: 'Plus-values pro avec exonérations (151 septies, départ retraite...)',
      status: 'Disponible',
      features: ['PV court terme / long terme', 'Conditions à confirmer', 'Art. 151 septies / 238 quindecies', 'Départ retraite'],
      link: '/plusvalue-pro',
      isNew: true,
      category: 'Fiscalité'
    },
    // Patrimoine
    {
      title: 'Simulateur SCI',
      icon: Building,
      description: 'Comparaison SCI à l\'IR vs à l\'IS avec optimisation fiscale',
      status: 'Disponible',
      features: ['IR vs IS détaillé', 'Fiscalité dividendes', 'Transmission familiale', 'Optimisation capital/CC'],
      link: '/sci',
      category: 'Patrimoine'
    },
    {
      title: 'Donation',
      icon: Gift,
      description: 'Calcul des droits selon lien de parenté avec optimisations',
      status: 'Disponible',
      features: ['Droits par parenté', 'Démembrement optimisé', 'Réserve d\'usufruit', 'Pacte Dutreil'],
      link: '/donation',
      category: 'Patrimoine'
    },
    {
      title: 'Holding Patrimoniale',
      icon: Briefcase,
      description: 'Détention directe vs holding IS : fiscalité et transmission comparées',
      status: 'Disponible',
      features: ['Directe vs Holding', 'Régime mère-fille', 'Transmission de parts', 'Projection long terme'],
      link: '/holding',
      isNew: true,
      category: 'Patrimoine'
    },
    {
      title: 'Assurance-Vie',
      icon: Shield,
      description: 'Fiscalité des rachats et succession : optimisez votre contrat',
      status: 'Disponible',
      features: ['Fiscalité rachat', 'Succession art. 990 I / 757 B', 'PFU vs barème IR', 'Projection capitalisation'],
      link: '/assurance-vie',
      isNew: true,
      category: 'Patrimoine'
    },
    // Entreprise
    {
      title: 'Statut Juridique',
      icon: Briefcase,
      description: 'Comparez EI, SARL, SAS, SASU : charges, impôts, net disponible',
      status: 'Disponible',
      features: ['Tous les statuts comparés', 'Charges sociales détaillées', 'Mix rémunération/dividendes', 'Recommandation auto'],
      link: '/statut-juridique',
      isNew: true,
      category: 'Entreprise'
    },
    {
      title: 'Simulateur Retraite',
      icon: PiggyBank,
      description: 'Estimation de votre pension selon votre carrière et votre régime',
      status: 'Disponible',
      features: ['Pension de base + complémentaire', 'Décote / surcote', 'Scénarios de départ', 'Données du relevé'],
      link: '/retraite',
      isNew: true,
      category: 'Entreprise'
    }
  ];

  const filteredSolutions = activeCategory === 'Tous'
    ? allSolutions
    : allSolutions.filter(s => s.category === activeCategory);

  const [, setHoveredCard] = useState<number | null>(null);
  const handleCardHover = useCallback((index: number | null) => {
    setHoveredCard(index);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-60" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000" />

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid items-center gap-12 grid-cols-1 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-full mb-8">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-700">19 calculateurs professionnels</span>
                </div>

                <h1 className="font-bold mb-6 leading-tight text-4xl md:text-6xl">
                  <span className="text-gray-900">Tous vos calculs</span>
                  <br />
                  <span className="text-gray-900">notariaux en </span>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    quelques clics
                  </span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Suite complète d&apos;outils pour les professionnels du notariat et du patrimoine.
                  Prétaxe, plus-value, SCI, LMNP, holding, retraite et bien plus.
                  Gratuit, rapide et confidentiel.
                </p>

                <div className="flex gap-4 mb-8 flex-col md:flex-row">
                  <a
                    href="#solutions"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    Essayer maintenant
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="/prestations"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl font-semibold transition-all"
                  >
                    Nos prestations
                  </a>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Sans inscription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">100% Gratuit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Open Source</span>
                  </div>
                </div>
              </div>

              {/* Illustration */}
              <div className="relative hidden lg:block">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 opacity-30 blur-3xl rounded-3xl" />

                  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 p-8 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calculateur Pro</div>
                          <div className="text-sm font-bold text-gray-900">Frais de notaire</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-sm" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-sm animate-pulse" />
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Montant de la transaction
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                        <div className="relative h-16 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl flex items-center px-6 shadow-sm hover:border-indigo-300 transition-all">
                          <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">250 000 €</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10 rounded-2xl" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-full blur-3xl opacity-30" />

                      <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 animate-pulse" />
                              Résultat instantané
                            </div>
                            <div className="text-sm text-gray-600">Frais de notaire totaux</div>
                          </div>
                          <div className="px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-xs font-semibold text-green-700">Règles 2026</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                          18 742,32 €
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span>Calcul vérifié - Export PDF disponible</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-indigo-200">
                          <div className="flex justify-between text-xs text-gray-600 mb-2">
                            <span>Détail du calcul</span>
                            <span className="font-semibold">4 tranches</span>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div className="flex-1 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full" style={{width: '25%'}} />
                            <div className="flex-1 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" style={{width: '20%'}} />
                            <div className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full" style={{width: '30%'}} />
                            <div className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{width: '25%'}} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-xl p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <div>
                        <div className="text-sm font-bold">Calcul local</div>
                        <div className="text-xs opacity-90">Ultra-rapide</div>
                      </div>
                    </div>
                  </div>

                  <style jsx>{`
                    @keyframes float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-10px); }
                    }
                    .animate-float {
                      animation: float 3s ease-in-out infinite;
                    }
                  `}</style>
                </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-16 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <StatsCard key={index} stat={stat} />
              ))}
            </div>
          </div>
        </section>

        {/* Illustration des usages professionnels */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid items-center gap-12 grid-cols-1 lg:grid-cols-2">
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-gray-100 to-gray-50">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src="/images/utilisatrice-bureau-pixabay.jpg"
                      alt="Une femme examine des documents à son bureau, un stylo à la main"
                      fill
                      sizes="(min-width: 1280px) 592px, (min-width: 1024px) calc(50vw - 48px), calc(100vw - 48px)"
                      quality={75}
                      className="object-cover object-left"
                    />
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]" />
                  </div>

                  <div className="absolute top-6 left-6 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl" />
                  <div className="absolute bottom-6 right-6 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />
                </div>

                <p className="mt-3 text-right text-xs text-gray-500">Photo d’illustration · <a href="https://pixabay.com/photos/woman-women-office-work-business-2773007/" className="underline hover:text-gray-700">ernestoeslava / Pixabay</a></p>
                <div className="absolute bottom-6 -left-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1">Outils disponibles</div>
                  <div className="text-4xl font-black">19</div>
                  <div className="text-xs mt-1 opacity-90">calculateurs pro</div>
                </div>
              </div>

              <div>
                <h2 className="font-bold mb-6 text-gray-900 text-3xl md:text-4xl">
                  Votre expertise mérite mieux qu&apos;une calculette
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Les professionnels du notariat et du patrimoine utilisent NotariaPrime pour automatiser
                  leurs calculs répétitifs et se concentrer sur ce qui compte vraiment :
                  leurs clients.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Gagnez du temps</h3>
                      <p className="text-gray-600">Comparez vos hypothèses et conservez le détail du calcul</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Calculs expliqués</h3>
                      <p className="text-gray-600">Sources fiscales datées, exemples et limites de calcul</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Suite complète</h3>
                      <p className="text-gray-600">19 calculateurs couvrant l&apos;immobilier, la fiscalité, le patrimoine et l&apos;entreprise</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12"><div className="rounded-2xl bg-indigo-50 p-6 md:p-10"><h2 className="text-2xl font-bold">Préparer votre opération, comprendre votre calcul</h2><p className="mt-3 max-w-3xl">Achat, donation, succession ou investissement : partez d’un exemple chiffré, rassemblez les pièces et retrouvez le calculateur adapté.</p><Link href="/guides" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-5 py-3 text-white">Découvrir les 12 guides pratiques</Link></div></section>
        {/* Solutions Grid - 19 outils avec filtre par catégorie */}
        <section id="solutions" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full mb-4">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">19 outils disponibles</span>
              </div>
              <h2 className="font-bold mb-4 text-gray-900 text-3xl md:text-5xl">
                Des outils puissants pour votre quotidien
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Immobilier, fiscalité, patrimoine, entreprise : une suite complète de calculateurs
                gratuits, avec leurs hypothèses et références fiscales.
              </p>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`min-h-11 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                  {cat !== 'Tous' && (
                    <span className="ml-1.5 text-xs">
                      ({allSolutions.filter(s => s.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredSolutions.map((solution, index) => (
                <SolutionCard key={index} solution={solution} index={index} onHover={handleCardHover} />
              ))}
            </div>
          </div>
        </section>

        {/* Historique partagé avec la roadmap */}
        <section aria-labelledby="dernieres-ameliorations" className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Déjà en ligne</span>
              </div>
              <h2 id="dernieres-ameliorations" className="scroll-mt-28 font-bold mb-4 text-gray-900 text-2xl md:text-3xl">Dernières améliorations</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Découvrez les changements apportés aux outils, avec leur date de publication et leur périmètre.</p>
            </div>
            <div className="grid gap-6 max-w-4xl mx-auto grid-cols-1 md:grid-cols-2">
              {releases.slice(0, 2).map(release=>(
                <article key={release.id} className="flex flex-col bg-white rounded-2xl border border-gray-200 p-6">
                  <time dateTime={release.date} className="text-sm font-medium text-indigo-600">{release.dateLabel}</time>
                  <h3 className="mt-3 text-lg font-bold text-gray-900">{release.title}</h3>
                  <p className="mt-3 mb-5 text-sm leading-relaxed text-gray-600">{release.summary}</p>
                  <Link href={`/roadmap#${release.id}`} className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline">Lire les améliorations <ArrowRight className="w-4 h-4" /></Link>
                </article>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/roadmap" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">Voir l’historique et les pistes d’évolution <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-bold mb-4 text-gray-900 text-3xl md:text-5xl">
                Une technologie de pointe
              </h2>
              <p className="text-xl text-gray-600">
                Infrastructure de qualité pour les professionnels exigeants
              </p>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-bold mb-4 text-gray-900 text-3xl md:text-5xl">
                Rejoignez la communauté
              </h2>
              <p className="text-xl text-gray-600">
                Un projet open source développé par et pour les professionnels du notariat
              </p>
            </div>

            <div className="grid gap-8 mb-16 grid-cols-1 lg:grid-cols-3">
              {[
                { icon: Calculator, value: '19', label: 'Calculateurs disponibles', color: 'from-indigo-50 to-indigo-100' },
                { icon: Users, value: '12', label: 'Guides pratiques', color: 'from-green-50 to-green-100' },
                { icon: Star, value: '100%', label: 'Gratuit & Open Source', color: 'from-yellow-50 to-yellow-100' }
              ].map((item, i) => (
                <div key={i} className={`bg-gradient-to-br ${item.color} rounded-2xl p-8 text-center hover:scale-105 transition-transform`}>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <item.icon className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900">{item.value}</h3>
                  <p className="text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Call to Action Community */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">
                Contribuez au projet !
              </h3>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                NotariaPrime est un projet communautaire. Proposez des fonctionnalités,
                signalez des bugs, ou contribuez au code sur GitHub.
              </p>
              <div className="flex gap-4 justify-center flex-col md:flex-row">
                <a href="https://github.com/Interne52105110/notariaprime" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Voir sur GitHub
                </a>
                <a href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all">
                  Proposer une idée
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section final */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-bold mb-6 text-white text-3xl md:text-5xl">
              Simplifiez vos calculs notariaux dès maintenant
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              19 calculateurs professionnels à votre disposition.
              <br />100% gratuit, sans inscription, open source.
            </p>

            <div className="flex gap-4 justify-center mb-10 flex-col md:flex-row">
              <a href="/pretaxe" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                Calculer maintenant
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="https://github.com/Interne52105110/notariaprime" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-xl font-semibold transition-all">
                Explorer le code source
              </a>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Sans inscription
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                100% Gratuit
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Code source libre
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default function NotariaPrimeHomepage() {
  return <HomepageContent />;
}
