"use client";

import React from 'react';
import MainLayout from '@/components/MainLayout';
import { FileText, AlertTriangle, CheckCircle, Scale, Ban, RefreshCw } from 'lucide-react';

function CguContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Conditions Générales d&apos;Utilisation</h1>
          </div>
          <p className="text-lg text-gray-600">
            Conditions d&apos;utilisation de la plateforme NotariaPrime
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-12">
            {/* Introduction */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Préambule</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les présentes Conditions Générales d&apos;Utilisation (ci-après &quot;CGU&quot;) régissent l&apos;accès et
                  l&apos;utilisation de la plateforme NotariaPrime accessible à l&apos;adresse{' '}
                  <a href="https://www.notariaprime.fr" className="text-blue-600 hover:text-blue-700 font-medium">
                    www.notariaprime.fr
                  </a>
                </p>
                <p>
                  <strong>Éditeur :</strong> NOTARIA PRIME, SAS au capital de 500€, immatriculée au RCS 
                  sous le numéro 941 646 341, dont le siège social est situé 1 Impasse de Menez Bijigou, 
                  29120 Pont-l&apos;Abbé, France.
                </p>
                <p>
                  <strong>Contact :</strong>{' '}
                  <a href="mailto:contact@notariaprime.fr" className="text-blue-600 hover:text-blue-700 font-medium">
                    contact@notariaprime.fr
                  </a>
                </p>
                <p className="font-semibold text-blue-900">
                  L&apos;utilisation de NotariaPrime implique l&apos;acceptation pleine et entière des présentes CGU.
                </p>
              </div>
            </div>

            {/* Article 1 - Objet */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 1 - Objet de la plateforme</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  NotariaPrime est une plateforme <strong>open source</strong> et <strong>gratuite</strong> qui propose 
                  des outils de calcul notarial, notamment :
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Calcul de prétaxe notariale (frais de notaire)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Calcul de plus-value immobilière</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Outils complémentaires en cours de développement</span>
                  </li>
                </ul>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-2">Important</p>
                      <p className="text-sm text-yellow-800">
                        NotariaPrime est un <strong>outil d&apos;aide à la décision</strong>. Les résultats fournis
                        sont donnés à titre indicatif et ne constituent pas un conseil juridique ou fiscal. 
                        Ils ne peuvent se substituer à l&apos;expertise d&apos;un professionnel du droit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Article 2 - Accès */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 2 - Accès à la plateforme</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  L&apos;accès à NotariaPrime est :
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-900 mb-1">✓ Gratuit</p>
                    <p className="text-sm text-green-700">Aucun frais, aucun abonnement</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-900 mb-1">✓ Sans inscription</p>
                    <p className="text-sm text-green-700">Utilisation immédiate et anonyme</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-900 mb-1">✓ Open Source</p>
                    <p className="text-sm text-green-700">Code transparent sur GitHub</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-900 mb-1">✓ 24/7</p>
                    <p className="text-sm text-green-700">Disponible en continu</p>
                  </div>
                </div>
                <p className="mt-4">
                  L&apos;utilisateur doit disposer d&apos;un accès à Internet et d&apos;un navigateur web récent.
                  Les frais de connexion et d&apos;équipement sont à sa charge.
                </p>
              </div>
            </div>

            {/* Article 3 - Utilisation */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 3 - Utilisation de la plateforme</h2>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">3.1 Usage autorisé</h3>
                  <p>L&apos;utilisateur s&apos;engage à utiliser NotariaPrime :</p>
                  <ul className="space-y-2 ml-6 mt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>De manière conforme aux lois et réglementations en vigueur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Dans le respect des présentes CGU</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>À des fins légitimes et professionnelles ou personnelles</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">3.2 Usage interdit</h3>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="font-semibold text-red-900 mb-3">Il est strictement interdit de :</p>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Utiliser la plateforme à des fins illégales ou frauduleuses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Tenter de contourner les mesures de sécurité</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Surcharger volontairement les serveurs (attaques DoS/DDoS)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Extraire massivement des données (scraping abusif)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Diffuser des contenus malveillants ou offensants</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Se faire passer pour NotariaPrime ou usurper son identité</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Article 4 - Responsabilité */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Article 4 - Limitation de responsabilité</h2>
              </div>
              
              <div className="space-y-6 text-gray-700">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <p className="font-bold text-yellow-900 mb-3 text-lg">⚠️ Clause importante</p>
                  <div className="space-y-3 text-yellow-800">
                    <p>
                      <strong>NotariaPrime est fourni &quot;en l&apos;état&quot;</strong>, sans garantie d&apos;aucune sorte,
                      expresse ou implicite.
                    </p>
                    <p>
                      Les calculs sont basés sur les textes réglementaires en vigueur au moment de leur 
                      implémentation. <strong>Il appartient à l&apos;utilisateur de vérifier l&apos;exactitude,
                      l&apos;actualité et la pertinence des résultats obtenus.</strong>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">4.1 Exactitude des calculs</h3>
                  <p>
                    NOTARIA PRIME met tout en œuvre pour assurer l&apos;exactitude des calculs, mais ne peut
                    garantir l&apos;absence d&apos;erreur. Les résultats doivent être validés par un professionnel qualifié
                    avant toute utilisation dans un contexte officiel.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">4.2 Disponibilité du service</h3>
                  <p>
                    NOTARIA PRIME ne garantit pas un accès continu et ininterrompu à la plateforme. 
                    Des interruptions temporaires peuvent survenir pour maintenance, mise à jour ou 
                    en cas de force majeure.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">4.3 Responsabilité de l&apos;utilisateur</h3>
                  <p>
                    L&apos;utilisateur est seul responsable de l&apos;utilisation qu&apos;il fait des résultats obtenus
                    sur NotariaPrime. NOTARIA PRIME ne saurait être tenue responsable des décisions prises 
                    sur la base de ces résultats.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">4.4 Limitation de responsabilité</h3>
                  <p>
                    En aucun cas NOTARIA PRIME ne pourra être tenue responsable des dommages directs ou 
                    indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser la plateforme,
                    y compris la perte de données, de bénéfices ou d&apos;opportunités commerciales.
                  </p>
                </div>
              </div>
            </div>

            {/* Article 5 - Propriété intellectuelle */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 - Propriété intellectuelle</h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                  <p className="font-bold text-indigo-900 mb-3">📖 Projet Open Source</p>
                  <p className="text-indigo-800">
                    NotariaPrime est un projet open source publié sous <strong>licence MIT</strong>.
                  </p>
                  <p className="text-sm text-indigo-700 mt-2">
                    Code source disponible sur :{' '}
                    <a href="https://github.com/Interne52105110/notariaprime" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                      github.com/Interne52105110/notariaprime
                    </a>
                  </p>
                </div>
                <p>
                  Vous êtes libre d&apos;utiliser, de modifier et de distribuer le code source conformément
                  aux termes de la licence MIT. Les contributions sont les bienvenues.
                </p>
                <p>
                  Les éléments de design, logos et contenus éditoriaux restent la propriété de NOTARIA PRIME, 
                  sauf mention contraire.
                </p>
              </div>
            </div>

            {/* Article 6 - Données personnelles */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 - Protection des données</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Le traitement de vos données personnelles est régi par notre{' '}
                  <a href="/confidentialite" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Politique de confidentialité
                  </a>, conforme au RGPD.
                </p>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-900 mb-2">🔒 Confidentialité maximale</p>
                  <p className="text-sm text-green-700">
                    Vos calculs sont traités localement dans votre navigateur et ne sont jamais 
                    transmis à nos serveurs.
                  </p>
                </div>
              </div>
            </div>

            {/* Article 7 - Modifications */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Article 7 - Modifications des CGU</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  NOTARIA PRIME se réserve le droit de modifier les présentes CGU à tout moment. 
                  Les modifications entrent en vigueur dès leur publication sur le site.
                </p>
                <p>
                  En cas de modification substantielle, un avis sera affiché sur la page d&apos;accueil.
                  L&apos;utilisation continue de la plateforme après modification vaut acceptation des nouvelles CGU.
                </p>
              </div>
            </div>

            {/* Article 8 - Droit applicable */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 8 - Droit applicable et juridiction</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les présentes CGU sont régies par le <strong>droit français</strong>.
                </p>
                <p>
                  En cas de litige, et à défaut d&apos;accord amiable, les tribunaux français seront seuls compétents.
                </p>
                <p>
                  Pour toute réclamation, contactez-nous en priorité à :{' '}
                  <a href="mailto:contact@notariaprime.fr" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    contact@notariaprime.fr
                  </a>
                </p>
              </div>
            </div>

            {/* Article 9 - Contact */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 9 - Contact</h2>
              <div className="space-y-4 text-gray-700">
                <p>Pour toute question concernant les présentes CGU, vous pouvez nous contacter :</p>
                <div className="bg-white rounded-xl p-6 border-2 border-indigo-200 space-y-3">
                  <div>
                    <div className="font-semibold text-gray-900">Par email</div>
                    <a href="mailto:contact@notariaprime.fr" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      contact@notariaprime.fr
                    </a>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Par courrier</div>
                    <p className="text-sm">
                      NOTARIA PRIME<br />
                      1 Impasse de Menez Bijigou<br />
                      29120 Pont-l&apos;Abbé<br />
                      France
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date de mise à jour */}
            <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
              <p>Conditions Générales d&apos;Utilisation</p>
              <p className="mt-1">Date d&apos;entrée en vigueur : 14 mars 2025</p>
              <p>Dernière mise à jour : 13 octobre 2025</p>
              <p className="mt-2">Version 1.0</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CguPage() {
  return (
    <MainLayout>
      <CguContent />
    </MainLayout>
  );
}