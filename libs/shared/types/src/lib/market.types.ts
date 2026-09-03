export interface Market {
  id: string;
  code: string;
  name: string;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketDto {
  code: string;
  name: string;
}
