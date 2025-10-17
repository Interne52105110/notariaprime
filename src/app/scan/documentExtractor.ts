// src/app/scan/documentExtractor.ts

import Tesseract from 'tesseract.js';
import type { ExtractionProgress } from './ScanTypes';

/**
 * EXTRACTION TEXTE UNIVERSELLE
 * Support : DOCX, XLSX, PDF, Images (OCR), TXT
 */

export async function extraireTexte(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  console.log('📄 Fichier:', { nom: fileName, type: fileType, taille: file.size });

  try {
    // ❌ WORD DOC (ancien format) - Bloquer AVANT tout traitement
    if (fileName.endsWith('.doc') || fileType === 'application/msword') {
      throw new Error('Format .DOC (ancien Word) non supporté. 💡 Solutions : 1️⃣ Ouvrez le document dans Word et enregistrez-le au format .DOCX | 2️⃣ Fichier → Exporter → Créer PDF | 3️⃣ Sélectionnez tout le texte (Ctrl+A), copiez (Ctrl+C) et collez dans un fichier .txt | 4️⃣ Faites une capture d\'écran et uploadez l\'image pour OCR');
    }

    // ✅ WORD DOCX (format moderne) - Support via mammoth
    if (fileName.endsWith('.docx') || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      onProgress?.({ status: 'Lecture du fichier Word (.docx)...', progress: 30 });
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        if (!result.value || result.value.trim().length === 0) {
          throw new Error('Le document Word semble vide ou illisible.');
        }
        
        onProgress?.({ status: 'Fichier Word analysé avec succès', progress: 100 });
        return result.value;
      } catch (err) {
        console.error('Erreur mammoth:', err);
        throw new Error('Impossible de lire le fichier .DOCX. Vérifiez que le fichier n\'est pas corrompu.');
      }
    }

    // ✅ EXCEL (XLS/XLSX) - Support via xlsx
    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') ||
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      onProgress?.({ status: 'Lecture du fichier Excel...', progress: 30 });
      try {
        const XLSX = await import('xlsx');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        let texteComplet = '';
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetText = XLSX.utils.sheet_to_txt(sheet, { FS: '\t', RS: '\n' });
          texteComplet += `\n=== ${sheetName} ===\n${sheetText}\n`;
        });
        
        if (!texteComplet || texteComplet.trim().length === 0) {
          throw new Error('Le fichier Excel semble vide.');
        }
        
        onProgress?.({ status: 'Fichier Excel analysé avec succès', progress: 100 });
        return texteComplet;
      } catch (err) {
        console.error('Erreur XLSX:', err);
        throw new Error('Impossible de lire le fichier Excel. Essayez de copier les données dans un fichier .txt');
      }
    }

    // ✅ IMAGES - OCR avec Tesseract
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/i.test(fileName)) {
      onProgress?.({ status: 'Initialisation OCR...', progress: 0 });
      const result = await Tesseract.recognize(file, 'fra+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            onProgress?.({ 
              status: 'Reconnaissance du texte...', 
              progress: Math.round(m.progress * 100) 
            });
          }
        }
      });
      onProgress?.({ status: 'OCR terminé', progress: 100 });
      
      if (!result.data.text || result.data.text.trim().length < 20) {
        throw new Error('Aucun texte détecté dans l\'image. Vérifiez la qualité de l\'image.');
      }
      
      return result.data.text;
    }

    // ✅ PDF - Extraction basique
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      onProgress?.({ status: 'Extraction du PDF...', progress: 50 });
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      let texte = decoder.decode(arrayBuffer);
      texte = texte
        .replace(/[^\x20-\x7E\u00C0-\u017F\u20AC\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (texte.length < 50) {
        throw new Error('PDF vide, crypté ou scanné. Astuce : Faites une capture d\'écran du PDF et uploadez l\'image pour utiliser l\'OCR.');
      }
      onProgress?.({ status: 'PDF extrait', progress: 100 });
      return texte;
    }

    // ✅ TEXTE BRUT
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      onProgress?.({ status: 'Lecture du fichier texte...', progress: 50 });
      const texte = await file.text();
      if (!texte || texte.trim().length === 0) {
        throw new Error('Le fichier texte est vide.');
      }
      onProgress?.({ status: 'Fichier texte lu', progress: 100 });
      return texte;
    }

    // ❌ Format non supporté
    throw new Error(`Format "${fileName.split('.').pop()?.toUpperCase()}" non supporté. ✅ Formats acceptés : DOCX (Word moderne), XLS/XLSX (Excel), JPG/PNG (Images), PDF, TXT. ❌ Format .DOC ancien Word non supporté : convertissez en .DOCX d'abord.`);
  } catch (err) {
    console.error('Erreur extraction:', err);
    throw err;
  }
}