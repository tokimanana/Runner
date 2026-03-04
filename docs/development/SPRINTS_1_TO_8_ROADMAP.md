# Sprints 1-8 – Roadmap Complète

## Vue d'ensemble

| Sprint | Titre                | Durée | Objectif                                                   |
| ------ | -------------------- | ----- | ---------------------------------------------------------- |
| 0      | Setup Infrastructure | 1-2j  | Backend + Frontend foundation                              |
| 1      | Auth & Layout        | 2-3j  | Auth complète, layout dynamique                            |
| 2      | Hotels + Seasons     | 4-5j  | Gestion hôtels + age categories + room types + **seasons** |
| 3      | Référentiels         | 3j    | MealPlans, Markets, Currencies, Supplements                |
| 4      | Contracts            | 6-7j  | Contrats complexes + périodes + tarifs **PER_OCCUPANCY**   |
| 5      | Offers               | 3-4j  | Offres promotionnelles + règles **SEQUENTIAL/ADDITIVE**    |
| 6      | Booking UI           | 4-5j  | Wizard 5 étapes                                            |
| 7      | Pricing Engine       | 5-7j  | Moteur de calcul nuit par nuit                             |
| 8      | Finitions & Tests    | 3-4j  | Perf, UX, tests unitaires                                  |

**Total MVP: 9-10 semaines (2.5 mois)**

---

## Sprint 0 – Setup Infrastructure (1-2 jours)

**✅ Documenté dans `SPRINT_0_SETUP.md`** (version mise à jour — Angular 19 + PrimeNG + NgRx, pas Angular Material)

**Décisions clés :**

- Angular 19 standalone — pas de NgModule
- PrimeNG 19 + Tailwind CSS v4 — pas Angular Material
- NgRx pour l'auth uniquement — BehaviorSubject pour les features CRUD
- Token `access_token` en mémoire — pas localStorage
- Refresh token en cookie `httpOnly` (Sprint 1)
- Interceptor fonctionnel — pas de classe
- Guards avec `UrlTree` — pas `false` + `navigate()`
- `inject()` — pas `constructor injection`

**Definition of Done :**

- ✅ Docker PostgreSQL + pgAdmin démarrés
- ✅ Prisma schema appliqué, tables créées
- ✅ NestJS démarre sur http://localhost:3000
- ✅ `POST /auth/login` retourne `{ access_token, user }` ou HTTP 401
- ✅ `nx serve frontend` démarre sur http://localhost:4200
- ✅ Login + Dashboard fonctionnels
- ✅ NgRx store auth configuré
- ✅ Interceptor ajoute le Bearer token depuis le store
- ✅ Tailwind CSS opérationnel

---

## Sprint 1 – Auth & Layout (2-3 jours)

## Sprint 1 – Auth & Layout (2-3 jours)

**Objectif** : Auth complète (refresh token cookie httpOnly) + layout de l'application (shell, sidebar, header).

---

### Backend Tasks

| Ticket    | Titre                           | Priorité | SP  |
| --------- | ------------------------------- | -------- | --- |
| S1-BE-001 | RolesGuard + décorateurs        | P0       | 1   |
| S1-BE-002 | Endpoint GET /auth/me           | P2       | 1   |
| S1-BE-003 | Refresh token (cookie httpOnly) | P0       | 3   |
| S1-BE-004 | Seed data utilisateurs          | P0       | 1   |

#### S1-BE-001 — RolesGuard + décorateurs

```typescript
// apps/backend/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

```typescript
// apps/backend/src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

#### S1-BE-002 — GET /auth/me _(P2 — remplacé fonctionnellement par le refresh token)_

```typescript
// apps/backend/src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  }
);
```

```typescript
// AuthController
@Get('me')
@UseGuards(AuthGuard('jwt'))
getMe(@CurrentUser() user: any) {
  return this.authService.findMe(user.userId);
}

// AuthService — select pour ne jamais exposer passwordHash
async findMe(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tourOperatorId: true,
    },
  });
}
```

#### S1-BE-003 — Refresh token (cookie httpOnly) _(P0)_

**Pourquoi cookie httpOnly ?**

- `access_token` en mémoire (15min) — perdu au reload mais sécurisé contre XSS
- `refresh_token` en cookie httpOnly (7j) — jamais accessible depuis JavaScript
- Au reload → `POST /auth/refresh` → cookie envoyé automatiquement → store rehydraté
- `GET /auth/me` devient inutile — le refresh retourne déjà `{ access_token, user }`

**Schema Prisma à ajouter :**

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

```typescript
// POST /auth/login
@Post('login')
async login(@Body() body, @Res({ passthrough: true }) res: Response) {
  const user = await this.authService.validateUser(body.email, body.password);
  if (!user) throw new UnauthorizedException('Invalid credentials');
  const result = await this.authService.login(user);

  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { access_token: result.access_token, user: result.user };
}

// POST /auth/refresh
@Post('refresh')
async refresh(@Req() req: Request) {
  const refreshToken = req.cookies['refresh_token'];
  if (!refreshToken) throw new UnauthorizedException();
  return this.authService.refreshToken(refreshToken);
}

// POST /auth/logout
@Post('logout')
@UseGuards(AuthGuard('jwt'))
async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies['refresh_token'];
  if (refreshToken) await this.authService.revokeRefreshToken(refreshToken);
  res.clearCookie('refresh_token');
  return { success: true };
}
```

#### S1-BE-004 — Seed data

```typescript
// apps/backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tourOperator = await prisma.tourOperator.upsert({
    where: { id: 'seed-tour-operator' },
    update: {},
    create: { id: 'seed-tour-operator', name: 'Runner Travel' },
  });

  const hashedPassword = await bcrypt.hash('Password1234!', 10);

  for (const u of [
    {
      email: 'admin@runner.com',
      firstName: 'Admin',
      lastName: 'Runner',
      role: 'ADMIN',
    },
    {
      email: 'manager@runner.com',
      firstName: 'Marie',
      lastName: 'Manager',
      role: 'MANAGER',
    },
    {
      email: 'agent@runner.com',
      firstName: 'Jean',
      lastName: 'Agent',
      role: 'AGENT',
    },
  ]) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        passwordHash: hashedPassword,
        tourOperatorId: tourOperator.id,
      },
    });
  }

  console.log('✅ Seed terminé');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

> **Pourquoi `upsert` ?** Idempotent — relancer le seed ne crée pas de doublons.

**Credentials de test :**

| Email              | Password      | Rôle    |
| ------------------ | ------------- | ------- |
| admin@runner.com   | Password1234! | ADMIN   |
| manager@runner.com | Password1234! | MANAGER |
| agent@runner.com   | Password1234! | AGENT   |

---

### Frontend Tasks

| Ticket    | Titre                     | Priorité | SP  |
| --------- | ------------------------- | -------- | --- |
| S1-FE-001 | RoleGuard                 | P0       | 1   |
| S1-FE-002 | Shell component           | P0       | 2   |
| S1-FE-003 | Sidebar component         | P0       | 2   |
| S1-FE-004 | Header component          | P0       | 1   |
| S1-FE-005 | Logout fonctionnel        | P0       | 1   |
| S1-FE-006 | Rehydratation au reload   | P1       | 2   |
| S1-FE-007 | Refresh token interceptor | P1       | 3   |

#### S1-FE-001 — RoleGuard

```typescript
// apps/frontend/src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectUserRole } from '../auth/store/auth.selectors';

export const RoleGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[];

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (!requiredRoles || requiredRoles.includes(role!)) return true;
      return router.createUrlTree(['/dashboard']);
    })
  );
};
```

#### S1-FE-002 — Shell component

```typescript
// app.routes.ts — Shell lazy-loadé
{
  path: '',
  loadComponent: () =>
    import('./core/shell/shell.component').then((m) => m.ShellComponent),
  canActivate: [AuthGuard],
  children: [
    { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  ],
}
```

> **Pourquoi lazy-loader le Shell ?** Cohérence — tous les composants sont lazy-loadés.
> **Pourquoi Shell sur la route parente ?** DRY — sidebar + header chargés une seule fois pour toutes les routes protégées.

#### S1-FE-003 — Sidebar

- `RouterLinkActive` pour le lien actif
- Items visibles selon `selectUserRole`
- Sprint 1 : Dashboard uniquement — autres items ajoutés au fil des sprints

#### S1-FE-004 — Header

- `selectCurrentUser` → affiche `firstName + lastName` + badge rôle
- `p-avatar` PrimeNG avec initiales
- Bouton logout

#### S1-FE-005 — Logout

```typescript
logout$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          tap(() => void this.router.navigate(['/login'])),
          catchError(() => {
            void this.router.navigate(['/login']);
            return EMPTY;
          })
        )
      )
    ),
  { dispatch: false }
);
```

#### S1-FE-006 — Rehydratation au reload _(dépend de S1-BE-003)_

```typescript
// app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: (store: Store, authService: AuthService) => () =>
    authService.refresh().pipe(
      tap((response) => store.dispatch(AuthActions.loginSuccess({
        user: response.user,
        accessToken: response.access_token,
      }))),
      catchError(() => EMPTY),
    ),
  deps: [Store, AuthService],
  multi: true,
}
```

> Cookie httpOnly envoyé automatiquement par le navigateur — pas besoin de lire ou stocker le refresh token côté Angular.

#### S1-FE-007 — Refresh token interceptor _(dépend de S1-BE-003)_

```typescript
return next(authReq).pipe(
  catchError((error) => {
    if (error.status === 401 && !req.url.includes('/auth/')) {
      return authService.refresh().pipe(
        switchMap(({ access_token, user }) => {
          store.dispatch(
            AuthActions.loginSuccess({ user, accessToken: access_token })
          );
          const retryReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${access_token}`),
          });
          return next(retryReq);
        }),
        catchError(() => {
          store.dispatch(AuthActions.logout());
          return throwError(() => error);
        })
      );
    }
    return throwError(() => error);
  })
);
```

### Ordre d'exécution Sprint 1

```
Backend :
S1-BE-004 → S1-BE-001 → S1-BE-003 → S1-BE-002 (si temps)

Frontend :
S1-FE-001 → S1-FE-002 → S1-FE-003 → S1-FE-004 → S1-FE-005
  → (attendre S1-BE-003) → S1-FE-006 → S1-FE-007
```

### Definition of Done Sprint 1

- ✅ Login réel frontend ↔ backend fonctionne
- ✅ Layout shell visible avec sidebar + header sur toutes les pages protégées
- ✅ `/login` n'affiche PAS le shell
- ✅ Logout invalide le cookie refresh token
- ✅ Store NgRx réinitialisé après logout
- ✅ RoleGuard bloque les routes selon le rôle
- ✅ Refresh de page ne déconnecte pas l'utilisateur (cookie httpOnly)

---

## Sprint 2 – Hotels + Seasons (4-5 jours)

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
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
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

#### 2.2 Seasons

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
    this.http
      .get<Season[]>(this.apiUrl)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.seasons$.next(data);
          this.loaded = true;
        },
        error: (err) => console.error('Failed to load seasons', err),
      });
  }

  create(season: Partial<Season>): Observable<Season> {
    return this.http
      .post<Season>(this.apiUrl, season)
      .pipe(tap(() => this.refresh()));
  }

  update(id: string, season: Partial<Season>): Observable<Season> {
    return this.http
      .put<Season>(`${this.apiUrl}/${id}`, season)
      .pipe(tap(() => this.refresh()));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
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

⏳ Détails à définir en Sprint 5.

**Objectif** : Wizard de réservation 5 étapes.

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

⏳ Détails à définir en Sprint 7.

**Objectif** : Performance, UX, tests unitaires, préparation mise en production.

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

| Aspect        | Avant            | Après                                  | Impact     |
| ------------- | ---------------- | -------------------------------------- | ---------- |
| **Sprint 2**  | Hotels only      | Hotels + Seasons                       | +1 jour    |
| **Sprint 4**  | Contrats simples | Contrats + PER_OCCUPANCY               | +1 jour    |
| **Sprint 5**  | Offres basiques  | Offres SEQUENTIAL/ADDITIVE             | Inchangé   |
| **Sprint 7**  | Pricing simple   | Pricing complexe (occupancy, 4 unités) | +1 jour    |
| **Total MVP** | 8-9 semaines     | **9-10 semaines**                      | +1 semaine |

---

**Roadmap ajustée et validée** ✅
