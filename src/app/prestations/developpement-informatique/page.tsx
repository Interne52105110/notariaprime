"use client";

import { Code2, CheckCircle2, Sparkles, Zap, Cpu, Database, Globe, ExternalLink } from 'lucide-react';

export default function DeveloppementInformatique() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full mb-6">
            <Code2 className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-900">PropTech & Intelligence Artificielle</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Développement informatique
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Solutions PropTech innovantes pour digitaliser et automatiser le secteur notarial et immobilier
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* NotariaPrime Showcase */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 mb-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-3xl font-bold">NotariaPrime.fr</h2>
            </div>
            <p className="text-xl text-indigo-100 mb-6">
              Plateforme PropTech open source d'automatisation des calculs juridiques immobiliers par intelligence artificielle
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-sm text-indigo-100">Utilisateurs mensuels</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-sm text-indigo-100">Open source</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">IA</div>
                <div className="text-sm text-indigo-100">Claude AI & OpenAI</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <p className="text-indigo-50 mb-3">
                <strong>🎯 Pour les entreprises :</strong> développement de solutions sur mesure 
                à distance, avec accompagnement et formation de vos équipes.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-sm">Automatisation calculs</span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-sm">Extraction IA de documents</span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-sm">Intégrations sur mesure</span>
              </div>
            </div>
            <a 
              href="https://notariaprime.fr" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Globe className="w-5 h-5" />
              Découvrir NotariaPrime
            </a>
          </div>

          {/* Fonctionnalités NotariaPrime */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Solutions développées</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Calculateurs automatisés</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Prétaxe notariale (frais d'acquisition)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Plus-value immobilière (résidentiel et SCI)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Calculs de rentabilité locative</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Droits de succession et donation</span>
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Intelligence Artificielle</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Scanner OCR pour extraction de données</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Expertise immobilière assistée par IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Analyse de comparables automatisée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Intégration APIs Claude AI & OpenAI</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stack Technique */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Stack technique</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-cyan-600 mb-2">Frontend</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• React</li>
                  <li>• HTML5/CSS3</li>
                  <li>• Tailwind CSS</li>
                  <li>• TypeScript</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-blue-600 mb-2">Backend</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Python</li>
                  <li>• Node.js</li>
                  <li>• APIs REST</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-cyan-600 mb-2">IA & Data</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Claude AI API</li>
                  <li>• OpenAI API</li>
                  <li>• Papaparse (CSV)</li>
                  <li>• SheetJS (Excel)</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-blue-600 mb-2">Outils</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Git/GitHub</li>
                  <li>• VS Code</li>
                  <li>• Vercel</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Gloria Project */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-8 mb-12">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Gloria Project</h3>
                <p className="text-gray-700 mb-4">
                  Spécialisé en marketing digital et SEO/SEA, avec une expertise reconnue dans 
                  l'accompagnement d'entreprises dans leur transformation digitale.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>400+ professionnels formés</strong> aux stratégies de référencement naturel 
                  et payant, optimisation de sites web, et croissance digitale.
                </p>
              </div>
              <a 
                href="https://gloria-project.eu/" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Gloria Project
              </a>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-orange-600 mb-2">SEO/SEA</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Audit et stratégie</li>
                  <li>• Campagnes Google Ads</li>
                  <li>• Optimisation on-page</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-amber-600 mb-2">Web Analytics</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Google Analytics</li>
                  <li>• Tracking conversions</li>
                  <li>• Reporting KPIs</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-orange-600 mb-2">Formations</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 400+ professionnels</li>
                  <li>• Workshops pratiques</li>
                  <li>• Accompagnement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Compétences développement */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Compétences de développement</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  Langages & Frameworks
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• React & Next.js</li>
                  <li>• JavaScript/TypeScript</li>
                  <li>• Python</li>
                  <li>• HTML5/CSS3</li>
                  <li>• SQL</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  Méthodologies
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Architecture MVC</li>
                  <li>• APIs RESTful</li>
                  <li>• Design responsive</li>
                  <li>• Agile/Scrum</li>
                  <li>• Open source</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                  Spécialisations
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• PropTech</li>
                  <li>• Intelligence Artificielle</li>
                  <li>• Automatisation</li>
                  <li>• Data analytics</li>
                  <li>• Growth marketing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Services proposés */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Services de développement</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Développement d'applications web sur mesure</h4>
                  <p className="text-gray-600">
                    Création de plateformes PropTech, outils de gestion immobilière, calculateurs métiers 
                    et solutions SaaS adaptées aux besoins du secteur notarial et immobilier.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Intégration d'Intelligence Artificielle</h4>
                  <p className="text-gray-600">
                    Automatisation des processus métiers par IA (extraction de données, analyse de documents, 
                    calculs prédictifs, chatbots métiers) via APIs Claude AI et OpenAI.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Audit et optimisation digitale</h4>
                  <p className="text-gray-600">
                    Audit de sites web, optimisation SEO/SEA, analyse de données (KPIs), amélioration de 
                    l'UX/UI et stratégies de croissance digitale.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Formation et accompagnement</h4>
                  <p className="text-gray-600">
                    Formation des équipes aux outils digitaux, accompagnement dans la transformation 
                    numérique, documentation technique et support utilisateurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Automatisez vos processus avec l'IA</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Développement de solutions PropTech sur mesure • Formation et accompagnement de vos équipes
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Télétravail</div>
              <div className="text-sm text-indigo-100">Développement 100% à distance</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Formation</div>
              <div className="text-sm text-indigo-100">Accompagnement de vos équipes</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Expertise métier</div>
              <div className="text-sm text-indigo-100">Connaissance du notariat</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Discuter de votre projet
            </a>
            <a 
              href="https://github.com/Interne52105110/notariaprime" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition border-2 border-white inline-flex items-center gap-2"
            >
              <Code2 className="w-5 h-5" />
              Voir le code source
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}