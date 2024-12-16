import { Component, Inject, Input, OnInit, signal } from "@angular/core";
import { contractRates } from "../../../../data/mock/rates.mock";
import {
  Contract,
  ContractPeriodRate,
  PersonTypeRates,
  RoomTypeRate,
} from "../../../../models/types";
import { FilterByRoomTypePipe } from "./filter-by-room-type.pipe";
import { CommonModule } from "@angular/common";
import { ContractRateService } from "../../../../services/contract-rates.service";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

interface RoomTypeRates {
  roomTypeId: number;
  periods: ContractPeriodRate[];
}

@Component({
  selector: "app-rates-config",
  templateUrl: "./rates-config.component.html",
  styleUrls: ["./rates-config.component.scss"],
  standalone: true,
  imports: [CommonModule, FilterByRoomTypePipe],
})
export class RatesConfigComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  @Input() contractId: number | undefined;
  roomTypeRates = signal<RoomTypeRates[]>([]);

  rateForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { contractId: number, contract: Contract },
    private dialogRef: MatDialogRef<RatesConfigComponent>,
    private fb: FormBuilder,
    private contractRatesService: ContractRateService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.contractId) {
      this.loadRatesData();
    }
  }

  private initializeForm() {
    this.rateForm = this.fb.group({
      roomTypes: this.fb.array([]),
      periods: this.fb.array([]),
      mealPlans: this.fb.array([]),
    });
  }

  addRoomTypeRate(roomTypeId: number) {
    const roomTypeForm = this.fb.group({
      roomTypeId: [roomTypeId],
      rateType: ["per_pax"],
      personTypeRates: this.fb.group({
        adult: this.createOccupancyRatesForm(),
        child: this.createOccupancyRatesForm(),
        infant: this.createOccupancyRatesForm(),
      }),
      villaRate: [null],
      mealPlanRates: this.fb.array([]),
    });

    (this.rateForm.get("roomTypes") as FormArray).push(roomTypeForm);
  }

  private createOccupancyRatesForm() {
    return this.fb.group({
      rates: this.fb.array([]),
    });
  }

  async saveRates() {
    if (this.rateForm.valid && this.contractId) {
      try {
        const rates = this.transformFormToRates(this.rateForm.value);
        await this.contractRatesService.updateContractRates(
          this.contractId,
          rates
        );
      } catch (error) {
        console.error("Error saving rates:", error);
      }
    }
  }

  private transformFormToRates(formValue: any): ContractPeriodRate[] {
    const rates: ContractPeriodRate[] = [];

    // Transform room types form array to ContractPeriodRate structure
    const roomTypes = formValue.roomTypes || [];
    const periods = formValue.periods || [];

    for (const period of periods) {
      const periodRate: ContractPeriodRate = {
        periodId: period.periodId,
        roomRates: roomTypes.map((room: RoomTypeRate) => ({
          roomTypeId: room.roomTypeId,
          rateType: room.rateType,
          personTypeRates: room.personTypeRates,
          villaRate: room.villaRate,
          mealPlanRates: room.mealPlanRates,
        })),
      };
      rates.push(periodRate);
    }

    return rates;
  }

  private async loadRatesData() {
    try {
      this.loading.set(true);
      const rates = await this.contractRatesService.getContractRates(this.data.contractId);
      this.roomTypeRates.set(this.transformRatesData(rates));
    } catch (error) {
      console.error('Error loading rates:', error);
      this.error.set('Failed to load rates data');
    } finally {
      this.loading.set(false);
    }
  }

  // Add close dialog method
  close() {
    this.dialogRef.close();
  }

  private transformRatesData(rates: any): RoomTypeRates[] {
    // Transform the rates data into the required format
    return rates.map((rate: any) => ({
      roomTypeId: rate.roomTypeId,
      periods: rate.periods,
    }));
  }

  getPersonTypeKeys(personTypeRates: PersonTypeRates): string[] {
    return Object.keys(personTypeRates);
  }

  getOccupancyKeys(rates: { [occupancy: string]: number }): string[] {
    return Object.keys(rates);
  }

  toNumber(value: string): number {
    return Number(value);
  }

  getMealPlanKeys(mealPlanRates: {
    [mealPlanId: string]: {
      [personType: string]: number;
    };
  }): string[] {
    return Object.keys(mealPlanRates);
  }

  getMealPlanPersonTypeKeys(
    mealPlanRates: {
      [mealPlanId: string]: {
        [personType: string]: number;
      };
    },
    mealPlan: string
  ): string[] {
    return Object.keys(mealPlanRates[mealPlan]);
  }
}
