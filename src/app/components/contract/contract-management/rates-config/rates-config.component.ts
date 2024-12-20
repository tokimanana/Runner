// src/app/components/contract/contract-management/rates-config/rates-config.component.ts
import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  FormControl,
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
  MealPlanRates,
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

interface RateFormGroup {
  rateType: FormControl<"per_pax" | "per_villa">;
  villaRate: FormControl<number>;
  personTypeRates: FormGroup<{
    adult: FormGroup<{ [key: string]: FormControl<number> }>;
    child: FormGroup<{ [key: string]: FormControl<number> }>;
    infant: FormGroup<{ [key: string]: FormControl<number> }>;
  }>;
  mealPlanRates: FormGroup<{
    [key: string]: FormGroup<{
      adult: FormControl<number>;
      child: FormControl<number>;
      infant: FormControl<number>;
    }>;
  }>;
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

  ratesForms: { [key: string]: FormGroup<RateFormGroup> } = {};

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
      
      if (!this.data?.roomTypes || !this.data?.periods) {
        throw new Error('Required data is missing: room types or periods');
      }
  
      const rates = await this.contractRateService.getContractRates(
        this.data.contract.id
      );
      
      // Initialize forms only after data is loaded
      await this.initializeForms(rates);
      
    } catch (error) {
      this.error.set('Failed to load rates: ' + (error as Error).message);
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }
  private async initializeForms(existingRates: ContractPeriodRate | ContractPeriodRate[]) {
    console.log('Initializing forms with rates:', existingRates);
    
    this.data.roomTypes.forEach((roomType) => {
      this.data.periods.forEach((period) => {
        const existingRate = this.findExistingRate(
          existingRates,
          roomType.id,
          period.id
        );
  
        const formGroup = this.createPersonTypeRatesGroup(
          roomType,
          existingRate?.personTypeRates
        );
  
        const formKey = this.getFormControlName(roomType.id, period.id);
        this.ratesForms[formKey] = formGroup;
      });
    });
  }

  private findExistingRate(
    rates: ContractPeriodRate | ContractPeriodRate[] | undefined,
    roomTypeId: number,
    periodId: number
  ): RoomTypeRate | undefined {
    if (!rates) return undefined;
  
    // Handle single rate object
    if (!Array.isArray(rates)) {
      const singleRate = rates as ContractPeriodRate;
      if (singleRate.periodId === periodId) {
        return singleRate.roomRates.find(rr => rr.roomTypeId === roomTypeId);
      }
      return undefined;
    }
  
    // Handle array of rates
    const periodRate = rates.find(r => r.periodId === periodId);
    return periodRate?.roomRates.find(rr => rr.roomTypeId === roomTypeId);
  }

  private createPersonTypeRatesGroup(
    roomType: RoomType,
    existing?: PersonTypeRates
  ): FormGroup<RateFormGroup> {
    return this.fb.nonNullable.group<RateFormGroup>({
      rateType: this.fb.nonNullable.control<"per_pax" | "per_villa">("per_pax"),
      villaRate: this.fb.nonNullable.control(0),
      personTypeRates: this.fb.nonNullable.group({
        adult: this.createOccupancyRatesGroup(
          roomType.maxOccupancy.adults,
          existing?.["adult"]?.["rates"]
        ),
        child: this.createOccupancyRatesGroup(
          roomType.maxOccupancy.children || 1,
          existing?.["child"]?.["rates"]
        ),
        infant: this.createOccupancyRatesGroup(
          roomType.maxOccupancy.infants || 1,
          existing?.["infant"]?.["rates"]
        ),
      }),
      mealPlanRates: this.createMealPlanRatesGroup(
        this.convertToMealPlanRates(existing?.["mealPlanRates"])
      ),
    });
  }

  private createOccupancyRatesGroup(
    maxOccupancy: number,
    existingRates?: { [key: number]: number }
  ): FormGroup<{ [key: string]: FormControl<number> }> {
    const controls: { [key: string]: FormControl<number> } = {};
    for (let i = 1; i <= maxOccupancy; i++) {
      controls[i.toString()] = this.fb.nonNullable.control(
        existingRates?.[i] ?? 0
      );
    }
    return this.fb.nonNullable.group(controls);
  }

  getOccupancyRange(max: number): number[] {
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  getMealPlanLabel(mealPlan: string): string {
    // Add logic to format meal plan names for display
    return mealPlan.toUpperCase();
  }

  // Add to RatesConfigComponent class
  getOccupancyLabel(count: number): string {
    const labels = ["Single", "Double", "Triple", "Quad", "Quint"];
    return labels[count - 1] || `${count} Adults`;
  }

  getChildLabel(count: number): string {
    const ordinals = ["First", "Second", "Third", "Fourth", "Fifth"];
    return `${ordinals[count - 1]} Child`;
  }
  getInfantLabel(count: number): string {
    const ordinals = ["First", "Second", "Third", "Fourth", "Fifth"];
    return `${ordinals[count - 1]} Infant`;
  }

  getCapacityString(roomType: RoomType): string {
    const { maxOccupancy } = roomType;
    const capacityParts = [];

    if (maxOccupancy.adults > 0) capacityParts.push(`${maxOccupancy.adults}A`);
    if (maxOccupancy.children > 0)
      capacityParts.push(`${maxOccupancy.children}C`);
    if (maxOccupancy.infants > 0)
      capacityParts.push(`${maxOccupancy.infants}I`);

    return capacityParts.join(" + ");
  }

  private createMealPlanRatesGroup(existingRates?: MealPlanRates): FormGroup {
    const mealPlanRatesGroup = this.fb.nonNullable.group({});

    this.data.mealPlans.forEach((mealPlan) => {
      const existingMealPlanRate = existingRates?.[mealPlan];

      mealPlanRatesGroup.addControl(
        mealPlan,
        this.fb.nonNullable.group({
          adult: this.fb.nonNullable.control(existingMealPlanRate?.adult ?? 0),
          child: this.fb.nonNullable.control(existingMealPlanRate?.child ?? 0),
          infant: this.fb.nonNullable.control(
            existingMealPlanRate?.infant ?? 0
          ),
        })
      );
    });

    return mealPlanRatesGroup;
  }

  private convertToMealPlanRates(existingRates?: any): MealPlanRates {
    const converted: MealPlanRates = {};

    if (!existingRates) return converted;

    Object.entries(existingRates).forEach(([mealPlanType, rates]) => {
      converted[mealPlanType] = {
        adult: (rates as any)?.adult ?? 0,
        child: (rates as any)?.child ?? 0,
        infant: (rates as any)?.infant ?? 0,
      };
    });

    return converted;
  }

  async saveRates() {
    try {
      this.saving.set(true);
      const rates = this.transformFormsToRates();
      const updatedContract =
        await this.contractRateService.updateContractRates(
          this.data.contract.id,
          rates
        );
      // Pass the updated contract back to the parent component
      this.dialogRef.close(updatedContract);
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
        const formKey = this.getFormControlName(roomType.id, period.id);
        const formValue = this.ratesForms[formKey]?.value;

        if (!formValue) {
          console.warn(`No form value found for ${formKey}`);
          return;
        }

        // Initialize meal plan rates with all configured meal plans
        const mealPlanRates: {
          [key: string]: { adult: number; child: number; infant: number };
        } = {};

        if (formValue.mealPlanRates) {
          Object.entries(formValue.mealPlanRates).forEach(
            ([mealPlanId, rates]) => {
              if (rates) {
                mealPlanRates[mealPlanId] = {
                  adult: rates.adult ?? 0,
                  child: rates.child ?? 0,
                  infant: rates.infant ?? 0,
                };
              } else {
                mealPlanRates[mealPlanId] = {
                  adult: 0,
                  child: 0,
                  infant: 0,
                };
              }
            }
          );
        }

        // Create room rate object based on rate type
        const roomRate: RoomTypeRate = {
          roomTypeId: roomType.id,
          rateType: formValue.rateType ?? ("per_pax" as const),
          mealPlanRates,
        };

        // Add specific rate type data
        if (formValue.rateType === "per_villa") {
          roomRate.villaRate = formValue.villaRate ?? 0;
        } else {
          if (formValue.personTypeRates) {
            roomRate.personTypeRates = {
              adult: {
                rates: this.convertFormGroupToRates(
                  formValue.personTypeRates?.adult
                ),
              },
              child: {
                rates: this.convertFormGroupToRates(
                  formValue.personTypeRates?.child
                ),
              },
              infant: {
                rates: this.convertFormGroupToRates(
                  formValue.personTypeRates?.infant
                ),
              },
            };
          } else {
            roomRate.personTypeRates = {
              adult: { rates: {} },
              child: { rates: {} },
              infant: { rates: {} },
            };
          }
        }

        roomRates.push(roomRate);
      });

      periodRates.push({
        id: this.data.contract.id,
        periodId: period.id,
        roomRates,
      });
    });

    return periodRates;
  }

  private convertFormGroupToRates(formGroup: any): { [key: number]: number } {
    if (!formGroup) {
      return {};
    }

    const rates: { [key: number]: number } = {};
    Object.entries(formGroup).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        rates[parseInt(key)] = value as number;
      } else {
        rates[parseInt(key)] = 0;
      }
    });
    return rates;
  }

  close() {
    this.dialogRef.close();
  }

  getFormControlName(roomTypeId: number, periodId: number): string {
    return `${roomTypeId}-${periodId}`;
  }

  getFormGroup(roomTypeId: number, periodId: number): FormGroup {
    const key = this.getFormControlName(roomTypeId, periodId);
    const form = this.ratesForms[key];
    if (!form) {
      throw new Error(
        `Form group not found for room type ${roomTypeId} and period ${periodId}`
      );
    }
    return form;
  }

  isFormInitialized(roomTypeId: number, periodId: number): boolean {
    return !!this.getFormGroup(roomTypeId, periodId);
  }
}
