// src/app/components/contract/contract-management/rates-config/rates-config.component.ts
import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import {
  Contract,
  ContractPeriodRate,
  RoomTypeRate,
  Period,
  RoomType,
  PersonTypeRates,
} from "../../../../models/types";
import { ContractRateService } from "../../../../services/contract-rates.service";

interface RateFormData {
  roomTypeId: number;
  periodId: number;
  rateType: "per_pax" | "per_villa";
  villaRate?: number;
  personTypeRates?: {
    adult: { rates: { [key: number]: number } };
    child: { rates: { [key: number]: number } };
    infant: { rates: { [key: number]: number } };
  };
  mealPlanRates?: {
    [key: string]: {
      adult: number;
      child: number;
      infant: number;
    };
  };
}

@Component({
  selector: "app-rates-config",
  templateUrl: "./rates-config.component.html",
  styleUrls: ["./rates-config.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class RatesConfigComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  ratesForms: { [key: string]: FormGroup } = {};

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      contract: Contract;
      periods: Period[];
      roomTypes: RoomType[];
      mealPlans: string[];
    },
    private dialogRef: MatDialogRef<RatesConfigComponent>,
    private fb: FormBuilder,
    private contractRateService: ContractRateService
  ) {}

  // In rates-config.component.ts
async ngOnInit() {
  try {
    this.loading.set(true);
    console.log('ngOnInit - data:', this.data);
    // First verify the data is available
    if (!this.data?.roomTypes || !this.data?.periods) {
      throw new Error('Required data is missing: room types or periods');
    }
    
    const rates = await this.contractRateService.getContractRates(
      this.data.contract.id
    );
    console.log('ngOnInit - rates:', rates);
    this.initializeForms(rates);
  } catch (error) {
    this.error.set('Failed to load rates: ' + (error as Error).message);
    console.error(error);
  } finally {
    this.loading.set(false);
  }
}


  private initializeForms(existingRates: ContractPeriodRate[]) {
    console.log('initializeForms - existingRates:', existingRates);
    this.data.roomTypes.forEach((roomType) => {
      // Populate capacityLabel here, excluding the category
      roomType.capacityLabel = `(${this.getCapacityString(roomType)})`;
      this.data.periods.forEach((period) => {
        const existingRate = this.findExistingRate(
          existingRates,
          roomType.id,
          period.id
        );
        // Fix: Pass roomType as first parameter, existingRate as second
        const formKey = `${roomType.id}-${period.id}`;
        this.ratesForms[formKey] = this.createRateForm(roomType, existingRate);        
      });
    });
  }

  private findExistingRate(
    rates: ContractPeriodRate[],
    roomTypeId: number,
    periodId: number
  ): RoomTypeRate | undefined {
    const foundRate = rates.find((r) => r.periodId === periodId)?.roomRates.find((rr) => rr.roomTypeId === roomTypeId);
    console.log('findExistingRate - roomTypeId:', roomTypeId, 'periodId:', periodId, 'foundRate:', foundRate);
    return foundRate;
  }

  private createRateForm(roomType: RoomType, existingRate?: RoomTypeRate): FormGroup {
    const form = this.fb.group({
      rateType: [existingRate?.rateType || "per_pax", Validators.required],
      villaRate: [existingRate?.villaRate || null],
      personTypeRates: this.fb.group({
        adult: this.createPersonTypeRatesGroup(
          roomType,
          existingRate?.personTypeRates?.["adult"]
        ),
        child: roomType.maxOccupancy.children > 0 ? 
          this.createPersonTypeRatesGroup(
            {...roomType, maxOccupancy: { 
              adults: roomType.maxOccupancy.children,
              children: roomType.maxOccupancy.children,
              infants: roomType.maxOccupancy.infants 
            }},
            existingRate?.personTypeRates?.["child"]
          ) : null,
        infant: roomType.maxOccupancy.infants > 0 ?
          this.createPersonTypeRatesGroup(
            {...roomType, maxOccupancy: { 
              adults: roomType.maxOccupancy.infants,
              children: roomType.maxOccupancy.children,
              infants: roomType.maxOccupancy.infants 
            }},
            existingRate?.personTypeRates?.["infant"]
          ) : null,
      }),
      mealPlanRates: this.createMealPlanRatesGroup(existingRate?.mealPlanRates),
    });
    
    return form;
}





private createPersonTypeRatesGroup(roomType: RoomType, existing?: {
  rates: { [key: number]: number };
}) {
  const { maxOccupancy } = roomType;
  const formGroup: { [key: number]: any[] } = {}; // Add type annotation
  
  for (let i = 1; i <= maxOccupancy.adults; i++) {
      formGroup[i] = [existing?.rates[i] || null];
  }

  return this.fb.group(formGroup);
}


// Add to RatesConfigComponent class
getOccupancyLabel(count: number): string {
  const labels = ['Single', 'Double', 'Triple', 'Quad', 'Quint'];
  return labels[count - 1] || `${count} Adults`;
}

getChildLabel(count: number): string {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  return `${ordinals[count - 1]} Child`;
}
getInfantLabel(count: number): string {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  return `${ordinals[count - 1]} Infant`;
}

getCapacityString(roomType: RoomType): string {
  const { maxOccupancy } = roomType;
  const capacityParts = [];
  
  if (maxOccupancy.adults > 0) capacityParts.push(`${maxOccupancy.adults}A`);
  if (maxOccupancy.children > 0) capacityParts.push(`${maxOccupancy.children}C`);
  if (maxOccupancy.infants > 0) capacityParts.push(`${maxOccupancy.infants}I`);
  
  return capacityParts.join(' + ');
}

  private createMealPlanRatesGroup(existing?: {
    [mealPlanId: string]: { [personType: string]: number };
  }) {
    const group: { [mealPlanId: string]: FormGroup } = {};

    this.data.mealPlans.forEach((mealPlan) => {
      group[mealPlan] = this.fb.group({
        adult: [existing?.[mealPlan]?.["adult"] || 0],
        child: [existing?.[mealPlan]?.["child"] || 0],
        infant: [existing?.[mealPlan]?.["infant"] || 0],
      });
    });

    return this.fb.group(group);
  }

  async saveRates() {
    try {
      this.saving.set(true);
      const rates = this.transformFormsToRates();
      await this.contractRateService.updateContractRates(
        this.data.contract.id,
        rates
      );
      this.dialogRef.close(true);
    } catch (error) {
      this.error.set("Failed to save rates");
      console.error(error);
    } finally {
      this.saving.set(false);
    }
  }

  private transformFormsToRates(): ContractPeriodRate[] {
    const periodRates: ContractPeriodRate[] = [];

    this.data.periods.forEach((period) => {
      const roomRates: RoomTypeRate[] = [];

      this.data.roomTypes.forEach((roomType) => {
        const formKey = `${roomType.id}-${period.id}`;
        const formValue = this.ratesForms[formKey].value;

        const mealPlanRates: { [key: string]: { adult: number, child: number, infant: number } } = {};
        if (formValue.mealPlanRates) {
          for (const mealPlanId of this.data.mealPlans) {
            mealPlanRates[mealPlanId] = {
              adult: formValue.mealPlanRates[mealPlanId]?.adult,
              child: formValue.mealPlanRates[mealPlanId]?.child,
              infant: formValue.mealPlanRates[mealPlanId]?.infant,
            };
          }
        }


        roomRates.push({
          roomTypeId: roomType.id,
          rateType: formValue.rateType,
          villaRate:
            formValue.rateType === "per_villa"
              ? formValue.villaRate
              : undefined,
          personTypeRates:
            formValue.rateType === "per_pax"
              ? formValue.personTypeRates
              : undefined,
          mealPlanRates: mealPlanRates,
        });
      });

      periodRates.push({
        periodId: period.id,
        roomRates,
      });
    });

    return periodRates;
  }

  close() {
    this.dialogRef.close();
  }

  getFormControlName(roomTypeId: number, periodId: number): string {
    return `${roomTypeId}-${periodId}`;
  }
}
