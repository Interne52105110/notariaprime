"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ScanLine, Loader2, CheckCircle, AlertCircle, X, Upload, Cpu, ChevronDown, ChevronUp, Shield, FileText, Brain } from 'lucide-react';
import { categoriesActes as defaultCategoriesActes } from './ocrMappings';
import { checkOllama, extractWithOllama, type OllamaModel } from './ollamaExtract';
import { extractTextFromLegacyDoc } from './legacyDocExtract';

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
  const [progressLabel, setProgressLabel] = useState<string>('Analyse OCR');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedHit | null>(null);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[] | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkOllama().then((models) => {
      if (cancelled) return;
      setOllamaModels(models);
      if (models && models.length > 0) {
        // Choisit le premier modèle compatible (llama, mistral, qwen, gemma)
        const preferred = models.find((m) =>
          /llama|mistral|qwen|gemma|phi/i.test(m.name)
        ) ?? models[0];
        setSelectedModel(preferred.name);
      }
    });
    return () => { cancelled = true; };
  }, []);
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

    if (!isImage && !isPdf && !isDocx && !isLegacyDoc) {
      setError("Format non supporté. Utilisez une image (JPG/PNG/WebP), un PDF, ou un fichier Word (.doc/.docx).");
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
        setProgressLabel('Lecture du DOCX');
        setProgress(20);
        const mammoth = (await import('mammoth')).default ?? (await import('mammoth'));
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value || '';
        setProgress(100);
      } else if (isLegacyDoc) {
        setProgressLabel('Lecture du DOC (Word 97-2003)');
        setProgress(30);
        text = await extractTextFromLegacyDoc(file);
        setProgress(100);
        if (text.trim().length < 40) {
          setError("Texte introuvable dans ce .doc. Pour un meilleur résultat, ouvrez le fichier dans Word ou LibreOffice et faites « Enregistrer sous » en .docx.");
          setIsProcessing(false);
          return;
        }
      } else if (isPdf) {
        setProgressLabel('Lecture du PDF');
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
        setProgressLabel('Analyse OCR');
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

      let hit = parseExtractedText(text);

      // Si l'IA locale est activée, on raffine l'extraction
      if (useAI && selectedModel && ollamaModels && ollamaModels.length > 0) {
        try {
          setProgressLabel(`Analyse IA (${selectedModel})`);
          setProgress(50);
          const ai = await extractWithOllama(text, selectedModel);
          setProgress(100);
          // L'IA prime sur le regex quand elle a une réponse
          if (ai.montant) hit.montant = ai.montant;
          if (ai.departement) hit.departement = ai.departement;
          if (ai.acteSuggestion) {
            for (const [catKey, cat] of Object.entries(defaultCategoriesActes)) {
              if (cat.actes[ai.acteSuggestion]) {
                hit.categoryKey = catKey;
                hit.acteKey = ai.acteSuggestion;
                hit.acteLabel = cat.actes[ai.acteSuggestion][0];
                break;
              }
            }
          }
        } catch (aiErr) {
          console.warn('Ollama extraction failed, fallback regex:', aiErr);
        }
      }

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
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-bold text-gray-900">Scanner un projet d'acte</h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              100 % local — aucune donnée envoyée
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Importez un PDF, un fichier Word (.doc/.docx) ou une image (JPG/PNG/WebP). Le montant,
            le département et le type d'acte seront extraits automatiquement.
          </p>

          <button
            onClick={() => setShowHelp((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 mb-4"
          >
            {showHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Comment ça marche ? {ollamaModels && ollamaModels.length > 0 ? '(IA locale disponible)' : '(Activer l\'IA locale)'}
          </button>

          {showHelp && (
            <div className="mb-5 bg-white border border-indigo-200 rounded-xl p-5 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mode par défaut — extraction par règles</p>
                  <p className="text-gray-600 mt-0.5">
                    Le texte est lu directement dans votre navigateur (tesseract.js pour les images,
                    pdfjs pour les PDF, mammoth pour les .docx). Une heuristique repère le montant
                    en euros, le code département via le code postal, et le type d'acte via des
                    mots-clés. <strong>Aucune connexion réseau, aucun envoi de données.</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Mode IA locale — optionnel, via Ollama</p>
                  <p className="text-gray-600 mt-0.5 mb-2">
                    Pour une extraction plus fine (paraphrases, montants en lettres, contexte
                    complet), vous pouvez brancher un modèle de langage qui tourne <strong>sur votre
                    propre machine</strong>. Idéal pour le secret professionnel notarial (art. 226-13 CP)
                    et conforme RGPD : aucune donnée ne quitte le poste.
                  </p>

                  {ollamaModels && ollamaModels.length > 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-emerald-900 font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Ollama détecté ({ollamaModels.length} modèle{ollamaModels.length > 1 ? 's' : ''} disponible{ollamaModels.length > 1 ? 's' : ''})
                      </p>
                      <p className="text-emerald-800 text-xs mt-1">
                        Cochez la case « IA locale » ci-dessous lors de l'import pour utiliser le
                        modèle. L'extraction par règles reste appliquée en parallèle.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                      <p className="text-gray-900 font-medium">Pas encore installé. En 3 étapes :</p>
                      <ol className="list-decimal list-inside text-gray-700 text-xs space-y-1 ml-1">
                        <li>
                          Téléchargez{' '}
                          <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
                            Ollama
                          </a>{' '}
                          (Windows, macOS, Linux — open source, gratuit)
                        </li>
                        <li>
                          Ouvrez un terminal et lancez :{' '}
                          <code className="px-1.5 py-0.5 bg-gray-200 rounded font-mono text-[11px]">ollama pull llama3.1:8b</code>
                          {' '}(≈ 5 Go, à faire une seule fois)
                        </li>
                        <li>
                          Rechargez cette page : un nouveau bouton « IA locale » apparaîtra à côté
                          de « Choisir un fichier ».
                        </li>
                      </ol>
                      <p className="text-gray-500 text-[11px] italic">
                        Ollama tourne en service local sur le port 11434. Aucune inscription, aucun
                        compte, aucun envoi externe. Modèles compatibles : llama3.1, mistral, qwen2,
                        gemma2, phi3…
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                <strong className="text-gray-700">Formats acceptés :</strong> PDF (texte
                sélectionnable), Word récent .docx, Word 97-2003 .doc (extraction best-effort —
                préférez la conversion en .docx pour un résultat propre), images JPG/PNG/WebP. Les
                PDF entièrement scannés doivent être exportés en image.
              </div>
            </div>
          )}

          {!previewUrl && !isProcessing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf,.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  Choisir un fichier
                </button>
                {ollamaModels && ollamaModels.length > 0 && (
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition-all">
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">IA locale (Ollama)</span>
                    {useAI && (
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-1 px-2 py-1 text-xs border border-emerald-200 rounded bg-white"
                      >
                        {ollamaModels.map((m) => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    )}
                  </label>
                )}
              </div>
            </>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{progressLabel} en cours… {progress}%</p>
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
