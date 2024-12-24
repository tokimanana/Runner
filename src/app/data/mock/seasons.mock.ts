// src/data/mock/seasons.mock.ts
import { Season, SeasonType } from '../../models/types';

export const seasons: { [hotelId: number]: Season[] } = {
  // Grand Hotel Riveria (ID: 1)
  1: [
    {
      id: 1,
      name: 'Current Season 2024',
      type: SeasonType.PEAK,
      description: 'Current season with premium rates',
      isActive: true,
      periods: [
        {
          id: 1,
          seasonId: 1,
          name: 'Current Period',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          mlos: 3,
          description: 'Current period with standard rates'
        }
      ]

    },
    {
      id: 2,
      name: 'Winter Season 2024-2025',
      type: SeasonType.SHOULDER,
      description: 'Winter season including festive period',
      isActive: true,
      periods: [
        {
          id: 5,
          seasonId: 2,
          name: 'Early Winter',
          startDate: '2024-11-01',
          endDate: '2024-12-19',
          mlos: 3,
          description: 'Early winter period with standard rates'
        },
        {
          id: 6,
          seasonId: 2,
          name: 'Festive Period',
          startDate: '2024-12-20',
          endDate: '2025-01-05',
          mlos: 7,
          description: 'Christmas and New Year period'
        },
        {
          id: 7,
          seasonId: 2,
          name: 'Mid Winter',
          startDate: '2025-01-06',
          endDate: '2025-02-28',
          mlos: 3,
          description: 'Mid winter period with special rates'
        },
        {
          id: 8,
          seasonId: 2,
          name: 'Late Winter',
          startDate: '2025-03-01',
          endDate: '2025-04-30',
          mlos: 3,
          description: 'Late winter period with shoulder season rates'
        }
      ]
    }
  ],

  // Maldives Paradise Resort (ID: 2)
  2: [
    {
      id: 3,
      name: 'High Season 2024',
      type: SeasonType.PEAK,
      description: 'January to April - Dry Season',
      isActive: true,
      periods: [
        {
          id: 9,
          seasonId: 3,
          name: 'Peak Season',
          startDate: '2024-01-10',
          endDate: '2024-03-15',
          mlos: 5,
          description: 'Main peak season'
        },
        {
          id: 10,
          seasonId: 3,
          name: 'Late Peak',
          startDate: '2024-03-16',
          endDate: '2024-04-30',
          mlos: 4,
          description: 'Late peak season'
        }
      ]
    },
    {
      id: 4,
      name: 'Green Season 2024',
      type: SeasonType.LOW,
      description: 'May to November - Monsoon Season',
      isActive: true,
      periods: [
        {
          id: 11,
          seasonId: 4,
          name: 'Early Monsoon',
          startDate: '2024-05-01',
          endDate: '2024-06-30',
          mlos: 3,
          description: 'Early monsoon season with special rates'
        },
        {
          id: 12,
          seasonId: 4,
          name: 'Mid Monsoon',
          startDate: '2024-07-01',
          endDate: '2024-08-31',
          mlos: 3,
          description: 'Mid monsoon season with promotional rates'
        },
        {
          id: 13,
          seasonId: 4,
          name: 'Late Monsoon',
          startDate: '2024-09-01',
          endDate: '2024-10-15',
          mlos: 3,
          description: 'Late monsoon season with special offers'
        },
        {
          id: 14,
          seasonId: 4,
          name: 'Pre-Peak',
          startDate: '2024-10-16',
          endDate: '2024-11-30',
          mlos: 3,
          description: 'Transition period before peak season'
        }
      ]
    },
    {
      id: 5,
      name: 'Festive Season 2024-2025',
      type: SeasonType.PEAK,
      description: 'December to January - Festive Season',
      isActive: true,
      periods: [
        {
          id: 15,
          seasonId: 5,
          name: 'Pre-Festive',
          startDate: '2024-12-01',
          endDate: '2024-12-19',
          mlos: 3,
          description: 'Lead up to holiday season'
        },
        {
          id: 16,
          seasonId: 5,
          name: 'Peak Festive',
          startDate: '2024-12-20',
          endDate: '2025-01-05',
          mlos: 7,
          description: 'Christmas and New Year period'
        },
        {
          id: 17,
          seasonId: 5,
          name: 'Post-Festive',
          startDate: '2025-01-06',
          endDate: '2025-01-09',
          mlos: 3,
          description: 'Transition period after New Year'
        }
      ]
    }
  ],
  
  // Le Tropical Paradise Resort & Spa (ID: 3)
  3: [
    {
      id: 1,
      name: 'High Season 2024',
      type: SeasonType.PEAK,
      description: 'Peak tourist season with optimal weather conditions',
      isActive: true,
      periods: [
        {
          id: 1,
          seasonId: 1,
          name: 'Early High Season',
          startDate: '2024-01-10',
          endDate: '2024-03-31',
          mlos: 3,
          description: 'Start of the dry season with perfect weather'
        },
        {
          id: 2,
          seasonId: 1,
          name: 'Easter Holiday',
          startDate: '2024-04-01',
          endDate: '2024-04-15',
          mlos: 5,
          description: 'Easter holiday period with premium rates'
        },
        {
          id: 3,
          seasonId: 1,
          name: 'Late High Season',
          startDate: '2024-04-16',
          endDate: '2024-05-31',
          mlos: 3,
          description: 'End of high season with favorable weather'
        }
      ]
    },
    {
      id: 2,
      name: 'Tropical Season 2024',
      type: SeasonType.SHOULDER,
      description: 'Green season with occasional rainfall and special offers',
      isActive: true,
      periods: [
        {
          id: 4,
          seasonId: 2,
          name: 'Early Tropical',
          startDate: '2024-06-01',
          endDate: '2024-07-31',
          mlos: 2,
          description: 'Beginning of tropical season with moderate rates'
        },
        {
          id: 5,
          seasonId: 2,
          name: 'Mid Tropical',
          startDate: '2024-08-01',
          endDate: '2024-09-30',
          mlos: 2,
          description: 'Mid tropical season with special promotions'
        },
        {
          id: 6,
          seasonId: 2,
          name: 'Late Tropical',
          startDate: '2024-10-01',
          endDate: '2024-11-30',
          mlos: 2,
          description: 'End of tropical season with attractive rates'
        }
      ]
    },
    {
      id: 3,
      name: 'Festive Season 2024-2025',
      type: SeasonType.PEAK,
      description: 'Holiday season with premium rates and special events',
      isActive: true,
      periods: [
        {
          id: 7,
          seasonId: 3,
          name: 'Pre-Festive',
          startDate: '2024-12-01',
          endDate: '2024-12-19',
          mlos: 3,
          description: 'Lead up to holiday season'
        },
        {
          id: 8,
          seasonId: 3,
          name: 'Peak Festive',
          startDate: '2024-12-20',
          endDate: '2025-01-05',
          mlos: 7,
          description: 'Christmas and New Year period with premium rates'
        },
        {
          id: 9,
          seasonId: 3,
          name: 'Post-Festive',
          startDate: '2025-01-06',
          endDate: '2025-01-09',
          mlos: 3,
          description: 'Transition period after New Year'
        }
      ]
    }
  ]
};
