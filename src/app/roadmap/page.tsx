"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  CheckCircle, Clock, Rocket, Sparkles, Target,
  Calendar, TrendingUp, Zap, Brain, FileText, 
  Building2, Users, Globe, Shield
} from 'lucide-react';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  quarter: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

function RoadmapContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const roadmapItems: RoadmapItem[] = [
    {
      id: '1',
      title: 'Calculateur de Prétaxe Notariale',
      description: 'Calcul instantané des frais de notaire conforme au tarif réglementé 2025',
      status: 'completed',
      quarter: 'T1 2025',
      icon: CheckCircle,
      features: [
        'Barème dégressif automatique',
        'Droits de mutation inclus',
        'Export PDF professionnel',
        'Tous types d\'actes supportés'
      ]
    },
    {
      id: '2',
      title: 'Calculateur de Plus-Value Immobilière',
      description: 'Simulation fiscale et optimisation des plus-values immobilières',
      status: 'completed',
      quarter: 'T2 2025',
      icon: TrendingUp,
      features: [
        'Abattements pour durée de détention',
        'Optimisation par les travaux',
        'Simulations comparatives',
        'Cas particuliers (résidence principale, etc.)'
      ]
    },
    {
      id: '3',
      title: 'Scanner OCR Pro',
      description: 'Extraction automatique de données depuis vos documents notariés',
      status: 'in-progress',
      quarter: 'T4 2025',
      icon: FileText,
      features: [
        'Reconnaissance IA des actes de vente',
        'Extraction des factures de travaux',
        'Import instantané dans les calculateurs',
        'Précision 98,5% sur documents standards'
      ]
    },
    {
      id: '4',
      title: 'Expertise IA',
      description: 'Estimation immobilière basée sur l\'IA et les données DVF',
      status: 'in-progress',
      quarter: 'T4 2025',
      icon: Building2,
      features: [
        'Analyse de 15M+ transactions DVF',
        'Comparables géolocalisés',
        'Pondération temporelle et qualitative',
        'Rapport d\'expertise détaillé'
      ]
    },
    {
      id: '5',
      title: 'API Publique',
      description: 'API REST pour intégrer NotariaPrime dans vos outils',
      status: 'planned',
      quarter: 'T1 2026',
      icon: Zap,
      features: [
        'Endpoints pour tous les calculateurs',
        'Documentation OpenAPI',
        'Rate limiting généreux',
        'Authentification par clé API'
      ]
    },
    {
      id: '6',
      title: 'Mode Hors-ligne (PWA)',
      description: 'Application web progressive fonctionnant sans connexion',
      status: 'planned',
      quarter: 'T1 2026',
      icon: Globe,
      features: [
        'Installation sur appareil',
        'Calculs 100% locaux',
        'Synchronisation optionnelle',
        'Notifications push'
      ]
    },
    {
      id: '7',
      title: 'Espace Professionnel',
      description: 'Fonctionnalités avancées pour les études notariales',
      status: 'planned',
      quarter: 'T2 2026',
      icon: Users,
      features: [
        'Gestion multi-utilisateurs',
        'Historique des calculs illimité',
        'Templates personnalisés',
        'Tableau de bord analytique'
      ]
    },
    {
      id: '8',
      title: 'Assistant IA Conversationnel',
      description: 'Chat IA pour répondre à vos questions juridiques',
      status: 'planned',
      quarter: 'T2 2026',
      icon: Brain,
      features: [
        'Réponses basées sur le Code civil',
        'Suggestions de calculs',
        'Explication des résultats',
        'Veille réglementaire automatique'
      ]
    }
  ];

  const filteredItems = selectedStatus === 'all' 
    ? roadmapItems 
    : roadmapItems.filter(item => item.status === selectedStatus);

  const getStatusConfig = (status: string) => {
    const configs = {
      'completed': {
        label: 'Disponible',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      'in-progress': {
        label: 'En développement',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        iconColor: 'text-yellow-600'
      },
      'planned': {
        label: 'Prévu',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Rocket,
        iconColor: 'text-blue-600'
      }
    };
    return configs[status as keyof typeof configs];
  };

  const stats = [
    { label: 'Disponibles', value: roadmapItems.filter(i => i.status === 'completed').length, color: 'text-green-600' },
    { label: 'En cours', value: roadmapItems.filter(i => i.status === 'in-progress').length, color: 'text-yellow-600' },
    { label: 'À venir', value: roadmapItems.filter(i => i.status === 'planned').length, color: 'text-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Roadmap</h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl">
            Découvrez les fonctionnalités disponibles, en cours de développement et prévues pour NotariaPrime. 
            Votre feedback guide notre feuille de route.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-8 border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Filtrer par statut :</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tout voir' },
                { value: 'completed', label: 'Disponibles' },
                { value: 'in-progress', label: 'En cours' },
                { value: 'planned', label: 'Prévus' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedStatus === filter.value
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-8">
            {filteredItems.map((item, index) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;
              const ItemIcon = item.icon;

              return (
                <div key={item.id} className="relative">
                  {/* Timeline line */}
                  {index !== filteredItems.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="relative flex gap-6">
                    {/* Icon timeline */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.status === 'completed' ? 'bg-green-100' :
                        item.status === 'in-progress' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <ItemIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl hover:border-indigo-300 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusConfig.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0 ml-4">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{item.quarter}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid md:grid-cols-2 gap-3 mt-6">
                          {item.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Contribution */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Proposez vos idées !
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            NotariaPrime est un projet communautaire. Votre feedback influence directement notre roadmap.
            <br />Proposez des fonctionnalités, signalez des bugs ou contribuez au code.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="https://github.com/Interne52105110/notariaprime/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Rocket className="w-5 h-5" />
              Proposer une fonctionnalité
            </a>
            <a 
              href="https://github.com/Interne52105110/notariaprime"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-xl font-semibold transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Contribuer sur GitHub
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              <span>Communautaire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>100% Gratuit</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <MainLayout>
      <RoadmapContent />
    </MainLayout>
  );
}