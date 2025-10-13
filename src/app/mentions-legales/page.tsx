"use client";

import React from 'react';
import MainLayout from '@/components/MainLayout';
import { Building2, Mail, Scale, Shield } from 'lucide-react';

function MentionsLegalesContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Mentions légales</h1>
          </div>
          <p className="text-lg text-gray-600">
            Informations légales concernant NotariaPrime et son éditeur
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-12">
            {/* Éditeur */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Éditeur du site</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Dénomination sociale</div>
                  <p>NOTARIA PRIME</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Forme juridique</div>
                  <p>SAS, société par actions simplifiée</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Capital social</div>
                  <p>500,00 € (fixe)</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Siège social</div>
                  <p>1 IMPASSE DE MENEZ BIJIGOU<br />29120 PONT-L'ABBÉ<br />France</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">SIREN</div>
                  <p>941 646 341</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">SIRET</div>
                  <p>941 646 341 00011</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">N° TVA Intracommunautaire</div>
                  <p>FR81 941 646 341</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Code NAF/APE</div>
                  <p>68.31Z - Agences immobilières</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Date de création</div>
                  <p>14 mars 2025</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Immatriculation</div>
                  <p>Registre National des Entreprises (RNE) - INPI</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Email</div>
                  <a href="mailto:contact@notariaprime.fr" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    contact@notariaprime.fr
                  </a>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Site web</div>
                  <a href="https://www.notariaprime.fr" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    www.notariaprime.fr
                  </a>
                </div>
              </div>
            </div>

            {/* Hébergement */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Hébergement</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Hébergeur</div>
                  <p>Vercel Inc.<br />
                  340 S Lemon Ave #4133<br />
                  Walnut, CA 91789<br />
                  États-Unis</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Site web de l'hébergeur</div>
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    vercel.com
                  </a>
                </div>
              </div>
            </div>

            {/* Directeur de publication */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Directeur de la publication</h2>
              <p className="text-gray-700">
                Le directeur de la publication du site www.notariaprime.fr est le représentant légal de NOTARIA PRIME.
              </p>
            </div>

            {/* Propriété intellectuelle */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété intellectuelle</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  NotariaPrime est un projet <strong>open source</strong> publié sous licence <strong>MIT</strong>.
                </p>
                <p>
                  Le code source est librement accessible et modifiable sur GitHub :{' '}
                  <a href="https://github.com/Interne52105110/notariaprime" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    github.com/Interne52105110/notariaprime
                  </a>
                </p>
                <p>
                  Les contenus éditoriaux (textes, images, logos) restent la propriété de NOTARIA PRIME, sauf mention contraire.
                </p>
              </div>
            </div>

            {/* Protection des données */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Protection des données personnelles</h2>
              <p className="text-gray-700 mb-4">
                Pour toute information concernant la collecte et le traitement de vos données personnelles, 
                veuillez consulter notre{' '}
                <a href="/confidentialite" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Politique de confidentialité
                </a>.
              </p>
              <p className="text-gray-700">
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression 
                de vos données personnelles en nous contactant à :{' '}
                <a href="mailto:contact@notariaprime.fr" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  contact@notariaprime.fr
                </a>
              </p>
            </div>

            {/* Cookies */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
              <p className="text-gray-700">
                NotariaPrime utilise uniquement des cookies techniques essentiels au fonctionnement du site. 
                Aucun cookie de tracking ou publicitaire n'est utilisé.
              </p>
            </div>

            {/* Crédits */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Crédits</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Développement :</strong> NOTARIA PRIME</p>
                <p><strong>Framework :</strong> Next.js 15</p>
                <p><strong>Design :</strong> Tailwind CSS</p>
                <p><strong>Icônes :</strong> Lucide Icons</p>
                <p><strong>Hébergement :</strong> Vercel</p>
              </div>
            </div>

            {/* Limitation de responsabilité */}
            <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation de responsabilité</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>NotariaPrime est un outil d'aide au calcul.</strong> Les résultats fournis sont donnés 
                  à titre indicatif et ne sauraient se substituer à l'expertise d'un professionnel du droit.
                </p>
                <p>
                  NOTARIA PRIME ne saurait être tenue responsable des erreurs, d'une absence de disponibilité 
                  des informations et/ou de la présence de virus sur son site.
                </p>
                <p>
                  Les calculs sont basés sur les textes réglementaires en vigueur au moment de leur mise en ligne. 
                  Il appartient à l'utilisateur de vérifier l'exactitude et l'actualité des informations.
                </p>
              </div>
            </div>

            {/* Date de mise à jour */}
            <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
              <p>Dernière mise à jour : 13 octobre 2025</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function MentionsLegalesPage() {
  return (
    <MainLayout>
      <MentionsLegalesContent />
    </MainLayout>
  );
}