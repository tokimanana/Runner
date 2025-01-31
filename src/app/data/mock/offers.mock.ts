// src/app/data/mock/offers.mock.ts

import { SpecialOffer } from "src/app/models/types";

export const offersMock: SpecialOffer[] = [
  {
    id: 1,
    code: "EARLY2025",
    name: "Early Booking 2025",
    type: "combinable",
    description:
      "Early booking discount for 2025 stays - Book earlier for bigger savings",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2024-12-01",
          end: "2025-03-31",
        },
        value: 20,
      },
      {
        bookingDateRange: {
          start: "2025-04-01",
          end: "2025-06-30",
        },
        value: 15,
      },
      {
        bookingDateRange: {
          start: "2025-07-01",
          end: "2025-11-30",
        },
        value: 10,
      },
    ],
    travelDateRange: {
      start: "2025-01-01",
      end: "2025-12-31",
    },
    conditions: ["Full prepayment required at booking", "Non-refundable"],
    minimumNights: 7,
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-11-30",
    },
    blackoutDates: [
      {
        start: "2025-12-24",
        end: "2025-12-31",
      },
    ],
  },
  {
    id: 2,
    code: "LONGSTAY25",
    name: "Long Stay Special",
    type: "cumulative",
    description:
      "Additional savings for extended stays - The longer you stay, the more you save",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2024-04-01",
          end: "2024-05-31",
        },
        value: 5,
      },
      {
        bookingDateRange: {
          start: "2024-06-01",
          end: "2024-09-30",
        },
        value: 10,
      },
      {
        bookingDateRange: {
          start: "2024-10-01",
          end: "2025-01-31",
        },
        value: 15,
      },
      {
        bookingDateRange: {
          start: "2025-02-01",
          end: "2025-03-31",
        },
        value: 20,
      },
    ],
    travelDateRange: {
      start: "2025-01-01",
      end: "2025-12-31",
    },
    conditions: [
      "Valid for all room types",
      "Full prepayment required at booking",
    ],
    minimumNights: 2,
    bookingWindow: {
      // Added bookingWindow
      start: "2024-04-01",
      end: "2025-12-31",
    },
    blackoutDates: [
      {
        start: "2025-12-20",
        end: "2026-01-05",
      },
    ],
  },
  {
    id: 3,
    code: "HONEYMOON25",
    name: "Honeymoon Package",
    type: "combinable",
    description:
      "Special perks and savings for honeymooners - Book your romantic getaway",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2025-01-01",
          end: "2025-05-31",
        },
        value: 25,
      },
      {
        bookingDateRange: {
          start: "2025-06-01",
          end: "2025-08-31",
        },
        value: 30,
      },
      {
        bookingDateRange: {
          start: "2025-09-01",
          end: "2025-12-31",
        },
        value: 25,
      },
    ],
    travelDateRange: {
      start: "2025-01-01",
      end: "2025-12-31",
    },
    conditions: [
      "Valid marriage certificate required (within 6 months of wedding date)",
      "Booking must be made within 3 months of wedding date",
      "Complimentary room upgrade subject to availability at check-in",
    ],
    minimumNights: 5,
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-12-15",
    },
    blackoutDates: [
      {
        start: "2025-12-24",
        end: "2025-12-31",
      },
    ],
  },
  {
    id: 4,
    code: "SUMMER25",
    name: "Summer Special",
    type: "cumulative",
    description: "Peak season special rates with early booking benefits",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2025-06-01",
          end: "2025-06-30",
        },
        value: 20,
      },
      {
        bookingDateRange: {
          start: "2025-07-01",
          end: "2025-07-31",
        },
        value: 15,
      },
      {
        bookingDateRange: {
          start: "2025-08-01",
          end: "2025-08-31",
        },
        value: 10,
      },
    ],
    travelDateRange: {
      start: "2025-06-01",
      end: "2025-08-31",
    },
    conditions: [
      "Valid for all room types subject to availability",
      "Full prepayment required at booking",
      "Non-refundable",
    ],
    minimumNights: 7,
    blackoutDates: [
      {
        start: "2025-07-15",
        end: "2025-07-17",
      },
      {
        start: "2025-08-15",
        end: "2025-08-15",
      },
    ],
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-07-31",
    },
  },
  {
    id: 5,
    code: "WINTER25",
    name: "Winter Escape",
    type: "combinable",
    description: "Special winter rates with early booking benefits",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2025-11-01",
          end: "2025-11-30",
        },
        value: 30,
      },
      {
        bookingDateRange: {
          start: "2025-12-01",
          end: "2025-12-20",
        },
        value: 25,
      },
    ],
    travelDateRange: {
      start: "2025-11-01",
      end: "2025-12-20",
    },
    conditions: [
      "ApplicableFull prepayment required at booking",
      "Non-refundable",
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2025-08-01",
      end: "2025-12-20",
    },
    blackoutDates: [
      {
        start: "2025-12-21",
        end: "2025-12-31",
      },
    ],
  },
  // ID 6: Flash Sale
  {
    id: 6,
    code: "FLASH25",
    name: "Flash Sale",
    type: "cumulative",
    description: "72-hour flash sale with exceptional savings for summer stays",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2025-03-15",
          end: "2025-03-18",
        },
        value: 35,
      },
    ],
    travelDateRange: {
      start: "2025-03-19",
      end: "2025-06-30",
    },
    conditions: [
      "35% off on all room types",
      "Must book within 72-hour sale period",
      "Valid for stays between June 1 and August 31, 2025",
      "Non-refundable and non-modifiable",
      "Subject to availability",
    ],
    minimumNights: 5,
    bookingWindow: {
      start: "2025-03-15",
      end: "2025-03-18",
    },
    blackoutDates: [],
  },
  // ID 7: Advanced Purchase 25
  {
    id: 7,
    code: "ADVANCE25",
    name: "Advanced Purchase 25",
    type: "cumulative",
    description:
      "25% savings for early planners - Book 45 days ahead for best rates",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2024-12-01",
          end: "2025-11-15",
        },
        value: 25,
      },
    ],
    travelDateRange: {
      start: "2025-01-01",
      end: "2025-12-31",
    },
    conditions: [
      "25% off when booking at least 45 days in advance",
      "Full prepayment required at time of booking",
      "Non-refundable and non-modifiable",
    ],
    minimumNights: 3,
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-11-15",
    },
    blackoutDates: [
      {
        start: "2025-12-20",
        end: "2026-01-10",
      },
    ],
  },

  {
    id: 8,
    code: "QSTART25",
    name: "Quick Start 2025",
    type: "cumulative",
    description:
      "Start 2025 with increasing savings - Book your stay in the first quarter for progressive discounts",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2024-12-01",
          end: "2025-01-15",
        },
        value: 15,
      },
      {
        bookingDateRange: {
          start: "2025-01-16",
          end: "2025-02-15",
        },
        value: 20,
      },
      {
        bookingDateRange: {
          start: "2025-02-16",
          end: "2025-03-15",
        },
        value: 25,
      },
    ],
    travelDateRange: {
      start: "2025-01-01",
      end: "2025-03-31",
    },
    conditions: [
      "Valid for all room categories",
      "Blackout dates apply during Easter holiday",
    ],
    minimumNights: 5, // Minimum nights for the entire offer
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-03-15",
    },
    blackoutDates: [
      {
        start: "2025-04-05",
        end: "2025-04-15",
      },
    ],
  },

  // ID 9: Spring Progressive Discount
  {
    id: 9,
    code: "SPRING25",
    name: "Spring Progressive Discount",
    type: "cumulative",
    description:
      "Progressive discounts for spring stays with longer duration benefits",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2024-12-01",
          end: "2025-05-15",
        },
        value: 20,
      },
    ],
    travelDateRange: {
      start: "2025-03-01",
      end: "2025-05-31",
    },
    conditions: [
      "Valid for all room types",
      "Not valid during Easter holidays",
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-05-15",
    },
    blackoutDates: [
      {
        start: "2025-04-01",
        end: "2025-04-15",
      },
    ],
  },

  // ID 10: New Year Extended Stay
  {
    id: 10,
    code: "NEWYEAR25",
    name: "New Year Extended Stay",
    type: "cumulative",
    description:
      "Special extended stay offer for the new year period with increasing benefits",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2024-12-01",
          end: "2025-01-15",
        },
        value: 22,
      },
    ],
    travelDateRange: {
      start: "2025-01-01",
      end: "2025-01-31",
    },
    conditions: [
      "Valid for all room categories",
      "Full prepayment required",
      "Non-refundable",
    ],
    minimumNights: 10,
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-01-15",
    },
    blackoutDates: [],
  },

  // ID 11: Winter Special 2025
  {
    id: 11,
    code: "WINTER2025",
    name: "Winter Special 2025",
    type: "combinable",
    description: "20% off for winter stays excluding festive period",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          // Add bookingDateRange
          start: "2025-01-01",
          end: "2026-12-31",
        },
        value: 20,
      },
    ],
    bookingWindow: {
      start: "2024-12-01",
      end: "2026-12-22",
    },
    travelDateRange: {
      start: "2025-01-01",
      end: "2026-12-31",
    },
    conditions: [
      "Not valid during festive period (December 23rd - January 2nd)",
      "Valid for all room types",
    ],
    minimumNights: 2,
    blackoutDates: [
      {
        start: "2025-12-23",
        end: "2026-01-02",
      },
    ],
  },

  // ID 12: Year Round Bonus
  {
    id: 12,
    code: "YEARROUND25",
    name: "Year Round Bonus",
    type: "combinable",
    description: "Extra 5% savings throughout the year",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2025-01-01",
          end: "2026-12-31",
        },
        value: 5,
      },
    ],
    bookingWindow: {
      start: "2025-01-01",
      end: "2025-12-31",
    },
    travelDateRange: {
      start: "2025-01-01",
      end: "2026-12-31",
    },
    conditions: ["5% off entire stay", "Valid for all room types"],
    minimumNights: 1,
    blackoutDates: [
      {
        start: "2025-12-20",
        end: "2026-01-05",
      },
    ],
  },

  // ID 13: Early Bird Discount
  {
    id: 13,
    code: "EARLYBIRD",
    name: "Early Bird Discount",
    type: "combinable",
    description: "Get 5% off when you book in advance!",
    discountType: "percentage",
    discountValues: [
      {
        bookingDateRange: {
          start: "2023-01-01",
          end: "2027-12-31",
        },
        value: 5,
      },
    ],
    bookingWindow: {
      start: "2025-01-01",
      end: "2025-12-31",
    },
    travelDateRange: {
      start: "2025-01-01",
      end: "2026-12-31",
    },
    conditions: ["5% off entire stay", "Valid for all room types"],
    minimumNights: 1,
    blackoutDates: [],
  },
];
