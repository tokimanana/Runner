# Sprint 4 — Contracts (Tarification Complexe)

> **Document final** — modèle architectural validé après session de design.
>
> **Décision centrale :**
>
> - `Season` = conteneur organisationnel pur (nom uniquement)
> - `SeasonPeriod` = template de référence (dates suggérées)
> - `ContractPeriod` = source de vérité contractuelle (dates propres éditables + `seasonPeriodId` pour classification/reporting)
>
> Ce modèle est flexible : l'agent sélectionne une `SeasonPeriod` qui pré-remplit
> les dates, puis les ajuste librement selon la négociation avec l'hôtel.
> `seasonPeriodId` reste pour le reporting et la classification — pas comme contrainte.

---

## ⚡ Décision architecturale — modèle final

### Les trois niveaux

```
Season { id, name, tourOperatorId }
  └── SeasonPeriod { id, seasonId, name, startDate, endDate }
                         ↓ pré-remplit (suggestion)
ContractPeriod { id, contractId, seasonPeriodId, startDate, endDate, baseMealPlanId, minStay }
                                  ↑ classification     ↑ source de vérité contractuelle
```

### Pourquoi ce modèle

| Besoin                         | Réponse du modèle                          |
| ------------------------------ | ------------------------------------------ |
| Dates partagées entre hôtels   | SeasonPeriod comme template                |
| Dates négociées par hôtel      | ContractPeriod avec dates propres          |
| Reporting par saison           | `seasonPeriodId` sur ContractPeriod        |
| Flexibilité future             | `seasonPeriodId` optionnel                 |
| Pricing nuit par nuit Sprint 7 | `ContractPeriod.startDate/endDate` directs |

### Ce qui change vs Sprint 4 original

| Élément                            | Original         | Final                                   |
| ---------------------------------- | ---------------- | --------------------------------------- |
| `Season.startDate/endDate`         | ✅ présents      | ❌ supprimés                            |
| `SeasonPeriod`                     | ❌ inexistant    | ✅ nouveau modèle                       |
| `ContractPeriod.startDate/endDate` | ✅ présents      | ✅ conservés                            |
| `ContractPeriod.seasonId`          | référence Season | `seasonPeriodId` référence SeasonPeriod |
| Immutabilité SeasonPeriod          | —                | ❌ pas nécessaire (dates indépendantes) |
| Auto-fill dates                    | depuis Season    | depuis SeasonPeriod                     |

---

## 🎯 Objectif Sprint

Créer le système de contrats avec périodes tarifaires flexibles,
tarification PER_OCCUPANCY, et meal plan supplements.

**Durée estimée :** 6-7 jours
**Story Points :** 60 points

---

## ⚡ Décisions d'architecture

### 1. Repository Pattern — abstract class

```typescript
// ✅ Pattern Sprint 3/4
export abstract class ContractRepository {
  abstract findAll(query: ContractQuery): Promise<PaginatedResult<Contract>>;
}
providers: [
  { provide: ContractRepository, useClass: PrismaContractRepository },
  ContractsService,
];
```

### 2. PATCH sur tous les endpoints de mise à jour

```typescript
@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateContractDto) {}
```

### 3. RoomTypeCapacity remplace maxAdults / maxChildren

```typescript
const totalMaxPax = roomType.capacities.reduce((sum, c) => sum + c.maxPax, 0);
if (numAdults + numChildren > totalMaxPax) {
  throw new BadRequestException(`Occupancy exceeds room capacity`);
}
```

### 4. `seasonPeriodId` est optionnel sur ContractPeriod

Un contrat peut exister sans référence à une SeasonPeriod —
notamment pour des périodes spéciales non planifiées.

```typescript
// ✅ seasonPeriodId optionnel
seasonPeriodId String?
```

### 5. Standards Angular — règles non-négociables

| Règle            | Valeur                             |
| ---------------- | ---------------------------------- |
| Components       | Standalone (défaut Angular 19)     |
| DI               | `inject()` uniquement              |
| Change detection | `OnPush` systématique              |
| Inputs/Outputs   | `input()` / `output()` / `model()` |
| State local      | `signal()` / `computed()`          |
| Subscribe        | `take(1)` obligatoire              |
| Template         | `@if` / `@for` / `@switch`         |
| Classes CSS      | Tailwind utilitaires               |
| Types            | Strict TypeScript — pas de `any`   |

---

## Migration Season — avant tout le reste ⚠️ P0

### S4-MIGRATE-001 : Migrer Season → Season + SeasonPeriod

- **Type :** Migration
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `chore/S4-MIGRATE-001-season-period-migration`
- **Commit :** `chore(prisma): migrate Season to Season+SeasonPeriod, keep dates on ContractPeriod`

**Ordre strict des opérations :**

```
Étape 1 — Créer SeasonPeriod (nouvelle table)
Étape 2 — Migrer les données Season → SeasonPeriod
Étape 3 — Ajouter seasonPeriodId sur ContractPeriod (nullable)
Étape 4 — Supprimer startDate/endDate de Season
```

Ne jamais fusionner étape 2 et étape 4 dans la même migration.

**Script de migration des données :**

```typescript
// prisma/scripts/migrate-season-periods.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const seasons = await prisma.season.findMany();

  for (const season of seasons) {
    await prisma.seasonPeriod.create({
      data: {
        seasonId: season.id,
        name: 'Période principale', // renommer manuellement après
        startDate: (season as any).startDate,
        endDate: (season as any).endDate,
      },
    });
  }
  console.log(`Migrated ${seasons.length} seasons → season periods`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Tester en local avant Neon :**

```bash
# 1. Copie locale
npx prisma migrate reset --skip-seed
npx ts-node prisma/scripts/migrate-season-periods.ts
npx prisma studio  # vérifier visuellement

# 2. Seulement si OK → appliquer sur Neon
DATABASE_URL=$NEON_DIRECT_URL npx prisma migrate deploy
npx ts-node prisma/scripts/migrate-season-periods.ts
```

**Acceptance Criteria :**

- ✅ Table `season_periods` créée
- ✅ Chaque Season existante a au moins une SeasonPeriod
- ✅ `startDate`/`endDate` supprimés de `Season`
- ✅ `ContractPeriod.seasonPeriodId` nullable ajouté
- ✅ Données de production intactes

---

## Shared Types — à créer avant tout ⚠️ P0

### S4-SHARED-001 : Types contrats dans `@runner/shared/types`

- **Type :** Task
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `chore/S4-SHARED-001-contract-types`
- **Commit :** `chore(types): revise Season, add SeasonPeriod, add Contract types`

```typescript
// libs/shared/types/src/lib/season.types.ts — RÉVISÉ

export interface Season {
  id: string;
  name: string;
  tourOperatorId: string;
  periods?: SeasonPeriod[];
  createdAt: string;
  updatedAt: string;
}

export interface SeasonDto {
  name: string;
}

// NOUVEAU
export interface SeasonPeriod {
  id: string;
  seasonId: string;
  name: string;
  startDate: string; // template — dates suggérées
  endDate: string;
  season?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface SeasonPeriodDto {
  name: string;
  startDate: string;
  endDate: string;
}
```

```typescript
// libs/shared/types/src/lib/contract.types.ts — NOUVEAU

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
  seasonPeriodId?: string | null; // optionnel — classification/reporting
  name: string;
  startDate: string; // source de vérité contractuelle
  endDate: string;
  baseMealPlanId: string;
  minStay?: number;
  seasonPeriod?: SeasonPeriod; // pour affichage du nom de saison
  baseMealPlan?: { id: string; code: string; name: string };
  roomPrices?: RoomPrice[];
  mealPlanSupplements?: MealPlanSupplement[];
  stopSalesDates?: StopSalesDate[];
}

export interface ContractPeriodDto {
  seasonPeriodId?: string | null;
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

**Acceptance Criteria :**

- ✅ `Season` sans `startDate`/`endDate`
- ✅ `SeasonPeriod` exporté avec dates de référence
- ✅ `ContractPeriod` avec ses propres `startDate`/`endDate` + `seasonPeriodId?` optionnel
- ✅ `PricingMode` union type (pas d'enum)

---

## Backend Tasks

### S4-BE-001 : Prisma — schéma révisé + migration

- **Type :** Task
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `chore/S4-BE-001-prisma-contracts-migration`
- **Commit :** `chore(prisma): revise Season, add SeasonPeriod and Contract models`

```prisma
// Season — conteneur pur, plus de dates
model Season {
  id             String         @id @default(cuid())
  name           String
  tourOperatorId String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  periods        SeasonPeriod[]

  @@unique([tourOperatorId, name])
  @@index([tourOperatorId])
}

// SeasonPeriod — template de référence
model SeasonPeriod {
  id              String           @id @default(cuid())
  seasonId        String
  name            String
  startDate       DateTime         // dates suggérées
  endDate         DateTime
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  season          Season           @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  contractPeriods ContractPeriod[]

  @@unique([seasonId, name])       // pas deux périodes avec le même nom dans une saison
  @@index([seasonId])
  @@index([startDate, endDate])
}

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

// ContractPeriod — source de vérité contractuelle
model ContractPeriod {
  id                  String               @id @default(cuid())
  contractId          String
  seasonPeriodId      String?              // optionnel — classification/reporting
  name                String
  startDate           DateTime             // dates réelles négociées
  endDate             DateTime
  baseMealPlanId      String
  minStay             Int?
  contract            Contract             @relation(fields: [contractId], references: [id], onDelete: Cascade)
  seasonPeriod        SeasonPeriod?        @relation(fields: [seasonPeriodId], references: [id])
  baseMealPlan        MealPlan             @relation(fields: [baseMealPlanId], references: [id])
  roomPrices          RoomPrice[]
  mealPlanSupplements MealPlanSupplement[]
  stopSalesDates      StopSalesDate[]

  @@index([contractId])
  @@index([seasonPeriodId])
}

model RoomPrice {
  id               String          @id @default(cuid())
  contractPeriodId String
  roomTypeId       String
  pricingMode      PricingMode
  pricePerNight    Decimal?
  contractPeriod   ContractPeriod  @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  roomType         RoomType        @relation(fields: [roomTypeId], references: [id])
  occupancyRates   OccupancyRate[]

  @@unique([contractPeriodId, roomTypeId])
  @@index([contractPeriodId])
}

model OccupancyRate {
  id          String    @id @default(cuid())
  roomPriceId String
  numAdults   Int
  numChildren Int
  ratesPerAge Json
  totalRate   Decimal
  roomPrice   RoomPrice @relation(fields: [roomPriceId], references: [id], onDelete: Cascade)

  @@unique([roomPriceId, numAdults, numChildren])
  @@index([roomPriceId])
}

model MealPlanSupplement {
  id               String         @id @default(cuid())
  contractPeriodId String
  mealPlanId       String
  occupancyRates   Json
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

**Acceptance Criteria :**

- ✅ `Season` sans `startDate`/`endDate`
- ✅ `SeasonPeriod` avec `startDate`/`endDate` + `@@unique([seasonId, name])`
- ✅ `ContractPeriod` avec ses propres `startDate`/`endDate` + `seasonPeriodId?` nullable
- ✅ Migration appliquée sans erreur
- ✅ Client Prisma régénéré

---

### S4-BE-002 : SeasonPeriods CRUD — ajout au module Seasons

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S4-BE-002-season-periods`
- **Commit :** `feat(seasons): add SeasonPeriod CRUD nested under seasons`

**Endpoints :**

```
GET    /seasons/:id/periods
POST   /seasons/:id/periods
PATCH  /seasons/:id/periods/:periodId
DELETE /seasons/:id/periods/:periodId   ← 204, pas de blocage (dates indépendantes)
```

**Validation chevauchement dans une même Season :**

```typescript
async validateNoOverlap(
  seasonId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
): Promise<void> {
  const overlapping = await this.prisma.seasonPeriod.findFirst({
    where: {
      seasonId,
      id: excludeId ? { not: excludeId } : undefined,
      startDate: { lte: endDate },
      endDate:   { gte: startDate },
    },
  });
  if (overlapping) {
    throw new ConflictException(
      `SeasonPeriod overlaps with existing period "${overlapping.name}"`
    );
  }
}
```

**Note :** pas d'immutabilité — une SeasonPeriod peut être modifiée même si
des ContractPeriods y font référence (les ContractPeriods ont leurs propres dates).

**Acceptance Criteria :**

- ✅ CRUD SeasonPeriod fonctionnel sous `/seasons/:id/periods`
- ✅ Chevauchement dans une même Season bloqué
- ✅ Suppression libre (pas de blocage sur ContractPeriod liées)
- ✅ Abstract class repository pattern

---

### S4-BE-003 : ContractsModule — structure + Repository Pattern

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-003-contracts-module`
- **Commit :** `feat(contracts): create contracts module with abstract repository pattern`

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
│   ├── contract.repository.ts
│   └── prisma-contract.repository.ts
├── contracts.types.ts
├── contracts.controller.ts
├── contracts.service.ts
└── contracts.module.ts
```

### S4-BE-004 : DTOs avec validation complète

- **Type :** Task
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `chore/S4-BE-004-contracts-dto`
- **Commit :** `chore(contracts): add all DTOs with class-validator`

**Décisions architecturales (session 17 juin) :**

- `totalRate` retiré de `OccupancyRateDto` — calculé par le backend dans S4-BE-008
- `order` supprimé de `ratesPerAge` — l'ordre vient des `AgeCategory` de l'hôtel
- `ratesPerAge` devient `Record<string, number>` (plus `{ rate, order }`)
- `@ValidateIf` ajouté sur `pricePerNight` (requis si PER_ROOM)

**OccupancyRateDto :**

```typescript
export class OccupancyRateDto {
  @IsInt() @Min(1) numAdults: number;
  @IsInt() @Min(0) numChildren: number;
  @IsObject() ratesPerAge: Record<string, number>;
}
```

**CreateRoomPriceDto :**

```typescript
export class CreateRoomPriceDto {
  @IsString() @IsNotEmpty() roomTypeId: string;
  @IsEnum(PricingMode) pricingMode: PricingMode;
  @ValidateIf((o: CreateRoomPriceDto) => o.pricingMode === 'PER_ROOM')
  @IsNumber()
  @Min(0)
  pricePerNight?: number | null;
  @IsOptional()
  @ValidateIf((o: CreateRoomPriceDto) => o.pricingMode === 'PER_OCCUPANCY')
  @ValidateNested({ each: true })
  @Type(() => OccupancyRateDto)
  occupancyRates?: OccupancyRateDto[];
}
```

**CreateMealPlanSupplementDto :**

```typescript
export class CreateMealPlanSupplementDto {
  @IsString() @IsNotEmpty() mealPlanId: string;
  @IsObject() occupancyRates: Record<string, number>;
}
```

**Acceptance Criteria :**

- ✅ `seasonPeriodId` optionnel dans `CreateContractPeriodDto`
- ✅ `startDate`/`endDate` obligatoires sur `ContractPeriod`
- ✅ `totalRate` retiré du DTO — calculé backend
- ✅ `ratesPerAge` simplifié en `Record<string, number>`
- ✅ Validation HTTP 400 si payload invalide

---

### S4-BE-005 : Endpoints Contracts CRUD

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-005-contracts-crud`
- **Commit :** `feat(contracts): implement contracts CRUD endpoints`

```
GET    /contracts
GET    /contracts/:id
POST   /contracts
PATCH  /contracts/:id
DELETE /contracts/:id   ← bloqué si bookings liés
```

**Include pour GET /:id :**

```typescript
include: {
  periods: {
    include: {
      seasonPeriod: true,          // nom de saison pour affichage
      baseMealPlan: true,
      roomPrices: { include: { occupancyRates: true } },
      mealPlanSupplements: true,
      stopSalesDates: true,
    }
  }
}
```

---

### S4-BE-006 : Endpoints ContractPeriod

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S4-BE-006-contract-periods`
- **Commit :** `feat(contracts): implement contract periods CRUD`

```
POST   /contracts/:id/periods
PATCH  /contracts/:id/periods/:periodId
DELETE /contracts/:id/periods/:periodId
```

**Validation chevauchement dans un même contrat :**

```typescript
async validateNoOverlap(
  contractId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
): Promise<void> {
  const overlapping = await this.prisma.contractPeriod.findFirst({
    where: {
      contractId,
      id: excludeId ? { not: excludeId } : undefined,
      startDate: { lte: endDate },
      endDate:   { gte: startDate },
    },
  });
  if (overlapping) {
    throw new ConflictException(
      `Period overlaps with existing period "${overlapping.name}"`
    );
  }
}
```

**Auto-fill depuis SeasonPeriod (si fourni) :**

```typescript
// Dans ContractsService.createPeriod()
if (dto.seasonPeriodId) {
  const seasonPeriod = await this.prisma.seasonPeriod.findUnique({
    where: { id: dto.seasonPeriodId },
  });
  if (!seasonPeriod) throw new NotFoundException('SeasonPeriod not found');

  // Pré-remplir les dates si non fournies explicitement
  dto.startDate = dto.startDate ?? seasonPeriod.startDate.toISOString();
  dto.endDate = dto.endDate ?? seasonPeriod.endDate.toISOString();
}
```

**Acceptance Criteria :**

- ✅ Chevauchement de périodes dans un même contrat bloqué
- ✅ Auto-fill depuis SeasonPeriod si `seasonPeriodId` fourni
- ✅ Dates restent éditables indépendamment de la SeasonPeriod

---

### S4-BE-007 : Endpoints RoomPrice — PER_ROOM

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-BE-007-room-price-per-room`
- **Commit :** `feat(contracts): implement room prices PER_ROOM mode`

```
POST   /contracts/:id/periods/:periodId/room-prices
PATCH  /room-prices/:id
DELETE /room-prices/:id
```

---

### S4-BE-008 : Endpoints RoomPrice — PER_OCCUPANCY

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S4-BE-008-room-price-per-occupancy`
- **Commit :** `feat(contracts): implement PER_OCCUPANCY pricing with capacity validation`

**Contexte :**
En PER_OCCUPANCY, le tarif varie selon la composition du groupe.
Un RoomPrice PER_OCCUPANCY a des OccupancyRates associés —
une ligne par combinaison numAdults/numChildren possible.

**Flow de création :**

1. Créer le `RoomPrice` (pricingMode = PER_OCCUPANCY, pricePerNight = null)
2. Pour chaque `OccupancyRateDto` dans le payload :
   a. Valider que numAdults + numChildren <= capacité max du RoomType
   b. Calculer totalRate = sum(ratesPerAge values)
   c. Créer l'`OccupancyRate` en base

**Validation capacité via `RoomTypeCapacity` :**

```typescript
async validateOccupancyAgainstCapacity(
  roomTypeId: string,
  numAdults: number,
  numChildren: number,
): Promise<void> {
  const roomType = await this.prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { capacities: true },
  });
  if (!roomType) throw new NotFoundException('RoomType not found');

  const totalMaxPax = roomType.capacities
    .reduce((sum, c) => sum + c.maxPax, 0);

  if (numAdults + numChildren > totalMaxPax) {
    throw new BadRequestException(
      `Occupancy (${numAdults}A + ${numChildren}C) exceeds room capacity (${totalMaxPax} pax)`
    );
  }
}
```

**Calcul totalRate (décision S4-BE-004) :**

```typescript
const totalRate = Object.values(dto.ratesPerAge).reduce((sum, r) => sum + r, 0);
```

**Modifications nécessaires :**

- `contract.repository.ts` — ajouter `createOccupancyRates`, `findRoomType`
- `prisma-contract.repository.ts` — implémenter
- `contracts.service.ts` — logique dans `createRoomPrice` :
  si PER_OCCUPANCY → valider capacité + calculer totalRate + créer OccupancyRates
- Pas de nouveaux endpoints — la création des OccupancyRates
  se fait dans le même appel POST /room-prices

**Acceptance Criteria :**

- ✅ OccupancyRates créés avec le RoomPrice en un seul appel
- ✅ Validation capacité via `RoomTypeCapacity`
- ✅ totalRate calculé par le backend
- ✅ @@unique([roomPriceId, numAdults, numChildren]) respectée
- ✅ BadRequestException si capacité dépassée

---

### S4-BE-009 : Endpoints MealPlanSupplement

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S4-BE-009-meal-supplements`
- **Commit :** `feat(contracts): implement meal plan supplements`

**Contexte :** Un `MealPlanSupplement` représente un coût additionnel pour passer du
meal plan de base de la période (`ContractPeriod.baseMealPlanId`) à un autre meal plan,
selon la composition du groupe. Contrairement à `RoomPrice`/`OccupancyRate`, il n'y a
**pas de table séparée** — `occupancyRates` est stocké en JSON brut sur une seule ligne,
car aucune contrainte d'unicité ni requête individuelle ne porte sur les clés
adultes/enfants à l'intérieur (cf. `ratesPerAge` sur `OccupancyRate`, même logique).

```
POST   /contracts/:id/periods/:periodId/meal-supplements
PATCH  /meal-supplements/:id
DELETE /meal-supplements/:id
```

**Flow de création :**

1. Vérifier que la `ContractPeriod` (`periodId` + `contractId`) existe → 404 sinon
2. Créer le `MealPlanSupplement` directement (pas de transformation, pas de
   validation de capacité — `occupancyRates` est accepté tel quel tant que c'est
   un objet JSON valide ; cf. validation `@IsObject()` déjà présente dans le DTO)
3. Si conflit DB (`@@unique([contractPeriodId, mealPlanId])`) → 409

**Flow de mise à jour (PATCH) :**

- Mêmes champs que la création, tous optionnels (`PartialType`)
- Pas de vérification de `ContractPeriod` nécessaire — l'update cible directement
  l'`id` du `MealPlanSupplement`, comme `updateRoomPrice`

**Flow de suppression (DELETE) :**

- Suppression directe par `id`, 204 si succès, 404 si non trouvé
- Pas de blocage sur relations (`MealPlanSupplement` n'a pas d'enfants)

**Modifications nécessaires :**

- `contracts.types.ts` — ajouter `MealPlanSupplementCreateData`, `MealPlanSupplementUpdateData`
- `contract.repository.ts` (abstract) — ajouter `createMealPlanSupplement`,
  `updateMealPlanSupplement`, `removeMealPlanSupplement`
- `prisma-contract.repository.ts` — implémenter les 3 méthodes ci-dessus
- `contracts.service.ts` — `createMealPlanSupplement`, `updateMealPlanSupplement`,
  `removeMealPlanSupplement` (suivre exactement le pattern de `createRoomPrice`/
  `updateRoomPrice`/`removeRoomPrice`, sans la partie occupancyRates/transaction)
- `contracts.controller.ts` — route nichée `POST /contracts/:id/periods/:periodId/meal-supplements`
- Nouveau contrôleur `meal-plan-supplements.controller.ts` — routes plates
  `PATCH /meal-supplements/:id` et `DELETE /meal-supplements/:id`
  (même pattern que `room-prices.controller.ts`)

**Acceptance Criteria :**

- ✅ `MealPlanSupplement` créé en une seule écriture (pas de transaction multi-tables)
- ✅ 404 si `ContractPeriod` introuvable à la création
- ✅ 409 si `mealPlanId` déjà utilisé dans cette `ContractPeriod`
- ✅ `occupancyRates` accepté tel quel (objet JSON, pas de validation de structure interne)
- ✅ PATCH et DELETE fonctionnent indépendamment de la `ContractPeriod`

---

### S4-BE-010 : Endpoints StopSalesDate

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feature/S4-BE-010-stop-sales`
- **Commit :** `feat(contracts): implement stop sales dates management`

```
POST   /contracts/:id/periods/:periodId/stop-sales
DELETE /stop-sales/:id
```

**Validation contre les dates réelles du ContractPeriod :**

```typescript
// Validation contre ContractPeriod.startDate/endDate (pas SeasonPeriod)
const contractPeriod = await this.prisma.contractPeriod.findUnique({
  where: { id: periodId },
});
if (date < contractPeriod.startDate || date > contractPeriod.endDate) {
  throw new BadRequestException('Date is outside the contract period range');
}
```

---

### S4-BE-011 : Tests unitaires ContractsService

- **Type :** Test
- **Priority :** P1
- **Story Points :** 4
- **Branch :** `test/S4-BE-011-contracts-tests`
- **Commit :** `test(contracts): add unit tests for contracts service`

**Scénarios :**

- Création contrat avec vérification hotelId/marketId/currencyId
- Chevauchement de ContractPeriods dans un même contrat
- Auto-fill dates depuis SeasonPeriod
- Dates éditables indépendamment de la SeasonPeriod
- RoomPrice PER_ROOM (pricePerNight requis si PER_ROOM)
- RoomPrice PER_OCCUPANCY + validation via `capacities[]`
- ~~`totalRate` calculé et vérifié~~ → backend calcule totalRate depuis ratesPerAge
- StopSalesDate hors ContractPeriod → erreur

**Acceptance Criteria :**

- ✅ Coverage > 80% sur `contracts.service.ts`

---

## Frontend Tasks

### S4-FE-001 : Mettre à jour SeasonsService + UI Seasons

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-001-seasons-with-periods`
- **Commit :** `feat(seasons): add SeasonPeriod management in seasons UI`

**`SeasonsService` — nouvelles méthodes :**

```typescript
getWithPeriods(): void {
  // Charger seasons avec leurs periods incluses
  // Réutiliser le BehaviorSubject existant
}

createPeriod(seasonId: string, dto: SeasonPeriodDto): Observable<SeasonPeriod> {
  return this.http.post<SeasonPeriod>(`/api/seasons/${seasonId}/periods`, dto);
}

updatePeriod(
  seasonId: string,
  periodId: string,
  dto: Partial<SeasonPeriodDto>
): Observable<SeasonPeriod> {
  return this.http.patch<SeasonPeriod>(
    `/api/seasons/${seasonId}/periods/${periodId}`, dto
  );
}

deletePeriod(seasonId: string, periodId: string): Observable<void> {
  return this.http.delete<void>(`/api/seasons/${seasonId}/periods/${periodId}`);
}
```

**`SeasonPeriodFormDialogComponent`** (nouveau) :

```typescript
@Component({ ..., changeDetection: ChangeDetectionStrategy.OnPush })
export class SeasonPeriodFormDialogComponent {
  visible    = model<boolean>(false);
  seasonId   = input.required<string>();
  period     = input<SeasonPeriod | null>(null);   // null = create mode
  saved      = output<void>();

  private readonly fb             = inject(FormBuilder);
  private readonly seasonsService = inject(SeasonsService);
  private readonly messageService = inject(MessageService);

  isEdit = computed(() => !!this.period());

  form = this.fb.group({
    name:      ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate:   [null as Date | null, Validators.required],
  });

  // Pré-remplir en mode édition
  constructor() {
    effect(() => {
      const p = this.period();
      if (p) {
        this.form.patchValue({
          name:      p.name,
          startDate: new Date(p.startDate),
          endDate:   new Date(p.endDate),
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const dto: SeasonPeriodDto = {
      name:      this.form.value.name!,
      startDate: this.form.value.startDate!.toISOString(),
      endDate:   this.form.value.endDate!.toISOString(),
    };
    const action$ = this.isEdit()
      ? this.seasonsService.updatePeriod(this.seasonId(), this.period()!.id, dto)
      : this.seasonsService.createPeriod(this.seasonId(), dto);

    action$.pipe(take(1)).subscribe({
      next: () => {
        this.saved.emit();
        this.visible.set(false);
      },
      error: (err) => {
        const msg = err.status === 409
          ? 'Cette période chevauche une période existante'
          : 'Une erreur est survenue';
        this.messageService.add({ severity: 'error', summary: msg });
      },
    });
  }
}
```

---

### S4-FE-002 : Créer ContractsService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-002-contracts-service`
- **Commit :** `feat(contracts): create contracts service with BehaviorSubject`

```typescript
@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly http = inject(HttpClient);
  private readonly _contracts$ = new BehaviorSubject<Contract[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private _loaded = false;

  readonly contracts$ = this._contracts$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  load(
    filters: ContractFilters = {},
    pagination = { limit: 20, offset: 0 }
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
    return this.http.patch<Contract>(`/api/contracts/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/contracts/${id}`);
  }

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

---

### S4-FE-003 : ContractsList Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-003-contracts-list`
- **Commit :** `feat(contracts): create contracts list with filters`

- `p-table` : Name, Hotel, Market, Currency, Nb périodes, Actions
- Filtres Hotel + Market via `p-select`
- Boutons : Créer, Éditer, Supprimer (`confirmDelete` helper Sprint 3)

---

### S4-FE-004 : ContractForm — Étape 1 (infos de base)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-004-contract-form-step1`
- **Commit :** `feat(contracts): create contract form wizard step 1`

- Wizard `p-stepper` — 5 étapes
- Étape 1 : Name, Hotel, Market, Currency
- Reactive Form, `Validators.required` sur les 4 champs

---

### S4-FE-005 : ContractForm — Étape 2 (Periods)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S4-FE-005-contract-form-step2`
- **Commit :** `feat(contracts): add periods management with SeasonPeriod auto-fill`

**`PeriodFormDialogComponent` — sélection SeasonPeriod + dates éditables :**

```typescript
@Component({ ..., changeDetection: ChangeDetectionStrategy.OnPush })
export class PeriodFormDialogComponent {
  visible = model<boolean>(false);

  private readonly seasonsService = inject(SeasonsService);
  private readonly fb             = inject(FormBuilder);

  // Toutes les SeasonPeriods groupées par Season
  seasons = toSignal(this.seasonsService.seasons$, { initialValue: [] });

  form = this.fb.group({
    seasonPeriodId: [null as string | null],  // optionnel
    name:           ['', Validators.required],
    startDate:      [null as Date | null, Validators.required],
    endDate:        [null as Date | null, Validators.required],
    baseMealPlanId: ['', Validators.required],
    minStay:        [null as number | null],
  });

  // Auto-fill quand l'agent sélectionne une SeasonPeriod
  constructor() {
    effect(() => {
      const seasonPeriodId = this.form.get('seasonPeriodId')?.value;
      if (!seasonPeriodId) return;

      const period = this.seasons()
        .flatMap(s => s.periods ?? [])
        .find(p => p.id === seasonPeriodId);

      if (period) {
        // Pré-remplir — l'agent peut ensuite ajuster
        this.form.patchValue({
          name:      period.name,
          startDate: new Date(period.startDate),
          endDate:   new Date(period.endDate),
        });
      }
    });
  }
}
```

**UI du dialog :**

```
┌────────────────────────────────────────────────────────┐
│ Saison (optionnel)                                     │
│ [p-select groupé par Season — "Haute Saison / Été"]    │
│                                                        │
│ Nom de la période *                                    │
│ [p-inputtext — pré-rempli si SeasonPeriod sélectionnée]│
│                                                        │
│ Dates *                          ← éditables toujours  │
│ Du [p-datepicker]  Au [p-datepicker]                   │
│ (pré-remplies depuis SeasonPeriod si sélectionnée)     │
│                                                        │
│ Meal plan de base *                                    │
│ [p-select]                                             │
│                                                        │
│ Séjour minimum (optionnel)                             │
│ [p-inputnumber]  nuits                                 │
└────────────────────────────────────────────────────────┘
```

**Validation chevauchement côté frontend :**

```typescript
import { areIntervalsOverlapping, parseISO } from 'date-fns';

function hasOverlap(
  periods: ContractPeriodDto[],
  newPeriod: { startDate: string; endDate: string },
  excludeIndex?: number
): boolean {
  return periods
    .filter((_, i) => i !== excludeIndex)
    .some((p) =>
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

**Acceptance Criteria :**

- ✅ Sélection SeasonPeriod pré-remplit nom + dates
- ✅ Dates restent éditables après pré-remplissage
- ✅ `seasonPeriodId` optionnel — peut créer une période sans SeasonPeriod
- ✅ Validation chevauchement côté frontend
- ✅ `p-dialog` avec fix `model()`

---

### S4-FE-006 : ContractForm — Étape 3 (Room Prices)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 8
- **Branch :** `feature/S4-FE-006-contract-form-step3`
- **Commit :** `feat(contracts): add room prices PER_ROOM and PER_OCCUPANCY`

**Sélecteur de période :** affiche `period.name + period.startDate + period.endDate`
(dates réelles du ContractPeriod, pas de la SeasonPeriod).

**PER_OCCUPANCY — validation via `roomType.capacities[]` :**

```typescript
maxPax = computed(() =>
  this.selectedRoomType().capacities.reduce((sum, c) => sum + c.maxPax, 0)
);

isOccupancyValid = computed(() => {
  const total = this.numAdults() + this.numChildren();
  return total > 0 && total <= this.maxPax();
});

// totalRate affiché localement pour l'UI — pas envoyé dans le payload
totalRate = computed(
  () => Object.values(this.ratesPerAge()).reduce((sum, r) => sum + r, 0)
  // ratesPerAge est Record<string, number> — plus { rate, order }
);
```

**Note :** `totalRate` n'est plus dans le payload envoyé au backend.

---

### S4-FE-007 : ContractForm — Étape 4 (Meal Supplements)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S4-FE-007-contract-form-step4`
- **Commit :** `feat(contracts): add meal plan supplements`

---

### S4-FE-008 : ContractForm — Étape 5 (Stop Sales)

- **Type :** Feature
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `feature/S4-FE-008-contract-form-step5`
- **Commit :** `feat(contracts): add stop sales dates management`

**Limites depuis `ContractPeriod.startDate/endDate` (pas SeasonPeriod) :**

```typescript
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

```typescript
async submit(): Promise<void> {
  this.submitting.set(true);
  try {
    const contract = await firstValueFrom(
      this.contractsService.create(this.step1Form.value as ContractDto)
    );

    for (const period of this.periods()) {
      const dto: ContractPeriodDto = {
        seasonPeriodId: period.seasonPeriodId ?? null,  // optionnel
        name:           period.name,
        startDate:      period.startDate,               // dates réelles
        endDate:        period.endDate,
        baseMealPlanId: period.baseMealPlanId,
        minStay:        period.minStay,
      };
      const createdPeriod = await firstValueFrom(
        this.contractsService.createPeriod(contract.id, dto)
      );

      for (const rp of this.roomPricesByPeriod()[period.tempId]) {
        await firstValueFrom(
          this.contractsService.createRoomPrice(contract.id, createdPeriod.id, rp)
        );
      }
      for (const ms of this.mealSupplementsByPeriod()[period.tempId]) {
        await firstValueFrom(
          this.contractsService.createMealSupplement(contract.id, createdPeriod.id, ms)
        );
      }
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

---

### S4-FE-010 : Routes Contracts + Sidebar

- **Type :** Task
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `chore/S4-FE-010-contracts-routes`
- **Commit :** `chore(routing): add contracts routes and sidebar entry`

```typescript
// contracts.routes.ts
export const CONTRACTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./components/contracts-list/contracts-list.component')
        .then(m => m.ContractsListComponent),
  },
  {
    path: 'new',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./components/contract-form/contract-form.component')
        .then(m => m.ContractFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./components/contract-form/contract-form.component')
        .then(m => m.ContractFormComponent),
  },
];

// app.routes.ts — hors management.routes.ts
{
  path: 'contracts',
  loadChildren: () =>
    import('./features/contracts/contracts.routes').then(m => m.CONTRACTS_ROUTES),
}

// sidebar
{ label: 'Contracts', icon: 'pi pi-file-edit', route: '/contracts', roles: ['ADMIN', 'MANAGER'] }
```

---

### S4-REFACTOR-001 : Harmoniser la gestion des erreurs Prisma sur les foreign keys

- **Type :** Refactor
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `refactor/S4-REFACTOR-001-prisma-error-handling`
- **Commit :** `refactor(contracts): handle P2003 consistently across create/update methods`

**Contexte :** Identifié pendant S4-BE-009. Certaines méthodes du repository
gèrent déjà P2003 (foreign key invalide) en plus de P2002 (conflit unique),
mais pas toutes — alors que la même logique s'applique partout où un champ
`*Id` référence une autre entité.

**Incohérences relevées dans `prisma-contract.repository.ts` :**

| Méthode           | P2002 géré | P2003 géré | Devrait gérer P2003 ?                               |
| ----------------- | ---------- | ---------- | --------------------------------------------------- |
| `createRoomPrice` | ✅         | ✅         | — (déjà correct)                                    |
| `updateRoomPrice` | ✅         | ❌         | ✅ (`roomTypeId` modifiable)                        |
| `createPeriod`    | ✅         | ❌         | ✅ (`seasonPeriodId`, `baseMealPlanId`)             |
| `updatePeriod`    | ✅         | ❌         | ✅ (`seasonPeriodId`, `baseMealPlanId` modifiables) |

**Règle à appliquer :** dès qu'une méthode `create`/`update` accepte un champ
qui est une foreign key vers une autre entité, elle doit traduire P2003 en
`RepositoryException(RepositoryResult.NOT_FOUND)` — pas seulement P2002.

**Modifications nécessaires :**

- `updateRoomPrice` — ajouter le bloc `if (error.code === 'P2003')` (message :
  room type introuvable)
- `createPeriod` — idem (message : season period ou meal plan introuvable)
- `updatePeriod` — idem

**Hors scope (vérifier mais a priori déjà corrects) :**

- `create`/`update` sur `Contract` (`hotelId`, `marketId`, `currencyId`) — à
  auditer avec la même grille, possiblement même trou
- Méthodes `MealPlanSupplement` (créées en S4-BE-009) — vérifier qu'elles
  suivent bien la règle dès leur création, pour ne pas reproduire le problème

**Acceptance Criteria :**

- ✅ Toutes les méthodes `create`/`update` du repository gèrent P2002 ET P2003
  si elles acceptent au moins une foreign key
- ✅ Messages d'erreur clairs identifiant quelle entité référencée est introuvable
- ✅ Aucune régression sur les tests existants (S4-BE-011)

---

## Impact sur Sprint 7 — Pricing Engine

**Aucun changement** — `ContractPeriod` a toujours ses propres `startDate`/`endDate`.
La requête Sprint 7 reste identique au Sprint 4 original :

```typescript
// S7-BE-002 — inchangé
periods: {
  where: {
    startDate: { lte: checkOut },
    endDate:   { gte: checkIn },
  },
  include: {
    seasonPeriod: true,   // optionnel — pour affichage nom saison dans breakdown
    roomPrices: { include: { roomType: true, occupancyRates: true } },
    mealPlanSupplements: true,
    stopSalesDates: true,
  }
}

// findPeriodForNight — inchangé
function findPeriodForNight(night: Date, periods: ContractPeriod[]) {
  return periods.find(p =>
    night >= p.startDate && night <= p.endDate
  );
}
```

---

## Structure des fichiers

### Backend

```
apps/backend/src/
├── seasons/
│   ├── repositories/
│   │   ├── season.repository.ts
│   │   ├── prisma-season.repository.ts
│   │   ├── season-period.repository.ts        ← nouveau
│   │   └── prisma-season-period.repository.ts ← nouveau
│   ├── dto/
│   │   ├── create-season.dto.ts
│   │   ├── update-season.dto.ts
│   │   ├── create-season-period.dto.ts        ← nouveau
│   │   └── update-season-period.dto.ts        ← nouveau
│   ├── seasons.service.ts                     ← mise à jour
│   ├── seasons.controller.ts                  ← mise à jour
│   └── seasons.module.ts
└── contracts/
    ├── dto/
    ├── repositories/
    ├── contracts.types.ts
    ├── contracts.controller.ts
    ├── contracts.service.ts
    ├── contracts.service.spec.ts
    └── contracts.module.ts
```

### Frontend

```
apps/frontend/src/app/
├── features/
│   ├── management/
│   │   └── seasons/
│   │       ├── components/
│   │       │   ├── seasons-list/
│   │       │   ├── season-form/
│   │       │   └── season-period-form-dialog/ ← nouveau
│   │       └── seasons.service.ts             ← mise à jour
│   └── contracts/                             ← hors management/
│       ├── components/
│       │   ├── contracts-list/
│       │   ├── contract-form/
│       │   ├── period-form-dialog/            ← sélection SeasonPeriod + dates éditables
│       │   ├── room-price-form-dialog/
│       │   ├── occupancy-config-form/
│       │   └── meal-supplement-form-dialog/
│       ├── services/
│       │   └── contracts.service.ts
│       └── contracts.routes.ts
└── shared/
    └── utils/
        └── contract-params.util.ts
```

### Shared Types

```
libs/shared/types/src/lib/
├── types.ts            — Hotel, AgeCategory, RoomType + RoomTypeCapacity
├── season.types.ts     — Season (révisé), SeasonPeriod (nouveau)
├── meal-plan.types.ts
├── market.types.ts
├── currency.types.ts
├── supplement.types.ts
└── contract.types.ts   ← nouveau
```

---

## Definition of Done — Sprint 4

### Backend

- ✅ `Season` sans `startDate`/`endDate`
- ✅ `SeasonPeriod` CRUD complet sous `/seasons/:id/periods`
- ✅ Chevauchement SeasonPeriod dans une même Season bloqué
- ✅ Migration Prisma + données migrées sur Neon
- ✅ `ContractPeriod` avec `startDate`/`endDate` propres + `seasonPeriodId?`
- ✅ Auto-fill depuis SeasonPeriod si `seasonPeriodId` fourni
- ✅ Chevauchement ContractPeriod dans un même contrat bloqué
- ✅ Repository Pattern abstract class
- ✅ `tourOperatorId` depuis JWT uniquement
- ✅ PATCH sur tous les endpoints update
- ✅ RoomPrice PER_ROOM + PER_OCCUPANCY
- ✅ Validation capacité via `capacities[]`
- ✅ `totalRate` calculé et vérifié
- ✅ MealPlanSupplement + StopSalesDate
- ✅ StopSalesDate validée contre `ContractPeriod.startDate/endDate`
- ✅ Tests unitaires > 80%

### Frontend

- ✅ `Season` UI mise à jour — CRUD `SeasonPeriod` intégré
- ✅ Shared types `season.types.ts` révisé + `contract.types.ts` créé
- ✅ `ContractsService` BehaviorSubject + `loaded` flag
- ✅ Wizard contrat — `PeriodFormDialog` avec sélection SeasonPeriod + dates éditables
- ✅ Auto-fill dates depuis SeasonPeriod, modifiables librement
- ✅ `seasonPeriodId` optionnel — création de période sans SeasonPeriod possible
- ✅ PER_ROOM + PER_OCCUPANCY implémentés
- ✅ Validation capacité via `roomType.capacities[]`
- ✅ Stop sales validées contre `ContractPeriod` dates
- ✅ Routes dans `contracts.routes.ts` (hors `management.routes.ts`)
- ✅ Sidebar mise à jour
- ✅ `take(1)` sur tous les subscribe()
- ✅ `OnPush` sur tous les composants

---

## Ordre d'exécution recommandé

```
S4-MIGRATE-001   (migration Season → SeasonPeriod)     ← en premier absolu

S4-SHARED-001    (shared types révisés)

Backend :
  S4-BE-001    (schéma Prisma)
  S4-BE-002    (SeasonPeriod CRUD)
  S4-BE-003    (ContractsModule)
  S4-BE-004    (DTOs)
  S4-BE-005    (Contracts CRUD)
  S4-BE-006    (ContractPeriod — auto-fill + chevauchement)
  S4-BE-007    (RoomPrice PER_ROOM)
  S4-BE-008    (RoomPrice PER_OCCUPANCY)
  S4-BE-009    (MealPlanSupplement)
  S4-BE-010    (StopSalesDate)
  S4-BE-011    (Tests)

Frontend :
  S4-FE-010    (routes + sidebar)
  S4-FE-001    (SeasonsService + SeasonPeriod UI)       ← débloque le wizard
  S4-FE-002    (ContractsService)
  S4-FE-003    (ContractsList)
  S4-FE-004    (step 1)
  S4-FE-005    (step 2 — periods avec auto-fill)
  S4-FE-006    (step 3 — Room Prices)
  S4-FE-007    (step 4 — Meal Supplements)
  S4-FE-008    (step 5 — Stop Sales)
  S4-FE-009    (recap + submit)
```

---

## Risques

| Risque                                                | Mitigation                                                              |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Migration données Neon                                | Tester en local, deux migrations séparées, backup avant                 |
| SeasonPeriod pas encore créées au démarrage du sprint | S4-BE-002 et S4-FE-001 en P0                                            |
| Auto-fill non déclenchée si effet non réactif         | Utiliser `effect()` sur le signal `seasonPeriodId`                      |
| Chevauchement inter-Seasons dans un contrat           | Validation dans `ContractsService.createPeriod()` sur les dates réelles |

---

## Dépendances

- Sprint 2 terminé (Hotels + RoomTypeCapacity + Seasons) ✅
- Sprint 3 terminé (MealPlans, Markets, Currencies, Supplements) ✅

---

## Notes pour Sprint 7

- `findPeriodForNight()` lit `period.startDate/endDate` directement — **inchangé**
- `seasonPeriod` inclus optionnellement pour afficher le nom de saison dans le breakdown
- Aucune modification de logique dans le PricingService
