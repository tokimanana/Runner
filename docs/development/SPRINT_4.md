# Sprint 4 — Contracts (Tarification Complexe)

> **Document de référence révisé** — toutes les corrections issues des décisions prises en
> Sprint 2 (RoomTypeCapacity) et Sprint 3 (Repository Pattern, PATCH, shared types) sont
> intégrées. Les points modifiés portent le tag ``.

---

## 🎯 Objectif Sprint

Créer le système de contrats avec périodes, tarification PER_OCCUPANCY, et meal plan
supplements.

**Durée estimée :** 6-7 jours
**Story Points :** 55 points

---

## ⚡ Décisions d'architecture — Sprint 4

> À lire **avant** d'écrire la moindre ligne de code. Ces règles remplacent ou complètent
> le document original.

### 1. Repository Pattern — abstract class (pas interface + string token)

Sprint 3 a migré vers le pattern **abstract class as DI token**. Sprint 4 suit la même
convention — aucun fichier `contracts.constants.ts` séparé.

```typescript
// ✅ Pattern Sprint 3/4 — abstract class = type ET token DI
export abstract class ContractRepository {
  abstract findAll(query: ContractQuery): Promise<PaginatedResult<Contract>>;
  // ...
}

// Dans contracts.module.ts
providers: [
  { provide: ContractRepository, useClass: PrismaContractRepository },
  ContractsService,
];
```

```typescript
// ❌ Pattern Sprint 2 — NE PAS reproduire
export const CONTRACT_REPOSITORY = 'CONTRACT_REPOSITORY';
export interface IContractRepository { ... }
```

### 2. PATCH sur tous les endpoints de mise à jour

Sprint 3 utilise `PATCH` partout (mise à jour partielle, `PartialType`).
Le document original du Sprint 4 mentionnait `PUT` sur plusieurs endpoints — **aligné sur PATCH**.

```typescript
// ✅
@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateContractDto) {}

// ❌ à éviter
@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdateContractDto) {}
```

### 3. RoomTypeCapacity remplace maxAdults / maxChildren

En Sprint 2 (S2-BE-007), `maxAdults` et `maxChildren` ont été supprimés du modèle
`RoomType` et remplacés par `RoomTypeCapacity`. Toute validation de capacité doit utiliser
`capacities` (tableau de `{ ageCategoryId, maxPax }`).

```typescript
// ✅ Validation capacité — Sprint 4
const roomType = await this.prisma.roomType.findUnique({
  where: { id: roomTypeId },
  include: { capacities: { include: { ageCategory: true } } },
});
// Sommer maxPax par catégorie pour valider numAdults + numChildren

// ❌ NE PLUS UTILISER
if (numAdults > roomType.maxAdults) { ... }
```

### 4. Filtres contrats — `buildContractParams` dans shared/utils

Les contrats ne sont pas paginés comme les hôtels (`HotelsService` utilise
`buildPaginationParams`). Les contrats ont des filtres spécifiques : `hotelId`, `marketId`.
Créer un helper dédié plutôt que de forcer `buildPaginationParams`.

```typescript
// apps/frontend/src/app/shared/utils/contract-params.util.ts
export function buildContractParams(
  filters: ContractFilters,
  pagination: PaginationParams
): HttpParams {
  let params = new HttpParams()
    .set('limit', pagination.limit)
    .set('offset', pagination.offset);
  if (filters.hotelId) params = params.set('hotelId', filters.hotelId);
  if (filters.marketId) params = params.set('marketId', filters.marketId);
  return params;
}
```

### 5. Routing — `app.routes.ts` directement (pas `management.routes.ts`)

Les contrats sont une **feature métier**, pas un référentiel. Ils ne vont pas dans
`management.routes.ts`. Ils sont routés directement depuis `app.routes.ts` avec leur propre
fichier `contracts.routes.ts`, au même niveau que booking/offers.

```typescript
// app.routes.ts
{
  path: 'contracts',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['ADMIN', 'MANAGER'] },
  loadChildren: () =>
    import('./features/contracts/contracts.routes').then(m => m.CONTRACTS_ROUTES),
}
```

### 6. Sidebar — entrée Contracts

```typescript
// core/shell/sidebar/sidebar.component.ts — ajouter dans navItems
{
  label: 'Contracts',
  icon: 'pi pi-file-edit',
  route: '/contracts',
  roles: ['ADMIN', 'MANAGER'],
}
```

### 7. Dialog visible — fix `model()` ⚠️ RAPPEL

Tous les `p-dialog` de ce sprint (period-form-dialog, room-price-form-dialog,
meal-supplement-form-dialog, occupancy-config-form) utilisent le fix `model()` établi en
Sprint 2/3 pour éviter le conflit entre `[(visible)]` et `input()`.

```typescript
// ✅ Dans chaque dialog component
visible = model<boolean>(false);
// Le parent passe : [(visible)]="showDialog"
```

### 8. Standards Angular — rappel des règles non-négociables

| Règle            | Valeur                                                                    |
| ---------------- | ------------------------------------------------------------------------- |
| Components       | Standalone (ne pas écrire `standalone: true`, c'est le défaut Angular 19) |
| DI               | `inject()` uniquement — pas de `constructor`                              |
| Change detection | `OnPush` systématique                                                     |
| Inputs/Outputs   | `input()` / `output()` / `model()`                                        |
| State local      | `signal()` / `computed()`                                                 |
| Subscribe        | `take(1)` obligatoire sur tous les subscribe()                            |
| Template         | `@if` / `@for` / `@switch` — pas `*ngIf` / `*ngFor`                       |
| Classes CSS      | Tailwind utilitaires — pas `ngClass` / `ngStyle`                          |
| Types            | Strict TypeScript — pas de `any`                                          |

---

## Shared Types — à créer avant tout ⚠️ NOUVEAU TICKET

> Le pattern Sprint 3 impose de créer les shared types **en premier** (avant DTOs et
> services frontend).

### S4-SHARED-001 : Types contrats dans `@runner/shared/types`

- **Type :** Task
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `chore/S4-SHARED-001-contract-types`
- **Commit :** `chore(types): add Contract, ContractPeriod, RoomPrice, MealPlanSupplement shared types`
- **Description :**
  Créer `libs/shared/types/src/lib/contract.types.ts` et exporter depuis `index.ts`.

```typescript
// libs/shared/types/src/lib/contract.types.ts

export type PricingMode = 'PER_ROOM' | 'PER_OCCUPANCY';

export interface Contract {
  id: string;
  name: string;
  hotelId: string;
  marketId: string;
  currencyId: string;
  tourOperatorId: string;
  hotel?: { id: string; name: string };
  market?: { id: string; name: string };
  currency?: { id: string; code: string; symbol: string };
  periods?: ContractPeriod[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractDto {
  name: string;
  hotelId: string;
  marketId: string;
  currencyId: string;
}

export interface ContractPeriod {
  id: string;
  contractId: string;
  seasonId: string;
  name: string;
  startDate: string;
  endDate: string;
  baseMealPlanId: string;
  minStay?: number;
  season?: { id: string; name: string; startDate: string; endDate: string };
  baseMealPlan?: { id: string; code: string; name: string };
  roomPrices?: RoomPrice[];
  mealPlanSupplements?: MealPlanSupplement[];
  stopSalesDates?: StopSalesDate[];
}

export interface ContractPeriodDto {
  seasonId: string;
  name: string;
  startDate: string;
  endDate: string;
  baseMealPlanId: string;
  minStay?: number;
}

export interface OccupancyRate {
  id: string;
  roomPriceId: string;
  numAdults: number;
  numChildren: number;
  /** { ageCategoryId: { rate: number; order: number } } */
  ratesPerAge: Record<string, { rate: number; order: number }>;
  totalRate: number;
}

export interface RoomPrice {
  id: string;
  contractPeriodId: string;
  roomTypeId: string;
  pricingMode: PricingMode;
  pricePerNight: number | null;
  roomType?: { id: string; name: string; code: string };
  occupancyRates?: OccupancyRate[];
}

export interface RoomPriceDto {
  roomTypeId: string;
  pricingMode: PricingMode;
  pricePerNight?: number | null;
  occupancyRates?: OccupancyRateDto[];
}

export interface OccupancyRateDto {
  numAdults: number;
  numChildren: number;
  ratesPerAge: Record<string, { rate: number; order: number }>;
  totalRate: number;
}

export interface MealPlanSupplement {
  id: string;
  contractPeriodId: string;
  mealPlanId: string;
  /** { "numAdults-numChildren": price } — ex: { "1-0": 15, "2-1": 40 } */
  occupancyRates: Record<string, number>;
  mealPlan?: { id: string; code: string; name: string };
}

export interface MealPlanSupplementDto {
  mealPlanId: string;
  occupancyRates: Record<string, number>;
}

export interface StopSalesDate {
  id: string;
  contractPeriodId: string;
  date: string;
}

export interface ContractFilters {
  hotelId?: string;
  marketId?: string;
}
```

- **Acceptance Criteria :**
  - ✅ Tous les types exportés depuis `@runner/shared/types`
  - ✅ Importables sans erreur côté backend et frontend
  - ✅ `PricingMode` union type (pas d'enum — cohérence avec Sprint 3)

---

## Backend Tasks

### S4-BE-001 : Prisma — modèles Contracts + migration

- **Type :** Task
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `chore/S4-BE-001-prisma-contracts-migration`
- **Commit :** `chore(prisma): add Contract, ContractPeriod, RoomPrice, OccupancyRate, MealPlanSupplement, StopSalesDate models`
- **Description :** Ajouter tous les modèles au schéma Prisma et lancer la migration.

```prisma
model Contract {
  id             String           @id @default(cuid())
  name           String
  hotelId        String
  marketId       String
  currencyId     String
  tourOperatorId String
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  hotel          Hotel            @relation(fields: [hotelId], references: [id])
  market         Market           @relation(fields: [marketId], references: [id])
  currency       Currency         @relation(fields: [currencyId], references: [id])
  periods        ContractPeriod[]

  @@index([tourOperatorId])
  @@index([hotelId])
  @@index([marketId])
}

model ContractPeriod {
  id                  String               @id @default(cuid())
  contractId          String
  seasonId            String
  name                String
  startDate           DateTime
  endDate             DateTime
  baseMealPlanId      String
  minStay             Int?
  contract            Contract             @relation(fields: [contractId], references: [id], onDelete: Cascade)
  season              Season               @relation(fields: [seasonId], references: [id])
  baseMealPlan        MealPlan             @relation(fields: [baseMealPlanId], references: [id])
  roomPrices          RoomPrice[]
  mealPlanSupplements MealPlanSupplement[]
  stopSalesDates      StopSalesDate[]

  @@index([contractId])
}

model RoomPrice {
  id               String         @id @default(cuid())
  contractPeriodId String
  roomTypeId       String
  pricingMode      PricingMode
  pricePerNight    Decimal?
  contractPeriod   ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  roomType         RoomType       @relation(fields: [roomTypeId], references: [id])
  occupancyRates   OccupancyRate[]

  @@unique([contractPeriodId, roomTypeId])
  @@index([contractPeriodId])
}

model OccupancyRate {
  id           String    @id @default(cuid())
  roomPriceId  String
  numAdults    Int
  numChildren  Int
  ratesPerAge  Json      // { ageCategoryId: { rate: number, order: number } }
  totalRate    Decimal
  roomPrice    RoomPrice @relation(fields: [roomPriceId], references: [id], onDelete: Cascade)

  @@unique([roomPriceId, numAdults, numChildren])
  @@index([roomPriceId])
}

model MealPlanSupplement {
  id               String         @id @default(cuid())
  contractPeriodId String
  mealPlanId       String
  occupancyRates   Json           // { "numAdults-numChildren": price }
  contractPeriod   ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  mealPlan         MealPlan       @relation(fields: [mealPlanId], references: [id])

  @@unique([contractPeriodId, mealPlanId])
  @@index([contractPeriodId])
}

model StopSalesDate {
  id               String         @id @default(cuid())
  contractPeriodId String
  date             DateTime
  contractPeriod   ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)

  @@unique([contractPeriodId, date])
  @@index([contractPeriodId])
}

enum PricingMode {
  PER_ROOM
  PER_OCCUPANCY
}
```

> **Note :** Vérifier que les modèles `Hotel`, `Market`, `MealPlan`, `Season`, `RoomType`
> référencent bien `ContractPeriod` / `RoomPrice` / `MealPlanSupplement` dans leurs
> relations inverses — ceci active les erreurs Prisma `P2003 → HAS_CONTRACTS` sur les
> suppressions côté référentiels (cf. note Sprint 3).

- **Acceptance Criteria :**
  - ✅ Migration appliquée sans erreur
  - ✅ Toutes les tables créées dans PostgreSQL
  - ✅ `@@unique` et `@@index` en place
  - ✅ Client Prisma régénéré

---

### S4-BE-002 : ContractsModule — structure + Repository Pattern

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-002-contracts-module`
- **Commit :** `feat(contracts): create contracts module with abstract repository pattern`
- **Description :**
  Générer le module et adopter le pattern **abstract class** de Sprint 3.

```
apps/backend/src/contracts/
├── dto/
│   ├── create-contract.dto.ts
│   ├── update-contract.dto.ts
│   ├── create-contract-period.dto.ts
│   ├── update-contract-period.dto.ts
│   ├── create-room-price.dto.ts
│   ├── update-room-price.dto.ts
│   ├── create-occupancy-rate.dto.ts
│   ├── create-meal-supplement.dto.ts
│   └── update-meal-supplement.dto.ts
├── repositories/
│   ├── contract.repository.ts          ← abstract class
│   └── prisma-contract.repository.ts   ← PrismaContractRepository
├── contracts.types.ts                  ← ContractQuery, ContractDetail
├── contracts.controller.ts
├── contracts.service.ts
└── contracts.module.ts
```

- **Acceptance Criteria :**
  - ✅ Module importé dans AppModule
  - ✅ Abstract class comme DI token (pas de fichier constants)
  - ✅ Repository : data access only, pas d'exceptions HTTP
  - ✅ Service : logique métier, exceptions HTTP, tourOperatorId depuis JWT uniquement

---

### S4-BE-003 : DTOs avec validation complète

- **Type :** Task
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `chore/S4-BE-003-contracts-dto`
- **Commit :** `chore(contracts): add all DTOs with class-validator`

**CreateContractDto**

```typescript
export class CreateContractDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() hotelId: string;
  @IsString() @IsNotEmpty() marketId: string;
  @IsString() @IsNotEmpty() currencyId: string;
}
export class UpdateContractDto extends PartialType(CreateContractDto) {}
```

**CreateContractPeriodDto**

```typescript
export class CreateContractPeriodDto {
  @IsString() @IsNotEmpty() seasonId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsString() @IsNotEmpty() baseMealPlanId: string;
  @IsOptional() @IsInt() @Min(1) minStay?: number;
}
export class UpdateContractPeriodDto extends PartialType(
  CreateContractPeriodDto
) {}
```

**CreateRoomPriceDto — union PER_ROOM | PER_OCCUPANCY (PER_OCCUPANCY utilise `capacities`)**

```typescript
export class OccupancyRateDto {
  @IsInt() @Min(1) numAdults: number;
  @IsInt() @Min(0) numChildren: number;
  @IsObject() ratesPerAge: Record<string, { rate: number; order: number }>;
  @IsNumber() @Min(0) totalRate: number;
}

export class CreateRoomPriceDto {
  @IsString() @IsNotEmpty() roomTypeId: string;

  @IsEnum(PricingMode) pricingMode: PricingMode;

  // Requis si PER_ROOM, null si PER_OCCUPANCY
  @IsOptional() @IsNumber() @Min(0) pricePerNight?: number | null;

  // Requis si PER_OCCUPANCY
  @IsOptional()
  @ValidateIf((o) => o.pricingMode === 'PER_OCCUPANCY')
  @ValidateNested({ each: true })
  @Type(() => OccupancyRateDto)
  occupancyRates?: OccupancyRateDto[];
}
```

**CreateMealSupplementDto**

```typescript
export class CreateMealSupplementDto {
  @IsString() @IsNotEmpty() mealPlanId: string;
  // { "1-0": 15, "2-0": 30 } — clé = "numAdults-numChildren"
  @IsObject() occupancyRates: Record<string, number>;
}
export class UpdateMealSupplementDto extends PartialType(
  CreateMealSupplementDto
) {}
```

- **Acceptance Criteria :**
  - ✅ Tous les DTOs créés et validés via class-validator
  - ✅ `PATCH` utilise `PartialType` sur tous les update DTOs
  - ✅ Validation DTO retourne HTTP 400 si payload invalide

---

### S4-BE-004 : Endpoints Contracts CRUD

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-004-contracts-crud`
- **Commit :** `feat(contracts): implement contracts CRUD endpoints`
- **Endpoints :**

```
GET    /contracts              — liste paginée + filtres hotelId, marketId
GET    /contracts/:id          — détail complet (hotel, market, currency, periods)
POST   /contracts              — création (201)
PATCH  /contracts/:id          — mise à jour partielle  ⚠️ PATCH, pas PUT
DELETE /contracts/:id          — (204) — bloqué si bookings liés
```

- **Multi-tenancy :** `tourOperatorId` depuis JWT, jamais du body
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ HTTP 401/403/404 retournés correctement
  - ✅ Suppression bloquée si bookings liés (`ConflictException`)

---

### S4-BE-005 : Endpoints ContractPeriod

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S4-BE-005-contract-periods`
- **Commit :** `feat(contracts): implement contract periods CRUD with season link`
- **Endpoints :**

```
POST   /contracts/:id/periods
PATCH  /contracts/:id/periods/:periodId    ⚠️ PATCH
DELETE /contracts/:id/periods/:periodId    (204)
```

- **Logique Season :** si `seasonId` fourni, pré-remplir `startDate`/`endDate` depuis la
  Season (le frontend peut écraser si besoin)
- **Validation chevauchement :** vérifier que les dates ne chevauchent pas les autres
  périodes du même contrat

---

### S4-BE-006 : Endpoints RoomPrice — PER_ROOM

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-006-room-price-per-room`
- **Commit :** `feat(contracts): implement room prices PER_ROOM mode`
- **Endpoints :**

```
POST   /contracts/:id/periods/:periodId/room-prices
PATCH  /room-prices/:id                              ⚠️ PATCH
DELETE /room-prices/:id                              (204)
```

- **Validation PER_ROOM :** `pricePerNight` requis et `> 0`, `occupancyRates` vide

---

### S4-BE-007 : Endpoints RoomPrice — PER_OCCUPANCY

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S4-BE-007-room-price-per-occupancy`
- **Commit :** `feat(contracts): implement PER_OCCUPANCY pricing with capacity validation`

**Validation capacité — utiliser `RoomTypeCapacity` (pas maxAdults/maxChildren)**

```typescript
// contracts.service.ts — validation PER_OCCUPANCY
async validateOccupancyAgainstCapacity(
  roomTypeId: string,
  numAdults: number,
  numChildren: number,
): Promise<void> {
  const roomType = await this.prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: {
      capacities: { include: { ageCategory: true } },
    },
  });
  if (!roomType) throw new NotFoundException('RoomType not found');

  // Calculer la capacité max par type d'âge
  // (chaque RoomTypeCapacity.maxPax = nb max de pax pour cette ageCategory)
  // Logique métier : la somme numAdults + numChildren ≤ somme des maxPax
  const totalMaxPax = roomType.capacities.reduce(
    (sum, c) => sum + c.maxPax, 0
  );
  if (numAdults + numChildren > totalMaxPax) {
    throw new BadRequestException(
      `Occupancy (${numAdults}A + ${numChildren}C) exceeds room capacity (${totalMaxPax} pax)`
    );
  }
}
```

- **Payload exemple :**

```json
{
  "roomTypeId": "cuid...",
  "pricingMode": "PER_OCCUPANCY",
  "occupancyRates": [
    {
      "numAdults": 2,
      "numChildren": 0,
      "ratesPerAge": {
        "adult_cat_id_1": { "rate": 90, "order": 1 },
        "adult_cat_id_2": { "rate": 90, "order": 2 }
      },
      "totalRate": 180
    }
  ]
}
```

- **Acceptance Criteria :**
  - ✅ `OccupancyRate` créés avec `RoomPrice`
  - ✅ `totalRate` calculé et vérifié (somme des `rates`)
  - ✅ Validation capacité via `capacities[]` (pas `maxAdults`/`maxChildren`)
  - ✅ `@@unique([roomPriceId, numAdults, numChildren])` respectée

---

### S4-BE-008 : Endpoints MealPlanSupplement

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S4-BE-008-meal-supplements`
- **Commit :** `feat(contracts): implement meal plan supplements`
- **Endpoints :**

```
POST   /contracts/:id/periods/:periodId/meal-supplements
PATCH  /meal-supplements/:id                              ⚠️ PATCH
DELETE /meal-supplements/:id                              (204)
```

- **Structure `occupancyRates` :** clé `"numAdults-numChildren"`, valeur = prix positif

---

### S4-BE-009 : Endpoints StopSalesDate

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feature/S4-BE-009-stop-sales`
- **Commit :** `feat(contracts): implement stop sales dates management`
- **Endpoints :**

```
POST   /contracts/:id/periods/:periodId/stop-sales
DELETE /stop-sales/:id    (204)
```

- **Validation :** la date doit être comprise entre `startDate` et `endDate` de la période

---

### S4-BE-010 : Tests unitaires ContractsService

- **Type :** Test
- **Priority :** P1
- **Story Points :** 4
- **Branch :** `test/S4-BE-010-contracts-tests`
- **Commit :** `test(contracts): add unit tests for contracts service`
- **Scénarios à couvrir :**
  - Création contrat avec vérification hotelId/marketId/currencyId
  - Validation chevauchement de périodes
  - Création RoomPrice PER_ROOM (prix requis)
  - Création RoomPrice PER_OCCUPANCY avec validation capacité via `capacities[]`
  - Calcul et vérification de `totalRate`
  - StopSalesDate hors période → erreur attendue
  - Mock `PrismaService`
- **Note :** Premier sprint avec tests — les Sprints 0–3 n'en ont pas. Ne pas backfiller,
  appliquer la règle **Sprint 4 onwards**.
- **Acceptance Criteria :**
  - ✅ Coverage > 80% sur `contracts.service.ts`
  - ✅ Tous les tests passent : `nx test backend`

---

## Frontend Tasks

### S4-FE-001 : Créer ContractsService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-001-contracts-service`
- **Commit :** `feat(contracts): create contracts service with BehaviorSubject`

```typescript
// features/contracts/services/contracts.service.ts
@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly http = inject(HttpClient);

  private readonly _contracts$ = new BehaviorSubject<Contract[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private _loaded = false;

  readonly contracts$ = this._contracts$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  // Filtres courants — signals locaux dans le composant list, pas ici
  load(
    filters: ContractFilters = {},
    pagination: PaginationParams = { limit: 20, offset: 0 }
  ): void {
    if (this._loaded) return;
    this._loading$.next(true);
    const params = buildContractParams(filters, pagination);
    this.http
      .get<PaginatedResult<Contract>>('/api/contracts', { params })
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this._contracts$.next(result.data);
          this._loaded = true;
          this._loading$.next(false);
        },
        error: () => this._loading$.next(false),
      });
  }

  // Force reload (après create/update/delete)
  reload(filters?: ContractFilters): void {
    this._loaded = false;
    this.load(filters);
  }

  getById(id: string): Observable<Contract> {
    return this.http.get<Contract>(`/api/contracts/${id}`);
  }

  create(dto: ContractDto): Observable<Contract> {
    return this.http.post<Contract>('/api/contracts', dto);
  }

  update(id: string, dto: Partial<ContractDto>): Observable<Contract> {
    return this.http.patch<Contract>(`/api/contracts/${id}`, dto); // ⚠️ PATCH
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/contracts/${id}`);
  }

  // --- Periods ---
  createPeriod(
    contractId: string,
    dto: ContractPeriodDto
  ): Observable<ContractPeriod> {
    return this.http.post<ContractPeriod>(
      `/api/contracts/${contractId}/periods`,
      dto
    );
  }

  updatePeriod(
    contractId: string,
    periodId: string,
    dto: Partial<ContractPeriodDto>
  ): Observable<ContractPeriod> {
    return this.http.patch<ContractPeriod>(
      `/api/contracts/${contractId}/periods/${periodId}`,
      dto
    );
  }

  deletePeriod(contractId: string, periodId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/contracts/${contractId}/periods/${periodId}`
    );
  }

  // --- RoomPrices ---
  createRoomPrice(
    contractId: string,
    periodId: string,
    dto: RoomPriceDto
  ): Observable<RoomPrice> {
    return this.http.post<RoomPrice>(
      `/api/contracts/${contractId}/periods/${periodId}/room-prices`,
      dto
    );
  }

  updateRoomPrice(
    id: string,
    dto: Partial<RoomPriceDto>
  ): Observable<RoomPrice> {
    return this.http.patch<RoomPrice>(`/api/room-prices/${id}`, dto);
  }

  deleteRoomPrice(id: string): Observable<void> {
    return this.http.delete<void>(`/api/room-prices/${id}`);
  }

  // --- MealSupplements ---
  createMealSupplement(
    contractId: string,
    periodId: string,
    dto: MealPlanSupplementDto
  ): Observable<MealPlanSupplement> {
    return this.http.post<MealPlanSupplement>(
      `/api/contracts/${contractId}/periods/${periodId}/meal-supplements`,
      dto
    );
  }

  updateMealSupplement(
    id: string,
    dto: Partial<MealPlanSupplementDto>
  ): Observable<MealPlanSupplement> {
    return this.http.patch<MealPlanSupplement>(
      `/api/meal-supplements/${id}`,
      dto
    );
  }

  deleteMealSupplement(id: string): Observable<void> {
    return this.http.delete<void>(`/api/meal-supplements/${id}`);
  }

  // --- StopSales ---
  createStopSale(
    contractId: string,
    periodId: string,
    date: string
  ): Observable<StopSalesDate> {
    return this.http.post<StopSalesDate>(
      `/api/contracts/${contractId}/periods/${periodId}/stop-sales`,
      { date }
    );
  }

  deleteStopSale(id: string): Observable<void> {
    return this.http.delete<void>(`/api/stop-sales/${id}`);
  }
}
```

- **Acceptance Criteria :**
  - ✅ BehaviorSubject + `loaded` flag (pattern HotelsService de Sprint 3)
  - ✅ `buildContractParams` utilisé (pas `buildPaginationParams`)
  - ✅ `PATCH` sur `update`, `updatePeriod`, `updateRoomPrice`, `updateMealSupplement`
  - ✅ `take(1)` sur le `subscribe()` interne à `load()`
  - ✅ Méthodes période/room-price/meal-supplement retournent des `Observable` (pas de subscribe interne — c'est le composant qui subscribes avec `take(1)`)

---

### S4-FE-002 : ContractsList Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-002-contracts-list`
- **Commit :** `feat(contracts): create contracts list with filters`
- **Description :**
  - `p-table` : colonnes Name, Hotel, Market, Currency, Nb périodes, Actions
  - Filtres Hotel + Market via `p-select` — signaux locaux `hotelFilter`, `marketFilter`
  - Au changement de filtre : `contractsService.reload({ hotelId, marketId })`
  - Boutons : Créer (→ `/contracts/new`), Éditer (→ `/contracts/:id/edit`), Supprimer
  - Supprimer avec `p-confirmdialog` (pattern Sprint 3)
  - `p-toast` succès/erreur

```typescript
@Component({ ..., changeDetection: ChangeDetectionStrategy.OnPush })
export class ContractsListComponent {
  private readonly contractsService = inject(ContractsService);
  private readonly hotelsService    = inject(HotelsService);
  private readonly marketsService   = inject(MarketsService);
  private readonly router           = inject(Router);

  contracts = toSignal(this.contractsService.contracts$, { initialValue: [] });
  loading   = toSignal(this.contractsService.loading$,   { initialValue: false });

  hotelFilter  = signal<string | null>(null);
  marketFilter = signal<string | null>(null);

  ngOnInit(): void {
    this.contractsService.load();
  }

  onFilterChange(): void {
    this.contractsService.reload({
      hotelId:  this.hotelFilter()  ?? undefined,
      marketId: this.marketFilter() ?? undefined,
    });
  }
}
```

---

### S4-FE-003 : ContractForm — Étape 1 (infos de base)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-003-contract-form-step1`
- **Commit :** `feat(contracts): create contract form wizard with step 1`
- **Description :**
  - Wizard `p-stepper` — 5 étapes numérotées (pas de labels confus)
  - Étape 1 : Name (`p-inputtext`), Hotel (`p-select`), Market (`p-select`), Currency (`p-select`)
  - Reactive Form avec `Validators.required` sur les 4 champs
  - Bouton **Next** désactivé si étape invalide

```typescript
// Structure du wizard — signal pour l'étape active
activeStep = signal<number>(0);

// Chaque étape est un FormGroup indépendant
step1Form = this.fb.group({
  name: ['', Validators.required],
  hotelId: ['', Validators.required],
  marketId: ['', Validators.required],
  currencyId: ['', Validators.required],
});
```

---

### S4-FE-004 : ContractForm — Étape 2 (Periods)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S4-FE-004-contract-form-step2`
- **Commit :** `feat(contracts): add periods management in contract form`
- **Description :**
  - `p-table` : liste des périodes configurées
  - `p-dialog` (fix `model()`) pour ajouter/éditer une période :
    - Name (`p-inputtext`)
    - Season (`p-select`) → auto-fill `startDate`/`endDate` via `effect()` ou `valueChanges`
    - Base Meal Plan (`p-select`)
    - minStay (`p-inputnumber`, optionnel)
  - Validation chevauchement côté frontend (date-fns) avant d'ajouter à la liste locale
  - Les périodes sont stockées dans un `signal<ContractPeriod[]>` — elles ne sont **pas**
    envoyées au backend à cette étape (tout est soumis en step 5)

**Auto-fill depuis Season :**

```typescript
// Dans PeriodFormDialogComponent
seasonId = signal<string | null>(null);
seasons  = toSignal(this.seasonsService.seasons$, { initialValue: [] });

selectedSeason = computed(() =>
  this.seasons().find(s => s.id === this.seasonId())
);

// Utiliser effect() pour mettre à jour le formulaire quand la season change
constructor() {
  effect(() => {
    const season = this.selectedSeason();
    if (season) {
      this.periodForm.patchValue({
        startDate: season.startDate,
        endDate:   season.endDate,
      });
    }
  });
}
```

**Validation chevauchement (date-fns) :**

```typescript
import { areIntervalsOverlapping, parseISO } from 'date-fns';

function hasOverlap(
  periods: ContractPeriod[],
  newPeriod: { startDate: string; endDate: string }
): boolean {
  return periods.some((p) =>
    areIntervalsOverlapping(
      { start: parseISO(p.startDate), end: parseISO(p.endDate) },
      {
        start: parseISO(newPeriod.startDate),
        end: parseISO(newPeriod.endDate),
      },
      { inclusive: false }
    )
  );
}
```

---

### S4-FE-005 : ContractForm — Étape 3 (Room Prices PER_ROOM)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-005-contract-form-step3-per-room`
- **Commit :** `feat(contracts): add room prices PER_ROOM mode in contract form`
- **Description :**
  - Sélectionner Room Type (`p-select`) et la période associée
  - Pricing Mode : `p-radiobutton` → `PER_ROOM` / `PER_OCCUPANCY`
  - Si `PER_ROOM` : afficher `pricePerNight` (`p-inputnumber`, min=0)
  - `p-table` des prix configurés pour la période sélectionnée
  - `p-dialog` (fix `model()`) pour ajout/édition

---

### S4-FE-006 : ContractForm — Étape 3 (Room Prices PER_OCCUPANCY)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S4-FE-006-contract-form-step3-per-occupancy`
- **Commit :** `feat(contracts): add room prices PER_OCCUPANCY mode with capacity validation`

**Validation capacité — utiliser `capacities[]` du RoomType (pas maxAdults/maxChildren)**

```typescript
// OccupancyConfigFormComponent
selectedRoomType = input.required<RoomType>();

// RoomType.capacities = RoomTypeCapacity[] = [{ ageCategoryId, maxPax, ageCategory }]
// Calculer le total max pax depuis les capacités
maxPax = computed(() =>
  this.selectedRoomType().capacities.reduce((sum, c) => sum + c.maxPax, 0)
);

isOccupancyValid = computed(() => {
  const total = this.numAdults() + this.numChildren();
  return total > 0 && total <= this.maxPax();
});
```

**Calcul auto du `totalRate` :**

```typescript
totalRate = computed(() =>
  Object.values(this.ratesPerAge()).reduce((sum, r) => sum + r.rate, 0)
);
```

**Affichage (ASCII → UI) :**

```
┌─────────────────────────────────────────────────┐
│ Mode : ○ PER_ROOM  ● PER_OCCUPANCY              │
│                                                 │
│ [+ Add Configuration]                           │
│                                                 │
│ Single (1 adulte, 0 enfant)                     │
│   1er adulte (agecat "Adulte") : [120] €         │
│   TOTAL : 120 €/nuit                            │
├─────────────────────────────────────────────────┤
│ Double (2 adultes, 0 enfant)                    │
│   1er adulte : [90] €                           │
│   2ème adulte : [90] €                          │
│   TOTAL : 180 €/nuit                            │
└─────────────────────────────────────────────────┘
```

- **Acceptance Criteria :**
  - ✅ Validation capacité via `roomType.capacities[]`
  - ✅ `totalRate` calculé automatiquement depuis `ratesPerAge`
  - ✅ `p-dialog` avec fix `model()`
  - ✅ Chaque ligne affiche le nom de l'`AgeCategory` (pas juste l'id)

---

### S4-FE-007 : ContractForm — Étape 4 (Meal Supplements)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S4-FE-007-contract-form-step4`
- **Commit :** `feat(contracts): add meal plan supplements in contract form`
- **Description :**
  - Liste des meal plans **hors base** pour la période sélectionnée
  - `p-dialog` (fix `model()`) : Meal Plan (`p-select`) + tableau Occupancy Rates
  - Tableau : colonne "Config" (ex: `2 adultes, 1 enfant`) + colonne Prix (`p-inputnumber`)
  - Clé JSON générée automatiquement : `"${numAdults}-${numChildren}"`

```typescript
// Générer la clé pour occupancyRates
buildOccupancyKey(numAdults: number, numChildren: number): string {
  return `${numAdults}-${numChildren}`;
}
```

---

### S4-FE-008 : ContractForm — Étape 5 (Stop Sales)

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feature/S4-FE-008-contract-form-step5`
- **Commit :** `feat(contracts): add stop sales dates management`
- **Description :**
  - `p-datepicker` avec `selectionMode="multiple"`
  - Désactiver les dates hors période via `minDate`/`maxDate`
  - Liste des dates sélectionnées affichée sous le calendrier

```typescript
stopSalesDates = signal<Date[]>([]);

// Calcul des limites depuis la période courante
periodRange = computed(() => ({
  minDate: new Date(this.currentPeriod()?.startDate ?? ''),
  maxDate: new Date(this.currentPeriod()?.endDate ?? ''),
}));
```

---

### S4-FE-009 : ContractForm — Récapitulatif + Submit

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-009-contract-submit`
- **Commit :** `feat(contracts): add contract recap and submit logic`
- **Description :**
  - Dernière vue du wizard : récapitulatif de toutes les étapes
  - Bouton **Create Contract** → séquence de création backend
  - `p-progressbar` durant la création
  - `p-toast` succès → redirection `/contracts`
  - `p-toast` erreur → rester sur le wizard

**Séquence de soumission :**

```typescript
async submit(): Promise<void> {
  this.submitting.set(true);
  try {
    // 1. Créer le contract
    const contract = await firstValueFrom(
      this.contractsService.create(this.step1Form.value as ContractDto)
    );

    // 2. Créer chaque période
    for (const period of this.periods()) {
      const createdPeriod = await firstValueFrom(
        this.contractsService.createPeriod(contract.id, period)
      );

      // 3. Créer les room prices de la période
      for (const rp of this.roomPricesByPeriod()[period.tempId]) {
        await firstValueFrom(
          this.contractsService.createRoomPrice(contract.id, createdPeriod.id, rp)
        );
      }

      // 4. Créer les meal supplements
      for (const ms of this.mealSupplementsByPeriod()[period.tempId]) {
        await firstValueFrom(
          this.contractsService.createMealSupplement(contract.id, createdPeriod.id, ms)
        );
      }

      // 5. Créer les stop sales
      for (const date of this.stopSalesByPeriod()[period.tempId]) {
        await firstValueFrom(
          this.contractsService.createStopSale(contract.id, createdPeriod.id, date)
        );
      }
    }

    this.contractsService.reload();
    this.router.navigate(['/contracts']);
    this.messageService.add({ severity: 'success', summary: 'Contract created' });
  } catch {
    this.messageService.add({ severity: 'error', summary: 'Error creating contract' });
  } finally {
    this.submitting.set(false);
  }
}
```

> **Note architecture :** La séquence est intentionnellement séquentielle (`await` dans
> `for...of`) pour garder le code lisible et débuggable. Une optimisation avec `forkJoin`
> est possible en Sprint 8 si les performances l'exigent.

---

### S4-FE-010 : Routes Contracts + Sidebar

- **Type :** Task
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `chore/S4-FE-010-contracts-routes`
- **Commit :** `chore(routing): add contracts routes and sidebar entry`

**`features/contracts/contracts.routes.ts` (nouveau fichier)**

```typescript
// apps/frontend/src/app/features/contracts/contracts.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const CONTRACTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./components/contracts-list/contracts-list.component').then(
        (m) => m.ContractsListComponent
      ),
  },
  {
    path: 'new',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./components/contract-form/contract-form.component').then(
        (m) => m.ContractFormComponent
      ),
  },
  {
    path: ':id/edit',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./components/contract-form/contract-form.component').then(
        (m) => m.ContractFormComponent
      ),
  },
];
```

**`app.routes.ts` — ajouter (dans la zone protégée, pas dans management)**

```typescript
// apps/frontend/src/app/app.routes.ts
{
  path: 'contracts',
  loadChildren: () =>
    import('./features/contracts/contracts.routes').then(m => m.CONTRACTS_ROUTES),
},
// NE PAS mettre dans management.routes.ts
```

**`sidebar.component.ts` — ajouter dans `navItems`**

```typescript
{
  label: 'Contracts',
  icon: 'pi pi-file-edit',
  route: '/contracts',
  roles: ['ADMIN', 'MANAGER'],
},
```

- **Acceptance Criteria :**
  - ✅ `/contracts` accessible avec rôles ADMIN et MANAGER
  - ✅ Redirect vers `/login` si non authentifié (AuthGuard)
  - ✅ HTTP 403 si rôle AGENT (RoleGuard)
  - ✅ Contracts **n'est pas** sous `management.routes.ts`
  - ✅ Sidebar affiche "Contracts" pour ADMIN et MANAGER, pas pour AGENT

---

## Structure des fichiers — Sprint 4

### Backend

```
apps/backend/src/contracts/
├── dto/
│   ├── create-contract.dto.ts
│   ├── update-contract.dto.ts
│   ├── create-contract-period.dto.ts
│   ├── update-contract-period.dto.ts
│   ├── create-room-price.dto.ts
│   ├── update-room-price.dto.ts
│   ├── create-occupancy-rate.dto.ts
│   ├── create-meal-supplement.dto.ts
│   └── update-meal-supplement.dto.ts
├── repositories/
│   ├── contract.repository.ts            ← abstract class (DI token)
│   └── prisma-contract.repository.ts
├── contracts.types.ts                    ← ContractQuery, ContractDetail
├── contracts.controller.ts
├── contracts.service.ts
├── contracts.service.spec.ts             ← tests unitaires (nouveau)
└── contracts.module.ts
```

### Frontend

```
apps/frontend/src/app/
├── features/
│   └── contracts/                        ← feature indépendante (pas sous management/)
│       ├── components/
│       │   ├── contracts-list/
│       │   │   ├── contracts-list.component.ts
│       │   │   ├── contracts-list.component.html
│       │   │   └── contracts-list.component.scss
│       │   ├── contract-form/            ← wizard p-stepper
│       │   │   ├── contract-form.component.ts
│       │   │   ├── contract-form.component.html
│       │   │   └── contract-form.component.scss
│       │   ├── period-form-dialog/
│       │   │   ├── period-form-dialog.component.ts
│       │   │   └── period-form-dialog.component.html
│       │   ├── room-price-form-dialog/
│       │   │   ├── room-price-form-dialog.component.ts
│       │   │   └── room-price-form-dialog.component.html
│       │   ├── occupancy-config-form/
│       │   │   ├── occupancy-config-form.component.ts
│       │   │   └── occupancy-config-form.component.html
│       │   └── meal-supplement-form-dialog/
│       │       ├── meal-supplement-form-dialog.component.ts
│       │       └── meal-supplement-form-dialog.component.html
│       ├── services/
│       │   └── contracts.service.ts
│       └── contracts.routes.ts
└── shared/
    └── utils/
        └── contract-params.util.ts       ← buildContractParams() (nouveau)
```

### Shared Types

```
libs/shared/types/src/lib/
├── types.ts                 — Hotel, AgeCategory, RoomType + RoomTypeCapacity, Season (Sprint 2)
├── meal-plan.types.ts       — MealPlan (Sprint 3)
├── market.types.ts          — Market (Sprint 3)
├── currency.types.ts        — Currency (Sprint 3)
├── supplement.types.ts      — Supplement (Sprint 3)
└── contract.types.ts        — Contract, ContractPeriod, RoomPrice, ... (Sprint 4 ← nouveau)
```

---

## Definition of Done — Sprint 4

### Backend

- ✅ Migration Prisma appliquée (Contract, ContractPeriod, RoomPrice, OccupancyRate, MealPlanSupplement, StopSalesDate)
- ✅ Repository Pattern **abstract class** (aligné Sprint 3)
- ✅ `tourOperatorId` depuis JWT uniquement
- ✅ `PATCH` sur tous les endpoints update (aligné Sprint 3)
- ✅ CRUD Contracts complet
- ✅ ContractPeriod avec lien Season obligatoire + auto-fill dates
- ✅ RoomPrice PER_ROOM fonctionnel
- ✅ RoomPrice PER_OCCUPANCY avec validation capacité via `capacities[]` (pas `maxAdults`/`maxChildren`)
- ✅ `totalRate` calculé et vérifié
- ✅ MealPlanSupplement avec `occupancyRates` JSON
- ✅ StopSalesDate avec validation date dans période
- ✅ DTOs complets avec class-validator
- ✅ Tests unitaires > 80% coverage

### Frontend

- ✅ Shared types `contract.types.ts` créés et exportés
- ✅ `buildContractParams()` dans `shared/utils`
- ✅ `ContractsService` BehaviorSubject + `loaded` flag (pattern HotelsService Sprint 3)
- ✅ Liste contrats avec filtres hotelId/marketId
- ✅ Wizard 5 étapes `p-stepper`
- ✅ PER_ROOM implémenté
- ✅ PER_OCCUPANCY avec validation via `roomType.capacities[]`
- ✅ Meal supplements avec occupancy rates
- ✅ Stop sales avec `p-datepicker` + validation dates dans période
- ✅ Récapitulatif + submit séquentiel avec gestion d'erreur
- ✅ Routes dans `contracts.routes.ts` + référencé dans `app.routes.ts` (pas `management.routes.ts`)
- ✅ Sidebar mise à jour
- ✅ `take(1)` sur tous les subscribe()
- ✅ `OnPush` sur tous les composants
- ✅ Pas de `any`

### Intégration

- ✅ Création contrat end-to-end depuis le wizard
- ✅ Toutes les relations créées côté backend dans la bonne séquence
- ✅ Validation frontend + backend cohérentes

---

## Ordre d'exécution recommandé

```
S4-SHARED-001  (shared types)              ← débloquer backend ET frontend
S4-BE-001      (migration Prisma)          ← débloquer tous les endpoints

Backend :
  S4-BE-002  (module + repository)
  S4-BE-003  (DTOs)
  S4-BE-004  (contracts CRUD)
  S4-BE-005  (periods)
  S4-BE-006  (room prices PER_ROOM)
  S4-BE-007  (room prices PER_OCCUPANCY)
  S4-BE-008  (meal supplements)
  S4-BE-009  (stop sales)
  S4-BE-010  (tests)

Frontend :
  S4-FE-010  (routes + sidebar)            ← navigation dispo dès le début
  S4-FE-001  (ContractsService)
  S4-FE-002  (ContractsList)
  S4-FE-003  (step 1 — base info)
  S4-FE-004  (step 2 — periods)
  S4-FE-005  (step 3 — PER_ROOM)
  S4-FE-006  (step 3 — PER_OCCUPANCY)     ← le plus risqué, à prendre tôt
  S4-FE-007  (step 4 — meal supplements)
  S4-FE-008  (step 5 — stop sales)
  S4-FE-009  (recap + submit)
```

---

## Risques

| Risque                                 | Mitigation                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| PER_OCCUPANCY UI complexe              | Maquetter le tableau avant de coder. Faire S4-FE-006 avant S4-FE-007.                   |
| Validation capacité via `capacities[]` | Charger `roomType.capacities` avec l'include complet dès S4-BE-007                      |
| Submit séquentiel long                 | `p-progressbar` + message clair. Optimisation `forkJoin` en Sprint 8 si besoin          |
| Chevauchement périodes                 | date-fns `areIntervalsOverlapping` — tester avec des cas limites (dates adjacentes)     |
| Contrats sans bookings → delete ok     | Vérifier relation `Contract → Booking` dès S4-BE-001 pour que `P2003` fire correctement |

---

## Dépendances

- Sprint 2 terminé (Hotels + RoomTypeCapacity + Seasons) ✅
- Sprint 3 terminé (MealPlans, Markets, Currencies, Supplements) ✅

---

## Notes pour Sprint 5 (Offers)

- `ContractPeriod` et `RoomPrice` seront lus par le moteur de pricing (Sprint 7)
- Sprint 5 utilisera `ContractPeriod.id` pour lier les offres
- Maintenir l'abstract class repository pattern introduit en Sprint 3
