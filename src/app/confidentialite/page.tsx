"use client";

import React from 'react';
import MainLayout from '@/components/MainLayout';
import { Shield, Eye, Lock, Database, Mail, UserCheck } from 'lucide-react';

function ConfidentialiteContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Politique de confidentialité</h1>
          </div>
          <p className="text-lg text-gray-600">
            NotariaPrime s'engage à protéger votre vie privée et vos données personnelles
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-12">
            {/* Introduction */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre engagement</h2>
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-green-900">
                  NotariaPrime respecte votre vie privée et s'engage à protéger vos données personnelles.
                </p>
                <p>
                  Cette politique de confidentialité vous informe sur la manière dont nous collectons, 
                  utilisons et protégeons vos données lorsque vous utilisez notre plateforme.
                </p>
                <p>
                  <strong>Responsable du traitement :</strong> NOTARIA PRIME, SAS au capital de 500€, 
                  dont le siège social est situé 1 Impasse de Menez Bijigou, 29120 Pont-l'Abbé, France.
                </p>
              </div>
            </div>

            {/* Données collectées */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Données collectées</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">1. Données de calcul</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                    <p><strong>Collectées :</strong> Les montants et paramètres que vous saisissez dans les calculateurs</p>
                    <p><strong>Stockage :</strong> Ces données sont traitées <strong>localement dans votre navigateur</strong></p>
                    <p><strong>Conservation :</strong> Elles ne sont <strong>jamais envoyées sur nos serveurs</strong></p>
                    <p className="text-green-700 font-semibold">✓ Vos calculs restent 100% privés et confidentiels</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">2. Données de navigation</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                    <p><strong>Collectées :</strong> Adresse IP, type de navigateur, pages visitées, durée de visite</p>
                    <p><strong>Finalité :</strong> Analyse d'audience et amélioration du service</p>
                    <p><strong>Outil :</strong> Google Analytics 4 (IP anonymisée, soumis à votre consentement)</p>
                    <p><strong>Conservation :</strong> 13 mois maximum</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">3. Données de contact</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                    <p><strong>Collectées :</strong> Email, nom (si vous nous contactez)</p>
                    <p><strong>Finalité :</strong> Répondre à vos demandes</p>
                    <p><strong>Conservation :</strong> Durée nécessaire au traitement de votre demande</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Utilisation des données */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Utilisation des données</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>Nous utilisons vos données uniquement pour :</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Fournir et améliorer nos services de calcul</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Analyser l'utilisation de la plateforme (données anonymisées)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Répondre à vos demandes de support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Respecter nos obligations légales</span>
                  </li>
                </ul>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-6">
                  <p className="font-semibold text-red-900">
                    ✗ Nous ne vendons jamais vos données à des tiers
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    ✗ Nous n'utilisons pas vos données à des fins publicitaires
                  </p>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Sécurité des données</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>Nous mettons en œuvre les mesures de sécurité suivantes :</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="font-semibold text-gray-900 mb-2">🔒 Chiffrement HTTPS</div>
                    <p className="text-sm text-gray-600">Toutes les communications sont chiffrées</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="font-semibold text-gray-900 mb-2">💻 Calcul local</div>
                    <p className="text-sm text-gray-600">Vos données de calcul restent sur votre appareil</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="font-semibold text-gray-900 mb-2">🛡️ Infrastructure sécurisée</div>
                    <p className="text-sm text-gray-600">Hébergement sur Vercel avec protection DDoS</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="font-semibold text-gray-900 mb-2">📖 Open Source</div>
                    <p className="text-sm text-gray-600">Code auditable publiquement sur GitHub</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vos droits RGPD */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Vos droits (RGPD)</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">👁️</span>
                    <div>
                      <div className="font-semibold text-gray-900">Droit d'accès</div>
                      <p className="text-sm">Obtenir une copie de vos données personnelles</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">✏️</span>
                    <div>
                      <div className="font-semibold text-gray-900">Droit de rectification</div>
                      <p className="text-sm">Corriger vos données inexactes ou incomplètes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">🗑️</span>
                    <div>
                      <div className="font-semibold text-gray-900">Droit à l'effacement</div>
                      <p className="text-sm">Demander la suppression de vos données</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">⛔</span>
                    <div>
                      <div className="font-semibold text-gray-900">Droit d'opposition</div>
                      <p className="text-sm">Vous opposer au traitement de vos données</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">📦</span>
                    <div>
                      <div className="font-semibold text-gray-900">Droit à la portabilité</div>
                      <p className="text-sm">Récupérer vos données dans un format structuré</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercer vos droits */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Exercer vos droits</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Pour exercer vos droits ou pour toute question concernant le traitement de vos données, 
                  contactez-nous à :
                </p>
                <div className="bg-white rounded-xl p-6 border-2 border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <a href="mailto:contact@notariaprime.fr" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
                      contact@notariaprime.fr
                    </a>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nous nous engageons à répondre dans un délai d'un mois maximum
                  </p>
                </div>
                <p className="text-sm">
                  Vous disposez également du droit d'introduire une réclamation auprès de la CNIL 
                  (Commission Nationale de l'Informatique et des Libertés) si vous estimez que vos droits 
                  ne sont pas respectés : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium">www.cnil.fr</a>
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies et technologies similaires</h2>
              <div className="space-y-6 text-gray-700">
                <p>
                  NotariaPrime utilise des <strong>cookies techniques essentiels</strong> au fonctionnement
                  du site (ex : préférences, sauvegarde de simulations en localStorage).
                </p>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Cookies de mesure d&apos;audience (Google Analytics)</h3>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-2 text-sm">
                    <p><strong>Outil :</strong> Google Analytics 4 (identifiant : G-YBC8WDQD0W)</p>
                    <p><strong>Finalité :</strong> Mesurer la fréquentation du site (nombre de visiteurs, pages les plus consultées, durée des visites) afin d&apos;améliorer le service.</p>
                    <p><strong>Données collectées :</strong> Adresse IP (anonymisée), pages visitées, type de navigateur, durée de session, source de trafic.</p>
                    <p><strong>Destinataire :</strong> Google Ireland Ltd. Les données peuvent être transférées aux États-Unis, encadrées par les clauses contractuelles types de la Commission européenne.</p>
                    <p><strong>Conservation :</strong> 14 mois maximum.</p>
                    <p><strong>Base légale :</strong> Votre consentement (article 6.1.a du RGPD, article 82 de la loi Informatique et Libertés).</p>
                    <p><strong>Consentement :</strong> Lors de votre première visite, une bannière vous demande votre accord. <strong>Aucun cookie de mesure n&apos;est déposé avant votre acceptation.</strong> Vous pouvez retirer votre consentement à tout moment en supprimant le cookie &laquo; notariaprime-cookie-consent &raquo; dans les paramètres de votre navigateur.</p>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-900 mb-2">
                    ✓ Aucun cookie de tracking publicitaire
                  </p>
                  <p className="text-sm text-green-700">
                    ✓ Aucun cookie de réseaux sociaux tiers<br />
                    ✓ Pas de profilage utilisateur<br />
                    ✓ IP anonymisée dans Google Analytics<br />
                    ✓ Consentement requis avant tout dépôt de cookie non essentiel
                  </p>
                </div>
              </div>
            </div>

            {/* Transferts internationaux */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Transferts de données</h2>
              <p className="text-gray-700">
                Notre hébergeur (Vercel Inc.) est situé aux États-Unis. Les transferts de données sont encadrés 
                par les clauses contractuelles types approuvées par la Commission Européenne et respectent 
                les exigences du RGPD.
              </p>
            </div>

            {/* Modifications */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications de la politique</h2>
              <p className="text-gray-700">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                En cas de modification substantielle, nous vous en informerons par un avis visible sur le site. 
                La date de dernière mise à jour est indiquée en bas de page.
              </p>
            </div>

            {/* Date de mise à jour */}
            <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
              <p>Dernière mise à jour : 30 mars 2026</p>
              <p className="mt-2">Version 2.0 — Ajout Google Analytics et bannière de consentement</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ConfidentialitePage() {
  return (
    <MainLayout>
      <ConfidentialiteContent />
    </MainLayout>
  );
}