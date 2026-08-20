# Sprint 3 — Référentiels (MealPlans, Markets, Currencies, Supplements)

> **Document consolidé — état final.** Remplace intégralement le plan Sprint 3 original. Mêmes numéros de ticket que l'historique réel ; contenu réécrit pour refléter ce qui a été **effectivement livré**, dépendances et fichiers complétés là où ils manquaient.
>
> **Statut global : Sprint 3 terminé.** Base saine pour Sprint 4 (déjà consolidé séparément) et Sprint 5.

---

## 1. Objectif

Construire le CRUD des 4 entités référentielles utilisées par les contrats et les réservations : `MealPlan`, `Market`, `Currency`, `Supplement`.

**Ordre d'exécution :** backend d'abord (débloque les APIs) → routing (débloque la navigation) → frontend feature par feature.

---

## 2. Décisions d'architecture

### Backend

- **Repository Pattern — abstract class comme token DI.** Différent de Sprint 2 (Hotels/Seasons utilisaient une `interface` + constante string type `HOTEL_REPOSITORY`). À partir de Sprint 3 : une **abstract class** sert à la fois de type et de token d'injection NestJS — plus besoin de fichier de constantes séparé.
- **Repository = accès aux données uniquement.** Aucune exception HTTP à ce niveau.
- **Service = logique métier**, exceptions HTTP, sanitization (`MAX_LIMIT = 100`).
- **Multi-tenancy** — `tourOperatorId` extrait du JWT, jamais du body de la requête.
- **Exception Currencies** — référentiel global, aucun `tourOperatorId` à aucun niveau. `RolesGuard` reste appliqué.
- **Supplements** — `price` est `Decimal` côté Prisma, sérialisé en `number` dans le service (jamais l'inverse).

### Frontend

- **BehaviorSubject + flag `loaded`** pour les 4 services (pattern `HotelsService` — pas `SeasonsService`).
- **`take(1)`** sur tous les `subscribe()`.
- Tous les composants sous `features/management/<feature>/` — cohérent avec hotels et seasons.
- **Utilitaire `confirmDelete`** — `shared/utils/confirm-delete.util.ts` centralise toute la logique de confirmation + feedback toast. Chaque composant passe `header`, `entityName`, `delete$`, `onSuccess?`, `conflictMessage?`, et optionnellement `message?` pour les cas avec avertissement cascade. **Règle : tout nouveau `confirmDelete` en Sprint 4+ doit utiliser ce helper** (introduit en cours de Sprint 3, voir §6).

---

## 3. Structure des fichiers (état final)

### Backend

```
apps/backend/src/
├── meal-plans/
│   ├── dto/create-meal-plan.dto.ts, update-meal-plan.dto.ts
│   ├── repositories/meal-plan.repository.ts, prisma-meal-plan.repository.ts
│   ├── meal-plans.service.ts
│   ├── meal-plans.controller.ts
│   └── meal-plans.module.ts
├── markets/            (même structure)
├── currencies/         (même structure, sans tourOperatorId)
├── supplements/        (même structure, + SupplementUnit enum)
└── common/
    └── repository.types.ts   — RepositoryResult (DELETED/NOT_FOUND/CONFLICT/HAS_CONTRACTS/HAS_PERIODS)
```

### Frontend

```
apps/frontend/src/app/
├── features/management/
│   ├── hotels/, seasons/         — Sprint 2 ✅
│   ├── meal-plans/
│   │   ├── components/meal-plans-list/, meal-plan-form/
│   │   └── meal-plans.service.ts
│   ├── markets/                  (même structure)
│   ├── currencies/                (même structure)
│   └── supplements/               (même structure)
└── shared/
    └── utils/confirm-delete.util.ts   — nouveau, introduit en cours de sprint
```

### Shared Types

```
libs/shared/types/src/lib/
├── types.ts               — existant depuis Sprint 2
├── meal-plan.types.ts
├── market.types.ts
├── currency.types.ts
└── supplement.types.ts
```

---

## 4. Tickets — Backend

### MealPlans

**S4-BE-001 renumbered? — non, on garde les vrais numéros ci-dessous.**

#### S3-BE-001 — Prisma : `MealPlan` model + migration

**Status : ✅ Done** · P0 · 2 SP · `feature/S3-BE-001-prisma-meal-plan`

```prisma
model MealPlan {
  id             String   @id @default(cuid())
  code           String
  name           String
  description    String?
  tourOperatorId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([tourOperatorId, code])
  @@index([tourOperatorId])
}
```

Prérequis bloquant pour tous les autres tickets MealPlan. `@@unique([tourOperatorId, code])` empêche deux meal plans au même code chez un même tour opérateur.

#### S3-BE-002 — Shared types : `MealPlan` + `MealPlanDto`

**Status : ✅ Done** · P0 · 1 SP · Depends on S3-BE-001 · `feature/S3-BE-002-shared-types-meal-plan`

`MealPlan { id, code, name, description, tourOperatorId, createdAt, updatedAt }`, `MealPlanDto { code, name, description? }`. Fichier : `libs/shared/types/src/lib/meal-plan.types.ts`.

#### S3-BE-003 — DTOs : `CreateMealPlanDto` + `UpdateMealPlanDto`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-002 · `feature/S3-BE-003-meal-plan-dtos`

`code`/`name` requis (`@IsNotEmpty`), `description` optionnel. `UpdateMealPlanDto extends PartialType(CreateMealPlanDto)`.

#### S3-BE-004 — `MealPlanRepository` (abstract class)

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-002 · `feature/S3-BE-004-meal-plan-repository`

5 méthodes (`findAll`, `findOne`, `create`, `update`, `remove`), toutes avec `tourOperatorId`. Même pattern que `SeasonRepository`.

#### S3-BE-005 — `PrismaMealPlanRepository`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-004 · `feature/S3-BE-005-prisma-meal-plan-repository`

Toutes les requêtes scopées `tourOperatorId`. `findAll` via `$transaction([findMany, count])`. P2002 → `CONFLICT`, P2025 → `NOT_FOUND`, P2003 → `HAS_CONTRACTS` sur `remove` — code forward-looking (le modèle `Contract` n'existe pas encore, arrive en Sprint 4 ; le catch est ajouté dès maintenant pour ne pas nécessiter de migration plus tard). Aucune exception HTTP à ce niveau.

#### S3-BE-006 — `MealPlansService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-005 · `feature/S3-BE-006-meal-plans-service`

`findAll` cape `limit` à `MAX_LIMIT = 100`. `findOne` → 404 si absent. `create`/`update` → `CONFLICT` → 409 ; `update` appelle `findOne` d'abord. `remove` → `NOT_FOUND` → 404, `HAS_CONTRACTS` → 409.

#### S3-BE-007 — `MealPlansController`

**Status : ✅ Done** · P1 · 2 SP · Depends on S3-BE-006 · `feature/S3-BE-007-meal-plans-controller`

`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(ADMIN, MANAGER)`. `tourOperatorId` toujours extrait du JWT. 5 endpoints REST, `@HttpCode(204)` sur DELETE.

#### S3-BE-008 — `MealPlansModule` + `AppModule`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-007 · `feature/S3-BE-008-meal-plans-module`

`provide: MealPlanRepository, useClass: PrismaMealPlanRepository`, importé dans `AppModule`.

---

### Markets

#### S3-BE-009 — Prisma : `Market` model + migration

**Status : ✅ Done** · P0 · 2 SP · `feature/S3-BE-009-prisma-market`

```prisma
model Market {
  id             String   @id @default(cuid())
  code           String
  name           String
  tourOperatorId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([tourOperatorId, code])
  @@index([tourOperatorId])
}
```

Pas de `description` (plus simple que MealPlan).

#### S3-BE-010 — Shared types : `Market` + `MarketDto`

**Status : ✅ Done** · P0 · 1 SP · Depends on S3-BE-009 · `feature/S3-BE-010-shared-types-market`

`Market { id, code, name, tourOperatorId, createdAt, updatedAt }`, `MarketDto { code, name }`.

#### S3-BE-011 — DTOs : `CreateMarketDto` + `UpdateMarketDto`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-010 · `feature/S3-BE-011-market-dtos`

`code`/`name` requis, aucun champ optionnel.

#### S3-BE-012 — `MarketRepository` (abstract class)

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-010 · `feature/S3-BE-012-market-repository`

Même pattern DI que S3-BE-004.

#### S3-BE-013 — `PrismaMarketRepository`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-012 · `feature/S3-BE-013-prisma-market-repository`

Même structure que `PrismaMealPlanRepository` — scopé `tourOperatorId`, erreurs Prisma mappées vers `RepositoryException`.

#### S3-BE-014 — `MarketsService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-013 · `feature/S3-BE-014-markets-service`

Mêmes responsabilités que `MealPlansService`.

#### S3-BE-015 — `MarketsController`

**Status : ✅ Done** · P1 · 2 SP · Depends on S3-BE-014 · `feature/S3-BE-015-markets-controller`

Même pattern guards/JWT que `MealPlansController`.

#### S3-BE-016 — `MarketsModule` + `AppModule`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-015 · `feature/S3-BE-016-markets-module`

---

### Currencies

#### S3-BE-017 — Prisma : `Currency` model + migration

**Status : ✅ Done** · P0 · 2 SP · `feature/S3-BE-017-prisma-currency`

```prisma
model Currency {
  id     String @id @default(cuid())
  code   String @unique
  name   String
  symbol String
}
```

**Référentiel global** — pas de `tourOperatorId`, pas de `createdAt`/`updatedAt`, `code` unique dans toute l'application, partagé par tous les tour-opérateurs.

#### S3-BE-018 — Shared types : `Currency` + `CurrencyDto`

**Status : ✅ Done** · P0 · 1 SP · Depends on S3-BE-017 · `feature/S3-BE-018-shared-types-currency`

`Currency { id, code, name, symbol }` — pas de `tourOperatorId` ni de timestamps, distinction explicite avec les référentiels tenant-scoped.

#### S3-BE-019 — DTOs : `CreateCurrencyDto` + `UpdateCurrencyDto`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-018 · `feature/S3-BE-019-currency-dtos`

`code`/`name`/`symbol` tous requis. `code` en format ISO 4217 par convention de documentation, pas de regex validator à ce stade.

#### S3-BE-020 — `CurrencyRepository` (abstract class)

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-018 · `feature/S3-BE-020-currency-repository`

Aucun `tourOperatorId` dans aucune signature de méthode.

#### S3-BE-021 — `PrismaCurrencyRepository`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-020 · `feature/S3-BE-021-prisma-currency-repository`

Aucune clause `where` ne référence `tourOperatorId`. `findAll` retourne toutes les devises, indépendamment de l'appelant.

#### S3-BE-022 — `CurrenciesService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-021 · `feature/S3-BE-022-currencies-service`

Même structure que les autres services référentiels, sans `tourOperatorId` dans aucune méthode.

#### S3-BE-023 — `CurrenciesController`

**Status : ✅ Done** · P1 · 2 SP · Depends on S3-BE-022 · `feature/S3-BE-023-currencies-controller`

Guards/rôles maintenus (`ADMIN`/`MANAGER`) même si le référentiel est global — seule différence : aucune extraction de `tourOperatorId` depuis le JWT.

#### S3-BE-024 — `CurrenciesModule` + `AppModule`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-023 · `feature/S3-BE-024-currencies-module`

---

### Supplements

#### S3-BE-025 — Prisma : `SupplementUnit` enum + `Supplement` model + migration

**Status : ✅ Done** · P0 · 2 SP · `feature/S3-BE-025-prisma-supplement`

```prisma
enum SupplementUnit {
  PER_PERSON_PER_NIGHT
  PER_PERSON_PER_STAY
  PER_ROOM_PER_NIGHT
  PER_ROOM_PER_STAY
}

model Supplement {
  id                 String         @id @default(cuid())
  name               String
  description        String?
  price              Decimal
  unit               SupplementUnit
  canReceiveDiscount Boolean        @default(false)
  tourOperatorId     String
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  @@index([tourOperatorId])
}
```

Référentiel le plus complexe : `price` en `Decimal` (précision), `unit` détermine comment le prix s'applique, `canReceiveDiscount` contrôle l'éligibilité aux remises. La conversion `Decimal → number` se fait au niveau service, pas ici.

#### S3-BE-026 — Shared types : `SupplementUnit` + `Supplement` + `SupplementDto`

**Status : ✅ Done** · P0 · 1 SP · Depends on S3-BE-025 · `feature/S3-BE-026-shared-types-supplement`

`price: number` côté shared types — jamais `Decimal`, qui reste un détail d'implémentation de la couche de persistance et ne doit jamais fuiter dans le contrat partagé frontend/backend.

#### S3-BE-027 — DTOs : `CreateSupplementDto` + `UpdateSupplementDto`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-026 · `feature/S3-BE-027-supplement-dtos`

`name` requis, `description` optionnel, `price` (`@IsNumber`, min 0), `unit` (`@IsEnum(SupplementUnit)`), `canReceiveDiscount` (`@IsBoolean`). DTO le plus complexe du sprint côté validation.

#### S3-BE-028 — `SupplementRepository` (abstract class)

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-026 · `feature/S3-BE-028-supplement-repository`

Multi-tenant — `tourOperatorId` dans toutes les signatures.

#### S3-BE-029 — `PrismaSupplementRepository`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-028 · `feature/S3-BE-029-prisma-supplement-repository`

`price` retourné tel quel par Prisma (`Decimal`) — aucune conversion à ce niveau, c'est la responsabilité du service.

#### S3-BE-030 — `SupplementsService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-029 · `feature/S3-BE-030-supplements-service`

En plus des responsabilités standard, convertit `price: Number(supplement.price)` avant de retourner — empêche l'objet `Decimal` de fuiter dans la réponse API.

#### S3-BE-031 — `SupplementsController`

**Status : ✅ Done** · P1 · 2 SP · Depends on S3-BE-030 · `feature/S3-BE-031-supplements-controller`

Même pattern guards/rôles/JWT que `MealPlansController`/`MarketsController`.

#### S3-BE-032 — `SupplementsModule` + `AppModule`

**Status : ✅ Done** · P1 · 1 SP · Depends on S3-BE-031 · `feature/S3-BE-032-supplements-module`

---

## 5. Tickets — Frontend

### Routing & Sidebar

#### S3-FE-001 — Routes lazy-loaded pour les 4 référentiels

**Status : ✅ Done** · P1 · 2 SP · `chore/S3-FE-001-referentials-routes`

`meal-plans`, `markets`, `currencies`, `supplements` sous le groupe `management` dans `app.routes.ts`. `loadComponent` + `AuthGuard` + `RoleGuard`, rôles via `route.data['roles']` (ex. `{ roles: ['ADMIN', 'MANAGER'] }`) — cohérent avec le `RoleGuard` de Sprint 1. Redirige vers `/dashboard` pour `AGENT`, vers `/login` si non authentifié.

#### S3-FE-002 — Sidebar : ajout des 4 référentiels

**Status : ✅ Done** · P1 · 2 SP · Depends on S3-FE-001 · `chore/S3-FE-002-sidebar-referentials`

Items Meal Plans/Markets/Currencies/Supplements sous le groupe `management`, visibles ADMIN/MANAGER uniquement, `RouterLinkActive` pour l'item actif.

### Services

#### S3-FE-003 — `MealPlansService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-008 · `feature/S3-FE-003-meal-plans-service`

Pattern `HotelsService` : `BehaviorSubject` + flag `loaded` (un seul fetch, appels suivants servent depuis le cache). `getAll()`/`create()`/`update()`/`remove()` mettent à jour le `BehaviorSubject` en place. `take(1)` partout, `providedIn: 'root'`, aucun `any`.

#### S3-FE-004 — `MarketsService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-016 · `feature/S3-FE-004-markets-service`

Même pattern exact que `MealPlansService`.

#### S3-FE-005 — `CurrenciesService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-024 · `feature/S3-FE-005-currencies-service`

Même pattern de cache. L'API retourne toutes les devises indépendamment du tour-opérateur courant — aucun filtrage tenant côté client à gérer.

#### S3-FE-006 — `SupplementsService`

**Status : ✅ Done** · P1 · 3 SP · Depends on S3-BE-032 · `feature/S3-FE-006-supplements-service`

Même pattern. `price` arrive déjà en `number` depuis l'API (sérialisé côté backend service) — aucune conversion supplémentaire nécessaire côté frontend.

### MealPlans

#### S3-FE-007 — `MealPlansListComponent`

**Status : ✅ Done** · P2 · 3 SP · Depends on S3-FE-003 · `feature/S3-FE-007-meal-plans-list`

`p-table` : Code, Name, Description, Actions. Edit/Delete par ligne, Add en header. Suppression via `p-confirmdialog` (migré vers le helper `confirmDelete` en cours de sprint, voir §6). `p-toast` succès/erreur. `OnPush`.

#### S3-FE-008 — `MealPlanFormComponent`

**Status : ✅ Done** · P2 · 3 SP · Depends on S3-FE-007 · `feature/S3-FE-008-meal-plan-form`

`p-dialog` + Reactive Form. Champs : `code`/`name` requis, `description` optionnel. Mode create/edit déterminé par la présence d'un `input()` `mealPlan`. Validation inline, erreur API (409 doublon) → toast, dialog reste ouvert. `input()`/`output()`, `inject()`, `OnPush`.

### Markets

#### S3-FE-009 — `MarketsListComponent`

**Status : ✅ Done** · P2 · 3 SP · Depends on S3-FE-004 · `feature/S3-FE-009-markets-list`

`p-table` : Code, Name, Actions (pas de colonne Description). Même UX que MealPlansList.

#### S3-FE-010 — `MarketFormComponent`

**Status : ✅ Done** · P2 · 3 SP · Depends on S3-FE-009 · `feature/S3-FE-010-market-form`

Deux champs requis : `code`, `name`. Même pattern dual-mode que `MealPlanFormComponent`.

### Currencies

#### S3-FE-011 — `CurrenciesListComponent`

**Status : ✅ Done** · P2 · 3 SP · Depends on S3-FE-005 · `feature/S3-FE-011-currencies-list`

`p-table` : Code, Name, Symbol, Actions. Dataset global — pas de filtrage tenant. Même UX que les autres listes.

#### S3-FE-012 — `CurrencyFormComponent`

**Status : ✅ Done** · P2 · 3 SP · Depends on S3-FE-011 · `feature/S3-FE-012-currency-form`

Trois champs requis : `code` (ISO 4217), `name`, `symbol`. Même pattern dual-mode.

### Supplements

#### S3-FE-013 — `SupplementsListComponent`

**Status : ✅ Done** · P2 · 3 SP · Depends on S3-FE-006 · `feature/S3-FE-013-supplements-list`

`p-table` : Name, Price, Unit, Can Receive Discount, Actions. `price` affiché formaté (jamais l'objet `Decimal`), `canReceiveDiscount` en icône/lisible.

#### S3-FE-014 — `SupplementFormComponent`

**Status : ✅ Done** · P1 · 5 SP (le plus complexe du sprint) · Depends on S3-FE-013 · `feature/S3-FE-014-supplement-form`

Champs : `name`, `description`, `price`, `unit`, `canReceiveDiscount`. `p-select` pour `unit` avec tooltip explicatif par option (les 4 valeurs `SupplementUnit`), validation client sur `price ≥ 0`, `p-checkbox` pour `canReceiveDiscount` (défaut `false`).

---

## 6. Tickets — Refacto & Fix (introduits en cours de sprint)

> Ces tickets n'étaient pas dans le plan initial — découverts en cours d'implémentation. Ils font partie intégrante du Sprint 3 terminé et sont la base des conventions Sprint 4+.

### S3-REFACTOR-FE-001 — Extraire l'utilitaire partagé `confirmDelete`

**Status : ✅ Done** · P1 · 2 SP · `refactor/S3-REFACTOR-FE-001-confirm-delete-util`

**Contexte :** 6 composants (`SupplementFormComponent` ×2, `RoomTypesListComponent`, `MarketFormComponent`, `MealPlansListComponent`, `SeasonsListComponent`) dupliquaient une logique `confirmDelete` quasi identique — tout bug/évolution aurait dû être corrigé 6 fois.

**Livré :** `apps/frontend/src/app/shared/utils/confirm-delete.util.ts` — fonction `confirmDelete(opts: ConfirmDeleteOptions)` prenant `header`, `entityName`, `message?` (sinon message généré automatiquement), `delete$`, `onSuccess?`, `conflictMessage?`, `confirmationService`, `messageService`. Gère la confirmation PrimeNG, le toast succès, le toast erreur (409 → `warn` avec `conflictMessage`, sinon `error` générique), `take(1)` centralisé.

Migré : `supplement-form.component.ts`, `room-types-list.component.ts`, `market-form.component.ts`, `meal-plans-list.component.ts`, `seasons-list.component.ts` (ce dernier dépendait de S3-FIX-FE-001).

**AC clés :** zéro `subscribe` inline restant dans les 6 méthodes ; comportement identique avant/après ; `err` typé `{ status: number }`, jamais `any`.

### S3-FIX-FE-001 — Exposer `reload()` sur `SeasonsService`

**Status : ✅ Done** · P0 (bloquait S3-REFACTOR-FE-001 côté seasons) · 1 SP · `fix/S3-FIX-FE-001-seasons-service-reload`

`SeasonsService` avait une méthode `refresh()` **privée**, inaccessible depuis `SeasonsListComponent`. Renommée en `reload()` publique (alignée sur le pattern déjà utilisé ailleurs dans le projet), les 3 `tap()` internes (`createSeason`/`updateSeason`/`deleteSeason`) mis à jour en conséquence.

### S3-FIX-BE-001 — Corriger `HAS_CONTRACTS` → `HAS_PERIODS` pour Season

**Status : ✅ Done** · P1 · 1 SP · `fix/S3-FIX-BE-001-season-conflict-message`

`PrismaSeasonRepository.remove()` retournait `HAS_CONTRACTS` quand une `Season` était liée à des `ContractPeriod` — nom trompeur (Season n'est jamais liée directement à un `Contract`). `RepositoryResult.HAS_PERIODS` ajouté (nouveau, **`HAS_CONTRACTS` conservé** — toujours correct pour MealPlan/Market/Supplement, qui eux sont bien liés à des `Contract`). Message 409 clarifié : _"Season {id} cannot be deleted — it is linked to existing contract periods"_.

### S3-REFACTOR-FE-003 — Migrer `HotelsListComponent.confirmDelete` + étendre le helper

**Status : ✅ Done** · P1 · 2 SP · Depends on S3-REFACTOR-FE-001 · `refactor/S3-REFACTOR-FE-003-hotels-confirm-delete`

`HotelsListComponent.confirmDelete()` avait 3 problèmes : message conditionnel (hôtel avec/sans données liées) non supporté par le helper d'origine, succès silencieux (pas de reload/toast), erreur 409 silencieuse. `ConfirmDeleteOptions` étendu avec `message?: string` (rétrocompatible — les 5 appels existants sans `message` compilent sans modification). `HotelsListComponent` migré : message d'avertissement cascade si `ageCategories`/`roomTypes` configurés, sinon message standard généré ; `onSuccess: () => this.hotelsService.reload()` (dépendait de S3-FIX-FE-003).

### S3-REFACTOR-FE-002 — Confirmations sur `RoomTypesFormComponent`

**Status : ✅ Done** · P1 · 2 SP · Depends on S3-REFACTOR-FE-001 · `refactor/S3-REFACTOR-FE-002-room-type-form-confirm-delete`

Deux suppressions sans confirmation identifiées : `deleteCapacity(row)` (perte faible, recréable) et `deleteRoomType()` (perte élevée, cascade sur toutes les capacités, peut être bloqué 409 si lié à un contrat). **Deux niveaux de confirmation distincts, décision assumée** :

- `deleteRoomType()` → via le helper `confirmDelete` complet (toast + gestion 409).
- `deleteCapacity()` → `ConfirmationService.confirm()` directe, **sans** passer par le helper (pas de 409 possible pour une sous-ressource de formulaire, un toast "Deleted" serait du bruit pour une action aussi granulaire). Règle actée : ne pas généraliser le helper au-delà de son périmètre — entités de premier niveau uniquement.

`<p-confirmDialog />` placé au niveau racine du template (hors `<p-dialog>`), jamais dupliqué si déjà rendu par le parent.

### S3-FIX-FE-002 — Ref template `#roomTypesForm` manquante

**Status : ✅ Done** · P0 · 1 SP · `fix/S3-FIX-FE-002-room-types-form-viewchild-ref`

`hotels-form.component.html` rendait `<app-room-types-form>` sans `#roomTypesForm` — le `viewChild<RoomTypesFormComponent>('roomTypesForm')` résolvait `undefined`, donc `onAddRoom()`/`onEditRoom()` ne faisaient rien (`.open()` appelé sur `undefined`). Ref ajoutée, `viewChild` vérifié/complété côté composant. Découvert en marge de S3-REFACTOR-FE-002 en testant le dialog `RoomTypesFormComponent`.

### S3-FIX-FE-003 — Exposer `reload()` sur `HotelsService`

**Status : ✅ Done** · P0 (bloquait S3-REFACTOR-FE-003) · 1 SP · `fix/S3-FIX-FE-003-hotels-service-reload`

Même anomalie que S3-FIX-FE-001, sur `HotelsService` cette fois. `refresh()` privée → `reload()` publique, 3 `tap()` internes mis à jour (`createHotel`/`updateHotel`/`deleteHotel`).

### S3-DOC-001 — Mettre à jour le doc Sprint 3 avec les nouveaux tickets

**Status : ✅ Done (superseded)** · P2 · 1 SP · Depends on tous les tickets précédents · `docs/S3-DOC-001-update-sprint3-refacto-tickets`

Objectif initial : ajouter une section "Refacto & Fix" au document original. **Ce document consolidé remplace ce livrable** — la mise à jour demandée est intégrée nativement ici plutôt que patchée sur l'ancien fichier.

---

## 7. Ticket — Déploiement

### S3-OPS-002 — Déploiement Sprint 3 sur Render

**Status : ✅ Done** · P0 · 3 SP (ajusté depuis 2, migration Neon plus complexe que prévu) · Depends on S3-OPS-001 (main à jour, tag v0.3.0) · Plateforme : Render + Neon PostgreSQL

**Architecture cible :**

```
Render Services
├── runner-backend    (Web Service — NestJS)
└── runner-frontend   (Static Site — Angular)

Base de données
└── Neon PostgreSQL   (projet Runner, branch production, DB neondb)
```

**Phase 1 — Migration DB vers Neon (✅)**

- Deux connection strings Neon : `DATABASE_URL` (pooler PgBouncer, runtime NestJS) et `DIRECT_URL` (connexion directe, migrations Prisma — obligatoire car les advisory locks PostgreSQL de `prisma migrate` sont incompatibles avec PgBouncer). `directUrl = env("DIRECT_URL")` ajouté au `datasource` de `schema.prisma`.
- Diagnostic initial : migration `20260325130609_init` marquée `failed` en base (tentative interrompue), tables partiellement créées, état incohérent.
- `npx prisma migrate reset` → 8 migrations appliquées proprement, Prisma Client régénéré, seed exécuté.
- Données métier locales exportées (`pg_dump --data-only`) et importées dans Neon via connexion directe. Seul conflit : `admin@runner.com` déjà présent via le seed — ignoré (données identiques).

**Phase 2 — Préparation du code (✅)**

- `render.yaml` créé à la racine : deux services (`runner-backend` web/node, `runner-frontend` static), `buildFilter` par service pour éviter les rebuilds croisés, variables d'env (`DATABASE_URL`/`DIRECT_URL`/`JWT_SECRET`/`JWT_REFRESH_SECRET`/`CORS_ORIGIN` en `sync: false`), `startCommand: npx prisma migrate deploy && node dist/apps/backend/main.js`.
- CORS lu depuis `process.env.CORS_ORIGIN` (au lieu d'un `origin` hardcodé sur `localhost:4200`).

**Phase 3 — Déploiement (✅)**

- Services créés via Render Blueprint (détection automatique de `render.yaml`).
- Variables `sync: false` renseignées manuellement (URLs Neon, `CORS_ORIGIN` = URL frontend Render).
- `GET /health` → 200. `environment.prod.ts` mis à jour avec l'URL backend réelle.
- Vérification manuelle : login, navigation, CRUD complet sur les 4 référentiels, suppression avec confirmation.

**Problèmes rencontrés :**

| Problème                         | Cause                                            | Solution                                        |
| -------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `migrate resolve` timeout        | Advisory lock incompatible avec le pooler Neon   | `DIRECT_URL` + `directUrl` dans `schema.prisma` |
| Migration `init` failed en base  | Tentative de migration interrompue pré-existante | `prisma migrate reset` sur la DB Neon           |
| `db pull` écrase `schema.prisma` | L'introspection modifie le schéma local          | `git checkout prisma/schema.prisma`             |
| CORS bloqué en prod              | `origin` hardcodé sur `localhost:4200`           | Lecture depuis `process.env.CORS_ORIGIN`        |

**AC :** `render.yaml` commité sur `main` · CORS dynamique · DB Neon 8/8 migrations + données importées · backend et frontend en ligne · `/health` → 200 · login + CRUD + routing SPA (refresh sans 404) fonctionnels en prod.

---

## 8. Definition of Done — Sprint 3 (final)

### Backend

- ✅ 4 modules CRUD : MealPlans, Markets, Currencies, Supplements
- ✅ DTOs avec `class-validator` sur chaque module
- ✅ `createdAt`/`updatedAt` sur MealPlan, Market, Supplement — absents sur Currency
- ✅ Currencies global — pas de `tourOperatorId`, `RolesGuard` maintenu
- ✅ Supplements : enum `SupplementUnit` + `price` Decimal→number sérialisé dans le service
- ✅ Repository Pattern (abstract class comme token DI) sur tous les modules
- ✅ HTTP 401/403/404/409 retournés correctement
- ✅ `RepositoryResult.HAS_PERIODS` ajouté (Season↔ContractPeriod), `HAS_CONTRACTS` conservé pour les autres

### Frontend

- ✅ Routes lazy-loaded protégées (`AuthGuard` + `RoleGuard` via `route.data['roles']`) sous `management`
- ✅ Sidebar à jour
- ✅ 4 services avec `BehaviorSubject` + cache (pattern `HotelsService`), `reload()` public partout (y compris `SeasonsService`/`HotelsService`, corrigés en cours de sprint)
- ✅ `take(1)` sur tous les `subscribe()`
- ✅ 4 composants liste (`p-table` PrimeNG)
- ✅ 4 composants formulaire (Reactive Forms dans `p-dialog`)
- ✅ Toast succès/erreur (`p-toast`), confirmation de suppression (`p-confirmdialog`)
- ✅ Tooltips sur les types d'unité de supplément
- ✅ Composants sous `features/management/<feature>/`
- ✅ Utilitaire `confirmDelete` créé dans `shared/utils/`, **tous** les composants liste/form l'utilisent — zéro `subscribe` inline dans une méthode de suppression
- ✅ `RoomTypesFormComponent` : deux niveaux de confirmation distincts (helper complet pour `deleteRoomType`, confirmation légère pour `deleteCapacity`)

### Standards Angular

- ✅ Standalone components (défaut Angular 19, pas de `standalone: true` explicite)
- ✅ `input()`/`output()`, `inject()`, `OnPush` systématique
- ✅ Signals pour l'état local, `computed()` pour l'état dérivé
- ✅ Control flow natif (`@if`/`@for`/`@switch`), pas de `ngClass`/`ngStyle`
- ✅ Aucun `any` — TypeScript strict
- ✅ Conformité WCAG AA

### Déploiement

- ✅ Backend + frontend en ligne sur Render, DB migrée sur Neon, CORS dynamique

---

## 9. Story Points — récapitulatif

| Domaine             | Tickets                         | Total SP |
| ------------------- | ------------------------------- | -------- |
| MealPlans backend   | S3-BE-001 → 008                 | 14       |
| Markets backend     | S3-BE-009 → 016                 | 14       |
| Currencies backend  | S3-BE-017 → 024                 | 14       |
| Supplements backend | S3-BE-025 → 032                 | 14       |
| Routing & Sidebar   | S3-FE-001 → 002                 | 4        |
| Services frontend   | S3-FE-003 → 006                 | 12       |
| Composants frontend | S3-FE-007 → 014                 | 26       |
| Refacto & Fix       | S3-REFACTOR/FIX ×7 + S3-DOC-001 | 10       |
| Déploiement         | S3-OPS-002                      | 3        |
| **Total**           | **41 tickets**                  | **111**  |

---

## 10. Dépendances

Sprint 0 ✅, Sprint 1 ✅, Sprint 2 ✅ terminés.

## 11. Risques (résolus)

| Risque                                             | Mitigation appliquée                                |
| -------------------------------------------------- | --------------------------------------------------- |
| Currencies global vs multi-tenant                  | `RolesGuard` maintenu, seul le filtre DB est absent |
| `price` Decimal sur Supplements                    | Sérialisation `Number(price)` dans le service       |
| 4 types d'unité de supplément, source de confusion | Tooltips explicatifs dans le formulaire             |
| `SupplementFormComponent` (SP 5, le plus complexe) | Traité tôt dans le sprint                           |
| Duplication de `confirmDelete` sur 6 composants    | Extrait en helper partagé (S3-REFACTOR-FE-001)      |
| Migration Neon plus complexe que prévu             | SP ajusté 2→3, `DIRECT_URL` dédié aux migrations    |

---

## 12. Héritage pour Sprint 4 (déjà appliqué — pour référence)

Ces décisions actées en Sprint 3 ont été reprises telles quelles en Sprint 4 (voir le document Sprint 4 consolidé) :

- Repository pattern **abstract class**, jamais l'interface + token string de Sprint 2.
- `HAS_CONTRACTS` (MealPlan/Market/Supplement) et `HAS_PERIODS` (Season) coexistent dans `RepositoryResult` — Sprint 4 a suivi le même principe pour ses propres relations (`ContractPeriod`, `BaseRate`, etc.).
- `PATCH` sur toutes les mises à jour (pas de `PUT`).
- `confirmDelete` importé depuis `shared/utils/confirm-delete.util.ts` pour toute nouvelle suppression, `message?` disponible pour les cas d'avertissement cascade.
- Les tests unitaires (`> 80 %` coverage) commencent en Sprint 4 — Sprints 0-3 n'ont pas de tickets de test dédiés, frontière assumée, pas de backfill prévu.

---

## 13. Prêt pour Sprint 5 ?

Sprint 5 (Offers — SEQUENTIAL/ADDITIVE) dépend de Sprint 3 comme prérequis "recommandé mais pas bloquant" (`OfferSupplement` se lie à `Supplement`). **Sprint 3 étant terminé et stable, ce prérequis est satisfait.** Combiné à la lecture déjà faite du Sprint 4 (terminé, aucun blocage), tu peux démarrer Sprint 5 sans dépendance en attente.

_Document généré à partir de la consolidation du plan Sprint 3 original + 8 tickets refacto/fix/ops produits en cours de sprint. Remplace intégralement `SPRINT_3.md`._
