// ============================================
// FILE: src/app/sci/page.tsx
// DESCRIPTION: Simulateur SCI intégré à NotariaPrime
// ============================================

"use client";

import React, { useState, useMemo } from 'react';
import { 
  Calculator, TrendingUp, Building, FileText, Target, PieChart,
  Lightbulb, ArrowRight, Clock, Gift, Scale, Percent,
  Home, Coins, Shield, Banknote, DollarSign, Info, AlertCircle,
  FolderOpen, Save, Download, Trash2, HelpCircle, TrendingDown
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell 
} from 'recharts';

// Imports locaux
import type { FormData, ComparaisonResults } from './types';
import {
  calculerResultatsIR,
  calculerResultatsIS,
  calculerPlusValue,
  calculerTransmission,
  calculerIFI,
  genererSuggestions,
  genererDonneesGraphiques,
  calculerEmprunt,
  calculerDonneesEmpruntAnnee,
  PLAFOND_TAUX_CCA,
  SEUIL_MICRO_FONCIER,
  sauvegarderSimulation,
  chargerSimulation,
  chargerSimulations,
  supprimerSimulation,
  genererPDF
} from './calculs';
import {
  AssociesForm,
  BiensForm,
  PlusValueDisplay,
  Disclaimer
} from './components';
import { FAQSection } from './FAQSection';

// ✅ Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function SCISimulator() {
  const [formData, setFormData] = useState<FormData>({
    regimeFiscal: 'IR',
    capitalSocial: '5000',
    nombreAssocies: '2',
    associes: [
      { id: 1, nom: 'Associé 1', partsSociales: '50', apportNumeraire: '2500', apportNature: '0', lienFamilial: 'conjoint' },
      { id: 2, nom: 'Associé 2', partsSociales: '50', apportNumeraire: '2500', apportNature: '0', lienFamilial: 'conjoint' }
    ],
    biens: [
      { id: 1, nom: 'Bien 1', valeur: '300000', loyerMensuel: '1200', charges: '200', taxeFonciere: '1500' }
    ],
    emprunt: true,
    montantEmprunt: '250000',
    tauxInteret: '3.5',
    dureeEmprunt: '20',
    fraisGestion: '1200',
    fraisComptable: '800',
    assurances: '600',
    travauxAnnuels: '2000',
    distributionDividendes: '50',
    compteCourantAssocie: '50000',
    tauxInteretCCA: '4.0',
    optionBaremeProgressif: false,
    dureeAmortissement: '30',
    trancheMarginalIR: '30',
    nonResident: false,
    regimeFoncier: 'reel',
    transmissionPrevue: false,
    valeurTransmission: '',
    typeTransmission: 'donation',
    demembrement: false,
    ageDonateur: '',
    simulerRevente: true,
    anneeRevente: '20',
    tauxValorisationAnnuelle: '1.0',
    prixReventeManuel: ''
  });

  const [results, setResults] = useState<ComparaisonResults | null>(null);
  const [activeTab, setActiveTab] = useState<'simulation' | 'revente' | 'transmission' | 'optimisation'>('simulation');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [nomSimulation, setNomSimulation] = useState('');
  const [simulations, setSimulations] = useState<any[]>([]);

  // ============================================
  // CALCUL DES RÉSULTATS
  // ============================================

  const calculerResultats = (): ComparaisonResults | null => {
    const revenusBruts = formData.biens.reduce((acc, bien) => {
      return acc + (parseFloat(bien.loyerMensuel.replace(/\s/g, '')) || 0) * 12;
    }, 0);

    const chargesAnnuelles = formData.biens.reduce((acc, bien) => {
      return acc + (parseFloat(bien.charges.replace(/\s/g, '')) || 0) * 12 + 
             (parseFloat(bien.taxeFonciere.replace(/\s/g, '')) || 0);
    }, 0);

    const valeurBiens = formData.biens.reduce((acc, bien) => {
      return acc + (parseFloat(bien.valeur.replace(/\s/g, '')) || 0);
    }, 0);

    let interetsAnnuels = 0;
    let capitalRembourse = 0;
    
    if (formData.emprunt) {
      const montant = parseFloat(formData.montantEmprunt.replace(/\s/g, '')) || 0;
      const tauxAnnuel = parseFloat(formData.tauxInteret) || 0;
      const duree = parseFloat(formData.dureeEmprunt) || 20;
      
      const emprunt = calculerEmprunt(montant, tauxAnnuel, duree);
      const donneesAnnee1 = calculerDonneesEmpruntAnnee(montant, 1, emprunt.mensualite, tauxAnnuel);
      
      interetsAnnuels = donneesAnnee1.interetsAnnuels;
      capitalRembourse = donneesAnnee1.capitalRembourse;
    }

    const resultatsIR = calculerResultatsIR(formData, revenusBruts, chargesAnnuelles, interetsAnnuels, capitalRembourse);
    const resultatsIS = calculerResultatsIS(formData, revenusBruts, chargesAnnuelles, interetsAnnuels, capitalRembourse, valeurBiens);

    const economie = resultatsIR.fiscaliteTotal - resultatsIS.fiscaliteTotal;
    const regimeOptimal = resultatsIS.cashFlowReel > resultatsIR.cashFlowReel ? 'IS' : 'IR';

    let plusValue = undefined;
    if (formData.simulerRevente) {
      const anneeRevente = parseInt(formData.anneeRevente) || 20;
      plusValue = calculerPlusValue(formData, valeurBiens, anneeRevente);
    }

    const dettesImmobilieres = formData.emprunt 
      ? parseFloat(formData.montantEmprunt.replace(/\s/g, '')) || 0 
      : 0;
    const ifi = calculerIFI(valeurBiens, dettesImmobilieres);

    const suggestions = genererSuggestions(formData, resultatsIR, resultatsIS, economie, plusValue);

    return {
      IR: resultatsIR,
      IS: resultatsIS,
      economie,
      regimeOptimal,
      suggestions,
      plusValue,
      ifi
    };
  };

  const handleCalculer = () => {
    const res = calculerResultats();
    if (res) {
      setResults(res);
    }
  };

  const handleSauvegarder = () => {
    if (!nomSimulation.trim()) {
      alert('Veuillez donner un nom à votre simulation');
      return;
    }
    sauvegarderSimulation(nomSimulation, formData, results);
    setShowSaveModal(false);
    setNomSimulation('');
    alert('✅ Simulation sauvegardée avec succès !');
  };

  const handleCharger = (id: string) => {
    const simulation = chargerSimulation(id);
    if (simulation) {
      setFormData(simulation.formData);
      setResults(simulation.results);
      setShowLoadModal(false);
      alert('✅ Simulation chargée avec succès !');
    }
  };

  const handleSupprimer = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette simulation ?')) {
      supprimerSimulation(id);
      setSimulations(chargerSimulations());
      alert('✅ Simulation supprimée');
    }
  };

  const handleExporterPDF = () => {
    if (!results) {
      alert('Veuillez d\'abord effectuer une simulation');
      return;
    }
    genererPDF(formData, results, graphiqueEvolutionAnnuelle);
  };

  React.useEffect(() => {
    setSimulations(chargerSimulations());
  }, [showLoadModal]);

  const graphiqueEvolutionAnnuelle = useMemo(() => {
    if (!results) return [];
    return genererDonneesGraphiques(formData, results.IR, results.IS);
  }, [results, formData]);

  const repartitionCapital = useMemo(() => {
    return formData.associes.map(associe => ({
      name: associe.nom,
      value: parseFloat(associe.partsSociales) || 0
    }));
  }, [formData.associes]);

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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Simulateur SCI Optimisé
                  </h1>
                  <p className="text-gray-600 font-medium mt-1">
                    Comparaison IR/IS • Plus-value • Transmission • IFI
                  </p>
                </div>
              </div>
              {results && (
                <div className="text-right">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <p className="text-sm text-green-700 font-semibold">Régime optimal</p>
                    <p className="text-3xl font-bold text-green-900">{results.regimeOptimal}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Économie : {Math.abs(results.economie).toLocaleString('fr-FR', {maximumFractionDigits: 0})}€/an
                    </p>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                      title="Sauvegarder la simulation"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={handleExporterPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"
                      title="Exporter en PDF"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              )}
              
              {!results && (
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  title="Charger une simulation"
                >
                  <FolderOpen className="w-5 h-5" />
                  Charger
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
              {[
                { id: 'simulation', label: 'Simulation', icon: Calculator },
                { id: 'revente', label: 'Revente', icon: DollarSign },
                { id: 'transmission', label: 'Transmission', icon: Gift },
                { id: 'optimisation', label: 'Optimisation', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* TAB: SIMULATION */}
          {/* ============================================ */}
          
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              
              {/* Régime fiscal */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Scale className="w-7 h-7 text-purple-600" />
                  Régime fiscal de la SCI
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData({...formData, regimeFiscal: 'IR'})}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.regimeFiscal === 'IR'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                    <p className="font-bold text-lg mb-2">SCI à l&apos;IR</p>
                    <p className="text-sm text-gray-600">Transparence fiscale • Revenus fonciers</p>
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <p>✅ Simplicité</p>
                      <p>✅ Transmission facilitée</p>
                      <p>✅ Exonération progressive</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setFormData({...formData, regimeFiscal: 'IS'})}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.regimeFiscal === 'IS'
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Building className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
                    <p className="font-bold text-lg mb-2">SCI à l&apos;IS</p>
                    <p className="text-sm text-gray-600">Impôt sur les sociétés • Option irrévocable</p>
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <p>✅ Amortissement</p>
                      <p>✅ Capitalisation</p>
                      <p>⚠️ Irrévocable</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Associés */}
              <AssociesForm 
                associes={formData.associes}
                onChange={(associes) => setFormData({...formData, associes})}
              />

              {/* Biens */}
              <BiensForm 
                biens={formData.biens}
                onChange={(biens) => setFormData({...formData, biens})}
              />

              {/* Financement et Fiscalité */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Financement */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-orange-600" />
                    Financement
                  </h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.emprunt}
                        onChange={(e) => setFormData({...formData, emprunt: e.target.checked})}
                        className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500"
                      />
                      <span className="font-medium text-gray-700">Emprunt bancaire</span>
                    </label>
                    
                    {formData.emprunt && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Montant emprunté (€)</label>
                          <input
                            type="text"
                            value={formData.montantEmprunt}
                            onChange={(e) => setFormData({...formData, montantEmprunt: e.target.value})}
                            placeholder="250 000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Taux (%)</label>
                            <input
                              type="text"
                              value={formData.tauxInteret}
                              onChange={(e) => setFormData({...formData, tauxInteret: e.target.value})}
                              placeholder="3.5"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Durée (ans)</label>
                            <input
                              type="text"
                              value={formData.dureeEmprunt}
                              onChange={(e) => setFormData({...formData, dureeEmprunt: e.target.value})}
                              placeholder="20"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Fiscalité personnelle */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Percent className="w-6 h-6 text-purple-600" />
                    Situation fiscale
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tranche marginale d&apos;imposition (%)
                      </label>
                      <select
                        value={formData.trancheMarginalIR}
                        onChange={(e) => setFormData({...formData, trancheMarginalIR: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="0">0% (non imposable)</option>
                        <option value="11">11%</option>
                        <option value="30">30%</option>
                        <option value="41">41%</option>
                        <option value="45">45%</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.nonResident}
                        onChange={(e) => setFormData({...formData, nonResident: e.target.checked})}
                        className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">Associé non-résident fiscal</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Taux minimum 20% • Exonération prélèvements sociaux
                        </p>
                      </div>
                    </label>

                    {formData.regimeFiscal === 'IR' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Régime foncier
                        </label>
                        <select
                          value={formData.regimeFoncier}
                          onChange={(e) => setFormData({...formData, regimeFoncier: e.target.value as any})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="reel">Régime réel</option>
                          <option value="micro">Micro-foncier (si &lt; 15 000€)</option>
                        </select>
                      </div>
                    )}

                    {formData.regimeFiscal === 'IS' && (
                      <>
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={formData.optionBaremeProgressif}
                              onChange={(e) => setFormData({...formData, optionBaremeProgressif: e.target.checked})}
                              className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <span className="font-medium text-gray-700">Option barème progressif (IS)</span>
                              <p className="text-xs text-gray-500 mt-1">
                                Abattement 40% puis TMI au lieu de flat tax 30%
                              </p>
                            </div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Durée d&apos;amortissement (années)
                          </label>
                          <select
                            value={formData.dureeAmortissement}
                            onChange={(e) => setFormData({...formData, dureeAmortissement: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          >
                            <option value="20">20 ans (5% par an) - Bâtiments légers</option>
                            <option value="25">25 ans (4% par an) - Toiture, électricité</option>
                            <option value="30">30 ans (3,33% par an) - Standard</option>
                            <option value="40">40 ans (2,5% par an) - Immeubles récents</option>
                            <option value="50">50 ans (2% par an) - Immeubles anciens</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-2">
                            📚 Selon le BOFIP, la durée varie de 20 à 50 ans selon la nature du bien
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Charges annuelles */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Coins className="w-6 h-6 text-red-600" />
                  Charges annuelles de la SCI
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Frais de gestion (€)</label>
                    <input
                      type="text"
                      value={formData.fraisGestion}
                      onChange={(e) => setFormData({...formData, fraisGestion: e.target.value})}
                      placeholder="1 200"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expert-comptable (€)</label>
                    <input
                      type="text"
                      value={formData.fraisComptable}
                      onChange={(e) => setFormData({...formData, fraisComptable: e.target.value})}
                      placeholder="800"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      IR: 500-1200€ • IS: 1500-3500€
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assurances (€)</label>
                    <input
                      type="text"
                      value={formData.assurances}
                      onChange={(e) => setFormData({...formData, assurances: e.target.value})}
                      placeholder="600"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Travaux annuels (€)</label>
                    <input
                      type="text"
                      value={formData.travauxAnnuels}
                      onChange={(e) => setFormData({...formData, travauxAnnuels: e.target.value})}
                      placeholder="2 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stratégie IS */}
              {formData.regimeFiscal === 'IS' && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Target className="w-6 h-6 text-amber-600" />
                    Stratégie de distribution (IS)
                  </h2>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pourcentage de distribution en dividendes (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.distributionDividendes}
                      onChange={(e) => setFormData({...formData, distributionDividendes: e.target.value})}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">0% (tout en réserve)</span>
                      <span className="text-xl font-bold text-amber-600">{formData.distributionDividendes}%</span>
                      <span className="text-sm text-gray-600">100% (tout distribué)</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      ⚠️ Plus vous mettez en réserve, moins vous payez d&apos;impôt immédiatement (pas de flat tax).
                      Idéal pour réinvestir ou financer des travaux.
                    </p>
                  </div>
                </div>
              )}

              {/* Bouton Calculer */}
              <div className="flex justify-center">
                <button
                  onClick={handleCalculer}
                  className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
                >
                  <Calculator className="w-6 h-6" />
                  Comparer IR et IS
                </button>
              </div>
              {/* ============================================ */}
              {/* AFFICHAGE DES RÉSULTATS IR/IS */}
              {/* ============================================ */}
              
              {results && (
                <div className="space-y-6 mt-8">
                  
                  {/* Verdict */}
                  <div className={`rounded-2xl p-8 border-4 ${
                    results.regimeOptimal === 'IS' 
                      ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300' 
                      : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300'
                  }`}>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-600 mb-2">🎯 Verdict fiscal</p>
                      <p className="text-5xl font-black mb-4" style={{
                        background: results.regimeOptimal === 'IS' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        SCI à l&apos;{results.regimeOptimal}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        Économie annuelle : {Math.abs(results.economie).toLocaleString('fr-FR')} €
                      </p>
                      <p className="text-lg text-gray-700">
                        Sur 20 ans : {(Math.abs(results.economie) * 20).toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  </div>

                  {/* Comparaison IR vs IS */}
                  <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* Résultats IR */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-purple-900">SCI à l&apos;IR</h3>
                        {results.regimeOptimal === 'IR' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                            ✅ Optimal
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Revenus fonciers</span>
                          <span className="font-bold text-gray-900">
                            {results.IR.revenusFonciers.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Charges déductibles</span>
                          <span className="font-bold text-red-600">
                            - {results.IR.chargesDeductibles.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 bg-gray-50 px-3 rounded">
                          <span className="font-semibold text-gray-900">Revenu imposable</span>
                          <span className="font-bold text-gray-900">
                            {results.IR.revenuImposable.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Impôt sur le revenu ({results.IR.tauxMarginal}%)</span>
                          <span className="font-bold text-red-600">
                            - {results.IR.impotRevenu.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Prélèvements sociaux (17,2%)</span>
                          <span className="font-bold text-red-600">
                            - {results.IR.prelevementsSociaux.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t-2 border-purple-300 bg-purple-50 px-3 rounded">
                          <span className="font-bold text-lg">Fiscalité totale</span>
                          <span className="font-bold text-2xl text-purple-900">
                            {results.IR.fiscaliteTotal.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 bg-green-50 px-3 py-2 rounded-lg border-2 border-green-200">
                          <span className="font-bold text-green-900">Cash-flow réel annuel</span>
                          <span className="font-bold text-xl text-green-600">
                            {results.IR.cashFlowReel.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Résultats IS */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-indigo-900">SCI à l&apos;IS</h3>
                        {results.regimeOptimal === 'IS' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                            ✅ Optimal
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Résultat comptable</span>
                          <span className="font-bold text-gray-900">
                            {results.IS.resultatComptable.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Amortissement annuel</span>
                          <span className="font-bold text-orange-600">
                            - {results.IS.amortissementAnnuel.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 bg-gray-50 px-3 rounded">
                          <span className="font-semibold text-gray-900">Bénéfice imposable</span>
                          <span className="font-bold text-gray-900">
                            {results.IS.beneficeImposable.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Impôt sur les sociétés</span>
                          <span className="font-bold text-red-600">
                            - {results.IS.impotSocietes.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Dividendes distribués</span>
                          <span className="font-bold text-blue-600">
                            {results.IS.dividendesDistribues.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Prélèvement forfaitaire (30%)</span>
                          <span className="font-bold text-red-600">
                            - {results.IS.prelevementsForfaitaires.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t-2 border-indigo-300 bg-indigo-50 px-3 rounded">
                          <span className="font-bold text-lg">Fiscalité totale</span>
                          <span className="font-bold text-2xl text-indigo-900">
                            {results.IS.fiscaliteTotal.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 bg-green-50 px-3 py-2 rounded-lg border-2 border-green-200">
                          <span className="font-bold text-green-900">Cash-flow réel annuel</span>
                          <span className="font-bold text-xl text-green-600">
                            {results.IS.cashFlowReel.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graphiques */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      Évolution sur 20 ans
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={graphiqueEvolutionAnnuelle}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="annee" label={{ value: 'Année', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Cash-flow (€)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
                        <Legend />
                        <Line type="monotone" dataKey="cashFlowIR" stroke="#9333ea" strokeWidth={3} name="SCI à l'IR" />
                        <Line type="monotone" dataKey="cashFlowIS" stroke="#3b82f6" strokeWidth={3} name="SCI à l'IS" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Répartition du capital */}
                  {repartitionCapital.length > 1 && (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-pink-600" />
                        Répartition du capital social
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                          <Pie
                            data={repartitionCapital}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, value}) => `${name}: ${value}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {repartitionCapital.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* IFI */}
                  {results.ifi && results.ifi.impotIFI > 0 && (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-red-600" />
                        Impôt sur la Fortune Immobilière (IFI)
                      </h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Patrimoine</p>
                          <p className="text-xl font-bold text-gray-900">
                            {results.ifi.valeurPatrimoine.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Dettes</p>
                          <p className="text-xl font-bold text-red-600">
                            - {results.ifi.dettes.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Assiette IFI</p>
                          <p className="text-xl font-bold text-orange-600">
                            {results.ifi.assietteIFI.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-3 border-2 border-red-300">
                          <p className="text-sm text-gray-600 mb-1">IFI annuel</p>
                          <p className="text-2xl font-bold text-red-600">
                            {results.ifi.impotIFI.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-4">
                        ⚠️ L&apos;IFI s&apos;ajoute à votre fiscalité globale
                      </p>
                    </div>
                  )}

                  {/* Conseils d'optimisation */}
                  {results.suggestions.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-amber-600" />
                        Conseils d&apos;optimisation
                      </h3>
                      <div className="space-y-3">
                        {results.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="text-amber-600 font-bold flex-shrink-0">{index + 1}.</span>
                            <p className="text-gray-800">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
              {/* Info cash-flow */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">💡 Nouveauté : Cash-flow réel</p>
                    <p className="text-blue-800">
                      Les calculs incluent désormais le <strong>remboursement du capital de l&apos;emprunt</strong> pour refléter 
                      la trésorerie réellement disponible. Les graphiques affichent votre cash-flow après toutes les charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: REVENTE */}
          {/* ============================================ */}
          
          {activeTab === 'revente' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <DollarSign className="w-7 h-7 text-red-600" />
                  Simulation de revente du bien
                </h2>

                <div className="space-y-6">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.simulerRevente}
                      onChange={(e) => setFormData({...formData, simulerRevente: e.target.checked})}
                      className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-gray-700">Activer la simulation de revente</span>
                  </label>

                  {formData.simulerRevente && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Année de revente
                          </label>
                          <input
                            type="text"
                            value={formData.anneeRevente}
                            onChange={(e) => setFormData({...formData, anneeRevente: e.target.value})}
                            placeholder="20"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Par défaut : à la fin du prêt ({formData.dureeEmprunt} ans)
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Taux de valorisation annuelle (%)
                          </label>
                          <input
                            type="text"
                            value={formData.tauxValorisationAnnuelle}
                            onChange={(e) => setFormData({...formData, tauxValorisationAnnuelle: e.target.value})}
                            placeholder="1.0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Par défaut : 1% par an (valorisation progressive)
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Info className="w-5 h-5 text-amber-600" />
                          Option avancée
                        </h3>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Prix de revente manuel (optionnel)
                          </label>
                          <input
                            type="text"
                            value={formData.prixReventeManuel}
                            onChange={(e) => setFormData({...formData, prixReventeManuel: e.target.value})}
                            placeholder="Laissez vide pour calcul automatique"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                          <p className="text-xs text-gray-600 mt-2">
                            💡 Si vous connaissez le prix de revente exact, saisissez-le ici. 
                            Sinon, nous calculons automatiquement avec le taux de valorisation.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={handleCalculer}
                          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-xl transition-all"
                        >
                          <Calculator className="w-5 h-5" />
                          Calculer la plus-value
                        </button>
                      </div>

                      {results?.plusValue && (
                        <PlusValueDisplay 
                          plusValue={results.plusValue} 
                          regimeFiscal={formData.regimeFiscal}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: TRANSMISSION */}
          {/* ============================================ */}
          
          {activeTab === 'transmission' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Gift className="w-7 h-7 text-pink-600" />
                  Stratégie de transmission familiale
                </h2>

                <div className="space-y-6">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.transmissionPrevue}
                      onChange={(e) => setFormData({...formData, transmissionPrevue: e.target.checked})}
                      className="w-5 h-5 rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span className="font-semibold text-gray-700">Transmission familiale prévue</span>
                  </label>

                  {formData.transmissionPrevue && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Valeur à transmettre (€)</label>
                          <input
                            type="text"
                            value={formData.valeurTransmission}
                            onChange={(e) => setFormData({...formData, valeurTransmission: e.target.value})}
                            placeholder="600 000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Type de transmission</label>
                          <select
                            value={formData.typeTransmission}
                            onChange={(e) => setFormData({...formData, typeTransmission: e.target.value as any})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                          >
                            <option value="donation">Donation</option>
                            <option value="succession">Succession</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                        <h3 className="font-bold text-gray-900 mb-4">Démembrement de propriété</h3>
                        <label className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            checked={formData.demembrement}
                            onChange={(e) => setFormData({...formData, demembrement: e.target.checked})}
                            className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="font-medium text-gray-700">Activer le démembrement (usufruit/nue-propriété)</span>
                        </label>

                        {formData.demembrement && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Âge du donateur</label>
                            <input
                              type="text"
                              value={formData.ageDonateur}
                              onChange={(e) => setFormData({...formData, ageDonateur: e.target.value})}
                              placeholder="65"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={handleCalculer}
                          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-xl transition-all"
                        >
                          <Calculator className="w-5 h-5" />
                          Calculer la transmission
                        </button>
                      </div>

                      {formData.valeurTransmission && results && (() => {
                        const transmission = calculerTransmission(formData);
                        return (
                          <div className="space-y-6 mt-8">
                            {/* Alerte IR vs IS */}
                            <div className={`rounded-xl p-5 border-2 ${
                              formData.regimeFiscal === 'IS' 
                                ? 'bg-red-50 border-red-300' 
                                : 'bg-green-50 border-green-300'
                            }`}>
                              <div className="flex items-start gap-3">
                                <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                                  formData.regimeFiscal === 'IS' ? 'text-red-600' : 'text-green-600'
                                }`} />
                                <div className={`text-sm ${
                                  formData.regimeFiscal === 'IS' ? 'text-red-900' : 'text-green-900'
                                }`}>
                                  {formData.regimeFiscal === 'IS' ? (
                                    <>
                                      <p className="font-bold mb-2">⚠️ SCI à l&apos;IS : TRANSMISSION PLUS COÛTEUSE</p>
                                      <ul className="space-y-1 ml-4">
                                        <li>• Valorisation basée sur les fonds propres (capital + réserves)</li>
                                        <li>• Plus-values latentes incluses dans la base taxable</li>
                                        <li>• Valorisation souvent 30-50% plus élevée qu&apos;à l&apos;IR</li>
                                      </ul>
                                      <p className="mt-3 font-semibold text-red-800">
                                        💡 Pour la transmission familiale, privilégiez la SCI à l&apos;IR !
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="font-bold mb-2">✅ SCI à l&apos;IR : TRANSMISSION OPTIMALE</p>
                                      <ul className="space-y-1 ml-4">
                                        <li>• Valorisation simple basée sur la valeur vénale</li>
                                        <li>• Démembrement très efficace</li>
                                        <li>• Donations progressives tous les 15 ans</li>
                                      </ul>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Résultats */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Résultats de la transmission</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-blue-200">
                                  <span className="text-gray-700">Valeur des biens</span>
                                  <span className="font-bold text-gray-900">
                                    {parseFloat(formData.valeurTransmission.replace(/\s/g, '')).toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                                
                                {transmission.plusValueLatente > 0 && (
                                  <>
                                    <div className="flex justify-between py-2 border-b border-blue-200">
                                      <span className="text-gray-700">+ Réserves / Plus-values latentes (IS)</span>
                                      <span className="font-bold text-orange-600">
                                        + {transmission.plusValueLatente.toLocaleString('fr-FR')} €
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b-2 border-orange-300 bg-orange-50 px-3 rounded">
                                      <span className="font-semibold text-gray-900">= Valeur fiscale</span>
                                      <span className="font-bold text-orange-900">
                                        {transmission.valeurRevaluee.toLocaleString('fr-FR')} €
                                      </span>
                                    </div>
                                  </>
                                )}
                                
                                {formData.demembrement && (
                                  <>
                                    <div className="flex justify-between py-2 border-b border-blue-200">
                                      <span className="text-gray-700">Réduction démembrement</span>
                                      <span className="font-bold text-purple-600">
                                        - {transmission.economieDemo.toLocaleString('fr-FR')} €
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-blue-200 bg-purple-50 px-3 rounded">
                                      <span className="font-semibold text-gray-900">Valeur taxable (nue-propriété)</span>
                                      <span className="font-bold text-purple-900">
                                        {transmission.valeurTaxable.toLocaleString('fr-FR')} €
                                      </span>
                                    </div>
                                  </>
                                )}
                                
                                <div className="flex justify-between py-2 border-b border-blue-200">
                                  <span className="text-gray-700">Nombre de bénéficiaires</span>
                                  <span className="font-bold text-gray-900">{transmission.nombreBeneficiaires}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-blue-200">
                                  <span className="text-gray-700">Abattement (100k × 2 parents)</span>
                                  <span className="font-bold text-green-600">- 200 000 €</span>
                                </div>
                                <div className="flex justify-between py-2 border-b-2 border-blue-300 bg-blue-100 px-3 rounded">
                                  <span className="font-semibold text-gray-900">Base imposable par enfant</span>
                                  <span className="font-bold text-blue-900">
                                    {transmission.baseImposable.toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-8 border-2 border-pink-200">
                              <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Droits de {formData.typeTransmission} totaux</p>
                                <p className="text-5xl font-bold text-pink-600 mb-4">
                                  {transmission.droitsTotal.toLocaleString('fr-FR')} €
                                </p>
                                {formData.demembrement && (
                                  <div className="mt-4 pt-4 border-t-2 border-pink-300">
                                    <p className="text-sm text-gray-600 mb-2">💰 Économie grâce au démembrement</p>
                                    <p className="text-3xl font-bold text-green-600">
                                      {(transmission.droitsSansDemo - transmission.droitsTotal).toLocaleString('fr-FR')} €
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      vs {transmission.droitsSansDemo.toLocaleString('fr-FR')} € en pleine propriété
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">💡 Stratégie optimale pour transmission SCI</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Abattement 100 000€ par parent/enfant tous les 15 ans</li>
                      <li>• Démembrement = réduction 40-60% de la valeur taxable selon âge</li>
                      <li>• Donations progressives pour renouveler les abattements</li>
                      <li>• Conservation contrôle via gérance et usufruit</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB: OPTIMISATION */}
          {/* ============================================ */}
          
          {activeTab === 'optimisation' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Target className="w-7 h-7 text-amber-600" />
                  Optimisation financière - Compte courant d&apos;associé
                </h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-6 h-6 text-blue-600" />
                      Qu&apos;est-ce que le compte courant d&apos;associé ?
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Le <strong>compte courant d&apos;associé (CCA)</strong> est une avance de fonds que vous faites à votre SCI. 
                      C&apos;est un outil d&apos;optimisation majeur, plus souple que le capital social.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">✅ Avantages du CCA :</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Remboursable</strong> à tout moment (pas de fiscalité sur le remboursement !)</li>
                        <li>• <strong>Intérêts déductibles</strong> pour la SCI (taux max : {PLAFOND_TAUX_CCA.toFixed(2)}%)</li>
                        <li>• <strong>Aucun formalisme</strong> pour les versements/remboursements</li>
                        <li>• <strong>Alternative au capital</strong> : évite les augmentations de capital coûteuses</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-green-600" />
                      Montant du compte courant d&apos;associé
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Montant avancé à la SCI (€)
                        </label>
                        <input
                          type="text"
                          value={formData.compteCourantAssocie}
                          onChange={(e) => setFormData({...formData, compteCourantAssocie: e.target.value})}
                          placeholder="50 000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Taux d&apos;intérêt CCA (%)
                        </label>
                        <input
                          type="text"
                          value={formData.tauxInteretCCA}
                          onChange={(e) => setFormData({...formData, tauxInteretCCA: e.target.value})}
                          placeholder="4.0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-lg"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Max légal : {PLAFOND_TAUX_CCA.toFixed(2)}% (TMO + 1,31%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calcul automatique optimisation CCA */}
                  {formData.compteCourantAssocie && parseFloat(formData.compteCourantAssocie.replace(/\s/g, '')) > 0 && (() => {
                    const montantCCA = parseFloat(formData.compteCourantAssocie.replace(/\s/g, '')) || 0;
                    const tauxCCA = Math.min(parseFloat(formData.tauxInteretCCA) || 4, PLAFOND_TAUX_CCA);
                    const interetsAnnuels = montantCCA * (tauxCCA / 100);
                    const economieIS = formData.regimeFiscal === 'IS' ? interetsAnnuels * 0.25 : 0;
                    const economieIR = formData.regimeFiscal === 'IR' ? interetsAnnuels * 0.30 : 0;
                    const fiscaliteInteretsAssocie = interetsAnnuels * 0.30;
                    const gainNet = (economieIS + economieIR) - fiscaliteInteretsAssocie;

                    return (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Optimisation via intérêts du CCA</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-purple-200">
                              <span className="text-gray-700">Montant du CCA</span>
                              <span className="font-bold text-gray-900">{montantCCA.toLocaleString('fr-FR')} €</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-purple-200">
                              <span className="text-gray-700">Taux d&apos;intérêt appliqué</span>
                              <span className="font-bold text-gray-900">{tauxCCA.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-purple-200 bg-purple-100 px-3 rounded">
                              <span className="font-semibold text-gray-900">Intérêts annuels versés</span>
                              <span className="font-bold text-purple-900">{interetsAnnuels.toLocaleString('fr-FR')} €</span>
                            </div>
                            <div className="flex justify-between py-2 border-b-2 border-purple-300 bg-purple-50 px-3 rounded">
                              <span className="font-semibold">Économie fiscale SCI</span>
                              <span className="font-bold text-green-600">
                                - {economieIS > 0 ? economieIS.toLocaleString('fr-FR') : economieIR.toLocaleString('fr-FR')} €
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-purple-200">
                              <span className="text-gray-700">Fiscalité des intérêts pour l&apos;associé (flat tax 30%)</span>
                              <span className="font-bold text-red-600">
                                + {fiscaliteInteretsAssocie.toLocaleString('fr-FR')} €
                              </span>
                            </div>
                            <div className="flex justify-between pt-3 border-t-2 border-purple-400 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 rounded-lg">
                              <span className="font-bold text-lg">Gain net annuel</span>
                              <span className={`font-bold text-2xl ${gainNet > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {gainNet > 0 ? '+' : ''}{gainNet.toLocaleString('fr-FR')} €
                              </span>
                            </div>                          </div>
                        </div>

                        {/* Info complémentaire sur CCA */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                          <div className="flex items-start gap-3">
                            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900">
                              <p className="font-semibold mb-2">💡 Points clés sur le CCA</p>
                              <ul className="space-y-1 text-blue-800">
                                <li>• Les intérêts du CCA sont déductibles des résultats de la SCI</li>
                                <li>• Pour l&apos;associé, les intérêts sont soumis au PFU (flat tax) de 30%</li>
                                <li>• Le remboursement du CCA n&apos;est pas fiscalisé (contrairement aux dividendes)</li>
                                <li>• Très utile pour financer des travaux ou apporter de la trésorerie</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* SECTION FAQ */}
          {/* ============================================ */}
          
          <div className="mt-8">
            <FAQSection />
          </div>

          {/* ============================================ */}
          {/* DISCLAIMER FINAL */}
          {/* ============================================ */}
          
          <div className="mt-8">
            <Disclaimer />
          </div>

          {/* ============================================ */}
          {/* MODALS SAUVEGARDE / CHARGEMENT */}
          {/* ============================================ */}

          {/* Modal Sauvegarde */}
          {showSaveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Save className="w-6 h-6 text-blue-600" />
                  Sauvegarder la simulation
                </h3>
                <input
                  type="text"
                  value={nomSimulation}
                  onChange={(e) => setNomSimulation(e.target.value)}
                  placeholder="Nom de la simulation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSauvegarder}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      setNomSimulation('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Chargement */}
          {showLoadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                  Charger une simulation
                </h3>
                
                {simulations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">Aucune simulation sauvegardée</p>
                    <p className="text-sm">Effectuez une simulation et sauvegardez-la pour la retrouver ici</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {simulations.map((sim) => (
                      <div key={sim.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{sim.nom}</h4>
                            <p className="text-sm text-gray-600">
                              Sauvegardée le {new Date(sim.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCharger(sim.id)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                            >
                              Charger
                            </button>
                            <button
                              onClick={() => handleSupprimer(sim.id)}
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowLoadModal(false)}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}