// src/app/data/mock/offers.mock.ts

import { SpecialOffer } from "src/app/models/types";

export const offersMock: SpecialOffer[] = [
  {
    id: 1,
    code: "EARLY2024",
    name: "Early Booking 2024",
    type: "combinable",
    description:
      "Early booking discount for 2024 stays - Book earlier for bigger savings",
    discountType: "percentage",
    discountValues: [
      {
        value: 20, // Higher discount for booking very early
        startDate: "2024-01-01",
        endDate: "2024-01-31", // First 90+ days before stay
      },
      {
        value: 15, // Lower discount for booking later
        startDate: "2024-02-01",
        endDate: "2024-02-28", // 60-89 days before stay
      },
      {
        value: 10, // Lowest discount for booking closer to stay
        startDate: "2024-03-01",
        endDate: "2024-03-31", // 30-59 days before stay
      },
    ],
    startDate: "2024-01-01", // When the offer can be booked
    endDate: "2024-03-31", // Last date to book the offer
    conditions: [
      "20% off when booking 90+ days in advance",
      "15% off when booking 60-89 days in advance",
      "10% off when booking 30-59 days in advance",
      "Full prepayment required at booking",
      "Non-refundable",
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2024-01-01",
      end: "2024-03-31",
    },
  },

  {
    id: 2,
    code: "LONGSTAY",
    name: "Long Stay Special",
    type: "cumulative",
    description:
      "Additional savings for extended stays - The longer you stay, the more you save",
    discountType: "percentage",
    discountValues: [
      {
        value: 10, // Base discount for minimum stay
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
      {
        value: 15, // Higher discount for longer stay
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
      {
        value: 20, // Maximum discount for longest stay
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    ],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    conditions: [
      "10% off for stays of 14-20 nights",
      "15% off for stays of 21-27 nights",
      "20% off for stays of 28 nights or more",
      "Applicable to all room types",
      "Cannot be combined with Early Booking offers",
      "Full prepayment required at booking",
    ],
    minimumNights: 14, // Reduced to make offer more accessible
    bookingWindow: {
      start: "2024-01-01",
      end: "2024-11-15",
    },
  },

  {
    id: 3,
    code: "HONEYMOON",
    name: "Honeymoon Package",
    type: "combinable",
    description:
      "Special perks and savings for honeymooners - Book your romantic getaway",
    discountType: "percentage",
    discountValues: [
      {
        value: 30, // Higher discount for peak season
        startDate: "2024-06-01",
        endDate: "2024-08-31",
      },
      {
        value: 25, // Standard discount for regular season
        startDate: "2024-01-01",
        endDate: "2024-05-31",
      },
      {
        value: 25, // Standard discount for regular season
        startDate: "2024-09-01",
        endDate: "2024-12-31",
      },
    ],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
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
      start: "2024-01-01",
      end: "2024-12-15",
    },
    blackoutDates: [
      "2024-12-24",
      "2024-12-25",
      "2024-12-26",
      "2024-12-27",
      "2024-12-28",
      "2024-12-29",
      "2024-12-30",
      "2024-12-31",
    ],
  },

  {
    id: 4,
    code: "SUMMER24",
    name: "Summer Special",
    type: "cumulative",
    description: "Peak season special rates with early booking benefits",
    discountType: "percentage",
    discountValues: [
      {
        value: 20, // Higher discount for early summer
        startDate: "2024-06-01",
        endDate: "2024-06-30",
      },
      {
        value: 15, // Mid summer discount
        startDate: "2024-07-01",
        endDate: "2024-07-31",
      },
      {
        value: 10, // Late summer discount
        startDate: "2024-08-01",
        endDate: "2024-08-31",
      },
    ],
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    conditions: [
      "Book at least 30 days in advance",
      "Valid for all room types subject to availability",
      "Full prepayment required at booking",
      "Non-refundable",
      "Not combinable with other offers",
      "Blackout dates: July 15-17 and August 15",
    ],
    minimumNights: 7,
    blackoutDates: ["2024-07-15", "2024-07-16", "2024-07-17", "2024-08-15"],
    bookingWindow: {
      start: "2024-01-01", // Early booking starts
      end: "2024-07-31", // Booking ends one month before last valid stay date
    },
  },

  {
    id: 5,
    code: "WINTER24",
    name: "Winter Escape",
    type: "combinable",
    description: "Special winter rates with early booking benefits",
    discountType: "percentage",
    discountValues: [
      {
        value: 30, // Higher discount for early booking
        startDate: "2024-11-01",
        endDate: "2024-11-30",
      },
      {
        value: 25, // Standard discount for regular booking
        startDate: "2024-12-01",
        endDate: "2024-12-20",
      },
    ],
    startDate: "2024-11-01",
    endDate: "2024-12-20",
    conditions: [
      "30% off for November stays",
      "25% off for December stays",
      "Applicable to all room categories",
      "Full prepayment required at booking",
      "Non-refundable",
      "Not valid during festive period (Dec 21-31)",
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2024-08-01", // Booking starts 3 months before
      end: "2024-11-20", // Ends 1 month before last valid stay date
    },
  },

  {
    id: 6,
    code: "FLASH24",
    name: "Flash Sale",
    type: "cumulative",
    description: "72-hour flash sale with exceptional savings for summer stays",
    discountType: "percentage",
    discountValues: [
      {
        value: 35, // Single high discount for limited time
        startDate: "2024-06-01", // Valid for summer stays
        endDate: "2024-08-31",
      },
    ],
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    conditions: [
      "35% off on all room types",
      "Must book within 72-hour sale period",
      "Valid for stays between June 1 and August 31, 2024",
      "Non-refundable and non-modifiable",
      "Subject to availability",
      "Cannot be combined with other offers",
    ],
    minimumNights: 5,
    bookingWindow: {
      start: "2024-03-15", // 72-hour sale period
      end: "2024-03-18",
    },
    blackoutDates: ["2024-07-01", "2024-07-02", "2024-07-03", "2024-07-04"], // Independence Day period
  },

  {
    id: 7,
    code: "ADVANCE25",
    name: "Advanced Purchase 25",
    type: "combinable",
    description:
      "25% savings for early planners - Book 45 days ahead for best rates",
    discountType: "percentage",
    discountValues: [
      {
        value: 25,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    ],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    conditions: [
      "25% off when booking at least 45 days in advance",
      "Valid for all room types and stay dates in 2024",
      "Full prepayment required at time of booking",
      "Non-refundable and non-modifiable",
      "Can be combined with select seasonal offers",
    ],
    minimumNights: 3,
    bookingWindow: {
      start: "2024-01-01",
      end: "2024-11-15", // Ends 45 days before year end
    },
  },
];
