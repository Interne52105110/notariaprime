"use client";

import { Calculator } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
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
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Produit</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/features" className="hover:text-gray-900 transition">Fonctionnalités</a></li>
              <li><a href="/pretaxe" className="hover:text-gray-900 transition">Calculateur</a></li>
              <li><a href="/roadmap" className="hover:text-gray-900 transition">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Ressources</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/documentation" className="hover:text-gray-900 transition">Documentation</a></li>
              <li><a href="/api" className="hover:text-gray-900 transition">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Liens</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/about" className="hover:text-gray-900 transition">À propos</a></li>
              <li><a href="/contact" className="hover:text-gray-900 transition">Contact</a></li>
              <li><a href="https://github.com/Interne52105110/notariaprime" className="hover:text-gray-900 transition" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2025 NotariaPrime. Tous droits réservés. Projet open source sous licence MIT.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/mentions-legales" className="text-gray-600 hover:text-gray-900 transition">
                Mentions légales
              </a>
              <a href="/confidentialite" className="text-gray-600 hover:text-gray-900 transition">
                Confidentialité
              </a>
              <a href="/cgu" className="text-gray-600 hover:text-gray-900 transition">
                CGU
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}