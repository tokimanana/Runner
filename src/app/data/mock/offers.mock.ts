// src/app/data/mock/offers.mock.ts

import { SpecialOffer } from "src/app/models/types";

export const offersMock: SpecialOffer[] = [
  {
    id: 1,
    code: "EARLY2024",
    name: "Early Booking 2024",
    type: "combinable",
    description: "Early booking discount for 2024 stays",
    discountType: "percentage",
    discountValues: [
      {
        nights: 7,
        value: 15,
        startDate: "2024-05-01",
        endDate: "2024-10-31",
      },
      {
        nights: 14,
        value: 20,
        startDate: "2024-05-01",
        endDate: "2024-10-31",
      },
    ],
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    conditions: [
      "Book at least 90 days in advance",
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
    description: "Additional savings for extended stays",
    discountType: "percentage",
    discountValues: [
      {
        nights: 21,
        value: 10,
      },
      {
        nights: 28,
        value: 15,
      },
    ],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    conditions: [
      "Minimum stay of 21 nights required",
      "Applicable to all room types",
      "Cannot be combined with Early Booking offers",
    ],
    minimumNights: 21,
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
    description: "Special perks for honeymooners",
    discountType: "percentage",
    discountValues: [
      {
        nights: 5,
        value: 10,
      },
    ],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    conditions: [
      "Marriage certificate required",
      "Valid within 6 months of wedding date",
      "Complimentary room upgrade subject to availability",
    ],
    minimumNights: 5,
    bookingWindow: {
      start: "2024-01-01",
      end: "2024-12-15", // Ends slightly before offer end to account for minimum stay
    },
  },
  {
    id: 4,
    code: "SUMMER24",
    name: "Summer Special",
    type: "cumulative",
    description: "Peak season savings",
    discountType: "percentage",
    discountValues: [
      {
        nights: 7,
        value: 10,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
      },
      {
        nights: 14,
        value: 15,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
      },
    ],
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    conditions: [
      "Valid for all room types",
      "Subject to availability",
      "Blackout dates may apply",
    ],
    minimumNights: 7,
    blackoutDates: ["2024-07-15", "2024-07-16", "2024-07-17", "2024-08-15"],
    bookingWindow: {
      start: "2024-01-01", // Early booking for summer
      end: "2024-08-15", // Ends before offer end to ensure full stay period
    },
  },
  // Add these to initialOffers array
  {
    id: 5,
    code: "WINTER24",
    name: "Winter Escape",
    type: "combinable",
    description: "Special winter rates with flexible booking window",
    discountType: "percentage",
    discountValues: [
      {
        nights: 7,
        value: 25,
        startDate: "2024-11-01",
        endDate: "2024-12-20",
      },
      {
        nights: 14,
        value: 30,
        startDate: "2024-11-01",
        endDate: "2024-12-20",
      },
    ],
    startDate: "2024-11-01",
    endDate: "2024-12-20",
    conditions: [
      "Applicable to all room categories",
      "Subject to availability",
      "Full prepayment required",
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2024-08-01",
      end: "2024-10-31",
    },
  },
  {
    id: 6,
    code: "FLASH24",
    name: "Flash Sale",
    type: "cumulative",
    description: "72-hour flash sale with exceptional savings",
    discountType: "percentage",
    discountValues: [
      {
        nights: 5,
        value: 35,
        startDate: "2024-04-01",
        endDate: "2024-10-31",
      },
    ],
    startDate: "2024-04-01",
    endDate: "2024-10-31",
    conditions: [
      "Must book within 72-hour sale period",
      "Non-refundable",
      "Non-modifiable",
    ],
    minimumNights: 5,
    bookingWindow: {
      start: "2024-03-15",
      end: "2024-03-18",
    },
    blackoutDates: ["2024-07-01", "2024-07-02", "2024-07-03", "2024-07-04"],
  },
  {
    id: 7,
    code: "ADVANCE25",
    name: "Advanced Purchase 25",
    type: "combinable",
    description: "25% off for early planners",
    discountType: "percentage",
    discountValues: [
      {
        nights: 3,
        value: 25,
      },
    ],
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    conditions: [
      "Must book 45 days in advance",
      "Full prepayment at time of booking",
      "Non-refundable",
    ],
    minimumNights: 3,
    bookingWindow: {
      start: "2024-01-01",
      end: "2024-11-15",
    },
  },
];
