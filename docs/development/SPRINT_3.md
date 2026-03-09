# Sprint 3 - Référentiels (MealPlans, Markets, Currencies, Supplements)

## 🎯 Objectif Sprint

Créer les CRUD pour tous les référentiels utilisés dans les contrats et réservations.

**Durée estimée :** 3 jours
**Story Points :** 21 points

---

## Backend Tasks

### S3-BE-001 : Créer MealPlansModule (CRUD)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S3-BE-001-meal-plans`
- **Commit :** `feat(meal-plans): create meal plans module with CRUD`
- **Description :**
  - Générer module : `nest g module meal-plans`
  - Endpoints : GET, POST, PUT, DELETE /meal-plans
  - Filtrage par tourOperatorId
  - Validation : code unique, name required
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Codes BB, HB, FB, AI standard créés par seed
  - ✅ HTTP 401/403/404 retournés correctement
- **Files :**
  - `apps/backend/src/meal-plans/meal-plans.module.ts`
  - `apps/backend/src/meal-plans/meal-plans.controller.ts`
  - `apps/backend/src/meal-plans/meal-plans.service.ts`
  - `apps/backend/src/meal-plans/dto/create-meal-plan.dto.ts`

---

### S3-BE-002 : Créer MarketsModule (CRUD)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S3-BE-002-markets`
- **Commit :** `feat(markets): create markets module with CRUD`
- **Description :**
  - Générer module : `nest g module markets`
  - Endpoints : GET, POST, PUT, DELETE /markets
  - Filtrage par tourOperatorId
  - Validation : code unique (ex: FR, UK, US)
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ Markets FR, UK créés par seed
- **Files :**
  - `apps/backend/src/markets/markets.module.ts`
  - `apps/backend/src/markets/markets.controller.ts`
  - `apps/backend/src/markets/markets.service.ts`
  - `apps/backend/src/markets/dto/create-market.dto.ts`

---

### S3-BE-003 : Créer CurrenciesModule (CRUD global)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `feature/S3-BE-003-currencies`
- **Commit :** `feat(currencies): create currencies module (global, no tourOperator)`
- **Description :**
  - Générer module : `nest g module currencies`
  - Endpoints : GET, POST, PUT, DELETE /currencies
  - **Pas de filtrage tourOperatorId** — global à tous les tour operators
  - Validation : code ISO 4217 (EUR, USD, GBP)
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ EUR, USD, GBP créés par seed
  - ✅ Accessible par tous les TO
- **Files :**
  - `apps/backend/src/currencies/currencies.module.ts`
  - `apps/backend/src/currencies/currencies.controller.ts`
  - `apps/backend/src/currencies/currencies.service.ts`
  - `apps/backend/src/currencies/dto/create-currency.dto.ts`

---

### S3-BE-004 : Créer SupplementsModule (CRUD)

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S3-BE-004-supplements`
- **Commit :** `feat(supplements): create supplements module with 4 unit types`
- **Description :**
  - Générer module : `nest g module supplements`
  - Endpoints : GET, POST, PUT, DELETE /supplements
  - Filtrage par tourOperatorId
  - Enum SupplementUnit :
    - `PER_PERSON_PER_NIGHT`
    - `PER_PERSON_PER_STAY`
    - `PER_ROOM_PER_NIGHT`
    - `PER_ROOM_PER_STAY`
  - Validation : price > 0, unit valide, canReceiveDiscount boolean
- **Acceptance Criteria :**
  - ✅ CRUD complet fonctionnel
  - ✅ 4 types de suppléments supportés
  - ✅ Flag canReceiveDiscount géré
- **Files :**
  - `apps/backend/src/supplements/supplements.module.ts`
  - `apps/backend/src/supplements/supplements.controller.ts`
  - `apps/backend/src/supplements/supplements.service.ts`
  - `apps/backend/src/supplements/dto/create-supplement.dto.ts`

---

### S3-BE-005 : DTOs avec validation pour tous les référentiels

- **Type :** Task
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `chore/S3-BE-005-dtos-validation`
- **Commit :** `chore(referentials): add DTOs with validation for all modules`
- **Description :**
  - Créer CreateDto et UpdateDto pour chaque module
  - Validation class-validator
  - Documentation avec @ApiProperty (Swagger)
- **Acceptance Criteria :**
  - ✅ Tous les DTOs créés
  - ✅ Validation fonctionne
  - ✅ Swagger doc complète
- **Files :**
  - `apps/backend/src/meal-plans/dto/`
  - `apps/backend/src/markets/dto/`
  - `apps/backend/src/currencies/dto/`
  - `apps/backend/src/supplements/dto/`

---

## Frontend Tasks

### S3-FE-001 : Créer les 4 services référentiels

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S3-FE-001-referentials-services`
- **Commit :** `feat(referentials): create services for meal-plans, markets, currencies, supplements`
- **Description :**
  - Créer 4 services avec **BehaviorSubject** (pas NgRx)
  - Pattern identique au `SeasonsService` (Sprint 2)
  - `take(1)` obligatoire sur tous les subscribe()
  - Cache simple avec flag `loaded`

```typescript
// Pattern à suivre pour tous les 4 services
@Injectable({ providedIn: 'root' })
export class MealPlansService {
  private mealPlans$ = new BehaviorSubject<MealPlan[]>([]);
  private loaded = false;
  private readonly apiUrl = `${environment.apiUrl}/meal-plans`;
  private readonly http = inject(HttpClient);

  getMealPlans(): Observable<MealPlan[]> {
    if (!this.loaded) this.load();
    return this.mealPlans$.asObservable();
  }

  private load(): void {
    this.http
      .get<MealPlan[]>(this.apiUrl)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.mealPlans$.next(data);
          this.loaded = true;
        },
        error: (err) => console.error(err),
      });
  }

  create(item: Partial<MealPlan>): Observable<MealPlan> {
    return this.http
      .post<MealPlan>(this.apiUrl, item)
      .pipe(tap(() => this.refresh()));
  }

  update(id: string, item: Partial<MealPlan>): Observable<MealPlan> {
    return this.http
      .put<MealPlan>(`${this.apiUrl}/${id}`, item)
      .pipe(tap(() => this.refresh()));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.refresh()));
  }

  private refresh(): void {
    this.loaded = false;
    this.load();
  }
}
```

- **Acceptance Criteria :**
  - ✅ 4 services fonctionnels avec BehaviorSubject
  - ✅ Cache évite appels multiples
  - ✅ take(1) sur tous les subscribe()
- **Files :**
  - `apps/frontend/src/app/features/meal-plans/services/meal-plans.service.ts`
  - `apps/frontend/src/app/features/markets/services/markets.service.ts`
  - `apps/frontend/src/app/features/currencies/services/currencies.service.ts`
  - `apps/frontend/src/app/features/supplements/services/supplements.service.ts`

---

### S3-FE-002 : Créer MealPlansList Component

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S3-FE-002-meal-plans-list`
- **Commit :** `feat(meal-plans): create meal plans list with CRUD`
- **Description :**
  - Créer `features/meal-plans/components/meal-plans-list/`
  - Tableau **`p-table`** PrimeNG : Code, Name, Description, Actions
  - Modal **`p-dialog`** pour Create/Edit
  - **Reactive Form** dans le dialog
- **Acceptance Criteria :**
  - ✅ Liste affichée
  - ✅ CRUD fonctionnel
- **Files :**
  - `apps/frontend/src/app/features/meal-plans/components/meal-plans-list/meal-plans-list.component.ts`

---

### S3-FE-003 : Créer MarketsList Component

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `feature/S3-FE-003-markets-list`
- **Commit :** `feat(markets): create markets list with CRUD`
- **Description :**
  - Créer `features/markets/components/markets-list/`
  - Tableau **`p-table`** PrimeNG : Code, Name, Actions
  - Modal **`p-dialog`** pour Create/Edit
- **Acceptance Criteria :**
  - ✅ Liste affichée
  - ✅ CRUD fonctionnel
- **Files :**
  - `apps/frontend/src/app/features/markets/components/markets-list/markets-list.component.ts`

---

### S3-FE-004 : Créer CurrenciesList Component

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `feature/S3-FE-004-currencies-list`
- **Commit :** `feat(currencies): create currencies list with CRUD`
- **Description :**
  - Créer `features/currencies/components/currencies-list/`
  - Tableau **`p-table`** PrimeNG : Code, Name, Symbol, Actions
  - Modal **`p-dialog`** pour Create/Edit
- **Acceptance Criteria :**
  - ✅ Liste affichée
  - ✅ CRUD fonctionnel
- **Files :**
  - `apps/frontend/src/app/features/currencies/components/currencies-list/currencies-list.component.ts`

---

### S3-FE-005 : Créer SupplementsList Component

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S3-FE-005-supplements-list`
- **Commit :** `feat(supplements): create supplements list with unit types`
- **Description :**
  - Créer `features/supplements/components/supplements-list/`
  - Tableau **`p-table`** PrimeNG : Name, Price, Unit, Can Receive Discount, Actions
  - Modal **`p-dialog`** pour Create/Edit avec sélecteur Unit
- **Acceptance Criteria :**
  - ✅ Liste affichée
  - ✅ 4 types d'unités supportés
  - ✅ CRUD fonctionnel
- **Files :**
  - `apps/frontend/src/app/features/supplements/components/supplements-list/supplements-list.component.ts`

---

### S3-FE-006 : Créer SupplementForm Component

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feature/S3-FE-006-supplement-form`
- **Commit :** `feat(supplements): create supplement form with unit selector`
- **Description :**
  - Créer `features/supplements/components/supplement-form/`
  - **Reactive Form** : name, description, price, unit, canReceiveDiscount
  - Sélecteur Unit avec **`p-select`** PrimeNG :
    - PER_PERSON_PER_NIGHT
    - PER_PERSON_PER_STAY
    - PER_ROOM_PER_NIGHT
    - PER_ROOM_PER_STAY
  - **`p-checkbox`** pour canReceiveDiscount
  - Tooltip explicatif sur chaque type d'unité
- **Acceptance Criteria :**
  - ✅ Formulaire valide
  - ✅ Tooltips informatifs
  - ✅ Create/Edit fonctionnent
- **Files :**
  - `apps/frontend/src/app/features/supplements/components/supplement-form/supplement-form.component.ts`

---

### S3-FE-007 : Créer les routes pour les référentiels

- **Type :** Task
- **Priority :** P1
- **Story Points :** 1
- **Branch :** `chore/S3-FE-007-referentials-routes`
- **Commit :** `chore(routing): add routes for all referentials with guards`
- **Description :**
  - Créer routes pour meal-plans, markets, currencies, supplements
  - Protéger avec `AuthGuard` + `RoleGuard` (ADMIN, MANAGER)
  - Lazy loading via `loadComponent`
  - Ajouter items dans la Sidebar
- **Acceptance Criteria :**
  - ✅ Routes accessibles avec les bons rôles
  - ✅ Sidebar à jour
- **Files :**
  - `apps/frontend/src/app/features/meal-plans/meal-plans.routes.ts`
  - `apps/frontend/src/app/features/markets/markets.routes.ts`
  - `apps/frontend/src/app/features/currencies/currencies.routes.ts`
  - `apps/frontend/src/app/features/supplements/supplements.routes.ts`
  - `apps/frontend/src/app/app.routes.ts`
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.ts`

---

## Definition of Done - Sprint 3

### Backend

- ✅ 4 modules CRUD créés : MealPlans, Markets, Currencies, Supplements
- ✅ Validation complète avec DTOs
- ✅ Currencies global (pas de tourOperatorId)
- ✅ Supplements avec 4 types d'unités
- ✅ HTTP 401/403/404 retournés correctement

### Frontend

- ✅ 4 listes avec CRUD fonctionnels (p-table PrimeNG)
- ✅ Formulaires Reactive Forms avec validation
- ✅ Modals p-dialog PrimeNG
- ✅ Routes protégées selon rôles
- ✅ Sidebar à jour
- ✅ BehaviorSubject pour tous les services (pas NgRx)
- ✅ take(1) sur tous les subscribe()

### UX

- ✅ Tooltips explicatifs sur les types de suppléments
- ✅ Messages de succès/erreur (p-toast PrimeNG)
- ✅ Confirmations avant suppression (p-confirmdialog PrimeNG)

---

## Convention commits Sprint 3

```
feat(meal-plans): create meal plans module with CRUD
feat(markets): create markets module with CRUD
feat(currencies): create currencies module (global)
feat(supplements): create supplements module with 4 unit types
chore(referentials): add DTOs with validation
feat(referentials): create services with BehaviorSubject
feat(meal-plans): create meal plans list component
feat(markets): create markets list component
feat(currencies): create currencies list component
feat(supplements): create supplements list component
feat(supplements): create supplement form with unit selector
chore(routing): add routes for all referentials with guards
```

---

## Dépendances

- Sprint 2 doit être terminé

---

## Risques

| Risque                            | Mitigation                              |
| --------------------------------- | --------------------------------------- |
| Currencies global vs multi-tenant | Bien tester l'accès sans tourOperatorId |
| 4 types suppléments confus        | Ajouter tooltips et exemples concrets   |
