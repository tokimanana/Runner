import { MenuItem, MenuItemId } from '../models/types';

export const DEFAULT_MENU_ITEM: MenuItemId = 'description';
export const DEFAULT_TAB = 'general';

export const MENU_ITEMS: { [key: string]: MenuItem[] } = {
  general: [
    { id: 'description', icon: 'description', label: 'Description' },
    { id: 'policies', icon: 'policy', label: 'Policies' },
    { id: 'capacity', icon: 'hotel', label: 'Capacity' },
    { id: 'mealPlan', icon: 'fastfood', label: 'Meal Plans' }
  ],
  configuration: [
    { id: 'age-categories', icon: 'people', label: 'Age Categories' },
    { id: 'currency', icon: 'monetization_on', label: 'Currency' },
    { id: 'periodAndMlos', icon: 'date_range', label: 'Periods & MLOS' },
    { id: 'markets', icon: 'public', label: 'Markets' }
  ],
  contracts: [
    { id: 'contract', icon: 'receipt_long', label: 'Contract Management' },
    { id: 'specialOffers', icon: 'local_offer', label: 'Special Offers' },
    { id: 'rateSeasons', icon: 'calendar_today', label: 'Rate Seasons' }
  ],
  inventory: [
    { id: 'roomInventory', icon: 'inventory_2', label: 'Room Inventory' }
  ]
};
