// src\app\pretaxe\RecapitulatifTab.tsx

import React from 'react';
import { Calculator, Check } from 'lucide-react';
import { getMajorationDOMTOM, getTauxTVA } from './PretaxeCalculations';

interface RecapitulatifTabProps {
  totalEmolumentsTTC: number;
  totalDebours: number;
  totalFormalitesTTC: number;
  totalDocumentsTTC: number;
  totalTaxes: number;
  totalGeneral: number;
  selectedDepartement: string;
  appliquerRemise: boolean;
}

export default function RecapitulatifTab({
  totalEmolumentsTTC,
  totalDebours,
  totalFormalitesTTC,
  totalDocumentsTTC,
  totalTaxes,
  totalGeneral,
  selectedDepartement,
  appliquerRemise
}: RecapitulatifTabProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Calculator className="w-6 h-6 mr-3 text-indigo-600" />
        Récapitulatif final
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Émoluments TTC</span>
          <span className="font-semibold text-lg">{totalEmolumentsTTC.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Débours</span>
          <span className="font-semibold text-lg">{totalDebours.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Formalités TTC</span>
          <span className="font-semibold text-lg">{totalFormalitesTTC.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Documents TTC</span>
          <span className="font-semibold text-lg">{totalDocumentsTTC.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Taxes et droits</span>
          <span className="font-semibold text-lg">{totalTaxes.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-300">
          <span className="text-2xl font-bold text-gray-900">TOTAL GÉNÉRAL</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalGeneral.toLocaleString('fr-FR', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })} €
          </span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start">
          <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Calcul conforme au tarif réglementé 2025/2026
            </p>
            <p className="text-xs text-green-700 mt-1">
              Décret n°2020-179 du 27 février 2020
              {getMajorationDOMTOM(selectedDepartement) > 0 && 
                ` • Article A444-176 (majoration DOM-TOM +${getMajorationDOMTOM(selectedDepartement)}%)`
              }
              {' • TVA '}{getTauxTVA(selectedDepartement)}%
              {getTauxTVA(selectedDepartement) === 0 && ' (exonéré - Art. 294 CGI)'}
            </p>
            {appliquerRemise && (
              <p className="text-xs text-green-700 mt-1">
                • Remise de 20% appliquée sur la tranche &gt;100 000€
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}