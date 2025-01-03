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
        value: 20,
        startDate: "2025-01-01",
        endDate: "2025-03-31",
      },
      {
        value: 15,
        startDate: "2025-04-01",
        endDate: "2025-06-30",
      },
      {
        value: 10,
        startDate: "2025-07-01",
        endDate: "2025-09-30",
      },
    ],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    conditions: [
      "20% off when booking 90+ days in advance",
      "15% off when booking 60-89 days in advance",
      "10% off when booking 30-59 days in advance",
      "Full prepayment required at booking",
      "Non-refundable",
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2024-12-01", // Starting from current month
      end: "2025-11-30",
    },
  },

  {
    id: 2,
    code: "LONGSTAY25",
    name: "Long Stay Special",
    type: "cumulative",
    description:
      "Additional savings for extended stays - The longer you stay, the more you save",
    discountType: "percentage",
    startDate: "2025-01-01", // Add overall offer validity period
    endDate: "2025-12-31", // Add overall offer validity period
    bookingWindow: {
      // Move booking window to top level
      start: "2024-06-01",
      end: "2025-03-31",
    },
    discountValues: [
      {
        value: 10,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
      {
        value: 15,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
      {
        value: 20,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
    ],
    conditions: [
      "10% off when booking 1-3 months in advance",
      "15% off when booking 3-6 months in advance",
      "20% off when booking 6+ months in advance",
      "Valid for all room types",
      "Full prepayment required at booking",
    ],
    minimumNights: 2,
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
        value: 30,
        startDate: "2025-06-01",
        endDate: "2025-08-31",
      },
      {
        value: 25,
        startDate: "2025-01-01",
        endDate: "2025-05-31",
      },
      {
        value: 25,
        startDate: "2025-09-01",
        endDate: "2025-12-31",
      },
    ],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    conditions: [
      "Valid marriage certificate required (within 6 months of wedding date)",
      "Booking must be made within 3 months of wedding date",
      "Complimentary room upgrade subject to availability at check-in",
      "Minimum stay of 5 nights required",
      "Not valid during festive season (24-31 December)",
      "Names on marriage certificate must match travel documents",
    ],
    minimumNights: 5,
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-12-15",
    },
    blackoutDates: [
      "2025-12-24",
      "2025-12-25",
      "2025-12-26",
      "2025-12-27",
      "2025-12-28",
      "2025-12-29",
      "2025-12-30",
      "2025-12-31",
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
        value: 20,
        startDate: "2025-06-01",
        endDate: "2025-06-30",
      },
      {
        value: 15,
        startDate: "2025-07-01",
        endDate: "2025-07-31",
      },
      {
        value: 10,
        startDate: "2025-08-01",
        endDate: "2025-08-31",
      },
    ],
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    conditions: [
      "Book at least 30 days in advance",
      "Valid for all room types subject to availability",
      "Full prepayment required at booking",
      "Non-refundable",
      "Not combinable with other offers",
      "Blackout dates: July 15-17 and August 15",
    ],
    minimumNights: 7,
    blackoutDates: ["2025-07-15", "2025-07-16", "2025-07-17", "2025-08-15"],
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
        value: 30,
        startDate: "2025-11-01",
        endDate: "2025-11-30",
      },
      {
        value: 25,
        startDate: "2025-12-01",
        endDate: "2025-12-20",
      },
    ],
    startDate: "2025-11-01",
    endDate: "2025-12-20",
    conditions: [
      "30% off for November stays",
      "25% off for December stays",
      "ApplicableFull prepayment required at booking",
      "Non-refundable",
      "Not valid during festive period (Dec 21-31)",
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2025-08-01",
      end: "2025-11-20",
    },
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
        value: 35,
        startDate: "2025-06-01",
        endDate: "2025-08-31",
      },
    ],
    startDate: "2025-06-01", // Overall offer validity start
    endDate: "2025-08-31", // Overall offer validity end
    bookingWindow: {
      start: "2025-03-15",
      end: "2025-03-18", // 72-hour sale period
    },
    conditions: [
      "35% off on all room types",
      "Must book within 72-hour sale period",
      "Valid for stays between June 1 and August 31, 2025",
      "Non-refundable and non-modifiable",
      "Subject to availability",
    ],
    minimumNights: 5,
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
        value: 25,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
    ],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-11-15", // Allows booking 45 days before end date
    },
    conditions: [
      "25% off when booking at least 45 days in advance",
      "Valid for all room types and stay dates in 2025",
      "Full prepayment required at time of booking",
      "Non-refundable and non-modifiable",
    ],
    minimumNights: 3,
  },

  // ID 8: Quick Start 2025
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
        value: 15,
        startDate: "2025-01-01",
        endDate: "2025-03-31",
      },
    ],
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-03-15",
    },
    conditions: [
      "15% off for stays of 5-7 nights",
      "20% off for stays of 8-14 nights",
      "25% off for stays of 15 nights or more",
      "Valid for all room categories",
      "Blackout dates apply during Easter holiday",
    ],
    minimumNights: 5,
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
        value: 20,
        startDate: "2025-03-01",
        endDate: "2025-05-31",
      },
    ],
    startDate: "2025-03-01",
    endDate: "2025-05-31",
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-05-15",
    },
    conditions: [
      "20% off for stays of 7-13 nights",
      "25% off for stays of 14-20 nights",
      "30% off for stays of 21+ nights",
      "Valid for all room types",
      "Not valid during Easter holidays",
    ],
    minimumNights: 7,
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
        value: 22,
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      },
    ],
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    bookingWindow: {
      start: "2024-12-01",
      end: "2025-01-15",
    },
    conditions: [
      "22% off for stays of 10-15 nights",
      "25% off for stays of 16-21 nights",
      "30% off for stays of 22+ nights",
      "Valid for all room categories",
      "Full prepayment required",
      "Non-refundable",
    ],
    minimumNights: 10,
  },
];
