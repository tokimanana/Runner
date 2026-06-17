import { Injectable } from '@nestjs/common';
import { ContractRepository } from './repositories/contract.repository';

@Injectable()
export class ContractsService {
  constructor(private readonly contractRepository: ContractRepository) {}
}
