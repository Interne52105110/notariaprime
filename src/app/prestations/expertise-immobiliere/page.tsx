"use client";

import { Building2, CheckCircle2, Shield, TrendingUp, Award, BarChart3, ExternalLink, Linkedin } from 'lucide-react';

export default function ExpertiseImmobiliere() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">Certifié TEGOVA REV+TRV</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Expertise immobilière & Due Diligence
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            16 ans d&apos;expérience | +1 500 expertises réalisées | Expert judiciaire près la Cour d&apos;Appel de Rennes
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">💡 &quot;Sans données, vous n&apos;êtes qu&apos;une personne de plus avec une opinion.&quot; - W. Edwards Deming</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Expertise cœur de métier</h2>
              <div className="flex gap-2">
                <a 
                  href="https://bargain-expertise.fr/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-900 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Bargain-Expertise.fr
                </a>
                <a 
                  href="https://www.linkedin.com/in/erwanbargain/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 transition"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Expert en évaluation immobilière et analyse de risques avec 16 ans d&apos;expérience, spécialisé dans
              l&apos;évaluation de garanties bancaires et expertises judiciaires.
            </p>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Missions pour offices notariaux français</h3>
              <p className="text-gray-700 mb-3">
                Expert judiciaire près la Cour d&apos;Appel de Rennes, disponible pour accompagner les notaires
                dans leurs missions d&apos;évaluation immobilière. Interventions partout en France.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Analyse documentaire complète</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Visites sur site partout en France</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Rapports sous 10 jours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Modalités d&apos;intervention</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📋 Analyse documentaire
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Analyse complète des actes et diagnostics</li>
                  <li>• Vérification cadastrale et urbanistique</li>
                  <li>• Recherche de comparables sur bases de données</li>
                  <li>• Modélisation financière (DCF, régression)</li>
                  <li>• Étude des contraintes réglementaires</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  🚗 Visite sur site
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Inspection physique complète du bien</li>
                  <li>• Relevés métré et état des lieux détaillé</li>
                  <li>• Photographies professionnelles</li>
                  <li>• Analyse de l&apos;environnement et du quartier</li>
                  <li>• Vérification conformité et travaux nécessaires</li>
                  <li>• Interventions partout en France métropolitaine</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <p className="text-gray-700">
                <strong>Délais de livraison :</strong> Rapport définitif sous <strong>10 jours ouvrés</strong> après visite • 
                Express possible sous 5 jours (supplément tarifaire)
              </p>
            </div>
          </div>

          {/* Certifications */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6 text-center">
              <Award className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">TEGOVA REV+TRV</h3>
              <p className="text-sm text-gray-600">Certifications européennes reconnues</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Expert judiciaire</h3>
              <p className="text-sm text-gray-600">Cour d&apos;Appel de Rennes</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 text-center">
              <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">+1 500 expertises</h3>
              <p className="text-sm text-gray-600">Volume d&apos;expérience conséquent</p>
            </div>
          </div>

          {/* Services détaillés */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Évaluation immobilière */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Évaluation immobilière</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Application des normes EVS 2025 (critères ESG, performance énergétique)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Calculs de ratios prêt/valeur (LTV) conformes CRR</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Évaluations prudentielles pour garanties bancaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Analyse de la durabilité des actifs</span>
                </li>
              </ul>
            </div>

            {/* Due Diligence */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Due Diligence immobilière</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Analyse technique complète : faisabilité constructive</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Contraintes d&apos;urbanisme et risques naturels (PPR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Vérification des titres de propriété</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Conformité réglementaire (ESG, DPE, sismicité)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Méthodologies */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Modélisation financière</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-indigo-600 mb-1">DCF</div>
                <div className="text-sm text-gray-600">Actualisation des flux</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-purple-600 mb-1">Comparaison</div>
                <div className="text-sm text-gray-600">Analyse de marché</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-indigo-600 mb-1">Régression</div>
                <div className="text-sm text-gray-600">Modèles statistiques</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-purple-600 mb-1">Capitalisation</div>
                <div className="text-sm text-gray-600">Revenus locatifs</div>
              </div>
            </div>
          </div>

          {/* Périmètre d'intervention */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Périmètre d&apos;intervention</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Types de biens</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Biens d&apos;habitation (maisons, appartements)</li>
                  <li>• Parts sociales (SCI, SCPI)</li>
                  <li>• Locaux commerciaux</li>
                  <li>• Locaux artisanaux et professionnels</li>
                  <li>• Immeubles de rapport</li>
                  <li>• Hôtels et établissements</li>
                  <li>• Terrains à bâtir</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Clientèle</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Banques et institutionnels</li>
                  <li>• Avocats et tribunaux</li>
                  <li>• Notaires</li>
                  <li>• Promoteurs immobiliers</li>
                  <li>• Particuliers et investisseurs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Volume</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>+25 missions/an</strong></li>
                  <li>• <strong>+1 500 expertises</strong> au total</li>
                  <li>• <strong>16 ans</strong> d&apos;expérience</li>
                  <li>• Délais respectés</li>
                  <li>• Rapports détaillés</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Parcours et formations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Parcours académique</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Formations</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• DU Conseil Notarial d&apos;Entreprise (Université Panthéon-Assas, 2023)</li>
                  <li>• Master 1 Droit des Affaires + 3ème cycle Gestion de Patrimoine et Finance de Marché</li>
                  <li>• Formation continue en normes EVS 2025 et réglementation CRR</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Notaires : besoin d&apos;une expertise immobilière fiable ?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Rapports conformes normes EVS 2025 et CRR • Interventions partout en France • Délai 10 jours
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Analyse complète</div>
              <div className="text-sm text-emerald-100">Étude documentaire et technique</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Visite terrain</div>
              <div className="text-sm text-emerald-100">Inspection sur site partout en France</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Expert judiciaire</div>
              <div className="text-sm text-emerald-100">Cour d&apos;Appel de Rennes</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Nous contacter
            </a>
            <a 
              href="mailto:contact@notariaprime.fr" 
              className="px-8 py-3 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition border-2 border-white"
            >
              Envoyer un email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}