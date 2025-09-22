"use client";

import Link from 'next/link';
import { Calculator, ArrowLeft, MessageSquare, Github, Home } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-700)] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[var(--color-text-primary)]">
                  NotariaPrime
                </span>
              </Link>
              
              {/* Breadcrumb separator */}
              <div className="h-6 w-px bg-[var(--color-border-default)]" />
              
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/" className="flex items-center gap-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition">
                  <Home className="w-4 h-4" />
                  Accueil
                </Link>
                <span className="text-[var(--color-text-tertiary)]">/</span>
                <span className="text-[var(--color-text-primary)] font-medium">
                  Calculateur
                </span>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                className="btn btn-ghost hidden sm:flex"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <button 
                onClick={() => setFeedbackOpen(true)}
                className="btn btn-secondary"
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
      <footer className="mt-auto py-12 px-6 border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">
                À propos
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                NotariaPrime est un projet open source et gratuit développé par la communauté pour simplifier les calculs notariaux.
              </p>
              <div className="flex items-center gap-2">
                <div className="community-badge">
                  <span>💙</span>
                  <span>Communautaire</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">
                Liens utiles
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/documentation" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-600)] transition">
                    Documentation API
                  </a>
                </li>
                <li>
                  <a href="/tarifs" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-600)] transition">
                    Tarifs réglementés 2024
                  </a>
                </li>
                <li>
                  <a href="https://github.com" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-600)] transition">
                    Contribuer sur GitHub
                  </a>
                </li>
                <li>
                  <a href="/changelog" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-600)] transition">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">
                Support
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Besoin d'aide ? La communauté est là pour vous.
              </p>
              <div className="space-y-2">
                <a 
                  href="https://discord.com" 
                  className="btn btn-secondary w-full justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rejoindre Discord
                </a>
                <button 
                  onClick={() => setFeedbackOpen(true)}
                  className="btn btn-ghost w-full justify-center"
                >
                  Signaler un bug
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-[var(--color-border-default)] flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[var(--color-text-tertiary)]">
              © 2025 NotariaPrime - Projet open source sous licence MIT
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/legal" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition">
                Mentions légales
              </a>
              <a href="/privacy" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition">
                Confidentialité
              </a>
              <a href="/terms" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition">
                CGU
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-[var(--color-bg-primary)] rounded-xl p-6 max-w-md w-full animate-fade-in shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                Votre retour est précieux
              </h3>
              <button 
                onClick={() => setFeedbackOpen(false)}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition"
              >
                <span className="sr-only">Fermer</span>
                ✕
              </button>
            </div>
            
            <p className="text-[var(--color-text-secondary)] mb-6">
              Aidez-nous à améliorer NotariaPrime. Chaque suggestion compte !
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Type de retour
                </label>
                <select className="w-full p-3 border border-[var(--color-border-default)] rounded-lg bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]">
                  <option>💡 Suggestion de fonctionnalité</option>
                  <option>🐛 Signaler un bug</option>
                  <option>📝 Amélioration</option>
                  <option>❓ Question</option>
                  <option>👍 Retour positif</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Votre message
                </label>
                <textarea 
                  className="w-full p-3 border border-[var(--color-border-default)] rounded-lg resize-none bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
                  rows={4}
                  placeholder="Décrivez votre retour..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Email (optionnel)
                </label>
                <input 
                  type="email"
                  className="w-full p-3 border border-[var(--color-border-default)] rounded-lg bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
                  placeholder="vous@exemple.com"
                />
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  Pour vous tenir informé de la suite donnée à votre retour
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="btn btn-primary flex-1">
                Envoyer le feedback
              </button>
              <button 
                onClick={() => setFeedbackOpen(false)}
                className="btn btn-secondary flex-1"
              >
                Annuler
              </button>
            </div>
            
            <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-4">
              Vous pouvez aussi contribuer directement sur{' '}
              <a href="https://github.com" className="text-[var(--color-accent-600)] hover:underline">
                GitHub
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}