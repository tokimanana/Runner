// Core interfaces
export interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  ageCategories?: AgeCategory[];
  rooms?: RoomType[];
  seasons?: Season[];
  contracts?: Contract[];
  amenities: { [key in AmenityCategory]?: string[] };
  checkInTime: string;
  checkOutTime: string;
  policies: HotelPolicies;
  features: HotelFeatures;
  images: string[];
  description: string;
  contactInfo: ContactInfo;
  mealPlans?: MealPlan[];
  factSheet?: string;
  specialOffers?: SpecialOffer[];
  capacity?: HotelCapacity;
  rates?: Rate[];
}

export enum PolicyType {
  CANCELLATION = 'cancellation',
  CHECK_IN = 'checkIn',
  CHECK_OUT = 'checkOut',
  CHILD = 'child',
  PET = 'pet',
  DRESS_CODE = 'dressCode',
  PAYMENT = 'payment',
  DAMAGE_DEPOSIT = 'damageDeposit'
}

export interface TimePolicy {
  standardTime: string;
  earliestTime?: string;
  latestTime?: string;
  additionalCharges?: {
    early?: {
      beforeTime: string;
      charge: number;
      description: string;
    };
    late?: {
      afterTime: string;
      charge: number;
      description: string;
    };
  };
  requirements?: string[];
}

export interface ChildPolicy {
  maxChildAge: number;
  maxInfantAge: number;
  allowChildren: boolean;
  childrenStayFree: boolean;
  maxChildrenFree: number;
  requiresAdult: boolean;
  minAdultAge: number;
  extraBedPolicy?: {
    available: boolean;
    maxExtraBeds: number;
    charge: number;
    chargeType: string;
  };
  restrictions?: string[];
}

export interface PetPolicy {
  allowPets: boolean;
  maxPets: number;
  petTypes: string[];
  maxWeight?: number;
  weightUnit?: string;
  charge?: number;
  chargeType?: string;
  restrictions?: string[];
  requirements?: string[];
}

export interface DressCodeVenue {
  name: string;
  code: string;
  description: string;
  restrictions: string[];
}

export interface DressCodeArea {
  area: string;
  code: string;
  description: string;
  restrictions: string[];
}

export interface DressCodePolicy {
  general: string;
  restaurants: DressCodeVenue[];
  publicAreas: DressCodeArea[];
}

export interface CancellationRule {
  daysBeforeArrival: number;
  charge: number;
  chargeType: CancellationChargeType;
}

export interface CancellationPolicy {
  id?: number;
  name?: string;
  description: string;
  rules: CancellationRule[];
  noShowCharge: number;
  noShowChargeType: CancellationChargeType;
}

export interface HotelPolicies {
  cancellation: CancellationPolicy;
  checkIn: TimePolicy;
  checkOut: TimePolicy;
  child: ChildPolicy;
  pet: PetPolicy;
  dressCode: DressCodePolicy;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

export interface HotelFeatures {
  restaurants: Restaurant[];
  spa: Spa;
}

export enum RestaurantType {
  FINE_DINING = 'Fine Dining',
  CASUAL = 'Casual Dining',
  BUFFET = 'Buffet',
  SPECIALTY = 'Specialty',
  BAR = 'Bar & Lounge',
  POOL = 'Pool & Beach'
}

export enum CuisineType {
  MEDITERRANEAN = 'Mediterranean',
  ITALIAN = 'Italian',
  INTERNATIONAL = 'International',
  ASIAN = 'Asian',
  JAPANESE = 'Japanese',
  SEAFOOD = 'Seafood',
  FUSION = 'Fusion',
  GRILL = 'Grill'
}

export interface Restaurant {
  name: string;
  cuisine: CuisineType;
  type: RestaurantType;
  dressCode: string;
  openingHours: string;
  description: string;
}

export interface Spa {
  name: string;
  treatments: string[];
  openingHours: string;
  description: string;
}

// Amenity management
export enum AmenityCategory {
  POOL = 'pool',
  SPA = 'spa',
  DINING = 'dining',
  BEACH = 'beach',
  FITNESS = 'fitness',
  SERVICES = 'services',
  ACTIVITIES = 'activities'
}

// Room management
export enum RoomCategory {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  VILLA = 'villa'
}

export interface RoomType {
  id: number;
  name: string;
  category: RoomCategory;
  description?: string;
  maxOccupancy: {
    adults: number;
    children: number;
    infants: number;
  };
  baseOccupancy: number;
  amenities: string[];
  size?: number;
  images?: string[];
}

// Rate management
export interface Rate {
  id: number;
  periodId: number;
  roomTypeId: number;
  name: string;
  currency: string;
  rateType: 'per_pax' | 'per_villa';
  maxOccupancy: {
    adults: number;
    children: number;
    infants: number;
  };
  rateDetails: PerPersonRateDetails | PerVillaRateDetails;
  supplements: RateSupplements;
}

export interface PerPersonRateDetails {
  adult: {
    single?: number;    // Rate for single occupancy
    double?: number;    // Rate for 2 persons in double occupancy
    triple?: number;    // Rate for 3 persons in triple occupancy
    quad?: number;      // Rate for 4 persons in quad occupancy
    quint?: number;     // Rate for 5 persons in quint occupancy
  };
  child: {
    firstChild?: number;
    secondChild?: number;
    thirdChild?: number;
    fourthChild?: number;
  };
  infant: {
    firstInfant?: number;
    secondInfant?: number;
    thirdInfant?: number;
  };
}

export interface PerVillaRateDetails {
  baseRate: number;     // Base rate for villa
}

export interface RateSupplements {
  mealPlanRates?: {
    [mealPlanId: string]: {
      adult: number;
      child: number;
      infant: number;
    };
  };
  extraPerson?: number;
  singleOccupancy?: number;
  child?: number;
  infant?: number;
  mealPlan?: {
    BB?: number;
    HB?: number;
    FB?: number;
    [key: string]: number | undefined;
  };
}

export interface ExtraCharges {
  extraAdult?: number;
  extraChild?: number;
  extraInfant?: number;
  extraBed?: number;
}

// Period management
export interface Period {
  id: number;
  seasonId: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  mlos: number;
  isBlackout?: boolean;
}

export interface Season {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  periods?: Period[];
  startDate?: string;  // Add optional startDate
  endDate?: string;    // Add optional endDate
}

// Contract management
export interface Contract {
  id: number;
  hotelId: number;
  marketId: number;
  seasonId: number;
  name: string;
  description?: string;
  status: 'active' | 'draft' | 'expired';
  selectedRooms: number[];
  selectedMealPlans: string[];
  periodRates: ContractPeriodRate[];
  terms?: string;
  validFrom: Date;
  validTo: Date;
}

export interface ContractPeriodRate {
  periodId: number;
  roomRates: RoomTypeRate[];
}

export interface RoomTypeRate {
  roomTypeId: number;
  rateType: 'per_pax' | 'per_villa';
  personTypeRates: {
    [personType: string]: {  // 'adult', 'child', 'teen', 'infant', etc.
      rates: {
        [count: number]: number;  // 1: rate for first person, 2: rate for second person, etc.
      };
    };
  };
  mealPlanRates: {
    [mealPlanId: string]: {
      [personType: string]: number;  // Rate per person type for this meal plan
    }
  };
}

// Special offers
export interface DiscountValue {
  nights: number;      // Number of nights
  value: number;       // Discount value for these nights
  startDate?: string;  // Optional start date for this specific discount
  endDate?: string;    // Optional end date for this specific discount
}

export interface SpecialOffer {
  id: number;
  code: string;
  name: string;
  type: 'combinable' | 'cumulative';
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValues: DiscountValue[];
  startDate: string;
  endDate: string;
  conditions?: string[];
  minimumNights?: number;
  maximumNights?: number;
  blackoutDates?: string[];
  bookingWindow?: {
    start: string;   // When booking can start
    end: string;     // When booking must be made by
  };
}

// Market management
export interface Market {
  id: number;
  name: string;
  code: string;
  currency: string;
  region: string;
  description?: string;
  isActive: boolean;
  groupId?: number; // Reference to the parent MarketGroup
  hasRates?: boolean; // Flag to indicate if market has rates configured
}

export interface MarketGroup {
  id: number;
  name: string;
  region: string;
  markets: number[];
  defaultCurrency: string;
  description?: string;
  isActive: boolean;
}

// Age category management
export interface AgeCategory {
  id: number;
  name: string;
  type: 'adult' | 'child' | 'infant' | 'teen';
  label: string;
  minAge: number;
  maxAge: number;
  defaultRate: number;
  description?: string;
  isActive: boolean;
}

// Currency management
export interface CurrencySetting {
  id: number;
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  isActive: boolean;
}

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  rate?: number;
  isBase?: boolean;
};

// Meal Plan Types
export enum MealPlanType {
  RO = 'RO',
  BB = 'BB',
  BB_PLUS = 'BB+',
  HB = 'HB',
  HB_PLUS = 'HB+',
  FB = 'FB',
  FB_PLUS = 'FB+',
  AI = 'AI',
  AI_PLUS = 'AI+',
  UAI = 'UAI'
}

export const MEAL_PLAN_NAMES: Record<MealPlanType, string> = {
  [MealPlanType.RO]: 'Room Only',
  [MealPlanType.BB]: 'Bed & Breakfast',
  [MealPlanType.BB_PLUS]: 'Bed & Breakfast Plus',
  [MealPlanType.HB]: 'Half Board',
  [MealPlanType.HB_PLUS]: 'Half Board Plus',
  [MealPlanType.FB]: 'Full Board',
  [MealPlanType.FB_PLUS]: 'Full Board Plus',
  [MealPlanType.AI]: 'All Inclusive',
  [MealPlanType.AI_PLUS]: 'All Inclusive Plus',
  [MealPlanType.UAI]: 'Ultra All Inclusive'
};

export interface MealTime {
  name: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface MealPlanInclusion {
  name: string;
  description: string;
  isIncluded: boolean;
}

export interface MealPlan {
  id: string;
  type: MealPlanType;
  name: string;
  description: string;
  mealTimes: MealTime[];
  inclusions: MealPlanInclusion[];
  restrictions: string[];
  isActive: boolean;
}

// Hotel data management
export type HotelDataKey = 
  | 'hotel'
  | 'markets'
  | 'seasons'
  | 'contracts'
  | 'rateConfigurations'
  | 'marketTemplates'
  | 'menuItems'
  | 'mealPlans'
  | 'marketMealPlanRates'
  | 'ageCategories'
  | 'currencySettings'
  | 'marketGroups'
  | 'roomTypes'
  | 'periods'
  | 'specialOffers'
  | 'description'
  | 'policies'
  | 'capacity'
  | 'roomInventory'
  | 'cancellation'
  | 'checkIn'
  | 'checkOut'
  | 'childPolicy'
  | 'petPolicy'
  | 'dressCode' 
  | 'factSheet';

// Menu item types
export type MenuItemId = 
  | 'description'
  | 'age-categories'
  | 'policies'
  | 'capacity'
  | 'mealPlan'
  | 'markets'
  | 'currency'
  | 'periodAndMlos'
  | 'ratesConfig'
  | 'rateSeasons'
  | 'roomInventory'
  | 'specialOffers'
  | 'contract';

export interface MenuItem {
  id: MenuItemId;
  icon: string;
  label: string;
}

// Policy management
export interface Policy {
  id: number;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
}

// Market template
export interface MarketTemplate {
  id: number;
  name: string;
  marketId: number;
  configuration: {
    mealPlans: MealPlan[];
  };
}

// Hotel capacity management
export interface HotelCapacity {
  id: number;
  hotelId: number;
  totalRooms: number;
  roomTypes: {
    roomTypeId: number;
    category: RoomCategory;
    count: number;
  }[];
}

// Room inventory management
export enum RoomStatus {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  FULL = 'full'
}

export interface RoomInventory {
  id: number;
  hotelId: number;
  roomTypeId: number;
  date: string;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  blockedRooms: number;
  status: RoomStatus;
}

// Spa related types
export enum SpaServiceType {
  MASSAGE = 'Massage',
  FACIAL = 'Facial',
  BODY_TREATMENT = 'Body Treatment',
  YOGA = 'Yoga',
  MEDITATION = 'Meditation',
  BEAUTY = 'Beauty Services',
  WELLNESS = 'Wellness Consultation',
  HYDROTHERAPY = 'Hydrotherapy'
}

export interface SpaService {
  type: SpaServiceType;
  name: string;
  description: string;
  duration: number; // in minutes
  price?: number;
}

// Rate calculation types
export interface AgeCategoryRate {
  categoryId: number;
  rate: number;
  discounts?: {
    lengthOfStay?: {
      nights: number;
      discount: number;
    }[];
    earlyBooking?: {
      daysInAdvance: number;
      discount: number;
    }[];
  };
}

export interface RateConfiguration {
  baseRate: number;
  ageCategoryRates: AgeCategoryRate[];
  supplements?: {
    extraPerson?: number;
    singleOccupancy?: number;
    mealPlan?: {
      [key: string]: number;
    };
  };
}

// Cancellation policy types
export enum CancellationChargeType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  NIGHTS = 'nights'
}

export interface RoomOccupancy {
  adults: number;
  children: number;
  infants: number;
}

export interface RateCalculationResult {
  baseRate: number;
  supplements: {
    mealPlan?: number;
    extraBed?: number;
  };
  breakdown: {
    baseRate: number;
    mealPlanTotal: number;
    extraPersonTotal?: number;
    extraBedTotal?: number;
  };
  total: number;
  currency: string;
}
