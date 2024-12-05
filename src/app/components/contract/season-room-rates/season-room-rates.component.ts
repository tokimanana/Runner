import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { Contract, Season, RoomType, Period, ContractPeriodRate } from '../../../models/types';
import { HotelService } from '../../../services/hotel.service';
import { ContractService } from '../../../services/contract.service';
import { firstValueFrom } from 'rxjs';

interface RoomTypeRates {
  roomTypeId: number;
  roomTypeName: string;
  periodRates: Map<number, ContractPeriodRate>;
}

@Component({
  selector: 'app-season-room-rates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule
  ],
  templateUrl: './season-room-rates.component.html',
  styleUrls: ['./season-room-rates.component.css']
})
export class SeasonRoomRatesComponent implements OnInit {
  @Input() contract!: Contract;
  @Input() season!: Season;

  roomTypes: RoomType[] = [];
  periods: Period[] = [];
  roomTypeRates: RoomTypeRates[] = [];
  rateForm: FormGroup;
  selectedRoomType: RoomType | null = null;
  selectedPeriod: Period | null = null;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private contractService: ContractService
  ) {
    this.rateForm = this.createRateForm();
  }

  async ngOnInit() {
    await this.loadRoomTypes();
    this.loadPeriods();
    this.initializeRates();
  }

  private createRateForm(): FormGroup {
    return this.fb.group({
      singleRate: [null, [Validators.required, Validators.min(0)]],
      doubleRate: [null, [Validators.required, Validators.min(0)]],
      tripleRate: [null, [Validators.required, Validators.min(0)]],
      childRate: [null, [Validators.required, Validators.min(0)]],
      extraBedRate: [null, [Validators.required, Validators.min(0)]]
    });
  }

  async loadRoomTypes(): Promise<void> {
    if (this.contract?.hotelId) {
      try {
        this.roomTypes = await firstValueFrom(this.hotelService.getRoomTypes(this.contract.hotelId));
        this.roomTypeRates = this.roomTypes.map(roomType => ({
          roomTypeId: roomType.id,
          roomTypeName: roomType.name,
          periodRates: new Map<number, ContractPeriodRate>()
        }));
      } catch (error) {
        console.error('Error loading room types:', error);
      }
    }
  }

  loadPeriods(): void {
    if (this.season?.periods) {
      this.periods = this.season.periods;
    }
  }

  private initializeRates(): void {
    if (this.contract?.periodRates) {
      this.contract.periodRates.forEach(rate => {
        const roomTypeRate = this.roomTypeRates.find(r => r.roomTypeId === rate.roomTypeId);
        if (roomTypeRate) {
          roomTypeRate.periodRates.set(rate.periodId, rate);
        }
      });
    }
  }

  onRoomTypeSelect(roomType: RoomType): void {
    this.selectedRoomType = roomType;
    this.loadRoomTypeRates();
  }

  onPeriodSelect(period: Period): void {
    this.selectedPeriod = period;
    this.loadPeriodRates();
  }

  private loadRoomTypeRates(): void {
    if (!this.selectedRoomType) return;
    
    const roomTypeRate = this.roomTypeRates.find(r => r.roomTypeId === this.selectedRoomType?.id);
    if (roomTypeRate) {
      this.periods.forEach(period => {
        const rate = roomTypeRate.periodRates.get(period.id);
        if (rate) {
          this.rateForm.patchValue({
            singleRate: rate.baseRates.single,
            doubleRate: rate.baseRates.double,
            tripleRate: rate.baseRates.triple,
            childRate: rate.supplements.child,
            extraBedRate: rate.supplements.extraAdult
          });
        }
      });
    }
  }

  private loadPeriodRates(): void {
    if (!this.selectedRoomType) return;

    const roomTypeRate = this.roomTypeRates.find(r => r.roomTypeId === this.selectedRoomType?.id);
    if (roomTypeRate && this.selectedPeriod) {
      const rate = roomTypeRate.periodRates.get(this.selectedPeriod.id);
      if (rate) {
        this.rateForm.patchValue({
          singleRate: rate.baseRates.single,
          doubleRate: rate.baseRates.double,
          tripleRate: rate.baseRates.triple,
          childRate: rate.supplements.child,
          extraBedRate: rate.supplements.extraAdult
        });
      } else {
        this.rateForm.reset();
      }
    }
  }

  async saveRates(): Promise<void> {
    if (!this.contract || !this.season || !this.selectedRoomType || !this.selectedPeriod) {
      return;
    }

    const formValue = this.rateForm.value;
    const rate: ContractPeriodRate = {
      periodId: this.selectedPeriod.id,
      startDate: this.selectedPeriod.startDate,
      endDate: this.selectedPeriod.endDate,
      roomTypeId: this.selectedRoomType.id,
      rateType: 'per_pax',
      baseRates: {
        single: formValue.singleRate,
        double: formValue.doubleRate,
        triple: formValue.tripleRate
      },
      supplements: {
        extraAdult: formValue.extraBedRate,
        child: formValue.childRate,
        infant: 0
      },
      mealPlanRates: []
    };

    try {
      await firstValueFrom(this.contractService.updateContractRates(
        this.contract.id.toString(),
        this.season.id.toString(),
        [rate]
      ));
    } catch (error) {
      console.error('Error saving rates:', error);
    }
  }
}
