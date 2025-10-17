// src\app\pretaxe\DeboursTab.tsx

import React from 'react';
import { Debours } from './PretaxeTypes';

interface DeboursTabProps {
  debours: Debours;
  totalDebours: number;
}

export default function DeboursTab({
  debours,
  totalDebours
}: DeboursTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Contribution de Sécurité Immobilière (CSI)</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Montant calculé: <span className="font-semibold">{debours.csi.toFixed(2)} €</span></p>
          <p className="text-xs text-gray-500 mt-1">0,1% du prix avec minimum 15€</p>
        </div>
      </div>
      
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">Total débours</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalDebours.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}