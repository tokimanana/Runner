# Règles Métier - Tour Operator System

## 🎯 1. Modes de Tarification

### PER_ROOM (Par Chambre)
**Usage** : Tarif forfaitaire quelle que soit l'occupancy.

**Exemple** :
```
Room Standard = 100€/nuit
  → 1 adulte seul = 100€
  → 2 adultes = 100€
  → 2 adultes + 1 enfant = 100€
```

**Configuration Backend** :
```typescript
RoomPrice {
  pricingMode: "PER_ROOM",
  pricePerNight: 100.00,
  occupancyRates: []
}
```

---

### PER_OCCUPANCY (Par Configuration d'Occupants)
**Usage** : Tarif selon le nombre et type d'occupants.

**Exemple Room Suite** :
```
Single (1 adulte) = 120€/nuit
Double (2 adultes) = 180€/nuit  ← PAS le double !
Triple (2 adultes + 1 enfant) = 220€/nuit
  → 1er adulte : 90€
  → 2ème adulte : 90€
  → 1er enfant : 40€
```

**Configuration Backend** :
```typescript
RoomPrice {
  pricingMode: "PER_OCCUPANCY",
  pricePerNight: null,
  occupancyRates: [
    {
      numAdults: 1,
      numChildren: 0,
      ratesPerAge: {
        "adult_cat_id": { "rate": 120, "order": 1 }
      },
      totalRate: 120
    },
    {
      numAdults: 2,
      numChildren: 0,
      ratesPerAge: {
        "adult_cat_id": { "rate": 90, "order": 1 },
        "adult_cat_id": { "rate": 90, "order": 2 }
      },
      totalRate: 180
    },
    {
      numAdults: 2,
      numChildren: 1,
      ratesPerAge: {
        "adult_cat_id": { "rate": 90, "order": 1 },
        "adult_cat_id": { "rate": 90, "order": 2 },
        "child_cat_id": { "rate": 40, "order": 1 }
      },
      totalRate: 220
    }
  ]
}
```

**Règle Importante** : Le 1er enfant peut être gratuit mais le 2ème payant.

**Exemple** :
```
Double (2 adultes + 1 enfant) = 180€  (enfant gratuit)
  → 1er adulte : 90€
  → 2ème adulte : 90€
  → 1er enfant : 0€

Triple (2 adultes + 2 enfants) = 220€  (2ème enfant payant)
  → 1er adulte : 90€
  → 2ème adulte : 90€
  → 1er enfant : 0€
  → 2ème enfant : 40€
```

---

### FLAT_RATE (Forfait Période)
**Usage** : Prix fixe pour toute la période (rare).

**Exemple** :
```
Package "Semaine de Noël" = 1200€ (7 nuits)
  → Peu importe l'occupancy ou les dates exactes
```

---

## 🎯 2. Meal Plans - Tarification

### Base Meal Plan (Inclus)
Chaque `ContractPeriod` a un `baseMealPlanId` (ex: BB).

**Règle** : Le BB est **INCLUS** dans le tarif room/occupancy.

**Exemple** :
```
Room Double (2 adultes) = 180€/nuit avec BB inclus
  → 180€ comprend chambre + petit-déjeuner pour 2
```

---

### Meal Plan Supplement (HB, FB, AI)
Si le client veut un meal plan supérieur, il paie un **supplément**.

**Exemple** :
```
Base : BB inclus (dans les 180€)
Client veut HB :
  → Supplément HB = 30€/nuit (pour 2 adultes)
  → Total = 180€ + 30€ = 210€/nuit
```

**Configuration Backend** :
```typescript
MealPlanSupplement {
  mealPlanId: "HB_id",
  contractPeriodId: "period_id",
  occupancyRates: {
    "1-0": 15,  // 1 adulte seul = +15€
    "2-0": 30,  // 2 adultes = +30€
    "2-1": 40   // 2 adultes + 1 enfant = +40€
  }
}
```

**Règle** : Le supplément HB **remplace** BB, ce n'est PAS un ajout.
- Le prix du supplément HB est le **coût total** de HB
- Ce n'est PAS la différence (HB - BB)

---

## 🎯 3. Seasons - Réutilisabilité

### Concept
**Une Season est créée une fois et réutilisée dans plusieurs ContractPeriod.**

**Exemple** :
```typescript
// 1. Admin crée UNE season
Season "Winter High" {
  id: "season-winter-high"
  name: "Winter High Season"
  startDate: 2024-12-20
  endDate: 2025-01-05
  tourOperatorId: "to-horizon"
}

// 2. Admin crée des contrats qui référencent cette season
Contract Paris {
  periods: [
    ContractPeriod {
      seasonId: "season-winter-high"
      startDate: 2024-12-20  // Copié depuis Season
      endDate: 2025-01-05
      baseMealPlanId: "meal-bb"
      roomPrices: [...]
    }
  ]
}

Contract Nice {
  periods: [
    ContractPeriod {
      seasonId: "season-winter-high"  // Même season
      startDate: 2024-12-20
      endDate: 2025-01-05
      baseMealPlanId: "meal-bb"
      roomPrices: [...]
    }
  ]
}
```

**Avantage** : Si tu veux retrouver tous les contrats utilisant "Winter High", tu fais :
```sql
SELECT * FROM contract_periods WHERE seasonId = 'season-winter-high'
```

---

## 🎯 4. Offres - Modes de Calcul

### SEQUENTIAL (Composition)
Les réductions s'appliquent **successivement** (l'une après l'autre).

**Formule** : Prix × (1 - A) × (1 - B) × (1 - C)

**Exemple** :
```
Prix base : 200€
Offre 1 : -10% (Early Booking)
Offre 2 : -5% (Long Stay)

Calcul :
  200€ × (1 - 0.10) = 180€
  180€ × (1 - 0.05) = 171€

Réduction totale : 29€ (14.5%)
```

**Propriété** : Les offres SEQUENTIAL sont **cumulables** entre elles.

---

### ADDITIVE (Addition)
Les pourcentages s'**additionnent** avant application.

**Formule** : Prix × (1 - (A + B + C))

**Exemple** :
```
Prix base : 200€
Offre 1 : -10% (Early Booking)
Offre 2 : -5% (Long Stay)

Calcul :
  Total réduction : 10% + 5% = 15%
  200€ × (1 - 0.15) = 170€

Réduction totale : 30€ (15%)
```

**Propriété** : Les offres ADDITIVE sont **cumulables** entre elles.

---

### ⚠️ RÈGLE CRITIQUE : Non-Mixabilité

**Une offre ADDITIVE bloque toutes les offres SEQUENTIAL (et vice-versa).**

**Raison** : Éviter les ambiguïtés de calcul.

**Implémentation Frontend** :
```typescript
// offers-selection.component.ts
onOfferSelected(offer: Offer): void {
  const selectedOffers = this.getSelectedOffers();
  
  if (offer.discountMode === 'ADDITIVE') {
    // Désactiver toutes les offres SEQUENTIAL
    this.disableOffersByMode('SEQUENTIAL');
  }
  
  if (offer.discountMode === 'SEQUENTIAL') {
    // Désactiver toutes les offres ADDITIVE
    this.disableOffersByMode('ADDITIVE');
  }
  
  this.store.dispatch(BookingActions.addOffer({ offer }));
}
```

**UI** : Les offres incompatibles sont grisées avec tooltip :
```
"⚠️ Cette offre n'est pas compatible avec les offres séquentielles déjà sélectionnées"
```

---

### Application Partielle (Périodes)

**Règle** : Une offre s'applique **nuit par nuit** si la période booking chevauche partiellement la période offre.

**Exemple** :
```
Offre valable : 7-15 juillet
Séjour : 14-18 juillet (5 nuits)

Application :
  → 14 juillet : ✅ Offre appliquée
  → 15 juillet : ✅ Offre appliquée
  → 16 juillet : ❌ Hors période offre
  → 17 juillet : ❌ Hors période offre
  → 18 juillet : ❌ Hors période offre

L'offre s'applique sur 2 nuits sur 5.
```

---

## 🎯 5. Suppléments - Unités de Calcul

### Nouvelle Nomenclature

| Unité | Description | Formule | Exemple |
|-------|-------------|---------|---------|
| **PER_PERSON_PER_NIGHT** | Par personne, par nuit | Prix × Pax × Nuits | Demi-pension, Taxe séjour |
| **PER_PERSON_PER_STAY** | Par personne, une fois | Prix × Pax | Excursion, Visa, Vol |
| **PER_ROOM_PER_NIGHT** | Par chambre, par nuit | Prix × Chambres × Nuits | Vue Mer, Upgrade |
| **PER_ROOM_PER_STAY** | Par chambre, une fois | Prix × Chambres | Nettoyage, Pack romantique |

---

### Exemples Concrets

**1. Demi-pension (PER_PERSON_PER_NIGHT)**
```
Supplément : 20€
Unité : PER_PERSON_PER_NIGHT
Réservation : 4 personnes × 7 nuits

Calcul :
  20€ × 4 × 7 = 560€
```

**2. Excursion (PER_PERSON_PER_STAY)**
```
Supplément : 80€
Unité : PER_PERSON_PER_STAY
Réservation : 4 personnes × 7 nuits

Calcul :
  80€ × 4 × 1 = 320€  (One shot, pas multiplié par les nuits)
```

**Flexibilité Agent** : Si seulement 2 personnes veulent l'excursion :
```
L'agent modifie manuellement la quantité de 4 → 2
Calcul : 80€ × 2 = 160€
```

**3. Vue Mer (PER_ROOM_PER_NIGHT)**
```
Supplément : 30€
Unité : PER_ROOM_PER_NIGHT
Réservation : 1 chambre × 7 nuits

Calcul :
  30€ × 1 × 7 = 210€
```

---

### Logique Backend (PricingService)

```typescript
calculateSupplementPrice(
  supplement: Supplement,
  quantity: number,      // Pax ou Chambres
  nights: number
): number {
  switch (supplement.unit) {
    case 'PER_PERSON_PER_NIGHT':
    case 'PER_ROOM_PER_NIGHT':
      return supplement.price * quantity * nights;
      
    case 'PER_PERSON_PER_STAY':
    case 'PER_ROOM_PER_STAY':
      return supplement.price * quantity; // Pas × nights
      
    default:
      throw new Error(`Unknown supplement unit: ${supplement.unit}`);
  }
}
```

---

### Auto-remplissage Frontend

**Wizard Étape 4 - Suppléments** :

```typescript
// supplements-selection.component.ts
onSupplementSelected(supplement: Supplement): void {
  const booking = this.bookingState;
  let quantity = 1;
  
  // Auto-remplissage intelligent
  if (supplement.unit.includes('PER_PERSON')) {
    quantity = booking.totalPax; // Ex: 4 personnes
  } else if (supplement.unit.includes('PER_ROOM')) {
    quantity = booking.rooms.length; // Ex: 2 chambres
  }
  
  // L'agent peut modifier ensuite
  this.supplementForm.patchValue({
    supplementId: supplement.id,
    quantity: quantity,
    unitPrice: supplement.price
  });
}
```

---

## 🎯 6. Performance - Stratégie de Chargement

### Backend : Tout Charger d'un Coup ✅

**Règle** : 1 seule requête DB avec tous les `includes` nécessaires.

```typescript
// pricing.service.ts
async calculatePrice(criteria: BookingCriteria): Promise<BookingCalculation> {
  
  // 1. Charger TOUTES les données en 1 seule requête
  const contract = await this.prisma.contract.findFirst({
    where: {
      hotelId: criteria.hotelId,
      marketId: criteria.marketId
    },
    include: {
      hotel: {
        include: { ageCategories: true }
      },
      periods: {
        where: {
          startDate: { lte: criteria.checkOut },
          endDate: { gte: criteria.checkIn }
        },
        include: {
          season: true,  // Inclure la season
          roomPrices: {
            include: {
              roomType: true,
              occupancyRates: true
            }
          },
          mealPlanSupplements: true,
          stopSalesDates: true
        }
      }
    }
  });
  
  // 2. Charger les offres applicables (1 requête)
  const offers = await this.prisma.offer.findMany({
    where: {
      id: { in: criteria.offerIds },
      tourOperatorId: contract.tourOperatorId
    },
    include: {
      offerPeriods: true,
      applicableSupplements: true
    }
  });
  
  // 3. Boucler en MÉMOIRE (0 requête DB)
  const breakdown: NightlyBreakdown[] = [];
  for (let i = 0; i < criteria.totalNights; i++) {
    const night = addDays(criteria.checkIn, i);
    
    // Trouver la période en mémoire
    const period = this.findPeriodInMemory(night, contract.periods);
    
    // Calculer le prix base pour cette nuit
    const roomPrice = this.calculateRoomPrice(period, criteria.rooms[0]);
    
    // Appliquer les offres valides cette nuit (en mémoire)
    const applicableOffers = this.getOffersValidForNight(night, offers);
    const discount = this.applyOffers(roomPrice, applicableOffers);
    
    breakdown.push({
      night,
      baseRoomPrice: roomPrice,
      appliedOffers: applicableOffers,
      discountAmount: discount,
      finalPrice: roomPrice - discount
    });
  }
  
  return {
    breakdown,
    roomsSubtotal: breakdown.reduce((sum, b) => sum + b.finalPrice, 0),
    // ... autres agrégats
  };
}
```

**Résultat** : **2 requêtes DB** pour tout le calcul, même pour 150 nuits.

---

### Frontend : Cache NgRx Store ✅

**Règle** : Charger les contrats/offres une fois, réutiliser dans le store.

```typescript
// booking.effects.ts
calculatePrice$ = createEffect(() =>
  this.actions$.pipe(
    ofType(BookingActions.calculatePrice),
    withLatestFrom(this.store.select(selectBookingState)),
    switchMap(([_, bookingState]) => {
      
      // Si les données sont déjà en cache (< 5 min)
      if (this.isCacheValid(bookingState)) {
        return of(BookingActions.useCachedData());
      }
      
      // Sinon, appel API
      return this.bookingService.calculatePrice(bookingState).pipe(
        map(result => BookingActions.calculatePriceSuccess({ result })),
        catchError(error => of(BookingActions.calculatePriceFailure({ error })))
      );
    })
  )
);
```

**Invalidation du cache** :
- Après 5 minutes
- Si l'agent change d'hôtel
- Si l'admin modifie un contrat/offre (WebSocket optionnel)

---

## 🎯 7. Age Categories - Gestion Dynamique

### Règle : Refetch Systématique ✅

**À chaque ajout de chambre**, refetch les age categories de l'hôtel.

```typescript
// room-configuration.component.ts
onAddRoom(): void {
  const hotelId = this.bookingState.hotelId;
  
  // Refetch les age categories (toujours à jour)
  this.store.dispatch(HotelsActions.loadAgeCategories({ hotelId }));
  
  // Ajouter la chambre
  this.store.dispatch(BookingActions.addRoom());
}
```

---

### Gestion d'erreur Backend : Rejet ✅

**Si l'agent soumet avec des catégories obsolètes**, le backend **rejette**.

```typescript
// booking.controller.ts
@Post('calculate')
async calculatePrice(@Body() criteria: BookingCriteria) {
  
  // Valider les age categories
  const ageCategories = await this.prisma.ageCategory.findMany({
    where: { hotelId: criteria.hotelId }
  });
  
  for (const room of criteria.rooms) {
    for (const childAge of room.childrenAges) {
      const category = this.findCategoryForAge(childAge, ageCategories);
      
      if (!category) {
        throw new BadRequestException(
          `Age ${childAge} ne correspond à aucune catégorie. ` +
          `Les catégories d'âge ont peut-être été modifiées. ` +
          `Veuillez recharger la page.`
        );
      }
    }
  }
  
  // Continuer le calcul...
}
```

**Message Frontend** :
```
❌ Erreur : Les catégories d'âge ont été modifiées.
   Veuillez recharger la page et recommencer.
   
   [Recharger] [Annuler]
```

---

## 🎯 Résumé des Décisions

| Aspect | Décision | Justification |
|--------|----------|---------------|
| **Modes tarifaires** | PER_ROOM, PER_OCCUPANCY, FLAT_RATE | PER_OCCUPANCY permet tarifs par config (Single ≠ 2×Double) |
| **Offres SEQUENTIAL** | Prix × (1-A) × (1-B) | Composition classique industrie TO |
| **Offres ADDITIVE** | Prix × (1-(A+B)) | Plus simple pour agents (15% = 15%) |
| **Mixabilité offres** | ❌ Interdit | Évite ambiguïtés calcul |
| **Offres partielles** | Nuit par nuit | Précision maximale |
| **Suppléments** | 4 unités (+ PER_NIGHT) | Clarté totale sur multiplicateurs |
| **Meal plan base** | Inclus dans tarif | Standard industrie |
| **Meal plan sup.** | Prix total (pas delta) | Simplifie config |
| **Seasons** | Réutilisables | Évite duplication dates |
| **seasonId obligatoire** | Oui | Toutes périodes référencent une season |
| **Requêtes DB** | 1-2 max, puis mémoire | Performance optimale |
| **Cache frontend** | 5 min, NgRx store | Balance fraîcheur/perfs |
| **Age categories** | Refetch + rejet backend | Cohérence garantie |

---

**Document de référence pour tout le développement** ✅