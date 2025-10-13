"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Code, Zap, Lock, Globe, CheckCircle, 
  Copy, ExternalLink, AlertCircle, Info,
  Terminal, Book, Shield, Clock
} from 'lucide-react';

function ApiContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    pretaxe: `// Exemple d'utilisation - Prétaxe Notariale
fetch('https://api.notariaprime.fr/v1/pretaxe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prixVente: 250000,
    typeActe: 'vente',
    departement: '29'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Réponse
{
  "success": true,
  "data": {
    "emolumentsHT": 2394.75,
    "emolumentsTTC": 2873.70,
    "droitsMutation": 14500.00,
    "totalFraisNotaire": 18073.70,
    "pourcentage": 7.23,
    "details": {
      "tranches": [...]
    }
  }
}`,

    plusvalue: `// Exemple d'utilisation - Plus-Value
fetch('https://api.notariaprime.fr/v1/plusvalue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prixAcquisition: 180000,
    dateAcquisition: "2010-03-15",
    prixVente: 320000,
    dateVente: "2025-10-13",
    travaux: 35000,
    typeLogement: "secondaire"
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Réponse
{
  "success": true,
  "data": {
    "plusValueBrute": 105000,
    "dureeDetention": 15.58,
    "abattementIR": 90,
    "abattementPS": 24.75,
    "impotRevenu": 1995,
    "prelevementsSociaux": 13566,
    "totalFiscalite": 15561
  }
}`,

    curl: `# Avec curl
curl -X POST https://api.notariaprime.fr/v1/pretaxe \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "prixVente": 250000,
    "typeActe": "vente"
  }'`,

    python: `# Avec Python
import requests

url = "https://api.notariaprime.fr/v1/pretaxe"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
data = {
    "prixVente": 250000,
    "typeActe": "vente"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`
  };

  const features = [
    {
      icon: Zap,
      title: 'Ultra rapide',
      description: 'Temps de réponse < 100ms',
      color: 'from-yellow-50 to-amber-50'
    },
    {
      icon: Lock,
      title: 'Sécurisé',
      description: 'HTTPS + authentification par clé',
      color: 'from-green-50 to-emerald-50'
    },
    {
      icon: Globe,
      title: 'RESTful',
      description: 'Architecture REST standard',
      color: 'from-blue-50 to-indigo-50'
    },
    {
      icon: Book,
      title: 'Documentation',
      description: 'OpenAPI 3.0 complète',
      color: 'from-purple-50 to-pink-50'
    }
  ];

  const endpoints = [
    {
      method: 'POST',
      path: '/v1/pretaxe',
      description: 'Calcul de prétaxe notariale',
      status: 'coming'
    },
    {
      method: 'POST',
      path: '/v1/plusvalue',
      description: 'Calcul de plus-value immobilière',
      status: 'coming'
    },
    {
      method: 'GET',
      path: '/v1/bareme',
      description: 'Récupération du barème en vigueur',
      status: 'coming'
    },
    {
      method: 'GET',
      path: '/v1/status',
      description: 'Statut de l\'API',
      status: 'coming'
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
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-full mb-8">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">Bientôt disponible - T1 2026</span>
            </div>

            <h1 className="text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">API</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NotariaPrime
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Intégrez nos calculateurs notariaux directement dans vos applications.
              API REST rapide, sécurisée et simple d'utilisation.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <a 
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Être notifié du lancement
              </a>
              <a 
                href="/roadmap"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl font-semibold transition-all"
              >
                Voir la roadmap
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-4' : 'grid-cols-1'}`}>
            {features.map((feature, index) => (
              <div key={index} className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 border-2 border-gray-200`}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Endpoints disponibles</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl">
            L'API NotariaPrime exposera tous nos calculateurs via des endpoints REST simples et cohérents.
          </p>

          <div className="space-y-4 mb-16">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg font-mono text-sm font-bold ${
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-gray-900 font-mono">{endpoint.path}</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{endpoint.description}</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                      Bientôt
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Base URL */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-16">
            <h3 className="text-white font-bold text-xl mb-4">Base URL</h3>
            <div className="bg-black/30 rounded-xl p-4 font-mono text-sm">
              <code className="text-green-400">https://api.notariaprime.fr/v1</code>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Exemples de code</h2>
          <p className="text-lg text-gray-600 mb-12">
            Voici comment vous pourrez utiliser l'API NotariaPrime dans vos applications
          </p>

          <div className="space-y-8">
            {/* JavaScript Example */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">JavaScript / TypeScript</span>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.pretaxe, 'pretaxe')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all"
                >
                  {copiedCode === 'pretaxe' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 bg-gray-900 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">
                  <code>{codeExamples.pretaxe}</code>
                </pre>
              </div>
            </div>

            {/* Plus-Value Example */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Calcul de plus-value</span>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.plusvalue, 'plusvalue')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all"
                >
                  {copiedCode === 'plusvalue' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 bg-gray-900 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">
                  <code>{codeExamples.plusvalue}</code>
                </pre>
              </div>
            </div>

            {/* cURL Example */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">cURL</span>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.curl, 'curl')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all"
                >
                  {copiedCode === 'curl' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 bg-gray-900 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">
                  <code>{codeExamples.curl}</code>
                </pre>
              </div>
            </div>

            {/* Python Example */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Python</span>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.python, 'python')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all"
                >
                  {copiedCode === 'python' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 bg-gray-900 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">
                  <code>{codeExamples.python}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentification</h2>
          <p className="text-lg text-gray-600 mb-8">
            L'API utilisera un système d'authentification par clé API simple et sécurisé.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl">Clé API</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Chaque requête devra inclure votre clé API dans le header Authorization :
              </p>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm">
                <code className="text-gray-300">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl">Rate Limiting</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Limites généreuses pour un usage normal :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>100 requêtes / minute</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>10 000 requêtes / jour</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tarification</h2>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-12">
            <div className="text-6xl font-bold text-green-600 mb-4">100% Gratuit</div>
            <p className="text-xl text-gray-700 mb-6">
              Comme pour la plateforme web, l'API NotariaPrime sera entièrement gratuite.
              Pas de frais cachés, pas d'abonnement.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Open Source & Gratuit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Info className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">L'API arrive bientôt !</h3>
                <p className="text-blue-800 mb-4 leading-relaxed">
                  Nous travaillons actuellement sur l'API NotariaPrime. Le lancement est prévu pour le 
                  <strong> T1 2026</strong>. Vous souhaitez être parmi les premiers utilisateurs ?
                </p>
                <div className="flex gap-4 flex-wrap">
                  <a 
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Me tenir informé
                  </a>
                  <a 
                    href="https://github.com/Interne52105110/notariaprime"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-blue-200 rounded-xl font-semibold transition-all"
                  >
                    Suivre sur GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ApiPage() {
  return (
    <MainLayout>
      <ApiContent />
    </MainLayout>
  );
}