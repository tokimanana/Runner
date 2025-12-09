# Diagramme de Classe

```mermaid
classDiagram
    %% ===== CORE =====
    class TourOperator {
        +String id
        +String name
        +String email
        +String phone
    }

    class User {
        +String id
        +String email
        +UserRole role
        +String tourOperatorId
    }

    %% ===== HOTEL =====
    class Hotel {
        +String id
        +String code
        +String name
        +String city
        +String country
        +String tourOperatorId
    }

    class AgeCategory {
        +String id
        +String name
        +int minAge
        +int maxAge
        +String hotelId
    }

    class RoomType {
        +String id
        +String code
        +String name
        +int maxAdults
        +int maxChildren
        +String hotelId
    }

    %% ===== RÉFÉRENTIELS =====
    class Season {
        +String id
        +String name
        +Date startDate
        +Date endDate
        +String tourOperatorId
    }

    class MealPlan {
        +String id
        +String code
        +String name
        +String tourOperatorId
    }

    class Market {
        +String id
        +String code
        +String name
        +String tourOperatorId
    }

    class Currency {
        +String id
        +String code
        +String symbol
    }

    %% ===== CONTRATS =====
    class Contract {
        +String id
        +String name
        +String hotelId
        +String marketId
        +String currencyId
        +String tourOperatorId
    }

    class ContractPeriod {
        +String id
        +String name
        +Date startDate
        +Date endDate
        +String seasonId
        +String baseMealPlanId
        +int minStay
        +String contractId
    }

    class RoomPrice {
        +String id
        +PricingMode pricingMode
        +Decimal pricePerNight
        +String roomTypeId
        +String contractPeriodId
    }

    class OccupancyRate {
        +String id
        +int numAdults
        +int numChildren
        +JSON ratesPerAge
        +Decimal totalRate
        +String roomPriceId
    }

    class MealPlanSupplement {
        +String id
        +JSON occupancyRates
        +String mealPlanId
        +String contractPeriodId
    }

    %% ===== OFFRES =====
    class Offer {
        +String id
        +String name
        +OfferType type
        +Decimal value
        +DiscountMode discountMode
        +boolean applyToRoomOnly
        +String tourOperatorId
    }

    class OfferPeriod {
        +String id
        +Date startDate
        +Date endDate
        +String offerId
    }

    %% ===== SUPPLÉMENTS =====
    class Supplement {
        +String id
        +String name
        +Decimal price
        +SupplementUnit unit
        +boolean canReceiveDiscount
        +String tourOperatorId
    }

    %% ===== BOOKING =====
    class Booking {
        +String id
        +Date checkIn
        +Date checkOut
        +int totalNights
        +Decimal totalAmount
        +String tourOperatorId
        +String userId
        +String hotelId
    }

    class BookingRoom {
        +String id
        +int numAdults
        +int numChildren
        +JSON childrenAges
        +Decimal roomTotal
        +String bookingId
        +String roomTypeId
        +String mealPlanId
    }

    class NightlyBreakdown {
        +String id
        +Date night
        +Decimal baseRoomPrice
        +Decimal finalPriceThisNight
        +String bookingRoomId
    }

    %% ===== RELATIONS PRINCIPALES =====
    TourOperator "1" --> "*" User
    TourOperator "1" --> "*" Hotel
    TourOperator "1" --> "*" Season
    TourOperator "1" --> "*" MealPlan
    TourOperator "1" --> "*" Market
    TourOperator "1" --> "*" Contract
    TourOperator "1" --> "*" Offer
    TourOperator "1" --> "*" Supplement
    TourOperator "1" --> "*" Booking

    Hotel "1" --> "*" AgeCategory
    Hotel "1" --> "*" RoomType
    Hotel "1" --> "*" Contract

    Contract "*" --> "1" Market
    Contract "*" --> "1" Currency
    Contract "1" --> "*" ContractPeriod

    ContractPeriod "*" --> "1" Season
    ContractPeriod "*" --> "1" MealPlan
    ContractPeriod "1" --> "*" RoomPrice
    ContractPeriod "1" --> "*" MealPlanSupplement

    RoomPrice "*" --> "1" RoomType
    RoomPrice "1" --> "*" OccupancyRate

    Offer "1" --> "*" OfferPeriod

    Booking "1" --> "*" BookingRoom
    BookingRoom "1" --> "*" NightlyBreakdown
    BookingRoom "*" --> "1" RoomType
    BookingRoom "*" --> "1" MealPlan
```

---

## 🔑 Points clés de la structure

### 1️⃣ Multi-tenancy
**Tous les modèles principaux ont `tourOperatorId`** pour isoler les données entre TO différents.

### 2️⃣ Hiérarchie Hotel
```
Hotel
├─ AgeCategory (Infant 0-2, Child 3-11, Adult 12+)
└─ RoomType (Standard, Suite, etc.)
```

### 3️⃣ Season → ContractPeriod
```
Season "Winter High" (20/12 → 05/01)
  ↓
ContractPeriod utilise cette season
  - startDate: 20/12 (copié depuis Season)
  - endDate: 05/01 (copié depuis Season)
  - seasonId: lien vers Season
```

**Avantage** : Si tu modifies la Season, tu peux retrouver tous les ContractPeriod liés.

### 4️⃣ Tarification flexible

**Mode PER_ROOM** :
```
RoomPrice {
  pricingMode: "PER_ROOM"
  pricePerNight: 100€
  occupancyRates: [] (vide)
}
```

**Mode PER_OCCUPANCY** :
```
RoomPrice {
  pricingMode: "PER_OCCUPANCY"
  pricePerNight: null
  occupancyRates: [
    OccupancyRate {
      numAdults: 1, numChildren: 0
      totalRate: 120€
    },
    OccupancyRate {
      numAdults: 2, numChildren: 0
      totalRate: 180€
    }
  ]
}
```

### 5️⃣ Booking → BookingRoom → NightlyBreakdown

**Structure hiérarchique claire** :
```
Booking (Facture globale)
  ├─ totalAmount: 1500€
  ├─ checkIn/checkOut
  │
  ├─ BookingRoom 1 (Chambre Standard)
  │  ├─ numAdults: 2, numChildren: 1
  │  ├─ roomTotal: 850€
  │  │
  │  └─ NightlyBreakdown (détail par nuit)
  │     ├─ Nuit 20/12: 180€
  │     ├─ Nuit 21/12: 180€
  │     └─ Nuit 22/12: 198€
  │
  └─ BookingRoom 2 (Chambre Suite)
     └─ ...
```

---

## 📋 Exemple de données réelles

### Season
```json
{
  "id": "season-winter-high",
  "name": "Winter High Season",
  "startDate": "2024-12-20",
  "endDate": "2025-01-05",
  "tourOperatorId": "to-horizon"
}
```

### Contract avec Period
```json
{
  "id": "contract-paris-winter",
  "name": "Hotel Paris - Winter 2025",
  "hotelId": "hotel-paris",
  "marketId": "market-france",
  "tourOperatorId": "to-horizon",
  
  "periods": [
    {
      "id": "period-1",
      "name": "Winter High",
      "startDate": "2024-12-20",
      "endDate": "2025-01-05",
      "seasonId": "season-winter-high",
      "baseMealPlanId": "meal-bb",
      
      "roomPrices": [
        {
          "pricingMode": "PER_ROOM",
          "pricePerNight": 200,
          "roomTypeId": "room-standard"
        }
      ]
    }
  ]
}
```

### Booking complet
```json
{
  "id": "booking-123",
  "checkIn": "2024-12-20",
  "checkOut": "2024-12-27",
  "totalNights": 7,
  "totalAmount": 1500,
  "tourOperatorId": "to-horizon",
  
  "rooms": [
    {
      "id": "br-1",
      "roomTypeId": "room-standard",
      "numAdults": 2,
      "numChildren": 1,
      "childrenAges": [5],
      "roomTotal": 850,
      
      "nightlyBreakdown": [
        {
          "night": "2024-12-20",
          "baseRoomPrice": 200,
          "finalPriceThisNight": 180
        },
        {
          "night": "2024-12-21",
          "baseRoomPrice": 200,
          "finalPriceThisNight": 180
        }
      ]
    }
  ]
}
```

---

## ✅ Modifications appliquées

| Changement | Raison |
|------------|--------|
| ✅ Retiré `isHighSeason` de Season | Cosmétique uniquement, pas de logique business |
| ✅ Retiré `validFrom`/`validTo` de Contract | On utilise Season à la place |
| ✅ Retiré `SpecialRule` | Trop complexe pour MVP, on garde pour V2 |
| ✅ `seasonId` obligatoire dans ContractPeriod | Toutes les périodes doivent référencer une season |
| ✅ Gardé `tourOperatorId` partout | Multi-tenancy essentiel |
| ✅ Gardé PER_OCCUPANCY + OccupancyRate | Tarification complexe |
| ✅ Gardé NightlyBreakdown | Transparence totale du calcul |

---