// src\app\pretaxe\EmolumentsTab.tsx

import React from 'react';
import { Info } from 'lucide-react';
import { EmolumentsDetail } from './PretaxeTypes';
import { getMajorationDOMTOM } from './PretaxeCalculations';

interface EmolumentsTabProps {
  emolumentsDetail: EmolumentsDetail;
  totalEmoluments: number;
  montantTVA: number;
  totalEmolumentsTTC: number;
  tauxTVA: number;
  selectedDepartement: string;
  montantActe: string;
  appliquerRemise: boolean;
  setAppliquerRemise: (value: boolean) => void;
  isRelatif?: boolean;
  quotiteSurete?: number;
  setQuotiteSurete?: (value: number) => void;
}

export default function EmolumentsTab({
  emolumentsDetail,
  totalEmoluments,
  montantTVA,
  totalEmolumentsTTC,
  tauxTVA,
  selectedDepartement,
  montantActe,
  appliquerRemise,
  setAppliquerRemise,
  isRelatif = false,
  quotiteSurete = 0.5,
  setQuotiteSurete
}: EmolumentsTabProps) {
  const quotites = [
    { val: 0.25, label: '¼ — sûreté consentie par un tiers dans l\'acte principal' },
    { val: 0.5, label: '½ — autres cas (sûreté dans un acte distinct lié)' },
    { val: 1, label: 'Totalité — aucun acte principal' },
  ];
  return (
    <div>
      {isRelatif && setQuotiteSurete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-amber-900 mb-3">
            Émolument relatif à l&apos;acte principal (A444-127/136/148) — choisissez la quotité :
          </p>
          <div className="space-y-2">
            {quotites.map((q) => (
              <label key={q.val} className="flex items-center cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={quotiteSurete === q.val}
                  onChange={() => setQuotiteSurete(q.val)}
                  className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-amber-900">{q.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-2">
            Le barème ci-dessous est celui du prêt garanti (A444-143), auquel la quotité est appliquée.
          </p>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              Calcul selon tranches réglementaires.
            </p>
            {getMajorationDOMTOM(selectedDepartement) > 0 && (
              <p className="text-sm text-blue-900 mt-2 font-medium">
                ⚠️ Majoration DOM-TOM de {getMajorationDOMTOM(selectedDepartement)}% appliquée
              </p>
            )}
            {montantActe && parseFloat(montantActe.replace(/\s/g, '')) > 100000 && (
              <div className="mt-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appliquerRemise}
                    onChange={(e) => setAppliquerRemise(e.target.checked)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm font-medium text-blue-900">
                    Appliquer la remise de 20% au-delà de 100 000€
                  </span>
                </label>
                <p className="text-xs text-blue-700 mt-1 ml-6">
                  Article A444-174 - Remise optionnelle rarement pratiquée
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">Émoluments bruts</span>
          <span className="font-semibold text-lg">{emolumentsDetail.bruts.toFixed(2)} €</span>
        </div>
        
        {emolumentsDetail.majoration > 0 && (
          <div className="flex justify-between items-center py-3 border-b border-gray-100 bg-orange-50 px-3 rounded-lg">
            <span className="text-orange-900 font-medium">
              Majoration DOM-TOM (+{getMajorationDOMTOM(selectedDepartement)}%)
            </span>
            <span className="font-semibold text-lg text-orange-900">
              +{emolumentsDetail.majoration.toFixed(2)} €
            </span>
          </div>
        )}
        
        {emolumentsDetail.remise20 > 0 && (
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-green-600">Remise 20% (au-delà 100k€)</span>
            <span className="text-green-600 text-lg">-{emolumentsDetail.remise20.toFixed(2)} €</span>
          </div>
        )}
        
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Total HT</span>
          <span className="font-semibold text-lg">{totalEmoluments.toFixed(2)} €</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">
            TVA ({tauxTVA}%)
            {tauxTVA === 0 && <span className="text-green-600 font-medium"> - EXONÉRÉ</span>}
          </span>
          <span className="text-lg">{montantTVA.toFixed(2)} €</span>
        </div>
        
        <div className="flex justify-between items-center py-4 border-t-2 border-gray-200">
          <span className="font-bold text-xl">Total TTC</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalEmolumentsTTC.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}
