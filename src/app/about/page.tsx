"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Building2, Heart, Target, Users, Zap, Shield,
  Code, TrendingUp, Award, MapPin, Mail, ExternalLink,
  Github, Sparkles, CheckCircle
} from 'lucide-react';

function AboutContent() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const values = [
    {
      icon: Heart,
      title: 'Open Source',
      description: 'Notre code est public et auditable. Nous croyons en la transparence et la collaboration communautaire.',
      color: 'from-red-50 to-pink-50'
    },
    {
      icon: Shield,
      title: 'Gratuit pour tous',
      description: 'Pas d\'abonnement, pas de version premium. NotariaPrime est et restera 100% gratuit.',
      color: 'from-green-50 to-emerald-50'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Nous intégrons les dernières technologies (IA, OCR) pour simplifier votre quotidien professionnel.',
      color: 'from-yellow-50 to-amber-50'
    },
    {
      icon: Users,
      title: 'Communautaire',
      description: 'Développé avec et pour les professionnels. Votre feedback guide notre roadmap.',
      color: 'from-blue-50 to-indigo-50'
    }
  ];

  const stats = [
    { value: '15+', label: 'Utilisateurs actifs', icon: Users },
    { value: '500+', label: 'Calculs par mois', icon: TrendingUp },
    { value: '100%', label: 'Gratuit', icon: Award },
    { value: '2025', label: 'Conforme', icon: CheckCircle }
  ];

  const tech = [
    'Next.js 15', 'React 18', 'TypeScript', 'Tailwind CSS',
    'Vercel', 'Open Source', 'MIT License', 'PWA Ready'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Projet open source</span>
            </div>

            <h1 className="text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">À propos de</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NotariaPrime
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La plateforme open source qui révolutionne le calcul des frais notariés.
              Créée par des passionnés, pour les professionnels.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-8 ${isDesktop ? 'grid-cols-4' : 'grid-cols-2'}`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-6 h-6 text-indigo-600" />
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-16 items-center ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 border border-indigo-200 rounded-full mb-6">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">Notre mission</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Simplifier le quotidien des professionnels
              </h2>
              
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  NotariaPrime est né d'un constat simple : les professionnels du notariat perdent 
                  un temps précieux sur des calculs répétitifs et complexes.
                </p>
                <p>
                  Notre mission est de créer des outils <strong>gratuits, précis et faciles d'utilisation</strong> pour 
                  automatiser ces tâches et permettre aux notaires de se concentrer sur leur cœur de métier.
                </p>
                <p>
                  En tant que projet <strong>open source</strong>, nous garantissons la transparence de nos calculs 
                  et permettons à la communauté de contribuer à l'amélioration continue de la plateforme.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-12 border-2 border-indigo-200">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Rapidité</h3>
                    <p className="text-gray-700 text-sm">Résultats en moins de 100ms pour tous les calculs</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Précision</h3>
                    <p className="text-gray-700 text-sm">Conforme aux tarifs réglementés 2025</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Confidentialité</h3>
                    <p className="text-gray-700 text-sm">Vos données restent privées, calculs locaux</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos valeurs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident le développement de NotariaPrime
            </p>
          </div>

          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-4' : 'grid-cols-1'}`}>
            {values.map((value, index) => (
              <div key={index} className={`bg-gradient-to-br ${value.color} rounded-2xl p-8 border-2 border-gray-200 hover:scale-105 transition-transform`}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <value.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entreprise */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-16 items-start ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-full mb-6">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">L'entreprise</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">NOTARIA PRIME</h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Forme juridique</div>
                      <div className="font-semibold text-gray-900">SAS</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Capital social</div>
                      <div className="font-semibold text-gray-900">500,00 €</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">SIREN</div>
                      <div className="font-semibold text-gray-900">941 646 341</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Code NAF</div>
                      <div className="font-semibold text-gray-900">68.31Z</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Siège social</div>
                      <div className="text-gray-700">
                        1 Impasse de Menez Bijigou<br />
                        29120 Pont-l'Abbé<br />
                        France
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Contact</div>
                      <a href="mailto:contact@notariaprime.fr" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        contact@notariaprime.fr
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Github className="w-5 h-5" />
                    <div className="font-semibold">Code source</div>
                  </div>
                  <a 
                    href="https://github.com/Interne52105110/notariaprime" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-300 hover:text-white flex items-center gap-2 group"
                  >
                    github.com/Interne52105110/notariaprime
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 border border-purple-200 rounded-full mb-6">
                <Code className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">Stack technique</span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">Technologies</h2>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  NotariaPrime est construit avec des technologies modernes et éprouvées pour garantir 
                  performance, sécurité et maintenabilité.
                </p>

                <div className="flex flex-wrap gap-2">
                  {tech.map((t, i) => (
                    <span key={i} className="px-4 py-2 bg-white border-2 border-purple-200 rounded-lg text-sm font-medium text-gray-700">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t-2 border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-4">Open Source</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Le projet est publié sous <strong>licence MIT</strong>, permettant une utilisation, 
                    modification et distribution libres.
                  </p>
                  <a 
                    href="https://github.com/Interne52105110/notariaprime/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    Voir la licence
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Rejoignez la communauté
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Contribuez au projet, proposez des fonctionnalités ou utilisez gratuitement nos outils
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="/pretaxe"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Essayer gratuitement
            </a>
            <a 
              href="https://github.com/Interne52105110/notariaprime"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-xl font-semibold transition-all"
            >
              <Github className="w-5 h-5" />
              Voir sur GitHub
            </a>
            <a 
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-xl font-semibold transition-all"
            >
              <Mail className="w-5 h-5" />
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AboutPage() {
  return (
    <MainLayout>
      <AboutContent />
    </MainLayout>
  );
}