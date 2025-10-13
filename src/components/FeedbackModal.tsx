"use client";

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'suggestion': 'Suggestion de fonctionnalité',
      'bug': 'Bug',
      'improvement': 'Amélioration',
      'question': 'Question',
      'positive': 'Retour positif'
    };
    return labels[type] || type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Envoi du feedback par email via mailto
      const subject = encodeURIComponent(`[NotariaPrime] ${getTypeLabel(formData.type)}`);
      const body = encodeURIComponent(
        `Type: ${getTypeLabel(formData.type)}\n\n` +
        `Message:\n${formData.message}\n\n` +
        (formData.email ? `Email de contact: ${formData.email}\n\n` : '') +
        `---\n` +
        `Envoyé depuis NotariaPrime\n` +
        `Date: ${new Date().toLocaleString('fr-FR')}`
      );

      // Ouvrir le client email par défaut
      window.location.href = `mailto:contact@notariaprime.fr?subject=${subject}&body=${body}`;

      // Simuler un délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitStatus('success');
      
      // Fermer après 2 secondes
      setTimeout(() => {
        onClose();
        setFormData({ type: 'suggestion', message: '', email: '' });
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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
        
        {submitStatus === 'success' ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✓</div>
            <p className="font-semibold text-green-900 mb-1">Merci pour votre feedback !</p>
            <p className="text-sm text-green-700">Votre client email va s'ouvrir pour finaliser l'envoi.</p>
          </div>
        ) : submitStatus === 'error' ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✗</div>
            <p className="font-semibold text-red-900 mb-2">Erreur d'envoi</p>
            <p className="text-sm text-red-700 mb-4">
              Une erreur est survenue. Vous pouvez nous contacter directement à{' '}
              <a href="mailto:contact@notariaprime.fr" className="underline font-medium">
                contact@notariaprime.fr
              </a>
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-medium transition"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de retour
              </label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pour vous tenir informé de la suite donnée à votre retour
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le feedback'
                )}
              </button>
              <button 
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Vous pouvez aussi contribuer directement sur{' '}
          <a 
            href="https://github.com/Interne52105110/notariaprime" 
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