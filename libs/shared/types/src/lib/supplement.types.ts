export type SupplementUnit =
  | 'PER_PERSON_PER_NIGHT'
  | 'PER_PERSON_PER_STAY'
  | 'PER_ROOM_PER_NIGHT'
  | 'PER_ROOM_PER_STAY';

export interface Supplement {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: SupplementUnit;
  canReceiveDiscount: boolean;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementDto {
  name: string;
  description?: string;
  price: number;
  unit: SupplementUnit;
  canReceiveDiscount: boolean;
}
