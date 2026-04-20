# Sprint 7 - Pricing Engine (Moteur de Calcul)

## 🎯 Objectif Sprint

Implémenter le moteur de calcul de prix complet : PER_OCCUPANCY, offres SEQUENTIAL/ADDITIVE, breakdown nuit par nuit.

**Durée estimée :** 5-7 jours
**Story Points :** 47 points (sprint critique !)

---

## Backend Tasks

### S7-BE-001 : Créer PricingModule (service pur)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S7-BE-001-pricing-module`
- **Commit :** `feat(pricing): create pricing module with service structure`
- **Description :**
  - `nest g module pricing`
  - PricingService uniquement (pas de controller — service pur injecté dans BookingService)
  - Méthode principale :
    ```typescript
    async calculatePrice(criteria: BookingCalculateCriteria): Promise<BookingCalculation>
    ```
- **Acceptance Criteria :**
  - ✅ Module créé
  - ✅ PricingService injectable
- **Files :**
  - `apps/backend/src/pricing/pricing.module.ts`
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-002 : Pricing — Charger contrat et offres (max 2 requêtes)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S7-BE-002-pricing-load-data`
- **Commit :** `feat(pricing): implement single-query data loading`
- **Description :**
  - **1 requête** pour le contrat avec tous les includes :
    ```typescript
    const contract = await this.prisma.contract.findFirst({
      where: { hotelId, marketId },
      include: {
        hotel: { include: { ageCategories: true } },
        periods: {
          where: {
            startDate: { lte: checkOut },
            endDate: { gte: checkIn },
          },
          include: {
            season: true,
            roomPrices: { include: { roomType: true, occupancyRates: true } },
            mealPlanSupplements: true,
            stopSalesDates: true,
          },
        },
      },
    });
    ```
  - **1 requête** pour les offres avec periods
  - **Total : 2 requêtes DB maximum**

> **Pourquoi max 2 requêtes ?**
> Toutes les opérations de calcul se font EN MÉMOIRE dans la boucle nuit par nuit.
> N requêtes dans une boucle = N+1 problem = performances catastrophiques.

- **Acceptance Criteria :**
  - ✅ Contract chargé avec toutes les relations
  - ✅ Maximum 2 requêtes DB
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-003 : Pricing — Calcul prix base PER_ROOM

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S7-BE-003-pricing-per-room`
- **Commit :** `feat(pricing): implement PER_ROOM pricing mode`
- **Description :**
  - Si `pricingMode === 'PER_ROOM'` → retourner `roomPrice.pricePerNight`
  - Gérer cas où pas de RoomPrice trouvé
- **Acceptance Criteria :**
  - ✅ Mode PER_ROOM calcule correctement
  - ✅ Erreur si RoomPrice non trouvé
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-004 : Pricing — Calcul prix base PER_OCCUPANCY

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `feature/S7-BE-004-pricing-per-occupancy`
- **Commit :** `feat(pricing): implement PER_OCCUPANCY pricing mode`
- **Description :**
  - Chercher OccupancyRate : `numAdults === room.numAdults` ET `numChildren === room.numChildren`
  - Retourner `occupancyRate.totalRate`
  - Valider âges enfants contre age categories
- **Tests à couvrir :**
  - Single (1 adulte) = 120€
  - Double (2 adultes) = 180€
  - Double + 1 enfant = 180€ (enfant gratuit)
  - Double + 2 enfants = 220€ (2ème enfant payant)
- **Acceptance Criteria :**
  - ✅ Mode PER_OCCUPANCY calcule correctement
  - ✅ Validation âges enfants
  - ✅ Erreur si OccupancyRate non trouvé
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-005 : Pricing — Calcul meal plan supplements

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S7-BE-005-pricing-meal-supplements`
- **Commit :** `feat(pricing): implement meal plan supplements calculation`
- **Description :**
  - Si `room.mealPlanId !== period.baseMealPlanId` :
    - Chercher MealPlanSupplement pour ce meal plan
    - Lookup JSON occupancyRates avec key `${numAdults}-${numChildren}`
  - Si meal plan = base → retourner 0
- **Exemple :**
  ```typescript
  // Base = BB, Room = HB, 2 adultes + 1 enfant
  const occupancyRates = { '1-0': 20, '2-0': 40, '2-1': 50 };
  // Retour : 50€/nuit
  ```
- **Acceptance Criteria :**
  - ✅ Supplement calculé selon occupancy
  - ✅ Base meal plan = 0€
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-006 : Pricing — Application offres SEQUENTIAL

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S7-BE-006-pricing-sequential`
- **Commit :** `feat(pricing): implement SEQUENTIAL discount mode`
- **Description :**
  - Formule : `Prix × (1-A) × (1-B) × (1-C)`
  - Application nuit par nuit (vérifier validité via offerPeriods)
  - Gérer PERCENTAGE et FLAT_AMOUNT
- **Test exemple :**
  ```
  Prix : 200€ / Offre A : -10% / Offre B : -5%
  200€ × (1 - 0.10) = 180€
  180€ × (1 - 0.05) = 171€
  Réduction : 29€ (14.5%)
  ```
- **Acceptance Criteria :**
  - ✅ SEQUENTIAL applique correctement
  - ✅ Application nuit par nuit
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-007 : Pricing — Application offres ADDITIVE

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S7-BE-007-pricing-additive`
- **Commit :** `feat(pricing): implement ADDITIVE discount mode`
- **Description :**
  - Formule : `Prix × (1 - (A + B + C))`
  - Additionner tous les % avant application
- **Test exemple :**
  ```
  Prix : 200€ / Offre A : -10% / Offre B : -5%
  Total : 10% + 5% = 15%
  200€ × (1 - 0.15) = 170€
  Réduction : 30€ (15%)
  ```
- **Acceptance Criteria :**
  - ✅ ADDITIVE applique correctement
  - ✅ % additionnés avant application
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-008 : Pricing — Application offres partielles (nuit par nuit)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 3
- **Branch :** `feature/S7-BE-008-pricing-partial-offers`
- **Commit :** `feat(pricing): implement partial offer application night-by-night`
- **Description :**
  - Méthode : `isOfferValidForNight(offer, night)`
  - Vérifier si night est dans au moins une offerPeriod
  - Appliquer l'offre uniquement sur les nuits valides
- **Test exemple :**
  ```
  Offre valable : 07-15 juillet / Séjour : 14-18 juillet
  Nuit 14/07 : ✅ Offre appliquée
  Nuit 15/07 : ✅ Offre appliquée
  Nuit 16/07 : ❌ Plein tarif
  Nuit 17/07 : ❌ Plein tarif
  ```
- **Acceptance Criteria :**
  - ✅ Offres appliquées nuit par nuit
  - ✅ Nuits hors période = plein tarif
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-009 : Pricing — Calcul suppléments (4 unités)

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S7-BE-009-pricing-supplements`
- **Commit :** `feat(pricing): implement supplements calculation with 4 unit types`
- **Description :**

  ```typescript
  switch (supplement.unit) {
    case 'PER_PERSON_PER_NIGHT':
    case 'PER_ROOM_PER_NIGHT':
      return supplement.price * quantity * nights;

    case 'PER_PERSON_PER_STAY':
    case 'PER_ROOM_PER_STAY':
      return supplement.price * quantity; // Pas × nights
  }
  ```

  - Appliquer réductions si `supplement.canReceiveDiscount === true`

- **Tests exemples :**
  ```
  Transfert (PER_PERSON_PER_STAY) : 50€ × 4 personnes = 200€ (pas × nuits)
  Vue mer (PER_ROOM_PER_NIGHT)    : 30€ × 1 chambre × 7 nuits = 210€
  ```
- **Acceptance Criteria :**
  - ✅ 4 types d'unités gérés
  - ✅ Réductions appliquées si canReceiveDiscount
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-010 : Pricing — Génération breakdown nuit par nuit

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 4
- **Branch :** `feature/S7-BE-010-pricing-breakdown`
- **Commit :** `feat(pricing): generate nightly breakdown`
- **Description :**
  - Boucle sur toutes les nuits du séjour
  - Pour chaque nuit (EN MÉMOIRE — 0 requête DB dans la boucle) :
    ```typescript
    {
      night: Date;
      baseRoomPrice: number;
      baseMealPlanIncluded: string;
      mealSupplementPrice: number;
      appliedOffers: Offer[];
      totalDiscountAmount: number;
      finalPriceThisNight: number;
    }
    ```
- **Acceptance Criteria :**
  - ✅ Breakdown généré pour toutes les nuits
  - ✅ 0 requête DB dans la boucle
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-011 : Pricing — Agrégats finaux

- **Type :** Feature
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feature/S7-BE-011-pricing-aggregates`
- **Commit :** `feat(pricing): calculate final aggregates from breakdown`
- **Description :**
  ```typescript
  {
    roomsSubtotal: number;           // Sum finalPriceThisNight
    mealSupplementsTotal: number;    // Sum mealSupplementPrice
    discountAmount: number;          // Sum totalDiscountAmount
    supplementsTotal: number;        // Calculé séparément
    totalAmount: number;             // Somme finale
    breakdown: NightlyBreakdown[];
  }
  ```
- **Acceptance Criteria :**
  - ✅ Tous les agrégats corrects
  - ✅ totalAmount cohérent
- **Files :**
  - `apps/backend/src/pricing/pricing.service.ts`

---

### S7-BE-012 : BookingService — Intégrer PricingService

- **Type :** Task
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `chore/S7-BE-012-booking-integrate-pricing`
- **Commit :** `chore(booking): integrate pricing service in calculate endpoint`
- **Description :**
  - Injecter PricingService dans BookingService
  - Remplacer le stub du Sprint 6 par le vrai calcul
- **Acceptance Criteria :**
  - ✅ Endpoint retourne calcul réel
- **Files :**
  - `apps/backend/src/booking/booking.service.ts`

---

### S7-BE-013 : Tests unitaires PricingService (CRITIQUE)

- **Type :** Test
- **Priority :** P0
- **Story Points :** 5
- **Branch :** `test/S7-BE-013-pricing-tests`
- **Commit :** `test(pricing): add comprehensive unit tests for pricing service`
- **Description :**
  - **10 tests obligatoires** :
    1. PER_ROOM simple
    2. PER_OCCUPANCY (Single vs Double)
    3. PER_OCCUPANCY avec enfant gratuit
    4. Offres SEQUENTIAL (-10% puis -5%)
    5. Offres ADDITIVE (-10% + -5% = -15%)
    6. Offres partielles (2 nuits sur 5)
    7. Supplément PER_PERSON_PER_STAY
    8. Supplément PER_ROOM_PER_NIGHT
    9. Meal plan supplement avec occupancy
    10. Facture finale complète
  - Mock PrismaService
- **Acceptance Criteria :**
  - ✅ 10+ tests passent
  - ✅ Coverage > 90%
- **Files :**
  - `apps/backend/src/pricing/pricing.service.spec.ts`

---

## Frontend Tasks

### S7-FE-001 : Mettre à jour BookingSummary avec résultat réel

- **Type :** Enhancement
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feat/S7-FE-001-summary-real-data`
- **Commit :** `feat(booking): display real pricing calculation in summary`
- **Description :**
  - Remplacer données stub par vraies données du store NgRx
  - Afficher : roomsSubtotal, discountAmount, supplementsTotal, totalAmount
  - **`p-message`** si calcul échoue
- **Acceptance Criteria :**
  - ✅ Vraies données affichées
  - ✅ Gestion erreurs
- **Files :**
  - `apps/frontend/src/app/features/booking/components/booking-summary/booking-summary.component.ts`

---

### S7-FE-002 : Mettre à jour BreakdownModal avec données réelles

- **Type :** Enhancement
- **Priority :** P0
- **Story Points :** 2
- **Branch :** `feat/S7-FE-002-breakdown-real-data`
- **Commit :** `feat(booking): display real nightly breakdown in modal`
- **Description :**
  - **`p-table`** avec breakdown depuis result.breakdown
  - Colonnes : Nuit, Prix base, Offres, Réduction, Prix final
  - Groupé par chambre
- **Acceptance Criteria :**
  - ✅ Breakdown affiché correctement
  - ✅ Calculs cohérents
- **Files :**
  - `apps/frontend/src/app/features/booking/components/breakdown-detail-modal/breakdown-detail-modal.component.ts`

---

### S7-FE-003 : Tests E2E — Flow complet booking

- **Type :** Test
- **Priority :** P1
- **Story Points :** 3
- **Branch :** `test/S7-FE-003-booking-e2e`
- **Commit :** `test(booking): add E2E tests for complete booking flow`
- **Description :**
  - Playwright (déjà configuré dans le projet)
  - Scénario complet :
    1. Login avec `agent@runner.com`
    2. /booking/new
    3. Étape 1 : hôtel + dates
    4. Étape 2 : 2 chambres
    5. Étape 3 : 2 offres SEQUENTIAL
    6. Étape 4 : suppléments
    7. Étape 5 : calculer → vérifier totalAmount > 0
    8. Ouvrir breakdown modal
- **Acceptance Criteria :**
  - ✅ Test E2E passe
  - ✅ Tous les steps couverts
- **Files :**
  - `apps/frontend/e2e/booking-flow.spec.ts`

---

## Definition of Done - Sprint 7

### Backend

- ✅ PricingService complet
- ✅ PER_ROOM et PER_OCCUPANCY
- ✅ SEQUENTIAL et ADDITIVE
- ✅ Application offres nuit par nuit
- ✅ 4 types de suppléments
- ✅ Breakdown nuit par nuit
- ✅ Maximum 2 requêtes DB par calcul
- ✅ 10+ tests unitaires, coverage > 90%

### Frontend

- ✅ BookingSummary affiche vraies données
- ✅ BreakdownModal affiche breakdown réel
- ✅ Test E2E flow complet

### Performance

- ✅ Calcul < 2s pour 30 nuits
- ✅ Calcul < 5s pour 150 nuits
- ✅ Pas de N+1 queries

---

## Notes importantes

### Anti-pattern à éviter absolument

```typescript
// ❌ MAUVAIS : N requêtes dans la boucle
for (let night of nights) {
  const period = await this.prisma.contractPeriod.findFirst({ ... });
  // 1 requête × 30 nuits = 30 requêtes !
}

// ✅ BON : 1 requête, boucle en mémoire
const contract = await this.prisma.contract.findFirst({
  include: { periods: true }
});
for (let night of nights) {
  const period = this.findPeriodInMemory(night, contract.periods);
  // 0 requête DB
}
```

### Structure complète du résultat

```typescript
interface BookingCalculation {
  roomsSubtotal: number; // Ex: 1,445.85€
  mealSupplementsTotal: number; // Ex: 280.00€
  discountAmount: number; // Ex: 494.15€
  supplementsTotal: number; // Ex: 360.00€
  totalAmount: number; // Ex: 1,805.85€
  breakdown: NightlyBreakdown[];
}
```

---

## Dépendances

- Sprints 4, 5, 6 doivent être terminés

---

## Risques

| Risque                        | Mitigation                         |
| ----------------------------- | ---------------------------------- |
| Calculs incorrects            | 10+ tests unitaires obligatoires   |
| N+1 queries                   | 2 requêtes DB max — boucle mémoire |
| SEQUENTIAL/ADDITIVE confondus | Tests spécifiques pour chaque mode |
