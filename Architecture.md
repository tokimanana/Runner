# Architecture Angular + NestJS + PostgreSQL - Version Finale

## Stack Technique Cohérente

### Frontend
- **Angular 16+** (Standalone components)
- **NgRx** (État global complexe)
- **Angular Material** (UI components)
- **RxJS** (Reactivité)

### Backend
- **NestJS** (API REST)
- **Prisma** (ORM PostgreSQL)
- **PostgreSQL** (Base de données)
- **JWT** (Authentification)

### Infrastructure
- **Docker** (PostgreSQL + pgAdmin)
- **Git** (Versioning)

## Structure des dossiers

```
src/
├── app/
│ ├── core/ # Services singleton, guards
│ │ ├── auth/
│ │ │ ├── auth.service.ts
│ │ │ ├── auth.guard.ts
│ │ │ └── role.guard.ts
│ │ ├── notification/
│ │ │ ├── notification.service.ts
│ │ │ └── store/
│ │ │     ├── notification.actions.ts
│ │ │     ├── notification.reducer.ts
│ │ │     └── notification.effects.ts
│ │ └── interceptors/
│ │ ├── auth.interceptor.ts
│ │ └── error.interceptor.ts
│ │
│ ├── shared/ # Composants réutilisables
│ │ ├── components/
│ │ │ ├── loading-spinner/
│ │ │ ├── confirmation-dialog/
│ │ │ └── page-header/
│ │ ├── pipes/
│ │ │ └── currency-format.pipe.ts
│ │ └── models/
│ │ ├── hotel.model.ts
│ │ ├── contract.model.ts
│ │ ├── offer.model.ts
│ │ └── booking.model.ts
│ │
│ ├── features/
│ │ ├── hotels/
│ │ │ ├── hotels.routes.ts
│ │ │ ├── store/
│ │ │ │ ├── hotels.actions.ts
│ │ │ │ ├── hotels.reducer.ts
│ │ │ │ ├── hotels.effects.ts
│ │ │ │ └── hotels.selectors.ts
│ │ │ ├── services/
│ │ │ │ └── hotels.service.ts
│ │ │ └── components/
│ │ │ ├── hotels-list/
│ │ │ ├── hotel-form/
│ │ │ └── age-categories-manager/
│ │ │
│ │ ├── contracts/
│ │ │ ├── contracts.routes.ts
│ │ │ ├── store/
│ │ │ │ ├── contracts.actions.ts
│ │ │ │ ├── contracts.reducer.ts
│ │ │ │ ├── contracts.effects.ts
│ │ │ │ └── contracts.selectors.ts
│ │ │ ├── services/
│ │ │ │ └── contracts.service.ts
│ │ │ └── components/
│ │ │ ├── contracts-list/
│ │ │ └── contract-form/
│ │ │
│ │ ├── offers/
│ │ │ ├── offers.routes.ts
│ │ │ ├── store/
│ │ │ │ ├── offers.actions.ts
│ │ │ │ ├── offers.reducer.ts
│ │ │ │ ├── offers.effects.ts
│ │ │ │ └── offers.selectors.ts
│ │ │ ├── services/
│ │ │ │ └── offers.service.ts
│ │ │ └── components/
│ │ │ ├── offers-list/
│ │ │ └── offer-form/
│ │ │
│ │ ├── booking/
│ │ │ ├── booking.routes.ts
│ │ │ ├── store/
│ │ │ │ ├── booking.actions.ts
│ │ │ │ ├── booking.reducer.ts
│ │ │ │ ├── booking.effects.ts
│ │ │ │ └── booking.selectors.ts
│ │ │ ├── services/
│ │ │ │ └── booking.service.ts
│ │ │ └── components/
│ │ │ ├── booking-wizard/
│ │ │ ├── hotel-selection/
│ │ │ ├── room-selection/
│ │ │ └── booking-summary/
│ │ │
│ │ └── admin/
│ │ ├── admin.routes.ts
│ │ ├── store/
│ │ │ ├── admin.actions.ts
│ │ │ ├── admin.reducer.ts
│ │ │ └── admin.selectors.ts
│ │ └── components/
│ │ ├── users-management/
│ │ └── booking-history/
│ │
│ ├── app.component.ts
│ ├── app.config.ts
│ └── app.routes.ts
│
└── environments/
├── environment.ts
└── environment.prod.ts
```

### `app.config.ts`
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { environment } from './environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Store imports
import { authReducer } from './core/auth/store/auth.reducer';
import { notificationReducer } from './core/notification/store/notification.reducer';
import { hotelsReducer } from './features/hotels/store/hotels.reducer';
import { contractsReducer } from './features/contracts/store/contracts.reducer';
import { offersReducer } from './features/offers/store/offers.reducer';
import { bookingReducer } from './features/booking/store/booking.reducer';
import { adminReducer } from './features/admin/store/admin.reducer';

// Effects imports
import { AuthEffects } from './core/auth/store/auth.effects';
import { NotificationEffects } from './core/notification/store/notification.effects';
import { HotelsEffects } from './features/hotels/store/hotels.effects';
import { ContractsEffects } from './features/contracts/store/contracts.effects';
import { OffersEffects } from './features/offers/store/offers.effects';
import { BookingEffects } from './features/booking/store/booking.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // ✅ NgRx Store global
    provideStore({
      auth: authReducer,
      notification: notificationReducer,
      hotels: hotelsReducer,
      contracts: contractsReducer,
      offers: offersReducer,
      booking: bookingReducer,
      admin: adminReducer
    }),
    
    // ✅ NgRx Effects
    provideEffects([
      AuthEffects,
      NotificationEffects,
      HotelsEffects,
      ContractsEffects,
      OffersEffects,
      BookingEffects
    ]),
    
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production })
  ]
};
```

### `environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000' // NestJS backend
};
```

### `app.routes.ts` (Routes globales)
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'hotels',
    loadChildren: () => import('./features/hotels/hotels.routes').then(m => m.HOTELS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'contracts',
    loadChildren: () => import('./features/contracts/contracts.routes').then(m => m.CONTRACTS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'offers',
    loadChildren: () => import('./features/offers/offers.routes').then(m => m.OFFERS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'booking',
    loadChildren: () => import('./features/booking/booking.routes').then(m => m.BOOKING_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

---

## Exemple : Feature Hotels (Standalone)

### `hotels.routes.ts`
```typescript
import { Routes } from '@angular/router';

export const HOTELS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/hotels-list/hotels-list.component')
      .then(m => m.HotelsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/hotel-form/hotel-form.component')
      .then(m => m.HotelFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/hotel-form/hotel-form.component')
      .then(m => m.HotelFormComponent)
  },
  {
    path: ':id/age-categories',
    loadComponent: () => import('./components/age-categories-manager/age-categories-manager.component')
      .then(m => m.AgeCategoriesManagerComponent)
  },
  {
    path: ':id/room-types',
    loadComponent: () => import('./components/room-types-manager/room-types-manager.component')
      .then(m => m.RoomTypesManagerComponent)
  }
];
```

### `hotels-list.component.ts` (Standalone)
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// App imports
import { AppState } from '@store/app.state';
import { Hotel } from '@shared/models';
import * as HotelsActions from '../../store/hotels.actions';
import { selectAllHotels, selectHotelsLoading } from '../../store/hotels.selectors';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-hotels-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './hotels-list.component.html',
  styleUrls: ['./hotels-list.component.scss']
})
export class HotelsListComponent implements OnInit {
  hotels$: Observable<Hotel[]>;
  loading$: Observable<boolean>;
  
  constructor(private store: Store<AppState>) {
    this.hotels$ = this.store.select(selectAllHotels);
    this.loading$ = this.store.select(selectHotelsLoading);
  }
  
  ngOnInit(): void {
    this.store.dispatch(HotelsActions.loadHotels());
  }
  
  onSelectHotel(hotelId: string): void {
    this.store.dispatch(HotelsActions.selectHotel({ hotelId }));
  }
  
  onDeleteHotel(hotelId: string): void {
    this.store.dispatch(HotelsActions.deleteHotel({ hotelId }));
  }
}
```

---

## Exemple : Booking Wizard (Standalone avec nommage professionnel)

### `booking.routes.ts`
```typescript
import { Routes } from '@angular/router';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/booking-wizard/booking-wizard.component')
      .then(m => m.BookingWizardComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./components/booking-history/booking-history.component')
      .then(m => m.BookingHistoryComponent)
  }
];
```

### `booking-wizard.component.ts` (Orchestrateur)
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// Material
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

// App imports
import { AppState } from '@store/app.state';
import { BookingState } from '../../store/booking.state';
import { selectBookingState, selectCurrentStep } from '../../store/booking.selectors';
import * as BookingActions from '../../store/booking.actions';

// Sub-components (standalone)
import { HotelDateSelectionComponent } from '../hotel-date-selection/hotel-date-selection.component';
import { RoomConfigurationComponent } from '../room-configuration/room-configuration.component';
import { OffersSelectionComponent } from '../offers-selection/offers-selection.component';
import { SupplementsSelectionComponent } from '../supplements-selection/supplements-selection.component';
import { BookingSummaryComponent } from '../booking-summary/booking-summary.component';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    HotelDateSelectionComponent,
    RoomConfigurationComponent,
    OffersSelectionComponent,
    SupplementsSelectionComponent,
    BookingSummaryComponent
  ],
  template: `
    <div class="booking-wizard">
      <h1>Nouvelle simulation de réservation</h1>
      
      <mat-stepper [linear]="true" #stepper>
        
        <!-- Étape 1 : Hôtel et dates -->
        <mat-step [completed]="(bookingState$ | async)?.hotelSelected">
          <ng-template matStepLabel>Hôtel et dates</ng-template>
          <app-hotel-date-selection
            [bookingState]="bookingState$ | async"
            (hotelSelected)="onHotelSelected($event)"
            (datesSelected)="onDatesSelected($event)">
          </app-hotel-date-selection>
          <div class="step-actions">
            <button mat-raised-button color="primary" matStepperNext>
              Suivant
            </button>
          </div>
        </mat-step>
        
        <!-- Étape 2 : Configuration des chambres -->
        <mat-step [completed]="(bookingState$ | async)?.roomsConfigured">
          <ng-template matStepLabel>Chambres et occupants</ng-template>
          <app-room-configuration
            [bookingState]="bookingState$ | async"
            (roomsConfigured)="onRoomsConfigured($event)">
          </app-room-configuration>
          <div class="step-actions">
            <button mat-button matStepperPrevious>Précédent</button>
            <button mat-raised-button color="primary" matStepperNext>
              Suivant
            </button>
          </div>
        </mat-step>
        
        <!-- Étape 3 : Sélection des offres -->
        <mat-step [completed]="(bookingState$ | async)?.offersSelected">
          <ng-template matStepLabel>Offres promotionnelles</ng-template>
          <app-offers-selection
            [bookingState]="bookingState$ | async"
            (offersSelected)="onOffersSelected($event)">
          </app-offers-selection>
          <div class="step-actions">
            <button mat-button matStepperPrevious>Précédent</button>
            <button mat-raised-button color="primary" matStepperNext>
              Suivant
            </button>
          </div>
        </mat-step>
        
        <!-- Étape 4 : Suppléments -->
        <mat-step [completed]="(bookingState$ | async)?.supplementsSelected">
          <ng-template matStepLabel>Suppléments</ng-template>
          <app-supplements-selection
            [bookingState]="bookingState$ | async"
            (supplementsSelected)="onSupplementsSelected($event)">
          </app-supplements-selection>
          <div class="step-actions">
            <button mat-button matStepperPrevious>Précédent</button>
            <button mat-raised-button color="primary" matStepperNext
              (click)="onCalculate()">
              Calculer le prix
            </button>
          </div>
        </mat-step>
        
        <!-- Étape 5 : Récapitulatif -->
        <mat-step>
          <ng-template matStepLabel>Récapitulatif</ng-template>
          <app-booking-summary
            [bookingState]="bookingState$ | async"
            (save)="onSave()"
            (export)="onExport()">
          </app-booking-summary>
          <div class="step-actions">
            <button mat-button matStepperPrevious>Modifier</button>
            <button mat-raised-button color="primary" (click)="onSave()">
              Sauvegarder
            </button>
          </div>
        </mat-step>
        
      </mat-stepper>
    </div>
  `,
  styleUrls: ['./booking-wizard.component.scss']
})
export class BookingWizardComponent implements OnInit {
  bookingState$: Observable<BookingState>;
  
  constructor(private store: Store<AppState>) {
    this.bookingState$ = this.store.select(selectBookingState);
  }
  
  ngOnInit(): void {
    this.store.dispatch(BookingActions.initializeBooking());
  }
  
  onHotelSelected(data: any): void {
    this.store.dispatch(BookingActions.setHotel(data));
  }
  
  onDatesSelected(data: any): void {
    this.store.dispatch(BookingActions.setDates(data));
  }
  
  onRoomsConfigured(data: any): void {
    this.store.dispatch(BookingActions.setRooms(data));
  }
  
  onOffersSelected(data: any): void {
    this.store.dispatch(BookingActions.setOffers(data));
  }
  
  onSupplementsSelected(data: any): void {
    this.store.dispatch(BookingActions.setSupplements(data));
  }
  
  onCalculate(): void {
    this.store.dispatch(BookingActions.calculatePrice());
  }
  
  onSave(): void {
    this.store.dispatch(BookingActions.saveBooking());
  }
  
  onExport(): void {
    this.store.dispatch(BookingActions.exportBooking());
  }
}
```

---

## Services simples (SANS store)

### `meal-plans.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MealPlan } from '@shared/models';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class MealPlansService {
  private mealPlans$ = new BehaviorSubject<MealPlan[]>([]);
  private apiUrl = `${environment.apiUrl}/meal-plans`;
  private loaded = false;
  
  constructor(private http: HttpClient) {}
  
  getMealPlans(): Observable<MealPlan[]> {
    if (!this.loaded) {
      this.loadMealPlans();
    }
    return this.mealPlans$.asObservable();
  }
  
  private loadMealPlans(): void {
    this.http.get<MealPlan[]>(this.apiUrl)
      .pipe(tap(data => {
        this.mealPlans$.next(data);
        this.loaded = true;
      }))
      .subscribe();
  }
  
  create(mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    return this.http.post<MealPlan>(this.apiUrl, mealPlan)
      .pipe(tap(() => this.loadMealPlans())); // Refresh
  }
  
  update(id: string, mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    return this.http.put<MealPlan>(`${this.apiUrl}/${id}`, mealPlan)
      .pipe(tap(() => this.loadMealPlans()));
  }
  
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadMealPlans()));
  }
}
```

---

## Guards (Functional guards - moderne)

### `auth.guard.ts`
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
```

### `role.guard.ts`
```typescript
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const allowedRoles = route.data['roles'] as string[];
  const userRole = authService.getCurrentUserRole();
  
  if (allowedRoles.includes(userRole)) {
    return true;
  }
  
  router.navigate(['/dashboard']);
  return false;
};
```

---

## Résumé des bonnes pratiques

### ✅ Utiliser NgRx Store UNIQUEMENT pour :
1. **Hotels** - Entité complexe, partagée partout
2. **Contracts** - Très complexe (periods, prices, rules)
3. **Offers** - Utilisé dans bookings, logique complexe
4. **Booking (wizard state)** - État multi-étapes à persister

### ✅ Services simples (BehaviorSubject) pour :
- MealPlans, Markets, Currencies, Supplements, Seasons
- Chargés une fois, rarement modifiés
- Pas de logique complexe

### ✅ Standalone benefits :
- Lazy loading natif
- Moins de boilerplate
- Tree-shaking optimal
- Plus moderne (Angular 14+)

---

**Architecture standalone complète et professionnelle ! ✅**