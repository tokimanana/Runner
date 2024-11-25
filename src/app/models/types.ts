// Core interfaces
export interface Hotel {
  id: number;
  name: string;
  factSheet?: string;
  mealPlans?: MealPlan[];
  ageCategories?: AgeCategory[];
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
export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  mlos: number;
  description: string;
  isBlackout?: boolean;
}

export interface Contract {
  id: number;
  name: string;
  marketId: number;
  seasonId: number;
  roomTypeId: number;
  startDate: string;
  endDate: string;
  status: string;
  rateType: string;
  terms: string;
  validFrom: Date;
  validTo: Date;
  rates: Rate[];
}

export interface Rate {
  id: number;
  name: string;
  marketId: number;
  amount: number;
  seasonId: number;
  roomTypeId: number;
  contractId: number;
  baseRate: number;
  currency: string;
  mealPlanId?: MealPlanType;
  supplements: {
    extraAdult: number;
    extraChild: number;
    singleOccupancy: number;
  };
  extraAdult: number;
  extraChild: number;
  singleOccupancy: number;
  ageCategoryRates: {
    [key: string]: number;
  };
  specialOffers?: any[];
}

export interface MarketMealPlanRate {
  id: number;
  marketId: number;
  mealPlanId: string;
  rate: number;
  currency: string;
}

// Rate configuration
export interface RateConfiguration {
  roomType: RoomType;
  season: Season;
  rates: Rate[];
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
