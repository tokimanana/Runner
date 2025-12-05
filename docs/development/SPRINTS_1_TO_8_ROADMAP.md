# Sprints 1-8 – Roadmap Complète (VERSION AJUSTÉE)

## Vue d'ensemble

| Sprint | Titre | Durée | Objectif |
|--------|-------|-------|----------|
| 0 | Setup Infrastructure | 1-2j | Backend + Frontend foundation |
| 1 | Auth & Layout | 2-3j | Auth complète, layout dynamique |
| 2 | Hotels + Seasons | 4-5j | Gestion hôtels + age categories + room types + **seasons** |
| 3 | Référentiels | 3j | MealPlans, Markets, Currencies, Supplements |
| 4 | Contracts | 6-7j | Contrats complexes + périodes + tarifs **PER_OCCUPANCY** |
| 5 | Offers | 3-4j | Offres promotionnelles + règles **SEQUENTIAL/ADDITIVE** |
| 6 | Booking UI | 4-5j | Wizard 5 étapes |
| 7 | Pricing Engine | 5-7j | Moteur de calcul nuit par nuit |
| 8 | Finitions & Tests | 3-4j | Perf, UX, tests unitaires |

**Total MVP: 9-10 semaines (2.5 mois)**

---

## Sprint 0 – Setup Infrastructure (1-2 jours)

**✅ Déjà documenté dans `SPRINT_0_SETUP.md`**

**Changements vs version initiale** :
- ✅ Utiliser le `schema.prisma` final (avec Season, OccupancyRate)
- ✅ Utiliser le `seed.ts` final

---

## Sprint 1 – Auth & Layout (2-3 jours)

**✅ Déjà documenté dans `SPRINTS_1_TO_8_ROADMAP.md`**

Pas de changement, sprint inchangé.

---

## Sprint 2 – Hotels + Seasons (4-5 jours) ⚠️ MODIFIÉ

### Objectif
Gestion complète des hôtels + **ajout de la gestion des seasons**.

### Backend Tasks

#### 2.1 Hotels CRUD (Inchangé)
- [ ] Endpoints Hotels CRUD avec validation
- [ ] Endpoints AgeCategories CRUD (sous-ressource)
- [ ] Endpoints RoomTypes CRUD
- [ ] Indexes Prisma pour filtrage

#### 2.2 Seasons CRUD (NOUVEAU)
- [ ] Module Seasons (`nest g module seasons`)
- [ ] Endpoints GET/POST/PUT/DELETE `/seasons`
- [ ] Validation : `startDate` < `endDate`
- [ ] Validation : pas de chevauchement de dates (optionnel)

**`backend/src/seasons/seasons.controller.ts`**
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SeasonsService } from './seasons.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('seasons')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SeasonsController {
  constructor(private seasonsService: SeasonsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT)
  findAll(@CurrentUser() user: any) {
    return this.seasonsService.findAll(user.tourOperatorId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.seasonsService.create(user.tourOperatorId, body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() body: any) {
    return this.seasonsService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.seasonsService.remove(id);
  }
}
```

### Frontend Tasks

#### 2.1 Hotels (Inchangé)
- [ ] Feature Hotels: routes standalone
- [ ] Composant HotelsList (tableau + pagination)
- [ ] Composant HotelForm (create/edit)
- [ ] Composant AgeCategoriesManager
- [ ] Composant RoomTypesManager
- [ ] Store Hotels (NgRx): load, create, update, delete

#### 2.2 Seasons (NOUVEAU)
- [ ] Feature Seasons: routes standalone
- [ ] Service SeasonsService (BehaviorSubject simple, PAS de NgRx)
- [ ] Composant SeasonsList (tableau)
- [ ] Composant SeasonForm (create/edit)
- [ ] Validations UI: dates, `startDate` < `endDate`

**`frontend/src/app/features/seasons/services/seasons.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Season } from '@shared/models';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private seasons$ = new BehaviorSubject<Season[]>([]);
  private apiUrl = `${environment.apiUrl}/seasons`;
  private loaded = false;

  constructor(private http: HttpClient) {}

  getSeasons(): Observable<Season[]> {
    if (!this.loaded) {
      this.loadSeasons();
    }
    return this.seasons$.asObservable();
  }

  private loadSeasons(): void {
    this.http.get<Season[]>(this.apiUrl)
      .pipe(tap(data => {
        this.seasons$.next(data);
        this.loaded = true;
      }))
      .subscribe();
  }

  create(season: Partial<Season>): Observable<Season> {
    return this.http.post<Season>(this.apiUrl, season)
      .pipe(tap(() => this.refresh()));
  }

  update(id: string, season: Partial<Season>): Observable<Season> {
    return this.http.put<Season>(`${this.apiUrl}/${id}`, season)
      .pipe(tap(() => this.refresh()));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.refresh()));
  }

  private refresh(): void {
    this.loaded = false;
    this.loadSeasons();
  }
}
```

### DoD Sprint 2
- [ ] CRUD hôtel complet
- [ ] Age categories gérées par hôtel
- [ ] Room types gérés par hôtel
- [ ] **CRUD seasons complet (NOUVEAU)**
- [ ] **Seasons disponibles dans sélecteurs (NOUVEAU)**
- [ ] Validations UI et backend

**Durée ajustée** : +1 jour pour Seasons = 4-5 jours au lieu de 3-4j.

---

## Sprint 3 – Référentiels (3 jours)

**Inchangé**, voir `SPRINTS_1_TO_8_ROADMAP.md`.

---

## Sprint 4 – Contracts (6-7 jours) ⚠️ MODIFIÉ

### Objectif
Gestion des contrats avec **tarification PER_OCCUPANCY** et lien aux seasons.

### Backend Tasks

#### 4.1 Contracts CRUD
- [ ] Module Contracts
- [ ] Endpoints Contracts CRUD
- [ ] Validation périodes non chevauchantes

#### 4.2 ContractPeriod avec Season
- [ ] ContractPeriod CRUD (nested)
- [ ] **Lien optionnel à Season** (`seasonId`)
- [ ] Si `seasonId` fourni, pré-remplir `startDate`/`endDate` depuis Season

#### 4.3 RoomPrice avec PER_OCCUPANCY (NOUVEAU)
- [ ] Endpoint POST `/room-prices` avec mode `PER_OCCUPANCY`
- [ ] Si mode `PER_OCCUPANCY`, créer des `OccupancyRate` associés
- [ ] Validation : capacité room respectée

**Exemple payload** :
```json
{
  "roomPriceId": "uuid",
  "pricingMode": "PER_OCCUPANCY",
  "occupancyRates": [
    {
      "numAdults": 1,
      "numChildren": 0,
      "ratesPerAge": {
        "adult_cat_id": { "rate": 120, "order": 1 }
      },
      "totalRate": 120
    },
    {
      "numAdults": 2,
      "numChildren": 0,
      "ratesPerAge": {
        "adult_cat_id": { "rate": 90, "order": 1 },
        "adult_cat_id": { "rate": 90, "order": 2 }
      },
      "totalRate": 180
    }
  ]
}
```

### Frontend Tasks

#### 4.1 Contract Form
- [ ] Formulaire complexe avec onglets/wizard
- [ ] Étape 1 : Infos de base (hôtel, market, dates)
- [ ] Étape 2 : Périodes (avec sélecteur Season optionnel)
- [ ] Étape 3 : Tarifs par room type

#### 4.2 RoomPrice Form (PER_OCCUPANCY)
- [ ] Sélecteur mode : PER_ROOM / PER_OCCUPANCY / FLAT_RATE
- [ ] Si `PER_OCCUPANCY` sélectionné :
  - [ ] Afficher tableau dynamique : "Single", "Double", "Triple", etc.
  - [ ] Pour chaque config : input tarif par catégorie d'âge
  - [ ] Calcul auto du `totalRate`

**Exemple UI** :
```
┌─────────────────────────────────────────────────────┐
│ Mode de tarification : ○ PER_ROOM  ● PER_OCCUPANCY │
│                                                     │
│ Configuration occupants :                           │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Single (1 adulte)                                │ │
│ │   1er adulte : [120] €                           │ │
│ │   TOTAL : 120€/nuit                              │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Double (2 adultes)                               │ │
│ │   1er adulte : [90] €                            │ │
│ │   2ème adulte : [90] €                           │ │
│ │   TOTAL : 180€/nuit                              │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Double + 1 enfant                                │ │
│ │   1er adulte : [90] €                            │ │
│ │   2ème adulte : [90] €                           │ │
│ │   1er enfant : [0] € (gratuit)                   │ │
│ │   TOTAL : 180€/nuit                              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [ + Ajouter une configuration ]                    │
└─────────────────────────────────────────────────────┘
```

### DoD Sprint 4
- [ ] Contrat créé avec périodes
- [ ] Périodes liées aux seasons (optionnel)
- [ ] **Tarification PER_OCCUPANCY fonctionnelle (NOUVEAU)**
- [ ] **OccupancyRate créés et stockés (NOUVEAU)**
- [ ] Mode pricing PER_ROOM fonctionne toujours
- [ ] Validations UI et backend

**Durée ajustée** : +1 jour pour PER_OCCUPANCY = 6-7 jours au lieu de 5-6j.

---

## Sprint 5 – Offers (3-4 jours) ⚠️ MODIFIÉ

### Backend Tasks
- [ ] Offers CRUD
- [ ] OfferPeriod CRUD (nested)
- [ ] OfferSupplement CRUD
- [ ] **Validation : DiscountMode SEQUENTIAL vs ADDITIVE (NOUVEAU)**
- [ ] Endpoint validation : `/offers/validate-compatibility` (optionnel)

### Frontend Tasks
- [ ] Feature Offers: routes standalone
- [ ] Composant OffersList
- [ ] Composant OfferForm (périodes, type réduction, **mode SEQUENTIAL/ADDITIVE**)
- [ ] Store Offers (NgRx)
- [ ] **UI : Bloquer sélection mixte SEQUENTIAL + ADDITIVE (NOUVEAU)**

**Logique de blocage** :
```typescript
// offers-selection.component.ts
onOfferSelected(offer: Offer): void {
  const selectedOffers = this.getSelectedOffers();
  
  // Si offre ADDITIVE sélectionnée, bloquer SEQUENTIAL
  if (offer.discountMode === 'ADDITIVE') {
    this.disableOffersByMode('SEQUENTIAL');
  }
  
  // Si offre SEQUENTIAL sélectionnée, bloquer ADDITIVE
  if (offer.discountMode === 'SEQUENTIAL') {
    this.disableOffersByMode('ADDITIVE');
  }
  
  this.store.dispatch(BookingActions.addOffer({ offer }));
}
```

### DoD Sprint 5
- [ ] Offres créées avec périodes
- [ ] **Mode SEQUENTIAL vs ADDITIVE sélectionnable (NOUVEAU)**
- [ ] **UI bloque mixage SEQUENTIAL + ADDITIVE (NOUVEAU)**
- [ ] Suppléments applicables configurables

---

## Sprint 6 – Booking UI (4-5 jours)

**Inchangé**, voir `SPRINTS_1_TO_8_ROADMAP.md`.

Pas de changement majeur, juste adaptation aux nouveaux modèles.

---

## Sprint 7 – Pricing Engine (5-7 jours) ⚠️ MODIFIÉ

### Backend Tasks (CRITIQUE)

#### 7.1 Service Pricing de Base
- [ ] Calcul nuit par nuit
- [ ] Sélection de la période tarifaire valide
- [ ] **Support mode PER_ROOM (simple) (NOUVEAU)**
- [ ] **Support mode PER_OCCUPANCY (complexe) (NOUVEAU)**

#### 7.2 Application des Offres
- [ ] **Mode SEQUENTIAL : Prix × (1-A) × (1-B) (NOUVEAU)**
- [ ] **Mode ADDITIVE : Prix × (1-(A+B)) (NOUVEAU)**
- [ ] Validation : pas de mixage
- [ ] Application partielle (nuit par nuit)

#### 7.3 Calcul Suppléments
- [ ] **Support PER_PERSON_PER_NIGHT (NOUVEAU)**
- [ ] **Support PER_PERSON_PER_STAY (NOUVEAU)**
- [ ] **Support PER_ROOM_PER_NIGHT (NOUVEAU)**
- [ ] **Support PER_ROOM_PER_STAY (NOUVEAU)**
- [ ] Application réductions selon `canReceiveDiscount`

#### 7.4 Meal Plan Supplements
- [ ] Récupération tarif selon occupancy (JSON lookup)
- [ ] **Prix TOTAL (pas delta vs BB) (NOUVEAU)**

#### 7.5 Optimisation Performance
- [ ] **1 seule requête DB avec includes (NOUVEAU)**
- [ ] Boucle en mémoire pour 150 nuits
- [ ] Caching des periods/offers en RAM

**Exemple Service** :
```typescript
@Injectable()
export class PricingService {
  async calculatePrice(criteria: BookingCalculateCriteria): Promise<BookingCalculation> {
    // 1. Charger TOUT en 1 requête
    const contract = await this.prisma.contract.findFirst({
      where: { /* ... */ },
      include: {
        hotel: { include: { ageCategories: true } },
        periods: {
          include: {
            roomPrices: { include: { occupancyRates: true } },
            mealPlanSupplements: true,
            stopSalesDates: true
          }
        }
      }
    });

    const offers = await this.prisma.offer.findMany({
      where: { id: { in: criteria.offerIds } },
      include: { offerPeriods: true }
    });

    // 2. Boucle EN MÉMOIRE
    const breakdown: NightlyBreakdown[] = [];
    for (let i = 0; i < criteria.totalNights; i++) {
      const night = addDays(criteria.checkIn, i);
      const period = this.findPeriodInMemory(night, contract.periods);
      
      // Calculer prix base (PER_ROOM ou PER_OCCUPANCY)
      const basePrice = this.calculateBasePrice(period, criteria.rooms[0]);
      
      // Appliquer offres (SEQUENTIAL ou ADDITIVE)
      const discount = this.applyOffers(basePrice, offers, night);
      
      breakdown.push({
        night,
        baseRoomPrice: basePrice,
        appliedOffers: offers.filter(o => this.isValidForNight(o, night)),
        discountAmount: discount,
        finalPriceThisNight: basePrice - discount
      });
    }

    // 3. Calculer suppléments
    const supplementsTotal = this.calculateSupplements(criteria.supplements, offers);

    return {
      roomsSubtotal: breakdown.reduce((sum, b) => sum + b.finalPriceThisNight, 0),
      supplementsTotal,
      totalAmount: /* ... */,
      breakdown
    };
  }

  private calculateBasePrice(period: ContractPeriod, room: RoomCriteria): number {
    const roomPrice = period.roomPrices.find(rp => rp.roomTypeId === room.roomTypeId);
    
    if (roomPrice.pricingMode === 'PER_ROOM') {
      return roomPrice.pricePerNight;
    }
    
    if (roomPrice.pricingMode === 'PER_OCCUPANCY') {
      const occupancyRate = roomPrice.occupancyRates.find(or =>
        or.numAdults === room.numAdults && or.numChildren === room.numChildren
      );
      return occupancyRate ? occupancyRate.totalRate : 0;
    }
    
    return 0;
  }

  private applyOffers(basePrice: number, offers: Offer[], night: Date): number {
    const validOffers = offers.filter(o => this.isValidForNight(o, night));
    
    if (validOffers.length === 0) return 0;
    
    const mode = validOffers[0].discountMode;
    
    if (mode === 'SEQUENTIAL') {
      // Prix × (1-A) × (1-B)
      return validOffers.reduce((price, offer) => {
        const reduction = offer.type === 'PERCENTAGE' 
          ? price * (offer.value / 100)
          : offer.value;
        return price - reduction;
      }, basePrice) - basePrice; // Retourne le montant de la réduction
    }
    
    if (mode === 'ADDITIVE') {
      // Prix × (1-(A+B))
      const totalPercent = validOffers.reduce((sum, o) => sum + (o.value || 0), 0);
      return basePrice * (totalPercent / 100);
    }
    
    return 0;
  }
}
```

### Frontend Tasks
- [ ] Intégrer résultat calcul dans wizard étape 5
- [ ] Affichage breakdown nuit par nuit
- [ ] Affichage agrégats (total chambres, suppléments, final)
- [ ] Modal breakdown détaillé

### Tests Unitaires (CRITIQUE)
- [ ] Test PER_ROOM simple
- [ ] **Test PER_OCCUPANCY (Single, Double, Triple) (NOUVEAU)**
- [ ] **Test offres SEQUENTIAL (NOUVEAU)**
- [ ] **Test offres ADDITIVE (NOUVEAU)**
- [ ] Test offres partielles (2 nuits sur 5)
- [ ] **Test suppléments PER_NIGHT vs PER_STAY (NOUVEAU)**
- [ ] Test meal plan supplement avec occupancy

### DoD Sprint 7
- [ ] Calcul correct avec tests unitaires (≥ 10 tests)
- [ ] **Breakdown nuit par nuit avec PER_OCCUPANCY (NOUVEAU)**
- [ ] **Offres SEQUENTIAL et ADDITIVE fonctionnent (NOUVEAU)**
- [ ] Offres partielles appliquées correctement
- [ ] **Suppléments 4 unités gérés (NOUVEAU)**
- [ ] Performance < 2s pour 30 nuits

---

## Sprint 8 – Finitions & Tests (3-4 jours)

**Inchangé**, voir `SPRINTS_1_TO_8_ROADMAP.md`.

---

## Métriques de succès (MVP)

- [ ] Un user peut créer un hôtel avec age categories
- [ ] **Un user peut créer une season réutilisable (NOUVEAU)**
- [ ] Un user peut créer un contrat avec plusieurs périodes
- [ ] **Un user peut créer des tarifs PER_OCCUPANCY (NOUVEAU)**
- [ ] Un user peut créer une offre avec périodes multiples
- [ ] **Un agent peut sélectionner des offres SEQUENTIAL OU ADDITIVE (NOUVEAU)**
- [ ] Un agent peut simuler une réservation complète
- [ ] **Le pricing engine calcule correctement PER_OCCUPANCY (NOUVEAU)**
- [ ] **Le pricing engine applique SEQUENTIAL et ADDITIVE (NOUVEAU)**
- [ ] Le breakdown nuit par nuit est généré
- [ ] Performance < 2s pour calcul booking 30 nuits

---

## Changements vs Version Initiale

| Aspect | Avant | Après | Impact |
|--------|-------|-------|--------|
| **Sprint 2** | Hotels only | Hotels + Seasons | +1 jour |
| **Sprint 4** | Contrats simples | Contrats + PER_OCCUPANCY | +1 jour |
| **Sprint 5** | Offres basiques | Offres SEQUENTIAL/ADDITIVE | Inchangé |
| **Sprint 7** | Pricing simple | Pricing complexe (occupancy, 4 unités) | +1 jour |
| **Total MVP** | 8-9 semaines | **9-10 semaines** | +1 semaine |

---

**Roadmap ajustée et validée** ✅