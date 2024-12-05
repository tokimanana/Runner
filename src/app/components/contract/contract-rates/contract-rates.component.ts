import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Contract, Rate, RoomType, Period, MealPlanType, Market } from '../../../models/types';
import { HotelService } from '../../../services/hotel.service';
import { MarketService } from '../../../services/market.service';

@Component({
  selector: 'app-contract-rates',
  templateUrl: './contract-rates.component.html',
  styleUrls: ['./contract-rates.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class ContractRatesComponent implements OnInit {
  @Input() contract!: Contract;
  @Output() ratesSaved = new EventEmitter<Contract>();

  periods: Period[] = [];
  selectedPeriodId: number = 0;
  filteredRates: Rate[] = [];
  displayedColumns: string[] = ['roomType', 'baseRate', 'childRate', 'actions'];
  rateForm: FormGroup;
  showRateForm = false;
  roomTypes: RoomType[] = [];
  selectedRoomType: RoomType | null = null;
  editingIndex: number | null = null;
  mealPlanTypes = ['RO', 'BB', 'HB', 'FB', 'AI'] as MealPlanType[];
  market: Market | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private hotelService: HotelService,
    private marketService: MarketService
  ) {
    this.rateForm = this.formBuilder.group({
      roomTypeId: [null, Validators.required],
      rateType: ['per_pax'],
      baseRate: [0, [Validators.required, Validators.min(0)]],
      childRate: [0, [Validators.required, Validators.min(0)]],
      mealPlanRates: this.formBuilder.group({
        BB: this.formBuilder.group({
          adult: [0, [Validators.required, Validators.min(0)]],
          child: [0, [Validators.required, Validators.min(0)]]
        }),
        HB: this.formBuilder.group({
          adult: [0, [Validators.required, Validators.min(0)]],
          child: [0, [Validators.required, Validators.min(0)]]
        }),
        FB: this.formBuilder.group({
          adult: [0, [Validators.required, Validators.min(0)]],
          child: [0, [Validators.required, Validators.min(0)]]
        })
      })
    });
  }

  ngOnInit() {
    if (!this.contract.rates) {
      this.contract.rates = [];
    }
    this.loadMarket();
    this.loadRoomTypes();
  }

  private async loadMarket() {
    this.market = await this.marketService.getMarket(this.contract.marketId);
  }

  private async loadRoomTypes() {
    const hotel = await this.hotelService.selectedHotel$.pipe().toPromise();
    if (hotel) {
      this.roomTypes = hotel.rooms || [];
    }
  }

  getRoomTypeName(roomTypeId: number): string {
    const roomType = this.roomTypes.find(r => r.id === roomTypeId);
    return roomType ? roomType.name : 'Unknown';
  }

  openRateForm() {
    this.showRateForm = true;
    this.editingIndex = null;
    this.rateForm.reset({
      rateType: 'per_pax',
      baseRate: 0,
      childRate: 0
    });
  }

  editRate(rate: Rate, index: number) {
    this.showRateForm = true;
    this.editingIndex = index;
    this.rateForm.patchValue({
      roomTypeId: rate.roomTypeId,
      rateType: rate.rateType,
      baseRate: rate.baseRate,
      childRate: rate.extraChild,
      mealPlanRates: {
        BB: { adult: rate.supplements.mealPlan.BB },
        HB: { adult: rate.supplements.mealPlan.HB },
        FB: { adult: rate.supplements.mealPlan.FB }
      }
    });
  }

  deleteRate(index: number) {
    if (this.contract.rates) {
      this.contract.rates.splice(index, 1);
      this.ratesSaved.emit(this.contract);
    }
  }

  saveRate() {
    if (!this.market) {
      console.error('Market not loaded');
      return;
    }

    if (this.rateForm.valid) {
      const formValue = this.rateForm.value;
      const rate: Rate = {
        periodId: this.selectedPeriodId,
        roomTypeId: formValue.roomTypeId,
        rateType: formValue.rateType,
        contractId: this.contract.id,
        hotelId: this.contract.hotelId,
        marketId: this.contract.marketId,
        seasonId: this.contract.seasonId,
        currency: this.market.currency,
        amount: 0,
        baseRate: formValue.baseRate,
        extraAdult: 0,
        extraChild: formValue.childRate,
        villaRate: 0,
        supplements: {
          extraAdult: 0,
          extraChild: 0,
          singleOccupancy: 0,
          mealPlan: {
            BB: formValue.mealPlanRates?.BB?.adult || 0,
            HB: formValue.mealPlanRates?.HB?.adult || 0,
            FB: formValue.mealPlanRates?.FB?.adult || 0
          }
        },
        specialOffers: []
      };

      if (this.editingIndex !== null) {
        this.filteredRates[this.editingIndex] = rate;
      } else {
        this.filteredRates.push(rate);
      }

      if (this.contract.rates) {
        this.contract.rates = [
          ...this.contract.rates.filter(r => r.periodId !== this.selectedPeriodId),
          ...this.filteredRates
        ];
      }

      this.ratesSaved.emit(this.contract);
      this.showRateForm = false;
      this.rateForm.reset();
      this.editingIndex = null;
    }
  }

  cancelRateForm() {
    this.showRateForm = false;
    this.editingIndex = null;
    this.rateForm.reset();
    this.selectedRoomType = null;
  }
}
