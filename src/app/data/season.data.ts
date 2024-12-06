import { Season, Period } from '../models/types';

// Types spécifiques aux saisons
export enum SeasonType {
  PEAK = 'peak',
  SHOULDER = 'shoulder',
  LOW = 'low'
}

export interface SeasonPeriodConfig {
  name: string;
  startDate: string;
  endDate: string;
  mlos: number;
  description?: string;
  isBlackout?: boolean;
}

export interface SeasonConfig {
  name: string;
  type: SeasonType;
  description: string;
  isActive: boolean;
  periods: SeasonPeriodConfig[];
}

// Configuration des saisons par hôtel
export const hotelSeasonConfigs: { [hotelId: number]: SeasonConfig[] } = {
  // Grand Hotel Riveria (ID: 1)
  1: [
    {
      name: 'Summer Season 2024',
      type: SeasonType.PEAK,
      description: 'Peak summer season with premium rates',
      isActive: true,
      periods: [
        {
          name: 'Early Summer',
          startDate: '2024-05-01',
          endDate: '2024-06-14',
          mlos: 3,
          description: 'Early summer period with moderate rates'
        },
        {
          name: 'High Summer',
          startDate: '2024-06-15',
          endDate: '2024-09-15',
          mlos: 5,
          description: 'Peak summer period with premium rates'
        },
        {
          name: 'Late Summer',
          startDate: '2024-09-16',
          endDate: '2024-10-31',
          mlos: 3,
          description: 'Late summer period with moderate rates'
        }
      ]
    },
    {
      name: 'Winter Season 2024',
      type: SeasonType.SHOULDER,
      description: 'Winter season including festive period',
      isActive: true,
      periods: [
        {
          name: 'Festive Period',
          startDate: '2024-12-20',
          endDate: '2025-01-05',
          mlos: 7,
          description: 'Christmas and New Year period'
        }
      ]
    }
  ],
  
  // Maldives Paradise Resort (ID: 2)
  2: [
    {
      name: 'High Season 2024',
      type: SeasonType.PEAK,
      description: 'December to April - Dry Season',
      isActive: true,
      periods: [
        {
          name: 'Peak Winter',
          startDate: '2023-12-01',
          endDate: '2023-12-19',
          mlos: 3,
          description: 'Early peak season'
        },
        {
          name: 'Festive Period',
          startDate: '2023-12-20',
          endDate: '2024-01-10',
          mlos: 7,
          description: 'Christmas and New Year period'
        },
        {
          name: 'Peak Season',
          startDate: '2024-01-11',
          endDate: '2024-04-30',
          mlos: 4,
          description: 'Main peak season'
        }
      ]
    },
    {
      name: 'Green Season 2024',
      type: SeasonType.LOW,
      description: 'May to November - Monsoon Season',
      isActive: true,
      periods: [
        {
          name: 'Spring Promotion',
          startDate: '2024-05-01',
          endDate: '2024-07-31',
          mlos: 3,
          description: 'Early monsoon season with special rates'
        },
        {
          name: 'Autumn Promotion',
          startDate: '2024-08-01',
          endDate: '2024-11-30',
          mlos: 3,
          description: 'Late monsoon season with special rates'
        }
      ]
    }
  ]
};

// Fonction utilitaire pour générer les IDs
function generateIds(config: SeasonConfig[]): Season[] {
  let seasonId = 1;
  let periodId = 1;

  return config.map(seasonConfig => {
    const periods: Period[] = seasonConfig.periods.map(periodConfig => ({
      id: periodId++,
      seasonId: seasonId,
      name: periodConfig.name,
      startDate: periodConfig.startDate,
      endDate: periodConfig.endDate,
      mlos: periodConfig.mlos,
      description: periodConfig.description,
      isBlackout: periodConfig.isBlackout || false
    }));

    const season: Season = {
      id: seasonId++,
      name: seasonConfig.name,
      description: seasonConfig.description,
      isActive: seasonConfig.isActive,
      periods
    };

    return season;
  });
}

// Données initiales avec IDs générés
export const initialSeasonData = new Map(
  Object.entries(hotelSeasonConfigs).map(([hotelId, config]) => [
    parseInt(hotelId),
    generateIds(config)
  ])
);
