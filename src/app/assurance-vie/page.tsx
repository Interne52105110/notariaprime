// ============================================
// FILE: src/app/assurance-vie/page.tsx
// DESCRIPTION: Simulateur fiscal Assurance-Vie complet
// ============================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, TrendingUp, Calculator, PieChart as PieChartIcon,
  AlertCircle, Info, HelpCircle, ChevronDown, ChevronUp, BookOpen,
  Percent, Euro, Users, Calendar, Heart, BarChart3, Target,
  Plus, Trash2, ArrowRight, CheckCircle, Clock, Landmark, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';

import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

type OngletActif = 'rachat' | 'succession' | 'projection' | 'faq';
type AncienneteContrat = 'moins4' | 'entre4et8' | 'plus8';
type SituationFamiliale = 'celibataire' | 'couple';
type LienBeneficiaire = 'conjoint' | 'enfant' | 'frere-soeur' | 'neveu-niece' | 'autre';

interface Beneficiaire {
  id: number;
  nom: string;
  lien: LienBeneficiaire;
  pourcentage: string;
}

interface ResultatRachat {
  montantRachat: number;
  partCapital: number;
  partProduits: number;
  abattement: number;
  baseTaxablePFU: number;
  baseTaxableIR: number;
  impotPFU: number;
  impotIR: number;
  prelevementsSociaux: number;
  netPercuPFU: number;
  netPercuIR: number;
  tauxEffectifPFU: number;
  tauxEffectifIR: number;
  tauxPFUApplique: number;
}

interface ResultatBeneficiaire {
  nom: string;
  lien: LienBeneficiaire;
  capitalRecu: number;
  partAvant70: number;
  partApres70: number;
  abattementArt990I: number;
  abattementArt757B: number;
  baseTaxable990I: number;
  baseTaxable757B: number;
  droits990I: number;
  droits757B: number;
  totalDroits: number;
  netPercu: number;
  exonere: boolean;
}

interface ResultatSuccession {
  beneficiaires: ResultatBeneficiaire[];
  totalDroits: number;
  totalNetPercu: number;
  droitsSuccessionClassique: number;
  economieAV: number;
}

// ============================================
// CONSTANTES FISCALES
// ============================================

const ABATTEMENT_990I = 152500; // par beneficiaire
const ABATTEMENT_757B = 30500;  // global partage
const TAUX_PS = 0.186;          // 18.6% (LFSS 2026 : CSG 10.6% + CRDS 0.5% + PS 4.5% + CFA 3%)

const TRANCHES_990I = [
  { max: 700000, taux: 0.20 },
  { max: Infinity, taux: 0.3125 }
];

const BAREME_SUCCESSION_CLASSIQUE: Record<string, { abattement: number; tranches: { max: number; taux: number }[] }> = {
  enfant: {
    abattement: 100000,
    tranches: [
      { max: 8072, taux: 0.05 },
      { max: 12109, taux: 0.10 },
      { max: 15932, taux: 0.15 },
      { max: 552324, taux: 0.20 },
      { max: 902838, taux: 0.30 },
      { max: 1805677, taux: 0.40 },
      { max: Infinity, taux: 0.45 }
    ]
  },
  'frere-soeur': {
    abattement: 15932,
    tranches: [
      { max: 24430, taux: 0.35 },
      { max: Infinity, taux: 0.45 }
    ]
  },
  'neveu-niece': {
    abattement: 7967,
    tranches: [{ max: Infinity, taux: 0.55 }]
  },
  autre: {
    abattement: 1594,
    tranches: [{ max: Infinity, taux: 0.60 }]
  }
};

const TMI_OPTIONS = [
  { label: '0%', value: 0 },
  { label: '11%', value: 0.11 },
  { label: '30%', value: 0.30 },
  { label: '41%', value: 0.41 },
  { label: '45%', value: 0.45 }
];

const COLORS_CHART = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff'];
const COLORS_BENEF = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

const formatEuro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const formatEuroCents = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPourcent = (v: number) => `${(v * 100).toFixed(2)} %`;

function parseNumber(str: string): number {
  if (!str || str.trim() === '') return 0;
  let cleaned = str.replace(/[\s\u00A0\u202F]/g, '');
  cleaned = cleaned.replace(',', '.');
  cleaned = cleaned.replace(/[^\d.-]/g, '');
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

function formatMontant(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerRachat(
  anciennete: AncienneteContrat,
  primesVersees: number,
  valeurContrat: number,
  partPrimesAvant2017: number,
  montantRachat: number,
  situation: SituationFamiliale,
  tmi: number,
  encoursTotalAV: number
): ResultatRachat | null {
  if (valeurContrat <= 0 || primesVersees <= 0 || montantRachat <= 0) return null;

  const totalProduits = Math.max(0, valeurContrat - primesVersees);
  const ratioProduits = totalProduits / valeurContrat;

  const produitsImposables = montantRachat * ratioProduits;
  const partCapital = montantRachat - produitsImposables;

  // Abattement si > 8 ans
  let abattement = 0;
  if (anciennete === 'plus8') {
    abattement = situation === 'couple' ? 9200 : 4600;
  }

  const produitsApresAbattement = Math.max(0, produitsImposables - abattement);

  // Determination du taux PFU selon anciennete et date des primes
  const partAvant2017 = partPrimesAvant2017 / 100;
  const partApres2017 = 1 - partAvant2017;

  let tauxPFUMoyen: number;

  if (anciennete === 'plus8') {
    // Primes avant 27/09/2017 : 7.5%
    const tauxAvant = 0.075;
    // Primes apres 27/09/2017 : 7.5% si encours < 150k, sinon 12.8%
    const tauxApres = encoursTotalAV <= 150000 ? 0.075 : 0.128;
    tauxPFUMoyen = partAvant2017 * tauxAvant + partApres2017 * tauxApres;
  } else if (anciennete === 'entre4et8') {
    const tauxAvant = 0.15;
    const tauxApres = 0.128;
    tauxPFUMoyen = partAvant2017 * tauxAvant + partApres2017 * tauxApres;
  } else {
    // < 4 ans
    const tauxAvant = 0.35;
    const tauxApres = 0.128;
    tauxPFUMoyen = partAvant2017 * tauxAvant + partApres2017 * tauxApres;
  }

  const impotPFU = produitsApresAbattement * tauxPFUMoyen;
  const impotIR = produitsApresAbattement * tmi;
  const prelevementsSociaux = produitsImposables * TAUX_PS;

  const netPercuPFU = montantRachat - impotPFU - prelevementsSociaux;
  const netPercuIR = montantRachat - impotIR - prelevementsSociaux;

  const chargesFiscalesPFU = impotPFU + prelevementsSociaux;
  const chargesFiscalesIR = impotIR + prelevementsSociaux;

  const tauxEffectifPFU = montantRachat > 0 ? chargesFiscalesPFU / montantRachat : 0;
  const tauxEffectifIR = montantRachat > 0 ? chargesFiscalesIR / montantRachat : 0;

  return {
    montantRachat,
    partCapital,
    partProduits: produitsImposables,
    abattement,
    baseTaxablePFU: produitsApresAbattement,
    baseTaxableIR: produitsApresAbattement,
    impotPFU,
    impotIR,
    prelevementsSociaux,
    netPercuPFU,
    netPercuIR,
    tauxEffectifPFU,
    tauxEffectifIR,
    tauxPFUApplique: tauxPFUMoyen
  };
}

function calculerDroits990I(baseTaxable: number): number {
  let droits = 0;
  let reste = baseTaxable;
  let trancheInf = 0;

  for (const tranche of TRANCHES_990I) {
    if (reste <= 0) break;
    const montantTranche = Math.min(reste, tranche.max - trancheInf);
    droits += montantTranche * tranche.taux;
    reste -= montantTranche;
    trancheInf = tranche.max;
  }

  return droits;
}

function calculerDroitsSuccessionClassique(baseTaxable: number, lien: LienBeneficiaire): number {
  const bareme = BAREME_SUCCESSION_CLASSIQUE[lien] || BAREME_SUCCESSION_CLASSIQUE['autre'];
  let droits = 0;
  let reste = Math.max(0, baseTaxable - bareme.abattement);
  let trancheInf = 0;

  for (const tranche of bareme.tranches) {
    if (reste <= 0) break;
    const montantTranche = Math.min(reste, tranche.max - trancheInf);
    droits += montantTranche * tranche.taux;
    reste -= montantTranche;
    trancheInf = tranche.max;
  }

  return droits;
}

function calculerSuccession(
  valeurContrat: number,
  beneficiaires: Beneficiaire[],
  partAvant70: number,
  gainsApres70: number
): ResultatSuccession | null {
  if (valeurContrat <= 0 || beneficiaires.length === 0) return null;

  const montantAvant70 = valeurContrat * (partAvant70 / 100);
  const montantApres70Brut = valeurContrat * ((100 - partAvant70) / 100);
  // Seules les primes (hors gains) sont taxees pour art. 757 B
  const primesApres70 = Math.max(0, montantApres70Brut - gainsApres70);

  const totalPourcentage = beneficiaires.reduce((sum, b) => sum + parseNumber(b.pourcentage), 0);
  if (totalPourcentage <= 0) return null;

  const abattement757BParBenef = ABATTEMENT_757B / beneficiaires.filter(b => b.lien !== 'conjoint').length || ABATTEMENT_757B;

  const resultsBeneficiaires: ResultatBeneficiaire[] = beneficiaires.map(b => {
    const pct = parseNumber(b.pourcentage) / 100;
    const capitalRecu = valeurContrat * pct;
    const partAvant70Benef = montantAvant70 * pct;
    const partApres70Benef = montantApres70Brut * pct;
    const primesApres70Benef = primesApres70 * pct;

    // Conjoint/PACS toujours exonere
    if (b.lien === 'conjoint') {
      return {
        nom: b.nom,
        lien: b.lien,
        capitalRecu,
        partAvant70: partAvant70Benef,
        partApres70: partApres70Benef,
        abattementArt990I: partAvant70Benef,
        abattementArt757B: primesApres70Benef,
        baseTaxable990I: 0,
        baseTaxable757B: 0,
        droits990I: 0,
        droits757B: 0,
        totalDroits: 0,
        netPercu: capitalRecu,
        exonere: true
      };
    }

    // Art. 990 I (avant 70 ans)
    const abattement990I = Math.min(partAvant70Benef, ABATTEMENT_990I);
    const baseTaxable990I = Math.max(0, partAvant70Benef - abattement990I);
    const droits990I = calculerDroits990I(baseTaxable990I);

    // Art. 757 B (apres 70 ans) - abattement global partage
    const nbBenefNonConjoint = beneficiaires.filter(bb => bb.lien !== 'conjoint').length;
    const abattement757B = Math.min(primesApres70Benef, ABATTEMENT_757B / nbBenefNonConjoint);
    const baseTaxable757B = Math.max(0, primesApres70Benef - abattement757B);

    // Pour art. 757 B, on applique le bareme classique selon le lien
    const lienBareme = b.lien === 'frere-soeur' ? 'frere-soeur' : b.lien === 'neveu-niece' ? 'neveu-niece' : b.lien === 'enfant' ? 'enfant' : 'autre';
    let droits757B = 0;
    {
      const bareme = BAREME_SUCCESSION_CLASSIQUE[lienBareme] || BAREME_SUCCESSION_CLASSIQUE['autre'];
      let reste757 = baseTaxable757B;
      let trancheInf = 0;
      for (const tranche of bareme.tranches) {
        if (reste757 <= 0) break;
        const mt = Math.min(reste757, tranche.max - trancheInf);
        droits757B += mt * tranche.taux;
        reste757 -= mt;
        trancheInf = tranche.max;
      }
    }

    const totalDroits = droits990I + droits757B;

    return {
      nom: b.nom,
      lien: b.lien,
      capitalRecu,
      partAvant70: partAvant70Benef,
      partApres70: partApres70Benef,
      abattementArt990I: abattement990I,
      abattementArt757B: abattement757B,
      baseTaxable990I,
      baseTaxable757B,
      droits990I,
      droits757B,
      totalDroits,
      netPercu: capitalRecu - totalDroits,
      exonere: false
    };
  });

  const totalDroits = resultsBeneficiaires.reduce((s, b) => s + b.totalDroits, 0);
  const totalNetPercu = resultsBeneficiaires.reduce((s, b) => s + b.netPercu, 0);

  // Comparaison: droits de succession classique (sans AV)
  let droitsClassiqueTotal = 0;
  for (const b of beneficiaires) {
    if (b.lien === 'conjoint') continue;
    const pct = parseNumber(b.pourcentage) / 100;
    const capitalRecu = valeurContrat * pct;
    droitsClassiqueTotal += calculerDroitsSuccessionClassique(capitalRecu, b.lien);
  }

  return {
    beneficiaires: resultsBeneficiaires,
    totalDroits,
    totalNetPercu,
    droitsSuccessionClassique: droitsClassiqueTotal,
    economieAV: droitsClassiqueTotal - totalDroits
  };
}

function genererProjection(
  versementInitial: number,
  versementMensuel: number,
  rendementAnnuel: number,
  dureeAnnees: number
): { annee: number; versements: number; interets: number; total: number }[] {
  const data: { annee: number; versements: number; interets: number; total: number }[] = [];
  let totalVerse = versementInitial;
  let totalCapital = versementInitial;
  const tauxMensuel = rendementAnnuel / 12;

  for (let annee = 1; annee <= dureeAnnees; annee++) {
    for (let mois = 0; mois < 12; mois++) {
      totalCapital = totalCapital * (1 + tauxMensuel) + versementMensuel;
      totalVerse += versementMensuel;
    }
    data.push({
      annee,
      versements: Math.round(totalVerse),
      interets: Math.round(totalCapital - totalVerse),
      total: Math.round(totalCapital)
    });
  }

  return data;
}

// ============================================
// COMPOSANT FAQ
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const faqData = [
    {
      category: "Fiscalite generale",
      questions: [
        {
          q: "Comment fonctionne la fiscalite de l'assurance-vie ?",
          r: "L'assurance-vie beneficie d'un regime fiscal avantageux a double titre :\n\n**En cas de rachat (retrait) :** seuls les produits (gains) sont imposes, pas le capital verse. Le taux d'imposition depend de l'anciennete du contrat et de la date de versement des primes. Apres 8 ans, un abattement annuel de 4 600 EUR (celibataire) ou 9 200 EUR (couple) s'applique sur les gains.\n\n**En cas de deces :** les capitaux transmis beneficient d'abattements specifiques (152 500 EUR par beneficiaire pour les primes versees avant 70 ans), hors du cadre de la succession civile classique.",
          source: "Articles 125-0 A, 990 I et 757 B du CGI"
        },
        {
          q: "Quel est l'interet fiscal apres 8 ans ?",
          r: "Apres 8 ans de detention, l'assurance-vie offre ses meilleurs avantages :\n\n**Abattement annuel sur les gains :**\n- 4 600 EUR pour une personne seule\n- 9 200 EUR pour un couple\n\n**Taux d'imposition reduit :**\n- 7,5 % sur les produits (primes versees avant le 27/09/2017)\n- 7,5 % si encours total < 150 000 EUR (primes apres 27/09/2017)\n- 12,8 % au-dela de 150 000 EUR d'encours\n\nCes taux sont nettement inferieurs au bareme progressif de l'IR pour les TMI elevees.",
          source: "Article 125-0 A du CGI"
        },
        {
          q: "Comment est calculee la part imposable d'un rachat ?",
          r: "Lors d'un rachat partiel, seule la part de gains incluse dans le retrait est imposee :\n\n**Formule :** Produits imposables = Montant rachete x (Total des gains / Valeur du contrat)\n\n**Exemple :** Pour un contrat valant 200 000 EUR (120 000 EUR de primes, 80 000 EUR de gains), un rachat de 50 000 EUR contient :\n50 000 x (80 000 / 200 000) = 20 000 EUR de produits imposables\nEt 30 000 EUR de capital restitue (non impose).",
          source: "Article 125-0 A, I du CGI - BOFiP BOI-RPPM-RCM-10-10-80"
        }
      ]
    },
    {
      category: "Transmission et succession",
      questions: [
        {
          q: "L'assurance-vie est-elle hors succession ?",
          r: "**Oui, pour les primes versees avant 70 ans (art. 990 I CGI) :**\n- Les capitaux deces sont transmis hors succession civile\n- Chaque beneficiaire beneficie d'un abattement de 152 500 EUR\n- Au-dela : 20 % jusqu'a 700 000 EUR, puis 31,25 %\n- Le conjoint/partenaire PACS est toujours exonere (loi TEPA 2007)\n\n**Partiellement pour les primes versees apres 70 ans (art. 757 B) :**\n- Abattement global de 30 500 EUR (partage entre beneficiaires)\n- Au-dela : droits de succession selon le bareme classique\n- Avantage : les gains/interets ne sont PAS taxes",
          source: "Articles 990 I et 757 B du CGI, Loi TEPA 2007"
        },
        {
          q: "Que se passe-t-il pour les versements apres 70 ans ?",
          r: "Les versements realises apres 70 ans relevent de l'article 757 B du CGI :\n\n**Regime specifique :**\n- Abattement global de 30 500 EUR partage entre tous les beneficiaires\n- Au-dela : droits de succession selon le bareme classique (selon le lien de parente)\n- **Avantage majeur :** seules les primes sont taxees, les gains et interets generes sont TOTALEMENT EXONERES\n\n**Strategie :** Un versement de 30 500 EUR apres 70 ans place a 3 % pendant 15 ans genere environ 17 500 EUR d'interets transmis en franchise totale de droits.",
          source: "Article 757 B du CGI"
        },
        {
          q: "Comment optimiser la clause beneficiaire ?",
          r: "La redaction de la clause beneficiaire est cruciale :\n\n**Bonnes pratiques :**\n- Nommer precisement les beneficiaires (nom, prenom, date de naissance)\n- Prevoir des beneficiaires subsidiaires (en cas de predeces)\n- Utiliser la clause demembree (usufruit au conjoint, nue-propriete aux enfants)\n\n**Clause demembree type :**\n\"Mon conjoint pour l'usufruit, mes enfants nes ou a naitre pour la nue-propriete, a parts egales entre eux\"\n\n**Avantage :** le conjoint percoit les revenus de son vivant, et au second deces les enfants recoivent le capital sans droits supplementaires.\n\n**Attention :** la clause standard \"mon conjoint, a defaut mes enfants\" ne permet pas le demembrement.",
          source: "Article L132-8 du Code des assurances"
        }
      ]
    },
    {
      category: "Strategie et optimisation",
      questions: [
        {
          q: "Faut-il un ou plusieurs contrats d'assurance-vie ?",
          r: "**Plusieurs contrats presentent des avantages :**\n\n- **Diversification des assureurs** : protection en cas de defaillance (garantie FGAP : 70 000 EUR par assureur)\n- **Gestion differenciee** : un contrat securitaire (fonds euros), un contrat dynamique (UC)\n- **Optimisation des rachats** : racheter sur le contrat le plus ancien (meilleure fiscalite)\n- **Beneficiaires differents** : adapter la clause par contrat\n\n**En pratique :** 2 a 3 contrats est souvent optimal. Au-dela, la gestion devient complexe.",
          source: "Article L423-1 du Code des assurances (FGAP)"
        },
        {
          q: "Assurance-vie et IFI : quel impact ?",
          r: "L'assurance-vie est en principe **hors du champ de l'IFI**, sauf dans un cas :\n\n**Contrats rachetables investis en immobilier :**\n- Les unites de compte adossees a de l'immobilier (SCPI, OPCI, SCI) sont soumises a l'IFI\n- La fraction representative de biens immobiliers doit etre declaree\n- Les fonds euros et UC en actions/obligations ne sont PAS concernes\n\n**Astuce :** privilegier les fonds euros et UC en valeurs mobilieres pour echapper a l'IFI tout en conservant une exposition immobiliere via d'autres vehicules.",
          source: "Article 972 du CGI"
        },
        {
          q: "Peut-on transferer un contrat sans fiscalite ?",
          r: "**Transfert entre assureurs (loi Pacte 2019) :**\nDepuis la loi Pacte, il est possible de transferer un contrat d'assurance-vie chez le MEME assureur vers un autre support (PER par exemple) sans perdre l'anteriorite fiscale.\n\n**En revanche :** le transfert vers un AUTRE assureur n'est toujours pas possible sans cloture fiscale. Il faut racheter puis souscrire un nouveau contrat.\n\n**Exception :** la transformation en contrat euro-croissance chez le meme assureur conserve l'anteriorite.\n\n**Conseil :** si le contrat a plus de 8 ans, mieux vaut le conserver meme avec des frais eleves, plutot que perdre l'anteriorite fiscale.",
          source: "Loi Pacte n 2019-486 du 22 mai 2019, art. 72"
        },
        {
          q: "Quelle strategie de rachat pour minimiser l'impot ?",
          r: "**Optimisation des rachats :**\n\n1. **Attendre les 8 ans** : pour beneficier de l'abattement et du taux reduit\n2. **Etaler les rachats** : utiliser l'abattement annuel de 4 600/9 200 EUR chaque annee\n3. **Racheter en fin d'annee** : si besoin de liquidites, racheter en decembre et janvier pour doubler l'abattement\n4. **Comparer PFU et bareme** : le bareme IR est plus avantageux si votre TMI est < 12,8 % (TMI 0 ou 11 %)\n5. **Rester sous 150 000 EUR d'encours** : pour beneficier du taux de 7,5 % meme apres 2017\n6. **Privilegier les rachats sur les contrats les plus anciens** : meilleure fiscalite"
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="space-y-6">
      {faqData.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
              <span className="ml-auto bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                {category.questions.length} questions
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {category.questions.map((item, questionIndex) => {
              const isOpen = openIndex === `${categoryIndex}-${questionIndex}`;
              return (
                <div key={questionIndex} className="transition-all">
                  <button
                    onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                    className="w-full px-6 py-5 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.q}
                      </h4>
                      {!isOpen && (
                        <p className="text-sm text-gray-500">
                          Cliquez pour voir la reponse detaillee
                        </p>
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pl-16">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
                        <div className="prose prose-sm max-w-none">
                          {item.r.split('\n').map((line, i) => {
                            if (line.trim() === '') return <br key={i} />;
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p key={i} className="mb-2 text-gray-800 leading-relaxed">
                                {parts.map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j} className="text-gray-900">{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={j}>{part}</span>;
                                })}
                              </p>
                            );
                          })}
                        </div>

                        {'source' in item && item.source && (
                          <div className="mt-4 pt-4 border-t-2 border-blue-200">
                            <div className="flex items-start gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-blue-900 mb-1">Reference legale :</p>
                                <p className="text-xs text-blue-800 font-medium">{item.source}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

function AssuranceVieContent() {
  // Onglet actif
  const [activeTab, setActiveTab] = useState<OngletActif>('rachat');

  // Responsive
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDeviceType = () => {
      setIsDesktop(window.innerWidth > 1024);
      setIsMobile(window.innerWidth < 768);
    };
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // ===== ETAT RACHAT =====
  const [anciennete, setAnciennete] = useState<AncienneteContrat>('plus8');
  const [primesVersees, setPrimesVersees] = useState('');
  const [valeurContrat, setValeurContrat] = useState('');
  const [partPrimesAvant2017, setPartPrimesAvant2017] = useState('0');
  const [montantRachat, setMontantRachat] = useState('');
  const [situation, setSituation] = useState<SituationFamiliale>('celibataire');
  const [tmi, setTmi] = useState(0.30);
  const [encoursTotalAV, setEncoursTotalAV] = useState('');

  // ===== ETAT SUCCESSION =====
  const [valeurContratDeces, setValeurContratDeces] = useState('');
  const [partAvant70, setPartAvant70] = useState('70');
  const [gainsApres70, setGainsApres70] = useState('');
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([
    { id: 1, nom: 'Enfant 1', lien: 'enfant', pourcentage: '50' },
    { id: 2, nom: 'Enfant 2', lien: 'enfant', pourcentage: '50' }
  ]);

  // ===== ETAT PROJECTION =====
  const [projVersementInitial, setProjVersementInitial] = useState('50000');
  const [projVersementMensuel, setProjVersementMensuel] = useState('500');
  const [projRendement, setProjRendement] = useState('3');
  const [projDuree, setProjDuree] = useState('20');

  // ===== CALCULS =====

  const resultatRachat = useMemo(() => {
    return calculerRachat(
      anciennete,
      parseNumber(primesVersees),
      parseNumber(valeurContrat),
      parseNumber(partPrimesAvant2017),
      parseNumber(montantRachat),
      situation,
      tmi,
      parseNumber(encoursTotalAV) || parseNumber(valeurContrat)
    );
  }, [anciennete, primesVersees, valeurContrat, partPrimesAvant2017, montantRachat, situation, tmi, encoursTotalAV]);

  const resultatSuccession = useMemo(() => {
    return calculerSuccession(
      parseNumber(valeurContratDeces),
      beneficiaires,
      parseNumber(partAvant70),
      parseNumber(gainsApres70)
    );
  }, [valeurContratDeces, beneficiaires, partAvant70, gainsApres70]);

  const projectionData = useMemo(() => {
    return genererProjection(
      parseNumber(projVersementInitial),
      parseNumber(projVersementMensuel),
      parseNumber(projRendement) / 100,
      Math.min(parseInt(projDuree) || 20, 40)
    );
  }, [projVersementInitial, projVersementMensuel, projRendement, projDuree]);

  // ===== CHARTS DATA =====

  const pieRachatData = useMemo(() => {
    if (!resultatRachat) return [];
    return [
      { name: 'Capital (non impose)', value: Math.round(resultatRachat.partCapital) },
      { name: 'Produits imposables', value: Math.round(resultatRachat.partProduits) }
    ];
  }, [resultatRachat]);

  const barComparaisonData = useMemo(() => {
    if (!resultatRachat) return [];
    return [
      {
        name: 'PFU (Flat Tax)',
        impot: Math.round(resultatRachat.impotPFU),
        ps: Math.round(resultatRachat.prelevementsSociaux),
        net: Math.round(resultatRachat.netPercuPFU)
      },
      {
        name: 'Bareme IR',
        impot: Math.round(resultatRachat.impotIR),
        ps: Math.round(resultatRachat.prelevementsSociaux),
        net: Math.round(resultatRachat.netPercuIR)
      }
    ];
  }, [resultatRachat]);

  const barSuccessionData = useMemo(() => {
    if (!resultatSuccession) return [];
    return resultatSuccession.beneficiaires.map(b => ({
      name: b.nom,
      netPercu: Math.round(b.netPercu),
      droits: Math.round(b.totalDroits)
    }));
  }, [resultatSuccession]);

  // ===== EXPORT PDF =====

  const exporterPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Assurance-Vie', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    if (resultatRachat) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Simulation de rachat', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Montant rachete : ${resultatRachat.montantRachat.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Part capital (non imposee) : ${resultatRachat.partCapital.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Part produits (imposable) : ${resultatRachat.partProduits.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      if (resultatRachat.abattement > 0) {
        doc.text(`Abattement : ${resultatRachat.abattement.toLocaleString('fr-FR')} EUR`, 20, y);
        y += 7;
      }
      y += 5;
      doc.text(`Option PFU : impot ${resultatRachat.impotPFU.toLocaleString('fr-FR')} EUR + PS ${resultatRachat.prelevementsSociaux.toLocaleString('fr-FR')} EUR = net ${resultatRachat.netPercuPFU.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Option IR : impot ${resultatRachat.impotIR.toLocaleString('fr-FR')} EUR + PS ${resultatRachat.prelevementsSociaux.toLocaleString('fr-FR')} EUR = net ${resultatRachat.netPercuIR.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Meilleure option : ${resultatRachat.netPercuPFU >= resultatRachat.netPercuIR ? 'PFU (Flat Tax)' : 'Bareme IR'}`, 20, y);
      y += 12;
    }

    if (resultatSuccession) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Simulation succession', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total droits : ${resultatSuccession.totalDroits.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Total net percu : ${resultatSuccession.totalNetPercu.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Droits succession classique : ${resultatSuccession.droitsSuccessionClassique.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Economie via assurance-vie : ${resultatSuccession.economieAV.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 12;
    }

    if (projectionData.length > 0) {
      const derniere = projectionData[projectionData.length - 1];
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Projection', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Valeur finale (${projectionData.length} ans) : ${Math.round(derniere.total).toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Total verse : ${Math.round(derniere.versements).toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Gains (interets) : ${Math.round(derniere.interets).toLocaleString('fr-FR')} EUR`, 20, y);
      y += 12;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    if (y > 260) { doc.addPage(); y = 20; }
    const disclaimer = 'Avertissement : cette simulation est fournie a titre informatif et ne constitue pas un conseil fiscal ou patrimonial. Consultez un professionnel avant toute decision.';
    const lines = doc.splitTextToSize(disclaimer, 170);
    lines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`assurance-vie-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ===== HANDLERS BENEFICIAIRES =====

  const ajouterBeneficiaire = () => {
    const newId = Math.max(...beneficiaires.map(b => b.id), 0) + 1;
    setBeneficiaires([...beneficiaires, {
      id: newId,
      nom: `Beneficiaire ${newId}`,
      lien: 'enfant',
      pourcentage: '0'
    }]);
  };

  const supprimerBeneficiaire = (id: number) => {
    if (beneficiaires.length > 1) {
      setBeneficiaires(beneficiaires.filter(b => b.id !== id));
    }
  };

  const modifierBeneficiaire = (id: number, champ: keyof Beneficiaire, valeur: string) => {
    setBeneficiaires(beneficiaires.map(b =>
      b.id === id ? { ...b, [champ]: valeur } : b
    ));
  };

  // ===== PROJECTION FISCALE =====

  const projectionFiscale = useMemo(() => {
    if (projectionData.length === 0) return [];
    const vi = parseNumber(projVersementInitial);
    const vm = parseNumber(projVersementMensuel);

    return projectionData.filter((_, i) => i % 2 === 1 || i === 0 || i === projectionData.length - 1).map(p => {
      const gains = p.interets;
      const valeur = p.total;
      const primes = p.versements;
      const rachat50pct = valeur * 0.5;
      const produits50 = rachat50pct * (gains / valeur);
      const abattement = 4600;

      let taxePFU = 0;
      if (p.annee >= 8) {
        taxePFU = Math.max(0, produits50 - abattement) * 0.075 + produits50 * TAUX_PS;
      } else if (p.annee >= 4) {
        taxePFU = produits50 * 0.128 + produits50 * TAUX_PS;
      } else {
        taxePFU = produits50 * 0.128 + produits50 * TAUX_PS;
      }

      return {
        annee: p.annee,
        net50PctRachat: Math.round(rachat50pct - taxePFU),
        fiscalite: Math.round(taxePFU),
        regime: p.annee < 4 ? '< 4 ans' : p.annee < 8 ? '4-8 ans' : '> 8 ans'
      };
    });
  }, [projectionData, projVersementInitial, projVersementMensuel]);

  // ============================================
  // RENDU
  // ============================================

  const tabs: { id: OngletActif; label: string; icon: React.ElementType }[] = [
    { id: 'rachat', label: 'Rachat', icon: Euro },
    { id: 'succession', label: 'Succession', icon: Heart },
    { id: 'projection', label: 'Projection', icon: TrendingUp },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ===== HEADER ===== */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            <Shield className="w-4 h-4" />
            Simulateur fiscal 2025/2026
          </div>
          <h1 className={`font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
            Simulateur Assurance-Vie
          </h1>
          <p className={`text-gray-600 max-w-3xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
            Fiscalite des rachats, transmission successorale, projection de capitalisation.
            Comparez les strategies pour optimiser votre contrat d'assurance-vie.
          </p>
        </div>

        {/* ===== NAVIGATION ONGLETS ===== */}
        <div className={`flex gap-2 mb-8 ${isMobile ? 'flex-wrap justify-center' : 'justify-center'}`}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ===== ONGLET RACHAT ===== */}
        {activeTab === 'rachat' && (
          <div className={`grid gap-8 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Formulaire */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Parametres du rachat</h2>
                </div>

                {/* Anciennete */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Anciennete du contrat
                  </label>
                  <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {[
                      { value: 'moins4' as const, label: '< 4 ans' },
                      { value: 'entre4et8' as const, label: '4 - 8 ans' },
                      { value: 'plus8' as const, label: '> 8 ans' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAnciennete(opt.value)}
                        className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                          anciennete === opt.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primes versees */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total des primes versees
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={primesVersees}
                      onChange={e => setPrimesVersees(formatMontant(e.target.value))}
                      placeholder="120 000"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                    <Euro className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Valeur contrat */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valeur actuelle du contrat
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={valeurContrat}
                      onChange={e => setValeurContrat(formatMontant(e.target.value))}
                      placeholder="200 000"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                    <Euro className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Part primes avant/apres 2017 */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Part des primes versees avant le 27/09/2017
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={partPrimesAvant2017}
                      onChange={e => setPartPrimesAvant2017(e.target.value)}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="text-sm font-bold text-indigo-700 w-16 text-right">
                      {partPrimesAvant2017} %
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Apres 27/09/2017 : {100 - parseNumber(partPrimesAvant2017)} %</span>
                    <span>Avant 27/09/2017 : {partPrimesAvant2017} %</span>
                  </div>
                </div>

                {/* Montant rachat */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant du rachat souhaite
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={montantRachat}
                      onChange={e => setMontantRachat(formatMontant(e.target.value))}
                      placeholder="50 000"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                    <Euro className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {parseNumber(valeurContrat) > 0 && (
                    <button
                      onClick={() => setMontantRachat(valeurContrat)}
                      className="text-xs text-indigo-600 font-semibold mt-1 hover:underline"
                    >
                      Rachat total
                    </button>
                  )}
                </div>

                {/* Situation familiale */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Situation familiale
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSituation('celibataire')}
                      className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                        situation === 'celibataire'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Celibataire
                    </button>
                    <button
                      onClick={() => setSituation('couple')}
                      className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                        situation === 'couple'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Couple (marie/pacse)
                    </button>
                  </div>
                </div>

                {/* TMI */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tranche marginale d&apos;imposition (TMI)
                  </label>
                  <select
                    value={tmi}
                    onChange={e => setTmi(parseFloat(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    {TMI_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Pour comparer avec l&apos;option bareme IR
                  </p>
                </div>

                {/* Encours total AV */}
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Encours total en assurance-vie (tous contrats)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={encoursTotalAV}
                      onChange={e => setEncoursTotalAV(formatMontant(e.target.value))}
                      placeholder="Laisser vide = valeur du contrat"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                    <Euro className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Seuil de 150 000 EUR pour le taux de PFU (primes apres 27/09/2017)
                  </p>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Rappel fiscal</p>
                    <p>Seuls les <strong>produits (gains)</strong> sont imposes lors d&apos;un rachat, pas le capital verse. L&apos;abattement de 4 600 / 9 200 EUR s&apos;applique uniquement aux contrats de plus de 8 ans.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultats */}
            <div className="space-y-6">
              {resultatRachat ? (
                <>
                  {/* Export PDF */}
                  <div className="flex justify-end">
                    <button
                      onClick={exporterPDF}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Exporter en PDF
                    </button>
                  </div>

                  {/* Resume principal */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Resultats du rachat</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                        <p className="text-xs font-semibold text-indigo-600 mb-1">Montant rachete</p>
                        <p className="text-xl font-bold text-gray-900">{formatEuro.format(resultatRachat.montantRachat)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <p className="text-xs font-semibold text-green-600 mb-1">Capital (non impose)</p>
                        <p className="text-xl font-bold text-gray-900">{formatEuro.format(resultatRachat.partCapital)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                        <p className="text-xs font-semibold text-amber-600 mb-1">Produits imposables</p>
                        <p className="text-xl font-bold text-gray-900">{formatEuro.format(resultatRachat.partProduits)}</p>
                      </div>
                      {anciennete === 'plus8' && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-xs font-semibold text-blue-600 mb-1">Abattement (8 ans)</p>
                          <p className="text-xl font-bold text-gray-900">{formatEuro.format(resultatRachat.abattement)}</p>
                        </div>
                      )}
                    </div>

                    {/* Comparaison PFU vs IR */}
                    <div className="border-t-2 border-gray-100 pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Comparaison PFU vs Bareme IR</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {/* PFU */}
                        <div className={`rounded-xl p-4 border-2 ${resultatRachat.netPercuPFU >= resultatRachat.netPercuIR ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <p className="font-bold text-gray-900">PFU (Flat Tax)</p>
                            {resultatRachat.netPercuPFU >= resultatRachat.netPercuIR && (
                              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Optimal</span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taux PFU</span>
                              <span className="font-semibold">{formatPourcent(resultatRachat.tauxPFUApplique)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Impot</span>
                              <span className="font-semibold text-red-600">{formatEuro.format(resultatRachat.impotPFU)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">PS (18,6 %)</span>
                              <span className="font-semibold text-red-600">{formatEuro.format(resultatRachat.prelevementsSociaux)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                              <span className="font-bold">Net percu</span>
                              <span className="font-bold text-green-700">{formatEuro.format(resultatRachat.netPercuPFU)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 text-xs">Taux effectif</span>
                              <span className="text-xs font-semibold">{formatPourcent(resultatRachat.tauxEffectifPFU)}</span>
                            </div>
                          </div>
                        </div>

                        {/* IR */}
                        <div className={`rounded-xl p-4 border-2 ${resultatRachat.netPercuIR > resultatRachat.netPercuPFU ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <p className="font-bold text-gray-900">Bareme IR ({(tmi * 100).toFixed(0)} %)</p>
                            {resultatRachat.netPercuIR > resultatRachat.netPercuPFU && (
                              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Optimal</span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taux TMI</span>
                              <span className="font-semibold">{formatPourcent(tmi)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Impot</span>
                              <span className="font-semibold text-red-600">{formatEuro.format(resultatRachat.impotIR)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">PS (18,6 %)</span>
                              <span className="font-semibold text-red-600">{formatEuro.format(resultatRachat.prelevementsSociaux)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                              <span className="font-bold">Net percu</span>
                              <span className="font-bold text-green-700">{formatEuro.format(resultatRachat.netPercuIR)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 text-xs">Taux effectif</span>
                              <span className="text-xs font-semibold">{formatPourcent(resultatRachat.tauxEffectifIR)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommandation */}
                      <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                        <div className="flex items-start gap-3">
                          <Landmark className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-indigo-900 mb-1">Recommandation</p>
                            {resultatRachat.netPercuPFU >= resultatRachat.netPercuIR ? (
                              <p className="text-indigo-800">
                                Le <strong>PFU (Prelevement Forfaitaire Unique)</strong> est plus avantageux dans votre situation.
                                Vous economisez <strong>{formatEuro.format(resultatRachat.netPercuPFU - resultatRachat.netPercuIR)}</strong> par rapport au bareme IR.
                              </p>
                            ) : (
                              <p className="text-indigo-800">
                                L&apos;option pour le <strong>bareme progressif de l&apos;IR</strong> est plus avantageuse dans votre situation.
                                Vous economisez <strong>{formatEuro.format(resultatRachat.netPercuIR - resultatRachat.netPercuPFU)}</strong> par rapport au PFU.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graphiques Rachat */}
                  <div className={`grid gap-6 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Pie chart */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-indigo-600" />
                        Decomposition du rachat
                      </h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={pieRachatData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {pieRachatData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_CHART[index]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatEuro.format(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Bar chart comparaison */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        PFU vs Bareme IR
                      </h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barComparaisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: number) => formatEuro.format(value)} />
                          <Legend />
                          <Bar dataKey="net" name="Net percu" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="impot" name="Impot" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="ps" name="Prel. sociaux" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-12 text-center">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Resultats du rachat</h3>
                  <p className="text-gray-400">Renseignez les parametres pour voir la simulation</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ONGLET SUCCESSION ===== */}
        {activeTab === 'succession' && (
          <div className={`grid gap-8 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Formulaire */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Parametres succession</h2>
                </div>

                {/* Valeur contrat au deces */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valeur du contrat au deces
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={valeurContratDeces}
                      onChange={e => setValeurContratDeces(formatMontant(e.target.value))}
                      placeholder="500 000"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                    <Euro className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Repartition avant/apres 70 ans */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Part des primes versees avant 70 ans
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={partAvant70}
                      onChange={e => setPartAvant70(e.target.value)}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="text-sm font-bold text-purple-700 w-16 text-right">
                      {partAvant70} %
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Art. 990 I (avant 70 ans) : {partAvant70} %</span>
                    <span>Art. 757 B (apres 70 ans) : {100 - parseNumber(partAvant70)} %</span>
                  </div>
                </div>

                {/* Gains apres 70 ans */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gains sur primes versees apres 70 ans (exoneres)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gainsApres70}
                      onChange={e => setGainsApres70(formatMontant(e.target.value))}
                      placeholder="15 000"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                    <Euro className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Art. 757 B : seules les primes sont taxees, les interets sont exoneres
                  </p>
                </div>
              </div>

              {/* Beneficiaires */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Beneficiaires</h2>
                  </div>
                  <button
                    onClick={ajouterBeneficiaire}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-4">
                  {beneficiaires.map((b, index) => (
                    <div key={b.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-700">
                          Beneficiaire {index + 1}
                        </span>
                        {beneficiaires.length > 1 && (
                          <button
                            onClick={() => supprimerBeneficiaire(b.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom</label>
                          <input
                            type="text"
                            value={b.nom}
                            onChange={e => modifierBeneficiaire(b.id, 'nom', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Lien</label>
                          <select
                            value={b.lien}
                            onChange={e => modifierBeneficiaire(b.id, 'lien', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-purple-500 outline-none"
                          >
                            <option value="conjoint">Conjoint / PACS</option>
                            <option value="enfant">Enfant</option>
                            <option value="frere-soeur">Frere / Soeur</option>
                            <option value="neveu-niece">Neveu / Niece</option>
                            <option value="autre">Autre</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Part (%)</label>
                          <input
                            type="text"
                            value={b.pourcentage}
                            onChange={e => modifierBeneficiaire(b.id, 'pourcentage', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-purple-500 outline-none"
                          />
                        </div>
                      </div>

                      {b.lien === 'conjoint' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg p-2">
                          <CheckCircle className="w-4 h-4" />
                          Exonere de droits (loi TEPA 2007)
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total pourcentage */}
                {(() => {
                  const total = beneficiaires.reduce((s, b) => s + parseNumber(b.pourcentage), 0);
                  return (
                    <div className={`mt-4 text-sm font-semibold flex items-center gap-2 ${Math.abs(total - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                      <AlertCircle className="w-4 h-4" />
                      Total : {total} % {Math.abs(total - 100) >= 0.01 && '(doit etre egal a 100 %)'}
                    </div>
                  );
                })()}
              </div>

              {/* Info succession */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-semibold mb-1">Rappel important</p>
                    <p>Le conjoint ou partenaire de PACS est <strong>toujours exonere</strong> de droits de succession sur l&apos;assurance-vie (art. 990 I et 757 B du CGI, loi TEPA 2007).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultats Succession */}
            <div className="space-y-6">
              {resultatSuccession ? (
                <>
                  {/* Resume global */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Resultats succession</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-600 mb-1">Capital transmis</p>
                        <p className="text-xl font-bold text-gray-900">{formatEuro.format(parseNumber(valeurContratDeces))}</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                        <p className="text-xs font-semibold text-red-600 mb-1">Total des droits</p>
                        <p className="text-xl font-bold text-gray-900">{formatEuro.format(resultatSuccession.totalDroits)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <p className="text-xs font-semibold text-green-600 mb-1">Total net percu</p>
                        <p className="text-xl font-bold text-gray-900">{formatEuro.format(resultatSuccession.totalNetPercu)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                        <p className="text-xs font-semibold text-indigo-600 mb-1">Economie vs succession</p>
                        <p className={`text-xl font-bold ${resultatSuccession.economieAV >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatEuro.format(resultatSuccession.economieAV)}
                        </p>
                      </div>
                    </div>

                    {/* Comparaison */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-6">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-semibold">Comparaison avec la succession classique</p>
                          <p>Droits en succession classique (sans AV) : <strong>{formatEuro.format(resultatSuccession.droitsSuccessionClassique)}</strong></p>
                          <p>Droits via assurance-vie : <strong>{formatEuro.format(resultatSuccession.totalDroits)}</strong></p>
                          {resultatSuccession.economieAV > 0 && (
                            <p className="mt-1 font-bold text-green-900">
                              L&apos;assurance-vie permet d&apos;economiser {formatEuro.format(resultatSuccession.economieAV)} de droits.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail par beneficiaire */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Detail par beneficiaire
                    </h3>

                    <div className="space-y-4">
                      {resultatSuccession.beneficiaires.map((b, index) => (
                        <div key={index} className={`rounded-xl p-4 border-2 ${b.exonere ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="font-bold text-gray-900">{b.nom}</span>
                              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                {b.lien === 'conjoint' ? 'Conjoint/PACS' : b.lien === 'enfant' ? 'Enfant' : b.lien === 'frere-soeur' ? 'Frere/Soeur' : b.lien === 'neveu-niece' ? 'Neveu/Niece' : 'Autre'}
                              </span>
                            </div>
                            {b.exonere && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold">Exonere</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Capital recu</span>
                              <span className="font-semibold">{formatEuro.format(b.capitalRecu)}</span>
                            </div>
                            {!b.exonere && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Abattement 990 I</span>
                                  <span className="font-semibold text-green-600">{formatEuro.format(b.abattementArt990I)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Droits 990 I</span>
                                  <span className="font-semibold text-red-600">{formatEuro.format(b.droits990I)}</span>
                                </div>
                                {b.partApres70 > 0 && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Abattement 757 B</span>
                                      <span className="font-semibold text-green-600">{formatEuro.format(b.abattementArt757B)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Droits 757 B</span>
                                      <span className="font-semibold text-red-600">{formatEuro.format(b.droits757B)}</span>
                                    </div>
                                  </>
                                )}
                                <div className="col-span-2 flex justify-between border-t border-gray-200 pt-2 mt-1">
                                  <span className="font-bold">Net percu</span>
                                  <span className="font-bold text-green-700">{formatEuro.format(b.netPercu)}</span>
                                </div>
                              </>
                            )}
                            {b.exonere && (
                              <div className="flex justify-between">
                                <span className="font-bold text-green-700">Net percu</span>
                                <span className="font-bold text-green-700">{formatEuro.format(b.netPercu)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Graphique succession */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Net percu par beneficiaire
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barSuccessionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatEuro.format(value)} />
                        <Legend />
                        <Bar dataKey="netPercu" name="Net percu" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="droits" name="Droits" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Resultats de la transmission</h3>
                  <p className="text-gray-400">Renseignez la valeur du contrat et les beneficiaires</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ONGLET PROJECTION ===== */}
        {activeTab === 'projection' && (
          <div className="space-y-8">
            {/* Formulaire projection */}
            <div className={`grid gap-6 ${isDesktop ? 'grid-cols-4' : isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Versement initial
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projVersementInitial}
                    onChange={e => setProjVersementInitial(formatMontant(e.target.value))}
                    className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Versement mensuel
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projVersementMensuel}
                    onChange={e => setProjVersementMensuel(formatMontant(e.target.value))}
                    className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rendement annuel estime
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projRendement}
                    onChange={e => setProjRendement(e.target.value.replace(/[^\d.,]/g, ''))}
                    className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <div className="flex gap-1 mt-2">
                  {[
                    { label: 'Fonds EUR', value: '2.5' },
                    { label: 'Mixte', value: '4' },
                    { label: 'UC Actions', value: '7' }
                  ].map(p => (
                    <button
                      key={p.value}
                      onClick={() => setProjRendement(p.value)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${
                        projRendement === p.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duree (annees)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projDuree}
                    onChange={e => setProjDuree(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <div className="flex gap-1 mt-2">
                  {['10', '15', '20', '30'].map(d => (
                    <button
                      key={d}
                      onClick={() => setProjDuree(d)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${
                        projDuree === d
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d} ans
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resultats cles projection */}
            {projectionData.length > 0 && (
              <>
                <div className={`grid gap-4 ${isDesktop ? 'grid-cols-4' : 'grid-cols-2'}`}>
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">Capital final</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatEuro.format(projectionData[projectionData.length - 1].total)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                    <p className="text-xs font-semibold text-green-600 mb-1">Interets cumules</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatEuro.format(projectionData[projectionData.length - 1].interets)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                    <p className="text-xs font-semibold text-purple-600 mb-1">Total verse</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatEuro.format(projectionData[projectionData.length - 1].versements)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5">
                    <p className="text-xs font-semibold text-amber-600 mb-1">Rendement total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projectionData[projectionData.length - 1].versements > 0
                        ? `${((projectionData[projectionData.length - 1].interets / projectionData[projectionData.length - 1].versements) * 100).toFixed(1)} %`
                        : '0 %'
                      }
                    </p>
                  </div>
                </div>

                {/* Graphique evolution */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Evolution du contrat sur {projDuree} ans
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="annee"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Annees', position: 'insideBottomRight', offset: -5, fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          const labels: Record<string, string> = { total: 'Capital total', versements: 'Versements cumules', interets: 'Interets cumules' };
                          return [formatEuro.format(value), labels[name] || name];
                        }}
                        labelFormatter={label => `Annee ${label}`}
                      />
                      <Legend formatter={(value: string) => {
                        const labels: Record<string, string> = { total: 'Capital total', versements: 'Versements cumules', interets: 'Interets cumules' };
                        return labels[value] || value;
                      }} />
                      <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="versements" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="interets" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Impact fiscal selon date de rachat */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                    Impact fiscal selon la date de rachat (rachat de 50 % du contrat)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-xl">Annee</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Regime fiscal</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Fiscalite</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700 rounded-tr-xl">Net percu (50 %)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectionFiscale.map((row, i) => (
                          <tr key={i} className={`border-b border-gray-100 ${row.regime === '> 8 ans' ? 'bg-green-50' : ''}`}>
                            <td className="px-4 py-3 font-semibold">{row.annee}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                row.regime === '> 8 ans' ? 'bg-green-100 text-green-700' :
                                row.regime === '4-8 ans' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {row.regime}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-red-600 font-semibold">{formatEuro.format(row.fiscalite)}</td>
                            <td className="px-4 py-3 text-right text-green-700 font-bold">{formatEuro.format(row.net50PctRachat)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rendements types */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-600" />
                    Rendements types en 2025
                  </h3>
                  <div className={`grid gap-4 ${isDesktop ? 'grid-cols-4' : 'grid-cols-2'}`}>
                    {[
                      { label: 'Fonds euros', rendement: '2,5 - 3,5 %', risque: 'Faible', color: 'bg-green-100 text-green-700' },
                      { label: 'Obligations', rendement: '~3 %', risque: 'Modere', color: 'bg-blue-100 text-blue-700' },
                      { label: 'SCPI', rendement: '~4 %', risque: 'Modere', color: 'bg-amber-100 text-amber-700' },
                      { label: 'Actions', rendement: '~7 %', risque: 'Eleve', color: 'bg-red-100 text-red-700' }
                    ].map(item => (
                      <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="font-bold text-gray-900 mb-1">{item.label}</p>
                        <p className="text-lg font-bold text-indigo-700 mb-1">{item.rendement}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}>
                          Risque {item.risque}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== ONGLET FAQ ===== */}
        {activeTab === 'faq' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Questions frequentes</h2>
              <p className="text-gray-600">Tout savoir sur la fiscalite de l&apos;assurance-vie</p>
            </div>
            <FAQSection />
          </div>
        )}

        {/* ===== AVERTISSEMENT JURIDIQUE ===== */}
        <div className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">Avertissement</h3>
              <p className="text-sm text-amber-800 leading-relaxed mb-3">
                Ce simulateur fournit des estimations a titre indicatif, basees sur la legislation fiscale en vigueur (2025/2026).
                Il ne constitue pas un conseil fiscal ou patrimonial personnalise.
              </p>
              <p className="text-sm text-amber-800 leading-relaxed mb-3">
                La fiscalite de l&apos;assurance-vie est complexe et depend de nombreux parametres specifiques a chaque situation.
                Nous vous recommandons de consulter un professionnel :
              </p>
              <ul className="text-sm text-amber-800 space-y-1 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">-</span>
                  <span><strong>Notaire</strong> : pour les aspects successoraux et la clause beneficiaire</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">-</span>
                  <span><strong>Conseiller en gestion de patrimoine (CGP)</strong> : pour une strategie d&apos;allocation adaptee</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">-</span>
                  <span><strong>Avocat fiscaliste</strong> : pour l&apos;optimisation fiscale complexe</span>
                </li>
              </ul>
              <p className="leading-relaxed font-semibold text-amber-900 text-sm">
                <strong>NotariaPrime.fr</strong> decline toute responsabilite en cas d&apos;utilisation des informations fournies sans validation par un professionnel qualifie.
              </p>
              <div className="bg-amber-100 rounded-lg p-3 mt-4 border border-amber-400">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Sources officielles :</strong> Code General des Impots (CGI), articles 125-0 A, 990 I, 757 B - Bulletin Officiel des Finances Publiques (BOFiP) - Service-Public.fr - Legifrance.gouv.fr
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export default function AssuranceViePage() {
  return (
    <MainLayout showFeedback={false}>
      <AssuranceVieContent />
    </MainLayout>
  );
}
