"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Calculator, Menu, X, ArrowRight, Github, TrendingUp, Receipt, Gift, Building,
  Home, HeartHandshake, PiggyBank, Briefcase, Award, Shield, ChevronDown,
  Landmark, Hotel, BarChart3, Scale, Clock
} from 'lucide-react';

const toolCategories = [
  {
    title: 'Immobilier',
    tools: [
      { name: 'Frais de Notaire', href: '/pretaxe', icon: Receipt, color: 'text-blue-600' },
      { name: 'Plus-Value Immobilière', href: '/plusvalue', icon: TrendingUp, color: 'text-emerald-600' },
      { name: 'Simulateur Viager', href: '/viager', icon: HeartHandshake, color: 'text-orange-600' },
      { name: 'Investissement Locatif', href: '/investissement-locatif', icon: BarChart3, color: 'text-cyan-600' },
      { name: 'Capacité d’emprunt', href: '/capacite-emprunt', icon: Landmark, color: 'text-indigo-600' },
      { name: 'Achat, location et revente', href: '/strategie-immobiliere', icon: Building, color: 'text-purple-600' },
      { name: 'Relance logement', href: '/relance-logement', icon: Home, color: 'text-teal-600' },
      { name: 'Guides pratiques', href: '/guides', icon: Calculator, color: 'text-indigo-600' },
      { name: 'Prêt Immobilier', href: '/pret', icon: Landmark, color: 'text-indigo-600' },
    ]
  },
  {
    title: 'Fiscalité',
    tools: [
      { name: 'Revenus Fonciers', href: '/revenus-fonciers', icon: Home, color: 'text-violet-600' },
      { name: 'LMNP / LMP', href: '/lmnp', icon: Hotel, color: 'text-pink-600' },
      { name: 'Calcul IFI', href: '/ifi', icon: Scale, color: 'text-amber-600' },
      { name: 'Plus-Value Pro', href: '/plusvalue-pro', icon: Award, color: 'text-red-600' },
    ]
  },
  {
    title: 'Patrimoine',
    tools: [
      { name: 'Simulateur SCI', href: '/sci', icon: Building, color: 'text-purple-600' },
      { name: 'Droits de succession', href: '/succession', icon: Gift, color: 'text-rose-600' },
      { name: 'Donation', href: '/donation', icon: Gift, color: 'text-rose-600' },
      { name: 'Holding Patrimoniale', href: '/holding', icon: Briefcase, color: 'text-slate-600' },
      { name: 'Assurance-Vie', href: '/assurance-vie', icon: Shield, color: 'text-teal-600' },
    ]
  },
  {
    title: 'Entreprise & Prévoyance',
    tools: [
      { name: 'Statut Juridique', href: '/statut-juridique', icon: Scale, color: 'text-sky-600' },
      { name: 'Simulateur Retraite', href: '/retraite', icon: Clock, color: 'text-lime-600' },
    ]
  }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-3 group">
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
              </Link>

              <nav className="hidden lg:flex items-center gap-6" aria-label="Navigation principale">
                  <a
                    href="/pretaxe"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    <Receipt className="w-4 h-4" />
                    Frais de Notaire
                  </a>
                  <a
                    href="/sci"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    <Building className="w-4 h-4" />
                    SCI
                  </a>
                  <a
                    href="/donation"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    <Gift className="w-4 h-4" />
                    Donation
                  </a>

                  {/* Mega menu Outils */}
                  <div
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium transition"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-expanded={dropdownOpen}
                      aria-controls="outils-desktop"
                    >
                      Tous les outils
                      <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div id="outils-desktop" className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[700px] max-h-[calc(100vh-110px)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 grid grid-cols-2 gap-6">
                        {toolCategories.map((category) => (
                          <div key={category.title}>
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">{category.title}</p>
                            <div className="space-y-1">
                              {category.tools.map((tool) => (
                                <a
                                  key={tool.href}
                                  href={tool.href}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition group"
                                  onClick={() => setDropdownOpen(false)}
                                >
                                  <div className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-50 rounded-lg flex items-center justify-center transition">
                                    <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">{tool.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
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
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-3 hover:bg-gray-100 rounded-lg transition"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="navigation-mobile"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div id="navigation-mobile" className="lg:hidden fixed inset-0 z-40 bg-white pt-20 overflow-y-auto">
          <nav className="flex flex-col p-6 space-y-2">
            {toolCategories.map((category) => (
              <div key={category.title}>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-4 mb-2 px-3">{category.title}</p>
                {category.tools.map((tool) => (
                  <a
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-3 py-3 px-3 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-50 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <tool.icon className={`w-5 h-5 ${tool.color}`} />
                    {tool.name}
                  </a>
                ))}
              </div>
            ))}
            <hr className="my-4" />
            <a
              href="https://github.com/Interne52105110/notariaprime"
              className="flex items-center gap-2 text-base font-medium text-gray-900 py-2 px-3"
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
