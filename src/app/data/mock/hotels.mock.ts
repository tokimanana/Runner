// src/data/mock/hotels.mock.ts
import { 
  Hotel,
  AgeCategory,
  Restaurant,
  Spa,
  ContactInfo,
  HotelFeatures,
  AmenityCategory,
  CuisineType,
  RestaurantType
} from '../../models/types';

export const hotels: Hotel[] = [
  {
    id: 1,
    name: 'Grand Hotel Riveria',
    description: 'Perched on the stunning Amalfi Coast, the Grand Hotel Riveria is a luxurious sanctuary offering breathtaking views of the Mediterranean Sea. This historic property combines classic Italian elegance with modern luxury, featuring world-class dining, a premium spa, and impeccable service.',
    address: 'Via Regina Giovanna, 23',
    city: 'Amalfi',
    country: 'Italy',
    rating: 5,
    // Basic Information
    yearBuilt: "1960",
    lastRenovation: "2022",
    totalRooms: 125,
    airportDistance: "45 km from Naples International Airport",
    cityCenterDistance: "0.5 km from Amalfi center",
    beachDistance: "Direct beach access",
    languages: ["Italian", "English", "French", "German"],
    
    // Operating hours
    checkInTime: '14:00',
    checkOutTime: '11:00',
    
    // Features and amenities
    amenities: {
      [AmenityCategory.POOL]: ['Swimming Pool'],
      [AmenityCategory.SPA]: ['Spa', 'Wellness Center'],
      [AmenityCategory.DINING]: ['Fine Dining', 'Room Service'],
      [AmenityCategory.BEACH]: ['Beach Access']
    },
    ageCategories: [
      {
        id: 1,
        type: 'adult',
        name: 'Adult',
        label: `Adult (${12}+ years)`,
        minAge: 12,
        maxAge: 100,
        description: 'Adult age category (12+ years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        type: 'child',
        name: 'Child',
        label: `Child (${2}-${11} years)`,
        minAge: 2,
        maxAge: 11,
        description: 'Child age category (2-11 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 3,
        type: 'infant',
        name: 'Infant',
        label: `Infant (${0}-${1} years)`,
        minAge: 0,
        maxAge: 1,
        description: 'Infant age category (0-1 years)',
        defaultRate: 0,
        isActive: true
      }
    ],
    // Contact information
    contactInfo: {
      phone: '+39 089 831 888',
      email: 'info@grandhotelriveria.com',
      website: 'www.grandhotelriveria.com'
    }
  },
  {
    id: 2,
    name: 'Maldives Paradise Resort',
    description: 'Nestled in the pristine waters of the Maldives, this exclusive island resort offers an unparalleled luxury experience. Featuring overwater villas, world-class dining, and direct access to vibrant coral reefs.',
    address: 'Maafushi Island',
    city: 'Male',
    country: 'Maldives',
    rating: 5,
    yearBuilt: "2018",
    lastRenovation: "2023",
    totalRooms: 80,
    airportDistance: "30 minutes by seaplane from Male International Airport",
    cityCenterDistance: "25 minutes by speedboat from Male",
    beachDistance: "Private beach resort",
    languages: ["English", "Chinese", "Japanese", "Arabic"],
    
    checkInTime: '15:00',
    checkOutTime: '12:00',
    
    amenities: {
      [AmenityCategory.BEACH]: ['Private Beach', 'Water Sports', 'Beach Club'],
      [AmenityCategory.POOL]: ['Infinity Pool'],
      [AmenityCategory.SPA]: ['Overwater Spa', 'Wellness Center'],
      [AmenityCategory.DINING]: ['Multiple Restaurants', 'Private Dining'],
      [AmenityCategory.ACTIVITIES]: ['Water Sports', 'Excursions']
    },
    ageCategories: [
      {
        id: 1,
        type: 'adult',
        name: 'Adult',
        label: `Adult (${16}+ years)`,
        minAge: 16,
        maxAge: 100,
        description: 'Adult age category (16+ years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        type: 'teen',
        name: 'Teen',
        label: `Teen (${12}-${15} years)`,
        minAge: 12,
        maxAge: 15,
        description: 'Teen age category (12-15 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 3,
        type: 'child',
        name: 'Child',
        label: `Child (${2}-${11} years)`,
        minAge: 2,
        maxAge: 11,
        description: 'Child age category (2-11 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 4,
        type: 'infant',
        name: 'Infant',
        label: `Infant (${0}-${1} years)`,
        minAge: 0,
        maxAge: 1,
        description: 'Infant age category (0-1 years)',
        defaultRate: 0,
        isActive: true
      }
    ],
    contactInfo: {
      phone: '+960 400 6000',
      email: 'reservations@maldivesparadise.com',
      website: 'www.maldivesparadise.com'
    }
  }
];

const defaultAgeCategories: AgeCategory[] = [
  {
    id: 1,
    type: 'adult',
    name: 'Adult',
    label: 'Adult (12+ years)',
    minAge: 12,
    maxAge: 100,
    description: 'Adult age category (12+ years)',
    defaultRate: 0,
    isActive: true
  },
  {
    id: 2,
    type: 'child',
    name: 'Child',
    label: 'Child (2-11 years)',
    minAge: 2,
    maxAge: 11,
    description: 'Child age category (2-11 years)',
    defaultRate: 0,
    isActive: true
  },
  {
    id: 3,
    type: 'infant',
    name: 'Infant',
    label: 'Infant (0-1 years)',
    minAge: 0,
    maxAge: 1,
    description: 'Infant age category (0-1 years)',
    defaultRate: 0,
    isActive: true
  }
];
