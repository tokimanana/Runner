# Sprint 4 - Contracts (Tarification Complexe)

## 🎯 Objectif Sprint

Créer le système de contrats avec périodes, tarification PER_OCCUPANCY, et meal plan supplements.

**Durée estimée :** 6-7 jours
**Story Points :** 55 points (le plus gros sprint !)

---

## Backend Tasks

### S4-BE-001 : Créer ContractsModule (structure de base)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-BE-001-contracts-module`
- **Commit :** `feat(contracts): create contracts module with base structure`
- **Description :**
  - Générer module : `nest g module contracts`
  - Créer controller et service
  - Relations : Contract → Hotel, Market, Currency
- **Acceptance Criteria :**
  - ✅ Module créé et importé dans AppModule
  - ✅ Structure de base en place
- **Files :**
  - `apps/backend/src/contracts/contracts.module.ts`
  - `apps/backend/src/contracts/contracts.controller.ts`
  - `apps/backend/src/contracts/contracts.service.ts`

---

### S4-BE-002 : Endpoints Contracts (CRUD de base)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-002-contracts-crud`
- **Commit :** `feat(contracts): implement contracts CRUD endpoints`
- **Description :**
  - GET /contracts (liste avec filtres)
  - GET /contracts/:id (détail complet avec includes)
  - POST /contracts (création)
  - PUT /contracts/:id (mise à jour)
  - DELETE /contracts/:id (vérifier dépendances)
  - Filtrage par tourOperatorId, hotelId, marketId
  - Include : hotel, market, currency, periods
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Validation : hotelId, marketId, currencyId requis
  - ✅ Suppression bloquée si bookings liés
  - ✅ HTTP 401/403/404 retournés correctement
- **Files :**
  - `apps/backend/src/contracts/contracts.controller.ts`
  - `apps/backend/src/contracts/contracts.service.ts`
  - `apps/backend/src/contracts/dto/create-contract.dto.ts`

---

### S4-BE-003 : Endpoints ContractPeriod (nested resource)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S4-BE-003-contract-periods`
- **Commit :** `feat(contracts): implement contract periods CRUD with season link`
- **Description :**
  - POST /contracts/:id/periods
  - PUT /contracts/:id/periods/:periodId
  - DELETE /contracts/:id/periods/:periodId
  - Lien obligatoire à Season (seasonId)
  - Si seasonId fourni → pré-remplir startDate/endDate depuis Season
  - Validation : startDate < endDate, pas de chevauchement
  - Include : season, baseMealPlan, roomPrices, mealPlanSupplements
- **Acceptance Criteria :**
  - ✅ CRUD période fonctionnel
  - ✅ Lien Season obligatoire
  - ✅ Dates auto-remplies depuis Season
  - ✅ Validation chevauchement dates
- **Files :**
  - `apps/backend/src/contracts/contracts.controller.ts`
  - `apps/backend/src/contracts/contracts.service.ts`
  - `apps/backend/src/contracts/dto/create-contract-period.dto.ts`

---

### S4-BE-004 : Endpoints RoomPrice (PER_ROOM simple)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-004-room-price-per-room`
- **Commit :** `feat(contracts): implement room prices with PER_ROOM mode`
- **Description :**
  - POST /contracts/:id/periods/:periodId/room-prices
  - PUT /room-prices/:id
  - DELETE /room-prices/:id
  - Mode PER_ROOM : pricePerNight requis, occupancyRates vide
  - Validation : pricePerNight > 0
- **Acceptance Criteria :**
  - ✅ CRUD RoomPrice PER_ROOM fonctionnel
  - ✅ Validation mode PER_ROOM
- **Files :**
  - `apps/backend/src/contracts/contracts.controller.ts`
  - `apps/backend/src/contracts/contracts.service.ts`
  - `apps/backend/src/contracts/dto/create-room-price.dto.ts`

---

### S4-BE-005 : Endpoints RoomPrice (PER_OCCUPANCY complexe)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S4-BE-005-room-price-per-occupancy`
- **Commit :** `feat(contracts): implement PER_OCCUPANCY pricing with occupancy rates`
- **Description :**
  - Mode PER_OCCUPANCY : pricePerNight = null
  - Créer des OccupancyRate associés
  - Structure JSON ratesPerAge : `{ "ageCategoryId": { "rate": 50, "order": 1 } }`
  - Calculer totalRate automatiquement (somme des rates)
  - Validation : capacité room respectée (maxAdults, maxChildren)
- **Acceptance Criteria :**
  - ✅ OccupancyRate créés avec RoomPrice
  - ✅ JSON ratesPerAge correctement structuré
  - ✅ totalRate calculé automatiquement
  - ✅ Validation capacités room
- **Payload exemple :**
  ```json
  {
    "pricingMode": "PER_OCCUPANCY",
    "occupancyRates": [
      {
        "numAdults": 2,
        "numChildren": 0,
        "ratesPerAge": {
          "adult_cat_id": { "rate": 90, "order": 1 },
          "adult_cat_id_2": { "rate": 90, "order": 2 }
        },
        "totalRate": 180
      }
    ]
  }
  ```
- **Files :**
  - `apps/backend/src/contracts/contracts.service.ts`
  - `apps/backend/src/contracts/dto/create-occupancy-rate.dto.ts`

---

### S4-BE-006 : Endpoints MealPlanSupplement

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S4-BE-006-meal-supplements`
- **Commit :** `feat(contracts): implement meal plan supplements with occupancy rates`
- **Description :**
  - POST /contracts/:id/periods/:periodId/meal-supplements
  - PUT /meal-supplements/:id
  - DELETE /meal-supplements/:id
  - Structure JSON occupancyRates : `{ "1-0": 15, "2-0": 30, "2-1": 40 }`
  - Key = "numAdults-numChildren", Value = prix
- **Acceptance Criteria :**
  - ✅ CRUD MealPlanSupplement fonctionnel
  - ✅ JSON occupancyRates correctement structuré
  - ✅ Validation : prix positifs
- **Files :**
  - `apps/backend/src/contracts/contracts.controller.ts`
  - `apps/backend/src/contracts/contracts.service.ts`
  - `apps/backend/src/contracts/dto/create-meal-supplement.dto.ts`

---

### S4-BE-007 : Endpoints StopSalesDate

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feature/S4-BE-007-stop-sales`
- **Commit :** `feat(contracts): implement stop sales dates management`
- **Description :**
  - POST /contracts/:id/periods/:periodId/stop-sales
  - DELETE /stop-sales/:id
  - Validation : date dans la période
- **Acceptance Criteria :**
  - ✅ CRUD StopSalesDate fonctionnel
  - ✅ Validation date dans période
- **Files :**
  - `apps/backend/src/contracts/contracts.controller.ts`
  - `apps/backend/src/contracts/contracts.service.ts`

---

### S4-BE-008 : DTOs avec validation complète

- **Type :** Task
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `chore/S4-BE-008-contracts-dto`
- **Commit :** `chore(contracts): add comprehensive DTOs with validation`
- **Description :**
  - CreateContractDto, UpdateContractDto
  - CreateContractPeriodDto, UpdateContractPeriodDto
  - CreateRoomPriceDto (avec union type PER_ROOM | PER_OCCUPANCY)
  - CreateOccupancyRateDto
  - CreateMealSupplementDto
- **Acceptance Criteria :**
  - ✅ Tous les DTOs créés
  - ✅ Validation fonctionne sur tous les endpoints
- **Files :**
  - `apps/backend/src/contracts/dto/`

---

### S4-BE-009 : Tests unitaires ContractsService

- **Type :** Test
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `test/S4-BE-009-contracts-tests`
- **Commit :** `test(contracts): add unit tests for contracts service`
- **Description :**
  - Tester création contract avec périodes
  - Tester validation chevauchement dates
  - Tester création RoomPrice PER_ROOM et PER_OCCUPANCY
  - Mock PrismaService
- **Acceptance Criteria :**
  - ✅ Coverage > 80%
  - ✅ Tous les tests passent
- **Files :**
  - `apps/backend/src/contracts/contracts.service.spec.ts`

---

## Frontend Tasks

### S4-FE-001 : Créer ContractsService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-001-contracts-service`
- **Commit :** `feat(contracts): create contracts service with all API methods`
- **Description :**
  - Créer `features/contracts/services/contracts.service.ts`
  - **BehaviorSubject** (pas NgRx)
  - Méthodes : getContracts(), getContract(id), createContract(), updateContract(), deleteContract()
  - Méthodes pour periods, room-prices, meal-supplements, stop-sales
  - `take(1)` sur tous les subscribe()
- **Acceptance Criteria :**
  - ✅ Tous les appels API fonctionnels
  - ✅ Typage TypeScript correct
- **Files :**
  - `apps/frontend/src/app/features/contracts/services/contracts.service.ts`

---

### S4-FE-002 : Créer ContractsList Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-002-contracts-list`
- **Commit :** `feat(contracts): create contracts list with filters`
- **Description :**
  - Créer `features/contracts/components/contracts-list/`
  - Tableau **`p-table`** PrimeNG : Name, Hotel, Market, Currency, Periods, Actions
  - Filtres : Hotel, Market avec **`p-select`**
  - Boutons : Create, Edit, Delete, View Details
- **Acceptance Criteria :**
  - ✅ Liste affichée depuis le service
  - ✅ Filtres fonctionnels
  - ✅ Actions Edit/Delete fonctionnelles
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/contracts-list/contracts-list.component.ts`

---

### S4-FE-003 : Créer ContractForm — Étape 1 (infos de base)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-003-contract-form-step1`
- **Commit :** `feat(contracts): create contract form step 1 - basic info`
- **Description :**
  - Créer `features/contracts/components/contract-form/`
  - Wizard multi-étapes avec **`p-stepper`** PrimeNG
  - Étape 1 : Name, Hotel (**`p-select`**), Market (**`p-select`**), Currency (**`p-select`**)
  - **Reactive Form** avec validation
- **Acceptance Criteria :**
  - ✅ Formulaire Étape 1 fonctionnel
  - ✅ Validation complète
  - ✅ Bouton Next activé si valide
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/contract-form/contract-form.component.ts`

---

### S4-FE-004 : ContractForm — Étape 2 (Periods)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S4-FE-004-contract-form-step2`
- **Commit :** `feat(contracts): add periods management in contract form`
- **Description :**
  - Étape 2 : Gestion des périodes
  - Liste des périodes avec **`p-table`**
  - Dialog **`p-dialog`** pour ajouter/éditer période :
    - Name
    - Season (**`p-select`**) → auto-fill startDate/endDate
    - Base Meal Plan (**`p-select`**)
    - minStay
  - Validation : pas de chevauchement dates
- **Acceptance Criteria :**
  - ✅ CRUD périodes dans le formulaire
  - ✅ Lien Season auto-remplit dates
  - ✅ Validation chevauchement
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/contract-form/contract-form.component.ts`
  - `apps/frontend/src/app/features/contracts/components/period-form-dialog/period-form-dialog.component.ts`

---

### S4-FE-005 : ContractForm — Étape 3 (Room Prices PER_ROOM)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-005-contract-form-step3-per-room`
- **Commit :** `feat(contracts): add room prices PER_ROOM mode in contract form`
- **Description :**
  - Étape 3 : Tarifs par room type
  - Sélectionner Room Type avec **`p-select`**
  - Sélectionner Pricing Mode avec **`p-radiobutton`** : PER_ROOM / PER_OCCUPANCY
  - Si PER_ROOM : input pricePerNight **`p-inputnumber`**
  - Tableau des prix configurés avec **`p-table`**
- **Acceptance Criteria :**
  - ✅ Mode PER_ROOM fonctionnel
  - ✅ Prix ajouté à la liste
  - ✅ Édition/suppression possible
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/room-price-form-dialog/room-price-form-dialog.component.ts`

---

### S4-FE-006 : ContractForm — Étape 3 (Room Prices PER_OCCUPANCY)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S4-FE-006-contract-form-step3-per-occupancy`
- **Commit :** `feat(contracts): add room prices PER_OCCUPANCY mode with occupancy rates`
- **Description :**
  - Si PER_OCCUPANCY sélectionné :
    - Tableau dynamique des configurations
    - Bouton "Add Configuration"
  - Dialog **`p-dialog`** pour ajouter config :
    - Nombre adultes (**`p-select`**)
    - Nombre enfants (**`p-select`**)
    - Pour chaque personne : tarif par age category (**`p-inputnumber`**)
    - Calcul auto du totalRate
  - Validation : capacité room respectée

```
┌─────────────────────────────────────────────────┐
│ Mode : ○ PER_ROOM  ● PER_OCCUPANCY              │
│                                                 │
│ Single (1 adulte)                               │
│   1er adulte : [120] €                          │
│   TOTAL : 120€/nuit                             │
├─────────────────────────────────────────────────┤
│ Double (2 adultes)                              │
│   1er adulte : [90] €                           │
│   2ème adulte : [90] €                          │
│   TOTAL : 180€/nuit                             │
└─────────────────────────────────────────────────┘
```

- **Acceptance Criteria :**
  - ✅ Mode PER_OCCUPANCY fonctionnel
  - ✅ Tableau dynamique configs
  - ✅ Calcul totalRate automatique
  - ✅ Validation capacités
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/occupancy-config-form/occupancy-config-form.component.ts`

---

### S4-FE-007 : ContractForm — Étape 4 (Meal Supplements)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S4-FE-007-contract-form-step4`
- **Commit :** `feat(contracts): add meal plan supplements in contract form`
- **Description :**
  - Étape 4 : Suppléments Meal Plans
  - Liste des meal plans (sauf base) avec **`p-select`**
  - Dialog **`p-dialog`** : Meal Plan + Occupancy Rates (tableau)
  - Tableau Occupancy : Config (1-0, 2-0, 2-1) + Prix (**`p-inputnumber`**)
- **Acceptance Criteria :**
  - ✅ Suppléments meal ajoutés
  - ✅ Prix par occupancy définis
  - ✅ Édition/suppression possible
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/meal-supplement-form-dialog/meal-supplement-form-dialog.component.ts`

---

### S4-FE-008 : ContractForm — Étape 5 (Stop Sales)

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feature/S4-FE-008-contract-form-step5`
- **Commit :** `feat(contracts): add stop sales dates management in contract form`
- **Description :**
  - Étape 5 : Dates stop sales
  - **`p-datepicker`** PrimeNG multiple sélection
  - Liste des dates sélectionnées
  - Validation : dates dans période
- **Acceptance Criteria :**
  - ✅ Dates stop sales ajoutées
  - ✅ Validation dates
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/contract-form/contract-form.component.ts`

---

### S4-FE-009 : ContractForm — Submit & Récapitulatif

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-009-contract-submit`
- **Commit :** `feat(contracts): add contract recap and submit logic`
- **Description :**
  - Dernière étape : Récapitulatif
  - Afficher toutes les infos configurées
  - Bouton Submit → appel service → redirection après succès
  - **`p-progressbar`** pendant création
  - **`p-toast`** messages succès/erreur
- **Acceptance Criteria :**
  - ✅ Récapitulatif clair
  - ✅ Submit fonctionne
  - ✅ Toutes les relations créées côté backend
- **Files :**
  - `apps/frontend/src/app/features/contracts/components/contract-form/contract-form.component.ts`

---

### S4-FE-010 : Configurer les routes Contracts

- **Type :** Task
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `chore/S4-FE-010-contracts-routes`
- **Commit :** `chore(routing): add contracts routes with guards`
- **Description :**
  - Créer `features/contracts/contracts.routes.ts`
  - Routes : /contracts, /contracts/new, /contracts/:id/edit
  - Protéger avec `AuthGuard` + `RoleGuard` (ADMIN, MANAGER)
  - Lazy loading via `loadComponent`
  - Ajouter dans la Sidebar
- **Acceptance Criteria :**
  - ✅ Routes accessibles avec les bons rôles
  - ✅ Sidebar à jour
- **Files :**
  - `apps/frontend/src/app/features/contracts/contracts.routes.ts`
  - `apps/frontend/src/app/app.routes.ts`
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.ts`

---

## Definition of Done - Sprint 4

### Backend

- ✅ Contracts CRUD complet
- ✅ ContractPeriod avec lien Season obligatoire
- ✅ RoomPrice PER_ROOM fonctionnel
- ✅ RoomPrice PER_OCCUPANCY avec OccupancyRate fonctionnel
- ✅ MealPlanSupplement avec occupancy rates fonctionnel
- ✅ StopSalesDate fonctionnel
- ✅ DTOs avec validation complète
- ✅ Tests unitaires > 80% coverage

### Frontend

- ✅ Liste contracts avec filtres (p-table)
- ✅ Wizard 5 étapes avec p-stepper PrimeNG
- ✅ Mode PER_ROOM implémenté
- ✅ Mode PER_OCCUPANCY avec tableau configs implémenté
- ✅ Meal supplements avec occupancy implémenté
- ✅ Stop sales dates implémenté
- ✅ Récapitulatif et submit fonctionnels
- ✅ Routes protégées selon rôles
- ✅ BehaviorSubject pour ContractsService (pas NgRx)

### Intégration

- ✅ Création contract end-to-end fonctionne
- ✅ Toutes les relations créées correctement
- ✅ Validation frontend + backend

---

## Notes importantes

### Structure JSON ratesPerAge

```typescript
{
  "ageCategoryId1": { "rate": 90, "order": 1, "label": "1er adulte" },
  "ageCategoryId2": { "rate": 90, "order": 2, "label": "2ème adulte" },
  "ageCategoryId3": { "rate": 0,  "order": 1, "label": "1er enfant gratuit" }
}
```

### Structure JSON occupancyRates (Meal Supplements)

```typescript
{
  "1-0": 15,   // 1 adulte, 0 enfant = 15€
  "2-0": 30,   // 2 adultes, 0 enfant = 30€
  "2-1": 40,   // 2 adultes, 1 enfant = 40€
  "2-2": 50    // 2 adultes, 2 enfants = 50€
}
```

---

## Dépendances

- Sprint 2 (Hotels + Seasons) doit être terminé
- Sprint 3 (Référentiels) doit être terminé

---

## Risques

| Risque                         | Mitigation                             |
| ------------------------------ | -------------------------------------- |
| PER_OCCUPANCY trop complexe    | Faire des maquettes UI avant de coder  |
| JSON ratesPerAge mal structuré | Valider avec des exemples concrets     |
| Wizard trop long               | p-stepper PrimeNG gère bien les étapes |
| Chevauchement dates difficile  | Utiliser date-fns pour validation      |
