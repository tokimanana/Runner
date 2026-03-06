# Sprint 6 - Booking UI (Wizard 5 Étapes)

## 🎯 Objectif Sprint

Créer l'interface de simulation de réservation avec wizard 5 étapes : Hôtel/Dates → Chambres → Offres → Suppléments → Calcul/Résultat.

**Durée estimée :** 4-5 jours
**Story Points :** 34 points

---

## Backend Tasks

### S6-BE-001 : Créer BookingModule (structure)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S6-BE-001-booking-module`
- **Commit :** `feat(booking): create booking module structure`
- **Description :**
  - Générer module : `nest g module booking`
  - Relations : Booking → Hotel, Market, Currency, User
- **Acceptance Criteria :**
  - ✅ Module créé et importé
- **Files :**
  - `apps/backend/src/booking/booking.module.ts`
  - `apps/backend/src/booking/booking.controller.ts`
  - `apps/backend/src/booking/booking.service.ts`

---

### S6-BE-002 : DTO BookingCalculateCriteria

- **Type :** Task
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `chore/S6-BE-002-booking-dto`
- **Commit :** `chore(booking): create BookingCalculateCriteria DTO`
- **Description :**
  ```typescript
  {
    hotelId: string;
    marketId: string;
    checkIn: Date;
    checkOut: Date;
    totalNights: number;
    rooms: [{
      roomTypeId: string;
      numAdults: number;
      numChildren: number;
      childrenAges: number[];
      mealPlanId: string;
    }];
    offerIds: string[];
    supplements: [{ supplementId: string; quantity: number; }];
  }
  ```
- **Acceptance Criteria :**
  - ✅ DTO créé avec validation class-validator
- **Files :**
  - `apps/backend/src/booking/dto/booking-calculate-criteria.dto.ts`

---

### S6-BE-003 : Endpoint POST /booking/calculate (stub)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S6-BE-003-booking-calculate-stub`
- **Commit :** `feat(booking): add calculate endpoint stub (Sprint 7 will implement)`
- **Description :**
  - Endpoint POST /booking/calculate
  - Retourne structure vide pour tester l'UI :
  ```typescript
  {
    roomsSubtotal: 0,
    mealSupplementsTotal: 0,
    discountAmount: 0,
    supplementsTotal: 0,
    totalAmount: 0,
    breakdown: []
  }
  ```

  - Implémentation réelle dans Sprint 7 (Pricing Engine)
- **Acceptance Criteria :**
  - ✅ Endpoint accessible
  - ✅ Validation DTO fonctionne
- **Files :**
  - `apps/backend/src/booking/booking.controller.ts`
  - `apps/backend/src/booking/booking.service.ts`

---

## Frontend Tasks

### S6-FE-001 : Créer BookingService

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `feature/S6-FE-001-booking-service`
- **Commit :** `feat(booking): create booking service`
- **Description :**
  - Créer `features/booking/services/booking.service.ts`
  - Méthode principale : `calculatePrice(criteria)`
  - Méthodes helper : `getAvailableContracts()`, `getAvailableOffers()`
- **Acceptance Criteria :**
  - ✅ Service créé
  - ✅ Appel API calculatePrice fonctionnel
- **Files :**
  - `apps/frontend/src/app/features/booking/services/booking.service.ts`

---

### S6-FE-002 : Créer Booking Store (NgRx)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S6-FE-002-booking-store`
- **Commit :** `feat(booking): implement NgRx store for booking wizard state`
- **Description :**
  - **Exception à la règle BehaviorSubject** : le Booking Wizard utilise NgRx
  - Pourquoi ? L'état du wizard est complexe, partagé entre 5 étapes, et nécessite
    des effects pour l'appel calculatePrice. C'est un cas légitime pour NgRx.
  - State :
  ```typescript
  {
    hotelId: string | null;
    marketId: string | null;
    checkIn: Date | null;
    checkOut: Date | null;
    totalNights: number;
    rooms: BookingRoom[];
    offerIds: string[];
    supplements: BookingSupplement[];
    result: BookingCalculation | null;
    loading: boolean;
    error: string | null;
  }
  ```

  - Actions : setHotel, setDates, addRoom, removeRoom, addOffer, removeOffer, calculatePrice
  - Effects : appel calculatePrice → BookingService
  - Selectors : selectBookingState, selectRooms, selectTotalPax
- **Acceptance Criteria :**
  - ✅ Store complet avec toutes les actions
  - ✅ Effects gèrent calculatePrice
  - ✅ State persiste pendant le wizard
- **Files :**
  - `apps/frontend/src/app/features/booking/store/booking.actions.ts`
  - `apps/frontend/src/app/features/booking/store/booking.reducer.ts`
  - `apps/frontend/src/app/features/booking/store/booking.effects.ts`
  - `apps/frontend/src/app/features/booking/store/booking.selectors.ts`

---

### S6-FE-003 : Créer BookingWizard Component (structure)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S6-FE-003-booking-wizard`
- **Commit :** `feat(booking): create booking wizard with p-stepper`
- **Description :**
  - Créer `features/booking/components/booking-wizard/`
  - **`p-stepper`** PrimeNG horizontal avec 5 étapes :
    1. Hôtel & Dates
    2. Chambres
    3. Offres
    4. Suppléments
    5. Résultat
  - Navigation : Next/Previous
  - **`p-progressbar`** visuel
- **Acceptance Criteria :**
  - ✅ Wizard avec 5 étapes
  - ✅ Navigation fonctionne
  - ✅ State booking persisté entre étapes
- **Files :**
  - `apps/frontend/src/app/features/booking/components/booking-wizard/booking-wizard.component.ts`

---

### S6-FE-004 : Étape 1 — HotelDateSelection Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S6-FE-004-step1-hotel-dates`
- **Commit :** `feat(booking): implement step 1 - hotel and dates selection`
- **Description :**
  - **Reactive Form** :
    - Hotel : **`p-autocomplete`** PrimeNG
    - Market : **`p-select`**
    - Check-in / Check-out : **`p-datepicker`**
  - Calcul auto totalNights
  - Validation : checkOut > checkIn
  - Dispatch actions : setHotel, setMarket, setDates
- **Acceptance Criteria :**
  - ✅ Formulaire complet et validé
  - ✅ Autocomplete hôtel fonctionne
  - ✅ Calcul totalNights automatique
- **Files :**
  - `apps/frontend/src/app/features/booking/components/hotel-date-selection/hotel-date-selection.component.ts`

---

### S6-FE-005 : Étape 2 — RoomConfiguration Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S6-FE-005-step2-rooms`
- **Commit :** `feat(booking): implement step 2 - room configuration`
- **Description :**
  - Liste des chambres avec **`p-panel`** PrimeNG (expansion)
  - Bouton "Add Room"
  - Pour chaque chambre :
    - Room Type : **`p-select`**
    - Nombre adultes / enfants : **`p-select`**
    - Si enfants > 0 : inputs âge **`p-inputnumber`**
    - Meal Plan : **`p-select`**
  - Refetch age categories à chaque ajout de chambre
  - Validation capacités (maxAdults, maxChildren)
  - Dispatch : addRoom, updateRoom, removeRoom
- **Acceptance Criteria :**
  - ✅ Ajout/suppression chambres fonctionne
  - ✅ Inputs âges enfants dynamiques
  - ✅ Age categories refetch à chaque ajout
  - ✅ Validation capacités
- **Files :**
  - `apps/frontend/src/app/features/booking/components/room-configuration/room-configuration.component.ts`

---

### S6-FE-006 : Étape 3 — OffersSelection (réutiliser S5-FE-006)

- **Type :** Task
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `chore/S6-FE-006-step3-offers`
- **Commit :** `chore(booking): integrate offers selection in wizard step 3`
- **Description :**
  - Réutiliser `OffersSelectionComponent` créé en Sprint 5
  - Filtrer offres : valides pour checkIn/checkOut + minStay respecté
  - Dispatch : addOffer, removeOffer
- **Acceptance Criteria :**
  - ✅ Composant intégré dans le wizard
  - ✅ Filtres appliqués
  - ✅ Blocage SEQUENTIAL/ADDITIVE fonctionne
- **Files :**
  - `apps/frontend/src/app/features/booking/components/booking-wizard/booking-wizard.component.ts`

---

### S6-FE-007 : Étape 4 — SupplementsSelection Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S6-FE-007-step4-supplements`
- **Commit :** `feat(booking): implement step 4 - supplements selection`
- **Description :**
  - Liste supplements avec **`p-checkbox`**
  - Pour chaque sélectionné : input quantité **`p-inputnumber`**
  - **Auto-remplissage intelligent** :
    - `PER_PERSON_*` → quantity = totalPax
    - `PER_ROOM_*` → quantity = nombre de chambres
  - Calcul sous-total en temps réel
  - Dispatch : addSupplement, updateSupplement, removeSupplement
- **Acceptance Criteria :**
  - ✅ Auto-remplissage quantité intelligent
  - ✅ Calcul sous-total en temps réel
  - ✅ Agent peut modifier quantités
- **Files :**
  - `apps/frontend/src/app/features/booking/components/supplements-selection/supplements-selection.component.ts`

---

### S6-FE-008 : Étape 5 — BookingSummary Component

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S6-FE-008-step5-summary`
- **Commit :** `feat(booking): implement step 5 - booking summary`
- **Description :**
  - Bouton "Calculer" → dispatch calculatePrice
  - Affichage résultat :
    - Sous-total chambres
    - Réductions appliquées (liste offres)
    - Total chambres
    - Suppléments
    - **TOTAL FINAL**
  - Bouton "Voir breakdown détaillé" → **`p-dialog`**
  - Boutons : Modifier, Exporter PDF, Sauvegarder
  - **`p-progressbar`** pendant calcul
- **Acceptance Criteria :**
  - ✅ Bouton Calculer fonctionne
  - ✅ Résultat affiché clairement
  - ✅ Breakdown modal disponible
- **Files :**
  - `apps/frontend/src/app/features/booking/components/booking-summary/booking-summary.component.ts`

---

### S6-FE-009 : Modal BreakdownDetail Component

- **Type :** Feature
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `feature/S6-FE-009-breakdown-modal`
- **Commit :** `feat(booking): create breakdown detail modal`
- **Description :**
  - **`p-dialog`** PrimeNG
  - Tableau **`p-table`** nuit par nuit :
    - Colonnes : Nuit, Prix base, Offres appliquées, Réduction, Prix final
    - Groupé par chambre
    - Total par chambre + TOTAL GÉNÉRAL
  - Bouton Export CSV
- **Acceptance Criteria :**
  - ✅ Modal s'ouvre depuis BookingSummary
  - ✅ Tableau nuit par nuit affiché
  - ✅ Export CSV fonctionne
- **Files :**
  - `apps/frontend/src/app/features/booking/components/breakdown-detail-modal/breakdown-detail-modal.component.ts`

---

### S6-FE-010 : Loading & Error States

- **Type :** Enhancement
- **Priority :** P1
- **Story Points :** 2
- **Branch :** `feat/S6-FE-010-loading-error`
- **Commit :** `feat(booking): add loading indicators and error handling`
- **Description :**
  - **`p-progressbar`** pendant chargements et calcul
  - **`p-toast`** pour notifications
  - **`p-message`** pour erreurs inline :
    - Si aucun contrat disponible pour les dates
    - Si calcul échoue
- **Acceptance Criteria :**
  - ✅ Spinners visibles
  - ✅ Messages erreur clairs
- **Files :**
  - Tous les composants du wizard

---

### S6-FE-011 : Configurer les routes Booking

- **Type :** Task
- **Priority :** P0
- **Story Points :** 1
- **Branch :** `chore/S6-FE-011-booking-routes`
- **Commit :** `chore(routing): add booking routes accessible by all roles`
- **Description :**
  - Créer `features/booking/booking.routes.ts`
  - Routes : /booking/new, /booking/:id
  - `AuthGuard` uniquement (tous les rôles)
  - Lazy loading via `loadComponent`
  - Ajouter dans la Sidebar (icône prominente)
- **Acceptance Criteria :**
  - ✅ Routes accessibles par ADMIN, MANAGER, AGENT
  - ✅ Sidebar à jour
- **Files :**
  - `apps/frontend/src/app/features/booking/booking.routes.ts`
  - `apps/frontend/src/app/app.routes.ts`
  - `apps/frontend/src/app/core/shell/sidebar/sidebar.component.ts`

---

## Definition of Done - Sprint 6

### Backend

- ✅ BookingModule créé
- ✅ DTO avec validation
- ✅ Endpoint /booking/calculate (stub) accessible

### Frontend

- ✅ Wizard 5 étapes avec p-stepper PrimeNG
- ✅ Étape 1 : Hôtel & Dates
- ✅ Étape 2 : Chambres avec âges enfants dynamiques
- ✅ Étape 3 : Offres avec blocage SEQUENTIAL/ADDITIVE
- ✅ Étape 4 : Suppléments avec auto-quantité
- ✅ Étape 5 : Résumé avec bouton Calculer
- ✅ Modal breakdown détaillé (p-dialog)
- ✅ Loading/error states (p-progressbar, p-toast, p-message)
- ✅ NgRx pour Booking Store (exception justifiée — état wizard complexe)

---

## Notes importantes

### Refetch Age Categories

```typescript
onAddRoom(): void {
  const hotelId = this.bookingState.hotelId;
  // Refetch age categories (toujours à jour)
  this.hotelsService.getAgeCategories(hotelId).pipe(take(1)).subscribe(...);
  this.store.dispatch(BookingActions.addRoom());
}
```

### Auto-remplissage Quantité

```typescript
onSupplementSelected(supplement: Supplement): void {
  let quantity = 1;
  if (supplement.unit.includes('PER_PERSON')) {
    quantity = this.totalPax;
  } else if (supplement.unit.includes('PER_ROOM')) {
    quantity = this.rooms.length;
  }
  this.store.dispatch(BookingActions.addSupplement({ supplement, quantity }));
}
```

---

## Dépendances

- Sprint 2, 3, 4, 5 doivent être terminés

---

## Risques

| Risque                   | Mitigation                                 |
| ------------------------ | ------------------------------------------ |
| Wizard trop long         | p-stepper PrimeNG + sauvegarde brouillon   |
| Age categories obsolètes | Refetch à chaque ajout de chambre          |
| Calcul lent              | Loading indicators + optimisation Sprint 7 |
