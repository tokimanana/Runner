# Architecture Finale - Tour Operator System

## 🎯 Stack Technique Validée

### Frontend
- **Angular 18+** (Standalone components)
- **NgRx** (État global pour Hotels, Contracts, Offers, Booking)
- **Angular Material** (UI components)
- **RxJS** (Réactivité)

### Backend
- **NestJS** (API REST)
- **Prisma** (ORM PostgreSQL avec types générés)
- **PostgreSQL 15** (Base de données relationnelle)
- **JWT + Passport** (Authentification)
- **Bcrypt** (Hash passwords)

### Infrastructure
- **Docker** (PostgreSQL + pgAdmin)
- **Git** (Versioning)
- **Jest** (Tests unitaires backend)
- **Jasmine/Karma** (Tests unitaires frontend)

---

## 📁 Structure Backend (NestJS + Prisma)

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── prisma/                      # Module Prisma global
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── auth/                        # Authentification JWT
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   │
│   ├── hotels/                      # Module Hotels
│   │   ├── hotels.module.ts
│   │   ├── hotels.controller.ts
│   │   ├── hotels.service.ts
│   │   └── dto/
│   │       ├── create-hotel.dto.ts
│   │       └── update-hotel.dto.ts
│   │
│   ├── seasons/                     # Module Seasons
│   │   ├── seasons.module.ts
│   │   ├── seasons.controller.ts
│   │   ├── seasons.service.ts
│   │   └── dto/
│   │
│   ├── contracts/                   # Module Contracts
│   │   ├── contracts.module.ts
│   │   ├── contracts.controller.ts
│   │   ├── contracts.service.ts
│   │   └── dto/
│   │       ├── create-contract.dto.ts
│   │       └── create-contract-period.dto.ts
│   │
│   ├── offers/                      # Module Offers
│   │   ├── offers.module.ts
│   │   ├── offers.controller.ts
│   │   ├── offers.service.ts
│   │   └── dto/
│   │
│   ├── supplements/                 # Module Supplements
│   │   ├── supplements.module.ts
│   │   ├── supplements.controller.ts
│   │   └── supplements.service.ts
│   │
│   ├── booking/                     # Module Booking
│   │   ├── booking.module.ts
│   │   ├── booking.controller.ts
│   │   ├── booking.service.ts
│   │   └── dto/
│   │       └── booking-calculate.dto.ts
│   │
│   └── pricing/                     # Pricing Engine (Service pur)
│       ├── pricing.module.ts
│       ├── pricing.service.ts
│       └── pricing.service.spec.ts  # Tests unitaires
│
├── prisma/
│   ├── schema.prisma                # Schéma final simplifié
│   ├── seed.ts                      # Données de test
│   └── migrations/
│
├── test/
│   └── app.e2e-spec.ts
│
├── .env
├── package.json
└── tsconfig.json
```

---

## 📁 Structure Frontend (Angular Standalone)

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Services singleton, guards
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── role.guard.ts
│   │   │   │   └── store/
│   │   │   │       ├── auth.actions.ts
│   │   │   │       ├── auth.reducer.ts
│   │   │   │       ├── auth.effects.ts
│   │   │   │       └── auth.selectors.ts
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts
│   │   │
│   │   ├── shared/                  # Composants réutilisables
│   │   │   ├── components/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── page-header/
│   │   │   ├── layout/
│   │   │   │   └── layout.component.ts
│   │   │   ├── pipes/
│   │   │   │   └── currency-format.pipe.ts
│   │   │   └── models/
│   │   │       ├── hotel.model.ts
│   │   │       ├── season.model.ts 
│   │   │       ├── contract.model.ts
│   │   │       ├── offer.model.ts
│   │   │       └── booking.model.ts
│   │   │
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.component.ts
│   │   │   │
│   │   │   ├── hotels/              # Feature Hotels
│   │   │   │   ├── hotels.routes.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── hotels.actions.ts
│   │   │   │   │   ├── hotels.reducer.ts
│   │   │   │   │   ├── hotels.effects.ts
│   │   │   │   │   └── hotels.selectors.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── hotels.service.ts
│   │   │   │   └── components/
│   │   │   │       ├── hotels-list/
│   │   │   │       ├── hotel-form/
│   │   │   │       ├── age-categories-manager/
│   │   │   │       └── room-types-manager/
│   │   │   │
│   │   │   ├── seasons/             # Feature Seasons
│   │   │   │   ├── seasons.routes.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── seasons.service.ts  # Simple BehaviorSubject
│   │   │   │   └── components/
│   │   │   │       ├── seasons-list/
│   │   │   │       └── season-form/
│   │   │   │
│   │   │   ├── contracts/           # Feature Contracts
│   │   │   │   ├── contracts.routes.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── contracts.actions.ts
│   │   │   │   │   ├── contracts.reducer.ts
│   │   │   │   │   ├── contracts.effects.ts
│   │   │   │   │   └── contracts.selectors.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── contracts.service.ts
│   │   │   │   └── components/
│   │   │   │       ├── contracts-list/
│   │   │   │       ├── contract-form/
│   │   │   │       └── contract-period-form/
│   │   │   │
│   │   │   ├── offers/              # Feature Offers
│   │   │   │   ├── offers.routes.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── offers.actions.ts
│   │   │   │   │   ├── offers.reducer.ts
│   │   │   │   │   ├── offers.effects.ts
│   │   │   │   │   └── offers.selectors.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── offers.service.ts
│   │   │   │   └── components/
│   │   │   │       ├── offers-list/
│   │   │   │       └── offer-form/
│   │   │   │
│   │   │   ├── booking/             # Feature Booking
│   │   │   │   ├── booking.routes.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── booking.actions.ts
│   │   │   │   │   ├── booking.reducer.ts
│   │   │   │   │   ├── booking.effects.ts
│   │   │   │   │   └── booking.selectors.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── booking.service.ts
│   │   │   │   └── components/
│   │   │   │       ├── booking-wizard/
│   │   │   │       ├── hotel-date-selection/
│   │   │   │       ├── room-configuration/
│   │   │   │       ├── offers-selection/
│   │   │   │       ├── supplements-selection/
│   │   │   │       └── booking-summary/
│   │   │   │
│   │   │   └── admin/               # Feature Admin
│   │   │       ├── admin.routes.ts
│   │   │       ├── store/
│   │   │       │   ├── admin.actions.ts
│   │   │       │   ├── admin.reducer.ts
│   │   │       │   └── admin.selectors.ts
│   │   │       └── components/
│   │   │           ├── users-management/
│   │   │           └── booking-history/
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
│
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🔄 Flux de Données (Backend)

### Exemple : Calcul d'une Réservation

```typescript
// booking.controller.ts
@Post('calculate')
async calculatePrice(@Body() criteria: BookingCalculateCriteria) {
  return this.pricingService.calculatePrice(criteria);
}

// pricing.service.ts
async calculatePrice(criteria: BookingCalculateCriteria) {
  // 1. Charger TOUT en 1 requête (avec includes)
  const contract = await this.prisma.contract.findFirst({
    where: { hotelId, marketId },
    include: {
      hotel: { include: { ageCategories: true } },
      periods: {
        where: {
          startDate: { lte: criteria.checkOut },
          endDate: { gte: criteria.checkIn }
        },
        include: {
          season: true,
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
  
  // 2. Boucle EN MÉMOIRE (0 requête DB)
  const breakdown = [];
  for (let night of nights) {
    const period = this.findPeriodInMemory(night, contract.periods);
    const roomPrice = this.calculateRoomPrice(period, criteria);
    const discount = this.applyOffers(roomPrice, offers, night);
    
    breakdown.push({
      night,
      baseRoomPrice: roomPrice,
      discountAmount: discount,
      finalPrice: roomPrice - discount
    });
  }
  
  return { breakdown, totalAmount, ... };
}
```

**Résultat** : 2 requêtes DB max, calcul en < 200ms.

---

## 🔄 Flux de Données (Frontend)

### Exemple : Wizard de Réservation

```typescript
// booking-wizard.component.ts
export class BookingWizardComponent {
  bookingState$ = this.store.select(selectBookingState);
  
  onHotelSelected(hotelId: string): void {
    // Dispatch action → Effect → API call → Store update
    this.store.dispatch(BookingActions.setHotel({ hotelId }));
  }
  
  onCalculate(): void {
    // Dispatch action → Effect → PricingService → Store
    this.store.dispatch(BookingActions.calculatePrice());
  }
}

// booking.effects.ts
calculatePrice$ = createEffect(() =>
  this.actions$.pipe(
    ofType(BookingActions.calculatePrice),
    withLatestFrom(this.store.select(selectBookingState)),
    switchMap(([_, bookingState]) => {
      // Appel API Backend
      return this.bookingService.calculatePrice(bookingState).pipe(
        map(result => BookingActions.calculatePriceSuccess({ result })),
        catchError(error => of(BookingActions.calculatePriceFailure({ error })))
      );
    })
  )
);
```

---

## 🎯 Services avec/sans NgRx

### ✅ Avec NgRx Store (État Complexe)

| Feature | Raison |
|---------|--------|
| **Hotels** | Partagé partout, CRUD complexe |
| **Contracts** | Très complexe (periods, prices, rules) |
| **Offers** | Utilisé dans booking, logique complexe |
| **Booking** | État multi-étapes à persister |
| **Admin** | Historique, filtres, pagination |

---

### ✅ Avec Services Simples (BehaviorSubject)

| Feature | Raison |
|---------|--------|
| **Seasons** | CRUD simple, rarement modifié |
| **MealPlans** | Référentiel stable |
| **Markets** | Référentiel stable |
| **Currencies** | Référentiel global |
| **Supplements** | CRUD simple |

**Exemple Service Simple** :
```typescript
@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private seasons$ = new BehaviorSubject<Season[]>([]);
  private loaded = false;
  
  getSeasons(): Observable<Season[]> {
    if (!this.loaded) {
      this.http.get<Season[]>(`${apiUrl}/seasons`)
        .pipe(tap(data => {
          this.seasons$.next(data);
          this.loaded = true;
        }))
        .subscribe();
    }
    return this.seasons$.asObservable();
  }
}
```

---

## 🔒 Sécurité & Authentification

### Backend Guards

```typescript
// Exemple : Hotels Controller
@Controller('hotels')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class HotelsController {
  
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT)
  findAll(@CurrentUser() user: any) {
    return this.hotelsService.findAll(user.tourOperatorId);
  }
  
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateHotelDto, @CurrentUser() user: any) {
    return this.hotelsService.create(user.tourOperatorId, dto);
  }
}
```

### Frontend Guards

```typescript
// app.routes.ts
{
  path: 'hotels',
  loadChildren: () => import('./features/hotels/hotels.routes'),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'MANAGER'] }
}
```

---

## 📊 Performance & Optimisation

### Backend

1. **Requêtes DB** : 1-2 max par calcul booking
2. **Indexes Prisma** : Sur tous les champs filtres fréquents
3. **JSON fields** : Pour flexibilité (ratesPerAge, occupancyRates)
4. **Pagination** : Limit 50 par défaut sur listes

### Frontend

1. **Cache NgRx** : 5 min pour contrats/offres
2. **Lazy Loading** : Routes chargées à la demande
3. **OnPush Strategy** : Composants optimisés
4. **Virtual Scrolling** : Listes longues (Mat-Virtual-Scroll)

---

## ✅ Décisions Techniques Finales

| Aspect | Décision | Implémenté Dans |
|--------|----------|-----------------|
| **Season réutilisable** | ✅ Oui | `schema.prisma` |
| **Pas de validFrom/To dans Contract** | ✅ Oui | `Contract` model |
| **seasonId obligatoire** | ✅ Oui | `ContractPeriod` |
| **PER_OCCUPANCY mode** | ✅ Oui | `RoomPrice` + `OccupancyRate` |
| **Offres SEQUENTIAL** | ✅ Oui | `DiscountMode` enum |
| **Offres ADDITIVE** | ✅ Oui | `DiscountMode` enum |
| **Non-mixabilité** | ✅ UI bloque | `offers-selection.component.ts` |
| **4 unités suppléments** | ✅ Oui | `SupplementUnit` enum |
| **Meal sup = prix total** | ✅ Oui | `MealPlanSupplement` |
| **1 requête DB** | ✅ Oui | `pricing.service.ts` |
| **Cache 5 min** | ✅ Oui | `booking.effects.ts` |
| **Refetch age cat** | ✅ Oui | `room-configuration.component.ts` |
| **Multi-tenancy** | ✅ Oui | `tourOperatorId` partout |

---

## 🚀 Commandes de Démarrage

### Backend

```bash
cd backend

# Installer dépendances
npm install

# Lancer PostgreSQL
docker-compose up -d

# Créer les tables
npx prisma migrate dev --name init

# Seed data
npx prisma db seed

# Lancer le serveur
npm run start:dev
```

### Frontend

```bash
cd frontend

# Installer dépendances
npm install

# Lancer le dev server
ng serve
```

**URLs** :
- Frontend : http://localhost:4200
- Backend : http://localhost:3000
- pgAdmin : http://localhost:5050
- Prisma Studio : http://localhost:5555 (`npx prisma studio`)

---

**Architecture validée et simplifiée** ✅