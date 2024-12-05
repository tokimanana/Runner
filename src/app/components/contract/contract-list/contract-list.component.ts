import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Contract } from '../../../models/types';
import { HotelService } from '../../../services/hotel.service';
import { MarketService } from '../../../services/market.service';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css']
})
export class ContractListComponent {
  @Input() contracts: Contract[] = [];
  @Output() contractSelected = new EventEmitter<Contract>();
  @Output() createNew = new EventEmitter<void>();

  displayedColumns = [
    'name',
    'hotel',
    'market',
    'validFrom',
    'validTo',
    'status',
    'actions'
  ];

  constructor(
    private hotelService: HotelService,
    private marketService: MarketService
  ) {}

  getHotelName(hotelId: number): string {
    return this.hotelService.getHotelName(hotelId) || 'Unknown Hotel';
  }

  getMarketName(marketId: number): string {
    return this.marketService.getMarketName(marketId) || 'Unknown Market';
  }

  onSelect(contract: Contract): void {
    this.contractSelected.emit(contract);
  }

  onCreateNewClick(): void {
    this.createNew.emit();
  }
}
