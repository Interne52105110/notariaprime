"use client";

import React, { useState, useEffect, memo, useCallback } from 'react';
import { 
  Calculator, TrendingUp, ArrowRight, Sparkles, Shield, Zap,
  CheckCircle, Users, Award, Lock, Globe,
  Menu, X, Play, 
  FileCheck, Clock, Star, Building2, 
  Rocket, Brain, Cpu
} from 'lucide-react';

// Types pour les composants
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
}

interface NewFeature {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: string;
}

// Composants mémorisés pour optimiser les performances
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
  
  return (
    <div 
      className={`relative bg-white rounded-xl border p-8 transition-all duration-300 ${
        isAvailable 
          ? 'border-gray-200 hover:shadow-xl hover:border-indigo-300 cursor-pointer hover:-translate-y-1' 
          : 'border-gray-100 opacity-75 bg-gray-50'
      }`}
      onMouseEnter={() => isAvailable && onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {solution.status === 'En développement' && (
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          Bientôt
        </div>
      )}
      
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
        <a href={solution.link} className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
          Utiliser l&apos;outil
          <ArrowRight className="w-4 h-4" />
        </a>
      ) : (
        <span className="text-gray-500 text-sm">En développement</span>
      )}
    </div>
  );
});

SolutionCard.displayName = 'SolutionCard';

export default function NotariaPrimeHomepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Gestion responsive optimisée
  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => setScrolled(window.scrollY > 20);

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', updateDeviceType);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const stats: Stat[] = [
    { value: '15+', label: 'Utilisateurs actifs', trend: '+23%' },
    { value: '500+', label: 'Calculs par mois', trend: '+18%' },
    { value: '100%', label: 'Gratuit et open source', trend: 'TOUJOURS' },
    { value: '2025', label: 'Tarifs à jour', trend: 'OFFICIEL' }
  ];

  const features: Feature[] = [
    {
      icon: Zap,
      title: 'Ultra rapide',
      description: 'Résultats instantanés grâce à notre moteur optimisé',
      metric: '< 100ms',
      metricLabel: 'Temps de calcul'
    },
    {
      icon: Brain,
      title: 'IA Assistée',
      description: 'Suggestions intelligentes et détection d&apos;erreurs',
      metric: '99.9%',
      metricLabel: 'Précision'
    },
    {
      icon: Shield,
      title: 'Open Source',
      description: 'Code transparent, auditable par tous',
      metric: 'MIT',
      metricLabel: 'Licence'
    },
    {
      icon: Cpu,
      title: 'Hors ligne',
      description: 'Fonctionne sans connexion internet',
      metric: '100%',
      metricLabel: 'Disponibilité'
    }
  ];

  const solutions: Solution[] = [
    {
      title: 'Prétaxe Notariale',
      icon: Calculator,
      description: 'Calcul instantané des frais notariés',
      status: 'Disponible',
      features: ['Conforme tarif 2024', 'Émoluments détaillés', 'Export PDF professionnel'],
      link: '/pretaxe'
    },
    {
      title: 'Plus-Value Immobilière',
      icon: TrendingUp,
      description: 'Optimisation fiscale automatique',
      status: 'Disponible',
      features: ['Abattements calculés', 'Toutes exonérations', 'Cerfa auto-généré'],
      link: '/plusvalue'
    },
    {
      title: 'Scanner OCR Pro',
      icon: FileCheck,
      description: 'Extraction intelligente de données',
      status: 'En développement',
      features: ['Reconnaissance IA', 'Import instantané', '99% de précision'],
      link: '#'
    },
    {
      title: 'Expertise IA',
      icon: Building2,
      description: 'Estimation par comparables',
      status: 'En développement',
      features: ['Base DVF nationale', 'Machine Learning', 'Rapport détaillé'],
      link: '#'
    }
  ];

  const newFeatures: NewFeature[] = [
    { icon: Rocket, label: 'API Publique', status: 'new' },
    { icon: Globe, label: 'Mode Hors-ligne', status: 'new' },
    { icon: Users, label: 'Espace Pro', status: 'soon' },
    { icon: Brain, label: 'Assistant IA', status: 'soon' }
  ];

  const handleCardHover = useCallback((index: number | null) => {
    // Handle card hover logic
    console.log('Card hovered:', index);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation optimisée */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo avec animation */}
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">NotariaPrime</span>
                  <span className="block text-xs text-gray-500 -mt-1">Plateforme Open Source</span>
                </div>
              </div>

              {/* Menu desktop */}
              {isDesktop && (
                <nav className="flex items-center gap-8">
                  <a href="#solutions" className="text-gray-600 hover:text-gray-900 font-medium transition">Solutions</a>
                  <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition">Fonctionnalités</a>
                  <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition">Tarifs</a>
                  <a href="#enterprise" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition">
                    Enterprise
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">NEW</span>
                  </a>
                </nav>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {!isMobile && (
                <>
                  <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition">
                    Connexion
                  </a>
                  <a href="/demo" className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    Demander une démo
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </>
              )}
              {!isDesktop && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu avec animation */}
      {mobileMenuOpen && !isDesktop && (
        <div className="fixed inset-0 z-40 bg-white pt-20">
          <nav className="flex flex-col p-6 space-y-4">
            <a href="#solutions" className="text-lg font-medium text-gray-900 py-2">Solutions</a>
            <a href="#features" className="text-lg font-medium text-gray-900 py-2">Fonctionnalités</a>
            <a href="#pricing" className="text-lg font-medium text-gray-900 py-2">Tarifs</a>
            <a href="#enterprise" className="text-lg font-medium text-gray-900 py-2">Enterprise</a>
            <hr className="my-4" />
            <a href="/login" className="text-lg font-medium text-gray-900 py-2">Connexion</a>
            <a href="/demo" className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl font-medium">
              Demander une démo
              <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}

      {/* Hero Section amélioré */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50" />
        
        {/* Blobs animés */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className={`grid gap-16 items-center ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              {/* Badge amélioré */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <span className="text-sm font-semibold text-indigo-700">
                  Tarif réglementé 2024 intégré
                </span>
              </div>

              {/* Titre optimisé */}
              <h1 className={`font-bold mb-6 leading-tight ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                <span className="text-gray-900">Automatisez vos</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  calculs notariaux
                </span>
                <br />
                <span className="text-gray-900">en 15 secondes</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                La plateforme open source qui révolutionne le calcul des frais notariés. 
                100% gratuit, précis et conforme.
              </p>

              {/* Nouveaux badges de features */}
              <div className="flex flex-wrap gap-3 mb-8">
                {newFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                    <feature.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                    {feature.status === 'new' && (
                      <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">NEW</span>
                    )}
                    {feature.status === 'soon' && (
                      <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded">SOON</span>
                    )}
                  </div>
                ))}
              </div>

              {/* CTAs améliorés */}
              <div className={`flex gap-4 mb-12 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <a href="/pretaxe" className="flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5" />
                </a>
                <button className="flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl font-semibold transition-all">
                  <Play className="w-5 h-5" />
                  Voir la démo (2 min)
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Open Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Communautaire</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview amélioré */}
            {isDesktop && (
              <div className="relative">
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
                  {/* Window controls */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs text-gray-400">notariaprime.fr/dashboard</span>
                  </div>
                  
                  {/* Dashboard content */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-sm">Calcul en cours</span>
                      <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Vente immobilière</span>
                        <span className="text-3xl font-bold text-white">450,000 €</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '75%' }} />
                      </div>
                      
                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Émoluments</p>
                          <p className="text-white font-bold">3,894 €</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Taxes</p>
                          <p className="text-white font-bold">24,750 €</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Total TTC</p>
                          <p className="text-green-400 font-bold">31,244 €</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini chart */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Calculs/mois</span>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">1,247</p>
                      <p className="text-xs text-green-400">+23% ce mois</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Temps gagné</span>
                        <Clock className="w-4 h-4 text-indigo-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">42h</p>
                      <p className="text-xs text-indigo-400">Cette semaine</p>
                    </div>
                  </div>
                </div>

                {/* Floating notifications */}
                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Calcul terminé</p>
                      <p className="font-semibold text-gray-900">À l&apos;instant</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">&quot;Interface exceptionnelle&quot;</p>
                  <p className="text-xs font-medium text-gray-900">- Marie D., Notaire</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar amélioré */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-8 ${isDesktop ? 'grid-cols-4' : 'grid-cols-2'}`}>
            {stats.map((stat, index) => (
              <StatsCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid optimisé */}
      <section id="solutions" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Nos outils</span>
            </div>
            <h2 className={`font-bold mb-4 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              4 outils puissants pour votre quotidien
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des solutions concrètes pour gagner du temps sur vos tâches récurrentes
            </p>
          </div>

          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-4' : isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {solutions.map((solution, index) => (
              <SolutionCard key={index} solution={solution} index={index} onHover={handleCardHover} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section optimisé */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`font-bold mb-4 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Une technologie de pointe
            </h2>
            <p className="text-xl text-gray-600">
              Infrastructure enterprise-grade pour les professionnels exigeants
            </p>
          </div>

          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-4' : isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Section amélioré */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`font-bold mb-4 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Rejoignez la communauté
            </h2>
            <p className="text-xl text-gray-600">
              Un projet open source développé par et pour les professionnels du notariat
            </p>
          </div>

          <div className={`grid gap-8 mb-16 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {[
              { icon: Users, value: '15+', label: 'Utilisateurs actifs', color: 'from-indigo-50 to-indigo-100' },
              { icon: Calculator, value: '500+', label: 'Calculs par mois', color: 'from-green-50 to-green-100' },
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
            <div className={`flex gap-4 justify-center ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <a href="https://github.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Voir sur GitHub
              </a>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all">
                Proposer une idée
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section final optimisé */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`font-bold mb-6 text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
            Simplifiez vos calculs notariaux dès maintenant
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Rejoignez notre communauté grandissante d&apos;utilisateurs.
            <br />100% gratuit, sans inscription, open source.
          </p>
          
          <div className={`flex gap-4 justify-center mb-10 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <a href="/pretaxe" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              Calculer maintenant
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="https://github.com" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-xl font-semibold transition-all">
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

      {/* Footer optimisé */}
      <footer className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-8 mb-12 ${isDesktop ? 'grid-cols-5' : 'grid-cols-2'}`}>
            <div className={isDesktop ? 'col-span-2' : 'col-span-2'}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">NotariaPrime</span>
              </div>
              <p className="text-gray-600 mb-6">
                La plateforme open source pour digitaliser et automatiser vos calculs notariaux.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Produit</h4>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Tarifs</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Ressources</h4>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">API</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Entreprise</h4>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition">À propos</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900 transition">Partenaires</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200">
            <div className={`flex items-center gap-6 ${isMobile ? 'flex-col text-center' : 'justify-between'}`}>
              <p className="text-gray-600 text-sm">
                © 2025 NotariaPrime. Tous droits réservés. Projet open source sous licence MIT.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">Mentions légales</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">Confidentialité</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">CGU</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}