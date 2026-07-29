import {
  ContractPeriodDto,
  RoomPriceDto,
  SharingType,
} from '@runner/shared/types';

export interface LocalContractPeriod
  extends Omit<ContractPeriodDto, 'startDate' | 'endDate'> {
  tempId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface LocalBaseRate {
  halfDouble: number | null;
  single: number | null;
  thirdPersonAdult: number | null;
  triple: number | null;
  quadruple: number | null;
}

export function emptyBaseRate(): LocalBaseRate {
  return {
    halfDouble: null,
    single: null,
    thirdPersonAdult: null,
    triple: null,
    quadruple: null,
  };
}

export interface LocalRoomPrice extends Omit<RoomPriceDto, 'occupancyRates'> {
  tempId: string;
  periodTempId: string;
  baseRate: LocalBaseRate | null;
}

export interface LocalAgePolicyEntry {
  tempId: string;
  periodTempId: string;
  ageCategoryId: string;
  sharingType: SharingType;
  value: number | null;
}
