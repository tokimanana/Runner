// Core interfaces
export interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  description: string;
  factSheet?: string;
  mealPlans?: MealPlan[];
  ageCategories: AgeCategory[];
  rooms: RoomType[];
  amenities: string[];
  policies: HotelPolicies;
  images: string[];
  contactInfo: ContactInfo;
  dressCode?: string;
  features?: HotelFeatures;
}

export interface HotelPolicies {
  cancellation: string;
  checkIn: string;
  checkOut: string;
  childPolicy: string;
  petPolicy: string;
  dressCode?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface HotelFeatures {
  restaurants?: Restaurant[];
  spa?: SpaInfo;
  activities?: Activity[];
  meetings?: MeetingFacility[];
}

export interface Restaurant {
  name: string;
  cuisine: string;
  dressCode: string;
  openingHours: string;
  description: string;
}

export interface SpaInfo {
  name: string;
  treatments: string[];
  openingHours: string;
  description: string;
}

export interface Activity {
  name: string;
  description: string;
  schedule?: string;
  pricing?: string;
}

export interface MeetingFacility {
  name: string;
  capacity: number;
  size: number;
  features: string[];
}

// Room management
export interface RoomType {
  id: number;
  type: string;
  description: string;
  location: string;
  maxOccupancy: {
    adults: number;
    children: number;
    infants: number;
  };
  amenities: string[];
}

// Meal Plan Types
export type MealPlanType = 'BB' | 'BB+' | 'HB' | 'HB+' | 'FB' | 'FB+' | 'AI' | 'AI+';

export const MEAL_PLAN_TYPES: MealPlanType[] = ['BB', 'BB+', 'HB', 'HB+', 'FB', 'FB+', 'AI', 'AI+'];

export interface MealPlan {
  id: string;
  type: MealPlanType;
  name: string;
  description: string;
  includedMeals: string[];
  defaultInclusions: string[];
  restrictions: string[];
}

// Currency management
export interface Currency {
  code: string;
  symbol: string;
}

export interface CurrencySetting {
  id: number;
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
}

// Market management
export interface Market {
  id: number;
  name: string;
  code: string;
  currency: string;
  isActive: boolean;
  region: string;
  description?: string;
}

export interface MarketGroup {
  id: number;
  code: string;
  name: string;
  markets: Market[];
  defaultCurrency: string;
}

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

// Rate management
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
  periods: Period[];
  description?: string;
  isActive: boolean;
}

export interface CancellationPolicy {
  daysBeforeArrival: number;
  charge: number;
}

export interface ContractTerms {
  cancellationPolicy: CancellationPolicy[];
  paymentTerms: string;
  commission: number;
}

export interface Contract {
  id: number;
  hotelId: number;
  marketId: number;
  seasonId: number;
  roomTypeId: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'expired';
  rateType: 'public' | 'private';
  terms: ContractTerms;
  validFrom: Date;
  validTo: Date;
  rates: Rate[];
}

export type OfferType = 'cumulative' | 'exclusive';

export interface SpecialOffer {
  id: number;
  name: string;
  description: string;
  marketId: number;
  type: OfferType;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  validFrom: string;
  validTo: string;
  conditions?: string[];
  isActive: boolean;
}

export interface Rate {
  id?: number;
  marketId: number;
  seasonId: number;
  roomTypeId: number;
  contractId?: number;
  baseRate: number;
  extraAdult: number;
  extraChild: number;
  singleOccupancy: number | null;
  currency: string;
  startDate?: string;
  endDate?: string;
  mlos?: number;
  isBlackout?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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

export interface MarketMealPlanRate {
  id: number;
  marketId: number;
  mealPlanId: string;
  rate: number;
  currency: string;
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

// Age category management
export interface AgeCategory {
  id: number;
  type: string;
  label: string;
  minAge: number;
  maxAge: number;
  defaultRate: number;
}

// Hotel data management
export type HotelDataKey = 'description' | 'cancellation' | 'checkInOut' | 'factSheet' | 'dressCode';
