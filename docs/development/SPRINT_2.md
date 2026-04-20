# Sprint 2 - Hotels + Seasons

## 🎯 Objectif Sprint

Gestion complète des hôtels (CRUD, Age Categories, Room Types) + ajout de la gestion des Seasons réutilisables.

**Durée estimée :** 4-5 jours
**Story Points :** 34 points

---

## Backend Tasks

### S2-BE-001 : Améliorer HotelsService (CRUD complet)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S2-BE-001-hotels-crud`
- **Commit :** `feat(hotels): implement complete CRUD with validation`
- **Description :**
  - Compléter les méthodes : `findAll()`, `findOne()`, `create()`, `update()`, `remove()`
  - Filtrage par tourOperatorId (isolation multi-tenant)
  - Pagination (limit 50 par défaut)
  - Recherche par nom/destination
  - Inclure ageCategories et roomTypes dans les réponses
- **Acceptance Criteria :**
  - ✅ GET /hotels retourne liste paginée
  - ✅ GET /hotels?search=Paris filtre correctement
  - ✅ POST /hotels crée un hôtel avec validation
  - ✅ PUT /hotels/:id met à jour
  - ✅ DELETE /hotels/:id supprime (si pas de contrats liés)
  - ✅ Filtrage par tourOperatorId automatique
- **Files :**
  - `apps/backend/src/hotels/hotels.service.ts`
  - `apps/backend/src/hotels/hotels.controller.ts`

---

### S2-BE-002 : DTOs Hotels (validation complète)

- **Type :** Task
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S2-BE-002-hotels-dto`
- **Commit :** `feat(hotels): add CreateHotelDto and UpdateHotelDto with validation`
- **Description :**
  - Créer `CreateHotelDto` avec class-validator
  - Créer `UpdateHotelDto` (PartialType)
  - Validations : code (unique), name (required), city, country
- **Acceptance Criteria :**
  - ✅ Validation fonctionne sur tous les champs
  - ✅ Messages d'erreur clairs
- **Files :**
  - `apps/backend/src/hotels/dto/create-hotel.dto.ts`
  - `apps/backend/src/hotels/dto/update-hotel.dto.ts`

---

### S2-BE-003 : Endpoints Age Categories (sous-ressource)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S2-BE-003-age-categories`
- **Commit :** `feat(hotels): add age categories CRUD endpoints`
- **Description :**
  - GET /hotels/:id/age-categories
  - POST /hotels/:id/age-categories
  - PUT /hotels/:id/age-categories/:catId
  - DELETE /hotels/:id/age-categories/:catId
  - Validation : minAge < maxAge, pas de chevauchement
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Validation des âges
  - ✅ Erreur si chevauchement de catégories
- **Files :**
  - `apps/backend/src/hotels/hotels.controller.ts`
  - `apps/backend/src/hotels/hotels.service.ts`

---

### S2-BE-004 : Endpoints Room Types (sous-ressource)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S2-BE-004-room-types`
- **Commit :** `feat(hotels): add room types CRUD endpoints`
- **Description :**
  - GET /hotels/:id/room-types
  - POST /hotels/:id/room-types
  - PUT /hotels/:id/room-types/:typeId
  - DELETE /hotels/:id/room-types/:typeId
  - Validation : maxAdults > 0, maxChildren >= 0
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Validation des capacités
- **Files :**
  - `apps/backend/src/hotels/hotels.controller.ts`
  - `apps/backend/src/hotels/hotels.service.ts`

---

### S2-BE-005 : Créer SeasonsModule

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S2-BE-005-seasons-module`
- **Commit :** `feat(seasons): create seasons module with CRUD`
- **Description :**
  - Générer module : `nest g module seasons`
  - Endpoints : GET, POST, PUT, DELETE /seasons
  - Validation : startDate < endDate
  - Vérification optionnelle : pas de chevauchement de dates
  - Filtrage par tourOperatorId
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Validation des dates
  - ✅ Filtrage par tourOperatorId
- **Files :**
  - `apps/backend/src/seasons/seasons.module.ts`
  - `apps/backend/src/seasons/seasons.controller.ts`
  - `apps/backend/src/seasons/seasons.service.ts`
  - `apps/backend/src/seasons/dto/create-season.dto.ts`

---

### S2-BE-006 : Indexes Prisma pour performance

- **Type :** Enhancement
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `chore/S2-BE-006-prisma-indexes`
- **Commit :** `perf(prisma): add indexes for hotels and seasons queries`
- **Description :**
  - Ajouter indexes sur :
    - `hotels.tourOperatorId`
    - `hotels.destination`
    - `seasons.tourOperatorId`
    - `seasons.startDate` et `endDate`
  - Créer migration
- **Acceptance Criteria :**
  - ✅ Indexes créés dans la DB
  - ✅ Migration appliquée sans erreur
- **Files :**
  - `apps/backend/prisma/schema.prisma`

---

## Frontend Tasks

### S2-FE-001 : Créer HotelsService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S2-FE-001-hotels-service`
- **Commit :** `feat(hotels): create hotels service with API methods`
- **Description :**
  - Créer `features/hotels/services/hotels.service.ts`
  - Utiliser **BehaviorSubject** (pas NgRx — réservé à l'auth)
  - Méthodes : getHotels(), getHotel(id), createHotel(), updateHotel(), deleteHotel()
  - Méthodes Age Categories et Room Types
  - Cache simple avec flag `loaded`

```typescript
// ✅ Pattern BehaviorSubject correct
@Injectable({ providedIn: 'root' })
export class HotelsService {
  private hotels$ = new BehaviorSubject<Hotel[]>([]);
  private loaded = false;

  getHotels(): Observable<Hotel[]> {
    if (!this.loaded) this.loadHotels();
    return this.hotels$.asObservable();
  }

  private loadHotels(): void {
    this.http
      .get<Hotel[]>(`${this.apiUrl}/hotels`)
      .pipe(take(1)) // ✅ take(1) — évite les fuites mémoire
      .subscribe({
        next: (data) => {
          this.hotels$.next(data);
          this.loaded = true;
        },
        error: (err) => console.error('Failed to load hotels', err),
      });
  }

  createHotel(hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http
      .post<Hotel>(`${this.apiUrl}/hotels`, hotel)
      .pipe(tap(() => this.refresh()));
  }

  updateHotel(id: string, hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http
      .put<Hotel>(`${this.apiUrl}/hotels/${id}`, hotel)
      .pipe(tap(() => this.refresh()));
  }

  deleteHotel(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/hotels/${id}`)
      .pipe(tap(() => this.refresh()));
  }

  private refresh(): void {
    this.loaded = false;
    this.loadHotels();
  }
}
```

> **Pourquoi BehaviorSubject et pas NgRx ?**
> Les données Hotels sont locales à la feature. NgRx est réservé
> à l'auth (partagée partout, besoin de traçabilité globale).
> BehaviorSubject est plus simple et suffisant pour un CRUD de feature.

> **Pourquoi `take(1)` ?**
> `subscribe()` dans un service sans `take(1)` = fuite mémoire potentielle.
> `take(1)` se désabonne automatiquement après la première valeur.

- **Acceptance Criteria :**
  - ✅ Tous les appels API fonctionnels
  - ✅ Cache évite les appels multiples
  - ✅ Typage TypeScript correct
- **Files :**
  - `apps/frontend/src/app/features/hotels/services/hotels.service.ts`

---

### S2-FE-002 : Créer HotelsList Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S2-FE-002-hotels-list`
- **Commit :** `feat(hotels): create hotels list component with search and pagination`
- **Description :**
  - Créer `features/hotels/components/hotels-list/`
  - Tableau **PrimeNG `p-table`** avec colonnes : Code, Name, City, Destination, Actions
  - Barre de recherche
  - Pagination PrimeNG
  - Boutons : Create, Edit, Delete, Manage Age Categories, Manage Room Types
  - Données depuis `HotelsService` via `async pipe`
- **Acceptance Criteria :**
  - ✅ Liste affichée depuis le service
  - ✅ Recherche fonctionne
  - ✅ Pagination fonctionne
  - ✅ Actions Edit/Delete fonctionnelles
- **Files :**
  - `apps/frontend/src/app/features/hotels/components/hotels-list/hotels-list.component.ts`
  - `apps/frontend/src/app/features/hotels/components/hotels-list/hotels-list.component.html`

---

### S2-FE-003 : Créer HotelForm Component (Create/Edit)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S2-FE-003-hotel-form`
- **Commit :** `feat(hotels): create hotel form component with validation`
- **Description :**
  - Créer `features/hotels/components/hotel-form/`
  - **Reactive Form** avec validation (pas template-driven)
  - Champs : code, name, city, country, region, destination, address, email, phone
  - Mode Create / Edit
  - PrimeNG `p-inputtext`, `p-button`
  - Boutons : Cancel, Save
- **Acceptance Criteria :**
  - ✅ Formulaire valide avant submit
  - ✅ Create fonctionne
  - ✅ Edit pré-remplit les champs
  - ✅ Messages de succès/erreur
- **Files :**
  - `apps/frontend/src/app/features/hotels/components/hotel-form/hotel-form.component.ts`
  - `apps/frontend/src/app/features/hotels/components/hotel-form/hotel-form.component.html`

---

### S2-FE-004 : Créer AgeCategoriesManager Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S2-FE-004-age-categories`
- **Commit :** `feat(hotels): create age categories manager component`
- **Description :**
  - Créer `features/hotels/components/age-categories-manager/`
  - Liste des catégories avec **`p-table`** PrimeNG
  - Boutons : Add, Edit, Delete
  - Modal **`p-dialog`** PrimeNG pour ajouter/éditer
  - Réordonnancement avec **`p-orderlist`** PrimeNG
- **Acceptance Criteria :**
  - ✅ Liste affichée
  - ✅ CRUD complet fonctionnel
  - ✅ Validation : minAge < maxAge
  - ✅ Réordonnancement fonctionne
- **Files :**
  - `apps/frontend/src/app/features/hotels/components/age-categories-manager/age-categories-manager.component.ts`

---

### S2-FE-005 : Créer RoomTypesManager Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S2-FE-005-room-types`
- **Commit :** `feat(hotels): create room types manager component`
- **Description :**
  - Créer `features/hotels/components/room-types-manager/`
  - Liste des types avec **`p-table`** PrimeNG
  - Boutons : Add, Edit, Delete
  - Modal **`p-dialog`** PrimeNG pour ajouter/éditer
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Validation des capacités
- **Files :**
  - `apps/frontend/src/app/features/hotels/components/room-types-manager/room-types-manager.component.ts`

---

### S2-FE-006 : Créer SeasonsService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `feature/S2-FE-006-seasons-service`
- **Commit :** `feat(seasons): create seasons service with BehaviorSubject`
- **Description :**
  - Créer `features/seasons/services/seasons.service.ts`
  - Utiliser **BehaviorSubject** (pas NgRx)
  - Méthodes : getSeasons(), create(), update(), delete()
  - Cache simple avec flag `loaded`
  - **`take(1)`** obligatoire sur tous les subscribe()

```typescript
@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private seasons$ = new BehaviorSubject<Season[]>([]);
  private loaded = false;
  private readonly apiUrl = `${environment.apiUrl}/seasons`;
  private readonly http = inject(HttpClient);

  getSeasons(): Observable<Season[]> {
    if (!this.loaded) this.loadSeasons();
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

- **Acceptance Criteria :**
  - ✅ Service fonctionnel
  - ✅ Cache évite les appels API multiples
  - ✅ Pas de fuite mémoire (take(1) sur tous les subscribe)
- **Files :**
  - `apps/frontend/src/app/features/seasons/services/seasons.service.ts`

---

### S2-FE-007 : Créer SeasonsList Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S2-FE-007-seasons-list`
- **Commit :** `feat(seasons): create seasons list component`
- **Description :**
  - Créer `features/seasons/components/seasons-list/`
  - Tableau **`p-table`** PrimeNG : Name, Start Date, End Date, Actions
  - Boutons : Create, Edit, Delete
- **Acceptance Criteria :**
  - ✅ Liste affichée
  - ✅ CRUD fonctionnel
- **Files :**
  - `apps/frontend/src/app/features/seasons/components/seasons-list/seasons-list.component.ts`

---

### S2-FE-008 : Créer SeasonForm Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S2-FE-008-season-form`
- **Commit :** `feat(seasons): create season form component`
- **Description :**
  - Créer `features/seasons/components/season-form/`
  - **Reactive Form** : name, startDate, endDate
  - Validation : startDate < endDate
  - **`p-datepicker`** PrimeNG
- **Acceptance Criteria :**
  - ✅ Formulaire valide
  - ✅ Create/Edit fonctionnent
- **Files :**
  - `apps/frontend/src/app/features/seasons/components/season-form/season-form.component.ts`

---

### S2-FE-009 : Configurer les routes Hotels & Seasons

- **Type :** Task
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `chore/S2-FE-009-routes`
- **Commit :** `chore(routing): add hotels and seasons routes with guards`
- **Description :**
  - Créer `features/hotels/hotels.routes.ts`
  - Créer `features/seasons/seasons.routes.ts`
  - Protéger avec `AuthGuard` + `RoleGuard`
  - Hotels : ADMIN, MANAGER
  - Seasons : ADMIN, MANAGER
  - Lazy loading via `loadComponent`
  - Ajouter items dans la Sidebar

```typescript
// hotels.routes.ts
export const hotelsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/hotels-list/hotels-list.component').then(
        (m) => m.HotelsListComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/hotel-form/hotel-form.component').then(
        (m) => m.HotelFormComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/hotel-form/hotel-form.component').then(
        (m) => m.HotelFormComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
  },
];
```

- **Acceptance Criteria :**
  - ✅ Routes accessibles avec les bons rôles
  - ✅ AGENT redirigé vers /dashboard si accès non autorisé
  - ✅ Lazy loading fonctionne
  - ✅ Items ajoutés dans la Sidebar
- **Files :**
  - `apps/frontend/src/app/features/hotels/hotels.routes.ts`
  - `apps/frontend/src/app/features/seasons/seasons.routes.ts`
  - `apps/frontend/src/app/app.routes.ts`
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.ts`

---

## Definition of Done - Sprint 2

### Backend

- ✅ CRUD hôtel complet avec validation
- ✅ Age categories gérées par hôtel (CRUD)
- ✅ Room types gérés par hôtel (CRUD)
- ✅ CRUD seasons complet avec validation dates
- ✅ Indexes Prisma pour performance
- ✅ HTTP 401/403/404 retournés correctement (jamais `{ error }` avec HTTP 200)

### Frontend

- ✅ Liste des hôtels avec recherche et pagination (p-table)
- ✅ Formulaire création/édition hôtel (Reactive Forms + PrimeNG)
- ✅ Gestionnaire Age Categories (p-orderlist pour drag & drop)
- ✅ Gestionnaire Room Types
- ✅ CRUD seasons complet
- ✅ Routes protégées selon rôles
- ✅ BehaviorSubject pour Hotels et Seasons (pas NgRx)
- ✅ `take(1)` sur tous les subscribe() dans les services

### Intégration

- ✅ Toutes les actions CRUD fonctionnent end-to-end
- ✅ Validation frontend + backend
- ✅ Messages de succès/erreur

---

## Convention commits Sprint 2

```
feat(hotels): implement complete CRUD with validation
feat(hotels): add age categories CRUD endpoints
feat(hotels): add room types CRUD endpoints
feat(seasons): create seasons module with CRUD
perf(prisma): add indexes for hotels and seasons queries
feat(hotels): create hotels service with BehaviorSubject
feat(hotels): create hotels list component
feat(hotels): create hotel form component
feat(hotels): create age categories manager component
feat(hotels): create room types manager component
feat(seasons): create seasons service with BehaviorSubject
feat(seasons): create seasons list component
feat(seasons): create season form component
chore(routing): add hotels and seasons routes with guards
```

---

## Dépendances

- Sprint 0 ✅ et Sprint 1 ✅ doivent être terminés

---

## Risques

| Risque                          | Mitigation                              |
| ------------------------------- | --------------------------------------- |
| Validation âges chevauchement   | Tester avec différents cas edge         |
| Réordonnancement Age Categories | Utiliser p-orderlist PrimeNG            |
| Cache BehaviorSubject périmé    | Appeler refresh() après chaque mutation |
