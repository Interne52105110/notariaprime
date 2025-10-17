"use client";

import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Calculator, TrendingDown, Users, Gift, Heart, PieChart,
  AlertCircle, Info, CheckCircle, Download, Save, History,
  Lightbulb, BarChart3, Target, Calendar, Euro, FileText,
  ArrowRight, Plus, Minus, X, Building
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Types
interface Donataire {
  id: number;
  nom: string;
  lien: 'enfant' | 'petit-enfant' | 'arriere-petit-enfant' | 'conjoint' | 'partenaire-pacs' | 'frere-soeur' | 'neveu-niece' | 'autre';
  montant: string;
  handicap: boolean;
}

interface Demembrement {
  actif: boolean;
  typeOperation: 'donation-usufruit' | 'donation-nue' | 'viager';
  ageDonateur: string;
  reserveUsufruit: boolean;
}

interface PacteDutreil {
  actif: boolean;
  valeurEntreprise: string;
  pourcentageTransmis: string;
  engagementCollectif: boolean;
  engagementIndividuel: boolean;
}

interface Results {
  montantDonation: number;
  valeurTaxable: number;
  abattement: number;
  baseImposable: number;
  droits: number;
  tauxMoyen: number;
  netApresImpot: number;
  reductionDutreil: number;
  economieAbattement: number;
  suggestions: string[];
  detailTranches: Array<{
    tranche: string;
    montant: number;
    taux: number;
    impot: number;
  }>;
}

// Configuration des barèmes
const BAREME_SUCCESSION = {
  enfant: {
    abattement: 100000,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 12109, taux: 10 },
      { max: 15932, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  'petit-enfant': {
    abattement: 31865,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 12109, taux: 10 },
      { max: 15932, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  'arriere-petit-enfant': {
    abattement: 5310,
    tranches: [
      { max: 8072, taux: 5 },
      { max: 12109, taux: 10 },
      { max: 15932, taux: 15 },
      { max: 552324, taux: 20 },
      { max: 902838, taux: 30 },
      { max: 1805677, taux: 40 },
      { max: Infinity, taux: 45 }
    ]
  },
  conjoint: {
    abattement: 80724,
    tranches: [
      { max: Infinity, taux: 0 }
    ]
  },
  'partenaire-pacs': {
    abattement: 80724,
    tranches: [
      { max: Infinity, taux: 0 }
    ]
  },
  'frere-soeur': {
    abattement: 15932,
    tranches: [
      { max: 24430, taux: 35 },
      { max: Infinity, taux: 45 }
    ]
  },
  'neveu-niece': {
    abattement: 7967,
    tranches: [
      { max: Infinity, taux: 55 }
    ]
  },
  autre: {
    abattement: 1594,
    tranches: [
      { max: Infinity, taux: 60 }
    ]
  }
};

const BAREME_USUFRUIT = {
  '<21': 90,
  '21-30': 80,
  '31-40': 70,
  '41-50': 60,
  '51-60': 50,
  '61-70': 40,
  '71-80': 30,
  '81-90': 20,
  '>90': 10
};

function calculerValeurUsufruit(age: number): number {
  if (age < 21) return 90;
  if (age <= 30) return 80;
  if (age <= 40) return 70;
  if (age <= 50) return 60;
  if (age <= 60) return 50;
  if (age <= 70) return 40;
  if (age <= 80) return 30;
  if (age <= 90) return 20;
  return 10;
}

function DonationCalculatorContent() {
  const [donataires, setDonataires] = useState<Donataire[]>([
    { id: 1, nom: 'Bénéficiaire 1', lien: 'enfant', montant: '', handicap: false }
  ]);

  const [demembrement, setDemembrement] = useState<Demembrement>({
    actif: false,
    typeOperation: 'donation-nue',
    ageDonateur: '',
    reserveUsufruit: false
  });

  const [pacteDutreil, setPacteDutreil] = useState<PacteDutreil>({
    actif: false,
    valeurEntreprise: '',
    pourcentageTransmis: '',
    engagementCollectif: false,
    engagementIndividuel: false
  });

  const [donationAnterieure, setDonationAnterieure] = useState('');
  const [dateDerniereDonation, setDateDerniereDonation] = useState('');
  const [results, setResults] = useState<Results | null>(null);
  const [showOptimisation, setShowOptimisation] = useState(false);
  const [activeTab, setActiveTab] = useState('donation');

  const ajouterDonataire = () => {
    const newId = Math.max(...donataires.map(d => d.id), 0) + 1;
    setDonataires([...donataires, { 
      id: newId, 
      nom: `Bénéficiaire ${newId}`, 
      lien: 'enfant', 
      montant: '', 
      handicap: false 
    }]);
  };

  const supprimerDonataire = (id: number) => {
    if (donataires.length > 1) {
      setDonataires(donataires.filter(d => d.id !== id));
    }
  };

  const calculerDroits = (): Results | null => {
    const donataire = donataires[0];
    if (!donataire.montant) return null;

    let montantBase = parseFloat(donataire.montant.replace(/\s/g, ''));
    if (isNaN(montantBase)) return null;

    let valeurTaxable = montantBase;
    let reductionDutreil = 0;

    // Pacte Dutreil
    if (pacteDutreil.actif && pacteDutreil.valeurEntreprise && pacteDutreil.pourcentageTransmis) {
      const valeurEntreprise = parseFloat(pacteDutreil.valeurEntreprise.replace(/\s/g, ''));
      const pourcentage = parseFloat(pacteDutreil.pourcentageTransmis) / 100;
      const valeurTransmise = valeurEntreprise * pourcentage;
      
      if (pacteDutreil.engagementCollectif && pacteDutreil.engagementIndividuel) {
        reductionDutreil = valeurTransmise * 0.75;
        valeurTaxable = montantBase - reductionDutreil;
      }
    }

    // Démembrement
    if (demembrement.actif && demembrement.ageDonateur) {
      const age = parseInt(demembrement.ageDonateur);
      const valeurUsufruitPct = calculerValeurUsufruit(age);
      
      if (demembrement.typeOperation === 'donation-nue') {
        valeurTaxable = montantBase * (100 - valeurUsufruitPct) / 100;
      } else if (demembrement.typeOperation === 'donation-usufruit') {
        valeurTaxable = montantBase * valeurUsufruitPct / 100;
      }
    }

    // Donation antérieure dans les 15 ans
    let abattementDisponible = BAREME_SUCCESSION[donataire.lien].abattement;
    if (donationAnterieure && dateDerniereDonation) {
      const dateAnt = new Date(dateDerniereDonation);
      const maintenant = new Date();
      const diffAnnees = (maintenant.getTime() - dateAnt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      
      if (diffAnnees < 15) {
        const montantAnt = parseFloat(donationAnterieure.replace(/\s/g, ''));
        abattementDisponible = Math.max(0, abattementDisponible - montantAnt);
      }
    }

    // Abattement handicap
    if (donataire.handicap) {
      abattementDisponible += 159325;
    }

    const baseImposable = Math.max(0, valeurTaxable - abattementDisponible);
    
    // Calcul des droits par tranches
    const tranches = BAREME_SUCCESSION[donataire.lien].tranches;
    let droits = 0;
    let reste = baseImposable;
    let trancheInf = 0;
    const detailTranches: Array<{tranche: string; montant: number; taux: number; impot: number}> = [];

    for (const tranche of tranches) {
      if (reste <= 0) break;
      
      const montantTranche = Math.min(reste, tranche.max - trancheInf);
      const impotTranche = montantTranche * (tranche.taux / 100);
      droits += impotTranche;
      
      if (montantTranche > 0) {
        detailTranches.push({
          tranche: tranche.max === Infinity 
            ? `Au-delà de ${trancheInf.toLocaleString('fr-FR')} €`
            : `${trancheInf.toLocaleString('fr-FR')} € - ${tranche.max.toLocaleString('fr-FR')} €`,
          montant: montantTranche,
          taux: tranche.taux,
          impot: impotTranche
        });
      }
      
      reste -= montantTranche;
      trancheInf = tranche.max;
    }

    const tauxMoyen = baseImposable > 0 ? (droits / baseImposable) * 100 : 0;
    const netApresImpot = montantBase - droits;
    const droitsSansAbattement = baseImposable + abattementDisponible;
    let economieAbattement = 0;
    
    if (droitsSansAbattement > 0) {
      let droitsSansAb = 0;
      let resteSansAb = droitsSansAbattement;
      let trancheInfSansAb = 0;
      
      for (const tranche of tranches) {
        if (resteSansAb <= 0) break;
        const montantTrancheSansAb = Math.min(resteSansAb, tranche.max - trancheInfSansAb);
        droitsSansAb += montantTrancheSansAb * (tranche.taux / 100);
        resteSansAb -= montantTrancheSansAb;
        trancheInfSansAb = tranche.max;
      }
      
      economieAbattement = droitsSansAb - droits;
    }

    return {
      montantDonation: montantBase,
      valeurTaxable,
      abattement: abattementDisponible,
      baseImposable,
      droits,
      tauxMoyen,
      netApresImpot,
      reductionDutreil,
      economieAbattement,
      suggestions: genererSuggestions(donataire, montantBase, abattementDisponible, demembrement, pacteDutreil),
      detailTranches
    };
  };

  const genererSuggestions = (
    donataire: Donataire,
    montant: number,
    abattementDispo: number,
    demembr: Demembrement,
    dutreil: PacteDutreil
  ): string[] => {
    const suggestions: string[] = [];

    if (montant > abattementDispo && !demembr.actif) {
      suggestions.push("💡 Le démembrement de propriété permettrait de réduire la valeur taxable significativement");
    }

    if (donataire.lien === 'enfant' && montant > 100000 && !demembr.actif) {
      suggestions.push("🏠 Donation en nue-propriété avec réserve d'usufruit : optimisation fiscale majeure");
    }

    if (!donataire.handicap && donataire.lien === 'enfant') {
      suggestions.push("♿ Abattement handicap : +159 325 € si le bénéficiaire est en situation de handicap");
    }

    if (montant > 200000 && donataires.length === 1) {
      suggestions.push("👨‍👩‍👧‍👦 Donation-partage entre plusieurs enfants : optimise les abattements");
    }

    if (!donationAnterieure) {
      suggestions.push("📅 Vous pouvez renouveler l'abattement tous les 15 ans");
    }

    if (donataire.lien === 'enfant' && !dutreil.actif) {
      suggestions.push("🏢 Pacte Dutreil pour transmission d'entreprise : réduction de 75% de la valeur");
    }

    if (demembr.actif && demembr.ageDonateur) {
      const age = parseInt(demembr.ageDonateur);
      if (age < 60) {
        suggestions.push("⏰ Plus vous êtes jeune, plus l'usufruit a de valeur : attendez peut augmenter les économies");
      }
    }

    return suggestions;
  };

  const handleCalculer = () => {
    const res = calculerDroits();
    if (res) {
      setResults(res);
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  };

  const exporterPDF = () => {
    if (!results) {
      alert('Veuillez d\'abord calculer les droits');
      return;
    }

    const donataire = donataires[0];
    const dateExport = new Date().toLocaleDateString('fr-FR');
    
    // Créer le contenu HTML pour le PDF
    const contenuHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Simulation Donation - ${donataire.nom}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 5px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .section {
      background: #f9fafb;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 10px;
      border-left: 4px solid #ec4899;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #ec4899;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #fce7f3;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-label {
      font-weight: 600;
      color: #4b5563;
    }
    .info-value {
      color: #1f2937;
      font-weight: 500;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      border: 2px solid #ec4899;
    }
    .result-box {
      text-align: center;
      padding: 25px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    .result-label {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .result-value {
      font-size: 36px;
      font-weight: bold;
      color: #ec4899;
      margin: 10px 0;
    }
    .tranche-item {
      background: white;
      padding: 12px;
      margin: 8px 0;
      border-radius: 8px;
      border-left: 3px solid #a855f7;
    }
    .suggestion-item {
      background: #fef3c7;
      padding: 12px;
      margin: 8px 0;
      border-radius: 8px;
      border-left: 3px solid #f59e0b;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .demembrement-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 15px 0;
    }
    .demembrement-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #e5e7eb;
    }
    .demembrement-value {
      font-size: 32px;
      font-weight: bold;
      color: #7c3aed;
    }
    .badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
    .warning-box {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎁 SIMULATION DONATION / SUCCESSION</h1>
    <p>Date de la simulation : ${dateExport}</p>
    <p>NotariaPrime.fr - Calculs notariés simplifiés</p>
  </div>

  <div class="section">
    <div class="section-title">📋 Informations Générales</div>
    <div class="info-row">
      <span class="info-label">Type d'opération</span>
      <span class="info-value">${activeTab === 'donation' ? 'DONATION' : 'SUCCESSION'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Bénéficiaire</span>
      <span class="info-value">${donataire.nom}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Lien de parenté</span>
      <span class="info-value">${donataire.lien.replace('-', ' ').toUpperCase()}${donataire.handicap ? '<span class="badge">HANDICAP</span>' : ''}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Montant de la donation</span>
      <span class="info-value"><strong>${results.montantDonation.toLocaleString('fr-FR')} €</strong></span>
    </div>
    ${donationAnterieure ? `
    <div class="info-row">
      <span class="info-label">Donation antérieure</span>
      <span class="info-value">${parseFloat(donationAnterieure.replace(/\s/g, '')).toLocaleString('fr-FR')} € (${new Date(dateDerniereDonation).toLocaleDateString('fr-FR')})</span>
    </div>
    ` : ''}
  </div>

  ${demembrement.actif ? `
  <div class="section">
    <div class="section-title">🥧 Démembrement de Propriété</div>
    <div class="info-row">
      <span class="info-label">Type d'opération</span>
      <span class="info-value">${demembrement.typeOperation === 'donation-nue' ? 'Donation en nue-propriété' : 'Donation d\'usufruit'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Âge du donateur</span>
      <span class="info-value">${demembrement.ageDonateur} ans</span>
    </div>
    <div class="demembrement-grid">
      <div class="demembrement-card">
        <div class="info-label">Usufruit</div>
        <div class="demembrement-value">${calculerValeurUsufruit(parseInt(demembrement.ageDonateur))}%</div>
      </div>
      <div class="demembrement-card">
        <div class="info-label">Nue-propriété</div>
        <div class="demembrement-value">${100 - calculerValeurUsufruit(parseInt(demembrement.ageDonateur))}%</div>
      </div>
    </div>
    <div class="highlight-box">
      <div class="info-row">
        <span class="info-label">Valeur taxable après démembrement</span>
        <span class="info-value"><strong>${results.valeurTaxable.toLocaleString('fr-FR')} €</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">Économie immédiate</span>
        <span class="info-value" style="color: #10b981;"><strong>${(results.montantDonation - results.valeurTaxable).toLocaleString('fr-FR')} €</strong></span>
      </div>
    </div>
  </div>
  ` : ''}

  ${pacteDutreil.actif && results.reductionDutreil > 0 ? `
  <div class="section">
    <div class="section-title">🏢 Pacte Dutreil (Transmission d'entreprise)</div>
    <div class="info-row">
      <span class="info-label">Valeur de l'entreprise</span>
      <span class="info-value">${parseFloat(pacteDutreil.valeurEntreprise.replace(/\s/g, '')).toLocaleString('fr-FR')} €</span>
    </div>
    <div class="info-row">
      <span class="info-label">Pourcentage transmis</span>
      <span class="info-value">${pacteDutreil.pourcentageTransmis}%</span>
    </div>
    <div class="info-row">
      <span class="info-label">Engagement collectif</span>
      <span class="info-value">${pacteDutreil.engagementCollectif ? '✅ OUI (2 ans)' : '❌ NON'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Engagement individuel</span>
      <span class="info-value">${pacteDutreil.engagementIndividuel ? '✅ OUI (4 ans)' : '❌ NON'}</span>
    </div>
    <div class="highlight-box">
      <div class="info-row">
        <span class="info-label">Réduction de 75%</span>
        <span class="info-value" style="color: #10b981;"><strong>${results.reductionDutreil.toLocaleString('fr-FR')} €</strong></span>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">🧮 Calcul des Droits</div>
    <table>
      <tr>
        <td>Montant de la donation</td>
        <td style="text-align: right;"><strong>${results.montantDonation.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</strong></td>
      </tr>
      ${results.valeurTaxable !== results.montantDonation ? `
      <tr>
        <td>Valeur taxable (après démembrement)</td>
        <td style="text-align: right;">${results.valeurTaxable.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</td>
      </tr>
      ` : ''}
      <tr>
        <td>Abattement applicable</td>
        <td style="text-align: right;">- ${results.abattement.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</td>
      </tr>
      <tr style="background: #f3f4f6; font-weight: bold;">
        <td>Base imposable</td>
        <td style="text-align: right;">${results.baseImposable.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</td>
      </tr>
    </table>
  </div>

  ${results.detailTranches.length > 0 ? `
  <div class="section">
    <div class="section-title">📊 Détail du Calcul par Tranches</div>
    ${results.detailTranches.map(t => `
      <div class="tranche-item">
        <div style="font-weight: 600; margin-bottom: 5px;">${t.tranche}</div>
        <div style="font-size: 13px; color: #6b7280;">
          ${t.montant.toLocaleString('fr-FR', {minimumFractionDigits: 2})} € × ${t.taux}% = 
          <strong style="color: #1f2937;">${t.impot.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</strong>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="result-box">
    <div class="result-label">Droits de donation à payer</div>
    <div class="result-value">${results.droits.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</div>
    <div style="color: #6b7280; font-size: 14px; margin-top: 10px;">
      Taux moyen d'imposition : <strong>${results.tauxMoyen.toFixed(2)}%</strong>
    </div>
  </div>

  <div class="section">
    <div class="section-title">💰 Synthèse Financière</div>
    <div class="info-row">
      <span class="info-label">Net reçu par le bénéficiaire</span>
      <span class="info-value" style="color: #10b981;"><strong>${results.netApresImpot.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</strong></span>
    </div>
    ${results.economieAbattement > 0 ? `
    <div class="info-row">
      <span class="info-label">Économie grâce à l'abattement</span>
      <span class="info-value" style="color: #10b981;"><strong>${results.economieAbattement.toLocaleString('fr-FR', {minimumFractionDigits: 0})} €</strong></span>
    </div>
    ` : ''}
  </div>

  ${results.suggestions.length > 0 ? `
  <div class="section">
    <div class="section-title">💡 Suggestions d'Optimisation</div>
    ${results.suggestions.map((s, i) => `
      <div class="suggestion-item">
        <strong>${i + 1}.</strong> ${s}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="warning-box">
    <strong>⚠️ Informations Légales</strong><br><br>
    Cette simulation est fournie à titre indicatif et ne constitue pas un conseil juridique ou fiscal personnalisé.
    Les barèmes appliqués sont ceux en vigueur au 1er janvier 2025.<br><br>
    <strong>Références légales :</strong><br>
    • Code Général des Impôts, articles 777 à 779<br>
    • Barème de l'usufruit : Article 669 du CGI<br>
    • Pacte Dutreil : Articles 787 B et 787 C du CGI
  </div>

  <div class="footer">
    <p><strong>NotariaPrime.fr</strong> - Calculs notariés simplifiés</p>
    <p>Pour toute question ou validation de votre projet, consultez un notaire</p>
    <p style="margin-top: 10px; font-size: 11px;">Document généré le ${new Date().toLocaleString('fr-FR')}</p>
  </div>
</body>
</html>
    `;

    // Créer et télécharger le PDF
    const blob = new Blob([contenuHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_donation_${donataire.nom.replace(/\s/g, '_')}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Ouvrir dans un nouvel onglet pour impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(contenuHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const scenariosComparaison = useMemo(() => {
    if (!donataires[0]?.montant) return [];
    
    const montantBase = parseFloat(donataires[0].montant.replace(/\s/g, ''));
    if (isNaN(montantBase)) return [];

    const scenarios = [];

    // Scénario 1: Donation classique
    const res1 = calculerDroits();
    if (res1) {
      scenarios.push({
        nom: 'Donation en pleine propriété',
        droits: res1.droits,
        economie: 0
      });
    }

    // Scénario 2: Avec démembrement à 60 ans
    if (!demembrement.actif) {
      const valeurUsufruitPct = calculerValeurUsufruit(60);
      const valeurNue = montantBase * (100 - valeurUsufruitPct) / 100;
      const abattement = BAREME_SUCCESSION[donataires[0].lien].abattement;
      const baseImposable = Math.max(0, valeurNue - abattement);
      
      let droits = 0;
      let reste = baseImposable;
      let trancheInf = 0;
      
      for (const tranche of BAREME_SUCCESSION[donataires[0].lien].tranches) {
        if (reste <= 0) break;
        const montantTranche = Math.min(reste, tranche.max - trancheInf);
        droits += montantTranche * (tranche.taux / 100);
        reste -= montantTranche;
        trancheInf = tranche.max;
      }
      
      scenarios.push({
        nom: 'Donation nue-propriété (60 ans)',
        droits,
        economie: res1 ? res1.droits - droits : 0
      });
    }

    return scenarios;
  }, [donataires, demembrement]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Calculateur Donation / Succession</h1>
                  <p className="text-rose-600 font-medium">Optimisation fiscale 2025</p>
                </div>
              </div>
            </div>
            {results && (
              <div className="text-right">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                  <p className="text-sm text-rose-600 font-medium mb-1">Droits à payer</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    {results.droits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-rose-600 mt-2">
                    Taux moyen: {results.tauxMoyen.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Type d'opération */}
          <div className="mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('donation')}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  activeTab === 'donation'
                    ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Gift className="w-8 h-8 mx-auto mb-2 text-rose-600" />
                <p className="font-semibold text-gray-900">Donation</p>
                <p className="text-xs text-gray-600 mt-1">De votre vivant</p>
              </button>
              <button
                onClick={() => setActiveTab('succession')}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  activeTab === 'succession'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="font-semibold text-gray-900">Succession</p>
                <p className="text-xs text-gray-600 mt-1">Droits successoraux</p>
              </button>
            </div>
          </div>

          {/* Section Bénéficiaires */}
          <div className="border-2 border-rose-200 rounded-2xl p-6 bg-gradient-to-br from-rose-50 to-pink-50 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Bénéficiaire(s)</h2>
              </div>
              <button
                onClick={ajouterDonataire}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {donataires.map((donataire, index) => (
                <div key={donataire.id} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={donataire.nom}
                      onChange={(e) => {
                        const newDonataires = [...donataires];
                        newDonataires[index].nom = e.target.value;
                        setDonataires(newDonataires);
                      }}
                      className="text-lg font-semibold border-b-2 border-transparent hover:border-gray-300 focus:border-rose-500 focus:outline-none px-2 py-1"
                    />
                    {donataires.length > 1 && (
                      <button
                        onClick={() => supprimerDonataire(donataire.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien de parenté *
                      </label>
                      <select
                        value={donataire.lien}
                        onChange={(e) => {
                          const newDonataires = [...donataires];
                          newDonataires[index].lien = e.target.value as any;
                          setDonataires(newDonataires);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="enfant">Enfant (abattement 100 000 €)</option>
                        <option value="petit-enfant">Petit-enfant (31 865 €)</option>
                        <option value="arriere-petit-enfant">Arrière-petit-enfant (5 310 €)</option>
                        <option value="conjoint">Conjoint (exonéré)</option>
                        <option value="partenaire-pacs">Partenaire PACS (exonéré)</option>
                        <option value="frere-soeur">Frère / Sœur (15 932 €)</option>
                        <option value="neveu-niece">Neveu / Nièce (7 967 €)</option>
                        <option value="autre">Autre (1 594 €)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Montant de la donation *
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={donataire.montant}
                          onChange={(e) => {
                            const newDonataires = [...donataires];
                            newDonataires[index].montant = e.target.value;
                            setDonataires(newDonataires);
                          }}
                          placeholder="200 000"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={donataire.handicap}
                        onChange={(e) => {
                          const newDonataires = [...donataires];
                          newDonataires[index].handicap = e.target.checked;
                          setDonataires(newDonataires);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Bénéficiaire en situation de handicap (+159 325 € d'abattement)
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donations antérieures */}
          <div className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Donations antérieures (15 dernières années)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Montant donation antérieure
                </label>
                <input
                  type="text"
                  value={donationAnterieure}
                  onChange={(e) => setDonationAnterieure(e.target.value)}
                  placeholder="50 000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de la donation
                </label>
                <input
                  type="date"
                  value={dateDerniereDonation}
                  onChange={(e) => setDateDerniereDonation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Les abattements se renouvellent tous les 15 ans. Si vous avez déjà fait une donation 
                  il y a moins de 15 ans, l'abattement sera réduit d'autant.
                </p>
              </div>
            </div>
          </div>

          {/* Démembrement */}
          <div className="border-2 border-purple-200 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Démembrement de propriété</h2>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Activer le démembrement ?</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setDemembrement({...demembrement, actif: true})}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    demembrement.actif
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700'
                  }`}
                >
                  Oui
                </button>
                <button
                  onClick={() => setDemembrement({...demembrement, actif: false})}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    !demembrement.actif
                      ? 'bg-gray-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>

            {demembrement.actif && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Type d'opération</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDemembrement({...demembrement, typeOperation: 'donation-nue'})}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        demembrement.typeOperation === 'donation-nue'
                          ? 'border-purple-500 bg-white shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold mb-1">Donation nue-propriété</p>
                      <p className="text-xs text-gray-600">Vous gardez l'usufruit</p>
                    </button>
                    <button
                      onClick={() => setDemembrement({...demembrement, typeOperation: 'donation-usufruit'})}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        demembrement.typeOperation === 'donation-usufruit'
                          ? 'border-purple-500 bg-white shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold mb-1">Donation usufruit</p>
                      <p className="text-xs text-gray-600">Transmission temporaire</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Âge du donateur *
                  </label>
                  <input
                    type="number"
                    value={demembrement.ageDonateur}
                    onChange={(e) => setDemembrement({...demembrement, ageDonateur: e.target.value})}
                    placeholder="65"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Nécessaire pour calculer la valeur de l'usufruit selon le barème fiscal
                  </p>
                </div>

                {demembrement.ageDonateur && (
                  <div className="bg-white rounded-xl p-6 border border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Répartition de la valeur</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium mb-1">Usufruit</p>
                        <p className="text-3xl font-bold text-purple-900">
                          {calculerValeurUsufruit(parseInt(demembrement.ageDonateur))}%
                        </p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-4">
                        <p className="text-sm text-pink-600 font-medium mb-1">Nue-propriété</p>
                        <p className="text-3xl font-bold text-pink-900">
                          {100 - calculerValeurUsufruit(parseInt(demembrement.ageDonateur))}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pacte Dutreil */}
          <div className="border-2 border-indigo-200 rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-blue-50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pacte Dutreil (Entreprise)</h2>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Transmission d'entreprise ?</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setPacteDutreil({...pacteDutreil, actif: true})}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    pacteDutreil.actif
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700'
                  }`}
                >
                  Oui
                </button>
                <button
                  onClick={() => setPacteDutreil({...pacteDutreil, actif: false})}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    !pacteDutreil.actif
                      ? 'bg-gray-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>

            {pacteDutreil.actif && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 mb-2">Réduction fiscale de 75%</p>
                      <p className="text-sm text-green-800">
                        Le Pacte Dutreil permet une exonération de 75% de la valeur de l'entreprise 
                        transmise, sous conditions d'engagement collectif (2 ans) et individuel (4 ans).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valeur de l'entreprise *
                    </label>
                    <input
                      type="text"
                      value={pacteDutreil.valeurEntreprise}
                      onChange={(e) => setPacteDutreil({...pacteDutreil, valeurEntreprise: e.target.value})}
                      placeholder="500 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      % transmis
                    </label>
                    <input
                      type="text"
                      value={pacteDutreil.pourcentageTransmis}
                      onChange={(e) => setPacteDutreil({...pacteDutreil, pourcentageTransmis: e.target.value})}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pacteDutreil.engagementCollectif}
                      onChange={(e) => setPacteDutreil({...pacteDutreil, engagementCollectif: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Engagement collectif de conservation (2 ans minimum)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pacteDutreil.engagementIndividuel}
                      onChange={(e) => setPacteDutreil({...pacteDutreil, engagementIndividuel: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Engagement individuel de conservation (4 ans minimum)
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <button
              onClick={handleCalculer}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Calculator className="w-5 h-5" />
              Calculer les droits
            </button>
            <button
              onClick={exporterPDF}
              disabled={!results}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Exporter PDF
            </button>
            <button
              onClick={() => setShowOptimisation(!showOptimisation)}
              disabled={!results}
              className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Target className="w-5 h-5" />
              {showOptimisation ? 'Masquer' : 'Optimisation'}
            </button>
          </div>
        </div>

        {/* Résultats */}
        {results && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Résultat du calcul</h2>

              <div className="space-y-6">
                {/* Montants */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-2">Montant donation</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {results.montantDonation.toLocaleString('fr-FR')} €
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <p className="text-sm text-green-600 font-medium mb-2">Abattement applicable</p>
                    <p className="text-3xl font-bold text-green-900">
                      {results.abattement.toLocaleString('fr-FR')} €
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-2">Base imposable</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {results.baseImposable.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>

                {/* Valeur taxable si démembrement */}
                {results.valeurTaxable !== results.montantDonation && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <PieChart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-purple-900 mb-1">Démembrement appliqué</p>
                        <p className="text-sm text-purple-800">
                          Valeur taxable après démembrement : <strong>{results.valeurTaxable.toLocaleString('fr-FR')} €</strong>
                          <br />
                          Économie immédiate : <strong>{(results.montantDonation - results.valeurTaxable).toLocaleString('fr-FR')} €</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pacte Dutreil */}
                {results.reductionDutreil > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Building className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Pacte Dutreil appliqué</p>
                        <p className="text-sm text-green-800">
                          Réduction de 75% : <strong>{results.reductionDutreil.toLocaleString('fr-FR')} €</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Détail des tranches */}
                {results.detailTranches.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Détail du calcul par tranches</h3>
                    <div className="space-y-3">
                      {results.detailTranches.map((tranche, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{tranche.tranche}</p>
                            <p className="text-xs text-gray-500">
                              {tranche.montant.toLocaleString('fr-FR')} € × {tranche.taux}%
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {tranche.impot.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-8 border-2 border-rose-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-rose-600 font-medium mb-2">DROITS DE DONATION À PAYER</p>
                      <p className="text-xs text-gray-600">
                        Taux moyen : {results.tauxMoyen.toFixed(2)}%
                      </p>
                    </div>
                    <p className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                      {results.droits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                </div>

                {/* Net au bénéficiaire */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600 font-medium mb-1">Net reçu par le bénéficiaire</p>
                      <p className="text-xs text-gray-600">
                        Montant - Droits de donation
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      {results.netApresImpot.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                </div>

                {/* Économie abattement */}
                {results.economieAbattement > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 mb-1">Économie grâce à l'abattement</p>
                        <p className="text-sm text-amber-800">
                          Vous économisez <strong>{results.economieAbattement.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €</strong> grâce à l'abattement fiscal
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions d'optimisation */}
            {results.suggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-amber-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Suggestions d'optimisation</h2>
                </div>
                <div className="space-y-3">
                  {results.suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparaison scénarios */}
            {showOptimisation && scenariosComparaison.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Comparaison des scénarios</h2>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenariosComparaison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nom" angle={-15} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => value.toLocaleString('fr-FR', {minimumFractionDigits: 2}) + ' €'}
                    />
                    <Bar dataKey="droits" fill="#ec4899" name="Droits à payer" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {scenariosComparaison.map((scenario, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-xl p-4">
                      <p className="font-semibold text-gray-900 mb-2">{scenario.nom}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Droits :</span>
                        <span className="font-bold text-rose-600">
                          {scenario.droits.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                        </span>
                      </div>
                      {scenario.economie > 0 && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                          <span className="text-sm text-green-600">Économie :</span>
                          <span className="font-bold text-green-600">
                            {scenario.economie.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DonationPage() {
  return (
    <MainLayout showFeedback={false}>
      <DonationCalculatorContent />
    </MainLayout>
  );
}