"use client";

import { Calculator } from 'lucide-react';
import Link from 'next/link';

// Liste complète des simulateurs, rendue côté serveur sur chaque page :
// c'est le maillage interne que Google suit (le mega-menu du Header n'est
// présent dans le HTML qu'après ouverture côté client).
const CALCULATEURS = [
  { href: '/pretaxe', label: 'Frais de notaire' },
  { href: '/plusvalue', label: 'Plus-value immobilière' },
  { href: '/plusvalue-pro', label: 'Plus-value professionnelle' },
  { href: '/pret', label: 'Prêt immobilier' },
  { href: '/investissement-locatif', label: 'Investissement locatif' },
  { href: '/viager', label: 'Viager' },
  { href: '/revenus-fonciers', label: 'Revenus fonciers' },
  { href: '/lmnp', label: 'LMNP / LMP' },
  { href: '/ifi', label: 'IFI' },
  { href: '/sci', label: 'SCI : IR ou IS' },
  { href: '/holding', label: 'Holding patrimoniale' },
  { href: '/donation', label: 'Donation' },
  { href: '/succession', label: 'Droits de succession' },
  { href: '/assurance-vie', label: 'Assurance-vie' },
  { href: '/statut-juridique', label: 'Statut juridique' },
  { href: '/retraite', label: 'Retraite' },
];

export default function Footer() {
  return (
    <footer className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-7 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NotariaPrime</span>
            </div>
            <p className="text-gray-600 mb-6">
              La plateforme open source pour digitaliser et automatiser vos calculs notariaux.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-900">💙 Communautaire</span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h2 className="font-semibold mb-4 text-gray-900">Calculateurs</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-600">
              {CALCULATEURS.map(({ href, label }) => (
                <li key={href}><a href={href} className="inline-flex min-h-6 items-center hover:text-gray-900 transition">{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-4 text-gray-900">Ressources</h2>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/features" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Fonctionnalités</a></li>
              <li><Link href="/guides" className="inline-flex min-h-11 items-center hover:text-gray-900 transition">Guides pratiques</Link></li>
              <li><a href="/capacite-emprunt" className="inline-flex min-h-11 items-center hover:text-gray-900 transition">Budget immobilier</a></li>
              <li><a href="/strategie-immobiliere" className="inline-flex min-h-11 items-center hover:text-gray-900 transition">Location en direct ou SCI IS</a></li>
              <li><a href="/relance-logement" className="inline-flex min-h-11 items-center hover:text-gray-900 transition">Relance logement</a></li>
              <li><a href="/documentation" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Documentation</a></li>
              <li><a href="/cours-comptable-taxateur" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Cours comptable-taxateur</a></li>
              <li><a href="/roadmap" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-4 text-gray-900">Prestations</h2>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/prestations/comptabilite-notariale" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Comptabilité notariale</a></li>
              <li><a href="/prestations/expertise-immobiliere" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Expertise immobilière</a></li>
              <li><a href="/prestations/developpement-informatique" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Développement informatique</a></li>
            </ul>
          </div>
          
          <div>
            <h2 className="font-semibold mb-4 text-gray-900">Liens</h2>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/about" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">À propos</a></li>
              <li><a href="/contact" className="inline-flex min-h-6 items-center hover:text-gray-900 transition">Contact</a></li>
              <li><a href="https://github.com/Interne52105110/notariaprime" className="inline-flex min-h-6 items-center hover:text-gray-900 transition" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2025-2026 NotariaPrime. Tous droits réservés. Projet open source sous licence MIT.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/mentions-legales" className="inline-flex min-h-11 items-center text-gray-600 hover:text-gray-900 transition">
                Mentions légales
              </a>
              <a href="/confidentialite" className="inline-flex min-h-11 items-center text-gray-600 hover:text-gray-900 transition">
                Confidentialité
              </a>
              <a href="/cgu" className="inline-flex min-h-11 items-center text-gray-600 hover:text-gray-900 transition">
                CGU
              </a>
            </div>
          </div>
        </div>
      </div>
    <div className="text-center px-6 pt-4 pb-6 text-sm"><a href="/methodologie-fiscale" className="inline-flex min-h-11 items-center underline">Calculs, sources et hypothèses fiscales</a></div>
    </footer>
  );
}
