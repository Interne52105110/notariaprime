# Cours — Comptable-taxateur notarial (à jour 2025/2026)

> Support de révision personnel. Les montants/taux évoluent : à recouper avec
> l'arrêté tarifaire en vigueur et les délibérations de ton département.
> Dernière mise à jour des sources : mai 2026.

---

## 0. Le métier en une phrase

Le **comptable-taxateur** d'un office notarial fait deux métiers liés :

1. **Taxateur** — il *taxe* les actes : il calcule ce que coûte chaque acte
   (émoluments du notaire + droits et taxes de l'État + débours), établit la
   **demande de provision** au client, puis le **décompte définitif** après
   formalités.
2. **Comptable** — il tient la **comptabilité notariale**, une comptabilité
   *spéciale et réglementée* : comptes clients individualisés, maniement des
   fonds des tiers via la Caisse des Dépôts (CDC), rapprochements, et
   préparation des **inspections** annuelles.

C'est exactement le périmètre que couvre NotariaPrime côté `/pretaxe` pour la
partie taxe — ton calculateur EST un outil de taxateur.

---

# PARTIE A — LA TAXE (taxation des actes)

## A.1 Les 3 composantes des « frais de notaire »

Ce que le client appelle « frais de notaire » se décompose en trois blocs.
**Le notaire ne garde que le premier** (et reverse le reste) :

| Bloc | Pour qui | Part typique (vente ancien) |
|------|----------|------------------------------|
| **Émoluments** (+ TVA 20 %) | le notaire | ~10–15 % du total |
| **Droits et taxes** (DMTO, TVA, CSI…) | l'État / le département / la commune | ~80 % |
| **Débours / frais** | tiers (cadastre, géomètre, syndic, formalités) | ~5–10 % |

Mémo : sur un achat ancien, les « frais » ≈ **7–8 %** du prix ; sur du **neuf**,
≈ **2–3 %** (pas de DMTO, mais TVA sur le prix).

## A.2 Émoluments du notaire

### a) Émoluments proportionnels (le cœur)
Barème **national dégressif par tranches** (art. A444-x C. com.), tarif fixé par
**arrêté du 25 février 2026, applicable jusqu'au 29 février 2028**.

Tranches (taux HT appliqués à la tranche, **pas** au tout) :

| Tranche d'assiette | Taux |
|--------------------|------|
| 0 → 6 500 € | **3,870 %** |
| 6 500 → 17 000 € | **1,596 %** |
| 17 000 → 60 000 € | **1,064 %** |
| au-delà de 60 000 € | **0,799 %** |

> ⚠️ On applique le taux **dans chaque tranche** puis on additionne (calcul
> « par tranches », jamais le taux du haut sur la totalité). Puis **+ TVA 20 %**.

**Exemple** (assiette 200 000 €) :
- 0–6 500 : 6 500 × 3,870 % = 251,55 €
- 6 500–17 000 : 10 500 × 1,596 % = 167,58 €
- 17 000–60 000 : 43 000 × 1,064 % = 457,52 €
- 60 000–200 000 : 140 000 × 0,799 % = 1 118,60 €
- **Total HT = 1 995,25 €** → + TVA 20 % = **2 394,30 € TTC**

### b) Émoluments de formalité (fixes)
Montants fixes (en « unités de valeur ») pour les formalités annexes :
copies exécutoires, demandes d'état hypothécaire, publication, etc.

### c) La remise (nouveauté 2026)
La **remise** que le notaire peut consentir sur les émoluments proportionnels :
- plafond porté de **10 % → 20 %**,
- seuil d'application abaissé : dès **100 000 €** d'assiette (avant 150 000 €).
La remise doit être **fixe par tranche d'acte** et **identique pour tous les
clients** (pas de remise « à la tête du client »).

### d) Honoraires libres
Pour les prestations **hors tarif réglementé** (conseil, négociation,
consultations), le notaire fixe librement ses **honoraires** (convention
d'honoraires écrite). À distinguer absolument des émoluments tarifés.

## A.3 Droits et taxes (reversés à l'État / collectivités)

### a) DMTO — Droits de Mutation à Titre Onéreux (vente d'ancien)
Composé de :
- **droit départemental** : historiquement **4,50 %**, désormais **jusqu'à 5,00 %**
  (voir actu LF 2025, §C.2) ;
- **taxe communale** : **1,20 %** ;
- **frais d'assiette et de recouvrement de l'État** : **2,37 % du droit départemental**.

Total « plein tarif » : ~**5,80 %** historiquement → **jusqu'à ~6,31 %** avec la
hausse départementale. **Vérifier le taux voté par le département** (le tien :
Cantal/15 pour Aurillac).

### b) Vente dans le NEUF / VEFA
Pas de DMTO classique : la mutation est soumise à **TVA (20 %)** sur le prix
(déjà incluse dans le prix annoncé) et à une **taxe de publicité foncière
réduite** (~**0,715 %**). D'où des « frais » réduits (2–3 %).

### c) CSI — Contribution de Sécurité Immobilière
Versée à l'État pour les formalités de publicité foncière. Taux **0,10 %** du
prix (taux normal). Remplace l'ancien « salaire du conservateur ».

### d) Droit de partage
Sur les partages (succession, divorce, indivision) : **2,50 %** de l'actif net
partagé ; **réduit à 1,80 %** pour les partages de communauté/indivision
consécutifs à divorce/séparation/succession.

### e) Droits de mutation à titre gratuit (donation / succession)
Calcul après **abattements** (ex. 100 000 € parent-enfant) puis **barème
progressif** par tranches. (Repris dans `/donation` de NotariaPrime.)

### f) Droit fixe
Certains actes sans valeur taxable supportent un **droit fixe** (ex. 125 €).

## A.4 Débours
Sommes **avancées par le notaire pour le compte du client** et reversées à des
tiers : état hypothécaire, géomètre/document d'arpentage, syndic (pré-état daté),
publication, frais de cadastre, etc. Refacturés à l'euro près, **sans marge**.

## A.5 Logique de taxation par type d'acte (mémo)

| Acte | Émoluments | Droits/taxes principaux |
|------|-----------|--------------------------|
| Vente **ancien** | proportionnels (barème) | DMTO (~5,8–6,3 %) + CSI 0,10 % |
| Vente **neuf/VEFA** | proportionnels | TVA (dans le prix) + TPF 0,715 % + CSI |
| **Donation** | proportionnels sur valeur | DMTG après abattements (barème progressif) |
| **Succession** | proportionnels (déclaration) | DMTG ; émoluments de notoriété/attestation |
| **Prêt / hypothèque** | proportionnels sur capital | taxe publicité foncière + CSI + cont. additionnelle |
| **Partage** | proportionnels | droit de partage 2,50 % (ou 1,80 %) |

---

# PARTIE B — LA COMPTABILITÉ NOTARIALE

## B.1 Pourquoi c'est une comptabilité « spéciale »
Le notaire **manie en permanence l'argent des clients** (prix de vente, fonds
de prêt, droits à reverser). La comptabilité notariale est donc **réglementée
et contrôlée** pour garantir que **chaque euro client est représenté** à tout
instant. Référence : règlement comptable de la profession + dispositions du
**Code (discipline et comptabilité)**.

## B.2 Comptes clients & plan comptable notarial
- Chaque dossier a un **compte client individualisé**.
- Les fonds de tiers sont enregistrés dans des subdivisions du compte
  **« 542 100 — comptes de dépôts clients »**.
- **Règle d'or : aucun compte client ne doit être débiteur.** Un solde
  débiteur = le notaire a payé avec l'argent d'un *autre* client → faute grave,
  premier point regardé en inspection.

## B.3 Maniement des fonds — CDC
- Les fonds détenus (hors petites espèces autorisées) sont déposés à la
  **Caisse des Dépôts et Consignations (CDC)**, sur des **comptes de
  disponibilités courantes**.
- **Seuls les fonds de tiers** y figurent (pas l'argent propre de l'office).
- Les mouvements **débit** ne sont possibles que pour régler l'affaire à
  l'origine du dépôt.

### Règle des espèces
- Pas plus de **3 000 €** en espèces **plus de 2 jours ouvrables**,
- et **≤ 5 %** du total des fonds détenus.

### Consignation après 3 mois
Les sommes restées sur les comptes de disponibilités courantes **au-delà de
3 mois** sont transférées sur des **comptes de dépôts obligatoires** à la CDC
(consignation). À surveiller : les dossiers « dormants ».

## B.4 La provision préalable (lien taxe ↔ compta)
**Avant de signer**, le notaire doit exiger la **consignation d'une somme
suffisante** pour couvrir émoluments, droits, débours et taxes. C'est le
taxateur qui chiffre cette **demande de provision**. Sous-provisionner →
risque de solde débiteur ; sur-provisionner → restitution à gérer.

## B.5 Travaux comptables récurrents du poste
- **Rapprochements bancaires** (CDC + banque) ;
- **lettrage** / pointage des écritures par dossier ;
- chasse aux **comptes clients débiteurs** et aux **soldes anciens** ;
- **décompte définitif** et **restitution du trop-perçu** au client ;
- déclarations et reversements (DMTO, TVA, CSI…) dans les délais ;
- préparation des **états périodiques** et du bilan de l'office.

## B.6 Contrôle & inspection
- **Inspection de comptabilité annuelle**, en principe **inopinée**, de chaque
  office (organisée par la Chambre/le Conseil régional).
- La **trésorerie** et la **représentation des fonds clients** sont les points
  centraux.
- Filet de sécurité de la profession : **garantie collective** — si un office
  fait défaut, les fonds clients sont garantis. C'est ce qui fonde la confiance
  du public ; d'où la sévérité des contrôles.

---

# PARTIE C — ACTUALITÉS & TEXTES RÉCENTS (2025/2026)

### C.1 Réforme du tarif réglementé — arrêté du 25 février 2026
- Nouveau **tarif des notaires** fixé **jusqu'au 29 février 2028** (révision
  quinquennale obligatoire, ministères Justice + Économie).
- **Remise** : plafond **10 % → 20 %**, seuil **150 000 € → 100 000 €**.
- Barème proportionnel inchangé dans sa structure à 4 tranches (cf. A.2).

### C.2 Loi de finances 2025 — DMTO (art. 116)
- Les **départements** peuvent relever leur droit de **+0,5 point** (jusqu'à
  **5,00 %**), du **1ᵉʳ avril 2025 au 30 avril 2028** (mesure **temporaire**).
- Beaucoup de départements ont voté la hausse → frais d'achat ancien qui montent
  vers **~6,3 %**.
- **Exonération/atténuation primo-accédants** : l'acquéreur qui n'a pas été
  propriétaire de sa résidence principale dans les **2 ans** précédents, et qui
  achète sa **résidence principale**, **échappe à la hausse**. Les départements
  peuvent en plus **réduire/exonérer** les DMTO pour une première propriété, sous
  **engagement d'occupation ≥ 5 ans**.
- ⚠️ Le statut « primo-accédant » et l'achat conjoint (un seul primo) restent
  **flous** : points de vigilance pour le taxateur (bien qualifier l'acquéreur).

### C.3 Maniement des fonds & intérêts (analyses 2025)
Rappel renforcé en 2025 sur le **traitement des sommes maniées** et des
**intérêts produits** par les fonds clients (qui appartiennent à la collectivité
des notaires / régime spécifique, pas à l'office). Sujet sensible en inspection.

---

# PARTIE D — GENAPI / iNot COMPTA (l'outil)

> Tu connais Genapi **côté rédaction** (iNot Actes). Le module **compta** a une
> logique distincte — c'est ton principal point à monter en compétence.

- Suite **iNot (Genapi / groupe Septeo)** : la rédaction et la compta partagent
  le **dossier**, mais le module compta a ses écrans propres.
- Fonctions clés du module compta : **saisie comptable** par dossier, **demandes
  de provision** et **décomptes**, **rapprochements**, **lettrage**, **états**
  (trésorerie, comptes clients débiteurs), interface **CDC** et virements,
  édition des **relevés/décomptes client**.
- Ce qui change vs côté clerc : tu ne rédiges plus l'acte, tu **rattaches les
  flux financiers** au dossier et tu **contrôles** que tout est représenté.
- 💡 **À négocier à l'embauche** : une **formation Genapi/Septeo au module
  compta**. C'est standard et ça lève ton doute principal. Demande aussi quelques
  jours de **doublure** avec le/la comptable en poste.

---

# PARTIE E — POINTS D'ATTENTION / PIÈGES DU TAXATEUR

1. **Calcul par tranches** : ne jamais appliquer 0,799 % sur toute l'assiette.
2. **Neuf vs ancien** : pas de DMTO dans le neuf, mais TVA + TPF réduite.
3. **Taux DMTO départemental** : vérifier la **délibération** du département
   (mouvant depuis avril 2025) et la **qualité primo-accédant**.
4. **Provision suffisante** : sous-estimer → compte client débiteur en inspection.
5. **Débours** : refacturés au réel, sans marge ; ne pas les confondre avec les
   émoluments.
6. **Comptes débiteurs = interdit** : le réflexe n°1 du contrôle.
7. **Dossiers > 3 mois** : penser à la consignation CDC.
8. **TVA** : 20 % sur émoluments + honoraires ; attention aux régimes TVA sur la
   mutation neuf.
9. **Remise** : si l'office en pratique une, elle doit être **uniforme** et tracée.
10. **Restitution du trop-perçu** : à rembourser au client après décompte
    définitif (pas de fonds qui « traînent »).

---

# PARTIE F — CAS PRATIQUES (à refaire à la main)

### Cas 1 — Vente d'ancien 200 000 € (résidence principale, dpt à 4,50 %)
- Émoluments HT : **1 995,25 €** (cf. A.2) → TTC **2 394,30 €**
- DMTO : départ. 200 000 × 4,50 % = 9 000 € ; comm. 200 000 × 1,20 % = 2 400 € ;
  frais assiette 9 000 × 2,37 % = 213,30 € → **11 613,30 €**
- CSI : 200 000 × 0,10 % = **200 €**
- + débours (≈ 400–1 200 €) + formalités
- **Total « frais » ≈ 14 600–15 400 €** (~7,3–7,7 %)
- *Variante dpt à 5,00 %* : DMTO départ. = 10 000 € → total qui grimpe ~+1 000 €.

### Cas 2 — Même vente, **primo-accédant** dans un dpt ayant voté la hausse
→ La **hausse de +0,5 pt ne s'applique pas** : on retient le taux d'avant hausse
(4,50 %). Bien **qualifier et tracer** le statut dans le dossier.

### Cas 3 — Vente neuf/VEFA 250 000 € TTC
- Pas de DMTO ; TPF ~0,715 % = ~**1 788 €** ; CSI 0,10 % = **250 €** ;
  émoluments proportionnels (barème) ; → « frais » ~**2,5 %** ≈ 6 000–7 000 €.

### Cas 4 — Provision
Sur le Cas 1, le taxateur appelle une **provision** couvrant émoluments TTC +
DMTO + CSI + débours estimés + une marge de sécurité, **avant signature**.

---

# SOURCES (mai 2026)
- Lexbase — *La réforme du tarif des notaires* (arrêté 25/02/2026)
- Notaires de France / Service-Public — *Augmentation des DMTO* (LF 2025)
- AUREP, Laroche & Associés, Groupe Monassier, Taximmo — *DMTO & primo-accédants*
- not-compta.fr — *Réglementation comptable notariale* (comptable-taxateur)
- Actu-Juridique / OINF — *Traitement des sommes maniées et intérêts* (2025)
- LégiFrance — *Discipline et comptabilité (art. 13 à 26)*

> Pour la valeur juridique : se référer au **Code de commerce (art. A444-x)**,
> à l'**arrêté tarifaire du 25/02/2026**, à la **LF 2025 art. 116** et aux
> **délibérations** du conseil départemental concerné.
