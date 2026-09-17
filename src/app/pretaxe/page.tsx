// src\app\pretaxe\page.tsx

"use client";

import MainLayout from '@/components/MainLayout';
import { ASSIETTES_SUCCESSORALES } from '@/lib/actes-successoraux';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, FileText, Euro, Building, File,
  AlertCircle, MapPin, Download, Save, History, FileEdit,
  X
} from 'lucide-react';
import { actesConfig } from '@/config/actesConfig';
import {
  departements,
  HistoriqueCalcul,
  Taxes,
  Documents,
  Formalites
} from './PretaxeTypes';
import {
  getTauxTVA,
  getMajorationDOMTOM,
  calculerEmoluments,
  calculerEmolumentsMariage,
  calculerEmolumentsBail,
  calculerTaxes,
  calculerCSI,
  calculerTPF,
  calculerDroitPartage,
  appliquerConfigParDefaut
} from './PretaxeCalculations';
import EmolumentsTab from './EmolumentsTab';
import DeboursTab from './DeboursTab';
import FormalitesTab from './FormalitesTab';
import DocumentsTab from './DocumentsTab';
import TaxesTab from './TaxesTab';
import PretaxeReport, { totalPretaxe, type RapportPretaxe } from './PretaxeReport';
import DonationPretaxeForm from './DonationPretaxeForm';
import { estDonation, basesDonation, nouveauDonateur, additionnerEmoluments, calculerEcretement, type DonateurPretaxe } from './pretaxeAuditRules';
import { lignesFormalites, lignesDocuments, lignesDepenses, totalLignes, type FormaliteAjoutee, type DepenseAjoutee } from './pretaxeLines';
import { lireMontant, arrondirCentimes, sommeMontants } from '@/lib/montants';
import { exporterPretaxePDF } from './pretaxePdf';
import OCRScanner from './OCRScanner';
import { categoriesActes } from './pretaxeCatalog';

// ============================================================================
// CATÉGORIES D'ACTES
// ============================================================================

function PretaxeContent() {
  // États principaux
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedActe, setSelectedActe] = useState('');
  const [montantSaisi, setMontantActe] = useState('');
  const [donationParticipants, setDonationParticipants] = useState<DonateurPretaxe[]>([nouveauDonateur('donateur-1')]);
  const [donationPublication, setDonationPublication] = useState('');
  const [sureteBases, setSureteBases] = useState({tpf:'', csi:''});
  const [recalculDemandé, demanderRecalcul] = useState(0);
  const [formalitesAjoutees, setFormalitesAjoutees] = useState<FormaliteAjoutee[]>([]);
  const [depensesAjoutees, setDepensesAjoutees] = useState<DepenseAjoutee[]>([]);
  const donation = estDonation(selectedActe);
  const basesDonateurs = useMemo(()=>basesDonation(donationParticipants),[donationParticipants]);
  const donationValide = basesDonateurs.length > 0 && basesDonateurs.every(d=>d.valide);
  const montantActe = donation ? String(sommeMontants(basesDonateurs.map(d=>d.base))) : montantSaisi;
  const [bailBases, setBailBases] = useState({suite:0, residuelle:0, publication:0});
  const [selectedDepartement, setSelectedDepartement] = useState('75');
  const [activeTab, setActiveTab] = useState('emoluments');
  
  // États pour les calculs
  const [emolumentsDetail, setEmolumentsDetail] = useState({
    bruts: 0,
    majoration: 0,
    avantRemise: 0,
    remise10: 0,
    remise20: 0,
    nets: 0
  });
  
  const [appliquerRemise, setAppliquerRemise] = useState(false);

  // Quotité pour les sûretés accessoires (caution, PPD) : ¼ (tiers dans
  // l'acte principal), ½ (autres cas) ou totalité (pas d'acte principal).
  const [quotiteSurete, setQuotiteSurete] = useState(0.5);
  
  const [debours, setDebours] = useState({
    csi: 0,
    etatsHypothecaires: 0,
    cadastre: 0,
    urbanisme: 0
  });
  
  const [formalites, setFormalites] = useState<Formalites>({
    publiciteFonciere: { actif: false, montant: 339.58 },
    cadastre: { actif: false, montant: 11.32 },
    casierJudiciaire: { actif: false, montant: 37.73 },
    notification: { actif: false, montant: 37.73 },
    mesurage: { actif: false, montant: 15.09 },
    diagnostics: {
      dpe: { actif: false, montant: 15.09 },
      amiante: { actif: false, montant: 15.09 },
      plomb: { actif: false, montant: 15.09 },
      termites: { actif: false, montant: 15.09 },
      gaz: { actif: false, montant: 15.09 },
      electricite: { actif: false, montant: 15.09 },
      erp: { actif: false, montant: 15.09 }
    },
    transmissionCSN: { actif: false, montant: 15.31 },
    requisition: { actif: false, montant: 18.87 },
    teleactes: { actif: false, montant: 50 },
    lettresRecommandees: { actif: false, montant: 7.08 },
    declarationPlusValue: { actif: false, montant: 56.60 }
  });
  
  const [documents, setDocuments] = useState<Documents>({
    pagesActe: 10,
    copiesExecutoires: 0,
    copiesAuthentiques: 1,
    copiesHypothecaires: 0,
    archivageNumerise: true
  });
  
  const [taxes, setTaxes] = useState<Taxes>({
    typeBien: 'ancien',
    departementale: 0,
    communale: 0,
    fraisAssiette: 0,
    primoAccedant: false,
    valeurMobilier: 0,
    accessoiresSurete: 20
  });

  // États pour l'historique
  const [historiqueCalculs, setHistoriqueCalculs] = useState<HistoriqueCalcul[]>([]);
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  
  const sauvegarderCalcul = () => {
    const nouveauCalcul: HistoriqueCalcul = {
      id: Date.now(),
      date: new Date().toLocaleString('fr-FR'),
      acte: categoriesActes[selectedCategory]?.actes[selectedActe]?.label || 'N/A',
      montant: montantActe,
      total: totalGeneral,
      details: {
        emoluments: totalEmolumentsTTC,
        debours: totalDebours,
        formalites: totalFormalitesTTC,
        documents: totalDocumentsTTC,
        taxes: totalTaxes
      }
    };
    
    setHistoriqueCalculs([nouveauCalcul, ...historiqueCalculs]);
    alert('Calcul sauvegardé !');
  };

  // Les valeurs par défaut ne remplacent pas les saisies lors d'un recalcul.
  useEffect(() => {
    if (selectedActe) appliquerConfigParDefaut(selectedActe, setDebours, setFormalites, setDocuments, setTaxes);
    setTaxes(t=>({...t,complement:0}));
    setBailBases({suite:0,residuelle:0,publication:0});
    setFormalitesAjoutees([]); setDepensesAjoutees([]);
    setDonationPublication(''); setSureteBases({tpf:'',csi:''});
  }, [selectedActe]);

  useEffect(()=>{
    if(actesConfig[selectedActe]?.taxes?.type==='partage')setFormalites(prev=>({...prev,publiciteFonciere:{...prev.publiciteFonciere,actif:(taxes.valeurImmoPartage??0)>0}}));
  },[selectedActe,taxes.valeurImmoPartage]);

  useEffect(() => {
    if (selectedActe) {
      
      const acte = categoriesActes[selectedCategory]?.actes[selectedActe];
      const baseSaisie=lireMontant(montantActe);
      if(acte?.type==='proportionnel'&&((baseSaisie===null && !(['contrat_mariage','changement_regime'].includes(selectedActe) && montantActe.trim()===''))||(donation&&!donationValide)||(montantActe.trim()===''&&!['contrat_mariage','changement_regime'].includes(selectedActe)))){setEmolumentsDetail({bruts:0,majoration:0,avantRemise:0,remise10:0,remise20:0,nets:0});
        setDebours(d=>({...d,csi:0}));
        setTaxes(t=>({...t,departementale:0,communale:0,fraisAssiette:0,tpf:0,droitPartage:0,droitFixe:acte.droitFixeEnreg??0}));
        return;
      }
      if (acte && acte.type !== 'non_tarife') {
        if (donation && acte.tranches) {
          const detail = additionnerEmoluments(basesDonateurs.map(d=>calculerEmoluments(d.base,acte.tranches!,selectedDepartement,appliquerRemise)));
          setEmolumentsDetail(detail);
          const basePublication = lireMontant(donationPublication);
          if (selectedActe !== 'donation_mobiliere' && basePublication !== null && basePublication > 0) calculerCSI(donationPublication,setDebours);
          else setDebours(d=>({...d,csi:0}));
        } else if (acte.type === 'fixe' && acte.montant) {
          const detail = {
            bruts: acte.montant,
            majoration: Math.round(acte.montant * getMajorationDOMTOM(selectedDepartement)) / 100,
            avantRemise: Math.round(acte.montant * (100 + getMajorationDOMTOM(selectedDepartement))) / 100,
            remise10: 0,
            remise20: 0,
            nets: Math.round(acte.montant * (100 + getMajorationDOMTOM(selectedDepartement))) / 100
          };
          setEmolumentsDetail(detail);
        } else if (acte.type === 'proportionnel' && acte.tranches) {
          const montant = lireMontant(montantActe) ?? (['contrat_mariage','changement_regime'].includes(selectedActe) && montantActe.trim()==='' ? 0 : null);
          if (montant !== null) {
            const detailBase = ['contrat_mariage','changement_regime'].includes(selectedActe)
              ? calculerEmolumentsMariage(montant, selectedDepartement, appliquerRemise)
              : selectedActe === 'bail_construction' ? calculerEmolumentsBail([montant,bailBases.suite,bailBases.residuelle],selectedDepartement,appliquerRemise)
              : calculerEmoluments(montant, acte.tranches, selectedDepartement, appliquerRemise);
            if(selectedActe==='partage'&&(taxes.reprisesNaturePartage??0)>0){
              const supplement=calculerEmoluments(taxes.reprisesNaturePartage!,[{min:0,max:Infinity,taux:.484}],selectedDepartement,appliquerRemise);
              for(const k of ['bruts','majoration','avantRemise','remise20','nets'] as const)detailBase[k]=Math.round((detailBase[k]+supplement[k])*100)/100;
            }
            if (selectedActe === 'certificat_propriete' && montant <= 3120) {
              detailBase.bruts = 15.09; detailBase.majoration = Math.round(15.09 * getMajorationDOMTOM(selectedDepartement)) / 100;
              detailBase.avantRemise = Math.round((detailBase.bruts + detailBase.majoration)*100)/100; detailBase.nets = detailBase.avantRemise; detailBase.remise20 = 0;
            }
            // Sûretés accessoires : l'émolument est une quotité de celui de
            // l'acte principal (A444-127/136/148).
            const r2 = (n: number) => Math.round(n * 100) / 100;
            const detail = acte.relatif
              ? {
                  bruts: r2(detailBase.bruts * quotiteSurete),
                  majoration: r2(detailBase.majoration * quotiteSurete),
                  avantRemise: r2(detailBase.avantRemise * quotiteSurete),
                  remise10: 0,
                  remise20: r2(detailBase.remise20 * quotiteSurete),
                  nets: r2(detailBase.nets * quotiteSurete),
                }
              : detailBase;
            setEmolumentsDetail(detail);
            // Régime de taxe selon le type d'acte
            const configActe = actesConfig[selectedActe];
            const typeTaxe = configActe?.taxes?.type;
            // La CSI n'est due que pour les actes publiés au service de la
            // publicité foncière (CGI art. 879). Sinon elle reste à 0.
            const publie = configActe?.formalites?.publiciteFonciere?.defaut === true;
            if (typeTaxe === 'dmto' || typeTaxe === 'tva') {
              calculerCSI(montantActe, setDebours); // publication : CSI 0,10 %
              calculerTaxes(
                montantActe,
                selectedDepartement,
                taxes.typeBien,
                setTaxes,
                taxes.primoAccedant === true,
                Number(taxes.valeurMobilier) || 0
              );
            } else if (typeTaxe === 'tpf') {
              // Assiette d'une sûreté = capital garanti + accessoires (intérêts,
              // frais, indemnités), usuellement +20 % (ou +15 %).
              const accPct = Number(taxes.accessoiresSurete ?? 20);
              const baseSurete = Math.round(montant * (1 + accPct / 100) * 100) / 100;
              const baseCSI = lireMontant(sureteBases.csi) ?? baseSurete;
              const baseTPF = lireMontant(sureteBases.tpf) ?? baseSurete;
              if(baseCSI>0) calculerCSI(montantActe, setDebours, 0.5, baseCSI);
              else setDebours(d=>({...d,csi:0}));
              calculerTPF(montantActe, setTaxes, baseTPF);
            } else if (typeTaxe === 'partage') {
              const immobilier=Math.max(0,taxes.valeurImmoPartage??0);
              if(immobilier>0)calculerCSI(String(immobilier),setDebours);
              else setDebours(prev=>({...prev,csi:0}));
              calculerDroitPartage(String(Math.max(0,taxes.actifNetPartage??montant)), taxes.regimePartage ?? 'standard', setTaxes);
            } else if (selectedActe === 'bail_construction') {
              if(bailBases.publication>0)calculerCSI(String(bailBases.publication),setDebours);
              else setDebours(prev=>({...prev,csi:0}));
            } else if (publie || selectedActe === 'attestation_propriete') {
              calculerCSI(montantActe, setDebours);
            }
          }
        }
      }

      const droitFixe = acte?.droitFixeEnreg ?? 0;
      setTaxes(prev => ({ ...prev, droitFixe }));
    }
  }, [recalculDemandé, selectedActe, montantActe, basesDonateurs, donationPublication, sureteBases, donation, donationValide, bailBases, selectedDepartement, taxes.typeBien, taxes.primoAccedant, taxes.valeurMobilier, taxes.regimePartage, taxes.actifNetPartage, taxes.valeurImmoPartage, taxes.reprisesNaturePartage, taxes.accessoiresSurete, selectedCategory, appliquerRemise, quotiteSurete]);

  const round2 = arrondirCentimes;
  const tauxTVA = getTauxTVA(selectedDepartement);
  const majoration = getMajorationDOMTOM(selectedDepartement);
  const totalEmoluments = round2(emolumentsDetail.nets);
  const montantTVA = round2(totalEmoluments*tauxTVA/100);
  const totalEmolumentsTTC = sommeMontants([totalEmoluments,montantTVA]);
  const formaliteRows = lignesFormalites(formalites,formalitesAjoutees,tauxTVA,majoration);
  const documentRows = lignesDocuments(documents,tauxTVA,majoration);
  const depenseRows = lignesDepenses(debours,taxes,depensesAjoutees);
  const totalFormalites = totalLignes(formaliteRows,tauxTVA).ht;
  const totalFormalitesTTC = totalLignes(formaliteRows,tauxTVA).ttc;
  const totalDocuments = totalLignes(documentRows,tauxTVA).ht;
  const totalDocumentsTTC = totalLignes(documentRows,tauxTVA).ttc;
  const totalDebours = sommeMontants(depenseRows.filter(l=>l.nature==='debours').map(l=>l.ht));
  const totalTaxes = sommeMontants(depenseRows.filter(l=>l.nature==='taxes').map(l=>l.ht));
  const baseSureteDefaut = arrondirCentimes((lireMontant(montantActe)??0)*(1+(taxes.accessoiresSurete??20)/100));
  const assiettesSurete = {tpf:lireMontant(sureteBases.tpf)??baseSureteDefaut,csi:lireMontant(sureteBases.csi)??baseSureteDefaut};
  const acteActuel = categoriesActes[selectedCategory]?.actes[selectedActe];
  const estActeNonTarife = acteActuel?.type === 'non_tarife';
  const montantValide = lireMontant(montantActe);
  const annexesValides = (donation?[donationPublication]:actesConfig[selectedActe]?.taxes?.type==='tpf'?[sureteBases.tpf,sureteBases.csi]:[]).every(value=>value.trim()===''||lireMontant(value)!==null);
  const calculPret = annexesValides && !!departements[selectedDepartement] && !!acteActuel && !estActeNonTarife && (acteActuel.type==='fixe' || (donation ? donationValide : montantValide!==null || (['contrat_mariage','changement_regime'].includes(selectedActe) && montantActe.trim()==='')));
  const ecretementHT = calculerEcretement(montantValide??0,['vente_immeuble','vente_terrain','vefa','echange','licitation'].includes(selectedActe),totalEmoluments,totalFormalites,totalDocuments);
  const totaux = totalPretaxe(totalEmoluments,totalFormalites,totalDocuments,ecretementHT,tauxTVA,totalDebours,totalTaxes);
  const totalGeneral = calculPret ? totaux.total : 0;
  const rapport: RapportPretaxe = {
    acte:acteActuel?.label??'', departement:`${selectedDepartement} - ${departements[selectedDepartement]?.nom??'à préciser'}`,
    emoluments: donation && acteActuel?.tranches ? basesDonateurs.map(d=>({libelle:`${acteActuel.label} - ${d.nom}`,base:d.base,ht:calculerEmoluments(d.base,acteActuel.tranches!,selectedDepartement,appliquerRemise).nets})) : [{libelle:acteActuel?.label??'',base:montantValide??0,ht:totalEmoluments}],
    lignes:[...formaliteRows,...documentRows,...depenseRows], emolumentsHT:totalEmoluments, formalitesHT:totalFormalites, documentsHT:totalDocuments,
    debours:totalDebours,taxes:totalTaxes,ecretementHT,tauxTVA,tva:totaux.tva,total:totalGeneral,
    notes:[
      'Estimation des postes renseignés : formalités, quantités, droits et débours à adapter à la situation réelle. Les tarifs et régimes particuliers dépendent de la date et de la qualification de l’acte.',
      ...(actesConfig[selectedActe]?.taxes?.type==='tpf'?[`Sûreté : assiette TPF ${assiettesSurete.tpf.toLocaleString('fr-FR')} EUR ; assiette CSI ${assiettesSurete.csi.toLocaleString('fr-FR')} EUR.`]:[]),
      ...(donation && selectedActe!=='donation_mobiliere'?[`Assiette de publication renseignée pour la CSI : ${donationPublication || 'non renseignée'}.`]:[]),
      ...(donation?['Donation : droits fiscaux et taxes de publication à compléter séparément. L’assiette des émoluments reste en pleine propriété en cas de réserve d’usufruit.',...donationParticipants.flatMap((d,i)=>d.transmissions.map(t=>`${d.nom||`Donateur ${i+1}`} : ${t.bien||'apport'} ; ${t.beneficiaires||'attribution non précisée'} ; ${t.droit==='nue_propriete_reserve'?'nue-propriété avec réserve d’usufruit':'pleine propriété'} ; base PP ${t.pleinePropriete} EUR.`))]:[]),
      ...(appliquerRemise?['Remise de 20 % sur la fraction d’émoluments éligible au-delà de 100 000 EUR, par donateur pour une donation, sous réserve de la remise consentie par le notaire.']:[]),
      ...(majoration?[`Majoration territoriale de ${majoration} % appliquée aux émoluments, formalités et copies (A444-53).`]:[]),
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Calculateur de frais notariés</h1>
                  <p className="text-indigo-600 font-medium">Estimation détaillée — tarifs réglementés 2026/2028</p>
                </div>
              </div>
            </div>
            {calculPret && (
              <div className="text-right">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <p className="text-sm text-indigo-600 font-medium mb-1">Total estimé des postes renseignés</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>
            )}
          </div>

          <OCRScanner
            onExtract={(data) => {
              const category = data.categoryKey && categoriesActes[data.categoryKey] ? data.categoryKey : '';
              const acte = category && data.acteKey && categoriesActes[category].actes[data.acteKey] ? data.acteKey : '';
              setSelectedCategory(category); setSelectedActe(acte);
              setSelectedDepartement(data.departement && departements[data.departement] ? data.departement : '');
              setMontantActe(data.montant ?? '');
              setDonationParticipants([nouveauDonateur('donateur-1')]); setDonationPublication('');
              setBailBases({suite:0,residuelle:0,publication:0}); setSureteBases({tpf:'',csi:''});
              setFormalitesAjoutees([]); setDepensesAjoutees([]); setAppliquerRemise(false); setQuotiteSurete(.5);
              appliquerConfigParDefaut(acte,setDebours,setFormalites,setDocuments,setTaxes);
              setTaxes(t=>({...t,valeurMobilier:data.valeurMobilier??0,complement:0,primoAccedant:false,accessoiresSurete:20,regimePartage:'standard',actifNetPartage:undefined,valeurImmoPartage:0,reprisesNaturePartage:0}));
              setEmolumentsDetail({bruts:0,majoration:0,avantRemise:0,remise10:0,remise20:0,nets:0});
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Département
              </label>
              <select
                value={selectedDepartement}
                onChange={(e) => setSelectedDepartement(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Département à préciser</option>
                {Object.entries(departements).map(([code, dept]) => (
                  <option key={code} value={code}>
                    {code} - {dept.nom}
                    {dept.majoration > 0 && ` • +${dept.majoration}%`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Catégorie d&apos;acte</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedActe('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Sélectionnez...</option>
                {Object.entries(categoriesActes).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Type d&apos;acte</label>
              <select
                value={selectedActe}
                onChange={(e) => setSelectedActe(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
              >
                <option value="">Sélectionnez...</option>
                {selectedCategory && Object.entries(categoriesActes[selectedCategory].actes).map(([key, acte]) => (
                  <option key={key} value={key}>{acte.label}</option>
                ))}
              </select>
            </div>
          </div>

          {estActeNonTarife && acteActuel && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <FileEdit className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">⚖️ Acte non tarifé - Honoraires libres</h3>
                  <p className="text-sm text-blue-800 mb-3">{acteActuel.description}</p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-gray-900 mb-1">💰 Estimation des honoraires</p>
                    <p className="text-lg font-bold text-indigo-600">{acteActuel.honorairesEstimes}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Ces honoraires sont libres et doivent être convenus avec votre notaire.
                      Ils ne sont pas réglementés par le décret n°2020-179.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedActe && !donation && !estActeNonTarife && categoriesActes[selectedCategory]?.actes[selectedActe]?.type === 'proportionnel' && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{actesConfig[selectedActe]?.taxes?.type==='partage'?'Assiette des émoluments : actif brut, déduction faite des legs particuliers':'Montant de l’opération'}</label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  aria-label="Assiette des émoluments"
                  value={montantActe}
                  onChange={(e) => setMontantActe(e.target.value)}
                  placeholder="450 000"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-lg font-medium"
                />
              </div>
            </div>
          )}
          
          {actesConfig[selectedActe]?.taxes?.type==='partage'&&<div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">Actif net partagé soumis au droit de partage (€)<input type="number" min="0" className="mt-2 w-full rounded-lg border p-3" value={taxes.actifNetPartage??''} placeholder="À défaut : assiette saisie ci-dessus" onChange={e=>setTaxes(t=>({...t,actifNetPartage:e.target.value===''?undefined:Number(e.target.value)}))}/></label>
              <label className="text-sm font-semibold">Valeur immobilière publiée pour la CSI (€)<input type="number" min="0" className="mt-2 w-full rounded-lg border p-3" value={taxes.valeurImmoPartage??0} onChange={e=>setTaxes(t=>({...t,valeurImmoPartage:Math.max(0,Number(e.target.value))}))}/></label>
            </div>
            {selectedActe==='partage'&&<label className="mt-4 block text-sm font-semibold">Reprises en nature (€), émolument complémentaire de 0,484 % HT<input type="number" min="0" className="mt-2 w-full rounded-lg border p-3" value={taxes.reprisesNaturePartage??0} onChange={e=>setTaxes(t=>({...t,reprisesNaturePartage:Math.max(0,Number(e.target.value))}))}/></label>}
            <p className="mt-3 text-sm">Le droit de partage porte sur l’actif net après passif admissible (CGI 747), au taux de 2,5 % ou 1,1 % dans les cas prévus de divorce, séparation de corps ou rupture de PACS. Si le champ net est laissé vide, aucun passif distinct n’est déduit. Les émoluments utilisent leur propre assiette selon le tarif sélectionné (A444-121 ou A444-122). La CSI n’est calculée que sur les droits immobiliers publiés ; un partage uniquement mobilier ne produit pas de CSI. Minimum de perception du droit proportionnel : 25 € (CGI 674), sauf exonération particulière.</p>
            <p className="mt-2 text-sm">Ce calcul vise un partage pur et simple. Les soultes, attributions à des tiers et rapports et régimes particuliers nécessitent une liquidation complémentaire ; le régime de faveur des partages successoraux ne s’applique pas à toute indivision.</p>
          </div>}
          {['contrat_mariage','changement_regime'].includes(selectedActe)&&<p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm">Sans apport ou jusqu’à 30 800 € : 188,68 € HT ; au-delà, barème sur la valeur entière (A444-82). Enregistrement gratuit en l’absence d’imposition proportionnelle ou progressive (CGI 847). Donations, liquidation, partage et mutations immobilières éventuelles nécessitent leurs calculs propres.</p>}
          {selectedActe==='testament'&&<p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm">Cette estimation porte sur la rédaction du testament authentique. L’enregistrement intervient après le décès (CGI 636) : le droit de 125 € prévu par le CGI 680 sera alors à distinguer des frais de rédaction.</p>}
          {selectedActe==='liquidation_regime'&&<p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm">Tarif du projet de liquidation (A444-83), pas celui de l’acte de partage définitif. Pour un partage, sélectionner « Partage » (A444-121). En cas de désignation judiciaire au titre du 10° de l’article 255 du code civil, l’émolument du projet s’impute sur celui du partage ensuite reçu par le même notaire.</p>}
          {selectedActe==='constitution_societe'&&<p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm">Émoluments de l’apport immobilier uniquement. L’enregistrement gratuit des apports purs et simples (CGI 810) ne couvre pas toutes les opérations : apport d’un non-assujetti à une société à l’IS, passif repris et apport à titre onéreux peuvent entraîner des droits proportionnels. Ces droits doivent être liquidés selon le dossier et ajoutés dans Taxes : le total reste partiel tant que cette qualification n’est pas établie.</p>}
          {selectedActe==='bail_construction'&&<div className="mt-4 rounded-xl bg-blue-50 p-4 space-y-3 text-sm">
            <p>Assiette principale ci-dessus : versements, constructions et droits remis au cours des cinq premières années, hors entretien et réparations (A444-104, 1°).</p>
            <label className="block">Assiette pondérée des années suivantes (€)<input aria-label="Bail : assiette des années suivantes" type="number" min="0" className="block w-full border rounded p-2" value={bailBases.suite} onChange={e=>setBailBases(b=>({...b,suite:Math.max(0,Number(e.target.value))}))}/></label>
            <p>Pour le 2° : montant entier des années 6 à 20, moitié des années 21 à 60, quart au-delà. Inclure les constructions et droits remis dans ces périodes.</p>
            <label className="block">Valeur résiduelle en fin de bail appréciée au jour de l’acte (€)<input aria-label="Bail : valeur résiduelle" type="number" min="0" className="block w-full border rounded p-2" value={bailBases.residuelle} onChange={e=>setBailBases(b=>({...b,residuelle:Math.max(0,Number(e.target.value))}))}/></label>
            <label className="block">Assiette de publication pour la CSI (€)<input aria-label="Bail : assiette CSI" type="number" min="0" className="block w-full border rounded p-2" value={bailBases.publication} onChange={e=>setBailBases(b=>({...b,publication:Math.max(0,Number(e.target.value))}))}/></label>
            <p>Renseigner les trois assiettes selon le bail. Exonération de TPF du bail à construction (CGI 743, 1°) ; CSI distincte, à partir de l’assiette de publication, qui ne se réduit pas aux cinq premières années. Sans cette assiette, la CSI reste à compléter.</p>
          </div>}
          {ASSIETTES_SUCCESSORALES[selectedActe] && <p className="mt-4 p-4 bg-blue-50 rounded-xl text-sm">{ASSIETTES_SUCCESSORALES[selectedActe]} Les formalités et débours sont à ajuster aux prestations effectivement réalisées. <a className="underline" href="/succession">Calcul des droits de succession à l’État</a></p>}
          {getMajorationDOMTOM(selectedDepartement) > 0 && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Territoire DOM-TOM : {departements[selectedDepartement]?.nom}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    • Majoration : <strong>+{getMajorationDOMTOM(selectedDepartement)}%</strong> (Article A444-53)
                    <br />
                    • TVA : <strong>{getTauxTVA(selectedDepartement)}%</strong>
                    {getTauxTVA(selectedDepartement) === 0 && <span> - EXONÉRÉ (Article 294 CGI)</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {donation && <DonationPretaxeForm donateurs={donationParticipants} onChange={setDonationParticipants} publication={donationPublication} onPublicationChange={setDonationPublication} mobiliere={selectedActe==='donation_mobiliere'}/>}
          {acteActuel?.description && !estActeNonTarife && <p className="mt-4 rounded-lg bg-blue-50 p-4 text-sm">{acteActuel.description}</p>}
          {actesConfig[selectedActe]?.taxes?.type==='tpf'&&<div className="mt-4 grid gap-4 rounded-xl bg-blue-50 p-4 md:grid-cols-2">
            <label className="text-sm">Assiette de TPF distincte (€)<input aria-label="Assiette TPF du prêt" inputMode="decimal" className="mt-2 w-full rounded border p-3" value={sureteBases.tpf} onChange={e=>setSureteBases(p=>({...p,tpf:e.target.value}))} placeholder="À défaut : capital + accessoires"/></label>
            <label className="text-sm">Assiette de CSI distincte (€)<input aria-label="Assiette CSI du prêt" inputMode="decimal" className="mt-2 w-full rounded border p-3" value={sureteBases.csi} onChange={e=>setSureteBases(p=>({...p,csi:e.target.value}))} placeholder="À défaut : capital + accessoires"/></label>
            <p className="text-sm md:col-span-2">Ces bases peuvent différer du capital rémunérant l’acte et l’une de l’autre. Renseignez 0 uniquement si l’absence de perception est établie. Les autres inscriptions et droits fixes peuvent être ajoutés dans Débours.</p>
          </div>}
          {selectedActe&&!estActeNonTarife&&!calculPret&&<p role="status" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Complétez une assiette valide et la qualification des transmissions pour calculer la prétaxe. Aucun total définitif n’est affiché.</p>}

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={sauvegarderCalcul}
              disabled={!calculPret}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={() => exporterPretaxePDF(rapport)}
              disabled={!calculPret}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
            <button
              onClick={() => setAfficherHistorique(!afficherHistorique)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <History className="w-4 h-4" />
              Historique ({historiqueCalculs.length})
            </button>
            <button
              onClick={() => { appliquerConfigParDefaut(selectedActe, setDebours, setFormalites, setDocuments, setTaxes); setFormalitesAjoutees([]); setDepensesAjoutees([]); demanderRecalcul(n=>n+1); }}
              disabled={!selectedActe}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          </div>
        </div>
        
        {afficherHistorique && historiqueCalculs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Historique des calculs</h2>
              <button
                onClick={() => setAfficherHistorique(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {historiqueCalculs.map((calcul) => (
                <div key={calcul.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{calcul.acte}</p>
                      <p className="text-sm text-gray-600">{calcul.date}</p>
                      <p className="text-sm text-gray-600">Montant : {calcul.montant} €</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">{calcul.total.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!estActeNonTarife && selectedActe && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                <nav className="flex overflow-x-auto space-x-2 px-6 py-3" aria-label="Tabs">
                  {[
                    { id: 'emoluments', label: 'Émoluments', icon: Calculator },
                    { id: 'debours', label: 'Débours', icon: Euro },
                    { id: 'formalites', label: 'Formalités', icon: FileText },
                    { id: 'documents', label: 'Documents', icon: File },
                    { id: 'taxes', label: 'Taxes', icon: Building }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all transform ${
                        activeTab === tab.id
                          ? 'bg-white text-indigo-600 shadow-md scale-105 border-2 border-indigo-500'
                          : 'text-gray-600 hover:bg-white/50 hover:text-indigo-600 hover:scale-102'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : ''}`} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'emoluments' && (
                  <EmolumentsTab
                    emolumentsDetail={emolumentsDetail}
                    totalEmoluments={totalEmoluments}
                    montantTVA={montantTVA}
                    totalEmolumentsTTC={totalEmolumentsTTC}
                    tauxTVA={tauxTVA}
                    selectedDepartement={selectedDepartement}
                    montantActe={montantActe}
                    appliquerRemise={appliquerRemise}
                    setAppliquerRemise={setAppliquerRemise}
                    isRelatif={acteActuel?.relatif || false}
                    quotiteSurete={quotiteSurete}
                    setQuotiteSurete={setQuotiteSurete}
                  />
                )}

                {activeTab === 'debours' && (
                  <DeboursTab
                    debours={debours}
                    setDebours={setDebours}
                    ajoutees={depensesAjoutees}
                    setAjoutees={setDepensesAjoutees}
                    totalDebours={totalDebours}
                  />
                )}

                {activeTab === 'formalites' && (
                  <FormalitesTab
                    formalites={formalites}
                    ajoutees={formalitesAjoutees}
                    setAjoutees={setFormalitesAjoutees}
                    majoration={majoration}
                    setFormalites={setFormalites}
                    totalFormalitesTTC={totalFormalitesTTC}
                    tauxTVA={tauxTVA}
                    selectedActe={selectedActe}
                  />
                )}

                {activeTab === 'documents' && (
                  <DocumentsTab
                    documents={documents}
                    majoration={majoration}
                    forfait={formalites.publiciteFonciere.actif}
                    setDocuments={setDocuments}
                    totalDocumentsTTC={totalDocumentsTTC}
                    tauxTVA={tauxTVA}
                  />
                )}

                {activeTab === 'taxes' && (
                  <TaxesTab
                    taxes={taxes}
                    setTaxes={setTaxes}
                    totalTaxes={totalTaxes}
                    selectedDepartement={selectedDepartement}
                    montantActe={montantActe}
                    regimeTaxe={actesConfig[selectedActe]?.taxes?.type || 'aucune'}
                    assiettesSurete={assiettesSurete}
                    csi={debours.csi}
                    taxesAjoutees={depensesAjoutees.filter(d=>d.nature==='taxes')}
                  />
                )}
              </div>
            </div>

            {calculPret && <PretaxeReport rapport={rapport}/>}
          </>
        )}
      </div>
    </div>
  );
}

export default function PretaxeIntelligente() {
  return (
    <MainLayout showFeedback={false}>
      <PretaxeContent />
    </MainLayout>
  );
}
