# Sprint 4 — Contrats & Tarification Complexe (PER_OCCUPANCY)

> **Document consolidé — état final.** Fusionne le plan original + tous les tickets `-BIS`, `FIX`, `TECH`, `REFACTOR` produits en cours de sprint. Mêmes numéros de ticket que l'historique réel ; contenu réécrit pour refléter ce qui a été **effectivement livré**, pas l'intention initiale.
>
> **Statut global : Sprint 4 fonctionnellement terminé.** Un seul ticket volontairement différé (S4-REFACTOR-003).

---

## 1. Modèle architectural final

### 1.1 Périodes (Season / SeasonPeriod / ContractPeriod)

```
Season { id, name, tourOperatorId }                         — conteneur pur, aucune date
  └── SeasonPeriod { id, seasonId, name, startDate, endDate } — template de référence (pré-remplissage)
                         ↓ pré-remplit (suggestion, jamais contraignant)
ContractPeriod { id, contractId, seasonPeriodId?, startDate, endDate, baseMealPlanId, minStay }
                                  ↑ classification/reporting   ↑ source de vérité contractuelle
```

- `seasonPeriodId` est **optionnel** sur `ContractPeriod` — un contrat peut exister sans référence à une saison.
- Les dates de `ContractPeriod` sont **toujours** éditables indépendamment de la `SeasonPeriod` d'origine.
- `SeasonPeriod` n'est **pas immuable** : elle peut être modifiée même si des `ContractPeriod` la référencent.

### 1.2 Tarification (BaseRate / AgePolicy / OccupancyGuidance — remplace OccupancyRate)

> Décision de refonte (session du 18/07) : la saisie combinatoire adultes/enfants (`OccupancyRate`, 100+ lignes par contrat) est remplacée par un modèle à 3 entités, aligné sur la façon dont les hôtels (The Lux Collective Mauritius : LBM, LGB, LGG, Le Morne, SOP, Tamassa + villas/résidences) structurent réellement leurs grilles tarifaires.

**BaseRate** — un seul par `(contractPeriodId, roomTypeId)`, tarifs fixes saisis par l'agent :

```prisma
model BaseRate {
  id               String   @id @default(cuid())
  contractPeriodId String
  roomTypeId       String
  halfDouble       Decimal  @db.Decimal(10, 2)
  single           Decimal  @db.Decimal(10, 2)
  thirdPersonAdult Decimal? @db.Decimal(10, 2)   // supplément, capacité chambre == 2 uniquement
  triple           Decimal? @db.Decimal(10, 2)   // tarif autonome, chambre pensée pour 3
  quadruple        Decimal? @db.Decimal(10, 2)   // tarif autonome, chambre pensée pour 4
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  contractPeriod   ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  roomType         RoomType       @relation(fields: [roomTypeId], references: [id])

  @@unique([contractPeriodId, roomTypeId])
  @@index([contractPeriodId])
  @@index([roomTypeId])
  @@map("base_rates")
}
```

**AgePolicy** — règles par tranche d'âge, scopées par room type, avec occurrence et base de calcul explicites :

```prisma
enum SharingType {
  WITH_PARENTS
  SEPARATE_ROOM
}

enum BaseRateReference {
  single
  halfDouble
  triple
  quadruple
  // thirdPersonAdult volontairement exclu — jamais utilisé comme base de calcul d'AgePolicy
}

model AgePolicy {
  id                String            @id @default(cuid())
  contractPeriodId  String
  roomTypeId        String
  ageCategoryId     String
  sharingType       SharingType
  occurrenceIndex   Int               // sémantique dépend de sharingType, voir ci-dessous
  baseRateReference BaseRateReference
  value             Decimal           @db.Decimal(10, 4)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  contractPeriod    ContractPeriod    @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  roomType          RoomType          @relation(fields: [roomTypeId], references: [id])
  ageCategory       AgeCategory       @relation(fields: [ageCategoryId], references: [id])

  @@unique([contractPeriodId, roomTypeId, ageCategoryId, sharingType, occurrenceIndex])
  @@index([contractPeriodId])
  @@index([ageCategoryId])
  @@map("age_policies")
}
```

Sémantique de `occurrenceIndex` (à documenter dans le code, pas seulement ici) :

- `WITH_PARENTS` → "quel enfant" (1er, 2e...) ; chaque occurrence porte sa propre `value`, indépendante des autres.
- `SEPARATE_ROOM` → occupation totale de la chambre séparée (1 vs 2 enfants), qui sélectionne le `baseRateReference` (`single`↔1 enfant, `halfDouble`↔2 enfants) ; la `value` s'applique identiquement à chacun des N enfants de l'occurrence, elle n'est pas divisée.

**OccupancyGuidance** — combinaisons indicatives, non bloquantes, scopées uniquement par `roomTypeId` (pas de dépendance à un contrat) :

```prisma
model OccupancyGuidance {
  id          String   @id @default(cuid())
  roomTypeId  String
  description String   // texte libre, ex. "2 Adults + 2 Teens"
  maxAdults   Int      @default(0)
  maxTeens    Int      @default(0)
  maxChildren Int      @default(0)
  maxInfants  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  roomType    RoomType @relation(fields: [roomTypeId], references: [id], onDelete: Cascade)

  @@index([roomTypeId])
  @@map("occupancy_guidances")
}
```

Une combinaison réelle du type _"3 ADULTS OR 2 ADULTS + 2 TEENS OR 2 CHILDREN OR 1 INFANT"_ = **4 lignes distinctes**, une par combinaison "OR". Gérée sur la fiche Room Type (`Hotels > [hotel] > Room Types`), **pas** dans le wizard de contrat — purement informationnelle, aucun lien avec `BaseRate`/`AgePolicy`.

### 1.3 RoomPrice (PER_ROOM / PER_OCCUPANCY)

```prisma
enum PricingMode {
  PER_ROOM
  PER_OCCUPANCY
}

model RoomPrice {
  id                String      @id @default(cuid())
  contractPeriodId  String
  roomTypeId        String
  pricingMode       PricingMode
  pricePerNight     Decimal?    @db.Decimal(10, 2)  // PER_ROOM uniquement
  extraPersonAdult  Decimal?    @db.Decimal(10, 2)  // PER_ROOM uniquement — supplément personne additionnelle
  extraPersonChild  Decimal?    @db.Decimal(10, 2)
  extraPersonTeen   Decimal?    @db.Decimal(10, 2)
  contractPeriod    ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  roomType          RoomType       @relation(fields: [roomTypeId], references: [id])
  occupancyRates    OccupancyRate[] // LEGACY — plus jamais écrit, conservé pour compatibilité

  @@unique([contractPeriodId, roomTypeId])
  @@index([contractPeriodId])
}
```

`extraPersonAdult/Child/Teen` (PER_ROOM) est un mécanisme **distinct** de `BaseRate.thirdPersonAdult` (PER_OCCUPANCY, capacité chambre == 2 strictement) — aucun chevauchement.

### 1.4 MealPlanSupplement

```prisma
enum BillingUnit {
  PER_NIGHT
  PER_STAY
}

model MealPlanSupplement {
  id               String      @id @default(cuid())
  contractPeriodId String
  mealPlanId       String
  billingUnit      BillingUnit @default(PER_NIGHT)
  occupancyRates   Json        // Record<ageCategoryId, number> — 0 = FOC explicite, jamais null
  contractPeriod   ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  mealPlan         MealPlan       @relation(fields: [mealPlanId], references: [id])

  @@unique([contractPeriodId, mealPlanId])
  @@index([contractPeriodId])
}
```

Indexé uniquement par `AgeCategory` — jamais par `sharingType`/occurrence/1er-2e enfant (contrairement à `AgePolicy`), conforme aux contrats réels observés (LBM, LGB, LGG, SOP, villas/résidences).

### 1.5 StopSalesDate — inchangé

Validé contre `ContractPeriod.startDate/endDate` (jamais `SeasonPeriod`).

### 1.6 Legacy `OccupancyRate`

Conservé en base pour compatibilité ascendante, **plus jamais créé** par le backend depuis la refonte PER_OCCUPANCY. Suppression physique non décidée (voir S4-REFACTOR-003).

---

## 2. Standards Angular — non négociables

| Règle              | Valeur                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Components         | Standalone (défaut Angular 19)                                                                                         |
| DI                 | `inject()` uniquement                                                                                                  |
| Change detection   | `OnPush` systématique                                                                                                  |
| Inputs/Outputs     | `input()` / `output()` / `model()`                                                                                     |
| State local        | `signal()` / `computed()`                                                                                              |
| Subscribe          | `take(1)` obligatoire                                                                                                  |
| Template           | `@if` / `@for` / `@switch`                                                                                             |
| Classes CSS        | Tailwind utilitaires + `RunnerPreset` tokens (`--p-primary-*`/`--p-surface-*`/`--p-text-*`, jamais de hex codé en dur) |
| Types              | Strict TypeScript — pas de `any`                                                                                       |
| Pattern DI backend | Repository Pattern (abstract class comme token NestJS)                                                                 |
| Endpoints update   | `PATCH` sur toutes les mises à jour                                                                                    |

---

## 3. Tickets — Migration & Shared Types

### S4-MIGRATE-001 — Migrer Season → Season + SeasonPeriod

**Status : ✅ Done** · P0 · 3 SP · `chore/S4-MIGRATE-001-season-period-migration`

Ordre strict : créer `SeasonPeriod` → migrer les données → ajouter `seasonPeriodId` nullable sur `ContractPeriod` → supprimer `startDate`/`endDate` de `Season`. Jamais fusionner l'étape de migration de données et l'étape de suppression dans la même migration Prisma. Testé en local (`prisma migrate reset` + script + `prisma studio`) avant application sur Neon.

### S4-SHARED-001 — Types contrats dans `@runner/shared/types`

**Status : ✅ Done** · P0 · 3 SP · `chore/S4-SHARED-001-contract-types`

`Season` (sans dates), `SeasonPeriod` (nouveau), `Contract`, `ContractPeriod`, `RoomPrice`, `MealPlanSupplement`, `StopSalesDate`, `PricingMode` (union type, pas d'enum côté shared). Étendu en cours de sprint avec `BaseRate`, `AgePolicy`, `OccupancyGuidance`, `BillingUnit`, `SharingType`, `BaseRateReference` (voir S4-BE-005-BIS, S4-BE-009-BIS, S4-BE-012/013/014/015-BIS).

---

## 4. Tickets — Backend

### S4-BE-001 — Prisma : schéma révisé + migration

**Status : ✅ Done** · P0 · 4 SP · `chore/S4-BE-001-prisma-contracts-migration`

Schéma initial : `Season`, `SeasonPeriod`, `Contract`, `ContractPeriod`, `RoomPrice`, `OccupancyRate` (devenu legacy), `MealPlanSupplement`, `StopSalesDate`, `PricingMode`. Étendu par S4-BE-001-BIS (voir §5).

### S4-BE-002 — SeasonPeriods CRUD (nested sous Seasons)

**Status : ✅ Done** · P0 · 4 SP · `feature/S4-BE-002-season-periods`

`GET/POST /seasons/:id/periods`, `PATCH/DELETE /seasons/:id/periods/:periodId`. Validation de chevauchement dans une même `Season`. Suppression libre (204, pas de blocage sur `ContractPeriod` liées — dates indépendantes). Pas d'immutabilité.

### S4-BE-003 — ContractsModule : structure + Repository Pattern

**Status : ✅ Done** · P0 · 3 SP · `feature/S4-BE-003-contracts-module`

Structure : `dto/`, `repositories/` (`contract.repository.ts` abstract + `prisma-contract.repository.ts`), `contracts.types.ts`, `contracts.controller.ts`, `contracts.service.ts`, `contracts.module.ts`. Étendu par S4-BE-003-BIS avec 3 controllers additionnels (voir §5).

### S4-BE-004 — DTOs avec validation complète

**Status : ✅ Done** · P0 · 3 SP · `chore/S4-BE-004-contracts-dto`

`ratesPerAge: Record<string, number>` (order retiré, vient des `AgeCategory` de l'hôtel), `totalRate` retiré (calculé backend), `@ValidateIf` sur `pricePerNight` (requis si PER_ROOM). Remplacé en substance par S4-BE-004-BIS lors de la refonte PER_OCCUPANCY (voir §5).

### S4-BE-005 — Endpoints Contracts CRUD

**Status : ✅ Done** · P0 · 3 SP · `feature/S4-BE-005-contracts-crud`

`GET /contracts`, `GET /contracts/:id`, `POST /contracts`, `PATCH /contracts/:id`, `DELETE /contracts/:id` (bloqué si bookings liés). `GET /:id` inclut `periods.seasonPeriod/baseMealPlan/roomPrices.occupancyRates/mealPlanSupplements/stopSalesDates`, étendu par S4-BE-005-BIS avec `baseRates`/`agePolicies`.

### S4-BE-006 — Endpoints ContractPeriod

**Status : ✅ Done** · P0 · 4 SP · `feature/S4-BE-006-contract-periods`

`POST/PATCH/DELETE /contracts/:id/periods[/:periodId]`. Validation de chevauchement dans un même contrat. Auto-fill des dates depuis `SeasonPeriod` si `seasonPeriodId` fourni et dates non explicites — dates restent éditables ensuite.

### S4-BE-007 — Endpoints RoomPrice PER_ROOM

**Status : ✅ Done** · P0 · 3 SP · `feature/S4-BE-007-room-price-per-room`

`POST /contracts/:id/periods/:periodId/room-prices`, `PATCH/DELETE /room-prices/:id`. Étendu par S4-BE-015-BIS avec `extraPersonAdult/Child/Teen`.

### S4-BE-008 — Endpoints RoomPrice PER_OCCUPANCY

**Status : ✅ Superseded par S4-BE-008-BIS.** P0 · 5 SP (historique) · `feature/S4-BE-008-room-price-per-occupancy`

Version initiale basée sur `OccupancyRate` (matrice adultes/enfants + validation de capacité `RoomTypeCapacity`). **Entièrement remplacée** par le modèle `BaseRate`/`AgePolicy` — voir S4-BE-008-BIS pour le comportement final livré. Conservé ici pour l'historique ; ne pas implémenter tel quel.

### S4-BE-009 — Endpoints MealPlanSupplement

**Status : ✅ Done** · P1 · 3 SP · `feature/S4-BE-009-meal-supplements`

`POST /contracts/:id/periods/:periodId/meal-supplements`, `PATCH/DELETE /meal-supplements/:id`. Écriture directe (pas de transaction multi-table), 404 si `ContractPeriod` introuvable, 409 si `mealPlanId` déjà utilisé sur la période. Étendu par S4-BE-009-BIS avec `billingUnit`.

### S4-BE-010 — Endpoints StopSalesDate

**Status : ✅ Done** · P2 · 2 SP · `feature/S4-BE-010-stop-sales`

`POST /contracts/:id/periods/:periodId/stop-sales`, `DELETE /stop-sales/:id`. Validation contre `ContractPeriod.startDate/endDate` (jamais `SeasonPeriod`).

### S4-BE-011 — Tests unitaires ContractsService

**Status : ✅ Done** · P1 · 4 SP · `test/S4-BE-011-contracts-tests`

Mock de `ContractRepository` (abstract class), jamais `PrismaService` directement. Scénarios : chevauchement `ContractPeriod`, auto-fill depuis `SeasonPeriod`, `StopSalesDate` hors plage. Étendu par S4-BE-011-BIS pour couvrir `BaseRate`/`AgePolicy`/`OccupancyGuidance`. Coverage > 80% sur `contracts.service.ts`.

### S4-BE-012 — Tests unitaires `serializeDates`

**Status : ✅ Done** · P1 · 2 SP · `test/S4-BE-012-serialize-dates-tests`

Fonction pure et récursive testée en isolation (`Date` seule, imbriquée, tableaux, `null`/`undefined`, primitives, non-mutation, objets/tableaux vides). Coverage 100%.

---

## 5. Tickets — Backend, refonte PER_OCCUPANCY (BIS)

> Session de design du 18/07/2026. `OccupancyRate` remplacé par `BaseRate` + `AgePolicy` + `OccupancyGuidance`. Ordre d'exécution strict (chaque ticket dépend du précédent).

### S4-BE-001-BIS — Prisma : nouvelles tables PER_OCCUPANCY

**Status : ✅ Done** · P0 (bloquant) · 3 SP · `chore/S4-BE-001-BIS-prisma-per-occupancy-tables`

Ajoute `SharingType`, `BillingUnit`, `BaseRate`, `AgePolicy` (version simplifiée initiale : pas encore `roomTypeId`/`occurrenceIndex`/`baseRateReference`, ajoutés ensuite par S4-BE-013/014-BIS), `OccupancyGuidance`. `MealPlanSupplement.billingUnit` avec défaut `PER_NIGHT`. `OccupancyRate` marqué legacy en commentaire, non supprimé.

### S4-BE-004-BIS — DTOs : refonte PER_OCCUPANCY

**Status : ✅ Done** · P0 (bloque BE-008-BIS/BE-009-BIS) · 3 SP · `chore/S4-BE-004-BIS-dtos-per-occupancy`

`CreateBaseRateDto`, `UpdateBaseRateDto`, `CreateAgePolicyDto`, `UpdateAgePolicyDto`, `CreateOccupancyGuidanceDto`, `UpdateOccupancyGuidanceDto`. `CreateRoomPriceDto` : `occupancyRates` retiré (plus de saisie inline des combinaisons). `CreateMealPlanSupplementDto` : `billingUnit` requis (`@IsEnum`).

### S4-BE-003-BIS — ContractsModule : nouveaux controllers

**Status : ✅ Done** · P1 · 2 SP · `chore/S4-BE-003-BIS-module-per-occupancy`

`BaseRatesController` et `AgePoliciesController` nichés sous `contracts/:contractId/periods/:periodId/...`. `OccupancyGuidancesController` **indépendant** (`/occupancy-guidances`, scopé par `roomTypeId` uniquement — aucune dépendance à un contrat, propriété de la chambre elle-même). Mêmes guards que l'existant (`JwtAuthGuard` + `RolesGuard`, `ADMIN`/`MANAGER`).

### S4-BE-008-BIS — Cœur métier : BaseRate, AgePolicy, OccupancyGuidance

**Status : ✅ Done** · P0 · 8 SP · `feat/S4-BE-008-BIS-per-occupancy-core`

Ticket central : repository (12 méthodes CRUD, pattern erreurs P2002→CONFLICT/P2003→NOT_FOUND identique à `MealPlanSupplement`) + service (mêmes 12 méthodes + `getPeriodOrThrow`/`handleRepositoryError`). `buildOccupancyRates()` supprimée de `createRoomPrice()` — un `RoomPrice` PER_OCCUPANCY se crée désormais **sans** `occupancyRates`, la saisie des tarifs se fait séparément via `BaseRatesController`/`AgePoliciesController`. **Aucune validation de capacité** appliquée à ces nouvelles routes (décision actée : "les agents décident eux-mêmes des combinaisons pertinentes").

### S4-BE-009-BIS — MealPlanSupplement : ajout `billingUnit`

**Status : ✅ Done** · P1 · 1 SP · `feat/S4-BE-009-BIS-meal-supplement-billing-unit`

Rattrapage : le DTO exigeait déjà `billingUnit`, mais le type partagé et l'entity ne l'exposaient pas. `BillingUnit` (`PER_NIGHT`/`PER_STAY`) ajouté à `contract.types.ts`.

### S4-BE-005-BIS — `findOne` : inclure `baseRates`/`agePolicies`

**Status : ✅ Done** · P1 · 2 SP · `chore/S4-BE-005-BIS-findone-include`

`GET /contracts/:id` renvoie `periods[].baseRates` (avec `roomType`) et `periods[].agePolicies` (avec `ageCategory`) — tableaux vides, jamais `null`, si absents.

### S4-BE-011-BIS — Tests unitaires : BaseRate, AgePolicy, OccupancyGuidance

**Status : ✅ Done** · P1 · 4 SP · `test/S4-BE-011-BIS-per-occupancy-unit-tests`

Couvre les 9 nouvelles méthodes de service + `createRoomPrice` (régression : plus d'`occupancyRates` dans le payload PER_OCCUPANCY, aucune exception de capacité) + `billingUnit` transmis correctement. Coverage ≥ 90% sur les nouvelles méthodes.

### S4-BE-012-BIS — BaseRate : ajout Triple / Quadruple

**Status : ✅ Done** · P1 · 2 SP · `chore/S4-BE-012-BIS-base-rate-triple-quadruple`

`triple`/`quadruple` (Decimal nullable) ajoutés à `BaseRate`, DTOs, types partagés (`contract.types.ts` **et** `contracts.types.ts` — ce dernier oublié dans la version initiale, requis pour que le service relaie les champs au repository). Pas de validation d'exclusivité backend entre `thirdPersonAdult`/`triple` — contrainte à respecter côté frontend uniquement.

### S4-BE-013-BIS — Ajout `roomTypeId` à AgePolicy

**Status : ✅ Done** · P1 · 2 SP · `chore/S4-BE-013-BIS-age-policy-room-type`

Invalidation de l'hypothèse initiale ("tarifs enfants identiques pour toutes les chambres d'une période") sur preuve de deux contrats réels (Belle Mare : "2nd Child" varie par room type ; Tamassa : règles limitées à une liste explicite de room types). `roomTypeId` requis sur `AgePolicy`, contrainte d'unicité étendue à `[contractPeriodId, roomTypeId, ageCategoryId, sharingType]`. Aucune donnée de migration nécessaire (pas de contrat réel en prod à ce stade).

### S4-BE-014-BIS — AgePolicy : `occurrenceIndex`, `baseRateReference`

**Status : ✅ Done** · P1 · 3 SP · `chore/S4-BE-014-BIS-agepolicy-occurrence-baserate`

Analyse croisée de 8 contrats réels Lux Collective. `mode`/calcul automatique du pourcentage explicitement **hors scope backend** (déplacé côté frontend, décision confirmée sur les 8 contrats : `WITH_PARENTS` = toujours valeur absolue, `SEPARATE_ROOM` = pourcentage déjà converti en devise par l'agent avant saisie). Nouvel enum `BaseRateReference` (`single`/`halfDouble`/`triple`/`quadruple`, `thirdPersonAdult` explicitement exclu). `@@unique` étendu avec `occurrenceIndex`. Migration sans backfill (base de test vidée au préalable).

### S4-BE-015-BIS — RoomPrice PER_ROOM : supplément "Unit extra person"

**Status : ✅ Done** · P1 · 3 SP · `feature/S4-BE-015-BIS-roomprice-per-room-extra-person`

`extraPersonAdult`/`extraPersonChild`/`extraPersonTeen` (Decimal nullable) ajoutés directement sur `RoomPrice` (décision structurelle : champs directs, pas de sous-table — volume de données trop faible pour justifier une table séparée). Mécanisme confirmé distinct de `BaseRate.thirdPersonAdult` (PER_OCCUPANCY, capacité==2 uniquement). `@ValidateIf(pricingMode === 'PER_ROOM')`.

### S4-REFACTOR-003 — Nettoyage : retrait définitif du legacy OccupancyRate

**Status : ⏸️ Différé — dernier ticket de la série, volontairement en attente.** P2 · 2 SP · `refactor/S4-REFACTOR-003-cleanup-legacy-occupancy`

Bloqué (par choix, pas par dépendance technique) jusqu'à validation du modèle final en usage réel — au moins un contrat créé de bout en bout avec `BaseRate` + `AgePolicy` (roomTypeId/occurrenceIndex/baseRateReference) + supplément extra person PER_ROOM. Scope : marquer `OccupancyRate`/`OccupancyRateDto`/`OccupancyRateCreateData` `@deprecated`, nettoyer les imports morts liés à `buildOccupancyRates`. Décision de suppression physique de la table à prendre avec Samuel avant exécution — ce ticket ne fait que documenter, ne supprime rien.

**➡️ C'est le seul ticket ouvert du Sprint 4.**

---

## 6. Tickets — Frontend

### S4-FE-001 — SeasonsService + Season/SeasonPeriod UI

**Status : ✅ Done** · P0 · 5 SP · `feature/S4-FE-001-seasons-with-periods`

Décisions notables : `Season.seasonPeriods` (nom Prisma respecté, pas de renommage frontend) ; pas de `getWithPeriods()` séparé (`getSeasons()` suffit, backend mappe déjà `seasonPeriods`) ; `SeasonsFormComponent` supprimé (Season n'a plus de dates) au profit d'édition inline (création dans `seasons-list`, nom dans `season-detail`) ; routing componentless ; `season()` = `computed()` dérivé de `seasons$` (une seule source de vérité, pas de `getSeasonById()` séparé). `dateRangeValidator` extrait dans `shared/utils/date-range.util.ts`.

### S4-FE-002 — ContractsService

**Status : ✅ Done** · P0 · 2 SP · `feature/S4-FE-002-contracts-service`

BehaviorSubject (`_contracts$`/`_loading$`) pour la liste uniquement. Pas de `reload()` sur les sous-ressources (volume + imbrication trop coûteux) — le composant appelant gère l'état local avec la valeur HTTP retournée. `create`/`update`/`remove` sur `Contract` synchronisent `_contracts$` localement sans round-trip. `findAll()` sans cache bloquant (filtres/pagination changent le résultat). `findOne(id)` toujours en HTTP direct (jamais depuis `_contracts$`, qui peut être allégé). Naming normalisé `remove*` partout. Ordre de paramètres : IDs parents dans l'ordre de l'URL, `dto` en dernier.

### S4-FE-003 — ContractsList Component

**Status : ✅ Done** · P0 · 3 SP · `feature/S4-FE-003-contracts-list`

`p-table` : Name, Hotel, Market, Currency (code), Nb périodes (`periodsCount ?? 0`), Actions. Filtres Hotel/Market en `signal()` local, rechargent `findAll()` à chaque changement (pas de cache). `p-paginator`. Suppression via `confirmDelete()` (gère déjà le 409), pas de `reload()` après (sync locale déjà en place côté service).

### S4-FE-004 — ContractForm Wizard, Step 1 (Contract Info)

**Status : ✅ Done** · P0 · 3 SP · `feat/S4-FE-004-contract-form-step1`

PrimeNG Stepper (`p-step-list`/`p-step-panels`/`p-step-panel`). `step1Form` (`fb.nonNullable.group`, 4 champs requis), `step1Data` (signal partagé cross-step), `activeStep` (signal, 1-based). Back button caché tant que `activeStep() === 1`. `step-actions` factorisé via `ng-template` + `ngTemplateOutlet`.

### S4-FE-005 — ContractForm Wizard, Step 2 (Periods)

**Status : ✅ Done** · P0 · 8 SP · `feat/S4-FE-005-contract-form-step2-periods`

Édition inline + génération bulk depuis une Season (pattern retenu après abandon du dialog en cours de session — mieux adapté au workflow réel). `LocalContractPeriod` avec `startDate/endDate: Date | null` (binding direct `p-datepicker`). `draftPeriods` (non confirmées) / `localPeriods` (confirmées, état final pour le submit). Changer de Season ne régénère que les brouillons, jamais les périodes déjà confirmées. Dette connue : `[ngModel]` mêlé à `ReactiveFormsModule`, pas de validation stricte par champ (juste un `if` minimal à la confirmation).

### S4-FE-006 — ContractForm Wizard, Step 3 (Room Prices, PER_ROOM)

**Status : ✅ Done** · P0 · 8 SP · `feat/S4-FE-006-contract-form-step3-room-prices`

Livré pour PER_ROOM uniquement au départ (matrice période × room type). PER_OCCUPANCY différé et entièrement repris par S4-FE-006-BIS suite à la refonte backend.

### S4-FE-006-BIS — Step 3, PER_OCCUPANCY (BaseRate + AgePolicy)

**Status : ✅ Done** · P1 · 3 SP · `feat/S4-FE-006-BIS-room-prices-per-occupancy`

Rework en layout card-based (abandon de `p-table` avec rowexpansion PrimeNG — API cassée dans leur sous-version). Toggle PER_ROOM/PER_OCCUPANCY par `LocalRoomPrice`. Sous-panneau PER_OCCUPANCY : un formulaire `BaseRate` unique (pas une liste) + une liste `AgePolicy` dérivée des `AgeCategory` de l'hôtel (pas de ligne ajoutable librement). **Aucune garde de capacité** (retirée du scope, décision backend). `totalRate` calculé retiré (n'existe plus, remplacé par champs fixes). Champs visibles selon capacité de la chambre via `isBaseRateFieldVisible()`. Étendu ensuite par S4-FE-016-BIS (occurrences) et S4-FE-017-BIS (extra person PER_ROOM).

### S4-FE-016-BIS — AgePolicy : `occurrenceIndex` + `baseRateReference`

**Status : ✅ Done** · P0 · 5 SP · `feat/S4-FE-016-BIS-agepolicy-occurrence-baserate`

`agePolicyRowsByRoomPrice` (une ligne figée par ageCategory×sharingType) remplacé par `agePolicyGroupsByRoomPrice` — un groupe par (roomType, ageCategory, sharingType), portant N occurrences triées par `occurrenceIndex`. `addAgePolicyOccurrence`/`removeAgePolicyOccurrence` (réindexation sans trou) / `updateAgePolicyField` (générique). `getBaseRateReferenceOptions()` réutilise `isBaseRateFieldVisible()` pour filtrer selon la capacité (jamais `thirdPersonAdult` proposé).

### S4-FE-017-BIS — RoomPrice PER_ROOM : "Unit extra person"

**Status : ✅ Done** · P1 · 3 SP · `feat/S4-FE-017-BIS-per-room-extra-person`

3 champs `p-inputNumber` (Adult/Child/Teen) sous "Price per Night", visibles uniquement en PER_ROOM. Reset (`null`) au passage PER_ROOM → PER_OCCUPANCY, symétrique au reset déjà en place au passage inverse (S4-FIX-004).

### S4-FE-014-BIS — OccupancyGuidance : gestion sur la fiche Room Type

**Status : ✅ Done** · P2 · 3 SP · `feat/S4-FE-014-BIS-occupancy-guidance-room-type`

Section dédiée sur la fiche room type existante (`Hotels > [hotel] > Room Types`), hors wizard de contrat (scope confirmé : `OccupancyGuidance` est une propriété de la chambre, indépendante du contrat). Liste + create/edit/delete par ligne — `description` (texte libre) + 4 champs `max*` (défaut 0 si omis). Plusieurs guidances par room type autorisées (une par combinaison "OR"), aucune contrainte d'unicité à répliquer côté frontend.

### S4-FE-007 — ContractForm Wizard, Step 4 (Meal Plan Supplements)

**Status : ✅ Done** · P1 · 3 SP · `feature/S4-FE-007-contract-form-step4`

`LocalMealPlanSupplement` par (période, mealPlan) — jamais par occurrence, modélisé comme variante simplifiée d'`AgePolicy` (dictionnaire `ratesByAgeCategory`, pas d'entité par occurrence). `billingUnit` sans défaut stocké (select vide, friction assumée pour éviter une erreur d'enum silencieuse). Accordéon par période, ajout instantané, choix libre des meal plans y compris le meal plan de base du contrat. Pruning : retirer une période retire ses suppléments.

### S4-FE-008 — ContractForm Wizard, Step 5 (Stop Sales)

**Status : ✅ Done** · P2 · 2 SP · `feature/S4-FE-008-contract-form-step5`

Pattern "un datepicker + une liste" retenu plutôt que `selectionMode="multiple"` sur un calendrier (volume potentiellement élevé, liste plus auditable). Bornée par `ContractPeriod.startDate/endDate` (jamais `SeasonPeriod`). Pas de garde anti-doublon sur une date déjà ajoutée — non traité, à trancher si besoin.

### S4-FE-009 — ContractForm : Récapitulatif + Submit

**Status : ✅ Done** · P0 · 3 SP · `feature/S4-FE-009-contract-submit`

`submitContract()` séquentiel (`async/await` — les IDs de période ne sont connus qu'après création, flux non haute fréquence) : contrat → périodes → room prices → (BaseRate + AgePolicies par occurrence si PER_OCCUPANCY) → meal supplements → stop sales. `AgePolicyDto`/`BaseRateDto` ajoutés à `contract.types.ts`. Validation bloquante pré-submit sur `billingUnit` manquant (bug de perte de données silencieuse détecté et corrigé avant livraison). **Gap connu, non traité :** pas de rollback/transaction si la séquence échoue en cours de route.

### S4-FE-010 — Routes + Sidebar → repurposé en fix CI (budget SCSS)

**Status : ✅ Done** · P0 · 1 SP (routes, déjà en place) puis effort réel sur le fix CI · `fix(contracts): further deduplicate styles, promote rooms-badge to root scope`

Les routes/sidebar existaient déjà (vérifié dans les fichiers réels). Ticket réaffecté au vrai blocage : `contract-form.component.scss` dépassait le budget Angular (8 kB error). Deux bugs de scope identiques trouvés et corrigés (`.contract-context-bar`, `.rooms-badge` stylés uniquement dans `.room-prices-step` mais réutilisés sans style dans les headers d'accordéon Steps 4/5) — promus au scope racine dans `_shared-form-patterns.scss`. Résultat : 6.97 kB (sous le budget error), warning résiduel de 4 kB accepté comme normal pour un wizard à 6 steps.

### S4-FIX-004 — AgePolicy relocation per-room-type + reset PER_ROOM

**Status : ✅ Done** · P2 · 4 SP · `fix/S4-FIX-004-per-room-reset-baserate-agepolicy`

Deux correctifs regroupés (découverts ensemble en travaillant sur le même fichier) : (1) grille AgePolicy déplacée de "une fois par période" à "une fois par room type" suite à S4-BE-013-BIS (preuve : LBM/Tamassa) ; (2) `onPricingModeChanged()` ne vidait ni `baseRate` ni les `AgePolicy` associées au retour PER_ROOM — contredisait l'AC de S4-FE-006-BIS, corrigé dans le même passage. Pruning ajouté dans `syncRoomPriceMatrix()` (orphelines supprimées au retrait d'un room type — bug latent corrigé au passage).

---

## 7. Tickets — Fix, Refactor, Tech (hors refonte PER_OCCUPANCY)

### S4-FIX-001 — `createRoomPrice` ne retourne pas les `occupancyRates` créées

**Status : ✅ Done (contexte historique — legacy)** · P2 · 1 SP · `fix/S4-FIX-001-room-price-response`

Correction sur l'ancien modèle `OccupancyRate`, avant la refonte PER_OCCUPANCY. Toujours valide pour PER_ROOM (réponse cohérente sans régression), mais concerne un flux désormais remplacé pour PER_OCCUPANCY.

### S4-FIX-002 — Exposer `periodsCount` + relations sur Contract

**Status : ✅ Done** · P1 · 2 SP · `fix/S4-FIX-002-contract-periods-count`

`findAll`/`findOne`/`create`/`update` retournent tous `SharedContract` avec `hotel`/`market`/`currency` peuplés. `create`/`update` incluent `periodsCount` — bug silencieux corrigé : sans ça, la liste frontend affichait des colonnes vides pour tout contrat fraîchement créé/modifié (pattern local sans `reload()`, S4-FE-002).

### S4-FIX-003 — Sérialisation récursive des dates

**Status : ✅ Done** · P1 · 2 SP · `fix/S4-FIX-003-serialize-nested-dates`

`serializeDates<T>()` générique et récursive (`DeepDateToString<T>` mapped type, aucun `any`, aucun double cast). SRP strict : `mapToContract()` = mapping structurel uniquement, `serializeDates()` = seule responsable de toute conversion `Date → string`. Appliquée uniformément sur `findAll`/`findOne`/`create`/`update` (décision révisée : le coût perf du parcours récursif sur 2 champs top-level est négligeable, pas une optimisation prématurée justifiée).

### S4-REFACTOR-002 — Factoriser les patterns répétés dans ContractsService

**Status : ✅ Done** · P2 · 3 SP · `refactor/S4-REFACTOR-002-service-deduplication`

`getPeriodOrThrow()` (dédupliqué 3×) et `handleRepositoryError()` (mapping fixe `RepositoryResult → classe d'exception NestJS`, message variable par appelant). Erreur non mappée ou non-`RepositoryException` → toujours relancée telle quelle, jamais avalée silencieusement.

### S4-TECH-001 — Migrer `_page-layout.scss` vers un `@use` global

**Status : ✅ Done** · P2 (préventif) · 1 SP · `fix/S4-TECH-001-page-layout-global-use`

Même bug de scope que `.contract-context-bar`. Un seul composant concerné (`hotels-form.component.scss`) — nettoyé, `@use` local retiré au profit d'un `@use` global dans `styles.scss`. Nettoyage additionnel : `@use` local redondant vers `_forms.scss` retiré au passage.

### S4-TECH-002 — Retirer `@ngrx/store-devtools` du bundle de production

**Status : ✅ Done** · P2 · 2 SP · `fix/S4-TECH-002-strip-devtools-prod`

`fileReplacements` (via `apps/frontend/project.json` — pas `angular.json`, ignoré par Nx qui priorise le `project.json` par app) entre `devtools.providers.ts` et `devtools.providers.prod.ts` (tableau vide). Bundle initial : 553.50 kB → 539.45 kB. Devtools toujours fonctionnels en dev, confirmés absents du bundle prod (grep). Écart résiduel au budget (39.45 kB) documenté comme structurel (`@primeng/themes/aura`, chunk `@angular/forms` partagé).

---

## 8. Structure des fichiers (état final)

### Backend

```
apps/backend/src/
├── seasons/
│   ├── repositories/ (season + season-period, abstract + prisma)
│   ├── dto/ (create/update season + season-period)
│   ├── seasons.service.ts / seasons.controller.ts / seasons.module.ts
└── contracts/
    ├── dto/ (contract, contract-period, room-price, base-rate, age-policy,
    │         occupancy-guidance, meal-supplement, stop-sales — create + update)
    ├── repositories/ (contract.repository.ts abstract + prisma-contract.repository.ts)
    ├── contracts.types.ts
    ├── contracts.controller.ts
    ├── base-rates.controller.ts
    ├── age-policies.controller.ts
    ├── occupancy-guidances.controller.ts
    ├── room-prices.controller.ts
    ├── meal-plan-supplements.controller.ts
    ├── stop-sales-dates.controller.ts
    ├── contracts.service.ts
    ├── contracts.service.spec.ts
    └── contracts.module.ts
```

### Frontend

```
apps/frontend/src/app/
├── features/
│   ├── management/seasons/ (seasons-list, season-detail, season-period-form-dialog)
│   └── contracts/
│       ├── components/contracts-list/
│       ├── components/contract-form/ (6 steps, room-price-card, occupancy sub-panel)
│       ├── services/contracts.service.ts
│       └── contracts.routes.ts
├── features/management/hotels/room-types/ (OccupancyGuidance UI, S4-FE-014-BIS)
└── shared/
    ├── utils/date-range.util.ts
    ├── utils/confirm-delete.util.ts
    └── styles/_shared-form-patterns.scss, _page-layout.scss (global @use)
```

### Shared Types

```
libs/shared/types/src/lib/
├── season.types.ts     — Season (révisé), SeasonPeriod
└── contract.types.ts   — Contract, ContractPeriod, RoomPrice, BaseRate, AgePolicy,
                           OccupancyGuidance, MealPlanSupplement (+ BillingUnit),
                           StopSalesDate, PricingMode, SharingType, BaseRateReference
```

---

## 9. Definition of Done — Sprint 4 (final)

### Backend

- ✅ `Season` sans dates ; `SeasonPeriod` CRUD complet, chevauchement bloqué
- ✅ `ContractPeriod` avec dates propres + `seasonPeriodId?` optionnel, auto-fill, chevauchement bloqué
- ✅ Repository Pattern (abstract class) partout, `tourOperatorId` depuis JWT uniquement, PATCH sur tous les updates
- ✅ RoomPrice PER_ROOM (+ extra person) et PER_OCCUPANCY (BaseRate + AgePolicy, roomTypeId, occurrenceIndex, baseRateReference)
- ✅ OccupancyGuidance CRUD indépendant du contrat
- ✅ MealPlanSupplement (+ billingUnit) + StopSalesDate (validée contre ContractPeriod)
- ✅ Sérialisation de dates uniforme, sans fuite de `Date` Prisma dans le JSON
- ✅ Tests unitaires > 80% sur `contracts.service.ts`, 100% sur `serializeDates`
- ⏸️ Nettoyage legacy `OccupancyRate` — différé (S4-REFACTOR-003)

### Frontend

- ✅ Wizard `ContractForm` complet, 6 steps (Info → Periods → Room Prices → Meal Supplements → Stop Sales → Récap/Submit)
- ✅ `Season`/`SeasonPeriod` UI, `ContractsService` (BehaviorSubject, pas de cache bloquant sur `findAll`), `ContractsList`
- ✅ OccupancyGuidance géré sur la fiche Room Type, hors wizard
- ✅ Routes + sidebar en place, guards par rôle
- ✅ `take(1)` partout, `OnPush` partout, aucun `any`
- ✅ Build production sans erreur de budget SCSS ; bundle JS encore au-dessus du budget par ~39 kB (documenté, non bloquant)

---

## 10. Statut global & risques restants

**Sprint 4 : fonctionnellement terminé.**

| Item ouvert                                                               | Nature                     | Bloquant pour Sprint 5 ?    |
| ------------------------------------------------------------------------- | -------------------------- | --------------------------- |
| S4-REFACTOR-003 (cleanup legacy `OccupancyRate`)                          | Différé par choix          | Non                         |
| Bundle JS initial (539 kB / 500 kB)                                       | Dette technique documentée | Non                         |
| Pas de rollback/transaction sur `submitContract()` en cas d'échec partiel | Gap connu, non traité      | À évaluer — voir ci-dessous |
| Pas de garde anti-doublon sur une date de stop-sale déjà ajoutée          | Mineur, non traité         | Non                         |

---

À coller en ouverture de la prochaine session pour ne pas repartir de zéro :

> Je reprends le travail sur **Runner**, mon système B2B de gestion tour-opérateur (Angular 19 frontend solo + NestJS/Prisma backend en binôme). Le **Sprint 4 (Contrats + tarification PER_OCCUPANCY)** est fonctionnellement terminé — modèle `Season`/`SeasonPeriod`/`ContractPeriod` + `BaseRate`/`AgePolicy`/`OccupancyGuidance` (remplace l'ancien `OccupancyRate`), wizard `ContractForm` à 6 steps livré.
>
> Objectif de cette session : **couvrir ce module de tests**, en deux couches :
>
> - **Unitaire (Jest, backend)** : logique pure — validation de chevauchement de périodes (`ContractPeriod` et `SeasonPeriod`), auto-fill des dates, calculs/validations sur `BaseRate`/`AgePolicy` (capacité désormais non bloquante par décision produit — à ne pas tester comme si elle l'était), `serializeDates`. `contracts.service.spec.ts` existe déjà (S4-BE-011, S4-BE-011-BIS) — à étendre, pas à repartir de zéro.
> - **E2E (à définir : Playwright/Cypress)** : parcours complet du wizard `ContractForm`, usage normal d'abord (créer un contrat PER_ROOM simple, puis un PER_OCCUPANCY avec plusieurs occurrences AgePolicy), puis cas limites (chevauchement de périodes rejeté, stop-sale hors plage rejetée, `billingUnit` manquant bloque le submit, retour PER_OCCUPANCY→PER_ROOM vide bien `baseRate`/`agePolicies`).
>
> Approche pédagogique souhaitée : Socratique, une décision structurelle à la fois (est-ce unitaire ou e2e, avant d'écrire quoi que ce soit), pourquoi avant comment, exemples concrets tirés des vrais contrats hôteliers déjà utilisés pendant Sprint 4 (LBM, Tamassa, etc.) plutôt que des exemples abstraits.
>
> Point ouvert à trancher en premier dans cette session : **le rollback/transaction manquant sur `submitContract()` en cas d'échec partiel** (gap connu, non traité en Sprint 4) — un test e2e qui simule un échec au milieu de la séquence (ex. le POST room-prices échoue après que la période a été créée) va probablement le révéler concrètement avant même qu'on décide s'il faut le corriger.

---

_Document généré à partir de la consolidation du plan Sprint 4 original + 21 tickets `-BIS`/`FIX`/`TECH`/`REFACTOR` produits en cours de sprint. Sources : documents projet fournis + mémoire de session._
