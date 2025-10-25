// ============================================
// FILE: src/app/ifi/page.tsx
// DESCRIPTION: Calculateur IFI intégré à NotariaPrime
// ============================================

"use client";

import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Building2, 
  TrendingUp, 
  Calculator, 
  PieChart as PieChartIcon,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Landmark,
  Percent,
  Euro,
  Plus,
  Trash2,
  Shield
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// ✅ Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

interface Bien {
  id: number;
  type: 'residence_principale' | 'residence_secondaire' | 'locatif' | 'sci' | 'autre';
  nom: string;
  valeur: string;
  dette: string;
}

interface ResultatIFI {
  patrimoineTotal: number;
  abattementRP: number;
  dettesDeductibles: number;
  patrimoineNetTaxable: number;
  ifi: number;
  tauxMoyen: number;
  details: DetailTranche[];
  decote: number;
  ifiApresDecote: number;
}

interface DetailTranche {
  tranche: string;
  base: number;
  taux: number;
  montant: number;
}

// ============================================
// CONSTANTES
// ============================================

const BAREME_IFI = [
  { min: 0, max: 800000, taux: 0 },
  { min: 800000, max: 1300000, taux: 0.005 },
  { min: 1300000, max: 2570000, taux: 0.007 },
  { min: 2570000, max: 5000000, taux: 0.01 },
  { min: 5000000, max: 10000000, taux: 0.0125 },
  { min: 10000000, max: Infinity, taux: 0.015 }
];

const ABATTEMENT_RP = 0.30;
const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function parseNumber(str: string): number {
  if (!str || str.trim() === '') return 0;
  // Enlever TOUS les espaces (normaux, insécables, etc.)
  let cleaned = str.replace(/\s+/g, '');
  cleaned = cleaned.replace(/\u00A0/g, ''); // espace insécable
  cleaned = cleaned.replace(/\u202F/g, ''); // espace fine insécable
  // Remplacer virgule par point
  cleaned = cleaned.replace(',', '.');
  // Enlever tout ce qui n'est pas chiffre, point ou moins
  cleaned = cleaned.replace(/[^\d.-]/g, '');
  
  const result = parseFloat(cleaned);
  
  console.log(`parseNumber("${str}") => cleaned: "${cleaned}" => result: ${result}`);
  
  return isNaN(result) ? 0 : result;
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerIFI(biens: Bien[]): ResultatIFI {
  let patrimoineTotal = 0;
  let abattementRP = 0;
  let dettesDeductibles = 0;

  biens.forEach(bien => {
    const valeur = parseNumber(bien.valeur);
    const dette = parseNumber(bien.dette);
    
    patrimoineTotal += valeur;
    
    if (bien.type === 'residence_principale') {
      abattementRP += valeur * ABATTEMENT_RP;
    }
    
    dettesDeductibles += dette;
  });

  const patrimoineNetTaxable = Math.max(0, patrimoineTotal - abattementRP - dettesDeductibles);
  
  let ifi = 0;
  const details: DetailTranche[] = [];

  // RÈGLE OFFICIELLE : IFI applicable uniquement si patrimoine ≥ 1 300 000 €
  // Mais le calcul se fait sur la part au-dessus de 800 000 €
  if (patrimoineNetTaxable >= 1300000) {
    for (const tranche of BAREME_IFI) {
      if (patrimoineNetTaxable > tranche.min) {
        const base = Math.min(patrimoineNetTaxable, tranche.max) - tranche.min;
        if (base > 0) {
          const montant = base * tranche.taux;
          ifi += montant;
          details.push({
            tranche: `${formatEuros(tranche.min)} - ${tranche.max === Infinity ? '+' : formatEuros(tranche.max)}`,
            base,
            taux: tranche.taux * 100,
            montant
          });
        }
      }
    }
  }

  // Calcul de la décote pour patrimoine entre 1 300 000 € et 1 400 000 €
  let decote = 0;
  let ifiApresDecote = ifi;
  if (patrimoineNetTaxable >= 1300000 && patrimoineNetTaxable <= 1400000) {
    decote = 17500 - (patrimoineNetTaxable * 0.0125);
    ifiApresDecote = Math.max(0, ifi - decote);
  }

  const tauxMoyen = patrimoineNetTaxable > 0 && ifiApresDecote > 0 
    ? (ifiApresDecote / patrimoineNetTaxable) * 100 
    : 0;

  return {
    patrimoineTotal,
    abattementRP,
    dettesDeductibles,
    patrimoineNetTaxable,
    ifi,
    tauxMoyen,
    details,
    decote,
    ifiApresDecote
  };
}

function formatEuros(montant: number): string {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant);
}

function formatPourcentage(valeur: number): string {
  return `${valeur.toFixed(3)} %`;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function CalculateurIFI() {
  const [biens, setBiens] = useState<Bien[]>([
    { id: 1, type: 'residence_principale', nom: 'Résidence principale', valeur: '', dette: '' }
  ]);
  const [results, setResults] = useState<ResultatIFI | null>(null);

  // ============================================
  // HANDLERS
  // ============================================

  const formatMontant = (value: string): string => {
    // Enlever tout sauf les chiffres
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    // Formater avec des espaces tous les 3 chiffres
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const ajouterBien = () => {
    const nouveauId = Math.max(...biens.map(b => b.id), 0) + 1;
    setBiens([...biens, { 
      id: nouveauId, 
      type: 'autre', 
      nom: `Bien ${nouveauId}`, 
      valeur: '', 
      dette: '' 
    }]);
  };

  const supprimerBien = (id: number) => {
    if (biens.length > 1) {
      setBiens(biens.filter(b => b.id !== id));
    }
  };

  const modifierBien = (id: number, champ: keyof Bien, valeur: any) => {
    setBiens(biens.map(b => 
      b.id === id ? { ...b, [champ]: valeur } : b
    ));
  };

  const calculer = () => {
    console.log('🔍 Calcul IFI - Biens:', biens);
    biens.forEach(bien => {
      console.log(`Bien "${bien.nom}":`, {
        valeurBrute: bien.valeur,
        valeurParsée: parseNumber(bien.valeur),
        detteBrute: bien.dette,
        detteParsée: parseNumber(bien.dette),
        type: bien.type
      });
    });
    
    const result = calculerIFI(biens);
    console.log('📊 Résultat IFI:', result);
    setResults(result);
  };

  const reinitialiser = () => {
    setBiens([{ id: 1, type: 'residence_principale', nom: 'Résidence principale', valeur: '', dette: '' }]);
    setResults(null);
  };

  // ============================================
  // DONNÉES POUR GRAPHIQUES
  // ============================================

  const donneesPatrimoine = useMemo(() => {
    if (!results) return [];
    
    const data = [];
    if (results.abattementRP > 0) {
      data.push({ name: 'Abattement RP (30%)', value: results.abattementRP });
    }
    if (results.dettesDeductibles > 0) {
      data.push({ name: 'Dettes déductibles', value: results.dettesDeductibles });
    }
    data.push({ name: 'Patrimoine net taxable', value: results.patrimoineNetTaxable });
    
    return data;
  }, [results]);

  const donneesTranches = useMemo(() => {
    if (!results || results.details.length === 0) return [];
    return results.details.map(d => ({
      tranche: d.tranche,
      montant: d.montant
    }));
  }, [results]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <MainLayout showFeedback={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* ============================================ */}
          {/* HEADER */}
          {/* ============================================ */}
          
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Landmark className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Calculateur IFI
                  </h1>
                  <p className="text-gray-600 font-medium mt-1">
                    Impôt sur la Fortune Immobilière • Barème 2025
                  </p>
                </div>
              </div>
              
              {results && (
                <div className="text-right">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
                    <p className="text-sm text-emerald-700 font-semibold">IFI à payer</p>
                    <p className="text-3xl font-bold text-emerald-900">
                      {formatEuros(results.ifiApresDecote)}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Taux moyen : {formatPourcentage(results.tauxMoyen)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* FORMULAIRE */}
          {/* ============================================ */}
          
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Colonne gauche : Formulaire */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Introduction */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-semibold">Seuil d'imposition IFI</p>
                    <p>
                      <strong>Vous êtes redevable de l'IFI uniquement si votre patrimoine immobilier net taxable 
                      dépasse 1 300 000 €</strong> au 1er janvier. Si c'est le cas, l'IFI est calculé sur toute 
                      la part de votre patrimoine qui dépasse 800 000 €. Une décote s'applique entre 1 300 000 € 
                      et 1 400 000 €.
                    </p>
                  </div>
                </div>
              </div>

              {/* Liste des biens */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Home className="w-7 h-7 text-emerald-600" />
                  Patrimoine immobilier
                </h2>
                
                <div className="space-y-4">
                  {biens.map((bien) => (
                    <div key={bien.id} className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <input
                          type="text"
                          value={bien.nom}
                          onChange={(e) => modifierBien(bien.id, 'nom', e.target.value)}
                          className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
                          placeholder="Nom du bien"
                        />
                        {biens.length > 1 && (
                          <button
                            onClick={() => supprimerBien(bien.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                            title="Supprimer ce bien"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type de bien
                          </label>
                          <select
                            value={bien.type}
                            onChange={(e) => modifierBien(bien.id, 'type', e.target.value as Bien['type'])}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                          >
                            <option value="residence_principale">🏠 Résidence principale (abattement 30%)</option>
                            <option value="residence_secondaire">🏖️ Résidence secondaire</option>
                            <option value="locatif">🔑 Bien locatif</option>
                            <option value="sci">🏢 Parts de SCI</option>
                            <option value="autre">📍 Autre bien immobilier</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Valeur vénale (€)
                            </label>
                            <input
                              type="text"
                              value={bien.valeur}
                              onChange={(e) => {
                                const formatted = formatMontant(e.target.value);
                                modifierBien(bien.id, 'valeur', formatted);
                              }}
                              placeholder="500 000"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Dette déductible (€)
                            </label>
                            <input
                              type="text"
                              value={bien.dette}
                              onChange={(e) => {
                                const formatted = formatMontant(e.target.value);
                                modifierBien(bien.id, 'dette', formatted);
                              }}
                              placeholder="200 000"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={ajouterBien}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border-2 border-emerald-200 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un bien
                </button>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <button
                  onClick={calculer}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
                >
                  <Calculator className="w-6 h-6" />
                  Calculer l'IFI
                </button>
                <button
                  onClick={reinitialiser}
                  className="px-6 py-5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Colonne droite : Résumé et infos */}
            <div className="space-y-6">
              
              {/* Barème IFI */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Percent className="w-6 h-6 text-emerald-600" />
                  Barème IFI 2025
                </h3>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-blue-900 font-semibold">
                    ℹ️ Seuil d'imposition : 1 300 000 €<br />
                    Si votre patrimoine dépasse ce seuil, l'IFI se calcule dès 800 000 €
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Jusqu'à 800 000 €</span>
                    <span className="font-semibold text-gray-900">0 %</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">800 001 € à 1,3 M€</span>
                    <span className="font-semibold text-emerald-600">0,50 %</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">1,3 M€ à 2,57 M€</span>
                    <span className="font-semibold text-emerald-600">0,70 %</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">2,57 M€ à 5 M€</span>
                    <span className="font-semibold text-orange-600">1,00 %</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">5 M€ à 10 M€</span>
                    <span className="font-semibold text-orange-600">1,25 %</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Au-delà de 10 M€</span>
                    <span className="font-semibold text-red-600">1,50 %</span>
                  </div>
                </div>
              </div>

              {/* Biens concernés */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                  Biens concernés
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Immeubles bâtis et non bâtis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Parts de SCI, SCPI, OPCI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Biens détenus via sociétés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Biens à l'étranger</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Biens professionnels</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* RÉSULTATS */}
          {/* ============================================ */}
          
          {results && (
            <div className="mt-8 space-y-6">
              
              {/* Verdict principal */}
              <div className={`rounded-2xl p-8 border-4 ${
                results.patrimoineNetTaxable < 800000
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                  : results.patrimoineNetTaxable < 1300000
                  ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300'
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
              }`}>
                <div className="text-center">
                  {results.patrimoineNetTaxable < 800000 ? (
                    <>
                      <p className="text-sm font-semibold text-gray-600 mb-2">✅ Résultat fiscal</p>
                      <p className="text-4xl font-black mb-4 text-green-600">
                        Non imposable à l'IFI
                      </p>
                      <p className="text-lg text-gray-700">
                        Votre patrimoine net taxable ({formatEuros(results.patrimoineNetTaxable)}) 
                        est inférieur au seuil de 800 000 €
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-600 mb-2">💰 IFI calculé</p>
                      <p className="text-5xl font-black mb-4" style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        {formatEuros(results.ifiApresDecote)}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        Patrimoine net taxable : {formatEuros(results.patrimoineNetTaxable)}
                      </p>
                      <p className="text-lg text-gray-700">
                        Taux moyen effectif : {formatPourcentage(results.tauxMoyen)}
                      </p>
                      {results.decote > 0 && (
                        <div className="mt-4 inline-block bg-white/50 px-4 py-2 rounded-lg">
                          <p className="text-sm text-emerald-700">
                            Décote appliquée : {formatEuros(results.decote)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Détails du patrimoine */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Détails chiffrés */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-100 p-6">
                  <h3 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Euro className="w-6 h-6" />
                    Détails du patrimoine
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-semibold text-blue-900 mb-2">📝 Détail du calcul</p>
                    </div>
                    
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-700">Patrimoine brut total</span>
                      <span className="font-bold text-gray-900">
                        {formatEuros(results.patrimoineTotal)}
                      </span>
                    </div>
                    
                    {results.abattementRP > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-green-700">
                          Abattement résidence principale (30%)
                        </span>
                        <span className="font-bold text-green-600">
                          - {formatEuros(results.abattementRP)}
                        </span>
                      </div>
                    )}
                    
                    {results.dettesDeductibles > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-green-700">Dettes déductibles</span>
                        <span className="font-bold text-green-600">
                          - {formatEuros(results.dettesDeductibles)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-3 border-t-2 border-emerald-300 bg-emerald-50 px-3 py-2 rounded-lg">
                      <span className="font-bold text-lg text-emerald-900">Patrimoine net taxable</span>
                      <span className="font-bold text-2xl text-emerald-600">
                        {formatEuros(results.patrimoineNetTaxable)}
                      </span>
                    </div>

                    {results.details.length > 0 && (
                      <>
                        <div className="flex justify-between py-2 border-t-2 border-gray-300 mt-4 pt-4">
                          <span className="text-gray-700">IFI brut calculé</span>
                          <span className="font-bold text-gray-900">
                            {formatEuros(results.ifi)}
                          </span>
                        </div>
                        
                        {results.decote > 0 && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-green-700">Décote (1,3M€ - 1,4M€)</span>
                            <span className="font-bold text-green-600">
                              - {formatEuros(results.decote)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between pt-2 bg-red-50 px-3 py-2 rounded-lg border-2 border-red-200">
                          <span className="font-bold text-red-900">IFI à payer</span>
                          <span className="font-bold text-xl text-red-600">
                            {formatEuros(results.ifiApresDecote)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Graphique répartition patrimoine */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-6 h-6 text-emerald-600" />
                    Répartition du patrimoine
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={donneesPatrimoine}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${formatEuros(value as number)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {donneesPatrimoine.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatEuros(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Calcul par tranches */}
              {results.details.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                    Calcul de l'IFI par tranches
                  </h3>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donneesTranches}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="tranche" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatEuros(value)} />
                      <Bar dataKey="montant" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-2">
                    {results.details.map((detail, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-900">{detail.tranche}</span>
                          <span className="text-sm text-emerald-600 font-semibold">
                            {formatPourcentage(detail.taux)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Base : {formatEuros(detail.base)}
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatEuros(detail.montant)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alertes informatives */}
              {results.patrimoineNetTaxable < 1300000 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-sm text-green-900">
                      <p className="font-semibold">✅ Non imposable à l'IFI</p>
                      <p>
                        Votre patrimoine immobilier net taxable ({formatEuros(results.patrimoineNetTaxable)}) 
                        est inférieur au seuil d'imposition de 1 300 000 €. Vous n'avez aucun IFI à payer.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {results.patrimoineNetTaxable >= 1300000 && results.patrimoineNetTaxable <= 1400000 && results.decote > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-sm text-blue-900">
                      <p className="font-semibold">Décote appliquée</p>
                      <p>
                        Votre patrimoine se situe entre 1 300 000 € et 1 400 000 €. Une décote de {formatEuros(results.decote)} 
                        a été appliquée selon la formule : 17 500 € - (1,25% × {formatEuros(results.patrimoineNetTaxable)}) 
                        = {formatEuros(results.decote)}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {results.patrimoineNetTaxable > 1400000 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-sm text-blue-900">
                      <p className="font-semibold">Calcul de l'IFI</p>
                      <p>
                        Votre IFI est calculé sur la part de votre patrimoine qui dépasse 800 000 €, 
                        soit {formatEuros(results.patrimoineNetTaxable - 800000)}, en appliquant le barème progressif.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* FAQ */}
          {/* ============================================ */}
          
          <div className="mt-12">
            <FAQSection />
          </div>

          {/* ============================================ */}
          {/* DISCLAIMER */}
          {/* ============================================ */}
          
          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="space-y-2 text-sm text-amber-900">
                <p className="font-semibold text-lg">Avertissement légal</p>
                <p>
                  Ce calculateur est fourni à titre informatif uniquement et ne constitue pas un conseil fiscal. 
                  Les résultats sont des estimations basées sur les informations fournies et le barème IFI 2025. 
                </p>
                <p>
                  L'IFI est un impôt complexe avec de nombreuses règles spécifiques (plafonnement, exonérations 
                  particulières, cas de démembrement, etc.) qui ne sont pas toutes prises en compte dans ce 
                  calculateur simplifié.
                </p>
                <p className="font-semibold">
                  Pour une analyse personnalisée de votre situation fiscale, consultez un expert-comptable, 
                  un notaire ou un conseiller en gestion de patrimoine.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

// ============================================
// COMPOSANT FAQ
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Principe et champ d'application",
      questions: [
        {
          q: "Qu'est-ce que l'IFI ?",
          r: "L'Impôt sur la Fortune Immobilière (IFI) a remplacé l'ISF depuis le 1er janvier 2018. Vous devez payer l'IFI si votre patrimoine immobilier net taxable dépasse 1 300 000 € au 1er janvier. L'IFI est alors calculé sur toute la part de votre patrimoine qui dépasse 800 000 €, en appliquant un barème progressif par tranches. Une décote s'applique pour les patrimoines entre 1 300 000 € et 1 400 000 €. L'IFI taxe uniquement les actifs immobiliers : biens immobiliers détenus directement, parts de SCI, SCPI, OPCI pour leur fraction immobilière. (Articles 964 et suivants du CGI)"
        },
        {
          q: "Quels biens sont soumis à l'IFI ?",
          r: "Sont soumis à l'IFI : les immeubles bâtis et non bâtis détenus directement, les parts de SCI et sociétés immobilières, les parts de SCPI et OPCI pour leur quote-part immobilière, les immeubles ou droits immobiliers détenus indirectement via des structures, et les immeubles en cours de construction. La valeur à retenir est la valeur vénale au 1er janvier, c'est-à-dire le prix qui pourrait être obtenu dans des conditions normales de marché. (Article 965 du CGI)"
        },
        {
          q: "Quel est le barème de l'IFI en 2025 ?",
          r: "Le seuil d'imposition de l'IFI est de 1 300 000 €. Si votre patrimoine dépasse ce seuil, l'IFI est calculé sur toute la part au-dessus de 800 000 € selon le barème progressif suivant : de 800 001 € à 1 300 000 € : 0,5%, de 1 300 001 € à 2 570 000 € : 0,7%, de 2 570 001 € à 5 000 000 € : 1%, de 5 000 001 € à 10 000 000 € : 1,25%, au-delà de 10 000 000 € : 1,5%. Une décote s'applique pour les patrimoines entre 1 300 000 € et 1 400 000 € : 17 500 € - (1,25% × patrimoine net taxable). Exemple : avec 1 350 000 € de patrimoine, IFI brut = 2 850 €, décote = 625 €, IFI net = 2 225 €. (Article 977 du CGI)"
        }
      ]
    },
    {
      category: "Exonérations et abattements",
      questions: [
        {
          q: "Quel abattement pour la résidence principale ?",
          r: "La résidence principale bénéficie d'un abattement de 30% sur sa valeur vénale. Cet abattement automatique s'applique uniquement si le bien constitue effectivement la résidence habituelle et principale du redevable au 1er janvier. En cas d'indivision, l'abattement s'applique sur la quote-part de chaque indivisaire qui occupe le bien à titre de résidence principale. Pour un couple marié, un seul bien peut bénéficier de cet abattement. (Article 973 du CGI)"
        },
        {
          q: "Les biens professionnels sont-ils exonérés ?",
          r: "Oui, les biens immobiliers affectés à l'activité professionnelle principale sont totalement exonérés d'IFI sous conditions strictes. Le bien doit être utilisé dans le cadre d'une profession industrielle, commerciale, artisanale, agricole ou libérale exercée à titre principal. Pour les dirigeants de société, il faut exercer effectivement des fonctions de direction, percevoir une rémunération normale représentant plus de 50% des revenus professionnels du foyer, et détenir au moins 25% des droits de vote. (Article 975 du CGI)"
        },
        {
          q: "Peut-on déduire les dettes immobilières ?",
          r: "Oui, les dettes contractées pour l'acquisition, la construction, la réparation ou l'amélioration des biens immobiliers imposables sont déductibles de l'actif immobilier. Seul le capital restant dû au 1er janvier est déductible (pas les intérêts futurs). Les emprunts in fine sont déductibles pour leur montant total jusqu'au remboursement. Attention : depuis 2018, les dettes afférentes à un bien exonéré ne sont plus déductibles. (Article 974 du CGI)"
        }
      ]
    },
    {
      category: "Cas particuliers",
      questions: [
        {
          q: "Comment valoriser les parts de SCI ?",
          r: "Les parts de SCI sont valorisées à hauteur de la valeur vénale réelle de l'actif net de la société au 1er janvier, proportionnellement aux droits détenus. Il faut prendre la valeur vénale des immeubles, soustraire les dettes de la SCI, et appliquer sa quote-part. Une décote pour illiquidité peut être appliquée (généralement 10 à 20%) si les statuts prévoient des clauses d'agrément strictes limitant la cession. Cette décote doit être justifiée et raisonnable. (Article 965 du CGI et doctrine BOFiP)"
        },
        {
          q: "Quid des biens immobiliers détenus à l'étranger ?",
          r: "Les résidents fiscaux français doivent déclarer leurs biens immobiliers situés à l'étranger dans leur IFI. La valeur vénale s'apprécie selon les règles du pays de situation. Pour éviter la double imposition, l'impôt étranger sur la fortune immobilière payé est imputable sur l'IFI français dans la limite de l'IFI français afférent aux biens situés hors de France. Il faut joindre les justificatifs de l'impôt étranger acquitté. (Article 976 du CGI)"
        },
        {
          q: "Comment déclarer les immeubles en démembrement ?",
          r: "En cas de démembrement de propriété (usufruit/nue-propriété), la valeur du bien est répartie selon l'âge de l'usufruitier d'après le barème fiscal. Moins de 21 ans : usufruit 90%, nue-propriété 10%. De 21 à 30 ans : 80%/20%. De 31 à 40 ans : 70%/30%, etc. Chaque titulaire de droits déclare sa quote-part. L'usufruitier déclare la valeur de l'usufruit, le nu-propriétaire déclare la valeur de la nue-propriété. Les dettes sont déductibles au prorata des droits détenus. (Article 669 du CGI appliqué par analogie)"
        }
      ]
    },
    {
      category: "Optimisation et stratégies",
      questions: [
        {
          q: "Quelles stratégies pour réduire l'IFI ?",
          r: "Plusieurs leviers existent : optimiser l'endettement en maintenant des crédits immobiliers (le capital restant dû est déductible), démembrer la propriété via donation en nue-propriété pour sortir la valeur de l'usufruit de l'assiette, investir dans des biens professionnels exonérés, transformer du patrimoine immobilier en patrimoine mobilier (non taxable à l'IFI), utiliser des structures de détention avec des clauses d'agrément pour justifier une décote, ou investir dans des SCPI de rendement avec effet de levier. Attention : les opérations doivent avoir une substance économique réelle. (Doctrine fiscale)"
        },
        {
          q: "Le plafonnement de l'IFI existe-t-il encore ?",
          r: "Oui, un mécanisme de plafonnement existe mais il est très restrictif. Le total de l'IFI et des impôts dus au titre des revenus et gains de l'année précédente ne peut excéder 75% des revenus nets de l'année précédente. Le plafonnement s'applique rarement car il faut des revenus faibles par rapport au patrimoine. Les revenus exonérés ou soumis à prélèvement libératoire ne sont pas retenus. La demande de plafonnement se fait lors de la déclaration. (Article 979 du CGI)"
        }
      ]
    },
    {
      category: "Déclaration et paiement",
      questions: [
        {
          q: "Quand et comment déclarer l'IFI ?",
          r: "L'IFI se déclare en même temps que la déclaration de revenus, entre avril et juin selon votre département. La déclaration n°2042-IFI doit être jointe à la déclaration de revenus. Pour les patrimoines supérieurs à 2 570 000 €, une déclaration annexe détaillée (n°2042-IFI-COT) est obligatoire avec le détail des biens et de leur valorisation. La déclaration est obligatoirement dématérialisée sur impots.gouv.fr. En cas de changement de situation matrimoniale, des règles spécifiques s'appliquent. (Article 982 du CGI)"
        },
        {
          q: "Quand faut-il payer l'IFI ?",
          r: "L'IFI est payable en une seule fois, en septembre de l'année de déclaration (généralement autour du 15 septembre). Le paiement se fait par prélèvement automatique ou en ligne sur impots.gouv.fr. Il n'y a pas de mensualisation possible contrairement à l'impôt sur le revenu. En cas de retard ou défaut de déclaration, des pénalités de 10% à 40% s'appliquent, ainsi que des intérêts de retard de 0,20% par mois. Un contrôle fiscal peut remonter sur 3 ans (6 ans en cas de manquement délibéré). (Article 1727 et suivants du CGI)"
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-emerald-600" />
          Questions fréquentes sur l'IFI
        </h2>
        <p className="text-gray-600 mt-2">
          Tout ce que vous devez savoir sur l'Impôt sur la Fortune Immobilière
        </p>
      </div>

      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8 last:mb-0">
          <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {category.category}
          </h3>
          <div className="space-y-3">
            {category.questions.map((faq, questionIndex) => {
              const globalIndex = categoryIndex * 100 + questionIndex;
              const isOpen = openIndex === globalIndex;
              
              return (
                <div
                  key={questionIndex}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 bg-gray-50 border-t-2 border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.r}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}