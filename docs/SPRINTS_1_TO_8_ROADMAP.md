# Sprints 1-8 – Roadmap Complète

## Vue d'ensemble

| Sprint | Titre | Durée | Objectif |
|--------|-------|-------|----------|
| 0 | Setup Infrastructure | 1-2j | Backend + Frontend foundation |
| 1 | Auth & Layout | 2-3j | Auth complète, layout dynamique |
| 2 | Hotels CRUD | 3-4j | Gestion hôtels + age categories + room types |
| 3 | Référentiels | 3j | MealPlans, Markets, Currencies, Supplements |
| 4 | Contracts | 5-6j | Contrats complexes + périodes + tarifs |
| 5 | Offers | 3-4j | Offres promotionnelles + règles |
| 6 | Booking UI | 4-5j | Wizard 5 étapes |
| 7 | Pricing Engine | 5-7j | Moteur de calcul nuit par nuit |
| 8 | Finitions & Tests | 3-4j | Perf, UX, tests unitaires |

**Total MVP: 8-9 semaines (2 mois)**

---

## Sprint 1 – Auth & Layout (2-3 jours)

### Objectif
Authentification complète avec rôles et layout dynamique selon le rôle.

### Backend Tasks

#### 1.1 Améliorer Auth Service
- [ ] Ajouter `getCurrentUserRole()` pour les guards.
- [ ] Implémenter refresh token (optionnel pour Sprint 0, recommandé ici).
- [ ] Ajouter validation email/password (class-validator).

**`backend/src/auth/dto/login.dto.ts`**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

#### 1.2 Créer RolesGuard
**`backend/src/auth/guards/roles.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

#### 1.3 Créer Roles Decorator
**`backend/src/auth/decorators/roles.decorator.ts`**
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

#### 1.4 Créer CurrentUser Decorator
**`backend/src/auth/decorators/current-user.decorator.ts`**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
```

#### 1.5 Ajouter Admin Module (stub)
```bash
cd backend
nest g module admin
nest g controller admin
nest g service admin
```

**`backend/src/admin/admin.controller.ts`**
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  getUsers() {
    return { message: 'Users list (coming soon)' };
  }
}
```

### Frontend Tasks

#### 1.1 Créer Layout Component
**`frontend/src/app/shared/layout/layout.component.ts`**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { selectUser } from '../../core/auth/store/auth.selectors';
import * as AuthActions from '../../core/auth/store/auth.actions';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Tour Operator System</span>
      <span class="spacer"></span>
      <button mat-button (click)="onLogout()">Logout</button>
    </mat-toolbar>

    <mat-sidenav-container>
      <mat-sidenav mode="side" opened>
        <mat-nav-list>
          <mat-list-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </mat-list-item>

          <mat-list-item *ngIf="(user$ | async)?.role === 'ADMIN' || (user$ | async)?.role === 'MANAGER'" routerLink="/hotels">
            <mat-icon>hotel</mat-icon>
            <span>Hotels</span>
          </mat-list-item>

          <mat-list-item *ngIf="(user$ | async)?.role === 'ADMIN' || (user$ | async)?.role === 'MANAGER'" routerLink="/contracts">
            <mat-icon>description</mat-icon>
            <span>Contracts</span>
          </mat-list-item>

          <mat-list-item *ngIf="(user$ | async)?.role === 'ADMIN' || (user$ | async)?.role === 'MANAGER'" routerLink="/offers">
            <mat-icon>local_offer</mat-icon>
            <span>Offers</span>
          </mat-list-item>

          <mat-list-item routerLink="/booking">
            <mat-icon>event_note</mat-icon>
            <span>Booking</span>
          </mat-list-item>

          <mat-list-item *ngIf="(user$ | async)?.role === 'ADMIN'" routerLink="/admin">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Admin</span>
          </mat-list-item>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    mat-sidenav-container {
      height: calc(100vh - 64px);
    }
  `],
})
export class LayoutComponent implements OnInit {
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}

  ngOnInit(): void {}

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
```

#### 1.2 Mettre à jour app.routes.ts
**`frontend/src/app/app.routes.ts`**
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'hotels',
        loadChildren: () => import('./features/hotels/hotels.routes').then((m) => m.HOTELS_ROUTES),
      },
      {
        path: 'contracts',
        loadChildren: () => import('./features/contracts/contracts.routes').then((m) => m.CONTRACTS_ROUTES),
      },
      {
        path: 'offers',
        loadChildren: () => import('./features/offers/offers.routes').then((m) => m.OFFERS_ROUTES),
      },
      {
        path: 'booking',
        loadChildren: () => import('./features/booking/booking.routes').then((m) => m.BOOKING_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
```

#### 1.3 Créer roleGuard
**`frontend/src/app/core/auth/role.guard.ts`**
```typescript
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from './store/auth.selectors';
import { take } from 'rxjs/operators';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[];

  let hasAccess = false;
  store.select(selectUser).pipe(take(1)).subscribe((user) => {
    if (user && allowedRoles.includes(user.role)) {
      hasAccess = true;
    }
  });

  if (!hasAccess) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
```

### DoD Sprint 1
- [ ] Login/Logout fonctionnels avec redirection.
- [ ] Layout avec sidebar dynamique selon rôle.
- [ ] Routes protégées par rôles (hotels/contracts/offers pour ADMIN/MANAGER).
- [ ] Admin panel accessible uniquement pour ADMIN.
- [ ] Auth store NgRx complet (login/logout/register).

---

## Sprint 2 – Hotels CRUD (3-4 jours)

### Backend Tasks
- [ ] Endpoints Hotels CRUD avec validation.
- [ ] Endpoints AgeCategories CRUD (sous-ressource).
- [ ] Endpoints RoomTypes CRUD.
- [ ] Indexes Prisma pour filtrage.

### Frontend Tasks
- [ ] Feature Hotels: routes standalone.
- [ ] Composant HotelsList (tableau + pagination).
- [ ] Composant HotelForm (create/edit).
- [ ] Composant AgeCategoriesManager.
- [ ] Composant RoomTypesManager.
- [ ] Store Hotels (NgRx): load, create, update, delete.
- [ ] Validations UI (nom, code, destination).

### DoD Sprint 2
- [ ] CRUD hôtel complet (create, read, update, delete).
- [ ] Age categories gérées par hôtel.
- [ ] Room types gérés par hôtel.
- [ ] Validations UI et backend.

---

## Sprint 3 – Référentiels (3 jours)

### Backend Tasks
- [ ] CRUD MealPlans, Markets, Currencies, Supplements.
- [ ] Endpoints simples GET/POST/PUT/DELETE.

### Frontend Tasks
- [ ] Services BehaviorSubject pour chaque référentiel.
- [ ] UI minimale: listes + sélecteurs.
- [ ] Intégration dans les formulaires (Hotels, Contracts, Booking).

**Exemple: MealPlansService**
```typescript
@Injectable({ providedIn: 'root' })
export class MealPlansService {
  private mealPlans$ = new BehaviorSubject<MealPlan[]>([]);
  private apiUrl = `${environment.apiUrl}/meal-plans`;
  private loaded = false;

  constructor(private http: HttpClient) {}

  getMealPlans(): Observable<MealPlan[]> {
    if (!this.loaded) {
      this.http.get<MealPlan[]>(this.apiUrl)
        .pipe(tap(data => {
          this.mealPlans$.next(data);
          this.loaded = true;
        }))
        .subscribe();
    }
    return this.mealPlans$.asObservable();
  }

  create(mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    return this.http.post<MealPlan>(this.apiUrl, mealPlan)
      .pipe(tap(() => this.refresh()));
  }

  private refresh(): void {
    this.loaded = false;
    this.getMealPlans().subscribe();
  }
}
```

### DoD Sprint 3
- [ ] Référentiels chargés globalement.
- [ ] BehaviorSubject utilisés dans les formulaires.
- [ ] Sélecteurs fonctionnels (ex: markets par currency).

---

## Sprint 4 – Contracts (5-6 jours)

### Backend Tasks
- [ ] Contracts CRUD.
- [ ] ContractPeriod CRUD (nested).
- [ ] RoomPrice CRUD (nested).
- [ ] MealPlanSupplement CRUD.
- [ ] Validation: périodes non chevauchantes.
- [ ] Validation: mode pricing cohérent.

### Frontend Tasks
- [ ] Feature Contracts: routes standalone.
- [ ] Composant ContractsList.
- [ ] Composant ContractForm (complexe: périodes, prix, meal supplements).
- [ ] Store Contracts (NgRx): load, create, update, delete.
- [ ] Validations UI: dates, prix, capacités.

### Opérateurs RxJS clés
- `combineLatest`: combiner hôtel + market + currency pour activer le bouton save.
- `switchMap`: charger les room types quand l'hôtel change.
- `withLatestFrom`: enrichir l'action avec le hotelId sélectionné.

### DoD Sprint 4
- [ ] Contrat créé avec périodes et prix.
- [ ] Validation périodes non chevauchantes.
- [ ] Mode pricing PER_ROOM et PER_PERSON fonctionnels.
- [ ] Meal plan supplements gérés.

---

## Sprint 5 – Offers (3-4 jours)

### Backend Tasks
- [ ] Offers CRUD.
- [ ] OfferPeriod CRUD (nested).
- [ ] OfferSupplement CRUD.
- [ ] Validation: DiscountMode non mixable (COMBINABLE vs CUMULATIVE).

### Frontend Tasks
- [ ] Feature Offers: routes standalone.
- [ ] Composant OffersList.
- [ ] Composant OfferForm (périodes, type réduction, mode, suppléments).
- [ ] Store Offers (NgRx).
- [ ] Validations UI: type réduction, mode, min stay.

### DoD Sprint 5
- [ ] Offres créées avec périodes.
- [ ] Mode COMBINABLE vs CUMULATIVE sélectionnable.
- [ ] Suppléments applicables configurables.

---

## Sprint 6 – Booking UI (4-5 jours)

### Frontend Tasks
- [ ] Feature Booking: routes standalone.
- [ ] Wizard 5 étapes:
  1. Hôtel + dates + market + currency.
  2. Chambres + occupants (validation capacité/âges).
  3. Offres applicables (sélection).
  4. Suppléments (sélection).
  5. Résumé (affichage payload).
- [ ] Store Booking (NgRx): orchestrateur multi-étapes.
- [ ] Validations UI: dates, capacités, min stay.

### Backend Tasks
- [ ] Endpoint POST /bookings/simulate (stub pour le moment).

### Opérateurs RxJS clés
- `combineLatest`: combiner tous les champs du wizard pour activer "Suivant".
- `debounceTime`: éviter les appels trop fréquents lors de la saisie.
- `distinctUntilChanged`: éviter re-traitements inutiles.
- `filter`: ignorer les états incomplets.

### DoD Sprint 6
- [ ] Wizard navigable 5 étapes.
- [ ] Validation capacité/âges selon RoomType et AgeCategories.
- [ ] Payload prêt pour le calcul backend.

---

## Sprint 7 – Pricing Engine (5-7 jours)

### Backend Tasks (CRITIQUE)
- [ ] Service Pricing: calcul nuit par nuit.
- [ ] Sélection de la période tarifaire valide.
- [ ] Mode pricing: PER_ROOM, PER_PERSON, HYBRID.
- [ ] Application des offres:
  - COMBINABLE: additionner les %.
  - CUMULATIVE: composer les réductions.
  - Validation: pas de mixage.
- [ ] Application des suppléments avec canReceiveDiscount.
- [ ] Breakdown détaillé (nuit par nuit).
- [ ] Agrégats: total chambres, total suppléments, total final.
- [ ] Endpoint POST /bookings/simulate retourne BookingCalculation DTO.
- [ ] Tests unitaires PricingService (cas PER_ROOM, PER_PERSON, offres partielles, min stay, stop sales, cumul/combinable).

**Exemple: PricingService (pseudo-code)**
```typescript
@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculatePrice(criteria: BookingCalculateCriteria): Promise<BookingCalculation> {
    // 1. Récupérer le contrat valide
    const contract = await this.findValidContract(criteria);
    
    // 2. Boucle nuit par nuit
    const breakdown: NightlyBreakdown[] = [];
    for (let i = 0; i < criteria.totalNights; i++) {
      const night = addDays(criteria.checkIn, i);
      
      // 3. Calculer prix base (room + meal)
      const basePrice = this.calculateBasePrice(contract, criteria, night);
      
      // 4. Appliquer offres valides cette nuit
      const offersApplied = this.getApplicableOffers(criteria.offers, night);
      const discountAmount = this.applyOffers(basePrice, offersApplied);
      
      // 5. Stocker breakdown
      breakdown.push({
        night,
        basePrice,
        appliedOffers: offersApplied,
        discountAmount,
        finalPrice: basePrice - discountAmount,
      });
    }
    
    // 6. Calculer suppléments
    const supplementsTotal = this.calculateSupplements(criteria.supplements, criteria.offers);
    
    // 7. Agrégats
    const roomsSubtotal = breakdown.reduce((sum, b) => sum + b.finalPrice, 0);
    const totalAmount = roomsSubtotal + supplementsTotal;
    
    return {
      roomsSubtotal,
      supplementsTotal,
      totalAmount,
      breakdown,
    };
  }

  private applyOffers(basePrice: number, offers: Offer[]): number {
    // Logique COMBINABLE vs CUMULATIVE
    if (offers.some(o => o.discountMode === 'CUMULATIVE')) {
      // Composer les réductions
      return offers.reduce((price, offer) => {
        const reduction = offer.type === 'PERCENTAGE' 
          ? price * (offer.value / 100) 
          : offer.value;
        return price - reduction;
      }, basePrice);
    } else {
      // Additionner les %
      const totalPercent = offers.reduce((sum, o) => sum + (o.value || 0), 0);
      return basePrice * (totalPercent / 100);
    }
  }
}
```

### Frontend Tasks
- [ ] Intégrer le résultat du calcul dans l'étape 5 du wizard.
- [ ] Affichage breakdown nuit par nuit (tableau).
- [ ] Affichage agrégats (total chambres, suppléments, final).
- [ ] Modal ou page détaillée pour breakdown complet.

### DoD Sprint 7
- [ ] Calcul correct avec tests unitaires.
- [ ] Breakdown nuit par nuit affiché.
- [ ] Offres partielles appliquées correctement.
- [ ] Suppléments avec/sans réduction gérés.
- [ ] Performance < 2s pour 30 nuits.

---

## Sprint 8 – Finitions & Tests (3-4 jours)

### Backend Tasks
- [ ] Pagination pour listes (hotels, contracts, offers).
- [ ] Filtrage avancé (par hôtel, market, dates).
- [ ] Gestion d'erreurs propre (HTTP status, messages clairs).
- [ ] Logs structurés.
- [ ] Tests unitaires: PricingService, HotelsService, ContractsService.
- [ ] Tests d'intégration: flow complet booking.

### Frontend Tasks
- [ ] Loading indicators (spinners).
- [ ] Error handling (toasts, messages).
- [ ] Validations complètes (email, dates, capacités).
- [ ] Tests unitaires: selectors NgRx, services.
- [ ] Performance: lazy loading, tree-shaking.
- [ ] Responsive design (mobile-friendly).

### DevOps Tasks
- [ ] Seed data pour tests (hôtels, contrats, offres).
- [ ] Documentation API (Swagger).
- [ ] Checklist déploiement.

### DoD Sprint 8
- [ ] Tous les tests passent.
- [ ] Performance validée.
- [ ] UX polished (loaders, erreurs, validations).
- [ ] Documentation à jour.

---

## Métriques de succès (MVP)

- [ ] Un user peut créer un hôtel avec age categories.
- [ ] Un user peut créer un contrat avec plusieurs périodes.
- [ ] Un user peut créer une offre avec périodes multiples.
- [ ] Un agent peut simuler une réservation complète.
- [ ] Le pricing engine calcule correctement (tests validés).
- [ ] Le breakdown nuit par nuit est généré.
- [ ] Performance < 2s pour calcul booking 30 nuits.

---

## Commandes utiles par sprint

```bash
# Backend
npm run start:dev
npm run test
npm run test:cov
npx prisma migrate dev --name <name>
npx prisma db seed

# Frontend
ng serve
ng test
ng build --prod
ng lint

# Docker
docker-compose up -d
docker-compose down
docker ps
```

---

**Roadmap complète prête ! 🚀**
