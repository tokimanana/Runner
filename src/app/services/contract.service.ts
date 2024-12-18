// src/app/services/contract.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { Contract, ContractRate, ContractPeriodRate, RateConfiguration, ContractStatus } from '../models/types';
import { MockApiService } from './mock/mock-api.service';
import { BaseDataService } from './base-data.service';

interface PaginatedContracts {
  contracts: Contract[];
  total: number;
}

// Define allowed filter keys
type ContractFilterKeys = 'name' | 'status' | 'hotelId' | 'marketId'; 

// Define the filter type
type ContractFilters = {
  [K in ContractFilterKeys]?: Contract[K];
}

@Injectable({
  providedIn: 'root'
})
export class ContractService extends BaseDataService<Contract> {
  protected override dataSubject = new BehaviorSubject<Contract[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  
  data$ = this.dataSubject.asObservable();
  total$ = this.totalSubject.asObservable();
  constructor() {
    super();
    this.loadContracts();
  }

  async loadContracts(pageSize: number = 10, pageIndex: number = 0): Promise<void> {
    try {
      const result = await MockApiService.getContracts(pageSize, pageIndex);
      this.dataSubject.next(result.contracts);
      this.totalSubject.next(result.total);
    } catch (error) {
      this.handleError('Failed to load contracts', error);
    }
  }

  getContracts(
    pageSize: number = 10, 
    pageIndex: number = 0, 
    filters?: ContractFilters
  ): Observable<Contract[]> {
    return from(MockApiService.getContracts(pageSize, pageIndex))
      .pipe(
        map(result => {
          let contracts = result.contracts;
          
          if (filters) {
            contracts = this.applyFilters(contracts, filters);
          }
          
          return contracts;
        })
      );
  }

  private applyFilters(contracts: Contract[], filters: ContractFilters): Contract[] {
    return contracts.filter(contract => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        return contract[key as keyof Contract] === value;
      });
    });
  }

  getTotalContracts(): Observable<number> {
    return this.total$;
  }

  async createContract(contract: Omit<Contract, 'id'>): Promise<Contract> {
    try {
      if (!this.validateContract(contract as Contract)) {
        throw new Error('Invalid contract data');
      }
      const newContract = await MockApiService.createContract(contract);
      const currentContracts = this.dataSubject.value;
      this.dataSubject.next([...currentContracts, newContract]);
      this.totalSubject.next(this.totalSubject.value + 1);
      return newContract;
    } catch (error) {
      this.handleError('Error creating contract', error);
      throw error;
    }
  }

  // In ContractService or similar service
  private validateContract(contract: Contract): boolean {

    // Validate that room types and meal plans are selected
    if (!contract.selectedRoomTypes.length || !contract.selectedMealPlans.length) {
      return false;
    }

    return true;
  }



  async updateContract(id: number, updates: Partial<Contract>): Promise<Contract> {
    try {
      const updatedContract = await MockApiService.updateContract(id, updates);
      const currentContracts = this.dataSubject.value;
      const index = currentContracts.findIndex(c => c.id === id);
      
      if (index !== -1) {
        currentContracts[index] = updatedContract;
        this.dataSubject.next([...currentContracts]);
      }
      return updatedContract;
    } catch (error) {
      this.handleError('Error updating contract', error);
      throw error;
    }
  }

  async deleteContract(id: number): Promise<void> {
    try {
      await MockApiService.deleteContract(id);
      const currentContracts = this.dataSubject.value;
      this.dataSubject.next(currentContracts.filter(c => c.id !== id));
      this.totalSubject.next(this.totalSubject.value - 1);
    } catch (error) {
      this.handleError('Error deleting contract', error);
      throw error;
    }
  }

  getContractsByHotel(hotelId: number): Observable<Contract[]> {
    return this.data$.pipe(
      map(contracts => contracts.filter(c => c.hotelId === hotelId))
    );
  }
  // Helper methods
  getContractById(id: number): Observable<Contract | null> {
    return from(MockApiService.getContractById(id));
  }

  protected override handleError(message: string, error: any): void {
    console.error('Contract service error:', message, error);
    super.handleError(message, error);
  }

  // Reset to initial state
  async resetContracts(): Promise<void> {
    try {
      await MockApiService.resetDataForType('CONTRACTS');
      await this.loadContracts();
    } catch (error) {
      this.handleError('Failed to reset contracts', error);
      throw error;
    }
  }

  async updateContractStatus(id: number, contract: Contract): Promise<Contract> {
    let newStatus: ContractStatus;
    
    // Check if rates are not configured
    if (!contract.isRatesConfigured) {
      newStatus = 'draft';
    } 
    // Check if contract period is expired
    else if (contract.validityPeriod && new Date(contract.validityPeriod.endDate) < new Date()) {
      newStatus = 'expired';
    } 
    // Contract has rates and is within validity period
    else {
      newStatus = 'active';
    }
    return this.updateContract(id, { status: newStatus });
  }
  
}
