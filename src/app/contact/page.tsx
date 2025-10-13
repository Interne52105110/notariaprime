"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Mail, MapPin, Send, Github, MessageSquare,
  Clock, CheckCircle, AlertCircle, Loader2, ExternalLink
} from 'lucide-react';

function ContactContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Construction de l'email
      const subjectLabels: Record<string, string> = {
        'general': 'Question générale',
        'bug': 'Signalement de bug',
        'feature': 'Suggestion de fonctionnalité',
        'partnership': 'Partenariat',
        'other': 'Autre'
      };

      const emailSubject = encodeURIComponent(
        `[NotariaPrime] ${subjectLabels[formData.subject]} - ${formData.name}`
      );
      
      const emailBody = encodeURIComponent(
        `Nom: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Sujet: ${subjectLabels[formData.subject]}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `---\n` +
        `Envoyé depuis le formulaire de contact NotariaPrime\n` +
        `Date: ${new Date().toLocaleString('fr-FR')}`
      );

      // Ouvrir le client email
      window.location.href = `mailto:contact@notariaprime.fr?subject=${emailSubject}&body=${emailBody}`;

      // Simuler un délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitStatus('success');
      
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: 'general', message: '' });
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@notariaprime.fr',
      link: 'mailto:contact@notariaprime.fr',
      description: 'Réponse sous 48h ouvrées'
    },
    {
      icon: Github,
      title: 'GitHub',
      value: 'Interne52105110/notariaprime',
      link: 'https://github.com/Interne52105110/notariaprime',
      description: 'Issues, bugs et contributions'
    },
    {
      icon: MapPin,
      title: 'Siège social',
      value: '1 Impasse de Menez Bijigou, 29120 Pont-l\'Abbé',
      link: null,
      description: 'Bretagne, France'
    }
  ];

  const faqs = [
    {
      question: 'NotariaPrime est-il vraiment gratuit ?',
      answer: 'Oui, 100% gratuit et sans publicité. Nous sommes un projet open source financé par la communauté.'
    },
    {
      question: 'Puis-je utiliser NotariaPrime pour mon étude ?',
      answer: 'Absolument ! NotariaPrime est conçu pour les professionnels et peut être utilisé sans restriction.'
    },
    {
      question: 'Les calculs sont-ils conformes ?',
      answer: 'Oui, nos calculateurs sont conformes aux tarifs réglementés 2025 et mis à jour régulièrement.'
    },
    {
      question: 'Comment puis-je contribuer au projet ?',
      answer: 'Visitez notre GitHub pour proposer des fonctionnalités, signaler des bugs ou contribuer au code.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-full mb-8">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Nous sommes à votre écoute</span>
            </div>

            <h1 className="text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Contactez</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                l'équipe NotariaPrime
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Une question, une suggestion, un problème ? Nous sommes là pour vous aider.
            </p>
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-16 border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <method.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{method.title}</h3>
                    {method.link ? (
                      <a 
                        href={method.link}
                        target={method.link.startsWith('http') ? '_blank' : undefined}
                        rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 mb-1 group"
                      >
                        {method.value}
                        {method.link.startsWith('http') && (
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        )}
                      </a>
                    ) : (
                      <p className="text-gray-700 text-sm mb-1">{method.value}</p>
                    )}
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-16 items-start ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Formulaire */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              
              {submitStatus === 'success' ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Message envoyé !</h3>
                  <p className="text-green-700">
                    Votre client email va s'ouvrir pour finaliser l'envoi.
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-900 mb-2">Erreur d'envoi</h3>
                  <p className="text-red-700 mb-4">
                    Une erreur est survenue. Vous pouvez nous contacter directement à{' '}
                    <a href="mailto:contact@notariaprime.fr" className="underline font-semibold">
                      contact@notariaprime.fr
                    </a>
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre nom *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Jean Dupont"
                      required
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="jean.dupont@exemple.fr"
                      required
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    >
                      <option value="general">Question générale</option>
                      <option value="bug">Signaler un bug</option>
                      <option value="feature">Suggestion de fonctionnalité</option>
                      <option value="partnership">Proposition de partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Décrivez votre demande..."
                      required
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer le message
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    En soumettant ce formulaire, vous acceptez que vos données soient traitées 
                    conformément à notre{' '}
                    <a href="/confidentialite" className="text-indigo-600 hover:underline">
                      politique de confidentialité
                    </a>.
                  </p>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
              
              <div className="space-y-4 mb-8">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                      <span className="text-indigo-600 flex-shrink-0">Q.</span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed pl-6">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Clock className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Délai de réponse</h3>
                    <p className="text-gray-700 text-sm">
                      Nous nous efforçons de répondre à tous les messages sous <strong>48 heures ouvrées</strong>.
                      Pour les questions urgentes, n'hésitez pas à préciser "URGENT" dans l'objet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Github className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Pour les bugs</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Si vous avez découvert un bug, vous pouvez également créer une issue sur GitHub 
                      pour un suivi plus rapide.
                    </p>
                    <a 
                      href="https://github.com/Interne52105110/notariaprime/issues/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                    >
                      Créer une issue
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl overflow-hidden border-2 border-gray-300 shadow-xl">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-4.2259%2C47.8605%2C-4.2059%2C47.8705&layer=mapnik&marker=47.8655%2C-4.2159"
              width="100%"
              height="400"
              style={{ border: 0 }}
              loading="lazy"
              title="Carte de Pont-l'Abbé"
            />
            <div className="bg-white p-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">NOTARIA PRIME</p>
                  <p className="text-sm text-gray-600">1 Impasse de Menez Bijigou</p>
                  <p className="text-sm text-gray-600">29120 Pont-l'Abbé, France</p>
                </div>
                <a
                  href="https://www.openstreetmap.org/?mlat=47.8655&mlon=-4.2159#map=15/47.8655/-4.2159"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ouvrir dans Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <MainLayout>
      <ContactContent />
    </MainLayout>
  );
}