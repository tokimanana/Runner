classDiagram
    class TourOperator {
        +String id
        +String name
        +String email
        +String phone
        +Date createdAt
    }

    class User {
        +String id
        +String tourOperatorId
        +String email
        +String firstName
        +String lastName
        +UserRole role
        +Date createdAt
    }

    class Hotel {
        +String id
        +String tourOperatorId
        +String name
        +String code
        +String destination
        +String address
        +String contact
        +Date createdAt
        +Date updatedAt
    }

    class AgeCategory {
        +String id
        +String name
        +int minAge
        +int maxAge
    }

    class RoomType {
        +String id
        +String name
        +String code
        +int maxAdults
        +int maxChildren
        +String description
    }

    class MealPlan {
        +String id
        +String tourOperatorId
        +String code
        +String name
        +String description
    }

    class Season {
        +String id
        +String tourOperatorId
        +String name
        +Date startDate
        +Date endDate
    }

    class Market {
        +String id
        +String tourOperatorId
        +String name
        +String code
    }

    class Currency {
        +String id
        +String code
        +String symbol
        +String name
    }

    class Contract {
        +String id
        +String tourOperatorId
        +String hotelId
        +String marketId
        +String currencyId
        +String name
        +Date validFrom
        +Date validTo
        +Date createdAt
        +Date updatedAt
    }

    class ContractPeriod {
        +String id
        +String name
        +Date startDate
        +Date endDate
        +String baseMealPlanId
        +int minStay
    }

    class RoomPrice {
        +String id
        +String roomTypeId
        +PricingMode pricingMode
        +Decimal pricePerNight
        +JSON pricesPerAgeCategory
    }

    class MealPlanSupplement {
        +String id
        +String mealPlanId
        +PricingMode pricingMode
        +Decimal pricePerPerson
        +Decimal pricePerRoom
    }

    class StopSalesDate {
        +String id
        +Date date
        +String reason
    }

    class SpecialRule {
        +String id
        +String name
        +String description
        +String ruleType
        +JSON conditions
    }

    class Offer {
        +String id
        +String tourOperatorId
        +String name
        +String description
        +OfferType type
        +Decimal value
        +DiscountMode discountMode
        +boolean applyToRoomOnly
        +boolean applyToMealSupplements
        +int minStay
        +Date createdAt
        +Date updatedAt
    }

    class OfferPeriod {
        +String id
        +Date startDate
        +Date endDate
    }

    class OfferSupplement {
        +String supplementId
        +boolean applyDiscount
    }

    class Supplement {
        +String id
        +String tourOperatorId
        +String name
        +String description
        +Decimal price
        +SupplementUnit unit
        +boolean canReceiveDiscount
        +Date createdAt
        +Date updatedAt
    }

    class Booking {
        +String id
        +String tourOperatorId
        +String userId
        +String hotelId
        +String marketId
        +String currencyId
        +Date checkIn
        +Date checkOut
        +int totalNights
        +Decimal roomsSubtotal
        +Decimal mealSupplementsTotal
        +Decimal discountAmount
        +Decimal supplementsTotal
        +Decimal totalAmount
        +BookingStatus status
        +Date createdAt
        +Date updatedAt
    }

    class BookingRoom {
        +String id
        +String roomTypeId
        +String mealPlanId
        +int numAdults
        +int numChildren
        +JSON childrenAges
        +Decimal roomSubtotal
        +Decimal mealSupplementsSubtotal
        +Decimal roomDiscountAmount
        +Decimal roomTotal
    }

    class NightlyBreakdown {
        +String id
        +Date night
        +Decimal baseRoomPrice
        +String baseMealPlanIncluded
        +Decimal mealSupplementPrice
        +JSON appliedOffers
        +Decimal totalDiscountAmount
        +Decimal finalPriceThisNight
    }

    class BookingAppliedOffer {
        +String offerId
        +String offerName
        +Decimal totalDiscountAmount
        +int nightsApplied
    }

    class BookingSupplement {
        +String id
        +String supplementId
        +String name
        +int quantity
        +Decimal unitPrice
        +Decimal discountAmount
        +Decimal total
    }

    %% Enums
    class UserRole {
        <<enumeration>>
        ADMIN
        MANAGER
        AGENT
    }

    class PricingMode {
        <<enumeration>>
        PER_PERSON
        PER_ROOM
    }

    class OfferType {
        <<enumeration>>
        PERCENTAGE
        FLAT_AMOUNT
    }

    class DiscountMode {
        <<enumeration>>
        CUMULATIVE
        COMBINABLE
    }

    class SupplementUnit {
        <<enumeration>>
        PER_PERSON
        PER_ROOM
        PER_STAY
    }

    class BookingStatus {
        <<enumeration>>
        SIMULATION
        CONFIRMED
        CANCELLED
    }

    %% Relations
    TourOperator "1" -- "*" User
    TourOperator "1" -- "*" Hotel
    TourOperator "1" -- "*" MealPlan
    TourOperator "1" -- "*" Season
    TourOperator "1" -- "*" Market
    TourOperator "1" -- "*" Contract
    TourOperator "1" -- "*" Offer
    TourOperator "1" -- "*" Supplement
    TourOperator "1" -- "*" Booking

    Hotel "1" -- "*" AgeCategory
    Hotel "1" -- "*" RoomType
    Hotel "1" -- "*" Contract

    Contract "1" -- "*" ContractPeriod
    Contract "1" -- "*" SpecialRule
    Contract "*" -- "1" Market
    Contract "*" -- "1" Currency

    ContractPeriod "1" -- "*" RoomPrice
    ContractPeriod "1" -- "*" MealPlanSupplement
    ContractPeriod "1" -- "*" StopSalesDate
    ContractPeriod "*" -- "1" MealPlan

    RoomPrice "*" -- "1" RoomType

    MealPlanSupplement "*" -- "1" MealPlan

    Offer "1" -- "*" OfferPeriod
    Offer "1" -- "*" OfferSupplement
    
    OfferSupplement "*" -- "1" Supplement

    Booking "1" -- "*" BookingRoom
    Booking "1" -- "*" BookingAppliedOffer
    Booking "1" -- "*" BookingSupplement
    Booking "*" -- "1" Hotel
    Booking "*" -- "1" Market
    Booking "*" -- "1" Currency
    Booking "*" -- "1" User

    BookingRoom "1" -- "*" NightlyBreakdown
    BookingRoom "*" -- "1" RoomType
    BookingRoom "*" -- "1" MealPlan

    BookingAppliedOffer "*" -- "1" Offer
    BookingSupplement "*" -- "1" Supplement