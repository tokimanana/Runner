# Sprint 5 — Offers (Promotions SEQUENTIAL vs ADDITIVE)

> **Version consolidée.** Fusionne le plan révisé (découpage backend granulaire, aligné sur Sprint 3) avec le niveau de détail par ticket du plan original (Type / Branch / Commit / Acceptance Criteria / Files). Remplace les deux documents précédents.

**Durée estimée :** 5-6 jours
**Story Points :** 43 SP

---

## 1. Objectif Sprint

Créer le système d'offres promotionnelles avec modes SEQUENTIAL/ADDITIVE et règles de non-mixabilité.

## 2. Contexte de la révision

Le ticket original S5-BE-002 regroupait Prisma + types + DTOs + repository + service + controller en un seul ticket monolithique. Sur demande de Samuel, le backend a été redécoupé à la même granularité que Sprint 3 (`Supplement`/`MealPlan`). Samuel code ce backend lui-même sur ce sprint (départ ponctuel du split habituel frontend/backend avec son collègue).

## 3. Ordre d'exécution

```
Module scaffold (BE-001)
   └─ Offer : Prisma → Types → DTOs → Repository → Service → Controller (BE-002a→g)
        ├─ OfferPeriod : Prisma → DTOs → Repo/Service → Endpoints (BE-003a→d)
        └─ OfferSupplement : Prisma → DTOs/Repo/Service → Endpoints (BE-004a→c)
   └─ Validation compatibilité SEQUENTIAL/ADDITIVE (BE-005)
        └─ Frontend (FE-001 → FE-008)
```

---

## 4. Tickets — Backend

### S5-BE-001 — Créer OffersModule (scaffold)

- **Statut :** ✅ Done
- **Type :** Feature · **Priority :** P0 · **SP :** 2
- **Branch :** `feature/S5-BE-001-offers-module`
- **Commit :** `feat(offers): create offers module scaffold`
- **Depends on :** —
- **Description :**
  - `nx g @nestjs/schematics:module offers --sourceRoot=apps/backend/src --no-interactive` (+ controller, service)
  - Importé dans `AppModule`
- **Acceptance Criteria :**
  - ✅ Module créé et importé dans `AppModule`
  - ✅ Structure de base en place
- **Files :** `offers.module.ts`, `offers.controller.ts`, `offers.service.ts`

---

### Offer — chaîne complète

#### S5-BE-002a — Prisma : enums + modèle `Offer` + migration

- **Statut :** ✅ Done
- **Type :** Schema · **Priority :** P0 · **SP :** 2
- **Branch :** `feature/S5-BE-002a-prisma-offer`
- **Commit :** `feat(offers): add Offer model and enums to Prisma schema`
- **Depends on :** S5-BE-001
- **Description :**

  ```prisma
  enum OfferType {
    PERCENTAGE
    FLAT_AMOUNT
  }

  enum DiscountMode {
    SEQUENTIAL
    ADDITIVE
  }

  model Offer {
    id                     String       @id @default(cuid())
    code                   String
    name                   String
    description            String?
    type                   OfferType
    value                  Decimal      @db.Decimal(10, 2)
    discountMode           DiscountMode
    applyToRoomOnly        Boolean      @default(false)
    applyToMealSupplements Boolean      @default(false)
    minStay                Int?
    tourOperatorId         String
    createdAt              DateTime     @default(now())
    updatedAt              DateTime     @updatedAt

    @@unique([tourOperatorId, code])
    @@index([tourOperatorId])
  }
  ```

  - Multi-tenant (`tourOperatorId`), même pattern que `Supplement`/`MealPlan`

- **Acceptance Criteria :**
  - ✅ Migration s'applique sans erreur
  - ✅ Contrainte `@@unique([tourOperatorId, code])` vérifiée en base
- **Files :** `schema.prisma`, migration générée

#### S5-BE-002b — Shared types : `Offer`, `OfferDto`, `OfferType`, `DiscountMode`

- **Statut :** ✅ Done
- **Type :** Task · **Priority :** P0 · **SP :** 1
- **Branch :** `feature/S5-BE-002b-shared-types-offer`
- **Commit :** `feat(shared-types): add Offer types`
- **Depends on :** S5-BE-002a
- **Description :**
  - `Offer { id, code, name, description?, type, value: number, discountMode, applyToRoomOnly, applyToMealSupplements, minStay?, tourOperatorId, createdAt, updatedAt }`
  - `value: number`, jamais `Decimal` (même règle que `Supplement.price`)
- **Acceptance Criteria :**
  - ✅ Types compilent côté `libs/shared`
  - ✅ Aucune référence à `Decimal` dans les types partagés
- **Files :** `libs/shared/types/src/lib/offer.types.ts`

#### S5-BE-002c — DTOs : `CreateOfferDto` + `UpdateOfferDto`

- **Statut :** ✅ Done
- **Type :** Task · **Priority :** P1 · **SP :** 1
- **Branch :** `feature/S5-BE-002c-offer-dtos`
- **Commit :** `feat(offers): add CreateOfferDto and UpdateOfferDto`
- **Depends on :** S5-BE-002b
- **Description :**
  - `code`/`name`/`type`/`value`/`discountMode` requis
  - `description`/`minStay`/`applyToRoomOnly`/`applyToMealSupplements` optionnels (défauts)
  - `@IsEnum(OfferType)`, `@IsEnum(DiscountMode)`, `@IsNumber()` sur `value` (min 0)
  - `UpdateOfferDto extends PartialType(CreateOfferDto)`
- **Acceptance Criteria :**
  - ✅ Validation rejette enum invalide et `value` négatif
- **Files :** `dto/create-offer.dto.ts`, `dto/update-offer.dto.ts`

#### S5-BE-002d — `OfferRepository` (abstract class)

- **Statut :** ✅ Done
- **Type :** Task · **Priority :** P1 · **SP :** 1
- **Branch :** `feature/S5-BE-002d-offer-repository`
- **Commit :** `feat(offers): add OfferRepository abstract class`
- **Depends on :** S5-BE-002b
- **Description :**
  - 5 méthodes (`findAll`, `findOne`, `create`, `update`, `remove`), toutes scopées `tourOperatorId`
  - Abstract class comme token DI (convention Sprint 3+, jamais interface + string token)
- **Acceptance Criteria :**
  - ✅ Abstract class compile et est injectable
- **Files :** `offer.repository.ts`

#### S5-BE-002e — `PrismaOfferRepository`

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 3
- **Branch :** `feature/S5-BE-002e-prisma-offer-repository`
- **Commit :** `feat(offers): implement PrismaOfferRepository`
- **Depends on :** S5-BE-002d
- **Description :**
  - `findAll` via `$transaction([findMany, count])`
  - Include `offerPeriods`/`applicableSupplements`
  - P2002 → `CONFLICT`, P2025 → `NOT_FOUND`
  - Aucune exception HTTP à ce niveau — accès aux données uniquement
- **Acceptance Criteria :**
  - ✅ Tests unitaires mockant `PrismaService`
  - ✅ Codes d'erreur Prisma correctement mappés
- **Files :** `prisma-offer.repository.ts`

#### S5-BE-002f — `OffersService`

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 3
- **Branch :** `feature/S5-BE-002f-offers-service`
- **Commit :** `feat(offers): implement OffersService business logic`
- **Depends on :** S5-BE-002e
- **Description :**
  - `findAll` cape `limit` à `MAX_LIMIT = 100`
  - `findOne` → 404 si absent
  - `create`/`update` → `CONFLICT` → 409
  - `remove` → `NOT_FOUND` → 404
  - Convertit `value: Number(offer.value)` avant de retourner — le `Decimal` ne fuite jamais hors de ce layer
- **Acceptance Criteria :**
  - ✅ Tests couvrent tous les chemins d'erreur (404/409)
- **Files :** `offers.service.ts`

#### S5-BE-002g — `OffersController`

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 2
- **Branch :** `feature/S5-BE-002g-offers-controller`
- **Commit :** `feat(offers): implement OffersController REST endpoints`
- **Depends on :** S5-BE-002f
- **Description :**
  - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(ADMIN, MANAGER)`
  - `tourOperatorId` extrait du JWT, jamais du body
  - `GET /offers`, `GET /offers/:id`, `POST /offers`, `PATCH /offers/:id`, `DELETE /offers/:id`
  - `@HttpCode(204)` sur DELETE — **`PATCH`, pas `PUT`** (convention actée depuis Sprint 3)
- **Acceptance Criteria :**
  - ✅ Tests e2e pour chaque endpoint
  - ✅ 401/403 vérifiés pour rôles non autorisés
- **Files :** `offers.controller.ts`

---

### OfferPeriod — chaîne complète

#### S5-BE-003a — Prisma : modèle `OfferPeriod` + migration

- **Statut :** ✅ Done
- **Type :** Schema · **Priority :** P0 · **SP :** 1
- **Branch :** `feature/S5-BE-003a-prisma-offer-period`
- **Commit :** `feat(offers): add OfferPeriod model to Prisma schema`
- **Depends on :** S5-BE-002a
- **Description :**

  ```prisma
  model OfferPeriod {
    id        String   @id @default(cuid())
    offerId   String
    startDate DateTime
    endDate   DateTime
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    offer     Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)

    @@index([offerId])
  }
  ```

  - Périodes multiples par offre autorisées (ex: juillet ET décembre) — pas de contrainte d'unicité sur `offerId`

- **Acceptance Criteria :**
  - ✅ Migration s'applique
  - ✅ Cascade delete vérifié (supprimer l'`Offer` supprime ses `OfferPeriod`)
- **Files :** `schema.prisma`, migration générée

#### S5-BE-003b — DTOs : `CreateOfferPeriodDto` + `UpdateOfferPeriodDto`

- **Statut :** ⬜ To Do
- **Type :** Task · **Priority :** P1 · **SP :** 1
- **Branch :** `feature/S5-BE-003b-offer-period-dtos`
- **Commit :** `feat(offers): add CreateOfferPeriodDto and UpdateOfferPeriodDto`
- **Depends on :** S5-BE-003a
- **Description :**
  - `startDate`/`endDate` requis (`@IsDateString`)
  - Validation `startDate < endDate` au niveau service (pas DTO — nécessite comparaison entre deux champs)
- **Acceptance Criteria :**
  - ✅ Validation rejette dates malformées
- **Files :** `dto/create-offer-period.dto.ts`, `dto/update-offer-period.dto.ts`

#### S5-BE-003c — `OfferPeriod` : méthodes repository + service

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 2
- **Branch :** `feature/S5-BE-003c-offer-period-logic`
- **Commit :** `feat(offers): add OfferPeriod methods to repository and service`
- **Depends on :** S5-BE-003b, S5-BE-002e
- **Description :**
  - Étend `OfferRepository`/`OffersService` (pas de repository séparé — sous-ressource nichée, même pattern que `ContractPeriod` sous `ContractRepository`)
  - Validation `startDate < endDate` dans le service
  - 404 si `Offer` parent introuvable
- **Acceptance Criteria :**
  - ✅ Tests unitaires pour validation dates et cas not-found
- **Files :** `offer.repository.ts`, `offers.service.ts` (étendus)

#### S5-BE-003d — Endpoints `OfferPeriod` (nested)

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P0 · **SP :** 1
- **Branch :** `feature/S5-BE-003d-offer-period-endpoints`
- **Commit :** `feat(offers): add nested OfferPeriod endpoints`
- **Depends on :** S5-BE-003c, S5-BE-002g
- **Description :**
  - `POST /offers/:id/periods`, `PATCH /offers/:id/periods/:periodId`, `DELETE /offers/:id/periods/:periodId`
  - Mêmes guards que `OffersController`
- **Acceptance Criteria :**
  - ✅ Tests e2e CRUD nested + périodes multiples supportées
- **Files :** `offers.controller.ts` (étendu)

---

### OfferSupplement — chaîne complète

#### S5-BE-004a — Prisma : `OfferSupplement` join model + migration

- **Statut :** ✅ Done
- **Type :** Schema · **Priority :** P0 · **SP :** 1
- **Branch :** `feature/S5-BE-004a-prisma-offer-supplement`
- **Commit :** `feat(offers): add OfferSupplement join model to Prisma schema`
- **Depends on :** S5-BE-002a
- **Description :**

  ```prisma
  model OfferSupplement {
    id            String     @id @default(cuid())
    offerId       String
    supplementId  String
    applyDiscount Boolean    @default(false)
    offer         Offer      @relation(fields: [offerId], references: [id], onDelete: Cascade)
    supplement    Supplement @relation(fields: [supplementId], references: [id])

    @@unique([offerId, supplementId])
    @@index([offerId])
  }
  ```

  - Lien vers `Supplement` (Sprint 3, déjà stable — aucune dépendance sur le modèle Sprint 4)

- **Acceptance Criteria :**
  - ✅ Migration s'applique
  - ✅ Contrainte `@@unique([offerId, supplementId])` vérifiée
- **Files :** `schema.prisma`, migration générée

#### S5-BE-004b — DTOs + méthodes repository/service `OfferSupplement`

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 2
- **Branch :** `feature/S5-BE-004b-offer-supplement-logic`
- **Commit :** `feat(offers): add OfferSupplement DTO and repository/service logic`
- **Depends on :** S5-BE-004a, S5-BE-002e
- **Description :**
  - `CreateOfferSupplementDto` (`supplementId`, `applyDiscount?`)
  - 404 si `Offer` ou `Supplement` introuvable
  - 409 si déjà lié (P2002)
- **Acceptance Criteria :**
  - ✅ Tests unitaires couvrant lien / doublon / not-found
- **Files :** `dto/create-offer-supplement.dto.ts`, `offers.service.ts` (étendu)

#### S5-BE-004c — Endpoints `OfferSupplement` (link/unlink)

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 1
- **Branch :** `feature/S5-BE-004c-offer-supplement-endpoints`
- **Commit :** `feat(offers): add OfferSupplement link/unlink endpoints`
- **Depends on :** S5-BE-004b, S5-BE-002g
- **Description :**
  - `POST /offers/:id/supplements` (lier)
  - `DELETE /offers/:id/supplements/:supplementId` (délier)
- **Acceptance Criteria :**
  - ✅ Tests e2e lier/délier
- **Files :** `offers.controller.ts` (étendu)

---

### S5-BE-005 — Validation non-mixabilité SEQUENTIAL/ADDITIVE

- **Statut :** ⬜ To Do
- **Type :** Enhancement · **Priority :** P1 · **SP :** 2
- **Branch :** `feature/S5-BE-005-offers-validation`
- **Commit :** `feat(offers): add validate-compatibility endpoint`
- **Depends on :** S5-BE-002f
- **Description :**
  - `POST /offers/validate-compatibility`
  - Payload : liste d'`offerIds`
  - Retour : `{ compatible: boolean, reason?: string }`
  - 1+ offre ADDITIVE bloque toute SEQUENTIAL dans le même lot, et inversement
- **Acceptance Criteria :**
  - ✅ Tests unitaires + e2e sur lots mixtes et lots homogènes
- **Files :** `offers.controller.ts`, `offers.service.ts`

---

### ~~S5-BE-006~~ — DTOs avec validation

- **Statut :** ❌ Superseded — absorbé par S5-BE-002c (DTOs `Offer`), S5-BE-003b (DTOs `OfferPeriod`) et S5-BE-004b (DTO `OfferSupplement`). Ne pas implémenter séparément.

---

## 5. Tickets — Frontend

_Inchangés par rapport au plan original — non concernés par le découpage backend._

### S5-FE-001 — Créer OffersService

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P0 · **SP :** 1
- **Branch :** `feature/S5-FE-001-offers-service`
- **Commit :** `feat(offers): create offers service with BehaviorSubject`
- **Depends on :** S5-BE-002g, S5-BE-003d, S5-BE-004c, S5-BE-005
- **Description :**
  - `features/offers/services/offers.service.ts`
  - **BehaviorSubject** (pas NgRx)
  - Méthodes : `getOffers()`, `getOffer(id)`, `createOffer()`, `updateOffer()`, `deleteOffer()` + periods/supplements + `validateCompatibility(offerIds)`
  - `take(1)` sur tous les `subscribe()`
- **Acceptance Criteria :**
  - ✅ Tous les appels API fonctionnels, typage correct
- **Files :** `features/offers/services/offers.service.ts`

### S5-FE-002 — Créer OffersList Component

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P0 · **SP :** 2
- **Branch :** `feature/S5-FE-002-offers-list`
- **Commit :** `feat(offers): create offers list with discount mode badges`
- **Depends on :** S5-FE-001
- **Description :**
  - `p-table` : Name, Type, Value, Discount Mode, Periods, Actions
  - Badge `p-tag` : SEQUENTIAL → severity `info` (bleu), ADDITIVE → severity `success` (vert)
  - Boutons Create/Edit/Delete
- **Acceptance Criteria :**
  - ✅ Liste affichée, badges clairs, actions fonctionnelles
- **Files :** `features/offers/components/offers-list/offers-list.component.ts`

### S5-FE-003 — Créer OfferForm Component

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P0 · **SP :** 4
- **Branch :** `feature/S5-FE-003-offer-form`
- **Commit :** `feat(offers): create offer form with discount mode explanation`
- **Depends on :** S5-FE-001
- **Description :**
  - Reactive Form : Name, Description, Type (`p-radiobutton`), Value (`p-inputnumber`), Discount Mode (`p-radiobutton`), Apply to room only / Apply to meal supplements (`p-checkbox`), minStay (`p-inputnumber`)
  - Tooltip explicatif SEQUENTIAL vs ADDITIVE avec exemples chiffrés (voir §7)
  - Warning `p-message` : offres non mixables
- **Acceptance Criteria :**
  - ✅ Formulaire complet, tooltips informatifs, validation complète
- **Files :** `features/offers/components/offer-form/offer-form.component.ts`

### S5-FE-004 — OfferForm — Gestion des Périodes

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P0 · **SP :** 2
- **Branch :** `feature/S5-FE-004-offer-periods`
- **Commit :** `feat(offers): add offer periods management in form`
- **Depends on :** S5-FE-003, S5-BE-003d
- **Description :**
  - Section périodes de validité : `p-table` + `p-dialog` (start/end via `p-datepicker`)
  - Périodes multiples (ex: juillet + décembre)
- **Acceptance Criteria :**
  - ✅ CRUD périodes fonctionnel, périodes multiples supportées, validation dates
- **Files :** `features/offers/components/offer-period-dialog/offer-period-dialog.component.ts`

### S5-FE-005 — OfferForm — Gestion des Supplements applicables

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 2
- **Branch :** `feature/S5-FE-005-offer-supplements`
- **Commit :** `feat(offers): add applicable supplements management in offer form`
- **Depends on :** S5-FE-003, S5-BE-004c
- **Description :**
  - Liste `p-checkbox` par supplement + checkbox "Appliquer réduction" (`applyDiscount`)
- **Acceptance Criteria :**
  - ✅ Liste avec checkboxes, flag `applyDiscount` géré
- **Files :** `features/offers/components/offer-form/offer-form.component.ts`

### S5-FE-006 — Créer OffersSelectionComponent (pour Booking)

- **Statut :** ⬜ To Do
- **Type :** Feature · **Priority :** P1 · **SP :** 3
- **Branch :** `feature/S5-FE-006-offers-selection`
- **Commit :** `feat(offers): create offers selection component with compatibility logic`
- **Depends on :** S5-FE-001
- **Description :**
  - Composant réutilisable pour Booking Wizard (⚠️ n'existe pas encore — vérifier testabilité isolée avant de coder l'intégration)
  - Offres filtrées par dates + minStay
  - Blocage croisé : ADDITIVE sélectionnée → désactive les SEQUENTIAL, et inversement
  - `p-tag` sur offres désactivées avec tooltip explicatif (mêmes couleurs que FE-002)
- **Acceptance Criteria :**
  - ✅ Blocage fonctionne, tooltips informatifs, UI claire
- **Files :** `features/offers/components/offers-selection/offers-selection.component.ts`

### S5-FE-007 — Tests unitaires OffersSelectionComponent

- **Statut :** ⬜ To Do
- **Type :** Test · **Priority :** P1 · **SP :** 2
- **Branch :** `test/S5-FE-007-offers-selection-tests`
- **Commit :** `test(offers): add unit tests for offers selection compatibility logic`
- **Depends on :** S5-FE-006
- **Description :**
  - Blocage + déblocage à la désélection, coverage > 80%, mock `OffersService`
- **Acceptance Criteria :**
  - ✅ Coverage > 80%, tous les tests passent
- **Files :** `features/offers/components/offers-selection/offers-selection.component.spec.ts`

### S5-FE-008 — Configurer les routes Offers

- **Statut :** ⬜ To Do
- **Type :** Task · **Priority :** P0 · **SP :** 1
- **Branch :** `chore/S5-FE-008-offers-routes`
- **Commit :** `chore(routing): add offers routes with guards`
- **Depends on :** S5-FE-002, S5-FE-003
- **Description :**
  - Routes `/offers`, `/offers/new`, `/offers/:id/edit`, lazy loading via `loadComponent`
  - `AuthGuard` + `RoleGuard` (ADMIN, MANAGER)
  - Sidebar à jour
- **Acceptance Criteria :**
  - ✅ Routes accessibles selon rôles, sidebar à jour
- **Files :** `features/offers/offers.routes.ts`, `app.routes.ts`, `sidebar.component.ts`

---

## 6. Definition of Done — Sprint 5

### Backend

- ⬜ `Offer` CRUD complet (chaîne S5-BE-002a→g)
- ⬜ `OfferPeriod` avec périodes multiples (chaîne S5-BE-003a→d)
- ⬜ `OfferSupplement` avec flag `applyDiscount` (chaîne S5-BE-004a→c)
- ⬜ Endpoint `validate-compatibility` fonctionnel
- ⬜ Tous les DTOs avec validation (`class-validator`)
- ⬜ `value: number` en shared types, jamais `Decimal`
- ⬜ Repository Pattern (abstract class) partout, `tourOperatorId` depuis JWT uniquement
- ⬜ `PATCH` sur toutes les mises à jour

### Frontend

- ⬜ Liste offers avec badges `p-tag` SEQUENTIAL/ADDITIVE
- ⬜ Formulaire Reactive Forms + PrimeNG, tooltips informatifs
- ⬜ Gestion périodes multiples + supplements applicables
- ⬜ `OffersSelectionComponent` avec logique de blocage
- ⬜ Routes protégées selon rôles
- ⬜ `BehaviorSubject` pour `OffersService` (pas NgRx)
- ⬜ Tests unitaires > 80%

---

## 7. Notes importantes

### Exemples concrets pour tooltips

**SEQUENTIAL :** Prix base 200€, Offre A -10%, Offre B -5%
`200€ × 0.90 × 0.95 = 171€` → réduction 29€ (14,5%)

**ADDITIVE :** Prix base 200€, Offre A -10%, Offre B -5%
`200€ × (1 - 0.15) = 170€` → réduction 30€ (15%)

---

## 8. Dépendances

- Sprint 3 (Supplements) — recommandé, satisfait (module stable, aucune dépendance Sprint 4)
- Aucune dépendance sur le modèle `BaseRate`/`AgePolicy`/`OccupancyGuidance` (Sprint 4) — les offres s'appliquent en aval du prix calculé

## 9. Risques

| Risque                                                                     | Mitigation                                                                       |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Logique de blocage SEQUENTIAL/ADDITIVE complexe côté frontend              | Tests unitaires exhaustifs (S5-FE-007)                                           |
| Confusion SEQUENTIAL vs ADDITIVE pour l'utilisateur final                  | Tooltips + exemples chiffrés                                                     |
| Périodes multiples                                                         | `p-table` + `p-dialog` PrimeNG, même pattern que Sprint 4                        |
| `OffersSelectionComponent` dépend d'un Booking Wizard pas encore construit | Concevoir le composant testable isolément dès le départ                          |
| Split des tickets backend en 15 tickets fins vs 6 originaux                | Overhead de suivi accepté en échange de PRs plus petites, un scope par commit    |
| **Total SP incohérent dans le document révisé (31 annoncé vs 43 réel)**    | **Recalcul fait dans ce document — à valider avec Samuel avant sprint planning** |

---

_Document consolidé — fusionne le découpage granulaire backend (demande de Samuel, même finesse que Sprint 3) avec le niveau de détail par ticket du plan original. Total de points recalculé et écart signalé._
