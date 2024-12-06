import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Contract, Hotel, Market, Season, Period } from '../../../../models/types';
import { ContractService } from '../../../../services/contract.service';
import { HotelService } from '../../../../services/hotel.service';
import { MarketService } from '../../../../services/market.service';
import { SeasonService } from '../../../../services/season.service';
import { firstValueFrom, combineLatest } from 'rxjs';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
  standalone: true,
  imports: [
    // Add necessary imports
  ]
})
export class ContractListComponent implements OnInit {
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  hotels: { [id: number]: Hotel } = {};
  markets: { [id: number]: Market } = {};
  seasons: Season[] = [];
  periods: { [seasonId: number]: Period[] } = {};
  
  displayedColumns: string[] = [
    'name',
    'hotel',
    'market',
    'season',
    'validFrom',
    'validTo',
    'status',
    'actions'
  ];

  filterCriteria = {
    hotel: '',
    market: '',
    season: '',
    status: '',
    dateRange: null
  };

  constructor(
    private contractService: ContractService,
    private hotelService: HotelService,
    private marketService: MarketService,
    private seasonService: SeasonService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    // Load hotels
    const hotel = await firstValueFrom(this.hotelService.selectedHotel$);
    if (hotel) {
      this.hotels[hotel.id] = hotel;
      
      // Load seasons for the hotel
      const seasons = await firstValueFrom(this.seasonService.getSeasonsByHotel(hotel.id));
      this.seasons = seasons;
      
      // Load periods for each season
      for (const season of seasons) {
        const periods = await firstValueFrom(this.seasonService.getPeriodsBySeason(season.id));
        if (periods) {
          this.periods[season.id] = periods;
        }
      }
    }

    // Load markets
    const markets = await this.marketService.getMarkets();
    markets.forEach(market => {
      this.markets[market.id] = market;
    });

    // Load contracts
    this.contracts = await this.contractService.getContracts();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredContracts = this.contracts.filter(contract => {
      let matches = true;

      if (this.filterCriteria.hotel) {
        matches = matches && contract.hotelId.toString() === this.filterCriteria.hotel;
      }

      if (this.filterCriteria.market) {
        matches = matches && contract.marketId.toString() === this.filterCriteria.market;
      }

      if (this.filterCriteria.season) {
        matches = matches && contract.seasonId.toString() === this.filterCriteria.season;
      }

      if (this.filterCriteria.status) {
        matches = matches && contract.status === this.filterCriteria.status;
      }

      if (this.filterCriteria.dateRange) {
        const validFrom = new Date(contract.validFrom);
        const validTo = new Date(contract.validTo);
        const filterStart = new Date(this.filterCriteria.dateRange.start);
        const filterEnd = new Date(this.filterCriteria.dateRange.end);
        
        matches = matches && 
          validFrom >= filterStart &&
          validTo <= filterEnd;
      }

      return matches;
    });
  }

  createContract() {
    this.router.navigate(['/contracts/new']);
  }

  editContract(contract: Contract) {
    this.router.navigate([`/contracts/${contract.id}/edit`]);
  }

  viewContract(contract: Contract) {
    this.router.navigate([`/contracts/${contract.id}`]);
  }

  async deleteContract(contract: Contract) {
    const dialogRef = this.dialog.open(/* Confirmation Dialog Component */, {
      data: {
        title: 'Delete Contract',
        message: `Are you sure you want to delete contract "${contract.name}"?`
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      await this.contractService.deleteContract(contract.id);
      this.contracts = this.contracts.filter(c => c.id !== contract.id);
      this.applyFilters();
    }
  }

  getHotelName(hotelId: number): string {
    return this.hotels[hotelId]?.name || 'Unknown Hotel';
  }

  getMarketName(marketId: number): string {
    return this.markets[marketId]?.name || 'Unknown Market';
  }

  getSeasonName(seasonId: number): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season?.name || 'Unknown Season';
  }

  getSeasonPeriods(seasonId: number): Period[] {
    return this.periods[seasonId] || [];
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-badge-active';
      case 'draft':
        return 'status-badge-draft';
      case 'expired':
        return 'status-badge-expired';
      default:
        return '';
    }
  }
}
