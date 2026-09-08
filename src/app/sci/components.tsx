// ============================================
// FILE: src/app/sci/components.tsx
// DESCRIPTION: Composants réutilisables SCI
// ============================================

import React, { useState } from 'react';
import {
  Building, ChevronDown, ChevronUp, BookOpen, Info, AlertCircle,
  CheckCircle, TrendingUp, Lightbulb, ArrowRight, Clock, DollarSign
} from 'lucide-react';
import type { FormData, AssocieData, BienImmobilier, ComparaisonResults, ResultatsPlusValue, ResultatsTransmission } from './types';

// ============================================
// FORMULAIRE ASSOCIÉS
// ============================================

interface AssociesFormProps {
  associes: AssocieData[];
  onChange: (associes: AssocieData[]) => void;
}

export function AssociesForm({ associes, onChange }: AssociesFormProps) {
  const ajouterAssocie = () => {
    const newId = Math.max(...associes.map(a => a.id), 0) + 1;
    onChange([...associes, {
      id: newId,
      nom: `Associé ${newId}`,
      partsSociales: '0',
      apportNumeraire: '0',
      apportNature: '0',
      lienFamilial: 'autre'
    }]);
  };

  const supprimerAssocie = (id: number) => {
    if (associes.length > 1) {
      onChange(associes.filter(a => a.id !== id));
    }
  };

  const updateAssocie = <K extends keyof AssocieData,>(index: number, field: K, value: AssocieData[K]) => {
    const newAssocies = [...associes];
    newAssocies[index] = { ...newAssocies[index], [field]: value };
    onChange(newAssocies);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Building className="w-7 h-7 text-blue-600" />
          Associés de la SCI
        </h2>
        <button
          onClick={ajouterAssocie}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="space-y-4">
        {associes.map((associe, index) => (
          <div key={associe.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={associe.nom}
                onChange={(e) => updateAssocie(index, 'nom', e.target.value)}
                className="text-lg font-bold bg-transparent border-b-2 border-transparent hover:border-blue-400 focus:border-blue-600 focus:outline-none px-2 py-1"
              />
              {associes.length > 1 && (
                <button
                  onClick={() => supprimerAssocie(associe.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Parts sociales (%)</label>
                <input
                  type="text"
                  value={associe.partsSociales}
                  onChange={(e) => updateAssocie(index, 'partsSociales', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Apport numéraire</label>
                <input
                  type="text"
                  value={associe.apportNumeraire}
                  onChange={(e) => updateAssocie(index, 'apportNumeraire', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Apport nature</label>
                <input
                  type="text"
                  value={associe.apportNature}
                  onChange={(e) => updateAssocie(index, 'apportNature', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lien familial</label>
                <select
                  value={associe.lienFamilial}
                  onChange={(e) => updateAssocie(index, 'lienFamilial', e.target.value as AssocieData['lienFamilial'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="conjoint">Conjoint</option>
                  <option value="enfant">Enfant</option>
                  <option value="parent">Parent</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// FORMULAIRE BIENS
// ============================================

interface BiensFormProps {
  biens: BienImmobilier[];
  onChange: (biens: BienImmobilier[]) => void;
}

export function BiensForm({ biens, onChange }: BiensFormProps) {
  const ajouterBien = () => {
    const newId = Math.max(...biens.map(b => b.id), 0) + 1;
    onChange([...biens, {
      id: newId,
      nom: `Bien ${newId}`,
      valeur: '',
      loyerMensuel: '',
      charges: '',
      taxeFonciere: ''
    }]);
  };

  const supprimerBien = (id: number) => {
    if (biens.length > 1) {
      onChange(biens.filter(b => b.id !== id));
    }
  };

  const updateBien = (index: number, field: keyof BienImmobilier, value: string) => {
    const newBiens = [...biens];
    newBiens[index] = { ...newBiens[index], [field]: value };
    onChange(newBiens);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Building className="w-7 h-7 text-green-600" />
          Biens immobiliers
        </h2>
        <button
          onClick={ajouterBien}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="space-y-4">
        {biens.map((bien, index) => (
          <div key={bien.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={bien.nom}
                onChange={(e) => updateBien(index, 'nom', e.target.value)}
                className="text-lg font-bold bg-transparent border-b-2 border-transparent hover:border-green-400 focus:border-green-600 focus:outline-none px-2 py-1"
              />
              {biens.length > 1 && (
                <button
                  onClick={() => supprimerBien(bien.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Valeur du bien</label>
                <input
                  type="text"
                  value={bien.valeur}
                  onChange={(e) => updateBien(index, 'valeur', e.target.value)}
                  placeholder="300 000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Loyer mensuel</label>
                <input
                  type="text"
                  value={bien.loyerMensuel}
                  onChange={(e) => updateBien(index, 'loyerMensuel', e.target.value)}
                  placeholder="1 200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Charges mensuelles</label>
                <input
                  type="text"
                  value={bien.charges}
                  onChange={(e) => updateBien(index, 'charges', e.target.value)}
                  placeholder="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Taxe foncière</label>
                <input
                  type="text"
                  value={bien.taxeFonciere}
                  onChange={(e) => updateBien(index, 'taxeFonciere', e.target.value)}
                  placeholder="1 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// AFFICHAGE PLUS-VALUE
// ============================================

interface PlusValueDisplayProps {
  plusValue: ResultatsPlusValue;
  regimeFiscal: 'IR' | 'IS';
}

export function PlusValueDisplay({ plusValue, regimeFiscal }: PlusValueDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Résultat IR */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Plus-value SCI à l&apos;IR</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-purple-200">
            <span className="text-gray-700">Prix de vente estimé</span>
            <span className="font-bold text-gray-900">{plusValue.prixVenteEstime.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-purple-200">
            <span className="text-gray-700">Plus-value brute</span>
            <span className="font-bold text-gray-900">{plusValue.IR.plusValueBrute.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-purple-200">
            <span className="text-gray-700">Abattement IR ({plusValue.anneeRevente} ans)</span>
            <span className="font-bold text-green-600">- {plusValue.IR.abattementIR}%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-purple-200">
            <span className="text-gray-700">Abattement PS ({plusValue.anneeRevente} ans)</span>
            <span className="font-bold text-green-600">- {plusValue.IR.abattementPS.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between pt-3 border-t-2 border-purple-300 bg-purple-100 px-3 rounded">
            <span className="font-bold text-lg">Fiscalité totale</span>
            <span className="font-bold text-2xl text-purple-900">{plusValue.IR.fiscaliteTotal.toLocaleString('fr-FR')} €</span>
          </div>
          <p className="text-sm text-purple-900">Dont surtaxe sur les plus-values élevées : {plusValue.IR.taxeAdditionnelle.toLocaleString('fr-FR')} €.</p>
          {plusValue.anneeRevente >= 30 && (
            <p className="text-sm text-green-700 font-semibold">✅ Exonération totale après 30 ans !</p>
          )}
        </div>
      </div>

      {/* Résultat IS */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Plus-value SCI à l&apos;IS</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-indigo-200">
            <span className="text-gray-700">Prix d&apos;achat</span>
            <span className="font-bold text-gray-900">{plusValue.IS.prixAchat.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-indigo-200">
            <span className="text-gray-700">Amortissements cumulés ({plusValue.anneeRevente} ans)</span>
            <span className="font-bold text-red-600">- {plusValue.IS.amortissementsCumules.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-indigo-200 bg-indigo-100 px-3 rounded">
            <span className="font-semibold">Valeur Nette Comptable</span>
            <span className="font-bold text-indigo-900">{plusValue.IS.valeurNetteComptable.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-indigo-200">
            <span className="text-gray-700">Prix de vente</span>
            <span className="font-bold text-gray-900">{plusValue.IS.prixVente.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-indigo-200">
            <span className="font-semibold">Plus-value imposable</span>
            <span className="font-bold text-indigo-900">{plusValue.IS.plusValueImposable.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex justify-between pt-3 border-t-2 border-indigo-300 bg-indigo-100 px-3 rounded">
            <span className="font-bold text-lg">Impôt IS (25%)</span>
            <span className="font-bold text-2xl text-indigo-900">{plusValue.IS.impotIS.toLocaleString('fr-FR')} €</span>
          </div>
          <p className="text-sm text-red-700 font-semibold">⚠️ Aucun abattement pour durée de détention !</p>
        </div>
      </div>

      {/* Comparaison */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl">
        <h3 className="font-bold text-lg mb-4 text-center">⚖️ Verdict fiscal à la revente</h3>
        <div className="text-center">
          {plusValue.avantageIR > 0 ? (
            <>
              <p className="text-3xl font-bold text-green-600 mb-2">
                ✅ IR plus avantageux
              </p>
              <p className="text-xl text-green-700">
                Économie : {plusValue.avantageIR.toLocaleString('fr-FR')} €
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-red-600 mb-2">
                ⚠️ IS plus coûteux
              </p>
              <p className="text-xl text-red-700">
                Surcoût : {Math.abs(plusValue.avantageIR).toLocaleString('fr-FR')} €
              </p>
            </>
          )}
          <p className="text-sm text-gray-600 mt-4">
            L&apos;avantage fiscal de l&apos;IS pendant la détention peut être annulé par la fiscalité à la revente
          </p>
        </div>
      </div>

      {/* Info importante */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">💡 Points clés à retenir</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>IR</strong> : Abattements progressifs jusqu&apos;à exonération totale après 30 ans</li>
              <li>• <strong>IS</strong> : Les amortissements réduisent l&apos;impôt pendant la détention mais augmentent la plus-value à la revente</li>
              <li>• <strong>Stratégie</strong> : L&apos;IS est optimal si conservation très long terme (&gt; 30 ans) sans revente</li>
              <li>• <strong>Conseil</strong> : Faites une simulation sur votre durée de détention prévue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DISCLAIMER
// ============================================

export function Disclaimer() {
  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="text-xl font-bold text-red-900 mb-3">⚖️ Avertissement Important</h3>
          <div className="space-y-3 text-sm text-red-900">
            <p className="leading-relaxed">
              Cette simulation est fournie <strong>à titre informatif uniquement</strong> et ne constitue pas un conseil juridique, fiscal ou patrimonial personnalisé. Les calculs sont basés sur la réglementation fiscale 2025 et peuvent évoluer.
            </p>
            <p className="leading-relaxed">
              La création d&apos;une SCI et le choix du régime fiscal (IR/IS) ont des <strong>conséquences importantes et durables</strong>. L&apos;option pour l&apos;IS est <strong>irrévocable</strong>.
            </p>
            <div className="bg-white rounded-lg p-4 border-2 border-red-300 mt-4">
              <p className="font-bold text-red-900 mb-2">✅ Consultation obligatoire de professionnels :</p>
              <ul className="space-y-1 ml-4 text-red-800">
                <li>• <strong>Notaire</strong> : Statuts, apports, transmission</li>
                <li>• <strong>Avocat fiscaliste</strong> : Optimisation, choix régime</li>
                <li>• <strong>Expert-comptable</strong> : Comptabilité, déclarations</li>
              </ul>
            </div>
            <p className="text-xs text-red-800 mt-4">
              <strong>📚 Bases légales :</strong> Code Civil (art. 1832-1870), CGI (art. 8, 206, 219, 669, 779), BOFIP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}