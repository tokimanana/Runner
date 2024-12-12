import { Component, OnInit, OnDestroy, EventEmitter, TemplateRef, ViewChild, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, combineLatest, takeUntil } from 'rxjs';

import { Contract, Hotel, Market, Season } from '../../../../models/types';
import { ContractService } from '../../../../services/contract.service';
import { HotelService } from '../../../../services/hotel.service';
import { MarketService } from '../../../../services/market.service';
import { SeasonService } from '../../../../services/season.service';
import { ContractFormComponent } from '../contract-form/contract-form.component';
import { HotelSelectorComponent } from '../../../hotel-selector/hotel-selector.component';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatPaginatorModule,
    MatDialogModule,
    FormsModule,
    HotelSelectorComponent
  ]
})
export class ContractListComponent implements OnInit, OnDestroy {
  @Output() contractSelected = new EventEmitter<Contract>();
  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Pagination properties
  pageSize = 10;
  totalContracts = 0;

  displayedColumns: string[] = ['name', 'hotel', 'market', 'season', 'validFrom', 'validTo', 'status', 'actions'];
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  hotels: Hotel[] = [];
  markets: Market[] = [];
  seasons: Season[] = [];

  selectedHotelId: number | null = null;
  selectedMarketId: number | null = null;
  selectedSeasonId: number | null = null;
  selectedStatus: string | null = null;
  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  private destroy$ = new Subject<void>();

  constructor(
    private contractService: ContractService,
    private hotelService: HotelService,
    private marketService: MarketService,
    private seasonService: SeasonService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.loadContracts();
  }

  private loadData(): void {
    // Load hotels and markets first
    combineLatest({
      hotels: this.hotelService.getHotels(),
      markets: this.marketService.markets$
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ hotels, markets }) => {
      this.hotels = hotels;
      this.markets = markets || [];
      this.loadContracts();
    });

    // Subscribe to hotel selection changes to load seasons
    this.loadSeasons();
  }

  private loadSeasons(): void {
    if (this.selectedHotelId) {
      this.seasonService.getSeasonsByHotel(this.selectedHotelId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(seasons => {
          this.seasons = seasons;
          // Reset season selection if the selected season is not in the new list
          if (this.selectedSeasonId && !seasons.some(s => s.id === this.selectedSeasonId)) {
            this.selectedSeasonId = null;
          }
        });
    } else {
      // If no hotel is selected, clear the seasons list
      this.seasons = [];
      this.selectedSeasonId = null;
    }
  }

  onHotelSelect(hotel: Hotel | null): void {
    this.selectedHotelId = hotel?.id || null;
    if (hotel) {
      this.seasonService.getSeasonsByHotel(hotel.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(seasons => {
          this.seasons = seasons;
          // Reset season selection since the hotel changed
          this.selectedSeasonId = null;
          this.applyFilters();
        });
    } else {
      this.seasons = [];
      this.selectedSeasonId = null;
      this.applyFilters();
    }
  }

  private loadContracts() {
    const pageIndex = this.paginator?.pageIndex || 0;
    this.contractService.getContracts(this.pageSize, pageIndex)
      .subscribe(contracts => {
        this.contracts = this.filterContracts(contracts);
        this.totalContracts = this.contractService.getTotalContracts();
      });
  }

  private filterContracts(contracts: Contract[]): Contract[] {
    return contracts.filter(contract => {
      if (this.selectedHotelId && contract.hotelId !== this.selectedHotelId) return false;
      if (this.selectedMarketId && contract.marketId !== this.selectedMarketId) return false;
      if (this.selectedSeasonId && contract.seasonId !== this.selectedSeasonId) return false;
      if (this.selectedStatus && contract.status !== this.selectedStatus) return false;
      if (this.dateRange.start && new Date(contract.validFrom) < this.dateRange.start) return false;
      if (this.dateRange.end && new Date(contract.validTo) > this.dateRange.end) return false;
      return true;
    });
  }

  applyFilters(): void {
    this.loadContracts();
  }

  getHotelName(hotelId: number): string {
    return this.hotels.find(h => h.id === hotelId)?.name || '';
  }

  getMarketName(marketId: number): string {
    return this.markets.find(m => m.id === marketId)?.name || '';
  }

  getSeasonName(seasonId: number): string {
    return this.seasons.find(s => s.id === seasonId)?.name || '';
  }

  createContract(): void {
    const dialogRef = this.dialog.open(ContractFormComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadContracts();
      }
    });
  }

  editContract(contract: Contract): void {
    const dialogRef = this.dialog.open(ContractFormComponent, {
      width: '800px',
      data: { mode: 'edit', contract }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadContracts();
      }
    });
  }

  viewContract(contract: Contract): void {
    this.dialog.open(ContractFormComponent, {
      width: '800px',
      data: { mode: 'view', contract }
    });
  }

  deleteContract(contract: Contract): void {
    const dialogRef = this.dialog.open(this.deleteDialog, {
      width: '400px',
      data: contract
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contractService.deleteContract(contract.id).subscribe(() => {
          this.loadContracts();
        });
      }
    });
  }
}
