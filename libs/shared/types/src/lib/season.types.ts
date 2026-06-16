export interface Season {
  id: string;
  name: string;
  tourOperatorId: string;
  seasonPeriods?: SeasonPeriod[];
  createdAt: string;
  updatedAt: string;
}

export interface SeasonDto {
  name: string;
}

export interface SeasonPeriod {
  id: string;
  seasonId: string;
  name: string;
  startDate: string;
  endDate: string;
  season?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}
export interface SeasonPeriodDto {
  name: string;
  startDate: string;
  endDate: string;
}
