"use client";

import { Calculator, CheckCircle2, FileText, TrendingUp, Linkedin } from 'lucide-react';

export default function ComptabiliteNotariale() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full mb-6">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Expertise comptable notariale</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Comptabilité notariale experte
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plus de 20 ans d'expérience en gestion comptable et fiscale d'offices notariaux
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Notre expertise</h2>
              <a 
                href="https://www.linkedin.com/in/helene-gueguen/" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 transition"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn Hélène
              </a>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Comptable avec 20 ans d'expérience en étude notariale, spécialisée dans la gestion quotidienne 
              comptable (plus de 12 000 opérations annuelles), paie, déclarations fiscales et sociales, et 
              reporting financier. Maîtrise d'Excel, Odoo comptabilité, FIDUCIAL et GENAPI.
            </p>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Intervention pour offices notariaux français</h3>
              <p className="text-gray-700 mb-3">
                Disponible en <strong>télétravail</strong> pour accompagner les études notariales françaises 
                dans leur gestion comptable quotidienne.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Télétravail 100%</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Déplacements possibles en France</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Interventions sur toute la France</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Modalités d'intervention</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  💻 Télétravail (principal)
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Gestion quotidienne à distance (saisie, pointage, paie)</li>
                  <li>• Connexion sécurisée aux logiciels notariaux</li>
                  <li>• Communication quotidienne (email, visio, téléphone)</li>
                  <li>• Reporting régulier de l'activité</li>
                  <li>• Disponibilité horaires bureau français</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  🚗 Déplacements sur site
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Rencontres initiales et bilan trimestriel</li>
                  <li>• Formation des collaborateurs</li>
                  <li>• Mise en place de nouveaux processus</li>
                  <li>• Audit et optimisation comptable</li>
                  <li>• Interventions partout en France</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Gestion quotidienne */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestion quotidienne</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Encaissement et taxation des actes notariés</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Règlements factures clients et fournisseurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Gestion de trésorerie et réconciliation bancaire</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Pointage des opérations et mise en conformité</span>
                </li>
              </ul>
            </div>

            {/* Paie et social */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestion sociale et fiscale</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Gestion complète des paies et charges sociales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Déclarations fiscales (TVA, impôts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Déclarations sociales (URSSAF, retraite)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Veille réglementaire et mise en conformité</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Reporting financier */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Reporting financier</h3>
            <p className="text-gray-700 mb-6">
              Préparation de rapports financiers mensuels et annuels complets, avec analyse des coûts 
              de structure et de la rentabilité.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-indigo-600 mb-1">Mensuel</div>
                <div className="text-sm text-gray-600">Tableaux de bord</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-purple-600 mb-1">Trimestriel</div>
                <div className="text-sm text-gray-600">Suivi performance</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-indigo-600 mb-1">Annuel</div>
                <div className="text-sm text-gray-600">Bilan et compte de résultat</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-purple-600 mb-1">Analyse</div>
                <div className="text-sm text-gray-600">Ratios et KPIs</div>
              </div>
            </div>
          </div>

          {/* Compétences et outils */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Compétences et outils</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Logiciels notariaux</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• FIDUCIAL (comptabilité notariale)</li>
                  <li>• GENAPI (rédaction et comptabilité)</li>
                  <li>• Odoo comptabilité</li>
                  <li>• MS Office (Excel expert)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Formations</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• CQP Comptable taxateur (INAFON)</li>
                  <li>• Licence AES</li>
                  <li>• DUT Gestion entreprises</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Compétences clés</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Service client</li>
                  <li>• Travail en équipe</li>
                  <li>• Rigueur et précision</li>
                  <li>• Organisation et méthode</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Experience complémentaire */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Expérience complémentaire</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Gestion immobilière (SCI)</h4>
                <p className="text-gray-600">
                  Co-gestion d'une SCI spécialisée dans l'investissement immobilier et la gestion locative. 
                  Supervision des travaux de rénovation, gestion administrative et financière des biens 
                  (états des lieux, contrats, comptabilité locative).
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Formaliste notariale (7 ans)</h4>
                <p className="text-gray-600">
                  Constitution et gestion des dossiers clients en amont de la signature des actes. 
                  Collecte et vérification des pièces administratives, demandes d'urbanisme, recherches d'état civil, 
                  constitution des dossiers de financement, préparation des avant-contrats.
                </p>
              </div>
            </div>
          </div>

          {/* Tarification */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Tarification</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Tarif horaire</div>
                <div className="text-3xl font-bold text-indigo-600 mb-1">65€</div>
                <div className="text-sm text-gray-500">par heure</div>
                <div className="mt-4 text-sm text-gray-600">
                  À partir de
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-indigo-300">
                <div className="text-sm text-gray-600 mb-2">Forfait semaine</div>
                <div className="text-3xl font-bold text-indigo-600 mb-1">1 800€</div>
                <div className="text-sm text-gray-500">par semaine</div>
                <div className="mt-4 text-sm text-gray-600">
                  Forfait 35h/semaine
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-300">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 rounded text-xs font-medium text-purple-700 mb-2">
                  Le plus avantageux
                </div>
                <div className="text-sm text-gray-600 mb-2">Forfait mensuel</div>
                <div className="text-3xl font-bold text-purple-600 mb-1">5 500€</div>
                <div className="text-sm text-gray-500">par mois</div>
                <div className="mt-4 text-sm text-gray-600">
                  Forfait ~152h/mois
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tarifs HT - Non soumis à TVA</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Conformément à l'article 293 B du Code Général des Impôts, notre activité n'est pas soumise à la TVA. 
                    Les tarifs affichés sont donc les prix définitifs que vous payez.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-600 italic">
                  💡 Les forfaits peuvent être adaptés selon vos besoins spécifiques. Devis personnalisé sur demande.
                </p>
              </div>
            </div>
          </div>

          {/* Experience complémentaire */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Votre office notarial a besoin d'un renfort comptable ?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Intervention en télétravail pour les études notariales françaises, avec déplacements possibles sur site
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Télétravail</div>
              <div className="text-sm text-indigo-100">Gestion quotidienne à distance</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Flexibilité</div>
              <div className="text-sm text-indigo-100">Déplacements ponctuels en France</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="font-semibold mb-2">✓ Expertise notariale</div>
              <div className="text-sm text-indigo-100">20 ans en étude</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Nous contacter
            </a>
            <a 
              href="mailto:contact@notariaprime.fr" 
              className="px-8 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition border-2 border-white"
            >
              Envoyer un email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}