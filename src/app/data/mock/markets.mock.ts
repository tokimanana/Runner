// src/data/mock/markets.mock.ts
import { Market, MarketGroup } from '../../models/types';

export const markets: Market[] = [
  {
    id: 1,
    name: "France",
    code: "FR",
    isActive: true,
    currency: "EUR",
    region: "Europe",
    description: "French market including overseas territories"
  },
  {
    id: 2,
    name: "United Kingdom",
    code: "UK",
    isActive: true,
    currency: "GBP",
    region: "Europe",
    description: "UK and Ireland market"
  },
  {
    id: 3,
    name: "Germany",
    code: "DE",
    isActive: true,
    currency: "EUR",
    region: "Europe",
    description: "German-speaking market"
  },
  {
    id: 4,
    name: "United States",
    code: "US",
    isActive: true,
    currency: "USD",
    region: "North America",
    description: "US market"
  },
  {
    id: 5,
    name: "Canada",
    code: "CA",
    isActive: true,
    currency: "USD",
    region: "North America",
    description: "Canadian market"
  },
  {
    id: 6,
    name: "Japan",
    code: "JP",
    isActive: true,
    currency: "USD",
    region: "Asia",
    description: "Japanese market"
  }
];

export const marketGroups: MarketGroup[] = [
  {
    id: 1,
    name: "European Markets",
    region: "Europe",
    markets: [1, 2, 3], // References to France, UK, and Germany
    defaultCurrency: "EUR",
    description: "All European market regions",
    isActive: true
  },
  {
    id: 2,
    name: "North American Markets",
    region: "North America",
    markets: [4, 5], // References to US and Canada
    defaultCurrency: "USD",
    description: "US and Canadian markets",
    isActive: true
  },
  {
    id: 3,
    name: "Asian Markets",
    region: "Asia",
    markets: [6], // Reference to Japan
    defaultCurrency: "USD",
    description: "Asian market regions",
    isActive: true
  }
];

// Helper functions
export const getMarketsByGroup = (groupId: number): Market[] => {
  const group = marketGroups.find(g => g.id === groupId);
  if (!group) return [];
  return markets.filter(market => group.markets.includes(market.id));
};

export const getActiveMarkets = (): Market[] => 
  markets.filter(market => market.isActive);

export const getMarketByCode = (code: string): Market | undefined =>
  markets.find(market => market.code === code);

export const getMarketById = (id: number): Market | undefined =>
  markets.find(market => market.id === id);

export const getGroupById = (id: number): MarketGroup | undefined =>
  marketGroups.find(group => group.id === id);

export const getMarketGroupsForRegion = (region: string): MarketGroup[] =>
  marketGroups.filter(group => group.region === region);
