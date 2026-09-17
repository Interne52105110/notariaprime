"use client";

import { plusDeCinqAns, anneesRevolues, abattementsPlusValue, surtaxePlusValue } from '@/lib/fiscal';
import { basesPlusValue, abattementExceptionnelPV } from '@/lib/plusvalue';
import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { Calculator, TrendingUp, Euro, Calendar, FileText, Download, AlertCircle, Info, CheckCircle, Clock, ArrowRight, Gift, Users, Lightbulb, BarChart3, Target, PieChart, } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface FormData {
  prixAcquisitionDroit?:string; prixVenteDroit?:string; natureImmeuble?:string;
  tauxExceptionnel?:string; datePromesse?:string; affiliationEurope?:boolean;
  modeAcquisition: 'achat' | 'donation' | 'succession' | 'echange';
  typeBien: 'principal' | 'secondaire' | 'locatif' | 'sci';
  estDemembre: boolean;
  typeDroit: 'pleine' | 'usufruit' | 'nue';
  ageUsufruitier: string;
  pourcentageDetention: string;
  nombreCoproprietaires: string;
  prixAcquisition: string;
  dateAcquisition: string;
  valeurVenale: string;
  fraisAcquisition: 'forfait' | 'reel';
  fraisAcquisitionMontant: string;
  prixVente: string;
  dateVente: string;
  fraisVente: string;
  travaux: 'aucun' | 'forfait' | 'reel';
  travauxMontant: string;
  premiereVente: boolean;
  remploiResidencePrincipale: string;
  retraite: boolean;
  retraiteConditions?: boolean;
  revenuFiscal: string;
  expropriation: boolean;
  zoneTendue: boolean;
  ehpad: boolean;
  ehpadConditions: boolean;
  nonResident: boolean;
  nonResidentConditions: boolean;
  dejaBeneficieExoRPNonResident: boolean;
  nombreCedants: string;
}

interface Results {
  plusValueBrute: number;
  prixAcquisitionCorrige: number;
  prixVenteCorrige: number;
  dureeDetention: number;
  dureeDetentionJours: number;
  abattementIR: number;
  abattementPS: number;
  plusValueIR: number;
  plusValuePS: number;
  impotRevenu: number;
  prelevementsSociaux: number;
  taxeAdditionnelle: number;
  totalFiscalite: number;
  exoneration: boolean;
  motifExoneration: string;
  notesExoneration: string[];
  suggestions: string[];
  economieAbattements: number;
  valeurDemembrement?: { usufruit: number; nue: number; };
}

interface Scenario {
  nom: string;
  dateVente: string;
  travaux?: number;
  results: Results;
}

// Composant FAQ pour la page Plus-Value


function PlusValueContent() {
  const [formData, setFormData] = useState<FormData>({
    modeAcquisition: 'achat',
    typeBien: 'secondaire',
    estDemembre: false,
    typeDroit: 'pleine',
    ageUsufruitier: '',
    pourcentageDetention: '100',
    nombreCoproprietaires: '1',
    prixAcquisition: '',
    dateAcquisition: '',
    valeurVenale: '',
    fraisAcquisition: 'forfait',
    fraisAcquisitionMontant: '',
    prixVente: '',
    dateVente: '',
    fraisVente: '',
    travaux: 'aucun',
    travauxMontant: '',
    premiereVente: false,
    remploiResidencePrincipale: '',
    retraite: false,
    revenuFiscal: '',
    expropriation: false,
    zoneTendue: false,
    ehpad: false,
    ehpadConditions: false,
    nonResident: false,
    nonResidentConditions: false,
    dejaBeneficieExoRPNonResident: false,
    nombreCedants: '1'
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      dateVente: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const [results, setResults] = useState<Results | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  useEffect(()=>{setResults(null);setScenarios([]);setShowComparison(false);},[formData]);

  const calculerDureeDetention = (dateDebut: string, dateFin: string) => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffMs = fin.getTime() - debut.getTime();
    const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const annees = anneesRevolues(dateDebut, dateFin);
    return { annees, jours };
  };

  const calculerAbattementIR = (duree: number) => abattementsPlusValue(duree).ir;

  const calculerAbattementPS = (duree: number) => abattementsPlusValue(duree).ps;

  const calculerValeurUsufruit = (age: number) => {
    if (age < 21) return 90;
    if (age < 31) return 80;
    if (age < 41) return 70;
    if (age < 51) return 60;
    if (age < 61) return 50;
    if (age < 71) return 40;
    if (age < 81) return 30;
    if (age < 91) return 20;
    return 10;
  };

  const calculerTaxeAdditionnelle = surtaxePlusValue;

  const genererSuggestions = (data: FormData, res: Results) => {
    const suggestions: string[] = [];
    const duree = res.dureeDetention;

    if (duree < 6) {
      suggestions.push("⏰ Attendre 6 ans de détention vous permettrait de bénéficier des premiers abattements (6% par an pour l'IR).");
    } else if (duree < 22) {
      const anneesRestantes = 22 - duree;
      suggestions.push(`⏰ Dans ${anneesRestantes.toFixed(1)} ans, vous serez totalement exonéré d'impôt sur le revenu.`);
    } else if (duree < 30) {
      const anneesRestantes = 30 - duree;
      suggestions.push(`⏰ Dans ${anneesRestantes.toFixed(1)} ans, vous serez totalement exonéré de prélèvements sociaux.`);
    }

    if (data.travaux === 'aucun' && (data.natureImmeuble??'bati')==='bati' && plusDeCinqAns(data.dateAcquisition,data.dateVente)) {
      const prixAcq = (data.estDemembre&&data.typeDroit!=='pleine'?Number(data.prixAcquisitionDroit??0):Number((data.modeAcquisition==='achat'?data.prixAcquisition:data.valeurVenale).replace(/\s/g,''))*(data.typeBien==='sci'?1:Number(data.pourcentageDetention)/100))||0;
      const travauxForfait = prixAcq * 0.15;
      suggestions.push(`🔨 Le forfait travaux de 15% (${travauxForfait.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €) réduirait votre plus-value sans justificatif.`);
    }

    if (data.typeBien === 'locatif' && data.travaux === 'reel') {
      suggestions.push("⚠️ Bien locatif: si vous déclarez des travaux réels, vérifiez qu'ils n'ont PAS été déduits de vos revenus fonciers. Sinon, préférez le forfait 15%.");
    }



    if (data.typeBien === 'locatif') {
      suggestions.push("🏢 Une SCI familiale peut offrir des avantages de gestion patrimoniale.");
    }

    if (data.fraisAcquisition === 'forfait' && data.modeAcquisition === 'achat') {
      const prixAcq = (data.estDemembre&&data.typeDroit!=='pleine'?Number(data.prixAcquisitionDroit??0):Number((data.modeAcquisition==='achat'?data.prixAcquisition:data.valeurVenale).replace(/\s/g,''))*(data.typeBien==='sci'?1:Number(data.pourcentageDetention)/100))||0;
      const fraisForfait = prixAcq * 0.075;
      suggestions.push(`📋 Si vos frais réels dépassent ${fraisForfait.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €, optez pour les frais réels.`);
    }

    if (data.typeBien === 'secondaire') {
      suggestions.push("🏠 L’exonération de résidence principale exige une occupation habituelle et effective ; un changement de domiciliation de pure forme ne suffit pas.");
    }

    return suggestions;
  };

  const calculerPlusValue = (dateVenteCustom?: string, travauxCustom?: number): Results | null => {
    const dateVenteUtilisee = dateVenteCustom || formData.dateVente;

    if (!formData.dateAcquisition || !formData.prixVente) {
      return null;
    }

    const nombre=(v:string|undefined)=>Number((v??'').replace(/\s/g,'').replace(',','.'));
    const prixVenteBrut=nombre(formData.prixVente);
    const quote=formData.typeBien==='sci'?1:nombre(formData.pourcentageDetention)/100;
    const droitDemembre=formData.estDemembre&&formData.typeDroit!=='pleine';
    const sci=formData.typeBien==='sci';
    const nature=formData.natureImmeuble??'bati';
    const dureeDet=calculerDureeDetention(formData.dateAcquisition,dateVenteUtilisee);
    if(!Number.isFinite(dureeDet.annees)||!Number.isFinite(prixVenteBrut)||prixVenteBrut<=0||!Number.isFinite(quote)||quote<=0||quote>1)return null;
    if(sci&&(droitDemembre||formData.ehpad||formData.retraite||formData.nonResident||formData.premiereVente))return null;
    if((formData.typeBien==='principal'||formData.ehpad)&&nature!=='bati')return null;

    if (formData.typeBien === 'principal') {
      return {
        plusValueBrute: 0,
        prixAcquisitionCorrige: 0,
        prixVenteCorrige: droitDemembre?nombre(formData.prixVenteDroit):prixVenteBrut*quote,
        dureeDetention: 0,
        dureeDetentionJours: 0,
        abattementIR: 100,
        abattementPS: 100,
        plusValueIR: 0,
        plusValuePS: 0,
        impotRevenu: 0,
        prelevementsSociaux: 0,
        taxeAdditionnelle: 0,
        totalFiscalite: 0,
        exoneration: true,
        motifExoneration: 'Résidence principale - Exonération totale (Art. 150 U II 1° CGI)',
        notesExoneration: [],
        suggestions: [],
        economieAbattements: 0
      };
    }

    if (formData.ehpad && formData.ehpadConditions) {
      return {
        plusValueBrute: 0,
        prixAcquisitionCorrige: 0,
        prixVenteCorrige: droitDemembre?nombre(formData.prixVenteDroit):prixVenteBrut*quote,
        dureeDetention: 0,
        dureeDetentionJours: 0,
        abattementIR: 100,
        abattementPS: 100,
        plusValueIR: 0,
        plusValuePS: 0,
        impotRevenu: 0,
        prelevementsSociaux: 0,
        taxeAdditionnelle: 0,
        totalFiscalite: 0,
        exoneration: true,
        motifExoneration: 'Cession par une personne âgée ou handicapée résidant en établissement médicalisé (Art. 150 U II 1° ter CGI)',
        notesExoneration: [],
        suggestions: [],
        economieAbattements: 0
      };
    }

    if (formData.retraite && formData.revenuFiscal) {
      const rfr = parseFloat(formData.revenuFiscal.replace(/\s/g, ''));
      if (Number.isFinite(rfr) && formData.retraiteConditions) {
        return {
          plusValueBrute: 0,
          prixAcquisitionCorrige: 0,
          prixVenteCorrige: droitDemembre?nombre(formData.prixVenteDroit):prixVenteBrut*quote,
          dureeDetention: 0,
          dureeDetentionJours: 0,
          abattementIR: 100,
          abattementPS: 100,
          plusValueIR: 0,
          plusValuePS: 0,
          impotRevenu: 0,
          prelevementsSociaux: 0,
          taxeAdditionnelle: 0,
          totalFiscalite: 0,
          exoneration: true,
          motifExoneration: 'Retraité : conditions de RFR et de non-assujettissement à l’IFI en N-2 confirmées (Art. 150 U III CGI)',
          notesExoneration: [],
          suggestions: [],
          economieAbattements: 0
        };
      }
    }

    if (formData.expropriation) {
      return {
        plusValueBrute: 0,
        prixAcquisitionCorrige: 0,
        prixVenteCorrige: droitDemembre?nombre(formData.prixVenteDroit):prixVenteBrut*quote,
        dureeDetention: 0,
        dureeDetentionJours: 0,
        abattementIR: 100,
        abattementPS: 100,
        plusValueIR: 0,
        plusValuePS: 0,
        impotRevenu: 0,
        prelevementsSociaux: 0,
        taxeAdditionnelle: 0,
        totalFiscalite: 0,
        exoneration: true,
        motifExoneration: 'Expropriation avec réemploi sous 12 mois (Art. 150 U II 4° CGI)',
        notesExoneration: [],
        suggestions: [],
        economieAbattements: 0
      };
    }

    if (prixVenteBrut * quote <= 15000) {
      return {
        plusValueBrute: 0,
        prixAcquisitionCorrige: 0,
        prixVenteCorrige: prixVenteBrut*quote,
        dureeDetention: 0,
        dureeDetentionJours: 0,
        abattementIR: 100,
        abattementPS: 100,
        plusValueIR: 0,
        plusValuePS: 0,
        impotRevenu: 0,
        prelevementsSociaux: 0,
        taxeAdditionnelle: 0,
        totalFiscalite: 0,
        exoneration: true,
        motifExoneration: 'Valeur en pleine propriété de la quote-part cédée ≤ 15 000 € (Art. 150 U II 6° CGI)',
        notesExoneration: [],
        suggestions: [],
        economieAbattements: 0
      };
    }

    const onereux=formData.modeAcquisition==='achat'||formData.modeAcquisition==='echange';
    const acquisition=nombre(formData.modeAcquisition==='achat'?formData.prixAcquisition:formData.valeurVenale);
    if((!droitDemembre&&acquisition<=0)||droitDemembre&&(!formData.prixAcquisitionDroit?.trim()||!formData.prixVenteDroit?.trim()))return null;
    const duree=dureeDet.annees;
    const forfaitTravaux=(formData.travaux==='forfait'||travauxCustom!==undefined)&&nature==='bati'&&plusDeCinqAns(formData.dateAcquisition,dateVenteUtilisee);
    let bases;
    try { bases=basesPlusValue({acquisition,vente:prixVenteBrut,quotePart:quote*100,sci,demembre:droitDemembre,acquisitionDroit:droitDemembre?nombre(formData.prixAcquisitionDroit):undefined,venteDroit:droitDemembre?nombre(formData.prixVenteDroit):undefined,fraisAcquisition:formData.fraisAcquisition==='reel'?nombre(formData.fraisAcquisitionMontant):0,fraisVente:nombre(formData.fraisVente),travaux:formData.travaux==='reel'?nombre(formData.travauxMontant):0,forfaitAcquisition:formData.fraisAcquisition==='forfait'&&onereux,forfaitTravaux}); } catch { return null; }
    const prixAcquisitionCorrige=bases.acquisitionCorrigee;
    const prixVenteCorrige=bases.venteCorrigee;

    const plusValueBrute = Math.max(0, prixVenteCorrige - prixAcquisitionCorrige);

    let abattementIR = calculerAbattementIR(duree);
    let abattementPS = calculerAbattementPS(duree);

    const exceptionnel=abattementExceptionnelPV(formData.zoneTendue,nombre(formData.tauxExceptionnel),formData.datePromesse??'',dateVenteUtilisee);
    abattementIR=100-(100-abattementIR)*(1-exceptionnel/100);
    abattementPS=100-(100-abattementPS)*(1-exceptionnel/100);

    // Plus-values nettes imposables (après abattement pour durée de détention)
    let plusValueIR = plusValueBrute * (1 - abattementIR / 100);
    let plusValuePS = plusValueBrute * (1 - abattementPS / 100);

    const notesExoneration: string[] = [];
    if(duree>=30)notesExoneration.push('Exonération totale par la durée de détention de trente ans.');
    if(formData.zoneTendue)notesExoneration.push(exceptionnel?`Abattement exceptionnel ${exceptionnel} % : conditions déclarées et dates compatibles.`:"Abattement exceptionnel non appliqué : taux ou dates non admissibles/non renseignés.");

    // Art. 150 U II 1° bis - Première cession d'un logement autre que la RP,
    // exonération de la fraction de plus-value correspondant au prix remployé
    // dans l'acquisition/construction d'une résidence principale sous 24 mois.
    if (formData.premiereVente && !droitDemembre && nature==='bati' && (formData.typeBien === 'secondaire' || formData.typeBien === 'locatif')) {
      const remploi = parseFloat(formData.remploiResidencePrincipale.replace(/\s/g, '')) || 0;
      // Aucun remploi présumé : le montant affecté doit être renseigné.
      const proportionRemployee = prixVenteCorrige > 0 && remploi > 0
        ? Math.min(1, remploi / prixVenteCorrige)
        : 0;
      if (proportionRemployee > 0) {
        plusValueIR = plusValueIR * (1 - proportionRemployee);
        plusValuePS = plusValuePS * (1 - proportionRemployee);
        notesExoneration.push(
          `Première cession d'un logement (Art. 150 U II 1° bis CGI) : exonération de ${(proportionRemployee * 100).toFixed(0)} % de la plus-value au titre du remploi dans une résidence principale sous 24 mois.`
        );
      }
    }

    // Art. 150 U II 2° - Cession d'un logement en France par un non-résident UE/EEE,
    // exonération dans la limite de 150 000 € de plus-value nette imposable PAR CÉDANT.

    const nonResidentEligible =
      formData.nonResident &&
      formData.nonResidentConditions &&
      !formData.dejaBeneficieExoRPNonResident;
    if (nonResidentEligible) {
      const plafond = 150000;
      plusValueIR = Math.max(0, plusValueIR - plafond);
      plusValuePS = Math.max(0, plusValuePS - plafond);
      notesExoneration.push(
        `Cession par un non-résident (Art. 150 U II 2° CGI) : plafond de 150 000 € appliqué à la seule quote-part de ce cédant.`
      );
    } else if (formData.nonResident) {
      notesExoneration.push(
        formData.dejaBeneficieExoRPNonResident
          ? "⚠️ Exonération non-résident écartée : le cédant a déjà bénéficié de l'exonération de sa résidence principale en tant que non-résident (Art. 244 bis A II-1° CGI)."
          : "⚠️ Exonération non-résident non appliquée : confirmez la domiciliation fiscale en France ≥ 2 ans et la condition de délai (cession ≤ 10e année après le départ, ou libre disposition depuis le 1er janvier de l'année précédente)."
      );
    }

    const impotRevenu = plusValueIR * 0.19;
    const tauxPS=formData.affiliationEurope&&!sci?0.075:0.172;
    const prelevementsSociaux = plusValuePS * tauxPS;
    const taxeAdditionnelle = nature==='tab'?0:calculerTaxeAdditionnelle(plusValueIR);

    const totalFiscalite = impotRevenu + prelevementsSociaux + taxeAdditionnelle;

    const fiscaliteSansAbattement = plusValueBrute * (.19+tauxPS) + (nature==='tab'?0:calculerTaxeAdditionnelle(plusValueBrute));
    const economieAbattements = fiscaliteSansAbattement - totalFiscalite;

    const resultats: Results = {
      plusValueBrute,
      prixAcquisitionCorrige,
      prixVenteCorrige,
      dureeDetention: duree,
      dureeDetentionJours: dureeDet.jours,
      abattementIR,
      abattementPS,
      plusValueIR,
      plusValuePS,
      impotRevenu,
      prelevementsSociaux,
      taxeAdditionnelle,
      totalFiscalite,
      exoneration: notesExoneration.length > 0 && totalFiscalite === 0,
      motifExoneration: (notesExoneration.length > 0 && totalFiscalite === 0)
        ? notesExoneration.join(' ')
        : '',
      notesExoneration,
      suggestions: [],
      economieAbattements
    };

    resultats.suggestions = genererSuggestions(formData, resultats);

    if (formData.estDemembre && formData.ageUsufruitier) {
      const age = parseInt(formData.ageUsufruitier);
      const valeurUsufruitPct = calculerValeurUsufruit(age);
      resultats.valeurDemembrement = {
        usufruit: valeurUsufruitPct,
        nue: 100 - valeurUsufruitPct
      };
    }

    return resultats;
  };

  const handleCalculer = () => {
    const res = calculerPlusValue();
    if (res) {
      setResults(res);
      genererScenarios();
    } else {
      alert('Vérifiez les dates, montants et quote-part. Les droits démembrés nécessitent leurs prix propres. Pour une SCI, les exonérations personnelles et droits démembrés ne sont pas traités dans ce scénario global.');
    }
  };

  const genererScenarios = () => {
    const scenariosGeneres: Scenario[] = [];
    const dateAcq = new Date(formData.dateAcquisition);
    const today = new Date();

    const res1 = calculerPlusValue(today.toISOString().split('T')[0]);
    if (res1) {
      scenariosGeneres.push({
        nom: 'Vente immédiate',
        dateVente: today.toISOString().split('T')[0],
        results: res1
      });
    }

    const date22ans = new Date(dateAcq);
    date22ans.setFullYear(date22ans.getFullYear() + 22);
    if (date22ans > today) {
      const res2 = calculerPlusValue(date22ans.toISOString().split('T')[0]);
      if (res2) {
        scenariosGeneres.push({
          nom: 'Exonération IR (22 ans)',
          dateVente: date22ans.toISOString().split('T')[0],
          results: res2
        });
      }
    }

    const date30ans = new Date(dateAcq);
    date30ans.setFullYear(date30ans.getFullYear() + 30);
    if (date30ans > today) {
      const res3 = calculerPlusValue(date30ans.toISOString().split('T')[0]);
      if (res3) {
        scenariosGeneres.push({
          nom: 'Exonération totale (30 ans)',
          dateVente: date30ans.toISOString().split('T')[0],
          results: res3
        });
      }
    }

    if (formData.travaux === 'aucun' && (formData.natureImmeuble??'bati')==='bati' && plusDeCinqAns(formData.dateAcquisition,formData.dateVente)) {
      const prixAcq=(formData.estDemembre&&formData.typeDroit!=='pleine'?Number(formData.prixAcquisitionDroit??0):Number((formData.modeAcquisition==='achat'?formData.prixAcquisition:formData.valeurVenale).replace(/\s/g,''))*(formData.typeBien==='sci'?1:Number(formData.pourcentageDetention)/100))||0;
      const travauxForfait = prixAcq * 0.15;
      const res4 = calculerPlusValue(undefined, travauxForfait);
      if (res4) {
        scenariosGeneres.push({
          nom: 'Avec forfait travaux 15%',
          dateVente: formData.dateVente,
          travaux: travauxForfait,
          results: res4
        });
      }
    }

    setScenarios(scenariosGeneres);
  };

  const graphiqueEvolution = useMemo(() => {
    if (!formData.dateAcquisition || !formData.prixVente) return [];

    const data = [];
    const dateAcq = new Date(formData.dateAcquisition);

    for (let annee = 0; annee <= 35; annee++) {
      const dateVente = new Date(dateAcq);
      dateVente.setFullYear(dateVente.getFullYear() + annee);

      const res = calculerPlusValue(dateVente.toISOString().split('T')[0]);

      if (res && !res.exoneration) {
        data.push({
          annee,
          fiscalite: Math.round(res.totalFiscalite),
          ir: Math.round(res.impotRevenu),
          ps: Math.round(res.prelevementsSociaux)
        });
      }
    }

    return data;
  }, [formData.dateAcquisition, formData.prixVente, formData.prixAcquisition, formData.travaux, formData.travauxMontant]);

  const exporterPDF = () => {
    if (!results) {
      alert('Veuillez d\'abord calculer');
      return;
    }

    const contenu = `CALCUL PLUS-VALUE IMMOBILIÈRE
Date: ${new Date().toLocaleDateString('fr-FR')}

${results.exoneration ? 
`EXONÉRATION: ${results.motifExoneration}` :
`Plus-value: ${results.plusValueBrute.toLocaleString('fr-FR')} €
Fiscalité: ${results.totalFiscalite.toLocaleString('fr-FR')} €`}`;

    const blob = new Blob([contenu], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plusvalue_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Calculateur de Plus-Value Immobilière</h1>
                  <p className="text-emerald-600 font-medium">Paramètres revus en septembre 2026</p>
                </div>
              </div>
            </div>
            {results && !results.exoneration && (
              <div className="text-right">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                  <p className="text-sm text-emerald-600 font-medium mb-1">Fiscalité totale</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {results.totalFiscalite.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-emerald-600 mt-2">
                    Économie: {results.economieAbattements.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* SECTION 1: ACQUISITION */}
            <div className="border-2 border-emerald-200 rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-green-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Acquisition du bien</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Mode d&apos;acquisition *
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { value: 'achat', label: 'Achat', icon: Euro },
                      { value: 'donation', label: 'Donation', icon: Gift },
                      { value: 'succession', label: 'Succession', icon: Users },
                      { value: 'echange', label: 'Échange', icon: ArrowRight }
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setFormData({...formData, modeAcquisition: mode.value as FormData['modeAcquisition']})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.modeAcquisition === mode.value
                            ? 'border-emerald-500 bg-white shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <mode.icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <p className="text-sm font-medium">{mode.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Type de bien *</label>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { value: 'principal', label: 'Rés. principale' },
                      { value: 'secondaire', label: 'Rés. secondaire' },
                      { value: 'locatif', label: 'Bien locatif' },
                      { value: 'sci', label: 'SCI à l’IR' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({...formData, typeBien: type.value as FormData['typeBien']})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.typeBien === type.value
                            ? 'border-emerald-500 bg-white shadow-md'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <p className="text-sm font-medium">{type.label}</p>
                      </button>
                    ))}
                  </div>
                  {formData.typeBien === 'sci' && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          <strong>Important:</strong> SCI à l&apos;IR uniquement. Les SCI à l&apos;IS relèvent du régime professionnel.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Démembrement */}
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                  <div className="flex items-center gap-3 mb-4">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Démembrement de propriété</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">Le bien est-il démembré ?</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, estDemembre: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.estDemembre
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, estDemembre: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.estDemembre
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {formData.estDemembre && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Vous détenez:</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'pleine', label: 'Pleine propriété' },
                            { value: 'usufruit', label: 'Usufruit' },
                            { value: 'nue', label: 'Nue-propriété' }
                          ].map((type) => (
                            <button
                              key={type.value}
                              onClick={() => setFormData({...formData, typeDroit: type.value as FormData['typeDroit']})}
                              className={`p-3 rounded-lg border-2 transition-all text-sm ${
                                formData.typeDroit === type.value
                                  ? 'border-emerald-500 bg-white'
                                  : 'border-gray-300 bg-white hover:border-emerald-300'
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.typeDroit !== 'pleine' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Âge de l&apos;usufruitier — repère facultatif</label>
                          <input
                            type="number"
                            value={formData.ageUsufruitier}
                            onChange={(e) => setFormData({...formData, ageUsufruitier: e.target.value})}
                            placeholder="65"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <p className="text-xs text-gray-600 mt-2">
                            Barème 669 indicatif ; aucun prix historique n’est recalculé avec cet âge.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border bg-blue-50 p-4 space-y-3 text-sm">
                  <label className="block">Nature du bien<select aria-label="Nature du bien" className="block w-full border rounded p-2" value={formData.natureImmeuble??'bati'} onChange={e=>setFormData({...formData,natureImmeuble:e.target.value})}><option value="bati">Immeuble bâti</option><option value="tab">Terrain à bâtir (hors surtaxe des PV élevées)</option><option value="terrain">Autre terrain</option></select></label>
                  <p>Calcul d’un seul cédant : en indivision ou communauté, saisir les prix et frais du bien entier puis la quote-part de ce cédant. Les résultats portent uniquement sur cette quote-part, y compris la surtaxe. Le seuil de 15 000 € utilise la valeur en pleine propriété de la quote-part indivise.</p>
                  <p>SCI à l’IR : ce module calcule la vente de l’immeuble par la société à 100 %, avec tous les associés personnes physiques imposables aux mêmes conditions. Il ne simule ni la cession de parts ni les exonérations propres à certains associés. La surtaxe est liquidée au niveau de la société.</p>
                  {formData.estDemembre&&formData.typeDroit!=='pleine'&&<><label className="block">Prix ou valeur fiscale d’acquisition du droit de ce cédant (€)<input type="number" min="0" className="block w-full border rounded p-2" value={formData.prixAcquisitionDroit??''} onChange={e=>setFormData({...formData,prixAcquisitionDroit:e.target.value})}/></label><label className="block">Prix de vente attribué au droit de ce cédant (€)<input type="number" min="0" className="block w-full border rounded p-2" value={formData.prixVenteDroit??''} onChange={e=>setFormData({...formData,prixVenteDroit:e.target.value})}/></label><p>En démembrement, ces deux montants sont déjà ceux du cédant : aucun second prorata. Les frais réels et travaux doivent aussi concerner ce seul droit. Conserver le prix de vente en pleine propriété pour le seuil de 15 000 €. Reprendre les actes et la base fiscale applicable ; successions antérieures à 2004, réunion de propriété, acquisition par fractions et usufruit temporaire exigent une détermination spécifique.</p></>}
                  <label className="flex gap-2"><input type="checkbox" checked={formData.affiliationEurope??false} onChange={e=>setFormData({...formData,affiliationEurope:e.target.checked})}/>Affiliation obligatoire à un régime EEE/Suisse ou britannique ouvrant droit à exonération CSG/CRDS, sans charge du régime français : prélèvement de solidarité 7,5 % (conditions confirmées).</label>
                  <p>Les frais admis doivent être justifiés et effectivement supportés. LMNP avec amortissements : utiliser le module dédié. Les exonérations de résidence principale exigent une occupation effective du cédant, y compris en démembrement. <a className="underline" href="https://bofip.impots.gouv.fr/bofip/309-PGP.html/identifiant=BOI-RFPI-PVI-20-10-20-10-20120912">Prix d’acquisition des droits</a> ; <a className="underline" href="https://bofip.impots.gouv.fr/bofip/4290-PGP.html/identifiant=BOI-RFPI-PVI-10-40-70-20140414">Seuil de 15 000 €</a> ; <a className="underline" href="https://bofip.impots.gouv.fr/bofip/8597-PGP.html/identifiant=BOI-RFPI-TPVIE-20-20170308">Surtaxe par cédant</a>.</p>
                </div>
                {(formData.modeAcquisition==='donation'||formData.modeAcquisition==='succession')&&<label className="block text-sm">Frais et droits de mutation effectivement supportés, admissibles pour ce bien (€)<input type="number" min="0" className="block w-full rounded border p-3" value={formData.fraisAcquisitionMontant} onChange={e=>setFormData({...formData,fraisAcquisition:'reel',fraisAcquisitionMontant:e.target.value})}/><span className="text-xs">Pas de forfait de 7,5 % pour une acquisition gratuite. Retenir la fraction relative au bien ou au droit cédé, selon la convention de montants ci-dessus.</span></label>}
                {/* Copropriété / Indivision */}
                {formData.typeBien !== 'sci' && (
                  <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Quote-part du seul cédant simulé</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">% de détention</label>
                        <input
                          type="number"
                          value={formData.pourcentageDetention}
                          onChange={(e) => setFormData({...formData, pourcentageDetention: e.target.value})}
                          placeholder="50"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nb copropriétaires</label>
                        <input
                          type="number"
                          value={formData.nombreCoproprietaires}
                          onChange={(e) => setFormData({...formData, nombreCoproprietaires: e.target.value})}
                          placeholder="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.modeAcquisition === 'achat' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Prix d&apos;acquisition *</label>
                    <input
                      type="text"
                      value={formData.prixAcquisition}
                      onChange={(e) => setFormData({...formData, prixAcquisition: e.target.value})}
                      placeholder="180 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Valeur vénale au moment de la {formData.modeAcquisition} *
                    </label>
                    <input
                      type="text"
                      value={formData.valeurVenale}
                      onChange={(e) => setFormData({...formData, valeurVenale: e.target.value})}
                      placeholder="180 000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Valeur déclarée dans l&apos;acte
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Date d&apos;acquisition *</label>
                  <input
                    type="date"
                    value={formData.dateAcquisition}
                    onChange={(e) => setFormData({...formData, dateAcquisition: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {(formData.modeAcquisition === 'achat'||formData.modeAcquisition==='echange') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Frais d&apos;acquisition</label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <button
                        onClick={() => setFormData({...formData, fraisAcquisition: 'forfait'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.fraisAcquisition === 'forfait'
                            ? 'border-emerald-500 bg-white shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <p className="text-sm font-medium">Forfait 7,5%</p>
                      </button>
                      <button
                        onClick={() => setFormData({...formData, fraisAcquisition: 'reel'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.fraisAcquisition === 'reel'
                            ? 'border-emerald-500 bg-white shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <p className="text-sm font-medium">Montant réel</p>
                      </button>
                    </div>
                    {formData.fraisAcquisition === 'reel' && (
                      <input
                        type="text"
                        value={formData.fraisAcquisitionMontant}
                        onChange={(e) => setFormData({...formData, fraisAcquisitionMontant: e.target.value})}
                        placeholder="13 500"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: VENTE */}
            <div className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Euro className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Vente du bien</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Prix de vente *</label>
                  <input
                    type="text"
                    value={formData.prixVente}
                    onChange={(e) => setFormData({...formData, prixVente: e.target.value})}
                    placeholder="320 000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Date de vente prévue *</label>
                  <input
                    type="date"
                    value={formData.dateVente}
                    onChange={(e) => setFormData({...formData, dateVente: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Calcul au jour près</p>
                        <p>Durée de détention calculée avec précision pour optimiser vos abattements.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Frais de vente (diagnostics, etc.)</label>
                  <input
                    type="text"
                    value={formData.fraisVente}
                    onChange={(e) => setFormData({...formData, fraisVente: e.target.value})}
                    placeholder="1 500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: TRAVAUX */}
            <div className="border-2 border-purple-200 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Travaux réalisés</h2>
              </div>

              <div className="space-y-6">
                {/* Info importante pour bien locatif */}
                {formData.typeBien === 'locatif' && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-base font-bold text-green-900 mb-3">
                          💰 AVANTAGE FISCAL - Bien locatif : Double déduction possible !
                        </p>
                        <div className="text-sm text-green-800 space-y-3 bg-white rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✅</span>
                            <div>
                              <p className="font-semibold mb-1">Forfait 15 % : immeuble bâti détenu depuis plus de cinq ans</p>
                              <p className="text-xs">
                                Vous pouvez appliquer le forfait 15% <strong>MÊME SI</strong> vous avez déjà déduit des travaux 
                                de vos revenus fonciers ! C&apos;est un <strong>double avantage fiscal légal</strong>.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">⚠️</span>
                            <div>
                              <p className="font-semibold mb-1">Travaux réels : Uniquement si NON déduits</p>
                              <p className="text-xs">
                                Pour déclarer des travaux au montant réel, ils ne doivent PAS avoir été déduits 
                                des revenus fonciers (ligne 224/229 déclaration 2044).
                              </p>
                            </div>
                          </div>
                          <div className="bg-green-100 rounded-lg p-3 mt-2">
                            <p className="text-xs font-semibold text-green-900 mb-2">
                              💡 Conseil d&apos;expert :
                            </p>
                            <p className="text-xs text-green-800">
                              Pour un bien locatif, le forfait 15% est souvent plus avantageux car il s&apos;applique
                              systématiquement sans justificatif, même si vous avez déjà optimisé vos impôts avec 
                              les charges déductibles !
                            </p>
                          </div>
                          <div className="border-t border-green-200 pt-3 mt-3">
                            <p className="text-xs text-green-700">
                              <strong>📖 Base légale :</strong> Article 150 VB du CGI - 
                              <a 
                                href="https://bofip.impots.gouv.fr/bofip/265-PGP.html/identifiant=BOI-RFPI-PVI-20-10-20-20-20131220" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-green-900 ml-1"
                              >
                                BOFIP BOI-RFPI-PVI-20-10-20-20 §190
                              </a>
                            </p>
                            <p className="text-xs text-green-700 italic mt-1">
                              &quot;Il n&apos;y a pas lieu de rechercher si les dépenses de travaux ont déjà été
                              prises en compte pour l&apos;assiette de l&apos;impôt sur le revenu&quot; (forfait 15%)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Travaux à ajouter au prix d&apos;acquisition
                  </label>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <button
                      onClick={() => setFormData({...formData, travaux: 'aucun'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.travaux === 'aucun'
                          ? 'border-purple-500 bg-white shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="text-sm font-medium">Aucun</p>
                    </button>
                    <button
                      onClick={() => setFormData({...formData, travaux: 'forfait'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.travaux === 'forfait'
                          ? 'border-purple-500 bg-white shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="text-sm font-medium">Forfait 15%</p>
                      <p className="text-xs text-gray-500 mt-1">Sans justificatif</p>
                    </button>
                    <button
                      onClick={() => setFormData({...formData, travaux: 'reel'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.travaux === 'reel'
                          ? 'border-purple-500 bg-white shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="text-sm font-medium">Montant réel</p>
                      <p className="text-xs text-gray-500 mt-1">Avec factures</p>
                    </button>
                  </div>

                  {formData.travaux === 'reel' && (
                    <div>
                      <input
                        type="text"
                        value={formData.travauxMontant}
                        onChange={(e) => setFormData({...formData, travauxMontant: e.target.value})}
                        placeholder="35 000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {formData.typeBien === 'locatif' && (
                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                              <strong>⚠️ Attention :</strong> Pour un bien locatif, seuls les travaux NON déduits des revenus fonciers peuvent être déclarés ici. 
                              Si vos travaux ont été déduits en charges (ligne 224 ou 229 de votre déclaration 2044), utilisez plutôt le forfait 15%.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">📋 Règles du forfait 15%</p>
                        <ul className="space-y-1 text-xs">
                          <li>✅ Applicable si détention &gt; 5 ans</li>
                          <li>✅ Aucun justificatif requis</li>
                          <li>✅ Même si aucun travaux réalisé</li>
                          <li>✅ <strong>Même si travaux déjà déduits des revenus fonciers (bien locatif)</strong></li>
                          <li>❌ Ne se cumule PAS avec les travaux réels</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-blue-300">
                          <p className="text-xs font-semibold mb-1">📖 Sources officielles :</p>
                          <ul className="text-xs space-y-1">
                            <li>
                              • <a 
                                href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042912489" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-900"
                              >
                                Article 150 VB du Code Général des Impôts
                              </a>
                            </li>
                            <li>
                              • <a 
                                href="https://bofip.impots.gouv.fr/bofip/265-PGP.html/identifiant=BOI-RFPI-PVI-20-10-20-20-20131220" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-900"
                              >
                                BOFIP BOI-RFPI-PVI-20-10-20-20 (Documentation fiscale officielle)
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: EXONÉRATIONS */}
            <div className="border-2 border-amber-200 rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Exonérations possibles</h2>
                <span className="ml-auto text-sm text-amber-700 font-semibold bg-amber-100 px-3 py-1 rounded-full">
                  ⚠️ Ne passez pas à côté !
                </span>
              </div>

              <div className="space-y-6">
                {/* Première vente */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Première vente résidence secondaire</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Art. 150 U II 1° bis CGI - Conditions:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Ne pas avoir été propriétaire de sa RP au cours des 4 années précédentes</li>
                        <li>• Remploi du prix de cession dans une RP (acquisition/construction) sous 24 mois</li>
                        <li>• Exonération proportionnelle à la fraction du prix de ce cédant, net des frais admis, effectivement remployée ; cession d’un droit démembré exclue de ce scénario</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Je remplis ces conditions
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, premiereVente: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.premiereVente
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, premiereVente: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.premiereVente
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {formData.premiereVente && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Montant du prix de cession remployé dans la résidence principale (optionnel)
                      </label>
                      <input
                        type="text"
                        value={formData.remploiResidencePrincipale}
                        onChange={(e) => setFormData({...formData, remploiResidencePrincipale: e.target.value})}
                        placeholder="Ex : 200 000 (laisser vide = remploi intégral)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        L&apos;exonération porte sur la part de plus-value correspondant à la fraction du prix remployée.
                        À vide, on présume un remploi de 100 % (exonération totale).
                      </p>
                    </div>
                  )}
                </div>

                {/* Retraité */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Retraité modeste / Personne invalide</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Art. 150 U II 6° CGI - Conditions:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Pension de vieillesse OU carte mobilité inclusion</li>
                        <li>• RFR ≤ 12 679€ (1 part)</li>
                        <li>• Bien non loué lors de la vente</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Je suis retraité(e) ou invalide
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, retraite: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.retraite
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, retraite: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.retraite
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {formData.retraite && <label className="block text-sm mb-3"><input type="checkbox" checked={formData.retraiteConditions === true} onChange={e => setFormData({...formData, retraiteConditions: e.target.checked})} /> Je confirme respecter le plafond de RFR N-2 applicable à mon foyer et ne pas être passible de l’IFI en N-2 (CGI 150 U III). Sans cette confirmation, l’exonération n’est pas appliquée.</label>}
                  {formData.retraite && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Revenu fiscal de référence (RFR) N-2
                      </label>
                      <input
                        type="text"
                        value={formData.revenuFiscal}
                        onChange={(e) => setFormData({...formData, revenuFiscal: e.target.value})}
                        placeholder="12 000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Visible sur votre avis d&apos;imposition. Le plafond dépend de la date de vente et des parts fiscales.
                      </p>
                    </div>
                  )}
                </div>

                {/* Expropriation */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Expropriation pour utilité publique</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Art. 150 U II 4° CGI - Conditions:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Expropriation pour cause d&apos;utilité publique</li>
                        <li>• Réemploi de l&apos;indemnité sous 12 mois</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Mon bien a été exproprié
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, expropriation: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.expropriation
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, expropriation: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.expropriation
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>

                {/* Non-résident UE/EEE */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Cession par un non-résident (UE/EEE)</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Art. 150 U II 2° CGI - Exonération partielle (plafonnée), conditions :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Personne physique non-résidente, ressortissante d&apos;un État de l&apos;UE/EEE</li>
                        <li>• Domiciliée fiscalement en France ≥ 2 ans continus, à un moment quelconque avant la cession</li>
                        <li>• Cession ≤ 31/12 de la 10ᵉ année suivant le transfert du domicile hors de France, OU libre disposition du bien depuis le 1ᵉʳ janvier de l&apos;année précédente</li>
                        <li>• <strong>Plafond : 150 000 € de plus-value nette imposable par cédant</strong> (le surplus reste taxé)</li>
                        <li>• Limitée à une seule résidence par contribuable</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Le cédant est un non-résident UE/EEE
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, nonResident: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.nonResident
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, nonResident: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.nonResident
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {formData.nonResident && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 flex-1">
                          Domiciliation ≥ 2 ans en France + condition de délai (10 ans) ou libre disposition remplies
                        </span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setFormData({...formData, nonResidentConditions: true})}
                            className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                              formData.nonResidentConditions
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border-2 border-gray-300 text-gray-700'
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            onClick={() => setFormData({...formData, nonResidentConditions: false})}
                            className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                              !formData.nonResidentConditions
                                ? 'bg-gray-600 text-white'
                                : 'bg-white border-2 border-gray-300 text-gray-700'
                            }`}
                          >
                            Non
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 flex-1">
                          A déjà bénéficié de l&apos;exonération de sa RP en tant que non-résident (244 bis A) → exclut l&apos;exonération
                        </span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setFormData({...formData, dejaBeneficieExoRPNonResident: true})}
                            className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                              formData.dejaBeneficieExoRPNonResident
                                ? 'bg-red-600 text-white'
                                : 'bg-white border-2 border-gray-300 text-gray-700'
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            onClick={() => setFormData({...formData, dejaBeneficieExoRPNonResident: false})}
                            className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                              !formData.dejaBeneficieExoRPNonResident
                                ? 'bg-gray-600 text-white'
                                : 'bg-white border-2 border-gray-300 text-gray-700'
                            }`}
                          >
                            Non
                          </button>
                        </div>
                      </div>

                      <p className="text-sm">Un seul cédant est simulé. Le plafond de 150 000 € ne peut pas être multiplié sur sa quote-part ; calculer séparément chaque autre cédant.</p>
                    </div>
                  )}
                </div>

                {/* EHPAD / établissement médicalisé */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Personne âgée ou handicapée en établissement médicalisé</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Art. 150 U II 1° ter CGI - Conditions :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• Le bien constituait la résidence principale avant l&apos;entrée en établissement</li>
                        <li>• Cession dans les 2 ans suivant l&apos;entrée en établissement (EHPAD, foyer, etc.)</li>
                        <li>• Le logement est resté inoccupé depuis l&apos;entrée</li>
                        <li>• Revenu fiscal de référence sous le seuil de l&apos;art. 1417 II et non soumis à l&apos;IFI</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Je remplis TOUTES ces conditions
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, ehpad: true, ehpadConditions: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.ehpad
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, ehpad: false, ehpadConditions: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.ehpad
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-blue-50 p-4 space-y-3"><label className="block text-sm">Taux exceptionnel validé par le dossier<select aria-label="Taux exceptionnel" className="block w-full border rounded p-2" value={formData.tauxExceptionnel??''} onChange={e=>setFormData({...formData,tauxExceptionnel:e.target.value})}><option value="">Aucun</option><option value="60">60 %</option><option value="75">75 %</option><option value="85">85 %</option></select></label><label className="block text-sm">Date certaine de la promesse<input type="date" className="block w-full border rounded p-2" value={formData.datePromesse??''} onChange={e=>setFormData({...formData,datePromesse:e.target.value})}/></label></div>
                {/* Zone tendue */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Abattement exceptionnel sur opération éligible</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Article 150 VE, rédaction 2026 : sélectionner le taux du dispositif et confirmer toutes les conditions :
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                        <li>• 60 % : zonage réglementaire hors Corse ; 75 % : GOU/OIN/ORT ; 85 % : conditions renforcées de logements sociaux/intermédiaires/BRS.</li>
                        <li>• Construction, démolition/reconstruction ou réhabilitation complète en immeuble neuf et achèvement sous quatre ans, gabarit minimal de 75 %.</li>
                        <li>• Promesse à date certaine entre 2024 et 2027, cession avant fin de la deuxième année suivante ; périmètre, engagements dans l’acte, gabarit et absence de liens exclus à confirmer. Le seul zonage ne suffit pas. <a className="underline" href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000053508155">CGI 150 VE, modification par l’article 54 de la loi de finances 2026</a>.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      Je remplis ces conditions
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormData({...formData, zoneTendue: true})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          formData.zoneTendue
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setFormData({...formData, zoneTendue: false})}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          !formData.zoneTendue
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: OPTIMISATION - affichée après calcul */}
            {results && (
              <div className="border-2 border-green-200 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">5. Optimisation fiscale</h2>
                </div>

                <div className="space-y-6">
                  {/* Suggestions */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-amber-600" />
                      <h3 className="text-lg font-bold text-gray-900">Suggestions d&apos;optimisation</h3>
                    </div>
                    {results.suggestions.length > 0 ? (
                      <div className="space-y-3">
                        {results.suggestions.map((suggestion, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                            <p className="text-sm text-gray-700">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Aucune optimisation supplémentaire détectée. Configuration optimale !</p>
                    )}
                  </div>

                  {/* Graphique évolution */}
                  {graphiqueEvolution.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-6 h-6 text-emerald-600" />
                        <h3 className="text-lg font-bold text-gray-900">Évolution de la fiscalité selon durée de détention</h3>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={graphiqueEvolution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="annee" 
                            label={{ value: 'Années de détention', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Fiscalité (€)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            formatter={(value: number) => value.toLocaleString('fr-FR') + ' €'}
                            labelFormatter={(label) => `Année ${label}`}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="fiscalite" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            name="Fiscalité totale"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ir" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Impôt sur le revenu"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ps" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            name="Prélèvements sociaux"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-xs text-blue-600 font-medium mb-1">Exonération IR</p>
                          <p className="text-2xl font-bold text-blue-900">22 ans</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <p className="text-xs text-amber-600 font-medium mb-1">Exonération PS</p>
                          <p className="text-2xl font-bold text-amber-900">30 ans</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comparaison scénarios */}
                  {scenarios.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Target className="w-6 h-6 text-purple-600" />
                          <h3 className="text-lg font-bold text-gray-900">Comparaison de scénarios</h3>
                        </div>
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
                        >
                          {showComparison ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>

                      {showComparison && (
                        <div className="space-y-4">
                          {scenarios.map((scenario, index) => (
                            <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">{scenario.nom}</h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(scenario.dateVente).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Plus-value</p>
                                  <p className="font-semibold text-gray-900">
                                    {scenario.results.plusValueBrute.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Abattements</p>
                                  <p className="font-semibold text-gray-900">
                                    IR: {scenario.results.abattementIR.toFixed(0)}% / PS: {scenario.results.abattementPS.toFixed(0)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Fiscalité</p>
                                  <p className="font-bold text-emerald-600">
                                    {scenario.results.totalFiscalite.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                                  </p>
                                </div>
                              </div>
                              {scenario.travaux && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-600">
                                    Travaux inclus: {scenario.travaux.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {!showComparison && (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={scenarios}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nom" angle={-15} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number) => value.toLocaleString('fr-FR') + ' €'}
                            />
                            <Bar dataKey="results.totalFiscalite" fill="#10b981" name="Fiscalité totale" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}

                  {/* Valeur démembrement */}
                  {results.valeurDemembrement && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <PieChart className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Valeur du démembrement</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                          <p className="text-sm text-blue-600 font-medium mb-2">Usufruit</p>
                          <p className="text-3xl font-bold text-blue-900">{results.valeurDemembrement.usufruit}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <p className="text-sm text-green-600 font-medium mb-2">Nue-propriété</p>
                          <p className="text-3xl font-bold text-green-900">{results.valeurDemembrement.nue}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Barème fiscal Art. 669 CGI
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCalculer}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Calculator className="w-5 h-5" />
              Calculer
            </button>
            <button
              onClick={exporterPDF}
              disabled={!results}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Résultats */}
        {results && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Résultats du calcul</h2>

            {results.exoneration ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">Exonération Totale</h3>
                <p className="text-green-700">{results.motifExoneration}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.notesExoneration && results.notesExoneration.length > 0 && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-semibold text-emerald-900">Exonération(s) partielle(s) appliquée(s)</p>
                        {results.notesExoneration.map((note, i) => (
                          <p key={i} className="text-sm text-emerald-800">{note}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Durée détention */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Durée de détention (calcul au jour près)</h3>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-blue-900">{results.dureeDetention.toFixed(2)}</p>
                    <p className="text-lg text-blue-700">ans</p>
                    <p className="text-sm text-blue-600 ml-4">({results.dureeDetentionJours} jours)</p>
                  </div>
                </div>

                {/* Plus-value brute */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Plus-value brute</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix de vente corrigé</span>
                      <span className="font-semibold">{results.prixVenteCorrige.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix d&apos;acquisition corrigé</span>
                      <span className="font-semibold">-{results.prixAcquisitionCorrige.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                      <span className="font-bold text-gray-900">Plus-value brute</span>
                      <span className="font-bold text-gray-900">{results.plusValueBrute.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                  </div>
                </div>

                {/* Abattements */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-900 mb-4">Abattements pour durée de détention</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Abattement IR</p>
                      <p className="text-3xl font-bold text-emerald-900">{results.abattementIR.toFixed(2)}%</p>
                      <div className="mt-2 bg-emerald-100 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${results.abattementIR}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Abattement PS</p>
                      <p className="text-3xl font-bold text-green-900">{results.abattementPS.toFixed(2)}%</p>
                      <div className="mt-2 bg-green-100 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${results.abattementPS}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-700 font-medium text-center">
                    Économie totale grâce aux abattements: {results.economieAbattements.toLocaleString('fr-FR', {maximumFractionDigits: 0})} €
                  </p>
                </div>

                {/* Fiscalité */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <span className="text-gray-900 font-medium">Impôt sur le revenu (19%)</span>
                      <p className="text-xs text-gray-500">
                        Sur {results.plusValueIR.toLocaleString('fr-FR', {maximumFractionDigits: 0})} € de PV imposable
                      </p>
                    </div>
                    <span className="font-semibold text-lg">{results.impotRevenu.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <span className="text-gray-900 font-medium">Prélèvements sociaux ({formData.affiliationEurope&&formData.typeBien!=='sci'?'7,5':'17,2'} %)</span>
                      <p className="text-xs text-gray-500">
                        Sur {results.plusValuePS.toLocaleString('fr-FR', {maximumFractionDigits: 0})} € de PV imposable
                      </p>
                    </div>
                    <span className="font-semibold text-lg">{results.prelevementsSociaux.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                  </div>
                  {results.taxeAdditionnelle > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <span className="text-gray-900 font-medium">Taxe additionnelle</span>
                        <p className="text-xs text-gray-500">
                          Sur PV imposable &gt; 50 000€
                        </p>
                      </div>
                      <span className="font-semibold text-lg">{results.taxeAdditionnelle.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-6 border-t-2 border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl px-6 -mx-6">
                    <div>
                      <span className="font-bold text-xl text-gray-900">TOTAL FISCALITÉ</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {((results.totalFiscalite / results.plusValueBrute) * 100).toFixed(1)}% de la plus-value brute
                      </p>
                    </div>
                    <span className="font-bold text-3xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {results.totalFiscalite.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>

                {/* Net vendeur */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-600 font-medium mb-1">Net vendeur après fiscalité</p>
                      <p className="text-xs text-gray-600">
                        Prix de vente - frais - fiscalité
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {(results.prixVenteCorrige - results.totalFiscalite).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}




        {/* Disclaimer Légal */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 mb-3">
                ⚖️ Avertissement Légal Important
              </h3>
              <div className="space-y-3 text-sm text-amber-900">
                <p className="leading-relaxed">
                  <strong>Cette simulation est fournie à titre informatif uniquement</strong> et ne constitue pas un conseil juridique, fiscal ou patrimonial personnalisé. Les informations et calculs présentés sont basés sur la législation en vigueur au 8 septembre 2026 et sont susceptibles d&apos;évoluer.
                </p>

                <p className="leading-relaxed">
                  Les règles fiscales en matière de plus-values immobilières sont <strong>complexes et varient selon chaque situation personnelle</strong> (type de bien, durée de détention, travaux réalisés, situation familiale, etc.).
                </p>

                <div className="bg-white rounded-lg p-4 border-2 border-amber-300 mt-4">
                  <p className="font-bold text-amber-900 mb-2">
                    ⚠️ Consultation professionnelle obligatoire :
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Notaire</strong> : pour toute vente immobilière et calcul officiel de la plus-value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Avocat fiscaliste</strong> : pour l&apos;optimisation fiscale complexe et les cas particuliers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Expert-comptable</strong> : pour les SCI et aspects comptables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Conseiller en gestion de patrimoine (CGP)</strong> : pour une stratégie patrimoniale globale</span>
                    </li>
                  </ul>
                </div>

                <p className="leading-relaxed font-semibold text-amber-900">
                  <strong>NotariaPrime.fr</strong> décline toute responsabilité en cas d&apos;utilisation des informations fournies sans validation par un professionnel qualifié. Seul un conseil personnalisé peut garantir la conformité légale et l&apos;optimisation adaptée à votre situation.
                </p>

                <div className="bg-amber-100 rounded-lg p-3 mt-4 border border-amber-400">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>📚 Sources officielles :</strong> Code Général des Impôts (CGI), Bulletin Officiel des Finances Publiques (BOFiP), 
                    Service-Public.fr, Légifrance.gouv.fr, Impots.gouv.fr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlusValuePage() {
  return (
    <MainLayout showFeedback={false}>
      <PlusValueContent />
    </MainLayout>
  );
}
