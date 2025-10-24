"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Calculator, TrendingUp, ArrowRight, Sparkles,
  CheckCircle, FileCheck, Building2, Zap,
  Shield, Brain, Target, Gift, Home, HeartHandshake,
  Briefcase, PiggyBank, Award, Building, Scale, Globe, Users, Rocket
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

  const availableTools = [
    {
      id: 'pretaxe',
      title: 'Calcul de prétaxe notariale',
      status: 'Disponible',
      icon: Calculator,
      gradient: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200',
      description: 'Le calculateur de frais de notaire le plus précis et rapide. Conforme au décret n°2016-230 et aux tarifs réglementés 2025. Application automatique du barème dégressif avec OCR intégré.',
      link: '/pretaxe',
      features: [
        {
          title: 'Calcul par tranches automatique',
          icon: Target,
          desc: 'Barème officiel : 3,870% jusqu\'à 6 500€ • 1,596% de 6 500€ à 17 000€ • 1,064% de 17 000€ à 60 000€ • 0,799% au-delà. Application instantanée sur votre montant.'
        },
        {
          title: 'Frais annexes inclus',
          icon: Calculator,
          desc: 'Intégration automatique : droits de mutation (5,80% en moyenne), contribution de sécurité immobilière (0,10%), émoluments de formalités, débours estimés. Tout est calculé.'
        },
        {
          title: 'Scanner OCR intégré',
          icon: FileCheck,
          desc: 'Scannez vos documents et extrayez automatiquement les données. Import instantané dans le calculateur pour un gain de temps maximal.'
        }
      ],
      supportedTypes: ['Vente immobilière', 'VEFA', 'Donation', 'Partage successoral', 'SCI', 'Bail emphytéotique'],
      example: {
        input: '250 000,00 €',
        outputs: [
          { label: 'Tranche 1 (0-6 500€) × 3,870%', value: '251,55 €' },
          { label: 'Tranche 2 (6 500-17 000€) × 1,596%', value: '167,58 €' },
          { label: 'Tranche 3 (17 000-60 000€) × 1,064%', value: '457,52 €' },
          { label: 'Tranche 4 (>60 000€) × 0,799%', value: '1 518,10 €' }
        ],
        total: '2 394,75 € HT'
      }
    },
    {
      id: 'plusvalue',
      title: 'Plus-Value Immobilière',
      status: 'Disponible',
      icon: TrendingUp,
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      description: 'Simulation complète des plus-values immobilières avec abattements pour durée de détention. Optimisation fiscale par l\'intégration des travaux. Conforme aux règles fiscales 2025.',
      link: '/plusvalue',
      features: [
        {
          title: 'Abattements automatiques',
          icon: Scale,
          desc: 'Calcul précis des abattements pour durée de détention : 6% par an de la 6e à la 21e année, puis 4% la 22e année pour l\'IR. Exonération totale après 22 ans pour l\'IR et 30 ans pour les prélèvements sociaux.'
        },
        {
          title: 'Optimisation travaux',
          icon: Building2,
          desc: 'Intégration des travaux d\'amélioration, d\'agrandissement et de construction. Forfait 15% si détention > 5 ans. Comparaison automatique forfait vs justificatifs pour optimisation maximale.'
        },
        {
          title: 'Cas particuliers',
          icon: CheckCircle,
          desc: 'Gestion résidence principale (exonération totale), première cession (exonération sous conditions), invalidité, retraite modeste. Tous les cas d\'exonération sont pris en compte.'
        }
      ],
      supportedTypes: ['Résidence principale', 'Résidence secondaire', 'Bien locatif', 'Terrain à bâtir'],
      example: {
        input: 'Achat 200 000€ • Vente 350 000€ • Détention 15 ans',
        outputs: [
          { label: 'Plus-value brute', value: '150 000 €' },
          { label: 'Abattement IR (15 ans)', value: '90 000 €' },
          { label: 'Plus-value nette IR', value: '60 000 €' },
          { label: 'Impôt sur le revenu (19%)', value: '11 400 €' }
        ],
        total: 'Imposition totale : 20 850 €'
      }
    },
    {
      id: 'sci',
      title: 'Simulateur SCI',
      status: 'Disponible',
      icon: Building,
      gradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      description: 'Comparaison SCI à l\'IR vs à l\'IS avec optimisation fiscale. Transmission familiale et répartition capital/compte courant optimisée.',
      link: '/sci',
      features: [
        {
          title: 'Comparaison IR vs IS',
          icon: Scale,
          desc: 'Analyse détaillée de la fiscalité selon le régime choisi. Calcul des dividendes, charges sociales et imposition globale pour vous aider à choisir le meilleur régime.'
        },
        {
          title: 'Transmission familiale',
          icon: Gift,
          desc: 'Simulation de transmission de parts sociales aux enfants. Calcul des droits de donation avec abattements et optimisation du démembrement de propriété.'
        },
        {
          title: 'Optimisation financière',
          icon: Calculator,
          desc: 'Répartition optimale entre capital et compte courant d\'associés. Simulation remontée de trésorerie et optimisation fiscale des distributions.'
        }
      ],
      supportedTypes: ['SCI à l\'IR', 'SCI à l\'IS', 'SCI familiale', 'SCI de location'],
      example: {
        input: 'Revenus locatifs 50 000€ • TMI 30%',
        outputs: [
          { label: 'IR : Imposition directe', value: '15 000 €' },
          { label: 'IS : Impôt société (25%)', value: '12 500 €' },
          { label: 'IS : Dividendes (30%)', value: '11 250 €' },
          { label: 'Différence annuelle', value: '3 750 €' }
        ],
        total: 'Économie potentielle : 3 750 €/an'
      }
    },
    {
      id: 'donation',
      title: 'Donation / Succession',
      status: 'Disponible',
      icon: Gift,
      gradient: 'from-rose-50 to-pink-50',
      borderColor: 'border-rose-200',
      description: 'Calcul des droits de donation selon lien de parenté avec optimisation fiscale. Démembrement, réserve d\'usufruit et Pacte Dutreil inclus.',
      link: '/donation',
      features: [
        {
          title: 'Droits selon parenté',
          icon: Users,
          desc: 'Calcul précis selon le lien de parenté : ligne directe (enfants, petits-enfants), conjoint, partenaire PACS, frères/sœurs, neveux/nièces. Abattements automatiques appliqués.'
        },
        {
          title: 'Démembrement optimisé',
          icon: Scale,
          desc: 'Simulation donation en nue-propriété avec réserve d\'usufruit. Calcul selon l\'âge du donateur pour optimisation fiscale maximale. Tables fiscales officielles.'
        },
        {
          title: 'Pacte Dutreil',
          icon: Award,
          desc: 'Exonération de 75% pour transmission d\'entreprise. Simulation des conditions d\'engagement collectif et individuel de conservation. Optimisation succession d\'entreprise.'
        }
      ],
      supportedTypes: ['Donation simple', 'Donation-partage', 'Don manuel', 'Donation avec réserve d\'usufruit'],
      example: {
        input: 'Donation 200 000€ à 2 enfants',
        outputs: [
          { label: 'Base taxable par enfant', value: '100 000 €' },
          { label: 'Abattement parent-enfant', value: '100 000 €' },
          { label: 'Base imposable', value: '0 €' },
          { label: 'Droits de donation', value: '0 €' }
        ],
        total: 'Optimisation : 0€ de droits'
      }
    }
  ];

  const upcomingTools = [
    {
      id: 'ifi',
      title: 'Calculateur IFI',
      quarter: 'T1 2026',
      icon: Home,
      category: 'Immobilier & Fiscalité',
      description: 'Calcul de l\'Impôt sur la Fortune Immobilière. Déductions dettes/travaux, optimisation démembrement, simulation par tranche.',
      features: [
        'Calcul patrimoine imposable',
        'Déductions dettes/travaux',
        'Optimisation démembrement',
        'Simulation par tranche'
      ]
    },
    {
      id: 'viager',
      title: 'Simulateur Viager',
      quarter: 'T1 2026',
      icon: HeartHandshake,
      category: 'Immobilier & Fiscalité',
      description: 'Calcul du bouquet et de la rente viagère selon tables officielles de mortalité. DPE et décote intégrés.',
      features: [
        'Calcul bouquet et rente',
        'Tables mortalité officielles',
        'Optimisation fiscale',
        'DPE et décote'
      ]
    },
    {
      id: 'revenus-fonciers',
      title: 'Calculateur Revenus Fonciers',
      quarter: 'T1 2026',
      icon: Building2,
      category: 'Gestion Patrimoniale',
      description: 'Optimisation fiscale des revenus locatifs. Micro-foncier vs régime réel, déficit foncier, projection 10 ans.',
      features: [
        'Micro-foncier vs régime réel',
        'Optimisation charges déductibles',
        'Simulation déficit foncier',
        'Projection sur 10 ans'
      ]
    },
    {
      id: 'lmnp',
      title: 'Simulateur LMNP/LMP',
      quarter: 'T1 2026',
      icon: Briefcase,
      category: 'Gestion Patrimoniale',
      description: 'Optimisation fiscale de la location meublée. Micro-BIC vs réel, amortissements, comparaison LMNP vs SCI.',
      features: [
        'Comparaison micro-BIC vs réel',
        'Calcul des amortissements',
        'Optimisation fiscale',
        'Comparaison LMNP vs SCI'
      ]
    },
    {
      id: 'pret-immo',
      title: 'Calculateur Prêt Immobilier',
      quarter: 'T1 2026',
      icon: Calculator,
      category: 'Gestion Patrimoniale',
      description: 'Comparaison et optimisation de prêts. TAEG réel, remboursement anticipé, lissage, assurance emprunteur.',
      features: [
        'Comparaison offres bancaires',
        'Calcul TAEG réel',
        'Simulation remboursement anticipé',
        'Lissage + assurance'
      ]
    },
    {
      id: 'investissement',
      title: 'Optimiseur Investissement Locatif',
      quarter: 'T1 2026',
      icon: TrendingUp,
      category: 'Gestion Patrimoniale',
      description: 'Analyse de rentabilité complète. Calcul TRI, cash-flow, simulation Pinel/Denormandie/Malraux.',
      features: [
        'Rentabilité brute/nette/TRI',
        'Cash-flow mensuel',
        'Simulation Pinel/Denormandie/Malraux',
        'Comparaison scénarios'
      ]
    },
    {
      id: 'plusvalue-pro',
      title: 'Plus-Value Professionnelle',
      quarter: 'T1 2026',
      icon: Award,
      category: 'Professionnel',
      description: 'Calcul des plus-values sur cession d\'entreprise. Exonération départ retraite, Article 151 septies, apport-cession.',
      features: [
        'Cession fonds de commerce',
        'Exonération départ retraite',
        'Article 151 septies (PME)',
        'Apport-cession'
      ]
    },
    {
      id: 'statut',
      title: 'Simulateur Statut Juridique',
      quarter: 'T1 2026',
      icon: Briefcase,
      category: 'Professionnel',
      description: 'Comparaison SASU/EURL/SAS/SARL. Optimisation rémunération/dividendes, charges sociales, IS vs IR.',
      features: [
        'Comparaison SASU/EURL/SAS/SARL',
        'Optimisation rémunération/dividendes',
        'Charges sociales détaillées',
        'IS vs IR'
      ]
    },
    {
      id: 'holding',
      title: 'Calculateur Holding',
      quarter: 'T1 2026',
      icon: Building,
      category: 'Professionnel',
      description: 'Optimisation de structure holding. Remontée dividendes, niche fiscale intégration, rachat parts.',
      features: [
        'Optimisation remontée dividendes',
        'Niche fiscale intégration',
        'Simulation rachat parts',
        'Transmission optimisée'
      ]
    },
    {
      id: 'retraite',
      title: 'Simulateur Retraite',
      quarter: 'T1 2026',
      icon: PiggyBank,
      category: 'Retraite & Transmission',
      description: 'Estimation retraite tous régimes. Rachat trimestres, cumul emploi-retraite, réversion.',
      features: [
        'Estimation tous régimes',
        'Rachat trimestres',
        'Cumul emploi-retraite',
        'Réversion'
      ]
    },
    {
      id: 'assurance-vie',
      title: 'Calculateur Assurance-Vie',
      quarter: 'T1 2026',
      icon: Shield,
      category: 'Retraite & Transmission',
      description: 'Optimisation fiscale assurance-vie. Fiscalité rachat, transmission avant/après 70 ans, clause bénéficiaire.',
      features: [
        'Fiscalité rachat (avant/après 8 ans)',
        'Transmission (avant/après 70 ans)',
        'Comparaison contrats',
        'Optimisation clause bénéficiaire'
      ]
    },
    {
      id: 'api',
      title: 'API Publique',
      quarter: 'T1 2026',
      icon: Zap,
      category: 'Infrastructure',
      description: 'API REST pour intégrer NotariaPrime. Documentation OpenAPI, rate limiting, authentification.',
      features: [
        'Endpoints tous calculateurs',
        'Documentation OpenAPI',
        'Rate limiting généreux',
        'Authentification par clé'
      ]
    },
    {
      id: 'pwa',
      title: 'Mode Hors-ligne',
      quarter: 'T1 2026',
      icon: Globe,
      category: 'Infrastructure',
      description: 'Application web progressive. Installation, calculs locaux, synchronisation optionnelle.',
      features: [
        'Installation sur appareil',
        'Calculs 100% locaux',
        'Synchronisation optionnelle',
        'Notifications push'
      ]
    },
    {
      id: 'espace-pro',
      title: 'Espace Professionnel',
      quarter: 'T1 2026',
      icon: Users,
      category: 'Infrastructure',
      description: 'Fonctionnalités avancées pour études. Multi-utilisateurs, historique, templates, tableau de bord.',
      features: [
        'Gestion multi-utilisateurs',
        'Historique illimité',
        'Templates personnalisés',
        'Tableau de bord analytique'
      ]
    }
  ];

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
            <span className="text-sm font-semibold text-indigo-700">18 calculateurs professionnels</span>
          </div>

          <h1 className={`font-bold mb-6 leading-tight ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
            <span className="text-gray-900">Tous les calculateurs dont vous</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              avez réellement besoin
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl">
            Suite complète d'outils conçus avec et pour les professionnels du notariat. 
            4 disponibles depuis T3 2025, 14 prévus pour T1 2026. 
            Conformes aux réglementations, ultra-rapides et d'une précision irréprochable.
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

      {/* Outils Disponibles - Détaillés */}
      {availableTools.map((tool, idx) => (
        <section key={tool.id} className={`py-20 ${idx % 2 === 1 ? 'bg-gray-50' : ''} border-t border-gray-200`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className={`grid gap-16 items-center ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full mb-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-semibold text-green-700">{tool.status.toUpperCase()}</span>
                </div>

                <h2 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {tool.description}
                </p>

                <div className="space-y-6 mb-8">
                  {tool.features.map((feature, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <feature.icon className="w-5 h-5 text-indigo-600" />
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  ))}

                  <div className={`bg-gradient-to-br ${tool.gradient} rounded-xl p-6 border-2 ${tool.borderColor}`}>
                    <h3 className="font-bold text-gray-900 mb-2">Types supportés</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.supportedTypes.map((type) => (
                        <span key={type} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <a href={tool.link} className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  Utiliser le calculateur
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              {/* Example Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-gray-500">EXEMPLE DE CALCUL</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    T3 2025
                  </span>
                </div>

                <div className="mb-6 pb-6 border-b-2 border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Base de calcul</div>
                  <div className="text-3xl font-bold text-gray-900">{tool.example.input}</div>
                </div>

                <div className="space-y-3 mb-6">
                  {tool.example.outputs.map((output, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{output.label}</span>
                      <span className="font-semibold text-gray-900">{output.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">TOTAL</span>
                    <span className="text-2xl font-bold text-indigo-600">{tool.example.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Outils À Venir - Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-full mb-4">
              <Rocket className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">À venir</span>
            </div>
            <h2 className={`font-bold mb-4 text-gray-900 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              14 nouveaux calculateurs en préparation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              IFI, viager, revenus fonciers, LMNP, retraite, API publique... 
              Une suite complète qui couvre tous vos besoins professionnels. Sortie T1 2026.
            </p>
          </div>

          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {upcomingTools.map((tool) => (
              <div key={tool.id} className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <tool.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                      PRÉVU
                    </span>
                    <div className="text-xs text-gray-500 mt-2">{tool.quarter}</div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2 text-gray-900">{tool.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{tool.description}</p>
                
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-6">
                  {tool.category}
                </div>

                <div className="space-y-2">
                  {tool.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                desc: 'Résultats en moins de 100ms grâce à Next.js et au calcul côté client',
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