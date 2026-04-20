# Sprint 5 - Offers (Promotions SEQUENTIAL vs ADDITIVE)

## 🎯 Objectif Sprint

Créer le système d'offres promotionnelles avec modes SEQUENTIAL/ADDITIVE et règles de non-mixabilité.

**Durée estimée :** 3-4 jours
**Story Points :** 29 points

---

## Backend Tasks

### S5-BE-001 : Créer OffersModule

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S5-BE-001-offers-module`
- **Commit :** `feat(offers): create offers module with CRUD`
- **Description :**
  - Générer module : `nest g module offers`
  - Créer controller et service
  - Relations : Offer → TourOperator
- **Acceptance Criteria :**
  - ✅ Module créé et importé
  - ✅ Structure de base en place
- **Files :**
  - `apps/backend/src/offers/offers.module.ts`
  - `apps/backend/src/offers/offers.controller.ts`
  - `apps/backend/src/offers/offers.service.ts`

---

### S5-BE-002 : Endpoints Offers CRUD

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S5-BE-002-offers-crud`
- **Commit :** `feat(offers): implement offers CRUD with discount modes`
- **Description :**
  - GET /offers, GET /offers/:id, POST /offers, PUT /offers/:id, DELETE /offers/:id
  - Filtrage par tourOperatorId
  - Include : offerPeriods, applicableSupplements
  - Champs :
    - type : `PERCENTAGE | FLAT_AMOUNT`
    - value : Decimal
    - discountMode : `SEQUENTIAL | ADDITIVE`
    - applyToRoomOnly : boolean
    - applyToMealSupplements : boolean
    - minStay : int
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Validation type et discountMode
  - ✅ HTTP 401/403/404 retournés correctement
- **Files :**
  - `apps/backend/src/offers/offers.controller.ts`
  - `apps/backend/src/offers/offers.service.ts`
  - `apps/backend/src/offers/dto/create-offer.dto.ts`

---

### S5-BE-003 : Endpoints OfferPeriod (nested)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S5-BE-003-offer-periods`
- **Commit :** `feat(offers): implement offer periods CRUD`
- **Description :**
  - POST /offers/:id/periods
  - PUT /offers/:id/periods/:periodId
  - DELETE /offers/:id/periods/:periodId
  - Validation : startDate < endDate
  - Permettre périodes multiples (ex: juillet ET décembre)
- **Acceptance Criteria :**
  - ✅ CRUD période fonctionnel
  - ✅ Périodes multiples supportées
  - ✅ Validation dates
- **Files :**
  - `apps/backend/src/offers/offers.controller.ts`
  - `apps/backend/src/offers/offers.service.ts`
  - `apps/backend/src/offers/dto/create-offer-period.dto.ts`

---

### S5-BE-004 : Endpoints OfferSupplement

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S5-BE-004-offer-supplements`
- **Commit :** `feat(offers): implement offer supplements linking`
- **Description :**
  - POST /offers/:id/supplements (lier supplement à offre)
  - DELETE /offers/:id/supplements/:supplementId (délier)
  - Champ applyDiscount : boolean
- **Acceptance Criteria :**
  - ✅ Lien offre→supplement fonctionnel
  - ✅ Flag applyDiscount géré
- **Files :**
  - `apps/backend/src/offers/offers.controller.ts`
  - `apps/backend/src/offers/offers.service.ts`

---

### S5-BE-005 : Validation non-mixabilité SEQUENTIAL/ADDITIVE

- **Type :** Enhancement
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S5-BE-005-offers-validation`
- **Commit :** `feat(offers): add validation endpoint for offer compatibility`
- **Description :**
  - Endpoint : POST /offers/validate-compatibility
  - Payload : liste d'offerIds
  - Retour : `{ compatible: boolean, reason?: string }`
  - Logique :
    - Si 1+ offre ADDITIVE → bloquer SEQUENTIAL
    - Si 1+ offre SEQUENTIAL → bloquer ADDITIVE
- **Acceptance Criteria :**
  - ✅ Endpoint fonctionne
  - ✅ Validation correcte
- **Files :**
  - `apps/backend/src/offers/offers.controller.ts`
  - `apps/backend/src/offers/offers.service.ts`

---

### S5-BE-006 : DTOs avec validation

- **Type :** Task
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `chore/S5-BE-006-offers-dto`
- **Commit :** `chore(offers): add DTOs with validation for offers`
- **Description :**
  - CreateOfferDto, UpdateOfferDto
  - CreateOfferPeriodDto
  - Enums : OfferType, DiscountMode
- **Acceptance Criteria :**
  - ✅ DTOs créés avec validation
  - ✅ Enums correctement utilisés
- **Files :**
  - `apps/backend/src/offers/dto/`

---

## Frontend Tasks

### S5-FE-001 : Créer OffersService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `feature/S5-FE-001-offers-service`
- **Commit :** `feat(offers): create offers service with BehaviorSubject`
- **Description :**
  - Créer `features/offers/services/offers.service.ts`
  - **BehaviorSubject** (pas NgRx)
  - Méthodes : getOffers(), getOffer(id), createOffer(), updateOffer(), deleteOffer()
  - Méthodes pour periods et supplements
  - Méthode validateCompatibility(offerIds)
  - `take(1)` sur tous les subscribe()
- **Acceptance Criteria :**
  - ✅ Tous les appels API fonctionnels
  - ✅ Typage TypeScript correct
- **Files :**
  - `apps/frontend/src/app/features/offers/services/offers.service.ts`

---

### S5-FE-002 : Créer OffersList Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S5-FE-002-offers-list`
- **Commit :** `feat(offers): create offers list with discount mode badges`
- **Description :**
  - Créer `features/offers/components/offers-list/`
  - Tableau **`p-table`** PrimeNG : Name, Type, Value, Discount Mode, Periods, Actions
  - Badge visuel avec **`p-tag`** PrimeNG :
    - SEQUENTIAL → severity `info` (bleu)
    - ADDITIVE → severity `success` (vert)
  - Boutons : Create, Edit, Delete
- **Acceptance Criteria :**
  - ✅ Liste affichée
  - ✅ Badges visuels clairs
  - ✅ Actions fonctionnelles
- **Files :**
  - `apps/frontend/src/app/features/offers/components/offers-list/offers-list.component.ts`

---

### S5-FE-003 : Créer OfferForm Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S5-FE-003-offer-form`
- **Commit :** `feat(offers): create offer form with discount mode explanation`
- **Description :**
  - Créer `features/offers/components/offer-form/`
  - **Reactive Form** :
    - Name, Description
    - Type : PERCENTAGE | FLAT_AMOUNT (**`p-radiobutton`**)
    - Value : **`p-inputnumber`**
    - Discount Mode : SEQUENTIAL | ADDITIVE (**`p-radiobutton`**)
    - Apply to room only : **`p-checkbox`**
    - Apply to meal supplements : **`p-checkbox`**
    - minStay : **`p-inputnumber`**
  - Tooltip explicatif sur Discount Mode :
    - SEQUENTIAL : "Les réductions se multiplient. Ex: -10% puis -5% = -14.5%"
    - ADDITIVE : "Les réductions s'additionnent. Ex: -10% + -5% = -15%"
  - Warning **`p-message`** : "Les offres SEQUENTIAL et ADDITIVE ne sont pas mixables"
- **Acceptance Criteria :**
  - ✅ Formulaire complet
  - ✅ Tooltips informatifs
  - ✅ Validation complète
- **Files :**
  - `apps/frontend/src/app/features/offers/components/offer-form/offer-form.component.ts`

---

### S5-FE-004 : OfferForm — Gestion des Périodes

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S5-FE-004-offer-periods`
- **Commit :** `feat(offers): add offer periods management in form`
- **Description :**
  - Section dans OfferForm : Périodes de validité
  - Liste des périodes avec **`p-table`**
  - Dialog **`p-dialog`** pour ajouter/éditer :
    - startDate (**`p-datepicker`**)
    - endDate (**`p-datepicker`**)
  - Permettre plusieurs périodes (ex: juillet + décembre)
- **Acceptance Criteria :**
  - ✅ CRUD périodes fonctionnel
  - ✅ Périodes multiples supportées
  - ✅ Validation dates
- **Files :**
  - `apps/frontend/src/app/features/offers/components/offer-period-dialog/offer-period-dialog.component.ts`

---

### S5-FE-005 : OfferForm — Gestion des Supplements applicables

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S5-FE-005-offer-supplements`
- **Commit :** `feat(offers): add applicable supplements management in offer form`
- **Description :**
  - Section dans OfferForm : Suppléments applicables
  - Liste des supplements avec **`p-checkbox`**
  - Pour chaque : checkbox "Appliquer réduction"
- **Acceptance Criteria :**
  - ✅ Liste supplements avec checkboxes
  - ✅ Flag applyDiscount géré
- **Files :**
  - `apps/frontend/src/app/features/offers/components/offer-form/offer-form.component.ts`

---

### S5-FE-006 : Créer OffersSelectionComponent (pour Booking)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S5-FE-006-offers-selection`
- **Commit :** `feat(offers): create offers selection component with compatibility logic`
- **Description :**
  - Composant réutilisable pour Booking Wizard
  - Afficher offres disponibles filtrées (dates + minStay)
  - **Logique de blocage :**
    - Offre ADDITIVE sélectionnée → désactiver toutes les SEQUENTIAL
    - Offre SEQUENTIAL sélectionnée → désactiver toutes les ADDITIVE
  - Badge **`p-tag`** sur offres désactivées avec tooltip
  - SEQUENTIAL → `p-tag` severity `info` (bleu)
  - ADDITIVE → `p-tag` severity `success` (vert)
- **Acceptance Criteria :**
  - ✅ Blocage SEQUENTIAL/ADDITIVE fonctionne
  - ✅ Tooltips informatifs sur offres désactivées
  - ✅ UI claire et intuitive
- **Files :**
  - `apps/frontend/src/app/features/offers/components/offers-selection/offers-selection.component.ts`

---

### S5-FE-007 : Tests unitaires OffersSelectionComponent

- **Type :** Test
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `test/S5-FE-007-offers-selection-tests`
- **Commit :** `test(offers): add unit tests for offers selection compatibility logic`
- **Description :**
  - Tester le blocage SEQUENTIAL/ADDITIVE
  - Tester le déblocage si désélection
  - Mock OffersService
- **Acceptance Criteria :**
  - ✅ Coverage > 80%
  - ✅ Tous les tests passent
- **Files :**
  - `apps/frontend/src/app/features/offers/components/offers-selection/offers-selection.component.spec.ts`

---

### S5-FE-008 : Configurer les routes Offers

- **Type :** Task
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `chore/S5-FE-008-offers-routes`
- **Commit :** `chore(routing): add offers routes with guards`
- **Description :**
  - Créer `features/offers/offers.routes.ts`
  - Routes : /offers, /offers/new, /offers/:id/edit
  - Protéger avec `AuthGuard` + `RoleGuard` (ADMIN, MANAGER)
  - Lazy loading via `loadComponent`
  - Ajouter dans la Sidebar
- **Acceptance Criteria :**
  - ✅ Routes accessibles avec les bons rôles
  - ✅ Sidebar à jour
- **Files :**
  - `apps/frontend/src/app/features/offers/offers.routes.ts`
  - `apps/frontend/src/app/app.routes.ts`
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.ts`

---

## Definition of Done - Sprint 5

### Backend

- ✅ Offers CRUD complet
- ✅ OfferPeriod avec périodes multiples
- ✅ OfferSupplement avec flag applyDiscount
- ✅ Endpoint validate-compatibility fonctionnel
- ✅ DTOs avec validation

### Frontend

- ✅ Liste offers avec badges p-tag SEQUENTIAL/ADDITIVE
- ✅ Formulaire Reactive Forms + PrimeNG
- ✅ Gestion périodes multiples
- ✅ Gestion supplements applicables
- ✅ OffersSelectionComponent avec logique de blocage
- ✅ Tooltips informatifs
- ✅ Routes protégées selon rôles
- ✅ BehaviorSubject pour OffersService (pas NgRx)
- ✅ Tests unitaires > 80%

---

## Notes importantes

### Exemples concrets pour tooltips

**SEQUENTIAL :**

```
Prix base : 200€ / Offre A : -10% / Offre B : -5%
200€ × (1 - 0.10) = 180€
180€ × (1 - 0.05) = 171€
Réduction totale : 29€ (14.5%)
```

**ADDITIVE :**

```
Prix base : 200€ / Offre A : -10% / Offre B : -5%
Total réduction : 10% + 5% = 15%
200€ × (1 - 0.15) = 170€
Réduction totale : 30€ (15%)
```

---

## Dépendances

- Sprint 3 (Supplements) recommandé mais pas bloquant

---

## Risques

| Risque                           | Mitigation                   |
| -------------------------------- | ---------------------------- |
| Logique blocage complexe         | Tests unitaires exhaustifs   |
| Confusion SEQUENTIAL vs ADDITIVE | Tooltips + exemples concrets |
| Périodes multiples difficiles    | p-table + p-dialog PrimeNG   |
