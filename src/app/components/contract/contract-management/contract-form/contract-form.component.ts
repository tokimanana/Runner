import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

import { Contract, Hotel, Market, Season, Period, RoomType, MealPlan } from '../../../../models/types';
import { ContractService } from '../../../../services/contract.service';
import { HotelService } from '../../../../services/hotel.service';
import { MarketService } from '../../../../services/market.service';
import { SeasonService } from '../../../../services/season.service';
import { RatesConfigComponent } from '../rates-config/rates-config.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTabsModule,
    RatesConfigComponent
  ]
})
export class ContractFormComponent implements OnInit, OnDestroy {
  @Input() contract?: Contract;
  @Output() save = new EventEmitter<Contract>();
  @Output() cancel = new EventEmitter<void>();

  contractForm: FormGroup;
  hotels: Hotel[] = [];
  markets: Market[] = [];
  seasons: Season[] = [];
  periods: Period[] = [];
  roomTypes: RoomType[] = [];
  mealPlans: MealPlan[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private hotelService: HotelService,
    private marketService: MarketService,
    private seasonService: SeasonService
  ) {
    this.contractForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
    
    if (this.contract) {
      // For editing existing contract
      this.contractForm.patchValue({
        ...this.contract,
        hotelId: this.contract.hotelId,
        marketId: this.contract.marketId,
        seasonId: this.contract.seasonId,
        validFrom: new Date(this.contract.validFrom),
        validTo: new Date(this.contract.validTo)
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', Validators.required],
      hotelId: [null, Validators.required],
      marketId: [null, Validators.required],
      seasonId: [null, Validators.required],
      description: [''],
      status: ['draft', Validators.required],
      selectedRooms: [[]],
      selectedMealPlans: [[]],
      periodRates: [[]],
      terms: [''],
      validFrom: [null, Validators.required],
      validTo: [null, Validators.required]
    });
  }

  private loadData(): void {
    // Get hotelId from form or use a default
    const hotelId = this.contract?.hotelId || 1;

    // Load hotels
    this.hotelService.getHotels()
      .pipe(takeUntil(this.destroy$))
      .subscribe(hotels => this.hotels = hotels);

    // Load markets
    this.marketService.markets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(markets => {
        if (markets) {
          this.markets = markets;
        }
      });

    // Load seasons for the selected hotel
    this.seasonService.getSeasonsByHotel(hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(seasons => this.seasons = seasons);

    // Watch for hotel changes to load room types, meal plans, and seasons
    this.contractForm.get('hotelId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(hotelId => {
        if (hotelId) {
          const hotel = this.hotels.find(h => h.id === hotelId);
          this.roomTypes = hotel?.rooms || [];
          this.mealPlans = hotel?.mealPlans || [];
          
          // Reload seasons when hotel changes
          this.seasonService.getSeasonsByHotel(hotelId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(seasons => this.seasons = seasons);
        }
      });

    // Watch for season changes to load periods
    this.contractForm.get('seasonId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(seasonId => {
        if (seasonId) {
          const season = this.seasons.find(s => s.id === seasonId);
          this.periods = season?.periods || [];
        }
      });
  }

  onSubmit(): void {
    if (this.contractForm.valid) {
      const formValue = this.contractForm.value;
      const contractData: Partial<Contract> = {
        ...formValue,
        id: this.contract?.id, // preserve existing id for updates
        validFrom: formValue.validFrom?.toISOString(),
        validTo: formValue.validTo?.toISOString()
      };
      
      this.save.emit(contractData as Contract);
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.contractForm.controls).forEach(key => {
        const control = this.contractForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Helper method for template comparisons
  compareById(item1: any, item2: any): boolean {
    return item1 && item2 && item1.id === item2.id;
  }

  onRoomTypeChange(event: { checked: boolean }, roomId: number): void {
    const selectedRooms = this.contractForm.get('selectedRooms')?.value || [];
    if (event.checked) {
      // Add room if checked
      if (!selectedRooms.includes(roomId)) {
        this.contractForm.patchValue({
          selectedRooms: [...selectedRooms, roomId]
        });
      }
    } else {
      // Remove room if unchecked
      this.contractForm.patchValue({
        selectedRooms: selectedRooms.filter((id: number) => id !== roomId)
      });
    }
  }

  onMealPlanChange(event: { checked: boolean }, mealPlanId: string): void {
    const selectedMealPlans = this.contractForm.get('selectedMealPlans')?.value || [];
    if (event.checked) {
      // Add meal plan if checked
      if (!selectedMealPlans.includes(mealPlanId)) {
        this.contractForm.patchValue({
          selectedMealPlans: [...selectedMealPlans, mealPlanId]
        });
      }
    } else {
      // Remove meal plan if unchecked
      this.contractForm.patchValue({
        selectedMealPlans: selectedMealPlans.filter((id: string) => id !== mealPlanId)
      });
    }
  }
}
