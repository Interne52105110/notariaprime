"use client";

import React, { useState, useRef } from 'react';
import { ScanLine, Loader2, CheckCircle, AlertCircle, X, Upload } from 'lucide-react';
import { categoriesActes as defaultCategoriesActes } from './ocrMappings';

interface OCRScannerProps {
  onExtract: (data: {
    montant?: string;
    departement?: string;
    categoryKey?: string;
    acteKey?: string;
    rawText?: string;
  }) => void;
}

type ExtractedHit = {
  montant?: string;
  departement?: string;
  categoryKey?: string;
  acteKey?: string;
  acteLabel?: string;
};

export default function OCRScanner({ onExtract }: OCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedHit | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExtractedText = (text: string): ExtractedHit => {
    const result: ExtractedHit = {};

    // 1) Montant : on cherche un nombre suivi de €, EUR ou "euros"
    // Tolère espaces, points, virgules comme séparateurs.
    const montantRegex = /([0-9]{1,3}(?:[\s.,][0-9]{3})+|[0-9]{4,})(?:[.,][0-9]{1,2})?\s*(?:€|EUR|euros?)/gi;
    const montants: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = montantRegex.exec(text)) !== null) {
      const num = parseFloat(m[1].replace(/[\s.]/g, '').replace(',', '.'));
      if (!isNaN(num) && num >= 1000) montants.push(num);
    }
    if (montants.length > 0) {
      // On prend le plus grand montant trouvé (souvent le prix de vente / valeur)
      const max = Math.max(...montants);
      result.montant = max.toLocaleString('fr-FR').replace(/ /g, ' ');
    }

    // 2) Département : code postal sur 5 chiffres
    const cpRegex = /\b([0-9]{2}|2A|2B)[0-9]{3}\b/gi;
    const cpMatch = text.match(cpRegex);
    if (cpMatch && cpMatch.length > 0) {
      const cp = cpMatch[0];
      const dept = cp.startsWith('97') || cp.startsWith('98')
        ? cp.substring(0, 3)
        : cp.substring(0, 2).toUpperCase();
      result.departement = dept;
    }

    // 3) Type d'acte : recherche de mots-clés
    const lowerText = text.toLowerCase();
    for (const [catKey, cat] of Object.entries(defaultCategoriesActes)) {
      for (const [acteKey, keywords] of Object.entries(cat.actes)) {
        for (const kw of keywords) {
          if (lowerText.includes(kw.toLowerCase())) {
            result.categoryKey = catKey;
            result.acteKey = acteKey;
            result.acteLabel = keywords[0];
            return result;
          }
        }
      }
    }

    return result;
  };

  const handleFile = async (file: File) => {
    setError(null);
    setExtracted(null);
    setProgress(0);

    const name = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
    const isDocx = name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isLegacyDoc = name.endsWith('.doc') && !isDocx;

    if (isLegacyDoc) {
      setError("Format .doc (Word 97-2003) non supporté côté navigateur. Convertissez le fichier en .docx, .pdf ou image.");
      return;
    }
    if (!isImage && !isPdf && !isDocx) {
      setError("Format non supporté. Utilisez une image (JPG/PNG/WebP), un PDF ou un fichier .docx.");
      return;
    }

    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('non-image');
    }
    setIsProcessing(true);

    try {
      let text = '';

      if (isDocx) {
        setProgress(20);
        const mammoth = (await import('mammoth')).default ?? (await import('mammoth'));
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value || '';
        setProgress(100);
      } else if (isPdf) {
        setProgress(10);
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const parts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          parts.push(
            content.items
              .map((it) => ('str' in it ? it.str : ''))
              .join(' ')
          );
          setProgress(Math.round((i / pdf.numPages) * 100));
        }
        text = parts.join('\n');
        if (text.trim().length < 50) {
          setError("PDF scanné détecté (peu de texte sélectionnable). Exportez chaque page en image pour passer par l'OCR.");
          setIsProcessing(false);
          return;
        }
      } else {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('fra', 1, {
          logger: (msg: { status: string; progress: number }) => {
            if (msg.status === 'recognizing text') {
              setProgress(Math.round(msg.progress * 100));
            }
          }
        });
        const { data } = await worker.recognize(file);
        await worker.terminate();
        text = data.text || '';
      }

      const hit = parseExtractedText(text);
      setExtracted(hit);

      onExtract({
        montant: hit.montant,
        departement: hit.departement,
        categoryKey: hit.categoryKey,
        acteKey: hit.acteKey,
        rawText: text
      });
    } catch (err) {
      console.error('Extraction error:', err);
      setError("Erreur lors de l'analyse du document. Vérifiez le fichier ou essayez un autre format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (previewUrl && previewUrl !== 'non-image') URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setExtracted(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <ScanLine className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Scanner un projet d'acte</h3>
          <p className="text-sm text-gray-600 mb-4">
            Importez un PDF, un fichier Word (.docx) ou une image (JPG/PNG/WebP) : montant,
            département et type d'acte seront extraits automatiquement, en local dans le navigateur.
          </p>

          {!previewUrl && !isProcessing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Upload className="w-4 h-4" />
                Choisir un fichier
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Formats : PDF (texte sélectionnable), Word .docx, image JPG/PNG/WebP. Le .doc ancien Office n'est pas supporté.
              </p>
            </>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Analyse OCR en cours… {progress}%</p>
                <div className="mt-1 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={reset} className="ml-auto text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {extracted && !isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Analyse terminée</span>
                <button onClick={reset} className="ml-auto text-xs text-gray-500 hover:text-gray-700 underline">
                  Nouvelle analyse
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500">Montant</p>
                  <p className="font-bold text-gray-900">{extracted.montant ? `${extracted.montant} €` : '—'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500">Département</p>
                  <p className="font-bold text-gray-900">{extracted.departement || '—'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500">Type d'acte</p>
                  <p className="font-bold text-gray-900">{extracted.acteLabel || '—'}</p>
                </div>
              </div>
              {!extracted.montant && !extracted.departement && !extracted.acteKey && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  Aucune donnée reconnue. Saisissez les informations manuellement ou réessayez avec une image plus nette.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
