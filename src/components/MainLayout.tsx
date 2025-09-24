"use client";

import Header from './Header';
import Footer from './Footer';
import FeedbackModal from './FeedbackModal';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  showFeedback?: boolean;
}

export default function MainLayout({ children, showFeedback = true }: MainLayoutProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main content avec padding-top pour compenser le header fixe */}
      <main className="pt-20">
        {children}
      </main>
      
      <Footer />
      
      {/* Bouton feedback flottant */}
      {showFeedback && (
        <button 
          onClick={() => setFeedbackOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="hidden sm:inline">Feedback</span>
        </button>
      )}

      {/* Modal de feedback */}
      <FeedbackModal 
        isOpen={feedbackOpen} 
        onClose={() => setFeedbackOpen(false)} 
      />
    </div>
  );
}