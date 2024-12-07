import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Contract, Hotel, Market, Season, Period } from '../../../../models/types';
import { ContractService } from '../../../../services/contract.service';
import { HotelService } from '../../../../services/hotel.service';
import { MarketService } from '../../../../services/market.service';
import { SeasonService } from '../../../../services/season.service';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface FilterCriteria {
  hotel: number | null;
  market: number | null;
  season: number | null;
  status: string | null;
  dateRange: DateRange;
}

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule
  ]
})
export class ContractListComponent implements OnInit, OnDestroy {
  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;
  @Output() contractSelected = new EventEmitter<Contract>();

  displayedColumns: string[] = ['name', 'hotel', 'market', 'season', 'validFrom', 'validTo', 'status', 'actions'];
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  hotels: { [key: number]: Hotel } = {};
  markets: { [key: number]: Market } = {};
  seasons: Season[] = [];
  contractToDelete: Contract | null = null;

  filterCriteria: FilterCriteria = {
    hotel: null,
    market: null,
    season: null,
    status: null,
    dateRange: {
      start: null,
      end: null
    }
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private contractService: ContractService,
    private hotelService: HotelService,
    private marketService: MarketService,
    private seasonService: SeasonService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Get hotelId from route or use a default value
    const hotelId = 1; // TODO: Get from route or configuration
    
    combineLatest({
      hotels: this.hotelService.getHotels(),
      markets: this.marketService.markets$,
      seasons: this.seasonService.getSeasonsByHotel(hotelId),
      contracts: this.contractService.getContracts()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ hotels, markets, seasons, contracts }) => {
      // Convert arrays to lookup objects for hotels and markets with proper typing
      this.hotels = hotels.reduce<{ [key: number]: Hotel }>(
        (acc, hotel) => ({ ...acc, [hotel.id]: hotel }), 
        {}
      );
      
      if (markets) {
        this.markets = markets.reduce<{ [key: number]: Market }>(
          (acc, market) => ({ ...acc, [market.id]: market }), 
          {}
        );
      }
      
      this.seasons = seasons;
      this.contracts = contracts;
      this.applyFilters();
    });
  }

  getHotelName(hotelId: number): string {
    return this.hotels[hotelId]?.name || '';
  }

  getMarketName(marketId: number): string {
    return this.markets[marketId]?.name || '';
  }

  getSeasonName(seasonId: number): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season?.name || '';
  }

  getSeasonPeriods(seasonId: number): Period[] {
    const season = this.seasons.find(s => s.id === seasonId);
    return season?.periods || [];
  }

  getStatusBadgeClass(status: string): string {
    return `status-badge ${status}`;
  }

  applyFilters(): void {
    this.filteredContracts = this.contracts.filter(contract => {
      const hotelMatch = !this.filterCriteria.hotel || contract.hotelId === this.filterCriteria.hotel;
      const marketMatch = !this.filterCriteria.market || contract.marketId === this.filterCriteria.market;
      const seasonMatch = !this.filterCriteria.season || contract.seasonId === this.filterCriteria.season;
      const statusMatch = !this.filterCriteria.status || contract.status === this.filterCriteria.status;
      
      let dateMatch = true;
      if (this.filterCriteria.dateRange.start && this.filterCriteria.dateRange.end) {
        const validFrom = new Date(contract.validFrom);
        const validTo = new Date(contract.validTo);
        const filterStart = new Date(this.filterCriteria.dateRange.start);
        const filterEnd = new Date(this.filterCriteria.dateRange.end);
        
        dateMatch = validFrom >= filterStart && validTo <= filterEnd;
      }

      return hotelMatch && marketMatch && seasonMatch && statusMatch && dateMatch;
    });
  }

  resetFilters(): void {
    this.filterCriteria = {
      hotel: null,
      market: null,
      season: null,
      status: null,
      dateRange: {
        start: null,
        end: null
      }
    };
    this.applyFilters();
  }

  createContract(): void {
    this.router.navigate(['/contracts/new']);
  }

  editContract(contract: Contract): void {
    this.router.navigate([`/contracts/${contract.id}/edit`]);
  }

  viewContract(contract: Contract): void {
    this.contractSelected.emit(contract);
  }

  deleteContract(contract: Contract): void {
    if (confirm(`Are you sure you want to delete contract ${contract.name}?`)) {
      this.contractService.deleteContract(contract.id)
        .subscribe({
          next: () => {
            this.contracts = this.contracts.filter(c => c.id !== contract.id);
            this.applyFilters();
          },
          error: (error) => {
            console.error('Error deleting contract:', error);
          }
        });
    }
  }
}
