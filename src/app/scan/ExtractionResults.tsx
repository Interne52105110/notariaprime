// src/app/scan/ExtractionResults.tsx

import React from 'react';
import { 
  CheckCircle, AlertCircle, Info, MapPin, Calendar, 
  Users, Home, DollarSign, FileCheck 
} from 'lucide-react';
import type { DonneesExtraites } from './ScanTypes';

interface ExtractionResultsProps {
  typeActe: string;
  confiance: number;
  donnees: DonneesExtraites;
  warnings?: string[];
  informations?: string[];
  suggestions?: string[];
}

export function ExtractionResults({
  typeActe,
  confiance,
  donnees,
  warnings,
  informations,
  suggestions
}: ExtractionResultsProps) {
  const montantPrincipal = donnees.prixVente || 
                           donnees.valeurBien || 
                           donnees.montantDonation || 
                           donnees.actifSuccession || 
                           donnees.montantPret || 
                           0;

  return (
    <div className="space-y-6">
      {/* Type d'acte détecté */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Type d'acte détecté</p>
              <h2 className="text-4xl font-bold capitalize">{typeActe}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Niveau de confiance</p>
            <p className="text-4xl font-bold">{confiance.toFixed(0)}%</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${confiance}%` }}
          />
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-yellow-900 mb-2">⚠️ Avertissements</p>
              <ul className="space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i} className="text-yellow-800">• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Informations */}
      {informations && informations.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-blue-900 mb-2">ℹ️ Informations</p>
              <ul className="space-y-1">
                {informations.map((info, i) => (
                  <li key={i} className="text-blue-800">• {info}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Données extraites */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <FileCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Données extraites</h3>
        </div>
        
        <div className="space-y-3">
          {/* Montant principal */}
          {montantPrincipal > 0 && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {typeActe === 'vente' ? 'Prix de vente' :
                   typeActe === 'pret' ? 'Montant du prêt' :
                   'Valeur du bien'}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {montantPrincipal.toLocaleString('fr-FR')} €
              </p>
            </div>
          )}
          
          {/* Date */}
          {donnees.dateActe && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Date de l'acte</p>
                <p className="font-bold text-gray-900">{donnees.dateActe}</p>
              </div>
            </div>
          )}
          
          {/* Adresse */}
          {donnees.adresse && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <p className="text-xs text-gray-600">Localisation</p>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-relaxed">
                {donnees.adresse}
              </p>
            </div>
          )}
          
          {/* Type de bien */}
          {donnees.typeBien && (
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-700">Type de bien</span>
              </div>
              <span className="font-bold text-gray-900 capitalize">
                {donnees.typeBien}
              </span>
            </div>
          )}
          
          {/* Parties */}
          {(donnees.vendeur || donnees.acquereur || donnees.donateur || donnees.donataire) && (
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-pink-600" />
                <p className="text-xs font-medium text-gray-600">Parties</p>
              </div>
              <div className="space-y-1 text-sm">
                {donnees.vendeur && (
                  <p><span className="text-gray-600">Vendeur:</span> <span className="font-bold text-gray-900">{donnees.vendeur}</span></p>
                )}
                {donnees.acquereur && (
                  <p><span className="text-gray-600">Acquéreur:</span> <span className="font-bold text-gray-900">{donnees.acquereur}</span></p>
                )}
                {donnees.donateur && (
                  <p><span className="text-gray-600">Donateur:</span> <span className="font-bold text-gray-900">{donnees.donateur}</span></p>
                )}
                {donnees.donataire && (
                  <p><span className="text-gray-600">Donataire:</span> <span className="font-bold text-gray-900">{donnees.donataire}</span></p>
                )}
              </div>
            </div>
          )}
          
          {/* Lien de parenté */}
          {donnees.lienParente && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
              <span className="text-sm text-gray-700">Lien de parenté</span>
              <span className="font-bold text-gray-900 capitalize">
                {donnees.lienParente}
              </span>
            </div>
          )}
        </div>
        
        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
              <Info className="w-4 h-4" />
              Suggestions
            </p>
            <ul className="space-y-1 text-sm">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="text-blue-800">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}