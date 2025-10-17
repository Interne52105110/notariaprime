// src/app/scan/page.tsx

'use client';

import React, { useState } from 'react';
import { 
  FileText, Upload, AlertCircle, CheckCircle, FileImage, 
  FileType, File, Search, Download, Share2, Copy, RefreshCw,
  ChevronDown, ChevronUp, Eye, Info, Calculator, PieChart
} from 'lucide-react';
import MainLayout from '@/components/MainLayout';

// ✅ Import modules SCAN (extraction)
import { extraireTexte } from './documentExtractor';
import { detecterTypeActe } from './typeDetector';
import { extraireDonnees } from './dataExtractor';
import { 
  mapTypeActeVersPretaxe,
  mapCategorieActe,
  mapDonneesVersPretaxe,
  extraireMontantPrincipal,
  genererSuggestions,
  genererWarnings,
  genererInformations
} from './mappingUtils';
import type { AnalyseResult, ExtractionProgress } from './ScanTypes';

// ✅ Import CALCULS COMPLETS
import { calculerFraisCompletsScan, type CalculCompletScan } from './scanCalculations';

// ✅ Import composant de vérification
import { VerificationCalculs } from './VerificationCalculs';

// Pour l'export PDF
import jsPDF from 'jspdf';

export default function ScanPage() {
  // États
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [analyseResult, setAnalyseResult] = useState<AnalyseResult | null>(null);
  const [ocrProgress, setOcrProgress] = useState<ExtractionProgress>({ status: '', progress: 0 });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showFullText, setShowFullText] = useState(false);
  
  // États pour affichage détails
  const [showEmolumentsDetail, setShowEmolumentsDetail] = useState(false);
  const [showDroitsDetail, setShowDroitsDetail] = useState(false);
  const [showFormalitesDetail, setShowFormalitesDetail] = useState(false);
  const [showDeboursDetail, setShowDeboursDetail] = useState(false);

  // Gestion fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setAnalyseResult(null);
      setOcrProgress({ status: '', progress: 0 });
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl('');
      }
    }
  };

  // Analyse document
  const analyserDocument = async () => {
    if (!file) return;
    
    setAnalyseResult(null);
    setLoading(true);
    setError('');
    setOcrProgress({ status: 'Démarrage...', progress: 0 });

    try {
      console.log('🚀 Début analyse...');
      
      // ÉTAPE 1 : EXTRACTION TEXTE (module scan)
      const texteBrut = await extraireTexte(file, setOcrProgress);
      console.log('📄 Texte extrait:', texteBrut.substring(0, 200) + '...');
      
      if (texteBrut.length < 20) {
        throw new Error('Document trop court ou illisible (moins de 20 caractères extraits)');
      }

      // ÉTAPE 2 : DÉTECTION TYPE ACTE (module scan)
      const typeDetecte = detecterTypeActe(texteBrut);
      console.log('🎯 Type détecté:', typeDetecte);
      
      // ÉTAPE 3 : EXTRACTION DONNÉES (module scan)
      const donneesExtraites = extraireDonnees(texteBrut, typeDetecte.type);
      console.log('📊 Données extraites:', donneesExtraites);
      
      // ÉTAPE 4 : MAPPING VERS PRETAXE (module mapping)
      const typePretaxe = mapTypeActeVersPretaxe(typeDetecte.type);
      const categoriePretaxe = mapCategorieActe(typeDetecte.type);
      const donneesPretaxe = mapDonneesVersPretaxe(donneesExtraites);
      const montant = extraireMontantPrincipal(donneesExtraites);
      
      console.log('🔄 Mapping:', { typePretaxe, categoriePretaxe, montant });

      // ÉTAPE 5 : CALCULS AUTOMATIQUES COMPLETS ✅
      const calcul: CalculCompletScan | null = calculerFraisCompletsScan(
        typeDetecte.type, 
        donneesExtraites, 
        texteBrut
      );
      
      console.log('🧮 Calcul complet:', calcul);

      // Génération suggestions/warnings/infos (module mapping)
      const suggestions = genererSuggestions(donneesExtraites, typeDetecte.type, typeDetecte.confiance);
      const warnings = genererWarnings(donneesExtraites, typeDetecte.type, typeDetecte.confiance, montant);
      const informations = genererInformations(donneesExtraites, typeDetecte.type);

      const resultat: AnalyseResult = {
        typeActe: typeDetecte.type,
        confiance: typeDetecte.confiance,
        donneesExtraites,
        texteBrut,
        calcul,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        informations: informations.length > 0 ? informations : undefined
      };

      console.log('✅ Résultat final:', resultat);
      setAnalyseResult(resultat);
      
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setOcrProgress({ status: '', progress: 0 });
    }
  };

  // Utilitaires
  const reinitialiser = () => {
    setFile(null);
    setAnalyseResult(null);
    setError('');
    setOcrProgress({ status: '', progress: 0 });
    setPreviewUrl('');
    setShowFullText(false);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'].includes(ext || '')) 
      return <FileImage className="w-5 h-5 text-blue-600" />;
    if (ext === 'pdf') 
      return <FileText className="w-5 h-5 text-red-600" />;
    if (['txt', 'text'].includes(ext || ''))
      return <FileType className="w-5 h-5 text-gray-600" />;
    if (['doc', 'docx'].includes(ext || ''))
      return <FileText className="w-5 h-5 text-blue-700" />;
    if (['xls', 'xlsx'].includes(ext || ''))
      return <FileText className="w-5 h-5 text-green-700" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const copierTexte = () => {
    if (analyseResult?.texteBrut) {
      navigator.clipboard.writeText(analyseResult.texteBrut);
    }
  };

  const telechargerRapport = () => {
    if (!analyseResult?.calcul) return;

    const doc = new jsPDF();
    const calc = analyseResult.calcul;
    
    let y = 20;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT D\'ANALYSE - NotariaPrime', 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(12);
    doc.text(`Type d'acte: ${calc.typeActe}`, 20, y);
    y += 7;
    doc.text(`Montant: ${calc.montantBase.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`Confiance détection: ${analyseResult.confiance.toFixed(1)}%`, 20, y);
    y += 15;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL FRAIS NOTAIRE: ${calc.totalFraisNotaire.toLocaleString('fr-FR')} €`, 20, y);
    y += 7;
    doc.text(`TOTAL À PAYER: ${calc.totalGeneral.toLocaleString('fr-FR')} €`, 20, y);
    
    doc.save(`notariaprime-scan-${Date.now()}.pdf`);
  };

  const partagerResultat = () => {
    if (!analyseResult?.calcul) return;
    
    const texte = `Analyse NotariaPrime
Type: ${analyseResult.calcul.typeActe}
Montant: ${analyseResult.calcul.montantBase.toLocaleString('fr-FR')} €
Frais notaire: ${analyseResult.calcul.totalFraisNotaire.toLocaleString('fr-FR')} €
Total: ${analyseResult.calcul.totalGeneral.toLocaleString('fr-FR')} €`;
    
    if (navigator.share) {
      navigator.share({ title: 'Résultat NotariaPrime', text: texte });
    } else {
      navigator.clipboard.writeText(texte);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* HEADER */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Scanner Intelligent Multi-Formats
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Analysez automatiquement vos documents notariés. Extraction IA, détection du type d'acte, 
              calcul complet des frais avec barèmes officiels 2025.
            </p>
            
            {/* Stats formats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <FileImage className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">OCR</div>
                <div className="text-sm text-gray-500">JPG, PNG</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <FileText className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">PDF</div>
                <div className="text-sm text-gray-500">Documents</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <FileType className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">Word</div>
                <div className="text-sm text-gray-500">DOCX uniquement</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <FileType className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">Excel</div>
                <div className="text-sm text-gray-500">XLS/XLSX</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <Calculator className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">Texte</div>
                <div className="text-sm text-gray-500">TXT</div>
              </div>
            </div>
          </div>

          {/* ZONE UPLOAD */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
              <input
                type="file"
                onChange={handleFileChange}
                accept="*/*"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <p className="text-3xl font-bold text-gray-900 mb-3">
                  Glissez votre document ici
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  ou cliquez pour parcourir • Tous formats acceptés
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                    📷 Images (JPG, PNG)
                  </span>
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
                    📄 PDF
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                    📝 Word (DOCX)
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                    📊 Excel (XLS/XLSX)
                  </span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium">
                    📃 Texte (TXT)
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Taille max: 10 MB • Format .DOC ancien non supporté (convertissez en .DOCX)
                </p>
              </label>
            </div>

            {/* Fichier sélectionné */}
            {file && (
              <div className="mt-8">
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-md">
                        {getFileIcon(file.name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024).toFixed(1)} KB • {file.type || 'Type inconnu'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={reinitialiser}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition font-medium disabled:opacity-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={analyserDocument}
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
                            <Search className="w-5 h-5" />
                            Analyser le document
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Barre progression OCR */}
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

                  {/* Preview image */}
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
            )}
          </div>

          {/* ERREUR */}
          {error && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 shadow-lg">
              <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-red-900 text-lg mb-2">Erreur d'analyse</p>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={reinitialiser}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  Réessayer avec un autre fichier
                </button>
              </div>
            </div>
          )}

          {/* RÉSULTATS */}
          {analyseResult && (
            <div className="space-y-6">
              
              {/* Actions rapides */}
              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={copierTexte}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition text-gray-700 hover:text-indigo-600 font-medium"
                >
                  <Copy className="w-4 h-4" />
                  Copier le texte
                </button>
                {analyseResult.calcul && (
                  <>
                    <button
                      onClick={telechargerRapport}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition text-gray-700 hover:text-indigo-600 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger PDF
                    </button>
                    <button
                      onClick={partagerResultat}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition text-gray-700 hover:text-indigo-600 font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </>
                )}
              </div>

              {/* Warnings */}
              {analyseResult.warnings && analyseResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-yellow-900 mb-2">⚠️ Avertissements</p>
                      <ul className="space-y-1">
                        {analyseResult.warnings.map((warning, i) => (
                          <li key={i} className="text-yellow-800">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations */}
              {analyseResult.informations && analyseResult.informations.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-blue-900 mb-2">ℹ️ Informations</p>
                      <ul className="space-y-1">
                        {analyseResult.informations.map((info, i) => (
                          <li key={i} className="text-blue-800">• {info}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎯 VÉRIFICATION DES CALCULS */}
              {analyseResult.calcul?.verification && (
                <VerificationCalculs verification={analyseResult.calcul.verification} />
              )}

              {/* Type d'acte détecté */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">Type d'acte détecté</p>
                      <h2 className="text-4xl font-bold capitalize">{analyseResult.typeActe}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm mb-1">Niveau de confiance</p>
                    <p className="text-4xl font-bold">{analyseResult.confiance.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${analyseResult.confiance}%` }}
                  />
                </div>
              </div>

              {/* Message si pas de calcul */}
              {!analyseResult.calcul && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-yellow-900 mb-2">⚠️ Montant non détecté</p>
                      <p className="text-yellow-800 mb-3">
                        L'analyse du document a réussi mais aucun montant n'a été trouvé. 
                        Le calcul des frais n'a pas pu être effectué.
                      </p>
                      <p className="text-sm text-yellow-700">
                        💡 Le document a été analysé et les données extraites sont affichées ci-dessous. 
                        Vous pouvez voir le texte complet extrait en bas de page.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Données extraites + Calculs */}
              {analyseResult.calcul && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Résultats de l'analyse</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Calculator className="w-6 h-6 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Montant de base</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {analyseResult.calcul.montantBase.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                      <div className="flex items-center gap-3 mb-2">
                        <PieChart className="w-6 h-6 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Total frais notaire</span>
                      </div>
                      <p className="text-3xl font-bold text-indigo-600">
                        {analyseResult.calcul.totalFraisNotaire.toLocaleString('fr-FR')} €
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {analyseResult.calcul.pourcentageTotal.toFixed(2)}% du montant
                      </p>
                    </div>
                  </div>

                  <div className="p-8 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl text-white shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/90 text-sm font-medium mb-1">TOTAL À PAYER</p>
                        <p className="text-xs text-white/70">Montant + Frais</p>
                      </div>
                      <p className="text-5xl font-bold">
                        {analyseResult.calcul.totalGeneral.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Texte intégral */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Texte intégral extrait</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {analyseResult.texteBrut.length} caractères
                    </span>
                    {showFullText ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>
                
                {showFullText && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                      {analyseResult.texteBrut}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-2">ℹ️ Informations importantes</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Ces calculs sont donnés à titre indicatif et basés sur les barèmes officiels 2025</li>
                      <li>• Les montants peuvent varier selon les départements et situations spécifiques</li>
                      <li>• Pour une estimation définitive, consultez votre notaire</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}