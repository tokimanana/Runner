// src/data/mock/hotels.mock.ts
import { 
  Hotel,
  RoomType,
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
    
    // Hotel features
    features: {
      restaurants: [
        {
          name: 'La Terrazza',
          cuisine: CuisineType.MEDITERRANEAN,
          type: RestaurantType.FINE_DINING,
          dressCode: 'Smart Elegant',
          openingHours: '19:00-23:00',
          description: 'Michelin-starred restaurant offering innovative Mediterranean cuisine with panoramic sea views.'
        },
        {
          name: 'Il Giardino',
          cuisine: CuisineType.ITALIAN,
          type: RestaurantType.CASUAL,
          dressCode: 'Smart Casual',
          openingHours: '12:00-15:00,19:00-22:30',
          description: 'Authentic Italian cuisine served in a romantic garden setting.'
        }
      ],
      spa: {
        name: 'Riveria Wellness & Spa',
        treatments: [
          'Massage',
          'Facial',
          'Body Treatments',
          'Mediterranean Rituals',
          'Couples Treatments'
        ],
        openingHours: '09:00-20:00',
        description: 'Luxury spa treatments with premium local ingredients.'
      }
    },
    
    // Media
    images: ['hotel-exterior.jpg', 'lobby.jpg', 'restaurant.jpg'],
    
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
    
    features: {
      restaurants: [
        {
          name: 'Ocean View',
          cuisine: CuisineType.INTERNATIONAL,
          type: RestaurantType.BUFFET,
          dressCode: 'Smart Casual',
          openingHours: '06:30-23:00',
          description: 'All-day dining venue offering international cuisine with Asian influences.'
        },
        {
          name: 'Teppanyaki',
          cuisine: CuisineType.JAPANESE,
          type: RestaurantType.SPECIALTY,
          dressCode: 'Smart Casual',
          openingHours: '19:00-22:30',
          description: 'Interactive dining experience featuring skilled teppanyaki chefs.'
        }
      ],
      spa: {
        name: 'Overwater Spa & Wellness',
        treatments: [
          'Massage',
          'Yoga',
          'Meditation',
          'Traditional Asian Treatments',
          'Ocean Healing Rituals'
        ],
        openingHours: '09:00-21:00',
        description: 'Luxury overwater spa pavilions offering signature treatments.'
      }
    },
    
    images: ['aerial-view.jpg', 'water-villa.jpg', 'beach.jpg'],
    
    contactInfo: {
      phone: '+960 400 6000',
      email: 'reservations@maldivesparadise.com',
      website: 'www.maldivesparadise.com'
    }
  }
];
