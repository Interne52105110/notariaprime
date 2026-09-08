// src\app\pretaxe\TaxesTab.tsx

import React from 'react';
import { Taxes, departements } from './PretaxeTypes';

interface TaxesTabProps {
  taxes: Taxes;
  setTaxes: React.Dispatch<React.SetStateAction<Taxes>>;
  totalTaxes: number;
  selectedDepartement: string;
  montantActe: string;
  regimeTaxe: string;
}

export default function TaxesTab({
  taxes,
  setTaxes,
  totalTaxes,
  selectedDepartement,
  montantActe,
  regimeTaxe
}: TaxesTabProps) {
  const prix = parseFloat((montantActe || '').replace(/\s/g, '')) || 0;
  const mobilier = Number(taxes.valeurMobilier) || 0;
  const assietteDMTO = Math.max(0, prix - mobilier);
  const ratioMobilier = prix > 0 ? (mobilier / prix) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Taxe de publicité foncière (hypothèque) */}
      {regimeTaxe === 'tpf' && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Taxe de publicité foncière (hypothèque)</h3>

          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Accessoires de la sûreté (% du capital)
            </label>
            <div className="flex gap-2">
              {[20, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTaxes(prev => ({ ...prev, accessoiresSurete: pct }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    (taxes.accessoiresSurete ?? 20) === pct
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  +{pct}&nbsp;%
                </button>
              ))}
              <input
                type="number"
                min="0"
                step="1"
                value={taxes.accessoiresSurete ?? 20}
                onChange={(e) => setTaxes(prev => ({ ...prev, accessoiresSurete: Number(e.target.value) || 0 }))}
                className="w-24 px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-base"
              />
            </div>
            <p className="text-xs text-amber-800 mt-2">
              L&apos;assiette de la TPF et de la CSI est le <strong>capital garanti majoré des
              accessoires</strong> (intérêts, frais, indemnités), usuellement <strong>+20 %</strong>
              (ou +15 %). Ex. : un prêt de 70 000 € donne une assiette de 84 000 €.
            </p>
            {prix > 0 && (
              <div className="flex justify-between text-sm font-semibold text-gray-900 mt-2">
                <span>= Assiette TPF / CSI</span>
                <span>{Math.round(prix * (1 + (taxes.accessoiresSurete ?? 20) / 100)).toLocaleString('fr-FR')} €</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxe de publicité foncière (0,715 %)</span>
              <span className="font-medium">{(taxes.tpf || 0).toFixed(2)} €</span>
            </div>
            <p className="text-xs text-gray-500">
              L&apos;inscription d&apos;une hypothèque conventionnelle est soumise à la taxe de
              publicité foncière de 0,715 % de l&apos;assiette (CGI art. 663 et 844), et
              non aux droits de mutation. La contribution de sécurité immobilière (0,05 %)
              figure dans l&apos;onglet Débours. Les droits sont arrondis à l&apos;euro (CGI art. 1724).
            </p>
            <p className="text-xs text-gray-500 border-t border-gray-200 pt-2">
              <strong>Double sûreté</strong> (privilège de prêteur de deniers + hypothèque
              conventionnelle) : une seule TPF est due (le PPD en est exonéré), mais
              <strong> deux CSI</strong> — une par inscription. Ajoutez la seconde CSI
              manuellement le cas échéant.
            </p>
          </div>
        </div>
      )}

      {/* Droit de partage */}
      {regimeTaxe === 'partage' && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Droit de partage</h3>
          <div className="space-y-3 mb-4">
            <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                checked={(taxes.regimePartage ?? 'standard') === 'standard'}
                onChange={() => setTaxes(prev => ({ ...prev, regimePartage: 'standard' }))}
                className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium text-gray-900">Partage ordinaire (2,50 %)</span>
                <p className="text-sm text-gray-600">Succession, indivision, copropriété…</p>
              </div>
            </label>
            <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                checked={taxes.regimePartage === 'divorce'}
                onChange={() => setTaxes(prev => ({ ...prev, regimePartage: 'divorce' }))}
                className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-medium text-gray-900">Divorce / séparation / rupture de PACS (1,10 %)</span>
                <p className="text-sm text-gray-600">Partage des intérêts patrimoniaux (depuis le 1ᵉʳ janvier 2022)</p>
              </div>
            </label>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Droit de partage ({taxes.regimePartage === 'divorce' ? '1,10' : '2,50'} %)
              </span>
              <span className="font-medium">{(taxes.droitPartage || 0).toFixed(2)} €</span>
            </div>
            <p className="text-xs text-gray-500">
              CGI art. 746 — calculé sur l&apos;actif net partagé. Le droit est ramené à 1,10 %
              pour les partages consécutifs à un divorce, une séparation de corps ou une
              rupture de PACS.
            </p>
          </div>
        </div>
      )}

      {/* DMTO (vente / mutation à titre onéreux) */}
      {(regimeTaxe === 'dmto' || regimeTaxe === 'tva') && (
        <>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Type de bien</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  value="ancien"
                  checked={taxes.typeBien === 'ancien'}
                  onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
                  className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Bien ancien</span>
                  <p className="text-sm text-gray-600">Soumis aux droits de mutation</p>
                </div>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  value="neuf"
                  checked={taxes.typeBien === 'neuf'}
                  onChange={(e) => setTaxes(prev => ({ ...prev, typeBien: e.target.value }))}
                  className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Bien neuf (VEFA)</span>
                  <p className="text-sm text-gray-600">Vente soumise à TVA : taxe de publicité foncière réduite en complément</p>
                </div>
              </label>
            </div>
          </div>

          <p className="text-xs text-gray-600">Taux départementaux : tableau DGFiP au 1er juin 2026, vérifié le 8 septembre 2026. Les réductions locales conditionnelles nécessitent un calcul adapté. <a href="https://www.impots.gouv.fr/droits-denregistrement" className="underline">Source DGFiP</a></p>
          {taxes.typeBien === 'neuf' && <div className="p-4 bg-blue-50 rounded-xl text-sm">Assiette à renseigner hors TVA immobilière. TPF : {taxes.departementale.toLocaleString('fr-FR')} € ; frais d’assiette : {taxes.fraisAssiette.toLocaleString('fr-FR')} €. La TVA du prix immobilier n’est pas ajoutée aux frais de notaire.</div>}
          {taxes.typeBien === 'ancien' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Droits de mutation</h3>

              {(departements[selectedDepartement]?.taux ?? 0) > 4.50 && (
                <label className="flex items-start p-4 mb-4 border border-indigo-200 bg-indigo-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxes.primoAccedant === true}
                    onChange={(e) => setTaxes(prev => ({ ...prev, primoAccedant: e.target.checked }))}
                    className="mt-1 mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Primo-accédant (résidence principale)</span>
                    <p className="text-xs text-gray-600 mt-1">
                      LF 2025 art. 116 — exonération de la hausse votée par le département (taux ramené à 4,50%).
                      L&apos;acquéreur s&apos;engage à affecter le bien à sa résidence principale pendant 5 ans.
                    </p>
                  </div>
                </label>
              )}

              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Valeur du mobilier vendu (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={mobilier || ''}
                  onChange={(e) => setTaxes(prev => ({ ...prev, valeurMobilier: Number(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-base"
                />
                <p className="text-xs text-amber-800 mt-2">
                  <strong>Art. 735 CGI</strong> — Les meubles meublants vendus avec le bien
                  (cuisine équipée, électroménager, etc.) sont déduits de l&apos;assiette des DMTO.
                  Prix distinct et estimation des meubles dans l’acte (CGI 735). Un
                  inventaire détaillé et estimatif est requis.
                </p>
                {prix > 0 && mobilier > 0 && (
                  <p className={`text-xs mt-2 font-medium text-amber-900`}>
                    Mobilier = {ratioMobilier.toFixed(1)} % du prix
                    {' — estimation détaillée requise'}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="space-y-3">
                  {mobilier > 0 && (
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Prix total de la vente</span>
                        <span>{prix.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>− Valeur mobilier (hors DMTO)</span>
                        <span>− {mobilier.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-gray-900 mt-1">
                        <span>= Assiette des DMTO</span>
                        <span>{assietteDMTO.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Taxe départementale ({taxes.primoAccedant && (departements[selectedDepartement]?.taux ?? 0) > 4.50
                        ? '4,50 — primo-accédant'
                        : departements[selectedDepartement]?.taux}%)
                    </span>
                    <span className="font-medium">{taxes.departementale.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxe communale (1,20%)</span>
                    <span className="font-medium">{taxes.communale.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Frais d&apos;assiette (2,37%)</span>
                    <span className="font-medium">{taxes.fraisAssiette.toFixed(2)} €</span>
                  </div>
                  {mobilier > 0 && (
                    <p className="text-[11px] text-gray-500 italic pt-1">
                      Les émoluments du notaire et la CSI restent calculés sur le prix total
                      ({prix.toLocaleString('fr-FR')} €).
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Droit fixe d'enregistrement */}
      {(taxes.droitFixe || 0) > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Droit fixe d&apos;enregistrement</span>
            <span className="font-medium">{(taxes.droitFixe || 0).toFixed(2)} €</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Droit fixe perçu par l&apos;État sur cet acte (CGI 680 ou 846 bis selon sa nature).
          </p>
        </div>
      )}

      {/* Acte non soumis à une taxe automatique */}
      {regimeTaxe !== 'tpf' && regimeTaxe !== 'partage' && regimeTaxe !== 'dmto' && regimeTaxe !== 'tva' && (taxes.droitFixe || 0) === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-600 text-sm">
            {regimeTaxe === 'donation'
              ? "Acte soumis aux droits de mutation à titre gratuit (donation/succession) : utilisez le calculateur Donation pour les abattements et le barème progressif."
              : "Cet acte n'est pas soumis à une taxe de mutation calculée automatiquement."}
          </p>
        </div>
      )}

      <label className="block text-sm font-medium">Droits complémentaires liquidés selon le dossier (€)
        <input aria-label="Droits complémentaires" type="number" min="0" step="1" className="mt-2 block w-full rounded-lg border p-3" value={taxes.complement??0} onChange={e=>setTaxes(t=>({...t,complement:Math.max(0,Math.round(Number(e.target.value)))}))}/>
        <span className="mt-2 block text-xs text-gray-500">Ajouter uniquement les droits non inclus ci-dessus : donation, succession, apport ou cession de parts, par exemple. Éviter de compter deux fois une même taxe. Montant à justifier par la liquidation du dossier.</span>
      </label>
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">Total des taxes</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {totalTaxes.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}