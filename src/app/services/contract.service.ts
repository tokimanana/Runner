import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Contract, ContractRate, ContractPeriodRate } from '../models/types';
import { defaultContracts as contracts } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private contracts = contracts;

  getContracts(): Observable<Contract[]> {
    return of(this.contracts);
  }

  getContract(id: number): Observable<Contract | undefined> {
    return of(this.contracts.find(contract => contract.id === id));
  }

  createContract(contract: Omit<Contract, 'id'>): Observable<Contract> {
    const newId = Math.max(...this.contracts.map(c => c.id)) + 1;
    const newContract = { ...contract, id: newId };
    this.contracts.push(newContract);
    return of(newContract);
  }

  updateContract(id: number, contract: Partial<Contract>): Observable<Contract | undefined> {
    const index = this.contracts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contracts[index] = { ...this.contracts[index], ...contract };
      return of(this.contracts[index]);
    }
    return of(undefined);
  }

  deleteContract(id: number): Observable<boolean> {
    const index = this.contracts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contracts.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Contract Rates Methods
  getContractRates(contractId: number): Observable<ContractPeriodRate[]> {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    return of(contract.periodRates || []);
  }

  updateContractRates(contractId: number, rates: ContractPeriodRate[]): Observable<ContractPeriodRate[]> {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    contract.periodRates = rates;
    return of(rates);
  }
}
