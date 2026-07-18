import { confirmAction } from '@/app/shared/utils/confirm-action.util';
import {
  isValidDateRange,
  rangesOverlap,
} from '@/app/shared/utils/date-range.util';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractDto, RoomType, Season } from '@runner/shared/types';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { filter, pairwise, startWith, switchMap } from 'rxjs';
import { CurrenciesService } from '../../currencies/currencies.service';
import { HotelsService } from '../../hotels/hotels.service';
import { MarketsService } from '../../markets/markets.service';
import { MealPlansService } from '../../meal-plans/meal-plans.service';
import { SeasonsService } from '../../seasons/seasons.service';
import { ContractsService } from '../contracts.service';
import { LocalContractPeriod, LocalRoomPrice } from './contract-form.types';

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
    MultiSelect,
    AccordionModule,
    ConfirmDialog,
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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
  readonly draftConfirmError = signal<string | null>(null);

  readonly sortedLocalPeriods = computed(() =>
    [...this.localPeriods()].sort(
      (a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0)
    )
  );

  readonly seasons = toSignal(this.seasonsService.getSeasons(), {
    initialValue: [],
  });
  readonly mealPlans = toSignal(this.mealPlansService.getAll(), {
    initialValue: [],
  });

  readonly allSeasonPeriods = computed(() =>
    this.seasons().flatMap((season: Season) => season.seasonPeriods ?? [])
  );

  // Step 3
  readonly selectedRoomTypeIds = signal<string[]>([]);
  readonly localRoomPrices = signal<LocalRoomPrice[]>([]);
  readonly roomPriceStepError = signal<boolean>(false);

  readonly roomTypes = toSignal(
    this.step1Form.controls.hotelId.valueChanges.pipe(
      startWith(this.step1Form.controls.hotelId.value),
      filter((hotelId): hotelId is string => !!hotelId),
      switchMap((hotelId) => this.hotelsService.getRoomTypes(hotelId))
    ),
    { initialValue: [] as RoomType[] }
  );

  private readonly roomTypesById = computed(() => {
    const map = new Map<string, RoomType>();
    for (const rt of this.roomTypes()) {
      map.set(rt.id, rt);
    }
    return map;
  });

  readonly periodRoomPriceGroups = computed(() => {
    const roomTypesById = this.roomTypesById();

    return this.localPeriods().map((period) => ({
      period,
      roomPrices: this.localRoomPrices()
        .filter((rp) => rp.periodTempId === period.tempId)
        .map((rp) => ({
          ...rp,
          roomTypeName: roomTypesById.get(rp.roomTypeId)?.name ?? '',
        })),
    }));
  });

  constructor() {
    this.step1Form.controls.hotelId.valueChanges
      .pipe(pairwise(), takeUntilDestroyed())
      .subscribe(([previousHotelId, newHotelId]) => {
        if (!newHotelId || previousHotelId === newHotelId) {
          return;
        }

        const hasDataAtRisk =
          this.selectedRoomTypeIds().length > 0 ||
          this.localRoomPrices().length > 0;

        if (!hasDataAtRisk) {
          return;
        }

        confirmAction({
          header: 'Hotel changed',
          message:
            'Changing the hotel will clear all selected room types and their prices. Continue?',
          confirmationService: this.confirmationService,
          onAccept: () => {
            this.selectedRoomTypeIds.set([]);
            this.localRoomPrices.set([]);
          },
          onReject: () => {
            this.step1Form.controls.hotelId.setValue(previousHotelId, {
              emitEvent: false,
            });
          },
        });
      });
  }

  private pruneStaleRoomTypeSelections(validIds: Set<string>): void {
    const currentSelected = this.selectedRoomTypeIds();
    const removedIds = currentSelected.filter((id) => !validIds.has(id));

    if (removedIds.length === 0) {
      return;
    }

    const stillValid = currentSelected.filter((id) => validIds.has(id));
    const willLoseData = this.localRoomPrices().some((rp) =>
      removedIds.includes(rp.roomTypeId)
    );

    if (willLoseData) {
      confirmAction({
        header: 'Hotel changed',
        message:
          'Some selected room types are not available for the new hotel. Their prices will be removed. Continue?',
        confirmationService: this.confirmationService,
        onAccept: () => {
          this.selectedRoomTypeIds.set(stillValid);
          this.syncRoomPriceMatrix();
        },
      });
      return;
    }

    this.selectedRoomTypeIds.set(stillValid);
    this.syncRoomPriceMatrix();
  }

  goNext(activateCallback: (step: number) => void): void {
    switch (this.activeStep()) {
      case 1:
        this.goNextFromStep1(activateCallback);
        break;
      case 2:
        this.goNextFromStep2(activateCallback);
        break;
      case 3:
        this.goNextFromStep3(activateCallback);
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
    this.syncRoomPriceMatrix();
    activateCallback(this.activeStep() + 1);
  }

  private goNextFromStep3(activateCallback: (step: number) => void): void {
    const uncoveredPeriods = this.periodRoomPriceGroups().filter(
      (group) => group.roomPrices.length === 0
    );

    if (
      uncoveredPeriods.length > 0 ||
      this.selectedRoomTypeIds().length === 0
    ) {
      this.roomPriceStepError.set(true);
      return;
    }
    this.roomPriceStepError.set(false);
    activateCallback(this.activeStep() + 1);
  }

  goBack(activateCallback: (step: number) => void): void {
    activateCallback(this.activeStep() - 1);
  }

  cancelWizard(): void {
    confirmAction({
      header: 'Cancel contract creation',
      message:
        'Any unsaved progress will be lost. Are you sure you want to leave?',
      confirmationService: this.confirmationService,
      onAccept: () => {
        this.router.navigate(['../contracts-list'], { relativeTo: this.route });
      },
    });
  }

  private isDuplicatePeriod(draft: LocalContractPeriod): boolean {
    return this.localPeriods().some(
      (p) =>
        p.name.trim().toLowerCase() === draft.name.trim().toLowerCase() &&
        p.startDate?.getTime() === draft.startDate?.getTime() &&
        p.endDate?.getTime() === draft.endDate?.getTime()
    );
  }

  private overlapsExistingPeriod(draft: LocalContractPeriod): boolean {
    if (!draft.startDate || !draft.endDate) return false;

    return this.localPeriods().some((p) => {
      if (!p.startDate || !p.endDate) return false;
      return rangesOverlap(
        draft.startDate!,
        draft.endDate!,
        p.startDate,
        p.endDate
      );
    });
  }

  onSeasonSelected(seasonId: string | null): void {
    this.selectedSeasonId.set(seasonId);

    if (!seasonId) {
      this.draftPeriods.set([]);
      return;
    }

    const alreadyConfirmedSeasonPeriodIds = new Set(
      this.localPeriods()
        .map((p) => p.seasonPeriodId)
        .filter((id): id is string => !!id)
    );

    const periodsForSeason = this.allSeasonPeriods().filter(
      (sp) =>
        sp.seasonId === seasonId && !alreadyConfirmedSeasonPeriodIds.has(sp.id)
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
      this.draftConfirmError.set('All fields are required.');
      return;
    }

    if (!isValidDateRange(draft.startDate, draft.endDate)) {
      this.draftConfirmError.set('End date must be after start date.');
      return;
    }

    if (this.isDuplicatePeriod(draft)) {
      this.draftConfirmError.set('This period already exists.');
      return;
    }

    if (this.overlapsExistingPeriod(draft)) {
      this.draftConfirmError.set('This period overlaps with an existing one.');
      return;
    }

    this.draftConfirmError.set(null);
    this.localPeriods.update((periods) => [...periods, draft]);
    this.draftPeriods.update((drafts) =>
      drafts.filter((d) => d.tempId !== tempId)
    );
    this.periodStepError.set(false);
  }

  cancelDraftPeriod(tempId: string): void {
    this.draftPeriods.update((drafts) =>
      drafts.filter((d) => d.tempId !== tempId)
    );
    this.draftConfirmError.set(null);
  }

  removeConfirmedPeriod(tempId: string): void {
    this.localPeriods.update((periods) =>
      periods.filter((p) => p.tempId !== tempId)
    );
  }

  trackByTempId(_index: number, item: { tempId: string }): string {
    return item.tempId;
  }

  onRoomTypesSelected(roomTypeIds: string[]): void {
    const previousIds = this.selectedRoomTypeIds();
    const removedIds = previousIds.filter((id) => !roomTypeIds.includes(id));

    const willLoseData =
      removedIds.length > 0 &&
      this.localRoomPrices().some((rp) => removedIds.includes(rp.roomTypeId));

    if (willLoseData) {
      confirmAction({
        header: 'Remove room type',
        message:
          'Removing this room type will delete any prices already entered for it. Continue?',
        confirmationService: this.confirmationService,
        onAccept: () => {
          this.selectedRoomTypeIds.set(roomTypeIds);
          this.syncRoomPriceMatrix();
        },
        onReject: () => this.forceResyncRoomTypeSelection(),
      });
      return;
    }

    this.selectedRoomTypeIds.set(roomTypeIds);
    this.syncRoomPriceMatrix();
  }

  private forceResyncRoomTypeSelection(): void {
    // Le widget a déjà décoché visuellement de façon optimiste. Comme le
    // signal garde la même valeur logique, Angular ne repousserait rien
    // au multiSelect sans nouvelle référence — on la force explicitement
    // pour écraser l'état interne du widget avec la vraie sélection.
    this.selectedRoomTypeIds.update((ids) => [...ids]);
  }

  private syncRoomPriceMatrix(): void {
    const periods = this.localPeriods();
    const roomTypeIds = this.selectedRoomTypeIds();

    this.localRoomPrices.update((existing) => {
      const kept = existing.filter(
        (rp) =>
          periods.some((p) => p.tempId === rp.periodTempId) &&
          roomTypeIds.includes(rp.roomTypeId)
      );

      const missing: LocalRoomPrice[] = [];
      for (const period of periods) {
        for (const roomTypeId of roomTypeIds) {
          const exists = kept.some(
            (rp) =>
              rp.periodTempId === period.tempId && rp.roomTypeId === roomTypeId
          );
          if (!exists) {
            missing.push({
              tempId: crypto.randomUUID(),
              periodTempId: period.tempId,
              roomTypeId,
              pricingMode: 'PER_ROOM',
              pricePerNight: null,
              occupancyRates: [],
            });
          }
        }
      }

      return [...kept, ...missing];
    });
  }

  updateRoomPriceField<K extends keyof LocalRoomPrice>(
    tempId: string,
    field: K,
    value: LocalRoomPrice[K]
  ): void {
    this.localRoomPrices.update((prices) =>
      prices.map((rp) =>
        rp.tempId === tempId ? { ...rp, [field]: value } : rp
      )
    );
  }
}
