// src/data/mock/policies.mock.ts
import { 
  HotelPolicies, 
  CancellationPolicy, 
  TimePolicy,
  ChildPolicy,
  PetPolicy,
  DressCodePolicy,
  CancellationChargeType
 } from '../../models/types';

 // Separate policy templates for reuse
 const policyTemplates = {
  cancellation: {
    description: 'Standard cancellation policy',
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
      'Age restrictions apply for certain activities',
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
      }
    ],
    restaurants: [
      {
        name: 'Main Restaurant',
        code: 'Smart Casual',
        description: 'Smart casual attire required for dinner',
        restrictions: [
          'No beachwear',
          'Closed shoes required for dinner',
          'No sleeveless shirts for men'
        ]
      }
    ]
  }
};


// Complete implementation for both hotels
export const policies: { [hotelId: number]: HotelPolicies } = {
  1: {  // Grand Hotel Riveria
    cancellation: {
      ...policyTemplates.cancellation,
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
      ]
    },
    checkIn: {
      ...policyTemplates.checkIn,
      standardTime: '14:00',
      requirements: [
        'Passport required',
        'Credit card for deposit',
        'Booking confirmation required'
      ]
    },
    checkOut: {
      ...policyTemplates.checkOut,
      standardTime: '11:00',
      latestTime: '12:00'
    },
    child: {
      ...policyTemplates.child,
      maxChildrenFree: 1,
      extraBedPolicy: {
        available: true,
        maxExtraBeds: 1,
        charge: 60,
        chargeType: 'per_night'
      }
    },
    pet: {
      ...policyTemplates.pet,
      maxPets: 1,
      charge: 30
    },
    dressCode: {
      ...policyTemplates.dressCode,
      general: 'Smart elegant attire required in all public areas after 19:00'
    }
  },
  2: {  // Maldives Paradise Resort
    cancellation: {
      ...policyTemplates.cancellation,
      rules: [
        {
          daysBeforeArrival: 21,
          charge: 50,
          chargeType: CancellationChargeType.PERCENTAGE
        },
        {
          daysBeforeArrival: 14,
          charge: 75,
          chargeType: CancellationChargeType.PERCENTAGE
        },
        {
          daysBeforeArrival: 7,
          charge: 100,
          chargeType: CancellationChargeType.PERCENTAGE
        }
      ]
    },
    checkIn: {
      ...policyTemplates.checkIn,
      standardTime: '15:00',
      requirements: [
        'Passport required',
        'Credit card for deposit',
        'Transfer details required'
      ]
    },
    checkOut: {
      ...policyTemplates.checkOut,
      standardTime: '12:00',
      latestTime: '14:00'
    },
    child: {
      ...policyTemplates.child,
      maxChildrenFree: 2,
      extraBedPolicy: {
        available: true,
        maxExtraBeds: 2,
        charge: 75,
        chargeType: 'per_night'
      }
    },
    pet: {
      allowPets: false,
      maxPets: 0,
      petTypes: [],
      restrictions: [
        'No pets allowed due to island environmental regulations',
        'Service animals allowed with proper documentation'
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
        }
      ],
      restaurants: [
        {
          name: 'Ocean View',
          code: 'Smart Casual',
          description: 'Smart casual attire required for dinner',
          restrictions: [
            'No wet swimwear',
            'Collared shirts required for dinner',
            'No bare feet'
          ]
        }
      ]
    }
  },
  3: {  // Le Tropical Paradise Resort & Spa
    cancellation: {
      ...policyTemplates.cancellation,
      rules: [
        {
          daysBeforeArrival: 30,
          charge: 25,
          chargeType: CancellationChargeType.PERCENTAGE
        },
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
      ]
    },
    checkIn: {
      standardTime: '14:00',
      earliestTime: '12:00',
      requirements: [
        'Passport required',
        'Credit card for deposit',
        'Booking confirmation required'
      ]
    },
    checkOut: {
      standardTime: '11:00',
      latestTime: '12:00',
      requirements: [
        'Room inspection required',
        'All charges settled'
      ]
    },
    child: {
      maxChildAge: 11,
      maxInfantAge: 2,
      allowChildren: true,
      childrenStayFree: true,
      maxChildrenFree: 2,
      requiresAdult: true,  // Added missing required property
      minAdultAge: 18,     // Added missing required property
      extraBedPolicy: {
        available: true,
        maxExtraBeds: 1,
        charge: 40,
        chargeType: 'per_night'
      }
    },
    pet: {
      allowPets: false,
      maxPets: 0,
      petTypes: [],        // Added missing required property
      restrictions: [
        'No pets allowed due to local regulations',
        'Service animals allowed with proper documentation'
      ]
    },

    dressCode: {
      general: 'Smart casual attire in all public areas after 18:00',
      restaurants: [
        {
          name: 'Creole Restaurant',
          code: 'Smart Casual',
          description: 'Smart casual attire required for dinner',
          restrictions: [
            'No beachwear',
            'Closed shoes required for dinner',
            'No sleeveless shirts for men'
          ]
        },
        {
          name: 'Seafood Grill',
          code: 'Resort Casual',
          description: 'Resort casual attire',
          restrictions: [
            'No wet swimwear',
            'Footwear required'
          ]
        }
      ],
      publicAreas: [
        {
          area: 'Lobby & Reception',
          code: 'Smart Casual',
          description: 'Appropriate attire required',
          restrictions: ['No beachwear', 'No bare feet']
        },
        {
          area: 'Beach Bar',
          code: 'Beach Casual',
          description: 'Beach attire permitted',
          restrictions: ['Cover-ups required']
        }
      ]
    }
}

};

export const getPolicyTemplate = (policyType: string): any => {
  return policyTemplates[policyType as keyof typeof policyTemplates] || {};
};

// Validation functions
export const validatePolicy = (policy: any, type: string): boolean => {
  // Add validation logic per policy type
  switch(type) {
    case 'cancellation':
      return !!policy.rules && Array.isArray(policy.rules);
    case 'checkIn':
    case 'checkOut':
      return !!policy.standardTime;
    // ... other validations
    default:
      return true;
  }
};

// Export default values for new policies
export const defaultPolicies: HotelPolicies = {
  cancellation: policyTemplates.cancellation,
  checkIn: policyTemplates.checkIn,
  checkOut: {
    standardTime: '11:00',
    latestTime: '12:00',
    requirements: ['Room inspection required']
  },
  child: {
    maxChildAge: 11,
    maxInfantAge: 2,
    allowChildren: true,
    childrenStayFree: true,
    maxChildrenFree: 2,
    requiresAdult: true,
    minAdultAge: 18
  },
  pet: {
    allowPets: false,
    maxPets: 0,
    petTypes: [],
    restrictions: []
  },
  dressCode: {
    general: 'Smart casual attire required in all public areas',
    publicAreas: [],
    restaurants: []
  }
};