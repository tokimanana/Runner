// src/data/mock/seasons.mock.ts
import { Season, SeasonType } from '../../models/types';

export const seasons: { [hotelId: number]: Season[] } = {
  // Grand Hotel Riveria (ID: 1)
  1: [
    {
      id: 1,
      name: 'Summer Season 2024',
      type: SeasonType.PEAK,
      description: 'Peak summer season with premium rates',
      isActive: true,
      periods: [
        {
          id: 1,
          seasonId: 1,
          name: 'Early Summer',
          startDate: '2024-05-01',
          endDate: '2024-06-14',
          mlos: 3,
          description: 'Early summer period with moderate rates'
        },
        {
          id: 2,
          seasonId: 1,
          name: 'Mid Summer',
          startDate: '2024-06-15',
          endDate: '2024-07-31',
          mlos: 5,
          description: 'Peak summer period with premium rates'
        },
        {
          id: 3,
          seasonId: 1,
          name: 'High Summer',
          startDate: '2024-08-01',
          endDate: '2024-09-15',
          mlos: 5,
          description: 'High season with premium rates'
        },
        {
          id: 4,
          seasonId: 1,
          name: 'Late Summer',
          startDate: '2024-09-16',
          endDate: '2024-10-31',
          mlos: 3,
          description: 'Late summer period with moderate rates'
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
      id: 1,
      name: 'High Season 2024',
      type: SeasonType.PEAK,
      description: 'December to April - Dry Season',
      isActive: true,
      periods: [
        {
          id: 1,
          seasonId: 1,
          name: 'Early Peak',
          startDate: '2023-12-01',
          endDate: '2023-12-19',
          mlos: 3,
          description: 'Early peak season'
        },
        {
          id: 2,
          seasonId: 1,
          name: 'Festive Period',
          startDate: '2023-12-20',
          endDate: '2024-01-10',
          mlos: 7,
          description: 'Christmas and New Year period'
        },
        {
          id: 3,
          seasonId: 1,
          name: 'Peak Season',
          startDate: '2024-01-11',
          endDate: '2024-03-15',
          mlos: 5,
          description: 'Main peak season'
        },
        {
          id: 4,
          seasonId: 1,
          name: 'Late Peak',
          startDate: '2024-03-16',
          endDate: '2024-04-30',
          mlos: 4,
          description: 'Late peak season'
        }
      ]
    },
    {
      id: 2,
      name: 'Green Season 2024',
      type: SeasonType.LOW,
      description: 'May to November - Monsoon Season',
      isActive: true,
      periods: [
        {
          id: 5,
          seasonId: 2,
          name: 'Early Monsoon',
          startDate: '2024-05-01',
          endDate: '2024-06-30',
          mlos: 3,
          description: 'Early monsoon season with special rates'
        },
        {
          id: 6,
          seasonId: 2,
          name: 'Mid Monsoon',
          startDate: '2024-07-01',
          endDate: '2024-08-31',
          mlos: 3,
          description: 'Mid monsoon season with promotional rates'
        },
        {
          id: 7,
          seasonId: 2,
          name: 'Late Monsoon',
          startDate: '2024-09-01',
          endDate: '2024-10-15',
          mlos: 3,
          description: 'Late monsoon season with special offers'
        },
        {
          id: 8,
          seasonId: 2,
          name: 'Pre-Peak',
          startDate: '2024-10-16',
          endDate: '2024-11-30',
          mlos: 3,
          description: 'Transition period before peak season'
        }
      ]
    }
  ]
};
