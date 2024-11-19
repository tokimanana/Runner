export interface Hotel {
  id: number;
  name: string;
  faxSheet?: string;
}

export interface Room {
  id: number;
  type: string;
  description: string;
  location: string;
  size?: string;
  maxOccupancy: {
    adults: number;
    children: number;
    infants: number;
  };
  amenities: string[];
}

export interface MealPlanRate {
  type: 'adult' | 'child' | 'infant';
  ageRange?: string;
  rate: number;
}

export interface MealPlan {
  type: string;
  name: string;
  description: string;
  rates: MealPlanRate[];
  inclusions?: string[];
}

export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  mlos: number;
  isBlackout?: boolean;
  description?: string;
}

export interface Contract {
  id: number;
  name: string;
  marketId: number;
  seasonId: number;
  roomTypeId: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'expired';
  rateType: 'public' | 'special' | 'group';
  terms: string;
  rates: RateConfiguration[];
  validFrom: Date;
  validTo: Date;
}

export interface RateConfiguration {
  marketId: number;
  amount: number;
  seasonId: number;
  roomTypeId: number;
  contractId: number;
  baseRate: number;
  supplements: {
    extraAdult: number;
    extraChild: number;
    singleOccupancy: number;
  };
  specialOffers?: SpecialOffer[];
}

export interface SpecialOffer {
  type: 'early_bird' | 'long_stay' | 'honeymoon';
  discount: number;
  conditions: string;
  validFrom?: Date;
  validTo?: Date;
  applicableMarkets?: number[];
  minimumStay?: number;
}

export interface Market {
  id: number;
  name: string;
  currency: Currency;
  seasonRates?: {
    [season: string]: {
      [roomType: string]: {
        [mealPlan: string]: number;
      };
    };
  };
}

export interface MarketTemplate {
  id: number;
  name: string;
  rates: RateConfiguration[];
  baseConfiguration: {
    defaultMealPlans: string[];
    defaultSupplements: boolean;
    defaultSpecialOffers: boolean;
  };
}

export type MenuItemId =
  | 'description'
  | 'policies'
  | 'capacity'
  | 'mealPlan'
  | 'periodAndMlos'
  | 'currency'
  | 'ratesConfig';

export interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: string;
}

export const MEAL_PLAN_TYPES = ['BB', 'HB', 'FB', 'AI'] as const;
export const AGE_CATEGORIES = [
  { type: 'adult', label: 'Adult', ageRange: '13+' },
  { type: 'child', label: 'Child', ageRange: '4-12' },
  { type: 'infant', label: 'Infant', ageRange: '0-3' },
] as const;

export const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'GBP', 'MUR'] as const;
export type Currency = typeof AVAILABLE_CURRENCIES[number];
