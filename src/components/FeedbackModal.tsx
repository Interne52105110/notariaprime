"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    type: 'suggestion',
    message: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback envoyé:', formData);
    alert('Merci pour votre feedback !');
    onClose();
    setFormData({ type: 'suggestion', message: '', email: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Votre retour est précieux
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Aidez-nous à améliorer NotariaPrime. Chaque suggestion compte !
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de retour
            </label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="suggestion">💡 Suggestion de fonctionnalité</option>
              <option value="bug">🐛 Signaler un bug</option>
              <option value="improvement">📝 Amélioration</option>
              <option value="question">❓ Question</option>
              <option value="positive">👍 Retour positif</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre message
            </label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Décrivez votre retour..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optionnel)
            </label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="vous@exemple.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pour vous tenir informé de la suite donnée à votre retour
            </p>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
            >
              Envoyer le feedback
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Vous pouvez aussi contribuer directement sur{' '}
          <a 
            href="https://github.com" 
            className="text-indigo-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}