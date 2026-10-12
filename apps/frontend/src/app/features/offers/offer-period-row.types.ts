import { OfferPeriodDto } from '@runner/shared/types';

export type PeriodStatus = 'UNCHANGED' | 'CREATED' | 'UPDATED' | 'DELETED';

export interface PeriodRow {
  readonly clientKey: string;
  readonly serverId?: string;
  readonly data: OfferPeriodDto;
  readonly status: PeriodStatus;
}
