// src/data/mock/seasons.mock.ts
import { Season, SeasonType } from '../../models/types';

export const seasons: { [hotelId: number]: Season[] } = {
  // Grand Hotel Riveria (ID: 1)
  1: [
    {
      id: 1,
      name: 'Peak Season 2025',
      type: SeasonType.PEAK,
      description: 'Main season with premium rates',
      isActive: true,
      periods: [
        {
          id: 1,
          seasonId: 1,
          name: 'Early Peak Period',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          mlos: 3,
          description: 'Early peak period with premium rates'
        },
        {
          id: 2,
          seasonId: 1,
          name: 'Mid Peak Period',
          startDate: '2025-04-01',
          endDate: '2025-06-30',
          mlos: 3,
          description: 'Mid peak period with standard rates'
        },
        {
          id: 3,
          seasonId: 1,
          name: 'Late Peak Period',
          startDate: '2025-07-01',
          endDate: '2025-09-30',
          mlos: 3,
          description: 'Late peak period with special rates'
        }
      ]
    },
    {
      id: 2,
      name: 'Winter Season 2025-2026',
      type: SeasonType.SHOULDER,
      description: 'Winter season including festive period',
      isActive: true,
      periods: [
        {
          id: 4,
          seasonId: 2,
          name: 'Early Winter',
          startDate: '2025-10-01',
          endDate: '2025-12-19',
          mlos: 3,
          description: 'Early winter period with standard rates'
        },
        {
          id: 5,
          seasonId: 2,
          name: 'Festive Period',
          startDate: '2025-12-20',
          endDate: '2026-01-05',
          mlos: 7,
          description: 'Christmas and New Year period'
        },
        {
          id: 6,
          seasonId: 2,
          name: 'Mid Winter',
          startDate: '2026-01-06',
          endDate: '2026-02-28',
          mlos: 3,
          description: 'Mid winter period with special rates'
        }
      ]
    }
  ],

  // Maldives Paradise Resort (ID: 2)
  2: [
    {
      id: 3,
      name: 'High Season 2025',
      type: SeasonType.PEAK,
      description: 'January to April - Dry Season',
      isActive: true,
      periods: [
        {
          id: 7,
          seasonId: 3,
          name: 'Peak Season',
          startDate: '2025-01-10',
          endDate: '2025-03-15',
          mlos: 5,
          description: 'Main peak season'
        },
        {
          id: 8,
          seasonId: 3,
          name: 'Late Peak',
          startDate: '2025-03-16',
          endDate: '2025-04-30',
          mlos: 4,
          description: 'Late peak season'
        }
      ]
    },
    {
      id: 4,
      name: 'Green Season 2025',
      type: SeasonType.LOW,
      description: 'May to November - Monsoon Season',
      isActive: true,
      periods: [
        {
          id: 9,
          seasonId: 4,
          name: 'Early Monsoon',
          startDate: '2025-05-01',
          endDate: '2025-06-30',
          mlos: 3,
          description: 'Early monsoon season with special rates'
        },
        {
          id: 10,
          seasonId: 4,
          name: 'Mid Monsoon',
          startDate: '2025-07-01',
          endDate: '2025-08-31',
          mlos: 3,
          description: 'Mid monsoon season with promotional rates'
        },
        {
          id: 11,
          seasonId: 4,
          name: 'Late Monsoon',
          startDate: '2025-09-01',
          endDate: '2025-10-15',
          mlos: 3,
          description: 'Late monsoon season with special offers'
        },
        {
          id: 12,
          seasonId: 4,
          name: 'Pre-Peak',
          startDate: '2025-10-16',
          endDate: '2025-11-30',
          mlos: 3,
          description: 'Transition period before peak season'
        }
      ]
    },
    {
      id: 5,
      name: 'Festive Season 2025-2026',
      type: SeasonType.PEAK,
      description: 'December to January - Festive Season',
      isActive: true,
      periods: [
        {
          id: 13,
          seasonId: 5,
          name: 'Pre-Festive',
          startDate: '2025-12-01',
          endDate: '2025-12-19',
          mlos: 3,
          description: 'Lead up to holiday season'
        },
        {
          id: 14,
          seasonId: 5,
          name: 'Peak Festive',
          startDate: '2025-12-20',
          endDate: '2026-01-05',
          mlos: 7,
          description: 'Christmas and New Year period'
        },
        {
          id: 15,
          seasonId: 5,
          name: 'Post-Festive',
          startDate: '2026-01-06',
          endDate: '2026-01-15',
          mlos: 3,
          description: 'Transition period after New Year'
        }
      ]
    }
  ],
  
  // Le Tropical Paradise Resort & Spa (ID: 3)
  3: [
    {
      id: 6,
      name: 'High Season 2025',
      type: SeasonType.PEAK,
      description: 'Peak tourist season with optimal weather conditions',
      isActive: true,
      periods: [
        {
          id: 16,
          seasonId: 6,
          name: 'Early High Season',
          startDate: '2025-01-10',
          endDate: '2025-03-31',
          mlos: 3,
          description: 'Start of the dry season with perfect weather'
        },
        {
          id: 17,
          seasonId: 6,
          name: 'Easter Holiday',
          startDate: '2025-04-01',
          endDate: '2025-04-15',
          mlos: 5,
          description: 'Easter holiday period with premium rates'
        },
        {
          id: 18,
          seasonId: 6,
          name: 'Late High Season',
          startDate: '2025-04-16',
          endDate: '2025-05-31',
          mlos: 3,
          description: 'End of high season with favorable weather'
        }
      ]
    },
    {
      id: 7,
      name: 'Tropical Season 2025',
      type: SeasonType.SHOULDER,
      description: 'Green season with occasional rainfall and special offers',
      isActive: true,
      periods: [
        {
          id: 19,
          seasonId: 7,
          name: 'Early Tropical',
          startDate: '2025-06-01',
          endDate: '2025-07-31',
          mlos: 2,
          description: 'Beginning of tropical season with moderate rates'
        },
        {
          id: 20,
          seasonId: 7,
          name: 'Mid Tropical',
          startDate: '2025-08-01',
          endDate: '2025-09-30',
          mlos: 2,
          description: 'Mid tropical season with special promotions'
        },        
        {
          id: 21,
          seasonId: 7,
          name: 'Late Tropical',
          startDate: '2025-10-01',
          endDate: '2025-11-30',
          mlos: 2,
          description: 'End of tropical season with attractive rates'
        }
      ]
    },
    {
      id: 8,
      name: 'Festive Season 2025-2026',
      type: SeasonType.PEAK,
      description: 'Holiday season with premium rates and special events',
      isActive: true,
      periods: [
        {
          id: 22,
          seasonId: 8,
          name: 'Pre-Festive',
          startDate: '2025-12-01',
          endDate: '2025-12-19',
          mlos: 3,
          description: 'Lead up to holiday season'
        },
        {
          id: 23,
          seasonId: 8,
          name: 'Peak Festive',
          startDate: '2025-12-20',
          endDate: '2026-01-05',
          mlos: 7,
          description: 'Christmas and New Year period with premium rates'
        },
        {
          id: 24,
          seasonId: 8,
          name: 'Post-Festive',
          startDate: '2026-01-06',
          endDate: '2026-01-15',
          mlos: 3,
          description: 'Transition period after New Year'
        }
      ]
    }
  ]
};
