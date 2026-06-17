import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @IsString()
  @IsNotEmpty()
  marketId: string;

  @IsString()
  @IsNotEmpty()
  currencyId: string;
}

// export interface Contract {
//   id: string;
//   name: string;
//   hotelId: string;
//   marketId: string;
//   currencyId: string;
//   tourOperatorId: string;
//   hotel?: { id: string; name: string };
//   market?: { id: string; name: string };
//   currency?: { id: string; code: string; symbol: string };
//   periods?: ContractPeriod[];
//   createdAt: string;
//   updatedAt: string;
// }
