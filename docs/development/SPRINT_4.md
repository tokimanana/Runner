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
export interface Season {
  id: string;
  name: string;
  tourOperatorId: string;
  seasonPeriods?: SeasonPeriod[];
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
  startDate: string;
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

### S4-FE-001 : SeasonsService + Season/SeasonPeriod UI

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S4-FE-001-seasons-with-periods`
- **Status :** ✅ Done

**Décisions actées, divergentes du plan original :**

1. **`Season.seasonPeriods` (pas `periods`)** — le doc initial proposait de renommer le champ. Faux : `schema.prisma` et le type Prisma généré utilisent `seasonPeriods`. Aucun renommage frontend nécessaire.

2. **Pas de `getWithPeriods()`** — `GET /seasons` renvoie désormais toujours `seasonPeriods` (mapping ajouté côté backend, voir `SeasonsService.mapToSeason()`). `getSeasons()` existant suffit, aucune méthode supplémentaire.

3. **`SeasonsFormComponent` supprimé** — devenu obsolète : `Season` n'a plus de `startDate`/`endDate` (ils vivent sur `SeasonPeriod`). Remplacé par :
   - Création de Season : inline dans `seasons-list` (un input + check/cancel dans la ligne footer du tableau)
   - Édition du nom : inline dans `season-detail` (pattern pencil/check/cancel, cohérent avec les capacities de `RoomTypeFormDialog`)

4. **Routing simplifié** — `seasons.component.ts` (wrapper `<router-outlet/>` pur) supprimé, route `'seasons'` componentless. Routes finales :

```typescript
   {
     path: 'seasons',
     children: [
       { path: '', redirectTo: 'seasons-list', pathMatch: 'full' },
       { path: 'seasons-list', loadComponent: () => ... SeasonsListComponent },
       { path: ':seasonId', loadComponent: () => ... SeasonDetailComponent },
     ],
   }
```

Pas de route `create` (inline) ni `:seasonId/edit` (renommé `:seasonId`, sert à gérer les periods, pas juste éditer).

**Dette notée séparément (hors scope) :** `hotels.component.ts` a le même problème de wrapper inutile — ticket dédié à créer.

5. **Réactivité — une seule source de vérité.** `SeasonDetailComponent.season` est un `computed()` dérivé de `SeasonsService.seasons$` (le `BehaviorSubject` partagé), **pas** un `getSeasonById()` séparé. Toute mutation (`updateSeason`, `createPeriod`, `updatePeriod`, `deletePeriod`) déclenche `reload()` côté service, qui réémet `seasons$`, qui recalcule `season()` automatiquement — aucun rafraîchissement manuel nécessaire côté composant.

6. **`SeasonPeriodFormDialogComponent`** — pas d'`output` `saved`/`periodSaved` : redondant avec le point 5.

**Nouveaux fichiers partagés :**

- `shared/utils/date-range.util.ts` — `dateRangeValidator` extrait (réutilisable pour `ContractPeriod`, S4-FE-005)
- `features/management/seasons/seasons-list/period-count.pipe.ts` — `PeriodCountPipe`

**Acceptance Criteria :**

- ✅ `GET /seasons` renvoie `seasonPeriods` peuplé (mappé Prisma → type partagé, dates en ISO string)
- ✅ Season : création inline dans `seasons-list`, édition du nom inline dans `season-detail`
- ✅ `SeasonPeriod` : create/edit via dialog, delete via `confirmDelete` (conflit 409 géré : period liée à un `ContractPeriod`)
- ✅ Aucun flash "not found" au chargement initial (`loadingSubject` démarre à `true`)
- ✅ Un seul flux de données (`seasons$`), pas de désynchronisation possible entre liste et détail

---

### S4-FE-002 : ContractsService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S4-FE-002-contracts-service`
- **Status :** ✅ Done
- **Commits :**
  - `feat(contracts): create ContractsService with BehaviorSubject pattern`
  - `feat(contracts): add period CRUD methods to ContractsService`
  - `fix(contracts): normalize method naming and parameter order across ContractsService`
  - `fix(contracts): reset loading state on findAll error`

**Décisions actées, divergentes du plan original :**

1. **Pas de `reload()` global sur les sous-ressources.** `createPeriod`, `updatePeriod`, `removePeriod`, `createRoomPrice`, `updateRoomPrice`, `removeRoomPrice`, `createMealPlanSupplement`, `updateMealPlanSupplement`, `removeMealPlanSupplement`, `createStopSalesDate`, `removeStopSalesDate` retournent l'`Observable` HTTP direct, sans `tap()`. Contrairement à `SeasonsService`, un `reload()` de `_contracts$` après chaque mutation de sous-ressource serait disproportionné (volume de contrats + relations profondément imbriquées). C'est au composant appelant (futur wizard, S4-FE-005+) de mettre à jour son état local avec la valeur retournée.

2. **`create`/`update`/`remove` sur `Contract` synchronisent `_contracts$` localement, sans round-trip HTTP.** Immutabilité respectée (`getValue()` + `.map()`/`.filter()` + `next()`), pas de `reload()`.

3. **Pas de cache bloquant sur `findAll()`.** Contrairement à `SeasonsService.getSeasons()` (flag `loaded` simple), `findAll(filters, pagination)` refait systématiquement l'appel HTTP à chaque invocation — les filtres (`hotelId`, `marketId`) et la pagination changent le résultat attendu, donc un cache basé sur un seul booléen `loaded` casserait dès qu'un filtre change. C'est au composant appelant de décider quand rappeler `findAll()`.

4. **`findOne(id)` toujours en HTTP direct, jamais de lecture depuis `_contracts$`.** L'objet `Contract` dans la liste paginée (`findAll`) peut être une version allégée sans les relations profondément imbriquées (`periods.roomPrices.occupancyRates`, etc.) pour des raisons de perf backend — donc pas fiable pour un écran de détail/édition.

5. **`_loading$` réinitialisé sur erreur.** `findAll()` utilise `catchError` pour remettre `_loading$.next(false)` avant de relancer l'erreur intacte via `throwError(() => error)` (syntaxe factory, pas la forme dépréciée), pour que le composant appelant puisse à la fois afficher un message d'erreur et sortir de l'état loading.

6. **Naming normalisé :** `remove*` partout (jamais `delete*`), noms complets alignés sur les types partagés et les méthodes backend (`createMealPlanSupplement`, pas `createMealSupplement`).

7. **Ordre de paramètres normalisé sur toutes les méthodes `create*`/`update*` :** identifiants parents dans l'ordre de l'URL (`contractId` avant `periodId`), `dto` toujours en dernier.

**Pas de `.subscribe()` interne dans ce service** — toutes les méthodes retournent des `Observable` non souscrits ; la règle `take(1)` s'appliquera dans les composants consommateurs (S4-FE-003+), pas ici.

**Acceptance Criteria :**

- ✅ 15 méthodes couvrant les 4 controllers (`ContractsController`, `RoomPricesController`, `MealPlanSupplementsController`, `StopSalesDatesController`)
- ✅ `_contracts$`/`_loading$` comme unique source de vérité pour la liste de contrats
- ✅ Aucun `reload()` coûteux sur les sous-ressources
- ✅ Gestion d'erreur complète sur `findAll` (loading + erreur propagée)
- ✅ Naming et ordre de paramètres cohérents dans tout le fichier
- ✅ `nx build frontend` → 0 erreur

---

### S4-FE-003 : ContractsList Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S4-FE-003-contracts-list`
- **Commit :** `feat(contracts): create contracts list with filters and pagination`

## Contexte

Premier composant consommateur de `ContractsService` (S4-FE-002). Contrairement
à `SeasonsService.getSeasons()` (pas de filtres, cache simple), `ContractsService.findAll()`
n'a pas de cache — chaque changement de filtre ou de page redéclenche un appel HTTP.
C'est ce composant qui pilote quand rappeler `findAll()`.

## Colonnes de la table (`p-table`)

| Colonne     | Source                    | Affichage                            |
| ----------- | ------------------------- | ------------------------------------ |
| Name        | `contract.name`           | texte                                |
| Hotel       | `contract.hotel?.name`    | texte, fallback si `undefined`       |
| Market      | `contract.market?.name`   | texte, fallback si `undefined`       |
| Currency    | `contract.currency?.code` | ex: "EUR" (trancher code vs symbole) |
| Nb périodes | `contract.periodsCount`   | badge/nombre, `?? 0` si absent       |
| Actions     | —                         | Éditer (icône), Supprimer (icône)    |

## États à gérer

- **Loading** : `ContractsService.loading$` → spinner/skeleton pendant chargement initial et à chaque changement de filtre
- **Liste vide** : aucun résultat pour les filtres actuels → message + CTA "Créer un contrat"
- **Erreur** : `findAll()` propage l'erreur (`catchError` + `throwError` déjà en place côté service) → `subscribe({ next, error })` avec `MessageService` en cas d'échec
- **Filtres actifs** : `hotelId` / `marketId` via `p-select`, état dans des `signal()` locaux

## Comportement filtres → rechargement

Chaque changement de `hotelId`/`marketId` doit redéclencher `findAll(filters, pagination)` —
pas de flag `loaded` qui bloquerait (rappel : `ContractsService.findAll()` n'a pas de cache
pour cette raison précise).

## Pagination

`PaginatedResult<Contract>` a `total`, `limit`, `offset`. Décision à trancher pendant
l'implémentation : `p-paginator` PrimeNG (page par page) — pas de scroll infini mentionné
dans le sprint, rester cohérent avec le reste du projet (vérifier si `hotels-list`/`seasons-list`
paginent déjà et comment).

## Actions

- **Créer** : bouton → navigue vers `/management/contracts/create` (route déjà en place, S4-FE-010)
- **Éditer** : icône par ligne → navigue vers `/management/contracts/:contractId/edit`
- **Supprimer** : icône par ligne → `confirmDelete()` (`shared/utils/confirm-delete.util.ts`),
  utilise `ContractsService.remove(id)` qui met déjà à jour `_contracts$` localement (pas de
  `reload()` nécessaire après)

## Dépendances déjà résolues (pas à refaire)

- `ContractsService` complet (S4-FE-002) ✅
- `Contract.periodsCount` disponible depuis le backend (S4-FIX-002, S4-FIX-003) ✅
- `confirmDelete()` gère déjà le cas 409 (contrat avec dépendances)

## Acceptance Criteria

- ✅ `p-table` affiche les 6 colonnes avec les bonnes sources de données
- ✅ Filtres Hotel + Market fonctionnels, redéclenchent `findAll()` à chaque changement
- ✅ Loading visible pendant chargement initial et changements de filtre
- ✅ Message clair si liste vide ou erreur réseau
- ✅ Pagination fonctionnelle si le nombre de contrats dépasse une page
- ✅ Suppression via `confirmDelete()`, pas de `reload()` après (sync locale déjà gérée par le service)
- ✅ Navigation Créer/Éditer fonctionnelle vers les routes existantes
- ✅ `OnPush`, standalone, `inject()`, `take(1)` sur tout `subscribe()`
- ✅ `tsc --noEmit -p apps/frontend/tsconfig.app.json` → 0 erreur

---

#### S4-FE-004 — ContractForm Wizard — Step 1 (Contract Info)

> Create the standalone `ContractFormComponent` and wire up the first step of the multi-step contract creation wizard using PrimeNG Stepper. Step 1 collects the core contract identifiers (name, hotel, market, currency) and stores them in a shared signal consumed by later steps.

- **Type:** Feature
- **Priority:** P0
- **SP:** 3
- **Branch:** `feat/S4-FE-004-contract-form-step1`
- **Commit:** `feat(contracts): add ContractForm wizard step 1 (S4-FE-004)`
- **Tasks:**
  - `ContractFormComponent`: standalone, `OnPush`, `inject()` only
  - `step1Form`: typed `FormGroup` (`fb.nonNullable.group`), 4 fields (`name`, `hotelId`, `marketId`, `currencyId`), `Validators.required` on each
  - `step1Data`: `signal<ContractDto | null>(null)`, shared cross-step state, populated on Next click if form valid
  - `activeStep`: `signal<number>(1)`, 1-based (aligned with `p-step [value]`)
  - Dropdown sources: `HotelsService.getHotels()`, `MarketsService.getAll()`, `CurrenciesService.getAll()` — `toSignal` + `initialValue: []`
  - `goNext(activateCallback)`: validates `step1Form`, `markAllAsTouched()` if invalid (return without navigating), else `step1Data.set(getRawValue())` + `activateCallback(activeStep() + 1)`
  - `goBack(activateCallback)`: `activateCallback(activeStep() - 1)`, no validation
  - Template: PrimeNG v19 Stepper (`p-step-list`/`p-step-panels`/`p-step-panel`), `StepperModule`
  - Back button hidden (`@if activeStep() > 1`), never disabled
  - Next button always active, visual errors via native `ng-invalid`/`ng-dirty` PrimeNG (no custom CSS)
  - `step-actions` factored once via `ng-template #stepActions` + `ngTemplateOutlet` (context: `activateCallback`) — DRY across steps
  - `NgTemplateOutlet` added to component imports
    > ℹ️ Out of scope (future tickets): Steps 2–5 (`p-step-panel [value]="2".."5"`) → S4-FE-005 to S4-FE-008; sequential `submit()` (`contractsService.create` + `router.navigate`) → S4-FE-009 (`contractsService`/`router` already injected but unused here, expected); edit mode (wizard/detail prefill) — missed in initial planning, deferred to S5-FE-CONTRACT-EDIT-001/002/003
- **Acceptance Criteria:**
  - ✅ Submitting Step 1 empty → all 4 fields become visually invalid (`ng-invalid`/`ng-dirty`), no navigation
  - ✅ Filling all 4 fields → Next advances to `value=2`
  - ✅ `goBack()` has no visible effect while Step 2 doesn't exist yet (`activeStep() > 1` stays false)
  - ✅ No compilation errors on `StepperModule` / `NgTemplateOutlet`

---

### S4-FE-005 : ContractForm Wizard — Step 2 (Periods) — inline editing + Season bulk generation

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 8
- **Branch :** `feat/S4-FE-005-contract-form-step2-periods`
- **Commit :** `feat(contracts): add ContractForm wizard step 2 — inline period editing with season bulk generation`

**Scope :**

`LocalContractPeriod` : `Omit<ContractPeriodDto, 'startDate' | 'endDate'> & { tempId: string; startDate: Date | null; endDate: Date | null }`, declared in `contract-form.component.ts`. Dates typed `Date | null` (not `string`) for direct binding with `p-datepicker`, without `$any()` coercion in the template.

`selectedSeasonId` : `signal<string | null>(null)` — Season selected in the `p-select` at the top of Step 2

`draftPeriods` : `signal<LocalContractPeriod[]>([])` — rows currently being edited, not yet confirmed

`localPeriods` : `signal<LocalContractPeriod[]>([])` — confirmed periods (✓), final state used at submit (S4-FE-009)

`onSeasonSelected(seasonId)` : regenerates `draftPeriods` from `allSeasonPeriods()` filtered by Season — one row per `SeasonPeriod`, `name` pre-filled, `startDate`/`endDate` converted to `Date` (`new Date(sp.startDate)`), `baseMealPlanId`/`minStay` left empty. Switching Season only regenerates unconfirmed rows; `localPeriods` (already validated) stays intact

`addManualDraftPeriod()` : adds an empty row (`seasonPeriodId: null`, `startDate: null`, `endDate: null`), fully manual entry

`updateDraftField(tempId, field, value)` : immutable mutation of a single field on a draft row

`confirmDraftPeriod(tempId)` : minimal guard (`name`/`startDate`/`endDate`/`baseMealPlanId` must not be empty) → moves the row from `draftPeriods` to `localPeriods`

`cancelDraftPeriod(tempId)` : removes a draft row without confirming it

`removeConfirmedPeriod(tempId)` : removes an already-confirmed row

`allSeasonPeriods` : `computed()`, flattens `seasons().flatMap(s => s.seasonPeriods ?? [])`

Draft table : inline inputs (`pInputText`, `p-datepicker` via `DatePickerModule` bound directly to `Date | null`, `p-select` for meal plan, `p-inputNumber`), ✓/✗ buttons per row

Confirmed table : read-only (`| date: 'dd/MM/yyyy'` via `DatePipe`, which natively accepts a `Date` object), delete button per row

`goNextFromStep2` : blocked if `localPeriods().length === 0`, active state + message (consistent with Step 1)

**Known technical debt, to be addressed in a follow-up ticket :**

- `[ngModel]` on `draftPeriods` mixed with `ReactiveFormsModule` (`FormsModule` added out of necessity) — no strict per-field validation, just a minimal `if` in `confirmDraftPeriod`
- Check whether `mealPlans()`/`allSeasonPeriods()` need a `tourOperatorId` filter on the frontend, or whether the backend (JWT) already guarantees isolation
- Physically remove the `contracts/contract-form/period-form-dialog/` folder (dead code — dialog abandoned mid-session, replaced by inline editing)

⚠️ Heads-up for S4-FE-009 (submit) : `LocalContractPeriod.startDate`/`endDate` are internally typed `Date | null`. The backend DTO (`CreateContractPeriodDto`) expects `startDate`/`endDate` as ISO strings (`@IsDateString()`). A `Date → string` conversion (`.toISOString()`) is required when building the `createPeriod()` payload — not before.

**Acceptance Criteria :**

- ✅ Selecting a Season → generates N draft rows (N = number of `SeasonPeriod`s for that Season), dates pre-filled as `Date`
- ✅ Switching Season → unconfirmed draft rows regenerated, already-confirmed (✓) rows preserved in `localPeriods`
- ✅ "Add Period" → adds an empty editable row, independent of any Season
- ✅ Confirming (✓) an incomplete row (e.g. missing meal plan) → no action, row stays in draft
- ✅ Confirming a valid row → appears in the confirmed periods table, disappears from draft
- ✅ Cancelling (✗) a draft row → removed without being added to `localPeriods`
- ✅ Deleting a confirmed row → removed from `localPeriods`
- ✅ "Next" on Step 2 with zero confirmed periods → error message, no navigation

---

### S4-FE-006 : ContractForm Wizard — Step 3 (Room Prices, PER_ROOM + PER_OCCUPANCY)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 8
- **Branch :** `feat/S4-FE-006-contract-form-step3-room-prices`
- **Commit :** `feat(contracts): add ContractForm wizard step 3 — room prices PER_ROOM/PER_OCCUPANCY`

**Concept of the day (Sprint 4 doc) :** `computed()` for complex derived logic — the most complex FE ticket, best tackled with a fresh mind.

**Planned scope (to be detailed in session, not yet built) :**

Local structure : `roomPricesByPeriod = signal<Record<string, RoomPriceDto[]>>({})`, one entry per `localPeriods` `tempId`

Target period selection (`p-select` showing `period.name` + dates) before configuring a room price

`roomType` selection + `p-radiobutton` for `PER_ROOM` / `PER_OCCUPANCY`

`PER_ROOM` : simple `p-inputnumber` for `pricePerNight`

`PER_OCCUPANCY` : dedicated `OccupancyConfigFormComponent` —

- `selectedRoomType = input.required<RoomType>()`
- `maxPax = computed(...)` — sum of `capacities[].maxPax` for the room type
- `numAdults`/`numChildren` : local signals
- `isOccupancyValid = computed(...)` — total > 0 and ≤ `maxPax()`
- `ratesPerAge = signal<Record<string, { rate: number; order: number }>>({})`
- `totalRate = computed(...)` — sum of the rates, displayed in real time

**Decisions inherited from S4-FE-005, to respect :**

Signals + immutable mutation (`update()`) pattern, no `FormArray`

If inline table editing is used (as in Step 2) : re-evaluate consistency with Samuel before proposing a dialog again — the lesson from S4-FE-005 is that inline editing better matches the real bulk-entry workflow

`LocalRoomPrice` (new type to create, modeled on `LocalContractPeriod`) will likely need to follow the same `Date | null` logic if date fields appear — but `RoomPriceDto` has no date field, so probably not applicable here, to confirm when opening the ticket

**Out of scope :** MealSupplements/StopSales (S4-FE-007/008), final submit (S4-FE-009)

**Acceptance Criteria (to be refined in session) :**

- ✅ `PER_ROOM` : configure a simple price, associated with a period + roomType
- ✅ `PER_OCCUPANCY` : configure 2 adults + 1 child, `totalRate` updates automatically
- ✅ Exceeding `maxPax()` → invalid configuration, visual feedback
- ✅ `nx test frontend` : unit test on `totalRate`/`maxPax` `computed()`

---

### S4-FE-006-BIS : Step 3 — PER_OCCUPANCY (BaseRate + AgePolicy)

- **Type :** Task
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feat/S4-FE-006-BIS`
- **Commit :** `feat(contracts): rework Step 3 PER_OCCUPANCY UI to card-based layout`

**Contexte :** S4-FE-006 a livré la matrice période × room type pour PER_ROOM
uniquement. PER_OCCUPANCY était différé — pas d'UI encore. Cette version du
ticket cible le backend réel issu de la refonte PER_OCCUPANCY (Sprint 4 BE) :
`BaseRate` (tarifs fixes par room type/période) + `AgePolicy` (règles par
tranche d'âge × sharingType), **pas** l'ancien `OccupancyRate` (matrice de
combinaisons adultes/enfants).

**Scope :**

- **Toggle de mode par ligne** (PER_ROOM / PER_OCCUPANCY) sur chaque
  `LocalRoomPrice` — inchangé par rapport à la version originale.

- **Sous-panneau PER_OCCUPANCY** — remplace la "liste dynamique de
  combinaisons" par **deux blocs distincts** :
  - Un formulaire `BaseRate` **unique** (pas une liste) : `halfDouble`,
    `single`, `thirdPersonAdult?`, `triple?`, `quadruple?` — un seul par
    (période, room type), reflète `@@unique([contractPeriodId, roomTypeId])`.
  - Une liste `AgePolicy` **dérivée des `AgeCategory` de l'hôtel**
    (`HotelsService.getAgeCategories(hotelId)`) : pour chaque tranche d'âge,
    deux valeurs possibles (`WITH_PARENTS`, `SEPARATE_ROOM`), reflète
    `@@unique([contractPeriodId, ageCategoryId, sharingType])`. Pas de
    "ligne dynamique ajoutable" — la liste est fixe, dérivée des tranches
    d'âge existantes de l'hôtel.

- **Capacity guard : retiré du scope.** La validation de capacité
  (`totalPax > totalMaxPax`) a été explicitement supprimée côté backend
  (décision actée : "les agents décident eux-mêmes des combinaisons
  pertinentes"). Il n'y a plus de fonction équivalente à
  `validateOccupancyAgainstCapacity()` à mirrorer.

- **`totalRate` calculé : retiré du scope.** Il n'y a plus de somme
  `ratesPerAge` à calculer — `BaseRate` a des champs fixes saisis
  directement par l'agent, pas de moteur de calcul (décision 7 du backend :
  hors périmètre immédiat).

- **Unicité** — deux règles distinctes désormais, pas une seule :
  - Un seul `BaseRate` par `LocalRoomPrice` (naturellement garanti si le
    formulaire n'est pas une liste).
  - Une seule `AgePolicy` par (tranche d'âge, sharingType) — naturellement
    garanti si la liste est dérivée des `AgeCategory` plutôt que saisie
    librement.

- **Validation stricte :**
  - PER_ROOM : `pricePerNight > 0` — inchangé.
  - PER_OCCUPANCY : `halfDouble > 0` et `single > 0` requis ;
    `thirdPersonAdult`/`triple`/`quadruple` optionnels si renseignés, `≥ 0` ;
    `AgePolicy.value ≥ 0` pour chaque tranche renseignée.

- **`goNextFromStep3`** : une ligne PER_OCCUPANCY sans `BaseRate` valide
  (`halfDouble`/`single` manquants ou nuls) doit compter comme non
  couverte — remplace la condition "zero occupancyRates" de la version
  originale.

### Hors scope

- Steps 4/5 (S4-FE-007/008), nettoyage `period-form-dialog` (dette S4-FE-005),
  conversion du payload final de soumission (S4-FE-009)
- **`OccupancyGuidance` : à confirmer avec toi (voir ci-dessous)** — n'était
  pas dans le ticket original, et sa place naturelle est ambiguë.

### Décisions à prendre en session (mises à jour)

- `p-radiobutton` vs `p-selectButton` pour le toggle — inchangé, à trancher.
- Placement du sous-panneau (inline vs composant séparé, attention à
  l'imbrication d'accordéons) — inchangé, à trancher.
- Confirmer que `AgeCategory` est bien chargé par hôtel (déjà validé côté
  backend : `AgeCategory` reste scopée par hôtel, décision 6) — la question
  originale portait sur le chargement frontend, toujours valable à vérifier.
- **Nouveau point à trancher :** `OccupancyGuidance` (les combinaisons
  indicatives) n'est **pas** scopée par période mais par `roomTypeId` seul —
  ça veut dire qu'elle ne fait probablement **pas partie de ce Step 3**
  (qui est structuré par période de contrat), mais plutôt d'un écran de
  gestion du room type lui-même (indépendant du contrat). Je ne l'ai donc
  pas incluse dans le scope ci-dessus. Confirme si c'est bien hors
  périmètre de ce ticket, ou si tu veux l'y intégrer quand même.

### Acceptance Criteria (mis à jour)

- ✅ Basculer un `LocalRoomPrice` en PER_OCCUPANCY vide `pricePerNight` et
  affiche le sous-panneau `BaseRate` + `AgePolicy`
- ✅ Le formulaire `BaseRate` est éditable, un seul par ligne
- ✅ La liste `AgePolicy` est dérivée des `AgeCategory` de l'hôtel, deux
  valeurs (`WITH_PARENTS`/`SEPARATE_ROOM`) par tranche
- ✅ `BaseRate` incomplet (`halfDouble`/`single` manquants) → ligne
  invalide, ne peut pas être confirmée
- ✅ Une ligne PER_OCCUPANCY sans `BaseRate` valide → période comptée comme
  non couverte par `goNextFromStep3`
- ✅ Rebasculer une ligne en PER_ROOM → `BaseRate`/`AgePolicy` de la ligne
  abandonnés, `pricePerNight` redevient éditable
- ✅ Aucune régression sur le flux PER_ROOM existant (tests S4-FE-006
  toujours valides)
- ✅ `nx build frontend` / `nx test frontend` passent sans erreur

---

### S4-FE-006-BIS — ContractForm Step 3 — Room Prices PER_OCCUPANCY

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feat/S4-FE-006-BIS-room-prices-per-occupancy`
- **Status :** Follow-up ticket — S4-FE-006 (PER_ROOM) is ✅ closed and merged

**Context :** S4-FE-006 shipped the period × room type matrix for `PER_ROOM` only. `PER_OCCUPANCY` (variable price per adults/children combo, rate per age bracket) was deferred — no UI yet.

**Scope :**

- Per-row mode toggle (`PER_ROOM` / `PER_OCCUPANCY`) on each `LocalRoomPrice` — `p-radiobutton` or `p-selectButton`, align with existing Runner pattern
- `PER_OCCUPANCY` sub-panel : dynamic rows (signals + immutable `update()`, no `FormArray`) with `numAdults`, `numChildren`, `ratesPerAge` (one input per `AgeCategory`, via existing `HotelsService.getAgeCategories(hotelId)`)
- Capacity guard : `numAdults + numChildren` ≤ `maxPax` of the `RoomType` (mirror backend `validateOccupancyAgainstCapacity()`)
- `totalRate` as `computed()`, sum of `ratesPerAge`, read-only
- Uniqueness : one row per `(numAdults, numChildren)` combo per `LocalRoomPrice` (mirrors backend `@@unique`)
- Strict validation : `pricePerNight > 0` (PER_ROOM), `ratesPerAge >= 0` + at least one occupancy row required (PER_OCCUPANCY)
- `goNextFromStep3` : a `PER_OCCUPANCY` row with zero `occupancyRates` must not count as "covered"

**Out of scope :** Steps 4/5 (S4-FE-007/008), `period-form-dialog/` cleanup (S4-FE-005 debt), final submit payload conversion (S4-FE-009)

**Decisions to make in session :** `p-radiobutton` vs `p-selectButton`; sub-panel placement (inline vs separate component, watch accordion nesting); confirm `AgeCategory` loading is hotel-scoped

**Acceptance Criteria :**

- ✅ Toggling a `LocalRoomPrice` to `PER_OCCUPANCY` clears `pricePerNight` and shows the occupancy sub-panel
- ✅ Adding an occupancy row → editable `numAdults`/`numChildren`/`ratesPerAge`, `totalRate` updates live
- ✅ Exceeding `maxPax` for the room type → row flagged invalid, feedback visible, cannot be confirmed
- ✅ Duplicate `(numAdults, numChildren)` on the same `LocalRoomPrice` → rejected with a clear message
- ✅ A `PER_OCCUPANCY` row with zero occupancy rows → period counted as **uncovered** by `goNextFromStep3`
- ✅ Switching a row back to `PER_ROOM` → occupancy rows discarded, `pricePerNight` editable again
- ✅ No regression on existing `PER_ROOM` flow (S4-FE-006 tests still pass)
- ✅ `nx build frontend` / `nx test frontend` pass with no errors

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
- **Commits :**
  - `chore(contracts): scaffold ContractsListComponent and ContractFormComponent`
  - `chore(routing): add contracts routes to management.routes.ts`
  - `chore(sidebar): add contracts nav entry`
  - `docs(sprint4): update S4-FE-010 ticket with final routing decisions`

**Décision finale — divergence avec le plan initial :**

Le snippet original proposait Contracts en top-level (`app.routes.ts`, `loadChildren` séparé,
guards dupliqués sur chaque route enfant). **Rejeté** : Contracts est fonctionnellement au même
niveau d'autorisation que Hotels/Seasons/MealPlans (confirmé par `@Roles(UserRole.ADMIN, UserRole.MANAGER)`
sur `ContractsController` backend) — dupliquer les guards aurait décorrélé une règle métier de sa
représentation dans l'arbre de routes.

```typescript
// management.routes.ts — entrée inline, pas de fichier séparé (cohérent avec hotels/seasons)
// Route componentless : pas de shell wrapper, <router-outlet /> parent suffit
{
  path: 'contracts',
  children: [
    { path: '', redirectTo: 'contracts-list', pathMatch: 'full' },
    {
      path: 'contracts-list',
      loadComponent: () =>
        import('./contracts/contracts-list/contracts-list.component')
          .then(m => m.ContractsListComponent),
    },
    {
      path: 'create',
      loadComponent: () =>
        import('./contracts/contract-form/contract-form.component')
          .then(m => m.ContractFormComponent),
    },
    {
      path: ':contractId/edit',
      loadComponent: () =>
        import('./contracts/contract-form/contract-form.component')
          .then(m => m.ContractFormComponent),
    },
  ],
},
```

**Convention actée :** dossier/classe pluriel pour les listes (`contracts-list` → `ContractsListComponent`),
singulier pour les formulaires traitant une seule entité (`contract-form` → `ContractFormComponent`).
Exception consciente à la stricte cohérence avec `hotels-form`/`seasons-form` (pluriel) — motivée par la
sémantique (un form ne traite jamais plusieurs contrats à la fois), pas par un pattern général.

```typescript
// sidebar.component.ts — inséré après Currencies, avant Supplements
// (Contracts agrège Hotel/Market/Currency/SeasonPeriod → dépend de tout ce qui précède)
{
  label: 'Contracts',
  icon: 'pi pi-sitemap',
  route: '/management/contracts',
  roles: ['ADMIN', 'MANAGER'],
},
```

**Guards :** hérités du parent `management` (`RoleGuard`, `roles: ['ADMIN', 'MANAGER']`) posé dans
`app.routes.ts`. Pas de duplication sur les routes enfants — le router Angular propage les guards
de haut en bas dans l'arbre avant de résoudre les `children`/`loadChildren`.

**Acceptance Criteria :**

- ✅ `ContractsListComponent` et `ContractFormComponent` scaffoldés (standalone, OnPush)
- ✅ Routes nichées dans `MANAGEMENT_ROUTES`, componentless
- ✅ `/management/contracts/contracts-list` compile et navigue sans erreur
- ✅ Entrée sidebar avec icône unique, `roles` filtrant l'affichage (indépendant du guard qui filtre la navigation)

---

## S4-FE-014-BIS : OccupancyGuidance — gestion sur la fiche Room Type

- **Type :** Feature
- **Priority :** P2
- **Story Points :** à estimer
- **Emplacement :** `Hotels > [hotel] > Room Types` (fiche room type existante)

**Contexte :** `OccupancyGuidance` (combinaisons indicatives d'occupation,
non bloquantes) est scopée uniquement par `roomTypeId` — aucune dépendance
à un contrat ni une période. Elle n'a donc pas sa place dans le wizard de
contrat (Steps 1-5, dont S4-FE-006-BIS) et se gère plutôt là où le room
type lui-même est administré, au même titre que `RoomTypeCapacity`.

**Dépend de :** S4-BE-003-BIS (`OccupancyGuidancesController`,
routes `occupancy-guidances` / `occupancy-guidances/room-types/:roomTypeId`),
S4-BE-008-BIS (service)

### Scope

- Section/onglet dédié sur la fiche room type existante, listant les
  `OccupancyGuidance` du room type (`GET occupancy-guidances/room-types/:roomTypeId`)
- Création : `description` (texte libre), `maxAdults`/`maxTeens`/
  `maxChildren`/`maxInfants` (entiers, défaut 0 si omis)
- Plusieurs guidances par room type autorisées (pas de contrainte
  d'unicité côté backend — pas de règle à répliquer côté frontend)
- Édition / suppression d'une guidance existante

### Hors scope

- Toute validation croisée avec `RoomTypeCapacity` (relation entre les
  deux non tranchée côté backend — cf. discussion ouverte, à traiter
  séparément)
- Utilisation de ces guidances dans le wizard de contrat (purement
  informationnel pour l'instant, aucun lien avec `BaseRate`/`AgePolicy`)

### Acceptance Criteria

- ✅ La fiche room type affiche la liste des `OccupancyGuidance` existantes
- ✅ Création d'une guidance sans capacités précisées → les 4 champs
  `max...` valent 0
- ✅ Édition et suppression fonctionnelles
- ✅ `nx build frontend` / `nx test frontend` passent sans erreur

---

### S4-REFACTOR-001 : Harmoniser la gestion des erreurs Prisma sur les foreign keys

- **Type :** Refactor
- **Priority :** P2
- **Story Points :** 3
- **Branch :** `refactor/S4-REFACTOR-001-prisma-error-handling`
- **Commit :** `refactor(contracts): align Prisma error handling with actual schema relations`

**Contexte :** Identifié pendant S4-BE-009 et S4-BE-010. La gestion des codes
d'erreur Prisma (P2002/P2003/P2025) doit refléter exactement les relations
réelles du schéma — ni en manquer (trou de robustesse), ni en gérer qui ne
peuvent jamais survenir (code mort, fausse impression de sécurité).

**Catégorie A — P2003 manquant sur une vraie foreign key modifiable :**

| Méthode           | Foreign key concernée              | Statut            |
| ----------------- | ---------------------------------- | ----------------- |
| `updateRoomPrice` | `roomTypeId`                       | ❌ P2003 non géré |
| `createPeriod`    | `seasonPeriodId`, `baseMealPlanId` | ❌ P2003 non géré |
| `updatePeriod`    | `seasonPeriodId`, `baseMealPlanId` | ❌ P2003 non géré |

**Catégorie B — code mort, gère un cas structurellement impossible :**

| Méthode                    | Code géré à tort        | Pourquoi impossible                                                                                  |
| -------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `removeMealPlanSupplement` | P2003 → `HAS_RELATIONS` | Aucune table ne référence `MealPlanSupplement` par foreign key — rien ne peut bloquer sa suppression |

**Méthode de vérification à appliquer à CHAQUE méthode create/update/delete :**

1. Lister les champs `*Id` envoyés dans `data` → ce sont les P2003 potentiels (create/update)
2. Lister les tables qui ont une `@relation` pointant vers l'entité qu'on supprime
   → seulement celles-là justifient un P2003/HAS_RELATIONS sur delete
3. Si aucune table enfant n'existe → ne pas gérer HAS_RELATIONS, point.

**Modifications nécessaires :**

- `updateRoomPrice`, `createPeriod`, `updatePeriod` — ajouter P2003 (Catégorie A)
- `removeMealPlanSupplement` — retirer le bloc P2003/HAS_RELATIONS (Catégorie B)
- Auditer `create`/`update`/`remove` sur `Contract` avec la même grille
- Auditer les futures méthodes `StopSalesDate` (S4-BE-010) dès leur création,
  pour éviter de reproduire l'un ou l'autre problème dès le départ

**Acceptance Criteria :**

- ✅ Chaque méthode gère exactement les codes d'erreur que sa relation au
  schéma justifie — ni plus, ni moins
- ✅ Aucun bloc `if (error.code === ...)` ne correspond à une relation
  inexistante dans `schema.prisma`
- ✅ Messages d'erreur identifiant précisément l'entité concernée

---

# S4-REFACTOR-002 : Factoriser les patterns répétés dans ContractsService

- **Type :** Refactor
- **Priority :** P2
- **Story Points :** 3
- **Branch :** `refactor/S4-REFACTOR-002-service-deduplication`
- **Commit :** `refactor(contracts): extract repeated guard and error-handling patterns`

## Contexte

`contracts.service.ts` dépasse 400 lignes, avec une longueur diffuse
(méthodes proportionnelles, pas de "monstre" isolé). L'audit a identifié
deux patterns répétés verbatim à travers plusieurs méthodes — pas un
problème de répartition des responsabilités (chaque endpoint a
légitimement besoin du contexte `Contract`), mais une vraie duplication
structurelle à extraire.

> ⚠️ À traiter **après** `S4-REFACTOR-001`. On ne factorise pas une gestion
> d'erreurs qu'on sait incomplète — sinon le nouveau helper hérite des
> mêmes trous (P2003 manquants) et les généralise par erreur à plus
> d'endroits encore.

## Pattern 1 — `getPeriodOrThrow`

Répété **3 fois** verbatim (`createRoomPrice`, `createMealPlanSupplement`,
`createStopSalesDate`) :

```typescript
const period = await this.contractRepository.findContractPeriod(
  periodId,
  contractId
);
if (!period) {
  throw new NotFoundException(`Contract Period ${periodId} not found`);
}
```

**Extraction proposée :**

```typescript
private async getPeriodOrThrow(
  periodId: string,
  contractId: string,
): Promise<ContractPeriod> {
  const period = await this.contractRepository.findContractPeriod(periodId, contractId);
  if (!period) {
    throw new NotFoundException(`Contract Period ${periodId} not found`);
  }
  return period;
}
```

Chaque appelant remplace son bloc par :

```typescript
const period = await this.getPeriodOrThrow(periodId, contractId);
```

## Pattern 2 — `handleRepositoryError`

Le bloc `catch (error) { if (error instanceof RepositoryException) { ... } throw error; }`
revient dans presque toutes les méthodes `create*`/`update*`. Dans chaque
occurrence, le **`RepositoryResult` mappe toujours vers la même classe
d'exception NestJS** (`CONFLICT → ConflictException`, `NOT_FOUND →
NotFoundException`, `HAS_RELATIONS → ConflictException`) — seul le
**message** varie selon l'entité/le contexte métier. Vérifié sur 4+
occurrences existantes avant extraction (`createPeriod`, `updatePeriod`,
`createRoomPrice`, `createMealPlanSupplement`).

**Extraction proposée :**

```typescript
private static readonly EXCEPTION_MAP: Partial<
  Record<RepositoryResult, new (message: string) => HttpException>
> = {
  [RepositoryResult.CONFLICT]: ConflictException,
  [RepositoryResult.NOT_FOUND]: NotFoundException,
  [RepositoryResult.HAS_RELATIONS]: ConflictException,
};

private handleRepositoryError(
  error: unknown,
  messages: Partial<Record<RepositoryResult, string>>,
): never {
  if (error instanceof RepositoryException) {
    const message = messages[error.result];
    const ExceptionClass = ContractsService.EXCEPTION_MAP[error.result];
    if (message && ExceptionClass) {
      throw new ExceptionClass(message);
    }
  }
  throw error; // pas une RepositoryException, OU result non mappé → fail loud
}
```

**Usage côté appelant :**

```typescript
try {
  return await this.contractRepository.createRoomPrice(...);
} catch (error) {
  this.handleRepositoryError(error, {
    [RepositoryResult.CONFLICT]: `A room price already exists for this room type in this period`,
    [RepositoryResult.NOT_FOUND]: `Room type ${dto.roomTypeId} not found`,
  });
}
```

**Comportement de garde explicitement validé :**

- Si `error` n'est pas une `RepositoryException` → relancée telle quelle (`throw error`), jamais avalée.
- Si `error.result` n'a pas d'entrée dans `messages` fourni par l'appelant → relancée telle quelle aussi (pas de message silencieusement absent, pas de réponse HTTP 200 sur un échec réel).
- Le mapping `RepositoryResult → classe d'exception` est fixe et unique, écrit une seule fois — il ne varie jamais selon la méthode appelante.

## Hors scope (ne pas mélanger avec ce ticket)

- La correction des codes d'erreur manquants/morts → `S4-REFACTOR-001`.
- Tout découpage en plusieurs fichiers/services → à réévaluer **après**
  ce ticket, seulement si la longueur du fichier reste un problème une
  fois la duplication éliminée.

## Acceptance Criteria

- ✅ `getPeriodOrThrow` introduite et utilisée dans les 3 occurrences identifiées
- ✅ `handleRepositoryError` introduite et utilisée dans toutes les méthodes `create*`/`update*` concernées
- ✅ Aucun message d'erreur perdu ou modifié par rapport au comportement actuel (sauf corrections déjà actées dans `S4-REFACTOR-001`)
- ✅ Une erreur non mappée ou non-`RepositoryException` continue de se propager (`throw error`), jamais avalée silencieusement
- ✅ `nx build backend` → 0 erreur
- ✅ Coverage des tests (`S4-BE-011`) inchangé ou amélioré après refactor

---

# S4-BE-011 : Tests unitaires ContractsService

- **Type :** Test
- **Priority :** P1
- **Story Points :** 4
- **Branch :** `test/S4-BE-011-contracts-tests`
- **Commit :** `test(contracts): add unit tests for contracts service`

## Contexte

Premiers tests unitaires NestJS du sprint. On mocke `ContractRepository`
(l'abstract class), **pas** `PrismaService` directement — le `ContractsService`
ne connaît que le Repository, jamais Prisma. Mocker `PrismaService` testerait
une couche que le Service n'appelle pas directement, et casserait l'isolation
Service/Repository construite tout le sprint.

> ⚠️ À traiter **après** `S4-REFACTOR-001`. On ne fige pas par des tests un
> comportement qu'on sait incomplet (P2003 manquants, P2003 mort sur
> `removeMealPlanSupplement`) et qu'on va modifier dans le même sprint.

## Scénarios minimum

1. Chevauchement de `ContractPeriod` dans un même contrat → `ConflictException`
2. Auto-fill des dates depuis `SeasonPeriod` quand `seasonPeriodId` est fourni
3. `PER_OCCUPANCY` dépasse la capacité de la room → `BadRequestException`
4. `totalRate` recalculé et vérifié à partir de `ratesPerAge`
5. `StopSalesDate` hors plage `ContractPeriod.startDate/endDate` → `BadRequestException`

## Acceptance Criteria

- ✅ Coverage > 80% sur `contracts.service.ts`
- ✅ Aucun test ne touche Prisma réellement (mock de `ContractRepository`)
- ✅ Chaque test isole un seul comportement métier

## Révision (45 min) — bilan semaine BE

1. Qu'est-ce qu'un bon test unitaire vs un test qui teste Prisma ?
2. Quels scénarios t'ont surpris en les écrivant ?

**Bilan semaine BE :**

- Migration safe en production : maîtrisé
- Nested resources avec validation métier : maîtrisé
- PER_OCCUPANCY + capacités : maîtrisé
- Tests unitaires NestJS : à valider à l'issue de ce ticket

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

### S4-BE-012 : Tests unitaires serializeDates

- **Type :** Test
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `test/S4-BE-012-serialize-dates-tests`
- **Commit :** `test(common): add unit tests for serializeDates`

## Contexte

`serializeDates<T>()` (S4-FIX-003) est une fonction pure et récursive,
testable en isolation — pas de mock nécessaire, pas de dépendance à
Prisma ou NestJS.

## Fichier

`apps/backend/src/common/serialize-dates.util.spec.ts`

## Scénarios minimum

1. Une `Date` seule → convertie en `string` ISO
2. Un objet avec une `Date` au premier niveau → clé convertie, reste inchangé
3. Un objet avec des `Date` imbriquées à plusieurs niveaux → toutes converties
4. Un tableau de `Date` → chaque élément converti
5. Un tableau d'objets contenant des `Date` → conversion récursive à travers le tableau
6. `null` → retourné tel quel, jamais transformé en objet vide
7. `undefined` → retourné tel quel
8. Valeurs primitives (`string`, `number`, `boolean`) → traversent sans modification
9. Un `number` ressemblant à un timestamp → reste un `number`, jamais confondu avec une `Date`
10. Non-mutation : l'objet source reste inchangé après l'appel
11. Objet vide `{}` et tableau vide `[]` → retournés tels quels, sans erreur

## Acceptance Criteria

- ✅ Coverage 100% sur `serialize-dates.util.ts`
- ✅ Chaque scénario isole un seul comportement
- ✅ Aucun test ne dépend de Prisma ou d'un mock
- ✅ `nx test backend` → 0 échec

---

# S4-FIX-001 : `createRoomPrice` ne retourne pas les `occupancyRates` créées

- **Type :** Fix
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `fix/S4-FIX-001-room-price-response`
- **Commit :** `fix(contracts): include occupancyRates in createRoomPrice response`

## Contexte

Découvert en testant `S4-BE-008` manuellement via Postman le 25 juin.
`POST /contracts/:id/periods/:periodId/room-prices` en mode `PER_OCCUPANCY`
renvoie un `201` avec le `RoomPrice` créé, mais **sans ses `occupancyRates`**
— alors qu'elles sont bien créées en DB (vérifié via `GET /contracts/:id`).

Ce n'est pas un bug de calcul ni un code d'erreur manquant — le
`totalRate` est correctement calculé et persisté. C'est un manque de
complétude dans la réponse HTTP : le client (le futur wizard frontend,
`S4-FE-006`) a besoin de voir immédiatement le `totalRate` calculé par
chaque ligne d'occupancy après la création, sans devoir refaire un
`GET /contracts/:id` complet juste pour ça.

## Cause

```typescript
// prisma-contract.repository.ts — createRoomPrice
async createRoomPrice(...): Promise<RoomPrice> {
  return await this.prisma.$transaction(async (tx) => {
    const roomPrice = await tx.roomPrice.create({
      data: { ...dto, contractPeriodId },
    });

    if (occupancyRates?.length) {
      await tx.occupancyRate.createMany({ ... });
    }

    return roomPrice; // ← pas d'include, occupancyRates absent de la réponse
  });
}
```

## Correction

Recharger le `RoomPrice` avec son `include` après la création des
`OccupancyRate`, à l'intérieur de la même transaction (pour rester
atomique) :

```typescript
return await this.prisma.$transaction(async (tx) => {
  const roomPrice = await tx.roomPrice.create({
    data: { ...dto, contractPeriodId },
  });

  if (occupancyRates?.length) {
    await tx.occupancyRate.createMany({
      data: occupancyRates.map((rate) => ({
        ...rate,
        roomPriceId: roomPrice.id,
      })),
    });
  }

  return tx.roomPrice.findUniqueOrThrow({
    where: { id: roomPrice.id },
    include: { occupancyRates: true },
  });
});
```

## Acceptance Criteria

- ✅ `POST .../room-prices` en `PER_OCCUPANCY` renvoie `occupancyRates: [...]`
  peuplé avec `totalRate` dans la réponse, sans round-trip supplémentaire
- ✅ Le type de retour de `createRoomPrice` reflète la présence de
  `occupancyRates` (vérifier `RoomPrice` vs un type étendu si nécessaire
  côté `ContractRepository`)
- ✅ `PER_ROOM` (sans `occupancyRates`) continue de fonctionner sans
  régression — `occupancyRates: []` toujours présent dans la réponse
- ✅ `nx build backend` → 0 erreur

---

### S4-FIX-002 : Exposer `periodsCount` + relations sur `Contract` — cohérence complète

- **Type :** Fix / Enhancement
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `fix/S4-FIX-002-contract-periods-count`
- **Status :** ✅ Done

## Contexte (complément)

`findAll` a été corrigé en premier (voir décisions ci-dessous), révélant un
bug de typage plus large : `create`, `update`, `findOne` retournent
actuellement `Contract` (modèle Prisma brut, `@prisma/client`) — sans
`hotel`, `market`, `currency` peuplés, ni `periodsCount`.

**Impact concret identifié :** `ContractsService` (frontend) pousse
directement la réponse de `create()`/`update()` dans `_contracts$`
(pattern local sans `reload()`, voir S4-FE-002) pour éviter un refetch
coûteux. Si ces réponses n'ont pas la même forme que celles de `findAll()`,
la liste affiche des colonnes vides pour tout contrat fraîchement créé/modifié
jusqu'au prochain rechargement complet — bug silencieux, pas juste
une question de "cohérence de typage".

## Scope élargi — méthode par méthode

| Méthode   | Besoin réel                                                       | Justification                                                                                                                     |
| --------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `findAll` | `hotel`, `market`, `currency`, `periodsCount`                     | ✅ déjà fait                                                                                                                      |
| `findOne` | `hotel`, `market`, `currency`                                     | écran détail/édition — `periods` chargé en entier séparément, `periodsCount` non nécessaire ici (redondant avec `periods.length`) |
| `create`  | `hotel`, `market`, `currency`, `periodsCount` (= 0 à la création) | réponse poussée directement dans `_contracts$` frontend, doit matcher la forme de `findAll`                                       |
| `update`  | `hotel`, `market`, `currency`, `periodsCount`                     | même raison que `create`                                                                                                          |

## Modifications nécessaires

- `prisma-contract.repository.ts` : ajouter le même `include` (`hotel`,
  `market`, `currency`) à `findOne`, `create`, `update`. `_count` uniquement
  nécessaire pour `findAll`/`create`/`update` (pas `findOne`, sauf si on
  décide de rester cohérent partout par simplicité — à trancher).
- Réutiliser `mapToContract()` (déjà extrait pour `findAll`) sur les résultats
  de `findOne`, `create`, `update`.
- `contracts.service.ts` (backend) : changer les types de retour de `findOne`,
  `create`, `update` de `Contract` (Prisma) vers `SharedContract`.

## Acceptance Criteria

- ✅ `findAll`, `findOne`, `create`, `update` retournent tous `SharedContract`
  avec `hotel`/`market`/`currency` peuplés
- ✅ `create`/`update` incluent `periodsCount` (0 pour un `create`, valeur
  réelle pour `update`)
- ✅ `ContractsService` frontend (`_contracts$`) reste visuellement cohérent
  après un `create`/`update` local, sans `reload()`
- ✅ `tsc --noEmit -p apps/backend/tsconfig.build.json` → 0 erreur
- ✅ `tsc --noEmit -p apps/frontend/tsconfig.app.json` → 0 erreur

---

### S4-FIX-003 : Sérialisation récursive des dates dans le `ContractRepository`

- **Type :** Fix
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `fix/S4-FIX-003-serialize-nested-dates`
- **Commit :** `fix(common): add recursive date serialization utility`
- **Status :** ✅ Done

## Contexte

Découvert pendant `S4-FIX-002`. `ContractsRepository.findOne()` charge
`periods` en profondeur (`periods.seasonPeriod`, `periods.roomPrices.occupancyRates`,
`periods.mealPlanSupplements`, `periods.stopSalesDates`) — contrairement à
`findAll`/`create`/`update` qui restent au premier niveau via `CONTRACT_INCLUDE`.

`mapToContract()` convertissait à l'origine `createdAt`/`updatedAt` du `Contract`
lui-même. Les dates imbriquées plus profondément (`ContractPeriod.startDate/endDate`,
`SeasonPeriod.startDate/endDate/createdAt/updatedAt`, et toute autre date
présente dans les relations chargées) restaient des objets `Date` Prisma
au lieu de `string` ISO — non conformes au type partagé `ContractPeriod`,
`SeasonPeriod`, etc.

**Solution retenue :** pas de mapping manuel niveau par niveau (fragile,
oubli facile si un nouveau champ `Date` est ajouté plus tard) — une fonction
utilitaire générique et récursive qui convertit toute instance `Date`
rencontrée en `string` ISO, à n'importe quelle profondeur.

## Décision révisée pendant l'implémentation — SRP entre `mapToContract` et `serializeDates`

Le découpage initial gardait la conversion de dates _top-level_
(`createdAt`/`updatedAt`) dans `mapToContract()`, et ne réservait
`serializeDates()` qu'aux dates imbriquées (`periods.*`) dans `findOne`.

Revu et corrigé : **`mapToContract()` ne doit plus toucher aux dates du tout.**

- `mapToContract()` = mapping **structurel** Prisma → type partagé uniquement
  (`_count.periods → periodsCount`, choix des champs exposés). Aucune
  connaissance des dates.
- `serializeDates()` = **seule** responsable de toute conversion `Date → string`,
  à n'importe quelle profondeur, sur n'importe quel objet.

Mélanger les deux dans `mapToContract()` aurait dupliqué la logique de
conversion de dates à deux endroits (une fois pour le top-level dans
`mapToContract`, une fois en profondeur via `serializeDates`) — violation
du SRP identifiée et corrigée avant merge.

### Conséquence sur le typage de `mapToContract()`

Comme `mapToContract()` ne convertit plus `createdAt`/`updatedAt`, son type
de retour ne peut plus être `SharedContract` (qui exige `string`) sans
mentir sur ce qu'elle renvoie réellement (`Date`). Type de retour corrigé :

```typescript
private mapToContract<
  T extends Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>,
>(
  contract: T,
): Omit<SharedContract, 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
} {
  const { _count, ...rest } = contract;
  return {
    ...rest,
    periodsCount: _count.periods,
  };
}
```

Le générique `T extends ...` accepte tout payload Prisma qui a _au moins_
la forme de `CONTRACT_INCLUDE`, y compris une version enrichie avec
`periods` en profondeur (cas de `findOne`).

### Conséquence sur le typage de `serializeDates()`

`serializeDates<T>(value: T): T` mentait aussi : elle prétendait renvoyer
le même type qu'en entrée, alors qu'elle transforme les `Date` en `string`.
Introduction d'un mapped type récursif pour l'exprimer honnêtement :

```typescript
type DeepDateToString<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? DeepDateToString<U>[]
    : T extends object
      ? { [K in keyof T]: DeepDateToString<T[K]> }
      : T;

export function serializeDates<T>(value: T): DeepDateToString<T> {
  if (value instanceof Date) {
    return value.toISOString() as DeepDateToString<T>;
  }

  if (Array.isArray(value)) {
    return (value as unknown[]).map((item) =>
      serializeDates(item)
    ) as DeepDateToString<T>;
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeDates(val);
    }
    return result as DeepDateToString<T>;
  }

  return value as DeepDateToString<T>;
}
```

Bénéfice concret : plus aucun cast (`as SharedContract` ou pire, un double
cast `as unknown as SharedContract`) n'est nécessaire aux points d'appel.
`serializeDates(this.mapToContract(contract))` s'infère naturellement vers
un type compatible avec `SharedContract`, vérifié par TypeScript.

**Points d'attention validés à l'implémentation :**

- Ordre des `if` : `value instanceof Date` **avant** le test
  `typeof value === 'object'`, car une `Date` est aussi un `object` en
  JavaScript — l'inverser romprait la conversion.
- `value !== null && typeof value === 'object'` protège contre le piège
  classique `typeof null === 'object'`.
- Fonction pure, sans mutation de l'objet d'origine — vérifié : `result`
  est toujours un nouvel objet, jamais une réécriture de `value`.
- `Array.isArray()` et `Object.entries()` sont typés par TypeScript avec
  des signatures qui retournent `any`/`any[]` sur un paramètre générique —
  cast explicite en `unknown[]` / `Record<string, unknown>` pour éviter
  toute fuite de `any` dans `item`/`val` (règle stricte du projet : jamais
  de `any`, même implicite).

## Décision révisée — portée de `serializeDates` sur `findAll`/`create`/`update`

Le scope initial excluait `findAll`/`create`/`update` de `serializeDates`,
au nom d'un coût de parcours récursif jugé inutile sur des objets sans
dates imbriquées (`mapToContract` seul suffisait, faisait déjà la
conversion top-level).

**Invalidé après revue :** cette justification perf reposait sur une
prémisse fausse une fois que `mapToContract` a été dépouillée de toute
logique de dates (voir décision ci-dessus). Sans cette étape,
`findAll`/`create`/`update` renverraient des `Date` Prisma brutes sur
`createdAt`/`updatedAt`, non conformes à `SharedContract`.

Par ailleurs, l'argument de coût ne tenait pas à l'analyse : ces trois
méthodes n'ont que 2 champs `Date` au premier niveau — un parcours
récursif dessus est négligeable, pas une optimisation prématurée
justifiée.

**Décision finale :** `serializeDates` s'applique uniformément aux 4
méthodes (`findAll`, `findOne`, `create`, `update`) — une seule source de
vérité pour toute conversion de dates dans le repository, cohérent avec
l'objectif initial de `serializeDates` (généraliser, pas traiter un cas
isolé).

## Application dans `prisma-contract.repository.ts`

```typescript
async findAll(
  tourOperatorId: string,
  query?: ContractQuery,
): Promise<PaginatedResult<SharedContract>> {
  const { limit, offset, hotelId, marketId } = query ?? {};

  const where: Prisma.ContractWhereInput = {
    tourOperatorId,
    hotelId,
    marketId,
  };

  const [data, total] = await this.prisma.$transaction([
    this.prisma.contract.findMany({
      where,
      include: CONTRACT_INCLUDE,
      take: limit,
      skip: offset,
    }),
    this.prisma.contract.count({ where }),
  ]);

  const mappedData = data.map((contract) => this.mapToContract(contract));

  return {
    data: serializeDates(mappedData),
    total,
    limit,
    offset,
  };
}

async findOne(
  id: string,
  tourOperatorId: string,
): Promise<SharedContract | null> {
  const contract = await this.prisma.contract.findUnique({
    where: { id, tourOperatorId },
    include: {
      ...CONTRACT_INCLUDE,
      periods: {
        include: {
          seasonPeriod: true,
          baseMealPlan: true,
          roomPrices: {
            include: {
              occupancyRates: true,
            },
          },
          mealPlanSupplements: true,
          stopSalesDates: true,
        },
      },
    },
  });

  if (!contract) {
    return null;
  }

  return serializeDates(this.mapToContract(contract));
}

async create(
  dto: CreateContractDto,
  tourOperatorId: string,
): Promise<SharedContract> {
  try {
    const createdContract = await this.prisma.contract.create({
      data: { ...dto, tourOperatorId },
      include: CONTRACT_INCLUDE,
    });
    return serializeDates(this.mapToContract(createdContract));
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      throw new RepositoryException(RepositoryResult.CONFLICT);
    throw error;
  }
}

async update(
  id: string,
  dto: UpdateContractDto,
  tourOperatorId: string,
): Promise<SharedContract> {
  try {
    const updatedContract = await this.prisma.contract.update({
      where: { id, tourOperatorId },
      include: CONTRACT_INCLUDE,
      data: dto,
    });
    return serializeDates(this.mapToContract(updatedContract));
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      throw new RepositoryException(RepositoryResult.CONFLICT);
    throw error;
  }
}
```

## Hors scope

- Pas de généralisation immédiate de `serializeDates` à `Season`/`Hotel` —
  écrite de façon générique et réutilisable, mais son application à
  d'autres modules attend un besoin concret, pas anticipée ici.

## Acceptance Criteria

- ✅ `serializeDates<T>()` créée dans `apps/backend/src/common/`, typée
  avec `DeepDateToString<T>` (aucun `any`, aucun double cast au point
  d'appel), testée isolément
- ✅ `mapToContract()` ne contient plus aucune logique de conversion de
  dates — mapping structurel uniquement (SRP)
- ✅ `findAll`, `findOne`, `create`, `update` appliquent tous
  `serializeDates(this.mapToContract(...))` de façon uniforme
- ✅ `GET /contracts/:id` renvoie toutes les dates (top-level et
  imbriquées dans `periods`) en `string` ISO, aucune `Date` Prisma ne fuit
  dans la réponse JSON
- ✅ `periodsCount` reste un `number` intact après passage par
  `serializeDates`
- ✅ `tsc --noEmit -p apps/backend/tsconfig.build.json` → 0 erreur
- ✅ Test manuel via Postman/console : `console.log` du résultat de
  `findOne` côté frontend, vérifier qu'aucun champ n'est un objet `Date`
  (`typeof field !== 'object'` pour toutes les dates)

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

---

# Sprint 4 — Refonte PER_OCCUPANCY (Tickets de correction)

> **Session de design du 18/07/2026**
>
> Décision centrale : le modèle `OccupancyRate` (saisie de chaque combinaison d'occupation) est remplacé par `BaseRate` + `AgePolicy` + `OccupancyGuidance`.
>
> `OccupancyRate` reste en base (soft delete) pour compatibilité mais n'est plus créé par le backend.
>
> `AgePolicy` reste en version simplifiée pour cette itération : pas de `ruleType`/`baseRateRef`, juste `sharingType` + `value` brut. La sémantique (montant vs pourcentage) est portée par l'écran, pas par la donnée.

---

## S4-BE-001-BIS : Prisma — ajouter les nouvelles tables PER_OCCUPANCY

- **Type :** Task
- **Priority :** P0 (bloque tous les autres tickets de la refonte)
- **Story Points :** 3
- **Branch :** `chore/S4-BE-001-BIS-prisma-per-occupancy-tables`
- **Commit :** `chore(prisma): add BaseRate, AgePolicy, OccupancyGuidance and BillingUnit`

**Contexte :** S4-BE-001 a créé le schéma initial (Season, SeasonPeriod, Contract, ContractPeriod, RoomPrice, OccupancyRate, MealPlanSupplement, StopSalesDate). Ce ticket ajoute les tables nécessaires à la refonte du modèle PER_OCCUPANCY.

**Scope :**

### 1. Nouvelles énumérations

```prisma
enum SharingType {
  WITH_PARENTS
  SEPARATE_ROOM
}

enum BillingUnit {
  PER_NIGHT
  PER_STAY
}
```

### 2. Nouvelles tables

**BaseRate** — tarifs de base saisis manuellement, par (contractPeriod, roomType) :

```prisma
model BaseRate {
  id               String         @id @default(cuid())
  contractPeriodId String
  roomTypeId       String

  halfDouble       Decimal        @db.Decimal(10, 2)
  single           Decimal        @db.Decimal(10, 2)
  thirdPersonAdult Decimal?       @db.Decimal(10, 2)

  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  contractPeriod   ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  roomType         RoomType       @relation(fields: [roomTypeId], references: [id])

  @@unique([contractPeriodId, roomTypeId])
  @@index([contractPeriodId])
  @@index([roomTypeId])
  @@map("base_rates")
}
```

**AgePolicy** — règles par tranche d'âge, par (contractPeriod, ageCategory, sharingType) :

```prisma
model AgePolicy {
  id               String         @id @default(cuid())
  contractPeriodId String
  ageCategoryId    String

  sharingType      SharingType
  value            Decimal        @db.Decimal(10, 4)

  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  contractPeriod   ContractPeriod @relation(fields: [contractPeriodId], references: [id], onDelete: Cascade)
  ageCategory      AgeCategory    @relation(fields: [ageCategoryId], references: [id])

  @@unique([contractPeriodId, ageCategoryId, sharingType])
  @@index([contractPeriodId])
  @@index([ageCategoryId])
  @@map("age_policies")
}
```

**OccupancyGuidance** — combinaisons autorisées par roomType (garde-fou mou) :

```prisma
model OccupancyGuidance {
  id          String   @id @default(cuid())
  roomTypeId  String

  description String

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

### 3. Modifications de tables existantes

**ContractPeriod** — ajouter les relations :

```prisma
model ContractPeriod {
  // ... champs existants ...
  baseRates           BaseRate[]
  agePolicies         AgePolicy[]
  // ... relations existantes ...
}
```

**RoomType** — ajouter la relation :

```prisma
model RoomType {
  // ... champs existants ...
  occupancyGuidances  OccupancyGuidance[]
  // ... relations existantes ...
}
```

**AgeCategory** — ajouter la relation :

```prisma
model AgeCategory {
  // ... champs existants ...
  agePolicies         AgePolicy[]
  // ... relations existantes ...
}
```

**MealPlanSupplement** — ajouter `billingUnit` :

```prisma
model MealPlanSupplement {
  // ... champs existants ...
  billingUnit      BillingUnit    @default(PER_NIGHT)
  // ... relations existantes ...
}
```

**OccupancyRate** — marquer comme legacy (commentaire dans le schéma) :

```prisma
// LEGACY — conservé pour compatibilité ascendante
// Les nouvelles données ne créent plus d'OccupancyRate
model OccupancyRate {
  // ... champs existants inchangés ...
}
```

### Hors scope

- Suppression de `OccupancyRate` (soft delete uniquement)
- Modification de `RoomPrice` (structure inchangée)
- `ruleType`/`baseRateRef` sur `AgePolicy` (itération future)

### Acceptance Criteria

- ✅ `npx prisma migrate dev` génère une migration sans erreur
- ✅ `npx prisma generate` produit un client TypeScript avec les nouveaux modèles
- ✅ `BaseRate`, `AgePolicy`, `OccupancyGuidance` apparaissent dans le Prisma Client
- ✅ Aucune donnée existante n'est perdue (`OccupancyRate` conservé, `MealPlanSupplement` reçoit `PER_NIGHT` par défaut)

---

## S4-BE-004-BIS : DTOs — refonte PER_OCCUPANCY

- **Type :** Task
- **Priority :** P0 (bloque S4-BE-008-BIS et S4-BE-009-BIS)
- **Story Points :** 3
- **Branch :** `chore/S4-BE-004-BIS-dtos-per-occupancy`
- **Commit :** `chore(contracts): add BaseRate, AgePolicy, OccupancyGuidance DTOs and update existing ones`

**Contexte :** S4-BE-004 a créé les DTOs initiaux. Ce ticket remplace les DTOs legacy et ajoute les nouveaux.

### Nouveaux DTOs à créer

**CreateBaseRateDto :**

```typescript
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBaseRateDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsNumber()
  @Min(0)
  halfDouble: number;

  @IsNumber()
  @Min(0)
  single: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  thirdPersonAdult?: number | null;
}
```

**UpdateBaseRateDto :** `PartialType(CreateBaseRateDto)`

**CreateAgePolicyDto :**

```typescript
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { SharingType } from '@prisma/client';

export class CreateAgePolicyDto {
  @IsString()
  @IsNotEmpty()
  ageCategoryId: string;

  @IsEnum(SharingType)
  sharingType: SharingType;

  @IsNumber()
  @Min(0)
  value: number;
}
```

**UpdateAgePolicyDto :** `PartialType(CreateAgePolicyDto)`

**CreateOccupancyGuidanceDto :**

```typescript
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateOccupancyGuidanceDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional() @IsInt() @Min(0) maxAdults?: number;
  @IsOptional() @IsInt() @Min(0) maxTeens?: number;
  @IsOptional() @IsInt() @Min(0) maxChildren?: number;
  @IsOptional() @IsInt() @Min(0) maxInfants?: number;
}
```

**UpdateOccupancyGuidanceDto :** `PartialType(CreateOccupancyGuidanceDto)`

### DTOs à modifier

**CreateRoomPriceDto** (modifié) :

```typescript
export class CreateRoomPriceDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsEnum(PricingMode)
  pricingMode: PricingMode;

  @ValidateIf((o: CreateRoomPriceDto) => o.pricingMode === 'PER_ROOM')
  @IsNumber()
  @Min(0)
  pricePerNight?: number | null;
  // occupancyRates retiré — plus de saisie inline des combinaisons
}
```

**CreateMealPlanSupplementDto** (modifié) :

```typescript
export class CreateMealPlanSupplementDto {
  @IsString()
  @IsNotEmpty()
  mealPlanId: string;

  @IsEnum(BillingUnit)
  billingUnit: BillingUnit;

  @IsObject()
  occupancyRates: Record<string, number>;
}
```

### DTOs inchangés

- `CreateContractDto`, `UpdateContractDto`
- `CreateContractPeriodDto`, `UpdateContractPeriodDto`
- `CreateStopSalesDateDto`

### Hors scope

- `OccupancyRateDto` — retiré de `CreateRoomPriceDto` mais le type existe encore pour compatibilité legacy

### Acceptance Criteria

- ✅ Tous les nouveaux DTOs compilent sans erreur (`nx build backend`)
- ✅ `class-validator` rejette les payloads invalides
- ✅ `CreateRoomPriceDto` en `PER_OCCUPANCY` sans `pricePerNight` passe la validation
- ✅ `CreateMealPlanSupplementDto` sans `billingUnit` est rejeté

---

## S4-BE-003-BIS : ContractsModule — ajouter les nouveaux controllers

- **Type :** Task
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `chore/S4-BE-003-BIS-module-per-occupancy`
- **Commit :** `chore(contracts): add BaseRates, AgePolicies, OccupancyGuidances controllers to module`

**Contexte :** S4-BE-003 a créé le module avec 4 controllers. Ce ticket ajoute les 3 nouveaux.

**Dépend de :** S4-BE-004-BIS (DTOs), S4-BE-008-BIS (méthodes de service appelées par ces controllers)

### Nouveaux controllers

**BaseRatesController :**

```typescript
@Controller('contracts/:contractId/periods/:periodId/base-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class BaseRatesController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateBaseRateDto,
    @Param('contractId') contractId: string,
    @Param('periodId') periodId: string
  ) {
    return this.contractsService.createBaseRate(dto, periodId, contractId);
  }

  @Get()
  findByPeriod(
    @Param('contractId') contractId: string,
    @Param('periodId') periodId: string
  ) {
    return this.contractsService.findBaseRatesByPeriod(periodId, contractId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBaseRateDto) {
    return this.contractsService.updateBaseRate(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contractsService.removeBaseRate(id);
  }
}
```

**AgePoliciesController** (même pattern, nichée sous `contracts/:contractId/periods/:periodId/age-policies`, avec `CreateAgePolicyDto`/`UpdateAgePolicyDto`, appelant `createAgePolicy` / `findAgePoliciesByPeriod` / `updateAgePolicy` / `removeAgePolicy`)

**OccupancyGuidancesController** (routes indépendantes du contrat, scopées par room type) :

```typescript
@Controller('occupancy-guidances')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class OccupancyGuidancesController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOccupancyGuidanceDto) {
    return this.contractsService.createOccupancyGuidance(dto);
  }

  @Get('room-types/:roomTypeId')
  findByRoomType(@Param('roomTypeId') roomTypeId: string) {
    return this.contractsService.findOccupancyGuidanceByRoomType(roomTypeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOccupancyGuidanceDto) {
    return this.contractsService.updateOccupancyGuidance(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contractsService.removeOccupancyGuidance(id);
  }
}
```

### Modifications de ContractsModule

```typescript
@Module({
  controllers: [
    ContractsController,
    RoomPricesController,
    MealPlanSupplementsController,
    StopSalesDatesController,
    BaseRatesController, // NOUVEAU
    AgePoliciesController, // NOUVEAU
    OccupancyGuidancesController, // NOUVEAU
  ],
  providers: [
    ContractsService,
    { provide: ContractRepository, useClass: PrismaContractRepository },
  ],
})
export class ContractsModule {}
```

### Pourquoi `OccupancyGuidancesController` est un controller à part

Contrairement à `BaseRatesController` et `AgePoliciesController`, `OccupancyGuidancesController` n'est pas nichée sous `contracts/:contractId/periods/:periodId/...` — elle est scopée par `roomTypeId` uniquement, parce que la donnée `OccupancyGuidance` ne dépend d'aucun contrat ni période : c'est une propriété de la chambre elle-même (cf. section 4.4 du document de conception), réutilisable à travers plusieurs contrats.

### Hors scope

- Guards/rôles spécifiques différents des controllers existants (on reprend exactement `JwtAuthGuard` + `RolesGuard` + `ADMIN`/`MANAGER`)

### Acceptance Criteria

- ✅ `nx build backend` compile sans erreur
- ✅ Les 3 nouveaux controllers sont déclarés dans `ContractsModule`
- ✅ Un appel Postman/curl sur chaque route retourne un statut cohérent (401 sans token, 403 avec un rôle AGENT, 201/200 avec ADMIN)
- ✅ Swagger/OpenAPI (si généré) liste les nouvelles routes

---

## S4-BE-008-BIS : Cœur métier — BaseRate, AgePolicy, OccupancyGuidance (repository + service)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 8
- **Branch :** `feat/S4-BE-008-BIS-per-occupancy-core`
- **Commit :** `feat(contracts): implement BaseRate, AgePolicy, OccupancyGuidance CRUD`

**Contexte :** c'est le ticket central de la refonte. Il regroupe repository + service pour les 3 nouvelles entités, parce qu'elles partagent le même flux métier (un agent qui saisit un `RoomPrice` en mode `PER_OCCUPANCY` a besoin des trois en même temps) et le même risque de régression (toucher au repository sans le service dans le même ticket laisserait une interface incomplète).

**Dépend de :** S4-BE-001-BIS (schéma), S4-BE-004-BIS (DTOs)

### 1. `contracts.types.ts` — nouvelles interfaces, retrait de `OccupancyRateCreateData`

```typescript
export interface BaseRateCreateData {
  roomTypeId: string;
  halfDouble: number;
  single: number;
  thirdPersonAdult?: number | null;
}

export type BaseRateUpdateData = Partial<BaseRateCreateData>;

export interface AgePolicyCreateData {
  ageCategoryId: string;
  sharingType: SharingType;
  value: number;
}

export type AgePolicyUpdateData = Partial<AgePolicyCreateData>;

export interface OccupancyGuidanceCreateData {
  roomTypeId: string;
  description: string;
  maxAdults?: number;
  maxTeens?: number;
  maxChildren?: number;
  maxInfants?: number;
}

export type OccupancyGuidanceUpdateData = Partial<OccupancyGuidanceCreateData>;
```

`OccupancyRateCreateData` reste dans le fichier (legacy, plus utilisé par le service mais potentiellement encore référencé par du code de migration/archivage).

### 2. `contract.repository.ts` (classe abstraite) — 12 nouvelles méthodes

```typescript
abstract createBaseRate(data: BaseRateCreateData, contractPeriodId: string): Promise<BaseRate>;
abstract findBaseRatesByPeriod(contractPeriodId: string): Promise<BaseRate[]>;
abstract updateBaseRate(id: string, data: BaseRateUpdateData): Promise<BaseRate>;
abstract removeBaseRate(id: string): Promise<RepositoryResult>;

abstract createAgePolicy(data: AgePolicyCreateData, contractPeriodId: string): Promise<AgePolicy>;
abstract findAgePoliciesByPeriod(contractPeriodId: string): Promise<AgePolicy[]>;
abstract updateAgePolicy(id: string, data: AgePolicyUpdateData): Promise<AgePolicy>;
abstract removeAgePolicy(id: string): Promise<RepositoryResult>;

abstract createOccupancyGuidance(data: OccupancyGuidanceCreateData): Promise<OccupancyGuidance>;
abstract findOccupancyGuidanceByRoomType(roomTypeId: string): Promise<OccupancyGuidance[]>;
abstract updateOccupancyGuidance(id: string, data: OccupancyGuidanceUpdateData): Promise<OccupancyGuidance>;
abstract removeOccupancyGuidance(id: string): Promise<RepositoryResult>;
```

### 3. `prisma-contract.repository.ts` — implémentation des 12 méthodes

Suit exactement le pattern déjà en place pour `createMealPlanSupplement`/`updateMealPlanSupplement`/`removeMealPlanSupplement` (try/catch avec mapping `P2002` → `CONFLICT`, `P2003` → `NOT_FOUND`). Exemple pour `BaseRate` :

```typescript
async createBaseRate(
  data: BaseRateCreateData,
  contractPeriodId: string,
): Promise<BaseRate> {
  try {
    return await this.prisma.baseRate.create({
      data: { ...data, contractPeriodId },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new RepositoryException(RepositoryResult.CONFLICT);
      if (error.code === 'P2003')
        throw new RepositoryException(RepositoryResult.NOT_FOUND);
    }
    throw error;
  }
}
```

Les 11 autres méthodes suivent le même squelette (`findMany` pour les listes, `update`/`delete` avec le même mapping d'erreurs que `updateRoomPrice`/`removeRoomPrice`).

### 4. `contracts.service.ts` — 9 nouvelles méthodes, retrait de `buildOccupancyRates`

```typescript
async createBaseRate(
  dto: CreateBaseRateDto,
  periodId: string,
  contractId: string,
): Promise<BaseRate> {
  await this.getPeriodOrThrow(periodId, contractId);
  try {
    return await this.contractRepository.createBaseRate(dto, periodId);
  } catch (error) {
    this.handleRepositoryError(error, {
      [RepositoryResult.CONFLICT]: `A base rate already exists for this room type in this period`,
      [RepositoryResult.NOT_FOUND]: `Room type ${dto.roomTypeId} not found`,
    });
  }
}

async findBaseRatesByPeriod(periodId: string, contractId: string): Promise<BaseRate[]> {
  await this.getPeriodOrThrow(periodId, contractId);
  return this.contractRepository.findBaseRatesByPeriod(periodId);
}

async updateBaseRate(id: string, dto: UpdateBaseRateDto): Promise<BaseRate> {
  try {
    return await this.contractRepository.updateBaseRate(id, dto);
  } catch (error) {
    this.handleRepositoryError(error, {
      [RepositoryResult.NOT_FOUND]: `Base rate ${id} not found`,
    });
  }
}

async removeBaseRate(id: string): Promise<void> {
  const result = await this.contractRepository.removeBaseRate(id);
  if (result === RepositoryResult.NOT_FOUND)
    throw new NotFoundException(`Base rate ${id} not found`);
}
```

Même triplet `create`/`update`/`remove` + `findByPeriod` pour `AgePolicy`, et `create`/`update`/`remove` + `findByRoomType` pour `OccupancyGuidance` (pas de `getPeriodOrThrow` pour cette dernière puisqu'elle n'est pas rattachée à une période).

**Retrait :**

- `buildOccupancyRates()` (méthode privée entière)
- L'appel à `buildOccupancyRates()` dans `createRoomPrice()` — remplacé par : si `pricingMode === 'PER_OCCUPANCY'`, `RoomPrice` est créé sans `occupancyRates`, la saisie des tarifs se fait ensuite séparément via `BaseRatesController`/`AgePoliciesController`.

### Hors scope

- `findOne` du contrat n'inclut pas encore `baseRates`/`agePolicies` (ticket S4-BE-005-BIS)
- Tests unitaires (ticket S4-BE-011-BIS)
- Nettoyage complet des imports/types legacy `OccupancyRateDto` (ticket S4-REFACTOR-003)

### Acceptance Criteria

- ✅ `nx build backend` compile sans erreur
- ✅ Créer un `RoomPrice` en `PER_OCCUPANCY` ne nécessite plus `occupancyRates` dans le payload
- ✅ `POST .../base-rates` avec un `roomTypeId` inexistant retourne 404
- ✅ `POST .../base-rates` en double sur le même (period, roomType) retourne 409
- ✅ `POST .../age-policies` avec le même (ageCategory, sharingType) sur la même période retourne 409
- ✅ Aucune validation de capacité (`totalMaxPax`) n'est appliquée sur ces nouvelles routes

---

## S4-BE-009-BIS : MealPlanSupplement — câbler `billingUnit` dans repository/service

- **Type :** Task
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `chore/S4-BE-009-BIS-billing-unit`
- **Commit :** `feat(contracts): wire billingUnit through MealPlanSupplement flow`

**Contexte :** le champ `billingUnit` a été ajouté au schéma (S4-BE-001-BIS) et au DTO (S4-BE-004-BIS). Ce ticket est isolé du reste de la refonte PER_OCCUPANCY parce que `MealPlanSupplement` n'a aucun lien structurel avec `BaseRate`/`AgePolicy`/`OccupancyGuidance` — c'est un ajout de champ sur une table déjà existante et déjà câblée de bout en bout.

**Dépend de :** S4-BE-001-BIS (schéma), S4-BE-004-BIS (DTO)

### `contracts.types.ts`

```typescript
export interface MealPlanSupplementCreateData {
  mealPlanId: string;
  occupancyRates: Record<string, number>;
  billingUnit: BillingUnit; // NOUVEAU
}

export type MealPlanSupplementUpdateData =
  Partial<MealPlanSupplementCreateData>;
```

### `prisma-contract.repository.ts`

Aucun changement de logique nécessaire — `createMealPlanSupplement`/`updateMealPlanSupplement` passent déjà `data` tel quel à Prisma (`data: { ...data, contractPeriodId }`). Le champ `billingUnit` est propagé automatiquement dès que `MealPlanSupplementCreateData` le contient.

### `contracts.service.ts`

```typescript
async createMealPlanSupplement(
  dto: CreateMealPlanSupplementDto,
  periodId: string,
  contractId: string,
): Promise<MealPlanSupplement> {
  const period = await this.getPeriodOrThrow(periodId, contractId);

  try {
    return await this.contractRepository.createMealPlanSupplement(
      {
        mealPlanId: dto.mealPlanId,
        occupancyRates: dto.occupancyRates,
        billingUnit: dto.billingUnit, // NOUVEAU
      },
      period.id,
    );
  } catch (error) {
    this.handleRepositoryError(error, {
      [RepositoryResult.CONFLICT]: `A meal plan already exists for this meal plan in this period`,
      [RepositoryResult.NOT_FOUND]: `Meal plan ${dto.mealPlanId} not found`,
    });
  }
}
```

Même ajout dans `updateMealPlanSupplement` (`billingUnit: dto.billingUnit`).

### Hors scope

- Modélisation structurée des suppléments repas (remplacer `occupancyRates: Json` par un modèle dédié — hors périmètre immédiat, cf. document de conception section 8)

### Acceptance Criteria

- ✅ `POST .../meal-plan-supplements` sans `billingUnit` est rejeté (validation DTO déjà couverte par S4-BE-004-BIS, vérifiée ici de bout en bout)
- ✅ `billingUnit` est bien persisté et retourné par `GET` sur le contrat
- ✅ `PATCH .../meal-plan-supplements/:id` permet de changer `billingUnit` seul, sans toucher `occupancyRates`

---

## S4-BE-005-BIS : `findOne` — inclure `baseRates` et `agePolicies` dans la réponse contrat

- **Type :** Task
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `chore/S4-BE-005-BIS-findone-include`
- **Commit :** `feat(contracts): include baseRates and agePolicies in findOne`

**Contexte :** `findOne` (dans `PrismaContractRepository`) inclut déjà `roomPrices.occupancyRates`, `mealPlanSupplements`, `stopSalesDates` par période. Ce ticket ajoute les deux nouvelles relations pour que le frontend reçoive tout en un seul appel `GET /contracts/:id`.

**Dépend de :** S4-BE-008-BIS (les relations doivent exister côté repository)

### `prisma-contract.repository.ts`

```typescript
async findOne(
  id: string,
  tourOperatorId: string,
): Promise<SharedContract | null> {
  const contract = await this.prisma.contract.findUnique({
    where: { id, tourOperatorId },
    include: {
      ...CONTRACT_INCLUDE,
      periods: {
        include: {
          seasonPeriod: true,
          baseMealPlan: true,
          roomPrices: {
            include: {
              occupancyRates: true, // legacy, conservé
            },
          },
          mealPlanSupplements: true,
          stopSalesDates: true,
          baseRates: {
            include: { roomType: { select: { id: true, name: true, code: true } } },
          }, // NOUVEAU
          agePolicies: {
            include: { ageCategory: true },
          }, // NOUVEAU
        },
      },
    },
  });

  if (!contract) {
    return null;
  }

  return serializeDates(this.mapToContract(contract));
}
```

### `contract.types.ts` (shared)

```typescript
export interface ContractPeriod {
  // ... champs existants ...
  baseRates?: BaseRate[]; // NOUVEAU
  agePolicies?: AgePolicy[]; // NOUVEAU
}

export interface BaseRate {
  id: string;
  contractPeriodId: string;
  roomTypeId: string;
  halfDouble: number;
  single: number;
  thirdPersonAdult: number | null;
  roomType?: { id: string; name: string; code: string };
}

export interface AgePolicy {
  id: string;
  contractPeriodId: string;
  ageCategoryId: string;
  sharingType: SharingType;
  value: number;
  ageCategory?: { id: string; name: string; minAge: number; maxAge: number };
}
```

### Hors scope

- Pagination/filtrage des `baseRates`/`agePolicies` (volumes trop faibles pour le justifier — 3-5 room types × 5-8 règles d'âge par contrat)

### Acceptance Criteria

- ✅ `GET /contracts/:id` retourne `periods[].baseRates` et `periods[].agePolicies` peuplés
- ✅ Le `roomType` de chaque `BaseRate` et l'`ageCategory` de chaque `AgePolicy` sont inclus (évite un aller-retour frontend supplémentaire)
- ✅ Un contrat sans `BaseRate`/`AgePolicy` renvoie des tableaux vides, pas `null`/`undefined`

---

## S4-BE-011-BIS : Tests unitaires — BaseRate, AgePolicy, OccupancyGuidance

- **Type :** Test
- **Priority :** P1
- **Story Points :** 4
- **Branch :** `test/S4-BE-011-BIS-per-occupancy-unit-tests`
- **Commit :** `test(contracts): add unit tests for BaseRate, AgePolicy, OccupancyGuidance`

**Contexte :** couverture des 9 nouvelles méthodes de service (S4-BE-008-BIS) et 2 méthodes modifiées (S4-BE-009-BIS). Suit le pattern de test déjà en place pour `createRoomPrice`/`createMealPlanSupplement` (mock du `ContractRepository`, assertions sur les exceptions NestJS).

**Dépend de :** S4-BE-008-BIS, S4-BE-009-BIS (le code testé doit exister avant de l'écrire)

### Scope — `contracts.service.spec.ts`

**`createBaseRate` :**

- ✅ Crée un `BaseRate` valide quand la période existe
- ✅ Lève `NotFoundException` si la période n'existe pas (`getPeriodOrThrow`)
- ✅ Lève `NotFoundException` si `roomTypeId` n'existe pas (mapping `RepositoryResult.NOT_FOUND`)
- ✅ Lève `ConflictException` si un `BaseRate` existe déjà pour ce (period, roomType)

**`updateBaseRate` / `removeBaseRate` :**

- ✅ Update réussi
- ✅ `NotFoundException` si l'id n'existe pas

**`createAgePolicy` :**

- ✅ Crée une `AgePolicy` valide
- ✅ Lève `ConflictException` si (period, ageCategory, sharingType) existe déjà
- ✅ Accepte `value = 0` (cas du "gratuit" pour Infant/Child WITH_PARENTS)

**`createOccupancyGuidance` :**

- ✅ Crée une guidance sans vérification de période (pas de `getPeriodOrThrow`, contrairement à BaseRate/AgePolicy)
- ✅ Les champs `maxAdults`/`maxTeens`/`maxChildren`/`maxInfants` par défaut à 0 si omis

**`createRoomPrice` (régression) :**

- ✅ Un `RoomPrice` en `PER_OCCUPANCY` se crée **sans** `occupancyRates` dans le payload (confirme le retrait de `buildOccupancyRates`)
- ✅ Aucune exception liée à la capacité n'est levée, quelle que soit la donnée envoyée

**`createMealPlanSupplement` / `updateMealPlanSupplement` :**

- ✅ `billingUnit` est bien transmis au repository dans le payload de création/update

### Hors scope

- Tests d'intégration (base de données réelle) — hors scope de ce ticket, uniquement des mocks
- Tests du repository Prisma lui-même (`prisma-contract.repository.spec.ts`) — à évaluer séparément si le pattern existant du projet en a besoin

### Acceptance Criteria

- ✅ `nx test backend --testPathPattern=contracts.service` passe à 100%
- ✅ Couverture des nouvelles méthodes de service ≥ 90%
- ✅ Aucun test existant ne casse (notamment ceux de `createRoomPrice` déjà en place avant la refonte)

---

## S4-REFACTOR-003 : Nettoyage — retrait définitif du legacy `OccupancyRate`/validation de capacité

- **Type :** Refactor
- **Priority :** P2
- **Story Points :** 2
- **Branch :** `refactor/S4-REFACTOR-003-cleanup-legacy-occupancy`
- **Commit :** `refactor(contracts): remove dead code and legacy references`

**Contexte :** dernier ticket de la série. Une fois S4-BE-008-BIS, S4-BE-009-BIS, S4-BE-005-BIS et S4-BE-011-BIS validés en usage réel (au moins un contrat créé de bout en bout avec le nouveau modèle), on nettoie ce qui a été volontairement laissé de côté pendant la refonte pour ne pas bloquer le reste de l'équipe.

**Dépend de :** tous les tickets précédents, validés en usage réel — ce ticket n'est **pas** à traiter en parallèle, c'est le dernier de la série.

### Scope

**1. `contracts.service.ts`**

- Supprimer le commentaire mort / imports inutilisés liés à `buildOccupancyRates` s'il en reste (constantes, types `OccupancyRateDto` importés mais plus utilisés)

**2. `contracts.types.ts`**

- Marquer `OccupancyRateCreateData` avec un commentaire `@deprecated` explicite si le type est encore référencé ailleurs (scripts de migration/archivage), ou le supprimer s'il n'a plus aucune référence

**3. `contract.types.ts` (shared)**

- Marquer `OccupancyRate`, `OccupancyRateDto` comme `@deprecated` dans le JSDoc, pour signaler au frontend de ne plus les utiliser dans les nouveaux écrans

**4. `schema.prisma`**

- Décision à prendre **avec Samuel avant d'exécuter ce ticket** : le modèle `OccupancyRate` reste-t-il indéfiniment en base (archivage), ou planifie-t-on sa suppression physique dans une migration ultérieure une fois qu'on est sûr qu'aucun contrat en production ne s'appuie encore dessus ? Ce ticket ne fait **pas** cette suppression — il documente juste la décision dans un commentaire au-dessus du modèle.

### Hors scope

- Suppression physique de la table `OccupancyRate` en base (nécessite une décision produit séparée, cf. point 4 ci-dessus)
- Nettoyage frontend (`ContractForm` Step 3) — c'est un chantier frontend distinct, hors périmètre backend

### Acceptance Criteria

- ✅ `nx build backend` compile toujours sans erreur après nettoyage
- ✅ Aucune méthode de service n'appelle plus de logique liée à la validation de capacité (`totalMaxPax`)
- ✅ Une recherche globale de `buildOccupancyRates` dans le repo ne retourne aucun résultat
- ✅ Les tests de S4-BE-011-BIS passent toujours après le nettoyage

---

## S4-BE-012-BIS : BaseRate — ajout des paliers Triple et Quadruple

- **Type :** Task
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `chore/S4-BE-012-BIS-base-rate-triple-quadruple`
- **Commit :** `feat(contracts): add triple and quadruple fields to BaseRate`

**Contexte :** S4-BE-001-BIS, S4-BE-004-BIS et S4-BE-005-BIS sont déjà mergés. Les .xlsx que les agents remplissent montrent que les contrats PER_OCCUPANCY utilisent jusqu'à 5 colonnes de tarif — Half Double, Single, Third Adult, Triple, Quadruple. `thirdPersonAdult` (supplément ajouté à une chambre pensée pour 2) et Triple/Quadruple (tarifs autonomes par personne pour une chambre pensée pour 3 ou 4 dès le départ) sont deux concepts distincts, pas des synonymes. Ce ticket ajoute les deux champs manquants sans toucher à l'existant.

**Dépend de :** S4-BE-001-BIS, S4-BE-004-BIS, S4-BE-005-BIS (déjà mergés)

### 1. Schéma Prisma

```prisma
model BaseRate {
  // ... champs existants inchangés (halfDouble, single, thirdPersonAdult) ...
  triple           Decimal?       @db.Decimal(10, 2)
  quadruple        Decimal?       @db.Decimal(10, 2)
  // ... relations inchangées ...
}
```

Migration : `npx prisma migrate dev --name add_triple_quadruple_to_base_rate` — additive, deux colonnes nullable, aucun risque sur les données existantes.

### 2. DTOs (`create-base-rate.dto.ts` / `update-base-rate.dto.ts`)

```typescript
export class CreateBaseRateDto {
  // ... champs existants inchangés ...

  @IsOptional()
  @IsNumber()
  @Min(0)
  triple?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quadruple?: number | null;
}
```

`UpdateBaseRateDto` suit automatiquement via `PartialType(CreateBaseRateDto)`.

### 3. Types partagés (`contract.types.ts`)

```typescript
export interface BaseRate {
  // ... champs existants inchangés ...
  triple: number | null;
  quadruple: number | null;
}
```

### 4. Types internes (`contracts.types.ts`)

```typescript
export interface BaseRateCreateData {
  // ... champs existants inchangés ...
  triple?: number | null;
  quadruple?: number | null;
}
```

> Ajout identifié en cours de ticket (non listé dans la version initiale) : sans lui, `contracts.service.ts` ne peut pas relayer `triple`/`quadruple` vers le repository (même échec de compilation que rencontré pour `billingUnit` sur `MealPlanSupplementUpdateData`).

### Hors scope

- Toute logique de calcul automatique utilisant ces deux champs
- Validation d'exclusivité côté backend/DTO — volontairement absente, pour ne pas complexifier le DX. Contrainte à respecter côté frontend (formulaire Angular du contrat) : un seul des deux champs, `thirdPersonAdult` ou `triple`, doit être renseigné à la fois pour un même room type/période. Hors périmètre de ce ticket backend — à cadrer dans le ticket frontend correspondant.

### Acceptance Criteria

- ✅ `npx prisma migrate dev` génère une migration sans erreur, aucune donnée existante perdue
- ✅ `npx prisma generate` expose `triple`/`quadruple` sur le client TypeScript
- ✅ `POST .../base-rates` accepte un payload avec ou sans `triple`/`quadruple`
- ✅ `GET /contracts/:id` retourne `triple`/`quadruple` sans changement côté `findOne` — Prisma inclut les nouveaux champs scalaires automatiquement dès qu'ils sont dans le modèle, la requête `include` de S4-BE-005-BIS n'a rien à faire de plus

---

#### S4-BE-013-BIS — Add `roomTypeId` to `AgePolicy`

- **Type :** Task
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `chore/S4-BE-013-BIS-age-policy-room-type`
- **Commit :** `ffeat(contracts): add roomTypeId to AgePolicy`

## Contexte

`AgePolicy` est actuellement scopé par `contractPeriod + ageCategory + sharingType` uniquement (pas de `roomTypeId`), sur la base d'une observation initiale (contrat LUX\* Belle Mare) selon laquelle les tarifs enfants/ados étaient identiques pour toutes les chambres d'une période.

Deux contrats réels supplémentaires contredisent cette hypothèse :

- **Belle Mare** : le tarif "2nd Child" varie selon la colonne (room type) — `Free of Charge` pour certaines chambres, `60` pour d'autres.
- **Tamassa** : certaines règles ne s'appliquent qu'à une liste explicite de room types — _"Extra Bed Adult: Applicable in Superior Room, Ocean Superior Room & Beach Room only"_ ; _"Separate room ... Applicable only in Tamassa Room, Superior room, Ocean Superior Room or Beach Room"_.

La décision initiale ("pas de `roomTypeId`") est donc invalidée.

## Décision

Ajouter `roomTypeId` à `AgePolicy`, **requis**, en miroir exact du pattern déjà utilisé sur `BaseRate` (pas de nouvelle logique d'éligibilité : un room type non concerné par une règle = simplement aucune entrée `AgePolicy` pour ce couple room type/catégorie/partage).

## Hors scope (vérifié, pas d'impact)

- **Nombre de parents (1 ou 2) partageant la chambre** : confirmé que le montant est identique dans les deux cas (le 2e parent paie via son propre `BaseRate`, pas via une valeur `AgePolicy` différente). Aucun champ à ajouter.
- **Ordinaux "1st Child"/"2nd Child"/etc.** : couverts par une seule `AgeCategory` "Child" existante. Rien à modifier.
- **`OccupancyGuidance`** (contraintes max d'occupation par room type) : hors scope de ce ticket, traité séparément dans S4-FE-014-BIS.

## Travail à faire

1. **Schema Prisma** : ajouter `roomTypeId: String` (requis) sur le modèle `AgePolicy`, relation vers `RoomType`, contrainte d'unicité mise à jour pour inclure `roomTypeId` (`contractPeriodId + roomTypeId + ageCategoryId + sharingType`).
2. **Migration** : générer et appliquer la migration Prisma correspondante.
3. **DTOs** : `create-age-policy.dto.ts` (et tout DTO de mise à jour associé) — ajouter `roomTypeId`.
4. **Shared types** : mettre à jour le type `AgePolicy`/`AgePolicyDto` côté `@runner/shared/types`.
5. **Service/Repository** : adapter la création/lecture pour inclure `roomTypeId` dans les requêtes et la validation d'unicité.
6. **Controllers** : vérifier que les endpoints exposant `AgePolicy` (création, enrichissement `findOne`) propagent bien `roomTypeId`.

## Non couvert par ce ticket

- Migration des données existantes (aucune donnée de contrat réelle en prod à ce stade, à confirmer avant d'écrire un script de migration de données).
- Validation backend de l'éligibilité par room type (l'absence d'entrée suffit, pas de champ "applicable"/"non applicable" à créer).
- Modification du frontend (Step 3, relocalisation de la grille AgePolicy dans le row/card par room type) — ticket frontend séparé, à créer après celui-ci.

---

### S4-FE-015-BIS — Relocate AgePolicy grid from per-period to per-room-type

- **Type :** Fix
- **Priority :** P2
- **Story Points :** 1
- **Branch :** `fix/S4-FIX-004-per-room-reset-baserate-agepolicy`
- **Commit :** `fix(contracts): reset baseRate and agePolicies when switching to PER_ROOM`

**Contexte**

Suite à S4-BE-013-BIS (`AgePolicy.roomTypeId`), la grille AgePolicy du Step 3 du wizard de contrat doit passer d'un affichage "une fois par période" à un affichage "une fois par room type", en miroir de la section BaseRate.

Preuve : deux contrats réels (LUX* Belle Mare, LUX* Tamassa) montrent des tarifs AgePolicy différents selon le room type, et certains room types ne sont pas éligibles à une règle donnée.

**Dépendance**

Bloqué par S4-BE-013-BIS (schema + migration + DTOs + shared types `roomTypeId` sur `AgePolicy`). Ne pas démarrer avant que ce ticket soit mergé.

**Décision déjà validée (rappel, pas à rediscuter)**

- Absence d'entrée `AgePolicy` pour un room type = règle non applicable à ce room type. Pas de champ "éligibilité" séparé à créer.
- Pas de dimension "nombre de parents" à gérer (montant identique 1 ou 2 parents).
- Ordinaux "1st Child"/"2nd Child" : une seule `AgeCategory` "Child", rien à changer ici.

**Travail à faire (frontend uniquement)**

1. Dans `contract-form.component.ts` : adapter `agePolicyRowsByPeriod` (ou le remplacer) pour grouper par `(period, roomType)` au lieu de `(period)` seul — probablement un nouveau computed du style `agePolicyRowsByPeriodAndRoomType`.
2. Dans `contract-form.component.html` : déplacer le bloc `<h4>Age policy...</h4>` + `<p-table>` actuellement au niveau `@if (group.hasPerOccupancy)` (une fois par période) vers l'intérieur de chaque `room-price-card`, uniquement quand `rp.pricingMode === 'PER_OCCUPANCY'` — juste après la section BaseRate de la card.
3. `updateAgePolicyValue()` : ajouter `roomTypeId` en paramètre et dans la logique de recherche/mise à jour de l'entrée locale.
4. `LocalAgePolicyEntry` (`contract-form.types.ts`) : ajouter `roomTypeId`.
5. Vérifier que la synchronisation de la matrice de prix (`syncRoomPriceMatrix`) gère bien la création/suppression des entrées `AgePolicy` locales quand un room type est ajouté/retiré, comme elle le fait déjà pour `localRoomPrices`.

**Hors scope :**

- Toute logique d'éligibilité automatique par capacité (contrairement à BaseRate, il n'y a pas de règle "masquer si capacité insuffisante" identifiée pour AgePolicy à ce stade — l'agent choisit librement).
- `OccupancyGuidance` — ticket séparé S4-FE-014-BIS.

**Fichiers concernés**

- `contract-form.component.ts`
- `contract-form.component.html`
- `contract-form.component.scss` (si le layout de card nécessite un ajustement)
- `contract-form.types.ts`

**Acceptance Criteria**

- ✅ Rebasculer une ligne PER_OCCUPANCY → PER_ROOM vide baseRate (redevient null)
- ✅ Rebasculer une ligne PER_OCCUPANCY → PER_ROOM supprime les localAgePolicies de ce (periodTempId, roomTypeId)
- ✅ Rebasculer PER_ROOM → PER_OCCUPANCY réinitialise baseRate à emptyBaseRate() (comportement déjà correct, non régressé)
- ✅ Aucune régression sur pricePerNight (déjà géré)

---
