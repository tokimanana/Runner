# Sprint 3 - Referentials (MealPlans, Markets, Currencies, Supplements)

## 🎯 Sprint Goal

Build the CRUD for all referential entities used in contracts and bookings.

---

## Execution Order

Backend first (unblock the APIs), then routing (unblock navigation), then frontend feature by feature.

---

## Architecture Decisions

### Backend

- **Repository Pattern** — abstract class as DI token (not a string token)
  > ⚠️ This differs from Sprint 2 (Hotels/Seasons used an `interface` + string constant token like `HOTEL_REPOSITORY`). From Sprint 3 onward, the pattern is: **abstract class** as both the type and the DI injection token — no separate constants file needed.
- **Repository** = data access only. No HTTP exceptions.
- **Service** = business logic, HTTP exceptions, sanitization (`MAX_LIMIT = 100`)
- **Multi-tenancy** — `tourOperatorId` extracted from the JWT, never from the request body
- **Currencies exception** — global referential, no `tourOperatorId` at any layer. `RolesGuard` is still maintained.
- **Supplements** — `price` is `Decimal` in Prisma, serialized to `number` in the service

### Frontend

- **BehaviorSubject** + `loaded` flag for all 4 services (HotelsService pattern — not SeasonsService)
- **`take(1)`** on all `subscribe()` calls
- All components under `features/management/<feature>/` — consistent with hotels and seasons
- **`confirmDelete` utility** — `shared/utils/confirm-delete.util.ts` centralise
  toute la logique de confirmation + feedback toast. Chaque composant passe
  `header`, `entityName`, `delete$`, `onSuccess?`, `conflictMessage?`, et
  optionnellement `message?` pour les cas avec avertissement cascade.
  Règle : tout nouveau `confirmDelete` dans Sprint 4+ **doit** utiliser ce helper.

---

## File Structure

### Backend

```
apps/backend/src/
├── meal-plans/
│   ├── dto/
│   │   ├── create-meal-plan.dto.ts
│   │   └── update-meal-plan.dto.ts
│   ├── repositories/
│   │   ├── meal-plan.repository.ts
│   │   └── prisma-meal-plan.repository.ts
│   ├── meal-plans.service.ts
│   ├── meal-plans.controller.ts
│   └── meal-plans.module.ts
├── markets/
│   ├── dto/
│   ├── repositories/
│   ├── markets.service.ts
│   ├── markets.controller.ts
│   └── markets.module.ts
├── currencies/
│   ├── dto/
│   ├── repositories/
│   ├── currencies.service.ts
│   ├── currencies.controller.ts
│   └── currencies.module.ts
└── supplements/
    ├── dto/
    ├── repositories/
    ├── supplements.service.ts
    ├── supplements.controller.ts
    └── supplements.module.ts
```

### Frontend

```
apps/frontend/src/app/features/management/
├── hotels/          — Sprint 2 ✅
├── seasons/         — Sprint 2 ✅
├── meal-plans/
│   ├── components/
│   │   ├── meal-plans-list/
│   │   └── meal-plan-form/
│   └── meal-plans.service.ts
├── markets/
│   ├── components/
│   │   ├── markets-list/
│   │   └── market-form/
│   └── markets.service.ts
├── currencies/
│   ├── components/
│   │   ├── currencies-list/
│   │   └── currency-form/
│   └── currencies.service.ts
└── supplements/
    ├── components/
    │   ├── supplements-list/
    │   └── supplement-form/
    └── supplements.service.ts
```

### Shared Types

```
libs/shared/types/src/lib/
├── types.ts                 — existing from Sprint 2
├── meal-plan.types.ts
├── market.types.ts
├── currency.types.ts
└── supplement.types.ts
```

---

## Backend Tasks

### MealPlans

#### S3-BE-001 — Prisma: MealPlan model + migration

> Define the `MealPlan` Prisma model and run the migration. This is the prerequisite for every other MealPlan ticket — nothing can be built until the table exists. The unique constraint on `(tourOperatorId, code)` enforces that two meal plans with the same code cannot coexist within a single tour operator.

- **Type:** Task
- **Priority:** P0
- **SP:** 2
- **Branch:** `feature/S3-BE-001-prisma-meal-plan`
- **Commit:** `feat(meal-plans): add MealPlan model to prisma schema`
- **Tasks:**
  - Add the `MealPlan` model to `prisma/schema.prisma`
  - Run the migration: `npx prisma migrate dev --name add_meal_plan`
- **Model:**

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

- **Acceptance Criteria:**
  - ✅ Migration applied without error
  - ✅ `meal_plans` table created in PostgreSQL with all columns
  - ✅ `@@unique([tourOperatorId, code])` constraint enforced at DB level
  - ✅ Prisma client regenerated (`prisma generate`)
- **Files:** `prisma/schema.prisma`

---

#### S3-BE-002 — Shared types: MealPlan + MealPlanDto

> Add the `MealPlan` interface and `MealPlanDto` to the shared types library so both the backend and frontend can use the same type definitions. This must be done before writing DTOs, repositories, or frontend services that reference MealPlan data shapes.

- **Type:** Task
- **Priority:** P0
- **SP:** 1
- **Branch:** `feature/S3-BE-002-shared-types-meal-plan`
- **Commit:** `feat(meal-plans): add MealPlan shared types`
- **Tasks:**
  - Add `MealPlan` interface and `MealPlanDto` to `@runner/shared/types`
  - Export from the index
- **Acceptance Criteria:**
  - ✅ `MealPlan` interface exported from `@runner/shared/types` with fields: `id`, `code`, `name`, `description`, `tourOperatorId`, `createdAt`, `updatedAt`
  - ✅ `MealPlanDto` exported with fields: `code`, `name`, `description?`
  - ✅ Both types importable in backend and frontend without error
- **Files:** `libs/shared/types/src/lib/meal-plan.types.ts`

---

#### S3-BE-003 — DTOs: CreateMealPlanDto + UpdateMealPlanDto

> Define the validation DTOs for creating and partially updating a meal plan. These enforce request shape at the controller boundary via class-validator, ensuring invalid payloads are rejected before reaching service or repository logic.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-002
- **Branch:** `feature/S3-BE-003-meal-plan-dtos`
- **Commit:** `feat(meal-plans): add create and update DTOs`
- **Tasks:**
  - `CreateMealPlanDto`: `code` (string, not empty), `name` (string, not empty), `description` (string, optional)
  - `UpdateMealPlanDto` extends `PartialType(CreateMealPlanDto)`
- **Acceptance Criteria:**
  - ✅ `POST /meal-plans` with empty `code` returns HTTP 400
  - ✅ `POST /meal-plans` with empty `name` returns HTTP 400
  - ✅ `POST /meal-plans` without `description` succeeds (optional field)
  - ✅ `PATCH /meal-plans/:id` with a partial body is accepted
- **Files:**
  - `apps/backend/src/meal-plans/dto/create-meal-plan.dto.ts`
  - `apps/backend/src/meal-plans/dto/update-meal-plan.dto.ts`

---

#### S3-BE-004 — MealPlanRepository (abstract class)

> Define the `MealPlanRepository` abstract class that serves as both the interface contract and the NestJS DI token. This is the Sprint 3 repository pattern — an abstract class replaces the interface + string-token approach used in Sprint 2, eliminating the need for a separate constants file.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-002
- **Branch:** `feature/S3-BE-004-meal-plan-repository`
- **Commit:** `feat(meal-plans): add MealPlanRepository abstract class`
- **Tasks:**
  - Abstract class `MealPlanRepository` with methods: `findAll`, `findOne`, `create`, `update`, `remove`
  - Same pattern as `SeasonRepository`
- **Acceptance Criteria:**
  - ✅ `MealPlanRepository` is an abstract class (not an interface)
  - ✅ All 5 method signatures defined with correct parameter types (including `tourOperatorId`)
  - ✅ Class is usable as a NestJS DI token without a separate constants file
- **Files:** `apps/backend/src/meal-plans/repositories/meal-plan.repository.ts`

---

#### S3-BE-005 — PrismaMealPlanRepository

> Implement the Prisma-backed repository for MealPlan data access. All DB queries are scoped to `tourOperatorId` to enforce multi-tenancy. Prisma error codes are caught here and converted to typed `RepositoryException` values — no HTTP exceptions are thrown at this layer.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-004
- **Branch:** `feature/S3-BE-005-prisma-meal-plan-repository`
- **Commit:** `feat(meal-plans): add PrismaMealPlanRepository`
- **Tasks:**
  - `findAll`: filter by `tourOperatorId` + `$transaction([findMany, count])`
  - `findOne`: `findUnique({ where: { id, tourOperatorId } })`
  - `create`: catch P2002 → `RepositoryException(CONFLICT)`
  - `update`: catch P2002 → `RepositoryException(CONFLICT)`
  - `remove`: catch P2025 → `NOT_FOUND`, P2003 → `HAS_CONTRACTS`
    > ℹ️ `HAS_CONTRACTS` is a forward-looking error code — the `Contract` model does not exist yet (Sprint 4). Add the catch block now so the repository is contract-ready without a migration later.
- **Acceptance Criteria:**
  - ✅ `findAll` only returns records matching the caller's `tourOperatorId`
  - ✅ `findAll` returns `{ data, total }` via `$transaction`
  - ✅ `findOne` returns `null` when the id belongs to a different `tourOperatorId`
  - ✅ Creating two records with the same `(tourOperatorId, code)` throws `RepositoryException(CONFLICT)`
  - ✅ `remove` on a non-existent id throws `RepositoryException(NOT_FOUND)`
  - ✅ No HTTP exceptions thrown — all errors are `RepositoryException`
- **Files:** `apps/backend/src/meal-plans/repositories/prisma-meal-plan.repository.ts`

---

#### S3-BE-006 — MealPlansService

> Implement the business logic layer for meal plans. The service translates repository-level exceptions into HTTP exceptions, enforces the `MAX_LIMIT = 100` cap on list queries, and guarantees that update and delete operations perform an existence check before proceeding.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-005
- **Branch:** `feature/S3-BE-006-meal-plans-service`
- **Commit:** `feat(meal-plans): add MealPlansService`
- **Tasks:**
  - `findAll`: sanitize limit (`MAX_LIMIT = 100`)
  - `findOne`: throw 404 if not found
  - `create`: catch `CONFLICT` → 409
  - `update`: call `findOne` first, catch `CONFLICT` → 409
  - `remove`: `NOT_FOUND` → 404, `HAS_CONTRACTS` → 409
- **Acceptance Criteria:**
  - ✅ `findAll` with `limit > 100` is capped at 100
  - ✅ `findOne` with unknown id throws `NotFoundException` (HTTP 404)
  - ✅ `create` with a duplicate `code` for the same `tourOperatorId` throws `ConflictException` (HTTP 409)
  - ✅ `update` calls `findOne` first — returns 404 if the record doesn't exist before attempting the update
  - ✅ `remove` returns 404 for unknown id, 409 if linked contracts exist
- **Files:** `apps/backend/src/meal-plans/meal-plans.service.ts`

---

#### S3-BE-007 — MealPlansController

> Expose the MealPlan CRUD operations as a REST API. All 5 endpoints are protected by `JwtAuthGuard` and `RolesGuard`, restricted to ADMIN and MANAGER roles. The `tourOperatorId` is always extracted from the JWT payload — never from the request body.

- **Type:** Feature
- **Priority:** P1
- **SP:** 2
- **Depends on:** S3-BE-006
- **Branch:** `feature/S3-BE-007-meal-plans-controller`
- **Commit:** `feat(meal-plans): add MealPlansController`
- **Tasks:**
  - `@Controller('meal-plans')` + `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(ADMIN, MANAGER)`
  - Extract `tourOperatorId` from JWT on every endpoint
  - `GET /meal-plans`, `GET /meal-plans/:id`, `POST /meal-plans`, `PATCH /meal-plans/:id`, `DELETE /meal-plans/:id`
  - `@HttpCode(204)` on DELETE
- **Acceptance Criteria:**
  - ✅ All endpoints return HTTP 401 without a valid JWT
  - ✅ All endpoints return HTTP 403 for `AGENT` role
  - ✅ `POST /meal-plans` returns HTTP 201 on success
  - ✅ `DELETE /meal-plans/:id` returns HTTP 204 on success
  - ✅ `tourOperatorId` is never read from the request body — always from the JWT payload
- **Files:** `apps/backend/src/meal-plans/meal-plans.controller.ts`

---

#### S3-BE-008 — MealPlansModule + AppModule

> Wire the MealPlan module by binding `PrismaMealPlanRepository` to the `MealPlanRepository` abstract class DI token, then register the module in `AppModule`. This is the final step that makes the MealPlan API fully operational.

- **Type:** Chore
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-007
- **Branch:** `feature/S3-BE-008-meal-plans-module`
- **Commit:** `feat(meal-plans): wire MealPlansModule and register in AppModule`
- **Tasks:**
  - `MealPlansModule`: `provide: MealPlanRepository, useClass: PrismaMealPlanRepository`
  - Import into `AppModule`
- **Acceptance Criteria:**
  - ✅ NestJS app starts without DI errors
  - ✅ `GET /meal-plans` is reachable and returns a valid response
  - ✅ `PrismaMealPlanRepository` is injected wherever `MealPlanRepository` is requested
- **Files:**
  - `apps/backend/src/meal-plans/meal-plans.module.ts`
  - `apps/backend/src/app.module.ts`

---

### Markets

#### S3-BE-009 — Prisma: Market model + migration

> Define the `Market` Prisma model and run the migration. Markets represent the geographical or commercial segments used to categorize contracts. Like MealPlans, codes are unique per tour operator.

- **Type:** Task
- **Priority:** P0
- **SP:** 2
- **Branch:** `feature/S3-BE-009-prisma-market`
- **Commit:** `feat(markets): add Market model to prisma schema`
- **Model:**

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

- **Acceptance Criteria:**
  - ✅ Migration applied without error
  - ✅ `markets` table created in PostgreSQL with all columns
  - ✅ `@@unique([tourOperatorId, code])` constraint enforced at DB level
  - ✅ Prisma client regenerated
- **Files:** `prisma/schema.prisma`

---

#### S3-BE-010 — Shared types: Market + MarketDto

> Add `Market` and `MarketDto` to the shared types library. Markets have no `description` field — simpler than MealPlans. Required before writing any DTO, repository, or frontend service that handles market data.

- **Type:** Task
- **Priority:** P0
- **SP:** 1
- **Branch:** `feature/S3-BE-010-shared-types-market`
- **Commit:** `feat(markets): add Market shared types`
- **Acceptance Criteria:**
  - ✅ `Market` interface exported from `@runner/shared/types` with fields: `id`, `code`, `name`, `tourOperatorId`, `createdAt`, `updatedAt`
  - ✅ `MarketDto` exported with fields: `code`, `name`
  - ✅ Both types importable in backend and frontend without error
- **Files:** `libs/shared/types/src/lib/market.types.ts`

---

#### S3-BE-011 — DTOs: CreateMarketDto + UpdateMarketDto

> Define validation DTOs for the Market endpoints. Both `code` and `name` are required — markets have no optional fields.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-010
- **Branch:** `feature/S3-BE-011-market-dtos`
- **Commit:** `feat(markets): add create and update DTOs`
- **Tasks:** `code` (string, not empty), `name` (string, not empty)
- **Acceptance Criteria:**
  - ✅ `POST /markets` with empty `code` returns HTTP 400
  - ✅ `POST /markets` with empty `name` returns HTTP 400
  - ✅ `PATCH /markets/:id` with a partial body is accepted
- **Files:**
  - `apps/backend/src/markets/dto/create-market.dto.ts`
  - `apps/backend/src/markets/dto/update-market.dto.ts`

---

#### S3-BE-012 — MarketRepository (abstract class)

> Define the `MarketRepository` abstract class following the same DI token pattern established in S3-BE-004. Provides the contract for data access without coupling the service to any specific persistence layer.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-010
- **Branch:** `feature/S3-BE-012-market-repository`
- **Commit:** `feat(markets): add MarketRepository abstract class`
- **Acceptance Criteria:**
  - ✅ `MarketRepository` is an abstract class usable as a NestJS DI token
  - ✅ All 5 method signatures defined: `findAll`, `findOne`, `create`, `update`, `remove`
- **Files:** `apps/backend/src/markets/repositories/market.repository.ts`

---

#### S3-BE-013 — PrismaMarketRepository

> Implement the Prisma-backed repository for Market. Follows the same structure as `PrismaMealPlanRepository`: all queries scoped to `tourOperatorId`, Prisma error codes mapped to typed `RepositoryException` values.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-012
- **Branch:** `feature/S3-BE-013-prisma-market-repository`
- **Commit:** `feat(markets): add PrismaMarketRepository`
- **Acceptance Criteria:**
  - ✅ `findAll` only returns records matching the caller's `tourOperatorId`
  - ✅ `findAll` returns `{ data, total }` via `$transaction`
  - ✅ Duplicate `(tourOperatorId, code)` throws `RepositoryException(CONFLICT)`
  - ✅ `remove` on a non-existent id throws `RepositoryException(NOT_FOUND)`
  - ✅ No HTTP exceptions thrown at repository layer
- **Files:** `apps/backend/src/markets/repositories/prisma-market.repository.ts`

---

#### S3-BE-014 — MarketsService

> Implement the business logic layer for markets. Same responsibilities as `MealPlansService`: limit sanitization, existence checks before update/delete, and HTTP exception translation from repository errors.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-013
- **Branch:** `feature/S3-BE-014-markets-service`
- **Commit:** `feat(markets): add MarketsService`
- **Acceptance Criteria:**
  - ✅ `findAll` with `limit > 100` is capped at 100
  - ✅ `findOne` with unknown id throws `NotFoundException` (HTTP 404)
  - ✅ `create` with duplicate `code` throws `ConflictException` (HTTP 409)
  - ✅ `update` calls `findOne` first — returns 404 before attempting update on unknown id
  - ✅ `remove` returns 404 for unknown id, 409 if linked contracts exist
- **Files:** `apps/backend/src/markets/markets.service.ts`

---

#### S3-BE-015 — MarketsController

> Expose the Market CRUD API. Follows the same guard and JWT-extraction pattern as `MealPlansController`.

- **Type:** Feature
- **Priority:** P1
- **SP:** 2
- **Depends on:** S3-BE-014
- **Branch:** `feature/S3-BE-015-markets-controller`
- **Commit:** `feat(markets): add MarketsController`
- **Acceptance Criteria:**
  - ✅ All endpoints return HTTP 401 without a valid JWT
  - ✅ All endpoints return HTTP 403 for `AGENT` role
  - ✅ `POST /markets` returns HTTP 201 on success
  - ✅ `DELETE /markets/:id` returns HTTP 204 on success
  - ✅ `tourOperatorId` always extracted from JWT, never from request body
- **Files:** `apps/backend/src/markets/markets.controller.ts`

---

#### S3-BE-016 — MarketsModule + AppModule

> Wire the Markets module and register it in AppModule. Final step to make the Markets API operational.

- **Type:** Chore
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-015
- **Branch:** `feature/S3-BE-016-markets-module`
- **Commit:** `feat(markets): wire MarketsModule and register in AppModule`
- **Acceptance Criteria:**
  - ✅ NestJS app starts without DI errors
  - ✅ `GET /markets` is reachable and returns a valid response
- **Files:**
  - `apps/backend/src/markets/markets.module.ts`
  - `apps/backend/src/app.module.ts`

---

### Currencies

#### S3-BE-017 — Prisma: Currency model + migration

> Define the `Currency` Prisma model. Unlike MealPlans and Markets, Currency is a **global referential** — it has no `tourOperatorId`, no `createdAt`/`updatedAt`, and its `code` is unique across the entire application. All tour operators share the same currency list.

- **Type:** Task
- **Priority:** P0
- **SP:** 2
- **Branch:** `feature/S3-BE-017-prisma-currency`
- **Commit:** `feat(currencies): add Currency model to prisma schema`
- **Tasks:**
  - ⚠️ No `tourOperatorId` — `code` is globally unique
  - ⚠️ No `createdAt`/`updatedAt` — global immutable referential
- **Model:**

```prisma
model Currency {
  id     String @id @default(cuid())
  code   String @unique
  name   String
  symbol String
}
```

- **Acceptance Criteria:**
  - ✅ Migration applied without error
  - ✅ `currencies` table has no `tourOperatorId`, `createdAt`, or `updatedAt` columns
  - ✅ `code` unique constraint enforced at DB level
  - ✅ Prisma client regenerated
- **Files:** `prisma/schema.prisma`

---

#### S3-BE-018 — Shared types: Currency + CurrencyDto

> Add `Currency` and `CurrencyDto` to the shared types library. The `Currency` interface intentionally omits `tourOperatorId` and timestamps, reflecting its global nature. This distinction must be explicit in the shared types to avoid confusion with tenant-scoped referentials.

- **Type:** Task
- **Priority:** P0
- **SP:** 1
- **Branch:** `feature/S3-BE-018-shared-types-currency`
- **Commit:** `feat(currencies): add Currency shared types`
- **Acceptance Criteria:**
  - ✅ `Currency` interface exported from `@runner/shared/types` with fields: `id`, `code`, `name`, `symbol` — no `tourOperatorId`, no timestamps
  - ✅ `CurrencyDto` exported with fields: `code`, `name`, `symbol`
  - ✅ Both types importable in backend and frontend without error
- **Files:** `libs/shared/types/src/lib/currency.types.ts`

---

#### S3-BE-019 — DTOs: CreateCurrencyDto + UpdateCurrencyDto

> Define validation DTOs for currency management. All three fields (`code`, `name`, `symbol`) are required. `code` should follow ISO 4217 format (e.g. `EUR`, `USD`) — enforced by documentation convention, not a regex validator at this stage.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-018
- **Branch:** `feature/S3-BE-019-currency-dtos`
- **Commit:** `feat(currencies): add create and update DTOs`
- **Tasks:** `code` (string, not empty — ISO 4217), `name` (string, not empty), `symbol` (string, not empty)
- **Acceptance Criteria:**
  - ✅ `POST /currencies` with empty `code`, `name`, or `symbol` returns HTTP 400
  - ✅ `PATCH /currencies/:id` with a partial body is accepted
- **Files:**
  - `apps/backend/src/currencies/dto/create-currency.dto.ts`
  - `apps/backend/src/currencies/dto/update-currency.dto.ts`

---

#### S3-BE-020 — CurrencyRepository (abstract class)

> Define the `CurrencyRepository` abstract class. Unlike MealPlan and Market repositories, no method takes `tourOperatorId` as a parameter — currencies are global and all queries operate without a tenant filter.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-018
- **Branch:** `feature/S3-BE-020-currency-repository`
- **Commit:** `feat(currencies): add CurrencyRepository abstract class`
- **Tasks:** ⚠️ No `tourOperatorId` in any method signature
- **Acceptance Criteria:**
  - ✅ `CurrencyRepository` is an abstract class usable as a NestJS DI token
  - ✅ No `tourOperatorId` parameter in any method signature
  - ✅ All 5 method signatures defined: `findAll`, `findOne`, `create`, `update`, `remove`
- **Files:** `apps/backend/src/currencies/repositories/currency.repository.ts`

---

#### S3-BE-021 — PrismaCurrencyRepository

> Implement the Prisma-backed repository for Currency. All queries operate without a `tourOperatorId` filter — currencies are shared across all tour operators. Prisma errors are still mapped to typed `RepositoryException` values.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-020
- **Branch:** `feature/S3-BE-021-prisma-currency-repository`
- **Commit:** `feat(currencies): add PrismaCurrencyRepository`
- **Tasks:** ⚠️ `where` clauses have no `tourOperatorId` anywhere
- **Acceptance Criteria:**
  - ✅ `findAll` returns all currencies regardless of caller identity
  - ✅ Duplicate `code` throws `RepositoryException(CONFLICT)`
  - ✅ `remove` on a non-existent id throws `RepositoryException(NOT_FOUND)`
  - ✅ No `tourOperatorId` referenced anywhere in the implementation
- **Files:** `apps/backend/src/currencies/repositories/prisma-currency.repository.ts`

---

#### S3-BE-022 — CurrenciesService

> Implement the business logic layer for currencies. Follows the same service structure as other referentials (limit sanitization, 404/409 translation) but with no `tourOperatorId` in any method signature, since currencies are global.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-021
- **Branch:** `feature/S3-BE-022-currencies-service`
- **Commit:** `feat(currencies): add CurrenciesService`
- **Tasks:** ⚠️ No method takes `tourOperatorId` as a parameter
- **Acceptance Criteria:**
  - ✅ `findAll` with `limit > 100` is capped at 100
  - ✅ `findOne` with unknown id throws `NotFoundException` (HTTP 404)
  - ✅ `create` with duplicate `code` throws `ConflictException` (HTTP 409)
  - ✅ No `tourOperatorId` in any method signature
- **Files:** `apps/backend/src/currencies/currencies.service.ts`

---

#### S3-BE-023 — CurrenciesController

> Expose the Currency CRUD API. Guards and roles are maintained identically to other referentials — only authenticated ADMINs and MANAGERs can manage currencies. The key difference from other controllers is that no `tourOperatorId` is extracted from the JWT.

- **Type:** Feature
- **Priority:** P1
- **SP:** 2
- **Depends on:** S3-BE-022
- **Branch:** `feature/S3-BE-023-currencies-controller`
- **Commit:** `feat(currencies): add CurrenciesController`
- **Tasks:**
  - `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(ADMIN, MANAGER)` maintained
  - ⚠️ No `tourOperatorId` extraction from the JWT
- **Acceptance Criteria:**
  - ✅ All endpoints return HTTP 401 without a valid JWT
  - ✅ All endpoints return HTTP 403 for `AGENT` role
  - ✅ `POST /currencies` returns HTTP 201 on success
  - ✅ `DELETE /currencies/:id` returns HTTP 204 on success
  - ✅ No `tourOperatorId` extracted or used anywhere in the controller
- **Files:** `apps/backend/src/currencies/currencies.controller.ts`

---

#### S3-BE-024 — CurrenciesModule + AppModule

> Wire the Currencies module and register it in AppModule. Final step to make the Currencies API operational.

- **Type:** Chore
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-023
- **Branch:** `feature/S3-BE-024-currencies-module`
- **Commit:** `feat(currencies): wire CurrenciesModule and register in AppModule`
- **Acceptance Criteria:**
  - ✅ NestJS app starts without DI errors
  - ✅ `GET /currencies` is reachable and returns a valid response
- **Files:**
  - `apps/backend/src/currencies/currencies.module.ts`
  - `apps/backend/src/app.module.ts`

---

### Supplements

#### S3-BE-025 — Prisma: SupplementUnit enum + Supplement model + migration

> Define the `SupplementUnit` enum and `Supplement` model in Prisma. Supplements are the most complex referential: they carry a `price` (stored as `Decimal` for precision), a unit type that determines how the price is applied, and a flag controlling discount eligibility. The `price` type mismatch between Prisma (`Decimal`) and TypeScript (`number`) is handled at the service layer, not here.

- **Type:** Task
- **Priority:** P0
- **SP:** 2
- **Branch:** `feature/S3-BE-025-prisma-supplement`
- **Commit:** `feat(supplements): add SupplementUnit enum and Supplement model to prisma schema`
- **Tasks:**
  - ⚠️ `price` is `Decimal` in Prisma
  - Migration: `npx prisma migrate dev --name add_supplement`
- **Model:**

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

- **Acceptance Criteria:**
  - ✅ Migration applied without error
  - ✅ `supplements` table created with `price` as a numeric/decimal column
  - ✅ `SupplementUnit` enum exists in the DB with all 4 values
  - ✅ `canReceiveDiscount` defaults to `false` at DB level
  - ✅ Prisma client regenerated
- **Files:** `prisma/schema.prisma`

---

#### S3-BE-026 — Shared types: SupplementUnit + Supplement + SupplementDto

> Add `SupplementUnit`, `Supplement`, and `SupplementDto` to the shared types library. `price` is typed as `number` — not `Decimal` — because the `Decimal` Prisma type is an implementation detail of the persistence layer and must not leak into the shared contract between frontend and backend.

- **Type:** Task
- **Priority:** P0
- **SP:** 1
- **Branch:** `feature/S3-BE-026-shared-types-supplement`
- **Commit:** `feat(supplements): add Supplement shared types`
- **Tasks:** `price` typed as `number` (not `Decimal`) in the TypeScript interfaces
- **Acceptance Criteria:**
  - ✅ `SupplementUnit` enum exported from `@runner/shared/types` with all 4 values
  - ✅ `Supplement` interface exported with `price: number` (not `Decimal`)
  - ✅ `SupplementDto` exported with all writable fields
  - ✅ All types importable in backend and frontend without error
- **Files:** `libs/shared/types/src/lib/supplement.types.ts`

---

#### S3-BE-027 — DTOs: CreateSupplementDto + UpdateSupplementDto

> Define validation DTOs for supplement creation and update. These are the most complex DTOs in the sprint — they validate a numeric `price` with a minimum of 0, an enum `unit`, a boolean flag, and an optional description, in addition to the required `name`.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-026
- **Branch:** `feature/S3-BE-027-supplement-dtos`
- **Commit:** `feat(supplements): add create and update DTOs`
- **Tasks:**
  - `name` (string, not empty), `description` (string, optional)
  - `price` (`IsNumber`, min 0), `unit` (`IsEnum SupplementUnit`)
  - `canReceiveDiscount` (`IsBoolean`)
- **Acceptance Criteria:**
  - ✅ `POST /supplements` with empty `name` returns HTTP 400
  - ✅ `POST /supplements` with `price < 0` returns HTTP 400
  - ✅ `POST /supplements` with an invalid `unit` value returns HTTP 400
  - ✅ `POST /supplements` without `description` succeeds (optional field)
  - ✅ `PATCH /supplements/:id` with a partial body is accepted
- **Files:**
  - `apps/backend/src/supplements/dto/create-supplement.dto.ts`
  - `apps/backend/src/supplements/dto/update-supplement.dto.ts`

---

#### S3-BE-028 — SupplementRepository (abstract class)

> Define the `SupplementRepository` abstract class. Follows the same DI token pattern as the other Sprint 3 repositories. Supplements are multi-tenant, so `tourOperatorId` is present in all method signatures.

- **Type:** Task
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-026
- **Branch:** `feature/S3-BE-028-supplement-repository`
- **Commit:** `feat(supplements): add SupplementRepository abstract class`
- **Acceptance Criteria:**
  - ✅ `SupplementRepository` is an abstract class usable as a NestJS DI token
  - ✅ All 5 method signatures defined with correct parameter types (including `tourOperatorId`)
- **Files:** `apps/backend/src/supplements/repositories/supplement.repository.ts`

---

#### S3-BE-029 — PrismaSupplementRepository

> Implement the Prisma-backed repository for Supplement. Follows the same structure as other multi-tenant repositories. Importantly, `price` is returned as Prisma's `Decimal` type — the repository does not convert it. Serialization to `number` is the service's responsibility.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-028
- **Branch:** `feature/S3-BE-029-prisma-supplement-repository`
- **Commit:** `feat(supplements): add PrismaSupplementRepository`
- **Tasks:** ⚠️ `price` is returned as `Decimal` by Prisma — serialization happens in the service, not here
- **Acceptance Criteria:**
  - ✅ `findAll` only returns records matching the caller's `tourOperatorId`
  - ✅ `findAll` returns `{ data, total }` via `$transaction`
  - ✅ `remove` on a non-existent id throws `RepositoryException(NOT_FOUND)`
  - ✅ `price` is returned as-is from Prisma (`Decimal`) — no conversion in this layer
  - ✅ No HTTP exceptions thrown at repository layer
- **Files:** `apps/backend/src/supplements/repositories/prisma-supplement.repository.ts`

---

#### S3-BE-030 — SupplementsService

> Implement the business logic layer for supplements. In addition to the standard responsibilities (limit cap, 404/409 translation), this service is responsible for converting `price` from Prisma's `Decimal` to a plain JavaScript `number` before returning data. This prevents the `Decimal` object from leaking into the API response.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-029
- **Branch:** `feature/S3-BE-030-supplements-service`
- **Commit:** `feat(supplements): add SupplementsService`
- **Tasks:** ⚠️ Map `price: Number(supplement.price)` before returning
- **Acceptance Criteria:**
  - ✅ `findAll` with `limit > 100` is capped at 100
  - ✅ `findOne` with unknown id throws `NotFoundException` (HTTP 404)
  - ✅ All returned supplement objects have `price` as a JavaScript `number`, not a `Decimal` object
  - ✅ `remove` returns 404 for unknown id, 409 if linked contracts exist
- **Files:** `apps/backend/src/supplements/supplements.service.ts`

---

#### S3-BE-031 — SupplementsController

> Expose the Supplement CRUD API. Follows the same guard, role, and JWT-extraction pattern as `MealPlansController` and `MarketsController`.

- **Type:** Feature
- **Priority:** P1
- **SP:** 2
- **Depends on:** S3-BE-030
- **Branch:** `feature/S3-BE-031-supplements-controller`
- **Commit:** `feat(supplements): add SupplementsController`
- **Acceptance Criteria:**
  - ✅ All endpoints return HTTP 401 without a valid JWT
  - ✅ All endpoints return HTTP 403 for `AGENT` role
  - ✅ `POST /supplements` returns HTTP 201 on success
  - ✅ `DELETE /supplements/:id` returns HTTP 204 on success
  - ✅ `tourOperatorId` always extracted from JWT, never from request body
- **Files:** `apps/backend/src/supplements/supplements.controller.ts`

---

#### S3-BE-032 — SupplementsModule + AppModule

> Wire the Supplements module and register it in AppModule. Final step to make the Supplements API operational.

- **Type:** Chore
- **Priority:** P1
- **SP:** 1
- **Depends on:** S3-BE-031
- **Branch:** `feature/S3-BE-032-supplements-module`
- **Commit:** `feat(supplements): wire SupplementsModule and register in AppModule`
- **Acceptance Criteria:**
  - ✅ NestJS app starts without DI errors
  - ✅ `GET /supplements` is reachable and returns a valid response
- **Files:**
  - `apps/backend/src/supplements/supplements.module.ts`
  - `apps/backend/src/app.module.ts`

---

## Frontend Tasks

### Routing

#### S3-FE-001 — Lazy-loaded routes for all 4 referentials

> Register the 4 new management routes in `app.routes.ts`. Each route is lazy-loaded via `loadComponent`, protected by `AuthGuard` and `RoleGuard` (restricted to ADMIN and MANAGER via `route.data['roles']`). This ticket unblocks all frontend component development and must land before any list or form component can be navigated to.

- **Type:** Chore
- **Priority:** P1
- **SP:** 2
- **Branch:** `chore/S3-FE-001-referentials-routes`
- **Commit:** `chore(routing): add lazy routes for all referentials`
- **Tasks:**
  - Add `meal-plans`, `markets`, `currencies`, `supplements` routes under the `management` group in `app.routes.ts`
  - `loadComponent` + `AuthGuard` + `RoleGuard`
  - Roles passed via `route.data['roles']` (e.g. `data: { roles: ['ADMIN', 'MANAGER'] }`) — consistent with the `RoleGuard` implemented in Sprint 1
- **Acceptance Criteria:**
  - ✅ `/management/meal-plans` loads `MealPlansListComponent` when authenticated as ADMIN or MANAGER
  - ✅ `/management/markets` loads `MarketsListComponent` when authenticated as ADMIN or MANAGER
  - ✅ `/management/currencies` loads `CurrenciesListComponent` when authenticated as ADMIN or MANAGER
  - ✅ `/management/supplements` loads `SupplementsListComponent` when authenticated as ADMIN or MANAGER
  - ✅ All 4 routes redirect to `/dashboard` for `AGENT` role (via `RoleGuard`)
  - ✅ All 4 routes redirect to `/login` when unauthenticated (via `AuthGuard`)
  - ✅ All components are lazy-loaded (`loadComponent`)
- **Files:** `apps/frontend/src/app/app.routes.ts`

---

#### S3-FE-002 — Sidebar: add the 4 referentials

> Add navigation items for Meal Plans, Markets, Currencies, and Supplements to the sidebar under the `management` group. Items must respect role visibility — AGENT users should not see these entries. Depends on the routes being registered first.

- **Type:** Chore
- **Priority:** P1
- **SP:** 2
- **Depends on:** S3-FE-001
- **Branch:** `chore/S3-FE-002-sidebar-referentials`
- **Commit:** `chore(sidebar): add referentials nav items`
- **Tasks:** Add Meal Plans, Markets, Currencies, Supplements items to the `management` group
- **Acceptance Criteria:**
  - ✅ Meal Plans, Markets, Currencies, Supplements nav items visible for ADMIN and MANAGER
  - ✅ Items not visible for AGENT role
  - ✅ Active item highlighted via `RouterLinkActive`
  - ✅ Clicking each item navigates to the correct route
- **Files:**
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.ts`
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.html`

---

### Services

#### S3-FE-003 — MealPlansService

> Create the Angular service that manages MealPlan data on the frontend. Uses the HotelsService caching pattern: a `BehaviorSubject` holds the current list and a `loaded` flag prevents redundant API calls. The BehaviorSubject is updated in-place after every mutation, so components subscribing to it reflect changes without needing to refetch.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-008
- **Branch:** `feature/S3-FE-003-meal-plans-service`
- **Commit:** `feat(meal-plans): add MealPlansService with BehaviorSubject cache`
- **Tasks:**
  - HotelsService pattern: BehaviorSubject + `loaded` flag
  - `getAll()`, `create()`, `update()`, `remove()`
  - `take(1)` on all `subscribe()` calls
- **Acceptance Criteria:**
  - ✅ `getAll()` fetches from API only once — subsequent calls return cached BehaviorSubject value
  - ✅ After `create()`, `update()`, or `remove()`, the BehaviorSubject is updated in place
  - ✅ `take(1)` used on every `subscribe()` — no memory leaks
  - ✅ Service is `providedIn: 'root'`
  - ✅ No `any` — strict TypeScript with `MealPlan` types from `@runner/shared/types`
- **Files:** `apps/frontend/src/app/features/management/meal-plans/meal-plans.service.ts`

---

#### S3-FE-004 — MarketsService

> Create the Angular service for Markets, following the exact same BehaviorSubject caching pattern as `MealPlansService`. Unblocks `MarketsListComponent` and `MarketFormComponent`.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-016
- **Branch:** `feature/S3-FE-004-markets-service`
- **Commit:** `feat(markets): add MarketsService with BehaviorSubject cache`
- **Acceptance Criteria:**
  - ✅ Same caching behavior as MealPlansService (BehaviorSubject + `loaded` flag)
  - ✅ `take(1)` on every `subscribe()`
  - ✅ No `any` — strict TypeScript with `Market` types
- **Files:** `apps/frontend/src/app/features/management/markets/markets.service.ts`

---

#### S3-FE-005 — CurrenciesService

> Create the Angular service for Currencies. Same caching pattern as the other services. Note that the API returns all currencies regardless of the current user's tour operator — the service does not need to handle tenant filtering on the client side.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-024
- **Branch:** `feature/S3-FE-005-currencies-service`
- **Commit:** `feat(currencies): add CurrenciesService with BehaviorSubject cache`
- **Acceptance Criteria:**
  - ✅ Same caching behavior as MealPlansService (BehaviorSubject + `loaded` flag)
  - ✅ `take(1)` on every `subscribe()`
  - ✅ No `any` — strict TypeScript with `Currency` types
- **Files:** `apps/frontend/src/app/features/management/currencies/currencies.service.ts`

---

#### S3-FE-006 — SupplementsService

> Create the Angular service for Supplements. Same caching pattern as the other services. The `price` field arrives from the API as a plain `number` (serialized in the backend service) — no additional conversion needed on the frontend.

- **Type:** Feature
- **Priority:** P1
- **SP:** 3
- **Depends on:** S3-BE-032
- **Branch:** `feature/S3-FE-006-supplements-service`
- **Commit:** `feat(supplements): add SupplementsService with BehaviorSubject cache`
- **Acceptance Criteria:**
  - ✅ Same caching behavior as MealPlansService (BehaviorSubject + `loaded` flag)
  - ✅ `take(1)` on every `subscribe()`
  - ✅ No `any` — strict TypeScript with `Supplement` types
- **Files:** `apps/frontend/src/app/features/management/supplements/supplements.service.ts`

---

### MealPlans

#### S3-FE-007 — MealPlansListComponent

> Build the main list view for meal plans, displayed as a PrimeNG `p-table` with Code, Name, Description, and Actions columns. Supports inline Edit and Delete per row, and an Add button in the header. Delete operations require confirmation via `p-confirmdialog`, and all outcomes (success or failure) are communicated via `p-toast`.

- **Type:** Feature
- **Priority:** P2
- **SP:** 3
- **Depends on:** S3-FE-003
- **Branch:** `feature/S3-FE-007-meal-plans-list`
- **Commit:** `feat(meal-plans): add MealPlansListComponent`
- **Tasks:**
  - `p-table`: columns Code, Name, Description, Actions
  - Edit / Delete buttons per row, Add button in header
  - Delete confirmation (`p-confirmdialog`)
  - Success/error toast (`p-toast`)
- **Acceptance Criteria:**
  - ✅ Table displays all meal plans for the authenticated tour operator
  - ✅ Clicking Delete opens a `p-confirmdialog` — deletion only proceeds on confirmation
  - ✅ Successful delete shows a success toast and removes the row from the table
  - ✅ Failed delete (e.g. 409) shows an error toast, row is not removed
  - ✅ Clicking Edit opens `MealPlanFormComponent` in edit mode pre-filled with the row's data
  - ✅ Clicking Add opens `MealPlanFormComponent` in create mode with empty fields
  - ✅ Component uses `OnPush` change detection
  - ✅ No `any` — strict TypeScript
- **Files:**
  - `apps/frontend/src/app/features/management/meal-plans/components/meal-plans-list/meal-plans-list.component.ts`
  - `apps/frontend/src/app/features/management/meal-plans/components/meal-plans-list/meal-plans-list.component.html`

---

#### S3-FE-008 — MealPlanFormComponent

> Build the create/edit form for a meal plan, rendered inside a `p-dialog`. The form is reactive and supports two modes: create (empty fields) and edit (pre-filled from the selected row). The mode is determined by the presence of a `mealPlan` signal input. Validation errors are shown inline; API errors trigger a toast while keeping the dialog open.

- **Type:** Feature
- **Priority:** P2
- **SP:** 3
- **Depends on:** S3-FE-007
- **Branch:** `feature/S3-FE-008-meal-plan-form`
- **Commit:** `feat(meal-plans): add MealPlanFormComponent`
- **Tasks:**
  - `p-dialog` with Reactive Form
  - Fields: `code` (required), `name` (required), `description` (optional)
  - Create / Edit mode based on presence of a `mealPlan` input
- **Acceptance Criteria:**
  - ✅ Dialog opens in create mode with all fields empty
  - ✅ Dialog opens in edit mode with fields pre-filled from the `mealPlan` input
  - ✅ Submit button disabled while form is invalid
  - ✅ Submitting with empty `code` or `name` shows inline validation errors
  - ✅ Successful create/edit closes the dialog, emits an event, and triggers a list refresh
  - ✅ API error (e.g. 409 duplicate code) shows an error toast — dialog stays open
  - ✅ Component uses `input()` / `output()` functions, `inject()`, `OnPush`
- **Files:**
  - `apps/frontend/src/app/features/management/meal-plans/components/meal-plan-form/meal-plan-form.component.ts`
  - `apps/frontend/src/app/features/management/meal-plans/components/meal-plan-form/meal-plan-form.component.html`

---

### Markets

#### S3-FE-009 — MarketsListComponent

> Build the list view for markets. Simpler than MealPlans — no Description column. Same UX pattern: `p-table`, Edit/Delete per row, Add button, `p-confirmdialog` on delete, `p-toast` for outcomes.

- **Type:** Feature
- **Priority:** P2
- **SP:** 3
- **Depends on:** S3-FE-004
- **Branch:** `feature/S3-FE-009-markets-list`
- **Commit:** `feat(markets): add MarketsListComponent`
- **Tasks:** `p-table`: columns Code, Name, Actions
- **Acceptance Criteria:**
  - ✅ Table displays all markets for the authenticated tour operator
  - ✅ Clicking Delete opens a `p-confirmdialog` — deletion only proceeds on confirmation
  - ✅ Successful delete shows a success toast and removes the row
  - ✅ Failed delete shows an error toast, row is not removed
  - ✅ Clicking Edit opens `MarketFormComponent` in edit mode pre-filled with the row's data
  - ✅ Clicking Add opens `MarketFormComponent` in create mode with empty fields
  - ✅ Component uses `OnPush` change detection
- **Files:**
  - `apps/frontend/src/app/features/management/markets/components/markets-list/markets-list.component.ts`
  - `apps/frontend/src/app/features/management/markets/components/markets-list/markets-list.component.html`

---

#### S3-FE-010 — MarketFormComponent

> Build the create/edit form for a market in a `p-dialog`. Only two required fields: `code` and `name`. Same dual-mode pattern as `MealPlanFormComponent`.

- **Type:** Feature
- **Priority:** P2
- **SP:** 3
- **Depends on:** S3-FE-009
- **Branch:** `feature/S3-FE-010-market-form`
- **Commit:** `feat(markets): add MarketFormComponent`
- **Tasks:** Fields: `code` (required), `name` (required)
- **Acceptance Criteria:**
  - ✅ Dialog opens in create mode with all fields empty
  - ✅ Dialog opens in edit mode with fields pre-filled
  - ✅ Submit button disabled while form is invalid
  - ✅ Submitting with empty `code` or `name` shows inline validation errors
  - ✅ Successful create/edit closes the dialog and triggers a list refresh
  - ✅ API error shows an error toast — dialog stays open
  - ✅ Component uses `input()` / `output()` functions, `inject()`, `OnPush`
- **Files:**
  - `apps/frontend/src/app/features/management/markets/components/market-form/market-form.component.ts`
  - `apps/frontend/src/app/features/management/markets/components/market-form/market-form.component.html`

---

### Currencies

#### S3-FE-011 — CurrenciesListComponent

> Build the list view for currencies with Code, Name, and Symbol columns. Unlike other referentials, this table shows a global dataset — not filtered by tour operator. Same UX pattern as the other list components.

- **Type:** Feature
- **Priority:** P2
- **SP:** 3
- **Depends on:** S3-FE-005
- **Branch:** `feature/S3-FE-011-currencies-list`
- **Commit:** `feat(currencies): add CurrenciesListComponent`
- **Tasks:** `p-table`: columns Code, Name, Symbol, Actions
- **Acceptance Criteria:**
  - ✅ Table displays all currencies (global — no tenant filtering)
  - ✅ Clicking Delete opens a `p-confirmdialog` — deletion only proceeds on confirmation
  - ✅ Successful delete shows a success toast and removes the row
  - ✅ Failed delete shows an error toast, row is not removed
  - ✅ Clicking Edit opens `CurrencyFormComponent` in edit mode pre-filled with the row's data
  - ✅ Clicking Add opens `CurrencyFormComponent` in create mode with empty fields
  - ✅ Component uses `OnPush` change detection
- **Files:**
  - `apps/frontend/src/app/features/management/currencies/components/currencies-list/currencies-list.component.ts`
  - `apps/frontend/src/app/features/management/currencies/components/currencies-list/currencies-list.component.html`

---

#### S3-FE-012 — CurrencyFormComponent

> Build the create/edit form for a currency in a `p-dialog`. Three required fields: `code` (ISO 4217), `name`, and `symbol`. Same dual-mode and error-handling pattern as the other form components.

- **Type:** Feature
- **Priority:** P2
- **SP:** 3
- **Depends on:** S3-FE-011
- **Branch:** `feature/S3-FE-012-currency-form`
- **Commit:** `feat(currencies): add CurrencyFormComponent`
- **Tasks:** Fields: `code` (required), `name` (required), `symbol` (required)
- **Acceptance Criteria:**
  - ✅ Dialog opens in create mode with all fields empty
  - ✅ Dialog opens in edit mode with fields pre-filled
  - ✅ Submit button disabled while form is invalid
  - ✅ Submitting with empty `code`, `name`, or `symbol` shows inline validation errors
  - ✅ Successful create/edit closes the dialog and triggers a list refresh
  - ✅ API error (e.g. 409 duplicate code) shows an error toast — dialog stays open
  - ✅ Component uses `input()` / `output()` functions, `inject()`, `OnPush`
- **Files:**
  - `apps/frontend/src/app/features/management/currencies/components/currency-form/currency-form.component.ts`
  - `apps/frontend/src/app/features/management/currencies/components/currency-form/currency-form.component.html`

---

### Supplements

#### S3-FE-013 — SupplementsListComponent

> Build the list view for supplements with Name, Price, Unit, Can Receive Discount, and Actions columns. `price` must be displayed as a formatted number. `canReceiveDiscount` should render as a readable value (e.g. a checkmark icon). Same UX pattern as the other list components.

- **Type:** Feature
- **Priority:** P2
- **SP:** 3
- **Depends on:** S3-FE-006
- **Branch:** `feature/S3-FE-013-supplements-list`
- **Commit:** `feat(supplements): add SupplementsListComponent`
- **Tasks:** `p-table`: columns Name, Price, Unit, Can Receive Discount, Actions
- **Acceptance Criteria:**
  - ✅ Table displays all supplements for the authenticated tour operator
  - ✅ `price` displayed formatted as a number (not a Decimal object)
  - ✅ `canReceiveDiscount` displayed as a readable boolean (e.g. checkmark icon or Yes/No)
  - ✅ Clicking Delete opens a `p-confirmdialog` — deletion only proceeds on confirmation
  - ✅ Successful delete shows a success toast and removes the row
  - ✅ Failed delete shows an error toast, row is not removed
  - ✅ Clicking Edit opens `SupplementFormComponent` in edit mode pre-filled with the row's data
  - ✅ Clicking Add opens `SupplementFormComponent` in create mode with empty fields
  - ✅ Component uses `OnPush` change detection
- **Files:**
  - `apps/frontend/src/app/features/management/supplements/components/supplements-list/supplements-list.component.ts`
  - `apps/frontend/src/app/features/management/supplements/components/supplements-list/supplements-list.component.html`

---

#### S3-FE-014 — SupplementFormComponent

> Build the create/edit form for a supplement — the most complex form in the sprint (SP 5). In addition to standard text fields, it includes a `p-select` for `unit` with a tooltip on each option explaining how that unit type applies the price, a number input for `price` with minimum-value validation, and a `p-checkbox` for `canReceiveDiscount`. All 4 `SupplementUnit` values must be selectable and clearly labeled.

- **Type:** Feature
- **Priority:** P1
- **SP:** 5
- **Depends on:** S3-FE-013
- **Branch:** `feature/S3-FE-014-supplement-form`
- **Commit:** `feat(supplements): add SupplementFormComponent with unit selector`
- **Tasks:**
  - Fields: `name`, `description`, `price`, `unit`, `canReceiveDiscount`
  - `p-select` for Unit with tooltips on each option
  - `p-checkbox` for `canReceiveDiscount`
- **Acceptance Criteria:**
  - ✅ Dialog opens in create mode with all fields empty and `canReceiveDiscount` defaulting to `false`
  - ✅ Dialog opens in edit mode with all fields pre-filled
  - ✅ Submit button disabled while form is invalid
  - ✅ `price` field rejects negative values (client-side validation)
  - ✅ `unit` dropdown shows all 4 `SupplementUnit` values, each with a descriptive tooltip
  - ✅ Successful create/edit closes the dialog and triggers a list refresh
  - ✅ API error shows an error toast — dialog stays open
  - ✅ Component uses `input()` / `output()` functions, `inject()`, `OnPush`
  - ✅ No `any` — strict TypeScript with `SupplementUnit` from `@runner/shared/types`
- **Files:**
  - `apps/frontend/src/app/features/management/supplements/components/supplement-form/supplement-form.component.ts`
  - `apps/frontend/src/app/features/management/supplements/components/supplement-form/supplement-form.component.html`

---

### S3-REFACTOR-FE-001 — Extract `confirmDelete` shared utility

- **Type :** Refactor
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `refactor/S3-REFACTOR-FE-001-confirm-delete-util`
- **Commit :** `refactor(shared): extract confirmDelete utility to eliminate duplication`

#### Contexte

Six composants implémentent une logique `confirmDelete` quasi-identique :
`SupplementFormComponent` (×2), `RoomTypesListComponent`, `MarketFormComponent`,
`MealPlansListComponent`, `SeasonsListComponent`. Le code est dupliqué mot pour mot
à l'exception des labels et du message 409. Tout bug ou évolution devra être corrigé
6 fois.

#### Tâche 1 — Créer le helper

**`apps/frontend/src/app/shared/utils/confirm-delete.util.ts`**

```typescript
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ConfirmDeleteOptions {
  /** Titre de la dialog de confirmation. Ex: 'Delete Supplement' */
  header: string;
  /** Nom affiché de l'entité. Ex: supplement.name */
  entityName: string;
  /**
   * Message affiché dans la dialog.
   * Si absent, génère : `Are you sure you want to delete "${entityName}"?`
   * Utiliser uniquement quand le message standard ne suffit pas
   * (ex: avertissement cascade, données liées visibles).
   */
  message?: string;
  /** Observable retourné par le service de suppression */
  delete$: Observable<void>;
  /** Appelé après une suppression réussie (reload, emit, navigate…) */
  onSuccess?: () => void;
  /** Message affiché si le backend retourne 409 */
  conflictMessage?: string;
  confirmationService: ConfirmationService;
  messageService: MessageService;
}

export function confirmDelete(opts: ConfirmDeleteOptions): void {
  opts.confirmationService.confirm({
    header: opts.header,
    message:
      opts.message ?? `Are you sure you want to delete "${opts.entityName}"?`,
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      opts.delete$.pipe(take(1)).subscribe({
        next: () => {
          opts.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `"${opts.entityName}" has been deleted.`,
          });
          opts.onSuccess?.();
        },
        error: (err: { status: number }) => {
          const is409 = err.status === 409;
          opts.messageService.add({
            severity: is409 ? 'warn' : 'error',
            summary: is409 ? 'Cannot delete' : 'Error',
            detail: is409
              ? (opts.conflictMessage ??
                `"${opts.entityName}" is used by existing records.`)
              : 'An unexpected error occurred.',
          });
        },
      });
    },
  });
}
```

#### Tâche 2 — Migrer les composants existants

**`supplement-form.component.ts`**

```typescript
confirmDelete(): void {
  const supplement = this.supplement();
  if (!supplement) return;

  confirmDelete({
    header: 'Delete Supplement',
    entityName: supplement.name,
    delete$: this.supplementsService.remove(supplement.id),
    onSuccess: () => this.saved.emit(),
    conflictMessage: `"${supplement.name}" is used in existing contracts.`,
    confirmationService: this.confirmationService,
    messageService: this.messageService,
  });
}
```

**`room-types-list.component.ts`**

```typescript
// Ajouter l'injection
private readonly messageService = inject(MessageService);

confirmDelete(room: RoomType): void {
  confirmDelete({
    header: 'Delete Room Type',
    entityName: room.name,
    delete$: this.hotelsService.deleteRoomType(this.hotelId(), room.id),
    onSuccess: () => this.loadRooms(this.hotelId()),
    conflictMessage: `"${room.name}" is used in existing contracts.`,
    confirmationService: this.confirmationService,
    messageService: this.messageService,
  });
}
```

**`market-form.component.ts`**

```typescript
confirmDelete(): void {
  const market = this.market();
  if (!market) return;

  confirmDelete({
    header: 'Delete Market',
    entityName: market.name,
    delete$: this.marketsService.remove(market.id),
    onSuccess: () => this.saved.emit(),
    conflictMessage: `"${market.name}" is used in existing contracts.`,
    confirmationService: this.confirmationService,
    messageService: this.messageService,
  });
}
```

**`meal-plans-list.component.ts`** (ou `meal-plan-form.component.ts`)

```typescript
confirmDelete(mealPlan: MealPlan): void {
  confirmDelete({
    header: 'Delete Meal Plan',
    entityName: mealPlan.name,
    delete$: this.mealPlansService.remove(mealPlan.id),
    conflictMessage: `"${mealPlan.name}" is used in existing contracts.`,
    confirmationService: this.confirmationService,
    messageService: this.messageService,
  });
}
```

**`seasons-list.component.ts`** _(dépend de S3-FIX-FE-001)_

```typescript
confirmDelete(season: Season): void {
  confirmDelete({
    header: 'Delete Season',
    entityName: season.name,
    delete$: this.seasonsService.deleteSeason(season.id),
    onSuccess: () => this.seasonsService.reload(),
    conflictMessage: `"${season.name}" cannot be deleted because it is used in contract periods.`,
    confirmationService: this.confirmationService,
    messageService: this.messageService,
  });
}
```

#### Fichiers modifiés

```
apps/frontend/src/app/shared/utils/confirm-delete.util.ts                                    ← nouveau
apps/frontend/src/app/features/management/supplements/components/supplement-form/supplement-form.component.ts
apps/frontend/src/app/features/management/hotels/room-types/room-types-list/room-types-list.component.ts
apps/frontend/src/app/features/management/markets/components/market-form/market-form.component.ts
apps/frontend/src/app/features/management/meal-plans/components/meal-plan-form/meal-plan-form.component.ts
apps/frontend/src/app/features/management/seasons/seasons-list/seasons-list.component.ts
```

#### Acceptance Criteria

- ✅ `confirm-delete.util.ts` créé dans `shared/utils/`
- ✅ Aucune des 6 méthodes `confirmDelete` existantes ne contient plus de `subscribe` inline
- ✅ Comportement identique avant/après (succès, erreur 409, erreur générique)
- ✅ `conflictMessage` renseigné dans tous les appels
- ✅ `err` typé `{ status: number }` — pas de `any`
- ✅ `take(1)` centralisé dans le helper, supprimé des composants

---

### S3-FIX-FE-001 — Expose `reload()` on `SeasonsService`

- **Type :** Fix
- **Priority :** P0 ← bloque S3-REFACTOR-FE-001 sur le composant seasons
- **Story Points :** 1
- **Branch :** `fix/S3-FIX-FE-001-seasons-service-reload`
- **Commit :** `fix(seasons): expose public reload() method on SeasonsService`

#### Contexte

`SeasonsService` a une méthode `refresh()` privée. `SeasonsListComponent` ne peut pas
l'appeler depuis l'extérieur. Tous les autres services du projet exposent `reload()` —
`SeasonsService` doit être aligné.

#### Tâche

```typescript
// Avant — privé, inaccessible
private refresh(): void {
  this.loaded = false;
  this.loadSeasons();
}

// Après — public, aligné sur le pattern projet
reload(): void {
  this.loaded = false;
  this.loadSeasons();
}

// Mettre à jour les 3 appels internes
createSeason(dto: SeasonDto): Observable<Season> {
  return this.http.post<Season>(this.apiUrl, dto)
    .pipe(tap(() => this.reload()));
}

updateSeason(id: string, dto: Partial<SeasonDto>): Observable<Season> {
  return this.http.patch<Season>(`${this.apiUrl}/${id}`, dto)
    .pipe(tap(() => this.reload()));
}

deleteSeason(id: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`)
    .pipe(tap(() => this.reload()));
}
```

#### Fichiers modifiés

```
apps/frontend/src/app/features/management/seasons/seasons.service.ts
```

#### Acceptance Criteria

- ✅ `reload()` est public
- ✅ `refresh()` n'existe plus — renommé, pas dupliqué
- ✅ Les trois `tap()` internes pointent vers `this.reload()`
- ✅ `SeasonsListComponent` compile sans erreur

---

### S3-FIX-BE-001 — Corriger `HAS_CONTRACTS` → `HAS_PERIODS` pour Season

- **Type :** Fix
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `fix/S3-FIX-BE-001-season-conflict-message`
- **Commit :** `fix(seasons): use HAS_PERIODS result code and clarify 409 conflict message`

#### Contexte

`PrismaSeasonRepository.remove()` retourne `RepositoryResult.HAS_CONTRACTS` quand une
Season est liée à des `ContractPeriod`. Le nom est trompeur : une Season n'est pas liée
à des `Contract` mais à des `ContractPeriod`. Le message d'erreur backend est également
vague.

`HAS_CONTRACTS` doit rester dans l'enum — il est correct pour MealPlan, Market,
Supplement qui sont eux bien liés à des `Contract`. Ne pas le supprimer.

#### Tâches

**`apps/backend/src/common/repository.types.ts`**

```typescript
export enum RepositoryResult {
  DELETED = 'DELETED',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  HAS_CONTRACTS = 'HAS_CONTRACTS', // ← garder — MealPlan, Market, Supplement
  HAS_PERIODS = 'HAS_PERIODS', // ← nouveau — Season → ContractPeriod
}
```

**`apps/backend/src/seasons/repositories/prisma-season.repository.ts`**

```typescript
// Avant
if (error.code === 'P2003') return RepositoryResult.HAS_CONTRACTS;

// Après
if (error.code === 'P2003') return RepositoryResult.HAS_PERIODS;
```

**`apps/backend/src/seasons/seasons.service.ts`**

```typescript
// Avant
if (result === RepositoryResult.HAS_CONTRACTS)
  throw new ConflictException(`Season ${id} has linked Periods`);

// Après
if (result === RepositoryResult.HAS_PERIODS)
  throw new ConflictException(
    `Season ${id} cannot be deleted — it is linked to existing contract periods`
  );
```

#### Fichiers modifiés

```
apps/backend/src/common/repository.types.ts
apps/backend/src/seasons/repositories/prisma-season.repository.ts
apps/backend/src/seasons/seasons.service.ts
```

#### Acceptance Criteria

- ✅ `HAS_PERIODS` existe dans `RepositoryResult`
- ✅ `HAS_CONTRACTS` conservé (MealPlan/Market/Supplement non impactés)
- ✅ Supprimer une Season liée → HTTP 409 avec message clair
- ✅ Supprimer une Season non liée → HTTP 204 (comportement inchangé)

---

### S3-REFACTOR-FE-003 — Migrate `HotelsListComponent.confirmDelete` + extend helper

- **Type :** Refactor
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `refactor/S3-REFACTOR-FE-003-hotels-confirm-delete`
- **Commit :** `refactor(hotels): migrate confirmDelete to shared utility with custom message support`
- **Depends on :** S3-REFACTOR-FE-001

#### Contexte

`HotelsListComponent.confirmDelete()` a trois problèmes :

1. Message conditionnel (hôtel avec/sans données) non supporté par le helper actuel
2. Succès silencieux — liste non rafraîchie, pas de toast
3. Erreur 409 silencieuse — commentaire vide, zéro feedback utilisateur

#### Tâche 1 — Étendre `ConfirmDeleteOptions` avec `message?`

Le helper créé en S3-REFACTOR-FE-001 reçoit un nouveau champ optionnel. Les 5 appels
existants sans `message` ne sont pas modifiés.

```typescript
// confirm-delete.util.ts — seul changement dans l'interface
export interface ConfirmDeleteOptions {
  // ... champs existants ...
  message?: string;   // ← nouveau, optionnel
}

// Dans la fonction — une ligne change
message: opts.message ?? `Are you sure you want to delete "${opts.entityName}"?`,
```

#### Tâche 2 — Migrer `HotelsListComponent`

```typescript
// Ajouter l'injection si absente
private readonly messageService = inject(MessageService);

confirmDelete(hotel: Hotel): void {
  const hasData =
    (hotel.ageCategories?.length ?? 0) > 0 ||
    (hotel.roomTypes?.length ?? 0) > 0;

  confirmDelete({
    header: 'Delete Hotel',
    entityName: hotel.name,
    message: hasData
      ? `"${hotel.name}" has configured age categories or room types. Deleting it will remove all associated data. Continue?`
      : undefined,
    delete$: this.hotelsService.deleteHotel(hotel.id),
    onSuccess: () => this.hotelsService.reload(),
    conflictMessage: `"${hotel.name}" cannot be deleted because it is used in existing contracts.`,
    confirmationService: this.confirmationService,
    messageService: this.messageService,
  });
}
```

#### Fichiers modifiés

```
apps/frontend/src/app/shared/utils/confirm-delete.util.ts
apps/frontend/src/app/features/management/hotels/hotels-list/hotels-list.component.ts
```

#### Acceptance Criteria

- ✅ `message?: string` ajouté dans `ConfirmDeleteOptions`
- ✅ Les 5 appels existants sans `message` compilent sans modification
- ✅ Hôtel avec données → message d'avertissement cascade
- ✅ Hôtel sans données → message standard généré par le helper
- ✅ Succès → toast success + `hotelsService.reload()`
- ✅ Erreur 409 → toast warn avec `conflictMessage`
- ✅ Plus de `subscribe` inline dans `confirmDelete()`

---

### S3-REFACTOR-FE-002 — Add confirmation dialogs to `RoomTypesFormComponent`

- **Type :** Refactor
- **Priority :** P1
- **Story Points :** 2  ← était 1, ajusté car deux méthodes traitées
- **Branch :** `refactor/S3-REFACTOR-FE-002-room-type-form-confirm-delete`
- **Commit :** `refactor(hotels): add confirmation dialogs for deleteRoomType and deleteCapacity`
- **Depends on :** S3-REFACTOR-FE-001 (le helper `confirmDelete` doit exister)


#### Contexte

`RoomTypesFormComponent` a deux méthodes de suppression sans confirmation :

| Méthode | Supprime | Cascade Prisma | Risque |
|---|---|---|---|
| `deleteCapacity(row)` | Une `RoomTypeCapacity` | Non | Faible — recréable facilement |
| `deleteRoomType()` | Le `RoomType` entier | Oui (toutes ses capacités) | Élevé — bloqué si lié à un contrat |

Les deux suppriment immédiatement au clic. Un clic accidentel sur `deleteRoomType()`
supprime le room type **et toutes ses capacités** sans avertissement, et peut retourner
une erreur 409 silencieuse si des contrats y sont liés.

`RoomTypesListComponent` a déjà été migré vers `confirmDelete()` en S3-REFACTOR-FE-001.
Le formulaire doit être aligné sur le même comportement.


#### Décision — deux niveaux de confirmation différents

Les deux suppressions n'ont pas le même poids — elles ne méritent pas la même UX.

**`deleteCapacity`** — confirmation légère : la perte est limitée (une seule ligne de
config, recréable en 2 clics). Une `p-confirmDialog` standard suffit, sans le helper
`confirmDelete` car il n'y a pas de toast attendu ni de gestion 409 (les capacités ne
peuvent pas être liées à des contrats directement).

**`deleteRoomType`** — confirmation complète via le helper `confirmDelete` : la perte
est lourde (room type + toutes ses capacités), et le backend peut bloquer avec un 409
si le room type est utilisé dans un contrat. Le helper gère les toasts et le 409.

#### Tâche 1 — `deleteRoomType()` via le helper `confirmDelete`

Ajouter les injections :

```typescript
private readonly confirmationService = inject(ConfirmationService);
private readonly messageService      = inject(MessageService);
```

Remplacer la méthode :

```typescript
// Avant — suppression directe, sans confirmation, sans feedback 409
deleteRoomType(): void {
  const room = this._roomType();
  if (!room) return;

  this.hotelsService
    .deleteRoomType(this.hotelId(), room.id)
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.close();
        this.saved.emit();
      },
    });
}

// Après
deleteRoomType(): void {
  const room = this._roomType();
  if (!room) return;

  confirmDelete({
    header: 'Delete Room Type',
    entityName: room.name,
    delete$: this.hotelsService.deleteRoomType(this.hotelId(), room.id),
    onSuccess: () => {
      this.close();
      this.saved.emit();
    },
    conflictMessage: `"${room.name}" cannot be deleted because it is used in existing contracts.`,
    confirmationService: this.confirmationService,
    messageService: this.messageService,
  });
}
```

#### Tâche 2 — `deleteCapacity()` avec confirmation inline

`deleteCapacity` ne passe pas par le helper — pas de toast attendu, pas de 409 possible.
Une confirmation `ConfirmationService` directe suffit.

```typescript
// Avant — suppression directe, sans confirmation
deleteCapacity(row: CapacityRow): void {
  const room = this._roomType();
  if (!room || !row.capacity) return;

  this.hotelsService
    .deleteRoomTypeCapacity(this.hotelId(), room.id, row.capacity.id)
    .pipe(take(1))
    .subscribe({
      next: () => {
        row.capacity = null;
        row.maxPax.setValue(1);
        row.state.set(CapacityRowState.Idle);
        this.capacityRows.set([...this.capacityRows()]);
      },
    });
}

// Après
deleteCapacity(row: CapacityRow): void {
  const room = this._roomType();
  if (!room || !row.capacity) return;

  this.confirmationService.confirm({
    header: 'Remove Capacity',
    message: `Remove the capacity for "${row.ageCategory.name}"?`,
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.hotelsService
        .deleteRoomTypeCapacity(this.hotelId(), room.id, row.capacity!.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            row.capacity = null;
            row.maxPax.setValue(1);
            row.state.set(CapacityRowState.Idle);
            this.capacityRows.set([...this.capacityRows()]);
          },
        });
    },
  });
}
```

> **Pourquoi ne pas passer `deleteCapacity` par le helper ?**
> Le helper émet toujours un toast "Deleted" — ce serait du bruit pour une action aussi
> granulaire que retirer une ligne de capacité. L'UX correcte ici est la confirmation
> seule, sans toast. Le helper est conçu pour des suppressions d'entités de premier
> niveau (Hotel, RoomType, Market…), pas pour des sous-ressources de formulaire.
> Règle : ne pas généraliser un helper au-delà de son périmètre d'origine.


#### Tâche 3 — Template

Vérifier que `<p-confirmDialog />` est présent dans `room-types-form.component.html`.
Si le composant parent (`hotels-form`) le rend déjà, ne pas le dupliquer.

Ajouter `ConfirmDialogModule` dans le tableau `imports` du composant.


#### Imports à ajouter

```typescript
import { confirmDelete }                    from '../../../../../shared/utils/confirm-delete.util';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule }              from 'primeng/confirmdialog';
```

#### Fichiers modifiés

```
apps/frontend/src/app/features/management/hotels/room-types/room-types-form/room-types-form.component.ts
apps/frontend/src/app/features/management/hotels/room-types/room-types-form/room-types-form.component.html
```

#### Acceptance Criteria

**`deleteRoomType()`**
- ✅ Cliquer "Delete Room Type" ouvre une `p-confirmDialog`
- ✅ Confirmer → supprime, ferme le dialog, émet `saved`
- ✅ Annuler → rien
- ✅ Erreur 409 → toast warn avec `conflictMessage`
- ✅ Erreur générique → toast error
- ✅ Plus de `subscribe` inline dans `deleteRoomType()`

**`deleteCapacity()`**
- ✅ Cliquer "Remove" sur une ligne de capacité ouvre une `p-confirmDialog`
- ✅ Confirmer → supprime la capacité, remet `maxPax` à 1, state → Idle
- ✅ Annuler → rien, la ligne reste intacte
- ✅ Pas de toast (action granulaire — confirmation seule suffit)

---

### S3-DOC-001 — Mettre à jour `SPRINT_3.md` avec les nouveaux tickets

- **Type :** Docs
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `docs/S3-DOC-001-update-sprint3-refacto-tickets`
- **Commit :** `docs(sprint3): add refacto and fix tickets to Sprint 3 doc`
- **Depends on :** tous les tickets précédents mergés

#### Contexte

`SPRINT_3.md` ne référence pas les tickets de refacto et fix ajoutés en cours de
sprint. Le document doit refléter l'état réel du sprint pour servir de référence
aux sprints suivants.

#### Tâches

1. Ajouter une section **Refacto & Fix** à la fin de `SPRINT_3.md`, après les tâches
   frontend existantes et avant la Definition of Done
2. Y lister les 5 nouveaux tickets avec leur statut final :

```markdown
## Refacto & Fix — ajoutés en cours de sprint

| Ticket             | Type     | Description                                    | SP  |
| ------------------ | -------- | ---------------------------------------------- | --- |
| S3-REFACTOR-FE-001 | Refactor | Extract `confirmDelete` shared utility         | 2   |
| S3-FIX-FE-001      | Fix      | Expose `reload()` public on SeasonsService     | 1   |
| S3-FIX-BE-001      | Fix      | HAS_PERIODS result code + Season 409 message   | 1   |
| S3-REFACTOR-FE-003 | Refactor | Extend helper with `message?` + migrate Hotels | 2   |
| S3-REFACTOR-FE-002 | Refactor | Add confirmDialog to RoomTypesFormComponent    | 1   |
| **Total**          |          |                                                | 7   |
```

3. Mettre à jour le total Story Points du sprint dans l'en-tête :
   `Story Points : 21 → 28`

#### Fichiers modifiés

```
SPRINT_3.md
```

#### Acceptance Criteria

- ✅ Section "Refacto & Fix" présente avec les 5 tickets et le total SP
- ✅ Total SP mis à jour (21 → 28)
- ✅ Architecture Decisions mis à jour avec la règle `confirmDelete`
- ✅ Definition of Done mis à jour
- ✅ Notes for Sprint 4 mis à jour
- ✅ Aucune autre section du document modifiée

---

## Definition of Done - Sprint 3

### Backend

- ✅ 4 CRUD modules created: MealPlans, Markets, Currencies, Supplements
- ✅ DTOs created with each module (class-validator)
- ✅ `createdAt` / `updatedAt` on MealPlan, Market, Supplement — not on Currency
- ✅ Currencies global — no `tourOperatorId`, `RolesGuard` maintained
- ✅ Supplements: `SupplementUnit` enum + `price` Decimal serialized to `number` in the service
- ✅ Repository Pattern (abstract class as DI token) on all modules
- ✅ HTTP 401/403/404/409 returned correctly

### Frontend

- ✅ Lazy-loaded routes protected (`AuthGuard` + `RoleGuard` via `route.data['roles']`) under the `management` group
- ✅ Sidebar updated
- ✅ 4 services with BehaviorSubject + cache (HotelsService pattern)
- ✅ `take(1)` on all `subscribe()` calls
- ✅ 4 List components (`p-table` PrimeNG)
- ✅ 4 Form components (Reactive Forms inside `p-dialog`)
- ✅ Success/error toast (`p-toast`)
- ✅ Delete confirmation (`p-confirmdialog`)
- ✅ Tooltips on supplement unit types
- ✅ Components under `features/management/<feature>/`
- ✅ `confirmDelete` utility créée dans `shared/utils/`
- ✅ Tous les composants list/form utilisent le helper (zéro `subscribe` inline dans confirmDelete)
- ✅ `SeasonsService.reload()` public

### Angular Standards

- ✅ Standalone components — Angular 19 default, do not write `standalone: true` in the decorator
- ✅ `input()` / `output()` functions
- ✅ `inject()` not constructor injection
- ✅ `OnPush` always
- ✅ Signals for local state, `computed()` for derived state
- ✅ Native control flow (`@if`, `@for`, `@switch`)
- ✅ No `ngClass` / `ngStyle`
- ✅ No `any` — strict TypeScript
- ✅ WCAG AA compliance

---

## Story Points Summary

| Area                | Tickets                 | Total SP |
| ------------------- | ----------------------- | -------- |
| MealPlans backend   | S3-BE-001 → 008         | 14       |
| Markets backend     | S3-BE-009 → 016         | 14       |
| Currencies backend  | S3-BE-017 → 024         | 14       |
| Supplements backend | S3-BE-025 → 032         | 14       |
| Routing & Sidebar   | S3-FE-001 → 002         | 4        |
| Frontend services   | S3-FE-003 → 006         | 12       |
| Frontend components | S3-FE-007 → 014         | 26       |
| Refacto & Fix       | S3-REFACTOR/FIX 001→003 | 7        |
| Documentation       | S3-DOC-001              | 1        |
| **Total**           | **38 tickets**          | **106**  |

---

## Files to Attach at Session Start

```
SPRINT_3.md                                          — this file
prisma/schema.prisma                                 — current state
apps/backend/src/app.module.ts                       — for imports
libs/shared/types/src/index.ts                       — existing structure

— Backend reference pattern (Seasons = the simplest):
apps/backend/src/seasons/repositories/season.repository.ts
apps/backend/src/seasons/repositories/prisma-season.repository.ts
apps/backend/src/seasons/dto/create-season.dto.ts
apps/backend/src/seasons/dto/update-season.dto.ts
apps/backend/src/seasons/seasons.service.ts
apps/backend/src/seasons/seasons.controller.ts
apps/backend/src/seasons/seasons.module.ts
```

---

## Dependencies

- Sprint 0 ✅, Sprint 1 ✅, Sprint 2 ✅ completed

---

## Risks

| Risk                                        | Mitigation                                                    |
| ------------------------------------------- | ------------------------------------------------------------- |
| Currencies global vs multi-tenant           | `RolesGuard` maintained — only the DB filter is absent        |
| Supplements `price` Decimal                 | Serialize via `Number(price)` in the service before returning |
| 4 supplement unit types confusing for users | Explanatory tooltips in the form                              |
| SupplementFormComponent complexity (SP 5)   | Highest-risk frontend ticket — tackle early in the sprint     |

---

## Notes for Sprint 4

The following decisions made in Sprint 3 will affect Sprint 4 (Contracts):

- **Abstract class repository pattern** — Sprint 4 should follow the same pattern as Sprint 3 (abstract class as DI token), not revert to Sprint 2's interface + string token approach. Update Sprint 4 docs before starting.
- **`HAS_CONTRACTS` error code** — MealPlan, Market, and Supplement repositories already catch `P2003 → HAS_CONTRACTS` on `remove`. Sprint 4 must ensure the `Contract` model has the correct foreign key relations pointing to these entities so those Prisma error codes actually fire.
- **`PUT` vs `PATCH`** — Sprint 3 uses `PATCH` on all update endpoints (partial update, `PartialType`). Sprint 4 currently uses `PUT` in several places — align to `PATCH` for consistency unless full replacement is intentional.
- **`features/contracts/` vs `features/management/contracts/`** — Sprint 4 places Contracts under `features/contracts/`, outside the `management/` group used by Sprint 3 referentials. Confirm whether Contracts should live under `management/` or be a top-level feature (impacts routing group and sidebar).
- **Unit tests** — Sprint 4 introduces unit tests (`> 80% coverage`) for the first time. Sprints 0–3 have no test tasks. Decide whether to backfill tests on earlier services or keep the boundary at Sprint 4 forward.
- **`confirmDelete` helper disponible** — importer depuis
  `@/app/shared/utils/confirm-delete.util`. Champ `message?` disponible pour
  les cas avec avertissement cascade (ex: contrat avec périodes liées).
- **`HAS_PERIODS`** ajouté dans `RepositoryResult` — utiliser pour tout
  repository dont l'entité est liée à des `ContractPeriod`.
