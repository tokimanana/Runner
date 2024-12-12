// src/data/mock/policies.mock.ts
import { HotelPolicies, CancellationChargeType, PolicyType } from '../../models/types';

export const policies: { [hotelId: number]: HotelPolicies } = {
  1: {  // Grand Hotel Riveria
    cancellation: {
      description: 'Standard cancellation policy',
      rules: [
        {
          daysBeforeArrival: 7,
          charge: 100,
          chargeType: CancellationChargeType.PERCENTAGE
        }
      ],
      noShowCharge: 100,
      noShowChargeType: CancellationChargeType.PERCENTAGE
    },
    checkIn: {
      standardTime: '15:00',
      earliestTime: '13:00',
      latestTime: '22:00',
      additionalCharges: {
        early: {
          beforeTime: '13:00',
          charge: 50,
          description: 'Early check-in fee'
        },
        late: {
          afterTime: '22:00',
          charge: 50,
          description: 'Late check-in fee'
        }
      },
      requirements: [
        'Valid ID required',
        'Credit card for incidentals'
      ]
    },
    checkOut: {
      standardTime: '11:00',
      latestTime: '13:00',
      additionalCharges: {
        late: {
          afterTime: '13:00',
          charge: 50,
          description: 'Late check-out fee'
        }
      },
      requirements: [
        'Room inspection required',
        'Return all keys/cards'
      ]
    },
    child: {
      maxChildAge: 11,
      maxInfantAge: 2,
      allowChildren: true,
      childrenStayFree: true,
      maxChildrenFree: 2,
      requiresAdult: true,
      minAdultAge: 18,
      extraBedPolicy: {
        available: true,
        maxExtraBeds: 1,
        charge: 50,
        chargeType: 'per_night'
      },
      restrictions: [
        'Children under 12 must be accompanied by an adult in pool areas',
        'Age restrictions apply for certain water activities',
        'Children under 16 not allowed in spa'
      ]
    },
    pet: {
      allowPets: true,
      maxPets: 2,
      petTypes: ['Dogs', 'Cats'],
      maxWeight: 20,
      weightUnit: 'kg',
      charge: 25,
      chargeType: 'per_night',
      restrictions: [
        'Pets must be kept on leash in public areas',
        'Pets are not allowed in restaurant areas',
        'Pet owners must clean up after their pets'
      ],
      requirements: [
        'Valid vaccination records',
        'Pet deposit required',
        'Advance notification required'
      ]
    },
    dressCode: {
      general: 'Smart casual attire is required in all public areas after 18:00',
      publicAreas: [
        {
          area: 'Lobby',
          code: 'Smart Casual',
          description: 'Smart casual attire required',
          restrictions: ['No beachwear', 'No sportswear']
        },
        {
          area: 'Restaurants',
          code: 'Smart Elegant',
          description: 'Smart elegant attire required after 18:00',
          restrictions: ['No flip-flops', 'No shorts', 'No t-shirts']
        },
        {
          area: 'Bars',
          code: 'Smart Casual',
          description: 'Smart casual attire required after 18:00',
          restrictions: ['No beachwear', 'No sportswear']
        },
        {
          area: 'Reception',
          code: 'Smart Casual',
          description: 'Smart casual attire required',
          restrictions: ['No beachwear']
        }
      ],
      restaurants: [
        {
          name: 'La Terrazza',
          code: 'Smart Elegant',
          description: 'Collared shirts and closed shoes required. No beachwear or sportswear.',
          restrictions: [
            'No flip-flops or sandals',
            'No shorts or t-shirts during dinner',
            'Jacket required for gentlemen during dinner'
          ]
        },
        {
          name: 'Pool Bar',
          code: 'Casual',
          description: 'Casual attire permitted. Cover-ups required.',
          restrictions: [
            'Proper swim attire required',
            'Cover-ups required when not in pool area'
          ]
        }
      ]
    }
  },
  2: {  // Maldives Paradise Resort
    cancellation: {
      description: 'Premium resort cancellation policy',
      rules: [
        {
          daysBeforeArrival: 14,
          charge: 50,
          chargeType: CancellationChargeType.PERCENTAGE
        },
        {
          daysBeforeArrival: 7,
          charge: 100,
          chargeType: CancellationChargeType.PERCENTAGE
        }
      ],
      noShowCharge: 100,
      noShowChargeType: CancellationChargeType.PERCENTAGE
    },
    checkIn: {
      standardTime: '14:00',
      earliestTime: '12:00',
      latestTime: '23:00',
      requirements: [
        'Passport required',
        'Credit card for deposit'
      ]
    },
    checkOut: {
      standardTime: '12:00',
      latestTime: '14:00',
      requirements: [
        'Room key return required',
        'Settlement of all charges'
      ]
    },
    child: {
      maxChildAge: 11,
      maxInfantAge: 2,
      allowChildren: true,
      childrenStayFree: true,
      maxChildrenFree: 2,
      requiresAdult: true,
      minAdultAge: 18,
      extraBedPolicy: {
        available: true,
        maxExtraBeds: 1,
        charge: 50,
        chargeType: 'per_night'
      },
      restrictions: [
        'Children must be supervised at all times near water',
        'Age restrictions apply for certain water activities',
        'Children under 16 not allowed in spa'
      ]
    },
    pet: {
      allowPets: false,
      maxPets: 0,
      petTypes: [],
      restrictions: [
        'No pets allowed due to island environmental regulations',
        'Exception made for service animals with proper documentation'
      ],
      requirements: [
        'Service animals require advance notification',
        'Valid documentation for service animals required'
      ]
    },
    dressCode: {
      general: 'Resort casual attire appropriate to tropical climate',
      publicAreas: [
        {
          area: 'Lobby',
          code: 'Resort Casual',
          description: 'Casual resort attire appropriate to tropical climate',
          restrictions: ['No wet swimwear', 'Shirts and footwear required']
        },
        {
          area: 'Restaurants',
          code: 'Smart Casual',
          description: 'Smart casual attire required after 18:30',
          restrictions: ['No wet swimwear', 'No sleeveless shirts for dinner', 'Proper footwear required']
        },
        {
          area: 'Reception',
          code: 'Resort Casual',
          description: 'Resort casual attire required',
          restrictions: ['No wet swimwear', 'Proper footwear required']
        },
        {
          area: 'Pool Area',
          code: 'Beach Casual',
          description: 'Beach and swim attire permitted',
          restrictions: ['Cover-ups required when walking to/from pool', 'Proper swim attire required']
        }
      ],
      restaurants: [
        {
          name: 'Ocean View',
          code: 'Smart Casual',
          description: 'Evening dress code applies after 18:30',
          restrictions: [
            'No wet swimwear',
            'Shirts and footwear required',
            'Smart casual attire for dinner'
          ]
        }
      ]
    }
  }
};
