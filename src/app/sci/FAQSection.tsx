// ============================================
// FILE: src/app/sci/FAQSection.tsx
// DESCRIPTION: Composant FAQ pour le simulateur SCI
// ============================================

"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const faqData = [
    {
      category: "Création et fonctionnement",
      questions: [
        {
          q: "Qu'est-ce qu'une SCI et à quoi sert-elle ?",
          r: "**Une Société Civile Immobilière (SCI) est une structure juridique** permettant à plusieurs personnes (minimum 2 associés) de détenir et gérer ensemble un patrimoine immobilier.\n\n**🎯 Objectifs principaux :**\n• **Gestion simplifiée** : facilite la prise de décision à plusieurs (exit l'indivision)\n• **Transmission facilitée** : permet de donner progressivement des parts plutôt que le bien entier\n• **Protection patrimoniale** : sépare le bien immobilier de votre patrimoine personnel\n• **Optimisation fiscale** : choix entre IR et IS selon votre stratégie\n\n**💡 Exemple concret :**\nVous achetez un immeuble à 500 000 €. Plutôt que d'être propriétaires en indivision, vous créez une SCI avec 500 parts de 1 000 € chacune. Chaque associé détient un nombre de parts proportionnel à son apport.\n\n**⚠️ Attention :** La SCI ne peut exercer d'activité commerciale (revente rapide de biens).",
          source: "Articles 1832 et suivants du Code civil"
        },
        {
          q: "Peut-on créer une SCI seul ou doit-on être plusieurs ?",
          r: "**🚫 NON, impossible de créer seul une SCI à l'origine**\n\n**Minimum légal :**\n• **2 associés minimum** obligatoires à la création\n• Personnes physiques OU morales (autre société)\n• Peuvent être conjoints, famille, amis, partenaires d'affaires\n\n**✅ Exception temporaire :**\nUne SCI peut devenir unipersonnelle **temporairement** dans certains cas :\n• Décès d'un associé\n• Rachat de toutes les parts par un seul associé\n• Divorce avec attribution de toutes les parts\n\n**⚠️ Important :** Si la situation unipersonnelle perdure, il faut :\n• Régulariser rapidement (trouver un nouvel associé)\n• OU transformer en société unipersonnelle\n• OU dissoudre la SCI\n\n**💡 Astuce :** Vous pouvez créer une SCI avec seulement 1% des parts pour le 2ème associé, tout en conservant 99% du contrôle.",
          source: "Article 1832 du Code civil"
        },
        {
          q: "Quel est le montant minimum de capital social pour créer une SCI ?",
          r: "**💰 AUCUN CAPITAL MINIMUM REQUIS !**\n\n**En théorie :**\n• Vous pouvez créer une SCI avec 1 € de capital\n• La loi n'impose aucun montant minimum\n• Grande flexibilité selon votre projet\n\n**En pratique - Recommandations :**\n• **Capital symbolique (100-1 000 €)** : SCI familiale sans emprunt\n• **Capital moyen (5 000-10 000 €)** : SCI classique avec financement bancaire\n• **Capital élevé (20 000 € +)** : SCI avec acquisitions importantes\n\n**💡 Bon à savoir :**\n• Un capital trop faible peut compliquer l'obtention d'un prêt bancaire\n• Les banques regardent le ratio capital/emprunt\n• Un capital plus élevé rassure les créanciers\n\n**Types d'apports possibles :**\n• **Numéraire** : argent versé sur le compte de la SCI\n• **Nature** : apport d'un bien immobilier existant (nécessite un notaire)\n• **Industrie** : apport de compétences (rare en SCI)",
          source: "Article 1835 du Code civil"
        },
        {
          q: "Quelles sont les étapes pour créer une SCI ?",
          r: "**📋 PROCESSUS EN 5 ÉTAPES**\n\n**1️⃣ RÉDACTION DES STATUTS**\n• Acte sous seing privé (entre vous) OU acte notarié (recommandé si apport immobilier)\n• Définir : objet social, capital, répartition des parts, gérance, modalités de décision\n• Coût : gratuit à 2 000 € selon complexité\n\n**2️⃣ CONSTITUTION ET DÉPÔT DU CAPITAL**\n• Ouvrir un compte bancaire provisoire\n• Verser les apports en numéraire\n• Obtenir l'attestation de dépôt\n\n**3️⃣ PUBLICATION DANS UN JOURNAL D'ANNONCES LÉGALES (JAL)**\n• Annonce obligatoire pour être opposable aux tiers\n• Coût : 150-250 € selon département\n\n**4️⃣ IMMATRICULATION AU GREFFE**\n• Via le guichet unique : formalites.entreprises.gouv.fr\n• Dossier avec : statuts, JAL, justificatifs d'identité, attestation de dépôt\n• Délai : 7-15 jours en moyenne\n\n**5️⃣ RÉCEPTION DU KBIS**\n• Document officiel attestant l'existence juridique de votre SCI\n• La SCI est née ! 🎉\n\n**💰 Budget total création :** 500 à 3 000 € selon si vous faites appel à un professionnel",
          source: "Articles L123-1 et suivants du Code de commerce"
        }
      ]
    },
    {
      category: "IR ou IS : Choisir le bon régime fiscal",
      questions: [
        {
          q: "Quelle est la différence entre SCI à l'IR et SCI à l'IS ?",
          r: "**C'est LA question cruciale qui impacte toute votre fiscalité !**\n\n**🔍 SCI À L'IMPÔT SUR LE REVENU (IR) - Régime par défaut**\n• **Transparence fiscale** : la SCI ne paie pas d'impôt\n• Chaque associé déclare sa quote-part des revenus dans sa déclaration personnelle\n• Imposition au **barème progressif** de l'IR (0% à 45%)\n• + **17,2% de prélèvements sociaux** sur les revenus fonciers\n• Pas d'amortissement du bien possible\n• Déficit foncier déductible (max 10 700 €/an)\n\n**🏢 SCI À L'IMPÔT SUR LES SOCIÉTÉS (IS) - Sur option**\n• **Opacité fiscale** : la SCI est imposée comme une entreprise\n• Taux d'imposition : **15%** sur les 1ers 42 500 € puis **25%** au-delà\n• **Amortissement du bien déductible** (environ 2-3% par an sur 30-50 ans)\n• Déficit reportable sur 10 ans (illimité en montant)\n• Distribution de dividendes taxée : flat tax 30% ou barème IR\n• Plus-values taxées comme des bénéfices (pas d'abattement pour durée de détention)\n\n**⚠️ ATTENTION : L'option IS est IRRÉVERSIBLE après 5 ans !**",
          source: "Articles 8, 206 et 239 du CGI"
        },
        {
          q: "SCI à l'IR ou à l'IS : quel régime choisir selon ma situation ?",
          r: "**🎯 Voici le guide de décision :**\n\n**✅ CHOISISSEZ L'IR SI :**\n• Vous êtes dans une **tranche d'imposition faible** (0-30%)\n• Vous souhaitez **distribuer régulièrement** les revenus locatifs\n• C'est une **SCI familiale** pour transmettre un patrimoine\n• Vous prévoyez de **revendre à moyen terme** (abattements pour durée de détention)\n• Vous voulez une **gestion comptable simplifiée**\n• Revenus fonciers < 15 000 € (éligibilité micro-foncier)\n\n**✅ CHOISISSEZ L'IS SI :**\n• Vous êtes dans une **tranche élevée** (41% ou 45%)\n• Vous voulez **réinvestir les loyers** dans de nouveaux biens\n• Vous avez des **travaux importants** à déduire\n• Objectif : **capitalisation long terme** sans distribution\n• Vous voulez **amortir le bien** pour réduire l'impôt\n• Revenus locatifs élevés et charges importantes\n\n**📊 EXEMPLE CONCRET :**\nRevenu locatif net : 30 000 €/an\n• **IR (TMI 45%)** : Impôt ≈ 18 660 € (45% + 17,2% PS)\n• **IS + dividendes** : IS 6 375 € (15%+25%) + flat tax sur distribution ≈ total 15 000 €\n→ **Économie IS : 3 660 €/an** dans ce cas\n\n**💡 Conseil :** Utilisez notre simulateur pour comparer selon VOTRE situation !",
          source: "Code général des impôts"
        },
        {
          q: "Peut-on passer d'une SCI à l'IR à une SCI à l'IS (et inversement) ?",
          r: "**📝 PASSAGE IR → IS : OUI, mais irréversible**\n\n**Comment opter pour l'IS ?**\n• **À la création** : mentionner l'option dans les statuts\n• **En cours de vie** : notification au service des impôts dans les 3 premiers mois de l'exercice fiscal\n• Formulaire : déclaration n°2072-S-SD\n• Modification des statuts nécessaire\n\n**⚠️ ATTENTION - IRRÉVERSIBILITÉ :**\n• L'option pour l'IS devient **DÉFINITIVE après 5 ans**\n• Avant 5 ans : possibilité de renoncer (sous conditions strictes)\n• Après 5 ans : AUCUN retour en arrière possible\n\n**💀 Conséquences du passage IR → IS :**\n• Réévaluation des actifs à la valeur de marché\n• Imposition immédiate des plus-values latentes (!)  \n• Nouvelle comptabilité obligatoire dès le passage\n• Amortissements commencent à partir du passage\n\n**📊 PASSAGE IS → IR : IMPOSSIBLE (après 5 ans)**\n• Avant 5 ans : renonciation possible sous conditions très strictes\n• Après 5 ans : vous êtes verrouillés à l'IS définitivement\n\n**💡 Recommandation :** Faites-vous conseiller par un expert-comptable AVANT d'opter pour l'IS. C'est une décision stratégique majeure !",
          source: "Article 239 du CGI, BOI-IS-CHAMP-10-20"
        },
        {
          q: "Qu'est-ce que l'amortissement en SCI à l'IS et comment ça marche ?",
          r: "**🏢 L'amortissement : le grand avantage fiscal de la SCI à l'IS**\n\n**Principe de l'amortissement :**\n• Chaque année, vous déduisez une fraction du prix d'achat du bien\n• Cela réduit artificiellement votre résultat imposable\n• **Seules les constructions sont amortissables** (pas le terrain)\n• Durée typique : **30 à 50 ans** selon les composants\n\n**📋 AMORTISSEMENT PAR COMPOSANTS :**\n• **Gros œuvre** : 50-80 ans (structure, murs porteurs)\n• **Toiture** : 25-40 ans\n• **Façade** : 20-50 ans\n• **Installations** : 15-25 ans (électricité, plomberie)\n• **Agencements** : 10-15 ans (cloisons, sols)\n\n**💡 EXEMPLE CONCRET :**\nAchat d'un immeuble à 500 000 € :\n• Terrain : 100 000 € (non amortissable)\n• Construction : 400 000 € (amortissable)\n• Amortissement linéaire sur 40 ans = 10 000 €/an déductible\n\n**Impact fiscal :**\n• Revenus locatifs : 35 000 €\n• Charges : -10 000 €\n• **Amortissement : -10 000 €**\n• **Résultat imposable : 15 000 €** (au lieu de 25 000 € sans amortissement)\n• IS à 15% = 2 250 € au lieu de 3 750 €\n• **Économie : 1 500 €/an** grâce à l'amortissement\n\n**⚠️ Revers de la médaille :**\nLors de la revente, la plus-value sera plus élevée car calculée sur la valeur nette comptable (prix d'achat - amortissements cumulés) et non sur le prix d'achat initial.",
          source: "Article 39 du CGI"
        }
      ]
    },
    {
      category: "Transmission et stratégie patrimoniale",
      questions: [
        {
          q: "Pourquoi la SCI facilite-t-elle la transmission de patrimoine ?",
          r: "**🎁 La SCI : l'outil idéal pour transmettre progressivement**\n\n**Avantage n°1 : Donation de parts plutôt que du bien entier**\n• Vous pouvez donner des parts petit à petit\n• Évite de donner tout le bien d'un coup\n• Permet d'utiliser les **abattements tous les 15 ans**\n\n**💰 Abattements en ligne directe (parent → enfant) :**\n• **100 000 € par enfant tous les 15 ans** (en pleine propriété)\n• **100 000 € par petit-enfant tous les 15 ans**\n• Ces abattements se renouvellent automatiquement\n\n**📊 EXEMPLE STRATÉGIE OPTIMISÉE :**\nVous possédez un immeuble de 900 000 € dans une SCI, 3 enfants :\n\n**Année 1 :**\n• Don de 100 000 € de parts à chaque enfant = 300 000 € transmis\n• **0 € de droits** (dans l'abattement)\n\n**Année 16 :**  \n• Nouveaux abattements disponibles !\n• Don de 100 000 € à chaque enfant = 300 000 € transmis\n• **0 € de droits**\n\n**Année 31 :**\n• Don des 300 000 € restants\n• **0 € de droits**\n\n→ **900 000 € transmis sur 30 ans SANS AUCUN DROIT !**\n\n**Avantage n°2 : Conserver le contrôle**\n• En tant que gérant, vous gardez le pouvoir de décision\n• Même en ayant donné des parts, vous gérez toujours\n• Possibilité de vous nommer gérant inamovible dans les statuts\n\n**Avantage n°3 : Démembrement possible**\n• Vous pouvez donner la nue-propriété et conserver l'usufruit\n• Vous gardez les loyers et l'usage du bien\n• Transmission fiscalement avantageuse selon votre âge",
          source: "Articles 757 et 779 du CGI"
        },
        {
          q: "Qu'est-ce que le démembrement de propriété en SCI ?",
          r: "**👴👶 Le démembrement : diviser pour mieux transmettre**\n\n**Principe du démembrement :**\nLa propriété d'une part de SCI peut être divisée en 2 :\n• **Usufruit** : droit d'utiliser le bien et d'en percevoir les revenus\n• **Nue-propriété** : droit de disposer du bien (propriété \"à nu\")\n\n**🎯 Stratégie patrimoniale classique :**\n• Parents donnent la **nue-propriété** aux enfants\n• Parents conservent l'**usufruit**\n• À leur décès, l'usufruit s'éteint automatiquement\n• Enfants deviennent pleins propriétaires **SANS droits de succession supplémentaires**\n\n**💰 BARÈME FISCAL de l'usufruit (Art. 669 CGI) :**\n\n**Âge de l'usufruitier → Valeur usufruit / Valeur nue-propriété**\n• Moins de 21 ans : 90% / 10%\n• 21 à 30 ans : 80% / 20%\n• 31 à 40 ans : 70% / 30%\n• 41 à 50 ans : 60% / 40%\n• 51 à 60 ans : 50% / 50%\n• 61 à 70 ans : 40% / 60%\n• 71 à 80 ans : 30% / 70%\n• 81 à 90 ans : 20% / 80%\n• Plus de 90 ans : 10% / 90%\n\n**📊 EXEMPLE CONCRET :**\nParts de SCI valant 500 000 €, donateur âgé de 65 ans\n• Valeur de l'usufruit : 500 000 × 40% = **200 000 €**\n• Valeur de la nue-propriété : 500 000 × 60% = **300 000 €**\n\n**Donation de la nue-propriété à 3 enfants :**\n• 300 000 € à transmettre ÷ 3 = 100 000 € par enfant\n• Abattement 100 000 € = **0 € de droits de donation**\n\n**💡 Triple avantage :**\n1. Transmission fiscale optimisée immédiatement\n2. Parents gardent les revenus locatifs\n3. À leur décès, pleine propriété sans nouveaux droits",
          source: "Article 669 du CGI"
        },
        {
          q: "SCI familiale : quels avantages pour la transmission ?",
          r: "**👨‍👩‍👧‍👦 La SCI familiale : l'outil patrimonial par excellence**\n\n**Définition :**\n• SCI dont tous les associés sont membres de la même famille\n• Parents, enfants, petits-enfants, frères et sœurs, conjoints\n• Régime juridique identique à une SCI classique\n• Mais usage et optimisations spécifiques\n\n**🎯 AVANTAGES TRANSMISSION :**\n\n**1. Éviter l'indivision successorale**\n• Sans SCI : au décès, bien en indivision → blocages fréquents\n• Avec SCI : parts réparties selon les statuts → gestion fluide\n• Pas d'unanimité requise pour les décisions\n\n**2. Donations progressives optimisées**\n• Utilisation intelligente des abattements tous les 15 ans\n• Possibilité de donation-partage anticipée\n• Égalité entre les enfants facilitée\n\n**3. Protection du conjoint survivant**\n• Statuts adaptables (usufruit, quotité disponible)\n• Clause de préciput possible\n• Maintien dans les lieux garanti\n\n**4. Pacte Dutreil familial**\n• Réduction de 75% de la valeur taxable sous conditions\n• Engagement collectif de conservation de 2 ans minimum\n• Puis engagement individuel de 4 ans\n\n**💼 AVANTAGES GESTION :**\n• Gérant désigné : pas besoin de l'accord de tous pour chaque décision\n• Transmission de la gérance anticipée possible\n• Formation progressive des héritiers à la gestion\n\n**⚖️ AVANTAGES FISCAUX :**\n• Régime IR recommandé pour SCI familiale\n• Possibilité de déficit foncier\n• Abattements donation en ligne directe\n• Pas de plus-value en cas de transmission par décès\n\n**💡 Conseil :** Pour une SCI familiale, privilégiez généralement le régime IR pour sa simplicité et son avantage lors de la transmission.",
          source: "Articles 787 B et 787 C du CGI"
        }
      ]
    },
    {
      category: "Comptabilité et obligations",
      questions: [
        {
          q: "Quelles sont les obligations comptables d'une SCI ?",
          r: "**📊 Obligations variables selon le régime fiscal**\n\n**🟢 SCI À L'IR (Régime simplifié)**\n\n**Obligations minimales :**\n• Tenir un **livre des recettes et dépenses** (livre-journal)\n• Conserver les **pièces justificatives** (factures, relevés bancaires)\n• Établir un **bilan annuel simplifié** (recommandé, pas obligatoire)\n• **PAS de dépôt des comptes** au greffe\n• **PAS d'obligation d'expert-comptable**\n\n**Déclarations fiscales IR :**\n• **Déclaration n°2072** : déclaration annuelle des revenus de la SCI\n• **Annexe 2072-S** si associés imposables (le plus courant)\n• **Annexe 2072-C** si société associée\n• Date limite : **2ème jour ouvré suivant le 1er mai** (vers le 3 mai)\n\n**🔴 SCI À L'IS (Comptabilité commerciale)**\n\n**Obligations COMPLÈTES :**\n• **Comptabilité en partie double** (obligatoire)\n• Tenue de 3 livres : journal, grand livre, livre d'inventaire\n• **Bilan comptable annuel**\n• **Compte de résultat**\n• **Annexe comptable**\n• **DÉPÔT des comptes** au greffe (dans les 6 mois de la clôture)\n• **Expert-comptable FORTEMENT recommandé**\n\n**Déclarations fiscales IS :**\n• **Liasse fiscale** (formulaires 2033 ou 2050 selon le régime)\n• **Déclaration de résultat n°2065**\n• **IFU** (Imprimé Fiscal Unique) si distribution de dividendes\n\n**📅 Assemblée générale annuelle :**\n• **Obligatoire chaque année** (IR et IS)\n• Approbation des comptes\n• Affectation du résultat\n• Rédaction d'un **procès-verbal**\n• Conservation du PV pendant 10 ans minimum\n\n**💰 Coûts estimés :**\n• **SCI IR sans expert-comptable** : 0-500 €/an\n• **SCI IR avec expert-comptable** : 800-1 500 €/an\n• **SCI IS avec expert-comptable** : 1 500-3 000 €/an",
          source: "Articles L123-12 et L232-21 du Code de commerce"
        },
        {
          q: "Un mineur peut-il être associé d'une SCI ?",
          r: "**👶 OUI, un mineur peut être associé d'une SCI**\n\n**Comment un mineur devient associé ?**\n• **Par apport** lors de la création\n• **Par donation** de parts de la part de ses parents/grands-parents\n• **Par succession** en héritant de parts\n• **Par achat** de parts (avec autorisation)\n\n**⚖️ Représentation légale obligatoire :**\n• Le mineur est représenté par ses **représentants légaux**\n• Père et mère **conjointement** (si autorité parentale conjointe)\n• OU tuteur avec **autorisation du conseil de famille**\n• OU juge des tutelles selon les cas\n\n**📋 Actes autorisés SANS autorisation spéciale :**\n• Perception des revenus (loyers)\n• Actes conservatoires et d'administration courante\n• Vote en assemblée générale ordinaire\n\n**🚨 Actes nécessitant AUTORISATION du juge des tutelles :**\n• **Vente ou apport d'un bien** du mineur à la SCI\n• **Emprunt** au nom du mineur\n• **Vente de parts** de SCI appartenant au mineur\n• **Cautionnement** ou garantie\n• **Décisions extraordinaires** (dissolution, fusion)\n\n**💡 Avantage patrimonial :**\nIntégrer un mineur permet d'optimiser les donations :\n• Profiter de l'abattement de 100 000 € par parent et par enfant\n• Tous les 15 ans\n• Constitution progressive d'un patrimoine pour l'enfant\n\n**⚠️ Attention - Conflit d'intérêts :**\n• Si le mineur ET ses parents sont tous associés\n• ET qu'il y a conflit d'intérêts dans une décision\n• Un **administrateur ad hoc** doit être nommé par le juge\n\n**🔞 À la majorité :**\n• Le majeur peut continuer ou céder ses parts librement\n• Il devient pleinement responsable de ses décisions",
          source: "Articles 389-3 et 389-5 du Code civil"
        },
        {
          q: "Compte courant d'associé (CCA) : comment ça fonctionne ?",
          r: "**💰 Le compte courant d'associé : prêter de l'argent à votre propre SCI**\n\n**Définition :**\n• L'associé **avance de l'argent** à la SCI\n• La SCI lui doit cette somme (c'est une dette)\n• L'associé devient **créancier** de sa propre société\n• Ce n'est PAS un apport au capital\n\n**📊 Différence capital social vs compte courant :**\n• **Capital social** : définitif, parts sociales, pas remboursable facilement\n• **Compte courant** : temporaire, remboursable à tout moment (si trésorerie)\n\n**💡 Pourquoi utiliser un CCA ?**\n• Financer des **travaux** sans augmenter le capital\n• Apporter de la **trésorerie** en cas de besoin\n• **Rémunération possible** par des intérêts\n• **Remboursement non fiscalisé** (contrairement aux dividendes)\n\n**🔍 INTÉRÊTS DU COMPTE COURANT :**\n\n**Plafond de taux (2025) :**\n• Taux maximum déductible : **4,48%** (taux TME 2025)\n• Au-delà, non déductible fiscalement pour la SCI\n• Révisé trimestriellement\n\n**Fiscalité des intérêts pour l'associé :**\n• Imposés au **Prélèvement Forfaitaire Unique (PFU)** de **30%**\n  - 12,8% d'impôt\n  - 17,2% de prélèvements sociaux\n• OU option pour le barème progressif de l'IR\n\n**Fiscalité pour la SCI :**\n• **SCI à l'IR** : intérêts déductibles des revenus fonciers (dans la limite du taux TME)\n• **SCI à l'IS** : intérêts déductibles du résultat imposable (avec plafonnement)\n\n**📋 EXEMPLE D'OPTIMISATION :**\nCCA de 50 000 € rémunéré à 4% :\n• Intérêts annuels : **2 000 €** versés à l'associé\n• **Pour la SCI IR** : déduction de 2 000 € = économie IR ~1 100 € (TMI 30% + PS 17,2%)\n• **Pour l'associé** : taxation à 30% = 600 € d'impôt\n• **Gain net familial** : 1 100 - 600 = **+500 €**\n\n**⚠️ Points de vigilance :**\n• Convention réglementée si gérant associé\n• Intérêts déductibles uniquement si capital entièrement libéré\n• Taux ne doit pas dépasser le TME + majoration\n• Remboursement du CCA non fiscalisé",
          source: "Article 39-1-3° du CGI, BOI-RFPI-BASE-20-20"
        }
      ]
    },
    {
      category: "Cas particuliers et pièges à éviter",
      questions: [
        {
          q: "Quels sont les principaux inconvénients d'une SCI ?",
          r: "**⚠️ Les faces cachées de la SCI à connaître absolument**\n\n**1. RESPONSABILITÉ ILLIMITÉE DES ASSOCIÉS**\n• Contrairement aux SARL/SAS, les associés de SCI sont **responsables indéfiniment**\n• En cas de dettes, vos **biens personnels** peuvent être saisis\n• Responsabilité proportionnelle aux parts détenues\n• Les créanciers peuvent poursuivre sur votre patrimoine personnel\n\n**💡 Parade :** Souscrire des assurances adaptées et ne pas sous-capitaliser la SCI\n\n**2. FORMALISME ADMINISTRATIF**\n• Assemblée générale annuelle obligatoire\n• PV à rédiger et conserver\n• Déclarations fiscales spécifiques\n• Modification des statuts nécessite publicité\n• Coûts de fonctionnement (expert-comptable, formalités)\n\n**3. COÛTS DE CRÉATION ET GESTION**\n• Création : 500-3 000 € (statuts, publication, immatriculation)\n• Gestion annuelle : 800-3 000 € si expert-comptable\n• Frais bancaires du compte professionnel\n• Assurances spécifiques\n\n**4. RIGIDITÉ DE LA STRUCTURE**\n• Vente de parts plus complexe qu'un bien en direct\n• Agrément des associés souvent requis\n• Liquidité faible des parts\n• Dissolution complexe et coûteuse\n\n**5. OPTION IS IRRÉVERSIBLE**\n• Une fois l'option IS prise et dépassé 5 ans → DÉFINITIF\n• Impossible de revenir à l'IR\n• Conséquences lourdes en cas de mauvais choix\n\n**6. FISCALITÉ DE LA PLUS-VALUE À LA REVENTE**\n• **SCI IS** : plus-value taxée comme bénéfice ordinaire (pas d'abattement)\n• Sur la valeur nette comptable (prix - amortissements)\n• Peut être très pénalisant\n\n**7. PAS D'ACTIVITÉ COMMERCIALE**\n• Interdiction de faire du marchand de biens\n• Pas de revente rapide (activité commerciale)\n• Location meublée = risque de basculement automatique à l'IS\n\n**8. COMPLEXITÉ EN CAS DE DÉSACCORD**\n• Conflits entre associés difficiles à résoudre\n• Peut nécessiter une procédure judiciaire\n• Sortie d'un associé compliquée\n\n**💰 COMPARAISON PATRIMONIALE :**\n• **Sans SCI** : vente du bien = droits de mutation ~8%\n• **Avec SCI** : vente de parts = droits d'enregistrement 5% + complexité accrue\n\n**💡 Conseil :** La SCI est un outil puissant mais complexe. Elle n'est pertinente QUE dans des situations spécifiques (transmission, gestion à plusieurs, optimisation fiscale). Pour un simple investissement locatif seul, souvent inutile.",
          source: "Articles 1857 et 1858 du Code civil"
        },
        {
          q: "Peut-on faire de la location meublée en SCI ?",
          r: "**🛋️ Location meublée en SCI : attention danger fiscal !**\n\n**⚠️ PRINCIPE : La location meublée est une ACTIVITÉ COMMERCIALE**\n\n**Conséquence automatique :**\n• Si la SCI fait de la location meublée\n• Elle **bascule automatiquement à l'IS**\n• **SANS que vous l'ayez choisi !**\n• Même si vous vouliez rester à l'IR\n\n**📊 Règle des 10% (Tolérance fiscale) :**\n• Si les revenus de location meublée < **10% du CA total**\n• La SCI reste à l'IR\n• Au-delà de 10% → IS obligatoire\n\n**💡 EXEMPLE :**\n**Revenus SCI :**\n• Location nue : 30 000 €/an\n• Location meublée : 2 500 €/an\n• Total : 32 500 €\n• Part meublée : 2 500 / 32 500 = **7,7%** → ✅ Toléré, reste à l'IR\n\n**Mais si meublé = 4 000 € :**\n• Part meublée : 4 000 / 34 000 = **11,7%** → ❌ Basculement automatique à l'IS\n\n**🏢 SI VOUS VOULEZ FAIRE DU MEUBLÉ MAJORITAIREMENT :**\n\n**Option 1 : SCI à l'IS assumée**\n• Vous optez volontairement pour l'IS\n• Vous pouvez faire du meublé sans limite\n• Fiscalité IS classique (15% puis 25%)\n• Amortissement du bien et du mobilier\n• Avantage : régime BIC au lieu de foncier\n\n**Option 2 : Créer une structure différente**\n• **Pas une SCI classique** mais :\n• SARL de famille (si famille)\n• SAS / SASU pour du meublé professionnel\n• Ces structures sont commerciales par nature\n\n**Option 3 : SCI + Société commerciale**\n• SCI détient le bien nu\n• Société commerciale prend à bail et sous-loue meublé\n• Montage complexe, réservé aux pros\n\n**⚠️ PIÈGES À ÉVITER :**\n• **Piège n°1** : Vous créez une SCI IR et faites du meublé majoritaire\n  → L'administration vous bascule d'office à l'IS\n  → Avec régularisations fiscales rétroactives possibles\n\n• **Piège n°2** : Vous optez pour l'IS sans comprendre\n  → Vous êtes bloqués à l'IS à vie après 5 ans\n  → Plus-value à la revente très taxée\n\n**🎯 RECOMMANDATION :**\n• **Location nue majoritaire** → SCI IR classique ✅\n• **Location meublée majoritaire** → SARL de famille ou SAS ✅\n• **Mixte** → Bien surveiller le seuil des 10%",
          source: "Article 206 du CGI, Doctrine BOI-IS-CHAMP-10-10"
        },
        {
          q: "SCI et Impôt sur la Fortune Immobilière (IFI) : comment ça marche ?",
          r: "**🏛️ IFI : Les parts de SCI sont-elles taxables ?**\n\n**📊 PRINCIPE GÉNÉRAL :**\n• Les parts de SCI détenues par une personne physique **SONT soumises à l'IFI**\n• Valeur imposable = valeur vénale des parts (valeur de marché)\n• Seuil d'imposition IFI : **1 300 000 €** de patrimoine immobilier net taxable\n\n**🔍 ÉVALUATION DE LA VALEUR DES PARTS :**\n\n**Pour une SCI patrimoniale classique :**\n• Valeur = **valeur vénale des biens immobiliers** détenus par la SCI\n• Proportionnelle à votre quote-part\n• Moins les dettes de la SCI\n\n**💡 EXEMPLE :**\nSCI possède un immeuble de 1 000 000 €\n• Emprunt restant : 400 000 €\n• Vous détenez 50% des parts\n\n**Calcul IFI :**\n• Actif SCI : 1 000 000 €\n• Dettes déductibles : - 400 000 €\n• Valeur nette SCI : 600 000 €\n• Votre quote-part (50%) : **300 000 €** à déclarer à l'IFI\n\n**💰 DETTES DÉDUCTIBLES de l'IFI :**\n\n**✅ Déductibles :**\n• **Emprunts bancaires** contractés pour l'acquisition\n• **Compte courant d'associé** (sous conditions)\n• **Travaux d'amélioration** financés par emprunt\n• **Impôts fonciers** dus au 1er janvier\n\n**❌ Non déductibles :**\n• Dettes entre associés (sauf CCA sous conditions strictes)\n• Prêts familiaux non officiels\n• Dépenses courantes\n\n**🚨 RÉGIME SPÉCIAL : SCI soumise à l'IS**\n\n**Exonération partielle possible :**\n• Si la SCI IS exerce une activité **opérationnelle** (location meublée, para-hôtelière)\n• Seule la fraction d'actif immobilier **non affecté à l'activité** est taxable\n• Sinon, taxable comme une SCI IR normale\n\n**📅 DÉCLARATION IFI :**\n• **Annexe à la déclaration de revenus** (déclaration n°2042-IFI)\n• Date limite : même date que la déclaration de revenus (mai-juin)\n• Déclaration obligatoire si patrimoine net taxable > 1 300 000 €\n\n**💡 STRATÉGIES D'OPTIMISATION :**\n\n**1. Conserver des dettes déductibles**\n• Ne pas rembourser l'emprunt trop vite si IFI\n• Maintenir un CCA rémunéré plutôt que des dividendes\n\n**2. Démembrement**\n• Donation de la nue-propriété des parts\n• L'usufruitier est imposé à l'IFI sur 100% (car il a les revenus)\n• Mais optimisation successorale\n\n**3. SCI IS avec activité meublée**\n• Permet potentiellement une exonération partielle\n• Mais contraintes de l'IS à évaluer\n\n**📊 BARÈME IFI 2025 :**\n• De 0 à 800 000 € : 0%\n• De 800 000 à 1 300 000 € : 0,50%\n• De 1 300 000 à 2 570 000 € : 0,70%\n• De 2 570 000 à 5 000 000 € : 1%\n• De 5 000 000 à 10 000 000 € : 1,25%\n• Au-delà de 10 000 000 € : 1,50%\n\n**Mécanisme de décote :** \nSi patrimoine entre 1 300 000 et 1 400 000 €, décote applicable",
          source: "Articles 964 à 983 du CGI"
        },
        {
          q: "Que se passe-t-il en cas de dissolution de la SCI ?",
          r: "**💀 Dissoudre une SCI : mode d'emploi et conséquences**\n\n**🔍 CAUSES DE DISSOLUTION :**\n\n**1. Dissolution volontaire :**\n• Décision des associés en assemblée générale extraordinaire\n• Majorité requise définie dans les statuts\n• Motif le plus courant\n\n**2. Dissolution de plein droit :**\n• **Arrivée du terme** (durée prévue dans les statuts, max 99 ans)\n• **Réalisation de l'objet social** (rare)\n• **Extinction de l'objet social** (impossible à réaliser)\n• **Associé unique** depuis plus d'1 an (sauf régularisation)\n\n**3. Dissolution judiciaire :**\n• Demandée par un associé pour **justes motifs**\n• Mésentente grave entre associés\n• Paralysie du fonctionnement\n• Décidée par le tribunal\n\n**📋 PROCÉDURE DE DISSOLUTION :**\n\n**Étape 1 : Décision de dissolution**\n• Assemblée générale extraordinaire (AGE)\n• PV de dissolution rédigé\n• Nomination d'un **liquidateur** (souvent l'ancien gérant)\n\n**Étape 2 : Publication et enregistrement**\n• Publication dans un journal d'annonces légales\n• Dépôt au greffe du tribunal de commerce\n• Modification du RCS\n\n**Étape 3 : Liquidation du patrimoine**\n• Le liquidateur **vend les biens** de la SCI OU les **attribue** aux associés\n• Rembourse les dettes de la SCI\n• Établit un **bilan de liquidation**\n\n**Étape 4 : Clôture de la liquidation**\n• AGE d'approbation des comptes de liquidation\n• Répartition du boni ou du mali entre associés\n• Publication JAL de clôture\n• Radiation définitive du RCS\n\n**💰 CONSÉQUENCES FISCALES :**\n\n**🟢 SCI À L'IR :**\n\n**En cas d'attribution des biens aux associés :**\n• **PAS de taxation immédiate** si l'associé reprend le bien proportionnellement à ses parts\n• L'associé \"continue\" fiscalement la SCI\n• Conservation de la date d'acquisition d'origine\n• La plus-value sera taxée lors de la **revente ultérieure** par l'associé\n\n**En cas de vente des biens par la SCI avant dissolution :**\n• **Plus-value immobilière classique** (abattements pour durée de détention)\n• Taxation de chaque associé sur sa quote-part\n\n**🔴 SCI À L'IS :**\n\n**⚠️ Attention : fiscalité beaucoup plus lourde !**\n\n**Boni de liquidation :**\n• Différence entre l'actif net final et le capital social\n• **Taxation en 2 temps** :\n  1. IS sur le boni de liquidation : **25%** (ou 15% + 25%)\n  2. Puis taxation chez l'associé comme un dividende : **30%** flat tax\n  3. **Double imposition !**\n\n**💡 EXEMPLE SCI IS :**\nBien acheté 300 000 €, amorti 100 000 €, vendu 400 000 €\n• Plus-value comptable : 400 000 - (300 000 - 100 000) = **200 000 €**\n• IS sur la plus-value : 200 000 × 25% = **50 000 €**\n• Reste distribué aux associés : 150 000 €\n• Flat tax 30% sur 150 000 : **45 000 €**\n• **Total fiscalité : 95 000 €** (soit 47,5% de la plus-value !)\n\n**Vs SCI IR dans le même cas :**\n• Plus-value : 400 000 - 300 000 = 100 000 €\n• Avec 20 ans de détention : exonération IR totale, PS réduits\n• **Fiscalité totale : ~15 000 €**\n\n**💡 STRATÉGIES POUR LIMITER L'IMPACT :**\n\n**Avant dissolution :**\n• **Échelonner les ventes** pour utiliser les tranches basses d'IS\n• **Distribuer des dividendes** avant dissolution pour réduire l'actif net\n• **Vendre les parts** plutôt que dissoudre (taxation différente)\n\n**📑 DOCUMENTS À CONSERVER :**\n• Tous les PV (dissolution, liquidation, clôture)\n• Bilans de liquidation\n• Preuves de paiement des créanciers\n• Publications JAL\n• Attestation de radiation RCS\n• **Conservation : 10 ans minimum**",
          source: "Articles 1844-7 du Code civil et 201 du CGI"
        }
      ]
    }
  ];

  // Calculer le nombre total de questions
  const totalQuestions = faqData.reduce((acc, category) => acc + category.questions.length, 0);

  return (
    <div className="space-y-8">
      {/* En-tête principal de la FAQ */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <HelpCircle className="w-8 h-8" />
              Questions fréquentes sur les SCI
            </h2>
            <p className="text-blue-100 text-lg">
              Tout ce que vous devez savoir sur la création, la gestion et la fiscalité d'une SCI
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border-2 border-white/30">
            <div className="text-center">
              <p className="text-5xl font-bold">{totalQuestions}</p>
              <p className="text-blue-100 font-semibold mt-1">
                {totalQuestions > 1 ? 'questions' : 'question'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Catégories de questions */}
      {faqData.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête de catégorie */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">{categoryIndex === 0 ? '🏢' : categoryIndex === 1 ? '💰' : categoryIndex === 2 ? '🎁' : categoryIndex === 3 ? '📊' : '⚠️'}</span>
                {category.category}
              </h3>
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {category.questions.length} {category.questions.length > 1 ? 'questions' : 'question'}
              </span>
            </div>
          </div>

          {/* Questions de la catégorie */}
          <div className="divide-y divide-gray-100">
            {category.questions.map((item, qIndex) => {
              const uniqueKey = `${categoryIndex}-${qIndex}`;
              const isOpen = openIndex === uniqueKey;

              return (
                <div key={qIndex} className="transition-all duration-200">
                  {/* Question */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : uniqueKey)}
                    className="w-full px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:text-blue-700" />
                      <span className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                        {item.q}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Réponse */}
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2">
                      <div className="pl-8 space-y-3">
                        {/* Contenu de la réponse avec support du markdown */}
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                          {item.r.split('\n').map((paragraph, pIndex) => {
                            if (!paragraph.trim()) return null;
                            
                            // Gestion des titres en gras
                            if (paragraph.match(/^\*\*.*\*\*$/)) {
                              return (
                                <p key={pIndex} className="font-bold text-gray-900 mt-4 mb-2">
                                  {paragraph.replace(/\*\*/g, '')}
                                </p>
                              );
                            }
                            
                            // Gestion des listes à puces
                            if (paragraph.match(/^[•·]/)) {
                              return (
                                <li key={pIndex} className="ml-4">
                                  {paragraph.replace(/^[•·]\s*/, '').split('**').map((part, i) => 
                                    i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                                  )}
                                </li>
                              );
                            }
                            
                            // Paragraphe normal avec support du gras
                            return (
                              <p key={pIndex} className="mb-2">
                                {paragraph.split('**').map((part, i) => 
                                  i % 2 === 0 ? part : <strong key={i} className="font-semibold text-gray-900">{part}</strong>
                                )}
                              </p>
                            );
                          })}
                        </div>

                        {/* Source légale */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 italic flex items-center gap-2">
                            <span className="font-semibold">📚 Source :</span>
                            {item.source}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Section d'avertissement final */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⚠️</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-amber-900 mb-2">
              Ces informations sont fournies à titre indicatif
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Chaque situation est unique. Les conseils d'un <strong>notaire</strong>, <strong>avocat fiscaliste</strong>, 
              ou <strong>expert-comptable</strong> sont indispensables avant toute décision importante concernant 
              la création, la gestion ou la fiscalité d'une SCI. Les informations ci-dessus sont basées sur la 
              législation en vigueur en 2025 et sont susceptibles d'évoluer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}