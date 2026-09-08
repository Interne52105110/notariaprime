// src\app\pretaxe\DocumentsTab.tsx

import React from 'react';
import { Documents } from './PretaxeTypes';

interface DocumentsTabProps {
  documents: Documents;
  setDocuments: React.Dispatch<React.SetStateAction<Documents>>;
  totalDocumentsTTC: number;
  tauxTVA: number;
}

export default function DocumentsTab({
  documents,
  setDocuments,
  totalDocumentsTTC,
  tauxTVA
}: DocumentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de pages de l&apos;acte</label>
          <input
            type="number"
            value={documents.pagesActe}
            onChange={(e) => setDocuments(prev => ({ ...prev, pagesActe: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="1"
          />
          <p className="text-sm text-gray-600 mt-2">Frais de rôle : {(documents.pagesActe * 2).toFixed(2)} € (2€/page)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Copies exécutoires</label>
          <input
            type="number"
            value={documents.copiesExecutoires}
            onChange={(e) => setDocuments(prev => ({ ...prev, copiesExecutoires: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
          <p className="text-sm text-gray-600 mt-2">4€ par copie</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Copies authentiques</label>
          <input
            type="number"
            value={documents.copiesAuthentiques}
            onChange={(e) => setDocuments(prev => ({ ...prev, copiesAuthentiques: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
          <p className="text-sm text-gray-600 mt-2">40€ par copie</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Copies hypothécaires</label>
          <input
            type="number"
            value={documents.copiesHypothecaires}
            onChange={(e) => setDocuments(prev => ({ ...prev, copiesHypothecaires: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
          <p className="text-sm text-gray-600 mt-2">4€ par copie</p>
        </div>
      </div>

      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={documents.archivageNumerise ?? true}
            onChange={(e) => setDocuments(prev => ({ ...prev, archivageNumerise: e.target.checked }))}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Archivage numérisé des actes</span>
            <p className="text-xs text-gray-500">A444-173 n°214 — 0,19 €/page (souvent facturé, y compris en étude « zéro papier »)</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {((documents.archivageNumerise ?? true) ? documents.pagesActe * 0.19 : 0).toFixed(2)} €
        </span>
      </label>

      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">Total TTC (TVA {tauxTVA}%)</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalDocumentsTTC.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}