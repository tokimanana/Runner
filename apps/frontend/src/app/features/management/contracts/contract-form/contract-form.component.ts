import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ContractDto, ContractPeriodDto, Season } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { CurrenciesService } from '../../currencies/currencies.service';
import { HotelsService } from '../../hotels/hotels.service';
import { MarketsService } from '../../markets/markets.service';
import { MealPlansService } from '../../meal-plans/meal-plans.service';
import { SeasonsService } from '../../seasons/seasons.service';
import { ContractsService } from '../contracts.service';

export interface LocalContractPeriod
  extends Omit<ContractPeriodDto, 'startDate' | 'endDate'> {
  tempId: string;
  startDate: Date | null;
  endDate: Date | null;
}
@Component({
  selector: 'app-contract-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
    Button,
    Select,
    InputText,
    InputNumber,
    DatePicker,
    StepperModule,
    TableModule,
    DatePipe,
    DatePickerModule,
  ],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractFormComponent {
  private readonly hotelsService = inject(HotelsService);
  private readonly marketsService = inject(MarketsService);
  private readonly currenciesService = inject(CurrenciesService);
  private readonly seasonsService = inject(SeasonsService);
  private readonly mealPlansService = inject(MealPlansService);
  private readonly contractsService = inject(ContractsService);
  private readonly router = inject(Router);

  readonly activeStep = signal<number>(1);

  // Step 1
  readonly step1Form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    hotelId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    marketId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    currencyId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
  readonly step1Data = signal<ContractDto | null>(null);

  readonly hotels = toSignal(this.hotelsService.getHotels(), {
    initialValue: [],
  });
  readonly markets = toSignal(this.marketsService.getAll(), {
    initialValue: [],
  });
  readonly currencies = toSignal(this.currenciesService.getAll(), {
    initialValue: [],
  });

  // Step 2
  readonly localPeriods = signal<LocalContractPeriod[]>([]);
  readonly draftPeriods = signal<LocalContractPeriod[]>([]);
  readonly selectedSeasonId = signal<string | null>(null);
  readonly periodStepError = signal<boolean>(false);

  readonly seasons = toSignal(this.seasonsService.getSeasons(), {
    initialValue: [],
  });
  readonly mealPlans = toSignal(this.mealPlansService.getAll(), {
    initialValue: [],
  });
  readonly allSeasonPeriods = computed(() =>
    this.seasons().flatMap((season: Season) => season.seasonPeriods ?? [])
  );

  goNext(activateCallback: (step: number) => void): void {
    switch (this.activeStep()) {
      case 1:
        this.goNextFromStep1(activateCallback);
        break;
      case 2:
        this.goNextFromStep2(activateCallback);
        break;
      default:
        console.warn(
          `goNext() called with unhandled activeStep: ${this.activeStep()}`
        );
    }
  }

  private goNextFromStep1(activateCallback: (step: number) => void): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    this.step1Data.set(this.step1Form.getRawValue());
    activateCallback(this.activeStep() + 1);
  }

  private goNextFromStep2(activateCallback: (step: number) => void): void {
    if (this.localPeriods().length === 0) {
      this.periodStepError.set(true);
      return;
    }
    this.periodStepError.set(false);
    activateCallback(this.activeStep() + 1);
  }

  goBack(activateCallback: (step: number) => void): void {
    activateCallback(this.activeStep() - 1);
  }

  onSeasonSelected(seasonId: string | null): void {
    this.selectedSeasonId.set(seasonId);

    if (!seasonId) {
      this.draftPeriods.set([]);
      return;
    }

    const periodsForSeason = this.allSeasonPeriods().filter(
      (sp) => sp.seasonId === seasonId
    );

    this.draftPeriods.set(
      periodsForSeason.map((sp) => ({
        tempId: crypto.randomUUID(),
        seasonPeriodId: sp.id,
        name: sp.name,
        startDate: new Date(sp.startDate),
        endDate: new Date(sp.endDate),
        baseMealPlanId: '',
        minStay: undefined,
      }))
    );
  }

  addManualDraftPeriod(): void {
    this.draftPeriods.update((drafts) => [
      ...drafts,
      {
        tempId: crypto.randomUUID(),
        seasonPeriodId: null,
        name: '',
        startDate: null,
        endDate: null,
        baseMealPlanId: '',
        minStay: undefined,
      },
    ]);
  }

  updateDraftField<K extends keyof LocalContractPeriod>(
    tempId: string,
    field: K,
    value: LocalContractPeriod[K]
  ): void {
    this.draftPeriods.update((drafts) =>
      drafts.map((d) => (d.tempId === tempId ? { ...d, [field]: value } : d))
    );
  }

  confirmDraftPeriod(tempId: string): void {
    const draft = this.draftPeriods().find((d) => d.tempId === tempId);
    if (
      !draft ||
      !draft.name ||
      !draft.startDate ||
      !draft.endDate ||
      !draft.baseMealPlanId
    ) {
      return; // garde-fou minimal ; validation stricte à durcir en ticket de suivi
    }
    this.localPeriods.update((periods) => [...periods, draft]);
    this.draftPeriods.update((drafts) =>
      drafts.filter((d) => d.tempId !== tempId)
    );
  }

  cancelDraftPeriod(tempId: string): void {
    this.draftPeriods.update((drafts) =>
      drafts.filter((d) => d.tempId !== tempId)
    );
  }

  removeConfirmedPeriod(tempId: string): void {
    this.localPeriods.update((periods) =>
      periods.filter((p) => p.tempId !== tempId)
    );
  }
}
