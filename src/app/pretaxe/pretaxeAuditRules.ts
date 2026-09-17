import type { ActeConfig, EmolumentsDetail, TrancheTarif } from './PretaxeTypes';
import { lireMontant, sommeMontants, arrondirCentimes } from '@/lib/montants';

const tranches = (rates: number[]): TrancheTarif[] => rates.map((taux, i) => ({ min: [0,6500,17000,60000][i], max: [6500,17000,60000,Infinity][i], taux }));

export const ACTES_PRECIS: Record<string, ActeConfig> = {
  pret_professionnel: { label: 'Prêt destiné à financer une activité professionnelle', type: 'proportionnel', tranches: tranches([2.128,.878,.585,.439]), description: 'A444-139 : choisir selon la destination du prêt, et non la seule qualité de l’emprunteur.' },
  donation_mobiliere: { label: 'Donation uniquement de créances, espèces ou valeurs mobilières cotées', type: 'proportionnel', tranches: tranches([2.322,.958,.639,.479]), description: 'A444-67, 4° : ne couvre pas toutes les parts sociales non cotées ni une donation-partage.' },
  partage_indivis: { label: 'Partage de biens indivis (A444-122)', type: 'proportionnel', tranches: tranches([2.580,1.064,.709,.532]), description: 'Émolument A444-122. Le taux fiscal du partage dépend séparément de son régime.' },
};

export const estDonation = (key: string) => ['donation','donation_partage','donation_mobiliere'].includes(key);
export interface TransmissionDonation {
  id: string;
  bien: string;
  beneficiaires: string;
  pleinePropriete: string;
  droit: 'pleine_propriete' | 'nue_propriete_reserve' | 'autre';
}
export interface DonateurPretaxe {
  id: string;
  nom: string;
  transmissions: TransmissionDonation[];
}
export const nouveauDonateur = (id: string): DonateurPretaxe => ({ id, nom: '', transmissions: [{id: id + '-1', bien: '', beneficiaires: '', pleinePropriete: '', droit: 'pleine_propriete'}] });

/** Regroupement par donateur, sans répéter les premières tranches par bien/enfant. */
export function basesDonation(donateurs: DonateurPretaxe[]) {
  return donateurs.map((d, i) => {
    const values = d.transmissions.map(t => lireMontant(t.pleinePropriete));
    const valide = values.length > 0 && values.every(v => v !== null && v > 0) && d.transmissions.every(t => t.droit !== 'autre');
    return { id: d.id, nom: d.nom.trim() || `Donateur ${i + 1}`, valide, base: valide ? sommeMontants(values as number[]) : 0 };
  });
}
export const additionnerEmoluments = (details: EmolumentsDetail[]): EmolumentsDetail => {
  const total = {bruts:0, majoration:0, avantRemise:0, remise10:0, remise20:0, nets:0};
  for (const key of Object.keys(total) as (keyof EmolumentsDetail)[]) total[key] = sommeMontants(details.map(d => d[key]));
  return total;
};

/** R444-9 / A444-175 : toutes les lignes réglementées liées à la mutation. */
export function calculerEcretement(base: number, eligible: boolean, acteHT: number, formalitesHT: number, documentsHT: number) {
  if (!eligible || !Number.isFinite(base) || base <= 0) return 0;
  return arrondirCentimes(Math.max(0, sommeMontants([acteHT, formalitesHT, documentsHT]) - Math.max(90, base * .1)));
}
