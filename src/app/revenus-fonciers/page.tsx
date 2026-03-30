// ============================================
// FILE: src/app/revenus-fonciers/page.tsx
// DESCRIPTION: Simulateur Revenus Fonciers - Micro-Foncier vs Regime Reel
// ============================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  Building2,
  TrendingUp,
  Calculator,
  PieChart as PieChartIcon,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Landmark,
  Percent,
  Euro,
  Plus,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Scale,
  BarChart3,
  ArrowRight,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

// Import MainLayout NotariaPrime
import MainLayout from '@/components/MainLayout';

// ============================================
// TYPES
// ============================================

interface BienLocatif {
  id: number;
  nom: string;
  loyerMensuel: string;
  chargesRecuperables: string;
}

interface ChargesReelles {
  interetsEmprunt: string;
  travauxEntretien: string;
  travauxAmelioration: string;
  assurancePNO: string;
  taxeFonciere: string;
  fraisGestion: string;
  chargesCopropriete: string;
}

interface ResultatComparaison {
  micro: ResultatRegime;
  reel: ResultatRegime;
  regimeOptimal: 'micro' | 'reel';
  economie: number;
  deficitFoncier: DeficitFoncier | null;
}

interface ResultatRegime {
  revenusBruts: number;
  deductions: number;
  revenuImposable: number;
  impotRevenu: number;
  prelevementsSociaux: number;
  totalFiscalite: number;
  revenuNetApresImpot: number;
}

interface DeficitFoncier {
  montantDeficit: number;
  imputationRevenuGlobal: number;
  reportSurRevenusFonciers: number;
}

// ============================================
// CONSTANTES
// ============================================

const PLAFOND_MICRO_FONCIER = 15000;
const ABATTEMENT_MICRO_FONCIER = 0.30;
const PRELEVEMENTS_SOCIAUX = 0.172;
const PLAFOND_DEFICIT_REVENU_GLOBAL = 10700;
const FRAIS_GESTION_FORFAITAIRES_PAR_LOCAL = 20;

const TRANCHES_IR_2025 = [
  { min: 0, max: 11294, taux: 0 },
  { min: 11294, max: 28797, taux: 0.11 },
  { min: 28797, max: 82341, taux: 0.30 },
  { min: 82341, max: 177106, taux: 0.41 },
  { min: 177106, max: Infinity, taux: 0.45 }
];

const TMI_OPTIONS = [
  { value: 0, label: '0 %' },
  { value: 11, label: '11 %' },
  { value: 30, label: '30 %' },
  { value: 41, label: '41 %' },
  { value: 45, label: '45 %' }
];

const COLORS_CHART = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#818cf8'];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function parseNumber(str: string): number {
  if (!str || str.trim() === '') return 0;
  let cleaned = str.replace(/\s+/g, '');
  cleaned = cleaned.replace(/\u00A0/g, '');
  cleaned = cleaned.replace(/\u202F/g, '');
  cleaned = cleaned.replace(',', '.');
  cleaned = cleaned.replace(/[^\d.-]/g, '');
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

function formatEuros(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant);
}

function formatEurosDetaille(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(montant);
}

function formatMontantSaisie(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============================================
// FONCTIONS DE CALCUL
// ============================================

function calculerImpotTMI(revenuImposable: number, tmi: number): number {
  if (revenuImposable <= 0) return 0;
  return revenuImposable * (tmi / 100);
}

function calculerComparaison(
  biens: BienLocatif[],
  charges: ChargesReelles,
  tmi: number
): ResultatComparaison {
  // Calcul des revenus bruts
  const revenusBruts = biens.reduce((total, bien) => {
    const loyer = parseNumber(bien.loyerMensuel) * 12;
    return total + loyer;
  }, 0);

  // =============================
  // MICRO-FONCIER
  // =============================
  const abattementMicro = revenusBruts * ABATTEMENT_MICRO_FONCIER;
  const revenuImposableMicro = revenusBruts * (1 - ABATTEMENT_MICRO_FONCIER);
  const impotMicro = calculerImpotTMI(revenuImposableMicro, tmi);
  const psMicro = revenuImposableMicro * PRELEVEMENTS_SOCIAUX;
  const totalFiscaliteMicro = impotMicro + psMicro;
  const netApresMicro = revenusBruts - totalFiscaliteMicro;

  const micro: ResultatRegime = {
    revenusBruts,
    deductions: abattementMicro,
    revenuImposable: revenuImposableMicro,
    impotRevenu: impotMicro,
    prelevementsSociaux: psMicro,
    totalFiscalite: totalFiscaliteMicro,
    revenuNetApresImpot: netApresMicro
  };

  // =============================
  // REGIME REEL
  // =============================
  const interetsEmprunt = parseNumber(charges.interetsEmprunt);
  const travauxEntretien = parseNumber(charges.travauxEntretien);
  const travauxAmelioration = parseNumber(charges.travauxAmelioration);
  const assurancePNO = parseNumber(charges.assurancePNO);
  const taxeFonciere = parseNumber(charges.taxeFonciere);
  const fraisGestion = parseNumber(charges.fraisGestion);
  const chargesCopropriete = parseNumber(charges.chargesCopropriete);
  const fraisForfaitaires = biens.length * FRAIS_GESTION_FORFAITAIRES_PAR_LOCAL;

  const totalChargesReelles =
    interetsEmprunt +
    travauxEntretien +
    travauxAmelioration +
    assurancePNO +
    taxeFonciere +
    fraisGestion +
    chargesCopropriete +
    fraisForfaitaires;

  const revenuImposableReel = revenusBruts - totalChargesReelles;

  let deficitFoncier: DeficitFoncier | null = null;
  let impotReel = 0;
  let psReel = 0;

  if (revenuImposableReel < 0) {
    // Deficit foncier
    const montantDeficit = Math.abs(revenuImposableReel);
    // Le deficit hors interets d'emprunt est imputable sur le revenu global
    const deficitHorsInterets = Math.abs(Math.min(0, revenusBruts - (totalChargesReelles - interetsEmprunt)));
    const imputationRevenuGlobal = Math.min(deficitHorsInterets, PLAFOND_DEFICIT_REVENU_GLOBAL);
    const reportSurRevenusFonciers = montantDeficit - imputationRevenuGlobal;

    deficitFoncier = {
      montantDeficit,
      imputationRevenuGlobal,
      reportSurRevenusFonciers: Math.max(0, reportSurRevenusFonciers)
    };

    impotReel = 0;
    psReel = 0;
  } else {
    impotReel = calculerImpotTMI(revenuImposableReel, tmi);
    psReel = revenuImposableReel * PRELEVEMENTS_SOCIAUX;
  }

  const totalFiscaliteReel = impotReel + psReel;
  const netApresReel = revenusBruts - totalFiscaliteReel;

  const reel: ResultatRegime = {
    revenusBruts,
    deductions: totalChargesReelles,
    revenuImposable: Math.max(0, revenuImposableReel),
    impotRevenu: impotReel,
    prelevementsSociaux: psReel,
    totalFiscalite: totalFiscaliteReel,
    revenuNetApresImpot: netApresReel
  };

  // Determination du regime optimal
  const regimeOptimal = totalFiscaliteReel <= totalFiscaliteMicro ? 'reel' : 'micro';
  const economie = Math.abs(totalFiscaliteMicro - totalFiscaliteReel);

  return {
    micro,
    reel,
    regimeOptimal,
    economie,
    deficitFoncier
  };
}

// ============================================
// COMPOSANT FAQ
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Principes fondamentaux",
      questions: [
        {
          q: "Qu'est-ce que le micro-foncier ?",
          r: "Le micro-foncier est un regime fiscal simplifie applicable aux proprietaires dont les revenus fonciers bruts annuels ne depassent pas 15 000 euros. Il offre un abattement forfaitaire de 30% representant l'ensemble des charges. Le proprietaire est impose sur 70% de ses revenus bruts. Ce regime est incompatible avec certains dispositifs de defiscalisation (Pinel, Denormandie, Malraux, etc.) et ne peut pas etre choisi si vous detenez des parts de SCI ou SCPI. La declaration se fait simplement sur le formulaire 2042 en case 4BE. (Article 32 du CGI)"
        },
        {
          q: "Quand choisir le regime reel ?",
          r: "Le regime reel est avantageux lorsque vos charges reelles deductibles depassent 30% de vos revenus bruts, c'est-a-dire lorsque l'abattement forfaitaire du micro-foncier ne couvre pas l'integralite de vos frais. C'est typiquement le cas lorsque vous avez un emprunt immobilier avec des interets significatifs, des travaux importants d'entretien, de reparation ou d'amelioration, ou des charges de copropriete elevees. Le regime reel est obligatoire si vos revenus fonciers depassent 15 000 euros par an. L'option pour le reel est irrevocable pendant 3 ans minimum. (Article 31 du CGI)"
        },
        {
          q: "Qu'est-ce que le deficit foncier ?",
          r: "Le deficit foncier survient lorsque vos charges deductibles en regime reel sont superieures a vos revenus fonciers. Ce deficit est imputable sur votre revenu global dans la limite de 10 700 euros par an (hors interets d'emprunt). Les interets d'emprunt ne sont deductibles que des revenus fonciers. L'excedent de deficit non impute est reportable pendant 10 ans sur les revenus fonciers futurs. Le deficit foncier constitue un puissant levier d'optimisation fiscale, notamment pour les contribuables dans les tranches marginales elevees. Attention : la creation d'un deficit foncier impose le maintien en location pendant au moins 3 ans apres l'imputation. (Article 156 I 3 du CGI)"
        }
      ]
    },
    {
      category: "Declaration et gestion",
      questions: [
        {
          q: "Comment declarer ses revenus fonciers ?",
          r: "En micro-foncier, la declaration est simplifiee : reportez le montant brut de vos loyers en case 4BE du formulaire 2042. L'abattement de 30% est applique automatiquement. En regime reel, vous devez remplir le formulaire 2044 (ou 2044-SPE pour les regimes speciaux) en detaillant l'ensemble de vos revenus et charges pour chaque bien. Le resultat est ensuite reporte sur le formulaire 2042. Conservez tous les justificatifs pendant au minimum 3 ans (factures de travaux, quittances de loyer, tableaux d'amortissement, etc.) en cas de controle fiscal. (Articles 28 a 33 quinquies du CGI)"
        },
        {
          q: "Peut-on revenir au micro-foncier apres le regime reel ?",
          r: "L'option pour le regime reel est irrevocable pendant une periode de 3 ans. A l'issue de cette periode de 3 ans, vous pouvez revenir au micro-foncier si vos revenus bruts ne depassent pas 15 000 euros et si vous remplissez les conditions d'eligibilite. Le retour au micro-foncier se fait simplement en declarant vos revenus en case 4BE du formulaire 2042, sans formuler de demande prealable. Attention : si vous avez impute un deficit foncier sur votre revenu global, vous devez maintenir la location pendant 3 ans, meme si vous changez de regime fiscal. (Article 32-2 du CGI)"
        }
      ]
    },
    {
      category: "Charges et deductions",
      questions: [
        {
          q: "Quels travaux sont deductibles en regime reel ?",
          r: "En regime reel, sont deductibles les travaux d'entretien et de reparation (maintien du bien en bon etat sans en modifier la structure : peinture, remplacement chaudiere, reparation toiture, etc.), les travaux d'amelioration pour les logements d'habitation (installation chauffage central, double vitrage, isolation, cuisine equipee, etc.). En revanche, les travaux de construction, reconstruction et agrandissement ne sont jamais deductibles des revenus fonciers. Les travaux doivent etre justifies par des factures d'entreprises. Les travaux realises par le proprietaire lui-meme (materiaux uniquement) sont deductibles sous conditions. (Article 31-I-1-a et b du CGI)"
        },
        {
          q: "Comment optimiser sa fiscalite fonciere ?",
          r: "Plusieurs strategies d'optimisation existent. Premierement, concentrer les travaux sur une seule annee pour maximiser le deficit foncier imputable (10 700 euros sur le revenu global). Deuxiemement, planifier les travaux les annees ou votre TMI est la plus elevee pour maximiser l'economie d'impot. Troisiemement, privilegier les interets d'emprunt in fine qui maintiennent un montant d'interets constant et eleve pendant toute la duree du pret. Quatriemement, ne pas oublier la deduction forfaitaire de 20 euros par local pour frais de gestion. Enfin, si vos charges sont faibles et inferieures a 30% des loyers, le micro-foncier sera plus avantageux. Chaque situation etant unique, une analyse personnalisee est recommandee. (Doctrine fiscale BOI-RFPI-BASE-20)"
        }
      ]
    },
    {
      category: "Cas particuliers",
      questions: [
        {
          q: "Quelle est la difference entre revenus fonciers et BIC ?",
          r: "Les revenus fonciers concernent la location nue (non meublee) de biens immobiliers. Ils sont soumis au micro-foncier (abattement 30%, plafond 15 000 euros) ou au regime reel (formulaire 2044). Les benefices industriels et commerciaux (BIC) concernent la location meublee (LMNP/LMP). Ils beneficient du micro-BIC (abattement 50%, plafond 77 700 euros) ou du regime reel BIC avec possibilite d'amortir le bien et le mobilier. Les BIC offrent generalement une fiscalite plus avantageuse grace aux amortissements, mais impliquent des obligations comptables plus lourdes (bilan, compte de resultat). Le passage de la location nue a la location meublee constitue un changement de regime fiscal avec des consequences importantes. (Articles 14 et 35 bis du CGI)"
        },
        {
          q: "Comment gerer plusieurs biens locatifs ?",
          r: "Lorsque vous possedez plusieurs biens locatifs en location nue, le regime fiscal (micro-foncier ou reel) s'applique globalement a l'ensemble de vos biens : vous ne pouvez pas choisir le micro pour un bien et le reel pour un autre. Le plafond de 15 000 euros du micro-foncier s'apprecie sur la totalite de vos revenus fonciers bruts cumules. En regime reel, les charges de chaque bien sont detaillees sur le formulaire 2044, mais le resultat foncier est global. Un deficit genere par un bien peut se compenser avec les revenus positifs d'un autre bien. Les frais forfaitaires de 20 euros par local s'appliquent pour chacun de vos biens. (BOI-RFPI-BASE-10)"
        },
        {
          q: "Quelles assurances sont deductibles ?",
          r: "En regime reel, les primes d'assurance suivantes sont integralement deductibles des revenus fonciers : l'assurance proprietaire non occupant (PNO) qui est obligatoire en copropriete et fortement recommandee pour tout bailleur, la garantie loyers impayes (GLI) qui couvre le risque de non-paiement par le locataire, l'assurance emprunteur si elle est liee a un pret immobilier contracte pour l'acquisition ou les travaux du bien loue. L'assurance habitation du locataire n'est evidemment pas deductible par le proprietaire. Les primes doivent correspondre a la periode de location effective. (Article 31-I-1-a du CGI)"
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-indigo-600" />
          Questions frequentes - Revenus fonciers
        </h2>
        <p className="text-gray-600 mt-2">
          Tout ce que vous devez savoir sur la fiscalite des revenus locatifs
        </p>
      </div>

      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8 last:mb-0">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {category.category}
          </h3>
          <div className="space-y-3">
            {category.questions.map((faq, questionIndex) => {
              const globalIndex = categoryIndex * 100 + questionIndex;
              const isOpen = openIndex === globalIndex;

              return (
                <div
                  key={questionIndex}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 bg-gray-50 border-t-2 border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.r}
                      </p>
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

export default function RevenusFonciersPage() {
  // ============================================
  // STATE
  // ============================================

  const [biens, setBiens] = useState<BienLocatif[]>([
    { id: 1, nom: 'Bien locatif 1', loyerMensuel: '', chargesRecuperables: '' }
  ]);

  const [charges, setCharges] = useState<ChargesReelles>({
    interetsEmprunt: '',
    travauxEntretien: '',
    travauxAmelioration: '',
    assurancePNO: '',
    taxeFonciere: '',
    fraisGestion: '',
    chargesCopropriete: ''
  });

  const [tmi, setTmi] = useState<number>(30);
  const [results, setResults] = useState<ResultatComparaison | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  // ============================================
  // RESPONSIVE
  // ============================================

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const ajouterBien = () => {
    if (biens.length >= 10) return;
    const nouveauId = Math.max(...biens.map(b => b.id), 0) + 1;
    setBiens([...biens, {
      id: nouveauId,
      nom: `Bien locatif ${nouveauId}`,
      loyerMensuel: '',
      chargesRecuperables: ''
    }]);
  };

  const supprimerBien = (id: number) => {
    if (biens.length > 1) {
      setBiens(biens.filter(b => b.id !== id));
    }
  };

  const modifierBien = (id: number, champ: keyof BienLocatif, valeur: string) => {
    setBiens(biens.map(b =>
      b.id === id ? { ...b, [champ]: champ === 'nom' ? valeur : formatMontantSaisie(valeur) } : b
    ));
  };

  const modifierCharge = (champ: keyof ChargesReelles, valeur: string) => {
    setCharges(prev => ({ ...prev, [champ]: formatMontantSaisie(valeur) }));
  };

  const calculer = () => {
    const result = calculerComparaison(biens, charges, tmi);
    setResults(result);
  };

  const reinitialiser = () => {
    setBiens([{ id: 1, nom: 'Bien locatif 1', loyerMensuel: '', chargesRecuperables: '' }]);
    setCharges({
      interetsEmprunt: '',
      travauxEntretien: '',
      travauxAmelioration: '',
      assurancePNO: '',
      taxeFonciere: '',
      fraisGestion: '',
      chargesCopropriete: ''
    });
    setTmi(30);
    setResults(null);
  };

  // ============================================
  // EXPORT PDF
  // ============================================

  const exporterPDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NotariaPrime - Revenus Fonciers', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Regime optimal', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Regime recommande : ${results.regimeOptimal === 'micro' ? 'Micro-Foncier' : 'Regime Reel'}`, 20, y);
    y += 7;
    doc.text(`Economie annuelle : ${results.economie.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`TMI applique : ${tmi} %`, 20, y);
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Micro-Foncier', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Revenus bruts : ${results.micro.revenusBruts.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Abattement (30%) : ${results.micro.deductions.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Revenu imposable : ${results.micro.revenuImposable.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Fiscalite totale : ${results.micro.totalFiscalite.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Revenu net apres impot : ${results.micro.revenuNetApresImpot.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Regime Reel', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Revenus bruts : ${results.reel.revenusBruts.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Charges deductibles : ${results.reel.deductions.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Revenu imposable : ${results.reel.revenuImposable.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Fiscalite totale : ${results.reel.totalFiscalite.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 7;
    doc.text(`Revenu net apres impot : ${results.reel.revenuNetApresImpot.toLocaleString('fr-FR')} EUR`, 20, y);
    y += 15;

    if (results.deficitFoncier) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Deficit Foncier', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Montant du deficit : ${results.deficitFoncier.montantDeficit.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Imputation sur revenu global : ${results.deficitFoncier.imputationRevenuGlobal.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 7;
      doc.text(`Report sur revenus fonciers : ${results.deficitFoncier.reportSurRevenusFonciers.toLocaleString('fr-FR')} EUR`, 20, y);
      y += 15;
    }

    // Disclaimer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'Avertissement : cette simulation est fournie a titre informatif et ne constitue pas un conseil fiscal. Consultez un professionnel avant toute decision.';
    const lines = doc.splitTextToSize(disclaimer, 170);
    lines.forEach((line: string) => { doc.text(line, 20, y); y += 5; });

    doc.save(`revenus-fonciers-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ============================================
  // DONNEES GRAPHIQUES
  // ============================================

  const donneesComparaison = useMemo(() => {
    if (!results) return [];
    return [
      {
        name: 'Revenus bruts',
        'Micro-Foncier': results.micro.revenusBruts,
        'Regime Reel': results.reel.revenusBruts
      },
      {
        name: 'Deductions',
        'Micro-Foncier': results.micro.deductions,
        'Regime Reel': results.reel.deductions
      },
      {
        name: 'Revenu imposable',
        'Micro-Foncier': results.micro.revenuImposable,
        'Regime Reel': results.reel.revenuImposable
      },
      {
        name: 'Fiscalite totale',
        'Micro-Foncier': results.micro.totalFiscalite,
        'Regime Reel': results.reel.totalFiscalite
      },
      {
        name: 'Net apres impot',
        'Micro-Foncier': results.micro.revenuNetApresImpot,
        'Regime Reel': results.reel.revenuNetApresImpot
      }
    ];
  }, [results]);

  const donneesCharges = useMemo(() => {
    if (!results) return [];
    const items = [
      { name: 'Interets emprunt', value: parseNumber(charges.interetsEmprunt) },
      { name: 'Travaux entretien', value: parseNumber(charges.travauxEntretien) },
      { name: 'Travaux amelioration', value: parseNumber(charges.travauxAmelioration) },
      { name: 'Assurance PNO', value: parseNumber(charges.assurancePNO) },
      { name: 'Taxe fonciere', value: parseNumber(charges.taxeFonciere) },
      { name: 'Frais gestion/gerance', value: parseNumber(charges.fraisGestion) },
      { name: 'Charges copropriete', value: parseNumber(charges.chargesCopropriete) },
      { name: 'Frais forfaitaires (20 euros/local)', value: biens.length * FRAIS_GESTION_FORFAITAIRES_PAR_LOCAL }
    ];
    return items.filter(item => item.value > 0);
  }, [results, charges, biens.length]);

  const donneesProjection = useMemo(() => {
    if (!results) return [];
    const data = [];
    const revenusBruts = results.micro.revenusBruts;

    for (let annee = 1; annee <= 10; annee++) {
      // Micro-Foncier : stable dans le temps
      const netMicro = results.micro.revenuNetApresImpot * annee;

      // Reel : on projette avec reduction progressive des interets d'emprunt
      const interetsBase = parseNumber(charges.interetsEmprunt);
      const reductionInterets = interetsBase > 0 ? interetsBase * (1 - (annee * 0.05)) : 0;
      const chargesSansInterets = results.reel.deductions - interetsBase;
      const chargesProjectees = chargesSansInterets + Math.max(0, reductionInterets);
      const revenuImposableProj = Math.max(0, revenusBruts - chargesProjectees);
      const fiscaliteProj = (revenuImposableProj * (tmi / 100)) + (revenuImposableProj * PRELEVEMENTS_SOCIAUX);
      const netReel = (revenusBruts - fiscaliteProj) * annee;

      // Ajout de l'economie du deficit foncier pour la premiere annee
      let netReelAjuste = netReel;
      if (results.deficitFoncier && annee === 1) {
        netReelAjuste += results.deficitFoncier.imputationRevenuGlobal * (tmi / 100);
      }

      data.push({
        annee: `Annee ${annee}`,
        'Micro-Foncier (cumule)': Math.round(netMicro),
        'Regime Reel (cumule)': Math.round(netReelAjuste > 0 ? netReelAjuste : netReel)
      });
    }
    return data;
  }, [results, charges, tmi, biens]);

  // ============================================
  // Verifications
  // ============================================

  const revenusBrutsTotal = useMemo(() => {
    return biens.reduce((total, bien) => total + parseNumber(bien.loyerMensuel) * 12, 0);
  }, [biens]);

  const eligibleMicroFoncier = revenusBrutsTotal <= PLAFOND_MICRO_FONCIER && revenusBrutsTotal > 0;

  // ============================================
  // RENDER
  // ============================================

  return (
    <MainLayout showFeedback={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* ============================================ */}
          {/* HEADER */}
          {/* ============================================ */}

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Simulateur Revenus Fonciers
                  </h1>
                  <p className="text-gray-600 font-medium mt-1">
                    Micro-Foncier vs Regime Reel - Fiscalite 2025/2026
                  </p>
                </div>
              </div>

              {results && (
                <div className="text-right">
                  <div className={`rounded-xl p-4 border-2 ${
                    results.regimeOptimal === 'micro'
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                      : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                  }`}>
                    <p className="text-sm font-semibold text-indigo-700">Regime optimal</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {results.regimeOptimal === 'micro' ? 'Micro-Foncier' : 'Regime Reel'}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Economie : {formatEuros(results.economie)} / an
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* INTRODUCTION */}
          {/* ============================================ */}

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div className="space-y-2 text-sm text-indigo-900">
                <p className="font-semibold text-base">Comparez les deux regimes fiscaux pour vos revenus locatifs</p>
                <p>
                  En tant que proprietaire bailleur en location nue, vous etes soumis a l&apos;impot sur le revenu dans
                  la categorie des revenus fonciers. Deux regimes s&apos;offrent a vous : le <strong>micro-foncier</strong> (abattement
                  forfaitaire de 30%) ou le <strong>regime reel</strong> (deduction des charges effectives). Ce simulateur
                  vous aide a determiner le regime le plus avantageux pour votre situation.
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* FORMULAIRE */}
          {/* ============================================ */}

          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* Colonne gauche : Biens locatifs */}
            <div className="lg:col-span-2 space-y-6">

              {/* Biens locatifs */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                    Biens locatifs
                  </h2>
                  <button
                    onClick={ajouterBien}
                    disabled={biens.length >= 10}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un bien
                  </button>
                </div>

                <div className="space-y-4">
                  {biens.map((bien, index) => (
                    <div key={bien.id} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Home className="w-4 h-4 text-white" />
                          </div>
                          <input
                            type="text"
                            value={bien.nom}
                            onChange={(e) => modifierBien(bien.id, 'nom', e.target.value)}
                            className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                            placeholder="Nom du bien"
                          />
                        </div>
                        {biens.length > 1 && (
                          <button
                            onClick={() => supprimerBien(bien.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer ce bien"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loyer mensuel brut
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={bien.loyerMensuel}
                              onChange={(e) => modifierBien(bien.id, 'loyerMensuel', e.target.value)}
                              placeholder="800"
                              className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-right font-medium"
                            />
                            <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Charges recuperables / mois
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={bien.chargesRecuperables}
                              onChange={(e) => modifierBien(bien.id, 'chargesRecuperables', e.target.value)}
                              placeholder="50"
                              className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-right font-medium"
                            />
                            <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Revenu brut annuel : <span className="font-semibold text-indigo-600">{formatEuros(parseNumber(bien.loyerMensuel) * 12)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resume revenus bruts */}
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-900">Total revenus bruts annuels</span>
                    <span className="text-xl font-bold text-indigo-700">{formatEuros(revenusBrutsTotal)}</span>
                  </div>
                  {revenusBrutsTotal > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      {eligibleMicroFoncier ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">Eligible au micro-foncier (revenus &le; 15 000 euros)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-amber-700 font-medium">Regime reel obligatoire (revenus &gt; 15 000 euros)</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Charges reelles */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Calculator className="w-6 h-6 text-purple-600" />
                  Charges deductibles (Regime Reel)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interets d&apos;emprunt annuels
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={charges.interetsEmprunt}
                        onChange={(e) => modifierCharge('interetsEmprunt', e.target.value)}
                        placeholder="3 000"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-right font-medium"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Travaux d&apos;entretien / reparation
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={charges.travauxEntretien}
                        onChange={(e) => modifierCharge('travauxEntretien', e.target.value)}
                        placeholder="2 000"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-right font-medium"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Travaux d&apos;amelioration
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={charges.travauxAmelioration}
                        onChange={(e) => modifierCharge('travauxAmelioration', e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-right font-medium"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assurance PNO
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={charges.assurancePNO}
                        onChange={(e) => modifierCharge('assurancePNO', e.target.value)}
                        placeholder="200"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-right font-medium"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taxe fonciere (hors OM)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={charges.taxeFonciere}
                        onChange={(e) => modifierCharge('taxeFonciere', e.target.value)}
                        placeholder="1 200"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-right font-medium"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frais de gestion / gerance
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={charges.fraisGestion}
                        onChange={(e) => modifierCharge('fraisGestion', e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-right font-medium"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Charges de copropriete non recuperables
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={charges.chargesCopropriete}
                        onChange={(e) => modifierCharge('chargesCopropriete', e.target.value)}
                        placeholder="500"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-right font-medium"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700">
                    <Info className="w-3.5 h-3.5 inline mr-1" />
                    Les frais de gestion forfaitaires de 20 euros par local ({biens.length} {biens.length > 1 ? 'locaux' : 'local'} = {formatEuros(biens.length * FRAIS_GESTION_FORFAITAIRES_PAR_LOCAL)}) sont automatiquement ajoutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite : TMI + Actions */}
            <div className="space-y-6">

              {/* Tranche marginale */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Percent className="w-6 h-6 text-indigo-600" />
                  Tranche marginale (TMI)
                </h2>
                <select
                  value={tmi}
                  onChange={(e) => setTmi(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-semibold text-lg"
                >
                  {TMI_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-3 text-xs text-gray-500">
                  Votre tranche marginale d&apos;imposition determine le taux auquel vos revenus fonciers seront imposes.
                  Consultez votre dernier avis d&apos;imposition pour connaitre votre TMI.
                </p>

                {/* Bareme IR rappel */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Bareme IR 2025 :</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>0 - 11 294 euros</span>
                      <span className="font-semibold">0 %</span>
                    </div>
                    <div className="flex justify-between">
                      <span>11 294 - 28 797 euros</span>
                      <span className="font-semibold">11 %</span>
                    </div>
                    <div className="flex justify-between">
                      <span>28 797 - 82 341 euros</span>
                      <span className="font-semibold">30 %</span>
                    </div>
                    <div className="flex justify-between">
                      <span>82 341 - 177 106 euros</span>
                      <span className="font-semibold">41 %</span>
                    </div>
                    <div className="flex justify-between">
                      <span>&gt; 177 106 euros</span>
                      <span className="font-semibold">45 %</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prelevements sociaux */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Landmark className="w-5 h-5 text-purple-600" />
                  Prelevements sociaux
                </h2>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                  <p className="text-3xl font-bold text-purple-700">17,2 %</p>
                  <p className="text-xs text-purple-600 mt-1">Taux global 2025</p>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between"><span>CSG</span><span>9,2 %</span></div>
                  <div className="flex justify-between"><span>CRDS</span><span>0,5 %</span></div>
                  <div className="flex justify-between"><span>Prelevement de solidarite</span><span>7,5 %</span></div>
                </div>
              </div>

              {/* Boutons */}
              <div className="space-y-3">
                <button
                  onClick={calculer}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  <Calculator className="w-5 h-5 inline mr-2" />
                  Comparer les regimes
                </button>
                <button
                  onClick={reinitialiser}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold border-2 border-gray-300"
                >
                  Reinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* RESULTATS */}
          {/* ============================================ */}

          {results && (
            <div className="space-y-8">

              {/* Comparaison cote a cote */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Micro-Foncier */}
                <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 ${
                  results.regimeOptimal === 'micro' ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'
                }`}>
                  {results.regimeOptimal === 'micro' && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-green-100 text-green-800 rounded-full w-fit text-sm font-bold">
                      <CheckCircle className="w-4 h-4" />
                      Regime le plus avantageux
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    Micro-Foncier
                  </h3>

                  {!eligibleMicroFoncier && revenusBrutsTotal > 0 && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-300">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 font-medium">
                          Revenus bruts superieurs a 15 000 euros : le micro-foncier n&apos;est pas applicable.
                          Ce calcul est presente a titre indicatif.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Revenus bruts</span>
                      <span className="font-semibold text-gray-900">{formatEuros(results.micro.revenusBruts)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Abattement (30 %)</span>
                      <span className="font-semibold text-blue-600">- {formatEuros(results.micro.deductions)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-blue-50 -mx-2 px-2 rounded-lg">
                      <span className="font-semibold text-gray-900">Revenu imposable</span>
                      <span className="font-bold text-gray-900">{formatEuros(results.micro.revenuImposable)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Impot sur le revenu ({tmi} %)</span>
                      <span className="font-semibold text-red-600">- {formatEuros(results.micro.impotRevenu)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Prelevements sociaux (17,2 %)</span>
                      <span className="font-semibold text-red-600">- {formatEuros(results.micro.prelevementsSociaux)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-900">Total fiscalite</span>
                      <span className="font-bold text-red-700">{formatEuros(results.micro.totalFiscalite)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-2 px-4 rounded-xl border-2 border-blue-200">
                      <span className="font-bold text-gray-900">Revenu net apres impot</span>
                      <span className="text-2xl font-bold text-blue-700">{formatEuros(results.micro.revenuNetApresImpot)}</span>
                    </div>
                  </div>
                </div>

                {/* Regime Reel */}
                <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 ${
                  results.regimeOptimal === 'reel' ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'
                }`}>
                  {results.regimeOptimal === 'reel' && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-green-100 text-green-800 rounded-full w-fit text-sm font-bold">
                      <CheckCircle className="w-4 h-4" />
                      Regime le plus avantageux
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-white" />
                    </div>
                    Regime Reel
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Revenus bruts</span>
                      <span className="font-semibold text-gray-900">{formatEuros(results.reel.revenusBruts)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Charges deduites</span>
                      <span className="font-semibold text-purple-600">- {formatEuros(results.reel.deductions)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-purple-50 -mx-2 px-2 rounded-lg">
                      <span className="font-semibold text-gray-900">Revenu imposable</span>
                      <span className="font-bold text-gray-900">
                        {results.deficitFoncier ? formatEuros(0) : formatEuros(results.reel.revenuImposable)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Impot sur le revenu ({tmi} %)</span>
                      <span className="font-semibold text-red-600">- {formatEuros(results.reel.impotRevenu)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Prelevements sociaux (17,2 %)</span>
                      <span className="font-semibold text-red-600">- {formatEuros(results.reel.prelevementsSociaux)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-900">Total fiscalite</span>
                      <span className="font-bold text-red-700">{formatEuros(results.reel.totalFiscalite)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-gradient-to-r from-purple-50 to-indigo-50 -mx-2 px-4 rounded-xl border-2 border-purple-200">
                      <span className="font-bold text-gray-900">Revenu net apres impot</span>
                      <span className="text-2xl font-bold text-purple-700">{formatEuros(results.reel.revenuNetApresImpot)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synthese */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Regime recommande</p>
                      <p className="text-3xl font-bold">
                        {results.regimeOptimal === 'micro' ? 'Micro-Foncier' : 'Regime Reel'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-white/70 text-xs font-medium">Economie annuelle</p>
                      <p className="text-2xl font-bold">{formatEuros(results.economie)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-xs font-medium">Taux effectif</p>
                      <p className="text-2xl font-bold">
                        {results.regimeOptimal === 'micro'
                          ? `${((results.micro.totalFiscalite / Math.max(1, results.micro.revenusBruts)) * 100).toFixed(1)} %`
                          : `${((results.reel.totalFiscalite / Math.max(1, results.reel.revenusBruts)) * 100).toFixed(1)} %`
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-xs font-medium">Pression fiscale IR+PS</p>
                      <p className="text-2xl font-bold">{tmi + 17.2} %</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={exporterPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Exporter en PDF
                  </button>
                </div>
              </div>

              {/* ============================================ */}
              {/* DEFICIT FONCIER */}
              {/* ============================================ */}

              {results.deficitFoncier && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-green-300 p-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    Deficit foncier
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <p className="text-sm text-green-700 font-medium">Montant du deficit</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatEuros(results.deficitFoncier.montantDeficit)}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">Imputable sur revenu global</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {formatEuros(results.deficitFoncier.imputationRevenuGlobal)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Maximum : {formatEuros(PLAFOND_DEFICIT_REVENU_GLOBAL)} / an</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                      <p className="text-sm text-amber-700 font-medium">Report sur revenus fonciers</p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">
                        {formatEuros(results.deficitFoncier.reportSurRevenusFonciers)}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">Reportable pendant 10 ans</p>
                    </div>
                  </div>

                  {results.deficitFoncier.imputationRevenuGlobal > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-semibold">Economie d&apos;impot grace au deficit foncier</p>
                          <p className="mt-1">
                            L&apos;imputation de {formatEuros(results.deficitFoncier.imputationRevenuGlobal)} sur votre revenu global
                            vous permet une economie d&apos;impot estimee a{' '}
                            <span className="font-bold">
                              {formatEuros(results.deficitFoncier.imputationRevenuGlobal * (tmi / 100))}
                            </span>{' '}
                            (TMI a {tmi} %) + {formatEuros(results.deficitFoncier.imputationRevenuGlobal * PRELEVEMENTS_SOCIAUX)} de
                            prelevements sociaux.
                          </p>
                          <p className="mt-2 text-xs text-green-700">
                            Attention : l&apos;imputation du deficit foncier sur le revenu global impose le maintien en location du bien pendant 3 ans apres l&apos;imputation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================ */}
              {/* GRAPHIQUES */}
              {/* ============================================ */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Bar Chart comparaison */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    Comparaison Micro vs Reel
                  </h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={donneesComparaison} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={isDesktop ? 0 : -30}
                        textAnchor={isDesktop ? 'middle' : 'end'}
                        height={isDesktop ? 40 : 80}
                        style={{ fontSize: '11px' }}
                      />
                      <YAxis tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatEuros(value)} />
                      <Legend />
                      <Bar dataKey="Micro-Foncier" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Regime Reel" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart charges */}
                {donneesCharges.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <PieChartIcon className="w-6 h-6 text-purple-600" />
                      Repartition des charges (Reel)
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={donneesCharges}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {donneesCharges.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatEuros(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Line Chart projection 10 ans */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  Projection cumulative sur 10 ans
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Estimation du revenu net cumule sur 10 ans pour chaque regime, avec reduction progressive des interets d&apos;emprunt en regime reel.
                </p>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={donneesProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="annee" style={{ fontSize: '12px' }} />
                    <YAxis tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatEuros(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Micro-Foncier (cumule)"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Regime Reel (cumule)"
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={{ fill: '#a855f7', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Detail charges reel */}
              {donneesCharges.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-purple-600" />
                    Detail des charges deductibles (Regime Reel)
                  </h3>
                  <div className="space-y-2">
                    {donneesCharges.map((charge, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS_CHART[index % COLORS_CHART.length] }}
                          />
                          <span className="text-gray-700 font-medium">{charge.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-900">{formatEuros(charge.value)}</span>
                          <span className="text-xs text-gray-500 w-12 text-right">
                            {results.reel.deductions > 0
                              ? `${((charge.value / results.reel.deductions) * 100).toFixed(1)} %`
                              : '0 %'}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 mt-3">
                      <span className="font-bold text-gray-900">Total des charges</span>
                      <span className="font-bold text-purple-700 text-lg">{formatEuros(results.reel.deductions)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* FAQ */}
          {/* ============================================ */}

          <div className="mt-12">
            <FAQSection />
          </div>

          {/* ============================================ */}
          {/* DISCLAIMER */}
          {/* ============================================ */}

          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="space-y-2 text-sm text-amber-900">
                <p className="font-semibold text-lg">Avertissement legal</p>
                <p>
                  Ce simulateur est fourni a titre informatif uniquement et ne constitue pas un conseil fiscal.
                  Les resultats sont des estimations basees sur les informations fournies et la legislation fiscale
                  en vigueur pour les revenus fonciers 2025/2026.
                </p>
                <p>
                  La fiscalite des revenus fonciers comporte de nombreuses subtilites (regimes speciaux, dispositifs
                  de defiscalisation, cas de demembrement, SCI, SCPI, etc.) qui ne sont pas toutes prises en compte
                  dans ce simulateur simplifie.
                </p>
                <p className="font-semibold">
                  Pour une analyse personnalisee de votre situation fiscale, consultez un expert-comptable,
                  un notaire ou un conseiller en gestion de patrimoine.
                </p>
                <div className="bg-amber-100 rounded-lg p-3 mt-4 border border-amber-400">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Sources officielles :</strong> Code General des Impots (CGI art. 14 a 33 quinquies),
                    Bulletin Officiel des Finances Publiques (BOFiP - BOI-RFPI), Service-Public.fr,
                    Legifrance.gouv.fr, Impots.gouv.fr
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
