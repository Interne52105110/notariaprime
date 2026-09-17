"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ScanLine, Loader2, CheckCircle, AlertCircle, X, Upload, Cpu, ChevronDown, ChevronUp, Shield, FileText, Brain } from 'lucide-react';
import { categoriesActes as defaultCategoriesActes } from './ocrMappings';
import { checkOllama, extractWithOllama, type OllamaModel } from './ollamaExtract';
import { extractTextFromLegacyDoc } from './legacyDocExtract';
import { parseExtractedText, type ExtractedHit } from './extractPretaxeText';

interface OCRScannerProps {
  onExtract: (data: {
    montant?: string;
    departement?: string;
    categoryKey?: string;
    acteKey?: string;
    valeurMobilier?: number;
    rawText?: string;
  }) => void;
}

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
  const [texteColle, setTexteColle] = useState('');
  const [applied, setApplied] = useState(false);

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

  const handleFile = async (file: File) => {
    setError(null);
    setExtracted(null);
    setApplied(false);
    setProgress(0);

    const name = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
    const isDocx = name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isLegacyDoc = name.endsWith('.doc') && !isDocx;
    const isText = name.endsWith('.txt') || file.type === 'text/plain';

    if (!isImage && !isPdf && !isDocx && !isLegacyDoc && !isText) {
      setError("Format non supporté. Utilisez une image (JPG/PNG/WebP), un PDF, un fichier Word (.doc/.docx) ou un texte (.txt).");
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

      if (isText) {
        text = await file.text();
      } else if (isDocx) {
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
        // Build "legacy" : pdfjs-dist v6 utilise Promise.try / Uint8Array.toHex dans
        // le build moderne, qui exigent Chrome 140+, Firefox 133+, Safari 18.2+.
        // Le build legacy est transpilé et couvre les navigateurs de bureau plus anciens.
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const parts: string[] = [];
        let worker: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>> | undefined;
        try {
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            try {
              const content = await page.getTextContent();
              let pageText = content.items.map(it=>'str' in it?it.str:'').join(' ');
              if(pageText.trim().length<50){
                setProgressLabel(`OCR du PDF : page ${i}/${pdf.numPages}`);
                if(!worker)worker = await (await import('tesseract.js')).createWorker('fra');
                const viewport = page.getViewport({scale:1.5});
                const canvas = document.createElement('canvas');
                canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
                await page.render({canvas,viewport}).promise;
                pageText = (await worker.recognize(canvas)).data.text;
                canvas.width=0; canvas.height=0;
              }
              parts.push(`[Page ${i}]\n${pageText}`);
            } finally { page.cleanup(); }
            setProgress(Math.round(i/pdf.numPages*100));
          }
          text = parts.join('\n');
        } finally { if(worker)await worker.terminate(); await loadingTask.destroy(); }
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
        try { text = (await worker.recognize(file)).data.text || ''; } finally { await worker.terminate(); }
      }

      const hit = parseExtractedText(text);

      // Si l'IA locale est activée, on raffine l'extraction
      if (useAI && selectedModel && ollamaModels && ollamaModels.length > 0) {
        try {
          setProgressLabel(`Analyse IA (${selectedModel})`);
          setProgress(50);
          const ai = await extractWithOllama(text, selectedModel);
          setProgress(100);
          hit.avertissements.push('Les propositions IA doivent être vérifiées dans le texte.');
          if(text.length>16000)hit.avertissements.push('L’IA a reçu des extraits du document ; certaines clauses peuvent ne pas être couvertes.');
          // L'IA prime sur le regex quand elle a une réponse
          if (ai.montant) hit.montant = ai.montant;
          if (ai.departement) hit.departement = ai.departement;
          if (ai.valeurMobilier != null) hit.valeurMobilier = ai.valeurMobilier;
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
    setApplied(false);
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
            <h3 className="text-lg font-bold text-gray-900">Scanner un projet d&apos;acte</h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              100 % local — aucune donnée envoyée
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Importez un PDF, un fichier Word (.doc/.docx) ou une image (JPG/PNG/WebP). Le montant,
            le département et le type d&apos;acte repérés seront proposés pour vérification.
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
                    en euros, le code département via le code postal, et le type d&apos;acte via des
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
                    Le traitement du document reste local avec un modèle exécuté sur votre poste.
                  </p>

                  {ollamaModels && ollamaModels.length > 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-emerald-900 font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Ollama détecté ({ollamaModels.length} modèle{ollamaModels.length > 1 ? 's' : ''} disponible{ollamaModels.length > 1 ? 's' : ''})
                      </p>
                      <p className="text-emerald-800 text-xs mt-1">
                        Cochez la case « IA locale » ci-dessous lors de l&apos;import pour utiliser le
                        modèle. L&apos;extraction par règles reste appliquée en parallèle.
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

          <details className="rounded-lg border border-indigo-200 bg-white p-3">
            <summary className="cursor-pointer text-sm font-semibold text-indigo-800">Coller le texte d’un acte</summary>
            <textarea aria-label="Texte de l’acte à analyser" className="mt-3 min-h-40 w-full rounded border p-3 text-sm" value={texteColle} onChange={e=>setTexteColle(e.target.value)} placeholder="Collez le texte ici…"/>
            <button type="button" disabled={!texteColle.trim()||isProcessing} className="mt-2 rounded bg-indigo-700 px-4 py-2 text-sm text-white disabled:opacity-50" onClick={()=>{setError(null);setApplied(false);setExtracted(parseExtractedText(texteColle));}}>Analyser ce texte</button>
          </details>

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
                  <p className="text-xs text-gray-500">Type d&apos;acte</p>
                  <p className="font-bold text-gray-900">{extracted.acteLabel || '—'}</p>
                </div>
              </div>
              {extracted.valeurMobilier != null && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                  <span className="font-semibold text-amber-900">Mobilier détecté : </span>
                  <span className="text-amber-800">
                    {extracted.valeurMobilier.toLocaleString('fr-FR')} € (déduit de l&apos;assiette DMTO — art. 735 CGI)
                  </span>
                </div>
              )}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{extracted.avertissements.map((a,i)=><p key={i} className={i?'mt-1':''}>{a}</p>)}</div>
              {extracted.preuves.length>0&&<details className="rounded border bg-white p-3"><summary className="cursor-pointer text-sm">Passages utilisés pour les propositions</summary>{extracted.preuves.map((preuve,i)=><p key={i} className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{preuve}</p>)}</details>}
              <button type="button" disabled={applied} className="rounded-lg bg-indigo-700 px-4 py-3 text-sm font-semibold text-white disabled:bg-gray-500" onClick={()=>{onExtract(extracted);setApplied(true);}}>{applied?'Propositions appliquées':'Utiliser ces propositions dans un nouveau calcul'}</button>
              <p className="text-sm text-gray-600">Cette action remplace le dossier courant. Complétez et corrigez ensuite les champs du formulaire ; les données absentes ne sont pas reprises du calcul précédent.</p>
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
