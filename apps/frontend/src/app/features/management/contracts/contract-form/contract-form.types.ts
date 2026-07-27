import { ContractPeriodDto, RoomPriceDto } from '@runner/shared/types';

export interface LocalContractPeriod
  extends Omit<ContractPeriodDto, 'startDate' | 'endDate'> {
  tempId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface LocalOccupancyRate {
  numAdults: number;
  numChildren: number;
  ratesPerAge: Record<string, number>;
}

export interface LocalRoomPrice extends Omit<RoomPriceDto, 'occupancyRates'> {
  tempId: string;
  periodTempId: string;
  occupancyRates: LocalOccupancyRate[];
}
