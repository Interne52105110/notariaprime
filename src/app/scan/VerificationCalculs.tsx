// src/app/scan/VerificationCalculs.tsx

import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { CalculCompletScan } from './scanCalculations';

interface VerificationCalculsProps {
  verification: CalculCompletScan['verification'];
}

export function VerificationCalculs({ verification }: VerificationCalculsProps) {
  if (!verification) return null;
  
  const { montantAnnonce, montantCalcule, difference, pourcentageDifference, alerte, message } = verification;
  
  // Pas de montant annoncé trouvé
  if (!montantAnnonce) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-blue-900 mb-2">ℹ️ Vérification des calculs</p>
            <p className="text-blue-800 text-sm">
              Aucun montant de frais n'a été trouvé dans le document pour comparaison.
              Le calcul a été effectué automatiquement selon les barèmes réglementaires 2025.
            </p>
            <p className="text-blue-700 text-sm mt-2">
              <strong>Montant calculé :</strong> {montantCalcule.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Alerte si différence importante
  if (alerte) {
    return (
      <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-7 h-7 text-orange-600 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-bold text-orange-900 mb-3 text-lg">⚠️ ATTENTION : Écart important détecté</p>
            <p className="text-orange-800 mb-4">{message}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-orange-200">
                <p className="text-xs text-gray-600 mb-1">Montant annoncé dans l'acte</p>
                <p className="text-2xl font-bold text-gray-900">
                  {montantAnnonce.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
                <p className="text-xs text-gray-600 mb-1">Montant calculé (barème 2025)</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {montantCalcule.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-sm font-semibold text-orange-900 mb-1">
                Différence : {difference!.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € 
                ({pourcentageDifference!.toFixed(2)}%)
              </p>
              <p className="text-xs text-orange-800 mt-2">
                💡 <strong>Recommandations :</strong>
              </p>
              <ul className="text-xs text-orange-800 mt-1 space-y-1 ml-4">
                <li>• Vérifiez si le document utilise d'anciens barèmes</li>
                <li>• Contrôlez les montants de base (prix de vente, valeur)</li>
                <li>• Vérifiez si des remises ont été appliquées</li>
                <li>• Consultez un notaire en cas de doute</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Calcul cohérent
  return (
    <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-green-900 mb-3 text-lg">✅ Calcul vérifié et cohérent</p>
          <p className="text-green-800 mb-4">{message}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <p className="text-xs text-gray-600 mb-1">Montant annoncé dans l'acte</p>
              <p className="text-2xl font-bold text-gray-900">
                {montantAnnonce.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <p className="text-xs text-gray-600 mb-1">Montant calculé (barème 2025)</p>
              <p className="text-2xl font-bold text-green-600">
                {montantCalcule.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm font-semibold text-green-900">
              Différence minime : {difference!.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € 
              ({pourcentageDifference!.toFixed(2)}%)
            </p>
            <p className="text-xs text-green-800 mt-1">
              Les frais annoncés dans l'acte correspondent au calcul réglementaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}