// src/data/mock/rooms.mock.ts
import { RoomType, RoomCategory } from '../../models/types';

export const rooms: RoomType[] = [
  // Grand Hotel Riveria Rooms
  {
    id: 1,
    hotelId: 1,
    name: 'Classic Mediterranean Room',
    category: RoomCategory.STANDARD,
    description: 'Elegant room with city or garden views',
    size: 30,
    maxOccupancy: {
      adults: 2,
      children: 1,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Air conditioning',
      'Mini bar',
      'Safe',
      'Free WiFi',
      'Satellite TV',
      'En-suite bathroom'
    ],
    status: 'active'
  },
  {
    id: 2,
    hotelId: 1,
    name: 'Superior Sea View',
    category: RoomCategory.SUPERIOR,
    description: 'Spacious room with panoramic Mediterranean views',
    size: 35,
    maxOccupancy: {
      adults: 2,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Private balcony',
      'Sitting area',
      'Premium toiletries',
      'Nespresso machine',
      'Mini bar',
      'Safe'
    ],
    status: 'active'
  },
  {
    id: 3,
    hotelId: 1,
    name: 'Deluxe Terrace Suite',
    category: RoomCategory.DELUXE,
    description: 'Luxury suite with private terrace and sea views',
    size: 45,
    maxOccupancy: {
      adults: 3,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Large terrace',
      'Separate living area',
      'Premium bathroom',
      'Walk-in closet',
      'Butler service',
      'Premium bar'
    ],
    status: 'active'
  },
  {
    id: 4,
    hotelId: 1,
    name: 'Family Suite',
    category: RoomCategory.FAMILY_ROOM,
    description: 'Spacious suite ideal for families',
    size: 55,
    maxOccupancy: {
      adults: 2,
      children: 3,
      infants: 1
    },
    baseOccupancy: 4,
    amenities: [
      'Two bedrooms',
      'Family bathroom',
      'Kids welcome pack',
      'Game console',
      'Kitchenette',
      'Child safety features'
    ],
    status: 'active'
  },
  {
    id: 5,
    hotelId: 1,
    name: 'Presidential Suite',
    category: RoomCategory.PENTHOUSE,
    description: 'Ultimate luxury with panoramic coastal views',
    size: 120,
    maxOccupancy: {
      adults: 4,
      children: 2,
      infants: 2
    },
    baseOccupancy: 2,
    amenities: [
      'Private terrace',
      'Jacuzzi',
      'Dining room',
      'Butler service',
      'Private bar',
      'Executive lounge access'
    ],
    status: 'active'
  },

  // Maldives Paradise Resort Rooms
  {
    id: 6,
    hotelId: 2,
    name: 'Garden Villa',
    category: RoomCategory.VILLA,
    description: 'Tropical villa surrounded by lush gardens',
    size: 65,
    maxOccupancy: {
      adults: 2,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Private garden',
      'Outdoor shower',
      'Plunge pool',
      'Daybed',
      'Beach access',
      'Butler service'
    ],
    status: 'active'
  },
  {
    id: 7,
    hotelId: 2,
    name: 'Beach Villa',
    category: RoomCategory.VILLA,
    description: 'Direct beach access villa with ocean views',
    size: 75,
    maxOccupancy: {
      adults: 3,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Beachfront location',
      'Private pool',
      'Sundeck',
      'Outdoor dining area',
      'Premium amenities',
      'Butler service'
    ],
    status: 'active'
  },
  {
    id: 8,
    hotelId: 2,
    name: 'Overwater Villa',
    category: RoomCategory.OVERWATER_VILLA,
    description: 'Luxurious villa suspended over crystal waters',
    size: 85,
    maxOccupancy: {
      adults: 2,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Direct ocean access',
      'Glass floor panels',
      'Private deck',
      'Outdoor shower',
      'Premium amenities',
      'Sunset views'
    ],
    status: 'active'
  },
  {
    id: 9,
    hotelId: 2,
    name: 'Premium Pool Villa',
    category: RoomCategory.POOL_VILLA,
    description: 'Spacious villa with infinity pool',
    size: 95,
    maxOccupancy: {
      adults: 3,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Infinity pool',
      'Extended deck',
      'Living area',
      'Premium bathroom',
      'Wine cellar',
      'Butler service'
    ],
    status: 'active'
  },
  {
    id: 10,
    hotelId: 2,
    name: 'Grand Overwater Suite',
    category: RoomCategory.EXECUTIVE_SUITE,
    description: 'Premium overwater suite with ultimate privacy',
    size: 150,
    maxOccupancy: {
      adults: 4,
      children: 2,
      infants: 2
    },
    baseOccupancy: 2,
    amenities: [
      'Two bedrooms',
      'Private infinity pool',
      'Kitchen',
      'Wine cellar',
      'Gym equipment',
      'Private chef service'
    ],
    status: 'active'
  }
];
