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
  amenities: string[];
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
}

export interface HotelPolicies {
  cancellation: string;
  checkIn: string;
  checkOut: string;
  childPolicy: string;
  petPolicy: string;
  dressCode: string;
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

export interface Restaurant {
  name: string;
  cuisine: string;
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

// Room management
export interface RoomType {
  id: number;
  type: string;
  name: string;
  description: string;
  location: string;
  maxOccupancy: {
    adults: number;
    children: number;
    infants: number;
  };
  amenities: string[];
  size: number;
  images: string[];
  bedConfiguration: BedConfig[];
  rates?: Rate[];
}

export interface BedConfig {
  type: string;
  count: number;
}

// Rate management
export interface Rate {
  id: number;
  name: string;
  marketId: number;
  seasonId: number;
  roomTypeId: number;
  contractId: number;
  hotelId?: number;  // Optional since it can be derived from contract
  currency: string;
  amount: number;
  baseRate: number;
  extraAdult: number;
  extraChild: number;
  singleOccupancy: number | null;
  supplements: {
    extraAdult: number;
    extraChild: number;
    singleOccupancy: number | null;
    mealPlan?: {
      [key in MealPlanType]?: number;
    };
  };
  minimumStay?: number;
  maximumStay?: number;
  restrictions?: {
    closedToArrival: string[];
    closedToDeparture: string[];
    minimumStayThrough: string[];
  };
  ageCategoryRates: Record<string, number>;
  mealPlanId?: string;
  specialOffers: SpecialOffer[];
  startDate?: string;
  endDate?: string;
  mlos?: number;
  isBlackout?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Period {
  id: number;
  startDate: string;
  endDate: string;
  mlos: number;
  description?: string;
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
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'expired';
  rateType: 'public' | 'private';
  terms: ContractTerms;
  validFrom: Date;
  validTo: Date;
  rates: Rate[];  // Each rate can specify its own roomTypeId
}

export interface ContractTerms {
  cancellationPolicy: CancellationPolicy[];
  paymentTerms: string;
  commission: number;
  specialConditions?: string[];
}

export interface CancellationPolicy {
  daysBeforeArrival: number;
  charge: number;
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
  description?: string;  // Add optional description field
  isActive: boolean;
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
  type: 'adult' | 'child' | 'infant' | 'teen';
  label: string;
  minAge: number;
  maxAge: number;
  defaultRate: number;
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
export type MealPlanType = 'RO' | 'BB' | 'BB+' | 'HB' | 'HB+' | 'FB' | 'FB+' | 'AI' | 'AI+' | 'UAI';

export const MEAL_PLAN_TYPE_VALUES: MealPlanType[] = [
  'RO', 'BB', 'BB+', 'HB', 'HB+', 'FB', 'FB+', 'AI', 'AI+', 'UAI'
];

export const MEAL_PLAN_TYPES: Record<MealPlanType, string> = {
  RO: 'Room Only',
  BB: 'Bed & Breakfast',
  'BB+': 'Bed & Breakfast Plus',
  HB: 'Half Board',
  'HB+': 'Half Board Plus',
  FB: 'Full Board',
  'FB+': 'Full Board Plus',
  AI: 'All Inclusive',
  'AI+': 'All Inclusive Plus',
  UAI: 'Ultra All Inclusive'
};

export interface MealPlan {
  id: string;
  type: MealPlanType;
  name: string;
  description: string;
  includedMeals: string[];
  defaultInclusions: string[];
  restrictions: string[];
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
  | 'rates'
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
  | 'policies'
  | 'capacity'
  | 'mealPlan'
  | 'markets'
  | 'currency'
  | 'periodAndMlos'
  | 'ratesConfig'
  | 'rateSeasons'
  | 'roomInventory'
  | 'specialOffers';

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

// Rate configuration
export interface RateConfiguration {
  id?: string;
  seasonId: number;
  roomTypeId: number;
  region: string;
  baseRate: number;
  extraAdult: number;
  extraChild: number;
  singleOccupancy: number | null;
  currency?: string;
  periods?: Period[];
  ageCategoryRates?: { [key: number]: number };
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Market template
export interface MarketTemplate {
  id: number;
  name: string;
  marketId: number;
  configuration: {
    rates: Rate[];
    mealPlans: MealPlan[];
  };
}

// Market meal plan rate
export interface MarketMealPlanRate {
  id: number;
  marketId: number;
  mealPlanId: string;
  rate: number;
  currency: string;
}

// Hotel capacity management
export interface HotelCapacity {
  id: number;
  hotelId: number;
  totalRooms: number;
  roomTypes: {
    id: number;
    type: string;
    count: number;
    maxOccupancy: {
      adults: number;
      children: number;
      infants: number;
    };
  }[];
}

// Room inventory management
export interface RoomInventory {
  id: number;
  hotelId: number;
  roomTypeId: number;
  date: string;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  blockedRooms: number;
  status: 'available' | 'limited' | 'full';
}
