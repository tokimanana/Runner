# Sprint 2 - Hotels + Seasons

## 🎯 Objectif Sprint

Gestion complète des hôtels (CRUD, Age Categories, Room Types) + ajout de la gestion des Seasons réutilisables.

**Durée estimée :** 4-5 jours  
**Story Points :** 38 points (+ 8 points nouveaux tickets)

---

## Ordre d'exécution

```
S2-CHORE-001  (shared types lib)        ✅ Done
S2-BE-000     (migration Prisma)        ✅ Done

Backend :
  S2-BE-002 (DTOs Hotels)              ✅ Done
  S2-BE-001 (Hotels CRUD)              ✅ Done
  S2-BE-003 (Age Categories)           ✅ Done
  S2-BE-004 (Room Types)               ✅ Done
  S2-BE-005 (Seasons)                  ✅ Done
  S2-BE-006 (Indexes Prisma)           ✅ Done (déjà présents depuis S2-BE-000)
  S2-BE-007 (RoomTypeCapacity)         🔲 À faire
  S2-BE-008 (RoomTypeCapacity endpoints) 🔲 À faire (bloqué sur S2-BE-007)
  S2-BE-009 (Supprimer order AgeCategory) 🔲 À faire

Frontend :
  S2-FE-009 (Routes)                   ✅ Done
  S2-FE-001 (HotelsService)            ✅ Done
  S2-FE-002 (HotelsList)               ✅ Done
  S2-FE-003 (HotelsForm)               ✅ Done
  S2-FE-004 (AgeCategoryDto + méthodes) ✅ Done
  S2-FE-005 (AgeCategoriesListComponent) ✅ Done
  S2-FE-006 (AgeCategoriesFormComponent) ✅ Done
  S2-FE-007 (RoomTypes service methods) ✅ Done
  S2-FE-008 (RoomTypesListComponent)   ✅ Done
  S2-FE-009 (RoomTypesFormComponent)   ✅ Done
  S2-FE-010 (SeasonsService)           ✅ Done
  S2-FE-011 (SeasonsListComponent)     ✅ Done
  S2-FE-012 (SeasonsFormComponent)     ✅ Done
  S2-FE-013 (RoomTypeCapacity UI)      🔲 À faire (bloqué sur S2-BE-007, S2-BE-008)
```

---

## Architecture Decisions

### Backend

- **Repository Pattern** — interface + string token injection
  - Repository = data access only, no HTTP exceptions, no sanitization
  - Service = business logic, HTTP exceptions, sanitization (MAX_LIMIT)
  - Pattern : Controller → Service → Repository (interface) → PrismaRepository (implementation)
- **RepositoryResult enum** — partagé entre tous les repositories, dans `@backend/common/repository.types`
- **PaginatedResult\<T\>** — dans `@runner/shared/types` (partagé frontend + backend)
- **HOTEL_INCLUDE constant** — extrait dans `PrismaHotelRepository` pour éviter la duplication
- **Multi-tenancy** — `tourOperatorId` toujours extrait du JWT, jamais du request body
- **Pagination** — `$transaction([findMany, count])` — MAX_LIMIT = 100 enforced in service
- **Age Categories overlap** — formule : deux intervalles [A,B] et [C,D] se chevauchent si A < D AND B > C
- **Room Types** — code unique par hôtel (pas globalement)
- **Seasons** — `@@unique([tourOperatorId, name])` — pas de doublon de nom par tour operator. Pas de validation de chevauchement entre seasons (sera validé sur ContractPeriod en Sprint 4)

### Frontend

- **BehaviorSubject** pour HotelsService et SeasonsService (pas NgRx — réservé à l'auth)
- **Signal local + HTTP direct** pour les sub-resources (AgeCategories, RoomTypes) — l'id change selon l'hôtel
- **`take(1)`** sur tous les subscribe() dans les services
- **`toSignal()`** pour convertir Observable → Signal dans les composants liste
- **`open()`/`close()`** via `viewChild` pour les dialogs — évite le conflit `[visible]` + `input()`
- **Delete dans le dialog**, pas sur la ligne de liste
- **Tab Configuration** uniquement en edit mode (`@if(hotelId())`)
- **Tri par `minAge`** côté frontend pour les Age Categories (pas de champ `order`)
- **`_forms.scss`** — styles partagés entre tous les formulaires (`form-page`, `form-header`, `form-row`, `field`, `dialog-footer`, etc.)

---

## Backend Tasks

### ✅ S2-CHORE-001 : Créer shared NX types library

- **Branch :** `chore/S2-CHORE-001-shared-types`
- **Commit :** `chore(nx): create shared types library for Hotel, Season, AgeCategory, RoomType`
- Lib générée : `libs/shared/types`
- Importable via `@runner/shared/types`

---

### ✅ S2-BE-000 : Migration Prisma — Hotel, AgeCategory, RoomType, Season

- **Branch :** `chore/S2-BE-000-prisma-migration-sprint2`
- **Commit :** `chore(prisma): add Hotel, AgeCategory, RoomType, Season models`

---

### ✅ S2-BE-001 : Hotels CRUD complet

- **Branch :** `feature/S2-BE-001-hotels-crud`
- **Commit :** `feat(hotels): implement complete CRUD with validation`
- `findAll()` paginé, `findOne()`, `create()`, `update()`, `remove()`
- Inclut `ageCategories` et `roomTypes` dans les réponses

---

### ✅ S2-BE-002 : DTOs Hotels

- **Branch :** `feature/S2-BE-002-hotels-dto`
- **Commit :** `feat(hotels): add CreateHotelDto and UpdateHotelDto with validation`

---

### ✅ S2-BE-003 : Endpoints Age Categories

- **Branch :** `feature/S2-BE-003-age-categories`
- **Commit :** `feat(hotels): add age categories CRUD endpoints`
- Validation : minAge < maxAge, pas de chevauchement
- Endpoints :

```
GET    /hotels/:id/age-categories
POST   /hotels/:id/age-categories
PATCH  /hotels/:id/age-categories/:catId
DELETE /hotels/:id/age-categories/:catId
```

---

### ✅ S2-BE-004 : Endpoints Room Types

- **Branch :** `feature/S2-BE-004-room-types`
- **Commit :** `feat(hotels): add room types CRUD endpoints`
- Validation : code unique par hôtel, maxAdults >= 1
- Endpoints :

```
GET    /hotels/:id/room-types
POST   /hotels/:id/room-types
PATCH  /hotels/:id/room-types/:typeId
DELETE /hotels/:id/room-types/:typeId
```

---

### ✅ S2-BE-005 : SeasonsModule

- **Branch :** `feature/S2-BE-005-seasons-module`
- **Commit :** `feat(seasons): create seasons module with CRUD`
- Validation : startDate < endDate
- Endpoints :

```
GET    /seasons
GET    /seasons/:id
POST   /seasons
PATCH  /seasons/:id
DELETE /seasons/:id
```

---

### ✅ S2-BE-006 : Indexes Prisma

- **Status :** Déjà présents depuis S2-BE-000
- Hotel: `@@index([tourOperatorId])`, `@@index([destination])`
- Season: `@@index([tourOperatorId])`, `@@index([startDate, endDate])`

---

### ✅ S2-REFACTOR-BE-001 : Hotel Repository Pattern

- **Commit :** `refactor(hotels): adopt Repository Pattern for Hotels, AgeCategory, RoomType`
- `HotelRepository` interface + `PrismaHotelRepository`

---

### ✅ S2-REFACTOR-BE-004 : Season Repository Pattern

- **Commit :** `refactor(seasons): adopt Repository Pattern for Seasons`
- `ISeasonRepository` interface + `PrismaSeasonRepository`

---

### 🔲 S2-BE-007 : Refactor RoomType — RoomTypeCapacity

- **Type :** Feature / Breaking Change
- **Priority :** P0
- **Branch :** `feature/S2-BE-007-room-type-capacity`
- **Commit :** `feat(hotels): replace maxAdults/maxChildren with RoomTypeCapacity model`
- **Description :**
  - Supprimer `maxAdults` et `maxChildren` de `RoomType`
  - Ajouter modèle `RoomTypeCapacity`
  - Mettre à jour `CreateRoomTypeDto` / `UpdateRoomTypeDto`
  - Mettre à jour `PrismaHotelRepository` — étendre `HOTEL_INCLUDE` avec `capacities`
  - Mettre à jour `RoomType` dans `@runner/shared/types`

```prisma
model RoomTypeCapacity {
  id            String      @id @default(cuid())
  roomTypeId    String
  ageCategoryId String
  maxPax        Int
  roomType      RoomType    @relation(fields: [roomTypeId], references: [id], onDelete: Cascade)
  ageCategory   AgeCategory @relation(fields: [ageCategoryId], references: [id], onDelete: Cascade)

  @@unique([roomTypeId, ageCategoryId])
}
```

- **Acceptance Criteria :**
  - ✅ Migration appliquée sans erreur
  - ✅ `RoomType` ne contient plus `maxAdults` / `maxChildren`
  - ✅ `RoomType.capacities` disponible dans les réponses
  - ✅ `@runner/shared/types` mis à jour
- **Bloquant pour :** S2-BE-008, S2-FE-013

---

### 🔲 S2-BE-008 : RoomTypeCapacity endpoints

- **Type :** Feature
- **Priority :** P0
- **Branch :** `feature/S2-BE-008-room-type-capacity-endpoints`
- **Commit :** `feat(hotels): add room type capacity CRUD endpoints`
- **Bloqué sur :** S2-BE-007
- **Endpoints :**

```
POST   /hotels/:hotelId/room-types/:typeId/capacities
PATCH  /hotels/:hotelId/room-types/:typeId/capacities/:capacityId
DELETE /hotels/:hotelId/room-types/:typeId/capacities/:capacityId
```

- **DTOs :**
  - `CreateRoomTypeCapacityDto { ageCategoryId: string, maxPax: number }`
  - `UpdateRoomTypeCapacityDto { maxPax?: number }`
- **Validation :**
  - `maxPax >= 1`
  - `ageCategoryId` doit appartenir au même hôtel
- **Repository Pattern :** `IRoomTypeCapacityRepository` + `PrismaRoomTypeCapacityRepository`

---

### 🔲 S2-BE-009 : Supprimer `order` de AgeCategory

- **Type :** Refactor
- **Priority :** P1
- **Branch :** `refactor/S2-BE-009-remove-age-category-order`
- **Commit :** `refactor(hotels): remove order field from AgeCategory, sort by minAge`
- **Description :**
  - Migration Prisma : retirer le champ `order` du modèle `AgeCategory`
  - Mettre à jour `CreateAgeCategoryDto` / `UpdateAgeCategoryDto` — retirer `order`
  - Trier par `minAge ASC` dans `PrismaHotelRepository.findAgeCategories()`
  - Mettre à jour `AgeCategory` dans `@runner/shared/types` — retirer `order`
- **Acceptance Criteria :**
  - ✅ Migration appliquée sans erreur
  - ✅ `order` retiré de tous les DTOs et types
  - ✅ GET `/hotels/:id/age-categories` retourne les catégories triées par `minAge ASC`

---

## Frontend Tasks

### ✅ S2-FE-009 : Management Routes Setup

- **Branch :** `feature/S2-FE-009-management-routes`
- **Commit :** `feat(routing): setup management lazy-loaded routes with RoleGuard`
- Routes : `/management/hotels`, `/management/seasons`
- RoleGuard au niveau du groupe `management`

---

### ✅ S2-FE-001 : HotelsService

- **Branch :** `feature/S2-FE-001-hotels-service`
- **Commit :** `feat(hotels): create hotels service with BehaviorSubject and API methods`
- BehaviorSubject, loaded flag, refresh(), loading$
- Méthodes : `getHotels()`, `getHotelById()`, `createHotel()`, `updateHotel()`, `deleteHotel()`
- Méthodes Age Categories et Room Types incluses

---

### ✅ S2-FE-002 : HotelsListComponent

- **Branch :** `feature/S2-FE-002-hotels-list`
- **Commit :** `feat(hotels): implement hotels list component with p-table`
- `p-table`, `toSignal()`, confirm delete avec avertissement si données liées

---

### ✅ S2-FE-003 : HotelsFormComponent

- **Branch :** `feature/S2-FE-003-hotels-form`
- **Commit :** `feat(hotels): implement hotel form component for create and edit`
- Tabs General / Configuration (Configuration uniquement en edit mode)
- `withComponentInputBinding()` pour `hotelId` depuis route params

---

### ✅ S2-FE-004 : AgeCategoryDto + méthodes HotelsService

- **Branch :** `feature/S2-FE-004-age-categories-service`
- **Commit :** `feat(hotels): add age categories methods to HotelsService`

---

### ✅ S2-FE-005 : AgeCategoriesListComponent

- **Branch :** `feature/S2-FE-005-age-categories-list`
- **Commit :** `feat(hotels): implement age categories list component`
- Tri par `minAge` côté frontend
- Pas de search bar (trop peu de catégories)

---

### ✅ S2-FE-006 : AgeCategoriesFormComponent

- **Branch :** `feature/S2-FE-006-age-categories-form`
- **Commit :** `feat(hotels): implement age categories form component`
- `open()`/`close()` via `viewChild` — évite conflit `[visible]` + `input()`
- Delete dans le dialog
- Validation `minAge < maxAge`

---

### ✅ S2-FE-007 : RoomTypes service methods

- **Branch :** `feature/S2-FE-007-room-types-service`
- **Commit :** `feat(hotels): add room types service methods and RoomTypeDto`
- `RoomTypeDto { code, name }` — sans `maxAdults/maxChildren` (remplacés par `RoomTypeCapacity`)

---

### ✅ S2-FE-008 : RoomTypesListComponent

- **Branch :** `feature/S2-FE-008-room-types-list`
- **Commit :** `feat(hotels): implement room types list with confirm delete`
- Colonnes : `code`, `name` (capacités à ajouter en S2-FE-013)
- Search bar, confirm delete via `ConfirmationService`

---

### ✅ S2-FE-009 : RoomTypesFormComponent

- **Branch :** `feature/S2-FE-009-room-types-form`
- **Commit :** `feat(hotels): implement room types form component`
- `open()`/`close()` — même pattern qu'AgeCategoriesFormComponent
- Champs : `code`, `name`

---

### ✅ S2-FE-010 : SeasonsService

- **Branch :** `feature/S2-FE-010-seasons-service`
- **Commit :** `feat(seasons): create seasons service with BehaviorSubject`
- Même pattern qu'HotelsService

---

### ✅ S2-FE-011 : SeasonsListComponent

- **Branch :** `feature/S2-FE-011-seasons-list`
- **Commit :** `feat(seasons): implement seasons list component`
- `toSignal()`, dates formatées `dd MMM yyyy`
- Row expand prévu pour les Periods (Sprint 3)

---

### ✅ S2-FE-012 : SeasonsFormComponent

- **Branch :** `feature/S2-FE-012-seasons-form`
- **Commit :** `feat(seasons): implement seasons form component`
- `p-datepicker`, conversion `Date ↔ ISO string`
- Validation `startDate < endDate` via cross-field validator

---

### 🔲 S2-FE-013 : RoomTypeCapacity — affichage et gestion

- **Type :** Feature
- **Priority :** P0
- **Branch :** `feature/S2-FE-013-room-type-capacity`
- **Commit :** `feat(hotels): implement room type capacity management`
- **Bloqué sur :** S2-BE-007, S2-BE-008
- **Description :**
  - Dans `RoomTypesFormComponent`, ajouter un tableau de capacités par `AgeCategory`
  - Pour chaque catégorie de l'hôtel, l'utilisateur définit un `maxPax`
  - UI : tableau inline dans le dialog, pas de nouveau dialog
  - Charger les `AgeCategory` de l'hôtel dynamiquement
  - Appeler les nouveaux endpoints capacity au submit
- **Acceptance Criteria :**
  - ✅ Capacités affichées dans le form room type
  - ✅ Create/update capacités via les nouveaux endpoints
  - ✅ AgeCategories de l'hôtel chargées dynamiquement
  - ✅ No any, strict TypeScript

---

## File Structure Frontend

```
apps/frontend/src/
├── styles/
│   └── _forms.scss                        — styles partagés (form-page, form-header, form-row, field, dialog-footer...)
└── app/
    └── features/
        └── management/
            ├── hotels/
            │   ├── age-categories/
            │   │   ├── age-categories-form/
            │   │   │   ├── age-categories-form.component.ts
            │   │   │   ├── age-categories-form.component.html
            │   │   │   └── age-categories-form.component.scss
            │   │   └── age-categories-list/
            │   │       ├── age-categories-list.component.ts
            │   │       ├── age-categories-list.component.html
            │   │       └── age-categories-list.component.scss
            │   ├── hotels-form/
            │   │   ├── hotels-form.component.ts
            │   │   ├── hotels-form.component.html
            │   │   └── hotels-form.component.scss
            │   ├── hotels-list/
            │   │   ├── hotels-list.component.ts
            │   │   ├── hotels-list.component.html
            │   │   └── hotels-list.component.scss
            │   ├── room-types/
            │   │   ├── room-types-form/
            │   │   │   ├── room-types-form.component.ts
            │   │   │   ├── room-types-form.component.html
            │   │   │   └── room-types-form.component.scss
            │   │   └── room-types-list/
            │   │       ├── room-types-list.component.ts
            │   │       ├── room-types-list.component.html
            │   │       └── room-types-list.component.scss
            │   └── hotels.service.ts
            └── seasons/
                ├── seasons-form/
                │   ├── seasons-form.component.ts
                │   ├── seasons-form.component.html
                │   └── seasons-form.component.scss
                ├── seasons-list/
                │   ├── seasons-list.component.ts
                │   ├── seasons-list.component.html
                │   └── seasons-list.component.scss
                └── seasons.service.ts
```

---

## File Structure Backend

```
apps/backend/src/
├── common/
│   └── repository.types.ts              — RepositoryResult enum
├── hotels/
│   ├── dto/
│   │   ├── create-hotel.dto.ts
│   │   ├── update-hotel.dto.ts
│   │   ├── create-age-category.dto.ts
│   │   ├── update-age-category.dto.ts
│   │   ├── create-room-type.dto.ts
│   │   └── update-room-type.dto.ts
│   ├── repositories/
│   │   ├── hotel.repository.ts          — interface HotelRepository
│   │   └── prisma-hotel.repository.ts   — PrismaHotelRepository
│   ├── hotels.constants.ts              — HOTEL_REPOSITORY token
│   ├── hotels.types.ts                  — HotelDetail, HotelQuery
│   ├── hotels.controller.ts
│   ├── hotels.service.ts
│   └── hotels.module.ts
└── seasons/
    ├── dto/
    │   ├── create-season.dto.ts
    │   └── update-season.dto.ts
    ├── repositories/
    │   ├── season.repository.ts          — ISeasonRepository interface
    │   └── prisma-season.repository.ts   — PrismaSeasonRepository
    ├── seasons.constants.ts
    ├── seasons.types.ts                  — SeasonQuery
    ├── seasons.controller.ts
    ├── seasons.service.ts
    └── seasons.module.ts

libs/shared/types/src/
├── lib/
│   └── types.ts    — Hotel, AgeCategory, RoomType, RoomTypeDto, Season, SeasonDto, AgeCategoryDto, PaginatedResult<T>, PaginationParams, HotelDto
└── index.ts
```

---

## Prisma Schema State

```prisma
model User          — id, email, passwordHash, firstName, lastName, role, tourOperatorId, refreshTokens[]
model Hotel         — id, code(@unique), name, city, country, region?, destination?, address?, email?, phone?, tourOperatorId, ageCategories[], roomTypes[]
model AgeCategory   — id, name, minAge, maxAge, hotelId (cascade delete) — order supprimé (S2-BE-009)
model RoomType      — id, name, code, hotelId, capacities[] (cascade delete) — maxAdults/maxChildren supprimés (S2-BE-007)
model RoomTypeCapacity — id, roomTypeId, ageCategoryId, maxPax @@unique([roomTypeId, ageCategoryId]) — (S2-BE-007)
model Season        — id, name, startDate, endDate, tourOperatorId @@unique([tourOperatorId, name])
model RefreshToken  — id, token(@unique), userId, expiresAt

Indexes:
  Hotel: @@index([tourOperatorId]), @@index([destination])
  Season: @@index([tourOperatorId]), @@index([startDate, endDate])
```

---

## Available Endpoints

### Hotels

```
GET    /hotels                              — paginated { data, total, limit, offset }
GET    /hotels/:id                          — detail with ageCategories + roomTypes
POST   /hotels                              — create (201)
PATCH  /hotels/:id                          — update
DELETE /hotels/:id                          — delete (204)

GET    /hotels/:id/age-categories           — list sorted by minAge ASC
POST   /hotels/:id/age-categories           — create with overlap validation
PATCH  /hotels/:id/age-categories/:catId
DELETE /hotels/:id/age-categories/:catId    — (204)

GET    /hotels/:id/room-types
POST   /hotels/:id/room-types               — create with code uniqueness validation
PATCH  /hotels/:id/room-types/:typeId
DELETE /hotels/:id/room-types/:typeId       — (204)

POST   /hotels/:hotelId/room-types/:typeId/capacities         — (S2-BE-008)
PATCH  /hotels/:hotelId/room-types/:typeId/capacities/:id     — (S2-BE-008)
DELETE /hotels/:hotelId/room-types/:typeId/capacities/:id     — (S2-BE-008)
```

### Seasons

```
GET    /seasons
GET    /seasons/:id
POST   /seasons           — create (201)
PATCH  /seasons/:id
DELETE /seasons/:id       — (204)
```

---

## Test Data

```
Hotel: cmobxqdno00026da758zr27eh (Hotel Tropicana)
  AgeCategories: Bébé(0-2), Enfant(3-11), Adulte(12-99)
  RoomTypes: SGL(1 adult), DBL(2 adults), FAM(2 adults + 2 children)

Seasons:
  Été 2026: 2026-06-01 → 2026-08-31
  Hiver 2026: 2026-12-01 → 2027-02-28
  Pâques 2026: 2026-04-01 → 2026-04-30
```

---

## Definition of Done — Sprint 2

### Backend ✅

- ✅ CRUD hôtel complet avec validation
- ✅ Age categories gérées par hôtel (CRUD + overlap validation)
- ✅ Room types gérés par hôtel (CRUD + code uniqueness)
- ✅ CRUD seasons complet avec validation dates
- ✅ Indexes Prisma pour performance
- ✅ Repository Pattern adopté sur tous les modules
- ✅ HTTP 401/403/404 retournés correctement
- 🔲 RoomTypeCapacity (S2-BE-007, S2-BE-008)
- 🔲 Suppression order AgeCategory (S2-BE-009)

### Frontend ✅

- ✅ Liste hôtels avec search et confirm delete
- ✅ Formulaire hôtel create/edit avec tabs General/Configuration
- ✅ Age Categories : list + form dans dialog (open/close via viewChild)
- ✅ Room Types : list + form dans dialog
- ✅ CRUD seasons complet avec validation dates
- ✅ Routes protégées par RoleGuard
- ✅ BehaviorSubject pour Hotels et Seasons
- ✅ toSignal() dans les composants liste
- ✅ \_forms.scss partagé
- 🔲 RoomTypeCapacity UI (S2-FE-013)

### Convention commits Sprint 2

```
chore(nx): create shared types library
chore(prisma): add Hotel, AgeCategory, RoomType, Season models
feat(hotels): implement complete CRUD with validation
feat(hotels): add age categories CRUD endpoints
feat(hotels): add room types CRUD endpoints
feat(seasons): create seasons module with CRUD
feat(hotels): create hotels service with BehaviorSubject and API methods
feat(hotels): implement hotels list component with p-table
feat(hotels): implement hotel form component for create and edit
feat(hotels): add age categories methods to HotelsService
feat(hotels): implement age categories list component
feat(hotels): implement age categories form component
feat(hotels): add room types service methods and RoomTypeDto
feat(hotels): implement room types list with confirm delete
feat(hotels): implement room types form component
feat(seasons): create seasons service with BehaviorSubject
feat(seasons): implement seasons list component
feat(seasons): implement seasons form component
refactor(styles): extract shared form styles to _forms.scss
feat(hotels): replace maxAdults/maxChildren with RoomTypeCapacity model
feat(hotels): add room type capacity CRUD endpoints
refactor(hotels): remove order field from AgeCategory, sort by minAge
feat(hotels): implement room type capacity management
```
