"use client";

import Link from 'next/link';
import { Calculator, ArrowLeft, MessageSquare, Github, Home } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  NotariaPrime
                </span>
              </Link>
              
              {/* Breadcrumb separator */}
              <div className="h-6 w-px bg-gray-300" />
              
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition">
                  <Home className="w-4 h-4" />
                  Accueil
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">
                  Calculateur
                </span>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <button 
                onClick={() => setFeedbackOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Feedback</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer simplifié */}
      <footer className="mt-auto py-12 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">
                À propos
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                NotariaPrime est un projet open source et gratuit développé par la communauté pour simplifier les calculs notariaux.
              </p>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <span>💙</span>
                  <span>Communautaire</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">
                Liens utiles
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/documentation" className="text-gray-600 hover:text-indigo-600 transition">
                    Documentation API
                  </a>
                </li>
                <li>
                  <a href="/tarifs" className="text-gray-600 hover:text-indigo-600 transition">
                    Tarifs réglementés 2024
                  </a>
                </li>
                <li>
                  <a href="https://github.com" className="text-gray-600 hover:text-indigo-600 transition">
                    Contribuer sur GitHub
                  </a>
                </li>
                <li>
                  <a href="/changelog" className="text-gray-600 hover:text-indigo-600 transition">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">
                Support
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Besoin d'aide ? La communauté est là pour vous.
              </p>
              <div className="space-y-2">
                <a 
                  href="https://discord.com" 
                  className="block w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-lg transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rejoindre Discord
                </a>
                <button 
                  onClick={() => setFeedbackOpen(true)}
                  className="block w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center rounded-lg transition"
                >
                  Signaler un bug
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2025 NotariaPrime - Projet open source sous licence MIT
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/legal" className="text-gray-500 hover:text-gray-700 transition">
                Mentions légales
              </a>
              <a href="/privacy" className="text-gray-500 hover:text-gray-700 transition">
                Confidentialité
              </a>
              <a href="/terms" className="text-gray-500 hover:text-gray-700 transition">
                CGU
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Votre retour est précieux
              </h3>
              <button 
                onClick={() => setFeedbackOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <span className="sr-only">Fermer</span>
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Aidez-nous à améliorer NotariaPrime. Chaque suggestion compte !
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de retour
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>💡 Suggestion de fonctionnalité</option>
                  <option>🐛 Signaler un bug</option>
                  <option>📝 Amélioration</option>
                  <option>❓ Question</option>
                  <option>👍 Retour positif</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre message
                </label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Décrivez votre retour..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optionnel)
                </label>
                <input 
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="vous@exemple.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pour vous tenir informé de la suite donnée à votre retour
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                Envoyer le feedback
              </button>
              <button 
                onClick={() => setFeedbackOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition"
              >
                Annuler
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Vous pouvez aussi contribuer directement sur{' '}
              <a href="https://github.com" className="text-indigo-600 hover:underline">
                GitHub
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}