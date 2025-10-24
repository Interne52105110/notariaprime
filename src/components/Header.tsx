"use client";

import { useState, useEffect } from 'react';
import { 
  Calculator, Menu, X, ArrowRight, Github, TrendingUp, Receipt, Gift, Building
} from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => setScrolled(window.scrollY > 20);

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', updateDeviceType);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Navigation principale */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo et navigation */}
            <div className="flex items-center gap-12">
              <a href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">NotariaPrime</span>
                  <span className="block text-xs text-gray-500 -mt-1">Plateforme Open Source</span>
                </div>
              </a>

              {/* Menu desktop */}
              {isDesktop && (
                <nav className="flex items-center gap-8">
                  <a 
                    href="/donation" 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    <Gift className="w-4 h-4" />
                    Donation / Succession
                  </a>
                  <a 
                    href="/pretaxe" 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    <Receipt className="w-4 h-4" />
                    Frais de Notaire
                  </a>
                  <a 
                    href="/plusvalue" 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Plus-Value
                  </a>
                  {/* ✅ NOUVEAU - Lien SCI */}
                  <a 
                    href="/sci" 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    <Building className="w-4 h-4" />
                    Simulateur SCI
                  </a>
                </nav>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {!isMobile && (
                <>
                  <a 
                    href="https://github.com/Interne52105110/notariaprime" 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                  <a href="/pretaxe" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    Calculer
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </>
              )}
              {!isDesktop && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && !isDesktop && (
        <div className="fixed inset-0 z-40 bg-white pt-20 overflow-y-auto">
          <nav className="flex flex-col p-6 space-y-4">
            <a 
              href="/donation" 
              className="flex items-center gap-3 py-3 text-lg font-medium text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Gift className="w-5 h-5 text-rose-600" />
              Donation / Succession
            </a>
            <a 
              href="/pretaxe" 
              className="flex items-center gap-3 py-3 text-lg font-medium text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Receipt className="w-5 h-5 text-blue-600" />
              Frais de Notaire
            </a>
            <a 
              href="/plusvalue" 
              className="flex items-center gap-3 py-3 text-lg font-medium text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Plus-Value Immobilière
            </a>
            {/* ✅ NOUVEAU - Lien SCI mobile */}
            <a 
              href="/sci" 
              className="flex items-center gap-3 py-3 text-lg font-medium text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building className="w-5 h-5 text-purple-600" />
              Simulateur SCI
            </a>
            <hr className="my-4" />
            <a 
              href="https://github.com/Interne52105110/notariaprime" 
              className="flex items-center gap-2 text-lg font-medium text-gray-900 py-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <a 
              href="/pretaxe" 
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Commencer maintenant
              <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </>
  );
}