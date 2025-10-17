// src\app\pretaxe\TaxesTab.tsx

import React from 'react';
import { Taxes, departements } from './PretaxeTypes';

interface TaxesTabProps {
  taxes: Taxes;
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>;
  totalTaxes: number;
  selectedDepartement: string;
}

export default function TaxesTab({
  taxes,
  setTaxes,
  totalTaxes,
  selectedDepartement
}: TaxesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Type de bien</h3>
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="ancien"
              checked={taxes.typeBien === 'ancien'}
              onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
              className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="font-medium text-gray-900">Bien ancien</span>
              <p className="text-sm text-gray-600">Soumis aux droits de mutation</p>
            </div>
          </label>
          <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="neuf"
              checked={taxes.typeBien === 'neuf'}
              onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
              className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="font-medium text-gray-900">Bien neuf (VEFA)</span>
              <p className="text-sm text-gray-600">Soumis à la TVA uniquement</p>
            </div>
          </label>
        </div>
      </div>
      
      {taxes.typeBien === 'ancien' && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Droits de mutation</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxe départementale ({departements[selectedDepartement]?.taux}%)</span>
                <span className="font-medium">{taxes.departementale.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxe communale (1,20%)</span>
                <span className="font-medium">{taxes.communale.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frais d'assiette (2,37%)</span>
                <span className="font-medium">{taxes.fraisAssiette.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">Total des taxes</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalTaxes.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}