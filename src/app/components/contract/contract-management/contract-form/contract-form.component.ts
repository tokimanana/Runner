import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Contract, Hotel, Market, Season, RoomType, MealPlan } from '../../../../models/types';
import { ContractService } from '../../../../services/contract.service';
import { HotelService } from '../../../../services/hotel.service';
import { MarketService } from '../../../../services/market.service';
import { SeasonService } from '../../../../services/season.service';

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
    MatButtonModule,
    MatDialogModule,
    MatTabsModule
  ]
})
export class ContractFormComponent implements OnInit, OnDestroy {
  contractForm: FormGroup;
  hotels: Hotel[] = [];
  markets: Market[] = [];
  seasons: Season[] = [];
  roomTypes: RoomType[] = [];
  mealPlans: MealPlan[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private hotelService: HotelService,
    private marketService: MarketService,
    private seasonService: SeasonService,
    public dialogRef: MatDialogRef<ContractFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', contract?: Contract }
  ) {
    this.contractForm = this.fb.group({
      name: ['', Validators.required],
      hotelId: [null, Validators.required],
      marketId: [null, Validators.required],
      seasonId: [null, Validators.required],
      description: [''],
      status: ['draft'],
      selectedRooms: [[], Validators.required],  // Add room types
      selectedMealPlans: [[], Validators.required],  // Add meal plans
      terms: [''],
      validFrom: [null, Validators.required],
      validTo: [null, Validators.required]
    });

    // Listen to hotel changes to load room types and meal plans
    this.contractForm.get('hotelId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(hotelId => {
        if (hotelId) {
          this.loadHotelDetails(hotelId);
        } else {
          this.roomTypes = [];
          this.mealPlans = [];
        }
      });

    if (data && data.mode === 'edit' && data.contract) {
      this.contractForm.patchValue(data.contract);
    }
  }

  private loadHotelDetails(hotelId: number): void {
    this.hotelService.getHotels()
      .pipe(takeUntil(this.destroy$))
      .subscribe(hotels => {
        const hotel = hotels.find(h => h.id === hotelId);
        if (hotel) {
          this.roomTypes = hotel.rooms || [];
          this.mealPlans = hotel.mealPlans || [];
        }
      });
  }

  ngOnInit(): void {
    // Load initial data
    combineLatest({
      hotels: this.hotelService.getHotels(),
      markets: this.marketService.markets$
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(({ hotels, markets }) => {
      this.hotels = hotels;
      this.markets = markets || [];

      // If editing existing contract, patch form and load hotel details
      if (this.data?.contract) {
        this.contractForm.patchValue(this.data.contract);
        this.loadHotelDetails(this.data.contract.hotelId);
      }
    });

    // Subscribe to hotel changes to load seasons
    this.contractForm.get('hotelId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(hotelId => {
        if (hotelId) {
          this.seasonService.getSeasonsByHotel(hotelId)
            .subscribe(seasons => {
              this.seasons = seasons;
            });
        } else {
          this.seasons = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.contractForm.valid) {
      const contractData = this.contractForm.value;
      
      if (this.data.mode === 'edit' && this.data.contract) {
        this.contractService.updateContract(this.data.contract.id, contractData)
          .subscribe({
            next: () => this.dialogRef.close(true),
            error: (error) => console.error('Error updating contract:', error)
          });
      } else {
        this.contractService.createContract(contractData)
          .subscribe({
            next: () => this.dialogRef.close(true),
            error: (error) => console.error('Error creating contract:', error)
          });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  compareById(item1: any, item2: any): boolean {
    return item1 && item2 && item1.id === item2.id;
  }

  getFormTitle(): string {
    return this.data.mode === 'edit' ? 'Edit Contract' : 'Create New Contract';
  }

  getSubmitButtonText(): string {
    return this.data.mode === 'edit' ? 'Update' : 'Create';
  }
}
