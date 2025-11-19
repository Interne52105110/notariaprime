// ============================================
// FILE: src/app/pret/page.tsx
// DESCRIPTION: Calculateur de Prêt Immobilier - NotariaPrime
// VERSION: 2.1 - Optimisée et corrigée
// ============================================

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Home, 
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
  Calendar,
  CreditCard,
  TrendingDown,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

// ✅ Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

interface FormData {
  montant: string;
  duree: number; // en années
  tauxAnnuel: string; // en %
  tauxAssurance: string; // en % du capital
  fraisDossier: string;
}

interface Mensualite {
  numero: number;
  capital: number;
  interets: number;
  assurance: number;
  total: number;
  capitalRestant: number;
}

interface ResultatPret {
  montantEmprunte: number;
  dureeAnnees: number;
  dureeMois: number;
  tauxAnnuel: number;
  tauxMensuel: number;
  tauxAssurance: number;
  
  mensualiteHorsAssurance: number;
  mensualiteAssurance: number;
  mensualiteTotale: number;
  
  totalInterets: number;
  totalAssurance: number;
  totalFrais: number;
  coutTotal: number;
  
  tableauAmortissement: Mensualite[];
}

interface DataRepartition {
  name: string;
  value: number;
  color: string;
}

interface DataEvolution {
  annee: string;
  capital: number;
  interets: number;
  capitalRestant: number;
}

// ============================================
// CONSTANTES - TAUX DE RÉFÉRENCE OCTOBRE 2025
// ============================================

const TAUX_REFERENCE = {
  "10": { min: 2.80, moyen: 2.95, max: 3.10 },
  "15": { min: 2.90, moyen: 3.04, max: 3.20 },
  "20": { min: 2.95, moyen: 3.12, max: 3.30 },
  "25": { min: 3.00, moyen: 3.20, max: 3.40 }
} as const;

const TAUX_VARIABLE_EURIBOR = 2.02; // Euribor 3M août 2025
const MARGE_BANQUE_VARIABLE = 1.5; // Marge moyenne
const TAUX_VARIABLE_INDICATIF = TAUX_VARIABLE_EURIBOR + MARGE_BANQUE_VARIABLE; // 3.52%

const COLORS_CHART = {
  capital: '#10b981',
  interets: '#f59e0b',
  assurance: '#6366f1'
} as const;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function parseNumber(str: string): number {
  if (!str || str.trim() === '') return 0;
  let cleaned = str.replace(/\s+/g, '');
  cleaned = cleaned.replace(/\u00A0/g, '');
  cleaned = cleaned.replace(/\u202F/g, '');
  cleaned = cleaned.replace(',', '.');
  cleaned = cleaned.replace(/[^\d.-]/g, '');
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

function formatEuros(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatEurosDecimal(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ============================================
// FONCTION DE CALCUL PRINCIPAL
// ============================================

function calculerPret(formData: FormData): ResultatPret {
  const montantEmprunte = parseNumber(formData.montant);
  const dureeAnnees = formData.duree;
  const dureeMois = dureeAnnees * 12;
  const tauxAnnuel = parseNumber(formData.tauxAnnuel);
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const tauxAssurance = parseNumber(formData.tauxAssurance);
  const fraisDossier = parseNumber(formData.fraisDossier);

  // Mensualité hors assurance (formule classique)
  let mensualiteHorsAssurance = 0;
  if (tauxMensuel > 0) {
    mensualiteHorsAssurance = 
      (montantEmprunte * tauxMensuel) / 
      (1 - Math.pow(1 + tauxMensuel, -dureeMois));
  } else {
    mensualiteHorsAssurance = montantEmprunte / dureeMois;
  }

  // Assurance mensuelle (sur capital initial)
  const mensualiteAssurance = (montantEmprunte * tauxAssurance / 100) / 12;
  
  const mensualiteTotale = mensualiteHorsAssurance + mensualiteAssurance;

  // Tableau d'amortissement
  const tableauAmortissement: Mensualite[] = [];
  let capitalRestant = montantEmprunte;

  for (let i = 1; i <= dureeMois; i++) {
    const interets = capitalRestant * tauxMensuel;
    const capital = mensualiteHorsAssurance - interets;
    const assurance = mensualiteAssurance;
    const total = capital + interets + assurance;
    
    capitalRestant -= capital;
    
    // Éviter les valeurs négatives dues aux arrondis
    if (capitalRestant < 0.01) capitalRestant = 0;

    tableauAmortissement.push({
      numero: i,
      capital,
      interets,
      assurance,
      total,
      capitalRestant
    });
  }

  const totalInterets = tableauAmortissement.reduce((sum, m) => sum + m.interets, 0);
  const totalAssurance = mensualiteAssurance * dureeMois;
  const totalFrais = fraisDossier;
  const coutTotal = montantEmprunte + totalInterets + totalAssurance + totalFrais;

  return {
    montantEmprunte,
    dureeAnnees,
    dureeMois,
    tauxAnnuel,
    tauxMensuel: tauxMensuel * 100,
    tauxAssurance,
    mensualiteHorsAssurance,
    mensualiteAssurance,
    mensualiteTotale,
    totalInterets,
    totalAssurance,
    totalFrais,
    coutTotal,
    tableauAmortissement
  };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function CalculateurPret() {
  const [formData, setFormData] = useState<FormData>({
    montant: '200000',
    duree: 20,
    tauxAnnuel: '3.12',
    tauxAssurance: '0.36',
    fraisDossier: '1000'
  });

  const [afficherTableau, setAfficherTableau] = useState(false);

  // ✅ OPTIMISATION: useCallback pour éviter recréation fonction
  const suggereTaux = useCallback((duree: number) => {
    const dureeStr = duree.toString() as keyof typeof TAUX_REFERENCE;
    const taux = TAUX_REFERENCE[dureeStr];
    if (taux) {
      setFormData(prev => ({ ...prev, duree, tauxAnnuel: taux.moyen.toString() }));
    } else {
      setFormData(prev => ({ ...prev, duree }));
    }
  }, []);

  // ✅ OPTIMISATION: useMemo pour calcul
  const resultat = useMemo(() => calculerPret(formData), [formData]);

  // ✅ OPTIMISATION: useMemo pour données graphiques
  const dataRepartition: DataRepartition[] = useMemo(() => [
    { name: 'Capital', value: resultat.montantEmprunte, color: COLORS_CHART.capital },
    { name: 'Intérêts', value: resultat.totalInterets, color: COLORS_CHART.interets },
    { name: 'Assurance', value: resultat.totalAssurance, color: COLORS_CHART.assurance }
  ], [resultat.montantEmprunte, resultat.totalInterets, resultat.totalAssurance]);

  // ✅ OPTIMISATION: useMemo pour évolution annuelle
  const dataEvolution: DataEvolution[] = useMemo(() => {
    const data: DataEvolution[] = [];
    for (let annee = 1; annee <= resultat.dureeAnnees; annee++) {
      const debut = (annee - 1) * 12;
      const fin = annee * 12;
      const mensualitesAnnee = resultat.tableauAmortissement.slice(debut, fin);
      
      const capitalAnnee = mensualitesAnnee.reduce((sum, m) => sum + m.capital, 0);
      const interetsAnnee = mensualitesAnnee.reduce((sum, m) => sum + m.interets, 0);
      const capitalRestant = mensualitesAnnee[mensualitesAnnee.length - 1]?.capitalRestant || 0;
      
      data.push({
        annee: `An ${annee}`,
        capital: Math.round(capitalAnnee),
        interets: Math.round(interetsAnnee),
        capitalRestant: Math.round(capitalRestant)
      });
    }
    return data;
  }, [resultat.tableauAmortissement, resultat.dureeAnnees]);

  // ✅ CORRECTION: Formatter pour Tooltip Recharts
  const tooltipFormatter = useCallback((value: number) => formatEuros(value), []);
  const yAxisFormatter = useCallback((value: number) => `${Math.round(value / 1000)}k€`, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Home className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-black text-gray-900">
                Calculateur de Prêt Immobilier
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Calcul de mensualités • Tableau d'amortissement • Barème 2025
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-700 bg-indigo-100 px-4 py-2 rounded-full w-fit mx-auto">
              <Info className="w-4 h-4" />
              Taux actualisés octobre 2025 selon Observatoire Crédit Logement
            </div>
          </div>

          {/* CARTE PRINCIPALE */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
            
            {/* FORMULAIRE */}
            <div className="space-y-6">
              
              {/* Montant emprunté */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Euro className="w-4 h-4 text-indigo-600" />
                  Montant emprunté (€)
                </label>
                <input
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                  placeholder="200000"
                />
              </div>

              {/* Durée du prêt */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Durée du prêt
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[10, 15, 20, 25].map(duree => (
                    <button
                      key={duree}
                      onClick={() => suggereTaux(duree)}
                      className={`px-4 py-3 rounded-xl font-bold transition-all ${
                        formData.duree === duree
                          ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {duree} ans
                    </button>
                  ))}
                </div>
              </div>

              {/* Taux d'intérêt */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-indigo-600" />
                  Taux d'intérêt annuel (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tauxAnnuel}
                    onChange={(e) => setFormData({ ...formData, tauxAnnuel: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                  />
                  {TAUX_REFERENCE[formData.duree.toString() as keyof typeof TAUX_REFERENCE] && (
                    <div className="mt-2 text-xs text-gray-600 bg-indigo-50 p-2 rounded-lg">
                      💡 Taux de référence {formData.duree} ans (oct. 2025) : 
                      <span className="font-bold text-indigo-700 ml-1">
                        {TAUX_REFERENCE[formData.duree.toString() as keyof typeof TAUX_REFERENCE].moyen}%
                      </span>
                      <span className="text-gray-500 ml-2">
                        (fourchette: {TAUX_REFERENCE[formData.duree.toString() as keyof typeof TAUX_REFERENCE].min}% - 
                        {TAUX_REFERENCE[formData.duree.toString() as keyof typeof TAUX_REFERENCE].max}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Taux assurance */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Taux d'assurance emprunteur (% du capital)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tauxAssurance}
                  onChange={(e) => setFormData({ ...formData, tauxAssurance: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.36"
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 Taux moyen : 0.30% - 0.40% (variable selon âge et profil)
                </p>
              </div>

              {/* Frais de dossier */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Frais de dossier (€)
                </label>
                <input
                  type="number"
                  value={formData.fraisDossier}
                  onChange={(e) => setFormData({ ...formData, fraisDossier: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1000"
                />
              </div>

            </div>
          </div>

          {/* RÉSULTATS PRINCIPAUX */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Mensualité */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-6 h-6" />
                <h3 className="text-lg font-bold">Mensualité totale</h3>
              </div>
              <p className="text-4xl font-black mb-2">
                {formatEurosDecimal(resultat.mensualiteTotale)}
              </p>
              <div className="text-sm opacity-90 space-y-1">
                <p>Dont capital + intérêts : {formatEurosDecimal(resultat.mensualiteHorsAssurance)}</p>
                <p>Dont assurance : {formatEurosDecimal(resultat.mensualiteAssurance)}</p>
              </div>
            </div>

            {/* Coût total */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Coût total du crédit</h3>
              </div>
              <p className="text-3xl font-black text-indigo-600 mb-2">
                {formatEuros(resultat.coutTotal)}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Capital : {formatEuros(resultat.montantEmprunte)}</p>
                <p>Intérêts : {formatEuros(resultat.totalInterets)}</p>
                <p>Assurance : {formatEuros(resultat.totalAssurance)}</p>
                <p>Frais : {formatEuros(resultat.totalFrais)}</p>
              </div>
            </div>

            {/* Taux effectif */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Percent className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Taux appliqués</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Taux nominal</p>
                  <p className="text-2xl font-bold text-indigo-600">{resultat.tauxAnnuel.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taux mensuel</p>
                  <p className="text-lg font-semibold text-gray-800">{resultat.tauxMensuel.toFixed(4)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="text-lg font-semibold text-gray-800">{resultat.dureeAnnees} ans ({resultat.dureeMois} mois)</p>
                </div>
              </div>
            </div>

          </div>

          {/* GRAPHIQUES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Répartition du coût */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-6 h-6 text-indigo-600" />
                Répartition du coût total
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataRepartition}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${formatEuros(props.value as number)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataRepartition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Évolution du capital restant */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-indigo-600" />
                Évolution du capital restant dû
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="annee" />
                  <YAxis tickFormatter={yAxisFormatter} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="capitalRestant" 
                    name="Capital restant" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Capital vs Intérêts par année */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-indigo-600" />
              Répartition Capital / Intérêts par année
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dataEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="annee" />
                <YAxis tickFormatter={yAxisFormatter} />
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
                <Bar dataKey="capital" name="Capital remboursé" fill={COLORS_CHART.capital} stackId="a" />
                <Bar dataKey="interets" name="Intérêts payés" fill={COLORS_CHART.interets} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TABLEAU D'AMORTISSEMENT */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
            <button
              onClick={() => setAfficherTableau(!afficherTableau)}
              className="w-full flex items-center justify-between text-left mb-4"
            >
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Landmark className="w-6 h-6 text-indigo-600" />
                Tableau d'amortissement détaillé
              </h3>
              {afficherTableau ? (
                <ChevronUp className="w-6 h-6 text-indigo-600" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {afficherTableau && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-indigo-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-indigo-900">Mois</th>
                      <th className="px-4 py-3 text-right font-bold text-indigo-900">Capital</th>
                      <th className="px-4 py-3 text-right font-bold text-indigo-900">Intérêts</th>
                      <th className="px-4 py-3 text-right font-bold text-indigo-900">Assurance</th>
                      <th className="px-4 py-3 text-right font-bold text-indigo-900">Total</th>
                      <th className="px-4 py-3 text-right font-bold text-indigo-900">Capital restant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultat.tableauAmortissement.map((ligne, index) => (
                      <tr 
                        key={ligne.numero}
                        className={index % 12 === 0 ? 'bg-indigo-50 font-semibold' : 'hover:bg-gray-50'}
                      >
                        <td className="px-4 py-2 border-t">{ligne.numero}</td>
                        <td className="px-4 py-2 border-t text-right">{formatEurosDecimal(ligne.capital)}</td>
                        <td className="px-4 py-2 border-t text-right">{formatEurosDecimal(ligne.interets)}</td>
                        <td className="px-4 py-2 border-t text-right">{formatEurosDecimal(ligne.assurance)}</td>
                        <td className="px-4 py-2 border-t text-right font-semibold">{formatEurosDecimal(ligne.total)}</td>
                        <td className="px-4 py-2 border-t text-right text-indigo-700 font-semibold">
                          {formatEuros(ligne.capitalRestant)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* COMPARAISON TAUX FIXE VS VARIABLE */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-indigo-600" />
              Taux fixe vs Taux variable
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Taux Fixe (actuel)
                </h4>
                <p className="text-3xl font-black text-green-600 mb-2">{resultat.tauxAnnuel.toFixed(2)}%</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Sécurité : mensualités constantes</li>
                  <li>✅ Prévisibilité : budget maîtrisé</li>
                  <li>✅ Protection contre hausse des taux</li>
                  <li>⚠️ Pas de baisse si taux diminuent</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Taux Variable (indicatif)
                </h4>
                <p className="text-3xl font-black text-orange-600 mb-2">{TAUX_VARIABLE_INDICATIF.toFixed(2)}%</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>📊 Basé sur Euribor 3M + marge</li>
                  <li>⚡ Mensualités variables</li>
                  <li>📈 Risque de hausse importante</li>
                  <li>💡 Peu utilisé en France (1%)</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 bg-white rounded-lg p-3">
              <strong>💡 Recommandation :</strong> En octobre 2025, avec des taux fixes autour de 3%, 
              le taux fixe reste l'option la plus sécurisante pour la majorité des emprunteurs.
            </p>
          </div>

          {/* DISCLAIMER */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="space-y-3 text-sm text-gray-700">
                <h3 className="text-lg font-bold text-orange-900">Avertissement légal</h3>
                <p>
                  Ce calculateur est fourni à titre informatif uniquement et ne constitue pas une offre de prêt. 
                  Les résultats sont des estimations basées sur les informations fournies et les taux de référence 
                  d'octobre 2025 (Observatoire Crédit Logement/CSA).
                </p>
                <p>
                  Les taux réels proposés par les banques varient selon votre profil (apport, revenus, endettement, 
                  stabilité professionnelle), la région, et la stratégie commerciale de l'établissement. 
                  Une négociation peut permettre d'obtenir des conditions plus avantageuses.
                </p>
                <p className="font-semibold">
                  Pour obtenir une offre de prêt personnalisée, consultez un courtier en crédit immobilier 
                  ou contactez directement les établissements bancaires.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <FAQSection />

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
      category: "Taux et conditions",
      questions: [
        {
          q: "Comment sont déterminés les taux de référence affichés ?",
          r: "Les taux affichés proviennent de l'Observatoire Crédit Logement/CSA, référence du marché français. En octobre 2025, le taux moyen s'établit à 3,12% pour un prêt sur 20 ans. Les taux varient selon la durée : plus courte (10 ans : ~2,95%), ou plus longue (25 ans : ~3,20%). Ces taux sont des moyennes nationales et peuvent varier selon votre profil et votre région."
        },
        {
          q: "Quelle est la différence entre taux nominal et TAEG ?",
          r: "Le taux nominal est le taux d'intérêt pur du prêt, utilisé pour calculer vos mensualités. Le TAEG (Taux Annuel Effectif Global) inclut tous les frais : intérêts, assurance, frais de dossier, garanties. C'est le vrai coût du crédit. Exemple : taux nominal 3,12% + assurance 0,36% + frais ≈ TAEG 3,60%. Le TAEG ne peut dépasser le taux d'usure fixé par la Banque de France."
        },
        {
          q: "Qu'est-ce que le taux d'usure ?",
          r: "Le taux d'usure est le taux maximum légal qu'une banque peut appliquer. Il est fixé chaque trimestre par la Banque de France et correspond au taux moyen du trimestre précédent majoré d'un tiers. En octobre 2025, le taux d'usure est à 5,09% pour les prêts de plus de 20 ans. Si votre TAEG dépasse ce seuil, la banque ne peut légalement vous prêter."
        }
      ]
    },
    {
      category: "Calcul et mensualités",
      questions: [
        {
          q: "Comment est calculée ma mensualité ?",
          r: "La mensualité est calculée avec la formule des annuités constantes : M = C × (t/12) / [1 - (1 + t/12)^(-n)], où C est le capital emprunté, t le taux annuel, et n le nombre de mois. À cela s'ajoute l'assurance emprunteur, calculée sur le capital initial. Au début du prêt, la part d'intérêts est élevée et diminue progressivement au profit du capital remboursé."
        },
        {
          q: "Pourquoi la part d'intérêts diminue-t-elle au fil du temps ?",
          r: "Les intérêts sont calculés sur le capital restant dû. Au début, ce capital est élevé, donc les intérêts aussi. Chaque mois, vous remboursez du capital, réduisant ainsi la base de calcul des intérêts. La mensualité totale reste constante, mais la répartition s'inverse : les intérêts diminuent tandis que la part de capital augmente. C'est le principe de l'amortissement constant."
        },
        {
          q: "Puis-je modifier la durée de mon prêt pour réduire le coût total ?",
          r: "Oui ! Réduire la durée diminue considérablement le coût total. Exemple : 200 000€ à 3,12% sur 20 ans = 48 400€ d'intérêts. Sur 15 ans = 34 700€ d'intérêts (économie de 13 700€). Mais attention : la mensualité augmente (1 109€ vs 1 346€). Il faut respecter le taux d'endettement de 35% maximum (revenus nets). Faites des simulations pour trouver le bon équilibre."
        }
      ]
    },
    {
      category: "Assurance emprunteur",
      questions: [
        {
          q: "L'assurance emprunteur est-elle obligatoire ?",
          r: "Juridiquement non, mais en pratique oui : aucune banque n'accepte de prêter sans assurance. Elle couvre le remboursement en cas de décès, invalidité ou incapacité de travail. Le coût varie selon l'âge, l'état de santé, la profession et le montant emprunté : de 0,10% (jeune, bon état) à 0,50% (senior, risques). En moyenne : 0,30-0,36% du capital. Sur 200 000€ sur 20 ans : 14 400€."
        },
        {
          q: "Puis-je changer d'assurance emprunteur ?",
          r: "Oui, grâce à la loi Lemoine (2022) ! Vous pouvez changer d'assurance à tout moment, sans frais, sans justification. Condition : garanties équivalentes. L'économie peut atteindre 50% du coût initial. Méthode : comparer les offres (délégation d'assurance), demander la résiliation à votre banque avec nouveau contrat, réponse sous 10 jours. Sites comparateurs : Magnolia, Assurland, April."
        },
        {
          q: "Comment est calculée l'assurance : sur capital initial ou restant dû ?",
          r: "Deux méthodes : 1) Contrat bancaire : calculé sur capital INITIAL, cotisation constante (exemple calculateur). Plus simple mais plus cher. 2) Contrat alternatif : calculé sur capital RESTANT DÛ, cotisation décroissante. Moins cher à long terme. Exemple 200k€, 0,36%, 20 ans : méthode 1 = 60€/mois constant, méthode 2 = 60€ puis diminue progressivement. Total méthode 2 ≈ 30% moins cher."
        }
      ]
    },
    {
      category: "Capacité d'emprunt",
      questions: [
        {
          q: "Comment calculer ma capacité d'emprunt maximale ?",
          r: "Règle du HCSF (Haut Conseil de Stabilité Financière) : taux d'endettement maximum de 35% des revenus nets, assurance comprise. Formule : Capacité mensuelle = (Revenus nets × 35%) - Charges actuelles (crédits, pensions). Sur 20 ans à 3,12% : si vous pouvez payer 1 200€/mois, capacité ≈ 216 000€. Ajoutez votre apport (10% minimum recommandé) pour connaître votre budget total."
        },
        {
          q: "L'apport personnel est-il obligatoire ?",
          r: "Recommandé mais pas systématiquement obligatoire. Standard : 10% minimum pour couvrir frais de notaire et garanties. Sans apport : possible pour excellents profils (CDI, bons revenus, jeunes actifs). La banque exige alors des garanties renforcées et peut appliquer un taux légèrement supérieur. Conseil : un apport de 20% améliore significativement vos conditions (taux, assurance, frais réduits)."
        },
        {
          q: "Quels revenus sont pris en compte par les banques ?",
          r: "Revenus STABLES uniquement : salaires nets (100% si CDI, 70% si CDD < 1 an), pensions/retraites (100%), revenus fonciers (70% des loyers), BIC/BNC (moyenne sur 3 ans), pensions alimentaires reçues. EXCLUS : primes variables (sauf si récurrentes sur 3 ans), allocations familiales, indemnités exceptionnelles. Les banques analysent les 3 derniers bulletins de paie et avis d'imposition."
        }
      ]
    },
    {
      category: "Optimisation et stratégies",
      questions: [
        {
          q: "Comment obtenir le meilleur taux possible ?",
          r: "5 leviers : 1) Profil solide : CDI, bons revenus, faible endettement, épargne résiduelle. 2) Apport conséquent : 20% minimum idéal. 3) Multi-banques : comparer 5+ établissements. 4) Courtier : négociation professionnelle, accès taux préférentiels. 5) Timing : surveiller baisses de taux OAT 10 ans et décisions BCE. Gain possible : 0,10% à 0,50% = 3 000€ à 15 000€ économisés sur 20 ans pour 200k€."
        },
        {
          q: "Faut-il faire un remboursement anticipé partiel ?",
          r: "Rentable si : 1) Épargne disponible au-delà de 6 mois de salaire de sécurité, 2) Taux crédit > taux épargne (oui en 2025 : 3,12% crédit vs 2,5% Livret A max), 3) Indemnités < 6 mois d'intérêts OU < 3% capital restant dû. Stratégie : rembourser en début de prêt (quand intérêts élevés) ou réduire durée plutôt que mensualité pour maximiser économie. Simuler l'impact avant."
        },
        {
          q: "Quand renégocier ou faire racheter mon crédit ?",
          r: "Conditions : 1) Écart de taux ≥ 0,70% à 1% avec marché actuel, 2) Capital restant > 70 000€, 3) Durée restante > 10 ans. Coûts : indemnités (max 6 mois intérêts ou 3% CRD), frais dossier nouveau prêt (1 000€), frais garantie (500-1 500€). Simulation : si vous avez emprunté 200k€ en 2022 à 1,50%, renégociation à 3,12% ne sera PAS avantageuse. Attendre baisse future."
        }
      ]
    },
    {
      category: "Aspects juridiques",
      questions: [
        {
          q: "Quels sont mes droits et obligations en tant qu'emprunteur ?",
          r: "DROITS : délai de réflexion 10 jours après réception offre, condition suspensive acquisition (si refus prêt = annulation vente + remboursement sommes versées), remboursement anticipé possible, changement assurance libre, information annuelle capital restant dû. OBLIGATIONS : rembourser selon échéancier, assurer le bien (habitation), souscrire assurance emprunteur, ne pas modifier destination bien sans accord banque."
        },
        {
          q: "Que se passe-t-il en cas de difficultés de remboursement ?",
          r: "IMPÉRATIF : contacter banque IMMÉDIATEMENT. Solutions : 1) Modulation temporaire : report d'échéances (3-6 mois), 2) Allongement durée : réduction mensualité, 3) Franchise partielle : intérêts seulement, 4) Renégociation globale, 5) Vente bien (si plus-value), 6) Dation en paiement (rare). NE PAS FAIRE : découverts, crédits renouvelables. Conséquences impayés : pénalités (7% + intérêts), inscription FICP, procédure judiciaire, saisie immobilière."
        },
        {
          q: "Comment fonctionne la garantie du prêt immobilier ?",
          r: "La banque exige une garantie pour se protéger. 3 types : 1) HYPOTHÈQUE : inscription aux hypothèques (2-3% montant), mainlevée à fin prêt (frais 0,7%), lourd et coûteux. 2) PRIVILÈGE DE PRÊTEUR DE DENIERS (PPD) : plus simple, achat dans ancien, coût similaire. 3) CAUTIONNEMENT (Crédit Logement, SACCEF) : mutuelle, 1 seul versement, cotisation remboursée à 70-80% si pas d'incident. Le plus économique et rapide."
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-indigo-600" />
          Questions fréquentes sur le prêt immobilier
        </h2>
        <p className="text-gray-600 mt-2">
          Tout ce que vous devez savoir sur le crédit immobilier
        </p>
      </div>

      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8 last:mb-0">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
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
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
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