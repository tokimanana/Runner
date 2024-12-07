import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { 
  Contract,
  ContractRate,
  Period,
  RoomType,
  MealPlan, 
  ContractPeriodRate
} from '../../../../models/types';
import { ContractService } from '../../../../services/contract.service';
import { ActivatedRoute } from '@angular/router';

interface RatesByOccupancy {
  rates: { [key: number]: number };
}

interface MealPlanRatesByType {
  [key: string]: {
    ['adult']: RatesByOccupancy;
    ['teen']: RatesByOccupancy;
    ['child']: RatesByOccupancy;
    ['base']?: RatesByOccupancy;
  };
}

interface PersonTypeRate {
  rates: {
    [count: number]: number;
  };
}

interface MealPlanRates {
  [mealPlanId: string]: {
    [personType: string]: number;
  };
}

interface PersonTypeRates {
  [occupancyKey: string]: number;
}

interface MealPlanPersonRates {
  adult?: PersonTypeRates;
  teen?: PersonTypeRates;
  child?: PersonTypeRates;
}

type PersonType = keyof MealPlanPersonRates;

interface ProcessedMealPlanRates {
  [mealPlanId: string]: MealPlanPersonRates;
}

interface PerVillaRates {
  [mealPlanId: string]: number;
}

@Component({
  selector: 'app-rates-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
    MatButtonToggleModule
  ],
  templateUrl: './rates-config.component.html',
  styleUrls: ['./rates-config.component.css']
})
export class RatesConfigComponent implements OnInit {
  @Input() contract!: Contract;
  @Input() periods: Period[] = [];
  @Input() roomTypes: RoomType[] = [];
  @Input() mealPlans: MealPlan[] = [];

  ratesForm!: FormGroup;

  availableMealPlans: MealPlan[] = [];

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private route: ActivatedRoute
  ) {
    this.initializeRatesForm();
  }

  ngOnInit() {
    this.availableMealPlans = this.fetchAvailableMealPlans();
    this.initializeRatesForm();
    this.loadRates();
  }

  private loadRates() {
    if (!this.contract?.id) {
      console.error('Contract ID is required to load rates');
      return;
    }

    this.contractService.getContractRates(this.contract.id).subscribe({
      next: (rates) => {
        if (!rates) {
          console.error('No rates returned from the server');
          return;
        }
        this.processRates(rates);
      },
      error: (error) => {
        console.error('Error loading rates:', error);
      }
    });
  }

  private processRates(rates: ContractPeriodRate[]) {
    if (!this.ratesForm) {
      console.error('Rates form not initialized');
      return;
    }

    rates.forEach((periodRate, periodIndex) => {
      periodRate.roomRates.forEach(roomRate => {
        try {
          const roomTypeFormGroup = this.getRoomTypeFormGroup(periodIndex, roomRate.roomTypeId);
          if (!roomTypeFormGroup) {
            console.error(`Form group not found for room type ${roomRate.roomTypeId} in period ${periodIndex}`);
            return;
          }

          const rateTypeControl = roomTypeFormGroup.get('rateType');
          if (!rateTypeControl) {
            console.error(`Rate type control not found for room ${roomRate.roomTypeId}`);
            return;
          }
          rateTypeControl.setValue(roomRate.rateType);

          if (roomRate.rateType === 'per_villa') {
            this.processPerVillaRates(roomTypeFormGroup, roomRate.mealPlanRates || {});
          } else {
            const processedMealPlanRates: ProcessedMealPlanRates = {};
            Object.entries(roomRate.mealPlanRates || {}).forEach(([mealPlan, rates]) => {
              const personTypeRates: MealPlanPersonRates = {};
              Object.entries(rates).forEach(([personType, personRates]) => {
                if (this.isValidPersonType(personType)) {
                  const occupancyRates: PersonTypeRates = {};
                  Object.entries(personRates).forEach(([occupancyKey, rate]) => {
                    occupancyRates[occupancyKey] = rate;
                  });
                  personTypeRates[personType] = occupancyRates;
                }
              });
              processedMealPlanRates[mealPlan] = personTypeRates;
            });
            this.processPerPaxRates(roomTypeFormGroup, processedMealPlanRates);
          }
        } catch (error) {
          console.error(`Error processing rates for room ${roomRate.roomTypeId}:`, error);
        }
      });
    });
  }

  private isValidPersonType(type: string): type is PersonType {
    return ['adult', 'teen', 'child'].includes(type);
  }

  private processPerVillaRates(formGroup: FormGroup, mealPlanRates: { [mealPlanId: string]: { [personType: string]: number } }) {
    const perVillaRatesGroup = formGroup.get('perVillaRates');
    if (!perVillaRatesGroup) {
      console.error('Per villa rates group not found');
      return;
    }

    Object.entries(mealPlanRates).forEach(([mealPlanId, rates]) => {
      const mealPlanControl = perVillaRatesGroup.get(mealPlanId);
      if (mealPlanControl) {
        mealPlanControl.setValue(rates);
      }
    });
  }

  private processPerPaxRates(formGroup: FormGroup, mealPlanRates: ProcessedMealPlanRates) {
    const perPaxRates = formGroup.get('perPaxRates');
    if (!perPaxRates) {
      console.error('perPaxRates form group not found');
      return;
    }

    Object.entries(mealPlanRates).forEach(([mealPlan, rates]) => {
      const mealPlanGroup = perPaxRates.get(mealPlan);
      if (!mealPlanGroup) {
        console.warn(`Meal plan group not found for ${mealPlan}`);
        return;
      }

      this.processPersonTypeRates(mealPlanGroup, rates);
    });
  }

  private processPersonTypeRates(mealPlanGroup: AbstractControl, rates: MealPlanPersonRates): void {
    const personTypes: PersonType[] = ['adult', 'teen', 'child'];

    personTypes.forEach(personType => {
      const rateGroup = mealPlanGroup.get(`${personType}Rates`);
      if (!rateGroup) {
        console.warn(`Rate group not found for ${personType}`);
        return;
      }

      const personRates = rates[personType];
      if (!personRates) {
        console.debug(`No rates found for ${personType}, skipping`);
        return;
      }

      this.setOccupancyRates(rateGroup, personRates);
    });
  }

  private setOccupancyRates(rateGroup: AbstractControl, rates: PersonTypeRates): void {
    if (!(rateGroup instanceof FormGroup)) {
      console.error('Invalid rate group type');
      return;
    }

    Object.entries(rates).forEach(([occupancyKey, rate]) => {
      const control = rateGroup.get(occupancyKey);
      if (control) {
        control.setValue(rate, { emitEvent: false });
      } else {
        console.warn(`Occupancy control not found for key ${occupancyKey}`);
      }
    });
  }

  fetchAvailableMealPlans(): MealPlan[] {
    // Filter active meal plans from the input mealPlans array
    return this.mealPlans.filter(mealPlan => 
      mealPlan && 
      mealPlan.isActive && 
      ['BB', 'HB', 'FB', 'AI'].includes(mealPlan.type)
    );
  }

  getAdultRatesControls(roomTypeIndex: number, periodIndex: number): { [key: string]: AbstractControl } {
    const perPaxRates = this.getPeriodControl(roomTypeIndex, periodIndex).get('perPaxRates');
    const adultRates = perPaxRates?.get('adultRates');
    return (adultRates instanceof FormGroup ? adultRates.controls : {}) as { [key: string]: AbstractControl };
  }

  getRoomTypesFormArray(): FormArray {
    return this.ratesForm.get('periods') as FormArray;
  }

  getPeriodsFormArray(roomTypeIndex: number): FormArray {
    const periodsArray = this.getRoomTypesFormArray();
    const periodGroup = periodsArray.at(roomTypeIndex) as FormGroup;
    return (periodGroup.get('roomTypes') as FormArray) ?? this.fb.array([]);
  }

  getRateTypeControl(roomTypeIndex: number, periodIndex: number): FormControl | null {
    const periodControl = this.getPeriodControl(roomTypeIndex, periodIndex);
    return periodControl.get('rateType') as FormControl;
  }

  getPeriodControl(roomTypeIndex: number, periodIndex: number): FormGroup {
    const periodsArray = this.getRoomTypesFormArray();
    const periodGroup = periodsArray.at(periodIndex);
    return (periodGroup as FormGroup) ?? this.fb.group({
      periodId: [null],
      roomTypes: this.fb.array([]),
      rateType: ['per_pax'],
      perPaxRates: this.fb.group({}),
      perVillaRates: this.fb.group({})
    });
  }

  private initializeRatesForm() {
    const periodsArray = this.fb.array([]) as FormArray;

    this.periods.forEach(period => {
      const periodGroup = this.fb.group({
        periodId: [period.id],
        roomTypes: this.fb.array([])
      });

      const roomTypesArray = periodGroup.get('roomTypes') as FormArray;
      
      this.roomTypes.forEach(roomType => {
        const roomTypeGroup = this.createRoomTypeFormGroup(
          roomType.id,
          this.getRoomTypeCapacity(roomType, 'adults'),
          this.getRoomTypeCapacity(roomType, 'teens'),
          this.getRoomTypeCapacity(roomType, 'children')
        );
        roomTypesArray.push(roomTypeGroup);
      });

      (periodsArray as FormArray<any>).push(periodGroup);
    });

    this.ratesForm = this.fb.group({
      periods: periodsArray
    });
  }

  private createRoomTypeFormGroup(roomTypeId: number, maxAdults: number, maxTeens: number, maxChildren: number): FormGroup {
    return this.fb.group({
      roomTypeId: [roomTypeId],
      rateType: ['per_pax'],
      mealPlans: this.fb.group({
        BB: [true],  // Default meal plan
        HB: [false],
        FB: [false],
        AI: [false]
      }),
      perPaxRates: this.fb.group({
        BB: this.fb.group({
          adultRates: this.createOccupancyRatesGroup(maxAdults),
          teenRates: this.createOccupancyRatesGroup(maxTeens),
          childRates: this.createOccupancyRatesGroup(maxChildren)
        }),
        HB: this.fb.group({
          adultRates: this.createOccupancyRatesGroup(maxAdults),
          teenRates: this.createOccupancyRatesGroup(maxTeens),
          childRates: this.createOccupancyRatesGroup(maxChildren)
        }),
        FB: this.fb.group({
          adultRates: this.createOccupancyRatesGroup(maxAdults),
          teenRates: this.createOccupancyRatesGroup(maxTeens),
          childRates: this.createOccupancyRatesGroup(maxChildren)
        }),
        AI: this.fb.group({
          adultRates: this.createOccupancyRatesGroup(maxAdults),
          teenRates: this.createOccupancyRatesGroup(maxTeens),
          childRates: this.createOccupancyRatesGroup(maxChildren)
        })
      }),
      perVillaRates: this.fb.group({
        BB: [0],
        HB: [0],
        FB: [0],
        AI: [0]
      })
    });
  }

  private createOccupancyRatesGroup(maxOccupancy: number): FormGroup {
    const ratesGroup: { [key: string]: any[] } = {};
    for (let i = 1; i <= maxOccupancy; i++) {
      ratesGroup[`occupancy${i}`] = [0];
    }
    return this.fb.group(ratesGroup);
  }

  getOccupancyRange(maxOccupancy: number): number[] {
    return maxOccupancy > 0 ? Array.from({ length: maxOccupancy }, (_, i) => i + 1) : [];
  }

  getRoomTypeCapacity(roomType: RoomType, type: 'adults' | 'teens' | 'children'): number {
    if (!roomType.maxOccupancy) {
      return 0;
    }
    
    switch (type) {
      case 'adults':
        return roomType.maxOccupancy.adults;
      case 'children':
        return roomType.maxOccupancy.children;
      case 'teens':
        // Since teens are not explicitly defined in maxOccupancy, we'll count them as children
        return roomType.maxOccupancy.children;
      default:
        return 0;
    }
  }

  // Helper methods to access form arrays and groups
  get periodsFormArray(): FormArray {
    return this.ratesForm.get('periods') as FormArray;
  }

  private getRoomTypeFormGroup(periodIndex: number, roomTypeId: number): FormGroup | null {
    const periodsArray = this.ratesForm.get('periods') as FormArray;
    const periodGroup = periodsArray.at(periodIndex) as FormGroup;
    if (!periodGroup) return null;

    const roomTypesArray = periodGroup.get('roomTypes') as FormArray;
    if (!roomTypesArray) return null;

    // Find the room type group by roomTypeId
    const roomTypeGroup = roomTypesArray.controls.find(control => 
      control.get('roomTypeId')?.value === roomTypeId
    ) as FormGroup;

    return roomTypeGroup || null;
  }

  getPerPaxRatesFormGroup(roomTypeIndex: number, periodIndex: number): FormGroup {
    const periodControl = this.getPeriodControl(roomTypeIndex, periodIndex);
    const perPaxRates = periodControl.get('perPaxRates');
    return (perPaxRates as FormGroup) ?? this.fb.group({
      BB: this.fb.group({
        adultRates: this.createOccupancyRatesGroup(0),
        teenRates: this.createOccupancyRatesGroup(0),
        childRates: this.createOccupancyRatesGroup(0)
      }),
      HB: this.fb.group({
        adultRates: this.createOccupancyRatesGroup(0),
        teenRates: this.createOccupancyRatesGroup(0),
        childRates: this.createOccupancyRatesGroup(0)
      }),
      FB: this.fb.group({
        adultRates: this.createOccupancyRatesGroup(0),
        teenRates: this.createOccupancyRatesGroup(0),
        childRates: this.createOccupancyRatesGroup(0)
      }),
      AI: this.fb.group({
        adultRates: this.createOccupancyRatesGroup(0),
        teenRates: this.createOccupancyRatesGroup(0),
        childRates: this.createOccupancyRatesGroup(0)
      })
    });
  }

  getPerPaxRates(roomTypeIndex: number, periodIndex: number): FormGroup {
    const periodControl = this.getPeriodControl(roomTypeIndex, periodIndex);
    const perPaxRates = periodControl.get('perPaxRates');
    return (perPaxRates instanceof FormGroup ? perPaxRates : this.fb.group({})) as FormGroup;
  }

  getAdultRates(roomTypeIndex: number, periodIndex: number): FormGroup {
    const perPaxRates = this.getPerPaxRates(roomTypeIndex, periodIndex);
    const adultRates = perPaxRates.get('adultRates');
    return (adultRates instanceof FormGroup ? adultRates : this.fb.group({})) as FormGroup;
  }

  getTeenRates(roomTypeIndex: number, periodIndex: number): FormGroup {
    const perPaxRates = this.getPerPaxRates(roomTypeIndex, periodIndex);
    const teenRates = perPaxRates.get('teenRates');
    return (teenRates instanceof FormGroup ? teenRates : this.fb.group({})) as FormGroup;
  }

  getChildRates(roomTypeIndex: number, periodIndex: number): FormGroup {
    const perPaxRates = this.getPerPaxRates(roomTypeIndex, periodIndex);
    const childRates = perPaxRates.get('childRates');
    return (childRates instanceof FormGroup ? childRates : this.fb.group({})) as FormGroup;
  }

  private transformFormToRates(): ContractPeriodRate[] {
    const periodsArray = this.getRoomTypesFormArray();
    if (!(periodsArray instanceof FormArray)) {
      return [];
    }
    return periodsArray.controls.map((periodControl) => {
      const periodValue = periodControl.value;
      return {
        periodId: periodValue.periodId,
        roomRates: (periodValue.roomTypes || []).map((roomType: any) => ({
          roomTypeId: roomType.roomTypeId,
          rateType: roomType.rateType,
          mealPlanRates: this.transformMealPlanRates(roomType)
        }))
      };
    });
  }

  private transformMealPlanRates(roomType: any): { [key: string]: any } {
    const mealPlanRates: { [key: string]: any } = {};
    const selectedMealPlans = Object.entries(roomType.mealPlans || {})
      .filter(([_, enabled]) => enabled)
      .map(([plan]) => plan);

    selectedMealPlans.forEach(mealPlan => {
      if (roomType.rateType === 'per_villa') {
        mealPlanRates[mealPlan] = {
          base: { rates: { 1: roomType.perVillaRates?.[mealPlan] || 0 } }
        };
      } else {
        mealPlanRates[mealPlan] = {
          adult: {
            rates: this.transformOccupancyRates(roomType.perPaxRates?.[mealPlan]?.adultRates)
          },
          teen: {
            rates: this.transformOccupancyRates(roomType.perPaxRates?.[mealPlan]?.teenRates)
          },
          child: {
            rates: this.transformOccupancyRates(roomType.perPaxRates?.[mealPlan]?.childRates)
          }
        };
      }
    });

    return mealPlanRates;
  }

  private transformOccupancyRates(rates: any): { [key: number]: number } {
    const transformed: { [key: number]: number } = {};
    if (!rates) return transformed;
    
    Object.entries(rates).forEach(([key, value]) => {
      const occupancyNumber = parseInt(key.replace('occupancy', ''));
      if (!isNaN(occupancyNumber) && typeof value === 'number' && value > 0) {
        transformed[occupancyNumber] = value;
      }
    });
    return transformed;
  }

  getMealPlanName(mealPlan: string): string {
    const mealPlanNames: { [key: string]: string } = {
      BB: 'Bed & Breakfast',
      HB: 'Half Board',
      FB: 'Full Board',
      AI: 'All Inclusive'
    };
    return `${mealPlanNames[mealPlan] || mealPlan} (${mealPlan})`;
  }

  getOccupancyLabel(key: string): string {
    const match = key.match(/occupancy(\d+)/);
    return match ? `${match[1]} Person Rate` : key;
  }

  onSubmit() {
    if (this.ratesForm.valid && this.contract.id) {
      const rates = this.transformFormToRates();
      this.contractService.updateContractRates(this.contract.id, rates).subscribe({
        next: () => {
          console.log('Rates updated successfully');
          // TODO: Add success notification
        },
        error: (error) => {
          console.error('Error updating rates:', error);
          // TODO: Add error notification
        }
      });
    }
  }

  private createPeriodFormGroup(periodId: number): FormGroup {
    const periodGroup = this.fb.group({
      periodId: [periodId],
      roomTypes: this.fb.array([])
    });

    return periodGroup;
  }

  getRoomTypeName(roomTypeId: number): string {
    const roomType = this.roomTypes.find(rt => rt.id === roomTypeId);
    return roomType ? roomType.name : '';
  }

  getPeriodName(periodId: number): string {
    const period = this.periods.find(p => p.id === periodId);
    return period ? period.name : '';
  }

  getTeenRatesControls(roomTypeIndex: number, periodIndex: number): { [key: string]: AbstractControl } {
    const perPaxRates = this.getPeriodControl(roomTypeIndex, periodIndex).get('perPaxRates');
    const teenRates = perPaxRates?.get('teenRates');
    return (teenRates instanceof FormGroup ? teenRates.controls : {}) as { [key: string]: AbstractControl };
  }

  getChildRatesControls(roomTypeIndex: number, periodIndex: number): { [key: string]: AbstractControl } {
    const perPaxRates = this.getPeriodControl(roomTypeIndex, periodIndex).get('perPaxRates');
    const childRates = perPaxRates?.get('childRates');
    return (childRates instanceof FormGroup ? childRates.controls : {}) as { [key: string]: AbstractControl };
  }

  getPerVillaRatesControl(roomTypeIndex: number, periodIndex: number): FormGroup {
    const periodsArray = this.ratesForm.get('periods') as FormArray;
    const periodGroup = periodsArray.at(periodIndex) as FormGroup;
    const roomTypesArray = periodGroup.get('roomTypes') as FormArray;
    const roomTypeGroup = roomTypesArray.at(roomTypeIndex) as FormGroup;
    return roomTypeGroup.get('perVillaRates') as FormGroup;
  }
}
