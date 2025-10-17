// src\app\pretaxe\FormalitesTab.tsx

import React from 'react';
import { Formalites } from './PretaxeTypes';
import { estFormaliteObligatoire } from './PretaxeCalculations';

interface FormalitesTabProps {
  formalites: Formalites;
  setFormalites: React.Dispatch<React.SetStateAction<Formalites>>;
  totalFormalitesTTC: number;
  tauxTVA: number;
  selectedActe: string;
}

export default function FormalitesTab({
  formalites,
  setFormalites,
  totalFormalitesTTC,
  tauxTVA,
  selectedActe
}: FormalitesTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {Object.entries({
          'publiciteFonciere': { label: 'Publicité foncière', item: formalites.publiciteFonciere },
          'cadastre': { label: 'Documents cadastraux', item: formalites.cadastre },
          'casierJudiciaire': { label: 'Casier judiciaire', item: formalites.casierJudiciaire },
          'notification': { label: 'Notification préemption', item: formalites.notification },
          'mesurage': { label: 'Certificat mesurage', item: formalites.mesurage },
          'transmissionCSN': { label: 'Transmission CSN', item: formalites.transmissionCSN },
          'requisition': { label: 'Réquisition SPF', item: formalites.requisition }
        }).map(([key, { label, item }]) => {
          const obligatoire = estFormaliteObligatoire(key, selectedActe);
          return (
            <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.actif}
                  disabled={obligatoire}
                  onChange={(e) => {
                    if (!obligatoire) {
                      setFormalites(prev => ({
                        ...prev,
                        [key]: { ...item, actif: e.target.checked }
                      }));
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {obligatoire && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    Obligatoire
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.montant.toFixed(2)} €</span>
            </label>
          );
        })}
        
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Diagnostics</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(formalites.diagnostics).map(([key, diag]) => (
              <label key={key} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diag.actif}
                    onChange={(e) => {
                      setFormalites(prev => ({
                        ...prev,
                        diagnostics: {
                          ...prev.diagnostics,
                          [key]: { ...diag, actif: e.target.checked }
                        }
                      }));
                    }}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-xs font-medium text-gray-700">{key.toUpperCase()}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{diag.montant.toFixed(2)}€</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">Total TTC (TVA {tauxTVA}%)</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalFormalitesTTC.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}