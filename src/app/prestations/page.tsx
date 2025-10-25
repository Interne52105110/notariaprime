"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  ArrowRight, Briefcase, Home, Code, CheckCircle, 
  Award, Clock, TrendingUp, Users, Shield, Zap,
  FileCheck, Building2, Sparkles
} from 'lucide-react';

interface Prestation {
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  experience: string;
  highlights: string[];
  stats: {
    label: string;
    value: string;
  }[];
  link: string;
}

export default function PrestationsPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
      setIsMobile(window.innerWidth < 768);
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);

    return () => {
      window.removeEventListener('resize', updateDeviceType);
    };
  }, []);

  const prestations: Prestation[] = [
    {
      slug: 'comptabilite-notariale',
      icon: Briefcase,
      badge: 'Gestion & Comptabilité',
      title: 'Comptabilité Notariale',
      subtitle: '20+ ans d\'expérience',
      description: 'Accompagnement complet en gestion comptable et fiscale pour offices notariaux. Plus de 12 000 opérations gérées annuellement.',
      experience: '20 ans d\'expérience en étude notariale',
      highlights: [
        'Gestion quotidienne comptable (12 000+ opérations/an)',
        'Paie et déclarations fiscales & sociales',
        'Reporting financier mensuel et annuel',
        'Maîtrise FIDUCIAL, GENAPI, Odoo comptabilité',
        'Constitution et gestion dossiers clients',
        'Télétravail avec déplacements possibles'
      ],
      stats: [
        { label: 'Expérience', value: '20+ ans' },
        { label: 'Opérations/an', value: '12 000+' }
      ],
      link: '/prestations/comptabilite-notariale'
    },
    {
      slug: 'expertise-immobiliere',
      icon: Home,
      badge: 'Évaluation & Expertise',
      title: 'Expertise Immobilière',
      subtitle: 'Expert judiciaire Cour d\'Appel Rennes',
      description: 'Expert en évaluation immobilière avec 16 ans d\'expérience et plus de 1 500 expertises réalisées. Certifications TEGOVA reconnues.',
      experience: '16 ans | +1 500 expertises',
      highlights: [
        'Expert judiciaire près la Cour d\'Appel de Rennes',
        'Certifications TEGOVA (REV, Hyporev, MRICS)',
        'Évaluation garanties bancaires',
        'Rapports conformes normes EVS 2025 et CRR',
        'Délai standard 10 jours (express 5 jours)',
        'Interventions partout en France'
      ],
      stats: [
        { label: 'Expertises', value: '1 500+' },
        { label: 'Délai', value: '10 jours' }
      ],
      link: '/prestations/expertise-immobiliere'
    },
    {
      slug: 'developpement-informatique',
      icon: Code,
      badge: 'Digital & Innovation',
      title: 'Développement Informatique',
      subtitle: 'Solutions PropTech sur mesure',
      description: 'Développement de solutions digitales innovantes pour le secteur notarial et immobilier. Automatisation par IA et accompagnement digital.',
      experience: '400+ professionnels formés',
      highlights: [
        'Plateforme PropTech NotariaPrime (500+ utilisateurs/mois)',
        'Automatisation processus par IA (Claude AI, OpenAI)',
        'Développement calculateurs métiers personnalisés',
        'Formation SEO/SEA et transformation digitale',
        'Audit et optimisation sites web (UX/UI)',
        'Accompagnement et formation équipes'
      ],
      stats: [
        { label: 'Formés', value: '400+' },
        { label: 'Utilisateurs', value: '500+/mois' }
      ],
      link: '/prestations/developpement-informatique'
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-60" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000" />

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">Expertise professionnelle</span>
              </div>

              <h1 className={`font-bold mb-6 leading-tight text-gray-900 ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                Prestations sur mesure pour les{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  professionnels du notariat
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                Expertise, accompagnement et solutions digitales au service de votre activité. 
                Plus de 20 ans d'expérience cumulée dans le secteur notarial et immobilier.
              </p>

              <div className="flex items-center justify-center gap-6 text-sm mb-12">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">20+ ans d'expérience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Certifications reconnues</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Interventions France entière</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-16 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className={`grid gap-8 ${isDesktop ? 'grid-cols-4' : 'grid-cols-2'}`}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-900">20+</p>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    EXPERTISE
                  </span>
                </div>
                <p className="text-gray-600">Années d'expérience</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-900">1 500+</p>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                    +15%
                  </span>
                </div>
                <p className="text-gray-600">Expertises réalisées</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-900">400+</p>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    FORMÉS
                  </span>
                </div>
                <p className="text-gray-600">Professionnels formés</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-900">500+</p>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                    /MOIS
                  </span>
                </div>
                <p className="text-gray-600">Utilisateurs actifs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Prestations Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`font-bold mb-4 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                Une expertise complète à votre service
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Trois domaines d'excellence pour accompagner les études notariales dans leur gestion quotidienne et leur transformation digitale
              </p>
            </div>

            <div className={`grid gap-8 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {prestations.map((prestation, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => window.location.href = prestation.link}
                >
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <prestation.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full">
                      {prestation.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    {prestation.title}
                  </h3>
                  <p className="text-sm font-semibold text-indigo-600 mb-4">
                    {prestation.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {prestation.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                    {prestation.stats.map((stat, i) => (
                      <div key={i} className="flex-1">
                        <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {prestation.highlights.slice(0, 4).map((highlight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{highlight}</span>
                      </div>
                    ))}
                    {prestation.highlights.length > 4 && (
                      <div className="text-sm text-indigo-600 font-semibold mt-2">
                        +{prestation.highlights.length - 4} autres avantages
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className={`inline-flex items-center gap-2 text-indigo-600 font-semibold transition-all ${
                    hoveredCard === index ? 'gap-3' : 'gap-2'
                  }`}>
                    En savoir plus
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Hover Effect Border */}
                  {hoveredCard === index && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`font-bold mb-4 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                Pourquoi nous choisir ?
              </h2>
              <p className="text-xl text-gray-600">
                Des valeurs fortes au service de votre réussite
              </p>
            </div>

            <div className={`grid gap-6 ${isDesktop ? 'grid-cols-4' : isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {[
                {
                  icon: Award,
                  title: 'Expertise reconnue',
                  description: 'Certifications officielles et reconnaissance judiciaire',
                  metric: 'TEGOVA',
                  metricLabel: 'Certifié'
                },
                {
                  icon: Clock,
                  title: 'Réactivité',
                  description: 'Délais courts et interventions rapides partout en France',
                  metric: '10j',
                  metricLabel: 'Délai moyen'
                },
                {
                  icon: Shield,
                  title: 'Conformité',
                  description: 'Respect strict des normes et réglementations en vigueur',
                  metric: '100%',
                  metricLabel: 'Conforme'
                },
                {
                  icon: Users,
                  title: 'Accompagnement',
                  description: 'Formation et support personnalisé pour vos équipes',
                  metric: '400+',
                  metricLabel: 'Formés'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-indigo-300">
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
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className={`font-bold mb-6 text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Prêt à collaborer ?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Discutons de vos besoins et trouvons ensemble la solution adaptée à votre étude.
              <br />Devis personnalisé sur demande.
            </p>
            
            <div className={`flex gap-4 justify-center mb-10 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Prendre contact
                <ArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="/" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-xl font-semibold transition-all"
              >
                Retour à l'accueil
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Interventions France entière
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Devis personnalisé
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Télétravail possible
              </div>
            </div>
          </div>
        </section>

        {/* Note TVA */}
        <section className="py-8 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm text-gray-500">
              Conformément à l'article 293 B du Code Général des Impôts, notre activité n'est pas soumise à la TVA. 
              Les tarifs affichés sont donc les prix définitifs que vous payez.
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}