export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonDto {
  name: string;
  startDate: string;
  endDate: string;
}
