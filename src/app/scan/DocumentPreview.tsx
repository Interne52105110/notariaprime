// src/app/scan/DocumentPreview.tsx

import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { ExtractionProgress } from './ScanTypes';

interface DocumentPreviewProps {
  file: File;
  previewUrl?: string;
  loading: boolean;
  ocrProgress: ExtractionProgress;
  onAnalyse: () => void;
  onCancel: () => void;
}

export function DocumentPreview({
  file,
  previewUrl,
  loading,
  ocrProgress,
  onAnalyse,
  onCancel
}: DocumentPreviewProps) {
  return (
    <div className="mt-8">
      <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">{file.name}</p>
            <p className="text-sm text-gray-600">
              {(file.size / 1024).toFixed(1)} KB • {file.type || 'Type inconnu'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={onAnalyse}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Analyser le document
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barre de progression OCR */}
        {loading && ocrProgress.progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700">{ocrProgress.status}</span>
              <span className="text-indigo-600">{ocrProgress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${ocrProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Prévisualisation image */}
        {previewUrl && !loading && (
          <div className="mt-6">
            <img 
              src={previewUrl} 
              alt="Prévisualisation" 
              className="max-h-80 mx-auto rounded-xl shadow-lg border-2 border-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}