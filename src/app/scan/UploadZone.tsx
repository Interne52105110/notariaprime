// src/app/scan/UploadZone.tsx

import React from 'react';
import { Upload, FileImage, FileText, FileType, File } from 'lucide-react';

interface UploadZoneProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadZone({ file, onFileChange }: UploadZoneProps) {
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

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
        <input
          type="file"
          onChange={onFileChange}
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

      {file && (
        <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-md">
              {getFileIcon(file.name)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">{file.name}</p>
              <p className="text-sm text-gray-600">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Type inconnu'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}