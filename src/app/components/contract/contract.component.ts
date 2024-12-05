import { ContractFormComponent } from './contract-form/contract-form.component';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ContractService } from '../../services/contract.service';
import { HotelService } from '../../services/hotel.service';
import { Contract, Hotel } from '../../models/types';
import { ContractListComponent } from './contract-list/contract-list.component';
import { ContractRatesComponent } from './contract-rates/contract-rates.component';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ContractFormComponent,
    ContractRatesComponent,
    ContractListComponent
  ]
})
export class ContractComponent implements OnInit {
  @Input() set hotel(value: Hotel) {
    this._hotel = value;
    if (value) {
      this.selectedHotel = value;
      this.loadContracts(value.id);
    }
  }
  get hotel(): Hotel {
    return this._hotel;
  }
  private _hotel!: Hotel;

  contracts: Contract[] = [];
  selectedContract: Contract | null = null;
  selectedHotel: Hotel | null = null;

  constructor(
    private contractService: ContractService,
    private hotelService: HotelService
  ) {}

  ngOnInit() {
    // Only subscribe to hotel changes if no hotel is provided via input
    if (!this._hotel) {
      this.hotelService.selectedHotel$.subscribe(hotel => {
        if (hotel) {
          this.selectedHotel = hotel;
          this.loadContracts(hotel.id);
        }
      });
    }

    this.contractService.getCurrentContract().subscribe(contract => {
      this.selectedContract = contract;
    });
  }

  private loadContracts(hotelId: number) {
    this.contractService.getContracts().subscribe(contracts => {
      this.contracts = contracts.filter(c => c.hotelId === hotelId);
    });
  }

  onContractSelected(contract: Contract) {
    this.contractService.setCurrentContract(contract);
  }

  onCreateNew() {
    this.contractService.setCurrentContract(null);
  }

  async onContractSaved(contract: Contract) {
    try {
      if (contract.id) {
        await this.contractService.updateContract(contract);
      } else {
        await this.contractService.createContract(contract);
      }
      // Reload contracts after save
      this.loadContracts(this.selectedHotel!.id);
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  }

  async onRatesSaved(contract: Contract) {
    try {
      await this.contractService.updateContract(contract);
      // Reload contracts after save
      this.loadContracts(this.selectedHotel!.id);
    } catch (error) {
      console.error('Error saving rates:', error);
    }
  }
}
